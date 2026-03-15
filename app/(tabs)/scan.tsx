import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { C } from "../../src/utils/colors";
import { useAppStore } from "../../src/store/useAppStore";
import { Card, Button } from "../../src/components/UI";
import type { BodyRegionId } from "../../src/types";

type Facing = "back" | "front";
type ViewMode = "front" | "side";
type SideHint = "left" | "right";

type ApiResult = {
  view_detected: "front" | "side" | "unclear";
  body_visible_enough: boolean;
  shoulder_alignment:
    | "good"
    | "mild_asymmetry"
    | "moderate_asymmetry"
    | "severe_asymmetry"
    | "unclear";
  hip_alignment:
    | "good"
    | "mild_asymmetry"
    | "moderate_asymmetry"
    | "severe_asymmetry"
    | "unclear";
  forward_head: "none" | "mild" | "moderate" | "severe" | "unclear";
  thoracic_rounding: "none" | "mild" | "moderate" | "severe" | "unclear";
  pelvic_tilt:
    | "neutral"
    | "mild_anterior"
    | "moderate_anterior"
    | "severe_anterior"
    | "mild_posterior"
    | "unclear";
  swayback_pattern: "none" | "mild" | "moderate" | "severe" | "unclear";
  confidence: number;
  summary: string;
  recommended_region: "shoulder" | "upper_back" | "lower_back" | "hip" | "none";
  user_guidance: string;
  posture_tips: string[];
  recommended_exercises: { title: string; reason: string }[];
  medical_disclaimer: string;
};

const API_BASE_URL = "http://172.20.10.3:8000";

