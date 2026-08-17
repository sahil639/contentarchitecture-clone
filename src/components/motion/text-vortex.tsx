"use client";

import { useEffect, useRef, useState } from "react";

/*
 * Text vortex.
 *
 * Concentric rings of repeating text forming a tunnel. At rest the field is
 * completely still and dim — it reads as a printed texture, not an animation.
 * Pressing and holding spins it up: it rotates, pulls toward the viewer,
 * brightens, and its character dropout begins re-rolling. Releasing eases it
 * back down to rest.
 *
 * All of that is driven by one eased scalar, `power`, running 0 at rest to 1
 * held. Rotation and zoom integrate against it rather than being set from it,
 * so the field keeps whatever position it reached instead of snapping back
 * when the pointer lifts.
 *
 * Rings sit on a logarithmic radius, so their spacing stays visually even as
 * they grow and recycling is free: advance every phase at one rate, wrap at 1.
 * Font size tracks radius so the tunnel reads as perspective rather than as
 * text merely enlarging.
 *
 * Canvas rather than SVG textPath: the dropout re-rolls across a few thousand
 * glyphs while held, which would thrash the DOM.
 */

const PHRASE = "THE CONTENT ARCHITECTURE ";

const RING_COUNT = 12;
/* Radii as a fraction of the panel's half-diagonal, so coverage holds at any aspect. */
const R_MIN = 0.06;
const R_MAX = 1.5;

/* Font size as a fraction of ring radius; rings below the legible floor are dropped. */
const FONT_RATIO = 0.075;
const LEGIBLE_FLOOR_PX = 6;
const LETTER_SPACING = 1.28;

/* How fast `power` chases its target, in units per second. */
const SPIN_UP = 1.9;
const SPIN_DOWN = 1.15;

/* At full power: radians per second, and tunnel traversals per second. */
const MAX_SPIN = 0.38;
const MAX_ZOOM = 0.055;

const IDLE_ALPHA = 0.62;
const IDLE_DROPOUT = 0.06;
const HELD_DROPOUT = 0.16;
/* Dropout re-rolls only while spinning; at rest the gaps are fixed. */
const DROPOUT_HZ = 9;

/* Rings fade in over the first slice of their life and out over the last. */
const FADE_IN = 0.12;
const FADE_OUT = 0.82;

const DOT_SPACING = 26;

/* Deterministic hash, so dropout is stable within a bucket. */
function hash(a: number, b: number, c: number): number {
  let h = (a * 374761393 + b * 668265263 + c * 2246822519) >>> 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export function TextVortex({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heldRef = useRef(false);
  const [held, setHeld] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let frame = 0;
    let last = performance.now();

    /* Eased 0..1 drive, plus the two values that integrate against it. */
    let power = 0;
    let angle = 0;
    let zoom = 0;
    let dropoutClock = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      ctx.fillStyle = "#0b0b0b";
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "rgba(255,255,255,0.05)";
      for (let y = DOT_SPACING / 2; y < height; y += DOT_SPACING) {
        for (let x = DOT_SPACING / 2; x < width; x += DOT_SPACING) {
          ctx.fillRect(x, y, 1, 1);
        }
      }

      const cx = width / 2;
      const cy = height / 2;
      const scale = Math.hypot(width, height) / 2;
      const growth = R_MAX / R_MIN;

      const bucket = Math.floor(dropoutClock * DROPOUT_HZ);
      const dropout = IDLE_DROPOUT + (HELD_DROPOUT - IDLE_DROPOUT) * power;
      const brightness = IDLE_ALPHA + (1 - IDLE_ALPHA) * power;

      ctx.fillStyle = "#f1eee7";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (let i = 0; i < RING_COUNT; i++) {
        const phase = (((i / RING_COUNT + zoom) % 1) + 1) % 1;
        const radius = R_MIN * growth ** phase * scale;

        const fontSize = radius * FONT_RATIO;
        if (fontSize < LEGIBLE_FLOOR_PX) continue;

        /* Fade at both ends of the run so rings never pop in or out. */
        let alpha = 1;
        if (phase < FADE_IN) alpha = phase / FADE_IN;
        else if (phase > FADE_OUT) alpha = (1 - phase) / (1 - FADE_OUT);
        alpha *= brightness;
        if (alpha <= 0.01) continue;

        ctx.globalAlpha = alpha;
        ctx.font = `${fontSize}px var(--font-geist-mono), ui-monospace, monospace`;

        const charWidth = ctx.measureText("M").width * LETTER_SPACING;
        const count = Math.max(8, Math.floor((2 * Math.PI * radius) / charWidth));
        const step = (2 * Math.PI) / count;

        /* Offset each ring so the phrase does not align into radial seams. */
        const offset = i * 3;

        for (let c = 0; c < count; c++) {
          if (hash(i, c, bucket) < dropout) continue;

          const char = PHRASE[(c + offset) % PHRASE.length];
          if (char === " ") continue;

          ctx.save();
          ctx.translate(cx, cy);
          /*
           * Negative, so successive characters advance rightward along the
           * bottom of the ring. Rotating the other way lays the phrase out
           * back to front.
           */
          ctx.rotate(angle - c * step);
          /* Sits at the bottom of the circle, so the glyph's up-vector points inward. */
          ctx.translate(0, radius);
          ctx.fillText(char, 0, 0);
          ctx.restore();
        }
      }

      ctx.globalAlpha = 1;
    };

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const target = heldRef.current ? 1 : 0;
      const rate = target > power ? SPIN_UP : SPIN_DOWN;
      power += (target - power) * Math.min(rate * dt, 1);
      if (Math.abs(target - power) < 0.001) power = target;

      angle += power * MAX_SPIN * dt;
      zoom += power * MAX_ZOOM * dt;
      dropoutClock += power * dt;

      draw();

      /* At rest the image is fixed, so stop drawing until something changes. */
      if (power === 0 && target === 0) {
        frame = 0;
        return;
      }
      frame = requestAnimationFrame(loop);
    };

    const kick = () => {
      if (frame === 0) {
        last = performance.now();
        frame = requestAnimationFrame(loop);
      }
    };
    canvas.dataset.kick = "1";
    (canvas as HTMLCanvasElement & { _kick?: () => void })._kick = kick;

    resize();
    draw();
    if (reduced) return;

    const observer = new ResizeObserver(() => {
      resize();
      draw();
    });
    observer.observe(canvas);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  const setHeldState = (next: boolean) => {
    heldRef.current = next;
    setHeld(next);
    const canvas = canvasRef.current as
      | (HTMLCanvasElement & { _kick?: () => void })
      | null;
    canvas?._kick?.();
  };

  return (
    <div
      className={`relative ${className ?? ""}`}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => {
        setHovered(false);
        setHeldState(false);
      }}
      onPointerMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setPointer({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
      onPointerDown={() => setHeldState(true)}
      onPointerUp={() => setHeldState(false)}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        data-text-vortex={held ? "held" : "idle"}
        className="size-full touch-none select-none"
      />

      {/* Follows the pointer, naming the interaction and its current state. */}
      {hovered && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute z-1 -translate-y-1/2 translate-x-16 rounded-2 bg-off-white px-6 py-2 font-mono text-ui uppercase text-black"
          style={{ left: pointer.x, top: pointer.y }}
        >
          {held ? "Release" : "Click & hold"}
        </span>
      )}
    </div>
  );
}
