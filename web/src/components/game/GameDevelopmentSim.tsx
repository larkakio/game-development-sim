"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { applyMove, createInitialState, tileLabel } from "@/lib/game/engine";
import { getLevel, LEVELS } from "@/lib/game/levels";
import type { Direction, GameState, Tile } from "@/lib/game/types";
import {
  PROGRESS_STORAGE_KEY,
  applyLevelComplete,
  canPlayLevel,
  defaultProgress,
  parseProgress,
  type ProgressV1,
} from "@/lib/game/progress";

const SWIPE_MIN = 32;

function tileStyle(tile: Tile): string {
  if (tile.kind === "bug")
    return "border-rose-400/60 bg-rose-500/15 text-rose-100 shadow-[0_0_16px_rgba(255,80,120,0.25)]";
  if (tile.kind === "qa")
    return "border-fuchsia-400/60 bg-fuchsia-500/15 text-fuchsia-100 shadow-[0_0_16px_rgba(255,0,255,0.2)]";
  const stages = [
    "border-cyan-400/50 bg-cyan-500/10 text-cyan-50",
    "border-sky-400/50 bg-sky-500/15 text-sky-50",
    "border-lime-400/50 bg-lime-500/15 text-lime-50",
    "border-amber-400/50 bg-amber-500/15 text-amber-50",
    "border-yellow-300/70 bg-yellow-500/20 text-yellow-50 shadow-[0_0_22px_rgba(255,220,100,0.35)]",
  ];
  return stages[tile.stage] ?? stages[0];
}

