import { useEffect, useRef, useState } from "preact/hooks";
import { Gamepad2 } from "lucide-react";
import GameModal from "./GameModal";
import BrickBreaker from "./BrickBreaker";
import PixelDrop from "../PixelDrop";

const GAMES = [
  {
    id: "pixel-drop",
    name: "PIXEL DROP",
    blurb:
      "Full guideline Tetris. Hold, ghost piece, T-spins, back-to-back combos.",
    accent: "#f97d7d",
  },
  {
    id: "brick-breaker",
    name: "BRICK BREAKER",
    blurb:
      "Bounce through the 404 bricks. Catch powerups, grab the guns, clear levels.",
    accent: "#8fc0ff",
  },
];

function GamePicker({ onPick }) {
  return (
    <ul className="arcade-picker">
      {GAMES.map(({ id, name, blurb, accent }) => (
        <li key={id}>
          <button
            type="button"
            className="arcade-card"
            style={{ "--arcade-accent": accent }}
            onClick={() => onPick(id)}
          >
            <span className="arcade-card-name">{name}</span>
            <span className="arcade-card-blurb">{blurb}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

/**
 * Site-wide arcade entry point.
 *
 * In the app, Pixel Drop was opened by clicking the Tetris-shaped checkerboard
 * divider at the bottom of the FAQ, and Brick Breaker lived on /404 with no link
 * to it at all. Both are now reachable from one button, and both run in modals,
 * so the games no longer depend on where you happen to be on the page.
 *
 * Pixel Drop is mounted on its own rather than inside GameModal: it already
 * renders its own overlay, focus trap and body scroll lock (it did so as the
 * FAQ's modal in the app), and two overlays locking the document at once fight
 * each other.
 */
export default function ArcadeLauncher() {
  const [open, setOpen] = useState(false);
  const [game, setGame] = useState(null);
  const triggerRef = useRef(null);
  const wasOpenRef = useRef(false);

  const active = GAMES.find((g) => g.id === game) ?? null;

  // Escape steps back one level (game -> picker -> closed), while the close
  // button always dismisses the whole arcade: a button labelled "close" that
  // only goes halfway is the kind of thing people learn to distrust.
  const handleBack = () => {
    if (game) {
      setGame(null);
      return;
    }
    setOpen(false);
  };

  const closeAll = () => {
    setGame(null);
    setOpen(false);
  };

  // Return focus to the launcher when the arcade closes - but only on the way
  // out. Focusing it on mount would steal focus from the document on page load,
  // which turns Space into "open the arcade" instead of "scroll the page".
  useEffect(() => {
    if (wasOpenRef.current && !open) triggerRef.current?.focus?.();
    wasOpenRef.current = open;
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="arcade-fab"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        <span className="arcade-fab-ring" aria-hidden="true" />
        <Gamepad2 size={26} aria-hidden="true" />
        <span className="sr-only">Open the ShellHacks arcade</span>
      </button>

      {game === "pixel-drop" ? (
        <PixelDrop open onClose={handleBack} />
      ) : (
        <GameModal
          open={open}
          onClose={closeAll}
          onEscape={handleBack}
          title={active ? active.name : "SHELLHACKS ARCADE"}
          subtitle={active ? active.blurb : "Two games from the 2026 site."}
        >
          {active ? (
            <BrickBreaker bestKey="lite-pong-best-arcade" />
          ) : (
            <GamePicker onPick={setGame} />
          )}
        </GameModal>
      )}
    </>
  );
}
