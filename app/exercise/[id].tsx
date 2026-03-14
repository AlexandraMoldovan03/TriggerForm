import React, { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { C } from "../../src/utils/colors";
import { EXERCISES } from "../../src/data";
import { TypeBadge, Card, Button } from "../../src/components/UI";

const STEPS: Record<string, string[]> = {
  ex1: [
    "Pune mingea de tenis/lacrosse pe podea sau perete.",
    "Poziționează zona trapezului pe minge.",
    "Aplică presiune ușoară timp de 30–60 sec.",
    "Mișcă-te lent în lateral până găsești punctul tensionat.",
    "Menține presiunea și respiră adânc.",
  ],
  ex2: [
    "Stai drept pe un scaun sau în picioare.",
    "Înclină capul spre umărul drept.",
    "Cu mâna dreaptă, aplică presiune ușoară pe cap.",
    "Simți stretch-ul pe gâtul stâng — menține 30 sec.",
    "Repetă de cealaltă parte.",
  ],
  default: [
    "Pregătește spațiul și echipamentul necesar.",
    "Execută mișcarea lent și controlat.",
    "Menține poziția conform duratei indicate.",
    "Respiră uniform pe toată durata exercițiului.",
    "Repetă de 2–3 ori pentru rezultate optime.",
  ],
};

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [started, setStarted] = useState(false);

  const exercise = EXERCISES.find((e) => e.id === id);
  if (!exercise) {
    return (
      <View style={styles.root}>
        <Text style={{ color: C.text }}>Exercițiu negăsit.</Text>
      </View>
    );
  }

  const steps = STEPS[id] ?? STEPS.default;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scroll}>
      {/* ── Header card ─────────────────────────────────── */}
      <Card style={styles.headerCard}>
        <View style={styles.iconWrap}>
          <Text style={{ fontSize: 40 }}>{exercise.icon}</Text>
        </View>
        <Text style={styles.title}>{exercise.name}</Text>
        <View style={styles.badgeRow}>
          <TypeBadge type={exercise.type} />
          <View style={styles.metaChip}>
            <Text style={styles.metaText}>⏱ {exercise.duration}</Text>
          </View>
          <View style={styles.metaChip}>
            <Text style={styles.metaText}>{exercise.level}</Text>
          </View>
        </View>
      </Card>

      {/* ── Steps ───────────────────────────────────────── */}
      {!started ? (
        <Button
          label="▶  Începe exercițiul"
          onPress={() => setStarted(true)}
        />
      ) : (
        <Card>
          {/* Progress bar */}
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressLabel}>
            Pas {currentStep + 1} din {steps.length}
          </Text>

          {/* Current step */}
          <View style={styles.stepBox}>
            <Text style={styles.stepNum}>{currentStep + 1}</Text>
            <Text style={styles.stepText}>{steps[currentStep]}</Text>
          </View>

          {/* Navigation */}
          <View style={styles.navRow}>
            <TouchableOpacity
              disabled={currentStep === 0}
              onPress={() => setCurrentStep((s) => s - 1)}
              style={[styles.navBtn, currentStep === 0 && { opacity: 0.3 }]}
            >
              <Text style={styles.navBtnText}>← Înapoi</Text>
            </TouchableOpacity>

            {currentStep < steps.length - 1 ? (
              <TouchableOpacity
                onPress={() => setCurrentStep((s) => s + 1)}
                style={[styles.navBtn, styles.navBtnPrimary]}
              >
                <Text style={[styles.navBtnText, { color: "#fff" }]}>
                  Înainte →
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => router.back()}
                style={[styles.navBtn, { backgroundColor: C.green }]}
              >
                <Text style={[styles.navBtnText, { color: "#fff" }]}>
                  ✅ Finalizat!
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Card>
      )}

      {/* ── All steps preview ───────────────────────────── */}
      <Card>
        <Text style={styles.cardTitle}>Toți pașii</Text>
        {steps.map((s, i) => (
          <View
            key={i}
            style={[
              styles.allStepRow,
              i < steps.length - 1 && { borderBottomWidth: 1, borderBottomColor: C.border },
            ]}
          >
            <View
              style={[
                styles.allStepNum,
                started && i <= currentStep && { backgroundColor: C.accent },
              ]}
            >
              <Text style={styles.allStepNumText}>{i + 1}</Text>
            </View>
            <Text style={[styles.allStepText, started && i < currentStep && { opacity: 0.4 }]}>
              {s}
            </Text>
          </View>
        ))}
      </Card>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root:  { flex: 1, backgroundColor: C.bg },
  scroll:{ padding: 16 },

  headerCard: { alignItems: "center", marginBottom: 12 },
  iconWrap: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: C.accent + "22",
    justifyContent: "center", alignItems: "center", marginBottom: 10,
  },
  title:    { fontSize: 18, fontWeight: "800", color: C.text, textAlign: "center", marginBottom: 10 },
  badgeRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", justifyContent: "center" },
  metaChip: {
    backgroundColor: C.surface, borderRadius: 99,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: C.border,
  },
  metaText: { fontSize: 10, color: C.textMuted },

  progressBg:   { height: 4, backgroundColor: C.border, borderRadius: 99, marginBottom: 8 },
  progressFill: { height: 4, backgroundColor: C.accent, borderRadius: 99 },
  progressLabel:{ fontSize: 11, color: C.textMuted, marginBottom: 14 },

  stepBox: {
    backgroundColor: C.surface, borderRadius: 14, padding: 16,
    flexDirection: "row", gap: 12, alignItems: "flex-start", marginBottom: 16,
  },
  stepNum: {
    fontSize: 24, fontWeight: "900", color: C.accent, width: 28,
  },
  stepText: { flex: 1, fontSize: 14, color: C.text, lineHeight: 22 },

  navRow:        { flexDirection: "row", gap: 10 },
  navBtn:        {
    flex: 1, borderRadius: 10, paddingVertical: 11,
    alignItems: "center", backgroundColor: C.surface,
    borderWidth: 1, borderColor: C.border,
  },
  navBtnPrimary: { backgroundColor: C.accent, borderColor: C.accent },
  navBtnText:    { fontSize: 13, fontWeight: "700", color: C.textMuted },

  cardTitle: { fontSize: 14, fontWeight: "700", color: C.text, marginBottom: 12 },
  allStepRow:{ flexDirection: "row", gap: 10, paddingVertical: 10, alignItems: "flex-start" },
  allStepNum:{
    width: 24, height: 24, borderRadius: 99,
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    justifyContent: "center", alignItems: "center",
  },
  allStepNumText:{ fontSize: 11, fontWeight: "700", color: C.textMuted },
  allStepText:   { flex: 1, fontSize: 12, color: C.textMuted, lineHeight: 18 },
});
