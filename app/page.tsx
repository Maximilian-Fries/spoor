import Link from "next/link";
import Reveal from "@/components/Reveal";
import PlanView from "@/components/PlanView";
import HowItWorks from "@/components/HowItWorks";
import CoverageGrowth from "@/components/CoverageGrowth";
import InterestForm from "@/components/InterestForm";
import Clock from "@/components/Clock";
import { BRAND, TAGLINE, LAUNCH_YEAR } from "@/lib/site";

const STATS = [
  { n: "116", l: "full or partial closures of German airports over unidentified drones in 2025", s: "Der Spiegel / DLR, June 2026" },
  { n: "€160", unit: "M", l: "estimated cost of those closures to airlines and airports", s: "Der Spiegel / DLR, June 2026" },
  { n: "3", unit: "of 13", l: "drone incidents in Saxony where police identified the pilot, first half of 2026", s: "Saxon state parliament, 2026" },
  { n: "1,000", unit: "+", l: "suspicious drone flights over critical sites, military bases and defense firms in Germany in 2025", s: "Federal Criminal Police (BKA)" },
];

const BUYERS = [
  { t: "Police and military", p: "One shared picture across many sites, and a trail that leads to the pilot instead of ending at the fence.", c: "Primary buyer" },
  { t: "Airports", p: "Confirm or clear a sighting in minutes and follow the drone toward its pilot, instead of closing the runway and waiting.", c: "116 closures in Germany, 2025" },
  { t: "Prisons and corrections", p: "The drop point and the pilot’s position as it happens, and evidence that supports an arrest.", c: "373 contraband drops, Georgia, 2025" },
  { t: "Navies and coast guards", p: "Track history toward the coast, and chase-drone video of where the drone lands, when a launch from a ship is suspected but cannot be shown.", c: "Baltic and North Sea first" },
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="wrap">
          <div className="hero-copy">
            <div className="eyebrow">{TAGLINE}</div>
            <h1>Every drone leaves a trail.</h1>
            <p className="lead">{BRAND} is a shared sensor network that records every drone track across many sites, follows the trail back to where the drone was launched, and cues the police drones already in service to follow it home.</p>
            <div className="ctas">
              <a className="btn primary" href="#how">See how it works <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></a>
              <a className="btn" href="#stealth">Register interest</a>
            </div>
            <p className="hero-note">Detecting a drone is becoming a commodity. <b>Proving where it came from is not.</b> That is the problem we exist to solve.</p>
          </div>
          <PlanView />
        </div>
      </section>

      <div className="wrap"><hr className="rule" /></div>

      <section id="why">
        <div className="wrap">
          <Reveal className="sec-head">
            <div>
              <div className="eyebrow">Why {BRAND} exists</div>
              <h2>When a drone closes an airport, nobody can say where it came from.</h2>
            </div>
            <p className="lead">Drones are shutting runways, dropping contraband into prisons and crossing military bases. The sensors to detect them exist. What does not exist is an answer to the question that decides the response: who flew it, and from where.</p>
          </Reveal>
          <Reveal className="stats">
            {STATS.map((st) => (
              <div className="stat" key={st.l}>
                <div className="n">{st.n}{st.unit && <small>{st.unit.startsWith("of") ? ` ${st.unit}` : st.unit}</small>}</div>
                <div className="l">{st.l}</div>
                <div className="s">{st.s}</div>
              </div>
            ))}
          </Reveal>
          <Reveal className="gap-line">
            <p>Without attribution every incident ends the same way. The drone leaves, the pilot is never found, and nobody can say whether it was a hobbyist or a hostile act. In our research we found no product that turns sensor tracks into evidence of a launch point. That is the gap {BRAND} closes.</p>
            <div className="q">After 144 suspected drone sightings across Europe since 2024, investigators could not tie a single drone to a launch site with signals, wreckage or video. Sweden’s military representative to NATO calls attribution often almost impossible.<span className="s">IISS report and critique, July 2026</span></div>
          </Reveal>
        </div>
      </section>

      <div className="wrap"><hr className="rule" /></div>

      <section id="what">
        <div className="wrap">
          <Reveal className="sec-head">
            <div>
              <div className="eyebrow">What {BRAND} delivers</div>
              <h2>A track, a launch area, and proof.</h2>
            </div>
            <p className="lead">One site sees a dot for a few seconds. A network of sites sees a path, and a path has a beginning.</p>
          </Reveal>
          <Reveal className="three">
            <div><div className="k">Output 1</div><h3>A track across sites</h3><p>Nodes hosted by many sites hand a drone from one to the next, so a track does not end at a fence. The network records every track it sees.</p></div>
            <div><div className="k">Output 2</div><h3>A launch area</h3><p>Replayed backwards, a track leads to where the drone entered coverage. The heading beyond that point gives an estimated launch area, on a road or off the coast.</p></div>
            <div><div className="k">Output 3</div><h3>Evidence that holds up</h3><p>Cued by the network, a police drone follows the intruder until it lands and films where it goes. A reusable drone has to return to someone.</p></div>
          </Reveal>
        </div>
      </section>

      <div className="wrap"><hr className="rule" /></div>

      <section id="how">
        <div className="wrap">
          <Reveal className="sec-head">
            <div>
              <div className="eyebrow">How it works</div>
              <h2>From the first detection to a filmed landing.</h2>
            </div>
            <p className="lead">Scroll through one incident. Each step is what the network does with the step before it.</p>
          </Reveal>
          <HowItWorks />
        </div>
      </section>

      <div className="wrap"><hr className="rule" /></div>

      <section id="who">
        <div className="wrap">
          <Reveal className="sec-head">
            <div>
              <div className="eyebrow">Who it is for</div>
              <h2>Built for those who have to act on a drone.</h2>
            </div>
            <p className="lead">The picture and the proof go to the authorities that must respond. The sites in between host the sensors and get the earliest warning.</p>
          </Reveal>
          <Reveal className="who">
            <div className="buyers">
              {BUYERS.map((b) => (
                <div className="buyer" key={b.t}><h3>{b.t}</h3><p>{b.p}</p><div className="c">{b.c}</div></div>
              ))}
            </div>
            <div className="host">
              <div className="eyebrow">Host a node</div>
              <h3>Your site becomes part of the picture.</h3>
              <p>Companies, operators and public buildings host a node. In return they get what a single site cannot buy on its own.</p>
              <ul>
                <li>Local alerts with an evidence pack for the police.</li>
                <li>Early warning from neighbouring nodes, before the drone arrives.</li>
                <li>A log of every overflight for insurers, auditors and regulators.</li>
                <li>Every node you add makes everyone’s traces longer.</li>
              </ul>
              <Link className="btn" href="/host">About hosting</Link>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="wrap"><hr className="rule" /></div>

      <section id="network">
        <div className="wrap">
          <div className="net">
            <Reveal className="net-copy">
              <div className="eyebrow">Why it compounds</div>
              <h2>Every new site makes every trace longer.</h2>
              <p>A single site sees a drone for seconds. Neighbouring nodes see it before it arrives, tracks across sites lead back to a launch point, and each site adds data that cuts false alarms.</p>
              <p>Coverage grows cluster by cluster: an industrial park, a port, a defense-industry region. The state pays for the combined picture. The hosts make it exist.</p>
            </Reveal>
            <Reveal><CoverageGrowth /></Reveal>
          </div>
        </div>
      </section>

      <section className="stealth" id="stealth">
        <div className="wrap">
          <Reveal>
            <div className="eyebrow">Status</div>
            <h2>We are in stealth.<br />Coming {LAUNCH_YEAR}.</h2>
            <p className="lead">{BRAND} is being built with police drone units and a first corridor of host sites. We are not taking customers yet. If you run drones for a police force, protect an airport or a prison, or want to host a node, we would like to talk.</p>
            <InterestForm />
          </Reveal>
          <Reveal className="status" aria-label="Company status">
            <div className="row"><div className="k">Status</div><div className="v"><span className="st"><span className="dot" aria-hidden="true" />Stealth</span></div></div>
            <div className="row"><div className="k">Now</div><div className="v">Corridor test: 3 to 5 nodes along a 2 to 3 km corridor, test drones flown through it</div></div>
            <div className="row"><div className="k">Next</div><div className="v">First chase-drone cue with a police partner</div></div>
            <div className="row"><div className="k">Launch</div><div className="v">{LAUNCH_YEAR}, Germany first</div></div>
            <div className="row"><div className="k">Clock</div><div className="v"><Clock /></div></div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
