import DotSphere from "./DotSphere";
import { BRAND } from "@/lib/site";

/** Headline beside a living sphere of drones. */
export default function Hero() {
  return (
    <section className="hero">
      <div className="wrap">
        <div className="hero-copy">
          <div className="eyebrow">A shared low-altitude picture</div>
          <h1>Drone detection that scales.</h1>
          <p className="lead">{BRAND} turns the sites that already exist into one network. Every drone is detected, tracked from site to site, and traced back to where it was launched.</p>
          <div className="ctas">
            <a className="btn primary" href="#picture">See the picture <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></a>
            <a className="btn" href="#how">How it works</a>
          </div>
        </div>
        <div className="sphere">
          <DotSphere />
          <div className="hero-key" aria-hidden="true"><span><i />Drones in the air</span><span><i className="hot" />Traced by {BRAND}</span></div>
        </div>
      </div>
    </section>
  );
}
