// pearlctl — live component inventory from `dumpsys package`.
//
// Parses the exported activities/services/receivers/providers of
// com.google.android.apps.pixel.agent straight off the device,
// so the catalog in docs/INTENT-CATALOG.md can be regenerated
// against any installed version.

import { PKG, shell, type AdbOptions } from "./adb.js";

export interface IntentFilter {
  actions: string[];
  categories: string[];
  data?: string[];
}

export interface Component {
  kind: "activity" | "service" | "receiver" | "provider";
  name: string;
  exported: boolean;
  filters: IntentFilter[];
}

/** Parse `dumpsys package <pkg>` into structured components. */
export function parseDumpsys(dump: string): Component[] {
  const components: Component[] = [];
  const lines = dump.split("\n");
  let current: Component | null = null;
  let currentFilter: IntentFilter | null = null;

  const flush = () => {
    if (currentFilter && current) current.filters.push(currentFilter);
    currentFilter = null;
  };

  for (const raw of lines) {
    const line = raw.trim();
    // Section headers look like:
    //   11abbee com.google.android.apps.pixel.agent/.app.ui.browser.BrowserActivity filter 423cf25
    const m = line.match(
      /^[0-9a-f]+ ([^ ]+) filter [0-9a-f]+$/,
    );
    if (m) {
      flush();
      const full = m[1];
      const [pkg, cls] = full.includes("/") ? full.split("/", 2) : [PKG, full];
      const name = cls.startsWith(".") ? pkg + cls : cls;
      // find or create the component entry
      let comp = components.find((c) => c.name === name);
      if (!comp) {
        comp = { kind: "activity", name, exported: true, filters: [] };
        components.push(comp);
      }
      current = comp;
      currentFilter = { actions: [], categories: [], data: [] };
      continue;
    }
    if (currentFilter) {
      const a = line.match(/^Action: "(.+)"$/);
      if (a) {
        currentFilter.actions.push(a[1]);
        continue;
      }
      const c = line.match(/^Category: "(.+)"$/);
      if (c) {
        currentFilter.categories.push(c[1]);
        continue;
      }
      const d = line.match(/^(Scheme|Host|Path|Type): "(.+)"$/);
      if (d) {
        currentFilter.data!.push(`${d[1]}=${d[2]}`);
        continue;
      }
    }
  }
  flush();
  return components;
}

/** Fetch and parse the live inventory from the device. */
export async function inventory(opts: AdbOptions = {}): Promise<Component[]> {
  const dump = await shell(`dumpsys package ${PKG}`, opts);
  return parseDumpsys(dump);
}

/** Human-readable one-line summary per component. */
export function summarize(components: Component[]): string {
  return components
    .map((c) => {
      const acts = c.filters.flatMap((f) => f.actions).join(", ") || "(no intent filter)";
      return `${c.kind.toUpperCase()} ${c.name}\n    ${acts}`;
    })
    .join("\n");
}
