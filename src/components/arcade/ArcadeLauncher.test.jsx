// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/preact";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ArcadeLauncher from "./ArcadeLauncher";

// Icons are decorative; stubbing lucide keeps its react/preact interop out of
// the test runtime (the same trick PixelDrop.test.jsx uses).
vi.mock("lucide-react", () => {
  const Icon = () => null;
  return {
    ArrowDown: Icon,
    ArrowDownToLine: Icon,
    ArrowLeft: Icon,
    ArrowRight: Icon,
    Gamepad2: Icon,
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

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

beforeEach(() => {
  window.scrollTo = () => {};
});

describe("ArcadeLauncher", () => {
  it("shows the launcher and nothing else until it is clicked", () => {
    render(<ArcadeLauncher />);

    const fab = screen.getByRole("button", {
      name: /open the shellhacks arcade/i,
    });
    expect(fab).toBeTruthy();
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.queryByText("SHELLHACKS ARCADE")).toBeNull();
    // Regression: focusing the FAB on mount turns Space into "open the arcade"
    // instead of "scroll the page", for anyone who lands on the archive.
    expect(document.activeElement).not.toBe(fab);
  });

  it("opens a picker listing both games", () => {
    render(<ArcadeLauncher />);
    fireEvent.click(
      screen.getByRole("button", { name: /open the shellhacks arcade/i }),
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeTruthy();
    expect(screen.getByText("SHELLHACKS ARCADE")).toBeTruthy();
    expect(screen.getByText("PIXEL DROP")).toBeTruthy();
    expect(screen.getByText("BRICK BREAKER")).toBeTruthy();
  });

  it("closes the picker on Escape", () => {
    render(<ArcadeLauncher />);
    fireEvent.click(
      screen.getByRole("button", { name: /open the shellhacks arcade/i }),
    );
    expect(screen.getByRole("dialog")).toBeTruthy();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(
      screen.getByRole("button", { name: /open the shellhacks arcade/i }),
    ).toBeTruthy();
  });

  it("mounts Brick Breaker in a modal and returns to the picker", () => {
    render(<ArcadeLauncher />);
    fireEvent.click(
      screen.getByRole("button", { name: /open the shellhacks arcade/i }),
    );
    fireEvent.click(screen.getByText("BRICK BREAKER"));

    // The game replaced the picker inside the same dialog.
    const canvas = document.querySelector("canvas");
    expect(canvas).toBeTruthy();
    expect(screen.queryByText("PIXEL DROP")).toBeNull();

    // Back out to the picker rather than all the way out of the launcher.
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.getByText("SHELLHACKS ARCADE")).toBeTruthy();
    expect(document.querySelector("canvas")).toBeNull();
  });

  it("mounts Pixel Drop as its own dialog", () => {
    render(<ArcadeLauncher />);
    fireEvent.click(
      screen.getByRole("button", { name: /open the shellhacks arcade/i }),
    );
    fireEvent.click(screen.getByText("PIXEL DROP"));

    // Pixel Drop brings its own overlay: exactly one dialog, and no canvas.
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
    expect(document.querySelector("canvas")).toBeNull();
    expect(screen.getByText("PRESS SPACE")).toBeTruthy();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.getByText("SHELLHACKS ARCADE")).toBeTruthy();
  });

  it("restores focus to the launcher once everything is closed", () => {
    render(<ArcadeLauncher />);
    const fab = screen.getByRole("button", {
      name: /open the shellhacks arcade/i,
    });
    fireEvent.click(fab);
    fireEvent.click(screen.getByText("BRICK BREAKER"));
    fireEvent.click(
      screen.getByRole("button", { name: /close brick breaker/i }),
    );

    // The close button dismisses the whole arcade, not just the current game.
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(fab);
  });
});
