# Setup

## Prerequisites

- [Bun](https://bun.sh) ≥ 1.2 (`bun --version`)
- Android `adb` on PATH (`adb --version`) — from
  [platform-tools](https://developer.android.com/tools/releases/platform-tools)
- A Pixel with the **Pixel Screenshots** app (`com.google.android.apps.pixel.agent`),
  USB debugging or wireless debugging on

Check in one line:

```sh
bun --version && adb --version | head -1 && adb devices
```

## Install

```sh
git clone https://github.com/toxicwind/pearlctl.git
cd pearlctl
bun install
```

Run from source (no build step):

```sh
bun src/cli.ts launch
```

Or build a single binary:

```sh
bun run build          # → dist/pearlctl
./dist/pearlctl launch
```

## Point at your phone

```sh
export PEARLCTL_DEVICE=10.0.0.77:41735   # your device serial
# or: pearlctl --device <serial> launch
# ANDROID_SERIAL is also honored
```

## Verify the install

```sh
bun test            # 20 unit tests, no phone needed
pearlctl inventory  # live component inventory off your phone
```

## Environment

| Variable | Purpose |
|---|---|
| `PEARLCTL_DEVICE` | adb device serial (overrides auto-detect) |
| `ANDROID_SERIAL` | standard adb serial fallback |
| `ADB_TRACE` | set to `all` to debug the transport |

See [.env.example](../.env.example).
