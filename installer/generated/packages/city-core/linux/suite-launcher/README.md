# CivicSuite Suite Launcher

This directory contains the first suite-level launcher scaffold for the
city-core installer runtime. It is intentionally static and self-contained:
no network fonts, no build step, and no dependency install is required.

## Runtime

- `index.html` loads the launcher shell.
- `src/styles.css` defines the prototype paper, navy, and gold tokens plus the
  Inter, Source Serif, and JetBrains Mono font stack with local/system
  fallbacks.
- `src/app.js` owns the Staff, Resident, and IT-Admin surfaces, module tiles,
  audit drawer, command palette, and QA state simulation.
- `scripts/serve.mjs` starts a small local static server for browser QA.
- `tests/smoke.mjs` checks the required scaffold features without external
  packages.

## Local Checks

```powershell
npm test
npm run serve -- --port 4179
```

State fixtures are selected with the `state` query parameter:

- `?state=loading`
- `?state=success`
- `?state=empty`
- `?state=error`
- `?state=partial`

The module links are local defaults only. Installer packaging or later runtime
config can override them by defining `window.CIVICSUITE_LAUNCHER_CONFIG` before
`src/app.js` loads.
