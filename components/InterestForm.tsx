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

/** Stores the entry locally through /api/interest (data/interest.jsonl). */
export default function InterestForm({ defaultRole = "" }: { defaultRole?: string }) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setState("busy"); setMsg("");
    try {
      const res = await fetch("/api/interest", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const out = await res.json();
      if (!res.ok) throw new Error(out.error || "Something went wrong.");
      setState("done"); setMsg("Noted. We will write when we come out of stealth.");
      form.reset();
    } catch (err) {
      setState("error"); setMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <form className="form" onSubmit={submit} noValidate>
      <div className="row2">
        <div className="field">
          <label htmlFor="interest-email">Work email</label>
          <input id="interest-email" name="email" type="email" inputMode="email" autoComplete="email" required placeholder="name@organisation.example" />
        </div>
        <div className="field">
          <label htmlFor="interest-role">You are</label>
          <select id="interest-role" name="role" defaultValue={defaultRole} required>
            <option value="" disabled>Choose one</option>
            {ROLES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      </div>
      <div className="field">
        <label htmlFor="interest-org">Organisation (optional)</label>
        <input id="interest-org" name="org" type="text" autoComplete="organization" placeholder="State police, airport, operator" />
      </div>
      <button className="btn primary" type="submit" disabled={state === "busy"}>{state === "busy" ? "Sending" : "Register interest"}</button>
      <div className={`form-msg${state === "error" ? " err" : ""}`} aria-live="polite">{msg}</div>
      <div className="contact" style={{ gridColumn: "1 / -1" }}>Or write to <code>{CONTACT_EMAIL}</code></div>
    </form>
  );
}
