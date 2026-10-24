"use client";
import { useState, type FormEvent } from "react";
import { CONTACT_EMAIL } from "@/lib/site";

const ROLES = [
  ["police", "Police or military drone unit"],
  ["airport", "Airport"],
  ["corrections", "Prison or corrections"],
  ["navy", "Navy, coast guard or prosecutor"],
  ["host", "I want to host a node"],
  ["other", "Other"],
] as const;

/** Display-only while in stealth: nothing is sent or stored. The submit shows where to write instead. */
export default function InterestForm({ defaultRole = "" }: { defaultRole?: string }) {
  const [msg, setMsg] = useState("");

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(`Registrations open at launch. Until then, write to ${CONTACT_EMAIL}.`);
  }

  return (
    <form className="form" onSubmit={submit} noValidate>
      <div className="row2">
        <div className="field">
          <label htmlFor="interest-email">Work email</label>
          <input id="interest-email" name="email" type="email" inputMode="email" autoComplete="email" placeholder="name@organisation.example" />
        </div>
        <div className="field">
          <label htmlFor="interest-role">You are</label>
          <select id="interest-role" name="role" defaultValue={defaultRole}>
            <option value="" disabled>Choose one</option>
            {ROLES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      </div>
      <div className="field">
        <label htmlFor="interest-org">Organisation (optional)</label>
        <input id="interest-org" name="org" type="text" autoComplete="organization" placeholder="State police, airport, operator" />
      </div>
      <button className="btn primary" type="submit">Register interest</button>
      <div className="form-msg" aria-live="polite">{msg}</div>
      <div className="contact" style={{ gridColumn: "1 / -1" }}>Or write to <code>{CONTACT_EMAIL}</code></div>
    </form>
  );
}
