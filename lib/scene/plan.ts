import { Scene, buildPath, atP, ease, easeOut, type Pt, type Colors } from "./common";

const NODES = [
  { x: 0.17, y: 0.45, r: 0.085, name: "Substation" },
  { x: 0.31, y: 0.29, r: 0.085, name: "Logistics depot" },
  { x: 0.45, y: 0.42, r: 0.1, name: "Industrial park" },
  { x: 0.58, y: 0.215, r: 0.085, name: "Port terminal" },
  { x: 0.7, y: 0.375, r: 0.085, name: "Supplier plant" },
  { x: 0.81, y: 0.2, r: 0.085, name: "Coast station" },
  { x: 0.33, y: 0.565, r: 0.075, name: "Public works" },
];
const DOCK = { x: 0.52, y: 0.555 };
const LAUNCH = { x: 0.905, y: 0.125 };
const PATH = buildPath([[0.905, 0.125], [0.8, 0.21], [0.62, 0.255], [0.47, 0.375], [0.5, 0.465], [0.64, 0.39], [0.79, 0.25], [0.9, 0.135]]);
const COAST: Pt[] = [[0.78, 0], [0.86, 0.05], [0.93, 0.1], [1.0, 0.14]];
const ROAD: Pt[] = [[0.7, 0.04], [0.8, 0.09], [0.87, 0.14], [0.93, 0.195], [1.0, 0.25]];
const ROAD2: Pt[] = [[0, 0.61], [0.25, 0.6], [0.45, 0.615], [0.6, 0.56], [0.75, 0.53], [1.0, 0.48]];
const S_TARGET = 0.47;

const inCoverage = (p: Pt) => NODES.some((n) => Math.hypot(p[0] - n.x, p[1] - n.y) < n.r);
const S_DET = (() => { for (let s = 0; s <= 1; s += 0.002) if (inCoverage(atP(PATH, s))) return s; return 0; })();

