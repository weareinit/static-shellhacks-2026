// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createBrickBreaker } from "./brickBreakerEngine";

/**
 * A canvas stub good enough for the engine: it never draws (jsdom has no 2D
 * context) but it records the listeners the engine attaches, which is what
 * most of these tests are about.
 */
function makeCanvas() {
  const listeners = new Map();
  const drawn = { text: [], rects: [] };
  // A recording 2D context: enough surface for draw(), and it lets the tests
  // assert that text actually reaches the screen (e.g. the hiscore line).
  const ctx = {
    globalAlpha: 1,
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 1,
    font: "",
    textAlign: "",
    textBaseline: "",
    setTransform() {},
    clearRect() {},
    fillRect: (x, y, w, h) => drawn.rects.push([x, y, w, h]),
    fillText: (text) => drawn.text.push(text),
    beginPath() {},
    closePath() {},
    moveTo() {},
    lineTo() {},
    quadraticCurveTo() {},
    arc() {},
    fill() {},
    stroke() {},
  };
  return {
    width: 360,
    height: 480,
    listeners,
    drawn,
    getContext: () => ctx,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 360, height: 480 }),
    addEventListener(type, fn) {
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type).push(fn);
    },
    removeEventListener(type, fn) {
      const list = listeners.get(type) ?? [];
      const i = list.indexOf(fn);
      if (i >= 0) list.splice(i, 1);
    },
    dispatch(type, event) {
      for (const fn of listeners.get(type) ?? []) fn(event);
    },
  };
}

/** Drive requestAnimationFrame by hand so tests never wait on real time. */
function fakeRaf() {
  const frames = [];
  const spy = vi
    .spyOn(globalThis, "requestAnimationFrame")
    .mockImplementation((cb) => {
      frames.push(cb);
      return frames.length;
    });
  const cancel = vi
    .spyOn(globalThis, "cancelAnimationFrame")
    .mockImplementation(() => {});
  return {
    spy,
    cancel,
    /** Advance the loop by `ms`, in the rAF cadence a browser would use. */
    tick(ms = 16, step = 16) {
      let now = 0;
      for (let elapsed = 0; elapsed < ms; elapsed += step) {
        now += step;
        const batch = frames.splice(0, frames.length);
        for (const cb of batch) cb(now);
      }
    },
    get pending() {
      return frames.length;
    },
  };
}

