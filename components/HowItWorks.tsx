"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Panel, { Legend } from "./Panel";
import { ElevationScene } from "@/lib/scene/elevation";
import { readColors, prefersReducedMotion } from "@/lib/scene/common";
import { useAnimationFrame } from "./useAnimationFrame";
import { BRAND } from "@/lib/site";

const STEPS = [
  { title: "Sites host nodes", body: "A node is a small box with microphones, a camera and passive radio receivers. Companies, operators and public buildings mount one and get local alerts. Classification runs on the device, and no audio leaves it." },
  { title: "The network tracks", body: "As a drone crosses coverage, nodes hand its track from one to the next and fuse their bearings into one position. A single site sees a dot. The network sees a path." },
  { title: "The track is traced back", body: "Every track is recorded. Replayed backwards it leads to the point where the drone entered coverage, and the heading beyond gives an estimated launch area, with the uncertainty stated." },
  { title: "A police drone follows it home", body: `${BRAND} cues drones that police already operate. The chase drone follows the intruder until it lands and films where it goes. That recording is the proof.` },
];

const KEYS = [
  { cls: "net", label: "Node and coverage" },
  { cls: "hot", label: "Intruder" },
  { cls: "trace", label: "Trace-back" },
  { cls: "police", label: "Police drone" },
];

/** Sticky elevation drawing on the left; the step nearest the viewport centre drives its phase. */
export default function HowItWorks() {
  const ref = useRef<HTMLCanvasElement>(null);
  const scene = useRef<ElevationScene | null>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const s = new ElevationScene(canvas, readColors(), prefersReducedMotion());
    scene.current = s;
    document.fonts?.ready.then(() => s.resize());
    return () => { s.destroy(); scene.current = null; };
  }, []);
  useAnimationFrame(ref, useCallback((now: number) => scene.current?.render(now), []));

  useEffect(() => {
    const pick = () => {
      const mid = window.innerHeight * 0.5;
      let best = 0, bestD = Infinity;
      stepRefs.current.forEach((el, i) => { if (!el) return; const r = el.getBoundingClientRect(); const d = Math.abs((r.top + r.bottom) / 2 - mid); if (d < bestD) { bestD = d; best = i; } });
      setActive((a) => (a === best ? a : best));
      scene.current?.setPhase(best);
    };
    pick();
    window.addEventListener("scroll", pick, { passive: true });
    window.addEventListener("resize", pick);
    return () => { window.removeEventListener("scroll", pick); window.removeEventListener("resize", pick); };
  }, []);

  return (
    <div className="how">
      <div className="sticky">
        <Panel title="Elevation · TRK-0417" tag={`Step ${active + 1} of ${STEPS.length}`} foot={<Legend keys={KEYS} />}>
          <canvas ref={ref} className="elev" role="img" aria-label="Side elevation of the incident: masts with coverage domes along six kilometres of ground, the drone at eighty metres, the trace back to a vehicle on the coastal road, and the police drone that follows it." />
        </Panel>
      </div>
      <div className="steps">
        {STEPS.map((st, i) => (
          <div key={st.title} ref={(el) => { stepRefs.current[i] = el; }} className={`step${i === active ? " active" : ""}`}>
            <div className="num">{String(i + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}</div>
            <h3>{st.title}</h3>
            <p>{st.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
