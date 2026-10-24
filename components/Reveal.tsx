"use client";
import { useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from "react";

/** Fades a block in when it scrolls into view. Renders visible without script; owns its own class so hydration stays clean. */
export default function Reveal({ className = "", children, ...rest }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    // Reduced motion is handled in CSS (the block is always visible); here we only need the observer.
    const io = "IntersectionObserver" in window
      ? new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { setOn(true); io?.disconnect(); } }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 })
      : null;
    io?.observe(el);
    const t = window.setTimeout(() => setOn(true), 2500); // safety net: never leave a block hidden
    return () => { io?.disconnect(); window.clearTimeout(t); };
  }, []);
  return <div ref={ref} className={`${className} rv${on ? " in" : ""}`.trim()} {...rest}>{children}</div>;
}
