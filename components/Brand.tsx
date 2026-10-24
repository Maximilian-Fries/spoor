import Link from "next/link";
import { BRAND } from "@/lib/site";

export function Mark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="19.2" cy="4.8" r="1.3" fill="currentColor" opacity=".38" />
      <circle cx="14.6" cy="9.4" r="1.9" fill="currentColor" opacity=".66" />
      <circle cx="8.6" cy="15.4" r="2.9" fill="currentColor" />
    </svg>
  );
}

export default function Brand() {
  return (
    <Link className="wordmark" href="/" aria-label={`${BRAND}, home`}>
      <Mark />
      <span>{BRAND}</span>
    </Link>
  );
}
