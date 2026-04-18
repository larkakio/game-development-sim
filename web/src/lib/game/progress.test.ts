import { describe, expect, it } from "vitest";
import {
  applyLevelComplete,
  canPlayLevel,
  defaultProgress,
} from "./progress";

describe("progress", () => {
  it("unlocks level 2 after completing level 1", () => {
    const p = defaultProgress();
    expect(p.maxUnlockedLevel).toBe(1);
    const next = applyLevelComplete(p, 1);
    expect(next.maxUnlockedLevel).toBe(2);
  });

  it("does not allow playing level 2 before unlock", () => {
    const p = defaultProgress();
    expect(canPlayLevel(p, 2)).toBe(false);
  });

  it("allows playing level 2 after unlock", () => {
    const p = applyLevelComplete(defaultProgress(), 1);
    expect(canPlayLevel(p, 2)).toBe(true);
  });
});
