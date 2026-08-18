"use client";

import { useEffect, useRef } from "react";

/*
 * Text vortex.
 *
 * Tightly packed concentric rings of repeating text. Each ring runs the phrase
 * with normal letter spacing and fills the arc between repetitions with a
 * dotted track, so the field reads as continuous rules rather than as floating
 * words. Neighbouring rings turn in opposite directions, which keeps the whole
 * thing alive without any one ring appearing to lead.
 *
 * Pressing and holding drives it faster and brighter; releasing sends a ripple
 * out from the centre. A soft circular hole follows the pointer, cutting the
 * glyphs away around the cursor.
 *
 * Rendering: the glyphs are rasterised once into two offscreen layers — even
 * rings in one, odd in the other — and each frame only rotates those two
 * bitmaps. Drawing every glyph per frame would be a few thousand fillText calls
 * at 60fps; this is two drawImage calls. It also means ring content is fixed,
 * which matches the reference, where the gaps in the text never change.
 *
 * The layers are composited on their own canvas so the pointer hole can be
 * punched with destination-out without also cutting through the background.
 */

const PHRASE = "THE CONTENT ARCHITECTURE";

/* Ring count sets how tight the concentric spacing reads. */
const RING_COUNT = 30;
/* Radii as a fraction of the panel's half-diagonal, so coverage holds at any aspect. */
const R_MIN = 0.055;
const R_MAX = 1.6;

/* Font size as a fraction of ring radius; rings below the legible floor are dropped. */
const FONT_RATIO = 0.068;
const LEGIBLE_FLOOR_PX = 7.5;

/* Dots bridging the arc between phrase repetitions. */
const DOT_RUN = 7;
const DOT_PITCH_EM = 0.62;
const DOT_RADIUS_EM = 0.048;

/* Radians per second at rest and at full press. Sign alternates by ring. */
const IDLE_SPIN = 0.019;
const HELD_SPIN = 0.30;

/* How fast the press drive chases its target, in units per second. */
const SPIN_UP = 2.4;
const SPIN_DOWN = 1.1;

const IDLE_ALPHA = 0.93;

/* One-time entrance: the field expands out of the centre and fades up. */
const INTRO_S = 1.35;
const INTRO_ZOOM = 0.5;
const INTRO_DELAY_S = 0.28;

/* Pointer hole. */
const HOLE_PX = 104;
const HOLE_FEATHER = 0.55;

/* Ripple released on pointer-up. */
const RIPPLE_S = 1.25;
const RIPPLE_BAND_PX = 90;

const BG = "#232323";
const DOT_GRID_SPACING = 24;

