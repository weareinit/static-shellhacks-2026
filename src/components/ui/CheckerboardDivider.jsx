import { useEffect, useRef, useState } from "react";
import checkerboardSvg from "@assets/checkerboard-divider.svg?raw";
import { PIECE_COLORS } from "../../games/pixelDropEngine";

// Deterministic pseudo-random in [0, 1) from a seed - Math.random here would give different values on the server and client and break hydration.
function seededRandom(seed) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

// Parses checkerboard-divider.svg's own rects into {x, y, h, delay} blocks (plus the viewBox), so this can't drift from the artwork.
// Falls back to the artwork's known dimensions instead of throwing if the file is ever re-exported in a format these regexes don't match.
function parseCheckerboardSvg(svgText) {
  const svgMatch = svgText.match(/<svg width="(\d+)" height="(\d+)"/);
  const viewW = svgMatch ? +svgMatch[1] : 420;
  const viewH = svgMatch ? +svgMatch[2] : 61;

  const rectMatches = [
    ...svgText.matchAll(
      /<rect width="(\d+)" height="(\d+)" transform="matrix\(-1 0 0 1 (\d+) (\d+)\)"/g,
    ),
  ];
  const blockW = rectMatches.length ? +rectMatches[0][1] : 12;
  const blocks = rectMatches.map(([, w, h, tx, ty], i) => ({
    x: +tx - +w, // matrix(-1 0 0 1 tx ty) on a w-wide rect places it at x = [tx - w, tx]
    y: +ty,
    h: +h,
    delay: Math.round(seededRandom(i) * 900),
  }));
  return { viewW, viewH, blockW, blocks };
}

function groupBy(items, keyFn) {
  const map = new Map();
  items.forEach((item) => {
    const key = keyFn(item);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  });
  return map;
}

// Splits sorted items into clusters (a new one wherever isAdjacent is false), returning Map(posOf(item) -> "prefix:clusterId").
function clusterKeys(sorted, isAdjacent, posOf, prefix) {
  let clusterId = 0;
  return new Map(
    sorted.map((item, i) => {
      if (i > 0 && !isAdjacent(sorted[i - 1], item)) clusterId++;
      return [posOf(item), `${prefix}:${clusterId}`];
    }),
  );
}

// Groups blocks into falling "pieces" (an overlapping row-run, or row-adjacent cells in one x-column) and tags each block with its pieceId.
function groupIntoPieces(blocks, blockW) {
  const blocksByRow = groupBy(blocks, (b) => b.y);
  const rowPieceKeyByX = new Map();
  for (const [y, cellsAtY] of blocksByRow) {
    const sorted = [...new Set(cellsAtY.map((b) => b.x))].sort((a, b) => a - b);
    if (!sorted.some((x, i) => i > 0 && x < sorted[i - 1] + blockW)) continue;
    rowPieceKeyByX.set(
      y,
      clusterKeys(
        sorted,
        (prev, cur) => cur < prev + blockW,
        (x) => x,
        `row:${y}`,
      ),
    );
  }

  const remaining = blocks.filter((b) => !rowPieceKeyByX.get(b.y)?.has(b.x));
  const blocksByX = groupBy(remaining, (b) => b.x);
  const colPieceKeyByY = new Map();
  for (const [x, cells] of blocksByX) {
    const sorted = [...cells].sort((a, b) => a.y - b.y);
    colPieceKeyByY.set(
      x,
      clusterKeys(
        sorted,
        (prev, cur) => cur.y <= prev.y + prev.h,
        (b) => b.y,
        `col:${x}`,
      ),
    );
  }

  const keyForBlock = (block) =>
    rowPieceKeyByX.get(block.y)?.get(block.x) ??
    colPieceKeyByY.get(block.x)?.get(block.y);

  const idByKey = new Map();
  const pieces = [];
  const taggedBlocks = blocks.map((block) => {
    const key = keyForBlock(block);
    if (!idByKey.has(key)) idByKey.set(key, pieces.push([]) - 1);
    const pieceId = idByKey.get(key);
    const tagged = { ...block, pieceId };
    pieces[pieceId].push(tagged);
    return tagged;
  });
  return { blocks: taggedBlocks, pieces }; // pieces[pieceId] = the blocks belonging to that piece
}

