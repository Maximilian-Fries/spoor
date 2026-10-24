import type { Metadata } from "next";
import { BRAND, CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy" };

/** Privacy notice. Review with counsel before launch; the bracketed items need real values. */
export default function PrivacyPage() {
  return (
    <section className="page">
      <div className="wrap">
        <div className="eyebrow">Privacy</div>
        <h1>Privacy notice</h1>
        <p className="lead">This site stores as little as possible. What it does store, and why, is listed here.</p>
        <div className="prose">
          <h2>Controller</h2>
          <p>{BRAND} <span className="ph">[legal form and address]</span>, reachable at {CONTACT_EMAIL}.</p>
          <h2>Visiting the site</h2>
          <p>The site sets no cookies and loads no third-party analytics. Fonts are bundled with the site and served from the same server, so no font provider sees your visit. The web server keeps standard access logs (IP address, time, requested page) for <span className="ph">[retention period]</span> to run and secure the service, on the basis of our legitimate interest (Art. 6 (1) f GDPR).</p>
          <h2>Registering interest</h2>
          <p>While we are in stealth, the interest form on this site does not send or store anything. If you write to {CONTACT_EMAIL}, we keep your message to reply to it and delete it on request.</p>
          <h2>Your rights</h2>
          <p>You can ask what we hold about you, have it corrected or deleted, restrict its use, receive it in a portable form, and complain to a supervisory authority. The authority responsible for us is <span className="ph">[state data protection authority]</span>.</p>
        </div>
      </div>
    </section>
  );
}
