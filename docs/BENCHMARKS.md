# Benchmarks

Measured with `pearlctl bench` (median of 3–5 runs) on real hardware —
**Pixel 9 Pro XL over adb-over-Wi-Fi**, driven from a CachyOS host.
Reproduce: `bun bench`.

| benchmark | median | runs (ms) | note |
|---|---|---|---|
| adb round-trip | 95 ms | 85, 89, 95, 104, 104 | `adb shell echo ok` |
| app launch (warm) | 118 ms | 514, 118, 106 | `am start -W` BrowserActivity, task already alive |
| deep link | 150 ms | 190, 120, 150 | `pearl://browser/` via BrowserActivityDeepLink |
| settings deep link | 122 ms | 122, 119, 157 | `pixelagent://…/settings` |
| inventory (dumpsys + parse) | 225 ms | 297, 185, 225 | dumpsys package → structured components |

Measured 2026-09-30. The first warm-launch run (514 ms) includes one-time
activity bring-up; steady state is ~110 ms. Everything user-facing lands in
well under 250 ms — the CLI feels instant because it is: every command is a
single intent fire, no polling, no SDK.

## What this proves

The whole control surface is one `am start` away. No root, no instrumentation,
no app modification — the numbers above are the full cost of driving the
on-device agent from a script.
