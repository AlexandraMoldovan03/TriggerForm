export type BodyView = "front" | "back" | "left" | "right";

export type BodyRegionId =
  | "upper_trap_left"
  | "upper_trap_right"
  | "levator_left"
  | "levator_right"
  | "rhomboid_left"
  | "rhomboid_right"
  | "pec_left"
  | "pec_right"
  | "lumbar_left"
  | "lumbar_right"
  | "glute_med_left"
  | "glute_med_right"
  | "piriformis_left"
  | "piriformis_right"
  | "hamstring_left"
  | "hamstring_right"
  | "calf_left"
  | "calf_right";

export type SeverityEmoji = "🔴" | "🟠" | "🟡" | "🟢";
export type ExerciseType = "massage" | "stretch" | "mobility";

export interface SubRegion {
  id: string;
  label: string;
  description?: string;
}

export interface RegionDef {
  id: BodyRegionId;
  label: string;
  emoji: SeverityEmoji;
  tp: number;
  view: BodyView;
  subRegions?: SubRegion[];
}

export interface TriggerPoint3D {
  id: string;
  regionId: BodyRegionId;
  name: string;
  muscle: string;
  label: string;
  bodySide: "left" | "right" | "midline";
  view: BodyView;
  x: number;
  y: number;
  severity: 1 | 2 | 3;
  painReferral: string[];
  symptoms: string[];
  tags: string[];
  relatedExercises: string[];
  subRegionId?: string;
  locationDescription?: string;
}

export interface Exercise {
  id: string;
  name: string;
  type: ExerciseType;
  duration: string;
  level: string;
  region: BodyRegionId;
  icon: string;
}
