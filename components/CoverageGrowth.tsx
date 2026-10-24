"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Panel from "./Panel";
import { CoverageScene, type Readout } from "@/lib/scene/coverage";
import { readColors, prefersReducedMotion } from "@/lib/scene/common";
import { useAnimationFrame } from "./useAnimationFrame";

/** One cluster filling in with host sites; readouts show what the network gains. */
export default function CoverageGrowth() {
  const ref = useRef<HTMLCanvasElement>(null);
  const scene = useRef<CoverageScene | null>(null);
  const [r, setR] = useState<Readout>({ hosts: 3, trackKm: 0.6, warnSeconds: 22, complete: false });

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const s = new CoverageScene(canvas, readColors(), prefersReducedMotion());
    s.onReadout = setR;
    scene.current = s;
    document.fonts?.ready.then(() => s.resize());
    return () => { s.destroy(); scene.current = null; };
  }, []);
  useAnimationFrame(ref, useCallback((now: number) => scene.current?.draw(now / 1000), []));

  return (
    <Panel title="Coverage growth · one cluster" tag={r.complete ? "Cluster complete" : "Hosts joining"} foot={
      <div className="readouts">
        <div className="readout"><div className="k">Host sites</div><div className="v">{r.hosts}</div></div>
        <div className="readout"><div className="k">Track seen</div><div className="v">{r.trackKm.toFixed(1)} <em>km</em></div></div>
        <div className="readout"><div className="k">Warning before arrival</div><div className="v">{r.warnSeconds} <em>s</em></div></div>
      </div>
    }>
      <canvas ref={ref} className="wide" role="img" aria-label="Animated diagram: as more sites host nodes, the tracked portion of a sample drone path grows and warning time increases." />
    </Panel>
  );
}
