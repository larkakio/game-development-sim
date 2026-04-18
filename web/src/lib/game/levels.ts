import type { LevelConfig } from "./types";

/** Pipeline: Fragment → Module → Alpha → Beta → Gold Master */
export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    moves: 48,
    goal: { type: "reach_stage", stage: 2 },
    stressMax: 100,
    bugSpawnChance: 0.08,
  },
  {
    id: 2,
    moves: 40,
    goal: { type: "reach_stage", stage: 4 },
    stressMax: 100,
    bugSpawnChance: 0.12,
  },
];

export function getLevel(id: number): LevelConfig | undefined {
  return LEVELS.find((l) => l.id === id);
}
