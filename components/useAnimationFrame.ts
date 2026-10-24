"use client";
import { useEffect, type RefObject } from "react";
import { prefersReducedMotion } from "@/lib/scene/common";

/** Runs `tick` every frame while the element is near the viewport. With reduced motion it runs once. */
export function useAnimationFrame(ref: RefObject<HTMLElement | null>, tick: (now: number) => void) {
  useEffect(() => {
    const el = ref.current; if (!el) return;
    let visible = true, raf = 0, alive = true;
    const io = "IntersectionObserver" in window ? new IntersectionObserver((es) => { es.forEach((e) => { visible = e.isIntersecting; }); }, { rootMargin: "80px" }) : null;
    io?.observe(el);
    if (prefersReducedMotion()) { tick(performance.now()); document.fonts?.ready.then(() => tick(performance.now())); return () => io?.disconnect(); }
    const frame = (now: number) => { if (!alive) return; if (visible) tick(now); raf = requestAnimationFrame(frame); };
    raf = requestAnimationFrame(frame);
    return () => { alive = false; cancelAnimationFrame(raf); io?.disconnect(); };
  }, [ref, tick]);
}