const PIECE_SPACING_MS = 35;

// Orders pieces bottom-row-first (a real stack builds up; ties broken by delay for organic left-right variety), then gives each its landing delay, tetromino color, and starting-height jitter.
function sequencePieces(pieces) {
  const order = pieces
    .map((cells, pieceId) => ({
      pieceId,
      bottomRow: Math.max(...cells.map((b) => b.y)),
      sortKey: Math.min(...cells.map((b) => b.delay)),
    }))
    .sort((a, b) => b.bottomRow - a.bottomRow || a.sortKey - b.sortKey);

  const attrsByPieceId = [];
  order.forEach(({ pieceId }, i) => {
    attrsByPieceId[pieceId] = {
      delay: i * PIECE_SPACING_MS,
      color: PIECE_COLORS[i % PIECE_COLORS.length],
      // Per-piece (not per-block) starting-height jitter, since a piece falls as one rigid unit.
      fall: Math.round(40 + seededRandom(i + 5000) * 60),
    };
  });
  return attrsByPieceId; // attrsByPieceId[pieceId] = { delay, color, fall }
}

const {
  viewW: VIEW_W,
  viewH: VIEW_H,
  blockW: BLOCK_W,
  blocks: parsedBlocks,
} = parseCheckerboardSvg(checkerboardSvg);
const { blocks: BLOCKS, pieces } = groupIntoPieces(parsedBlocks, BLOCK_W);
const pieceAttrs = sequencePieces(pieces);

// Blocks stay invisible and behind FAQ's content (opacity/z-index, see globals.css) until they're actually falling.
// Duration scales with fall distance for constant velocity (real Tetris gravity); timed, not scroll-linked, to stay smooth.
const FALL_SPEED_PX_PER_S = 760;
const MIN_FALL_DURATION_S = 0.35;

// Purely decorative in the archive. In the app this was a button that opened
// Pixel Drop directly; the arcade launcher replaced that entry point, so the
// stack is now inert (no onPlay, no button semantics).
const CheckerboardDivider = () => {
  const containerRef = useRef(null);
  const [hasFallen, setHasFallen] = useState(false);
  const [fall, setFall] = useState({ basePx: 480, durationS: 0.9 });

  useEffect(() => {
    if (hasFallen) return;
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Live distance to FAQ's top, so the fall genuinely starts there on any device.
          const faqRoot = node.closest(".faq-fall-scope");
          if (faqRoot) {
            const distance =
              node.getBoundingClientRect().top -
              faqRoot.getBoundingClientRect().top;
            setFall({
              basePx: distance,
              durationS: Math.max(
                MIN_FALL_DURATION_S,
                distance / FALL_SPEED_PX_PER_S,
              ),
            });
          }
          setHasFallen(true);
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px 0px 150px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasFallen]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="checkerboard-stack"
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: `${VIEW_W} / ${VIEW_H}`,
      }}
    >
      {BLOCKS.map((block, idx) => {
        const { delay, color, fall: pieceFall } = pieceAttrs[block.pieceId];
        return (
          <div
            key={idx}
            className={`checkerboard-fall-block${hasFallen ? " checkerboard-fall-in" : ""}`}
            style={{
              position: "absolute",
              left: `${(block.x / VIEW_W) * 100}%`,
              top: `${(block.y / VIEW_H) * 100}%`,
              width: `${(BLOCK_W / VIEW_W) * 100}%`,
              height: `${(block.h / VIEW_H) * 100}%`,
              "--cb-delay": `${delay}ms`,
              "--cb-fall": `-${fall.basePx + pieceFall}px`,
              "--cb-duration": `${fall.durationS}s`,
              "--cb-color": color,
            }}
          />
        );
      })}
    </div>
  );
};

export default CheckerboardDivider;
