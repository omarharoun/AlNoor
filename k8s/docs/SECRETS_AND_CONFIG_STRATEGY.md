# Secrets and Config Strategy (Secure + Scalable)

This is the recommended model for AlNoor on Kubernetes.

## Target state

- Keep `config.json` non-sensitive only (domain, ports, feature flags, hostnames).
- Inject secrets with `FLUXER_CONFIG__...` environment overrides from Kubernetes Secret.
- Store source-of-truth secrets in an external secret manager (Vault, AWS Secrets Manager, GCP Secret Manager).
- Sync to Kubernetes with External Secrets Operator (ESO).

## Why this scales

- Secret rotation without editing/redeploying static config files.
- Environment-specific secret scopes (dev/stage/prod) via external stores.
- Cleaner GitOps: non-sensitive config in Git, secret values outside Git.

## Sensitive fields to keep out of config.json

- `database.cassandra.password`
- `services.nats.auth_token`
- `s3.access_key_id`
- `s3.secret_access_key`
- `auth.sudo_mode_secret`
- `auth.connection_initiation_secret`
- `auth.vapid.public_key`
- `auth.vapid.private_key`
- `services.admin.secret_key_base`
- `services.admin.oauth_client_secret`
- `services.media_proxy.secret_key`
- `services.gateway.admin_reload_secret`

## Mapping pattern

Example mapping from secret key to env var:

- `database-cassandra-password` -> `FLUXER_CONFIG__DATABASE__CASSANDRA__PASSWORD`
- `nats-auth-token` -> `FLUXER_CONFIG__SERVICES__NATS__AUTH_TOKEN`

## Runtime precedence

`packages/config/src/ConfigLoader.tsx` merges environment overrides (`FLUXER_CONFIG__`) over file config.

That means safe default config can stay in `config.json`, and secrets are injected at runtime.

## Rotation approach

1. Rotate value in external secret manager.
2. ESO updates Kubernetes Secret.
3. Restart deployment to pick up new env values (or use reloader).
4. Validate health endpoints.
