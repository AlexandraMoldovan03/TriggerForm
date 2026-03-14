import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, Alert,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { C } from "../../src/utils/colors";
import { useAppStore } from "../../src/store/useAppStore";
import { Card, Button } from "../../src/components/UI";

type ScanStep = "idle" | "detecting" | "done";

export default function ScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [step, setStep] = useState<ScanStep>("idle");
  const { setSelectedRegion } = useAppStore();

  // Simulate detection flow
  const handleStart = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert("Permisiune necesară", "Aplicația are nevoie de acces la cameră.");
        return;
      }
    }
    setStep("detecting");
    setTimeout(() => setStep("done"), 2500); // simulate CV processing
  };

  const handleAccept = () => {
    setSelectedRegion("shoulder"); // → va fi înlocuit cu rezultatul real MediaPipe
    router.push("/");
  };

  const stepLabel: Record<ScanStep, string> = {
    idle:      "Apasă Start pentru a scana",
    detecting: "Detectare corp în curs...",
    done:      "Corp detectat! Zonă tensionată identificată",
  };

  return (
    <View style={styles.root}>
      {/* ── Camera / Preview ──────────────────────────────── */}
      <View style={styles.cameraBox}>
        {permission?.granted ? (
          <CameraView style={StyleSheet.absoluteFill} facing="back" />
        ) : (
          <View style={styles.cameraPlaceholder}>
            <Text style={{ fontSize: 40 }}>📷</Text>
            <Text style={styles.placeholderText}>Camera inactivă</Text>
          </View>
        )}

        {/* Corner brackets */}
        {(["tl", "tr", "bl", "br"] as const).map((pos) => (
          <View key={pos} style={[styles.corner, styles[pos]]} />
        ))}

        {/* Skeleton overlay (shown when detecting/done) */}
        {step !== "idle" && (
          <View style={styles.skeletonOverlay}>
            <Text style={styles.skeletonEmoji}>🦴</Text>
            <Text style={styles.skeletonLabel}>
              {step === "detecting" ? "Analizez…" : "✅ Detectat"}
            </Text>
          </View>
        )}

        {/* Status bar */}
        <View style={styles.statusBar}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor:
                  step === "idle" ? C.textMuted :
                  step === "detecting" ? C.amber : C.green,
              },
            ]}
          />
          <Text style={styles.statusText}>{stepLabel[step]}</Text>
        </View>
      </View>

      {/* ── Controls ──────────────────────────────────────── */}
      <Card style={{ marginTop: 16 }}>
        {step !== "done" ? (
          <Button
            label={step === "idle" ? "📷  Pornește Camera" : "🔍  Analizează…"}
            onPress={handleStart}
            color={step === "idle" ? C.blue : C.amber}
          />
        ) : (
          <>
            <View style={styles.resultBox}>
              <Text style={{ fontSize: 20 }}>✅</Text>
              <View>
                <Text style={styles.resultTitle}>Zonă detectată: Umăr stâng</Text>
                <Text style={styles.resultSub}>3 trigger points identificate</Text>
              </View>
            </View>
            <Button
              label="🗺️  Vezi pe Body Map"
              onPress={handleAccept}
              style={{ marginTop: 10 }}
            />
          </>
        )}
        {step !== "idle" && (
          <TouchableOpacity
            onPress={() => setStep("idle")}
            style={styles.resetBtn}
          >
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        )}
      </Card>

      {/* ── How it works ──────────────────────────────────── */}
      <Card style={{ marginTop: 4 }}>
        <Text style={styles.cardTitle}>Cum funcționează</Text>
        {[
          ["1", "Poziționează-te la 1–2m distanță de cameră", C.blue],
          ["2", "Atinge ușor zona dureroasă", C.amber],
          ["3", "App-ul detectează mușchii afectați", C.teal],
          ["4", "Primești recomandări personalizate", C.green],
        ].map(([step, text, color]) => (
          <View key={step} style={styles.stepRow}>
            <View style={[styles.stepBadge, { borderColor: color, backgroundColor: color + "22" }]}>
              <Text style={[styles.stepNum, { color }]}>{step}</Text>
            </View>
            <Text style={styles.stepText}>{text}</Text>
          </View>
        ))}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg, padding: 16 },

  cameraBox: {
    height: 300, borderRadius: 20, overflow: "hidden",
    backgroundColor: "#000", position: "relative",
    justifyContent: "center", alignItems: "center",
  },
  cameraPlaceholder: {
    flex: 1, justifyContent: "center", alignItems: "center", gap: 8,
  },
  placeholderText: { color: C.textMuted, fontSize: 13 },

  corner: {
    position: "absolute", width: 20, height: 20,
    borderColor: C.blue, borderWidth: 2,
  },
  tl: { top: 12, left: 12, borderRightWidth: 0, borderBottomWidth: 0 },
  tr: { top: 12, right: 12, borderLeftWidth: 0, borderBottomWidth: 0 },
  bl: { bottom: 40, left: 12, borderRightWidth: 0, borderTopWidth: 0 },
  br: { bottom: 40, right: 12, borderLeftWidth: 0, borderTopWidth: 0 },

  skeletonOverlay: {
    position: "absolute", alignItems: "center", justifyContent: "center", gap: 6,
  },
  skeletonEmoji: { fontSize: 60, opacity: 0.7 },
  skeletonLabel: { color: C.blue, fontWeight: "700", fontSize: 13 },

  statusBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: "rgba(0,0,0,0.75)",
    flexDirection: "row", alignItems: "center", gap: 8,
    padding: 10, paddingHorizontal: 14,
  },
  statusDot: { width: 8, height: 8, borderRadius: 99 },
  statusText: { color: C.text, fontSize: 12 },

  resultBox: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: C.green + "22", borderRadius: 12,
    padding: 12, borderWidth: 1, borderColor: C.green + "44",
  },
  resultTitle: { fontSize: 13, fontWeight: "700", color: C.green },
  resultSub:   { fontSize: 11, color: C.textMuted, marginTop: 2 },

  resetBtn:  { marginTop: 10, alignItems: "center", padding: 10 },
  resetText: { color: C.textMuted, fontSize: 13 },

  cardTitle: { fontSize: 14, fontWeight: "700", color: C.text, marginBottom: 12 },
  stepRow:   { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 10 },
  stepBadge: { width: 24, height: 24, borderRadius: 99, borderWidth: 1, justifyContent: "center", alignItems: "center" },
  stepNum:   { fontSize: 11, fontWeight: "900" },
  stepText:  { flex: 1, fontSize: 12, color: C.textMuted, lineHeight: 18 },
});
