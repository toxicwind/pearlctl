# Security Policy

## Supported versions

| Version | Supported |
|---|---|
| 0.1.x | ✅ |

## Reporting a vulnerability

pearlctl talks to your phone over ADB and fires intents at a system app.
If you find a way it could be abused — a command that does more than
documented, a credential or device detail leaking into logs, anything
that touches data it shouldn't — open a **private** GitHub security
advisory on this repo, or an issue marked `security` with minimal detail
and a request for a private channel.

What to include:

- the exact command and pearlctl version
- what you expected vs what happened
- `adb` / phone model / app version if relevant

We aim to acknowledge within 72 hours and ship a fix or mitigation in the
next release, with credit in the changelog unless you'd rather stay anonymous.

## Scope notes

- pearlctl never exfiltrates anything: it shells out to your local `adb`
  and reads `dumpsys` output. There is no network code, no telemetry.
- The intent catalog documents what the Pixel Screenshots app itself
  exposes — pearlctl doesn't bypass any permission the OS would enforce.
