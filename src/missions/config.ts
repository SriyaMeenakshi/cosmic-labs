import type { MissionObjectiveOption, MissionTemplate } from "@/src/domain/types";

export const objectiveOptions: MissionObjectiveOption[] = [
  { id: "surface-observation", label: "Surface observation", description: "Capture high-value imagery and surface telemetry." },
  { id: "geological-research", label: "Geological research", description: "Study composition, terrain, and formation history." },
  { id: "atmospheric-analysis", label: "Atmospheric analysis", description: "Measure the chemistry and behavior of a destination atmosphere." },
  { id: "resource-exploration", label: "Resource exploration", description: "Locate and characterize useful in-situ resources." },
  { id: "orbital-mapping", label: "Orbital mapping", description: "Build a precise map from a stable observation orbit." },
];

export const missionTemplates: MissionTemplate[] = [
  {
    id: "mars-exploration",
    destination: "mars",
    title: "Mars Exploration",
    description: "Design a resilient observation mission for the long way out and back.",
    objective: "surface-observation",
    objectiveOptions: [objectiveOptions[0], objectiveOptions[1], objectiveOptions[2], objectiveOptions[4]],
    difficulty: "advanced",
    durationDays: { min: 180, max: 900, recommended: 540 },
    initialBudgetCredits: 125000,
    maxMassKg: 4200,
    constraints: ["Long communication delay", "High radiation exposure", "Limited launch windows"],
    imageSrc: "/destinations/mars.svg",
    imageAlt: "Illustrated red Mars horizon",
  },
  {
    id: "lunar-exploration",
    destination: "moon",
    title: "Lunar Exploration",
    description: "Build a compact platform for precise research at the lunar south pole.",
    objective: "geological-research",
    objectiveOptions: [objectiveOptions[0], objectiveOptions[1], objectiveOptions[3], objectiveOptions[4]],
    difficulty: "beginner",
    durationDays: { min: 14, max: 180, recommended: 60 },
    initialBudgetCredits: 80000,
    maxMassKg: 1800,
    constraints: ["Extreme thermal swings", "Low-light operations", "Narrow landing zone"],
    imageSrc: "/destinations/moon.svg",
    imageAlt: "Illustrated moon above a lunar horizon",
  },
  {
    id: "asteroid-exploration",
    destination: "asteroids",
    title: "Asteroid Exploration",
    description: "Balance a prospecting mission against a small body and a changing orbit.",
    objective: "resource-exploration",
    objectiveOptions: [objectiveOptions[1], objectiveOptions[2], objectiveOptions[3], objectiveOptions[4]],
    difficulty: "intermediate",
    durationDays: { min: 90, max: 540, recommended: 270 },
    initialBudgetCredits: 95000,
    maxMassKg: 2500,
    constraints: ["Irregular gravity field", "Unpredictable surface geometry", "Low-light navigation"],
    imageSrc: "/destinations/asteroids.svg",
    imageAlt: "Illustrated asteroid field",
  },
];

export const gameModes = [
  { id: "beginner", label: "Beginner", description: "Learn the mission loop with generous margins." },
  { id: "intermediate", label: "Intermediate", description: "Balance meaningful trade-offs and tighter constraints." },
  { id: "advanced", label: "Advanced", description: "Make every kilogram, watt, and credit count." },
] as const;

export function getMissionTemplate(id: string) {
  return missionTemplates.find((mission) => mission.id === id);
}
