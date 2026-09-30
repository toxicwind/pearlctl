// pearlctl — regenerate docs/INTENT-CATALOG.md from the live device.
import { inventory, summarize } from "../src/inventory.js";

if (import.meta.main) {
  const comps = await inventory({});
  console.log("# Live intent inventory\n");
  console.log(`Regenerated ${new Date().toISOString()} from dumpsys on-device.\n`);
  console.log("```");
  console.log(summarize(comps));
  console.log("```");
}
