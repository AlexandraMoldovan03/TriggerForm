import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { C } from "../../utils/colors";
import type { SeverityEmoji, ExerciseType } from "../../types";


// ─── Severity Badge ───────────────────────────────────────────────
interface SeverityBadgeProps { emoji: SeverityEmoji }
export function SeverityBadge({ emoji }: SeverityBadgeProps) {
  const color =
    emoji === "🔴" ? C.accent :
    emoji === "🟠" ? C.amber  :
    emoji === "🟡" ? "#EAB308" : C.green;
  const label =
    emoji === "🔴" ? "Sever" :
    emoji === "🟠" ? "Moderat" :
    emoji === "🟡" ? "Ușor-Mod." : "Ușor";

  return (
    <View style={[styles.badge, { backgroundColor: color + "22", borderColor: color + "55" }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

// ─── Exercise Type Badge ──────────────────────────────────────────
interface TypeBadgeProps { type: ExerciseType }
export function TypeBadge({ type }: TypeBadgeProps) {
  const map: Record<ExerciseType, { c: string; l: string }> = {
    massage:  { c: C.accent, l: "Masaj" },
    stretch:  { c: C.teal,   l: "Stretching" },
    mobility: { c: C.blue,   l: "Mobilitate" },
  };
  const { c, l } = map[type];
  return (
    <View style={[styles.badge, { backgroundColor: c + "22", borderColor: c + "44" }]}>
      <Text style={[styles.badgeText, { color: c }]}>{l}</Text>
    </View>
  );
}

// ─── Section Card ─────────────────────────────────────────────────
interface CardProps { children: React.ReactNode; style?: object }
export function Card({ children, style }: CardProps) {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
}

// ─── Primary Button ───────────────────────────────────────────────
interface ButtonProps {
  label: string;
  onPress: () => void;
  color?: string;
  style?: object;
}
export function Button({ label, onPress, color = C.accent, style }: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.button, { backgroundColor: color }, style]}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Severity Dots ────────────────────────────────────────────────
interface SeverityDotsProps { severity: 1 | 2 | 3 }
export function SeverityDots({ severity }: SeverityDotsProps) {
  return (
    <View style={{ flexDirection: "row", gap: 4 }}>
      {[1, 2, 3].map((i) => (
        <View
          key={i}
          style={{
            width: 7, height: 7, borderRadius: 99,
            backgroundColor: i <= severity ? C.accent : C.textDim,
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 99,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  card: {
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 12,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
});
