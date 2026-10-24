import type { Colors, Pt } from "./common";

type V3 = [number, number, number];

interface Dot { home: V3; p: V3; phase: number; trail: V3[] }

const AXIS: V3 = (() => { const l = Math.hypot(0.25, 1, 0.12); return [0.25 / l, 1 / l, 0.12 / l]; })();
const norm = (v: V3): V3 => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };

/** Cheap smooth 3-D field: three sums of sines with different seeds, used as a flow on the sphere. */
function field(p: V3, t: number): V3 {
  const [x, y, z] = p;
  return [
    Math.sin(1.9 * y + 0.7 * t) + Math.sin(1.3 * z - 0.5 * t) * 0.7,
    Math.sin(1.7 * z + 0.6 * t) + Math.sin(2.1 * x + 0.4 * t) * 0.7,
    Math.sin(1.5 * x - 0.8 * t) + Math.sin(1.1 * y + 0.9 * t) * 0.7,
  ];
}

/** A sphere of drones: dots drift over the surface in a slow flow while the whole globe turns and breathes. */
export class DotSphere {
  c: HTMLCanvasElement; ctx: CanvasRenderingContext2D; C: Colors; reduce: boolean;
  W = 0; H = 0; dots: Dot[] = []; tracked: number; last = 0; t = 0; rot = 0;
  tilt: Pt = [0, 0]; tiltTarget: Pt = [0, 0];
  private ro: ResizeObserver | null = null;

  constructor(canvas: HTMLCanvasElement, colors: Colors, reduce: boolean, tracked = 4) {
    this.c = canvas; this.ctx = canvas.getContext("2d")!; this.C = colors; this.reduce = reduce; this.tracked = tracked;
    this.resize();
    if (typeof ResizeObserver !== "undefined") { this.ro = new ResizeObserver(() => this.resize()); this.ro.observe(canvas); }
  }
  destroy() { this.ro?.disconnect(); }

