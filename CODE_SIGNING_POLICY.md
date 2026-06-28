# Code Signing Policy

This policy describes how CivicSuite release artifacts are (or will be) code-signed.

## Current status (beta)

CivicSuite Windows Local is currently distributed as an **unsigned beta**. An application
for free OSS Windows code signing through the **SignPath Foundation** is in progress; the
certificate typically takes a few weeks to issue. Until it is issued, the MSI is unsigned
and Windows SmartScreen will show an "Unknown Publisher" warning (expected for unsigned
beta software — see the unsigned-beta install notice and the operator walkthrough).
Authenticode signing is the remaining gate between the GA-candidate build and General
Availability.

## Windows — SignPath Foundation

Free code signing provided by SignPath.io, certificate by the SignPath Foundation.

### What will be signed
- Windows installer/executable artifacts published on GitHub Releases.

### Build and signing process
- Artifacts are built from this repository using GitHub Actions (GitHub-hosted runners only).
- Only CI-built artifacts are submitted to SignPath for signing.
- The private key is held by SignPath (HSM-backed); this project does not store the private key.

### Team roles
- Author (commit access): <https://github.com/scottconverse>
- Approver (approves each signing request): <https://github.com/scottconverse>
- Policy: each signing request requires explicit approval by the maintainer.

## Distribution

Releases are published at: <https://github.com/CivicSuite/civicsuite/releases>

## Privacy

This software will not transfer any information to other networked systems unless
specifically requested by the user.
