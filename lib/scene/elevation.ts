import { Scene, buildPath, atP, ease, easeOut, type Pt, type Colors } from "./common";

// Side elevation. Horizontal: 1 unit = 7.5 km. Vertical: 1 m = 0.002 units (exaggerated ×10).
const E_G = 0.46, E_R = 0.165, E_TOP = 0.03, E_DOCK = 0.33, E_VEH = 0.86, E_CLIFF = 0.91, E_KM = 0.1333, E_M = 0.002;
const MASTS = [
  { x: 0.14, name: "Substation" },
  { x: 0.27, name: "Logistics depot" },
  { x: 0.4, name: "Industrial park" },
  { x: 0.53, name: "Supplier plant" },
  { x: 0.64, name: "Coast station" },
];
const PATH = buildPath([[0.86, 0.455], [0.8, 0.38], [0.74, 0.32], [0.6, 0.3], [0.44, 0.3], [0.6, 0.282], [0.74, 0.282], [0.8, 0.37], [0.86, 0.455]]);
const E_TARGET = 0.5;
const covered = (p: Pt) => MASTS.some((m) => Math.hypot(p[0] - m.x, p[1] - (E_G - E_TOP)) < E_R);
const E_DET = (() => { for (let s = 0; s <= 1; s += 0.002) if (covered(atP(PATH, s))) return s; return 0; })();

/** Elevation view: the mechanism, stepped by scroll. */
export class ElevationScene extends Scene {
  constructor(canvas: HTMLCanvasElement, colors: Colors, reduce: boolean) {
    super(canvas, "phase", colors, 0.5625, reduce);
  }
  draw(phase: number, u: number, time: number) {
    const ctx = this.ctx, C = this.C, W = this.W, H = this.H, s = this.s;
    ctx.clearRect(0, 0, W, H);
    const G = this.P(0, E_G)[1];

    // altitude scale
    ctx.save(); ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.fillStyle = C.fg3; ctx.font = this.font(400, 8.5); ctx.textAlign = "right";
    for (let i = 0; i <= 150; i += 50) {
      const yy = this.P(0, E_G - i * E_M)[1];
      ctx.globalAlpha = 0.9; ctx.beginPath(); ctx.moveTo(this.P(0.065, 0)[0], Math.round(yy) + 0.5); ctx.lineTo(W, Math.round(yy) + 0.5); ctx.stroke();
      if (!this.small) ctx.fillText(`${i} m`, this.P(0.058, 0)[0], yy + 3);
    }
    ctx.restore();

    // ground, cliff, sea
    const gx0 = this.P(0, 0)[0], cx = this.P(E_CLIFF, 0)[0], sea = this.P(0, E_G + 0.02)[1];
    ctx.save();
    ctx.fillStyle = C.line; ctx.globalAlpha = 0.35; ctx.beginPath(); ctx.moveTo(gx0, G); ctx.lineTo(cx, G); ctx.lineTo(cx, H); ctx.lineTo(gx0, H); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1; ctx.strokeStyle = C.fg3; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(gx0, Math.round(G) + 0.5); ctx.lineTo(cx, Math.round(G) + 0.5); ctx.lineTo(cx, sea); ctx.lineTo(W, sea); ctx.stroke();
    ctx.beginPath(); ctx.rect(cx, sea, W - cx, H - sea); ctx.clip(); ctx.strokeStyle = C.net; ctx.globalAlpha = 0.14; ctx.lineWidth = 1;
    for (let hy = sea + 4; hy < H; hy += 6) { ctx.beginPath(); ctx.moveTo(cx, hy); ctx.lineTo(W, hy); ctx.stroke(); }
    ctx.restore();

    // km ticks, scale bar, place names
    ctx.save(); ctx.strokeStyle = C.fg3; ctx.lineWidth = 1; ctx.fillStyle = C.fg3; ctx.font = this.font(400, 8.5);
    for (let i = 0; i <= 6; i++) { const tx = this.P(0.06 + i * E_KM, 0)[0]; ctx.beginPath(); ctx.moveTo(Math.round(tx) + 0.5, G); ctx.lineTo(Math.round(tx) + 0.5, G + 5); ctx.stroke(); }
    if (!this.small) {
      const sx = this.P(0.77, 0)[0], ex = this.P(0.77 + E_KM, 0)[0], sy = this.P(0, 0.07)[1];
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, sy); ctx.moveTo(sx, sy - 3); ctx.lineTo(sx, sy + 3); ctx.moveTo(ex, sy - 3); ctx.lineTo(ex, sy + 3); ctx.stroke();
      ctx.fillText("1 km", sx + (ex - sx) / 2 - 12, sy - 5);
      this.setTracking("0.08em");
      ctx.fillText("VERTICAL ×10", sx, sy + 14);
      ctx.fillText("SEA", this.P(0.94, 0)[0], sea + 14);
      ctx.fillText("COASTAL ROAD", this.P(E_VEH - 0.055, 0)[0], G + 16);
    }
    ctx.restore();

