import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Pause,
  Play,
  RefreshCcw,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  X,
  ArrowDownToLine,
} from "lucide-react";
import { createPortal } from "preact/compat";
import { useEffect, useRef, useState } from "preact/hooks";
import {
  COLS,
  PIECE_COLORS,
  ROWS,
  SHAPES,
  cellsFor,
  createGame,
  ghostPiece,
  hardDrop,
  hold,
  move,
  rotate,
  rotateCounterClockwise,
  softDrop,
  tick,
  togglePause,
} from "../games/pixelDropEngine";

const HIGH_SCORE_KEY = "shellhacks-pixel-drop-high-score";
const MUTE_KEY = "pixel-drop-muted";

const SOUNDS = {
  move: { freq: 220, dur: 0.05, gain: 0.05 },
  rotate: { freq: 330, dur: 0.06, gain: 0.06 },
  drop: { freq: 180, to: 90, dur: 0.08, gain: 0.07 },
  lock: { freq: 130, to: 60, dur: 0.1, gain: 0.08 },
  clear: { freq: 520, to: 780, dur: 0.18, gain: 0.08 },
  tspin: { freq: 620, to: 940, dur: 0.22, gain: 0.08 },
  start: { freq: 440, to: 660, dur: 0.12, gain: 0.07 },
  gameover: { freq: 260, to: 70, dur: 0.5, gain: 0.09 },
};

// Cycles Tab focus within the dialog so it can't escape to the page behind the modal.
function trapFocus(event, root) {
  if (!root) return;
  const focusables = root.querySelectorAll(
    'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
  );
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const active = document.activeElement;
  if (event.shiftKey && (active === first || !root.contains(active))) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && (active === last || !root.contains(active))) {
    event.preventDefault();
    first.focus();
  }
}

function MiniButton({ label, onClick, children, disabled = false, keymap }) {
  return (
    <div className="pixel-drop-control-wrap">
      <button
        type="button"
        className="pixel-drop-control"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        title={label}
      >
        {children}
      </button>
      {keymap && <kbd className="pixel-drop-keymap">{keymap}</kbd>}
    </div>
  );
}

function PieceGlyph({ type, muted = false }) {
  const hasPiece = type !== null && type !== undefined;
  const cells = hasPiece
    ? new Set(SHAPES[type].map(([x, y]) => `${x},${y}`))
    : null;
  return (
    <div
      className={`pixel-drop-glyph${muted ? " is-muted" : ""}`}
      style={hasPiece ? { "--pixel-color": PIECE_COLORS[type] } : undefined}
    >
      {Array.from({ length: 16 }, (_, index) => {
        const filledCell = cells
          ? cells.has(`${index % 4},${Math.floor(index / 4)}`)
          : false;
        return <i key={index} className={filledCell ? "is-filled" : ""} />;
      })}
    </div>
  );
}

