import { easeOut, type Colors, type Pt } from "./common";

export interface Readout { hosts: number; trackKm: number; warnSeconds: number; complete: boolean }

const SITES = (() => {
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const out: { x: number; y: number; r: number }[] = [];
  let tries = 0;
  while (out.length < 22 && tries < 4000) {
    tries++;
    const x = 0.07 + rnd() * 0.86, y = 0.07 + rnd() * 0.44;
    if (out.every((o) => Math.hypot(o.x - x, o.y - y) >= 0.115)) out.push({ x, y, r: 0.085 + rnd() * 0.03 });
  }
  return out;
})();
const MAXS = SITES.length, GROW = MAXS - 3;
const TRACK: [Pt, Pt] = [[0.02, 0.22], [0.98, 0.42]];
const KM_PER_UNIT = 6; // scene width = 6 km
const SITE_X = 0.86;
const CYCLE = 11;

/** Coverage growth: one cluster filling in, with the tracked share of a sample path. */
export class CoverageScene {
  c: HTMLCanvasElement; ctx: CanvasRenderingContext2D; C: Colors; reduce: boolean;
  W = 0; H = 0; s = 1; ox = 0; oy = 0;
  lastHosts = -1; lastTime = 8.5;
  onReadout: ((r: Readout) => void) | null = null;
  private ro: ResizeObserver | null = null;

  constructor(canvas: HTMLCanvasElement, colors: Colors, reduce: boolean) {
    this.c = canvas; this.ctx = canvas.getContext("2d")!; this.C = colors; this.reduce = reduce;
    this.resize();
    if (typeof ResizeObserver !== "undefined") { this.ro = new ResizeObserver(() => this.resize()); this.ro.observe(canvas); }
  }
  destroy() { this.ro?.disconnect(); }
  resize() {
    const r = this.c.getBoundingClientRect(); if (!r.width) return;
    const d = Math.min(2, window.devicePixelRatio || 1);
    this.c.width = Math.round(r.width * d); this.c.height = Math.round(r.height * d);
    this.ctx.setTransform(d, 0, 0, d, 0, 0);
    this.W = r.width; this.H = r.height; this.s = Math.max(r.width, r.height / 0.5625);
    this.ox = (r.width - this.s) / 2; this.oy = (r.height - this.s * 0.5625) / 2;
    this.lastHosts = -1; this.draw(this.lastTime);
  }
  P(x: number, y: number): Pt { return [this.ox + x * this.s, this.oy + y * this.s]; }

