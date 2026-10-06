/**
 * Brick Breaker ("lite-pong") game engine.
 *
 * Extracted from the app's 404 page, where the whole game lived in an inline
 * <script is:inline> that registered document-level listeners and looked the
 * canvas up by id on every frame. The physics below is unchanged from that
 * original: fixed 1/120s timestep, convex paddle parabola, swept brick
 * collision, min-angle clamp, powerups and guns. What changed is the plumbing:
 *
 *   - the canvas is passed in instead of queried from the document, so the
 *     game can be mounted inside the arcade modal and on /404 at the same time
 *   - input is bound to the canvas element (plus window keys, which only exist
 *     while mounted, so a closed modal never captures keystrokes)
 *   - the hiscore line is reported through a callback rather than a global id
 *   - the frame loop is cancellable, so unmounting actually stops it
 */

const DEFAULTS = {
  W: 360,
  H: 480,
  // Storage key for the persisted best. Distinct per surface so the modal and
  // the 404 page can each keep their own score history.
  bestKey: "lite-pong-best",
  /** Called when the hiscore text changes, so the host can render it. */
  onHiscore: null,
  /**
   * Whether arrow keys and space reach the game while it is mounted. Off for
   * the arcade modal (it has its own key handling) and on for /404.
   */
  keyboard: true,
  /** Mirror state onto window.__brickDebug for automated tests. */
  exposeDebug: false,
};

