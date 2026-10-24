export type Pt = [number, number];

export interface Colors {
  net: string;
  hot: string;
  fg: string;
  fg2: string;
  fg3: string;
  line: string;
  line2: string;
  bg: string;
  police: string;
  panelBg: string;
  mono: string;
}

export function readColors(): Colors {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
  return {
    net: v("--net", "#7FB3E3"),
    hot: v("--hot", "#F0A54A"),
    fg: v("--fg", "#E9EEF3"),
    fg2: v("--fg-2", "#A9B5C2"),
    fg3: v("--fg-3", "#73808E"),
    line: v("--line", "#1F2933"),
    line2: v("--line-2", "#2C3845"),
    bg: v("--bg-2", "#FFFFFF"),
    police: v("--police", v("--net", "#1D5FD1")),
    panelBg: v("--panel-bg", "rgba(255,255,255,.94)"),
    mono: v("--font-mono", '"IBM Plex Mono", ui-monospace, Menlo, monospace'),
  };
}

/** "#rrggbb" plus an alpha, as an rgba() string. */
export function withAlpha(hex: string, a: number): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

export interface Path {
  pts: Pt[];
  cum: number[];
  len: number;
}

/** Catmull-Rom resample, arc-length parameterised. */
export function buildPath(ctrl: Pt[], n = 60): Path {
  const pts: Pt[] = [];
  for (let i = 0; i < ctrl.length - 1; i++) {
    const p0 = ctrl[Math.max(0, i - 1)], p1 = ctrl[i], p2 = ctrl[i + 1], p3 = ctrl[Math.min(ctrl.length - 1, i + 2)];
    for (let t = 0; t < 1; t += 1 / n) {
      const t2 = t * t, t3 = t2 * t;
      pts.push([
        0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
      ]);
    }
  }
  pts.push([...ctrl[ctrl.length - 1]]);
  const cum = [0];
  let L = 0;
  for (let i = 1; i < pts.length; i++) {
    L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    cum.push(L);
  }
  return { pts, cum, len: L };
}

/** Point on a path at arc-length fraction s in [0, 1]. */
export function atP(P: Path, s: number): Pt {
  const d = Math.max(0, Math.min(1, s)) * P.len;
  let lo = 0, hi = P.cum.length - 1;
  while (hi - lo > 1) {
    const m = (lo + hi) >> 1;
    if (P.cum[m] < d) lo = m; else hi = m;
  }
  const a = P.pts[lo], b = P.pts[hi], seg = P.cum[hi] - P.cum[lo], f = seg ? (d - P.cum[lo]) / seg : 0;
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
}

export const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
export const ease = (t: number) => { t = clamp01(t); return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);

export const DUR = [3, 6, 4, 7.5];
export const HOLD = 1.6;
export const PHASE_TAGS = ["Nodes online", "Tracking", "Tracing back", "Following home"];

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export type Mode = "loop" | "phase";

/** Shared canvas machinery: sizing, phase timing, labels, glyphs. */
export abstract class Scene {
  c: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  mode: Mode;
  C: Colors;
  reduce: boolean;
  boxH: number;
  phase = 0;
  phaseStart = performance.now();
  t0 = performance.now();
  lastPhase = -1;
  onPhase: ((p: number) => void) | null = null;
  W = 0; H = 0; s = 1; ox = 0; oy = 0; small = false;
  private ro: ResizeObserver | null = null;

  constructor(canvas: HTMLCanvasElement, mode: Mode, colors: Colors, boxH: number, reduce: boolean) {
    this.c = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.mode = mode;
    this.C = colors;
    this.boxH = boxH;
    this.reduce = reduce;
    this.resize();
    if (typeof ResizeObserver !== "undefined") {
      this.ro = new ResizeObserver(() => this.resize());
      this.ro.observe(canvas);
    }
  }
  destroy() { this.ro?.disconnect(); }

  resize() {
    const r = this.c.getBoundingClientRect();
    if (!r.width) return;
    const d = Math.min(2, window.devicePixelRatio || 1);
    this.c.width = Math.round(r.width * d);
    this.c.height = Math.round(r.height * d);
    this.W = r.width; this.H = r.height;
    this.ctx.setTransform(d, 0, 0, d, 0, 0);
    const s = Math.max(this.W, this.H / this.boxH);
    this.s = s; this.ox = (this.W - s) / 2; this.oy = (this.H - s * this.boxH) / 2;
    this.small = this.W < 520;
    this.render(performance.now());
  }
  P(x: number, y: number): Pt { return [this.ox + x * this.s, this.oy + y * this.s]; }
  setPhase(p: number) { if (p !== this.phase) { this.phase = p; this.phaseStart = performance.now(); } }