  draw(time: number) {
    this.lastTime = time;
    const ctx = this.ctx, C = this.C, W = this.W, H = this.H, s = this.s;
    const t = this.reduce ? CYCLE * 0.75 : time % CYCLE;
    const count = t < 8 ? 3 + Math.floor(easeOut(t / 8) * GROW) : MAXS;
    const age = (i: number) => Math.min(1, (t - (i < 3 ? 0 : ((i - 3) / GROW) * 8)) / 0.6);
    ctx.clearRect(0, 0, W, H);
    // grid
    ctx.save(); ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.globalAlpha = 0.7; const g = s / 16;
    for (let x = this.ox % g; x < W; x += g) { ctx.beginPath(); ctx.moveTo(Math.round(x) + 0.5, 0); ctx.lineTo(Math.round(x) + 0.5, H); ctx.stroke(); }
    for (let y = this.oy % g; y < H; y += g) { ctx.beginPath(); ctx.moveTo(0, Math.round(y) + 0.5); ctx.lineTo(W, Math.round(y) + 0.5); ctx.stroke(); }
    ctx.restore();
    // coverage union
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < count; i++) { const n = SITES[i], p = this.P(n.x, n.y), a = age(i); if (a <= 0) continue; ctx.beginPath(); ctx.arc(p[0], p[1], n.r * s * easeOut(a), 0, Math.PI * 2); ctx.fillStyle = `rgba(127,179,227,${0.07 * easeOut(a)})`; ctx.fill(); }
    ctx.restore();
    for (let i = 0; i < count; i++) {
      const n = SITES[i], p = this.P(n.x, n.y), a = age(i); if (a <= 0) continue;
      ctx.save(); ctx.strokeStyle = C.net; ctx.setLineDash([3, 4]); ctx.lineWidth = 1; ctx.globalAlpha = 0.4 * easeOut(a);
      ctx.beginPath(); ctx.arc(p[0], p[1], n.r * s * easeOut(a), 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      ctx.globalAlpha = easeOut(a); ctx.fillStyle = C.bg; ctx.beginPath(); ctx.arc(p[0], p[1], 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = C.net; ctx.beginPath(); ctx.arc(p[0], p[1], 1.6, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    // sample track: covered segments solid, the rest faint
    const N = 160; let seen = 0, firstSeen = -1;
    ctx.save(); ctx.lineWidth = 1.8;
    for (let i = 0; i < N; i++) {
      const f0 = i / N, f1 = (i + 1) / N;
      const ax = TRACK[0][0] + (TRACK[1][0] - TRACK[0][0]) * f0, ay = TRACK[0][1] + (TRACK[1][1] - TRACK[0][1]) * f0;
      const bx = TRACK[0][0] + (TRACK[1][0] - TRACK[0][0]) * f1, by = TRACK[0][1] + (TRACK[1][1] - TRACK[0][1]) * f1;
      let cov = false;
      for (let j = 0; j < count; j++) { const a = age(j); if (a <= 0) continue; if (Math.hypot(ax - SITES[j].x, ay - SITES[j].y) < SITES[j].r * easeOut(a)) { cov = true; break; } }
      if (cov) { seen++; if (firstSeen < 0) firstSeen = f0; }
      const A = this.P(ax, ay), B = this.P(bx, by);
      ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]);
      if (cov) { ctx.setLineDash([]); ctx.strokeStyle = C.hot; ctx.globalAlpha = 1; } else { ctx.setLineDash([2, 4]); ctx.strokeStyle = C.fg3; ctx.globalAlpha = 0.5; }
      ctx.stroke();
    }
    ctx.restore();
    // protected site and labels
    const tp = this.P(SITE_X, 0.395);
    ctx.save(); ctx.strokeStyle = C.hot; ctx.lineWidth = 1.2; ctx.strokeRect(tp[0] - 7, tp[1] - 7, 14, 14);
    if (W > 420) {
      ctx.fillStyle = C.fg3; ctx.font = `400 8.5px ${C.mono}`;
      const c = ctx as CanvasRenderingContext2D & { letterSpacing?: string }; if ("letterSpacing" in c) c.letterSpacing = "0.08em";
      ctx.fillText("PROTECTED SITE", tp[0] - 34, tp[1] + 22);
      const sp = this.P(TRACK[0][0], TRACK[0][1]); ctx.fillText("SAMPLE TRACK", sp[0] + 6, sp[1] - 8);
    }
    ctx.restore();
    // moving drone
    const ds = (time * 0.09) % 1, dx = TRACK[0][0] + (TRACK[1][0] - TRACK[0][0]) * ds, dy = TRACK[0][1] + (TRACK[1][1] - TRACK[0][1]) * ds;
    const dcov = SITES.slice(0, count).some((n) => Math.hypot(dx - n.x, dy - n.y) < n.r);
    const dp = this.P(dx, dy); ctx.save(); ctx.fillStyle = C.hot; ctx.globalAlpha = dcov ? 1 : 0.3; ctx.beginPath(); ctx.arc(dp[0], dp[1], 3, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    // readouts
    if (count !== this.lastHosts) {
      this.lastHosts = count;
      const trackLen = Math.hypot(TRACK[1][0] - TRACK[0][0], TRACK[1][1] - TRACK[0][1]) * KM_PER_UNIT;
      const seenKm = (trackLen * seen) / N;
      const distToSite = firstSeen < 0 ? 0 : ((SITE_X - TRACK[0][0] - (TRACK[1][0] - TRACK[0][0]) * firstSeen) / (TRACK[1][0] - TRACK[0][0])) * trackLen;
      const warn = Math.max(0, Math.round(distToSite / (40 / 3600))); // at 40 km/h
      this.onReadout?.({ hosts: count, trackKm: seenKm, warnSeconds: warn, complete: t >= 8 });
    }
  }
}
