/* Diya — devotional signature variant (G1 Sunderkand).
   Tap to light a brass diya: a spark, the flame, a temple bell, and the warm light spreads to reveal the card. */
(function () {
  'use strict';

  /* ---------- drawings ---------- */
  function defsSVG() {
    return `<svg class="diya-defs" width="0" height="0" aria-hidden="true" focusable="false"><defs>
      <linearGradient id="diyaBrass" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stop-color="#5a300a"/><stop offset=".2" stop-color="#a86f22"/>
        <stop offset=".42" stop-color="#f3d27c"/><stop offset=".6" stop-color="#d39a3a"/>
        <stop offset=".85" stop-color="#8a5416"/><stop offset="1" stop-color="#55300b"/>
      </linearGradient>
      <linearGradient id="diyaRim" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stop-color="#fbe6a2"/><stop offset="1" stop-color="#b47c26"/>
      </linearGradient>
      <radialGradient id="diyaOil" cx=".5" cy=".4" r=".65">
        <stop offset="0" stop-color="#8a4a0e"/><stop offset="1" stop-color="#341503"/>
      </radialGradient>
      <radialGradient id="diyaFlameO" cx=".5" cy=".9" r=".85" fx=".5" fy=".92">
        <stop offset="0" stop-color="#fff7cf"/><stop offset=".3" stop-color="#ffd24f"/>
        <stop offset=".66" stop-color="#ff9320"/><stop offset="1" stop-color="#e2441b"/>
      </radialGradient>
      <linearGradient id="diyaFlameI" x1="0" x2="0" y1="1" y2="0">
        <stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#fff3b4"/><stop offset="1" stop-color="#ffd862"/>
      </linearGradient>
      <radialGradient id="diyaSheen" cx=".5" cy=".18" r=".7">
        <stop offset="0" stop-color="#ffe7a4" stop-opacity=".85"/><stop offset="1" stop-color="#ffe7a4" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="diyaFlash">
        <stop offset="0" stop-color="#ffffff"/><stop offset=".4" stop-color="#ffeaa2" stop-opacity=".85"/>
        <stop offset="1" stop-color="#ffb040" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="diyaSindoor" cx=".5" cy=".38" r=".65">
        <stop offset="0" stop-color="#d9482b"/><stop offset="1" stop-color="#7a1710"/>
      </radialGradient>
      <linearGradient id="diyaFadeL" x1="0" x2="1"><stop offset="0" stop-color="#e2bd66" stop-opacity="0"/><stop offset="1" stop-color="#e2bd66"/></linearGradient>
      <linearGradient id="diyaFadeR" x1="1" x2="0"><stop offset="0" stop-color="#e2bd66" stop-opacity="0"/><stop offset="1" stop-color="#e2bd66"/></linearGradient>
      <linearGradient id="diyaGadaG" x1="0" x2="1"><stop offset="0" stop-color="#9a6420"/><stop offset=".45" stop-color="#f4d68a"/><stop offset="1" stop-color="#a06a22"/></linearGradient>
    </defs></svg>`;
  }

  function lampSVG() {
    const sparks = Array.from({ length: 9 }, (_, k) => {
      const a = (-165 + k * (150 / 8)) * Math.PI / 180, d = 16 + (k % 3) * 7;
      return `<circle class="diya-spark" r="${(1.2 + (k % 2) * .7).toFixed(1)}" style="--dx:${(Math.cos(a) * d).toFixed(1)}px;--dy:${(Math.sin(a) * d).toFixed(1)}px"/>`;
    }).join('');
    const body = `
      <path d="M80 168 L72 186 Q100 193 128 186 L120 168 Z"/>
      <path d="M36 128 C38 158 68 176 100 176 C132 176 162 158 164 128 Z"/>
      <ellipse cx="100" cy="128" rx="64" ry="13"/>`;
    return `<svg class="diya-svg" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      <ellipse cx="100" cy="191" rx="50" ry="5" fill="#000" opacity=".4"/>
      <path d="M80 168 L72 186 Q100 193 128 186 L120 168 Z" fill="url(#diyaBrass)"/>
      <ellipse cx="100" cy="186.5" rx="27" ry="3.4" fill="url(#diyaRim)" opacity=".55"/>
      <path d="M36 128 C38 158 68 176 100 176 C132 176 162 158 164 128 Z" fill="url(#diyaBrass)"/>
      <path d="M44 145 C64 161 136 161 156 145" fill="none" stroke="#5a300a" stroke-width="1.1" opacity=".6"/>
      <path d="M47 151 C66 165.5 134 165.5 153 151" fill="none" stroke="#f8dc8e" stroke-width="2.3" stroke-dasharray="0 7.2" stroke-linecap="round" opacity=".75"/>
      <path d="M51 157 C69 170 131 170 149 157" fill="none" stroke="#5a300a" stroke-width="1.1" opacity=".6"/>
      <ellipse cx="100" cy="128" rx="64" ry="13" fill="url(#diyaRim)"/>
      <ellipse cx="100" cy="129" rx="55" ry="8.8" fill="url(#diyaOil)"/>
      <clipPath id="diyaBowlClip">${body}</clipPath>
      <ellipse class="diya-sheen" cx="100" cy="134" rx="66" ry="42" fill="url(#diyaSheen)" clip-path="url(#diyaBowlClip)"/>
      <g class="diya-shade" fill="#0d0304">${body}</g>
      <path d="M95 131 Q99 125 100 117" stroke="#3b1e0a" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path d="M100 117 l.4 -1.8" stroke="#140902" stroke-width="2.4" stroke-linecap="round"/>
      <g transform="translate(100 115)"><circle class="diya-flash" r="15" fill="url(#diyaFlash)"/>${sparks}</g>
      <g transform="translate(100 124)"><g class="diya-flame">
        <path class="diya-flame-o" d="M0 0 C-17 -3 -19 -26 -9 -44 C-4 -54 -1 -66 0 -82 C2 -66 5 -55 10 -44 C19 -27 17 -3 0 0Z" fill="url(#diyaFlameO)"/>
        <path class="diya-flame-i" d="M0 -3 C-8 -5 -9 -18 -5 -28 C-2 -35 -1 -43 0 -52 C1 -43 3 -35 5 -28 C9 -18 8 -5 0 -3Z" fill="url(#diyaFlameI)"/>
        <ellipse cx="0" cy="-7" rx="3.4" ry="5" fill="#86b8ff" opacity=".5"/>
      </g></g>
    </svg>`;
  }

  function bellSVG() {
    return `<svg viewBox="0 0 56 100" aria-hidden="true" focusable="false"><g class="diya-bell-swing">
      <line x1="28" y1="0" x2="28" y2="33" stroke="#c99a45" stroke-width="2.4" stroke-dasharray="4 2.6" stroke-linecap="round"/>
      <circle cx="28" cy="37" r="4.4" fill="none" stroke="#dcb35c" stroke-width="2"/>
      <path d="M28 41 C16 41 13 54 12 66 C11 74 7 78 4 82 L52 82 C49 78 45 74 44 66 C43 54 40 41 28 41Z" fill="url(#diyaBrass)"/>
      <path d="M14.5 62 H41.5" stroke="#5a300a" stroke-width="1" opacity=".55"/>
      <path d="M13.6 67 H42.4" stroke="#f8dc8e" stroke-width="1.8" stroke-dasharray="0 4.5" stroke-linecap="round" opacity=".75"/>
      <rect x="3" y="81" width="50" height="4.2" rx="2.1" fill="#a8722a"/>
      <line x1="28" y1="85" x2="28" y2="88" stroke="#a8722a" stroke-width="1.6"/>
      <circle cx="28" cy="91" r="4.2" fill="#d6a64e"/>
    </g></svg>`;
  }

  // A gada (Hanuman ji's mace) drawn head-up around (140,50), then laid flat: dir -1 points the head left.
  function gadaSVG(tx, dir) {
    return `<g transform="translate(${tx} 50) rotate(${dir * 90}) scale(.9) translate(-140 -50)">
      <path d="M140 3 L143.6 11.5 L136.4 11.5 Z" fill="#f0cd7c"/>
      <circle cx="140" cy="23" r="12" fill="url(#diyaGadaG)"/>
      <path d="M134 13.5 Q130.5 23 134 32.5 M140 11 V35 M146 13.5 Q149.5 23 146 32.5" fill="none" stroke="#6b3f12" stroke-width="1" opacity=".6"/>
      <rect x="134" y="34" width="12" height="4" rx="1.6" fill="#e2bd66"/>
      <rect x="138" y="38" width="4" height="50" rx="2" fill="url(#diyaGadaG)"/>
      <path d="M137.6 76 H142.4 M137.6 80 H142.4" stroke="#6b3f12" stroke-width="1" opacity=".6"/>
      <circle cx="140" cy="91.5" r="4" fill="#e2bd66"/>
    </g>`;
  }

  // Hanuman ji seated in dhyana under a peepal tree (after the devotional painting), drawn as a monochrome
  // brass relief: gold/brown tones only. The tree has a bark trunk lit from behind, tapered limbs, roots on the
  // ground and peepal leaves (broad base, long drip tip, veins) hanging on twigs, brightest near the trunk; a
  // darker back layer gives depth, with soft rays and specks of light. Seeded, so every render is the same.
  // Temple-style stepped mukut, tilak, kundal, malas, janeu and kamarbandh; tail rising at his right, ornate
  // gada resting at his left.
  function hanumanSVG() {
    const C = { d0: '#3d1f08', d1: '#5a3410', d2: '#7a4c18', m1: '#a87428', m2: '#c9933a', l1: '#e6bd68', l2: '#f6d98e', h: '#fff0c2' };
    // Peepal leaf: petiole at the origin, broad rounded base, long drip tip pointing down (+y).
    const LEAF = 'M0 0 C-2 -.6 -6.5 .8 -6.8 5 C-7 8.6 -4.4 11.6 -1.6 14.6 C-.8 15.6 -.3 17.5 0 21 C.3 17.5 .8 15.6 1.6 14.6 C4.4 11.6 7 8.6 6.8 5 C6.5 .8 2 -.6 0 0Z';
    const VEINS = 'M0 .6 V17 M0 4 L-4.4 6 M0 4 L4.4 6 M0 7.6 L-3.8 9.6 M0 7.6 L3.8 9.6 M0 11 L-2.4 12.6 M0 11 L2.4 12.6';
    let seed = 23;
    const rnd = (a, b) => { seed = (seed * 9301 + 49297) % 233280; return a + (b - a) * seed / 233280; };
    const leaf = (x, y, rot, s, fill, vein) =>
      `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(0)}) scale(${s.toFixed(2)})">` +
      `<path d="M0 0 V-3.4" stroke="${fill}" stroke-width="1.2"/><path d="${LEAF}" fill="${fill}"/>` +
      `<path d="${VEINS}" stroke="${vein}" stroke-width=".55" fill="none"/></g>`;
    // Leaves stay clear of the halo, the mukut spire and the shoulders.
    const clear = (x, y) => Math.hypot(x - 100, y - 74) < 31 || (Math.abs(x - 100) < 17 && y > 20) || (y > 84 && Math.abs(x - 100) < 50) || y < 3;
    // Cubic bezier p = [x0,y0, x1,y1, x2,y2, x3,y3]: point and unit normal at t.
    const bz = (p, t) => {
      const u = 1 - t;
      const x = u * u * u * p[0] + 3 * u * u * t * p[2] + 3 * u * t * t * p[4] + t * t * t * p[6];
      const y = u * u * u * p[1] + 3 * u * u * t * p[3] + 3 * u * t * t * p[5] + t * t * t * p[7];
      const dx = 3 * u * u * (p[2] - p[0]) + 6 * u * t * (p[4] - p[2]) + 3 * t * t * (p[6] - p[4]);
      const dy = 3 * u * u * (p[3] - p[1]) + 6 * u * t * (p[5] - p[3]) + 3 * t * t * (p[7] - p[5]);
      const l = Math.hypot(dx, dy) || 1;
      return [x, y, -dy / l, dx / l];
    };
    // A branch as a tapered filled shape, with a thin lit edge along its top.
    function limb(p, w0, w1) {
      const L = [], R = [], hi = [];
      for (let i = 0; i <= 16; i++) {
        const t = i / 16, [x, y, nx, ny] = bz(p, t), w = (w0 + (w1 - w0) * t) / 2;
        L.push(`${(x + nx * w).toFixed(1)} ${(y + ny * w).toFixed(1)}`);
        R.unshift(`${(x - nx * w).toFixed(1)} ${(y - ny * w).toFixed(1)}`);
        const s = ny < 0 ? .5 : -.5;
        hi.push(`${(x + nx * w * s).toFixed(1)} ${(y + ny * w * s).toFixed(1)}`);
      }
      return `<path d="M${L.join(' L')} L${R.join(' L')}Z" fill="url(#diyaHmBark)"/>` +
        `<path d="M${hi.join(' L')}" fill="none" stroke="${C.m2}" stroke-width="${Math.max(.3, w1 * .35).toFixed(2)}" opacity=".55"/>`;
    }
    const mirrorP = p => p.map((v, i) => (i % 2 ? v : 200 - v));
    // Left half of the crown; the right half mirrors it. [bezier, base width, tip width]
    const BRANCHES = [
      [[88, 38, 79, 28, 60, 21, 32, 25], 12, 3.2],
      [[32, 25, 22, 26, 13, 32, 6, 42], 3.2, .9],
      [[62, 23, 57, 15, 49, 9, 39, 5], 2.6, .8],
      [[50, 23.6, 42, 29, 36, 37, 32, 47], 2.4, .8],
      [[85, 41, 76, 43, 66, 48, 58, 57], 3.6, 1],
      [[74, 27, 70, 20, 64, 14, 58, 12], 1.8, .6],
      [[24, 27, 20, 20, 14, 16, 8, 15], 1.4, .5],
      [[99, 35, 98.6, 26, 98, 17, 92, 8], 6, 1.4],
      [[96, 18, 90, 12, 82, 8, 72, 6], 2, .6],
    ];
    const branchSet = BRANCHES.flatMap(([p, a, b]) => [[p, a, b], [mirrorP(p), a, b]]);
    // Leaves hang on short twigs along every branch, brightest near the glowing trunk.
    function twigLeaves() {
      let tw = '', lv = '';
      for (const [p] of branchSet) {
        const len = Math.hypot(p[6] - p[0], p[7] - p[1]), n = Math.max(3, Math.round(len / 6));
        for (let i = 0; i < n; i++) {
          const [x, y] = bz(p, .18 + .82 * (i + rnd(.1, .9)) / n);
          for (let k = rnd(0, 1) < .4 ? 2 : 1; k > 0; k--) {
            const ex = x + rnd(-5, 5), ey = y + rnd(2.5, 8.5);
            if (clear(ex, ey)) continue;
            tw += `M${x.toFixed(1)} ${y.toFixed(1)} Q${(x + (ex - x) * .2).toFixed(1)} ${((y + ey) / 2).toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)} `;
            const d = Math.hypot(ex - 100, (ey - 30) * 1.3);
            const tones = d < 42 ? [C.l2, C.l1, C.l1, C.m2] : d < 72 ? [C.l1, C.m2, C.m2, C.m1] : [C.m2, C.m1, C.m1, C.d2];
            const f = tones[Math.floor(rnd(0, 4))];
            lv += leaf(ex, ey, (ex - x) * -3 + rnd(-22, 22), rnd(.38, .54), f, f === C.d2 || f === C.m1 ? C.l1 : C.d1);
          }
        }
      }
      return `<path d="${tw}" fill="none" stroke="${C.d1}" stroke-width=".45"/>${lv}`;
    }
    function backLeaves(n) {
      let out = '';
      for (let i = 0; i < n; i++) {
        const a = rnd(198, 342) * Math.PI / 180, r = rnd(38, 90);
        const x = 100 + Math.cos(a) * r * 1.06, y = 92 + Math.sin(a) * r * .95;
        if (clear(x, y)) continue;
        out += leaf(x, y, (100 - x) * .4 + rnd(-25, 25), rnd(.38, .54), rnd(0, 1) < .5 ? C.d1 : C.d2, C.m1);
      }
      return out;
    }
    const rays = Array.from({ length: 15 }, (_, i) => {
      const a = (-172 + i * 164 / 14 + rnd(-3, 3)) * Math.PI / 180, w = rnd(.025, .05), L = 150;
      const p = (s) => `${(100 + Math.cos(a + s) * L).toFixed(1)} ${(64 + Math.sin(a + s) * L).toFixed(1)}`;
      return `M100 64 L${p(-w)} L${p(w)}Z`;
    }).join(' ');
    const specks = Array.from({ length: 34 }, () => {
      const x = rnd(8, 192), y = rnd(10, 160);
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rnd(.3, .8).toFixed(2)}" opacity="${rnd(.25, .8).toFixed(2)}"/>`;
    }).join('');
    const ROOTS = [
      [[86, 154, 74, 158, 56, 163, 32, 169], 5.4, .7],
      [[90, 160, 82, 165, 68, 170, 50, 174], 4, .6],
      [[88, 146, 78, 148, 66, 152, 56, 158], 3.4, .6],
    ];
    const roots = ROOTS.map(([p, a, b]) => limb(p, a, b) + limb(mirrorP(p), a, b)).join('');
    const back = backLeaves(70);
    const branches = branchSet.map(([p, a, b]) => limb(p, a, b)).join('');
    const front = twigLeaves();
    const fallen = Array.from({ length: 16 }, (_, i) => {
      const x = i < 8 ? rnd(14, 60) : rnd(140, 188), y = rnd(168, 178);
      return leaf(x, y, rnd(60, 120) * (rnd(0, 1) < .5 ? 1 : -1), rnd(.32, .44), [C.m1, C.m2, C.d2, C.l1][Math.floor(rnd(0, 4))], C.d1);
    }).join('');
    const ln = (d, w, o) => `<path d="${d}" fill="none" stroke="${C.d0}" stroke-width="${w || .8}"${o ? ` opacity="${o}"` : ''}/>`;
    const gold = (d, w) => `<path d="${d}" fill="none" stroke="url(#diyaHmGold)" stroke-width="${w || 1.4}" stroke-linecap="round"/>`;
    const mirror = s => `<g transform="translate(200 0) scale(-1 1)">${s}</g>`;

    const hair = `<path d="M88.6 66 C85 70.4 84 78.4 84.6 86 C85 90.4 84 94 81.6 97.4 C86 96.6 88.8 93.2 89.6 89 C89.2 84 89.4 79 90 76 Z" fill="${C.d1}"/>`;
    const ear = `<path d="M89.4 71.4 C86 70.2 84.6 75 87.8 77.6 C88.6 78 89.2 77.8 89.6 77.2 Z" fill="url(#diyaHmSkin)" stroke="${C.d0}" stroke-width=".6"/>` +
      `<circle cx="87.2" cy="81" r="2.5" fill="url(#diyaHmGold)" stroke="${C.d1}" stroke-width=".5"/><circle cx="87.2" cy="81" r="1" fill="${C.d1}"/>` +
      `<path d="M87.2 83.6 C86 85.4 86.2 86.8 87.2 87.6 C88.2 86.8 88.4 85.4 87.2 83.6Z" fill="url(#diyaHmGold)"/>`;
    const crownWing = `<path d="M88.2 64.6 C85 64.8 82.8 67 82.8 70.6 C84.2 69.4 85.8 69 87.6 69.4 C87.2 67.8 87.6 66 88.2 64.6Z" fill="url(#diyaHmGold)" stroke="${C.d1}" stroke-width=".5"/>` +
      `<circle cx="83.4" cy="71.6" r=".9" fill="url(#diyaHmGold)"/>`;
    const arm = `<path d="M71.4 122.4 C72.4 130 77.6 135 85 137.6 L91.6 139.6 C93 137 92.4 134.2 90.4 133.4 L85 131.4 C81 129.8 78.8 127.6 78 124.8Z" fill="url(#diyaHmSkin)" stroke="${C.d0}" stroke-width=".7"/>` +
      `<path d="M84 97.2 C78 96.8 72.6 99.6 71.2 105 C70.4 108.6 71.8 111.4 72 114 C72.2 117 70.8 120 71.4 123.4 C72 127 74.6 129.4 78 129 C80.2 125 81 119.6 81.6 114.4 C82 110 82.6 106.4 83 104Z" fill="url(#diyaHmSkin)" stroke="${C.d0}" stroke-width=".7"/>` +
      gold('M71.8 110.6 C74.8 112.6 79.4 112.6 82.6 110.6', 2.2) + `<path d="M77.2 108.6 L78.6 111.4 L75.8 111.4Z" fill="${C.h}"/>` +
      gold('M86.6 131.8 L85.2 138', 2.4) + ln('M75 101 C78 102.6 80.6 105 81.6 108', .6, .55);
    const scarf = `<path d="M81 98.6 C70.4 103.6 64.4 115.6 62.6 128 C61.2 138 56.4 146.6 47.4 152.6 C53.6 153.4 58 151 61.8 147 C63.8 152.6 66.4 156 70.4 157 C68.4 148.4 68.2 138.4 70.4 128.4 C71.8 120.4 73.6 112.4 77 106.4Z" fill="url(#diyaHmCloth)" stroke="${C.l1}" stroke-width=".6" stroke-opacity=".7"/>` +
      ln('M69 120 C66.6 130 65.4 140 61.8 147', .5, .5);
    const foot = `<path d="M89 152.4 C87 149 82 147.4 76 147.6 C71.6 147.8 67.6 148.6 66.6 150.8 C66 152.8 68.4 154.4 72 154.8 C78 155.6 84.6 155.4 89 152.4Z" fill="url(#diyaHmSkin)" stroke="${C.d0}" stroke-width=".7"/>` +
      ln('M69.4 148.6 C68.6 149.4 68.6 150.2 69.2 150.8 M68.4 151 C67.8 151.8 68 152.6 68.8 153.2 M71.6 148.2 C70.8 149 70.8 149.8 71.4 150.4', .45, .8) +
      ln('M74 151.4 C78 150.4 82.4 150.6 86 151.8', .45, .4);

    return `<svg class="diya-hmn-svg" viewBox="0 0 200 186" role="img" aria-label="${Invite.lang === 'hi' ? 'पीपल के नीचे ध्यानमग्न श्री हनुमान जी' : 'Shri Hanuman ji in meditation under a peepal tree'}" focusable="false" stroke-linecap="round" stroke-linejoin="round">
    <defs>
      <radialGradient id="diyaHmGlow" cx=".5" cy=".42" r=".5"><stop offset="0" stop-color="#ffd27a" stop-opacity=".42"/><stop offset=".55" stop-color="#f59a32" stop-opacity=".12"/><stop offset="1" stop-color="#f59a32" stop-opacity="0"/></radialGradient>
      <radialGradient id="diyaHmHalo"><stop offset="0" stop-color="${C.h}" stop-opacity=".6"/><stop offset=".7" stop-color="${C.l1}" stop-opacity=".22"/><stop offset="1" stop-color="${C.l1}" stop-opacity=".06"/></radialGradient>
      <radialGradient id="diyaHmRay" gradientUnits="userSpaceOnUse" cx="100" cy="64" r="64"><stop offset="0" stop-color="#ffd27a" stop-opacity=".2"/><stop offset=".6" stop-color="#ffd27a" stop-opacity=".07"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>
      <linearGradient id="diyaHmSkin" x1="0" x2="1"><stop offset="0" stop-color="#9c6420"/><stop offset=".35" stop-color="#e2b660"/><stop offset=".55" stop-color="#f8dc96"/><stop offset=".8" stop-color="#d9a84e"/><stop offset="1" stop-color="#94601f"/></linearGradient>
      <linearGradient id="diyaHmCloth" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#b07a2c"/><stop offset="1" stop-color="#6b4216"/></linearGradient>
      <linearGradient id="diyaHmDhoti" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#c9933a"/><stop offset="1" stop-color="#8a5a1c"/></linearGradient>
      <linearGradient id="diyaHmGold" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${C.h}"/><stop offset="1" stop-color="#d9a84e"/></linearGradient>
      <linearGradient id="diyaHmTrunkLit" x1="0" x2="1"><stop offset="0" stop-color="#ffd27a" stop-opacity="0"/><stop offset=".5" stop-color="#ffd27a" stop-opacity=".38"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></linearGradient>
      <linearGradient id="diyaHmBark" x1="0" x2="1"><stop offset="0" stop-color="${C.d1}"/><stop offset=".5" stop-color="${C.d2}"/><stop offset="1" stop-color="#4a2a0c"/></linearGradient>
      <radialGradient id="diyaHmGadaHead" cx=".36" cy=".3" r=".75"><stop offset="0" stop-color="${C.h}"/><stop offset=".45" stop-color="#d9a84e"/><stop offset="1" stop-color="${C.d2}"/></radialGradient>
      <linearGradient id="diyaHmShaft" x1="0" x2="1"><stop offset="0" stop-color="${C.d2}"/><stop offset=".5" stop-color="#f0cd7c"/><stop offset="1" stop-color="#8a5a1c"/></linearGradient>
    </defs>
    <ellipse cx="100" cy="88" rx="98" ry="86" fill="url(#diyaHmGlow)"/>
    <path class="diya-hmn-rays" d="${rays}" fill="url(#diyaHmRay)"/>
    <g class="diya-hmn-leaves">${back}</g>
    <g class="diya-hmn-tree">
      <path d="M78 170 C85 160 87 140 87.6 118 C88.2 96 86 76 83 60 C81 50 80.4 41 82.6 33 H117.4 C119.6 41 119 50 117 60 C114 76 111.8 96 112.4 118 C113 140 115 160 122 170Z" fill="url(#diyaHmBark)"/>
      <path d="M78 170 C85 160 87 140 87.6 118 C88.2 96 86 76 83 60 C81 50 80.4 41 82.6 33 H117.4 C119.6 41 119 50 117 60 C114 76 111.8 96 112.4 118 C113 140 115 160 122 170Z" fill="url(#diyaHmTrunkLit)"/>
      <path d="M85.6 40 C84.6 50 86.4 60 87.4 70 M89.6 36 C88.8 46 90.4 56 89.8 66 M95 34 C94 44 95.4 54 94.6 64 M105 34 C106 44 104.6 54 105.4 64 M110.4 36 C111.2 46 109.6 56 110.2 66 M114.4 40 C115.4 50 113.6 60 112.6 70 M100 34 C100.6 40 99.6 46 100.2 52" fill="none" stroke="${C.d0}" stroke-width=".7" opacity=".55"/>
      ${branches}
    </g>
    <path d="M10 167.6 C58 164.6 142 164.6 190 167.6" fill="none" stroke="${C.m1}" stroke-width="1.2"/>
    <path d="M24 170.4 C60 168.6 140 168.6 176 170.4" fill="none" stroke="${C.d2}" stroke-width=".8"/>
    <g class="diya-hmn-roots">${roots}</g>
    <g class="diya-hmn-leaves-front">${front}</g>
    <g class="diya-hmn-specks" fill="${C.h}">${specks}</g>
    <circle cx="100" cy="74" r="24" fill="url(#diyaHmHalo)" stroke="${C.l1}" stroke-width="1.1"/>
    <circle cx="100" cy="74" r="27.4" fill="none" stroke="${C.l2}" stroke-width="1.3" stroke-dasharray="0 3.6" opacity=".85"/>
    <path class="diya-hmn-tail" d="M70 160 C54 160 42 150 40 136 C38.4 124 44 114 45 104 C45.6 97 42 92.6 37.6 93.6 C34.6 94.4 34.4 98 37 98.6" fill="none" stroke="url(#diyaHmShaft)" stroke-width="3.4"/>
    ${scarf}${mirror(scarf)}
    <g class="diya-hmn-gada" transform="translate(160 117.6) rotate(9)">
      <rect x="-1.9" y="9" width="3.8" height="40" rx="1.6" fill="url(#diyaHmShaft)"/>
      <path d="M-2.2 18 H2.2 M-2.2 21 H2.2 M-2.2 32 H2.2 M-2.2 34.6 H2.2 M-2.2 37.2 H2.2 M-2.2 39.8 H2.2 M-2.2 42.4 H2.2" stroke="${C.d1}" stroke-width=".7"/>
      <circle cx="0" cy="50.6" r="2.8" fill="url(#diyaHmGadaHead)"/>
      <path d="M-4.4 8.4 H4.4 L3.2 12.4 H-3.2Z" fill="url(#diyaHmGold)" stroke="${C.d1}" stroke-width=".5"/>
      <path d="M-3 12.4 C-3 15 -1.6 16.6 0 17.4 C1.6 16.6 3 15 3 12.4" fill="url(#diyaHmGold)" stroke="${C.d1}" stroke-width=".5"/>
      <circle cx="0" cy="0" r="10.6" fill="url(#diyaHmGadaHead)" stroke="${C.d1}" stroke-width=".6"/>
      <path d="M-6 -8.4 C-9.6 -3 -9.6 3 -6 8.4 M0 -10.6 V10.6 M6 -8.4 C9.6 -3 9.6 3 6 8.4 M-3.2 -10 C-5 -4 -5 4 -3.2 10 M3.2 -10 C5 -4 5 4 3.2 10" fill="none" stroke="${C.d1}" stroke-width=".6" opacity=".75"/>
      <ellipse cx="0" cy="0" rx="10.6" ry="2.6" fill="none" stroke="${C.h}" stroke-width="1.2"/>
      <path d="M-10.4 0 H10.4" stroke="${C.d1}" stroke-width="1.4" stroke-dasharray="0 2.4" stroke-linecap="round"/>
      <path d="M-3.4 -9.8 H3.4 L2.4 -12.6 H-2.4Z" fill="url(#diyaHmGold)" stroke="${C.d1}" stroke-width=".5"/>
      <path d="M0 -21 C2 -17.6 2.6 -14.8 2.2 -12.6 H-2.2 C-2.6 -14.8 -2 -17.6 0 -21Z" fill="url(#diyaHmGold)" stroke="${C.d1}" stroke-width=".5"/>
    </g>
    <g class="diya-hmn-figure">
      <path d="M85 134 C73 137 62 144 57 152 C53.6 158 57 164.6 66 165.4 H134 C143 164.6 146.4 158 143 152 C138 144 127 137 115 134Z" fill="url(#diyaHmDhoti)" stroke="${C.d0}" stroke-width=".8"/>
      <path d="M60.4 159 C76 163 124 163 139.6 159" fill="none" stroke="${C.l2}" stroke-width="1.2" stroke-dasharray="0 2.6"/>
      ${ln('M96 141 L93.6 164 M100 141.6 V164.6 M104 141 L106.4 164 M66 150 C76 146 86 144 94 143.4 M134 150 C124 146 114 144 106 143.4', .6, .55)}
      ${foot}${mirror(foot)}
      ${hair}${mirror(hair)}
      <path d="M95 89 V95.6 H105 V89" fill="url(#diyaHmSkin)"/>
      <path d="M95 94 C90 94.6 85 95.6 82 97.6 C80.6 104 81 112 83.6 120 C85 125 86 129 86.4 133 H113.6 C114 129 115 125 116.4 120 C119 112 119.4 104 118 97.6 C115 95.6 110 94.6 105 94Z" fill="url(#diyaHmSkin)" stroke="${C.d0}" stroke-width=".7"/>
      ${ln('M85.4 109.4 C90 113.2 96 113.4 99.4 110.6 M114.6 109.4 C110 113.2 104 113.4 100.6 110.6 M100 114 V127 M95.4 118.6 C97 119.4 98.4 119.4 99.4 118.8 M104.6 118.6 C103 119.4 101.6 119.4 100.6 118.8 M95.6 123.4 C97 124 98.4 124 99.4 123.6 M104.4 123.4 C103 124 101.6 124 100.6 123.6', .6, .55)}
      <circle cx="100" cy="129" r=".9" fill="${C.d0}"/>
      ${arm}${mirror(arm)}
      <path d="M85.4 130.8 C95 133.4 105 133.4 114.6 130.8 L115 135 C105 137.6 95 137.6 85 135Z" fill="url(#diyaHmGold)" stroke="${C.d1}" stroke-width=".5"/>
      <path d="M87 133 C95 135.2 105 135.2 113 133" fill="none" stroke="${C.d1}" stroke-width="1" stroke-dasharray="0 2.2" stroke-linecap="round"/>
      <path d="M90.4 136 C93 133.4 107 133.4 109.6 136 C110 139.8 104.6 141.8 100 141.8 C95.4 141.8 90 139.8 90.4 136Z" fill="url(#diyaHmSkin)" stroke="${C.d0}" stroke-width=".7"/>
      ${ln('M92.4 137.6 C95 138.8 105 138.8 107.6 137.6 M95.6 136 C97 134 99 133.6 100 134.6 C101 133.6 103 134 104.4 136 M94.4 138.4 V140.6 M97.2 138.9 V141.4 M100 139 V141.6 M102.8 138.9 V141.4 M105.6 138.4 V140.6', .5, .7)}
      ${gold('M94.6 95.8 C97 98.4 103 98.4 105.4 95.8', 1.8)}
      <path d="M88 97 C89 112.6 111 112.6 112 97" fill="none" stroke="url(#diyaHmGold)" stroke-width="2.2" stroke-dasharray="0 2.7" stroke-linecap="round"/>
      ${gold('M91 97 C93 105.4 107 105.4 109 97', 1.1)}
      <path d="M100 104.4 L102.6 107.6 L100 111.4 L97.4 107.6Z" fill="url(#diyaHmGold)" stroke="${C.d1}" stroke-width=".5"/>
      ${gold('M114 97.6 C108 108 96 121 86.4 131', .9)}
      <path d="M89.4 67.6 C88.4 72 88.6 76 89.8 79.4 C88.6 83 89.8 88 94 90.6 C96.4 92 103.6 92 106 90.6 C110.2 88 111.4 83 110.2 79.4 C111.4 76 111.6 72 110.6 67.6Z" fill="url(#diyaHmSkin)" stroke="${C.d0}" stroke-width=".7"/>
      ${ear}${mirror(ear)}
      <path d="M92.2 79 C91.4 84.2 94.4 89.8 100 89.8 C105.6 89.8 108.6 84.2 107.8 79 C105.2 77.4 102.4 78.4 100 79.8 C97.6 78.4 94.8 77.4 92.2 79Z" fill="${C.l2}" opacity=".85"/>
      ${ln('M92.6 74.4 C94.2 76 96.4 76 97.8 74.6 M102.2 74.6 C103.6 76 105.8 76 107.4 74.4', 1)}
      ${ln('M92.8 73 C94.4 72.2 96.4 72.2 97.6 73 M102.4 73 C103.6 72.2 105.6 72.2 107.2 73', .5, .5)}
      ${ln('M91.4 71.2 C93.4 69.6 96.4 69.6 98 70.8 M102 70.8 C103.6 69.6 106.6 69.6 108.6 71.2', 1.1)}
      <path d="M98.4 71.8 C98.2 69.6 98.4 68.6 98.8 67.8 H101.2 C101.6 68.6 101.8 69.6 101.6 71.8 C100.8 72.4 99.2 72.4 98.4 71.8Z" fill="${C.h}" stroke="${C.d1}" stroke-width=".4"/>
      <path d="M100 68.2 V71.6" stroke="${C.d0}" stroke-width="1.1"/>
      ${ln('M98.2 79.8 C99 81 101 81 101.8 79.8', .8)}
      <circle cx="98.9" cy="80.6" r=".45" fill="${C.d0}"/><circle cx="101.1" cy="80.6" r=".45" fill="${C.d0}"/>
      ${ln('M96 85.4 C98.4 87 101.6 87 104 85.4', .9)}${ln('M95.4 84.8 L96.2 85.8 M104.6 84.8 L103.8 85.8', .6)}
      ${ln('M93 82.6 C93.6 84.6 94.6 86 96 87', .5, .45)}${ln('M107 82.6 C106.4 84.6 105.4 86 104 87', .5, .45)}
      ${crownWing}${mirror(crownWing)}
      <path d="M88 63.4 L87.4 58.6 C88.4 57.8 89 57.8 89.4 58.2 L89.2 52.8 C90.4 52 91.4 52 92 52.6 L92.2 47.2 C93.4 46.4 94.4 46.4 95 47 L95.4 42.6 C96.6 41.8 97.6 41.6 98.2 42 L100 35.6 L101.8 42 C102.4 41.6 103.4 41.8 104.6 42.6 L105 47 C105.6 46.4 106.6 46.4 107.8 47.2 L108 52.6 C108.6 52 109.6 52 110.8 52.8 L110.6 58.2 C111 57.8 111.6 57.8 112.6 58.6 L112 63.4 C106.6 61.8 93.4 61.8 88 63.4Z" fill="url(#diyaHmGold)" stroke="${C.d1}" stroke-width=".6"/>
      <path d="M88.6 58.6 C96 57.4 104 57.4 111.4 58.6 M90.4 52.8 C96.4 51.8 103.6 51.8 109.6 52.8 M93.2 47.2 C97.4 46.4 102.6 46.4 106.8 47.2 M96.4 42.6 C98.8 42 101.2 42 103.6 42.6" fill="none" stroke="${C.d1}" stroke-width=".9" stroke-dasharray="0 1.7"/>
      <path d="M93.6 62.2 C93.6 57.4 96.6 53.2 100 50 C103.4 53.2 106.4 57.4 106.4 62.2 C102 61.6 98 61.6 93.6 62.2Z" fill="${C.h}" stroke="${C.d1}" stroke-width=".55"/>
      <path d="M100 53.6 L102.2 57 L100 60.4 L97.8 57Z" fill="${C.d2}"/>
      <circle cx="100" cy="57" r=".7" fill="${C.h}"/>
      <path d="M95.4 61.6 C95.8 59 97 57 98 56 M104.6 61.6 C104.2 59 103 57 102 56" fill="none" stroke="${C.d1}" stroke-width=".45" opacity=".7"/>
      <path d="M87.4 67.6 C93 65.6 107 65.6 112.6 67.6 L112.2 63.4 C106.6 61.8 93.4 61.8 87.8 63.4Z" fill="url(#diyaHmGold)" stroke="${C.d1}" stroke-width=".6"/>
      <g fill="${C.d2}"><circle cx="91" cy="65.2" r=".8"/><circle cx="95.4" cy="64.6" r=".8"/><circle cx="100" cy="64.4" r="1.1"/><circle cx="104.6" cy="64.6" r=".8"/><circle cx="109" cy="65.2" r=".8"/></g>
      <circle cx="100" cy="34" r="1.6" fill="url(#diyaHmGold)" stroke="${C.d1}" stroke-width=".4"/>
      <path d="M100 28.4 C101 30 101.2 31.4 100.8 32.4 H99.2 C98.8 31.4 99 30 100 28.4Z" fill="${C.h}"/>
    </g>
    <g>${fallen}</g>
  </svg>`;
  }

  function hanumanMotif() {
    return `<div class="diya-hmn">${hanumanSVG()}</div>`;
  }

  function motifSVG(isSK) {
    if (isSK) return hanumanMotif();
    const word = 'श्री';
    const sides = isSK
      ? `<path d="M0 50 H24" stroke="url(#diyaFadeL)" stroke-width="1.2"/><path d="M276 50 H300" stroke="url(#diyaFadeR)" stroke-width="1.2"/>
         ${gadaSVG(70, -1)}${gadaSVG(230, 1)}`
      : `<path d="M10 50 H106" stroke="url(#diyaFadeL)" stroke-width="1.2"/><path d="M194 50 H290" stroke="url(#diyaFadeR)" stroke-width="1.2"/>
         <circle cx="108" cy="50" r="1.8" fill="#e2bd66"/><circle cx="192" cy="50" r="1.8" fill="#e2bd66"/>`;
    return `<svg viewBox="0 0 300 100" role="img" aria-label="${word}" focusable="false">
      ${sides}
      <circle cx="150" cy="50" r="36" fill="none" stroke="#e2bd66" stroke-width="2.4" stroke-dasharray="0 6.6" stroke-linecap="round" opacity=".85"/>
      <circle cx="150" cy="50" r="31" fill="#2a080b" stroke="#e2bd66" stroke-width="1.5"/>
      <circle cx="150" cy="50" r="27" fill="url(#diyaSindoor)"/>
      <circle cx="150" cy="50" r="24" fill="none" stroke="#f3cf7a" stroke-width=".8" opacity=".6"/>
      <text x="150" y="59" text-anchor="middle" class="diya-motif-word">${word}</text>
    </svg>`;
  }

  function dividerSVG() {
    return `<svg viewBox="0 0 220 18" aria-hidden="true" focusable="false">
      <path d="M0 9 H92" stroke="url(#diyaFadeL)" stroke-width="1"/><path d="M128 9 H220" stroke="url(#diyaFadeR)" stroke-width="1"/>
      <circle cx="97" cy="9" r="1.6" fill="#e2bd66"/><circle cx="123" cy="9" r="1.6" fill="#e2bd66"/>
      <path d="M110 1.5 L117.5 9 L110 16.5 L102.5 9 Z" fill="none" stroke="#e2bd66" stroke-width="1"/>
      <path d="M110 5.5 L113.5 9 L110 12.5 L106.5 9 Z" fill="#f59a32"/>
    </svg>`;
  }

  function cornerSVG(pos) {
    return `<svg class="diya-corner diya-corner-${pos}" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <path d="M1.5 39 V15 Q1.5 1.5 15 1.5 H39" fill="none" stroke="currentColor" stroke-width="1.2"/>
      <path d="M7 39 V19 Q7 7 19 7 H39" fill="none" stroke="currentColor" stroke-width=".8" opacity=".65"/>
      <path d="M13 22 Q13 13 22 13" fill="none" stroke="currentColor" stroke-width=".9" opacity=".8"/>
      <circle cx="13" cy="13" r="2.2" fill="#f59a32"/>
    </svg>`;
  }

  const PETAL = '<svg viewBox="0 0 20 28" aria-hidden="true"><path d="M10 1 C16 6 18 17 10 27 C2 17 4 6 10 1Z" fill="currentColor"/><path d="M10 4 V24" stroke="rgba(110,36,0,.35)" stroke-width=".8"/></svg>';

  /* ---------- variant ---------- */
  Invite.register('diya', {
    render(root, ctx) {
      const esc = ctx.esc, P = ctx.P, T = ctx.T;
      const tr = ctx.t, HI = ctx.hi;   // Hindi version (?lang=hi)
      const isSK = ctx.events.some(e => e.id === 'sunderkand');
      const rm = ctx.reducedMotion;
      const auto = !ctx.isStatic && /[?&]auto=1(&|$)/.test(location.search);
      const verse = (isSK ? T.sunderkand : T.ganesh).split('\n');
      const embers = [[-14, 3.6, 0], [10, 4.4, 1.2], [-6, 3.9, 2.1], [16, 4.8, .6], [-10, 4.1, 2.9], [6, 3.4, 1.7]]
        .map(([dx, t, d]) => `<i style="--dx:${dx}px;--t:${t}s;--d:${d}s"></i>`).join('');
      let n = 0;
      const rv = () => `diya-rv" style="--i:${n++}`;

      const cls = ['diya-root'];
      if (rm) cls.push('is-rm');
      if (ctx.isStatic) cls.push('is-instant', 'is-lit', 'is-revealed', 'is-unveiled');

      root.innerHTML = `
        <div class="${cls.join(' ')}">
          ${defsSVG()}
          <div class="diya-bg" aria-hidden="true"></div>
          <div class="diya-bg diya-bg-lit" aria-hidden="true"></div>
          <div class="diya-light" aria-hidden="true"><div class="diya-wave"></div></div>
          <div class="diya-petals" aria-hidden="true"></div>
          <section class="diya-hero">
            <button class="diya-bell" type="button" aria-label="${tr('Ring the temple bell', 'मंदिर की घंटी बजाएँ')}">${bellSVG()}</button>
            <p class="diya-kicker" lang="hi">सादर आमंत्रण</p>
            <h1 class="diya-greet">${esc(ctx.greeting)}</h1>
            <button class="diya-lamp" type="button" aria-label="${tr('Light the diya', 'दीया जलाएँ')}">
              <span class="diya-glow" aria-hidden="true"></span>
              ${lampSVG()}
              <span class="diya-embers" aria-hidden="true">${embers}</span>
            </button>
            <p class="diya-hint">${tr('Tap to light the diya 🪔', 'दीया जलाने के लिए टैप करें 🪔')}</p>
            <button class="diya-skip" type="button">${tr('Skip to details', 'सीधे विवरण देखें')}</button>
          </section>
          <section class="diya-card" aria-label="${tr('Invitation', 'निमंत्रण')}">
            <div class="diya-sheet">
              ${cornerSVG('tl')}${cornerSVG('tr')}${cornerSVG('bl')}${cornerSVG('br')}
              <p class="diya-ganesh ${rv()}" lang="hi">${esc(T.ganeshShort)}</p>
              ${(Invite.art && Invite.art.ganesh) ? `<div class="diya-ganesh-art ${rv()}">${Invite.art.ganesh({ size: 46, className: 'diya-gn' })}</div>` : ''}
              <div class="diya-motif ${rv()}">${motifSVG(isSK)}</div>
              <blockquote class="diya-verse ${rv()}" lang="hi">
                ${verse.map(l => `<span>${esc(l)}</span>`).join('')}
                ${isSK ? '<cite>श्री रामचरितमानस · सुंदरकांड</cite>' : ''}
              </blockquote>
              <div class="diya-div ${rv()}">${dividerSVG()}</div>
              <h2 class="diya-title ${rv()}">${esc(ctx.occasion.title)}${HI ? '' : `<span lang="hi">${esc(ctx.occasion.titleHi)}</span>`}</h2>
              ${P.blessings ? `<p class="diya-bless ${rv()}">${HI ? `${esc(P.blessings)} के आशीर्वाद से` : `With the blessings of ${esc(P.blessings)}`}</p>` : ''}
              <p class="diya-hosts ${rv()}">${esc(P.groomParents)}</p>
              <p class="diya-line ${rv()}">${esc(ctx.occasion.line)}</p>
              <p class="diya-couple ${rv()}"><span>${esc(P.groom)}</span><em>${tr('with', 'संग')}</em><span>${esc(P.bride)}</span></p>
              <p class="diya-bride ${rv()}">${tr('Daughter of', 'सुपुत्री')} ${esc(P.brideParents)}</p>
              <div class="diya-div diya-mark ${rv()}" id="diya-details">${dividerSVG()}<p class="diya-dkick">${tr('When &amp; where', 'कब और कहाँ')}</p></div>
              <div class="diya-sum ${rv()}">${ctx.summaryHTML({ heading: false })}</div>
            </div>
            <p class="diya-close ${rv()}" lang="hi">${isSK ? '॥ जय श्री राम ॥' : '॥ शुभमस्तु ॥'}</p>
          </section>
        </div>`;

      const el = root.querySelector('.diya-root');
      const lamp = el.querySelector('.diya-lamp');
      const bell = el.querySelector('.diya-bell');
      const light = el.querySelector('.diya-light');
      const mark = el.querySelector('#diya-details');
      const later = (fn, ms) => setTimeout(fn, ms);
      // Scroll the window only: scrollIntoView would also scroll the overflow-clipped root itself.
      const toDetails = () => {
        const top = mark.getBoundingClientRect().top + (window.pageYOffset || 0) - 16;
        try { window.scrollTo({ top, behavior: rm ? 'auto' : 'smooth' }); } catch (e) { window.scrollTo(0, top); }
      };

      if (ctx.isStatic) {
        let done = false;
        const fin = () => { if (!done) { done = true; ctx.ready(); } };
        const fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
        fonts.then(() => requestAnimationFrame(() => requestAnimationFrame(fin)));
        later(fin, 2500);
        return;
      }

      let state = 0; // 0 unlit · 1 striking · 2 lit · 3 revealed

      function ring(silent) {
        bell.classList.remove('is-swing');
        void bell.offsetWidth;
        bell.classList.add('is-swing');
        if (!silent) ctx.sound.play('bell');
      }

      function spawnPetals() {
        if (rm) return;
        const box = el.querySelector('.diya-petals');
        const colors = ['#f6a21e', '#ef8614', '#e8641c', '#f9b934', '#d9481c'];
        let seed = 7;
        const rnd = (a, b) => { seed = (seed * 9301 + 49297) % 233280; return a + (b - a) * seed / 233280; };
        let html = '';
        for (let i = 0; i < 9; i++) {
          html += `<span class="diya-petal" style="--l:${rnd(3, 95).toFixed(1)}%;--s:${rnd(10, 16).toFixed(1)}px;` +
            `--t:${rnd(17, 27).toFixed(1)}s;--d:${(i * 1.6 + rnd(0, 1.5)).toFixed(1)}s;--dx:${rnd(-40, 40).toFixed(0)}px;` +
            `--r0:${rnd(0, 180).toFixed(0)}deg;color:${colors[i % colors.length]}">${PETAL}</span>`;
        }
        box.innerHTML = html;
      }

      function finish() { el.classList.add('is-unveiled'); ctx.ready(); }

      function reveal() {
        if (state === 3) return;
        state = 3;
        const r = lamp.getBoundingClientRect();
        light.style.setProperty('--x', (r.left + r.width / 2).toFixed(0) + 'px');
        light.style.setProperty('--y', (r.top + r.height * .41).toFixed(0) + 'px');
        el.classList.add('is-revealed');
        spawnPetals();
        later(finish, rm ? 900 : 3600);
      }

      function lit() {
        if (state >= 2) return;
        state = 2;
        el.classList.add('is-lit');
        lamp.setAttribute('aria-label', tr('The diya is lit', 'दीया जल गया'));
        ring();
      }

      function lightDiya() {
        if (state > 0) {
          if (state >= 2) { lamp.classList.remove('is-flare'); void lamp.offsetWidth; lamp.classList.add('is-flare'); }
          return;
        }
        state = 1;
        if (rm) { lit(); later(reveal, 400); return; }
        el.classList.add('is-striking');
        ctx.sound.play('splash');
        later(lit, 420);
        later(reveal, 1350);
      }

      function skip() {
        if (state < 3) {
          state = 2;
          el.classList.add('is-instant', 'is-lit');
          lamp.setAttribute('aria-label', tr('The diya is lit', 'दीया जल गया'));
          reveal();
          finish();
        }
        requestAnimationFrame(toDetails);
      }

      lamp.addEventListener('click', lightDiya);
      bell.addEventListener('click', () => ring());
      el.querySelector('.diya-skip').addEventListener('click', skip);

      if (auto) {
        later(() => ring(), 900);
        later(lightDiya, 2200);
        later(toDetails, 7600);
      }
    },
  });
})();
