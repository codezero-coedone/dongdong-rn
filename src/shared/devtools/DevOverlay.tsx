import React, { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Constants from "expo-constants";

import { clearDevLogs, DevLogEntry, getDevLogs, subscribeDevLogs } from "./devlog";
import { config } from "@/shared/config";

function fmtTime(ts: number): string {
  try {
    const d = new Date(ts);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  } catch {
    return "";
  }
}

function isEnabled(): boolean {
  return Boolean(__DEV__ || process.env.EXPO_PUBLIC_DEVTOOLS === "1");
}

export function DevOverlay() {
  const enabled = isEnabled();
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useState<DevLogEntry[]>(enabled ? getDevLogs() : []);

  const runtimeInfo = useMemo(() => {
    const pkg =
      (Constants as any)?.expoConfig?.android?.package ||
      (Constants as any)?.manifest?.android?.package ||
      "";
    const api = (() => {
      try {
        return config.API_URL;
      } catch {
        return process.env.EXPO_PUBLIC_API_URL || "";
      }
    })();
    const kakao = process.env.EXPO_PUBLIC_KAKAO_APP_KEY || process.env.KAKAO_APP_KEY || "";
    const webview = process.env.EXPO_PUBLIC_WEBVIEW_URL || "";
    const devtools = process.env.EXPO_PUBLIC_DEVTOOLS || (__DEV__ ? "dev" : "");
    return { pkg, api, kakao, webview, devtools };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    return subscribeDevLogs(setLogs);
  }, [enabled]);

  const last = useMemo(() => logs[logs.length - 1] ?? null, [logs]);
  const lastBadge = useMemo(() => {
    if (!last) return "DBG";
    const status = (last.meta as any)?.status;
    if (typeof status === "number") return String(status);
    return last.level === "error" ? "ERR" : "DBG";
  }, [last]);

  if (!enabled) return null;

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={[
          styles.badge,
          last?.level === "error" && styles.badgeError,
          last?.level === "warn" && styles.badgeWarn,
        ]}
        hitSlop={12}
      >
        <Text style={styles.badgeText}>{lastBadge}</Text>
      </Pressable>

      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>DEV TRACE</Text>
            <View style={styles.headerBtns}>
              <Pressable style={[styles.hbtn, styles.hbtnGhost]} onPress={() => clearDevLogs()}>
                <Text style={[styles.hbtnText, styles.hbtnTextGhost]}>Clear</Text>
              </Pressable>
              <Pressable style={styles.hbtn} onPress={() => setOpen(false)}>
                <Text style={styles.hbtnText}>Close</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>package: {runtimeInfo.pkg || "(unknown)"}</Text>
            <Text style={styles.infoText}>api: {runtimeInfo.api || "(unknown)"}</Text>
            <Text style={styles.infoText}>webview: {runtimeInfo.webview || "(n/a)"}</Text>
            <Text style={styles.infoText}>
              kakao_app_key: {runtimeInfo.kakao || "(missing)"}
            </Text>
            <Text style={styles.infoText}>devtools: {runtimeInfo.devtools || "(off)"}</Text>
          </View>

          <View style={styles.legend}>
            <Text style={styles.legendText}>
              - 탭: 열기 | 최근 {logs.length}개 (최대 200)
            </Text>
          </View>

          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            {logs
              .slice()
              .reverse()
              .map((l, idx) => (
                <View key={`${l.ts}-${idx}`} style={styles.row}>
                  <Text style={styles.rowTime}>{fmtTime(l.ts)}</Text>
                  <Text
                    style={[
                      styles.rowLevel,
                      l.level === "error" && styles.rowLevelError,
                      l.level === "warn" && styles.rowLevelWarn,
                    ]}
                  >
                    {l.scope}/{l.level.toUpperCase()}
                  </Text>
                  <Text style={styles.rowMsg}>{l.message}</Text>
                </View>
              ))}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: 48,
    right: 12,
    zIndex: 9999,
    backgroundColor: "#111827",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  badgeWarn: { backgroundColor: "#92400E" },
  badgeError: { backgroundColor: "#7F1D1D" },
  badgeText: { color: "#fff", fontWeight: "800", fontSize: 12 },
  modal: { flex: 1, backgroundColor: "#0B1220" },
  header: {
    paddingTop: 18,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  title: { color: "#fff", fontSize: 16, fontWeight: "900" },
  headerBtns: { flexDirection: "row", gap: 10 },
  hbtn: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  hbtnGhost: { backgroundColor: "rgba(255,255,255,0.10)" },
  hbtnText: { color: "#fff", fontWeight: "800" },
  hbtnTextGhost: { color: "rgba(255,255,255,0.9)" },
  legend: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  legendText: { color: "rgba(255,255,255,0.7)", fontSize: 12, lineHeight: 16 },
  infoBox: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
    gap: 4,
  },
  infoText: { color: "rgba(255,255,255,0.85)", fontSize: 12, lineHeight: 16 },
  body: { flex: 1 },
  bodyContent: { padding: 16, gap: 10 },
  row: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  rowTime: { color: "rgba(255,255,255,0.55)", fontSize: 12, marginBottom: 6 },
  rowLevel: { color: "#93C5FD", fontSize: 12, fontWeight: "800" },
  rowLevelWarn: { color: "#FBBF24" },
  rowLevelError: { color: "#FCA5A5" },
  rowMsg: { color: "#fff", marginTop: 6, lineHeight: 18 },
});

