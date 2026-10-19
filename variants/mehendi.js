/* Variant: mehendi — "Find the Hidden Name".
   A henna pattern draws itself onto a palm; the groom's name hides in a paisley. Tap to find it,
   then the details bloom out. Supports ?auto=1 (self-playing demo), ctx.isStatic and reducedMotion. */
(function () {
  'use strict';

  const VB = { x: 6, y: 30, w: 244, h: 438 };
  const HAND = 'M 100 468 C 99 430, 93 392, 84 360 C 70 340, 50 315, 36 285 C 24 262, 18 238, 26 226 ' +
    'C 34 214, 48 220, 56 236 C 64 252, 72 268, 80 272 C 78 250, 76 225, 76 200 C 75 160, 72 120, 74 96 ' +
    'C 75 74, 108 72, 110 94 C 112 120, 112 160, 113 186 C 114 192, 118 192, 119 186 C 119 140, 118 100, 120 70 ' +
    'C 121 46, 154 46, 155 70 C 156 100, 156 140, 156 184 C 157 190, 161 190, 162 184 C 162 140, 162 110, 164 90 ' +
    'C 166 68, 196 68, 197 92 C 198 120, 198 160, 197 192 C 198 198, 202 198, 203 194 C 203 170, 204 145, 207 130 ' +
    'C 210 110, 234 112, 234 134 C 234 160, 232 190, 230 214 C 230 250, 228 300, 222 340 C 216 380, 208 420, 206 468';

  const r1 = n => Math.round(n * 10) / 10;
  const polar = (cx, cy, r, a) => [r1(cx + r * Math.cos(a)), r1(cy + r * Math.sin(a))];
  const P = p => p[0] + ' ' + p[1];
  const circleD = (cx, cy, r) => `M ${r1(cx - r)} ${cy} a ${r} ${r} 0 1 0 ${r1(2 * r)} 0 a ${r} ${r} 0 1 0 ${r1(-2 * r)} 0`;
  const qAt = (a, c, b, t) => [(1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0],
    (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]];
  const qTan = (a, c, b, t) => Math.atan2(2 * (1 - t) * (c[1] - a[1]) + 2 * t * (b[1] - c[1]),
    2 * (1 - t) * (c[0] - a[0]) + 2 * t * (b[0] - c[0]));

  /* ---------- henna pattern builder ---------- */
  function buildHenna(name) {   // name: the groom's name hidden in the paisley (Devanagari in Hindi mode)
    const out = [];
    let clipN = 0;
    const defs = [];
    const s = (d, w, t, dur) => out.push(`<path class="mehendi-s" d="${d}" stroke-width="${w}" data-t="${t | 0}" data-d="${dur | 0}"/>`);
    const fill = (d, t, dur) => out.push(`<path class="mehendi-f" d="${d}" data-t="${t | 0}" data-d="${dur | 0}"/>`);
    const dot = (x, y, r, t) => out.push(`<circle class="mehendi-f" cx="${r1(x)}" cy="${r1(y)}" r="${r}" data-t="${t | 0}" data-d="300"/>`);
    const trio = (x, y, t) => { dot(x, y - 2.6, 1.2, t); dot(x - 2.4, y + 1.6, 1.2, t + 80); dot(x + 2.4, y + 1.6, 1.2, t + 160); };

    function petals(cx, cy, ra, rb, n, w, t, off, veins) {
      const h = Math.PI / n * 0.92;
      for (let i = 0; i < n; i++) {
        const a = off + i * 2 * Math.PI / n, m = (ra + rb) / 2 * 1.08;
        s(`M ${P(polar(cx, cy, ra, a - h))} Q ${P(polar(cx, cy, m, a - h * 1.05))} ${P(polar(cx, cy, rb, a))} ` +
          `Q ${P(polar(cx, cy, m, a + h * 1.05))} ${P(polar(cx, cy, ra, a + h))}`, w, t + i * 45, 520);
        if (veins) s(`M ${P(polar(cx, cy, ra + 2, a))} L ${P(polar(cx, cy, rb - 4, a))}`, w * 0.6, t + 300 + i * 45, 300);
      }
    }
    function scallops(cx, cy, r, n, depth, w, t, dur) {
      let d = 'M ' + P(polar(cx, cy, r, 0));
      for (let i = 0; i < n; i++) {
        const a0 = i * 2 * Math.PI / n, a1 = (i + 1) * 2 * Math.PI / n;
        d += ` Q ${P(polar(cx, cy, r + 2 * depth, (a0 + a1) / 2))} ${P(polar(cx, cy, r, a1))}`;
      }
      s(d, w, t, dur);
    }
    function dotRing(cx, cy, r, n, dr, t, off) {
      for (let i = 0; i < n; i++) { const p = polar(cx, cy, r, (off || 0) + i * 2 * Math.PI / n); dot(p[0], p[1], dr, t + i * 30); }
    }
    function flower(cx, cy, size, n, w, t) {
      dot(cx, cy, 1.5, t);
      petals(cx, cy, 2.4, size, n, w, t + 60, -Math.PI / 2, false);
    }
    function leaf(x, y, a, len, w, t) {
      const tip = [x + Math.cos(a) * len, y + Math.sin(a) * len];
      const m = [x + Math.cos(a) * len * 0.5, y + Math.sin(a) * len * 0.5];
      const nx = -Math.sin(a) * len * 0.36, ny = Math.cos(a) * len * 0.36;
      s(`M ${r1(x)} ${r1(y)} Q ${r1(m[0] + nx)} ${r1(m[1] + ny)} ${r1(tip[0])} ${r1(tip[1])} Q ${r1(m[0] - nx)} ${r1(m[1] - ny)} ${r1(x)} ${r1(y)}`, w, t, 360);
    }
    function vine(a, b, bend, leaves, size, w, t, dur, curl) {
      const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
      const c = [(a[0] + b[0]) / 2 - dy / L * bend, (a[1] + b[1]) / 2 + dx / L * bend];
      s(`M ${r1(a[0])} ${r1(a[1])} Q ${r1(c[0])} ${r1(c[1])} ${r1(b[0])} ${r1(b[1])}`, w, t, dur);
      for (let i = 1; i <= leaves; i++) {
        const tt = i / (leaves + 1), p = qAt(a, c, b, tt), ang = qTan(a, c, b, tt);
        leaf(p[0], p[1], ang + (i % 2 ? 0.95 : -0.95), size, w * 0.8, t + dur * tt);
      }
      if (curl) {
        const ang = qTan(a, c, b, 1), e = b;
        const k = curl, q = [e[0] + Math.cos(ang) * k, e[1] + Math.sin(ang) * k];
        const side = [q[0] - Math.sin(ang) * k * 1.2, q[1] + Math.cos(ang) * k * 1.2];
        s(`M ${r1(e[0])} ${r1(e[1])} Q ${r1(q[0])} ${r1(q[1])} ${r1(side[0])} ${r1(side[1])} Q ${r1(e[0] - Math.sin(ang) * k * 0.6)} ${r1(e[1] + Math.cos(ang) * k * 0.6)} ${r1(e[0] - Math.sin(ang) * k * 0.2 + Math.cos(ang) * k * 0.4)} ${r1(e[1] + Math.cos(ang) * k * 0.2 + Math.sin(ang) * k * 0.4)}`, w * 0.9, t + dur, 300);
      }
    }
    function lattice(x0, y0, x1, y1, step, w, t, dur) {
      const id = 'mehendi-lc' + (++clipN);
      defs.push(`<clipPath id="${id}"><rect x="${r1(x0)}" y="${r1(y0)}" width="${r1(x1 - x0)}" height="${r1(y1 - y0)}"/></clipPath>`);
      const H = y1 - y0;
      let d1 = '', d2 = '';
      for (let x = x0 - H; x < x1 + step; x += step) {
        d1 += `M ${r1(x)} ${r1(y1)} L ${r1(x + H)} ${r1(y0)} `;
        d2 += `M ${r1(x)} ${r1(y0)} L ${r1(x + H)} ${r1(y1)} `;
      }
      out.push(`<g clip-path="url(#${id})">`);
      s(d1.trim(), w, t, dur);
      s(d2.trim(), w, t + dur * 0.4, dur);
      out.push('</g>');
    }
    function zigzag(x0, x1, y, h, step, w, t, dur) {
      let d = `M ${r1(x0)} ${r1(y)}`, up = true;
      for (let x = x0 + step / 2; x <= x1 + step; x += step / 2) { d += ` L ${r1(x)} ${r1(up ? y - h : y)}`; up = !up; }
      s(d, w, t, dur);
    }
    // cursive-looking loop chain ("lelele") — doubles as camouflage for the hidden name
    function loops(x0, x1, y, h, step, w, t, dur) {
      let d = `M ${r1(x0)} ${r1(y)}`;
      for (let x = x0; x + step <= x1 + 0.1; x += step) {
        d += ` C ${r1(x + step * 0.9)} ${r1(y)} ${r1(x + step * 1.05)} ${r1(y - h)} ${r1(x + step * 0.55)} ${r1(y - h)}` +
             ` C ${r1(x + step * 0.1)} ${r1(y - h)} ${r1(x + step * 0.25)} ${r1(y)} ${r1(x + step)} ${r1(y)}`;
      }
      s(d, w, t, dur);
    }
    const band = (l, r, y, w, t) => s(`M ${r1(l - 4)} ${r1(y)} Q ${r1((l + r) / 2)} ${r1(y + 2.5)} ${r1(r + 4)} ${r1(y)}`, w, t, 380);

    /* palm mandala */
    const MX = 154, MY = 292, T0 = 900;
    dot(MX, MY, 3.4, T0);
    s(circleD(MX, MY, 7), 1.5, T0 + 60, 450);
    petals(MX, MY, 8.6, 19, 8, 1.25, T0 + 250, -Math.PI / 2, false);
    s(circleD(MX, MY, 21.5), 1.8, T0 + 650, 600);
    dotRing(MX, MY, 24.6, 16, 1.05, T0 + 900);
    petals(MX, MY, 27, 41, 12, 1.35, T0 + 950, -Math.PI / 2 + Math.PI / 12, true);
    s(circleD(MX, MY, 43), 2, T0 + 1500, 700);
    scallops(MX, MY, 44.5, 18, 2.9, 1.3, T0 + 1800, 800);
    dotRing(MX, MY, 51.8, 18, 1.35, T0 + 2300, Math.PI / 18);

    /* toran band across the upper palm */
    const ta = [78, 206], tc = [152, 226], tb = [232, 212];
    s(`M ${P(ta)} Q ${P(tc)} ${P(tb)}`, 1.6, 1500, 600);
    let arcs = '';
    for (let i = 0; i < 10; i++) {
      const p0 = qAt(ta, tc, tb, i / 10), p1 = qAt(ta, tc, tb, (i + 1) / 10), pm = qAt(ta, tc, tb, (i + 0.5) / 10);
      arcs += `${i ? '' : 'M ' + r1(p0[0]) + ' ' + r1(p0[1])} Q ${r1(pm[0])} ${r1(pm[1] + 10)} ${r1(p1[0])} ${r1(p1[1])} `;
      dot(pm[0], pm[1] + 9.5, 1.3, 2200 + i * 50);
    }
    s(arcs.trim(), 1.15, 1800, 700);
    s(`M ${P([78, 201])} Q ${P([152, 220])} ${P([232, 207])}`, 0.8, 1600, 600);
    loops(108, 202, 246, 5, 6.2, 0.75, 2500, 900);

    /* fingers */
    const FINGERS = [
      { l: 75, r: 111, top: 78, cap: 100, base: 190, T: 1800, mid: 'flower', low: 'lattice' },
      { l: 119.5, r: 155.5, top: 52, cap: 76, base: 186, T: 2100, mid: 'lattice', low: 'vine' },
      { l: 163, r: 197, top: 74, cap: 96, base: 194, T: 2400, mid: 'flower', low: 'lattice' },
      { l: 206, r: 233, top: 117, cap: 138, base: 205, T: 2700, mid: 'flower', low: 'vine' },
    ];
    FINGERS.forEach((f, fi) => {
      const cx = (f.l + f.r) / 2, len = f.base - f.cap, j1 = f.cap + len * 0.36, j2 = f.cap + len * 0.68, T = f.T;
      fill(`M ${f.l - 6} ${f.cap} Q ${r1(cx)} ${f.cap + 7} ${f.r + 6} ${f.cap} L ${f.r + 6} ${f.top - 20} L ${f.l - 6} ${f.top - 20} Z`, T, 600);
      // scalloped edge under the cap
      const n = 4, sw = (f.r - f.l) / n;
      let d = `M ${f.l} ${f.cap + 3}`;
      for (let i = 0; i < n; i++) d += ` Q ${r1(f.l + sw * (i + 0.5))} ${r1(f.cap + 12 + (i === 1 || i === 2 ? 2 : 0))} ${r1(f.l + sw * (i + 1))} ${r1(f.cap + 3 + (i === 1 ? 1.5 : i === 2 ? 1.5 : 0))}`;
      s(d, 1.2, T + 250, 450);
      for (let i = 0; i < n; i++) dot(f.l + sw * (i + 0.5), f.cap + 14.5 + (i === 1 || i === 2 ? 1.5 : 0), 1.05, T + 600 + i * 50);
      // middle segment
      const midTop = f.cap + 19, midBot = j1 - 2;
      if (f.mid === 'flower' && midBot - midTop > 8) flower(cx, (midTop + midBot) / 2 + 1, Math.min(7, (midBot - midTop) / 2 + 1), 6, 0.9, T + 650);
      else if (midBot - midTop > 8) lattice(f.l, midTop, f.r, midBot, 5.2, 0.7, T + 650, 700);
      band(f.l, f.r, j1, 1.5, T + 800);
      if (fi % 2) zigzag(f.l - 2, f.r + 2, j1 + 6.5, 3.6, 4.4, 0.8, T + 950, 500);
      else loops(f.l + 1, f.r - 1, j1 + 6.6, 4.4, 4.6, 0.75, T + 950, 600);
      band(f.l, f.r, j1 + 8, 1.2, T + 1000);
      // low segment
      const lowTop = j1 + 12, lowBot = j2 - 1;
      if (lowBot - lowTop > 6) {
        if (f.mid === 'lattice' || fi === 3) {
          for (let k = 0; k < 2; k++) {
            const yy = lowTop + 3 + k * 6.5;
            s(`M ${r1(f.l)} ${r1(yy + 3)} L ${r1(cx)} ${r1(yy - 1)} L ${r1(f.r)} ${r1(yy + 3)}`, 0.9, T + 1100 + k * 120, 380);
          }
        } else {
          lattice(f.l, lowTop, f.r, lowBot, 5, 0.7, T + 1100, 650);
        }
      }
      band(f.l, f.r, j2, 1.4, T + 1250);
      for (let i = 0; i < 4; i++) dot(f.l + (f.r - f.l) * (i + 0.5) / 4, j2 + 4.5, 0.95, T + 1350 + i * 40);
      band(f.l, f.r, j2 + 9, 1, T + 1350);
      // base vine down into the palm
      vine([cx, j2 + 13], [cx + (fi - 1.5) * 1.5, f.base + 6], fi % 2 ? 3 : -3, 2, 6, 1.1, T + 1450, 550, 0);
    });

    /* thumb */
    const tip = [28, 224], tbase = [76, 322];
    const ax = (tbase[0] - tip[0]), ay = (tbase[1] - tip[1]), AL = Math.hypot(ax, ay), ux = ax / AL, uy = ay / AL, nx = -uy, ny = ux;
    const along = (d, o) => [tip[0] + ux * d + nx * o, tip[1] + uy * d + ny * o];
    const c0 = along(22, 0);
    const capL = along(22, 30), capR = along(22, -30), capC = along(28, 0);
    fill(`M ${P(capR.map(r1))} Q ${P(capC.map(r1))} ${P(capL.map(r1))} L ${P(along(-40, 30).map(r1))} L ${P(along(-40, -30).map(r1))} Z`, 2000, 600);
    s(`M ${P(along(25, -26).map(r1))} Q ${P(along(36, 0).map(r1))} ${P(along(25, 26).map(r1))}`, 1.2, 2250, 450);
    trio(...along(38, 0), 2600);
    const tb1 = along(50, 0);
    s(`M ${P(along(50, -26).map(r1))} Q ${P(along(53, 0).map(r1))} ${P(along(50, 26).map(r1))}`, 1.5, 2650, 420);
    s(`M ${P(along(56, -26).map(r1))} Q ${P(along(59, 0).map(r1))} ${P(along(56, 26).map(r1))}`, 1.1, 2750, 420);
    vine(along(62, 0), along(106, 4), 4, 4, 7, 1.15, 2850, 700, 3.5);
    flower(...along(120, 8), 7.5, 7, 1, 3300);
    void c0; void tb1;

    /* palm side vines */
    vine([221, 236], [212, 346], -6, 5, 7, 1.15, 2800, 900, 0);
    for (let i = 0; i < 7; i++) dot(91 + Math.sin(i * 0.9) * 2.5, 286 + i * 10, i % 3 === 1 ? 1.6 : 1.1, 3000 + i * 70);
    trio(92, 250, 3000);

    /* lower palm: decoy flower + the name paisley */
    out.push('<g transform="translate(104 372) rotate(112) scale(.5)">');
    s('M -14 -16 C 8 -20, 24 -14, 38 -22 C 42 -24, 47 -20, 42 -16 C 34 -2, 22 16, -10 16 C -26 16, -36 6, -36 -2 C -36 -10, -28 -16, -14 -16 Z', 2.6, 3400, 800);
    loops(-28, 26, 5, 9, 7.5, 1.5, 3800, 700);
    out.push('</g>');
    trio(118, 398, 4000);
    trio(210, 368, 4000);
    out.push('<g transform="translate(158 381) rotate(-10) scale(1.12)">');
    const PAISLEY = 'M -14 -16 C 8 -20, 24 -14, 38 -22 C 42 -24, 47 -20, 42 -16 C 34 -2, 22 16, -10 16 C -26 16, -36 6, -36 -2 C -36 -10, -28 -16, -14 -16 Z';
    s(PAISLEY, 1.7, 3500, 900);
    s('M -14 -20 C 10 -25, 26 -18, 40 -27 C 46 -30, 53 -23, 46 -15 C 37 1, 24 21, -10 21 C -30 21, -41 9, -41 -2 C -41 -14, -30 -20, -14 -20', 0.8, 3700, 900);
    s('M 41 -18 Q 36 -19 37 -14', 0.9, 4300, 250);
    for (let i = 0; i < 9; i++) { const a = Math.PI * 0.55 + i * 0.32; dot(-15 + Math.cos(a) * 24.5, 1 + Math.sin(a) * 23, 0.85, 4200 + i * 45); }
    loops(-22, 22, 12.5, 2.8, 4.4, 0.6, 4300, 600);
    s('M -30 -6 Q -33 2 -28 7', 0.8, 4250, 300);
    for (let i = 0; i < 7; i++) dot(-18 + i * 7.5, -11 - (i > 4 ? (i - 4) * 1.5 : 0), 0.7, 4350 + i * 40);
    s('M 24 -9 Q 31 -14 36 -12', 0.8, 4400, 300);
    out.push(`<text class="mehendi-nameglow" x="-1" y="5" transform="rotate(-5)" text-anchor="middle">${name}</text>`);
    out.push(`<text class="mehendi-name mehendi-f" x="-1" y="5" transform="rotate(-5)" text-anchor="middle" data-t="4250" data-d="700">${name}</text>`);
    out.push('</g>');

    /* wrist cuff */
    s('M 86 404 Q 153 416 220 404', 1.7, 3900, 600);
    s('M 86 428 Q 153 440 220 428', 1.7, 4000, 600);
    const wid = 'mehendi-wc';
    defs.push(`<clipPath id="${wid}"><path d="M 80 406 Q 153 418 226 406 L 226 426 Q 153 438 80 426 Z"/></clipPath>`);
    out.push(`<g clip-path="url(#${wid})">`);
    let w1 = '', w2 = '';
    for (let x = 60; x < 240; x += 7) { w1 += `M ${x} 440 L ${x + 34} 400 `; w2 += `M ${x} 400 L ${x + 34} 440 `; }
    s(w1.trim(), 0.7, 4200, 700);
    s(w2.trim(), 0.7, 4400, 700);
    out.push('</g>');
    for (let i = 0; i < 12; i++) { const x = 96 + i * 10; dot(x, 398 + Math.pow((x - 153) / 67, 2) * -6 + 6, 1.1, 4500 + i * 40); }

    return { html: out.join(''), defs: defs.join('') };
  }

  function bangles() {
    let h = '';
    [444, 452.5, 461].forEach((y, i) => {
      h += `<path d="M 86 ${y} Q 153 ${y + 13} 220 ${y}" stroke="url(#mehendi-rg)" stroke-width="${i === 1 ? 3 : 6}" fill="none" stroke-linecap="round"/>`;
      if (i !== 1) h += `<path d="M 92 ${y - 1.4} Q 153 ${y + 10.6} 214 ${y - 1.4}" stroke="#fff3e6" stroke-opacity=".55" stroke-width="1" fill="none" stroke-linecap="round"/>`;
    });
    return h;
  }

  /* ---------- render ---------- */
  function render(root, ctx) {
    const esc = ctx.esc, Pp = ctx.P;
    const tr = ctx.t, HI = ctx.hi;   // Hindi version (?lang=hi)
    const WITH_GEET = tr(' · with Geet', ' एवं गीत');
    const auto = /[?&]auto=1\b/.test(location.search);
    const RM = ctx.reducedMotion;
    const henna = buildHenna(esc(Pp.groom));
    const hasMeh = ctx.events.some(e => e.id === 'mehandi');
    const occ = ctx.occasion;

    const svgArt = `
      <svg class="mehendi-hand" viewBox="${VB.x} ${VB.y} ${VB.w} ${VB.h}" role="img"
           aria-label="${tr('A hand with a fresh mehendi design. The groom’s name is hidden somewhere in it.', 'ताज़ी मेहंदी लगा हाथ। इसमें दूल्हे का नाम कहीं छुपा है।')}">
        <defs>
          <radialGradient id="mehendi-skin" cx="50%" cy="58%" r="62%">
            <stop offset="0" stop-color="#f9e2d0"/><stop offset=".7" stop-color="#f1cdb4"/><stop offset="1" stop-color="#e6b896"/>
          </radialGradient>
          <linearGradient id="mehendi-rg" x1="0" x2="1">
            <stop offset="0" stop-color="#a8634f"/><stop offset=".35" stop-color="#e2ab8d"/><stop offset=".6" stop-color="#c7836a"/><stop offset="1" stop-color="#9c5946"/>
          </linearGradient>
          <linearGradient id="mehendi-gold" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stop-color="#f7d77a"/><stop offset=".5" stop-color="#d9a032"/><stop offset="1" stop-color="#b37a1c"/>
          </linearGradient>
          <filter id="mehendi-blur" x="-50%" y="-80%" width="200%" height="260%"><feGaussianBlur stdDeviation="2.4"/></filter>
          <clipPath id="mehendi-handclip"><path d="${HAND} Z"/></clipPath>
          ${henna.defs}
        </defs>
        <g id="mehendi-art">
          <path class="mehendi-skin" d="${HAND} Z" fill="url(#mehendi-skin)"/>
          <path class="mehendi-outline" d="${HAND}"/>
          <g class="mehendi-henna" clip-path="url(#mehendi-handclip)">${henna.html}</g>
          <g class="mehendi-bangles">${bangles()}</g>
        </g>
      </svg>`;

    // Delicate henna-line ornament: a central paisley-flower with curling vines either side.
    const ornament = (cls) => `<svg class="mehendi-orn${cls ? ' ' + cls : ''}" viewBox="0 0 190 30" aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round">
        <path d="M95 6 C99 11 99 17 95 22 C91 17 91 11 95 6 Z" stroke-width="1.1"/>
        <path d="M95 9.5 V18.5" stroke-width=".7"/>
        <path d="M86 15 C89 11 92 12 95 15 C98 12 101 11 104 15" stroke-width=".9"/>
        <path d="M84 15 C70 15 64 7 54 11 C46 14 50 22 56 19 C60 17 58 13 55 14" stroke-width=".9"/>
        <path d="M106 15 C120 15 126 7 136 11 C144 14 140 22 134 19 C130 17 132 13 135 14" stroke-width=".9"/>
        <path d="M52 13 C40 18 30 12 20 15 M138 13 C150 18 160 12 170 15" stroke-width=".8"/>
        <path d="M70 12 q3 -5 7 -4 q-1 4 -7 4 Z M120 12 q-3 -5 -7 -4 q1 4 7 4 Z" stroke-width=".7"/>
        <g fill="currentColor" stroke="none">
          <circle cx="95" cy="26" r="1.2"/><circle cx="90" cy="25" r=".8"/><circle cx="100" cy="25" r=".8"/>
          <circle cx="16" cy="15" r="1.3"/><circle cx="174" cy="15" r="1.3"/><circle cx="10" cy="15" r=".8"/><circle cx="180" cy="15" r=".8"/>
        </g>
      </svg>`;
    const ganesh = (Invite.art && Invite.art.ganesh) ? `<span class="mehendi-ganesh" aria-hidden="true">${Invite.art.ganesh({ size: 52 })}</span>` : '';

    const details = `
      <section class="mehendi-details" id="mehendi-details" aria-label="${tr('Invitation details', 'निमंत्रण की जानकारी')}"${ctx.isStatic ? '' : ' hidden'}>
        <div class="mehendi-card">
          <div class="mehendi-up" style="--i:0">${ornament()}</div>
          <p class="mehendi-bless mehendi-up" style="--i:0">${HI ? `<b>${esc(Pp.blessings)}</b>के आशीर्वाद से` : `With the divine blessings of<b>${esc(Pp.blessings)}</b>`}</p>
          <h2 class="mehendi-title mehendi-up" style="--i:1">
            <span class="mehendi-title-hi" lang="hi">${esc(occ.titleHi)}</span>
            ${HI ? '' : `<span class="mehendi-title-en">${esc(occ.title)}</span>`}
          </h2>
          ${hasMeh ? `<p class="mehendi-with mehendi-up" style="--i:2">${tr('with Geet', 'एवं गीत')}</p>` : ''}
          <span class="mehendi-rule mehendi-up" style="--i:3" aria-hidden="true"></span>
          <p class="mehendi-hosts mehendi-up" style="--i:3">${esc(Pp.groomParents)}</p>
          <p class="mehendi-line mehendi-up" style="--i:3">${esc(occ.line)}</p>
          <p class="mehendi-couple mehendi-up" style="--i:4"><span>${esc(Pp.groom)}</span><em>${tr('with', 'संग')}</em><span>${esc(Pp.bride)}</span></p>
          <p class="mehendi-bride mehendi-up" style="--i:4">${tr('Daughter of', 'सुपुत्री')} ${esc(Pp.brideParents)}</p>
          <div class="mehendi-sum mehendi-up" style="--i:5">${ctx.summaryHTML({ heading: false })}</div>
          <div class="mehendi-up" style="--i:6">${ornament('is-foot')}</div>
        </div>
      </section>`;

    if (ctx.isStatic) {
      root.innerHTML = `
        <div class="mehendi mehendi-static">
          <section class="mehendi-stage">
            <p class="mehendi-om" lang="hi">${esc(ctx.T.ganeshShort)}</p>
            ${ganesh}
            <p class="mehendi-kicker">${esc(occ.title)}${hasMeh ? WITH_GEET : ''}</p>
            <h1 class="mehendi-greet">${esc(ctx.greeting)},</h1>
            <p class="mehendi-prompt">${tr('the groom’s name is hidden in this mehendi. Can you spot it? 🔍', 'इस मेहंदी में दूल्हे का नाम छुपा है। क्या आप ढूँढ सकते हैं? 🔍')}</p>
            <div class="mehendi-handwrap is-found is-static">${svgArt}</div>
            <p class="mehendi-caption">${HI ? `मिला? यह रहे <b>${esc(Pp.groom)}</b>, कैरी के डिज़ाइन में छुपे ✨` : `Found it? It’s <b>${esc(Pp.groom)}</b>, curled up in a paisley ✨`}</p>
          </section>
          ${details}
        </div>`;
      const done = () => ctx.ready();
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => setTimeout(done, 150), done);
      else setTimeout(done, 400);
      return;
    }

    root.innerHTML = `
      <div class="mehendi">
        <section class="mehendi-stage">
          <p class="mehendi-om" lang="hi">${esc(ctx.T.ganeshShort)}</p>
            ${ganesh}
            <p class="mehendi-kicker">${esc(occ.title)}${hasMeh ? WITH_GEET : ''}</p>
          <h1 class="mehendi-greet">${esc(ctx.greeting)},</h1>
          <p class="mehendi-prompt">${tr('can you find the groom’s name hidden in this mehendi? 🔍', 'क्या आप इस मेहंदी में छुपा दूल्हे का नाम ढूँढ सकते हैं? 🔍')}</p>
          <div class="mehendi-handwrap">
            ${svgArt}
            <div class="mehendi-lens" aria-hidden="true">
              <svg viewBox="0 0 10 10"><use href="#mehendi-art" xlink:href="#mehendi-art" xmlns:xlink="http://www.w3.org/1999/xlink"/></svg>
            </div>
            <div class="mehendi-fx" aria-hidden="true"></div>
            <div class="mehendi-toast" role="status" aria-live="polite"></div>
          </div>
          <p class="mehendi-hint" aria-live="polite">${tr('Fresh mehendi going on… ✍️', 'ताज़ी मेहंदी लग रही है… ✍️')}</p>
          <div class="mehendi-ctrls">
            <button type="button" class="mehendi-btn mehendi-show" hidden>${tr('Show me 🙈', 'दिखा दो 🙈')}</button>
            <button type="button" class="mehendi-btn mehendi-skip">${tr('Skip to details ↓', 'सीधे विवरण देखें ↓')}</button>
          </div>
        </section>
        ${details}
      </div>`;

    const $ = sel => root.querySelector(sel);
    const wrap = $('.mehendi-handwrap'), svg = $('.mehendi-hand'), fx = $('.mehendi-fx'), lens = $('.mehendi-lens');
    const lensSvg = lens.querySelector('svg'), toast = $('.mehendi-toast'), hint = $('.mehendi-hint');
    const showBtn = $('.mehendi-show'), skipBtn = $('.mehendi-skip'), det = $('#mehendi-details');
    const nameEl = svg.querySelector('.mehendi-name');
    const strokes = Array.prototype.slice.call(svg.querySelectorAll('.mehendi-s, .mehendi-outline'));
    const fades = Array.prototype.slice.call(svg.querySelectorAll('.mehendi-f, .mehendi-skin, .mehendi-bangles'));

    let state = 'drawing', misses = 0, timers = [];
    const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); return id; };

    /* ---- drawing ---- */
    const DRAW_END = 5200;
    function finishDrawing() {
      if (state !== 'drawing') return;
      strokes.forEach(p => { p.style.transition = 'none'; p.style.strokeDashoffset = '0'; p.style.strokeDasharray = 'none'; });
      fades.forEach(f => { f.style.transition = 'none'; f.style.opacity = ''; });
      state = 'play';
      hint.textContent = tr('Tap where you spot it 👆 · hold & drag to magnify', 'जहाँ दिखे वहाँ टैप करें 👆 · बड़ा देखने के लिए दबाकर घुमाएँ');
      wrap.classList.add('is-ready');
    }
    function startDrawing() {
      if (RM) { finishDrawing(); return; }
      strokes.forEach(p => {
        const L = p.getTotalLength ? p.getTotalLength() : 200;
        p.style.strokeDasharray = r1(L) + ' ' + r1(L + 2);
        p.style.strokeDashoffset = r1(L + 1);
      });
      fades.forEach(f => { f.style.opacity = '0'; });
      svg.getBoundingClientRect();
      requestAnimationFrame(() => requestAnimationFrame(() => {
        strokes.forEach(p => {
          p.style.transition = `stroke-dashoffset ${p.dataset.d}ms cubic-bezier(.5,.1,.35,1) ${p.dataset.t}ms`;
          p.style.strokeDashoffset = '0';
        });
        fades.forEach(f => {
          const t = f.dataset.t || 0, d = f.dataset.d || 500;
          f.style.transition = `opacity ${d}ms ease ${t}ms`;
          f.style.opacity = '';
        });
      }));
      later(finishDrawing, DRAW_END);
    }
    // outline/skin/bangles timings
    svg.querySelector('.mehendi-skin').dataset.d = '500';
    svg.querySelector('.mehendi-outline').dataset.t = '100';
    svg.querySelector('.mehendi-outline').dataset.d = '1300';
    svg.querySelector('.mehendi-bangles').dataset.t = '4500';
    svg.querySelector('.mehendi-bangles').dataset.d = '700';

    /* ---- geometry helpers ---- */
    function nameHit(x, y) {
      const r = nameEl.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const hw = Math.max(r.width / 2 + 14, 28), hh = Math.max(r.height / 2 + 14, 28);
      return { hit: Math.abs(x - cx) <= hw && Math.abs(y - cy) <= hh, dx: cx - x, dy: cy - y, dist: Math.hypot(cx - x, cy - y), cx, cy };
    }
    function toWrap(x, y) { const r = wrap.getBoundingClientRect(); return [x - r.left, y - r.top]; }
    function toSvg(x, y) {
      const m = svg.getScreenCTM();
      if (!m) return [0, 0];
      const p = svg.createSVGPoint(); p.x = x; p.y = y;
      const q = p.matrixTransform(m.inverse());
      return [q.x, q.y];
    }
    function svgToClient(x, y) {
      const m = svg.getScreenCTM(), p = svg.createSVGPoint(); p.x = x; p.y = y;
      const q = p.matrixTransform(m); return [q.x, q.y];
    }

    /* ---- lens ---- */
    const LENS = 118, ZOOM = 2.3;
    function moveLens(x, y) {
      const w = toWrap(x, y), s = toSvg(x, y);
      const scale = svg.getBoundingClientRect().width / VB.w;
      const span = LENS / (scale * ZOOM);
      lensSvg.setAttribute('viewBox', `${r1(s[0] - span / 2)} ${r1(s[1] - span / 2)} ${r1(span)} ${r1(span)}`);
      const wr = wrap.getBoundingClientRect();
      let lx = w[0] - LENS / 2, ly = w[1] - LENS - 34;
      if (ly < -40) ly = w[1] + 34;
      lx = Math.max(-10, Math.min(wr.width - LENS + 10, lx));
      lens.style.transform = `translate(${r1(lx)}px, ${r1(ly)}px)`;
    }
    const showLens = on => lens.classList.toggle('is-on', !!on);

    /* ---- feedback ---- */
    function ripple(x, y) {
      const w = toWrap(x, y), el = document.createElement('span');
      el.className = 'mehendi-ripple';
      el.style.left = w[0] + 'px'; el.style.top = w[1] + 'px';
      fx.appendChild(el);
      setTimeout(() => el.remove(), 900);
    }
    function sparkles(cx, cy) {
      const w = toWrap(cx, cy), n = RM ? 6 : 22;
      for (let i = 0; i < n; i++) {
        const el = document.createElement('span');
        el.className = 'mehendi-spark';
        el.textContent = i % 3 ? '✦' : '•';
        const a = (i / n) * Math.PI * 2 + Math.random() * 0.4, d = 40 + Math.random() * 60;
        el.style.left = w[0] + 'px'; el.style.top = w[1] + 'px';
        el.style.setProperty('--dx', r1(Math.cos(a) * d) + 'px');
        el.style.setProperty('--dy', r1(Math.sin(a) * d) + 'px');
        el.style.setProperty('--s', (0.7 + Math.random() * 0.8).toFixed(2));
        el.style.animationDelay = (Math.random() * 120 | 0) + 'ms';
        fx.appendChild(el);
        setTimeout(() => el.remove(), 1600);
      }
    }
    function hintFor(h) {
      if (h.dist < 95) return tr('So close! 🔥 It’s right around there…', 'बहुत पास! 🔥 बस यहीं कहीं है…');
      const v = Math.abs(h.dy) > Math.abs(h.dx) ? (h.dy > 0 ? tr('lower', 'नीचे') : tr('higher', 'ऊपर')) : (h.dx > 0 ? tr('to the right', 'दाईं ओर') : tr('to the left', 'बाईं ओर'));
      if (HI) {
        if (misses === 1) return `यहाँ नहीं… थोड़ा ${v} देखिए 👀`;
        if (misses === 2) return `ठंडा ❄️ थोड़ा ${v} देखिए…`;
        if (misses === 3) return `श्श्श… कैरी में राज़ छुपे होते हैं 🌿 ${v} देखिए।`;
        return `गरम हो रहा है… ${v} जाइए 👀`;
      }
      if (misses === 1) return `Not there… try a little ${v} 👀`;
      if (misses === 2) return `Cold ❄️ Look a bit ${v}…`;
      if (misses === 3) return `Psst… paisleys keep secrets 🌿 Look ${v}.`;
      return `Warm-ish… go ${v} 👀`;
    }
    function miss(x, y) {
      if (state !== 'play') return;
      misses++;
      ctx.sound.play('tap');
      ripple(x, y);
      if (!RM) { wrap.classList.remove('is-miss'); void wrap.offsetWidth; wrap.classList.add('is-miss'); }
      hint.textContent = hintFor(nameHit(x, y));
      if (misses >= 3) showBtn.hidden = false;
    }
    function found(how) {
      if (state === 'found') return;
      if (state === 'drawing') finishDrawing();
      state = 'found';
      showLens(false);
      timers.forEach(clearTimeout); timers = [];
      wrap.classList.add('is-found');
      svg.style.touchAction = '';
      const r = nameEl.getBoundingClientRect();
      sparkles(r.left + r.width / 2, r.top + r.height / 2);
      ctx.sound.play(how === 'tap' ? 'success' : 'dhol');   // mehendi theme: 'success' is the dhol starting up
      toast.innerHTML = how === 'tap'
        ? (HI ? `<b>मिल गया! 🎉</b><span>श्श्श… ${esc(Pp.bride)} की मेहंदी में नाम ढूँढना और मुश्किल होगा 😉</span>`
          : `<b>Mil gaya! 🎉</b><span>Psst… ${esc(Pp.bride)}’s mehendi will have a harder one 😉</span>`)
        : HI ? `<b>यह रहे! 👀</b><span>${esc(Pp.groom)} कैरी में छुपे थे। ${esc(Pp.bride)} की मेहंदी में और मुश्किल होगा 😉</span>`
          : `<b>Yeh raha! 👀</b><span>${esc(Pp.groom)} was hiding in the paisley. ${esc(Pp.bride)}’s will be trickier 😉</span>`;
      toast.classList.add('is-on');
      showBtn.hidden = true;
      hint.textContent = how === 'tap' ? tr('Sharp eyes! 👏 The details are just below ↓', 'तेज़ नज़र! 👏 पूरी जानकारी नीचे है ↓') : tr('The details are just below ↓', 'पूरी जानकारी नीचे है ↓');
      skipBtn.textContent = tr('See the details ↓', 'जानकारी देखें ↓');
      later(() => bloom(true), RM ? 600 : 1900);
    }

    /* ---- details bloom ---- */
    let bloomed = false;
    function bloom(scroll) {
      if (!bloomed) {
        bloomed = true;
        det.hidden = false;
        if (!RM) {
          det.classList.add('is-bloom');
          petalShower();
        }
        ctx.sound.play('whoosh');
        ctx.ready();
      }
      if (scroll) {
        setTimeout(() => {
          const y = det.getBoundingClientRect().top + window.pageYOffset - 8;
          try { window.scrollTo({ top: y, behavior: RM ? 'auto' : 'smooth' }); } catch (e) { window.scrollTo(0, y); }
        }, 60);
      }
    }
    function petalShower() {
      const box = document.createElement('div');
      box.className = 'mehendi-petals';
      box.setAttribute('aria-hidden', 'true');
      const cols = ['#e6cd8e', '#c9a45c', '#d99a8e', '#f3ead6', '#9fbf9a'];
      for (let i = 0; i < 18; i++) {
        const p = document.createElement('i');
        p.style.left = (Math.random() * 100).toFixed(1) + '%';
        p.style.background = cols[i % cols.length];
        p.style.animationDelay = (Math.random() * 1400 | 0) + 'ms';
        p.style.animationDuration = (3200 + Math.random() * 2200 | 0) + 'ms';
        p.style.setProperty('--x', ((Math.random() - 0.5) * 120 | 0) + 'px');
        p.style.setProperty('--r', ((Math.random() - 0.5) * 720 | 0) + 'deg');
        box.appendChild(p);
      }
      document.body.appendChild(box);
      setTimeout(() => box.remove(), 7500);
    }

    /* ---- pointer handling ---- */
    let down = null;
    svg.style.touchAction = 'none';
    svg.addEventListener('pointerdown', e => {
      if (state === 'drawing') { finishDrawing(); return; }
      if (state !== 'play') return;
      down = { x: e.clientX, y: e.clientY, id: e.pointerId, lens: false, t: Date.now() };
      try { svg.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      down.timer = setTimeout(() => { if (down) { down.lens = true; moveLens(down.x, down.y); showLens(true); } }, 260);
    });
    svg.addEventListener('pointermove', e => {
      if (!down || e.pointerId !== down.id) return;
      down.lx = e.clientX; down.ly = e.clientY;
      if (!down.lens && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 10) { down.lens = true; showLens(true); }
      if (down.lens) moveLens(e.clientX, e.clientY);
    });
    function up(e, cancel) {
      if (!down || e.pointerId !== down.id) return;
      clearTimeout(down.timer);
      const wasLens = down.lens, moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      down = null;
      showLens(false);
      if (cancel || state !== 'play') return;
      const h = nameHit(e.clientX, e.clientY);
      if (h.hit) { found('tap'); return; }
      if (!wasLens || moved < 12) miss(e.clientX, e.clientY);
      else hint.textContent = tr('Lift your finger right on the name to claim it 🔍', 'नाम के ठीक ऊपर उँगली उठाइए 🔍');
    }
    svg.addEventListener('pointerup', e => up(e, false));
    svg.addEventListener('pointercancel', e => up(e, true));

    showBtn.addEventListener('click', () => found('show'));
    skipBtn.addEventListener('click', () => {
      ctx.sound.play('tap');
      if (state !== 'found') {
        if (state === 'drawing') finishDrawing();
        state = 'found';
        wrap.classList.add('is-found');
        showBtn.hidden = true;
        hint.textContent = tr(`Psst… it was here: ${Pp.groom} 💛`, `श्श्श… नाम यहाँ था: ${Pp.groom} 💛`);
        skipBtn.textContent = tr('See the details ↓', 'जानकारी देखें ↓');
      }
      bloom(true);
    });

    startDrawing();

    /* ---- auto demo ---- */
    if (auto) {
      const at = (sx, sy) => svgToClient(sx, sy);
      const fakeTap = (sx, sy) => { if (state !== 'play') return; const c = at(sx, sy); const h = nameHit(c[0], c[1]); if (h.hit) found('tap'); else miss(c[0], c[1]); };
      const glide = (from, to, ms, done) => {
        showLens(true);
        const steps = Math.max(1, ms / 40 | 0);
        for (let i = 0; i <= steps; i++) {
          later(() => {
            const t = i / steps, e = t * t * (3 - 2 * t);
            const c = at(from[0] + (to[0] - from[0]) * e, from[1] + (to[1] - from[1]) * e);
            moveLens(c[0], c[1]);
            if (i === steps) { showLens(false); if (done) done(); }
          }, i * 40);
        }
      };
      const t0 = RM ? 600 : DRAW_END + 700;
      later(() => fakeTap(138, 120), t0);                      // middle finger: miss
      later(() => fakeTap(150, 292), t0 + 1500);               // mandala: miss
      later(() => glide([150, 300], [158, 383], 1500, () => fakeTap(157, 382)), t0 + 3000);
    }
  }

  Invite.register('mehendi', { render });
})();
