"use client";
import { useEffect, useRef, useState } from "react";
import Panel, { Legend } from "./Panel";
import { PlanScene } from "@/lib/scene/plan";
import { readColors, PHASE_TAGS } from "@/lib/scene/common";

/** The shared low-altitude picture: one incident, drawn in its finished state. */
export default function PlanView() {
  const ref = useRef<HTMLCanvasElement>(null);
  const scene = useRef<PlanScene | null>(null);
  const [tag, setTag] = useState("7 host nodes");

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const s = new PlanScene(canvas, readColors(), true);
    s.onPhase = (p) => setTag(PHASE_TAGS[p]);
    scene.current = s;
    document.fonts?.ready.then(() => s.resize());
    return () => { s.destroy(); scene.current = null; };
  }, []);

  return (
    <Panel title="Live picture · Sector NE-4" tag={tag} foot={<Legend />}>
      <canvas ref={ref} role="img" aria-label="Animated map: seven host nodes track an intruding drone, trace it back to a launch area on the coast, and cue a police drone that follows it to its landing." />
    </Panel>
  );
}
