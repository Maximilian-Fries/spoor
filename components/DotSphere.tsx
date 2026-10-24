"use client";
import { useCallback, useEffect, useRef } from "react";
import { DotSphere as Globe } from "@/lib/scene/sphere";
import { readColors } from "@/lib/scene/common";
import { useAnimationFrame } from "./useAnimationFrame";

/** A living sphere of drones. Square; sized by its container. Leans toward the pointer. */
export default function DotSphere() {
  const ref = useRef<HTMLCanvasElement>(null);
  const globe = useRef<Globe | null>(null);

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const g = new Globe(canvas, readColors(), false);
    globe.current = g;
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const nx = ((e.clientX - (r.left + r.width / 2)) / Math.max(1, window.innerWidth / 2));
      const ny = ((e.clientY - (r.top + r.height / 2)) / Math.max(1, window.innerHeight / 2));
      g.lean(Math.max(-1, Math.min(1, nx)), Math.max(-1, Math.min(1, ny)));
    };
    const onLeave = () => g.lean(0, 0);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => { g.destroy(); globe.current = null; window.removeEventListener("pointermove", onMove); document.removeEventListener("pointerleave", onLeave); };
  }, []);
  useAnimationFrame(ref, useCallback((now: number) => globe.current?.frame(now), []));

  return <canvas ref={ref} className="sphere-canvas" role="img" aria-label="A sphere made of hundreds of small black dots, slowly turning, with a few drones marked in orange leaving trails." />;
}