  state(now: number): { phase: number; u: number } {
    if (this.reduce) return { phase: 3, u: 1 };
    if (this.mode === "loop") {
      const total = DUR.reduce((a, b) => a + b, 0) + HOLD;
      const t = ((now - this.t0) / 1000) % total;
      let acc = 0;
      for (let i = 0; i < DUR.length; i++) {
        if (t < acc + DUR[i]) return { phase: i, u: (t - acc) / DUR[i] };
        acc += DUR[i];
      }
      return { phase: 3, u: 1 };
    }
    const e = ((now - this.phaseStart) / 1000) % (DUR[this.phase] + HOLD);
    return { phase: this.phase, u: Math.min(1, e / DUR[this.phase]) };
  }
  render(now: number) {
    const st = this.state(now);
    this.draw(st.phase, st.u, now / 1000);
    if (this.onPhase && st.phase !== this.lastPhase) { this.lastPhase = st.phase; this.onPhase(st.phase); }
  }
  abstract draw(phase: number, u: number, time: number): void;

  font(weight: number, px: number) { return `${weight} ${px}px ${this.C.mono}`; }
  setTracking(em: string) {
    const ctx = this.ctx as CanvasRenderingContext2D & { letterSpacing?: string };
    if ("letterSpacing" in ctx) ctx.letterSpacing = em;
  }

  /** Mono readout box with a coloured left bar; stays inside the canvas. */
  box(x: number, y: number, lines: string[], color: string, align?: "right") {
    const ctx = this.ctx, pad = 7, fs = this.small ? 9 : 10.5, lh = fs * 1.45;
    let w = 0;
    ctx.save();
    lines.forEach((l, i) => { ctx.font = this.font(i ? 400 : 500, fs); w = Math.max(w, ctx.measureText(l).width); });
    w += pad * 2 + 2;
    const h = pad * 2 + lh * lines.length - (lh - fs);
    let lx = align === "right" ? x - w : x, ly = y;
    if (lx + w > this.W - 6) lx = this.W - 6 - w;
    if (lx < 6) lx = 6;
    if (ly + h > this.H - 6) ly = this.H - 6 - h;
    if (ly < 6) ly = 6;
    ctx.fillStyle = this.C.panelBg; ctx.strokeStyle = color; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.rect(lx + 0.5, ly + 0.5, w, h); ctx.fill(); ctx.stroke();
    ctx.fillRect(lx, ly, 2, h);
    ctx.textBaseline = "top";
    lines.forEach((l, i) => { ctx.fillStyle = i ? this.C.fg2 : color; ctx.font = this.font(i ? 400 : 500, fs); ctx.fillText(l, lx + pad + 2, ly + pad + lh * i); });
    ctx.restore();
  }

  drone(x: number, y: number, color: string, alpha: number, heading = 0) {
    const ctx = this.ctx, p = this.P(x, y), r = this.small ? 3 : 4;
    ctx.save(); ctx.globalAlpha = alpha; ctx.translate(p[0], p[1]); ctx.rotate(heading);
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(-r * 1.3, -r * 1.3); ctx.lineTo(r * 1.3, r * 1.3); ctx.moveTo(-r * 1.3, r * 1.3); ctx.lineTo(r * 1.3, -r * 1.3); ctx.stroke();
    for (const k of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { ctx.beginPath(); ctx.arc(k[0] * r * 1.3, k[1] * r * 1.3, r * 0.55, 0, Math.PI * 2); ctx.fill(); }
    ctx.beginPath(); ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  police(x: number, y: number, alpha: number) {
    const ctx = this.ctx, p = this.P(x, y), r = this.small ? 4 : 5.5;
    ctx.save(); ctx.globalAlpha = alpha; ctx.translate(p[0], p[1]); ctx.rotate(Math.PI / 4);
    ctx.fillStyle = this.C.police; ctx.fillRect(-r / 2, -r / 2, r, r);
    ctx.strokeStyle = this.C.police; ctx.lineWidth = 1; ctx.globalAlpha = alpha * 0.6; ctx.strokeRect(-r, -r, r * 2, r * 2);
    ctx.restore();
  }

  grid() {
    const ctx = this.ctx, g = this.s / 16;
    ctx.save(); ctx.strokeStyle = this.C.line; ctx.lineWidth = 1; ctx.globalAlpha = 0.7;
    for (let x = this.ox % g; x < this.W; x += g) { ctx.beginPath(); ctx.moveTo(Math.round(x) + 0.5, 0); ctx.lineTo(Math.round(x) + 0.5, this.H); ctx.stroke(); }
    for (let y = this.oy % g; y < this.H; y += g) { ctx.beginPath(); ctx.moveTo(0, Math.round(y) + 0.5); ctx.lineTo(this.W, Math.round(y) + 0.5); ctx.stroke(); }
    ctx.restore();
  }
}
