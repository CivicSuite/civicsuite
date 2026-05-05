# CO-7 CivicCore Freeze Lockstep Browser QA Evidence

Date: 2026-05-05

Scope: `docs/index.html` rendered after CO-7 CivicCore freeze/spec-lockstep documentation updates.

## Viewports

- Desktop: 1280 x 900, screenshot `docs/browser-qa-co7-civiccore-freeze-lockstep-desktop.png`
- Mobile: 390 x 844, screenshot `docs/browser-qa-co7-civiccore-freeze-lockstep-mobile.png`

## Rendered States

- Success state: checked on desktop and mobile.
- Loading state: not applicable; static HTML has no async loading state.
- Empty state: not applicable; static documentation page has no user data collection.
- Error state: not applicable; static file render has no runtime fetch/error branch.
- Partial state: not applicable; static page has no partial-data branch.

## Results

- Page title: `CivicSuite | municipal product suite roadmap`
- Page title matches expected: true
- Main heading: `An open-source municipal product suite that runs on the city's own hardware.`
- Status snapshot visible: true
- CivicCore v0.22.1 visible: true
- Attested baseline copy visible: true
- CivicCode historical pin still visible: true
- Browser console messages: desktop 0, mobile 0
- Page errors: desktop 0, mobile 0
- Horizontal overflow: desktop false, mobile false
- Body contrast ratio: desktop 15.26, mobile 15.26
- Link contrast ratio: desktop 9.01, mobile 9.01
- Keyboard focus sample after tabbing: Desktop: a Skip to main content -> a README -> a Continuity plan -> a Roadmap -> a Rollout playbook -> a Compatibility matrix -> a Charter -> a User manual -> a Canonical roadmap -> a Shared extraction consumer rollout playbook; Mobile: a Skip to main content -> a README -> a Continuity plan -> a Roadmap -> a Rollout playbook -> a Compatibility matrix -> a Charter -> a User manual -> a Canonical roadmap -> a Shared extraction consumer rollout playbook
- Empty image alt count: desktop 0, mobile 0
- Copy review: the current CivicCore baseline is clearly v0.22.1 while historical CivicCode/CivicClerk v0.22.0 dependency copy remains explicitly tied to those module releases.

## Result

PASS

## Browser Automation Command

The check used Python Playwright from this workspace and opened:

```text
file:///C:/Users/scott/OneDrive/Desktop/Claude/CivicSuite/docs/index.html
```
