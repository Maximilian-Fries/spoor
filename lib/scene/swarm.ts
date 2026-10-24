import type { Pt } from "./common";

export interface SwarmOptions {
  /** dots per 10,000 px² */
  density: number;
  /** how many agents are drawn as tracked (accent colour with a trail) */
  tracked: number;
  dotRadius: number;
  speed: number;
  ink: string;
  accent: string;
  alpha: number;
}

interface Agent { x: number; y: number; vx: number; vy: number; trail: Pt[] }

/** A flock of tiny dots: separation, alignment, cohesion, a little wander, soft edges, and an area it flows around. */
export class Swarm {
  c: HTMLCanvasElement; ctx: CanvasRenderingContext2D; o: SwarmOptions;
  W = 0; H = 0; agents: Agent[] = []; last = 0;
  avoid: { x: number; y: number; w: number; h: number } | null = null;
  private ro: ResizeObserver | null = null;

  constructor(canvas: HTMLCanvasElement, o: SwarmOptions) {
    this.c = canvas; this.ctx = canvas.getContext("2d")!; this.o = o;
    this.resize();
    if (typeof ResizeObserver !== "undefined") { this.ro = new ResizeObserver(() => this.resize()); this.ro.observe(canvas); }
  }
  destroy() { this.ro?.disconnect(); }

  resize() {
    const r = this.c.getBoundingClientRect(); if (!r.width || !r.height) return;
    const d = Math.min(2, window.devicePixelRatio || 1);
    this.c.width = Math.round(r.width * d); this.c.height = Math.round(r.height * d);
    this.ctx.setTransform(d, 0, 0, d, 0, 0);
    this.W = r.width; this.H = r.height;
    const target = Math.min(1400, Math.round((this.W * this.H / 10000) * this.o.density));
    while (this.agents.length < target) {
      const a = Math.random() * Math.PI * 2, s = this.o.speed * (0.6 + Math.random() * 0.6);
      this.agents.push({ x: Math.random() * this.W, y: Math.random() * this.H, vx: Math.cos(a) * s, vy: Math.sin(a) * s, trail: [] });
    }
    if (this.agents.length > target) this.agents.length = target;
    this.agents.forEach((a) => { a.x = Math.min(this.W, Math.max(0, a.x)); a.y = Math.min(this.H, Math.max(0, a.y)); });
    this.draw();
  }

  step(dt: number) {
    const { W, H, o } = this, ag = this.agents, n = ag.length;
    if (!n) return;
    const R = 44, SEP = 11, cell = R;
    const cols = Math.max(1, Math.ceil(W / cell)), rows = Math.max(1, Math.ceil(H / cell));
    const grid: number[][] = Array.from({ length: cols * rows }, () => []);
    for (let i = 0; i < n; i++) {
      const cx = Math.min(cols - 1, Math.max(0, Math.floor(ag[i].x / cell))), cy = Math.min(rows - 1, Math.max(0, Math.floor(ag[i].y / cell)));
      grid[cy * cols + cx].push(i);
    }
    const k = dt / 16.67, maxS = o.speed * 1.25, minS = o.speed * 0.45;
    const av = this.avoid;
    for (let i = 0; i < n; i++) {
      const a = ag[i];
      let ax = 0, ay = 0, cxs = 0, cys = 0, sx = 0, sy = 0, cnt = 0;
      const gx = Math.floor(a.x / cell), gy = Math.floor(a.y / cell);
      for (let yy = gy - 1; yy <= gy + 1; yy++) for (let xx = gx - 1; xx <= gx + 1; xx++) {
        if (xx < 0 || yy < 0 || xx >= cols || yy >= rows) continue;
        const bucket = grid[yy * cols + xx];
        for (let b = 0; b < bucket.length; b++) {
          const j = bucket[b]; if (j === i) continue;
          const o2 = ag[j], dx = o2.x - a.x, dy = o2.y - a.y, d2 = dx * dx + dy * dy;
          if (d2 > R * R || d2 === 0) continue;
          cnt++; ax += o2.vx; ay += o2.vy; cxs += o2.x; cys += o2.y;
          if (d2 < SEP * SEP) { const d = Math.sqrt(d2); sx -= dx / d * (SEP - d) / SEP; sy -= dy / d * (SEP - d) / SEP; }
          if (cnt > 24) break;
        }
      }
      let fx = 0, fy = 0;
      if (cnt) {
        fx += (ax / cnt - a.vx) * 0.09 + (cxs / cnt - a.x) * 0.0012 + sx * 0.16;
        fy += (ay / cnt - a.vy) * 0.09 + (cys / cnt - a.y) * 0.0012 + sy * 0.16;
      }
      fx += (Math.random() - 0.5) * 0.07; fy += (Math.random() - 0.5) * 0.07;
      const m = 48;
      if (a.x < m) fx += (m - a.x) / m * 0.08; if (a.x > W - m) fx -= (a.x - (W - m)) / m * 0.08;
      if (a.y < m) fy += (m - a.y) / m * 0.08; if (a.y > H - m) fy -= (a.y - (H - m)) / m * 0.08;
      if (av) {
        const pad = 28, inX = a.x > av.x - pad && a.x < av.x + av.w + pad, inY = a.y > av.y - pad && a.y < av.y + av.h + pad;
        if (inX && inY) {
          const dl = a.x - (av.x - pad), dr = av.x + av.w + pad - a.x, dt2 = a.y - (av.y - pad), db = av.y + av.h + pad - a.y;
          const mn = Math.min(dl, dr, dt2, db);
          if (mn === dl) fx -= 0.25; else if (mn === dr) fx += 0.25; else if (mn === dt2) fy -= 0.25; else fy += 0.25;
        }
      }
      a.vx += fx * k; a.vy += fy * k;
      const sp = Math.hypot(a.vx, a.vy) || 1e-6;
      if (sp > maxS) { a.vx *= maxS / sp; a.vy *= maxS / sp; } else if (sp < minS) { a.vx *= minS / sp; a.vy *= minS / sp; }
      a.x += a.vx * k; a.y += a.vy * k;
      if (i < o.tracked) { a.trail.push([a.x, a.y]); if (a.trail.length > 70) a.trail.shift(); }
    }
  }

  draw() {
    const { ctx, W, H, o } = this; ctx.clearRect(0, 0, W, H);
    const r = o.dotRadius;
    ctx.fillStyle = o.ink; ctx.globalAlpha = o.alpha; ctx.beginPath();
    for (let i = o.tracked; i < this.agents.length; i++) { const a = this.agents[i]; ctx.moveTo(a.x + r, a.y); ctx.arc(a.x, a.y, r, 0, Math.PI * 2); }
    ctx.fill();
    ctx.globalAlpha = 1;
    for (let i = 0; i < Math.min(o.tracked, this.agents.length); i++) {
      const a = this.agents[i];
      if (a.trail.length > 1) { ctx.strokeStyle = o.accent; ctx.lineWidth = 1; ctx.globalAlpha = 0.7; ctx.beginPath(); a.trail.forEach((p, j) => { if (j) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); }); ctx.stroke(); ctx.globalAlpha = 1; }
      ctx.fillStyle = o.accent; ctx.beginPath(); ctx.arc(a.x, a.y, r * 1.6, 0, Math.PI * 2); ctx.fill();
    }
  }

  frame(now: number) {
    const dt = this.last ? Math.min(50, now - this.last) : 16.67; this.last = now;
    this.step(dt); this.draw();
  }
}
