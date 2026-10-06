import { useEffect, useRef, useState } from "preact/hooks";
import { asset } from "@utils/assets";
import { DISCORD_INVITE_URL } from "@/constants/links";
import xSvgRaw from "@assets/landing/X.svg?raw";

const HERO_X_SVG = xSvgRaw
  .replace(/<style>[\s\S]*?<\/style>/, "")
  .replace(
    "<svg ",
    '<svg class="hero-x-svg" preserveAspectRatio="xMidYMid slice" style="width:100%;height:100%;display:block" ',
  );

// The app resolved this pill from auth state and /api/site-status. The archive
// is frozen at end-of-life, so the only reachable state is the EOL one. Keeping
// the pill markup (rather than deleting it) preserves the hero's spacing and
// typography exactly; see Archive.jsx for where isEOL used to come from.
const CTA_LABEL = "See You Next Year!";

// Shared hero CTA pill. Shadow and text treatments live here once.
const HERO_PILL =
  "bg-landing-red inline-block px-[3em] py-0.5 text-(length:--hero-button) rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.75),0_6px_18px_rgba(0,0,0,0.65)] [text-shadow:0_1px_5px_rgba(0,0,0,0.9),0_4px_14px_rgba(0,0,0,0.45)] transition-transform duration-200 ease-out motion-safe:hover:scale-95";

