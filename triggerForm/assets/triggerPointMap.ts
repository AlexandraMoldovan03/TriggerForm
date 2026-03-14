// src/data/triggerPointMap.ts

export type TriggerPoint = {
  name: string;
  location: string;
  referredPain: string[];
  causes: string[];
  recovery: RecoveryStep[];
};

export type RecoveryStep = {
  step: number;
  technique: string;
  instruction: string;
  duration: number; // seconds
  tool: 'thumb' | 'fingers' | 'lacrosse_ball' | 'foam_roller' | 'tennis_ball';
};

export type BodyRegionData = {
  label: string;
  triggerPoints: TriggerPoint[];
};

export const TRIGGER_POINT_MAP: Record<string, BodyRegionData> = {
  trapezius: {
    label: 'Upper trapezius',
    triggerPoints: [
      {
        name: 'TP1 — upper fiber',
        location: 'Midpoint between neck and shoulder',
        referredPain: ['Base of skull', 'Temple', 'Behind the eye'],
        causes: ['Forward head posture', 'Stress', 'Long desk sessions'],
        recovery: [
          {
            step: 1,
            technique: 'Pincer compression',
            instruction: 'Grasp the upper trap between thumb and fingers. Squeeze and hold on the most tender spot.',
            duration: 60,
            tool: 'fingers',
          },
          {
            step: 2,
            technique: 'Sustained pressure',
            instruction: 'Press your thumb directly onto the tender nodule. Hold firm pressure until the pain reduces by about half.',
            duration: 90,
            tool: 'thumb',
          },
          {
            step: 3,
            technique: 'Neck stretch',
            instruction: 'Tilt your head away from the treated side. Hold the stretch to lengthen the muscle after releasing the trigger point.',
            duration: 30,
            tool: 'fingers',
          },
        ],
      },
    ],
  },

  'upper-back': {
    label: 'Upper back / rhomboids',
    triggerPoints: [
      {
        name: 'Rhomboid trigger point',
        location: 'Between spine and shoulder blade',
        referredPain: ['Along the inner shoulder blade edge'],
        causes: ['Rounded shoulders', 'Weak mid-back', 'Prolonged typing'],
        recovery: [
          {
            step: 1,
            technique: 'Lacrosse ball — wall press',
            instruction: 'Place a lacrosse ball between your upper back and a wall. Lean into it on the tender spot and hold.',
            duration: 60,
            tool: 'lacrosse_ball',
          },
          {
            step: 2,
            technique: 'Cross-arm stretch',
            instruction: 'Pull one arm across your chest with the other hand. Hold to stretch the rhomboids after releasing.',
            duration: 30,
            tool: 'fingers',
          },
        ],
      },
    ],
  },

  'lower-back': {
    label: 'Lower back / QL',
    triggerPoints: [
      {
        name: 'Quadratus lumborum',
        location: 'Deep muscle alongside lumbar spine',
        referredPain: ['Glutes', 'Hip', 'Groin', 'Front of thigh'],
        causes: ['Prolonged sitting', 'Weak core', 'Leg length discrepancy'],
        recovery: [
          {
            step: 1,
            technique: 'Tennis ball — floor press',
            instruction: 'Lie on your back, place a tennis ball under your lower back beside the spine. Let gravity apply pressure on the tender area.',
            duration: 90,
            tool: 'tennis_ball',
          },
          {
            step: 2,
            technique: 'Side-lying compression',
            instruction: 'Use your thumb to press into the muscle just above the hip bone, beside the spine. Hold on the tender spot.',
            duration: 60,
            tool: 'thumb',
          },
        ],
      },
    ],
  },

  chest: {
    label: 'Chest / pectoralis',
    triggerPoints: [
      {
        name: 'Pec minor trigger point',
        location: 'Upper chest near coracoid process',
        referredPain: ['Front of shoulder', 'Inner arm', 'Fingers'],
        causes: ['Rounded shoulders', 'Bench pressing', 'Driving'],
        recovery: [
          {
            step: 1,
            technique: 'Doorway stretch with pressure',
            instruction: 'Press your thumb into the tender area just below the collarbone near the shoulder. Hold pressure while slowly opening your chest.',
            duration: 60,
            tool: 'thumb',
          },
        ],
      },
    ],
  },

  neck: {
    label: 'Neck / SCM',
    triggerPoints: [
      {
        name: 'Sternocleidomastoid',
        location: 'Along the side of the neck',
        referredPain: ['Forehead', 'Cheek', 'Eye', 'Ear'],
        causes: ['Forward head posture', 'Whiplash', 'Phone use'],
        recovery: [
          {
            step: 1,
            technique: 'Pincer grip',
            instruction: 'Gently grasp the SCM muscle between thumb and index finger. Pinch each tender spot along the length of the muscle.',
            duration: 30,
            tool: 'fingers',
          },
        ],
      },
    ],
  },

  glutes: {
    label: 'Glutes / piriformis',
    triggerPoints: [
      {
        name: 'Piriformis',
        location: 'Deep in the glute, near the sacrum',
        referredPain: ['Down the back of the leg', 'Sciatic-like pain'],
        causes: ['Prolonged sitting', 'Running', 'Hip weakness'],
        recovery: [
          {
            step: 1,
            technique: 'Lacrosse ball — seated',
            instruction: 'Sit on a lacrosse ball placed under the glute. Cross the ankle of that leg over the opposite knee. Lean into the tender spot.',
            duration: 90,
            tool: 'lacrosse_ball',
          },
        ],
      },
    ],
  },
};