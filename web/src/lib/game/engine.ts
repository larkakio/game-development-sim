import {
  GRID_SIZE,
  type Cell,
  type Direction,
  type GameState,
  type Grid,
  type LevelConfig,
  type PipeStage,
  type Tile,
} from "./types";

function emptyGrid(): Grid {
  const rows: Cell[][] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    const row: Cell[] = [];
    for (let c = 0; c < GRID_SIZE; c++) row.push(null);
    rows.push(row);
  }
  return rows;
}

function cloneGrid(grid: Grid): Grid {
  return grid.map((row) => [...row]);
}

function randomEmptyCells(grid: Grid): { row: number; col: number }[] {
  const out: { row: number; col: number }[] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === null) out.push({ row: r, col: c });
    }
  }
  return out;
}

export function spawnTile(
  grid: Grid,
  bugChance: number,
): { grid: Grid; spawned: boolean } {
  const g = cloneGrid(grid);
  const empties = randomEmptyCells(g);
  if (empties.length === 0) return { grid: g, spawned: false };
  const spot = empties[Math.floor(Math.random() * empties.length)];
  const roll = Math.random();
  g[spot.row][spot.col] =
    roll < bugChance ? { kind: "bug" } : { kind: "pipe", stage: 0 };
  return { grid: g, spawned: true };
}

function mergePair(
  a: Tile,
  b: Tile,
): { tile: Tile | null; score: number; stressDelta: number } | null {
  const qaBug =
    (a.kind === "qa" && b.kind === "bug") || (a.kind === "bug" && b.kind === "qa");
  if (qaBug) {
    return { tile: null, score: 150, stressDelta: -22 };
  }
  if (a.kind === "pipe" && b.kind === "pipe" && a.stage === b.stage) {
    if (a.stage >= 4) return null;
    const ns = (a.stage + 1) as PipeStage;
    const score = 20 + (ns + 1) * (ns + 1) * 15;
    const stressDelta = ns >= 2 ? -9 : 0;
    return { tile: { kind: "pipe", stage: ns }, score, stressDelta };
  }
  return null;
}

/** Merge line for a left swipe; cells index 0 is the “wall”. */
function mergeLineLeft(cells: Cell[]): {
  line: Cell[];
  score: number;
  stressDelta: number;
} {
  const tiles = cells.filter((c): c is Tile => c !== null);
  const out: Tile[] = [];
  let score = 0;
  let stressDelta = 0;
  let i = 0;
  while (i < tiles.length) {
    const a = tiles[i];
    const b = tiles[i + 1];
    if (b) {
      const m = mergePair(a, b);
      if (m) {
        score += m.score;
        stressDelta += m.stressDelta;
        if (m.tile) out.push(m.tile);
        i += 2;
        continue;
      }
    }
    out.push(a);
    i += 1;
  }
  const line: Cell[] = [...out, ...Array(GRID_SIZE - out.length).fill(null)] as Cell[];
  return { line, score, stressDelta };
}

function getRows(grid: Grid): Cell[][] {
  return grid.map((row) => [...row]);
}

function transpose(g: Grid): Grid {
  const t = emptyGrid();
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      t[c][r] = g[r][c];
    }
  }
  return t;
}

function moveLeft(grid: Grid): { grid: Grid; score: number; stressDelta: number; changed: boolean } {
  const rows = getRows(grid);
  let score = 0;
  let stressDelta = 0;
  let changed = false;
  const nextRows = rows.map((row) => {
    const before = row.join("|");
    const { line, score: s, stressDelta: sd } = mergeLineLeft(row);
    score += s;
    stressDelta += sd;
    if (before !== line.join("|")) changed = true;
    return line;
  });
  return { grid: nextRows as Grid, score, stressDelta, changed };
}

export function moveGrid(
  grid: Grid,
  direction: Direction,
): { grid: Grid; score: number; stressDelta: number; changed: boolean } {
  let g = cloneGrid(grid);
  if (direction === "left") return moveLeft(g);
  if (direction === "right") {
    g = g.map((row) => [...row].reverse());
    const res = moveLeft(g);
    return { ...res, grid: res.grid.map((row) => [...row].reverse()) };
  }
  if (direction === "up") {
    g = transpose(g);
    const res = moveLeft(g);
    return { ...res, grid: transpose(res.grid) };
  }
  // down
  g = transpose(g);
  g = g.map((row) => [...row].reverse());
  const res = moveLeft(g);
  let out = res.grid.map((row) => [...row].reverse());
  out = transpose(out);
  return { ...res, grid: out };
}

function hasReachedStage(grid: Grid, stage: number): boolean {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const cell = grid[r][c];
      if (cell?.kind === "pipe" && cell.stage >= stage) return true;
    }
  }
  return false;
}

export function checkWin(state: GameState, level: LevelConfig): boolean {
  if (state.status !== "playing") return false;
  if (level.goal.type === "reach_stage") {
    return hasReachedStage(state.grid, level.goal.stage);
  }
  return state.score >= level.goal.min;
}

export function checkLost(state: GameState, level: LevelConfig): boolean {
  if (state.movesLeft <= 0) return true;
  if (state.stress >= level.stressMax) return true;
  return false;
}

const STRESS_PER_MOVE = 4;

export function createInitialState(level: LevelConfig): GameState {
  let grid = emptyGrid();
  const a = spawnTile(grid, 0);
  grid = a.grid;
  const b = spawnTile(grid, 0);
  grid = b.grid;
  /** Rare QA tile on start for tutorial feel */
  const empties = randomEmptyCells(grid);
  if (empties.length > 0 && Math.random() < 0.35) {
    const spot = empties[Math.floor(Math.random() * empties.length)];
    grid[spot.row][spot.col] = { kind: "qa" };
  }

  return {
    grid,
    score: 0,
    stress: 12,
    movesLeft: level.moves,
    levelId: level.id,
    status: "playing",
  };
}

export function applyMove(
  state: GameState,
  direction: Direction,
  level: LevelConfig,
): GameState {
  if (state.status !== "playing") return state;
  const { grid, score: addScore, stressDelta, changed } = moveGrid(
    state.grid,
    direction,
  );
  if (!changed) return state;

  const score = state.score + addScore;
  const stress = Math.min(
    level.stressMax,
    Math.max(0, state.stress + stressDelta + STRESS_PER_MOVE),
  );
  const movesLeft = state.movesLeft - 1;
  let nextGrid = grid;
  const spawn = spawnTile(nextGrid, level.bugSpawnChance);
  nextGrid = spawn.grid;

  let status: GameState["status"] = "playing";
  const interim: GameState = {
    ...state,
    grid: nextGrid,
    score,
    stress,
    movesLeft,
    lastMove: direction,
  };
  if (checkWin(interim, level)) status = "won";
  else if (checkLost({ ...interim, status: "playing" }, level)) status = "lost";
  return { ...interim, status };
}

export function tileLabel(tile: Tile): string {
  if (tile.kind === "bug") return "Bug";
  if (tile.kind === "qa") return "QA";
  const labels = ["Fragment", "Module", "Alpha", "Beta", "Gold"];
  return labels[tile.stage] ?? "Tile";
}
