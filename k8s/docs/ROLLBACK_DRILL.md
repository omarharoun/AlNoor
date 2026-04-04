# Rollback Drill (Helm)

Run this in non-production first, then production maintenance window.

## 1) Observe current release

```bash
helm -n alnoor history alnoor
kubectl -n alnoor get deploy,po
```

## 2) Simulate bad rollout

Deploy with a temporary bad tag/value, then detect unhealthy pods.

## 3) Roll back

```bash
helm -n alnoor rollback alnoor <REVISION>
kubectl -n alnoor rollout status deployment/fluxer-server --timeout=10m
```

## 4) Smoke tests

```bash
kubectl -n alnoor get pods
kubectl -n alnoor get ingress
kubectl -n alnoor logs deploy/fluxer-server --tail=200
curl -fsS https://chat.fluxer.app/_health
curl -fsS https://chat.fluxer.app/_ready
```

## 5) Record outcome

- rollback duration
- user-visible impact duration
- post-rollback error rate