  resize() {
    const r = this.c.getBoundingClientRect(); if (!r.width) return;
    const d = Math.min(2, window.devicePixelRatio || 1);
    this.c.width = Math.round(r.width * d); this.c.height = Math.round(r.height * d);
    this.ctx.setTransform(d, 0, 0, d, 0, 0);
    this.W = r.width; this.H = r.height;
    const n = Math.max(500, Math.min(1700, Math.round((r.width * r.height) / 140)));
    if (this.dots.length !== n) {
      // Fibonacci sphere: even spacing without poles showing
      const dots: Dot[] = [], g = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < n; i++) {
        const y = 1 - (i / (n - 1)) * 2, rad = Math.sqrt(1 - y * y), th = g * i;
        const h: V3 = [Math.cos(th) * rad, y, Math.sin(th) * rad];
        dots.push({ home: h, p: h, phase: Math.random() * Math.PI * 2, trail: [] });
      }
      this.dots = dots;
    }
    this.draw();
  }

  private rotate(p: V3, ang: number): V3 {
    const ax = AXIS, ca = Math.cos(ang), sa = Math.sin(ang);
    const cr: V3 = [ax[1] * p[2] - ax[2] * p[1], ax[2] * p[0] - ax[0] * p[2], ax[0] * p[1] - ax[1] * p[0]];
    const ad = ax[0] * p[0] + ax[1] * p[1] + ax[2] * p[2];
    return [p[0] * ca + cr[0] * sa + ax[0] * ad * (1 - ca), p[1] * ca + cr[1] * sa + ax[1] * ad * (1 - ca), p[2] * ca + cr[2] * sa + ax[2] * ad * (1 - ca)];
  }

  step(dt: number) {
    this.t += dt / 1000;
    const k = dt / 16.67, t = this.t;
    this.rot += 0.0022 * k; // slow global turn
    for (let i = 0; i < this.dots.length; i++) {
      const d = this.dots[i];
      if (i < this.tracked) {
        // tracked drones travel along the surface flow, on top of the global turn
        let p = d.p;
        const f = field(p, t * 0.35), dot = f[0] * p[0] + f[1] * p[1] + f[2] * p[2], sp = 0.004 * k;
        p = [p[0] + (f[0] - dot * p[0]) * sp, p[1] + (f[1] - dot * p[1]) * sp, p[2] + (f[2] - dot * p[2]) * sp];
        d.p = norm(this.rotate(p, 0.0022 * k));
        d.trail.push(d.p); if (d.trail.length > 90) d.trail.shift();
        continue;
      }
      // everyone else sways around a home position, so the surface stays evenly filled while it moves
      const b = this.rotate(d.home, this.rot);
      const f = field(b, t * 0.3), dot = f[0] * b[0] + f[1] * b[1] + f[2] * b[2];
      const amp = 0.045 * (1 + 0.6 * Math.sin(t * 0.7 + d.phase));
      d.p = norm([b[0] + (f[0] - dot * b[0]) * amp, b[1] + (f[1] - dot * b[1]) * amp, b[2] + (f[2] - dot * b[2]) * amp]);
    }
    this.tilt = [this.tilt[0] + (this.tiltTarget[0] - this.tilt[0]) * 0.04 * k, this.tilt[1] + (this.tiltTarget[1] - this.tilt[1]) * 0.04 * k];
  }

  /** Projects a unit vector with the current tilt. Returns screen x, y and depth z (−1 back … 1 front). */
  private project(p: V3, R: number, breathe: number): [number, number, number] {
    const [tx, ty] = this.tilt;
    const cy = Math.cos(ty), sy = Math.sin(ty), cx = Math.cos(tx), sx = Math.sin(tx);
    // yaw about Y then pitch about X
    const x1 = p[0] * cy + p[2] * sy, z1 = -p[0] * sy + p[2] * cy;
    const y2 = p[1] * cx - z1 * sx, z2 = p[1] * sx + z1 * cx;
    const r = R * breathe;
    return [this.W / 2 + x1 * r, this.H / 2 + y2 * r, z2];
  }

  draw() {
    const { ctx, W, H, C } = this; ctx.clearRect(0, 0, W, H);
    const R = Math.min(W, H) * 0.42, base = Math.max(1, Math.min(W, H) / 420), t = this.t;
    const front: [number, number, number, number][] = [];
    ctx.fillStyle = C.fg;
    // back hemisphere first, faint
    ctx.beginPath(); ctx.globalAlpha = 0.16;
    for (let i = this.tracked; i < this.dots.length; i++) {
      const d = this.dots[i], br = 1 + 0.018 * Math.sin(t * 1.3 + d.phase);
      const [x, y, z] = this.project(d.p, R, br);
      if (z < 0) { const r = base * (0.55 + 0.25 * (z + 1)); ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, Math.PI * 2); }
      else front.push([x, y, z, base * (0.8 + 0.5 * z)]);
    }
    ctx.fill();
    // front hemisphere, dark; nearer dots a touch larger
    ctx.beginPath(); ctx.globalAlpha = 0.88;
    for (const [x, y, , r] of front) { ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, Math.PI * 2); }
    ctx.fill();
    // tracked drones with their trails on the surface
    for (let i = 0; i < Math.min(this.tracked, this.dots.length); i++) {
      const d = this.dots[i];
      if (d.trail.length > 1) {
        ctx.strokeStyle = C.hot; ctx.lineWidth = 1.1;
        let prevFront: boolean | null = null;
        ctx.beginPath();
        for (let j = 0; j < d.trail.length; j++) {
          const [x, y, z] = this.project(d.trail[j], R, 1), isFront = z >= -0.05;
          if (prevFront === null || isFront !== prevFront) { ctx.stroke(); ctx.beginPath(); ctx.globalAlpha = isFront ? 0.75 : 0.18; ctx.moveTo(x, y); }
          else ctx.lineTo(x, y);
          prevFront = isFront;
        }
        ctx.stroke();
      }
      const [x, y, z] = this.project(d.p, R, 1);
      ctx.globalAlpha = z >= 0 ? 1 : 0.3; ctx.fillStyle = C.hot; ctx.beginPath(); ctx.arc(x, y, base * 1.9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = C.fg;
    }
    ctx.globalAlpha = 1;
  }

  frame(now: number) {
    const dt = this.last ? Math.min(50, now - this.last) : 16.67; this.last = now;
    this.step(dt); this.draw();
  }
  /** Pointer position relative to the canvas, −1…1 on each axis; the globe leans toward it. */
  lean(nx: number, ny: number) { this.tiltTarget = [ny * 0.35, nx * 0.45]; }
}
