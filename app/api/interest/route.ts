import { NextResponse } from "next/server";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

const FILE = path.join(process.cwd(), "data", "interest.jsonl");
const ROLES = new Set(["police", "airport", "corrections", "navy", "host", "other"]);

/** Appends one JSON line per registration. Local only; swap for a database before deploying. */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const email = String(body.email ?? "").trim().toLowerCase();
  const role = String(body.role ?? "").trim();
  const org = String(body.org ?? "").trim().slice(0, 200);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  if (!ROLES.has(role)) return NextResponse.json({ error: "Choose who you are." }, { status: 400 });
  const entry = { at: new Date().toISOString(), email, role, org };
  await mkdir(path.dirname(FILE), { recursive: true });
  await appendFile(FILE, JSON.stringify(entry) + "\n", "utf8");
  return NextResponse.json({ ok: true });
}
