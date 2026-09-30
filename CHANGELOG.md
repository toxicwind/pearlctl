# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] — 2026-09-30

Initial public release.

### Added
- Full exported-component inventory for `com.google.android.apps.pixel.agent`
  (activities, services, receivers + intent filters), decoded from the shipped
  APK and verified live on a Pixel 9 Pro XL
- Deep-link catalog: `pearl://browser/*`, `pearl://external.app/*`,
  `pixelagent://com.google.android.apps.pixel.agent/settings`
- Custom intent actions: `EXECUTE_TOOL`, `ADD_REMINDER`,
  `ACTION_ADD_REMINDER`, `USER_INITIATED_FEEDBACK_REPORT`
- Bun CLI: `launch`, `deeplink`, `settings`, `analyze`, `inventory`,
  `services`, `remind`, `bench`
- Live benchmark suite (`pearlctl bench`) with real on-device timings
- `docs/`: intent catalog, deep links, architecture, setup, verification
- CI (bun test + build), issue/PR templates, contributing guide
