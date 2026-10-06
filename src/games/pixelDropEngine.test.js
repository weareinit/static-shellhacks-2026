import { describe, expect, it } from "vitest";
import {
  COLS,
  PIECE_COLORS,
  PIECE_STATES,
  ROWS,
  canPlace,
  cellsFor,
  createBag,
  createGame,
  ghostPiece,
  hardDrop,
  hold,
  lockPiece,
  move,
  rotate,
  rotateCounterClockwise,
  softDrop,
  tick,
  togglePause,
} from "./pixelDropEngine";

const emptyBoard = () =>
  Array.from({ length: ROWS }, () => Array(COLS).fill(null));
const place = (active, board = emptyBoard()) => ({
  ...createGame(() => 0),
  board,
  active,
});
const sortCells = (cells) =>
  cells.map(([x, y]) => [x, y]).sort((a, b) => a[1] - b[1] || a[0] - b[0]);
const filled = (board) => board.flat().filter((cell) => cell !== null).length;
const lowestRowOf = (piece) => Math.max(...cellsFor(piece).map(([, y]) => y));
const oneRowShort = () => {
  const board = emptyBoard();
  board[ROWS - 1] = Array(COLS).fill(1);
  [3, 4, 5, 6].forEach((x) => {
    board[ROWS - 1][x] = null;
  });
  return board;
};
const tetrisBoard = () => {
  const board = emptyBoard();
  for (let y = ROWS - 4; y < ROWS; y++) {
    board[y] = Array(COLS).fill(1);
    board[y][0] = null;
  }
  return board;
};
const tSpinSlot = () => {
  const board = emptyBoard();
  board[10][2] = 1;
  board[12][0] = 1;
  board[12][2] = 1;
  return board;
};

