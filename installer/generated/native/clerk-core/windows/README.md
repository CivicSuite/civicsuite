# Windows Native Wrapper

Payload source: `installer/generated/packages/clerk-core/windows`

Use `CivicSuiteInstaller.iss` with Inno Setup to build a Windows installer that
wraps the generated operator package. The wrapper opens the readiness flow by
default and keeps privileged dependency installation outside silent mutation.

This beta wrapper is unsigned until project signing certificates are available.
Windows SmartScreen or Unknown Publisher warnings are expected. Verify the
release SHA256 checksum before running the installer, then use More info > Run
anyway only if the checksum matches.
