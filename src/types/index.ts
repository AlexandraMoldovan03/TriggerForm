export type BodyRegionId =
  | "neck" | "shoulder" | "upper_back" | "lower_back"
  | "chest" | "arm" | "hip" | "thigh" | "calf";

export type SeverityEmoji = "🔴" | "🟠" | "🟡" | "🟢";
export type ExerciseType = "massage" | "stretch" | "mobility";

export interface BodyRegion {
  id: BodyRegionId;
  label: string;
  emoji: SeverityEmoji;
  tp: number;
  exercises: number;
}

export interface TriggerPoint {
  id: string;
  name: string;
  muscle: string;
  x: number;
  y: number;
  severity: 1 | 2 | 3;
  referred: string;
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