describe("Pixel Drop engine", () => {
  it("creates a seven-bag containing every piece once", () => {
    expect(createBag(() => 0.5).sort()).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  it("exposes a color for every tetromino", () => {
    expect(PIECE_COLORS).toHaveLength(7);
    expect(PIECE_STATES).toHaveLength(7);
  });

  it("keeps pieces inside the board", () => {
    const game = createGame(() => 0);
    const left = move(
      { ...game, active: { type: 5, x: 0, y: 0, rotation: 0 } },
      -1,
      0,
    );
    expect(left.active.x).toBe(0);
    expect(canPlace(game.board, game.active)).toBe(true);
    expect(cellsFor(game.active)).toHaveLength(4);
  });

  it("clears completed rows, records them, and scores the clear", () => {
    const game = createGame(() => 0);
    const board = emptyBoard();
    board[ROWS - 1] = Array(COLS).fill(1);
    board[ROWS - 1][3] = null;
    board[ROWS - 1][4] = null;
    board[ROWS - 1][5] = null;
    board[ROWS - 1][6] = null;
    const locked = lockPiece(
      { ...game, board, active: { type: 0, x: 3, y: ROWS - 2, rotation: 0 } },
      () => 0,
    );
    expect(locked.lines).toBe(1);
    expect(locked.score).toBe(100);
    expect(locked.clearedRows).toEqual([ROWS - 1]);
  });

  it("only permits holding once per piece", () => {
    const game = createGame(() => 0);
    const held = hold(game, () => 0);
    expect(held.canHold).toBe(false);
    expect(hold(held, () => 0)).toBe(held);
  });

  it("hard drop locks and promotes the next piece", () => {
    const game = createGame(() => 0);
    const dropped = hardDrop(game, () => 0);
    expect(dropped.active.type).not.toBe(game.active.type);
    expect(filled(dropped.board)).toBe(4);
    expect(rotate(game)).not.toBe(game);
  });
});

describe("SRS rotation", () => {
  it("matches the canonical I-piece rotation states", () => {
    expect(sortCells(cellsFor({ type: 0, x: 0, y: 0, rotation: 0 }))).toEqual([
      [0, 1],
      [1, 1],
      [2, 1],
      [3, 1],
    ]);
    expect(sortCells(cellsFor({ type: 0, x: 0, y: 0, rotation: 1 }))).toEqual([
      [2, 0],
      [2, 1],
      [2, 2],
      [2, 3],
    ]);
    expect(sortCells(cellsFor({ type: 0, x: 0, y: 0, rotation: 2 }))).toEqual([
      [0, 2],
      [1, 2],
      [2, 2],
      [3, 2],
    ]);
    expect(sortCells(cellsFor({ type: 0, x: 0, y: 0, rotation: 3 }))).toEqual([
      [1, 0],
      [1, 1],
      [1, 2],
      [1, 3],
    ]);
  });

  it("never moves the O piece when rotating", () => {
    const game = place({ type: 1, x: 3, y: 5, rotation: 0 });
    const expected = sortCells(cellsFor(game.active));
    for (let rotation = 0; rotation < 4; rotation++) {
      expect(sortCells(cellsFor({ ...game.active, rotation }))).toEqual(
        expected,
      );
    }
  });

  it("returns every piece to its starting cells after four rotations", () => {
    for (const type of [0, 1, 2, 3, 4, 5, 6]) {
      let game = place({ type, x: 3, y: 8, rotation: 0 });
      const before = sortCells(cellsFor(game.active));
      for (let i = 0; i < 4; i++) game = rotate(game);
      expect(sortCells(cellsFor(game.active))).toEqual(before);
    }
  });

  it("treats counter-clockwise as the direct inverse of clockwise", () => {
    for (const type of [0, 2, 3, 4, 5, 6]) {
      const game = place({ type, x: 3, y: 8, rotation: 0 });
      const back = rotateCounterClockwise(rotate(game));
      expect(back).not.toBe(game);
      expect(sortCells(cellsFor(back.active))).toEqual(
        sortCells(cellsFor(game.active)),
      );
    }
  });

  it("kicks the I piece off the left wall", () => {
    const game = place({ type: 0, x: -1, y: 16, rotation: 3 });
    const rotated = rotate(game);
    expect(rotated).not.toBe(game);
    expect(canPlace(game.board, rotated.active)).toBe(true);
  });
});

describe("lock behavior", () => {
  it("caps lock resets so a wiggling piece still locks", () => {
    let game = place({ type: 1, x: 3, y: 18, rotation: 0 });
    for (let i = 0; i < 60 && filled(game.board) === 0; i++) {
      game = tick(game);
      game = move(game, game.active.x <= 1 ? 1 : -1, 0);
    }
    expect(filled(game.board)).toBeGreaterThan(0);
  });

  it("does not lock instantly on soft drop", () => {
    let game = place({ type: 1, x: 3, y: 18, rotation: 0 });
    game = softDrop(game);
    expect(filled(game.board)).toBe(0);
    game = softDrop(game);
    expect(filled(game.board)).toBe(4);
  });
});

describe("ghost piece", () => {
  it("lands directly on top of the stack", () => {
    const game = place({ type: 4, x: 3, y: 2, rotation: 0 });
    const ghost = ghostPiece(game);
    expect(ghost.y).toBeGreaterThan(game.active.y);
    expect(canPlace(game.board, { ...ghost, y: ghost.y + 1 })).toBe(false);
  });
});

describe("scoring", () => {
  it("scores multi-row clears and flags a tetris as back-to-back", () => {
    const game = {
      ...createGame(() => 0),
      board: tetrisBoard(),
      active: { type: 0, x: -1, y: ROWS - 4, rotation: 3 },
    };
    const locked = lockPiece(game, () => 0);
    expect(locked.lines).toBe(4);
    expect(locked.score).toBe(800);
    expect(locked.backToBack).toBe(true);
    expect(locked.lastClear.label).toBe("TETRIS");
  });

  it("adds a combo bonus for consecutive clears", () => {
    const game = {
      ...createGame(() => 0),
      combo: 1,
      board: oneRowShort(),
      active: { type: 0, x: 3, y: ROWS - 2, rotation: 0 },
    };
    const locked = lockPiece(game, () => 0);
    expect(locked.score).toBe(200); // 100 base + 2 * 50 combo
    expect(locked.combo).toBe(2);
  });

  it("raises the level every ten lines and flags the level up", () => {
    const game = {
      ...createGame(() => 0),
      lines: 9,
      board: oneRowShort(),
      active: { type: 0, x: 3, y: ROWS - 2, rotation: 0 },
    };
    const locked = lockPiece(game, () => 0);
    expect(locked.lines).toBe(10);
    expect(locked.level).toBe(2);
    expect(locked.lastClear.levelUp).toBe(true);
  });

  it("reports no clear event for a plain lock", () => {
    const game = {
      ...createGame(() => 0),
      active: { type: 1, x: 3, y: 18, rotation: 0 },
    };
    const locked = lockPiece(game, () => 0);
    expect(locked.lastClear).toBeNull();
    expect(locked.seq).toBe(1);
  });
});

describe("T-spin", () => {
  it("detects a T-spin after a rotation into a three-corner slot", () => {
    const game = {
      ...createGame(() => 0),
      board: tSpinSlot(),
      active: { type: 4, x: 0, y: 10, rotation: 1 },
      lastMoveWasRotation: true,
    };
    const locked = lockPiece(game, () => 0);
    expect(locked.lastClear.label).toBe("T-SPIN");
    expect(locked.score).toBe(400);
  });

  it("does not call a T-spin when the last action was not a rotation", () => {
    const game = {
      ...createGame(() => 0),
      board: tSpinSlot(),
      active: { type: 4, x: 0, y: 10, rotation: 1 },
      lastMoveWasRotation: false,
    };
    expect(lockPiece(game, () => 0).lastClear).toBeNull();
  });

  it("labels a back-to-back difficult clear", () => {
    const game = {
      ...createGame(() => 0),
      board: tetrisBoard(),
      active: { type: 0, x: -1, y: ROWS - 4, rotation: 3 },
      backToBack: true,
    };
    expect(lockPiece(game, () => 0).lastClear.label).toBe("B2B TETRIS");
  });

  it("does not chain a zero-line T-spin into back-to-back", () => {
    const game = {
      ...createGame(() => 0),
      board: tSpinSlot(),
      active: { type: 4, x: 0, y: 10, rotation: 1 },
      lastMoveWasRotation: true,
      backToBack: true,
    };
    expect(lockPiece(game, () => 0).lastClear.label).toBe("T-SPIN");
  });
});

describe("lock reset budget", () => {
  it("does not refund resets when a piece moves without descending", () => {
    const active = { type: 4, x: 3, y: 5, rotation: 0 };
    const game = {
      ...createGame(() => 0),
      active,
      lockResets: 5,
      lowestRow: lowestRowOf(active),
    };
    const moved = move(game, 1, 0);
    expect(moved.active.x).toBe(4);
    expect(moved.lockResets).toBe(5);
  });

  it("refills resets when the piece reaches a new lowest row", () => {
    const active = { type: 4, x: 3, y: 5, rotation: 0 };
    const game = {
      ...createGame(() => 0),
      active,
      lockResets: 5,
      lowestRow: lowestRowOf(active),
    };
    expect(move(game, 0, 1).lockResets).toBe(0);
  });
});

describe("pause", () => {
  it("toggles between playing and paused and ignores game over", () => {
    const game = createGame(() => 0);
    expect(togglePause(game).status).toBe("paused");
    expect(togglePause(togglePause(game)).status).toBe("playing");
    const over = { ...game, status: "gameover" };
    expect(togglePause(over)).toBe(over);
  });
});

describe("collision and shapes", () => {
  it("treats cells locked by the I piece (type 0) as blocked", () => {
    const board = emptyBoard();
    board[5][4] = 0;
    expect(canPlace(board, { type: 1, x: 3, y: 5, rotation: 0 })).toBe(false);
  });

  it("does not move a piece onto a locked I block", () => {
    const board = emptyBoard();
    board[5][4] = 0;
    const game = {
      ...createGame(() => 0),
      board,
      active: { type: 1, x: 3, y: 3, rotation: 0 },
    };
    expect(canPlace(board, game.active)).toBe(true);
    expect(move(game, 0, 1)).toBe(game);
  });

  it("defines every rotation state as a clockwise turn of the previous one", () => {
    const turn = {
      0: (cells) => cells.map(([x, y]) => [3 - y, x]),
      1: (cells) => cells,
      2: (cells) => cells.map(([x, y]) => [2 - y, x]),
      3: (cells) => cells.map(([x, y]) => [2 - y, x]),
      4: (cells) => cells.map(([x, y]) => [2 - y, x]),
      5: (cells) => cells.map(([x, y]) => [2 - y, x]),
      6: (cells) => cells.map(([x, y]) => [2 - y, x]),
    };
    const asSet = (cells) => new Set(cells.map(([x, y]) => `${x},${y}`));
    for (const type of [0, 1, 2, 3, 4, 5, 6]) {
      let expected = PIECE_STATES[type][0];
      for (let rotation = 1; rotation < 4; rotation++) {
        expected = turn[type](expected);
        expect(asSet(PIECE_STATES[type][rotation])).toEqual(asSet(expected));
      }
    }
  });

  it("keeps every piece at four distinct cells in every rotation", () => {
    for (const type of [0, 1, 2, 3, 4, 5, 6]) {
      for (let rotation = 0; rotation < 4; rotation++) {
        const cells = PIECE_STATES[type][rotation];
        expect(new Set(cells.map(([x, y]) => `${x},${y}`)).size).toBe(4);
      }
    }
  });
});
