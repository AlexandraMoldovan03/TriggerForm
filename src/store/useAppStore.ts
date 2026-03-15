import { create } from "zustand";
import type { BodyRegionId, TriggerPoint3D } from "../types";

interface AppState {
  selectedRegion: BodyRegionId | null;
  selectedSubRegion: string | null;
  painLevel: number;
  selectedTP: TriggerPoint3D | null;
  setSelectedRegion: (r: BodyRegionId | null) => void;
  setSelectedSubRegion: (sr: string | null) => void;
  setPainLevel: (v: number) => void;
  setSelectedTP: (tp: TriggerPoint3D | null) => void;
  clearSelection: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedRegion: null,
  selectedSubRegion: null,
  painLevel: 5,
  selectedTP: null,

  setSelectedRegion: (r) =>
    set({ selectedRegion: r, selectedTP: null, selectedSubRegion: null }),

  setSelectedSubRegion: (sr) =>
    set({ selectedSubRegion: sr, selectedTP: null }),

  setPainLevel: (v) => set({ painLevel: v }),

  setSelectedTP: (tp) => set({ selectedTP: tp }),

  clearSelection: () =>
    set({ selectedRegion: null, selectedSubRegion: null, selectedTP: null, painLevel: 5 }),
}));
