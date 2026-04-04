# Production Go-Live Checklist

Status legend:

- `[x]` done in repo
- `[ ]` pending action

## Security and edge

- [x] TLS + HSTS + SSL redirect + websocket timeouts configured in `k8s/base/ingress-fluxer-server.yaml`
- [x] NetworkPolicies added and default deny ingress present (`k8s/security/network-policies`)
- [x] Prod deploy workflows gated by branch + environment approval (`.github/workflows/deploy-k8s-*.yaml`)
- [ ] WAF/CDN policy attached in front of ingress
- [x] Domain and TLS secret names updated to production placeholders (`chat.fluxer.app`, `chat-fluxer-app-tls`)

## Secrets and configuration

- [x] Non-sensitive config separated into ConfigMap (`k8s/base/configmap-fluxer-config.example.yaml`)
- [x] Sensitive keys mapped via `FLUXER_CONFIG__...` env overrides (`k8s/base/secret-env.example.yaml`)
- [x] External Secrets + SOPS + Sealed Secrets workflows documented (`k8s/security/*`)
- [x] External Secrets Operator selected as production standard (`k8s/security/external-secrets/README.md`)
- [ ] Rotate all production secrets and confirm no placeholder values remain in live cluster values/secrets

## Data and stateful services

- [x] Cassandra StatefulSet (3 replicas) and in-cluster migration job available (`k8s/base-cassandra`)
- [x] Cassandra backup test workflow exists (`.github/workflows/test-cassandra-backup.yaml`)
- [ ] Run live restore drill and record RTO/RPO outcomes (`k8s/docs/RESTORE_DRILL.md`)
- [ ] NATS/Valkey HA strategy finalized (managed service or clustered deployment)

## Workload resilience

- [x] HPA and PDB for app (`k8s/base/hpa-fluxer-server.yaml`, `k8s/base/pdb-fluxer-server.yaml`)
- [x] PDB for Valkey and NATS (`k8s/base/pdb-valkey.yaml`, `k8s/base/pdb-nats.yaml`)
- [x] Anti-affinity/topology spread for app and Cassandra
- [x] Security contexts for app/NATS/Valkey and service account token automount disabled
- [ ] Validate graceful shutdown and startup probe timings under production load

## Observability and operations

- [x] k8s manifest validation workflow in CI (`.github/workflows/validate-k8s-manifests.yaml`)
- [ ] Prometheus/Grafana dashboards for app latency, error rate, saturation (`k8s/docs/OBSERVABILITY_BASELINE.md`)
- [ ] Alerts for Cassandra health, migration failures, backup freshness, and HPA saturation (`k8s/docs/OBSERVABILITY_BASELINE.md`)
- [ ] Centralized logs and trace correlation enabled for incident response (`k8s/docs/OBSERVABILITY_BASELINE.md`)

## Release and rollback

- [x] k8s infra/app/migration workflows exist (`deploy-k8s-infra`, `deploy-k8s-app`, `migrate-cassandra-k8s`)
- [x] Canary rollout policy documented (`k8s/docs/CANARY_ROLLOUT.md`)
- [ ] Rollback drill completed (`k8s/docs/ROLLBACK_DRILL.md`) with smoke tests

## Rehearsal

- [x] Rehearsal runbook documented (`k8s/docs/PREPROD_REHEARSAL.md`)
- [ ] Full pre-prod rehearsal executed and signed off

## Final go-live commands (example)

```bash
# 1) Infra
kubectl apply -f k8s/base/namespace.yaml
kubectl apply -k k8s/base-cassandra
kubectl apply -k k8s/security/network-policies

# 2) Secrets (choose one strategy)
# SOPS example:
sops --decrypt k8s/security/sops/secret-cassandra-auth.enc.example.yaml | kubectl apply -f -
sops --decrypt k8s/security/sops/secret-fluxer-env.enc.example.yaml | kubectl apply -f -

# 3) App config + app workloads
kubectl apply -f k8s/base/configmap-fluxer-config.example.yaml
kubectl apply -k k8s/base

# 4) Migrations
kubectl apply -f k8s/base-cassandra/job-cassandra-migrate.example.yaml
kubectl -n alnoor wait --for=condition=complete --timeout=20m job/cassandra-migrations

# 5) Verify
kubectl -n alnoor get pods
kubectl -n alnoor get ingress
kubectl -n alnoor get hpa
```
