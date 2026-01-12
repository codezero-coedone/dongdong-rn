import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Constants from "expo-constants";

import { clearDevLogs, devlog, DevLogEntry, getDevLogs, subscribeDevLogs } from "./devlog";
import { config } from "@/shared/config";
import { useAuthStore } from "@/features/auth";
import { apiClient } from "@/shared/api/client";

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
  const logout = useAuthStore((s: any) => s.logout);
  const [busySeed, setBusySeed] = useState(false);

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
    const kakaoKeyHash = process.env.EXPO_PUBLIC_KAKAO_KEY_HASH || "";
    const webview = process.env.EXPO_PUBLIC_WEBVIEW_URL || "";
    const devtools = process.env.EXPO_PUBLIC_DEVTOOLS || (__DEV__ ? "dev" : "");
    const buildSha =
      (Constants as any)?.expoConfig?.extra?.buildSha ||
      process.env.EXPO_PUBLIC_BUILD_GIT_SHA ||
      "";
    const buildNumber =
      (Constants as any)?.expoConfig?.extra?.buildNumber ||
      process.env.EXPO_PUBLIC_BUILD_NUMBER ||
      "";
    const versionCode =
      String((Constants as any)?.expoConfig?.android?.versionCode || "") ||
      String((Constants as any)?.manifest?.android?.versionCode || "");
    return {
      pkg,
      api,
      kakao,
      kakaoKeyHash,
      webview,
      devtools,
      buildSha,
      buildNumber,
      versionCode,
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    return subscribeDevLogs(setLogs);
  }, [enabled]);

  const last = useMemo(() => logs[logs.length - 1] ?? null, [logs]);
  const lastBadge = useMemo(() => {
    // UX: 화면 위 숫자(200/401 등) 노출은 거슬리므로 배지는 항상 DBG만 표시.
    // 상세 status 코드는 패널(DEV TRACE) 내부 로그에서만 확인한다.
    return "DBG";
  }, [last]);

  if (!enabled) return null;

  const seedCareRequest = useCallback(async () => {
    if (busySeed) return;
    setBusySeed(true);
    try {
      devlog({ scope: "SYS", level: "info", message: "seed care-request: start" });

      // 1) create patient (required fields only)
      const birth = "1950-01-15";
      const patientRes = await apiClient.post("/patients", {
        name: "DEV 환자",
        birthDate: birth,
        gender: "MALE",
        mobilityLevel: "PARTIAL_ASSIST",
        diagnosis: "DEV",
        notes: "DEV seed (guardian)",
      });
      const patient = (patientRes as any)?.data?.data ?? (patientRes as any)?.data;
      const patientId = String(patient?.id || "");
      if (!patientId) {
        devlog({ scope: "SYS", level: "error", message: "seed care-request: patientId missing" });
        Alert.alert("실패", "환자 생성에 실패했습니다. (patientId 없음)");
        return;
      }
      devlog({ scope: "SYS", level: "info", message: `seed care-request: patientId=${patientId}` });

      // 2) create care request (job)
      const now = Date.now();
      const start = new Date(now + 30 * 60 * 1000);
      const end = new Date(now + 4 * 60 * 60 * 1000);
      const reqRes = await apiClient.post("/care-requests", {
        patientId,
        careType: "HOSPITAL",
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        location: "DEV 병원",
        requirements: "DEV seed (guardian)",
        dailyRate: 150000,
      });
      const req = (reqRes as any)?.data?.data ?? (reqRes as any)?.data;
      const requestId = String(req?.id || "");
      if (!requestId) {
        devlog({ scope: "SYS", level: "error", message: "seed care-request: requestId missing" });
        Alert.alert("실패", "간병요청 생성에 실패했습니다. (requestId 없음)");
        return;
      }

      devlog({ scope: "SYS", level: "info", message: `seed care-request: ok id=${requestId}` });
      Alert.alert(
        "생성 완료",
        `간병요청(공고) 1개 생성됨\nid=${requestId}\n\n이제 Caregiver 앱에서 /jobs 새로고침 → 지원하면 매칭이 생성됩니다.`,
      );
    } catch (e: any) {
      const status = e?.response?.status;
      const msg = e?.response?.data?.message || e?.message || String(e);
      devlog({
        scope: "SYS",
        level: "error",
        message: "seed care-request: failed",
        meta: { status, message: msg },
      });
      Alert.alert("실패", `간병요청 생성 실패\n${status ? `status=${status}\n` : ""}${String(msg)}`);
    } finally {
      setBusySeed(false);
    }
  }, [busySeed]);

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
              <Pressable
                style={[styles.hbtn, styles.hbtnDanger]}
                onPress={() => {
                  Alert.alert(
                    "로그아웃",
                    "세션(토큰/로그인 상태)만 초기화합니다.\n로컬 데이터/설정은 유지됩니다.",
                    [
                      { text: "취소", style: "cancel" },
                      {
                        text: "로그아웃",
                        style: "destructive",
                        onPress: async () => {
                          try {
                            await logout?.();
                          } catch {
                            // ignore
                          }
                          setOpen(false);
                        },
                      },
                    ],
                  );
                }}
              >
                <Text style={styles.hbtnText}>Logout</Text>
              </Pressable>
              <Pressable style={[styles.hbtn, styles.hbtnGhost]} onPress={() => clearDevLogs()}>
                <Text style={[styles.hbtnText, styles.hbtnTextGhost]}>Clear</Text>
              </Pressable>
              <Pressable style={styles.hbtn} onPress={() => setOpen(false)}>
                <Text style={styles.hbtnText}>Close</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              build: {runtimeInfo.buildSha || "(unknown)"} / #{runtimeInfo.buildNumber || "(n/a)"} / vc=
              {runtimeInfo.versionCode || "(n/a)"}
            </Text>
            <Text style={styles.infoText}>package: {runtimeInfo.pkg || "(unknown)"}</Text>
            <Text style={styles.infoText}>api: {runtimeInfo.api || "(unknown)"}</Text>
            <Text style={styles.infoText}>webview: {runtimeInfo.webview || "(n/a)"}</Text>
            <Text style={styles.infoText}>
              kakao_app_key: {runtimeInfo.kakao || "(missing)"}
            </Text>
            <Text style={styles.infoText}>
              kakao_key_hash: {runtimeInfo.kakaoKeyHash || "(missing)"}
            </Text>
            <Text style={styles.infoText}>devtools: {runtimeInfo.devtools || "(off)"}</Text>
          </View>

          <View style={styles.actions}>
            <Text style={styles.actionsTitle}>DEV ACTIONS (guardian)</Text>
            <Pressable
              style={[styles.actionBtn, busySeed && styles.actionBtnDisabled]}
              onPress={seedCareRequest}
              disabled={busySeed}
            >
              <Text style={styles.actionBtnText}>
                {busySeed ? "생성 중…" : "DEV: 간병요청(공고) 1개 생성"}
              </Text>
            </Pressable>
            <Text style={styles.actionsHint}>
              - WebView가 죽어도 매칭 레일(/care-requests → caregiver /jobs → apply → /my/matches)을
              살리기 위한 DEV 우회 버튼입니다.
            </Text>
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
  hbtnDanger: { backgroundColor: "#7F1D1D" },
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
  actions: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
    gap: 10,
  },
  actionsTitle: { color: "#fff", fontSize: 12, fontWeight: "900" },
  actionBtn: {
    backgroundColor: "#10B981",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionBtnDisabled: { opacity: 0.6 },
  actionBtnText: { color: "#04100B", fontWeight: "900" },
  actionsHint: { color: "rgba(255,255,255,0.65)", fontSize: 12, lineHeight: 16 },
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

