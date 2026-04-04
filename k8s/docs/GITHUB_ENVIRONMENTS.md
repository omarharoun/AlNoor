# GitHub Environments for Kubernetes Deploys

The k8s workflows now target GitHub Environments:

- `k8s-dev`
- `k8s-stage`
- `k8s-prod`

## What to configure

In GitHub repository settings:

1. Create these three Environments.
2. Add environment-scoped secret `KUBE_CONFIG_B64` in each environment.
3. For `k8s-prod`, enable required reviewers.

## Required reviewer policy (prod)

For `k8s-prod`:

- Enable `Required reviewers` and add approvers.
- Optional: restrict branch/tag deployment rules.

This gives manual approval gate only for prod while dev/stage can deploy without extra approval.

## Branch safety guard

K8s workflows also include an inline guard:

- Prod deploy job runs only when `github.ref_name == 'main'`.
- Dev/stage deploys can run from any ref.

So prod now requires both:

1. Run from `main`
2. Environment approval on `k8s-prod`
