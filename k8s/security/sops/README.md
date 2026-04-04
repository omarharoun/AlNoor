# SOPS Workflow (Recommended for GitOps)

Use SOPS to keep encrypted Secret manifests in Git.

## Setup

1. Install `sops` and `age`.
2. Create team age keypair.
3. Put public key in `k8s/security/sops/.sops.yaml`.

## Encrypt new secret

```bash
sops --encrypt --in-place k8s/security/sops/secret-fluxer-env.enc.example.yaml
sops --encrypt --in-place k8s/security/sops/secret-cassandra-auth.enc.example.yaml
```

## Apply

```bash
sops --decrypt k8s/security/sops/secret-fluxer-env.enc.example.yaml | kubectl apply -f -
sops --decrypt k8s/security/sops/secret-cassandra-auth.enc.example.yaml | kubectl apply -f -
```

## Rotate

```bash
sops k8s/security/sops/secret-fluxer-env.enc.example.yaml
sops updatekeys --yes k8s/security/sops/secret-fluxer-env.enc.example.yaml
```
