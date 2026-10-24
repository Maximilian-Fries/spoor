"use client";
import { useEffect, useRef, type RefObject } from "react";
import { Swarm as Flock } from "@/lib/scene/swarm";
import { readColors } from "@/lib/scene/common";

interface Props {
  density?: number; tracked?: number; dotRadius?: number; speed?: number; alpha?: number;
  /** an element the swarm flows around (its box is measured every frame) */
  avoid?: RefObject<HTMLElement | null>;
  className?: string;
}

/** Drones as a still swarm of tiny black dots. Fills its parent; put it behind content with position: absolute. */
export default function Swarm({ density = 3.2, tracked = 3, dotRadius = 1.15, speed = 0.55, alpha = 0.82, avoid, className = "swarm" }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const flock = useRef<Flock | null>(null);

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const C = readColors();
    const f = new Flock(canvas, { density, tracked, dotRadius, speed, ink: C.fg, accent: C.hot, alpha });
    flock.current = f;
    if (avoid?.current) { const a = avoid.current.getBoundingClientRect(), c = canvas.getBoundingClientRect(); f.avoid = { x: a.left - c.left, y: a.top - c.top, w: a.width, h: a.height }; }
    for (let i = 0; i < 220; i++) f.step(16.67); // settle into flocks, then hold still
    f.draw();
    return () => { f.destroy(); flock.current = null; };
  }, [density, tracked, dotRadius, speed, alpha, avoid]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
