# External Secrets (Production Standard)

This folder is the selected production secret strategy.

It syncs secrets from external secret manager into Kubernetes Secret `fluxer-env`.

## Usage

1. Install External Secrets Operator (ESO) in your cluster.
2. Create `ClusterSecretStore` for your provider.
3. Update remote secret keys in `externalsecret-fluxer-env.example.yaml`.
4. Apply:

```bash
kubectl apply -k k8s/security/external-secrets
```

## Rotation

1. Rotate values in external secret manager.
2. Wait for ESO `refreshInterval` (or force reconcile).
3. Restart workloads to ensure fresh env is loaded.

```bash
kubectl -n alnoor rollout restart deployment/fluxer-server
```