export default function ScanScreen() {
  const router = useRouter();
  const cameraRef = useRef<any>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<Facing>("back");
  const [viewMode, setViewMode] = useState<ViewMode>("front");
  const [sideHint, setSideHint] = useState<SideHint>("left");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [timerSeconds, setTimerSeconds] = useState<3 | 5>(3);

  const { setSelectedRegion } = useAppStore();

  const ensurePermission = async () => {
    if (permission?.granted) return true;

    const response = await requestPermission();
    if (!response.granted) {
      Alert.alert("Permission required", "Camera access is needed to scan your posture.");
      return false;
    }

    return true;
  };

  const toggleFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  const startCountdownAndCapture = async () => {
    const ok = await ensurePermission();
    if (!ok) return;

    if (!cameraRef.current) {
      Alert.alert("Error", "Camera is not ready.");
      return;
    }

    setResult(null);

    let current = timerSeconds;
    setCountdown(current);

    const interval = setInterval(() => {
      current -= 1;
      if (current > 0) {
        setCountdown(current);
      } else {
        clearInterval(interval);
        setCountdown(null);
        void takeAndAnalyze();
      }
    }, 1000);
  };

  const takeAndAnalyze = async () => {
    if (!cameraRef.current) {
      Alert.alert("Error", "Camera is not ready.");
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      });

      const formData = new FormData();
      formData.append("view", viewMode);
      formData.append("side_hint", sideHint);
      formData.append(
        "image",
        {
          uri: photo.uri,
          name: "posture.jpg",
          type: "image/jpeg",
        } as any
      );

      const response = await fetch(`${API_BASE_URL}/analyze-posture`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        const detail =
          typeof data?.detail === "string"
            ? data.detail
            : "Could not analyze the photo.";
        throw new Error(detail);
      }

      setResult(data.result);
    } catch (error: any) {
      Alert.alert(
        "Analysis error",
        error?.message || "Could not analyze the photo."
      );
    } finally {
      setLoading(false);
    }
  };

  const acceptRegion = () => {
    if (!result) return;
    if (result.recommended_region === "none") return;

    setSelectedRegion(result.recommended_region as BodyRegionId);


    router.push("/");
  };



  const instructions =
    viewMode === "front"
      ? "Place the phone on a stand. Stand straight 2–3 m away. Head, torso and hips must be fully visible."
      : "Place the phone on a stand. Stand completely sideways 2–3 m away. Ear, shoulder, hip, knee and ankle must be visible.";



  // Maps AI-returned exercise titles → local exercise IDs for deep linking
  const findExerciseId = (title: string): string | null => {
    const t = title.toLowerCase();
    if (t.includes("chin") || t.includes("tuck"))           return "ex_chin_tucks";
    if (t.includes("wall angel"))                           return "ex_wall_angels";
    if (t.includes("cat") && t.includes("cow"))             return "ex_cat_cow";
    if (t.includes("child"))                                return "ex_child_pose";
    if (t.includes("dead bug"))                             return "ex_dead_bug";
    if (t.includes("glute bridge") || t.includes("bridge")) return "ex_glute_bridge";
    if (t.includes("clamshell"))                            return "ex_clamshell";
    if (t.includes("piriformis"))                           return "ex_piriformis_stretch";
    if (t.includes("figure"))                               return "ex_figure4";
    if (t.includes("hamstring"))                            return "ex_hamstring_stretch";
    if (t.includes("calf"))                                 return "ex_calf_stretch";
    if (t.includes("doorway") || (t.includes("chest") && t.includes("stretch")))
                                                            return "ex_doorway_chest";
    if (t.includes("trap") || t.includes("trapez"))         return "ex_upper_trap_stretch";
    if (t.includes("levator"))                              return "ex_levator_stretch";
    return null;
  };

  const openSpecialistSearch = () => {
    const query =
      result?.recommended_region === "lower_back"
        ? "physiotherapist posture lower back pain"
        : result?.recommended_region === "upper_back"
        ? "physiotherapist posture upper back pain"
        : result?.recommended_region === "shoulder"
        ? "physiotherapist shoulder posture pain"
        : result?.recommended_region === "hip"
        ? "physiotherapist hip posture pain"
        : "physiotherapist posture assessment";

    router.push({
      pathname: "/specialists",
      params: { specialistQuery: query },
    });
  };    

      
  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cameraBox}>
          {permission?.granted ? (
            <>
              <CameraView
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                facing={facing}
              />

              <View style={styles.guideOverlay}>
                <View style={styles.guideFrame} />
                <Text style={styles.guideText}>{instructions}</Text>
              </View>

              {countdown !== null && (
                <View style={styles.countdownOverlay}>
                  <Text style={styles.countdownText}>{countdown}</Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.cameraPlaceholder}>
              <Text style={{ fontSize: 40 }}>📷</Text>
              <Text style={styles.placeholderText}>Camera inactive</Text>
            </View>
          )}

          <View style={styles.topRow}>
            <TouchableOpacity style={styles.smallBtn} onPress={toggleFacing}>
              <Text style={styles.smallBtnText}>
                {facing === "back" ? "🔄 Front" : "🔄 Back"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomBar}>
            <Text style={styles.bottomBarText}>
              Mode: {viewMode === "front" ? "Front" : "Side"}
            </Text>
          </View>
        </View>

        <Card style={{ marginTop: 16 }}>
          <Text style={styles.title}>Analysis type</Text>

          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.toggle, viewMode === "front" && styles.toggleActive]}
              onPress={() => setViewMode("front")}
            >
              <Text style={styles.toggleText}>Front</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggle, viewMode === "side" && styles.toggleActive]}
              onPress={() => setViewMode("side")}
            >
              <Text style={styles.toggleText}>Side</Text>
            </TouchableOpacity>
          </View>

          {viewMode === "side" && (
            <>
              <Text style={[styles.title, { marginTop: 12 }]}>
                Side photographed
              </Text>

              <View style={styles.row}>
                <TouchableOpacity
                  style={[styles.toggle, sideHint === "left" && styles.toggleActive]}
                  onPress={() => setSideHint("left")}
                >
                  <Text style={styles.toggleText}>Left</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.toggle, sideHint === "right" && styles.toggleActive]}
                  onPress={() => setSideHint("right")}
                >
                  <Text style={styles.toggleText}>Right</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          <Text style={[styles.title, { marginTop: 12 }]}>Capture timer</Text>

          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.toggle, timerSeconds === 3 && styles.toggleActive]}
              onPress={() => setTimerSeconds(3)}
            >
              <Text style={styles.toggleText}>3 sec</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggle, timerSeconds === 5 && styles.toggleActive]}
              onPress={() => setTimerSeconds(5)}
            >
              <Text style={styles.toggleText}>5 sec</Text>
            </TouchableOpacity>
          </View>

          <Button
            label={
              countdown !== null
                ? `Capturing in ${countdown}...`
                : loading
                ? "Analyzing..."
                : "📸 Capture & Analyze"
            }
            onPress={startCountdownAndCapture}
            color={C.blue}
            style={{ marginTop: 14 }}
          />

          <Text style={styles.helperText}>
            Don't hold the phone while scanning. Place it on a surface and use
            the timer for the best results.
          </Text>

          {loading && (
            <View style={{ marginTop: 12, alignItems: "center" }}>
              <ActivityIndicator />
              <Text style={{ color: C.textMuted, marginTop: 8 }}>
                Sending image to server...
              </Text>
            </View>
          )}
        </Card>

        {result && (
          <Card style={{ marginTop: 10 }}>
            <Text style={styles.title}>Results</Text>

            <Text style={styles.summary}>{result.summary}</Text>

            <Text style={styles.metric}>
              Body visible enough: {result.body_visible_enough ? "yes" : "no"}
            </Text>
            <Text style={styles.metric}>
              View detected: {result.view_detected}
            </Text>
            <Text style={styles.metric}>
              Shoulders: {result.shoulder_alignment}
            </Text>
            <Text style={styles.metric}>
              Hips: {result.hip_alignment}
            </Text>
            <Text style={styles.metric}>
              Forward head: {result.forward_head}
            </Text>
            <Text style={styles.metric}>
              Thoracic rounding: {result.thoracic_rounding}
            </Text>
            <Text style={styles.metric}>
              Pelvic tilt: {result.pelvic_tilt}
            </Text>
            <Text style={styles.metric}>
              Swayback: {result.swayback_pattern}
            </Text>
            <Text style={styles.metric}>
              Confidence: {result.confidence.toFixed(2)}
            </Text>

            <Text style={styles.disclaimer}>{result.user_guidance}</Text>

            <Text style={[styles.title, { marginTop: 12 }]}>Tips</Text>
            {result.posture_tips?.map((tip, index) => (
              <Text key={index} style={styles.metric}>
                • {tip}
              </Text>
            ))}

            <Text style={[styles.title, { marginTop: 12 }]}>
              Recommended exercises
            </Text>
            {result.recommended_exercises?.map((exercise, index) => {
              const exId = findExerciseId(exercise.title);
              return (
                <View key={index} style={styles.exerciseItem}>
                  <View style={styles.exerciseHeader}>
                    <Text style={styles.exerciseTitle}>{exercise.title}</Text>
                    {exId && (
                      <TouchableOpacity
                        onPress={() => router.push(`/exercise/${exId}`)}
                        style={styles.exerciseStartBtn}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.exerciseStartText}>Start ▶</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={styles.exerciseReason}>{exercise.reason}</Text>
                  {!exId && (
                    <TouchableOpacity
                      onPress={() => router.push("/exercises")}
                      style={[styles.exerciseStartBtn, { alignSelf: "flex-start", marginTop: 8 }]}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.exerciseStartText}>Browse exercises ▶</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}



          <View style={styles.specialistCard}>
              <View style={styles.specialistHeader}>
                <Text style={styles.specialistBadge}>SPECIALIST SUPPORT</Text>
                <Text style={styles.specialistTitle}>
                  Need professional guidance?
                </Text>
                <Text style={styles.specialistText}>
                  This posture screening is educational, not diagnostic. If your pain
                  persists, gets worse, radiates, or affects movement, it is safer to
                  consult a licensed physiotherapist or posture specialist.
                </Text>
              </View>

              <View style={styles.specialistWarningBox}>
                <Text style={styles.specialistWarningTitle}>
                  Consider seeing a specialist if you have:
                </Text>
                <Text style={styles.specialistBullet}>• pain lasting more than 2–6 weeks</Text>
                <Text style={styles.specialistBullet}>• numbness, tingling, or weakness</Text>
                <Text style={styles.specialistBullet}>• pain spreading into arm or leg</Text>
                <Text style={styles.specialistBullet}>• strong asymmetry or worsening posture</Text>
                <Text style={styles.specialistBullet}>• pain that limits training or daily activities</Text>
              </View>

              <View style={styles.specialistActions}>
                <TouchableOpacity
                  style={styles.secondaryActionBtn}
                  activeOpacity={0.85}
                  onPress={openSpecialistSearch}
                >
                  <Text style={styles.secondaryActionText}>Find a specialist</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.primaryActionBtn}
                  activeOpacity={0.85}
                  onPress={() => router.push("/exercises")}
                >
                  <Text style={styles.primaryActionText}>Continue with recovery</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.disclaimer}>{result.medical_disclaimer}</Text>

            {result.recommended_region !== "none" && (
              <Button
                label="🗺️ Go to Body Map"
                onPress={acceptRegion}
                style={{ marginTop: 10 }}
              />
            )}
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
    padding: 16,
  },

  scrollContent: {
    paddingBottom: 120,
  },

  cameraBox: {
    height: 420,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#000",
    position: "relative",
  },

  guideOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    pointerEvents: "none",
  },

  guideFrame: {
    width: "72%",
    height: "78%",
    borderWidth: 3,
    borderColor: "#22C55E",
    borderRadius: 20,
    backgroundColor: "transparent",
  },

  guideText: {
    position: "absolute",
    bottom: 52,
    left: 16,
    right: 16,
    color: "#fff",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
  },

  countdownOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.18)",
  },

  countdownText: {
    color: "#fff",
    fontSize: 64,
    fontWeight: "800",
  },

  cameraPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  placeholderText: {
    color: C.textMuted,
    fontSize: 13,
  },

  topRow: {
    position: "absolute",
    top: 12,
    right: 12,
  },

  smallBtn: {
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },

  smallBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 10,
  },

  bottomBarText: {
    color: "#fff",
    fontSize: 12,
  },

  title: {
    fontSize: 14,
    fontWeight: "700",
    color: C.text,
    marginBottom: 8,
  },

  row: {
    flexDirection: "row",
    gap: 10,
  },

  toggle: {
    flex: 1,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },

  toggleActive: {
    backgroundColor: C.blue + "22",
    borderColor: C.blue,
  },

  toggleText: {
    color: C.text,
    fontWeight: "700",
  },

  helperText: {
    marginTop: 10,
    color: C.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },

  summary: {
    color: C.text,
    marginBottom: 10,
    lineHeight: 20,
  },

  metric: {
    color: C.textMuted,
    fontSize: 12,
    marginBottom: 6,
  },

  disclaimer: {
    marginTop: 10,
    color: C.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },

  exerciseItem: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },

  exerciseHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
    gap: 8,
  },

  exerciseTitle: {
    flex: 1,
    color: C.text,
    fontSize: 13,
    fontWeight: "700",
  },

  exerciseStartBtn: {
    backgroundColor: C.accent,
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 12,
    alignSelf: "center",
  },

  exerciseStartText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
  },

  exerciseReason: {
    color: C.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },


    specialistCard: {
    marginTop: 16,
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: C.blue + "55",
    borderRadius: 18,
    padding: 14,
  },

  specialistHeader: {
    marginBottom: 12,
  },

  specialistBadge: {
    alignSelf: "flex-start",
    backgroundColor: C.blue + "22",
    color: C.blue,
    borderWidth: 1,
    borderColor: C.blue + "55",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.6,
    marginBottom: 8,
  },

  specialistTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 6,
  },

  specialistText: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 12,
    lineHeight: 19,
  },

  specialistWarningBox: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },

  specialistWarningTitle: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
  },

  specialistBullet: {
    color: "rgba(255,255,255,0.74)",
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 4,
  },

  specialistActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },

  secondaryActionBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: C.blue + "66",
  },

  secondaryActionText: {
    color: C.blue,
    fontSize: 12,
    fontWeight: "800",
  },

  primaryActionBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.blue,
  },

  primaryActionText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
  },

});
