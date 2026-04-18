import { describe, expect, it } from "vitest";
import { checkWin } from "./engine";
import { LEVELS } from "./levels";
import type { GameState, Grid } from "./types";

function gridWithAlpha(): Grid {
  const g: Grid = Array.from({ length: 4 }, () =>
    Array.from({ length: 4 }, () => null),
  );
  g[0][0] = { kind: "pipe", stage: 2 };
  return g;
}

describe("engine win detection", () => {
  it("detects reach_stage goal when Alpha (stage 2) exists", () => {
    const level = LEVELS[0];
    const state: GameState = {
      grid: gridWithAlpha(),
      score: 0,
      stress: 10,
      movesLeft: 10,
      levelId: 1,
      status: "playing",
    };
    expect(checkWin(state, level)).toBe(true);
  });
});
