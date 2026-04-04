# Pre-Prod Rehearsal Script

Run this end-to-end before production cutover.

## 1) Deploy infra + app

```bash
kubectl apply -f k8s/base/namespace.yaml
kubectl apply -k k8s/base-cassandra
kubectl apply -k k8s/security/network-policies
kubectl apply -f k8s/base/configmap-fluxer-config.example.yaml
kubectl apply -k k8s/base
```

## 2) Run migrations

```bash
kubectl apply -f k8s/base-cassandra/job-cassandra-migrate.example.yaml
kubectl -n alnoor wait --for=condition=complete --timeout=20m job/cassandra-migrations
kubectl -n alnoor logs job/cassandra-migrations --all-containers=true
```

## 3) Verify health + scaling

```bash
kubectl -n alnoor get pods
kubectl -n alnoor get hpa
curl -fsS https://chat.fluxer.app/_health
curl -fsS https://chat.fluxer.app/_ready
```

## 4) Run rollback drill

Follow `k8s/docs/ROLLBACK_DRILL.md`.

## 5) Run restore drill

Follow `k8s/docs/RESTORE_DRILL.md`.
