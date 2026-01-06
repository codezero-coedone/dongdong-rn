export type DevLogLevel = "info" | "warn" | "error";
export type DevLogScope = "API" | "KAKAO" | "NAV" | "SYS";

export type DevLogEntry = {
  ts: number;
  level: DevLogLevel;
  scope: DevLogScope;
  message: string;
  meta?: Record<string, unknown>;
};

const MAX_LOGS = 200;
let buffer: DevLogEntry[] = [];
const subs = new Set<(logs: DevLogEntry[]) => void>();

function enabled(): boolean {
  return Boolean(__DEV__ || process.env.EXPO_PUBLIC_DEVTOOLS === "1");
}

function notify() {
  const snap = buffer;
  subs.forEach((fn) => fn(snap));
}

export function devlog(entry: Omit<DevLogEntry, "ts">) {
  if (!enabled()) return;
  buffer = [...buffer, { ...entry, ts: Date.now() }].slice(-MAX_LOGS);
  notify();
}

export function getDevLogs(): DevLogEntry[] {
  return buffer;
}

export function clearDevLogs() {
  if (!enabled()) return;
  buffer = [];
  notify();
}

export function subscribeDevLogs(fn: (logs: DevLogEntry[]) => void): () => void {
  if (!enabled()) return () => {};
  subs.add(fn);
  fn(buffer);
  return () => subs.delete(fn);
}

