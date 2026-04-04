# Fluxer Helm Chart Starter

This is a starter chart for AlNoor/Fluxer on Kubernetes.

## Files

- `values.yaml`: default values
- `values-dev.yaml`: single replica/dev defaults
- `values-stage.yaml`: stage defaults with microservices-ready config
- `values-prod.yaml`: production defaults with microservices-ready config

## Deploy

```bash
helm upgrade --install alnoor ./k8s/helm/fluxer -n alnoor --create-namespace -f ./k8s/helm/fluxer/values-prod.yaml
```

## Important

- Replace all `replace-me` secrets.
- By default this chart mounts a config secret at `/usr/src/app/config/config.json` and sets `FLUXER_CONFIG` accordingly.
