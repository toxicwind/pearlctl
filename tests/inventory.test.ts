import { describe, expect, test } from "bun:test";
import { parseDumpsys, summarize } from "../src/inventory.js";
import { ACTIONS, COMPONENTS } from "../src/intents.js";

const SAMPLE = `
  11abbee com.google.android.apps.pixel.agent/.app.ui.overlay.OverlayActivityDeepLink filter 5b8b88f
    Action: "android.intent.action.SEND"
    Action: "android.intent.action.SEND_MULTIPLE"
  57c571c com.google.android.apps.pixel.agent/.app.ui.browser.BrowserActivityDeepLink filter 423cf25
    Action: "android.intent.action.VIEW"
    Category: "android.intent.category.DEFAULT"
    Scheme: "pearl"
    Host: "browser"
`;

describe("parseDumpsys", () => {
  test("extracts components, actions, categories, data", () => {
    const comps = parseDumpsys(SAMPLE);
    expect(comps).toHaveLength(2);
    const overlay = comps.find((c) => c.name.includes("OverlayActivityDeepLink"))!;
    expect(overlay.filters[0].actions).toEqual([
      "android.intent.action.SEND",
      "android.intent.action.SEND_MULTIPLE",
    ]);
    const browser = comps.find((c) => c.name.includes("BrowserActivityDeepLink"))!;
    expect(browser.filters[0].categories).toEqual(["android.intent.category.DEFAULT"]);
    expect(browser.filters[0].data).toEqual(["Scheme=pearl", "Host=browser"]);
  });

  test("expands relative class names to full package", () => {
    const comps = parseDumpsys(SAMPLE);
    expect(comps[0].name).toBe(
      "com.google.android.apps.pixel.agent.app.ui.overlay.OverlayActivityDeepLink",
    );
  });

  test("summarize prints one block per component", () => {
    const s = summarize(parseDumpsys(SAMPLE));
    expect(s).toContain("OverlayActivityDeepLink");
    expect(s).toContain("android.intent.action.SEND_MULTIPLE");
  });
});

describe("intent constants", () => {
  test("action strings match the APK", () => {
    expect(ACTIONS.EXECUTE_TOOL).toBe("com.google.android.apps.pixel.agent.EXECUTE_TOOL");
    expect(ACTIONS.ADD_REMINDER).toBe("com.google.android.apps.pixel.agent.ADD_REMINDER");
    expect(ACTIONS.PEARL_ADD_REMINDER).toBe("com.google.android.apps.pixel.pearl.ACTION_ADD_REMINDER");
  });

  test("components are fully qualified", () => {
    for (const c of Object.values(COMPONENTS)) {
      expect(c.startsWith("com.google.android.apps.pixel.agent/")).toBe(true);
    }
  });
});
