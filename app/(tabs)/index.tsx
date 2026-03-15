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

const CONFIDENCE_COLOR: Record<PainSuggestion["confidence"], string> = {
  high: C.accent,
  medium: C.amber,
  low: C.green,
};

const CONFIDENCE_LABEL: Record<PainSuggestion["confidence"], string> = {
  high: "Likely",
  medium: "Possible",
  low: "Less likely",
};

export default function HomeScreen() {
  const router = useRouter();
  const [selectedView, setSelectedView] = useState<BodyView>("back");
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(
    null
  );

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
    setSelectedSubRegion(null);
    setSelectedTP(null);
  };

  const regionData = REGIONS.find((r) => r.id === selectedRegion);

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
    setSelectedSubRegion(null);
    setSelectedTP(null);
  };

  const subRegions = regionData?.subRegions ?? [];

  const getPainLevelInfo = (level: number) => {
    if (level <= 3) {
      return {
        title: "Mild pain",
        color: C.green,
        emoji: "🟢",
        summary:
          "This looks more like local tension or a mild irritation. Usually responds well to gentle mobility work, controlled self-massage and monitoring.",
        guidance: [
          "Start with light pressure on trigger points — not aggressively.",
          "Choose gentle stretching and simple mobility exercises.",
          "If pain increases after massage, reduce intensity or duration.",
        ],
        warning:
          "If the pain persists for several days, starts to radiate or becomes more frequent, it is worth re-evaluating.",
      };
    }

    if (level <= 6) {
      return {
        title: "Moderate pain",
        color: C.amber,
        emoji: "🟠",
        summary:
          "You may have an active trigger point or a clearly overloaded area. Careful dosing of pressure and exercises is needed.",
        guidance: [
          "Use progressive pressure — not sudden or very deep massage.",
          "Combine massage with mobility work and recovery breaks.",
          "Focus on the source area, not just where you feel the pain.",
        ],
        warning:
          "If the pain limits movement, returns frequently or numbness appears, consult a specialist.",
      };
    }

    return {
      title: "Severe pain",
      color: C.accent,
      emoji: "🔴",
      summary:
        "The pain is intense enough that self-treatment must be done carefully. There may be significant irritation, postural compensation or referred pain.",
      guidance: [
        "Do not start with heavy pressure on trigger points.",
        "Prioritise gentle techniques, breathing and light exercises.",
        "Avoid forcing stretching while in intense pain.",
      ],
      warning:
        "If the pain is strong, worsening, radiating into the arm or leg, or affecting daily function, specialist consultation is recommended.",
    };
  };

  const painInfo = getPainLevelInfo(painLevel);

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.headerCard}>
          <Text style={styles.headerSub}>Welcome back</Text>
          <Text style={styles.headerTitle}>Where do you feel pain?</Text>
          <Text style={styles.headerHint}>
            Describe your pain or select the area directly on the body map
          </Text>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>🔍 Describe your pain</Text>
          <Text style={styles.searchHint}>
            e.g. "knee pain", "stiff neck", "lower back after sitting"
          </Text>

          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              value={painQuery}
              onChangeText={setPainQuery}
              placeholder="Describe where and how it hurts..."
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
                <Text style={styles.searchBtnText}>Analyze</Text>
              )}
            </TouchableOpacity>
          </View>

          {painSuggestions.length > 0 && (
            <View style={styles.suggestionsWrap}>
              <Text style={styles.suggestTitle}>Suggested areas for massage:</Text>

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

                    <TouchableOpacity
                      onPress={() =>
                        setExpandedSuggestion(isExpanded ? null : s.regionId)
                      }
                      activeOpacity={0.75}
                      style={styles.expandBtn}
                    >
                      <Text style={styles.expandBtnText}>
                        {isExpanded ? "▲ Hide details" : "▼ Why? How to massage?"}
                      </Text>
                    </TouchableOpacity>

                    {isExpanded && (
                      <View style={styles.clinicalPanel}>
                        <View style={styles.clinicalBlock}>
                          <View style={styles.clinicalBlockHeader}>
                            <Text style={styles.clinicalIcon}>🔬</Text>
                            <Text style={styles.clinicalBlockTitle}>
                              Referral pattern
                            </Text>
                          </View>
                          <Text style={styles.clinicalText}>
                            {s.referralPattern}
                          </Text>
                        </View>

                        <View style={styles.clinicalDivider} />

                        <View style={styles.clinicalBlock}>
                          <View style={styles.clinicalBlockHeader}>
                            <Text style={styles.clinicalIcon}>💆</Text>
                            <Text style={styles.clinicalBlockTitle}>
                              How to massage
                            </Text>
                          </View>
                          <Text style={styles.clinicalText}>{s.massageTip}</Text>
                        </View>

                        <TouchableOpacity
                          onPress={() => handleSuggestionTap(s)}
                          activeOpacity={0.85}
                          style={styles.clinicalCTA}
                        >
                          <Text style={styles.clinicalCTAText}>
                            Select area on map →
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {painSuggestions.length === 0 &&
            !isAnalyzing &&
            painQuery.trim().length > 2 && (
              <Text style={styles.noResultsText}>
                No suggestions found. Try terms like: knee, shoulder, neck,
                back, calf, glute.
              </Text>
            )}
        </Card>

        <Card>
          <BodyViewTabs
            selectedView={selectedView}
            onChangeView={(view) => {
              if (view !== "front" && view !== "back") return;
              setSelectedView(view);
              setSelectedRegion(null);
              setSelectedSubRegion(null);
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

        {selectedRegion && subRegions.length > 0 && (
          <Card>
            <Text style={styles.cardTitle}>
              📍 Where exactly in{" "}
              <Text style={{ color: C.accentSoft }}>{regionData?.label}</Text>?
            </Text>

            <Text style={styles.subRegionHint}>
              Select the specific area for more precise trigger points
            </Text>

            <View style={styles.subRegionRow}>
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
                  All
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

        {selectedRegion && (
          <Card>
            <View style={styles.painRow}>
              <Text style={styles.cardTitle}>Pain intensity</Text>
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
                Mild
              </Text>
              <Text style={[styles.painLabel, { color: C.amber }]}>
                Moderate
              </Text>
              <Text style={[styles.painLabel, { color: C.accent }]}>
                Severe
              </Text>
            </View>

            <View
              style={[
                styles.painInsightCard,
                {
                  backgroundColor: painInfo.color + "12",
                  borderColor: painInfo.color + "55",
                },
              ]}
            >
              <View style={styles.painInsightHeader}>
                <Text style={styles.painInsightEmoji}>{painInfo.emoji}</Text>
                <Text
                  style={[styles.painInsightTitle, { color: painInfo.color }]}
                >
                  {painInfo.title}
                </Text>
              </View>

              <Text style={styles.painInsightSummary}>
                {painInfo.summary}
              </Text>

              <View style={styles.painInsightList}>
                {painInfo.guidance.map((item, index) => (
                  <Text key={index} style={styles.painInsightBullet}>
                    • {item}
                  </Text>
                ))}
              </View>

              <View style={styles.painWarningBox}>
                <Text style={styles.painWarningTitle}>Warning</Text>
                <Text style={styles.painWarningText}>{painInfo.warning}</Text>
              </View>
            </View>
          </Card>
        )}

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
              {selectedSubRegion ? "for the selected area" : "in this region"}
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
                      <Text style={styles.tpSectionLabel}>
                        Referred pain
                      </Text>
                      <Text style={styles.tpReferred}>
                        {tp.painReferral.join(", ")}
                      </Text>

                      <Text
                        style={[styles.tpSectionLabel, { marginTop: 8 }]}
                      >
                        Common symptoms
                      </Text>
                      <Text style={styles.tpReferred}>
                        {tp.symptoms.join(", ")}
                      </Text>

                      <TouchableOpacity
                        onPress={() => router.push("/exercises")}
                        style={styles.tpButton}
                      >
                        <Text style={styles.tpButtonText}>
                          View exercises →
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
            <Text style={styles.quickTitle}>Body Scan</Text>
            <Text style={styles.quickSub}>AI-powered posture analysis</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/exercises")}
            style={[styles.quickCard, { backgroundColor: C.teal + "CC" }]}
            activeOpacity={0.85}
          >
            <Text style={styles.quickIcon}>🧘</Text>
            <Text style={styles.quickTitle}>Exercises</Text>
            <Text style={styles.quickSub}>Stretching & mobility</Text>
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

  painInsightCard: {
    marginTop: 14,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },

  painInsightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },

  painInsightEmoji: {
    fontSize: 16,
  },

  painInsightTitle: {
    fontSize: 13,
    fontWeight: "800",
  },

  painInsightSummary: {
    fontSize: 12,
    color: C.text,
    lineHeight: 18,
    marginBottom: 10,
  },

  painInsightList: {
    gap: 6,
    marginBottom: 10,
  },

  painInsightBullet: {
    fontSize: 11,
    color: C.textMuted,
    lineHeight: 17,
  },

  painWarningBox: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: C.border,
  },

  painWarningTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: C.text,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  painWarningText: {
    fontSize: 11,
    color: C.textMuted,
    lineHeight: 17,
  },

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