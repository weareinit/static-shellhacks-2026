export const COLS = 10;
export const ROWS = 20;

// Single source of truth for tetromino colors (classic identities, matching the FAQ divider palette).
export const PIECE_COLORS = [
  "#3FC7EB",
  "#F7D308",
  "#5FE54C",
  "#ED1C24",
  "#AD4D9C",
  "#5A65AD",
  "#F98C28",
];

// SRS rotation states per piece, in a local grid (I in 4x4, O in 2x2, the rest in 3x3). Explicit states avoid
// the drift a runtime pivot transform causes (rotating about a box corner translates the whole piece).
// Piece order matches PIECE_COLORS: I, O, S, Z, T, J, L.
export const PIECE_STATES = [
  [
    [
      [0, 1],
      [1, 1],
      [2, 1],
      [3, 1],
    ],
    [
      [2, 0],
      [2, 1],
      [2, 2],
      [2, 3],
    ],
    [
      [0, 2],
      [1, 2],
      [2, 2],
      [3, 2],
    ],
    [
      [1, 0],
      [1, 1],
      [1, 2],
      [1, 3],
    ],
  ],
  [
    [
      [1, 0],
      [2, 0],
      [1, 1],
      [2, 1],
    ],
    [
      [1, 0],
      [2, 0],
      [1, 1],
      [2, 1],
    ],
    [
      [1, 0],
      [2, 0],
      [1, 1],
      [2, 1],
    ],
    [
      [1, 0],
      [2, 0],
      [1, 1],
      [2, 1],
    ],
  ],
  [
    [
      [1, 0],
      [2, 0],
      [0, 1],
      [1, 1],
    ],
    [
      [2, 1],
      [2, 2],
      [1, 0],
      [1, 1],
    ],
    [
      [1, 2],
      [0, 2],
      [2, 1],
      [1, 1],
    ],
    [
      [0, 1],
      [0, 0],
      [1, 2],
      [1, 1],
    ],
  ],
  [
    [
      [0, 0],
      [1, 0],
      [1, 1],
      [2, 1],
    ],
    [
      [2, 0],
      [2, 1],
      [1, 1],
      [1, 2],
    ],
    [
      [2, 2],
      [1, 2],
      [1, 1],
      [0, 1],
    ],
    [
      [0, 2],
      [0, 1],
      [1, 1],
      [1, 0],
    ],
  ],
  [
    [
      [1, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ],
    [
      [2, 1],
      [1, 0],
      [1, 1],
      [1, 2],
    ],
    [
      [1, 2],
      [2, 1],
      [1, 1],
      [0, 1],
    ],
    [
      [0, 1],
      [1, 2],
      [1, 1],
      [1, 0],
    ],
  ],
  [
    [
      [0, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ],
    [
      [2, 0],
      [1, 0],
      [1, 1],
      [1, 2],
    ],
    [
      [2, 2],
      [2, 1],
      [1, 1],
      [0, 1],
    ],
    [
      [0, 2],
      [1, 2],
      [1, 1],
      [1, 0],
    ],
  ],
  [
    [
      [2, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ],
    [
      [2, 2],
      [1, 0],
      [1, 1],
      [1, 2],
    ],
    [
      [0, 2],
      [2, 1],
      [1, 1],
      [0, 1],
    ],
    [
      [0, 0],
      [1, 2],
      [1, 1],
      [1, 0],
    ],
  ],
];

// Spawn-orientation cells, kept as the array the UI reads for previews.
export const SHAPES = PIECE_STATES.map((states) => states[0]);

// SRS wall kicks, expressed for this engine's y-down grid (the standard tables are y-up, so y is negated).
const JLSTZ_KICKS = {
  "01": [
    [0, 0],
    [-1, 0],
    [-1, -1],
    [0, 2],
    [-1, 2],
  ],
  10: [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, -2],
    [1, -2],
  ],
  12: [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, -2],
    [1, -2],
  ],
  21: [
    [0, 0],
    [-1, 0],
    [-1, -1],
    [0, 2],
    [-1, 2],
  ],
  23: [
    [0, 0],
    [1, 0],
    [1, -1],
    [0, 2],
    [1, 2],
  ],
  32: [
    [0, 0],
    [-1, 0],
    [-1, 1],
    [0, -2],
    [-1, -2],
  ],
  30: [
    [0, 0],
    [-1, 0],
    [-1, 1],
    [0, -2],
    [-1, -2],
  ],
  "03": [
    [0, 0],
    [1, 0],
    [1, -1],
    [0, 2],
    [1, 2],
  ],
};
const I_KICKS = {
  "01": [
    [0, 0],
    [-2, 0],
    [1, 0],
    [-2, 1],
    [1, -2],
  ],
  10: [
    [0, 0],
    [2, 0],
    [-1, 0],
    [2, -1],
    [-1, 2],
  ],
  12: [
    [0, 0],
    [-1, 0],
    [2, 0],
    [-1, -2],
    [2, 1],
  ],
  21: [
    [0, 0],
    [1, 0],
    [-2, 0],
    [1, 2],
    [-2, -1],
  ],
  23: [
    [0, 0],
    [2, 0],
    [-1, 0],
    [2, -1],
    [-1, 2],
  ],
  32: [
    [0, 0],
    [-2, 0],
    [1, 0],
    [-2, 1],
    [1, -2],
  ],
  30: [
    [0, 0],
    [-1, 0],
    [2, 0],
    [-1, -2],
    [2, 1],
  ],
  "03": [
    [0, 0],
    [1, 0],
    [-2, 0],
    [1, 2],
    [-2, -1],
  ],
};

const LINE_SCORES = [0, 100, 300, 500, 800];
const TSPIN_SCORES = [400, 800, 1200, 1600];
const CLEAR_NAMES = ["", "SINGLE", "DOUBLE", "TRIPLE", "TETRIS"];
const TSPIN_NAMES = [
  "T-SPIN",
  "T-SPIN SINGLE",
  "T-SPIN DOUBLE",
  "T-SPIN TRIPLE",
];
const QUEUE_SIZE = 5;
const LOCK_DELAY_TICKS = 2;
// Bounded move-resets, so a grounded piece can't be stalled forever by wiggling.
const MAX_LOCK_RESETS = 15;

const emptyBoard = () =>
  Array.from({ length: ROWS }, () => Array(COLS).fill(null));
const spawn = (type) => ({ type, x: 3, y: 0, rotation: 0 });
const lowestRowOf = (piece) => Math.max(...cellsFor(piece).map(([, y]) => y));

export function cellsFor(piece) {
  return PIECE_STATES[piece.type][piece.rotation].map(([x, y]) => [
    x + piece.x,
    y + piece.y,
  ]);
}

export function canPlace(board, piece) {
  return cellsFor(piece).every(
    ([x, y]) =>
      x >= 0 && x < COLS && y >= 0 && y < ROWS && board[y][x] === null,
  );
}

const kicksFor = (type, from, to) =>
  (type === 0 ? I_KICKS : JLSTZ_KICKS)[`${from}${to}`] ?? [[0, 0]];

const isGrounded = (board, active) =>
  !canPlace(board, { ...active, y: active.y + 1 });

function createGameState(active) {
  return {
    board: emptyBoard(),
    active,
    queue: [],
    hold: null,
    canHold: true,
    score: 0,
    lines: 0,
    level: 1,
    combo: -1,
    lockTicks: 0,
    lockResets: 0,
    lowestRow: lowestRowOf(active),
    lastMoveWasRotation: false,
    backToBack: false,
    clearedRows: [],
    lastClear: null,
    seq: 0,
    status: "playing",
  };
}

// Applies a placed active piece. The move-reset budget only refills when the piece reaches a new lowest row,
// so a kick that lifts a piece can no longer refund resets.
function settle(game, active, wasRotation) {
  const row = lowestRowOf(active);
  const next = {
    ...game,
    active,
    lastMoveWasRotation: wasRotation,
    lowestRow: Math.max(game.lowestRow, row),
  };
  if (row > game.lowestRow) return { ...next, lockTicks: 0, lockResets: 0 };
  if (!isGrounded(game.board, active)) return { ...next, lockTicks: 0 };
  if (game.lockResets >= MAX_LOCK_RESETS) return next;
  return { ...next, lockTicks: 0, lockResets: game.lockResets + 1 };
}

export function createBag(random = Math.random) {
  const bag = SHAPES.map((_, type) => type);
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
}

function refill(queue, random) {
  let next = queue;
  while (next.length < QUEUE_SIZE) next = [...next, ...createBag(random)];
  return next;
}

function promote(game, random, canHold = true) {
  const queue = refill(game.queue.slice(1), random);
  const active = spawn(game.queue[0]);
  const next = {
    ...game,
    active,
    queue,
    canHold,
    lockTicks: 0,
    lockResets: 0,
    lowestRow: lowestRowOf(active),
    lastMoveWasRotation: false,
    seq: game.seq + 1,
  };
  return canPlace(next.board, active) ? next : { ...next, status: "gameover" };
}

export function createGame(random = Math.random) {
  const queue = createBag(random);
  return { ...createGameState(spawn(queue[0])), queue: queue.slice(1) };
}

export function move(game, dx, dy) {
  if (game.status !== "playing") return game;
  const active = {
    ...game.active,
    x: game.active.x + dx,
    y: game.active.y + dy,
  };
  return canPlace(game.board, active) ? settle(game, active, false) : game;
}

function rotateTo(game, step) {
  if (game.status !== "playing") return game;
  const from = game.active.rotation;
  const to = (from + step) % 4;
  for (const [dx, dy] of kicksFor(game.active.type, from, to)) {
    const active = {
      ...game.active,
      rotation: to,
      x: game.active.x + dx,
      y: game.active.y + dy,
    };
    if (canPlace(game.board, active)) return settle(game, active, true);
  }
  return game;
}

export function rotate(game) {
  return rotateTo(game, 1);
}

export function rotateCounterClockwise(game) {
  return rotateTo(game, 3);
}

// The landing position for the ghost preview.
export function ghostPiece(game) {
  let active = game.active;
  while (canPlace(game.board, { ...active, y: active.y + 1 }))
    active = { ...active, y: active.y + 1 };
  return active;
}

// A T-spin is a T locked immediately after a rotation, with at least three of its 3x3 box corners occupied.
function detectTSpin(game) {
  if (game.active.type !== 4 || !game.lastMoveWasRotation) return false;
  const { x, y } = game.active;
  const occupied = (cx, cy) =>
    cx < 0 ||
    cx >= COLS ||
    cy >= ROWS ||
    (cy >= 0 && game.board[cy][cx] !== null);
  return (
    [
      [x, y],
      [x + 2, y],
      [x, y + 2],
      [x + 2, y + 2],
    ].filter(([cx, cy]) => occupied(cx, cy)).length >= 3
  );
}

function mergeAndClear(game) {
  const board = game.board.map((row) => [...row]);
  cellsFor(game.active).forEach(([x, y]) => {
    board[y][x] = game.active.type;
  });
  const clearedRows = [];
  board.forEach((row, y) => {
    if (row.every((cell) => cell !== null)) clearedRows.push(y);
  });
  const rows = board.filter((_, y) => !clearedRows.includes(y));
  const cleared = clearedRows.length;
  const nextBoard = [
    ...Array.from({ length: cleared }, () => Array(COLS).fill(null)),
    ...rows,
  ];

  const tSpin = detectTSpin(game);
  const base = tSpin
    ? TSPIN_SCORES[Math.min(cleared, 3)]
    : LINE_SCORES[cleared];
  const difficult = cleared === 4 || (tSpin && cleared > 0);
  const backToBack = difficult && game.backToBack;
  const combo = cleared ? game.combo + 1 : -1;
  const points =
    base * game.level * (backToBack ? 1.5 : 1) +
    (cleared && combo > 0 ? combo * 50 * game.level : 0);
  const level = Math.floor((game.lines + cleared) / 10) + 1;

  const name = tSpin ? TSPIN_NAMES[Math.min(cleared, 3)] : CLEAR_NAMES[cleared];
  const label = name ? `${backToBack ? "B2B " : ""}${name}` : null;
  const lastClear = label
    ? {
        label,
        lines: cleared,
        points: Math.round(points),
        levelUp: level > game.level,
        tSpin,
        backToBack,
      }
    : null;

  return {
    ...game,
    board: nextBoard,
    score: game.score + Math.round(points),
    lines: game.lines + cleared,
    level,
    combo,
    backToBack: difficult,
    clearedRows,
    lastClear,
  };
}

export function lockPiece(game, random = Math.random) {
  if (game.status !== "playing") return game;
  return promote(mergeAndClear(game), random);
}

export function softDrop(game, random = Math.random) {
  const moved = move(game, 0, 1);
  if (moved !== game) return { ...moved, score: moved.score + 1 };
  // Blocked: fall through to the same lock-delay path as gravity instead of locking instantly.
  return tick(game, random);
}

export function hardDrop(game, random = Math.random) {
  if (game.status !== "playing") return game;
  let dropped = game;
  let distance = 0;
  while (true) {
    const moved = move(dropped, 0, 1);
    if (moved === dropped) break;
    dropped = moved;
    distance++;
  }
  return lockPiece({ ...dropped, score: dropped.score + distance * 2 }, random);
}

export function tick(game, random = Math.random) {
  if (game.status !== "playing") return game;
  const moved = move(game, 0, 1);
  if (moved !== game) return moved;
  if (game.lockTicks + 1 >= LOCK_DELAY_TICKS) return lockPiece(game, random);
  return { ...game, lockTicks: game.lockTicks + 1 };
}

export function hold(game, random = Math.random) {
  if (game.status !== "playing" || !game.canHold) return game;
  if (game.hold === null)
    return promote({ ...game, hold: game.active.type }, random, false);
  const active = spawn(game.hold);
  const next = {
    ...game,
    hold: game.active.type,
    active,
    canHold: false,
    lockTicks: 0,
    lockResets: 0,
    lowestRow: lowestRowOf(active),
    lastMoveWasRotation: false,
  };
  return canPlace(next.board, active) ? next : { ...next, status: "gameover" };
}

export function togglePause(game) {
  if (game.status === "gameover") return game;
  return { ...game, status: game.status === "playing" ? "paused" : "playing" };
}
