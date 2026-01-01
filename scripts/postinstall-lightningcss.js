/**
 * EAS(Build)에서 Tailwind v4(PostCSS)가 lightningcss native binding을 못 찾는 케이스가 있어,
 * optional binary package -> lightningcss root로 .node 파일을 복사해 fallback 경로를 확보합니다.
 *
 * lightningcss/node/index.js 로직:
 *  1) require('lightningcss-${platform}-${arch}-${variant}') 시도
 *  2) 실패 시 require('../lightningcss.${platform}-${arch}-${variant}.node') 시도
 *
 * (2) 경로에 파일이 없으면 번들 단계에서 터집니다.
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

function exists(p) {
  try {
    fs.accessSync(p, fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

function copyIfMissing(src, dst) {
  if (!exists(src)) return false;
  if (exists(dst)) return true;
  fs.copyFileSync(src, dst);
  return true;
}

function detectLinuxVariant() {
  try {
    const dl = require("detect-libc");
    const family = typeof dl.familySync === "function" ? dl.familySync() : null;
    if (family && dl.MUSL && family === dl.MUSL) return "musl";
    // arm gnu 케이스는 여기 프로젝트에서 사실상 제외(x64 기준)
    return "gnu";
  } catch {
    // 보수적으로 gnu
    return "gnu";
  }
}

function getParts() {
  const parts = [process.platform, process.arch];
  if (process.platform === "linux") {
    parts.push(detectLinuxVariant());
  } else if (process.platform === "win32") {
    parts.push("msvc");
  }
  return parts;
}

function main() {
  const parts = getParts();
  const variant = parts.join("-");

  const projectRoot = process.cwd();
  const nm = path.join(projectRoot, "node_modules");
  const lightningDir = path.join(nm, "lightningcss");
  if (!exists(lightningDir)) return;

  // 1) optional binary package가 설치돼 있으면 그 안의 .node를 lightningcss root로 복사
  const optionalPkg = path.join(nm, `lightningcss-${variant}`);
  const srcNode = path.join(optionalPkg, `lightningcss.${variant}.node`);
  const dstNode = path.join(lightningDir, `lightningcss.${variant}.node`);

  // 2) 혹시 variant가 gnu/musl 불일치일 수 있어, linux이면 반대 variant도 한번 더 시도
  const candidates = [{ src: srcNode, dst: dstNode }];
  if (process.platform === "linux") {
    const altVariant = `${process.platform}-${process.arch}-${
      parts[2] === "musl" ? "gnu" : "musl"
    }`;
    candidates.push({
      src: path.join(nm, `lightningcss-${altVariant}`, `lightningcss.${altVariant}.node`),
      dst: path.join(lightningDir, `lightningcss.${altVariant}.node`),
    });
  }

  let ok = false;
  for (const c of candidates) {
    ok = copyIfMissing(c.src, c.dst) || ok;
  }

  // EAS(Build)에서 optionalDependencies 설치가 누락되는 케이스가 있어,
  // Linux 빌드 환경에서는 필요한 바이너리를 강제로 받아온 뒤 복사합니다.
  // (Windows 로컬 개발에서는 실행되지 않음)
  if (!ok && process.env.EAS_BUILD && process.platform === "linux") {
    const pkg = `lightningcss-${variant}@1.30.1`;
    try {
      execSync(`npm i --no-save --ignore-scripts --no-audit --no-fund ${pkg}`, {
        cwd: projectRoot,
        stdio: "inherit",
      });
    } catch {
      // ignore and fall through
    }

    // retry copy after install attempt
    for (const c of candidates) {
      ok = copyIfMissing(c.src, c.dst) || ok;
    }
  }

  // 로그는 최소(빌드 로그 오염 방지). 필요한 경우만 1줄.
  if (process.env.EAS_BUILD && ok) {
    console.log(`[postinstall] lightningcss native binding prepared (${variant})`);
  }
}

try {
  main();
} catch {
  // postinstall은 실패해도 설치 자체를 깨지지 않도록 무시
}


