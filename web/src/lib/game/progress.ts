export const PROGRESS_STORAGE_KEY = "gds_v1_progress";

export type ProgressV1 = {
  v: 1;
  /** Highest level index unlocked (1-based). Level 1 always playable. */
  maxUnlockedLevel: number;
};

export const defaultProgress = (): ProgressV1 => ({
  v: 1,
  maxUnlockedLevel: 1,
});

/** Pure: completing `completedLevelId` unlocks the next level if applicable. */
export function applyLevelComplete(
  progress: ProgressV1,
  completedLevelId: number,
): ProgressV1 {
  const nextUnlock = completedLevelId + 1;
  return {
    ...progress,
    maxUnlockedLevel: Math.max(progress.maxUnlockedLevel, nextUnlock),
  };
}

export function canPlayLevel(progress: ProgressV1, levelId: number): boolean {
  return levelId >= 1 && levelId <= progress.maxUnlockedLevel;
}

export function parseProgress(raw: string | null): ProgressV1 {
  if (!raw) return defaultProgress();
  try {
    const j = JSON.parse(raw) as Partial<ProgressV1>;
    if (j.v !== 1 || typeof j.maxUnlockedLevel !== "number") return defaultProgress();
    return {
      v: 1,
      maxUnlockedLevel: Math.max(1, Math.floor(j.maxUnlockedLevel)),
    };
  } catch {
    return defaultProgress();
  }
}
