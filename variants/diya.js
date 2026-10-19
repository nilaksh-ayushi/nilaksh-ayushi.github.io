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

  // Hanuman ji seated in dhyana under a peepal tree (after the devotional painting): gold line art, stroke =
  // currentColor. Heart-shaped peepal leaves hang in a dome (seeded, so every render is the same), a dotted
  // prabhamandal behind the mukut, hands folded in the lap, tail rising at his right, gada resting at his left.
  function hanumanSVG() {
    const LEAF = 'M0 1.2 C-1.5 -.6 -5 -.4 -5.4 3 C-5.8 6.4 -2 9 0 13.5 C2 9 5.8 6.4 5.4 3 C5 -.4 1.5 -.6 0 1.2Z';
    let seed = 11;
    const rnd = (a, b) => { seed = (seed * 9301 + 49297) % 233280; return a + (b - a) * seed / 233280; };
    const leaves = [];
    [[44, 10], [55, 13], [66, 15], [77, 18], [88, 20]].forEach(([r, n]) => {
      for (let i = 0; i < n; i++) {
        const a = Math.PI * (1.08 + .84 * (i + rnd(.15, .85)) / n);
        const x = 100 + Math.cos(a) * r * 1.05, y = 98 + Math.sin(a) * r * .9;
        if (Math.hypot(x - 100, (y - 70) * 1.15) < 33 || (y > 60 && Math.abs(x - 100) < 44) || y < 5) continue;
        const rot = (x - 100) * .35 + rnd(-18, 18), s = rnd(.62, .9);
        const fill = rnd(0, 1) < .35;
        leaves.push(`<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(0)}) scale(${s.toFixed(2)})">` +
          `<path d="${LEAF}"${fill ? ' fill="currentColor" fill-opacity=".22"' : ''}/><path d="M0 1.5 V10.5" stroke-width=".6" opacity=".7"/></g>`);
      }
    });
    const ground = [[34, 171, 80], [52, 174, -60], [150, 172, 100], [166, 170, -30], [124, 175, 70], [72, 176, -100]]
      .map(([x, y, r]) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(.7)"><path d="${LEAF}"/></g>`).join('');
    return `<svg class="diya-hmn-svg" viewBox="0 0 200 182" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="Shri Hanuman" focusable="false">
    <defs><radialGradient id="diyaHmnGlow" cx=".5" cy=".46" r=".5"><stop offset="0" stop-color="#ffd27a" stop-opacity=".38"/><stop offset=".55" stop-color="#f59a32" stop-opacity=".12"/><stop offset="1" stop-color="#f59a32" stop-opacity="0"/></radialGradient></defs>
    <ellipse cx="100" cy="92" rx="96" ry="86" fill="url(#diyaHmnGlow)" stroke="none"/>
    <g class="diya-hmn-tree" stroke-width="1.1">
      <path d="M93.6 52 C93 44 91 38 87 33 M106.4 52 C107 44 109 38 113 33"/>
      <path d="M87 33 C79 26 67 24 56 27 C48 29 42 34 37 40 M113 33 C121 26 133 24 144 27 C152 29 158 34 163 40"/>
      <path d="M88 33 C84 25 78 20 70 17 M112 33 C116 25 122 20 130 17"/>
      <path d="M62 26 C57 32 54 38 53 46 M138 26 C143 32 146 38 147 46"/>
      <path d="M98.4 38 C99 31 99.6 25 100 19"/>
    </g>
    <g class="diya-hmn-leaves" stroke-width=".9">${leaves.join('')}</g>
    <circle cx="100" cy="74" r="21" stroke-width=".9" stroke-dasharray="0 3.4" opacity=".8"/>
    <g class="diya-hmn-figure">
      <path d="M100 44.5 L103.4 52 L101.6 52 L104.6 58.6 L102.6 58.6 L109.6 66.4 H90.4 L97.4 58.6 L95.4 58.6 L98.4 52 L96.6 52 Z" fill="currentColor" fill-opacity=".18"/>
      <circle cx="100" cy="42.6" r="1.4" fill="currentColor" stroke="none"/>
      <path d="M89.6 66.4 H110.4" stroke-width="1.6"/>
      <circle cx="100" cy="62.4" r="1.2" fill="currentColor" stroke="none"/>
      <path d="M90.4 67.6 C88.4 72 88.6 78 90.4 82 C92.4 87 96 90.6 100 90.6 C104 90.6 107.6 87 109.6 82 C111.4 78 111.6 72 109.6 67.6"/>
      <path d="M89 72.4 C86.2 71.4 85.2 75.6 88.6 77.4 M111 72.4 C113.8 71.4 114.8 75.6 111.4 77.4"/>
      <circle cx="87.6" cy="81" r="1.8"/><circle cx="112.4" cy="81" r="1.8"/>
      <path d="M93 74.2 C94.4 75.6 96.2 75.6 97.4 74.2 M102.6 74.2 C103.8 75.6 105.6 75.6 107 74.2"/>
      <path d="M92.6 71.4 C94.2 70.4 96.2 70.4 97.6 71.2 M102.4 71.2 C103.8 70.4 105.8 70.4 107.4 71.4" stroke-width=".9"/>
      <path d="M98.6 68 C98.6 71 101.4 71 101.4 68"/><path d="M100 68.6 V71.2" stroke-width="1"/>
      <path d="M98.6 77.6 C99.4 78.4 100.6 78.4 101.4 77.6" stroke-width="1"/>
      <path d="M95.6 81.2 C98 82.4 102 82.4 104.4 81.2" stroke-width="1.1"/>
      <path d="M97.6 85.4 C99.2 86.2 100.8 86.2 102.4 85.4" stroke-width="1"/>
      <path d="M89.6 70 C86 76 85 86 84 94 M110.4 70 C114 76 115 86 116 94" stroke-width="1" opacity=".75"/>
      <path d="M95.6 90 V94.6 M104.4 90 V94.6"/>
      <path d="M95.6 94 C88 95 80 96.4 76 101 C71.6 106 69.6 116 70 124 C70.6 131 80 136.4 91 138"/>
      <path d="M104.4 94 C112 95 120 96.4 124 101 C128.4 106 130.4 116 130 124 C129.4 131 120 136.4 109 138"/>
      <path d="M77 101.6 C80.4 103 82.4 105.6 83 109 M123 101.6 C119.6 103 117.6 105.6 117 109" opacity=".7" stroke-width="1"/>
      <path d="M82 108 C80.6 114 79.6 120 80.6 126 C83.6 129.6 87.6 131 91.4 131.4"/>
      <path d="M118 108 C119.4 114 120.4 120 119.4 126 C116.4 129.6 112.4 131 108.6 131.4"/>
      <path d="M70.4 112.6 C73.6 114.6 77.6 114.6 81 112.6 M129.6 112.6 C126.4 114.6 122.4 114.6 119 112.6" stroke-width="1.6"/>
      <path d="M89 97 C92 105 108 105 111 97"/>
      <circle cx="100" cy="106.4" r="1.9" fill="currentColor" fill-opacity=".3"/>
      <path d="M85 99 C86 116 114 116 115 99" stroke-dasharray="0 2.6" stroke-width="1.4"/>
      <path d="M86 110 C91 113.6 96 113.6 100 111 C104 113.6 109 113.6 114 110" opacity=".8"/>
      <path d="M100 115 V126" opacity=".55" stroke-width="1"/>
      <circle cx="100" cy="128.6" r=".8" fill="currentColor" stroke="none"/>
      <path d="M88 131.6 C86.6 134 86.6 136 88 138 M112 131.6 C113.4 134 113.4 136 112 138" stroke-width="1.6"/>
      <path d="M90.6 134.6 C94 131.6 106 131.6 109.4 134.6 C108.4 140 91.6 140 90.6 134.6Z" fill="currentColor" fill-opacity=".12"/>
      <path d="M98 133 C99 131.6 101 131.6 102 133" />
      <path d="M86 137 C74 140 63 147 58 154 C55 160 60 164.6 70 164.4 H130 C140 164.6 145 160 142 154 C137 147 126 140 114 137"/>
      <path d="M63 158.4 C80 152 100 148 121 147"/>
      <path d="M137 158.4 C122 154 108 152.4 92 152"/>
      <path d="M121 147 C126 143.6 132.6 145 133.6 149.4 C130 151 125 150.6 121 147Z"/>
      <path d="M92 152 C86 150 80 151.6 79 155.6 C83 157 88.6 156 92 152Z"/>
      <path d="M100 140 C98 146 98.6 152 100 158 M95 141 C92 147 92 152 93 157 M105 141 C108 147 108 152 107 157" opacity=".5" stroke-width="1"/>
    </g>
    <g class="diya-hmn-gada">
      <path d="M150.6 166.4 L156 134" stroke-width="2.6"/>
      <path d="M154.4 138 L159.8 139" stroke-width="1.3"/>
      <circle cx="157.6" cy="126.4" r="7.6" fill="currentColor" fill-opacity=".14"/>
      <path d="M150.6 124.4 C155 126.8 160 127.6 164.4 127" opacity=".6" stroke-width="1"/>
      <path d="M151 129.4 C155 131.6 159.6 132 163.8 131" opacity=".6" stroke-width="1"/>
      <path d="M159 119 L159.8 115.6"/><circle cx="160" cy="114" r="1.3" fill="currentColor" stroke="none"/>
    </g>
    <path class="diya-hmn-tail" d="M62 156 C50 152 44 140 48 128 C51 119 50 110 44 106 C40 103.6 36 106 37.6 110" stroke-width="1.8"/>
    <path d="M22 168.6 C60 166.4 140 166.4 178 168.6" stroke-width="1"/>
    <g stroke-width=".8" opacity=".75">${ground}</g>
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
            <button class="diya-bell" type="button" aria-label="Ring the temple bell">${bellSVG()}</button>
            <p class="diya-kicker" lang="hi">सादर आमंत्रण</p>
            <h1 class="diya-greet">${esc(ctx.greeting)}</h1>
            <button class="diya-lamp" type="button" aria-label="Light the diya">
              <span class="diya-glow" aria-hidden="true"></span>
              ${lampSVG()}
              <span class="diya-embers" aria-hidden="true">${embers}</span>
            </button>
            <p class="diya-hint">Tap to light the diya 🪔</p>
            <button class="diya-skip" type="button">Skip to details</button>
          </section>
          <section class="diya-card" aria-label="Invitation">
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
              <h2 class="diya-title ${rv()}">${esc(ctx.occasion.title)}<span lang="hi">${esc(ctx.occasion.titleHi)}</span></h2>
              ${P.blessings ? `<p class="diya-bless ${rv()}">With the blessings of ${esc(P.blessings)}</p>` : ''}
              <p class="diya-hosts ${rv()}">${esc(P.groomParents)}</p>
              <p class="diya-line ${rv()}">${esc(ctx.occasion.line)}</p>
              <p class="diya-couple ${rv()}"><span>${esc(P.groom)}</span><em>with</em><span>${esc(P.bride)}</span></p>
              <p class="diya-bride ${rv()}">Daughter of ${esc(P.brideParents)}</p>
              <div class="diya-div diya-mark ${rv()}" id="diya-details">${dividerSVG()}<p class="diya-dkick">When &amp; where</p></div>
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
        lamp.setAttribute('aria-label', 'The diya is lit');
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
          lamp.setAttribute('aria-label', 'The diya is lit');
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
