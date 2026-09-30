// pearlctl — deep-link URI model for the pearl:// and pixelagent:// schemes.
//
// Recovered from AndroidManifest.xml intent-filters on
// BrowserActivityDeepLink (see docs/DEEP-LINKS.md).

export interface ParsedDeepLink {
  scheme: "pearl" | "pixelagent";
  host: string;
  path: string;
  /** What the app routes this to. */
  route: "browser" | "external-app" | "settings" | "unknown";
}

const ROUTES: Record<string, ParsedDeepLink["route"]> = {
  "pearl://browser": "browser",
  "pearl://external.app": "external-app",
  "pixelagent://com.google.android.apps.pixel.agent/settings": "settings",
};

export function parseDeepLink(uri: string): ParsedDeepLink {
  let u: URL;
  try {
    u = new URL(uri);
  } catch {
    throw new Error(`not a valid URI: ${uri}`);
  }
  const scheme = u.protocol.replace(":", "");
  if (scheme !== "pearl" && scheme !== "pixelagent") {
    throw new Error(`unsupported scheme ${scheme} (want pearl:// or pixelagent://)`);
  }
  const host = u.host;
  const path = u.pathname || "/";
  let route: ParsedDeepLink["route"] = "unknown";
  if (scheme === "pearl" && host === "browser") route = "browser";
  else if (scheme === "pearl" && host === "external.app") route = "external-app";
  else if (scheme === "pixelagent" && path.startsWith("/settings")) route = "settings";
  return { scheme: scheme as ParsedDeepLink["scheme"], host, path, route };
}

/** Build a pearl:// deep link; throws on unknown hosts. */
export function buildDeepLink(
  kind: "browser" | "external-app" | "settings",
  path = "/",
): string {
  if (kind === "browser") return `pearl://browser${path.startsWith("/") ? path : "/" + path}`;
  if (kind === "external-app") return `pearl://external.app${path.startsWith("/") ? path : "/" + path}`;
  return `pixelagent://com.google.android.apps.pixel.agent/settings`;
}

export function knownRoutes(): typeof ROUTES {
  return { ...ROUTES };
}
