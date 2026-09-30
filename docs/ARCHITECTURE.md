# Architecture

```
┌──────────────┐   adb / shell   ┌──────────────────────────────┐
│   pearlctl   │ ───────────────▶│  Pixel 9 Pro XL              │
│  (Bun CLI)   │   am intents    │                              │
└──────────────┘                 │  ┌────────────────────────┐  │
       ▲                         │  │ BrowserActivity        │  │
       │                         │  │ (MAIN/LAUNCHER)        │  │
  src/cli.ts                     │  └────────────────────────┘  │
    ├─ src/adb.ts        ───────▶│  ┌────────────────────────┐  │
    │    device discovery,       │  │ OverlayActivityDeepLink│  │
    │    shell/push/am           │  │ SEND/SEND_MULTIPLE ────┼──┼──▶ on-device agent
    ├─ src/intents.ts            │  └────────────────────────┘  │    (AI analysis)
    │    builders for every      │  ┌────────────────────────┐  │
    │    action in the catalog   │  │ BrowserActivityDeepLink│  │
    ├─ src/deeplink.ts           │  │ pearl://, pixelagent://│  │
    │    pearl:// URI model      │  └────────────────────────┘  │
    ├─ src/inventory.ts          │  ┌────────────────────────┐  │
    │    dumpsys → components    │  │ PearlService /         │  │
    └─ scripts/benchmark.ts      │  │ PearlActionService /   │  │
         timed intent round-trips│  │ ScreenshotEndpointSvc  │  │
                                 │  └────────────────────────┘  │
                                 └──────────────────────────────┘
```

## Design notes

- **No root, no SDK.** Everything is a stock `adb shell am` intent — the same
  mechanism the Android share sheet uses. If `adb` can see the phone, pearlctl
  works.
- **Builders, not strings.** `src/intents.ts` is the single source of truth for
  every action/component/URI the APK exposes. The CLI, docs, and tests all
  derive from it — drift is a test failure, not a stale doc.
- **Inventory is live.** `src/inventory.ts` parses `dumpsys package` on the
  device, so the catalog can be regenerated against any installed app version
  (`bun inventory`).
- **Bun end to end.** CLI, tests (`bun test`), benchmarks (`Bun.nanoseconds`
  timing), and CI all run on Bun.
