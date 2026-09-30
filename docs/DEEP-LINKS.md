# Deep links

Recovered from the `BrowserActivityDeepLink` intent-filters in
`AndroidManifest.xml` (verified live on-device):

```xml
<activity-alias android:exported="true"
    android:name="com.google.android.apps.pixel.agent.app.ui.browser.BrowserActivityDeepLink"
    android:targetActivity="com.google.apps.tiktok.nav.gateway.GatewayActivity">
    <intent-filter>
        <action android:name="android.intent.action.VIEW"/>
        <category android:name="android.intent.category.DEFAULT"/>
        <data android:scheme="pearl" android:host="browser" android:pathPattern=".*"/>
        <data android:scheme="pixelagent" android:host="com.google.android.apps.pixel.agent"
              android:path="/settings"/>
    </intent-filter>
    <intent-filter>
        <action android:name="android.intent.action.VIEW"/>
        <category android:name="android.intent.category.DEFAULT"/>
        <data android:scheme="pearl" android:host="external.app" android:pathPattern=".*"/>
    </intent-filter>
</activity-alias>
```

## The three routes

| URI | Route | What it does |
|---|---|---|
| `pearl://browser/<path>` | browser | Opens the in-app browser at `<path>` (any path matches `.*`) |
| `pearl://external.app/<path>` | external-app | Gateway for external-app flows |
| `pixelagent://com.google.android.apps.pixel.agent/settings` | settings | Opens the app's settings page |

## Via pearlctl

```sh
pearlctl deeplink pearl://browser/collections
pearlctl deeplink browser /collections        # same thing, shorthand
pearlctl deeplink external /share
pearlctl settings                             # pixelagent://…/settings
```

## Via raw adb

```sh
adb shell am start -a android.intent.action.VIEW -d 'pearl://browser/' \
  -n com.google.android.apps.pixel.agent/.app.ui.browser.BrowserActivityDeepLink
```
