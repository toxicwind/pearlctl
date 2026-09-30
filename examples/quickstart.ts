#!/usr/bin/env bun
/**
 * examples/quickstart.ts — launch the app and fire a deep link.
 * Run: PEARLCTL_DEVICE=<serial> bun examples/quickstart.ts
 */
import { launch } from "../src/intents.js";
import { runDeepLink } from "../src/intents.js";

console.log("1. launching Pixel Screenshots…");
console.log(await launch());
console.log("2. opening the in-app browser via deep link…");
console.log(await runDeepLink({ route: "browser", path: "/collections" }));
console.log("done — check your phone.");
