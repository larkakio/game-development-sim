export const GRID_SIZE = 4;

export type PipeStage = 0 | 1 | 2 | 3 | 4;

export type Tile =
  | { kind: "pipe"; stage: PipeStage }
  | { kind: "bug" }
  | { kind: "qa" };

export type Cell = Tile | null;

export type Grid = Cell[][];

export type Direction = "up" | "down" | "left" | "right";

export type LevelGoal =
  | { type: "reach_stage"; stage: PipeStage }
  | { type: "score"; min: number };

export type LevelConfig = {
  id: number;
  moves: number;
  goal: LevelGoal;
  stressMax: number;
  /** Probability [0,1] that a new bug spawns instead of a fragment */
  bugSpawnChance: number;
};

export type GameState = {
  grid: Grid;
  score: number;
  stress: number;
  movesLeft: number;
  levelId: number;
  status: "playing" | "won" | "lost";
  lastMove?: Direction;
};
