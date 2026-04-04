# Observability Baseline

Minimum required before production go-live:

## Metrics dashboards

- API request rate, error rate, p95/p99 latency
- CPU/memory saturation for `fluxer-server`
- Cassandra read/write latency, pending compactions, disk usage
- NATS/Valkey connectivity and queue lag indicators

## Alerts

- app 5xx rate above threshold
- app p95 latency above threshold
- Cassandra node down / high latency / low disk
- migration job failure
- backup freshness stale
- HPA maxed for sustained period

## Logs and tracing

- central logs with service labels and correlation IDs
- distributed traces for critical request paths
