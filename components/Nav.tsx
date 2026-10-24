"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Brand from "./Brand";
import { NAV, LAUNCH_YEAR } from "@/lib/site";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  return (
    <header className="nav">
      <div className="wrap">
        <Brand />
        <nav className="navlinks" aria-label="Sections">
          {NAV.map((n) => (
            <Link key={n.href} className="hide-m" href={n.href} aria-current={path === n.href ? "page" : undefined}>{n.label}</Link>
          ))}
          <Link className="pill" href="/#stealth"><span className="dot" aria-hidden="true" />Stealth · {LAUNCH_YEAR}</Link>
          <button className="menu-btn" type="button" aria-expanded={open} aria-controls="menu" aria-label="Menu" onClick={() => setOpen((o) => !o)}>
            <svg viewBox="0 0 18 18" fill="none" aria-hidden="true">{open ? <path d="M4 4l10 10M14 4 4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /> : <path d="M2 5h14M2 9h14M2 13h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />}</svg>
          </button>
        </nav>
      </div>
      <div id="menu" className="menu" hidden={!open}>
        <div className="wrap">
          {NAV.map((n) => <Link key={n.href} href={n.href} onClick={() => setOpen(false)}>{n.label}</Link>)}
        </div>
      </div>
    </header>
  );
}
