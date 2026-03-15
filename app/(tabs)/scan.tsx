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
      Alert.alert("Permisiune necesară", "Trebuie să permiți accesul la cameră.");
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
      Alert.alert("Eroare", "Camera nu este gata.");
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
      Alert.alert("Eroare", "Camera nu este gata.");
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
            : "Nu am putut analiza poza.";
        throw new Error(detail);
      }

      setResult(data.result);
    } catch (error: any) {
      Alert.alert(
        "Eroare analiză",
        error?.message || "Nu am putut analiza poza."
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
      ? "Pune telefonul pe un suport. Stai drept la 2–3m. Trebuie să se vadă capul, trunchiul și bazinul."
      : "Pune telefonul pe un suport. Stai complet din profil la 2–3m. Trebuie să se vadă urechea, umărul, șoldul, genunchiul și glezna.";

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
              <Text style={styles.placeholderText}>Camera inactivă</Text>
            </View>
          )}

          <View style={styles.topRow}>
            <TouchableOpacity style={styles.smallBtn} onPress={toggleFacing}>
              <Text style={styles.smallBtnText}>
                {facing === "back" ? "🔄 Față" : "🔄 Spate"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomBar}>
            <Text style={styles.bottomBarText}>
              Mod: {viewMode === "front" ? "Frontal" : "Lateral"}
            </Text>
          </View>
        </View>

        <Card style={{ marginTop: 16 }}>
          <Text style={styles.title}>Tip analiză</Text>

          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.toggle, viewMode === "front" && styles.toggleActive]}
              onPress={() => setViewMode("front")}
            >
              <Text style={styles.toggleText}>Frontal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggle, viewMode === "side" && styles.toggleActive]}
              onPress={() => setViewMode("side")}
            >
              <Text style={styles.toggleText}>Lateral</Text>
            </TouchableOpacity>
          </View>

          {viewMode === "side" && (
            <>
              <Text style={[styles.title, { marginTop: 12 }]}>
                Partea fotografiată
              </Text>

              <View style={styles.row}>
                <TouchableOpacity
                  style={[styles.toggle, sideHint === "left" && styles.toggleActive]}
                  onPress={() => setSideHint("left")}
                >
                  <Text style={styles.toggleText}>Stânga</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.toggle, sideHint === "right" && styles.toggleActive]}
                  onPress={() => setSideHint("right")}
                >
                  <Text style={styles.toggleText}>Dreapta</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          <Text style={[styles.title, { marginTop: 12 }]}>Timer captură</Text>

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
                ? `Captură în ${countdown}...`
                : loading
                ? "Analizez..."
                : "📸 Capturează și analizează"
            }
            onPress={startCountdownAndCapture}
            color={C.blue}
            style={{ marginTop: 14 }}
          />

          <Text style={styles.helperText}>
            Nu ține telefonul în mână pentru analiza completă. Pune-l sprijinit
            și folosește timerul.
          </Text>

          {loading && (
            <View style={{ marginTop: 12, alignItems: "center" }}>
              <ActivityIndicator />
              <Text style={{ color: C.textMuted, marginTop: 8 }}>
                Trimit imaginea la server...
              </Text>
            </View>
          )}
        </Card>

        {result && (
          <Card style={{ marginTop: 10 }}>
            <Text style={styles.title}>Rezultat</Text>

            <Text style={styles.summary}>{result.summary}</Text>

            <Text style={styles.metric}>
              Corp suficient de vizibil: {result.body_visible_enough ? "da" : "nu"}
            </Text>
            <Text style={styles.metric}>
              Vedere detectată: {result.view_detected}
            </Text>
            <Text style={styles.metric}>
              Umeri: {result.shoulder_alignment}
            </Text>
            <Text style={styles.metric}>
              Bazin: {result.hip_alignment}
            </Text>
            <Text style={styles.metric}>
              Cap înainte: {result.forward_head}
            </Text>
            <Text style={styles.metric}>
              Rotunjire toracică: {result.thoracic_rounding}
            </Text>
            <Text style={styles.metric}>
              Înclinare pelvis: {result.pelvic_tilt}
            </Text>
            <Text style={styles.metric}>
              Swayback: {result.swayback_pattern}
            </Text>
            <Text style={styles.metric}>
              Confidence: {result.confidence.toFixed(2)}
            </Text>

            <Text style={styles.disclaimer}>{result.user_guidance}</Text>

            <Text style={[styles.title, { marginTop: 12 }]}>Sfaturi</Text>
            {result.posture_tips?.map((tip, index) => (
              <Text key={index} style={styles.metric}>
                • {tip}
              </Text>
            ))}

            <Text style={[styles.title, { marginTop: 12 }]}>
              Exerciții recomandate
            </Text>
            {result.recommended_exercises?.map((exercise, index) => (
              <View key={index} style={styles.exerciseItem}>
                <Text style={styles.exerciseTitle}>{exercise.title}</Text>
                <Text style={styles.exerciseReason}>{exercise.reason}</Text>
              </View>
            ))}

            <Text style={styles.disclaimer}>{result.medical_disclaimer}</Text>

            {result.recommended_region !== "none" && (
              <Button
                label="🗺️ Mergi la Body Map"
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

  exerciseTitle: {
    color: C.text,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 4,
  },

  exerciseReason: {
    color: C.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
});
