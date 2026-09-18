import { spawn, execFileSync } from "node:child_process";
export async function localServer<T>(
  app: string,
  port: number,
  target: "prod" | "demo",
  work: (origin: string) => Promise<T>,
): Promise<T> {
  const config = JSON.parse(
    execFileSync("pnpm", ["exec", "supabase", "status", "-o", "json"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }),
  );
  if (new URL(config.API_URL).hostname !== "127.0.0.1")
    throw Error("Local DEV database required");
  const origin = `http://127.0.0.1:${port}`;
  let occupied = false;
  try {
    await fetch(origin + "/api/health");
    occupied = true;
  } catch {}
  if (occupied) throw Error("Measurement port already occupied");
  const server = spawn(
    "pnpm",
    [
      "--filter",
      `@acticiv/${app}`,
      "exec",
      "next",
      "start",
      "--hostname",
      "127.0.0.1",
      "--port",
      String(port),
    ],
    {
      env: {
        ...process.env,
        ACTICIV_BUILD_TARGET: target,
        SUPABASE_URL: config.API_URL,
        SUPABASE_PUBLISHABLE_KEY: config.ANON_KEY,
      },
      stdio: "ignore",
      detached: true,
    },
  );
  try {
    let ready = false;
    for (let i = 0; i < 60; i++) {
      if (server.exitCode !== null) throw Error("Measurement server exited");
      try {
        ready = (await fetch(origin + "/api/health")).ok;
      } catch {}
      if (ready) break;
      await new Promise((r) => setTimeout(r, 500));
    }
    if (!ready) throw Error("Measurement server unavailable");
    return await work(origin);
  } finally {
    if (server.pid) {
      try {
        process.kill(-server.pid, "SIGTERM");
      } catch {}
    }
  }
}
export async function latency(app: string, port: number) {
  return localServer(app, port, "prod", async (origin) => {
    const results: Record<string, unknown> = {};
    for (const path of ["/api/health", app === "pro" ? "/auth/login" : "/"]) {
      for (let i = 0; i < 3; i++) {
        const r = await fetch(origin + path);
        await r.arrayBuffer();
        if (!r.ok) throw Error("Warmup failed");
      }
      const samples = [];
      for (let i = 0; i < 15; i++) {
        const start = performance.now();
        const r = await fetch(origin + path);
        await r.arrayBuffer();
        if (!r.ok) throw Error("Measurement HTTP failure");
        samples.push(performance.now() - start);
      }
      samples.sort((a, b) => a - b);
      results[path] = {
        requests: 15,
        warmups: 3,
        median_ms: samples[7],
        p95_ms: samples[14],
        max_ms: samples[14],
      };
    }
    return {
      scope: "local-loopback-sequential-warm-unauthenticated",
      routes: results,
    };
  });
}
