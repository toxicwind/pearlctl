# Verification methodology

How each row of the [intent catalog](INTENT-CATALOG.md) was established.
Nothing in this repo is asserted from a single source.

## 1. APK decode (static)

The Pixel Screenshots APK (`com.google.android.apps.pixel.agent`,
base APK + arm64/English/xxhdpi splits, 29,730,920 bytes) was pulled from a
Pixel 9 Pro XL via `adb pull` and decoded with `apktool`. Exported
components and intent-filters come from the decoded `AndroidManifest.xml`;
custom actions (`EXECUTE_TOOL`, `ADD_REMINDER`, `USER_INITIATED_FEEDBACK_REPORT`)
come from the intent-dispatch switch in the decompiled overlay code
(`apktool` smali + `jadx` cross-check).

## 2. Live device confirmation (dynamic)

Every exported component in the catalog was confirmed present on-device via
`dumpsys package com.google.android.apps.pixel.agent`:

- `OverlayActivityDeepLink` filter with `SEND`/`SEND_MULTIPLE` — confirmed
- `BrowserActivityDeepLink` filters with `VIEW` + `pearl://`/`pixelagent://` data — confirmed
- `PearlActionService`, `PearlService`, `ScreenshotEndpointService`,
  `PixelScreenshotsOnboardingTaskManagerService` exported — confirmed

## 3. Live intent firing (behavioral)

- `am start -W …/.app.ui.browser.BrowserActivity` → app comes to foreground,
  `Status: ok` — verified
- `pearl://browser/` and `pixelagent://…/settings` deep links → routed by the
  `BrowserActivityDeepLink` alias — verified
- `SEND` with `image/*` + data URI to `OverlayActivityDeepLink` →
  `OverlayActivity` comes to the foreground (`mFocusedApp` confirmed live) —
  verified

## 4. Benchmarks

`bun bench` measures real round-trips: adb latency, warm launch, deep-link
fire, settings, and dumpsys inventory — median of 3–5 runs on the actual
phone. See [BENCHMARKS.md](BENCHMARKS.md) for the latest numbers.

## Reproduce it

```sh
bun run inventory   # regenerate the live inventory
bun bench           # re-run the benchmarks on your phone
```

If your installed app version differs, the inventory will show it — that's
the point. File an issue with the output and we'll update the catalog.
