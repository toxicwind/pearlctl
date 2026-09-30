#!/usr/bin/env bun
/**
 * examples/inventory.ts — print the live component inventory.
 * Run: PEARLCTL_DEVICE=<serial> bun examples/inventory.ts
 */
import { liveInventory, summarize } from "../src/inventory.js";

const inv = await liveInventory();
console.log(`package: ${inv.package}, version: ${inv.versionName ?? "unknown"}`);
for (const a of inv.activities) console.log(summarize(a));
for (const s of inv.services) console.log(summarize(s));
for (const r of inv.receivers) console.log(summarize(r));
