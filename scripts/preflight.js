const { spawnSync } = require("node:child_process");

function die(msg) {
  console.error(msg);
  process.exit(1);
}

function quoteArg(a) {
  const s = String(a);
  if (!/[ \t"&^|<>]/.test(s)) return s;
  return `"${s.replace(/"/g, '\\"')}"`;
}

function run(cmd, args, opts = {}) {
  const isWin = process.platform === "win32";
  // On Windows, npm/npx are batch shims (*.cmd) and cannot be executed with shell:false.
  const r = isWin
    ? spawnSync(
        "cmd.exe",
        ["/d", "/s", "/c", `${cmd} ${args.map(quoteArg).join(" ")}`],
        { stdio: "inherit", ...opts },
      )
    : spawnSync(cmd, args, { stdio: "inherit", shell: false, ...opts });
  if (r.status !== 0) {
    die(`[dongdong-rn] command failed: ${cmd} ${args.join(" ")}`);
  }
}

async function fetchWithTimeout(url, ms) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), ms);
  try {
    const res = await fetch(url, { signal: ac.signal });
    return res;
  } finally {
    clearTimeout(t);
  }
}

async function main() {
  console.log("[dongdong-rn] preflight start");

  const kakao = (process.env.EXPO_PUBLIC_KAKAO_APP_KEY || "").trim();
  if (kakao.length < 6) {
    die(
      "[dongdong-rn] EXPO_PUBLIC_KAKAO_APP_KEY is required. (Kakao login is mandatory)",
    );
  }

  if (!process.env.EXPO_PUBLIC_API_URL || !String(process.env.EXPO_PUBLIC_API_URL).trim()) {
    process.env.EXPO_PUBLIC_API_URL = "http://api.dongdong.io:3000/api/v1";
  }
  console.log(`[dongdong-rn] EXPO_PUBLIC_API_URL=${process.env.EXPO_PUBLIC_API_URL}`);

  console.log("[dongdong-rn] lint...");
  run("npm", ["run", "lint"]);

  console.log("[dongdong-rn] tsc --noEmit...");
  run("npx", ["--yes", "tsc", "-p", "tsconfig.json", "--noEmit"]);

  const urls = [
    "http://api.dongdong.io:3000/api/v1/health",
    "http://api.dongdong.io:3000/api/docs",
    "http://dev-client.dongdong.io/",
  ];

  for (const u of urls) {
    console.log(`[dongdong-rn] check 200 -> ${u}`);
    let res;
    try {
      res = await fetchWithTimeout(u, 8000);
    } catch (e) {
      die(`[dongdong-rn] Connection gate failed: ${u} :: ${String(e?.message || e)}`);
    }
    if (res.status !== 200) {
      die(`[dongdong-rn] Connection gate failed: ${u} :: status=${res.status}`);
    }
  }

  console.log("[dongdong-rn] preflight PASS");
}

main().catch((e) => die(String(e?.message || e)));


