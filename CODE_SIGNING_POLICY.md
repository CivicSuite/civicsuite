# Code Signing Policy

This policy describes how Townlight release artifacts are code-signed.

## Windows — Azure Trusted Signing

Townlight Windows release artifacts are signed using **Azure Trusted Signing** (Authenticode,
Microsoft-rooted certificate). The private key is held in Azure's Hardware Security Module (HSM)
and never stored locally.

### What is signed

- Windows installer (MSI) artifacts published on GitHub Releases

### Build and signing process

- Artifacts are built in GitHub Actions (GitHub-hosted runners only)
- Signing occurs only inside the GitHub Actions CI workflow
- No local signing; no `.pfx` certificate files
- Signature is verified in-workflow using `signtool /pa` before release publication
- All checksums are generated after signing

### Team roles

- Author (commit access): <https://github.com/scottconverse>
- Approver (approves release publication): <https://github.com/scottconverse>

## Distribution

Releases are published at: <https://github.com/townlight/townlight/releases>

## Privacy

This software will not transfer any information to other networked systems unless
specifically requested by the user.
