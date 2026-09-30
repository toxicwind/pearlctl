#!/usr/bin/env bun
// pearlctl — drive Pixel Screenshots (com.google.android.apps.pixel.agent) from the CLI.
//
//   pearlctl launch                    open the app
//   pearlctl deeplink pearl://browser/ open a deep link
//   pearlctl settings                  open in-app settings
//   pearlctl analyze img1.png img2.png push + share images into the on-device agent
//   pearlctl inventory                 exported components + intent filters, live from the phone
//   pearlctl services                  pearl service components + running state
//   pearlctl remind                    fire the ADD_REMINDER overlay action
//   pearlctl bench                     run the benchmark suite

import { ensureDevice, timed, shell } from "./adb.js";
import * as intents from "./intents.js";
import { buildDeepLink, parseDeepLink } from "./deeplink.js";
import { inventory, summarize } from "./inventory.js";
import { runBenchmarks } from "../scripts/benchmark.js";

const VERSION = "0.1.0";

function usage(): never {
  console.log(`pearlctl v${VERSION} — command-line control for Pixel Screenshots

usage: pearlctl [--device <serial>] <command> [args]

commands:
  launch                 open the Pixel Screenshots app
  deeplink <uri|kind>    fire a deep link (pearl://browser/, pearl://external.app/,
                         pixelagent://…/settings — or: browser, external, settings)
  settings               open in-app settings
  analyze <img...>       push images to the phone and share them into the
                         on-device agent for AI analysis
  inventory              exported components + intent filters, live via dumpsys
  services               pearl service components and their running state
  remind                 fire the ADD_REMINDER overlay action
  bench                  benchmark intent round-trips (median of 5)

env: PEARLCTL_DEVICE=<serial>  (default: first adb device)
     ANDROID_SERIAL also honored
`);
  process.exit(1);
}

const raw = process.argv.slice(2);
let device: string | undefined;
const args: string[] = [];
for (let i = 0; i < raw.length; i++) {
  if (raw[i] === "--device" && raw[i + 1]) {
    device = raw[++i];
  } else args.push(raw[i]);
}
const [cmd, ...rest] = args;
const opts = { device };

async function main() {
  switch (cmd) {
    case "launch": {
      const { result, ms } = await timed(() => intents.launch(opts));
      console.log(result.trim());
      console.error(`done in ${ms.toFixed(0)} ms`);
      break;
    }
    case "deeplink": {
      if (!rest[0]) usage();
      const uri =
        rest[0] === "browser"
          ? buildDeepLink("browser", rest[1])
          : rest[0] === "external"
            ? buildDeepLink("external-app", rest[1])
            : rest[0] === "settings"
              ? buildDeepLink("settings")
              : rest[0];
      const parsed = parseDeepLink(uri);
      console.error(`→ ${uri}  (route: ${parsed.route})`);
      console.log((await intents.deepLink(uri, opts)).trim());
      break;
    }
    case "settings":
      console.log((await intents.settings(opts)).trim());
      break;
    case "analyze": {
      if (rest.length === 0) usage();
      console.error(`pushing ${rest.length} image(s)…`);
      console.log((await intents.analyze(rest, opts)).trim());
      break;
    }
    case "inventory": {
      const serial = await ensureDevice(opts);
      console.error(`device: ${serial}`);
      const comps = await inventory(opts);
      console.log(summarize(comps));
      break;
    }
    case "services": {
      const dump = await shell(
        `dumpsys activity services ${intents.PKG}`,
        opts,
      );
      const hits = dump
        .split("\n")
        .filter((l) => l.includes("pixel.agent"))
        .slice(0, 20);
      console.log(hits.join("\n") || "(no pearl services currently running)");
      for (const s of ["pearlActionService", "pearlService", "screenshotEndpointService"] as const) {
        console.error(`component: ${intents.COMPONENTS[s]}`);
      }
      break;
    }
    case "remind":
      console.log((await intents.addReminder(opts)).trim());
      break;
    case "bench":
      await runBenchmarks(opts);
      break;
    default:
      usage();
  }
}

main().catch((e) => {
  console.error(`pearlctl: ${e.message}`);
  process.exit(1);
});
