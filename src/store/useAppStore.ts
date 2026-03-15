import { create } from "zustand";
import type { BodyRegionId, TriggerPoint3D } from "../types";
import type { PainSuggestion } from "../utils/painAnalysis";

interface AppState {
  selectedRegion: BodyRegionId | null;
  selectedSubRegion: string | null;
  painLevel: number;
  selectedTP: TriggerPoint3D | null;
  // pain search
  painQuery: string;
  painSuggestions: PainSuggestion[];
  isAnalyzing: boolean;
  setSelectedRegion: (r: BodyRegionId | null) => void;
  setSelectedSubRegion: (sr: string | null) => void;
  setPainLevel: (v: number) => void;
  setSelectedTP: (tp: TriggerPoint3D | null) => void;
  setPainQuery: (q: string) => void;
  setPainSuggestions: (s: PainSuggestion[]) => void;
  setIsAnalyzing: (v: boolean) => void;
  clearSelection: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedRegion: null,
  selectedSubRegion: null,
  painLevel: 5,
  selectedTP: null,
  painQuery: "",
  painSuggestions: [],
  isAnalyzing: false,

  setSelectedRegion: (r) =>
    set({ selectedRegion: r, selectedTP: null, selectedSubRegion: null }),

  setSelectedSubRegion: (sr) =>
    set({ selectedSubRegion: sr, selectedTP: null }),

  setPainLevel: (v) => set({ painLevel: v }),

  setSelectedTP: (tp) => set({ selectedTP: tp }),

  setPainQuery: (q) => set({ painQuery: q }),

  setPainSuggestions: (s) => set({ painSuggestions: s }),

  setIsAnalyzing: (v) => set({ isAnalyzing: v }),

  clearSelection: () =>
    set({
      selectedRegion: null,
      selectedSubRegion: null,
      selectedTP: null,
      painLevel: 5,
      painSuggestions: [],
      painQuery: "",
    }),
}));