/* Deterministic hash, so the fixed gaps in the text are stable across reloads. */
function hash(a: number, b: number): number {
  let h = (a * 374761393 + b * 668265263) >>> 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/* Fraction of glyphs omitted, reproducing the speckled gaps in the reference. */
const DROPOUT = 0.05;

export function TextVortex({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* Offscreen canvases resolve CSS variables, so read the family off the DOM. */
    const fontFamily =
      getComputedStyle(canvas).getPropertyValue("font-family") ||
      "ui-monospace, monospace";

    let width = 0;
    let height = 0;
    let dpr = 1;
    let frame = 0;
    let last = performance.now();

    /* Even rings turn one way, odd rings the other. */
    const layers: [HTMLCanvasElement | null, HTMLCanvasElement | null] = [null, null];
    let field: HTMLCanvasElement | null = null;
    let layerSize = 0;

    let power = 0;
    let angle = 0;
    let intro = reduced ? 1 : 0;
    let elapsed = 0;
    const ripples: number[] = [];

    let held = false;
    let hovering = false;
    const pointer = { x: -9999, y: -9999 };

    /* Draws one ring's glyphs and dotted bridges into an offscreen context. */
    const drawRing = (
      c: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      radius: number,
      ringIndex: number,
    ) => {
      const fontSize = radius * FONT_RATIO;
      c.font = `${fontSize}px ${fontFamily}`;

      const dotPitch = fontSize * DOT_PITCH_EM;
      const dotRadius = Math.max(0.6, fontSize * DOT_RADIUS_EM);

      /*
       * Build one repetition as a token list, then repeat it as many whole
       * times as fit and distribute the remainder so the seam is invisible.
       */
      type Token = { kind: "char"; ch: string; w: number } | { kind: "dot"; w: number };
      const unit: Token[] = [];
      for (const ch of PHRASE) {
        if (ch === " ") unit.push({ kind: "dot", w: dotPitch });
        else unit.push({ kind: "char", ch, w: c.measureText(ch).width });
      }
      for (let i = 0; i < DOT_RUN; i++) unit.push({ kind: "dot", w: dotPitch });

      const unitWidth = unit.reduce((s, t) => s + t.w, 0);
      const circumference = 2 * Math.PI * radius;
      const reps = Math.max(1, Math.round(circumference / unitWidth));
      /* Scale advances slightly so an exact number of repetitions closes the ring. */
      const fit = circumference / (reps * unitWidth);

      c.fillStyle = "#ffffff";
      c.textAlign = "center";
      c.textBaseline = "middle";

      let travelled = 0;
      let n = 0;
      for (let r = 0; r < reps; r++) {
        for (const token of unit) {
          const w = token.w * fit;
          const theta = (travelled + w / 2) / radius;
          travelled += w;
          n += 1;

          if (token.kind === "char" && hash(ringIndex, n) < DROPOUT) continue;

          c.save();
          c.translate(cx, cy);
          /*
           * Negative, so successive characters advance rightward along the
           * bottom of the ring. Rotating the other way lays the phrase out
           * back to front.
           */
          c.rotate(-theta);
          /* Sits at the bottom of the circle, so glyph up-vectors point inward. */
          c.translate(0, radius);

          if (token.kind === "dot") {
            c.globalAlpha = 0.5;
            c.beginPath();
            c.arc(0, 0, dotRadius, 0, Math.PI * 2);
            c.fill();
            c.globalAlpha = 1;
          } else {
            c.fillText(token.ch, 0, 0);
          }
          c.restore();
        }
      }
    };

    /* Rasterises every ring into the two rotation layers. */
    const buildLayers = () => {
      /* Square of the panel's diagonal, so rotation never exposes a corner. */
      layerSize = Math.ceil(Math.hypot(width, height));
      const px = Math.ceil(layerSize * dpr);

      for (const parity of [0, 1] as const) {
        const c = document.createElement("canvas");
        c.width = px;
        c.height = px;
        const lc = c.getContext("2d");
        if (!lc) return;
        lc.setTransform(dpr, 0, 0, dpr, 0, 0);

        const centre = layerSize / 2;
        const scale = Math.hypot(width, height) / 2;
        const growth = R_MAX / R_MIN;

        for (let i = parity; i < RING_COUNT; i += 2) {
          const radius = R_MIN * growth ** (i / RING_COUNT) * scale;
          if (radius * FONT_RATIO < LEGIBLE_FLOOR_PX) continue;
          drawRing(lc, centre, centre, radius, i);
        }
        layers[parity] = c;
      }

      const f = document.createElement("canvas");
      f.width = Math.ceil(width * dpr);
      f.height = Math.ceil(height * dpr);
      field = f;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      width = rect.width;
      height = rect.height;
      if (width === 0 || height === 0) return;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildLayers();
    };

    const draw = () => {
      const cx = width / 2;
      const cy = height / 2;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "rgba(255,255,255,0.045)";
      for (let y = DOT_GRID_SPACING / 2; y < height; y += DOT_GRID_SPACING) {
        for (let x = DOT_GRID_SPACING / 2; x < width; x += DOT_GRID_SPACING) {
          ctx.fillRect(x, y, 1, 1);
        }
      }

      const fc = field?.getContext("2d");
      if (!fc || !layers[0] || !layers[1]) return;

      fc.setTransform(dpr, 0, 0, dpr, 0, 0);
      fc.clearRect(0, 0, width, height);

      /* Entrance pulls the field inward and dims it. */
      const zoomScale = 1 - (1 - intro) * INTRO_ZOOM;
      fc.globalAlpha = (IDLE_ALPHA + (1 - IDLE_ALPHA) * power) * intro;

      for (const parity of [0, 1] as const) {
        const layer = layers[parity];
        if (!layer) continue;
        const dir = parity === 0 ? 1 : -1;
        fc.save();
        fc.translate(cx, cy);
        fc.rotate(angle * dir);
        fc.scale(zoomScale, zoomScale);
        fc.drawImage(layer, -layerSize / 2, -layerSize / 2, layerSize, layerSize);
        fc.restore();
      }
      fc.globalAlpha = 1;

      /* Ripples brighten a band travelling outward from the centre. */
      if (ripples.length) {
        fc.save();
        fc.globalCompositeOperation = "lighter";
        for (const t of ripples) {
          const p = t / RIPPLE_S;
          const radius = p * Math.hypot(width, height) * 0.75;
          const alpha = (1 - p) ** 2 * 0.5;
          const grad = fc.createRadialGradient(
            cx,
            cy,
            Math.max(0, radius - RIPPLE_BAND_PX),
            cx,
            cy,
            radius + RIPPLE_BAND_PX,
          );
          grad.addColorStop(0, "rgba(255,255,255,0)");
          grad.addColorStop(0.5, `rgba(255,255,255,${alpha})`);
          grad.addColorStop(1, "rgba(255,255,255,0)");
          fc.fillStyle = grad;
          fc.fillRect(0, 0, width, height);
        }
        fc.restore();
      }

      /* Punch the pointer hole out of the glyph layer only. */
      if (hovering) {
        fc.save();
        fc.globalCompositeOperation = "destination-out";
        const grad = fc.createRadialGradient(
          pointer.x,
          pointer.y,
          HOLE_PX * HOLE_FEATHER,
          pointer.x,
          pointer.y,
          HOLE_PX,
        );
        grad.addColorStop(0, "rgba(0,0,0,1)");
        grad.addColorStop(1, "rgba(0,0,0,0)");
        fc.fillStyle = grad;
        fc.fillRect(0, 0, width, height);
        fc.restore();
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(field as HTMLCanvasElement, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      elapsed += dt;
      if (intro < 1) {
        const t = Math.max(0, (elapsed - INTRO_DELAY_S) / INTRO_S);
        intro = t >= 1 ? 1 : 1 - (1 - t) ** 3;
      }

      const target = held ? 1 : 0;
      const rate = target > power ? SPIN_UP : SPIN_DOWN;
      power += (target - power) * Math.min(rate * dt, 1);
      if (Math.abs(target - power) < 0.001) power = target;

      angle += (IDLE_SPIN + (HELD_SPIN - IDLE_SPIN) * power) * dt;

      for (let i = ripples.length - 1; i >= 0; i--) {
        ripples[i] += dt;
        if (ripples[i] >= RIPPLE_S) ripples.splice(i, 1);
      }

      draw();
      frame = requestAnimationFrame(loop);
    };

    const setLabel = (text: string | null) => {
      const el = labelRef.current;
      if (!el) return;
      el.textContent = text ?? "";
      el.style.opacity = text ? "1" : "0";
    };

    const onEnter = () => {
      hovering = true;
      setLabel("CLICK & HOLD");
    };
    const onLeave = () => {
      hovering = false;
      if (held) {
        held = false;
        ripples.push(0);
      }
      setLabel(null);
    };
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      const el = labelRef.current;
      if (el) {
        el.style.left = `${pointer.x}px`;
        el.style.top = `${pointer.y}px`;
      }
    };
    const onDown = () => {
      held = true;
      setLabel("RELEASE");
    };
    const onUp = () => {
      if (!held) return;
      held = false;
      ripples.push(0);
      setLabel(hovering ? "CLICK & HOLD" : null);
    };

    resize();
    draw();

    canvas.addEventListener("pointerenter", onEnter);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);

    if (!reduced) {
      last = performance.now();
      frame = requestAnimationFrame(loop);
    }

    const observer = new ResizeObserver(() => {
      resize();
      draw();
    });
    observer.observe(canvas);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener("pointerenter", onEnter);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <div className={`relative ${className ?? ""}`}>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        data-text-vortex="true"
        className="size-full cursor-pointer touch-none select-none font-mono"
      />
      {/*
       * Driven imperatively from the pointer handlers rather than through
       * state, so cursor tracking never queues a React render.
       */}
      <span
        ref={labelRef}
        aria-hidden="true"
        className="pointer-events-none absolute z-1 -translate-y-1/2 translate-x-16 rounded-2 bg-white px-6 py-2 font-mono text-ui uppercase text-black opacity-0 transition-opacity duration-150"
      />
    </div>
  );
}
