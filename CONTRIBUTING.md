# Contributing

Thanks for stopping by — this project lives on real, verified findings.

## The one rule

**Every claim about the app must be verified on a real device.**
The catalog in `docs/INTENT-CATALOG.md` was built from an apktool-decoded APK
*and* live `dumpsys`/`am` confirmation. A PR that adds an intent action needs
both: the manifest/smali reference *and* the on-device evidence.

## Fast contributions

The highest-value, lowest-effort contribution: run the inventory on an app
version we haven't seen and paste the diff.

```sh
bun run inventory > inventory-$(adb shell dumpsys package com.google.android.apps.pixel.agent | grep -m1 versionName).txt
```

Then open an issue with the output — we'll update the catalog.

## Dev loop

```sh
bun install
bun test        # unit tests, no phone needed
bun run build   # single-file binary → dist/pearlctl
bun bench       # live benchmarks (needs the phone)
```

## Style

- Bun, not Node. TypeScript throughout.
- `src/intents.ts` is the single source of truth for actions/components/URIs —
  docs derive from it; never hardcode an intent string anywhere else.
- Keep the README's 10-second hook intact: demo above the fold, quickstart
  under 30 seconds.

## PRs

1. Fork, branch, commit with a clear message
2. `bun test` green
3. Update `CHANGELOG.md` under Unreleased
4. Open the PR — the template will guide you
