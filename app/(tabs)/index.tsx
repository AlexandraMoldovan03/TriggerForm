import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";

import { C } from "../../src/utils/colors";
import { useAppStore } from "../../src/store/useAppStore";
import { TRIGGER_POINTS, REGIONS } from "../../src/data";
import {
  BodySVG,
  RegionList,
  BodyViewTabs,
} from "../../src/components/BodyMap";
import { Card, SeverityDots } from "../../src/components/UI";
import type { BodyRegionId, BodyView } from "../../src/types";

export default function HomeScreen() {
  const router = useRouter();
  const [selectedView, setSelectedView] = useState<BodyView>("back");

  const {
    selectedRegion,
    painLevel,
    selectedTP,
    setSelectedRegion,
    setPainLevel,
    setSelectedTP,
  } = useAppStore();

  const regionData = REGIONS.find((r) => r.id === selectedRegion);

  const tps = selectedRegion
    ? TRIGGER_POINTS.filter(
        (tp) => tp.regionId === selectedRegion && tp.view === selectedView
      )
    : [];

  const painColor =
    painLevel >= 7 ? C.accent : painLevel >= 4 ? C.amber : C.green;

  const handleRegionSelect = (id: BodyRegionId) => {
    setSelectedRegion(id === selectedRegion ? null : id);
    setSelectedTP(null);
  };

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.headerCard}>
          <Text style={styles.headerSub}>Bun venit înapoi</Text>
          <Text style={styles.headerTitle}>Unde simți durere?</Text>
          <Text style={styles.headerHint}>
            Selectează zona corpului și vezi trigger points-urile probabile
          </Text>
        </Card>

        <Card>
          <BodyViewTabs
            selectedView={selectedView}
            onChangeView={(view) => {
              if (view !== "front" && view !== "back") return;
              setSelectedView(view);
              setSelectedRegion(null);
              setSelectedTP(null);
            }}
          />

          <View style={styles.mapRow}>
            <View style={styles.svgWrapper}>
              <BodySVG
                selectedRegion={selectedRegion}
                onSelectRegion={handleRegionSelect}
                selectedView={selectedView}
              />
            </View>

            <View style={styles.regionListWrapper}>
              <RegionList
                selectedRegion={selectedRegion}
                onSelect={handleRegionSelect}
                selectedView={selectedView}
              />
            </View>
          </View>
        </Card>

        {selectedRegion && (
          <Card>
            <View style={styles.painRow}>
              <Text style={styles.cardTitle}>Intensitate durere</Text>
              <Text style={[styles.painValue, { color: painColor }]}>
                {painLevel}
                <Text style={styles.painMax}>/10</Text>
              </Text>
            </View>

            <Slider
              style={{ width: "100%", height: 36 }}
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={painLevel}
              onValueChange={setPainLevel}
              minimumTrackTintColor={painColor}
              maximumTrackTintColor={C.border}
              thumbTintColor={painColor}
            />

            <View style={styles.painLabels}>
              <Text style={[styles.painLabel, { color: C.green }]}>
                Ușoară
              </Text>
              <Text style={[styles.painLabel, { color: C.amber }]}>
                Moderată
              </Text>
              <Text style={[styles.painLabel, { color: C.accent }]}>
                Severă
              </Text>
            </View>
          </Card>
        )}

        {tps.length > 0 && (
          <Card>
            <Text style={styles.cardTitle}>
              Trigger points — {regionData?.label}
            </Text>

            {tps.map((tp) => {
              const isOpen = selectedTP?.id === tp.id;

              return (
                <TouchableOpacity
                  key={tp.id}
                  onPress={() => setSelectedTP(isOpen ? null : tp)}
                  activeOpacity={0.85}
                  style={[styles.tpItem, isOpen && styles.tpItemOpen]}
                >
                  <View style={styles.tpHeader}>
                    <View style={styles.tpTextBlock}>
                      <Text style={styles.tpName}>{tp.label}</Text>
                      <Text style={styles.tpMuscle}>{tp.muscle}</Text>
                    </View>

                    <SeverityDots severity={tp.severity} />
                  </View>

                  {isOpen && (
                    <View style={styles.tpDetails}>
                      <Text style={styles.tpSectionLabel}>Durere iradiată</Text>
                      <Text style={styles.tpReferred}>
                        {tp.painReferral.join(", ")}
                      </Text>

                      <Text style={[styles.tpSectionLabel, { marginTop: 8 }]}>
                        Simptome frecvente
                      </Text>
                      <Text style={styles.tpReferred}>
                        {tp.symptoms.join(", ")}
                      </Text>

                      <TouchableOpacity
                        onPress={() => router.push("/exercises")}
                        style={styles.tpButton}
                      >
                        <Text style={styles.tpButtonText}>
                          Vezi exerciții →
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </Card>
        )}

        <View style={styles.quickRow}>
          <TouchableOpacity
            onPress={() => router.push("/scan")}
            style={[styles.quickCard, { backgroundColor: C.blue }]}
            activeOpacity={0.85}
          >
            <Text style={styles.quickIcon}>📷</Text>
            <Text style={styles.quickTitle}>Scanează corp</Text>
            <Text style={styles.quickSub}>Analiză AI pentru postură</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/exercises")}
            style={[styles.quickCard, { backgroundColor: C.teal + "CC" }]}
            activeOpacity={0.85}
          >
            <Text style={styles.quickIcon}>🧘</Text>
            <Text style={styles.quickTitle}>Exerciții</Text>
            <Text style={styles.quickSub}>Stretching & mobilitate</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 28 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },

  scroll: {
    padding: 16,
    paddingBottom: 120,
  },

  headerCard: {
    marginBottom: 12,
    position: "relative",
    overflow: "hidden",
  },

  headerSub: {
    fontSize: 12,
    color: C.textMuted,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: C.text,
    marginBottom: 4,
  },

  headerHint: {
    fontSize: 13,
    color: C.textMuted,
    lineHeight: 18,
  },

  mapRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },

  svgWrapper: {
    width: 160,
    height: 300,
  },

  regionListWrapper: {
    flex: 1,
    maxHeight: 300,
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: C.text,
    marginBottom: 10,
  },

  painRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  painValue: {
    fontSize: 24,
    fontWeight: "900",
  },

  painMax: {
    fontSize: 14,
    color: C.textMuted,
  },

  painLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },

  painLabel: {
    fontSize: 10,
  },

  tpItem: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },

  tpItemOpen: {
    backgroundColor: C.accent + "18",
    borderColor: C.accent + "55",
  },

  tpHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  tpTextBlock: {
    flex: 1,
    paddingRight: 10,
  },

  tpName: {
    fontSize: 13,
    fontWeight: "700",
    color: C.text,
  },

  tpMuscle: {
    fontSize: 11,
    color: C.textMuted,
    marginTop: 2,
  },

  tpDetails: {
    borderTopWidth: 1,
    borderTopColor: C.border,
    marginTop: 10,
    paddingTop: 10,
  },

  tpSectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: C.accentSoft,
    marginBottom: 4,
  },

  tpReferred: {
    fontSize: 11,
    color: C.textMuted,
    lineHeight: 17,
  },

  tpButton: {
    backgroundColor: C.accent,
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 14,
    alignSelf: "flex-start",
    marginTop: 12,
  },

  tpButtonText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },

  quickRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },

  quickCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    gap: 6,
  },

  quickIcon: {
    fontSize: 24,
  },

  quickTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#fff",
  },

  quickSub: {
    fontSize: 10,
    color: "rgba(255,255,255,0.78)",
    lineHeight: 14,
  },
});
