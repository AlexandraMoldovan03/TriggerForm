import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Keyboard,
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
import { analyzePain } from "../../src/utils/painAnalysis";
import type { PainSuggestion } from "../../src/utils/painAnalysis";

// confidence badge colors
const CONFIDENCE_COLOR: Record<PainSuggestion["confidence"], string> = {
  high:   C.accent,
  medium: C.amber,
  low:    C.green,
};
const CONFIDENCE_LABEL: Record<PainSuggestion["confidence"], string> = {
  high:   "Probabil",
  medium: "Posibil",
  low:    "Mai puțin probabil",
};

export default function HomeScreen() {
  const router = useRouter();
  const [selectedView, setSelectedView] = useState<BodyView>("back");
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(null);

  const {
    selectedRegion,
    selectedSubRegion,
    painLevel,
    selectedTP,
    setSelectedRegion,
    setSelectedSubRegion,
    setPainLevel,
    setSelectedTP,
    painQuery,
    painSuggestions,
    isAnalyzing,
    setPainQuery,
    setPainSuggestions,
    setIsAnalyzing,
  } = useAppStore();

  // ── pain analysis handler ───────────────────────────────────────────────
  const handleAnalyze = async () => {
    if (!painQuery.trim()) return;
    Keyboard.dismiss();
    setIsAnalyzing(true);
    setPainSuggestions([]);
    try {
      const results = await analyzePain(painQuery);
      setPainSuggestions(results);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSuggestionTap = (s: PainSuggestion) => {
    setSelectedView(s.view);
    setSelectedRegion(s.regionId);
  };

  const regionData = REGIONS.find((r) => r.id === selectedRegion);

  // Filter TPs: by region + view, then optionally by sub-region
  const tps = selectedRegion
    ? TRIGGER_POINTS.filter(
        (tp) =>
          tp.regionId === selectedRegion &&
          tp.view === selectedView &&
          (selectedSubRegion === null || tp.subRegionId === selectedSubRegion)
      )
    : [];

  const painColor =
    painLevel >= 7 ? C.accent : painLevel >= 4 ? C.amber : C.green;

  const handleRegionSelect = (id: BodyRegionId) => {
    setSelectedRegion(id === selectedRegion ? null : id);
    setSelectedTP(null);
  };

  const subRegions = regionData?.subRegions ?? [];

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
            Descrie durerea sau selectează zona direct pe model
          </Text>
        </Card>

        {/* ── PAIN DESCRIPTION CARD ─────────────────────────────────────── */}
        <Card>
          <Text style={styles.cardTitle}>🔍 Descrie durerea</Text>
          <Text style={styles.searchHint}>
            Ex: "durere la genunchi", "gât blocat", "spate jos după stat jos"
          </Text>

          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              value={painQuery}
              onChangeText={setPainQuery}
              placeholder="Descrie unde și cum doare..."
              placeholderTextColor={C.textDim}
              returnKeyType="search"
              onSubmitEditing={handleAnalyze}
              multiline={false}
            />
            <TouchableOpacity
              onPress={handleAnalyze}
              style={[styles.searchBtn, isAnalyzing && { opacity: 0.6 }]}
              activeOpacity={0.8}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.searchBtnText}>Analizează</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* ── Suggestions ── */}
          {painSuggestions.length > 0 && (
            <View style={styles.suggestionsWrap}>
              <Text style={styles.suggestTitle}>
                Zone sugerate pentru masaj:
              </Text>
              {painSuggestions.map((s) => {
                const isExpanded = expandedSuggestion === s.regionId;
                const isActive = selectedRegion === s.regionId;
                const col = CONFIDENCE_COLOR[s.confidence];

                return (
                  <View
                    key={s.regionId}
                    style={[
                      styles.suggestionCard,
                      isActive && styles.suggestionCardActive,
                    ]}
                  >
                    {/* ── tap header: navigate to region ── */}
                    <TouchableOpacity
                      onPress={() => handleSuggestionTap(s)}
                      activeOpacity={0.8}
                      style={styles.suggestionHeaderRow}
                    >
                      <View style={styles.suggestionLeft}>
                        <View style={styles.suggestionTopRow}>
                          <Text style={styles.suggestionLabel}>{s.label}</Text>
                          <View
                            style={[
                              styles.confidenceBadge,
                              {
                                backgroundColor: col + "28",
                                borderColor: col + "66",
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.confidenceText,
                                { color: col },
                              ]}
                            >
                              {CONFIDENCE_LABEL[s.confidence]}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.suggestionReason}>{s.reason}</Text>
                      </View>
                      <Text style={styles.suggestionArrow}>→</Text>
                    </TouchableOpacity>

                    {/* ── expand / collapse button ── */}
                    <TouchableOpacity
                      onPress={() =>
                        setExpandedSuggestion(isExpanded ? null : s.regionId)
                      }
                      activeOpacity={0.75}
                      style={styles.expandBtn}
                    >
                      <Text style={styles.expandBtnText}>
                        {isExpanded ? "▲ Ascunde detalii" : "▼ De ce? Cum masezi?"}
                      </Text>
                    </TouchableOpacity>

                    {/* ── clinical detail panel ── */}
                    {isExpanded && (
                      <View style={styles.clinicalPanel}>
                        {/* referral pattern */}
                        <View style={styles.clinicalBlock}>
                          <View style={styles.clinicalBlockHeader}>
                            <Text style={styles.clinicalIcon}>🔬</Text>
                            <Text style={styles.clinicalBlockTitle}>
                              Pattern de iradiere
                            </Text>
                          </View>
                          <Text style={styles.clinicalText}>
                            {s.referralPattern}
                          </Text>
                        </View>

                        {/* divider */}
                        <View style={styles.clinicalDivider} />

                        {/* massage tip */}
                        <View style={styles.clinicalBlock}>
                          <View style={styles.clinicalBlockHeader}>
                            <Text style={styles.clinicalIcon}>💆</Text>
                            <Text style={styles.clinicalBlockTitle}>
                              Cum masezi
                            </Text>
                          </View>
                          <Text style={styles.clinicalText}>
                            {s.massageTip}
                          </Text>
                        </View>

                        {/* navigate CTA */}
                        <TouchableOpacity
                          onPress={() => handleSuggestionTap(s)}
                          activeOpacity={0.85}
                          style={styles.clinicalCTA}
                        >
                          <Text style={styles.clinicalCTAText}>
                            Selectează zona pe hartă →
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {painSuggestions.length === 0 && !isAnalyzing && painQuery.trim().length > 2 && (
            <Text style={styles.noResultsText}>
              Nu am găsit sugestii. Încearcă termeni ca: genunchi, umăr, gât,
              spate, gambă, fesă.
            </Text>
          )}
        </Card>

        {/* ── BODY MAP ─────────────────────────────────────────────────────── */}
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
                selectedSubRegion={selectedSubRegion}
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

        {/* ── STEP 2 — WHERE EXACTLY IS THE PAIN? ─────────────────────────── */}
        {selectedRegion && subRegions.length > 0 && (
          <Card>
            <Text style={styles.cardTitle}>
              📍 Unde exact în{" "}
              <Text style={{ color: C.accentSoft }}>{regionData?.label}</Text>?
            </Text>
            <Text style={styles.subRegionHint}>
              Selectează zona specifică pentru trigger points mai precise
            </Text>

            <View style={styles.subRegionRow}>
              {/* "All" chip */}
              <TouchableOpacity
                onPress={() => setSelectedSubRegion(null)}
                style={[
                  styles.subRegionChip,
                  selectedSubRegion === null && styles.subRegionChipActive,
                ]}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.subRegionChipText,
                    selectedSubRegion === null &&
                      styles.subRegionChipTextActive,
                  ]}
                >
                  Toate
                </Text>
              </TouchableOpacity>

              {subRegions.map((sr) => (
                <TouchableOpacity
                  key={sr.id}
                  onPress={() =>
                    setSelectedSubRegion(
                      selectedSubRegion === sr.id ? null : sr.id
                    )
                  }
                  style={[
                    styles.subRegionChip,
                    selectedSubRegion === sr.id && styles.subRegionChipActive,
                  ]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.subRegionChipText,
                      selectedSubRegion === sr.id &&
                        styles.subRegionChipTextActive,
                    ]}
                  >
                    {sr.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Description of selected sub-region */}
            {selectedSubRegion && (
              <View style={styles.subRegionDesc}>
                <Text style={styles.subRegionDescText}>
                  {subRegions.find((sr) => sr.id === selectedSubRegion)
                    ?.description ?? ""}
                </Text>
              </View>
            )}
          </Card>
        )}

        {/* ── STEP 3 — PAIN INTENSITY ──────────────────────────────────────── */}
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

        {/* ── STEP 4 — TRIGGER POINTS ──────────────────────────────────────── */}
        {tps.length > 0 && (
          <Card>
            <Text style={styles.cardTitle}>
              Trigger points —{" "}
              {selectedSubRegion
                ? subRegions.find((sr) => sr.id === selectedSubRegion)?.label
                : regionData?.label}
            </Text>
            <Text style={styles.tpCountHint}>
              {tps.length} trigger point{tps.length !== 1 ? "s" : ""}{" "}
              {selectedSubRegion ? "pentru zona selectată" : "în această regiune"}
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
                      {tp.locationDescription && (
                        <Text style={styles.tpLocation}>
                          📌 {tp.locationDescription}
                        </Text>
                      )}
                    </View>

                    <SeverityDots severity={tp.severity} />
                  </View>

                  {isOpen && (
                    <View style={styles.tpDetails}>
                      <Text style={styles.tpSectionLabel}>Durere iradiată</Text>
                      <Text style={styles.tpReferred}>
                        {tp.painReferral.join(", ")}
                      </Text>

                      <Text
                        style={[styles.tpSectionLabel, { marginTop: 8 }]}
                      >
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

        {/* ── QUICK ACTIONS ─────────────────────────────────────────────────── */}
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
    marginBottom: 6,
  },

  // ── Pain search ──────────────────────────────────────────────────────────
  searchHint: {
    fontSize: 11,
    color: C.textMuted,
    marginBottom: 10,
    lineHeight: 16,
  },

  searchRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },

  searchInput: {
    flex: 1,
    backgroundColor: C.surface,
    borderWidth: 1.2,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: C.text,
    fontSize: 13,
  },

  searchBtn: {
    backgroundColor: C.accent,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 11,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 96,
  },

  searchBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
  },

  suggestionsWrap: {
    marginTop: 14,
  },

  suggestTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: C.textMuted,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  suggestionCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    marginBottom: 10,
    overflow: "hidden",
  },

  suggestionCardActive: {
    backgroundColor: C.accent + "18",
    borderColor: C.accent + "60",
  },

  suggestionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },

  suggestionLeft: {
    flex: 1,
    paddingRight: 8,
  },

  suggestionTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
    flexWrap: "wrap",
  },

  suggestionLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: C.text,
  },

  confidenceBadge: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },

  confidenceText: {
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },

  suggestionReason: {
    fontSize: 11,
    color: C.textMuted,
    lineHeight: 16,
  },

  suggestionArrow: {
    fontSize: 16,
    color: C.accentSoft,
    fontWeight: "700",
  },

  expandBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },

  expandBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: C.accentSoft,
    letterSpacing: 0.2,
  },

  clinicalPanel: {
    backgroundColor: C.bg,
    borderTopWidth: 1,
    borderTopColor: C.border,
    padding: 14,
    gap: 0,
  },

  clinicalBlock: {
    marginBottom: 12,
  },

  clinicalBlockHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },

  clinicalIcon: {
    fontSize: 14,
  },

  clinicalBlockTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: C.text,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  clinicalText: {
    fontSize: 12,
    color: C.textMuted,
    lineHeight: 19,
  },

  clinicalDivider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 10,
  },

  clinicalCTA: {
    marginTop: 8,
    backgroundColor: C.accent,
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: "center",
  },

  clinicalCTAText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
  },

  noResultsText: {
    marginTop: 10,
    fontSize: 11,
    color: C.textDim,
    lineHeight: 17,
    fontStyle: "italic",
  },

  // ── Sub-region selection ─────────────────────────────────────────────────
  subRegionHint: {
    fontSize: 11,
    color: C.textMuted,
    marginBottom: 10,
    lineHeight: 16,
  },

  subRegionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  subRegionChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: C.surface,
    borderWidth: 1.2,
    borderColor: C.border,
  },

  subRegionChipActive: {
    backgroundColor: C.accent + "22",
    borderColor: C.accent,
  },

  subRegionChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: C.textMuted,
  },

  subRegionChipTextActive: {
    color: C.accent,
  },

  subRegionDesc: {
    marginTop: 10,
    backgroundColor: C.accent + "10",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderLeftWidth: 3,
    borderLeftColor: C.accent + "80",
  },

  subRegionDescText: {
    fontSize: 11,
    color: C.textMuted,
    lineHeight: 17,
    fontStyle: "italic",
  },

  // ── Pain slider ──────────────────────────────────────────────────────────
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

  // ── Trigger points ───────────────────────────────────────────────────────
  tpCountHint: {
    fontSize: 11,
    color: C.textMuted,
    marginBottom: 10,
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
    alignItems: "flex-start",
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

  tpLocation: {
    fontSize: 10,
    color: C.accentSoft,
    marginTop: 4,
    lineHeight: 15,
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

  // ── Quick actions ────────────────────────────────────────────────────────
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