export function createBrickBreaker(canvas, options = {}) {
  const opts = { ...DEFAULTS, ...options };

  const W = opts.W;
  const H = opts.H;
  const BLUE = "#8fc0ff";
  const AMBER = "#ffb000";
  const DIM = "rgba(143,192,255,0.55)";

  const PADDLE_W = 60;
  const PADDLE_H = 8;
  const BALL_R = 5;
  // Per-second units: physics advances in fixed 1/120s steps so the game
  // runs at the same speed on 60/90/120Hz displays and through frame jank.
  const STEP = 1 / 120;
  const BASE_SPEED = 216; // == old 3.6px/frame @60fps
  const MAX_SPEED = BASE_SPEED * 2.2;
  const KEY_SPEED = 420; // == old 7px/frame @60fps

  // Brick board spelling out 404: three 5x7 glyphs, middle one amber.
  const GLYPHS = {
    4: ["X...X", "X...X", "X...X", "XXXXX", "....X", "....X", "....X"],
    0: [".XXX.", "X...X", "X...X", "X.X.X", "X...X", "X...X", ".XXX."],
  };
  const BOARD = [
    { glyph: "4", color: BLUE },
    { glyph: "0", color: AMBER },
    { glyph: "4", color: BLUE },
  ];
  const COLS = 17;
  const ROWS = 7;
  const BOARD_X = 16;
  const BOARD_Y = 46;
  const GAP = 4;
  const BRICK_W = (W - BOARD_X * 2 - GAP * (COLS - 1)) / COLS;
  const BRICK_H = 14;
  const PADDLE_Y = H - 24;

  const keys = { left: false, right: false };
  let paddleX = (W - PADDLE_W) / 2;
  let paddleTarget = paddleX;
  let balls = [];
  let bolts = []; // single-shot projectiles flying upward
  let pickups = []; // falling powerups to catch with the paddle
  let lives = 3;
  const MAX_LIVES = 3;
  let gun = { type: null, ammo: 0 }; // type: "single" | "multi"
  const DROP_RATE = 0.08;
  const PICKUP_VY = 130;
  const PICKUP_R = 9;
  const BOLT_VY = -560;
  let live = false;
  let over = null; // null | "lost" | "win" | "retry"
  let bricks = [];
  let bestLevel = 1;
  let bestScore = 0;
  let lastHs = "";
  let level = 1;
  let score = 0;
  let raf = 0;
  let last = null;
  let acc = 0;
  let destroyed = false;

  // Hiscore persists across sessions. Private-mode failures fall back to
  // a session-only best.
  function loadBest() {
    try {
      const raw = window.localStorage.getItem(opts.bestKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (
        typeof parsed.level === "number" &&
        typeof parsed.score === "number"
      ) {
        return parsed;
      }
    } catch {}
    return null;
  }

  function saveBest() {
    if (level > bestLevel || (level === bestLevel && score > bestScore)) {
      bestLevel = level;
      bestScore = score;
      try {
        window.localStorage.setItem(
          opts.bestKey,
          JSON.stringify({ level: bestLevel, score: bestScore }),
        );
      } catch {}
    }
  }

  function buildBricks() {
    bricks = [];
    let col = 0;
    BOARD.forEach((digit) => {
      const glyph = GLYPHS[digit.glyph];
      for (let gx = 0; gx < 5; gx++) {
        for (let gy = 0; gy < ROWS; gy++) {
          if (glyph[gy][gx] !== "X") continue;
          // Level 1 is all 1-hit; deeper levels roll bonus HP.
          let hp = 1 + Math.floor(Math.random() * level);
          if (hp > 5) hp = 5;
          bricks.push({
            x: BOARD_X + (col + gx) * (BRICK_W + GAP),
            y: BOARD_Y + gy * (BRICK_H + GAP),
            color: digit.color,
            alive: true,
            hp,
            maxHp: hp,
          });
        }
      }
      col += 6;
    });
  }

  function cleared() {
    let n = 0;
    for (let i = 0; i < bricks.length; i++) if (!bricks[i].alive) n++;
    return n;
  }

  function makeBall() {
    const angle = (Math.random() * 0.8 + 0.3) * (Math.random() < 0.5 ? 1 : -1);
    return {
      x: paddleX + PADDLE_W / 2,
      y: PADDLE_Y - BALL_R - 1,
      vx: Math.sin(angle) * BASE_SPEED,
      vy: -Math.cos(angle) * BASE_SPEED,
    };
  }

  function serve() {
    balls = [makeBall()];
    over = null;
    live = true;
  }

  // Click/space: serve when idle, shoot when live with an armed gun.
  function shoot() {
    if (!live || gun.ammo <= 0 || !gun.type) return;
    if (gun.type === "single") {
      bolts.push({ x: paddleX + PADDLE_W / 2, y: PADDLE_Y - 8 });
    } else {
      balls.push(makeBall());
    }
    gun.ammo -= 1;
    if (gun.ammo <= 0) gun.type = null;
  }

  function press() {
    if (!live) serve();
    else shoot();
  }

  function clampTarget(v) {
    paddleTarget = Math.max(0, Math.min(W - PADDLE_W, v));
  }

  // Surface height of the convex paddle at a ball x position.
  // Parabola through the lens profile: (Y+2) at the ends, (Y-2) center.
  function paddleSurfaceY(bx) {
    let t = (bx - paddleX) / PADDLE_W;
    t = Math.max(0, Math.min(1, t));
    const u = 2 * t - 1;
    return PADDLE_Y + 2 - 4 * (1 - u * u);
  }

  function speedUp(b) {
    let s = Math.hypot(b.vx, b.vy) * 1.015;
    if (s > MAX_SPEED) s = MAX_SPEED;
    const cur = Math.hypot(b.vx, b.vy) || 1;
    b.vx = (b.vx / cur) * s;
    b.vy = (b.vy / cur) * s;
  }

  // Never allow a near-vertical ball: it clears one column, then loops
  // in the empty shaft forever. Floor the horizontal component instead.
  function enforceMinAngle(b) {
    const speed = Math.hypot(b.vx, b.vy);
    const minX = speed * 0.25;
    if (Math.abs(b.vx) < minX) {
      const sign =
        b.vx === 0 ? (Math.random() < 0.5 ? -1 : 1) : Math.sign(b.vx);
      b.vx = sign * minX;
      b.vy =
        Math.sign(b.vy || -1) *
        Math.sqrt(Math.max(speed * speed - minX * minX, 0));
    }
  }

  function damageBrick(b) {
    b.hp -= 1;
    score += 1;
    if (b.hp > 0) return false;
    b.alive = false;
    maybeDrop(b.x + BRICK_W / 2, b.y + BRICK_H / 2);
    return true;
  }

  function maybeDrop(x, y) {
    if (Math.random() >= DROP_RATE) return;
    const r = Math.random();
    // 40% health, 30% single-shot gun, 30% multiball gun.
    const kind = r < 0.4 ? "health" : r < 0.7 ? "single" : "multi";
    pickups.push({ x, y, kind });
  }

  function applyPickup(kind) {
    if (kind === "health") {
      if (lives < MAX_LIVES) lives += 1;
      return;
    }
    // Single grants 3 ammo, multi grants 1; max 6 held either way.
    // A different gun replaces the armed one.
    const grant = kind === "single" ? 3 : 1;
    if (gun.type === kind) gun.ammo = Math.min(6, gun.ammo + grant);
    else gun = { type: kind, ammo: Math.min(6, grant) };
  }

  function hitBricks(dt, ball) {
    const py = ball.y - ball.vy * dt;
    for (let i = 0; i < bricks.length; i++) {
      const b = bricks[i];
      if (!b.alive) continue;
      if (
        ball.x + BALL_R < b.x ||
        ball.x - BALL_R > b.x + BRICK_W ||
        ball.y + BALL_R < b.y ||
        ball.y - BALL_R > b.y + BRICK_H
      ) {
        continue;
      }
      damageBrick(b);
      // Bounce off the shallow axis using the previous position.
      if (py + BALL_R <= b.y || py - BALL_R >= b.y + BRICK_H) {
        ball.vy = ball.vy > 0 ? -Math.abs(ball.vy) : Math.abs(ball.vy);
      } else {
        ball.vx = ball.vx > 0 ? -Math.abs(ball.vx) : Math.abs(ball.vx);
      }
      speedUp(ball);
      enforceMinAngle(ball);
      return true;
    }
    return false;
  }

  function stepPickups(dt) {
    for (let i = pickups.length - 1; i >= 0; i--) {
      const p = pickups[i];
      p.y += PICKUP_VY * dt;
      if (p.y > H + 12) {
        pickups.splice(i, 1);
        continue;
      }
      if (
        p.y >= PADDLE_Y - 6 &&
        p.y <= PADDLE_Y + PADDLE_H + 6 &&
        p.x >= paddleX - PICKUP_R &&
        p.x <= paddleX + PADDLE_W + PICKUP_R
      ) {
        applyPickup(p.kind);
        pickups.splice(i, 1);
      }
    }
  }

  function stepBolts(dt) {
    for (let i = bolts.length - 1; i >= 0; i--) {
      const t = bolts[i];
      t.y += BOLT_VY * dt;
      if (t.y < -12) {
        bolts.splice(i, 1);
        continue;
      }
      for (let j = 0; j < bricks.length; j++) {
        const b = bricks[j];
        if (!b.alive) continue;
        if (
          t.x >= b.x - 2 &&
          t.x <= b.x + BRICK_W + 2 &&
          t.y >= b.y &&
          t.y <= b.y + BRICK_H
        ) {
          damageBrick(b);
          bolts.splice(i, 1);
          break;
        }
      }
    }
  }

  function step(dt) {
    if (keys.left) paddleTarget -= KEY_SPEED * dt;
    if (keys.right) paddleTarget += KEY_SPEED * dt;
    paddleTarget = Math.max(0, Math.min(W - PADDLE_W, paddleTarget));
    // Same easing feel as the old 0.35/frame @60fps, time-corrected.
    const ease = 1 - 0.65 ** (dt * 60);
    paddleX += (paddleTarget - paddleX) * ease;

    stepPickups(dt);
    stepBolts(dt);

    if (bricks.length > 0 && cleared() === bricks.length) {
      level += 1;
      if (lives < MAX_LIVES) lives += 1;
      buildBricks();
      balls = [];
      bolts = [];
      pickups = [];
      live = false;
      over = "win";
      return;
    }

    if (!live) return;

    for (let bi = balls.length - 1; bi >= 0; bi--) {
      const ball = balls[bi];
      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;

      if (ball.x < BALL_R) {
        ball.x = BALL_R;
        ball.vx = Math.abs(ball.vx);
      } else if (ball.x > W - BALL_R) {
        ball.x = W - BALL_R;
        ball.vx = -Math.abs(ball.vx);
      }
      if (ball.y < BALL_R) {
        ball.y = BALL_R;
        ball.vy = Math.abs(ball.vy);
      }

      hitBricks(dt, ball);

      // Paddle bounce on the convex surface: angle depends on where the
      // ball lands, height follows the lens curve.
      const surf = paddleSurfaceY(ball.x);
      if (
        ball.vy > 0 &&
        ball.y + BALL_R >= surf &&
        ball.y + BALL_R <= surf + 12 &&
        ball.x >= paddleX - BALL_R &&
        ball.x <= paddleX + PADDLE_W + BALL_R
      ) {
        let rel = (ball.x - (paddleX + PADDLE_W / 2)) / (PADDLE_W / 2);
        rel = Math.max(-1, Math.min(1, rel));
        const speed = Math.min(Math.hypot(ball.vx, ball.vy), MAX_SPEED);
        const bounce = rel * 1.1;
        ball.vx = Math.sin(bounce) * speed;
        ball.vy = -Math.cos(bounce) * speed;
        ball.y = surf - BALL_R;
        enforceMinAngle(ball);
      }

      // Past the paddle: this ball drains.
      if (ball.y - BALL_R > H) balls.splice(bi, 1);
    }

    // All balls drained: lose a life, or game over when none remain.
    if (balls.length === 0) {
      bolts = [];
      pickups = [];
      if (lives > 1) {
        lives -= 1;
        live = false;
        over = "retry";
      } else {
        saveBest();
        lives = MAX_LIVES;
        level = 1;
        score = 0;
        buildBricks();
        live = false;
        over = "lost";
      }
    }
  }

  function draw() {
    // Re-sync the backing store when the node is new or DPR changed;
    // assigning width resets the bitmap, so only do it on mismatch.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== Math.round(W * dpr)) {
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = BLUE;
    ctx.font = "12px 'IBM Plex Mono', monospace";
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    ctx.fillText(`LVL ${level} ${score}`, 10, 8);
    const hsText = `HISCORE LVL ${bestLevel} ${bestScore}`;
    if (hsText !== lastHs) {
      lastHs = hsText;
      opts.onHiscore?.(hsText);
    }

    for (let i = 0; i < bricks.length; i++) {
      const b = bricks[i];
      if (!b.alive) continue;
      // Damaged bricks fade: full color at full HP.
      ctx.globalAlpha = 0.3 + (0.7 * b.hp) / b.maxHp;
      ctx.fillStyle = b.color;
      ctx.fillRect(b.x, b.y, BRICK_W, BRICK_H);
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = BLUE;

    // Paddle: slightly convex lens (top edge arcs upward) with softly
    // rounded top corners. Collision stays an approximation (see step()).
    {
      const x0 = Math.round(paddleX);
      const cr = 3;
      ctx.beginPath();
      ctx.moveTo(x0, PADDLE_Y + PADDLE_H);
      ctx.lineTo(x0, PADDLE_Y + 2 + cr);
      ctx.quadraticCurveTo(x0, PADDLE_Y + 2, x0 + cr, PADDLE_Y + 2);
      ctx.quadraticCurveTo(
        x0 + PADDLE_W / 2,
        PADDLE_Y - 6,
        x0 + PADDLE_W - cr,
        PADDLE_Y + 2,
      );
      ctx.quadraticCurveTo(
        x0 + PADDLE_W,
        PADDLE_Y + 2,
        x0 + PADDLE_W,
        PADDLE_Y + 2 + cr,
      );
      ctx.lineTo(x0 + PADDLE_W, PADDLE_Y + PADDLE_H);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = DIM;
    ctx.font = "10px 'IBM Plex Mono', monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    // Lives as green dots + armed gun label right-aligned below paddle.
    {
      const dotR = 4;
      const dotGap = 16;
      const cy = H - 6;
      const dotsW = (MAX_LIVES - 1) * dotGap;
      const x = (W - dotsW) / 2;
      for (let li = 0; li < MAX_LIVES; li++) {
        const cx = x + li * dotGap;
        if (li < lives) {
          ctx.fillStyle = "#5fe54c";
          ctx.beginPath();
          ctx.arc(cx, cy, dotR, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.strokeStyle = "rgba(143,192,255,0.3)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(cx, cy, dotR, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      if (gun.type) {
        ctx.fillStyle = DIM;
        ctx.textAlign = "right";
        ctx.fillText(
          `${gun.type === "single" ? "SINGLE-SHOT " : "MULTI-BALL "}${gun.ammo}`,
          W - 10,
          H - 10,
        );
        ctx.textAlign = "left";
      }
    }
    ctx.textAlign = "left";
    if (live || over) {
      ctx.fillStyle = "#ffffff";
      for (let bi = 0; bi < balls.length; bi++) {
        ctx.beginPath();
        ctx.arc(balls[bi].x, balls[bi].y, BALL_R, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = AMBER;
      for (let ti = 0; ti < bolts.length; ti++) {
        ctx.fillRect(bolts[ti].x - 1.5, bolts[ti].y - 10, 3, 10);
      }
      ctx.fillStyle = BLUE;
    }

    for (let pi = 0; pi < pickups.length; pi++) {
      const pk = pickups[pi];
      ctx.fillStyle =
        pk.kind === "health"
          ? "#5fe54c"
          : pk.kind === "single"
            ? "#22d3ee"
            : "#c084fc";
      ctx.beginPath();
      ctx.arc(pk.x, pk.y, PICKUP_R, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#0b1020";
      ctx.font = "15px 'IBM Plex Mono', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        pk.kind === "health" ? "H" : pk.kind === "single" ? "S" : "M",
        pk.x,
        pk.y + 0.5,
      );
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillStyle = BLUE;
    }

    if (!live) {
      ctx.fillStyle = DIM;
      ctx.font = "12px 'IBM Plex Mono', monospace";
      ctx.textAlign = "center";
      let prompt = "CLICK TO SERVE";
      if (over === "win") prompt = `LVL ${level} — CLICK TO SERVE`;
      else if (over === "lost") prompt = "GAME OVER — CLICK TO SERVE";
      else if (over === "retry") prompt = "BALL LOST — CLICK TO SERVE";
      ctx.fillText(prompt, W / 2, H - 60);
    }
  }

  function frame(t) {
    if (destroyed) return;
    if (last == null) last = t;
    // Clamp so a backgrounded tab doesn't spiral on return.
    acc += Math.min(t - last, 100) / 1000;
    last = t;
    while (acc >= STEP) {
      step(STEP);
      acc -= STEP;
    }
    draw();
    raf = requestAnimationFrame(frame);
  }

  // ── Input ──────────────────────────────────────────────────────────────
  function canvasX(clientX) {
    const rect = canvas.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * W - PADDLE_W / 2;
  }

  const onPointerMove = (e) => {
    if (e.pointerType === "touch") return; // touch drags are handled by pointerdown
    clampTarget(canvasX(e.clientX));
  };

  const onPointerDown = (e) => {
    clampTarget(canvasX(e.clientX));
    press();
  };

  const onKeyDown = (e) => {
    if (!opts.keyboard || destroyed) return;
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A")
      keys.left = true;
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D")
      keys.right = true;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      press();
    }
  };

  const onKeyUp = (e) => {
    keys.left = e.key === "ArrowLeft" || e.key === "a" || e.key === "A";
    keys.right = e.key === "ArrowRight" || e.key === "d" || e.key === "D";
  };

  // Best effort for touch: follow the finger while it is down.
  const onPointerMoveTouch = (e) => {
    if (e.pointerType !== "touch" || e.buttons === 0) return;
    clampTarget(canvasX(e.clientX));
  };

  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointermove", onPointerMoveTouch);
  canvas.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  const saved = loadBest();
  if (saved) {
    bestLevel = saved.level;
    bestScore = saved.score;
  }

  const debug = () => {
    const first = balls[0] || { x: 0, y: 0, vx: 0, vy: 0 };
    return {
      x: first.x,
      y: first.y,
      vx: first.vx,
      vy: first.vy,
      live,
      level,
      score,
      lives,
      gun: gun.type,
      ammo: gun.ammo,
      balls: balls.length,
      pickups: pickups.map((p) => ({
        x: Math.round(p.x),
        y: Math.round(p.y),
        kind: p.kind,
      })),
      bestLevel,
      bestScore,
      remaining: bricks.length - cleared(),
    };
  };

  buildBricks();

  if (opts.exposeDebug) window.__brickDebug = debug;

  // Nothing moves until the visitor acts, so reduced-motion users only ever
  // see animation they caused. The loop still runs to track input.
  raf = requestAnimationFrame(frame);

  function destroy() {
    destroyed = true;
    cancelAnimationFrame(raf);
    canvas.removeEventListener("pointermove", onPointerMove);
    canvas.removeEventListener("pointermove", onPointerMoveTouch);
    canvas.removeEventListener("pointerdown", onPointerDown);
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
    if (opts.exposeDebug) delete window.__brickDebug;
  }

  return { debug, destroy, press, serve };
}