/** Plan view: the shared low-altitude picture, one incident on a loop. */
export class PlanScene extends Scene {
  constructor(canvas: HTMLCanvasElement, colors: Colors, reduce: boolean) {
    super(canvas, "loop", colors, 0.62, reduce);
  }
  private poly(pts: Pt[]) {
    const ctx = this.ctx;
    ctx.beginPath();
    pts.forEach((q, i) => { const p = this.P(q[0], q[1]); if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); });
  }
  draw(phase: number, u: number, time: number) {
    const ctx = this.ctx, C = this.C, W = this.W, H = this.H, s = this.s;
    ctx.clearRect(0, 0, W, H);
    this.grid();

    // sea hatch and coast
    ctx.save();
    this.poly(COAST);
    const e = this.P(1.0, 0.14), t0 = this.P(0.78, 0);
    ctx.lineTo(e[0] + s, e[1]); ctx.lineTo(e[0] + s, t0[1] - s); ctx.lineTo(t0[0], t0[1] - s); ctx.closePath(); ctx.clip();
    ctx.strokeStyle = C.net; ctx.globalAlpha = 0.1; ctx.lineWidth = 1;
    for (let hx = -H; hx < W + H; hx += 7) { ctx.beginPath(); ctx.moveTo(hx, 0); ctx.lineTo(hx + H, H); ctx.stroke(); }
    ctx.restore();
    ctx.save(); ctx.strokeStyle = C.net; ctx.globalAlpha = 0.45; ctx.lineWidth = 1.2; this.poly(COAST); ctx.stroke(); ctx.restore();
    ctx.save(); ctx.strokeStyle = C.line2; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.9; this.poly(ROAD); ctx.stroke(); this.poly(ROAD2); ctx.stroke(); ctx.restore();
    if (!this.small) {
      ctx.save(); ctx.fillStyle = C.fg3; ctx.font = this.font(400, 8.5); this.setTracking("0.08em"); ctx.globalAlpha = 0.8;
      let p = this.P(0.955, 0.03); ctx.fillText("SEA", p[0], p[1]);
      p = this.P(0.72, 0.07); ctx.fillText("COASTAL ROAD", p[0] - 10, p[1] - 6);
      ctx.restore();
    }
    // site footprints
    ctx.save(); ctx.strokeStyle = C.line2; ctx.lineWidth = 1; ctx.globalAlpha = 0.9;
    NODES.forEach((n, i) => { const p = this.P(n.x, n.y), w = s * 0.055, h = s * 0.034; ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(((i % 3) - 1) * 0.25); ctx.strokeRect(-w / 2, -h / 2, w, h); ctx.restore(); });
    ctx.restore();

    // drone position
    let droneS: number | null = null, dronePos: Pt | null = null, heading = 0;
    if (phase === 1) droneS = u * S_TARGET;
    else if (phase === 2) droneS = S_TARGET;
    else if (phase === 3) droneS = S_TARGET + (1 - S_TARGET) * ease(u);
    if (droneS !== null) {
      dronePos = atP(PATH, droneS);
      const ahead = atP(PATH, Math.min(1, droneS + 0.01));
      heading = Math.atan2(ahead[1] - dronePos[1], ahead[0] - dronePos[0]);
      if (phase === 2) dronePos = [dronePos[0] + Math.cos(time * 1.4) * 0.012, dronePos[1] + Math.sin(time * 1.4) * 0.008];
    }

    // nodes
    NODES.forEach((n, i) => {
      const p = this.P(n.x, n.y);
      const a = phase > 0 ? 1 : easeOut((u * 1.25 - i * 0.11) / 0.3);
      if (a <= 0) return;
      const active = !!dronePos && phase !== 2 && Math.hypot(dronePos[0] - n.x, dronePos[1] - n.y) < n.r;
      ctx.save();
      ctx.beginPath(); ctx.arc(p[0], p[1], n.r * s * a, 0, Math.PI * 2);
      ctx.fillStyle = C.net; ctx.globalAlpha = a * (active ? 0.14 : 0.06); ctx.fill();
      ctx.globalAlpha = a * (active ? 0.9 : 0.45); ctx.strokeStyle = C.net; ctx.lineWidth = active ? 1.4 : 1; ctx.setLineDash(active ? [] : [3, 4]); ctx.stroke(); ctx.setLineDash([]);
      if (phase === 0 && a < 1) { ctx.globalAlpha = (1 - a) * 0.6; ctx.beginPath(); ctx.arc(p[0], p[1], n.r * s * a * 1.15, 0, Math.PI * 2); ctx.stroke(); }
      ctx.globalAlpha = a; ctx.fillStyle = C.bg; ctx.beginPath(); ctx.arc(p[0], p[1], 5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = C.net; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = C.net; ctx.beginPath(); ctx.arc(p[0], p[1], active ? 2.6 : 1.8, 0, Math.PI * 2); ctx.fill();
      if (active) { const pulse = (time * 1.5) % 1; ctx.globalAlpha = (1 - pulse) * 0.7; ctx.beginPath(); ctx.arc(p[0], p[1], 5 + pulse * 14, 0, Math.PI * 2); ctx.stroke(); }
      if (!this.small) { ctx.globalAlpha = a * 0.9; ctx.fillStyle = active ? C.fg2 : C.fg3; ctx.font = this.font(400, 8.5); this.setTracking("0.08em"); ctx.fillText(n.name.toUpperCase(), p[0] + 9, p[1] - 7); }
      ctx.restore();
      if (active && dronePos) { const dp = this.P(dronePos[0], dronePos[1]); ctx.save(); ctx.strokeStyle = C.net; ctx.globalAlpha = 0.55; ctx.lineWidth = 1; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(dp[0], dp[1]); ctx.stroke(); ctx.restore(); }
    });

    // police dock
    if (phase >= 1) {
      const p = this.P(DOCK.x, DOCK.y);
      ctx.save(); ctx.strokeStyle = C.net; ctx.fillStyle = C.bg; ctx.lineWidth = 1.2; ctx.translate(p[0], p[1]); ctx.rotate(Math.PI / 4);
      ctx.beginPath(); ctx.rect(-4.5, -4.5, 9, 9); ctx.fill(); ctx.stroke(); ctx.rotate(-Math.PI / 4);
      if (!this.small) { ctx.fillStyle = C.fg3; ctx.font = this.font(400, 8.5); this.setTracking("0.08em"); ctx.fillText("POLICE DRONE DOCK", 9, -6); }
      ctx.restore();
    }

    // recorded track
    if (phase >= 1 && droneS !== null && droneS > S_DET && dronePos) {
      ctx.save(); ctx.strokeStyle = C.hot; ctx.lineWidth = 1.5; ctx.lineJoin = "round"; ctx.beginPath();
      let first = true;
      for (let ss = S_DET; ss <= droneS; ss += 0.004) { const q = atP(PATH, ss), qp = this.P(q[0], q[1]); if (first) { ctx.moveTo(qp[0], qp[1]); first = false; } else ctx.lineTo(qp[0], qp[1]); }
      if (phase !== 2) { const qq = this.P(dronePos[0], dronePos[1]); ctx.lineTo(qq[0], qq[1]); }
      ctx.stroke(); ctx.restore();
      const fd = atP(PATH, S_DET), fp = this.P(fd[0], fd[1]);
      ctx.save(); ctx.strokeStyle = C.hot; ctx.lineWidth = 1; ctx.globalAlpha = 0.9; ctx.beginPath(); ctx.arc(fp[0], fp[1], 4, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      if (!this.small && ((phase === 1 && u > 0.25) || phase > 1)) { ctx.save(); ctx.fillStyle = C.fg3; ctx.font = this.font(400, 8.5); this.setTracking("0.08em"); ctx.fillText("FIRST DETECTION 21:31:48", fp[0] + 8, fp[1] + 12); ctx.restore(); }
    }

    // trace-back
    if (phase >= 2) {
      const v = phase === 2 ? easeOut(u / 0.6) : 1;
      const fd2 = atP(PATH, S_DET), a0 = this.P(fd2[0], fd2[1]), b0 = this.P(LAUNCH.x, LAUNCH.y);
      ctx.save(); ctx.strokeStyle = C.hot; ctx.lineWidth = 1.4; ctx.setLineDash([4, 4]); ctx.lineDashOffset = -time * 20; ctx.globalAlpha = 0.9;
      ctx.beginPath(); ctx.moveTo(a0[0], a0[1]); ctx.lineTo(a0[0] + (b0[0] - a0[0]) * v, a0[1] + (b0[1] - a0[1]) * v); ctx.stroke();
      if (phase === 2) { const rs = S_TARGET - (S_TARGET - S_DET) * easeOut(u / 0.55); const rp = atP(PATH, Math.max(S_DET, rs)), rpp = this.P(rp[0], rp[1]); ctx.setLineDash([]); ctx.fillStyle = C.fg; ctx.beginPath(); ctx.arc(rpp[0], rpp[1], 3, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
      if (v >= 0.98) {
        const pr = (time * 1.2) % 1;
        ctx.save(); ctx.translate(b0[0], b0[1]); ctx.strokeStyle = C.hot; ctx.lineWidth = 1.2; ctx.globalAlpha = 0.9;
        ctx.beginPath(); ctx.ellipse(0, 0, s * 0.038, s * 0.024, -0.6, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = (1 - pr) * 0.6; ctx.beginPath(); ctx.ellipse(0, 0, s * 0.038 * (1 + pr * 0.5), s * 0.024 * (1 + pr * 0.5), -0.6, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 1; ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(9, 0); ctx.moveTo(0, -9); ctx.lineTo(0, 9); ctx.stroke();
        ctx.restore();
        if (phase === 2 || u < 0.5) this.box(b0[0] - 12, b0[1] - s * 0.075, ["LAUNCH AREA", "est. ±150 m · coastal road"], C.hot, "right");
      }
    }

    // drone and readout
    if (dronePos && droneS !== null) {
      const seen = droneS >= S_DET;
      this.drone(dronePos[0], dronePos[1], C.hot, seen ? 1 : 0.28, heading);
      const dp2 = this.P(dronePos[0], dronePos[1]);
      if (seen && phase === 1 && u > 0.2) this.box(dp2[0] + 12, dp2[1] - 26, ["TRK-0417 · QUAD", `${Math.round(38 + Math.sin(time * 2) * 4)} km/h · 80 m AGL · no Remote ID`], C.hot);
      if (phase === 2 && !this.small) this.box(dp2[0] + 12, dp2[1] - 26, ["TRK-0417 · LOITERING", "over Industrial park · 21:34:10"], C.hot);
    }

    // chase drone
    if (phase === 3 && dronePos && droneS !== null) {
      const landed = u >= 0.985, ip = atP(PATH, 0.6);
      let cp: Pt;
      if (u < 0.12) { const lp = this.P(DOCK.x, DOCK.y), r0 = u / 0.12; ctx.save(); ctx.strokeStyle = C.net; ctx.globalAlpha = 1 - r0; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(lp[0], lp[1], 6 + r0 * 24, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); cp = [DOCK.x, DOCK.y]; }
      else if (u < 0.4) { const f = ease((u - 0.12) / 0.28); cp = [DOCK.x + (ip[0] - DOCK.x) * f, DOCK.y + (ip[1] - DOCK.y) * f]; }
      else cp = atP(PATH, Math.max(0.6, droneS - 0.05));
      if (u >= 0.12) {
        ctx.save(); ctx.strokeStyle = C.net; ctx.lineWidth = 1.2; ctx.globalAlpha = 0.7; ctx.setLineDash([1, 4]); ctx.beginPath();
        const d0 = this.P(DOCK.x, DOCK.y); ctx.moveTo(d0[0], d0[1]);
        if (u < 0.4) { const c1 = this.P(cp[0], cp[1]); ctx.lineTo(c1[0], c1[1]); }
        else { const i0 = this.P(ip[0], ip[1]); ctx.lineTo(i0[0], i0[1]); for (let cs = 0.6; cs <= Math.max(0.6, droneS - 0.05); cs += 0.004) { const cq = atP(PATH, cs), cqp = this.P(cq[0], cq[1]); ctx.lineTo(cqp[0], cqp[1]); } }
        ctx.stroke(); ctx.restore();
      }
      this.police(cp[0], cp[1], 1);
      const cpp = this.P(cp[0], cp[1]);
      if (u > 0.14 && u < 0.5) this.box(cpp[0] - 12, cpp[1] + 12, ["POLICE DRONE · CUED", "dispatch 21:35:40 · intercept 1.9 km"], C.net, "right");
      if (u >= 0.5 && !landed) this.box(cpp[0] - 12, cpp[1] + 12, ["FOLLOWING", "camera locked · 120 m behind"], C.net, "right");
      if (landed) {
        const lb = this.P(dronePos[0], dronePos[1]), k = 14;
        ctx.save(); ctx.strokeStyle = C.net; ctx.lineWidth = 1.5;
        for (const c of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { ctx.beginPath(); ctx.moveTo(lb[0] + c[0] * k, lb[1] + c[1] * k * 0.5); ctx.lineTo(lb[0] + c[0] * k, lb[1] + c[1] * k); ctx.lineTo(lb[0] + c[0] * k * 0.5, lb[1] + c[1] * k); ctx.stroke(); }
        ctx.fillStyle = C.line2; ctx.strokeStyle = C.fg3; ctx.lineWidth = 1; ctx.fillRect(lb[0] - 8, lb[1] + 5, 16, 8); ctx.strokeRect(lb[0] - 8.5, lb[1] + 4.5, 17, 9);
        ctx.restore();
        this.box(lb[0] - 12, lb[1] - s * 0.075, ["LANDING FILMED 21:43:07", "vehicle on coastal road · evidence pack sent"], C.net, "right");
      }
    }
  }
}
