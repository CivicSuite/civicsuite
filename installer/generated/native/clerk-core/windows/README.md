# Windows Native Wrapper

Payload source: `installer/generated/packages/clerk-core/windows`

Use `CivicSuiteInstaller.iss` with Inno Setup to build a Windows installer that
wraps the generated operator package. The wrapper opens the readiness flow by
default and keeps privileged dependency installation outside silent mutation.
