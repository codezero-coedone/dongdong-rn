import React from "react";
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type AppLocale = "ko" | "en";

type Props = {
  visible: boolean;
  value: AppLocale;
  onClose: () => void;
  onSelect: (v: AppLocale) => void;
};

export function LanguagePickerModal({ visible, value, onClose, onSelect }: Props) {
  const Row = ({ v, label }: { v: AppLocale; label: string }) => {
    const selected = value === v;
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => onSelect(v)}
        style={[styles.row, selected && styles.rowSelected]}
      >
        <Text style={[styles.rowText, selected && styles.rowTextSelected]}>{label}</Text>
        {selected ? <Text style={styles.check}>✓</Text> : <View style={{ width: 18 }} />}
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.sheetHandle} />
          <Text style={styles.title}>언어 선택</Text>
          <View style={{ height: 8 }} />
          <Row v="ko" label="한국어" />
          <Row v="en" label="English" />
          <View style={{ height: 10 }} />
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.9}>
            <Text style={styles.closeText}>닫기</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 24,
    paddingTop: 10,
    paddingHorizontal: 16,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D5DB",
    marginBottom: 12,
  },
  title: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  row: {
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    marginTop: 10,
  },
  rowSelected: {
    borderColor: "#0066FF",
    backgroundColor: "rgba(0,102,255,0.05)",
  },
  rowText: { fontSize: 16, fontWeight: "600", color: "#111827" },
  rowTextSelected: { color: "#0066FF" },
  check: { fontSize: 18, fontWeight: "900", color: "#0066FF" },
  closeBtn: {
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },
  closeText: { fontSize: 16, fontWeight: "700", color: "#111827" },
});

