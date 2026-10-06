// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/preact";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as engine from "../games/pixelDropEngine";
import PixelDrop from "./PixelDrop";

// Icons are decorative; stubbing lucide avoids its react/preact interop in the test runtime.
vi.mock("lucide-react", () => {
  const Icon = () => null;
  return {
    ArrowDown: Icon,
    ArrowDownToLine: Icon,
    ArrowLeft: Icon,
    ArrowRight: Icon,
    Pause: Icon,
    Play: Icon,
    RefreshCcw: Icon,
    RotateCcw: Icon,
    RotateCw: Icon,
    Volume2: Icon,
    VolumeX: Icon,
    X: Icon,
  };
});

// hardDrop stays real by default; tests override it once to force a lock result deterministically.
vi.mock("../games/pixelDropEngine", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, hardDrop: vi.fn(actual.hardDrop) };
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

beforeEach(() => {
  window.scrollTo = () => {};
});

describe("PixelDrop", () => {
  it("renders nothing while closed", () => {
    render(<PixelDrop open={false} onClose={() => {}} />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens on a start gate and restores focus when closed", () => {
    const trigger = document.createElement("button");
    document.body.appendChild(trigger);
    trigger.focus();

    const { rerender } = render(<PixelDrop open={false} onClose={() => {}} />);
    rerender(<PixelDrop open onClose={() => {}} />);
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByText("PRESS SPACE")).toBeTruthy();

    rerender(<PixelDrop open={false} onClose={() => {}} />);
    expect(document.activeElement).toBe(trigger);
    trigger.remove();
  });

  it("starts the game on Space", () => {
    render(<PixelDrop open onClose={() => {}} />);
    fireEvent.keyDown(window, { key: " " });
    expect(screen.queryByText("PRESS SPACE")).toBeNull();
  });

  it("pauses and resumes", () => {
    render(<PixelDrop open onClose={() => {}} />);
    fireEvent.keyDown(window, { key: " " });
    fireEvent.keyDown(window, { key: "p" });
    expect(screen.getByText("PAUSED")).toBeTruthy();
    fireEvent.keyDown(window, { key: "P" });
    expect(screen.getByText(/HOLD READY|PIECE LOCKED/)).toBeTruthy();
  });

  it("locks a piece onto the board on hard drop", () => {
    render(<PixelDrop open onClose={() => {}} />);
    fireEvent.keyDown(window, { key: " " });
    const before = document.querySelectorAll(
      ".pixel-drop-cell.is-filled",
    ).length;
    fireEvent.keyDown(window, { key: " " });
    const after = document.querySelectorAll(
      ".pixel-drop-cell.is-filled",
    ).length;
    expect(before).toBe(4);
    expect(after).toBeGreaterThan(before);
  });

  it("persists the mute preference", () => {
    render(<PixelDrop open onClose={() => {}} />);
    fireEvent.click(screen.getByLabelText("Unmute sound"));
    expect(window.localStorage.getItem("pixel-drop-muted")).toBe("0");
  });

  it("previews five upcoming pieces", () => {
    render(<PixelDrop open onClose={() => {}} />);
    const next = document.querySelectorAll(".pixel-drop-next")[0];
    expect(next.querySelectorAll(".pixel-drop-glyph")).toHaveLength(5);
  });

  it("starts on a tap", () => {
    render(<PixelDrop open onClose={() => {}} />);
    const board = document.querySelector(".pixel-drop-board");
    fireEvent.touchStart(board, { touches: [{ clientX: 120, clientY: 200 }] });
    fireEvent.touchEnd(board, {
      changedTouches: [{ clientX: 120, clientY: 200 }],
    });
    expect(screen.queryByText("PRESS SPACE")).toBeNull();
  });

  it("keeps Tab focus inside the dialog", () => {
    render(<PixelDrop open onClose={() => {}} />);
    const dialog = screen.getByRole("dialog");
    const buttons = dialog.querySelectorAll("button:not(:disabled)");
    buttons[buttons.length - 1].focus();
    fireEvent.keyDown(window, { key: "Tab" });
    expect(document.activeElement).toBe(buttons[0]);
  });

  it("restarts on R", () => {
    render(<PixelDrop open onClose={() => {}} />);
    fireEvent.keyDown(window, { key: " " });
    fireEvent.keyDown(window, { key: " " });
    const score = () =>
      document.querySelector(".pixel-drop-readout strong").textContent;
    expect(score()).not.toBe("000000");
    fireEvent.keyDown(window, { key: "r" });
    expect(score()).toBe("000000");
  });

  it("replays when the board is tapped after game over", () => {
    render(<PixelDrop open onClose={() => {}} />);
    fireEvent.keyDown(window, { key: " " });
    for (
      let i = 0;
      i < 200 && !document.querySelector(".pixel-drop-gameover");
      i++
    ) {
      fireEvent.keyDown(window, { key: " " });
    }
    expect(document.querySelector(".pixel-drop-gameover")).toBeTruthy();
    const board = document.querySelector(".pixel-drop-board");
    fireEvent.touchStart(board, { touches: [{ clientX: 100, clientY: 100 }] });
    fireEvent.touchEnd(board, {
      changedTouches: [{ clientX: 100, clientY: 100 }],
    });
    expect(document.querySelector(".pixel-drop-gameover")).toBeNull();
  });

  it("shows a banner and row flash when a piece clears lines", () => {
    render(<PixelDrop open onClose={() => {}} />);
    fireEvent.keyDown(window, { key: " " });
    const clearedGame = {
      ...engine.createGame(() => 0),
      seq: 1,
      lines: 4,
      combo: 1,
      clearedRows: [16, 17, 18, 19],
      lastClear: {
        label: "B2B TETRIS",
        lines: 4,
        points: 1200,
        levelUp: true,
        tSpin: false,
        backToBack: true,
      },
    };
    engine.hardDrop.mockReturnValueOnce(clearedGame);
    fireEvent.keyDown(window, { key: " " });
    const banner = document.querySelector(".pixel-drop-banner");
    expect(banner.textContent).toContain("B2B TETRIS");
    expect(banner.textContent).toContain("+1200");
    expect(banner.textContent).toContain("COMBO ×2");
    expect(banner.textContent).toContain("LEVEL UP");
    expect(
      document.querySelectorAll(".pixel-drop-clear").length,
    ).toBeGreaterThan(0);
  });
});
