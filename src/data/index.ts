import type { BodyRegion, TriggerPoint, Exercise } from "../types";

export const REGIONS: BodyRegion[] = [
  { id: "neck",       label: "Gât",         emoji: "🔴", tp: 4, exercises: 3 },
  { id: "shoulder",   label: "Umăr",        emoji: "🟠", tp: 6, exercises: 5 },
  { id: "upper_back", label: "Spate sup.",  emoji: "🔴", tp: 8, exercises: 6 },
  { id: "lower_back", label: "Spate inf.",  emoji: "🟠", tp: 5, exercises: 7 },
  { id: "chest",      label: "Piept",       emoji: "🟡", tp: 3, exercises: 4 },
  { id: "arm",        label: "Braț",        emoji: "🟢", tp: 4, exercises: 3 },
  { id: "hip",        label: "Șold",        emoji: "🟠", tp: 6, exercises: 5 },
  { id: "thigh",      label: "Coapsă",      emoji: "🟡", tp: 5, exercises: 4 },
  { id: "calf",       label: "Gambă",       emoji: "🟢", tp: 3, exercises: 3 },
];

export const TRIGGER_POINTS: Partial<Record<string, TriggerPoint[]>> = {
  neck: [
    { id: "tp1", name: "Upper Trapezius",      muscle: "Trapez superior",       x: 38, y: 18, severity: 3, referred: "Tâmplă, ochi" },
    { id: "tp2", name: "Sternocleidomastoid",  muscle: "SCM",                   x: 55, y: 15, severity: 2, referred: "Frunte, urechea" },
    { id: "tp3", name: "Levator Scapulae",     muscle: "Ridicătorul scapulei",  x: 42, y: 22, severity: 3, referred: "Gât lateral" },
    { id: "tp4", name: "Semispinalis Capitis", muscle: "Semispinalis",          x: 50, y: 12, severity: 1, referred: "Occiput" },
  ],
  shoulder: [
    { id: "tp5", name: "Infraspinatus",  muscle: "Infraspinos",   x: 35, y: 35, severity: 3, referred: "Braț anterior" },
    { id: "tp6", name: "Supraspinatus", muscle: "Supraspinos",   x: 50, y: 30, severity: 2, referred: "Deltoid, cot" },
    { id: "tp7", name: "Subscapularis", muscle: "Subscapular",   x: 60, y: 38, severity: 3, referred: "Spate umăr" },
  ],
  upper_back: [
    { id: "tp8", name: "Rhomboid Major",   muscle: "Romboid mare",      x: 45, y: 45, severity: 2, referred: "Marginea scapulei" },
    { id: "tp9", name: "Middle Trapezius", muscle: "Trapez mijlociu",   x: 55, y: 40, severity: 2, referred: "Coloana toracică" },
  ],
  lower_back: [
    { id: "tp10", name: "Quadratus Lumborum", muscle: "Pătratul lombelor", x: 48, y: 58, severity: 3, referred: "Fesă, șold" },
    { id: "tp11", name: "Iliocostalis",       muscle: "Iliocostal",       x: 40, y: 55, severity: 2, referred: "Abdomen" },
  ],
  hip: [
    { id: "tp12", name: "Piriformis",       muscle: "Piriform",     x: 52, y: 68, severity: 3, referred: "Sciatic, gambă" },
    { id: "tp13", name: "Gluteus Medius",   muscle: "Fesier mijl.", x: 42, y: 65, severity: 2, referred: "Fesă laterală" },
  ],
};

export const EXERCISES: Exercise[] = [
  { id: "ex1", name: "Masaj cu mingea – Trapez",       type: "massage",  duration: "5 min", level: "Ușor",  region: "neck",       icon: "⚽" },
  { id: "ex2", name: "Stretching gât lateral",          type: "stretch",  duration: "3 min", level: "Ușor",  region: "neck",       icon: "🧘" },
  { id: "ex3", name: "Chin Tuck",                       type: "mobility", duration: "2 min", level: "Ușor",  region: "neck",       icon: "🔄" },
  { id: "ex4", name: "Masaj umăr cu lacrosse ball",     type: "massage",  duration: "5 min", level: "Mediu", region: "shoulder",   icon: "⚽" },
  { id: "ex5", name: "Thread the Needle",               type: "mobility", duration: "4 min", level: "Mediu", region: "upper_back", icon: "🧘" },
  { id: "ex6", name: "Cat-Cow Stretch",                 type: "stretch",  duration: "3 min", level: "Ușor",  region: "upper_back", icon: "🔄" },
  { id: "ex7", name: "Masaj lombar cu roller",          type: "massage",  duration: "6 min", level: "Mediu", region: "lower_back", icon: "⚽" },
  { id: "ex8", name: "Hip Flexor Stretch",              type: "stretch",  duration: "4 min", level: "Ușor",  region: "hip",        icon: "🧘" },
  { id: "ex9", name: "Pigeon Pose – Piriformis",        type: "stretch",  duration: "5 min", level: "Mediu", region: "hip",        icon: "🔄" },
];