function Readout({ label, value }) {
  return (
    <div className="pixel-drop-readout">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Header({ onClose }) {
  return (
    <header className="pixel-drop-header">
      <div>
        <p>Shellhacks</p>
        <h2 id="pixel-drop-title">PIXEL DROP</h2>
      </div>
      <MiniButton label="Close game" onClick={onClose} keymap="ESC">
        <X size={20} strokeWidth={3} />
      </MiniButton>
    </header>
  );
}

function Actions({
  paused,
  isGameOver,
  muted,
  onTogglePause,
  onToggleMute,
  onRestart,
}) {
  const pauseLabel = paused ? "Resume game" : "Pause game";
  return (
    <div className="pixel-drop-actions">
      <div>
        <button
          type="button"
          onClick={onTogglePause}
          disabled={isGameOver}
          aria-label={pauseLabel}
          title={pauseLabel}
        >
          {paused ? (
            <Play size={16} fill="currentColor" />
          ) : (
            <Pause size={16} fill="currentColor" />
          )}
        </button>
        <kbd>P</kbd>
      </div>
      <div>
        <button
          type="button"
          onClick={onToggleMute}
          aria-label={muted ? "Unmute sound" : "Mute sound"}
          title={muted ? "Unmute sound" : "Mute sound"}
        >
          {muted ? (
            <VolumeX size={16} strokeWidth={3} />
          ) : (
            <Volume2 size={16} strokeWidth={3} />
          )}
        </button>
        <kbd>M</kbd>
      </div>
      <div className={isGameOver ? "is-gameover" : ""}>
        <button
          type="button"
          onClick={onRestart}
          aria-label={isGameOver ? "Play again" : "Restart game"}
          title={isGameOver ? "Play again" : "Restart game"}
        >
          <RefreshCcw size={16} strokeWidth={3} />
        </button>
        <kbd>R</kbd>
      </div>
    </div>
  );
}

function TouchControls({
  disabled,
  canHold,
  onMoveLeft,
  onRotateCounter,
  onRotateClockwise,
  onMoveRight,
  onSoftDrop,
  onHold,
  onHardDrop,
}) {
  return (
    <fieldset className="pixel-drop-touch-controls">
      <legend className="sr-only">Game controls</legend>
      <MiniButton
        label="Move left"
        onClick={onMoveLeft}
        disabled={disabled}
        keymap="A"
      >
        <ArrowLeft size={22} strokeWidth={3} />
      </MiniButton>
      <MiniButton
        label="Rotate counterclockwise"
        onClick={onRotateCounter}
        disabled={disabled}
        keymap="Z"
      >
        <RotateCcw size={22} strokeWidth={3} />
      </MiniButton>
      <MiniButton
        label="Rotate clockwise"
        onClick={onRotateClockwise}
        disabled={disabled}
        keymap="W"
      >
        <RotateCw size={22} strokeWidth={3} />
      </MiniButton>
      <MiniButton
        label="Move right"
        onClick={onMoveRight}
        disabled={disabled}
        keymap="D"
      >
        <ArrowRight size={22} strokeWidth={3} />
      </MiniButton>
      <MiniButton
        label="Soft drop"
        onClick={onSoftDrop}
        disabled={disabled}
        keymap="S"
      >
        <ArrowDown size={22} strokeWidth={3} />
      </MiniButton>
      <MiniButton
        label="Hold piece"
        onClick={onHold}
        disabled={disabled || !canHold}
        keymap="C"
      >
        HOLD
      </MiniButton>
      <MiniButton
        label="Hard drop"
        onClick={onHardDrop}
        disabled={disabled}
        keymap="SPACE"
      >
        <ArrowDownToLine size={22} strokeWidth={4} />
        <span className="pixel-drop-hard-drop"></span>
      </MiniButton>
    </fieldset>
  );
}

const buildBoardLabel = ({ started, isGameOver, lines, level, score }) => {
  if (!started) return "Pixel Drop board. Press space or tap to start.";
  if (isGameOver)
    return `Pixel Drop board. Game over. ${lines} lines, score ${score}.`;
  return `Pixel Drop board. ${lines} lines, level ${level}, score ${score}.`;
};

export default function PixelDrop({ open, onClose }) {
  const dialogRef = useRef(null);
  const [game, setGame] = useState(createGame);
  const gameRef = useRef(game);
  const [highScore, setHighScore] = useState(0);
  const [started, setStarted] = useState(false);
  const startedRef = useRef(false);
  const [muted, setMuted] = useState(true);
  const mutedRef = useRef(true);
  const audioRef = useRef(null);
  const touchRef = useRef(null);
  const [flashRows, setFlashRows] = useState([]);
  const [banner, setBanner] = useState(null);
  const [locking, setLocking] = useState(false);

  const commit = (next) => {
    gameRef.current = next;
    setGame(next);
  };

  // iOS suspends audio contexts created outside a user gesture and ignores
  // resume() calls made outside one, so the context must be created/resumed
  // from an actual tap or keypress (unmute, start, replay).
  const ensureAudioContext = () => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      if (!audioRef.current) audioRef.current = new Ctx();
      const context = audioRef.current;
      if (context.state === "suspended") context.resume();
      return context;
    } catch {
      return null;
    }
  };

  const playSound = (kind) => {
    if (mutedRef.current) return;
    const context = ensureAudioContext();
    if (!context) return;
    try {
      const spec = SOUNDS[kind] ?? SOUNDS.move;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const now = context.currentTime;
      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(spec.freq, now);
      if (spec.to)
        oscillator.frequency.exponentialRampToValueAtTime(
          spec.to,
          now + spec.dur,
        );
      gain.gain.setValueAtTime(spec.gain, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + spec.dur);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + spec.dur);
    } catch {}
  };

  const apply = (operation, sound) => {
    const current = gameRef.current;
    const next = operation(current);
    if (next !== current && sound) playSound(sound);
    commit(next);
  };

  const newGame = (autoStart) => {
    startedRef.current = autoStart;
    setStarted(autoStart);
    setFlashRows([]);
    setBanner(null);
    setLocking(false);
    commit(createGame());
  };

  const startGame = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    setStarted(true);
    playSound("start");
  };

  const playAgain = () => {
    newGame(true);
    playSound("start");
  };

  const moveLeft = () => apply((current) => move(current, -1, 0), "move");
  const moveRight = () => apply((current) => move(current, 1, 0), "move");
  const rotateClockwise = () => apply(rotate, "rotate");
  const rotateCounter = () => apply(rotateCounterClockwise, "rotate");
  const holdPiece = () => apply(hold, "move");
  const dropHard = () => apply(hardDrop);
  const drop = () => apply(tick);
  const softDropAction = () => {
    const current = gameRef.current;
    const next = softDrop(current);
    // Only chirp when the piece actually moved; a blocked soft drop just burns lock delay (the lock effect covers that).
    if (
      next !== current &&
      next.seq === current.seq &&
      next.active !== current.active
    )
      playSound("drop");
    commit(next);
  };
  const toggleGamePause = () => {
    if (gameRef.current.status === "gameover") return;
    apply(togglePause);
  };
  const toggleMute = () => {
    const next = !mutedRef.current;
    mutedRef.current = next;
    setMuted(next);
    // Unlock audio synchronously inside the tap/keypress gesture so iOS
    // allows the context to run; without this it stays suspended forever.
    if (!next) ensureAudioContext();
    try {
      window.localStorage.setItem(MUTE_KEY, next ? "1" : "0");
    } catch {}
  };

  useEffect(() => {
    startedRef.current = started;
  }, [started]);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement;
    try {
      setHighScore(Number(window.localStorage.getItem(HIGH_SCORE_KEY)) || 0);
    } catch {}
    try {
      const stored = window.localStorage.getItem(MUTE_KEY);
      const nextMuted = stored === null ? true : stored === "1";
      mutedRef.current = nextMuted;
      setMuted(nextMuted);
    } catch {}
    newGame(false);
    requestAnimationFrame(() =>
      dialogRef.current?.focus({ preventScroll: true }),
    );
    return () => {
      if (previous && typeof previous.focus === "function")
        previous.focus({ preventScroll: true });
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const scrollY = window.scrollY;
    const body = document.body;
    const html = document.documentElement;
    const previous = {
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyLeft: body.style.left,
      bodyRight: body.style.right,
      bodyWidth: body.style.width,
      bodyOverflow: body.style.overflow,
      htmlOverflow: html.style.overflow,
    };

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    html.style.overflow = "hidden";

    return () => {
      body.style.position = previous.bodyPosition;
      body.style.top = previous.bodyTop;
      body.style.left = previous.bodyLeft;
      body.style.right = previous.bodyRight;
      body.style.width = previous.bodyWidth;
      body.style.overflow = previous.bodyOverflow;
      html.style.overflow = previous.htmlOverflow;
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !started || game.status !== "playing") return;
    const delay = Math.max(130, 720 - (game.level - 1) * 55);
    const timer = window.setInterval(drop, delay);
    return () => window.clearInterval(timer);
  }, [open, started, game.status, game.level]);

  useEffect(() => {
    if (!open) return;
    const onVisibility = () => {
      if (
        document.visibilityState === "hidden" &&
        gameRef.current.status === "playing"
      )
        commit(togglePause(gameRef.current));
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event) => {
      if (event.key === "Tab") return trapFocus(event, dialogRef.current);
      if (event.key === "Escape") return onClose();
      if (event.key === "m" || event.key === "M") return toggleMute();
      if (!startedRef.current) {
        if (event.key === " " || event.key === "Enter") {
          event.preventDefault();
          startGame();
        }
        return;
      }
      if (gameRef.current.status === "gameover") {
        if ([" ", "Enter", "r", "R"].includes(event.key)) {
          event.preventDefault();
          playAgain();
        }
        return;
      }
      const actions = {
        ArrowLeft: moveLeft,
        ArrowRight: moveRight,
        ArrowDown: softDropAction,
        ArrowUp: rotateClockwise,
        a: moveLeft,
        A: moveLeft,
        d: moveRight,
        D: moveRight,
        s: softDropAction,
        S: softDropAction,
        w: rotateClockwise,
        W: rotateClockwise,
        z: rotateCounter,
        Z: rotateCounter,
        x: rotateClockwise,
        X: rotateClockwise,
        c: holdPiece,
        C: holdPiece,
        " ": dropHard,
        p: toggleGamePause,
        P: toggleGamePause,
        r: playAgain,
        R: playAgain,
      };
      if (!actions[event.key]) return;
      event.preventDefault();
      actions[event.key]();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || game.score <= highScore) return;
    setHighScore(game.score);
    try {
      window.localStorage.setItem(HIGH_SCORE_KEY, String(game.score));
    } catch {}
  }, [open, game.score, highScore]);

  // One effect per lock: clears get a banner + flash, plain locks get a thunk and a short board pulse.
  useEffect(() => {
    if (!open || game.seq === 0) return;
    if (game.lastClear) {
      playSound(game.lastClear.tSpin ? "tspin" : "clear");
      setBanner({ ...game.lastClear, combo: game.combo });
      if (game.clearedRows?.length) setFlashRows(game.clearedRows);
      const bannerTimer = window.setTimeout(() => setBanner(null), 1100);
      const flashTimer = window.setTimeout(() => setFlashRows([]), 220);
      return () => {
        window.clearTimeout(bannerTimer);
        window.clearTimeout(flashTimer);
      };
    }
    playSound("lock");
    setLocking(true);
    const lockTimer = window.setTimeout(() => setLocking(false), 140);
    return () => window.clearTimeout(lockTimer);
  }, [open, game.seq]);

  useEffect(() => {
    if (open && game.status === "gameover") playSound("gameover");
  }, [open, game.status]);

  const onBoardClick = () => {
    if (gameRef.current.status === "gameover") return playAgain();
    if (!startedRef.current) return startGame();
  };

  // Enter/Space on the focused board mirror the click affordance. Stop propagation so the global
  // handler doesn't process the same press twice; other keys must keep bubbling for game controls.
  const onBoardKeyDown = (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    if (!startedRef.current || gameRef.current.status === "gameover") {
      event.preventDefault();
      event.stopPropagation();
      onBoardClick();
    }
  };

  const onTouchStart = (event) => {
    const touch = event.touches[0];
    touchRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      moved: false,
      at: Date.now(),
    };
  };

  const onTouchMove = (event) => {
    const point = touchRef.current;
    if (!point || !startedRef.current || gameRef.current.status !== "playing")
      return;
    const touch = event.touches[0];
    const dx = touch.clientX - point.x;
    const dy = touch.clientY - point.y;
    const step = 26;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) >= step) {
        if (dx > 0) {
          moveRight();
          point.x += step;
        } else {
          moveLeft();
          point.x -= step;
        }
        point.moved = true;
      }
    } else if (dy >= step) {
      softDropAction();
      point.y += step;
      point.moved = true;
    } else if (dy <= -step) {
      dropHard();
      point.moved = true;
    }
  };

  const onTouchEnd = () => {
    const point = touchRef.current;
    touchRef.current = null;
    if (!point || point.moved || Date.now() - point.at > 300) return;
    if (gameRef.current.status === "gameover") return playAgain();
    if (!startedRef.current) return startGame();
    rotateClockwise();
  };

  if (!open) return null;

  const isGameOver = game.status === "gameover";
  const activeCells = new Map(
    cellsFor(game.active).map(([x, y]) => [`${x},${y}`, game.active.type]),
  );
  const ghostCells = new Set(
    !isGameOver && started
      ? cellsFor(ghostPiece(game)).map(([x, y]) => `${x},${y}`)
      : [],
  );
  const nextTypes = game.queue.slice(0, 5);
  const status = isGameOver
    ? "GAME OVER"
    : game.status === "paused"
      ? "PAUSED"
      : game.canHold
        ? "HOLD READY"
        : "PIECE LOCKED";
  const controlsDisabled = isGameOver || !started;

  return createPortal(
    // biome-ignore lint/a11y/noStaticElementInteractions: backdrop is pointer-only; Escape closes the dialog
    <div
      className="pixel-drop-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        className="pixel-drop-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pixel-drop-title"
        aria-describedby="pixel-drop-help"
        tabIndex="-1"
      >
        <Header onClose={onClose} />
        <div className="pixel-drop-layout">
          <div
            className={`pixel-drop-board${locking ? " is-locking" : ""}`}
            role="application"
            aria-label={buildBoardLabel({
              started,
              isGameOver,
              lines: game.lines,
              level: game.level,
              score: game.score,
            })}
            onClick={onBoardClick}
            onKeyDown={onBoardKeyDown}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {Array.from({ length: ROWS * COLS }, (_, index) => {
              const x = index % COLS;
              const y = Math.floor(index / COLS);
              const key = `${x},${y}`;
              const active = activeCells.get(key);
              const value = active !== undefined ? active : game.board[y][x];
              const isGhost =
                (value === null || value === undefined) && ghostCells.has(key);
              const cls =
                value !== null && value !== undefined
                  ? " is-filled"
                  : isGhost
                    ? " is-ghost"
                    : "";
              const color =
                value !== null && value !== undefined
                  ? PIECE_COLORS[value]
                  : isGhost
                    ? PIECE_COLORS[game.active.type]
                    : undefined;
              return (
                <span
                  key={index}
                  className={`pixel-drop-cell${cls}`}
                  style={color ? { "--pixel-color": color } : undefined}
                />
              );
            })}
            {flashRows.map((y) => (
              <span
                key={`clear-${y}`}
                className="pixel-drop-clear"
                style={{
                  top: `${(y / ROWS) * 100}%`,
                  height: `${100 / ROWS}%`,
                }}
              />
            ))}
            {banner && (
              <div
                className={`pixel-drop-banner${banner.tSpin ? " is-tspin" : ""}`}
                role="status"
              >
                <strong>{banner.label}</strong>
                <span className="pixel-drop-banner-points">
                  +{banner.points}
                </span>
                {banner.combo > 0 && <span>COMBO ×{banner.combo + 1}</span>}
                {banner.levelUp && <span>LEVEL UP</span>}
              </div>
            )}
            {!started && !isGameOver && (
              <div className="pixel-drop-start">
                <strong>PRESS SPACE</strong>
                <span>or tap to start</span>
              </div>
            )}
            {isGameOver && (
              <div className="pixel-drop-gameover">
                <strong>GAME OVER</strong>
                <span>Press R or tap to play again</span>
              </div>
            )}
          </div>
          <aside className="pixel-drop-stats">
            <div className="pixel-drop-readout-row">
              <Readout
                label="SCORE"
                value={game.score.toString().padStart(6, "0")}
              />
              <Readout
                label="HIGH"
                value={highScore.toString().padStart(6, "0")}
              />
            </div>
            <div className="pixel-drop-readout-row">
              <Readout label="LINES" value={game.lines} />
              <Readout label="LEVEL" value={game.level} />
            </div>
            <div className="pixel-drop-panel-row">
              <div className="pixel-drop-next">
                <span>NEXT</span>
                <div className="pixel-drop-next-list">
                  {nextTypes.map((type, index) => (
                    <PieceGlyph key={index} type={type} />
                  ))}
                </div>
              </div>
              <div className="pixel-drop-next">
                <span>HOLD</span>
                <div className="pixel-drop-next-list">
                  <PieceGlyph type={game.hold} muted={!game.canHold} />
                </div>
              </div>
            </div>
            <p className="pixel-drop-status" aria-live="polite">
              {status}
            </p>
            <Actions
              paused={game.status === "paused"}
              isGameOver={isGameOver}
              muted={muted}
              onTogglePause={toggleGamePause}
              onToggleMute={toggleMute}
              onRestart={playAgain}
            />
          </aside>
        </div>
        <TouchControls
          disabled={controlsDisabled}
          canHold={game.canHold}
          onMoveLeft={moveLeft}
          onRotateCounter={rotateCounter}
          onRotateClockwise={rotateClockwise}
          onMoveRight={moveRight}
          onSoftDrop={softDropAction}
          onHold={holdPiece}
          onHardDrop={dropHard}
        />
        <p id="pixel-drop-help" className="pixel-drop-help">
          Arrows or WASD move and rotate, Z/X rotate, C holds, Space hard drops,
          P pauses, M mutes, R restarts.
        </p>
      </section>
    </div>,
    document.body,
  );
}
