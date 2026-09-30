# Intent catalog — `com.google.android.apps.pixel.agent`

Every component and intent action below was recovered from the shipped APK
(`apktool`-decoded `AndroidManifest.xml` + smali) and **verified live on a
Pixel 9 Pro XL over ADB**. Nothing here is guessed.

Package: `com.google.android.apps.pixel.agent` — the on-device agent behind
Google's **Pixel Screenshots** app (the app that saves, organizes, and
AI-searches your screenshots locally).

## Exported components

### Activities

| Component | Intent filters | Notes |
|---|---|---|
| `.app.ui.browser.BrowserActivity` | `android.intent.action.MAIN` + `LAUNCHER` | Main app UI |
| `.app.ui.overlay.OverlayActivityDeepLink` (alias → tiktok `GatewayActivity`) | `SEND`, `SEND_MULTIPLE` (`image/*`) | Share-sheet entry: hand images to the on-device agent |
| `.app.ui.browser.BrowserActivityDeepLink` (alias → tiktok `GatewayActivity`) | `VIEW` + `DEFAULT` | Deep links: `pearl://browser/*`, `pearl://external.app/*`, `pixelagent://com.google.android.apps.pixel.agent/settings` |

### Services (exported, no intent filters — start by component)

| Component | Notes |
|---|---|
| `.app.service.PearlActionService` | Action execution service (native peer) |
| `.server.PearlService` | Core agent service (native peer) |
| `.retaildemo.ScreenshotEndpointService` | Screenshot endpoint (retail/demo builds) |
| `.app.suw.tasks.PixelScreenshotsOnboardingTaskManagerService` | Onboarding; listens for `com.android.onboarding.task.RUN_ONBOARDING_TASK` |

### Receivers

| Component | Intent filters |
|---|---|
| `.app.suw.receiver.SuwCompleteReceiver_Receiver` | `android.intent.action.MY_PACKAGE_REPLACED` |

## Custom intent actions (overlay dispatcher)

`OverlayActivity` (non-exported) dispatches these actions after the deep-link
gateway routes an intent to it — recovered from smali intent-dispatch code:

| Action | Extras | Effect |
|---|---|---|
| `com.google.android.apps.pixel.agent.EXECUTE_TOOL` | `android.intent.extra.STREAM` (`ArrayList<Uri>` of images) | Run the on-device agent tool over the shared images |
| `com.google.android.apps.pixel.agent.ADD_REMINDER` | — | Open the add-reminder flow |
| `com.google.android.apps.pixel.pearl.ACTION_ADD_REMINDER` | — | Same, pearl-namespaced alias |
| `com.google.android.apps.pixel.agent.USER_INITIATED_FEEDBACK_REPORT` | — | User-initiated feedback report |
| `com.google.android.apps.pixel.agent.model.filestore.NOTIFICATION_DISMISSED` | — | Broadcast: model-download notification dismissed |

## Deep links

See [DEEP-LINKS.md](DEEP-LINKS.md). Quick reference:

```
pearl://browser/<path>                          → in-app browser
pearl://external.app/<path>                     → external-app gateway
pixelagent://com.google.android.apps.pixel.agent/settings → settings
```

## `adb` recipes

```sh
# launch the app
adb shell am start -W -n com.google.android.apps.pixel.agent/.app.ui.browser.BrowserActivity

# open settings via deep link
adb shell am start -a android.intent.action.VIEW \
  -d 'pixelagent://com.google.android.apps.pixel.agent/settings' \
  -n com.google.android.apps.pixel.agent/.app.ui.browser.BrowserActivityDeepLink

# share a screenshot into the on-device agent (the share-sheet path)
adb push shot.png /sdcard/pearlctl/shot.png
adb shell am start -a android.intent.action.SEND -t image/* \
  -d file:///sdcard/pearlctl/shot.png \
  -n com.google.android.apps.pixel.agent/.app.ui.overlay.OverlayActivityDeepLink
# → OverlayActivity comes to the foreground (mFocusedApp verified live)
# NOTE: this Android's `am` has no URI-list extra flag (--eul is
# unsupported); send one SEND per image instead of SEND_MULTIPLE.

# live component inventory
adb shell dumpsys package com.google.android.apps.pixel.agent | grep -E 'filter|Action:|Category:|Scheme:|Host:'
```

Or just use the CLI — every recipe above is one `pearlctl` command.
See [VERIFICATION.md](VERIFICATION.md) for the methodology behind each row.
