import Link from "next/link";
import { BRAND } from "@/lib/site";

export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <span>© 2026 {BRAND} · spoor, n.: a trail followed back to where it began · Built in Europe</span>
        <span>Figures from public sources, 2025 to 2026 · <Link href="/imprint">Imprint</Link> · <Link href="/privacy">Privacy</Link></span>
      </div>
    </footer>
  );
}
