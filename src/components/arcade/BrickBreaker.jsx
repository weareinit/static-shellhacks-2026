import { useEffect, useRef, useState } from "preact/hooks";
import { createBrickBreaker } from "@games/brickBreakerEngine";

const LABEL =
  "A tiny brick-breaker game. The bricks spell out 404. Move to bounce the ball, catch falling powerups.";

/**
 * Brick Breaker, mounted either inline on /404 or inside the arcade modal.
 *
 * The component is only a shell: the canvas, the hiscore line and the engine
 * lifecycle. Nothing here reaches for a document-level id, which is what lets
 * the same game appear in two places on the site.
 */
export default function BrickBreaker({
  /** Distinct storage key per surface so scores don't overwrite each other. */
  bestKey = "lite-pong-best",
  /** Arrow keys and space drive the game. Off inside the arcade modal. */
  keyboard = true,
  /** Mirror state on window.__brickDebug (dev/test only). */
  exposeDebug = false,
  showHint = true,
}) {
  const canvasRef = useRef(null);
  const [hiscore, setHiscore] = useState("HISCORE LVL 1 0");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const engine = createBrickBreaker(canvas, {
      bestKey,
      keyboard,
      exposeDebug,
      onHiscore: setHiscore,
    });
    return () => engine.destroy();
  }, [bestKey, keyboard, exposeDebug]);

  return (
    <div className="w-full">
      <p className="brick-hiscore">{hiscore}</p>
      <canvas
        ref={canvasRef}
        width={360}
        height={480}
        className="brick-canvas"
        style={{ touchAction: "none" }}
        role="img"
        aria-label={LABEL}
      />
      {showHint ? (
        <p className="brick-hint">move to play · click to serve and shoot</p>
      ) : null}
    </div>
  );
}
