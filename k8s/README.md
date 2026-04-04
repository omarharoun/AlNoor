# AlNoor Kubernetes Deployment

This folder contains a production-oriented Kubernetes starter for AlNoor (Fluxer).

## Layout

- `base/`: direct manifests for quick deployment with `kubectl`/`kustomize`
- `base-cassandra/`: Cassandra StatefulSet manifests for production database mode
- `helm/fluxer/`: Helm chart skeleton with env-specific values files
- `docs/`: config audit and exact `config.json` changes for k8s and microservices
- `security/external-secrets/`: example ExternalSecret for secret manager integration
- `security/network-policies/`: default deny and service isolation policies
- `security/sops/`: encrypted secret manifest workflow (recommended for GitOps)
- `security/sealed-secrets/`: SealedSecret workflow (alternative)

## Quick start (base manifests)

1. Create namespace and shared objects:

```bash
kubectl apply -k k8s/base
```

2. Create runtime config secret from your real config file:

```bash
kubectl apply -k k8s/base
```

2. Replace placeholders in `k8s/base/configmap-fluxer-config.example.yaml` and keep secret fields empty strings there.

3. Create sensitive env overrides (required for production):

```bash
kubectl -n alnoor create secret generic fluxer-env \
  --from-literal=FLUXER_CONFIG__DATABASE__CASSANDRA__PASSWORD="replace-me" \
  --from-literal=FLUXER_CONFIG__SERVICES__NATS__AUTH_TOKEN="replace-me" \
  --from-literal=FLUXER_CONFIG__S3__ACCESS_KEY_ID="replace-me" \
  --from-literal=FLUXER_CONFIG__S3__SECRET_ACCESS_KEY="replace-me" \
  --from-literal=FLUXER_CONFIG__AUTH__SUDO_MODE_SECRET="replace-me" \
  --from-literal=FLUXER_CONFIG__AUTH__CONNECTION_INITIATION_SECRET="replace-me" \
  --from-literal=FLUXER_CONFIG__SERVICES__ADMIN__SECRET_KEY_BASE="replace-me" \
  --from-literal=FLUXER_CONFIG__SERVICES__ADMIN__OAUTH_CLIENT_SECRET="replace-me" \
  --from-literal=FLUXER_CONFIG__SERVICES__MEDIA_PROXY__SECRET_KEY="replace-me" \
  --from-literal=FLUXER_CONFIG__SERVICES__GATEWAY__ADMIN_RELOAD_SECRET="replace-me" \
  --from-literal=FLUXER_CONFIG__AUTH__VAPID__PUBLIC_KEY="replace-me" \
  --from-literal=FLUXER_CONFIG__AUTH__VAPID__PRIVATE_KEY="replace-me"
```

4. Apply workloads:

```bash
kubectl apply -k k8s/base
```

5. Apply network policies:

```bash
kubectl apply -k k8s/security/network-policies
```

## Helm starter

```bash
helm upgrade --install alnoor ./k8s/helm/fluxer -n alnoor --create-namespace -f ./k8s/helm/fluxer/values-prod.yaml
```

## Important

- The current server process includes embedded background workers and gateway process in the same runtime. Horizontal scale can cause duplicate background execution unless you split roles or gate worker startup.
- See `k8s/docs/CONFIG_AUDIT.md` for exact config and rollout guidance.
- For Cassandra bootstrap and migration flow, see `k8s/docs/CASSANDRA_BOOTSTRAP.md`.
- For secure config/secrets model, see `k8s/docs/SECRETS_AND_CONFIG_STRATEGY.md`.

## Cassandra

Deploy Cassandra manifests:

```bash
kubectl apply -k k8s/base-cassandra
```

Run in-cluster migration job example:

```bash
kubectl apply -f k8s/base-cassandra/job-cassandra-migrate.example.yaml
kubectl -n alnoor logs -f job/cassandra-migrations
```

## Secrets Management (Production Standard)

Primary method is External Secrets Operator:

1. Configure `ClusterSecretStore`
2. Apply `k8s/security/external-secrets`
3. Keep runtime secrets out of Git and out of `config.json`

Reference: `k8s/security/external-secrets/README.md`

## GitHub Actions Environment Gates

Kubernetes deploy workflows use environment targets:

- `k8s-dev`
- `k8s-stage`
- `k8s-prod`

Configure them as described in `k8s/docs/GITHUB_ENVIRONMENTS.md` and set required reviewers on `k8s-prod` for manual prod approval.

## Go-Live Checklist

Use `k8s/docs/PROD_GO_LIVE_CHECKLIST.md` as the live production readiness checklist.

Supporting runbooks:

- `k8s/docs/PREPROD_REHEARSAL.md`
- `k8s/docs/ROLLBACK_DRILL.md`
- `k8s/docs/RESTORE_DRILL.md`
- `k8s/docs/CANARY_ROLLOUT.md`
- `k8s/docs/OBSERVABILITY_BASELINE.md`
