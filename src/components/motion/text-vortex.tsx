"use client";

import { useEffect, useRef } from "react";

/*
 * Text vortex.
 *
 * Concentric rings of repeating text that scale outward from a centre point,
 * reading as an infinite tunnel. Each ring holds its angular position while its
 * radius grows, so the whole field appears to rush toward the viewer.
 *
 * Rings are placed on a logarithmic radius so the spacing between them stays
 * visually even as they grow: a ring's phase runs 0 to 1 and its radius is
 * R_MIN * (R_MAX/R_MIN)^phase. Advancing every phase at the same rate and
 * wrapping at 1 recycles rings back to the centre for free, with no pop.
 *
 * Font size scales with radius, so the text keeps a constant apparent size
 * relative to its ring and the tunnel reads as perspective rather than as text
 * simply getting bigger.
 *
 * Canvas rather than SVG textPath: the per-character dropout re-rolls every few
 * frames across a few thousand glyphs, which would thrash the DOM.
 */

const PHRASE = "THE CONTENT ARCHITECTURE ";

const RING_COUNT = 12;
/* Radii as a fraction of the panel's half-diagonal, so coverage holds at any aspect. */
const R_MIN = 0.06;
const R_MAX = 1.5;

/* Full traversal from centre to edge, in seconds. */
const CYCLE_S = 26;

/*
 * Font size as a fraction of ring radius, keeping apparent size constant as a
 * ring grows. Rings whose text would fall below the legible floor are dropped
 * rather than clamped: clamping would break the proportion and pile oversized
 * glyphs on top of each other at the centre.
 */
const FONT_RATIO = 0.075;
const LEGIBLE_FLOOR_PX = 6;
const LETTER_SPACING = 1.28;

/* Fraction of characters blanked at any moment, and how often the set re-rolls. */
const DROPOUT = 0.05;
const DROPOUT_HZ = 7;

/* Rings fade in over the first slice of their life and out over the last. */
const FADE_IN = 0.12;
const FADE_OUT = 0.82;

const DOT_SPACING = 26;

/* Deterministic hash, so dropout is stable within a re-roll bucket. */
function hash(a: number, b: number, c: number): number {
  let h = (a * 374761393 + b * 668265263 + c * 2246822519) >>> 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export function TextVortex({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let frame = 0;
    let start = performance.now();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawDots = () => {
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      for (let y = DOT_SPACING / 2; y < height; y += DOT_SPACING) {
        for (let x = DOT_SPACING / 2; x < width; x += DOT_SPACING) {
          ctx.fillRect(x, y, 1, 1);
        }
      }
    };

    const draw = (now: number) => {
      const t = reduced ? 0.22 : ((now - start) / 1000 / CYCLE_S) % 1;
      const bucket = Math.floor((now / 1000) * DROPOUT_HZ);

      ctx.fillStyle = "#0b0b0b";
      ctx.fillRect(0, 0, width, height);
      drawDots();

      const cx = width / 2;
      const cy = height / 2;
      const scale = Math.hypot(width, height) / 2;
      const growth = R_MAX / R_MIN;

      ctx.fillStyle = "#f1eee7";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (let i = 0; i < RING_COUNT; i++) {
        const phase = (i / RING_COUNT + t) % 1;
        const radius = R_MIN * growth ** phase * scale;

        const fontSize = radius * FONT_RATIO;
        if (fontSize < LEGIBLE_FLOOR_PX) continue;

        /* Fade at both ends of the run so rings never pop in or out. */
        let alpha = 1;
        if (phase < FADE_IN) alpha = phase / FADE_IN;
        else if (phase > FADE_OUT) alpha = (1 - phase) / (1 - FADE_OUT);
        if (alpha <= 0.01) continue;

        ctx.globalAlpha = alpha;
        ctx.font = `${fontSize}px var(--font-geist-mono), ui-monospace, monospace`;

        const charWidth = ctx.measureText("M").width * LETTER_SPACING;
        const count = Math.max(8, Math.floor((2 * Math.PI * radius) / charWidth));
        const step = (2 * Math.PI) / count;

        /* Offset each ring so the phrase does not align into radial seams. */
        const offset = i * 3;

        for (let c = 0; c < count; c++) {
          if (hash(i, c, bucket) < DROPOUT) continue;

          const char = PHRASE[(c + offset) % PHRASE.length];
          if (char === " ") continue;

          ctx.save();
          ctx.translate(cx, cy);
          /*
           * Negative, so successive characters advance rightward along the
           * bottom of the ring. Rotating the other way lays the phrase out
           * back to front.
           */
          ctx.rotate(-c * step);
          /* Sits at the bottom of the circle, so the glyph's up-vector points inward. */
          ctx.translate(0, radius);
          ctx.fillText(char, 0, 0);
          ctx.restore();
        }
      }

      ctx.globalAlpha = 1;
    };

    const loop = (now: number) => {
      draw(now);
      frame = requestAnimationFrame(loop);
    };

    resize();
    if (reduced) {
      draw(performance.now());
    } else {
      start = performance.now();
      frame = requestAnimationFrame(loop);
    }

    const observer = new ResizeObserver(() => {
      resize();
      draw(performance.now());
    });
    observer.observe(canvas);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-text-vortex="true"
      className={className}
    />
  );
}
