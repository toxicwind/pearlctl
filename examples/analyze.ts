#!/usr/bin/env bun
/**
 * examples/analyze.ts — share local images into the on-device agent.
 * Run: PEARLCTL_DEVICE=<serial> bun examples/analyze.ts shot1.png [shot2.png …]
 */
import { analyze } from "../src/intents.js";

const images = process.argv.slice(2);
if (!images.length) {
  console.error("usage: bun examples/analyze.ts <image> [image …]");
  process.exit(1);
}
console.log(await analyze(images));
console.log("shared — the Pixel Screenshots overlay should be up on the phone.");
