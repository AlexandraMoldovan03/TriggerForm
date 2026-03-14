import { create } from "zustand";
import type { BodyRegionId, TriggerPoint } from "../types";

interface AppState {
  selectedRegion: BodyRegionId | null;
  painLevel: number;
  selectedTP: TriggerPoint | null;
  setSelectedRegion: (r: BodyRegionId | null) => void;
  setPainLevel: (v: number) => void;
  setSelectedTP: (tp: TriggerPoint | null) => void;
  clearSelection: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedRegion: null,
  painLevel: 5,
  selectedTP: null,

  setSelectedRegion: (r) =>
    set({ selectedRegion: r, selectedTP: null }),

  setPainLevel: (v) => set({ painLevel: v }),

  setSelectedTP: (tp) => set({ selectedTP: tp }),

  clearSelection: () =>
    set({ selectedRegion: null, selectedTP: null, painLevel: 5 }),
}));
