# CivicSuite Suite Launcher

This directory contains the first suite-level launcher scaffold for the
city-core installer runtime. It is intentionally static and self-contained:
no network fonts, no build step, and no dependency install is required.

## Runtime

- `index.html` loads the launcher shell.
- `src/styles.css` defines the prototype paper, navy, and gold tokens plus the
  Inter, Source Serif, and JetBrains Mono font stack with local/system
  fallbacks.
- `civicsuite-launcher-config.js` provides installer-written module URLs.
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

State fixtures are selected only when QA mode is explicit:

- `?qa=1&state=loading`
- `?qa=1&state=success`
- `?qa=1&state=empty`
- `?qa=1&state=error`
- `?qa=1&state=partial`

The module links default to the city-core local ports and are overwritten by
the installer-generated `window.CIVICSUITE_LAUNCHER_CONFIG` before `src/app.js`
loads.

If the launcher does not start on `http://127.0.0.1:18082/`, see
`docs/troubleshooting.md` in the umbrella repo for the port-freeing and
`launcher-output/*.log` checks used by the installer lifecycle.
