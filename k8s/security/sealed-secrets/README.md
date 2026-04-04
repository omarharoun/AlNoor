# Sealed Secrets Workflow (Alternative)

Use this if your cluster standard is Bitnami Sealed Secrets.

## Setup

1. Install Sealed Secrets controller.
2. Install `kubeseal` CLI.

## Generate sealed secret from live secret manifest

```bash
kubectl -n alnoor create secret generic fluxer-env --dry-run=client -o yaml \
  --from-literal=FLUXER_CONFIG__SERVICES__NATS__AUTH_TOKEN="replace-me" \
  | kubeseal --format yaml > k8s/security/sealed-secrets/sealedsecret-fluxer-env.example.yaml
```

## Apply

```bash
kubectl apply -f k8s/security/sealed-secrets/sealedsecret-fluxer-env.example.yaml
kubectl apply -f k8s/security/sealed-secrets/sealedsecret-cassandra-auth.example.yaml
```

## Notes

- Use either SOPS or Sealed Secrets as the primary method, not both.
- Regenerate sealed manifests if controller cert rotates.
