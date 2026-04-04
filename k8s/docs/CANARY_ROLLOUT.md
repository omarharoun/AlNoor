# Canary Rollout Policy

## Strategy

Use `stage` as canary ring before `prod`.

1. Deploy to stage (`values-stage.yaml`)
2. Observe health/latency/error SLOs for defined window
3. Promote same image/tag to prod (`values-prod.yaml`)

## Promotion gate

Promote only when all are true:

- no elevated error rate
- p95 latency within SLO
- no migration/backlog alerts
- no critical logs spike

## Rollback trigger

If any gate fails, execute `ROLLBACK_DRILL.md` steps immediately.
