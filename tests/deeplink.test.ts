import { describe, expect, test } from "bun:test";
import { parseDeepLink, buildDeepLink, knownRoutes } from "../src/deeplink.js";

describe("parseDeepLink", () => {
  test("pearl://browser routes to the in-app browser", () => {
    const p = parseDeepLink("pearl://browser/collections");
    expect(p.scheme).toBe("pearl");
    expect(p.host).toBe("browser");
    expect(p.path).toBe("/collections");
    expect(p.route).toBe("browser");
  });

  test("pearl://external.app routes out", () => {
    const p = parseDeepLink("pearl://external.app/share?x=1");
    expect(p.route).toBe("external-app");
  });

  test("pixelagent:// settings deep link", () => {
    const p = parseDeepLink("pixelagent://com.google.android.apps.pixel.agent/settings");
    expect(p.scheme).toBe("pixelagent");
    expect(p.route).toBe("settings");
  });

  test("unknown pearl host is unknown, not an error", () => {
    expect(parseDeepLink("pearl://nope/x").route).toBe("unknown");
  });

  test("rejects non-uri and wrong scheme", () => {
    expect(() => parseDeepLink("not a uri")).toThrow();
    expect(() => parseDeepLink("https://example.com")).toThrow(/unsupported scheme/);
  });
});

describe("buildDeepLink", () => {
  test("builds canonical forms", () => {
    expect(buildDeepLink("browser", "/a")).toBe("pearl://browser/a");
    expect(buildDeepLink("browser")).toBe("pearl://browser/");
    expect(buildDeepLink("external-app", "x")).toBe("pearl://external.app/x");
    expect(buildDeepLink("settings")).toBe(
      "pixelagent://com.google.android.apps.pixel.agent/settings",
    );
  });

  test("round-trips through the parser", () => {
    for (const u of [
      buildDeepLink("browser", "/c"),
      buildDeepLink("external-app", "/s"),
      buildDeepLink("settings"),
    ]) {
      expect(parseDeepLink(u).route).not.toBe("unknown");
    }
  });
});

describe("knownRoutes", () => {
  test("documents the three manifest deep links", () => {
    const r = knownRoutes();
    expect(Object.keys(r)).toHaveLength(3);
    expect(r["pixelagent://com.google.android.apps.pixel.agent/settings"]).toBe("settings");
  });
});
