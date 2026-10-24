"use client";
import { useRef } from "react";
import Swarm from "./Swarm";
import { BRAND } from "@/lib/site";

/** Headline over a drifting swarm of drones; the flock flows around the text. */
export default function Hero() {
  const copy = useRef<HTMLDivElement>(null);
  return (
    <section className="hero">
      <Swarm density={5} tracked={3} dotRadius={1.05} avoid={copy} />
      <div className="wrap">
        <div className="hero-copy" ref={copy}>
          <div className="eyebrow">A shared low-altitude picture</div>
          <h1>Drone detection that scales.</h1>
          <p className="lead">{BRAND} turns the sites that already exist into one network. Every drone is detected, tracked from site to site, and traced back to where it was launched.</p>
          <div className="ctas">
            <a className="btn primary" href="#picture">See the picture <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></a>
            <a className="btn" href="#how">How it works</a>
          </div>
        </div>
        <div className="hero-key" aria-hidden="true"><span><i />Drones in the air</span><span><i className="hot" />Traced by {BRAND}</span></div>
      </div>
    </section>
  );
}
