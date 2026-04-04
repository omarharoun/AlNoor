# Cassandra Restore Drill

Run at least once before production cutover and then periodically.

## Objectives

- Validate end-to-end restore works
- Measure RTO and effective RPO

## Procedure

1. Restore latest backup into isolated test cluster/namespace.
2. Start Cassandra and validate keyspace + critical table counts.
3. Run application read checks against restored environment.
4. Record timings and data freshness.

## Minimum validation commands

```bash
kubectl -n alnoor exec -it cassandra-0 -- cqlsh -u cassandra -p "$CASSANDRA_PASSWORD" -e "DESCRIBE KEYSPACES"
kubectl -n alnoor exec -it cassandra-0 -- cqlsh -u cassandra -p "$CASSANDRA_PASSWORD" -e "SELECT COUNT(*) FROM fluxer.users;"
```

## Exit criteria

- Restore completed within target RTO
- Data freshness within target RPO
- App smoke reads pass on restored data
