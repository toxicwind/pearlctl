// pearlctl — adb transport layer.
// All device interaction goes through here: discovery, shell, am intents, file push.

export const PKG = "com.google.android.apps.pixel.agent";

export interface AdbOptions {
  device?: string; // serial, e.g. "10.0.0.77:41735"
  env?: NodeJS.ProcessEnv;
}

function envFor(opts: AdbOptions): NodeJS.ProcessEnv {
  const env = { ...process.env, ...(opts.env ?? {}) };
  if (!env.ANDROID_SERIAL && (opts.device || process.env.PEARLCTL_DEVICE)) {
    env.ANDROID_SERIAL = opts.device || process.env.PEARLCTL_DEVICE;
  }
  return env;
}

export async function adb(args: string[], opts: AdbOptions = {}): Promise<string> {
  const proc = Bun.spawn(["adb", ...args], {
    stdout: "pipe",
    stderr: "pipe",
    env: envFor(opts),
  });
  const [out, err, code] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  if (code !== 0) {
    throw new Error(`adb ${args.join(" ")} failed (${code}): ${err.trim() || out.trim()}`);
  }
  return out;
}

export async function devices(): Promise<string[]> {
  const out = await adb(["devices"]);
  return out
    .split("\n")
    .slice(1)
    .map((l) => l.trim())
    .filter((l) => l.endsWith("\tdevice"))
    .map((l) => l.split("\t")[0]);
}

export async function ensureDevice(opts: AdbOptions = {}): Promise<string> {
  const serial = opts.device || process.env.PEARLCTL_DEVICE || process.env.ANDROID_SERIAL;
  if (serial) {
    // sanity: device actually reachable
    await adb(["-s", serial, "shell", "echo", "ok"], { device: serial });
    return serial;
  }
  const list = await devices();
  if (list.length === 0) throw new Error("no adb devices connected (set PEARLCTL_DEVICE=<serial>)");
  if (list.length > 1) {
    console.error(`multiple devices; using ${list[0]} (override with --device or PEARLCTL_DEVICE)`);
  }
  return list[0];
}

export async function shell(cmd: string, opts: AdbOptions = {}): Promise<string> {
  const serial = await ensureDevice(opts);
  return adb(["-s", serial, "shell", cmd], { device: serial });
}

export async function push(local: string, remote: string, opts: AdbOptions = {}): Promise<void> {
  const serial = await ensureDevice(opts);
  await adb(["-s", serial, "push", local, remote], { device: serial });
}

/** Fire an `am` intent and return raw stdout. */
export async function am(args: string[], opts: AdbOptions = {}): Promise<string> {
  return shell(`am ${args.join(" ")}`, opts);
}

/** Time an async fn; returns {result, ms}. */
export async function timed<T>(fn: () => Promise<T>): Promise<{ result: T; ms: number }> {
  const t0 = Bun.nanoseconds();
  const result = await fn();
  return { result, ms: (Bun.nanoseconds() - t0) / 1e6 };
}
