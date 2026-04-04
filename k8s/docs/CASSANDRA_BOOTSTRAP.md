# Cassandra Bootstrap on Kubernetes

This guide bootstraps Cassandra for AlNoor and connects it to Fluxer config.

## 1) Deploy Cassandra

```bash
kubectl apply -f k8s/base/namespace.yaml
kubectl apply -k k8s/base-cassandra
```

Wait for pods:

```bash
kubectl -n alnoor get pods -l app=cassandra -w
```

## 2) Create Fluxer keyspace

Run in first pod:

```bash
kubectl -n alnoor exec -it cassandra-0 -- cqlsh -u cassandra -p "$(kubectl -n alnoor get secret cassandra-auth -o jsonpath='{.data.CASSANDRA_PASSWORD}' | base64 --decode)"
```

Then run:

```sql
CREATE KEYSPACE IF NOT EXISTS fluxer
WITH replication = {'class': 'NetworkTopologyStrategy', 'dc1': 3};
```

## 3) Run Fluxer migrations

### Option A (recommended): in-cluster Job

```bash
kubectl apply -f k8s/base-cassandra/job-cassandra-migrate.example.yaml
kubectl -n alnoor logs -f job/cassandra-migrations
```

### Option B: run from local repo

From repo root:

```bash
CASSANDRA_HOST=cassandra-client.alnoor.svc.cluster.local \
CASSANDRA_PORT=9042 \
CASSANDRA_USERNAME=cassandra \
CASSANDRA_PASSWORD="$(kubectl -n alnoor get secret cassandra-auth -o jsonpath='{.data.CASSANDRA_PASSWORD}' | base64 --decode)" \
CASSANDRA_KEYSPACE=fluxer \
pnpm tsx fluxer_api/scripts/CassandraMigrate.tsx up
```

## 4) Update Fluxer runtime config

In `config.json` (or `FLUXER_CONFIG__...` overrides):

```json
{
  "database": {
    "backend": "cassandra",
    "cassandra": {
      "hosts": [
        "cassandra-0.cassandra.alnoor.svc.cluster.local",
        "cassandra-1.cassandra.alnoor.svc.cluster.local",
        "cassandra-2.cassandra.alnoor.svc.cluster.local"
      ],
      "keyspace": "fluxer",
      "local_dc": "dc1",
      "username": "cassandra",
      "password": ""
    }
  }
}
```

Set the password via secret env override:

```bash
kubectl -n alnoor create secret generic fluxer-env \
  --from-literal=FLUXER_CONFIG__DATABASE__CASSANDRA__PASSWORD="replace-me"
```

## 5) Validate

```bash
kubectl -n alnoor exec -it cassandra-0 -- cqlsh -u cassandra -p "$(kubectl -n alnoor get secret cassandra-auth -o jsonpath='{.data.CASSANDRA_PASSWORD}' | base64 --decode)" -e "SELECT keyspace_name FROM system_schema.keyspaces WHERE keyspace_name='fluxer';"
```

## Notes

- The included settings are safe starter values, not final high-throughput tuning.
- Tune heap/resources and storage class based on node sizing and workload.
- For multi-AZ/production hardening, add rack-aware placement and anti-affinity.
- Keep `config.json` non-sensitive; put all secrets in `fluxer-env` secret via `FLUXER_CONFIG__...` overrides.