    // drone position
    let droneS: number | null = null, dronePos: Pt | null = null, heading = 0;
    if (phase === 1) droneS = u * E_TARGET; else if (phase === 2) droneS = E_TARGET; else if (phase === 3) droneS = E_TARGET + (1 - E_TARGET) * ease(u);
    if (droneS !== null) {
      dronePos = atP(PATH, droneS);
      const ah = atP(PATH, Math.min(1, droneS + 0.01));
      heading = Math.atan2(ah[1] - dronePos[1], ah[0] - dronePos[0]);
      if (phase === 2) dronePos = [dronePos[0] + Math.cos(time * 1.4) * 0.008, dronePos[1] + Math.sin(time * 2.1) * 0.004];
    }

    // masts and coverage domes
    MASTS.forEach((m, i) => {
      const a = phase > 0 ? 1 : easeOut((u * 1.3 - i * 0.14) / 0.35);
      if (a <= 0) return;
      const base = this.P(m.x, E_G), top = this.P(m.x, E_G - E_TOP * a), R = E_R * s * easeOut(a);
      const active = !!dronePos && phase !== 2 && Math.hypot(dronePos[0] - m.x, dronePos[1] - (E_G - E_TOP)) < E_R;
      ctx.save();
      ctx.beginPath(); ctx.arc(top[0], top[1], R, Math.PI, 0); ctx.lineTo(top[0] + R, G); ctx.lineTo(top[0] - R, G); ctx.closePath();
      ctx.fillStyle = C.net; ctx.globalAlpha = a * (active ? 0.12 : 0.05); ctx.fill();
      ctx.beginPath(); ctx.arc(top[0], top[1], R, Math.PI, 0); ctx.strokeStyle = C.net; ctx.lineWidth = active ? 1.4 : 1; ctx.globalAlpha = a * (active ? 0.9 : 0.4); ctx.setLineDash(active ? [] : [3, 4]); ctx.stroke(); ctx.setLineDash([]);
      ctx.globalAlpha = a; ctx.strokeStyle = C.net; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(base[0], base[1]); ctx.lineTo(top[0], top[1]); ctx.stroke();
      ctx.fillStyle = C.bg; ctx.beginPath(); ctx.arc(top[0], top[1], 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = C.net; ctx.beginPath(); ctx.arc(top[0], top[1], active ? 2.4 : 1.6, 0, Math.PI * 2); ctx.fill();
      if (active) { const pulse = (time * 1.5) % 1; ctx.globalAlpha = (1 - pulse) * 0.7; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(top[0], top[1], 4 + pulse * 14, 0, Math.PI * 2); ctx.stroke(); }
      if (!this.small) { ctx.globalAlpha = a * 0.9; ctx.fillStyle = active ? C.fg2 : C.fg3; ctx.font = this.font(400, 8.5); this.setTracking("0.08em"); ctx.textAlign = "center"; ctx.fillText(m.name.toUpperCase(), base[0], G + (i % 2 ? 40 : 28)); }
      ctx.restore();
      if (active && dronePos) { const dp = this.P(dronePos[0], dronePos[1]); ctx.save(); ctx.strokeStyle = C.net; ctx.globalAlpha = 0.55; ctx.lineWidth = 1; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(top[0], top[1]); ctx.lineTo(dp[0], dp[1]); ctx.stroke(); ctx.restore(); }
    });

    // node callout (step 1)
    if (phase === 0 && u > 0.55) {
      const cm = MASTS[2], ct = this.P(cm.x, E_G - E_TOP), k = easeOut((u - 0.55) / 0.3), bx = this.P(cm.x + 0.05, 0.1);
      ctx.save(); ctx.strokeStyle = C.net; ctx.globalAlpha = k; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(ct[0], ct[1]); ctx.lineTo(ct[0] + (bx[0] - ct[0]) * k, ct[1] + (bx[1] - ct[1]) * k); ctx.stroke(); ctx.restore();
      if (k >= 0.99) this.box(bx[0], bx[1] - 10, ["NODE 03 · INDUSTRIAL PARK", "mic array ×4 · camera · RF receiver", "Remote ID · classification on device", "mains or solar · mobile uplink"], C.net);
    }

    // dock and vehicle
    const dk = this.P(E_DOCK, E_G), vh = this.P(E_VEH, E_G);
    if (phase >= 1) { ctx.save(); ctx.strokeStyle = C.net; ctx.fillStyle = C.bg; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.rect(dk[0] - 5, dk[1] - 7, 10, 7); ctx.fill(); ctx.stroke(); ctx.restore(); }
    ctx.save(); ctx.fillStyle = C.line2; ctx.strokeStyle = C.fg3; ctx.lineWidth = 1; ctx.fillRect(vh[0] - 8, vh[1] - 7, 16, 7); ctx.strokeRect(vh[0] - 8.5, vh[1] - 7.5, 17, 8); ctx.restore();

    // recorded track
    if (phase >= 1 && droneS !== null && droneS > E_DET && dronePos) {
      ctx.save(); ctx.strokeStyle = C.hot; ctx.lineWidth = 1.5; ctx.lineJoin = "round"; ctx.beginPath();
      let first = true;
      for (let ss = E_DET; ss <= droneS; ss += 0.004) { const q = atP(PATH, ss), qp = this.P(q[0], q[1]); if (first) { ctx.moveTo(qp[0], qp[1]); first = false; } else ctx.lineTo(qp[0], qp[1]); }
      if (phase !== 2) { const qq = this.P(dronePos[0], dronePos[1]); ctx.lineTo(qq[0], qq[1]); }
      ctx.stroke(); ctx.restore();
      const fd = atP(PATH, E_DET), fp = this.P(fd[0], fd[1]);
      ctx.save(); ctx.strokeStyle = C.hot; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(fp[0], fp[1], 4, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      if (!this.small && (phase > 1 || u > 0.3)) { ctx.save(); ctx.fillStyle = C.fg3; ctx.font = this.font(400, 8.5); this.setTracking("0.08em"); ctx.textAlign = "center"; ctx.fillText(`FIRST DETECTION · ${Math.round((E_G - fd[1]) / E_M)} m AGL`, fp[0], fp[1] - 12); ctx.restore(); }
    }

    // trace-back
    if (phase >= 2) {
      const v = phase === 2 ? easeOut(u / 0.6) : 1, fd2 = atP(PATH, E_DET), a0 = this.P(fd2[0], fd2[1]);
      ctx.save(); ctx.strokeStyle = C.hot; ctx.lineWidth = 1.4; ctx.setLineDash([4, 4]); ctx.lineDashOffset = -time * 20; ctx.globalAlpha = 0.9;
      ctx.beginPath(); ctx.moveTo(a0[0], a0[1]); ctx.lineTo(a0[0] + (vh[0] - a0[0]) * v, a0[1] + (vh[1] - a0[1]) * v); ctx.stroke();
      if (phase === 2) { const rs = E_TARGET - (E_TARGET - E_DET) * easeOut(u / 0.55), rp = atP(PATH, Math.max(E_DET, rs)), rpp = this.P(rp[0], rp[1]); ctx.setLineDash([]); ctx.fillStyle = C.fg; ctx.beginPath(); ctx.arc(rpp[0], rpp[1], 3, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
      if (v >= 0.98) {
        const b1 = this.P(E_VEH - 0.02, E_G)[0], b2 = this.P(E_VEH + 0.02, E_G)[0], by = G + 8, pr = (time * 1.2) % 1;
        ctx.save(); ctx.strokeStyle = C.hot; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(b1, by - 4); ctx.lineTo(b1, by + 4); ctx.moveTo(b1, by); ctx.lineTo(b2, by); ctx.moveTo(b2, by - 4); ctx.lineTo(b2, by + 4); ctx.stroke();
        ctx.globalAlpha = (1 - pr) * 0.6; ctx.beginPath(); ctx.ellipse(vh[0], G, ((b2 - b1) / 2) * (1 + pr * 0.6), 6 * (1 + pr * 0.6), 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
        if (phase === 2 || u < 0.5) this.box(vh[0] - 14, this.P(0, 0.13)[1], ["LAUNCH AREA", "est. ±150 m · coastal road", `${((E_VEH - fd2[0]) / E_KM).toFixed(1)} km before first detection`], C.hot, "right");
      }
    }

    // drone and readout
    if (dronePos && droneS !== null) {
      const seen = droneS >= E_DET;
      this.drone(dronePos[0], dronePos[1], C.hot, seen ? 1 : 0.28, heading);
      const dp2 = this.P(dronePos[0], dronePos[1]);
      if (seen && phase === 1 && u > 0.25) this.box(dp2[0] - 14, dp2[1] - 56, ["TRK-0417 · QUAD", `${38 + Math.round(Math.sin(time * 2) * 4)} km/h · 80 m AGL · no Remote ID`], C.hot, "right");
      if (phase === 2 && !this.small) this.box(dp2[0] - 14, dp2[1] - 56, ["TRK-0417 · LOITERING", "over Industrial park · 21:34:10"], C.hot, "right");
    }

    // chase drone
    if (phase === 3 && droneS !== null) {
      const landed = u >= 0.985, ip = atP(PATH, 0.62), dkp: Pt = [E_DOCK, E_G - 0.012];
      let cp: Pt;
      if (u < 0.12) { const r0 = u / 0.12; ctx.save(); ctx.strokeStyle = C.net; ctx.globalAlpha = 1 - r0; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(dk[0], dk[1] - 4, 6 + r0 * 24, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); cp = dkp; }
      else if (u < 0.4) { const f = ease((u - 0.12) / 0.28); cp = [dkp[0] + (ip[0] - dkp[0]) * f, dkp[1] + (ip[1] - dkp[1]) * f]; }
      else cp = atP(PATH, Math.max(0.62, droneS - 0.05));
      if (u >= 0.12) {
        ctx.save(); ctx.strokeStyle = C.net; ctx.lineWidth = 1.2; ctx.globalAlpha = 0.7; ctx.setLineDash([1, 4]); ctx.beginPath();
        const d0 = this.P(dkp[0], dkp[1]); ctx.moveTo(d0[0], d0[1]);
        if (u < 0.4) { const c1 = this.P(cp[0], cp[1]); ctx.lineTo(c1[0], c1[1]); }
        else { const i0 = this.P(ip[0], ip[1]); ctx.lineTo(i0[0], i0[1]); for (let cs = 0.62; cs <= Math.max(0.62, droneS - 0.05); cs += 0.004) { const cq = atP(PATH, cs), cqp = this.P(cq[0], cq[1]); ctx.lineTo(cqp[0], cqp[1]); } }
        ctx.stroke(); ctx.restore();
      }
      this.police(cp[0], cp[1], 1);
      const cpp = this.P(cp[0], cp[1]);
      if (u > 0.14 && u < 0.5) this.box(cpp[0] - 14, cpp[1] - 50, ["POLICE DRONE · CUED", "dispatch 21:35:40 · intercept 1.3 km"], C.net, "right");
      if (u >= 0.5 && !landed) this.box(cpp[0] - 14, cpp[1] - 50, ["FOLLOWING", "camera locked · 120 m behind"], C.net, "right");
      if (landed) {
        const k2 = 14;
        ctx.save(); ctx.strokeStyle = C.net; ctx.lineWidth = 1.5;
        for (const c of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { ctx.beginPath(); ctx.moveTo(vh[0] + c[0] * k2, vh[1] - 4 + c[1] * k2 * 0.5); ctx.lineTo(vh[0] + c[0] * k2, vh[1] - 4 + c[1] * k2); ctx.lineTo(vh[0] + c[0] * k2 * 0.5, vh[1] - 4 + c[1] * k2); ctx.stroke(); }
        ctx.restore();
        this.box(vh[0] - 14, this.P(0, 0.13)[1], ["LANDING FILMED 21:43:07", "vehicle on coastal road · evidence pack sent"], C.net, "right");
      }
    }
  }
}
