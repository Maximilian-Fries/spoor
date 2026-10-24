"use client";
import { useRef, type ReactNode } from "react";
import Swarm from "./Swarm";

/** A plate dense with drones; the copy sits in the clearing the swarm leaves around it. */
export default function StealthBand({ children, aside }: { children: ReactNode; aside: ReactNode }) {
  const copy = useRef<HTMLDivElement>(null);
  return (
    <section className="stealth" id="stealth">
      <div className="wrap">
        <div className="stealth-box">
          <Swarm density={7} tracked={2} dotRadius={1} speed={0.4} alpha={0.55} avoid={copy} />
          <div className="inner">
            <div className="stealth-copy" ref={copy}>{children}</div>
            {aside}
          </div>
        </div>
      </div>
    </section>
  );
}
