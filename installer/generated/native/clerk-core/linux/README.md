# Linux Native Wrapper

Payload source: `installer/generated/packages/clerk-core/linux`

Use the `debian/` metadata as the first `.deb` wrapper for the generated Linux
operator package. Dependency installation remains explicit and operator-led.
This beta wrapper is unsigned until project signing keys are available. Verify
the release SHA256 checksum before installing the local package.
