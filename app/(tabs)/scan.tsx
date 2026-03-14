import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { C } from "../../src/utils/colors";
import { useAppStore } from "../../src/store/useAppStore";
import { Card, Button } from "../../src/components/UI";

type Facing = "back" | "front";
type ViewMode = "front" | "side";
type SideHint = "left" | "right";

type ApiResult = {
  view: "front" | "side";
  summary: string;
  scores: Record<string, number>;
  labels: Record<string, string>;
  metrics: Record<string, number>;
  recommended_region: "shoulder" | "upper_back" | "lower_back" | "hip";
  medical_disclaimer: string;
};

const API_BASE_URL = "http://172.20.10.3:800"; // <--  IP

export default function ScanScreen() {
  const router = useRouter();
  const cameraRef = useRef<any>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<Facing>("back");
  const [viewMode, setViewMode] = useState<ViewMode>("front");
  const [sideHint, setSideHint] = useState<SideHint>("left");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResult | null>(null);

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

  const takeAndAnalyze = async () => {
    const ok = await ensurePermission();
    if (!ok) return;

    if (!cameraRef.current) {
      Alert.alert("Eroare", "Camera nu este gata.");
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        skipProcessing: false,
      });

      const formData = new FormData();
      formData.append("view", viewMode);
      formData.append("side_hint", sideHint);
      formData.append("image", {
        uri: photo.uri,
        name: "posture.jpg",
        type: "image/jpeg",
      } as any);

      const response = await fetch(`${API_BASE_URL}/analyze-posture`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detail || "Analiza a eșuat.");
      }

      setResult(data.result);
    } catch (error: any) {
      Alert.alert("Eroare analiză", error?.message || "Nu am putut analiza poza.");
    } finally {
      setLoading(false);
    }
  };

  const acceptRegion = () => {
    if (!result) return;
    setSelectedRegion(result.recommended_region);
    router.push("/");
  };

  return (
    <View style={styles.root}>
      <View style={styles.cameraBox}>
        {permission?.granted ? (
          <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} />
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
            <Text style={[styles.title, { marginTop: 12 }]}>Partea fotografiată</Text>
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

        <Button
          label={loading ? "Analizez..." : "📸 Fă poză și analizează"}
          onPress={takeAndAnalyze}
          color={C.blue}
          style={{ marginTop: 14 }}
        />

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

          {result.view === "front" ? (
            <>
              <Text style={styles.metric}>Umeri: {result.labels.shoulder_asymmetry}</Text>
              <Text style={styles.metric}>Bazin: {result.labels.hip_asymmetry}</Text>
              <Text style={styles.metric}>Deviație trunchi: {result.labels.trunk_shift}</Text>
            </>
          ) : (
            <>
              <Text style={styles.metric}>Cap înainte: {result.labels.forward_head}</Text>
              <Text style={styles.metric}>Rotunjire toracică: {result.labels.thoracic_rounding}</Text>
              <Text style={styles.metric}>Înclinare pelvis: {result.labels.anterior_pelvic_tilt}</Text>
              <Text style={styles.metric}>Pattern swayback: {result.labels.swayback_pattern}</Text>
            </>
          )}

          <Text style={styles.disclaimer}>{result.medical_disclaimer}</Text>

          <Button
            label="🗺️ Mergi la Body Map"
            onPress={acceptRegion}
            style={{ marginTop: 10 }}
          />
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg, padding: 16 },

  cameraBox: {
    height: 320,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#000",
    position: "relative",
  },

  cameraPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  placeholderText: { color: C.textMuted, fontSize: 13 },

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
});