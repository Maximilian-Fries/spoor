import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import InterestForm from "@/components/InterestForm";
import { BRAND } from "@/lib/site";

export const metadata: Metadata = { title: "Host a node", description: `What it means to host a ${BRAND} node at your site, and what you get in return.` };

export default function HostPage() {
  return (
    <section className="page">
      <div className="wrap">
        <div className="eyebrow">Host a node</div>
        <h1>Your site becomes part of the picture.</h1>
        <p className="lead">A node is a small box on a roof or a mast. It listens and looks for drones, classifies them on the device, and shares tracks with the network. You get warning before a drone arrives and evidence after it has gone.</p>

        <Reveal className="cards">
          <div><h3>What you get</h3><p>Alerts with an evidence pack you can hand to the police. Early warning from your neighbours’ nodes. A log of every overflight for insurers, auditors and the incident reports critical-infrastructure operators will owe.</p></div>
          <div><h3>What we ask</h3><p>A mounting point with a clear view of the sky, mains or a solar kit, and a mobile uplink we provide. Installation takes a morning. There is nothing for your staff to operate.</p></div>
          <div><h3>What the node is</h3><p>A microphone array, a camera, a Remote ID receiver and a passive radio sensor on one board. Classification runs on the device. Audio never leaves it and no speech is stored.</p></div>
          <div><h3>What it costs</h3><p>During the corridor test, nothing. We are selecting the first clusters now: an industrial park, a port, a defense-industry region. Sites in a cluster join together, so coverage is useful from day one.</p></div>
        </Reveal>

        <Reveal className="prose">
          <h2>Data and privacy</h2>
          <p>Detection on your own site is legal in Germany when data protection is respected. The node is designed so that capturing speech is impossible, and we will confirm that with counsel before the first install. Tracks, not recordings, are shared with the network. Sharing with the police happens under an agreement you sign, not by default.</p>
          <h2>Who hosts first</h2>
          <p>Sites that already see drones: suppliers to the defense industry, logistics depots, ports, substations and public buildings near airports or bases. If your site has had an unexplained overflight, you are exactly who we want to talk to.</p>
        </Reveal>

        <InterestForm defaultRole="host" />
      </div>
    </section>
  );
}
