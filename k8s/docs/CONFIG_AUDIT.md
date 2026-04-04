# Config Audit for Kubernetes Scaling

This audit is based on:

- `fluxer_server` runtime and probes
- `config/config.production.template.json`
- `packages/config/src/ConfigLoader.tsx` env override behavior
- `fluxer_docs/self-hosting/configuration.mdx`

## Current scaling posture

- `fluxer_server` is deployable as a stateless pod process with HTTP probes.
- Runtime dependencies are stateful (Valkey, NATS JetStream, Cassandra optional, S3 external).
- Current monolith mode can be scaled, but embedded workers and scheduler in each replica can produce duplicate processing if queue-level dedupe is not strict for every task.

## Exact config changes for k8s monolith (minimum)

Start from `config/config.production.template.json` and apply:

```json
{
  "instance": {
    "deployment_mode": "monolith",
    "self_hosted": true
  },
  "database": {
    "backend": "sqlite",
    "sqlite_path": "/usr/src/app/data/db/fluxer.db"
  },
  "internal": {
    "kv": "redis://valkey:6379/0",
    "kv_mode": "standalone"
  },
  "services": {
    "server": {
      "host": "0.0.0.0",
      "port": 8080,
      "static_dir": "/usr/src/app/assets"
    },
    "nats": {
      "core_url": "nats://nats:4222",
      "jetstream_url": "nats://nats:4222"
    }
  }
}
```

Notes:

- Use Kubernetes DNS names (`valkey`, `nats`) inside the same namespace.
- Keep secrets out of file where possible and inject with env overrides.

## Exact config changes for k8s microservices-ready mode

Use this shape when moving to scaled production topology:

```json
{
  "instance": {
    "deployment_mode": "microservices",
    "self_hosted": true
  },
  "database": {
    "backend": "cassandra",
    "cassandra": {
      "hosts": [
        "cassandra-0.cassandra.database.svc.cluster.local",
        "cassandra-1.cassandra.database.svc.cluster.local",
        "cassandra-2.cassandra.database.svc.cluster.local"
      ],
      "keyspace": "fluxer",
      "local_dc": "dc1",
      "username": "replace-me",
      "password": "replace-me"
    }
  },
  "internal": {
    "kv": "redis://valkey:6379/0",
    "kv_mode": "standalone",
    "media_proxy": "http://fluxer-server.alnoor.svc.cluster.local/media",
    "queue": "http://fluxer-server.alnoor.svc.cluster.local/queue"
  },
  "services": {
    "server": {
      "host": "0.0.0.0",
      "port": 8080,
      "static_dir": "/usr/src/app/assets"
    },
    "app_proxy": {
      "assets_dir": "/usr/src/app/assets"
    },
    "nats": {
      "core_url": "nats://nats:4222",
      "jetstream_url": "nats://nats:4222"
    },
    "gateway": {
      "media_proxy_endpoint": "https://chat.example.com/media"
    }
  }
}
```

## Environment variable override mapping (for secrets)

`ConfigLoader` supports env overrides via prefix `FLUXER_CONFIG__`.

Examples:

- `FLUXER_CONFIG__SERVICES__NATS__AUTH_TOKEN`
- `FLUXER_CONFIG__S3__ACCESS_KEY_ID`
- `FLUXER_CONFIG__S3__SECRET_ACCESS_KEY`
- `FLUXER_CONFIG__AUTH__SUDO_MODE_SECRET`
- `FLUXER_CONFIG__AUTH__CONNECTION_INITIATION_SECRET`
- `FLUXER_CONFIG__SERVICES__ADMIN__SECRET_KEY_BASE`
- `FLUXER_CONFIG__SERVICES__ADMIN__OAUTH_CLIENT_SECRET`
- `FLUXER_CONFIG__SERVICES__MEDIA_PROXY__SECRET_KEY`
- `FLUXER_CONFIG__SERVICES__GATEWAY__ADMIN_RELOAD_SECRET`

## Probe mapping

Use these probe paths on HTTP port 8080:

- readiness: `/_ready`
- liveness: `/_live`
- startup (or deep health): `/_health`

## Rollout sequence recommendation

1. Deploy base monolith + Valkey + NATS on Kubernetes.
2. Validate stability with 1 replica.
3. Scale to 2 replicas and watch duplicate job effects.
4. Move database to Cassandra before high-scale production.
5. Enable microservices mode and split roles if required.