describe("brickBreakerEngine", () => {
  let raf;
  let canvas;

  beforeEach(() => {
    window.localStorage.clear();
    raf = fakeRaf();
    canvas = makeCanvas();
  });

  afterEach(() => {
    raf.spy.mockRestore();
    raf.cancel.mockRestore();
    vi.restoreAllMocks();
  });

  it("starts idle on level 1 with the full brick board", () => {
    const engine = createBrickBreaker(canvas);
    const state = engine.debug();

    expect(state.level).toBe(1);
    expect(state.live).toBe(false);
    expect(state.lives).toBe(3);
    expect(state.balls).toBe(0);
    // 404 in 5x7 glyphs: two 4s (14 lit cells each) and a 0 (17 cells).
    expect(state.remaining).toBe(45);

    engine.destroy();
  });

  it("serves a ball on pointer press and the ball moves on the next frames", () => {
    const engine = createBrickBreaker(canvas);
    const startY = canvas.dispatch("pointerdown", {
      clientX: 180,
      pointerType: "mouse",
    });

    expect(startY).toBeUndefined();
    expect(engine.debug().live).toBe(true);
    expect(engine.debug().balls).toBe(1);

    const before = engine.debug().y;
    raf.tick(200);
    expect(engine.debug().y).toBeLessThan(before); // served upward

    engine.destroy();
  });

  it("does not serve until the player acts", () => {
    const engine = createBrickBreaker(canvas);
    raf.tick(500);
    expect(engine.debug().balls).toBe(0);
    engine.destroy();
  });

  it("bounces the ball off the top wall instead of losing it", () => {
    const engine = createBrickBreaker(canvas);
    canvas.dispatch("pointerdown", { clientX: 180, pointerType: "mouse" });
    // Serve points up at ~216px/s, so 3s is enough to cross the board twice.
    raf.tick(3000);

    const state = engine.debug();
    expect(state.lives).toBe(3);
    expect(state.live).toBe(true);
    expect(state.y).toBeGreaterThanOrEqual(0);

    engine.destroy();
  });

  it("keeps the paddle inside the canvas when dragged past the edges", () => {
    const engine = createBrickBreaker(canvas);
    canvas.dispatch("pointermove", { clientX: -500, pointerType: "mouse" });
    canvas.dispatch("pointermove", { clientX: 5000, pointerType: "mouse" });
    // The paddle is only observable through the ball it serves, so assert the
    // clamped target does not throw the ball off-board when served at an edge.
    canvas.dispatch("pointerdown", { clientX: 5000, pointerType: "mouse" });
    raf.tick(500);

    expect(engine.debug().x).toBeLessThanOrEqual(360);
    expect(engine.debug().x).toBeGreaterThanOrEqual(0);

    engine.destroy();
  });

  it("ignores arrow and space keys when keyboard is disabled", () => {
    const engine = createBrickBreaker(canvas, { keyboard: false });
    window.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
    expect(engine.debug().live).toBe(false);

    engine.destroy();
  });

  it("serves on space when keyboard is enabled", () => {
    const engine = createBrickBreaker(canvas, { keyboard: true });
    window.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
    expect(engine.debug().live).toBe(true);

    engine.destroy();
  });

  it("reports the hiscore line through the callback", () => {
    const onHiscore = vi.fn();
    createBrickBreaker(canvas, { onHiscore });
    raf.tick(32);
    expect(onHiscore).toHaveBeenCalledWith("HISCORE LVL 1 0");
  });

  it("reads the persisted best from its own storage key only", () => {
    window.localStorage.setItem(
      "bb-a",
      JSON.stringify({ level: 7, score: 420 }),
    );
    window.localStorage.setItem(
      "bb-b",
      JSON.stringify({ level: 2, score: 12 }),
    );

    const a = createBrickBreaker(makeCanvas(), { bestKey: "bb-a" });
    expect(a.debug().bestLevel).toBe(7);
    expect(a.debug().bestScore).toBe(420);
    a.destroy();

    const b = createBrickBreaker(makeCanvas(), { bestKey: "bb-b" });
    expect(b.debug().bestLevel).toBe(2);
    b.destroy();

    const c = createBrickBreaker(makeCanvas(), { bestKey: "bb-unseen" });
    expect(c.debug().bestLevel).toBe(1);
    expect(c.debug().bestScore).toBe(0);
    c.destroy();
  });

  it("survives a corrupt or foreign value in local storage", () => {
    window.localStorage.setItem("bb-bad", "{not json");
    expect(() =>
      createBrickBreaker(makeCanvas(), { bestKey: "bb-bad" }).destroy(),
    ).not.toThrow();

    window.localStorage.setItem("bb-shape", JSON.stringify({ level: "9" }));
    const engine = createBrickBreaker(makeCanvas(), { bestKey: "bb-shape" });
    expect(engine.debug().bestLevel).toBe(1);
    engine.destroy();
  });

  it("detaches every listener and stops the loop on destroy", () => {
    const engine = createBrickBreaker(canvas, { exposeDebug: true });
    raf.tick(32);
    expect(window.__brickDebug).toBeTypeOf("function");

    engine.destroy();

    expect(canvas.listeners.get("pointermove")).toHaveLength(0);
    expect(canvas.listeners.get("pointerdown")).toHaveLength(0);
    expect(raf.cancel).toHaveBeenCalled();
    expect(window.__brickDebug).toBeUndefined();

    // Key presses after teardown must not resurrect the game.
    window.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
    expect(engine.debug().live).toBe(false);
  });
});