export default function HeroSection() {
  const xRef = useRef(null);
  const heroBoxRef = useRef(null);
  const [twinkleActive, setTwinkleActive] = useState(false);
  // Shared with the hero canvas effect: visibility gates its paint loop.
  const heroFx = useRef({ visible: true, ensure: null });

  useEffect(() => {
    const fx = heroFx.current;
    fx.visible = twinkleActive;
    if (fx.ensure) fx.ensure();
  }, [twinkleActive]);

  // Only run the ambient rect "twinkle" animation while the hero is on screen.
  useEffect(() => {
    const box = heroBoxRef.current;
    if (!box) return;
    if (!("IntersectionObserver" in window)) {
      setTwinkleActive(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => setTwinkleActive(entry.isIntersecting),
      { rootMargin: "150px" },
    );
    io.observe(box);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const box = heroBoxRef.current;
    const wrap = xRef.current;
    if (!box || !wrap) return;
    const fx = heroFx.current;

    const VB_W = 1963;
    const VB_H = 2206;
    const LIGHT_MS = 650;
    const RADIUS = 55;
    const RADIUS_SQ = RADIUS * RADIUS;
    const CELL = RADIUS;

    const rects = [];
    {
      const re = /<rect\b[^>]*>/g;
      let m = re.exec(HERO_X_SVG);
      while (m !== null) {
        const tag = m[0];
        const num = (name) => {
          const mm = tag.match(new RegExp(`${name}"?(\\d+(?:\\.\\d+)?)`));
          return mm ? parseFloat(mm[1]) : null;
        };
        const x = num("x=");
        const y = num("y=");
        const w = num('width="');
        const h = num('height="');
        if (
          x !== null &&
          y !== null &&
          w !== null &&
          h !== null &&
          w > 0 &&
          h > 0
        ) {
          rects.push({ x, y, w, h });
        }
        m = re.exec(HERO_X_SVG);
      }
    }

    // Ambient twinkle: paint ~1/12 of the rects (3404 -> ~284) instead of
    // every rect. (Matches the old CSS stagger math, which resolved to a
    // synchronized pulse, so all share one phase.)
    const twinkles = [];
    for (let i = 0; i < rects.length; i += 12) {
      twinkles.push(rects[i]);
    }

    // Canvas replaces the 3404-node inline SVG, the 284 CSS animations, and
    // the pooled overlay divs: cells bake once to an offscreen bitmap as LED
    // dots (85% inscribed circles), then base/twinkle/lit composite per
    // frame. The SVG node is removed after first paint (kept for no-JS), so
    // static output is unchanged without JavaScript.
    const canvas = document.createElement("canvas");
    canvas.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;";
    canvas.setAttribute("aria-hidden", "true");
    const ctx = canvas.getContext("2d");
    if (!ctx) return; // leave the static SVG
    const off = document.createElement("canvas");
    const offAmber = document.createElement("canvas");
    let backing = { dpr: 1 };
    let destroyed = false;
    const cleanupFns = [];

    // Pre-rendered radial glow sprite: cheap bloom without shadowBlur.
    const glow = document.createElement("canvas");
    glow.width = 64;
    glow.height = 64;
    {
      const g = glow.getContext("2d");
      if (g) {
        const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0, "rgba(255,193,77,1)");
        grad.addColorStop(0.45, "rgba(255,193,77,0.5)");
        grad.addColorStop(1, "rgba(255,193,77,0)");
        g.fillStyle = grad;
        g.fillRect(0, 0, 64, 64);
      }
    }

    const sliceFor = (w, h) => {
      const scale = Math.max(w / VB_W, h / VB_H);
      const dw = VB_W * scale;
      const dh = VB_H * scale;
      return { dx: (w - dw) / 2, dy: (h - dh) / 2, dw, dh, scale };
    };

    const DOT_FILL = 1.9;

    const bakeLayer = (target, color, w, h, s, withGlow) => {
      const octx = target.getContext("2d");
      if (!octx) return false;
      octx.setTransform(1, 0, 0, 1, 0, 0);
      octx.clearRect(0, 0, w, h);
      octx.fillStyle = color;
      for (let i = 0; i < rects.length; i++) {
        const p = rects[i];
        const side = DOT_FILL * Math.min(p.w, p.h) * s.scale;
        if (side < 0.6) continue;
        const cx = s.dx + (p.x + p.w / 2) * s.scale;
        const cy = s.dy + (p.y + p.h / 2) * s.scale;
        if (withGlow) {
          const gr = side * 1.3;
          octx.drawImage(glow, cx - gr, cy - gr, gr * 2, gr * 2);
        }
        sqPath(octx, cx, cy, side);
        octx.fill();
        strokeCell(octx);
      }
      return true;
    };

    const fitAndBake = () => {
      if (!ctx) return false;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(box.clientWidth * dpr));
      const h = Math.max(1, Math.round(box.clientHeight * dpr));
      backing = { dpr };
      canvas.width = w;
      canvas.height = h;
      off.width = w;
      off.height = h;
      offAmber.width = w;
      offAmber.height = h;
      const s = sliceFor(w, h);
      return (
        bakeLayer(off, "#EBEBEB", w, h, s, false) &&
        bakeLayer(offAmber, "#ffc14d", w, h, s, true)
      );
    };

    // Spatial grid: bucket rects into cells so a frame only probes the cells
    // within cursor radius instead of iterating every rect.
    const COLS = Math.ceil(VB_W / CELL);
    const ROWS = Math.ceil(VB_H / CELL);
    const grid = Array.from({ length: COLS * ROWS }, () => []);
    for (let i = 0; i < rects.length; i++) {
      const p = rects[i];
      const c0 = Math.floor(p.x / CELL);
      const c1 = Math.floor((p.x + p.w) / CELL);
      const r0 = Math.floor(p.y / CELL);
      const r1 = Math.floor((p.y + p.h) / CELL);
      for (let c = c0; c <= c1; c++) {
        for (let r = r0; r <= r1; r++) {
          if (c < 0 || c >= COLS || r < 0 || r >= ROWS) continue;
          grid[c * ROWS + r].push(i);
        }
      }
    }

    // Dedupe candidate rects that span multiple grid cells.
    const seen = new Int32Array(rects.length);
    let seenStamp = 0;

    let mx = -10000;
    let my = -10000;
    // Cached geometry; layout reads (getBoundingClientRect) are expensive, so
    // recompute at most every 250ms.
    let geo = { scale: 1, offX: 0, offY: 0, ox: 0, oy: 0, left: 0, top: 0 };
    let lastGeoAt = 0;

    const computeGeo = () => {
      // Layout space (untransformed): the canvas bitmap lives here, so all
      // overlay drawing uses these. The wrap may carry CSS transforms
      // (portrait scale, x offset) — account for them only when converting
      // viewport mouse coords, via ts + left/top.
      const br = wrap.getBoundingClientRect();
      const lw = box.clientWidth;
      const lh = box.clientHeight;
      const ts = lw > 0 ? br.width / lw : 1;
      const scale = Math.max(lw / VB_W, lh / VB_H);
      const offX = (lw - VB_W * scale) / 2;
      const offY = (lh - VB_H * scale) / 2;
      geo = {
        scale,
        offX,
        offY,
        ox: offX,
        oy: offY,
        ts,
        left: br.left,
        top: br.top,
      };
      lastGeoAt = performance.now();
    };
    computeGeo();

    // Lit pixels live in a timestamped map now (no DOM pool, no
    // transitionend bookkeeping): the paint loop fades them out.
    const active = new Map(); // key -> { p, core, litAt }

    // cubic-bezier(0.42, 0, 0.58, 1) — matches the old CSS ease-in-out.
    const bezX = (t) => {
      const u = 1 - t;
      return 3 * u * u * t * 0.42 + 3 * u * t * t * 0.58 + t * t * t;
    };
    const easeInOut = (t) => {
      if (t <= 0) return 0;
      if (t >= 1) return 1;
      let lo = 0;
      let hi = 1;
      for (let k = 0; k < 12; k++) {
        const m = (lo + hi) / 2;
        if (bezX(m) < t) lo = m;
        else hi = m;
      }
      const m = (lo + hi) / 2;
      const u = 1 - m;
      return 3 * u * m * m + m * m * m;
    };

    // Twinkle keyframes from the old CSS (4.2s cycle, synchronized pulse).
    const TW_PERIOD = 4200;
    const TW_STOPS = [
      [0, 0.22, 0.78],
      [0.38, 1, 1.18],
      [0.64, 0.48, 0.9],
      [1, 0.22, 0.78],
    ];
    const evalTwinkle = (nowMs) => {
      const t = (((nowMs / TW_PERIOD) % 1) + 1) % 1;
      let a = TW_STOPS[0];
      let b = TW_STOPS[TW_STOPS.length - 1];
      for (let s = 0; s < TW_STOPS.length - 1; s++) {
        if (t >= TW_STOPS[s][0] && t <= TW_STOPS[s + 1][0]) {
          a = TW_STOPS[s];
          b = TW_STOPS[s + 1];
          break;
        }
      }
      const span = b[0] - a[0] || 1;
      const e = easeInOut((t - a[0]) / span);
      return { op: a[1] + (b[1] - a[1]) * e, s: a[2] + (b[2] - a[2]) * e };
    };

    const lightPixel = (key, p, core) => {
      const existing = active.get(key);
      if (existing) {
        existing.litAt = performance.now();
        existing.core = existing.core || core;
        return;
      }
      if (active.size >= 360) {
        const oldestKey = active.keys().next().value;
        active.delete(oldestKey);
      }
      active.set(key, { p, core, litAt: performance.now() });
    };

    // Rounded-square path for LED cells (squircles, not circles).
    const sqPath = (c, cx, cy, side) => {
      const h = side / 2;
      if (c.roundRect) {
        c.beginPath();
        c.roundRect(cx - h, cy - h, side, side, side * 0.22);
      } else {
        c.beginPath();
        c.rect(cx - h, cy - h, side, side);
      }
    };

    // Thin border around a cell path (call right after fill).
    const strokeCell = (c) => {
      c.strokeStyle = "rgba(255,255,255,0.8)";
      c.lineWidth = 1;
      c.stroke();
    };

    // White LED cell + glow sprite. Coordinates in CSS px.
    const ledDot = (cx, cy, side, alpha, glowAlpha) => {
      if (glowAlpha > 0.01) {
        ctx.globalAlpha = glowAlpha;
        const gr = side * 1.3;
        ctx.drawImage(glow, cx - gr, cy - gr, gr * 2, gr * 2);
      }
      if (alpha > 0.01 && side > 0.6) {
        ctx.fillStyle = "#ffc14d";
        ctx.globalAlpha = alpha;
        sqPath(ctx, cx, cy, side);
        ctx.fill();
        strokeCell(ctx);
      }
      ctx.globalAlpha = 1;
    };

    const ledSide = (p, scale, mult) =>
      Math.max(DOT_FILL * Math.min(p.w, p.h) * scale * mult, 0.6);

    let wasPressed = false;
    let pressedAt = 0;
    let releasedAt = 0;
    let mix = 0;
    let releaseMix = 0;
    const BASE_A = 0.3;
    // Visible paint counter for automated checks (mirrors __brickDebug).
    window.__heroPaints = window.__heroPaints || {
      n: 0,
      baseA: 0,
      pressed: false,
    };

    const paint = (now) => {
      const { scale, ox, oy } = geo;
      const { dpr } = backing;
      const cssW = box.clientWidth;
      const cssH = box.clientHeight;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const pressed = wrap.classList.contains("hero-x-down");
      if (pressed && !wasPressed) pressedAt = now;
      if (!pressed && wasPressed) {
        releasedAt = now;
        releaseMix = mix;
      }
      wasPressed = pressed;

      // Dim gray layer always breathes underneath. The old 1.1s filter pulse
      // brightened only the pixels, so breathe by oscillating the raster
      // alpha (0.22 * 1.15 <-> 0.22 * 1.35) — never a fullscreen veil, which
      // would wash the empty background too.
      const breatheK = 0.5 - 0.5 * Math.cos((2 * Math.PI * now) / 1100);
      const breatheBase = BASE_A * (1.15 + 0.2 * breatheK);
      ctx.globalAlpha = breatheBase;
      ctx.drawImage(off, 0, 0, cssW, cssH);

      // Amber layer crossfades with press state: 0.5s ramp up, 2.5s ease-out
      // fade back down (like the old CSS transition). Held state breathes
      // gently instead of sitting at 100%.
      let baseA;
      if (pressed) {
        mix = Math.min(1, (now - pressedAt) / 500);
        baseA =
          mix *
          (0.63 + 0.17 * (0.5 - 0.5 * Math.cos((2 * Math.PI * now) / 1100)));
      } else {
        const f = Math.min(1, (now - releasedAt) / 2500);
        mix = releaseMix * (1 - (1 - (1 - f) ** 3));
        baseA = mix;
      }
      if (mix > 0.01) {
        ctx.globalAlpha = baseA;
        ctx.drawImage(offAmber, 0, 0, cssW, cssH);
      }
      window.__heroPaints.n += 1;
      window.__heroPaints.baseA = baseA;
      window.__heroPaints.pressed = pressed;

      if (!pressed) {
        // Twinkle overlay: white LED dots + glow.
        const tw = evalTwinkle(now);
        if (tw.op > BASE_A + 0.01) {
          const a = Math.min(1, tw.op - BASE_A);
          for (let i = 0; i < twinkles.length; i++) {
            const p = twinkles[i];
            const cx = ox + (p.x + p.w / 2) * scale;
            const cy = oy + (p.y + p.h / 2) * scale;
            ledDot(cx, cy, ledSide(p, scale, tw.s), a, a);
          }
        }
      }

      // Cursor trail: white LED dots + glow, fading + shrinking over 950ms.
      for (const [key, e] of active) {
        const age = now - e.litAt;
        if (age > 950) {
          active.delete(key);
          continue;
        }
        const fade = age < LIGHT_MS ? 1 : 1 - (age - LIGHT_MS) / 300;
        const shrink = age < LIGHT_MS ? 1 : 1 - 0.6 * ((age - LIGHT_MS) / 300);
        const a = (e.core ? 1 : 0.5) * fade;
        const cx = ox + (e.p.x + e.p.w / 2) * scale;
        const cy = oy + (e.p.y + e.p.h / 2) * scale;
        // Fresh strikes pop slightly, mirroring the twinkle peak scale.
        const pop = age < 150 ? 1 + 0.18 * (1 - age / 150) : 1;
        ledDot(cx, cy, ledSide(e.p, scale, shrink * pop), a, a);
      }
      ctx.globalAlpha = 1;
    };

    const paintStatic = () => {
      const { dpr } = backing;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalAlpha = 0.8;
      ctx.drawImage(off, 0, 0, box.clientWidth, box.clientHeight);
      ctx.globalAlpha = 1;
    };

    const probe = (now) => {
      if (now - lastGeoAt > 250) computeGeo();
      const { scale, offX, offY, ts, left, top } = geo;
      // Viewport -> wrap layout space (undo CSS transform), then to viewBox.
      const vx = ((mx - left) / ts - offX) / scale;
      const vy = ((my - top) / ts - offY) / scale;

      const c0 = Math.max(0, Math.floor((vx - RADIUS) / CELL));
      const c1 = Math.min(COLS - 1, Math.floor((vx + RADIUS) / CELL));
      const r0 = Math.max(0, Math.floor((vy - RADIUS) / CELL));
      const r1 = Math.min(ROWS - 1, Math.floor((vy + RADIUS) / CELL));
      seenStamp++;
      for (let c = c0; c <= c1; c++) {
        for (let r = r0; r <= r1; r++) {
          const cell = grid[c * ROWS + r];
          for (let k = 0; k < cell.length; k++) {
            const i = cell[k];
            if (seen[i] === seenStamp) continue;
            seen[i] = seenStamp;
            const p = rects[i];
            const ddx = Math.max(p.x - vx, 0, vx - (p.x + p.w));
            const ddy = Math.max(p.y - vy, 0, vy - (p.y + p.h));
            if (ddx * ddx + ddy * ddy > RADIUS_SQ) continue;
            const core =
              vx >= p.x && vx <= p.x + p.w && vy >= p.y && vy <= p.y + p.h;
            lightPixel(`${p.x},${p.y}`, p, core);
          }
        }
      }
    };

    let raf = 0;
    let stopped = true;
    let pointerSeen = false;

    const loop = (now) => {
      raf = 0;
      if (!fx.visible || destroyed) {
        stopped = true;
        return;
      }
      if (pointerSeen) probe(now);
      paint(now);
      raf = requestAnimationFrame(loop);
    };

    const ensure = () => {
      if (stopped && !destroyed && fx.visible) {
        stopped = false;
        raf = requestAnimationFrame(loop);
      }
    };
    fx.ensure = ensure;

    const onMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
      pointerSeen = true;
      ensure();
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Static only, matching the old CSS fallback (rects at 0.8, no motion).
      if (!fitAndBake()) return; // SVG stays
      paintStatic();
      wrap.appendChild(canvas);
      const svg = wrap.querySelector("svg");
      if (svg) svg.remove();
      const ro = new ResizeObserver(() => {
        if (destroyed || !fitAndBake()) return;
        paintStatic();
      });
      ro.observe(box);
      cleanupFns.push(() => {
        ro.disconnect();
        canvas.remove();
      });
      return () => {
        destroyed = true;
        cleanupFns.forEach((fn) => {
          fn();
        });
      };
    }

    box.addEventListener("pointermove", onMove, { passive: true });

    if (fitAndBake()) {
      wrap.appendChild(canvas);
      computeGeo();
      paint(performance.now());
      const svg = wrap.querySelector("svg");
      if (svg) svg.remove();
      const ro = new ResizeObserver(() => {
        if (destroyed || !fitAndBake()) return;
        computeGeo();
        // Repaint synchronously: canvas.width cleared the bitmap, and
        // waiting for the next frame would flash blank.
        paint(performance.now());
      });
      ro.observe(box);
      cleanupFns.push(() => {
        ro.disconnect();
        canvas.remove();
      });
      ensure();
    }

    return () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      box.removeEventListener("pointermove", onMove);
      cleanupFns.forEach((fn) => {
        fn();
      });
    };
  }, []);

  return (
    <section
      id="hero"
      className="bg-landing-blue relative w-full border-b scroll-mt-20"
    >
      <div
        ref={heroBoxRef}
        className="relative w-full h-svh landscape:h-svh overflow-hidden"
        onPointerDown={(e) => {
          if (e.button !== undefined && e.button !== 0) return;
          const el = xRef.current;
          if (!el) return;
          el.classList.add("hero-x-down");
        }}
        onPointerUp={() => xRef.current?.classList.remove("hero-x-down")}
        onPointerCancel={() => xRef.current?.classList.remove("hero-x-down")}
        onPointerLeave={() => xRef.current?.classList.remove("hero-x-down")}
      >
        {/* Worn overlay: distresses the purple bg. Paints below the X
            canvas (same layer, earlier in DOM order), below the robots
            (z-1) and content (z-10) — so the dots stay clean. */}
        <div aria-hidden="true" className="hero-wear hero-wear-distressed" />
        {/* X - inlined pixel SVG (pixels light up under cursor) */}
        <div
          ref={xRef}
          aria-hidden="true"
          className={`hero-x absolute inset-0 translate-x-[-6%] portrait:scale-130 select-none ${twinkleActive ? "hero-x-inview" : ""}`}
          dangerouslySetInnerHTML={{ __html: HERO_X_SVG }}
        />

        {/* Hero Robots image - single wide asset for all orientations */}
        <img
          src={asset("/landing/hero_robots_1.png")}
          alt=""
          aria-hidden="true"
          className="
						absolute bottom-0 right-0 z-1 pointer-events-none select-none
						portrait:h-[68%] portrait:w-auto portrait:max-w-none portrait:translate-x-[35%]
						[@media((orientation:portrait)_and_(width<40rem))]:h-[58%] [@media((orientation:portrait)_and_(width<40rem))]:translate-x-[10%]
						landscape:top-0 landscape:h-full landscape:w-[62%] landscape:max-w-220 landscape:object-contain landscape:object-bottom-right
						[@media((orientation:landscape)_and_(height<=500px))]:w-[46%]
					"
        />

        {/* Legibility scrim: calms the X/pattern behind the text column.
            Sits above the X canvas and robots (z-1), below the content (z-10). */}
        <div aria-hidden="true" className="hero-scrim" />

        {/* Main Content */}
        <div
          className="
						absolute inset-0 z-10 flex flex-col items-start text-left
						pointer-events-none
						justify-start pt-[35%]
						landscape:justify-center landscape:pt-0 landscape:pb-[8%]
						px-6
						landscape:max-w-[80%]
						[text-shadow:0_1px_5px_rgba(0,0,0,0.9),0_4px_14px_rgba(0,0,0,0.45)]

						[--hero-size:clamp(2.25rem,13vw,9.5rem)]
						max-[425px]:[--hero-size:clamp(2.75rem,13vw,9.5rem)]
						[--hero-sub:clamp(0.85rem,calc(var(--hero-size)*0.30),2.75rem)]
						[--hero-button:clamp(0.85rem,calc(var(--hero-size)*0.20),2.25rem)]
						[--hero-gap:clamp(0.6rem,calc(var(--hero-size)*0.18),2.25rem)]

						landscape:[--hero-size:clamp(2.75rem,min(calc(15vw-15px),21vh),18rem)]
						landscape:[--hero-sub:clamp(1rem,calc(var(--hero-size)*0.18),4rem)]
						landscape:[--hero-button:clamp(1.125rem,calc(var(--hero-size)*0.15),3rem)]

						gap-(--hero-gap)
					"
        >
          {/* ShellHacks Logo */}
          <h1 className="font-nowduke font-normal leading-[0.8] tracking-normal text-landing-bone whitespace-nowrap text-(length:--hero-size)">
            SHELLHACKS
          </h1>

          <p className="font-century font-bold text-landing-gold/90 [text-shadow:0_2px_0_rgba(0,0,0,1.0),2px_0_0_rgba(0,0,0,1.0),-2px_0_0_rgba(0,0,0,1.0),0_-2px_0_rgba(0,0,0,1.0),0_0_5px_rgba(2,2,2,0.9)] -mt-[clamp(0.3rem,calc(var(--hero-size)*0.1),3.1rem)] leading-[0.9] tracking-normal text-(length:--hero-sub)">
            FLORIDA'S LARGEST HACKATHON
          </p>

          {/* Powered by */}
          <div className="flex items-center gap-1.5 font-century font-bold text-landing-bone/80 text-[clamp(0.7rem,1.4vw,0.75rem)]">
            <span>Powered by</span>
            <img
              src={asset("/sponsors/FIU_SGA.webp")}
              alt="FIU SGA"
              className="h-[clamp(1.2rem,2.6vw,1.5rem)] w-auto object-contain"
            />
          </div>

          {/* Event status - frozen at end of life */}
          <div className="text-white font-century font-bold flex flex-col items-center -mt-[clamp(0.1rem,calc(var(--hero-size)*0.04),3.1rem)]">
            <div className={HERO_PILL}>{CTA_LABEL}</div>
          </div>

          <div className="font-century font-bold text-landing-gold/90 [text-shadow:0_2px_0_rgba(0,0,0,1.0),2px_0_0_rgba(0,0,0,1.0),-2px_0_0_rgba(0,0,0,1.0),0_-2px_0_rgba(0,0,0,1.0),0_0_5px_rgba(2,2,2,0.9)] leading-[0.9] tracking-normal space-y-2 text-(length:--hero-sub)">
            <p>SEPTEMBER 25 - 27, 2026</p>
            <p>FIU'S GRAHAM CENTER</p>
            <p>MIAMI, FL</p>
          </div>

          {/* Social Media Icons */}
          <div
            className="
							flex items-center
							gap-[calc(var(--icon-size)*0.55)]
							text-landing-bone/90
							filter-[drop-shadow(0_1px_2px_rgba(0,0,0,0.9))_drop-shadow(0_4px_10px_rgba(0,0,0,0.6))]
							[--icon-size:clamp(1.4rem,calc(var(--hero-size)*0.38),3.25rem)]
							landscape:[--icon-size:clamp(1.75rem,calc(var(--hero-sub)*1.15),3rem)]
						"
          >
            <a
              href="https://www.linkedin.com/company/init-fiu/posts/?feedView=all"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="pointer-events-auto inline-block transition-transform duration-200 ease-out motion-safe:hover:scale-110"
            >
              <span className="sr-only">LinkedIn</span>
              <span
                aria-hidden="true"
                className="block size-(--icon-size) bg-current [mask:url('/icons/LinkedIn.svg')_center/contain_no-repeat]"
              />
            </a>

            <a
              href={DISCORD_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Discord"
              className="pointer-events-auto inline-block transition-transform duration-200 ease-out motion-safe:hover:scale-110"
            >
              <span className="sr-only">Discord</span>
              <span
                aria-hidden="true"
                className="block size-(--icon-size) bg-current [mask:url('/icons/Discord.svg')_center/contain_no-repeat]"
              />
            </a>

            <a
              href="https://www.instagram.com/init.fiu/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="pointer-events-auto inline-block transition-transform duration-200 ease-out motion-safe:hover:scale-110"
            >
              <span className="sr-only">Instagram</span>
              <span
                aria-hidden="true"
                className="block size-(--icon-size) bg-current [mask:url('/icons/Instagram.svg')_center/contain_no-repeat]"
              />
            </a>
          </div>
        </div>
      </div>

      {/* Decorative stripes */}
      <div
        aria-hidden="true"
        className="relative w-full pb-[clamp(2px,0.5vh,8px)] z-1 pointer-events-none"
      >
        {/* Wear over the stripes to match the distressed band above */}
        <div
          aria-hidden="true"
          className="hero-wear hero-wear-distressed hero-wear-fade"
        />
        {[
          "",
          "mt-[clamp(14px,4vh,96px)]",
          "mt-[clamp(7px,2vh,48px)]",
          "mt-[clamp(3.5px,1vh,24px)]",
        ].map((mt, i) => (
          <div
            key={i}
            className={`w-full h-[clamp(2px,0.8vw,6px)] bg-landing-bone ${mt}`}
          />
        ))}
      </div>
      {/* Light sepia wash above everything in the section */}
      <div aria-hidden="true" className="section-sepia" />
    </section>
  );
}
