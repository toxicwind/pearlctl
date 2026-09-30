// pearlctl — intent builders for com.google.android.apps.pixel.agent.
//
// Every intent here was recovered from the shipped APK
// (apktool-decoded AndroidManifest.xml + smali) and verified live over ADB.
// See docs/INTENT-CATALOG.md for the full inventory with manifest references.

import { PKG, am, push, type AdbOptions } from "./adb.js";

export const ACTIONS = {
  /** Internal overlay dispatcher: run the on-device agent tool on shared images. */
  EXECUTE_TOOL: "com.google.android.apps.pixel.agent.EXECUTE_TOOL",
  /** Internal overlay dispatcher: open the add-reminder flow. */
  ADD_REMINDER: "com.google.android.apps.pixel.agent.ADD_REMINDER",
  /** Pearl-namespaced alias of ADD_REMINDER. */
  PEARL_ADD_REMINDER: "com.google.android.apps.pixel.pearl.ACTION_ADD_REMINDER",
  /** User-initiated feedback report (handled by the overlay). */
  FEEDBACK_REPORT: "com.google.android.apps.pixel.agent.USER_INITIATED_FEEDBACK_REPORT",
  /** Broadcast when a model-download notification is dismissed. */
  NOTIFICATION_DISMISSED: "com.google.android.apps.pixel.agent.model.filestore.NOTIFICATION_DISMISSED",
} as const;

export const COMPONENTS = {
  browser: `${PKG}/.app.ui.browser.BrowserActivity`,
  overlayDeepLink: `${PKG}/.app.ui.overlay.OverlayActivityDeepLink`, // SEND/SEND_MULTIPLE
  browserDeepLink: `${PKG}/.app.ui.browser.BrowserActivityDeepLink`, // VIEW deep links
  pearlActionService: `${PKG}/.app.service.PearlActionService`,
  pearlService: `${PKG}/.server.PearlService`,
  screenshotEndpointService: `${PKG}/.retaildemo.ScreenshotEndpointService`,
  onboardingTaskService: `${PKG}/.app.suw.tasks.PixelScreenshotsOnboardingTaskManagerService`,
} as const;

export const DEEP_LINKS = {
  browser: (path = "/") => `pearl://browser${path}`,
  externalApp: (path = "/") => `pearl://external.app${path}`,
  settings: () => `pixelagent://${PKG}/settings`,
} as const;

/** Launch the Pixel Screenshots browser (MAIN activity). */
export function launch(opts: AdbOptions = {}) {
  return am(["start", "-W", "-n", COMPONENTS.browser], opts);
}

/** Fire a deep link through the BrowserActivityDeepLink alias. */
export function deepLink(uri: string, opts: AdbOptions = {}) {
  return am(
    [
      "start",
      "-a", "android.intent.action.VIEW",
      "-d", `'${uri}'`,
      "-n", COMPONENTS.browserDeepLink,
    ],
    opts,
  );
}

/** Open the in-app settings page via the pixelagent:// deep link. */
export function settings(opts: AdbOptions = {}) {
  return deepLink(DEEP_LINKS.settings(), opts);
}

const REMOTE_STAGING = "/sdcard/pearlctl";

/**
 * Push local images to the phone and SEND each into the
 * OverlayActivityDeepLink — the same path the system share sheet uses
 * to hand screenshots to the on-device agent for analysis.
 *
 * Note: this Android's `am` has no URI-list extra flag (--eul is
 * unsupported), so each image goes as its own SEND with a data URI —
 * exactly how the share sheet delivers single shares.
 */
export async function analyze(images: string[], opts: AdbOptions = {}): Promise<string> {
  if (images.length === 0) throw new Error("analyze needs at least one image");
  const { shell } = await import("./adb.js");
  await shell(`mkdir -p ${REMOTE_STAGING}`, opts);
  const outs: string[] = [];
  for (const img of images) {
    const base = img.split("/").pop()!;
    const remote = `${REMOTE_STAGING}/${base}`;
    await push(img, remote, opts);
    outs.push(
      await am(
        [
          "start",
          "-a", "android.intent.action.SEND",
          "-t", "image/*",
          "-d", `file://${remote}`,
          "-n", COMPONENTS.overlayDeepLink,
        ],
        opts,
      ),
    );
  }
  return outs.join("\n");
}

/** Fire the internal ADD_REMINDER action at the overlay dispatcher. */
export function addReminder(opts: AdbOptions = {}) {
  return am(["start", "-a", ACTIONS.ADD_REMINDER, "-n", COMPONENTS.overlayDeepLink], opts);
}
