import { useCallback, useEffect, useRef } from "preact/hooks";
import { X } from "lucide-react";

/**
 * Shared modal shell for the arcade games.
 *
 * Deliberately mirrors what PixelDrop's own overlay does (portal to body,
 * scroll lock, focus trap, focus restore) so switching games mid-session feels
 * like one UI rather than two. PixelDrop keeps its own overlay: rewriting it
 * would mean touching its a11y-tested internals for no user-visible gain.
 */

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), canvas, [tabindex]:not([tabindex="-1"])';

function trapFocus(event, root) {
  if (!root || event.key !== "Tab") return;
  const items = [...root.querySelectorAll(FOCUSABLE)].filter(
    (el) => el.offsetParent !== null || el === document.activeElement,
  );
  if (items.length === 0) return;
  const first = items[0];
  const last = items.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

export default function GameModal({
  open,
  onClose,
  onEscape,
  title,
  subtitle,
  children,
}) {
  const dialogRef = useRef(null);
  const restoreRef = useRef(null);
  const scrollRef = useRef(0);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        (onEscape ?? onClose)();
      }
      trapFocus(event, dialogRef.current);
    },
    [onClose, onEscape],
  );

  useEffect(() => {
    if (!open) return undefined;

    restoreRef.current = document.activeElement;
    scrollRef.current = window.scrollY;
    const { body, documentElement } = document;
    const prevBody = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
    };
    const prevHtml = { overflow: documentElement.style.overflow };
    // Lock the page behind the overlay, remembering the scroll offset.
    body.style.position = "fixed";
    body.style.top = `-${window.scrollY}px`;
    body.style.width = "100%";
    documentElement.style.overflow = "hidden";

    const onKey = (event) => handleKeyDown(event);
    window.addEventListener("keydown", onKey, true);

    const raf = requestAnimationFrame(() => {
      const root = dialogRef.current;
      (root?.querySelector(FOCUSABLE) ?? root)?.focus?.();
    });

    return () => {
      window.removeEventListener("keydown", onKey, true);
      cancelAnimationFrame(raf);
      body.style.position = prevBody.position;
      body.style.top = prevBody.top;
      body.style.width = prevBody.width;
      documentElement.style.overflow = prevHtml.overflow;
      window.scrollTo(0, scrollRef.current);
      const target = restoreRef.current;
      if (target instanceof HTMLElement && document.contains(target))
        target.focus?.();
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: the backdrop is pointer-only (mousedown on the backdrop itself); Escape is handled on window
    <div
      className="game-modal-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        className="game-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
      >
        <header className="game-modal-header">
          <div>
            <h2 className="game-modal-title">{title}</h2>
            {subtitle ? (
              <p className="game-modal-subtitle">{subtitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            className="game-modal-close"
            onClick={onClose}
            aria-label={`Close ${title}`}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>
        <div className="game-modal-body">{children}</div>
      </section>
    </div>
  );
}
