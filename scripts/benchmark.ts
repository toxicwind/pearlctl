// pearlctl — live benchmark suite. Everything here is measured on real hardware:
// a Pixel 9 Pro XL over ADB (Wi-Fi) driven from the yote host.
//
// Run: bun bench   (or: pearlctl bench)

import { shell, timed, ensureDevice, type AdbOptions } from "../src/adb.js";
import { launch, deepLink, settings } from "../src/intents.js";
import { inventory } from "../src/inventory.js";
import { PKG } from "../src/adb.js";

interface Row {
  name: string;
  medianMs: number;
  runs: number[];
  unit: string;
  note: string;
}

function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

async function measure(
  name: string,
  note: string,
  unit: string,
  fn: () => Promise<unknown>,
  runs = 5,
): Promise<Row> {
  const out: number[] = [];
  for (let i = 0; i < runs; i++) out.push((await timed(fn)).ms);
  return { name, medianMs: median(out), runs: out.map((x) => Math.round(x)), unit, note };
}

export async function runBenchmarks(opts: AdbOptions = {}): Promise<Row[]> {
  const serial = await ensureDevice(opts);
  console.error(`pearlctl bench — device ${serial}, package ${PKG}\n`);

  const rows: Row[] = [];
  rows.push(
    await measure("adb round-trip", "adb shell echo ok", "ms", () =>
      shell("echo ok", opts),
    ),
  );
  rows.push(
    await measure(
      "app launch (warm)",
      "am start -W BrowserActivity, task already alive",
      "ms",
      () => launch(opts),
      3,
    ),
  );
  rows.push(
    await measure("deep link", "pearl://browser/ via BrowserActivityDeepLink", "ms", () =>
      deepLink("pearl://browser/", opts),
      3,
    ),
  );
  rows.push(
    await measure("settings deep link", "pixelagent://…/settings", "ms", () => settings(opts), 3),
  );
  rows.push(
    await measure(
      "inventory (dumpsys + parse)",
      "dumpsys package → structured components",
      "ms",
      () => inventory(opts),
      3,
    ),
  );

  const w = Math.max(...rows.map((r) => r.name.length));
  console.log(`| ${"benchmark".padEnd(w)} | median | runs (ms) | note |`);
  console.log(`| ${"-".repeat(w)} | --- | --- | --- |`);
  for (const r of rows) {
    console.log(
      `| ${r.name.padEnd(w)} | ${r.medianMs.toFixed(0)} ${r.unit} | ${r.runs.join(", ")} | ${r.note} |`,
    );
  }
  console.log("\ndevice: Pixel 9 Pro XL · transport: adb over Wi-Fi · host: yote (CachyOS)");
  return rows;
}

if (import.meta.main) {
  await runBenchmarks({});
}