export function GameDevelopmentSim() {
  /** Same default on server + first client paint — avoids hydration mismatch with localStorage. */
  const [progress, setProgress] = useState<ProgressV1>(defaultProgress);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const level = getLevel(selectedLevel) ?? LEVELS[0];
  /** null until client mount: random initial grid must not run during SSR (Math.random differs). */
  const [game, setGame] = useState<GameState | null>(null);

  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      setProgress(parseProgress(window.localStorage.getItem(PROGRESS_STORAGE_KEY)));
    });
  }, []);

  useEffect(() => {
    window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    const lv = getLevel(selectedLevel) ?? LEVELS[0];
    queueMicrotask(() => {
      setGame(createInitialState(lv));
    });
  }, [selectedLevel]);

  const selectLevel = useCallback(
    (id: number) => {
      if (!canPlayLevel(progress, id)) return;
      const lv = getLevel(id);
      if (!lv) return;
      setSelectedLevel(id);
    },
    [progress],
  );

  const dispatchMove = useCallback((dir: Direction) => {
    setGame((g) => {
      if (!g) return g;
      const lv = getLevel(g.levelId) ?? LEVELS[0];
      const next = applyMove(g, dir, lv);
      if (next.status === "won") {
        queueMicrotask(() => {
          setProgress((p) => applyLevelComplete(p, next.levelId));
        });
      }
      return next;
    });
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const map: Record<string, Direction> = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
      };
      const d = map[e.key];
      if (!d) return;
      e.preventDefault();
      dispatchMove(d);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatchMove]);

  function handleTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < SWIPE_MIN && Math.abs(dy) < SWIPE_MIN) return;
    if (Math.abs(dx) > Math.abs(dy)) {
      dispatchMove(dx > 0 ? "right" : "left");
    } else {
      dispatchMove(dy > 0 ? "down" : "up");
    }
  }

  function restart() {
    const lv = getLevel(selectedLevel) ?? LEVELS[0];
    setGame(createInitialState(lv));
  }

  const grid = game?.grid ?? null;

  const goalText =
    level.goal.type === "reach_stage"
      ? `Merge up to ${["Fragment", "Module", "Alpha", "Beta", "Gold"][level.goal.stage]}`
      : `Score ${level.goal.min}+`;

  return (
    <div className="flex w-full max-w-lg flex-col gap-4 px-3 pb-8">
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-[#05060a]/90 p-4 shadow-[0_0_40px_rgba(0,255,255,0.08)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,0,255,0.12) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-xl tracking-[0.15em] text-cyan-100 drop-shadow-[0_0_12px_rgba(0,255,255,0.35)]">
              Game Dev Sim
            </h2>
            <p className="mt-1 max-w-[20rem] font-mono text-[11px] leading-relaxed text-cyan-200/55">
              Swipe the studio field. Merge matching pipeline tiles. Land QA on Bugs to clear them.
            </p>
          </div>
          <div className="font-mono text-[10px] text-fuchsia-200/70">
            Unlocked: L{progress.maxUnlockedLevel}
          </div>
        </div>

        <div className="relative mt-4 flex flex-wrap gap-2">
          {LEVELS.map((lv) => {
            const ok = canPlayLevel(progress, lv.id);
            return (
              <button
                key={lv.id}
                type="button"
                disabled={!ok}
                onClick={() => selectLevel(lv.id)}
                className={`rounded-lg border px-3 py-1.5 font-mono text-xs uppercase tracking-wide transition ${
                  selectedLevel === lv.id
                    ? "border-lime-400/70 bg-lime-400/15 text-lime-100"
                    : ok
                      ? "border-white/15 bg-white/5 text-cyan-100/80 hover:border-cyan-400/40"
                      : "cursor-not-allowed border-white/5 text-white/25"
                }`}
              >
                Level {lv.id}
              </button>
            );
          })}
        </div>

        <dl className="relative mt-4 grid grid-cols-2 gap-2 font-mono text-[11px] text-cyan-100/80 sm:grid-cols-4">
          <div className="rounded border border-white/10 bg-black/30 px-2 py-1">
            <dt className="text-[9px] uppercase text-cyan-400/50">Objective</dt>
            <dd className="text-cyan-100/90">{goalText}</dd>
          </div>
          <div className="rounded border border-white/10 bg-black/30 px-2 py-1">
            <dt className="text-[9px] uppercase text-cyan-400/50">Moves</dt>
            <dd>{game?.movesLeft ?? "—"}</dd>
          </div>
          <div className="rounded border border-white/10 bg-black/30 px-2 py-1">
            <dt className="text-[9px] uppercase text-cyan-400/50">Stress</dt>
            <dd>
              {game ? `${Math.round(game.stress)} / ${level.stressMax}` : "—"}
            </dd>
          </div>
          <div className="rounded border border-white/10 bg-black/30 px-2 py-1">
            <dt className="text-[9px] uppercase text-cyan-400/50">Score</dt>
            <dd>{game?.score ?? "—"}</dd>
          </div>
        </dl>

        <div
          className="relative mx-auto mt-4 aspect-square w-full max-w-[min(100%,320px)] touch-pan-y select-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          role="application"
          aria-busy={!grid}
          aria-label="Game board — swipe to slide tiles"
        >
          <div
            className="grid h-full w-full gap-2 rounded-xl border border-cyan-500/25 bg-black/50 p-2 shadow-[inset_0_0_30px_rgba(0,255,255,0.05)]"
            style={{
              gridTemplateColumns: `repeat(4, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(4, minmax(0, 1fr))`,
            }}
          >
            {(grid ?? Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => null))).flatMap(
              (row, r) =>
                row.map((cell, c) => (
                  <div
                    key={`${r}-${c}`}
                    className={`flex min-h-[3rem] items-center justify-center rounded-lg border text-center text-[10px] font-mono leading-tight sm:text-xs ${
                      cell
                        ? tileStyle(cell)
                        : "border-white/5 bg-black/20 text-cyan-900/40"
                    }`}
                  >
                    {cell ? (
                      <span className="px-1">{tileLabel(cell)}</span>
                    ) : (
                      "·"
                    )}
                  </div>
                )),
            )}
          </div>
        </div>

        {game?.status === "won" ? (
          <div
            className="relative mt-4 rounded-xl border border-lime-400/50 bg-lime-500/10 px-3 py-3 text-center font-mono text-sm text-lime-100"
            role="status"
          >
            Level {game.levelId} complete — next level unlocked.
          </div>
        ) : null}
        {game?.status === "lost" ? (
          <div
            className="relative mt-4 rounded-xl border border-rose-400/50 bg-rose-500/10 px-3 py-3 text-center font-mono text-sm text-rose-100"
            role="status"
          >
            Sprint failed — out of moves or stress too high.
          </div>
        ) : null}

        <div className="relative mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={restart}
            className="flex-1 rounded-xl border border-cyan-400/40 bg-cyan-500/10 py-2.5 font-mono text-xs uppercase tracking-wide text-cyan-50 hover:bg-cyan-500/20"
          >
            Restart sprint
          </button>
        </div>
      </div>
    </div>
  );
}
