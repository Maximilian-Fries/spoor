import type { Metadata } from "next";
import { BRAND, CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = { title: "Imprint" };

/** Legal notice (Impressum). Replace every bracketed placeholder before the site goes public. */
export default function ImprintPage() {
  return (
    <section className="page">
      <div className="wrap">
        <div className="eyebrow">Imprint</div>
        <h1>Legal notice</h1>
        <div className="prose">
          <h2>Provider</h2>
          <p>{BRAND} <span className="ph">[legal form, e.g. GmbH]</span><br /><span className="ph">[street and number]</span><br /><span className="ph">[postcode and city]</span>, Germany</p>
          <p>Represented by: <span className="ph">[managing director(s)]</span></p>
          <h2>Contact</h2>
          <p>Email: {CONTACT_EMAIL}<br />Phone: <span className="ph">[phone number]</span></p>
          <h2>Register</h2>
          <p>Commercial register: <span className="ph">[court and number]</span><br />VAT ID: <span className="ph">[DE…]</span></p>
          <h2>Responsible for content</h2>
          <p><span className="ph">[name and address]</span></p>
        </div>
      </div>
    </section>
  );
}
