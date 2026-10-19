/* Haveli Ke Darwaze — an elegant point-and-click escape through a heritage haveli on the wedding evening.
   The guest is "inside" with Nilaksh & Ayushi; every chamber is one of the guest's functions and holds a
   gentle puzzle. Solving a chamber opens its invitation page (InviteDeck). Vidaai, when present, is the
   finale: the doors open onto a starlit courtyard. Ends with the full deck and ctx.summaryHTML(). */
(function () {
  'use strict';

  const GOLD = '#b8913f', GOLD2 = '#d9b866';
  const ORD = ['The first chamber', 'The second chamber', 'The third chamber', 'The fourth chamber', 'The fifth chamber', 'The sixth chamber'];

  /* ---------------------------------------------------------------- characters
     Original cute 3D-cartoon style: big round heads, glossy eyes, soft gradient shading. Faces are generic
     and stylised on purpose; they are not portraits of anyone. Head geometry is shared by the bust
     (viewBox 0 0 100 120) and the full figure (viewBox 0 0 100 190): head centre (50,52), r 27. */
  function charDefs(p, who) {
    return `<defs>
      <radialGradient id="${p}sk" cx=".42" cy=".34" r=".78"><stop offset="0" stop-color="#fde0c4"/><stop offset=".6" stop-color="#f1ba92"/><stop offset="1" stop-color="#d9946b"/></radialGradient>
      <radialGradient id="${p}ck" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ff8794" stop-opacity=".6"/><stop offset="1" stop-color="#ff8794" stop-opacity="0"/></radialGradient>
      <radialGradient id="${p}ir" cx=".45" cy=".32" r=".72"><stop offset="0" stop-color="#9a5e3a"/><stop offset=".55" stop-color="#5e331d"/><stop offset="1" stop-color="#3b1e10"/></radialGradient>
      <linearGradient id="${p}hr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5e3a27"/><stop offset="1" stop-color="#321c11"/></linearGradient>
      <linearGradient id="${p}gd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f8e19a"/><stop offset=".5" stop-color="#dab550"/><stop offset="1" stop-color="#a97d27"/></linearGradient>
      <radialGradient id="${p}sh" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#1f3d36" stop-opacity=".35"/><stop offset="1" stop-color="#1f3d36" stop-opacity="0"/></radialGradient>
      ${who === 'n' ? `
      <linearGradient id="${p}iv" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fffbf2"/><stop offset=".55" stop-color="#f4e5c3"/><stop offset="1" stop-color="#dbc28f"/></linearGradient>
      <linearGradient id="${p}sf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d43a55"/><stop offset="1" stop-color="#861630"/></linearGradient>
      <linearGradient id="${p}st" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7d1429"/><stop offset="1" stop-color="#a8223b"/></linearGradient>` : `
      <linearGradient id="${p}mr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#bb2a44"/><stop offset=".6" stop-color="#8e1b32"/><stop offset="1" stop-color="#600f21"/></linearGradient>
      <linearGradient id="${p}du" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c8304b" stop-opacity=".97"/><stop offset="1" stop-color="#8e1b32" stop-opacity=".94"/></linearGradient>`}
    </defs>`;
  }
  function eyesSVG(p, lashes) {
    const one = x => {
      const o = x < 50 ? -1 : 1;
      return `<ellipse cx="${x}" cy="56.5" rx="5.6" ry="6.4" fill="#fff"/>
        <ellipse cx="${x}" cy="57.6" rx="4.2" ry="5" fill="url(#${p}ir)"/>
        <circle cx="${x}" cy="58" r="2.1" fill="#2a140b"/>
        <circle cx="${x + 1.7}" cy="55" r="1.7" fill="#fff"/><circle cx="${x - 1.4}" cy="60" r=".8" fill="#fff" opacity=".9"/>
        <path d="M${x - 5.8} 55 Q${x} 49 ${x + 5.8} 55" stroke="#3b1e10" stroke-width="1.4" fill="none" stroke-linecap="round"/>
        ${lashes ? `<path d="M${x + o * 5.4} 54.2 l${o * 2.4} -1.4 M${x + o * 4.3} 52.2 l${o * 1.8} -2.1 M${x + o * 2.6} 50.8 l${o * 1} -2.2" stroke="#3b1e10" stroke-width="1" stroke-linecap="round"/>` : ''}`;
    };
    return one(39.5) + one(60.5);
  }
  function headSVG(p, bride) {
    const by = bride ? [46.5, 43.6, 46] : [45.8, 42.8, 45.2];
    return `<ellipse cx="23.5" cy="58.5" rx="4" ry="5.6" fill="url(#${p}sk)"/><ellipse cx="76.5" cy="58.5" rx="4" ry="5.6" fill="url(#${p}sk)"/>
      <circle cx="50" cy="52" r="27" fill="url(#${p}sk)"/>
      <ellipse cx="43" cy="40" rx="12" ry="7" fill="#fff" opacity=".16"/>
      ${eyesSVG(p, bride)}
      <path d="M33.5 ${by[0]} Q39.5 ${by[1]} 45.5 ${by[2]} M54.5 ${by[2]} Q60.5 ${by[1]} 66.5 ${by[0]}" stroke="#5a3420" stroke-width="${bride ? 1.1 : 1.6}" fill="none" stroke-linecap="round"/>
      <ellipse cx="31.5" cy="65.5" rx="6.2" ry="4.2" fill="url(#${p}ck)"/><ellipse cx="68.5" cy="65.5" rx="6.2" ry="4.2" fill="url(#${p}ck)"/>
      <path d="M48.5 63 q1.5 1.2 3 0" stroke="#c27a57" stroke-width="1.1" fill="none" stroke-linecap="round"/>
      <path d="M44.6 67.6 Q50 73 55.4 67.6 Q50 70 44.6 67.6Z" fill="${bride ? '#c43e5c' : '#a9453c'}"/>`;
  }
  const pearls = (xs, y0, drop) => xs.map((x, i) => {
    const y1 = y0 + drop - i * 0.6;
    return `<path d="M${x} ${y0} V${y1}" stroke="#ecca6c" stroke-width="1.2" stroke-dasharray="2 1.1"/><circle cx="${x}" cy="${y1 + 1.2}" r="1.25" fill="#fffaf0"/>`;
  }).join('');
  function safaSVG(p) {
    return `<path d="M21 50 Q15 19 50 15 Q85 19 79 50 Q72 37.5 50 36.5 Q28 37.5 21 50Z" fill="url(#${p}sf)"/>
      <path d="M23 44 Q34 25 67 21 M25 49 Q41 31 75 29.5" stroke="url(#${p}gd)" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <path d="M21 50 Q28 37.5 50 36.5 Q72 37.5 79 50" stroke="url(#${p}gd)" stroke-width="2.2" fill="none"/>
      <ellipse cx="40" cy="24" rx="9" ry="4" fill="#fff" opacity=".14"/>
      <path d="M58 27 C59.5 17 65 10.5 70.5 2.5 C71 11 66.5 20 61.5 28Z" fill="#fffaf0" stroke="#d9b451" stroke-width=".8"/>
      <path d="M61 26 C63 18 66 12 69.5 5.5" stroke="#e8d7b0" stroke-width=".6" fill="none"/>
      <circle cx="58.5" cy="29" r="4.2" fill="url(#${p}gd)"/><circle cx="58.5" cy="29" r="1.9" fill="#2e8b57"/>
      <circle cx="56" cy="34" r="1" fill="#fffaf0"/><circle cx="58.5" cy="34.8" r="1" fill="#fffaf0"/><circle cx="61" cy="34" r="1" fill="#fffaf0"/>
      ${pearls([22.5, 26, 29.5], 47, 26)}${pearls([77.5, 74, 70.5], 47, 26)}`;
  }
  function brideHeadwear(p) {
    return `<path d="M23.5 55 Q21.5 26 50 24.5 Q78.5 26 76.5 55 Q73 37 52.5 33.5 L50 30.5 L47.5 33.5 Q27 37 23.5 55Z" fill="url(#${p}hr)"/>
      <path d="M15 72 Q11 25 50 17 Q89 25 85 72 Q80 50 75 38.5 Q63 25.5 50 25.5 Q37 25.5 25 38.5 Q20 50 15 72Z" fill="url(#${p}du)"/>
      <path d="M17 70 Q19.5 49 25 38.5 Q37 25.5 50 25.5 Q63 25.5 75 38.5 Q80.5 49 83 70" stroke="url(#${p}gd)" stroke-width="2.2" fill="none"/>
      ${[[26, 31], [34, 23.5], [44, 20], [56, 20], [66, 23.5], [74, 31], [80, 44], [20, 44]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".9" fill="#f3d27a"/>`).join('')}
      <path d="M50 25.5 V36" stroke="url(#${p}gd)" stroke-width="1"/>
      <circle cx="50" cy="37.6" r="2.3" fill="url(#${p}gd)"/><path d="M50 39.8 q-2.5 3.1 0 5.6 q2.5 -2.5 0 -5.6z" fill="#c0392b" stroke="#dab550" stroke-width=".6"/>`;
  }
  function brideJewels(p) {
    const jh = x => `<circle cx="${x}" cy="62.6" r="1.4" fill="url(#${p}gd)"/><path d="M${x - 3.4} 68.5 Q${x} 62.8 ${x + 3.4} 68.5Z" fill="url(#${p}gd)"/>
      ${[-2.4, 0, 2.4].map(d => `<circle cx="${x + d}" cy="69.8" r=".85" fill="${d ? '#f3d27a' : '#c0392b'}"/>`).join('')}`;
    return `${jh(22.5)}${jh(77.5)}
      <circle cx="56.4" cy="64" r="3.7" fill="none" stroke="url(#${p}gd)" stroke-width="1.1"/><circle cx="56.4" cy="67.6" r=".9" fill="#c0392b"/>
      <path d="M59.8 62.6 Q68 58.8 76 59.5" stroke="#dab550" stroke-width=".6" fill="none"/>`;
  }
  const NECK = p => `<path d="M43 74 h14 v12 q-7 5 -14 0z" fill="url(#${p}sk)"/>`;
  function groomTorso(p, full) {
    const collar = `<path d="M40 84 Q50 89 60 84 L61 90 Q50 95.5 39 90Z" fill="url(#${p}gd)"/>`;
    if (!full) return `
      <path d="M4 120 Q6 96 28 88 Q40 84 50 84 Q60 84 72 88 Q94 96 96 120Z" fill="url(#${p}iv)" stroke="#c9a24f" stroke-width=".8"/>
      <path d="M14 98 Q30 88 44 92 L34 120 H10Z" fill="url(#${p}st)"/><path d="M14 98 Q30 88 44 92" stroke="url(#${p}gd)" stroke-width="1.8" fill="none"/>
      <path d="M50 92 V120" stroke="#c9a24f" stroke-width="1.1"/>
      ${[98, 106, 114].map(y => `<circle cx="50" cy="${y}" r="1.6" fill="url(#${p}gd)"/>`).join('')}
      ${[[62, 96], [70, 100], [78, 104], [66, 108], [74, 112], [84, 112]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".9" fill="#d9b451"/>`).join('')}
      ${NECK(p)}${collar}
      <path d="M36 88 Q50 104 64 88" stroke="#fffaf0" stroke-width="1.8" stroke-dasharray=".1 3.2" stroke-linecap="round" fill="none"/>`;
    return `
      <ellipse cx="50" cy="184" rx="27" ry="4.5" fill="url(#${p}sh)"/>
      <rect x="38" y="146" width="10" height="32" rx="4" fill="#efdcb0"/><rect x="52" y="146" width="10" height="32" rx="4" fill="#efdcb0"/>
      <ellipse cx="42" cy="180" rx="7" ry="3.4" fill="url(#${p}gd)"/><ellipse cx="58" cy="180" rx="7" ry="3.4" fill="url(#${p}gd)"/>
      <path d="M31 86 Q22 104 26 126" stroke="#e6cf9c" stroke-width="10" fill="none" stroke-linecap="round"/>
      <path d="M69 86 Q78 104 74 126" stroke="#e6cf9c" stroke-width="10" fill="none" stroke-linecap="round"/>
      <circle cx="26.5" cy="130" r="4.4" fill="url(#${p}sk)"/><circle cx="73.5" cy="130" r="4.4" fill="url(#${p}sk)"/>
      <path d="M31 84 Q50 78 69 84 L77 150 Q50 159 23 150Z" fill="url(#${p}iv)" stroke="#c9a24f" stroke-width=".8"/>
      <path d="M23 150 Q50 159 77 150" stroke="url(#${p}gd)" stroke-width="3" fill="none"/>
      <path d="M50 88 V156" stroke="#c9a24f" stroke-width="1.1"/>
      ${[96, 106, 116, 126, 136].map(y => `<circle cx="50" cy="${y}" r="1.6" fill="url(#${p}gd)"/>`).join('')}
      ${[[60, 100], [66, 112], [62, 124], [68, 136], [38, 102], [34, 116], [38, 130], [33, 140]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".9" fill="#d9b451"/>`).join('')}
      <path d="M33 86 Q44 90 46 98 L36 154 L28 151Z" fill="url(#${p}st)"/><path d="M33 86 Q44 90 46 98 L36 154" stroke="url(#${p}gd)" stroke-width="1.6" fill="none"/>
      ${NECK(p)}${collar}
      <path d="M37 88 Q50 106 63 88" stroke="#fffaf0" stroke-width="1.8" stroke-dasharray=".1 3.2" stroke-linecap="round" fill="none"/>`;
  }
  function brideTorso(p, full) {
    const necklace = `<path d="M40 84 Q50 93 60 84" stroke="url(#${p}gd)" stroke-width="2.8" fill="none"/>
      <path d="M37 86 Q50 101 63 86" stroke="url(#${p}gd)" stroke-width="2" fill="none"/>
      ${[[42, 89.4, '#2e8b57'], [50, 93, '#c0392b'], [58, 89.4, '#2e8b57']].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="1.4" fill="${c}"/>`).join('')}
      <path d="M50 96.5 q-2.8 3.4 0 6.2 q2.8 -2.8 0 -6.2z" fill="url(#${p}gd)"/>`;
    if (!full) return `
      <path d="M24 56 Q19 86 30 98 L70 98 Q81 86 76 56Z" fill="url(#${p}hr)"/>
      <path d="M4 120 Q6 96 28 88 Q40 84 50 84 Q60 84 72 88 Q94 96 96 120Z" fill="url(#${p}mr)"/>
      <path d="M36 86 Q50 99 64 86" stroke="url(#${p}gd)" stroke-width="2.4" fill="none"/>
      ${[[18, 106], [28, 112], [72, 112], [82, 106], [40, 116], [60, 116]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1" fill="#f3d27a"/>`).join('')}
      ${NECK(p)}${necklace}`;
    return `
      <ellipse cx="50" cy="184" rx="38" ry="5" fill="url(#${p}sh)"/>
      <path d="M17 66 Q10 120 18 170 L82 170 Q90 120 83 66Z" fill="url(#${p}du)" opacity=".9"/>
      <path d="M35 108 Q50 104 65 108 L88 177 Q50 191 12 177Z" fill="url(#${p}mr)"/>
      <path d="M14 171 Q50 184 86 171" stroke="url(#${p}gd)" stroke-width="4" fill="none"/>
      <path d="M18 160 Q50 171 82 160" stroke="url(#${p}gd)" stroke-width="1.6" fill="none"/>
      ${[[28, 132], [40, 140], [60, 140], [72, 132], [24, 150], [36, 154], [50, 148], [64, 154], [76, 150], [50, 126]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.2" fill="#f3d27a"/>`).join('')}
      <path d="M33 87 Q24 104 30 122" stroke="#efb88f" stroke-width="7.5" fill="none" stroke-linecap="round"/>
      <path d="M67 87 Q76 104 70 122" stroke="#efb88f" stroke-width="7.5" fill="none" stroke-linecap="round"/>
      ${[112, 115, 118].map(y => `<path d="M26.5 ${y} h7 M66.5 ${y} h7" stroke="${y === 115 ? '#f3d27a' : '#b4263f'}" stroke-width="2.2" stroke-linecap="round"/>`).join('')}
      <circle cx="30.5" cy="124.5" r="3.8" fill="url(#${p}sk)"/><circle cx="69.5" cy="124.5" r="3.8" fill="url(#${p}sk)"/>
      <path d="M33 86 Q50 80 67 86 L66 110 Q50 114 34 110Z" fill="url(#${p}mr)"/>
      <path d="M34 108 Q50 112 66 108" stroke="url(#${p}gd)" stroke-width="2.4" fill="none"/>
      <path d="M36 86 Q50 99 64 86" stroke="url(#${p}gd)" stroke-width="2.4" fill="none"/>
      ${NECK(p)}${necklace}`;
  }
  function groomInner(p, full) {
    return `${charDefs(p, 'n')}${groomTorso(p, full)}${headSVG(p, false)}
      <path d="M24.5 53 q-1.2 -10 4 -14.5 v16.5z M75.5 53 q1.2 -10 -4 -14.5 v16.5z" fill="url(#${p}hr)"/>
      ${safaSVG(p)}`;
  }
  function brideInner(p, full) {
    return `${charDefs(p, 'a')}${brideTorso(p, full)}${headSVG(p, true)}${brideHeadwear(p)}${brideJewels(p)}`;
  }
  const PORTRAIT_BG = '<rect width="100" height="120" fill="#0f4c45"/><circle cx="50" cy="50" r="46" fill="#11605a"/><circle cx="50" cy="50" r="46" fill="none" stroke="#d9b866" stroke-width=".8" opacity=".55"/>';
  const POR_N = `<svg viewBox="0 0 100 120" aria-hidden="true">${PORTRAIT_BG}${groomInner('escPn', false)}</svg>`;
  const POR_A = `<svg viewBox="0 0 100 120" aria-hidden="true">${PORTRAIT_BG}${brideInner('escPa', false)}</svg>`;
  // The couple standing together, placed into a 900 x 360 scene (finale courtyard / hall).
  const COUPLE = `<g class="escape-couple">
      <svg x="352" y="146" width="98" height="186" viewBox="0 0 100 190" overflow="visible">${groomInner('escFn', true)}</svg>
      <svg x="450" y="146" width="98" height="186" viewBox="0 0 100 190" overflow="visible">${brideInner('escFa', true)}</svg>
    </g>`;

  /* ---------------------------------------------------------------- scene helpers (900 x 360) */
  const arch = (x, y, w, h) => `M${x} ${y + h}V${y + w / 2}A${w / 2} ${w / 2} 0 0 1 ${x + w} ${y + w / 2}V${y + h}Z`;
  function garland(x1, x2, y, dip, n) {
    let s = '';
    for (let i = 0; i <= n; i++) { const t = i / n, x = x1 + (x2 - x1) * t, yy = y + dip * 4 * t * (1 - t); s += `<circle cx="${x.toFixed(1)}" cy="${yy.toFixed(1)}" r="5" fill="${i % 2 ? '#f2a71b' : '#e8590c'}"/>`; }
    return s;
  }
  function lamp(x, len) {
    return `<path d="M${x} 0V${len}" stroke="#7a5a22" stroke-width="1.5"/><circle cx="${x}" cy="${len + 14}" r="26" fill="#ffd27a" opacity=".16"/>
      <path d="M${x - 10} ${len} h20 l-4 14 h-12z" fill="${GOLD}"/><path d="M${x} ${len + 15} q-3 6 0 10 q3 -4 0 -10z" fill="#ffb347"/>`;
  }
  function studs(x1, y1, x2, y2) { let s = ''; for (let y = y1; y <= y2; y += 18) for (let x = x1; x <= x2; x += 12) s += `<circle cx="${x}" cy="${y}" r="1.6" fill="${GOLD2}"/>`; return s; }
  function door(x, y, w, h, open, lock) {
    const m = x + w / 2;
    return `<g class="escape-door${open ? ' is-open' : ''}">
      <path d="${arch(x - 9, y - 9, w + 18, h + 9)}" fill="#5a3418"/>
      <path d="${arch(x, y, w, h)}" fill="#ffe2a0"/><path d="${arch(x + w * .2, y + h * .3, w * .6, h * .7)}" fill="#ffc861" opacity=".5"/>
      <g class="escape-dl"><path d="M${x} ${y + h}V${y + w / 2}A${w / 2} ${w / 2} 0 0 1 ${m} ${y}V${y + h}Z" fill="#8a5328" stroke="${GOLD}" stroke-width="2"/>${studs(x + 8, y + w / 2, m - 6, y + h - 8)}</g>
      <g class="escape-dr"><path d="M${m} ${y}A${w / 2} ${w / 2} 0 0 1 ${x + w} ${y + w / 2}V${y + h}H${m}Z" fill="#8a5328" stroke="${GOLD}" stroke-width="2"/>${studs(m + 6, y + w / 2, x + w - 8, y + h - 8)}</g>
      ${lock && !open ? `<g class="escape-lockart"><rect x="${m - 7}" y="${y + h * .55}" width="14" height="12" rx="2" fill="${GOLD2}" stroke="#7a5a22"/><path d="M${m - 4} ${y + h * .55}v-4a4 4 0 0 1 8 0v4" fill="none" stroke="${GOLD2}" stroke-width="2"/></g>` : ''}
    </g>`;
  }
  const pot = (x, y, c) => `<path d="M${x - 8} ${y} q0 -15 8 -15 q8 0 8 15z" fill="${c}"/><rect x="${x - 6}" y="${y - 18}" width="12" height="4" rx="1.5" fill="${c}"/><path d="M${x - 5} ${y - 6} h10" stroke="#fff" stroke-width="1" opacity=".5"/>`;
  function starsField(n, h, seed) { let s = '', v = seed; for (let i = 0; i < n; i++) { v = (v * 9301 + 49297) % 233280; const x = v / 233280 * 900; v = (v * 9301 + 49297) % 233280; const y = v / 233280 * h; s += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${i % 5 ? .9 : 1.5}" fill="#fff" opacity=".8"/>`; } return s; }
  const show = (o, name) => !(o.hide && o.hide.has(name));
  const egg = (o, name) => !!(o.eggs && o.eggs.has(name) && show(o, name));
  const diyaArt = (x, y, lit) => `<path d="M${x - 11} ${y} q11 10 22 0z" fill="#b5651d"/><path d="M${x - 11} ${y} h22" stroke="#7a3f12" stroke-width="1.5"/>
    ${lit ? `<circle cx="${x}" cy="${y - 8}" r="13" fill="#ffd27a" opacity=".3"/><path d="M${x} ${y - 15} q-4 7 0 12 q4 -5 0 -12z" fill="#ffb347"/><path d="M${x} ${y - 11} q-2 4 0 7 q2 -3 0 -7z" fill="#fff3c4"/>` : ''}`;

  const EGG_ART = {
    lifafa: (x, y) => `<g><rect x="${x}" y="${y}" width="22" height="15" fill="#fbf6ea" stroke="${GOLD}"/><path d="M${x} ${y + 1} l11 8 l11 -8" fill="none" stroke="${GOLD}"/><circle cx="${x + 11}" cy="${y + 10}" r="2.6" fill="#c0392b"/></g>`,
    jutti: (x, y) => `<path d="M${x} ${y + 12} Q${x} ${y + 4} ${x + 10} ${y + 4} L${x + 20} ${y + 5} Q${x + 26} ${y + 5} ${x + 28} ${y} Q${x + 31} ${y} ${x + 29} ${y + 6} Q${x + 27} ${y + 12} ${x + 20} ${y + 12}Z" fill="${GOLD2}" stroke="#7a5a22"/>`,
    laddoo: (x, y) => `<path d="M${x} ${y + 6} q14 14 28 0z" fill="${GOLD}"/><circle cx="${x + 9}" cy="${y + 3}" r="5" fill="#f39c12"/><circle cx="${x + 19}" cy="${y + 3}" r="5" fill="#f39c12"/><circle cx="${x + 14}" cy="${y - 4}" r="5" fill="#f5b041"/>`,
    chashma: (x, y) => `<g fill="none" stroke="#2a1d18" stroke-width="1.8"><circle cx="${x + 6}" cy="${y + 6}" r="5.5"/><circle cx="${x + 20}" cy="${y + 6}" r="5.5"/><path d="M${x + 11.5} ${y + 5} q1.5 -2 3 0"/></g>`,
    gramophone: (x, y) => `<rect x="${x}" y="${y + 36}" width="40" height="18" fill="#6b3f1d" stroke="${GOLD}"/><ellipse cx="${x + 20}" cy="${y + 36}" rx="16" ry="3" fill="#2a1d18"/><path d="M${x + 24} ${y + 34} L${x + 30} ${y + 14} L${x + 52} ${y} L${x + 54} ${y + 28} Z" fill="${GOLD2}" stroke="#7a5a22"/>`,
    kaleera: (x, y) => `<g stroke="${GOLD}" stroke-width="1"><path d="M${x} ${y} v14 M${x + 8} ${y} v22 M${x + 16} ${y} v16"/></g><g fill="${GOLD2}"><path d="M${x - 4} ${y + 14} h8 l-4 8z"/><path d="M${x + 4} ${y + 22} h8 l-4 8z"/><path d="M${x + 12} ${y + 16} h8 l-4 8z"/></g><rect x="${x - 4}" y="${y - 3}" width="24" height="4" rx="2" fill="${GOLD}"/>`,
    ghanti: (x, y) => `<path d="M${x + 10} ${y - 30} V${y}" stroke="#7a5a22" stroke-width="1.5"/><path d="M${x} ${y + 20} q0 -20 10 -20 q10 0 10 20z" fill="${GOLD2}" stroke="#7a5a22"/><rect x="${x - 2}" y="${y + 19}" width="24" height="3" rx="1.5" fill="${GOLD}"/><circle cx="${x + 10}" cy="${y + 24}" r="2.4" fill="#7a5a22"/>`,
    cone: (x, y) => `<path d="M${x} ${y} L${x + 26} ${y + 6} L${x + 4} ${y + 14}Z" fill="#6b8f3a" stroke="#3f5a1e"/><path d="M${x + 26} ${y + 6} l6 1" stroke="#3f2a12" stroke-width="2"/>`,
    gajra: (x, y) => `<g fill="#fff" stroke="#d8d0bc" stroke-width=".6">${[0, 1, 2, 3, 4, 5, 6, 7].map(k => `<circle cx="${x + k * 4.4}" cy="${y + Math.sin(k * .8) * 3}" r="2.8"/>`).join('')}</g><path d="M${x} ${y + 3} q16 8 31 0" stroke="#3f8a4e" stroke-width="1.2" fill="none"/>`,
    shehnai: (x, y) => `<path d="M${x} ${y + 6} L${x + 30} ${y + 2} L${x + 30} ${y + 10}Z" fill="#7a4a22"/><path d="M${x + 30} ${y} q8 6 0 12z" fill="${GOLD2}" stroke="#7a5a22"/>${[6, 12, 18].map(k => `<circle cx="${x + k}" cy="${y + 6}" r="1.1" fill="${GOLD2}"/>`).join('')}`,
    paan: (x, y) => `<ellipse cx="${x + 16}" cy="${y + 8}" rx="18" ry="5" fill="#d6d6d6" stroke="#9a9a9a"/><path d="M${x + 6} ${y + 6} q5 -10 10 0z M${x + 16} ${y + 6} q5 -10 10 0z" fill="#3f8a4e"/><circle cx="${x + 11}" cy="${y + 2}" r="1" fill="#c0392b"/><circle cx="${x + 21}" cy="${y + 2}" r="1" fill="#c0392b"/>`,
  };

  /* ---------------------------------------------------------------- scenes */
  const SCENES = {
    haldi: {
      vb: '100 40 520 320',
      hots: { tulsi: [128, 188, 100, 106], jhoola: [262, 58, 90, 190], urli: [520, 280, 104, 36], jharokha: [404, 54, 92, 66], pots: [626, 176, 160, 50], door: [790, 110, 100, 184], lifafa: [284, 288, 36, 28] },
      art(o) {
        let cren = ''; for (let x = 0; x < 900; x += 30) cren += `<rect x="${x + 4}" y="46" width="18" height="14" fill="#e8bd6f"/>`;
        const arches = [20, 360, 480, 640].map(x => `<path d="${arch(x, 100, 80, 162)}" fill="#c98f45"/><path d="${arch(x + 9, 110, 62, 152)}" fill="#a86e33" opacity=".5"/><path d="${arch(x, 100, 80, 162)}" fill="none" stroke="${GOLD}" stroke-width="2"/>`).join('');
        let tiles = ''; for (let x = 0; x <= 960; x += 60) tiles += `<path d="M${x} 262 L${x - 70} 360" stroke="#c9a072" stroke-width="1.2"/>`;
        const shelfPots = ['#2e8b57', '#c0392b', '#f1c40f', '#3f3a8c', '#e67e22', '#2f6fbf'].map((c, i) => pot(648 + i * 22, 214, c)).join('');
        return `
          <rect width="900" height="360" fill="#f0b98a"/><rect width="900" height="60" fill="#6e4a7a" opacity=".5"/><rect width="900" height="30" fill="#3f2a55" opacity=".4"/>
          ${starsField(14, 40, 7)}
          ${cren}<rect y="58" width="900" height="206" fill="#e8bd6f"/><rect y="58" width="900" height="6" fill="#c9974a"/>
          ${arches}
          <g><path d="M406 64 Q450 32 494 64Z" fill="#c98f45" stroke="${GOLD}" stroke-width="2"/><rect x="412" y="64" width="76" height="44" fill="#d9a85a" stroke="${GOLD}" stroke-width="2"/>
            ${[420, 442, 464].map(x => `<path d="${arch(x, 70, 16, 30)}" fill="#5a3418" opacity=".85"/>`).join('')}<rect x="406" y="106" width="88" height="7" fill="#a86e33"/></g>
          ${garland(0, 900, 64, 26, 44)}
          <rect y="262" width="900" height="98" fill="#dcb68a"/>${tiles}<path d="M0 300 H900 M0 336 H900" stroke="#c9a072" stroke-width="1"/>
          <g transform="translate(450 318)"><ellipse rx="56" ry="16" fill="#e8590c" opacity=".85"/><ellipse rx="42" ry="11" fill="#f2c94c"/><ellipse rx="27" ry="7" fill="#2e8b57"/><ellipse rx="12" ry="3.4" fill="#c0392b"/></g>
          <g><rect x="134" y="218" width="76" height="10" fill="#f6ead0" stroke="#8c1d34" stroke-width="2.5"/><rect x="140" y="228" width="64" height="60" fill="#f6ead0" stroke="#8c1d34" stroke-width="2.5"/>
            <path d="M152 258 q20 -16 40 0" stroke="#d9b866" stroke-width="2" fill="none"/><circle cx="172" cy="270" r="4" fill="#e67e22"/>
            <path d="M172 218 V196" stroke="#3f7a3a" stroke-width="2.5"/>
            ${[[160, 204, 9], [172, 194, 10], [185, 205, 9], [166, 212, 7], [180, 213, 7]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#3f8a4e"/>`).join('')}</g>
          ${show(o, 'pot7') ? `<g>${pot(214, 288, '#8e44ad')}</g>` : ''}
          <g><path d="M282 58 V230 M330 58 V230" stroke="#a87a3a" stroke-width="2.2"/><rect x="270" y="228" width="72" height="10" rx="3" fill="#7a4a22"/><rect x="276" y="219" width="60" height="10" rx="5" fill="#8c1d34"/>
            <path d="M276 238 v8 M290 238 v6 M322 238 v6 M336 238 v8" stroke="#d9b866" stroke-width="2"/></g>
          ${egg(o, 'lifafa') ? EGG_ART.lifafa(290, 294) : ''}
          <g><path d="M524 298 q46 26 92 0z" fill="#9c7a2f"/><ellipse cx="570" cy="298" rx="46" ry="11" fill="${GOLD}"/><ellipse cx="570" cy="297" rx="39" ry="7" fill="#5f9e96"/>
            ${[[548, 296, '#e8590c'], [566, 293, '#f2a71b'], [584, 298, '#e8590c'], [597, 294, '#f2a71b']].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="5" fill="${c}"/>`).join('')}</g>
          <g><rect x="630" y="214" width="152" height="8" fill="#7a4a22"/><path d="M640 222 l8 14 M772 222 l-8 14" stroke="#7a4a22" stroke-width="4"/>${shelfPots}<path d="M${648 + 6 * 22 - 8} 212 h16" stroke="#7a4a22" stroke-dasharray="3 3"/></g>
          ${door(800, 120, 80, 168, o.doorOpen, o.lock)}`;
      },
    },
    bhaat: {
      vb: '360 40 440 300',
      hots: { kapde: [90, 222, 104, 54], mithai: [244, 182, 64, 32], laddoo: [300, 146, 46, 34], radio: [266, 222, 58, 32], nariyal: [412, 194, 58, 78], thaal: [510, 232, 140, 42], shagun: [672, 212, 64, 56], chashma: [736, 280, 56, 28], takiya: [20, 290, 72, 30], door: [790, 110, 100, 184] },
      art(o) {
        const meds = [80, 330, 580].map(x => `<circle cx="${x}" cy="88" r="34" fill="none" stroke="${GOLD}" stroke-width="2"/><circle cx="${x}" cy="88" r="24" fill="#962e42"/>${[0, 1, 2, 3, 4, 5, 6, 7].map(k => { const a = k * Math.PI / 4, cx = (x + Math.cos(a) * 14).toFixed(1), cy = (88 + Math.sin(a) * 14).toFixed(1); return `<ellipse cx="${cx}" cy="${cy}" rx="5" ry="2.4" transform="rotate(${k * 45} ${cx} ${cy})" fill="${GOLD2}"/>`; }).join('')}<circle cx="${x}" cy="88" r="5" fill="${GOLD2}"/>`).join('');
        return `
          <rect width="900" height="200" fill="#7d2235"/>${meds}
          <rect y="170" width="900" height="94" fill="#5c1626"/><path d="M0 170 H900" stroke="${GOLD}" stroke-width="3"/>
          ${[150, 650].map(x => `<path d="${arch(x, 132, 60, 100)}" fill="#4a1220"/><path d="${arch(x, 132, 60, 100)}" fill="none" stroke="${GOLD}" stroke-width="1.5"/>`).join('')}
          ${lamp(200, 24)}${lamp(450, 18)}${lamp(700, 24)}
          <rect y="262" width="900" height="98" fill="#c49a62"/><rect x="370" y="288" width="320" height="58" fill="#8c1d34" opacity=".9"/>
          <path d="M370 298 H690 M370 336 H690" stroke="${GOLD2}" stroke-width="2"/>${[0, 1, 2, 3, 4, 5, 6, 7].map(k => `<path d="M${392 + k * 38} 308 l8 9 l-8 9 l-8 -9z" fill="${GOLD2}" opacity=".7"/>`).join('')}
          <g><rect x="88" y="262" width="108" height="10" fill="#7a4a22"/><path d="M96 272 v18 M188 272 v18" stroke="#7a4a22" stroke-width="5"/>
            ${show(o, 'kapde') ? `<rect x="104" y="250" width="76" height="9" rx="2" fill="#e67e22"/><rect x="108" y="241" width="68" height="9" rx="2" fill="#d6336c"/><rect x="112" y="232" width="60" height="9" rx="2" fill="#2e8b57"/><path d="M104 254 h76 M108 245 h68 M112 236 h60" stroke="${GOLD2}" stroke-width="1"/>` : ''}</g>
          <g><rect x="240" y="146" width="104" height="118" fill="#6b3f1d" stroke="${GOLD}" stroke-width="1.5"/><path d="M240 180 H344 M240 216 H344" stroke="#4a2a12" stroke-width="3"/>
            ${show(o, 'mithai') ? `<rect x="252" y="190" width="44" height="22" fill="#f0a6b8" stroke="${GOLD}"/><path d="M252 200 h44 M274 190 v22" stroke="${GOLD}"/>` : ''}
            ${egg(o, 'laddoo') ? EGG_ART.laddoo(306, 170) : ''}
            <rect x="272" y="226" width="46" height="28" rx="4" fill="#a0522d"/><circle cx="306" cy="240" r="7" fill="#e9dcc0"/><path d="M278 232 h18 M278 238 h18 M278 244 h18" stroke="#e9dcc0" stroke-width="1.5"/></g>
          <g><ellipse cx="440" cy="248" rx="24" ry="22" fill="${GOLD}"/><rect x="430" y="222" width="20" height="8" fill="${GOLD}"/><path d="M418 240 h44" stroke="#9c7a2f" stroke-width="2"/>
            <path d="M440 222 q-18 -4 -24 -16 q14 2 24 16z M440 222 q18 -4 24 -16 q-14 2 -24 16z" fill="#3f8a4e"/>
            ${show(o, 'nariyal') ? `<ellipse cx="440" cy="210" rx="13" ry="15" fill="#7a4a22"/><path d="M440 196 q-4 -8 0 -10 q4 2 0 10" fill="#5a3418"/><path d="M430 214 q10 6 20 0" stroke="#c0392b" stroke-width="2" fill="none"/>` : ''}</g>
          <g><rect x="508" y="262" width="144" height="10" fill="#7a4a22"/><path d="M518 272 v16 M642 272 v16" stroke="#7a4a22" stroke-width="5"/>
            <ellipse cx="580" cy="258" rx="56" ry="11" fill="${GOLD2}" stroke="#9c7a2f" stroke-width="2"/><ellipse cx="580" cy="256" rx="40" ry="6" fill="none" stroke="#9c7a2f"/>
            <path d="M574 252 q6 -10 6 -14 q2 6 0 14z" fill="#ffb347"/></g>
          <g><rect x="680" y="240" width="48" height="26" fill="#6b3f1d" stroke="${GOLD}" stroke-width="1.5"/><path d="M680 248 h48" stroke="${GOLD}"/><circle cx="704" cy="254" r="2.5" fill="${GOLD2}"/>
            ${show(o, 'shagun') ? `<path d="M694 240 q-4 -14 10 -16 q14 2 10 16z" fill="#c0392b"/><path d="M698 226 q6 4 12 0" stroke="${GOLD2}" stroke-width="2" fill="none"/>` : ''}</g>
          <g><rect x="732" y="294" width="62" height="18" rx="7" fill="${GOLD2}"/><path d="M738 303 h50" stroke="#9c7a2f" stroke-dasharray="4 3"/>${egg(o, 'chashma') ? EGG_ART.chashma(750, 284) : ''}</g>
          <g><rect x="22" y="296" width="70" height="20" rx="10" fill="#8c1d34"/><path d="M30 306 h54" stroke="${GOLD2}" stroke-width="2"/></g>
          ${door(800, 120, 80, 168, o.doorOpen, false)}`;
      },
    },
    sangeet: {
      vb: '250 20 440 300',
      hots: { kaleera: [84, 138, 38, 52], basket: [138, 236, 76, 58], velvet: [238, 232, 62, 46], dholak: [436, 208, 66, 38], harmonium: [536, 204, 62, 36], gaddi: [388, 284, 226, 34], gramophone: [674, 192, 70, 74], door: [790, 110, 100, 184] },
      art(o) {
        const panels = [160, 600].map(x => `<path d="${arch(x, 80, 96, 176)}" fill="#11605a"/><path d="${arch(x, 80, 96, 176)}" fill="none" stroke="${GOLD}" stroke-width="2"/><path d="${arch(x + 12, 94, 72, 156)}" fill="none" stroke="${GOLD}" stroke-width=".8" opacity=".7"/>`).join('');
        let chand = `<path d="M450 0 V40" stroke="${GOLD}" stroke-width="2"/>`;
        [[60, 46], [44, 64], [28, 80]].forEach(([w, y]) => { chand += `<path d="M${450 - w} ${y} Q450 ${y + 12} ${450 + w} ${y}" stroke="${GOLD}" stroke-width="2" fill="none"/>`; for (let k = -w; k <= w; k += 12) chand += `<path d="M${450 + k} ${y + 4} l2 7 l-2 4 l-2 -4z" fill="#e8f4f2"/>`; });
        chand += `<circle cx="450" cy="60" r="70" fill="#ffe7a8" opacity=".12"/>`;
        return `
          <rect width="900" height="270" fill="#0f4c45"/>${panels}${chand}
          <rect x="92" y="60" width="22" height="204" fill="#e9dcc0"/><rect x="86" y="56" width="34" height="10" fill="${GOLD}"/><rect x="86" y="258" width="34" height="8" fill="${GOLD}"/>
          ${egg(o, 'kaleera') ? EGG_ART.kaleera(95, 150) : ''}
          ${garland(130, 780, 30, 24, 30)}
          <rect y="262" width="900" height="98" fill="#3a2a1e"/><rect x="360" y="286" width="290" height="40" fill="#f6ead0"/>
          <g><rect x="380" y="238" width="250" height="26" fill="#8c1d34"/><path d="M380 240 H630" stroke="${GOLD2}" stroke-width="2"/>
            <rect x="446" y="216" width="50" height="24" rx="11" fill="#b0503a"/><ellipse cx="446" cy="228" rx="5" ry="12" fill="#f6ead0"/><ellipse cx="496" cy="228" rx="5" ry="12" fill="#f6ead0"/>
            <path d="M452 217 l8 22 l8 -22 l8 22 l8 -22 l8 22" stroke="${GOLD2}" stroke-width="1.2" fill="none"/>
            <rect x="540" y="216" width="54" height="22" fill="#6b3f1d"/><rect x="544" y="220" width="46" height="8" fill="#f6ead0"/>${[0, 1, 2, 3, 4, 5, 6].map(k => `<path d="M${548 + k * 6} 220 v8" stroke="#2a1d18" stroke-width="1.2"/>`).join('')}</g>
          ${[410, 480, 550].map(x => `<rect x="${x}" y="292" width="58" height="16" rx="7" fill="${GOLD2}"/><path d="M${x + 6} 300 h46" stroke="#9c7a2f" stroke-dasharray="4 3"/>`).join('')}
          <g><path d="M142 262 L148 292 H206 L212 262Z" fill="#a87a3a"/><path d="M146 272 H210 M147 282 H209" stroke="#7a5a22"/>
            ${[[156, 256, '#fff'], [168, 250, '#f2c94c'], [180, 254, '#fff'], [192, 249, '#fff'], [202, 256, '#f2c94c'], [174, 260, '#fff']].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="6.5" fill="${c}"/>`).join('')}</g>
          <g><path d="M246 262 h46 l-6 30 h-34z" fill="#7a4a22"/><rect x="250" y="240" width="38" height="22" rx="3" fill="#8c1d34"/><path d="M250 248 h38" stroke="${GOLD2}"/></g>
          ${egg(o, 'gramophone') ? EGG_ART.gramophone(680, 206) : ''}
          ${door(800, 120, 80, 168, o.doorOpen, false)}`;
      },
    },
    galiyara: {
      vb: '230 40 400 300',
      hots: { lari: [126, 222, 88, 44], sehra: [296, 116, 86, 148], mirror: [492, 104, 76, 104], jutti: [636, 286, 40, 26], door: [758, 88, 124, 210] },
      art(o) {
        const arches = [20, 220, 420, 590].map(x => `<path d="${arch(x, 74, 84, 188)}" fill="#e3cfa6"/><path d="${arch(x + 10, 86, 64, 176)}" fill="#d6bd8c" opacity=".7"/><path d="${arch(x, 74, 84, 188)}" fill="none" stroke="${GOLD}" stroke-width="2"/>`).join('');
        let strings = ''; for (let x = 12; x < 760; x += 46) strings += `<path d="M${x} 0 V${60 + (x * 7) % 50}" stroke="${(x / 46) % 2 < 1 ? '#e8590c' : '#f2a71b'}" stroke-width="7" stroke-dasharray="6 3"/>`;
        let sehraStr = ''; for (let x = 318; x <= 362; x += 6) sehraStr += `<path d="M${x} 150 v${40 + ((x * 3) % 14)}" stroke="${GOLD2}" stroke-width="2" stroke-dasharray="3 2"/>`;
        return `
          <rect width="900" height="262" fill="#f1e2c4"/>${arches}${strings}
          ${lamp(180, 30)}${lamp(470, 26)}
          <rect y="262" width="900" height="98" fill="#b98b5a"/><rect y="292" width="900" height="42" fill="#8c1d34"/><path d="M0 296 H900 M0 330 H900" stroke="${GOLD2}" stroke-width="2"/>
          <g><rect x="128" y="258" width="84" height="8" fill="#7a4a22"/><path d="M136 266 v24 M204 266 v24" stroke="#7a4a22" stroke-width="5"/>
            <rect x="146" y="236" width="48" height="22" fill="#6e1a2c" stroke="${GOLD}" stroke-width="1.5"/><path d="M146 244 h48" stroke="${GOLD}"/>
            ${show(o, 'lari') ? `<g fill="#fbf6ea" stroke="#c9b48a" stroke-width=".6">${[0, 1, 2, 3, 4, 5, 6].map(k => `<circle cx="${196 + k * 3}" cy="${250 + Math.sin(k) * 3 + k * 1.6}" r="2.3"/>`).join('')}</g>` : ''}</g>
          <g><path d="M340 264 V200" stroke="#7a4a22" stroke-width="5"/><rect x="318" y="260" width="44" height="6" fill="#7a4a22"/>
            <ellipse cx="340" cy="176" rx="20" ry="24" fill="#e9dcc0"/>
            <path d="M314 160 Q316 128 340 126 Q364 128 366 160 Q356 150 340 150 Q324 150 314 160Z" fill="#8c1d34"/><path d="M316 152 Q340 140 364 152" stroke="${GOLD2}" stroke-width="2" fill="none"/>
            <path d="M352 132 q8 -12 4 -20 q-2 8 -8 12z" fill="${GOLD2}"/>${sehraStr}</g>
          <g><ellipse cx="530" cy="156" rx="30" ry="44" fill="#cfe2e6" stroke="${GOLD}" stroke-width="7"/><path d="M514 132 q8 -10 16 -12" stroke="#fff" stroke-width="3" opacity=".7" fill="none"/></g>
          <rect x="624" y="74" width="22" height="190" fill="#e9dcc0"/><rect x="618" y="70" width="34" height="8" fill="${GOLD}"/>
          ${egg(o, 'jutti') ? EGG_ART.jutti(642, 294) : ''}
          ${door(770, 100, 100, 190, o.doorOpen, false)}`;
      },
    },
    gate: {
      vb: '160 30 520 330',
      hots: { gateDoor: [390, 120, 120, 160], lantern: [344, 136, 34, 56], ghodi: [124, 176, 132, 98], dhol: [676, 226, 70, 48], shehnai: [56, 262, 64, 26] },
      art(o) {
        let lights = ''; for (let i = 0; i <= 30; i++) { const x = i * 30, y = 26 + Math.sin(i / 30 * Math.PI) * 18; lights += `<circle cx="${x}" cy="${y.toFixed(1)}" r="3.4" fill="${['#ffd27a', '#ff9fb8', '#fff3d6'][i % 3]}"/>`; }
        return `
          <rect width="900" height="360" fill="#0d1838"/>${starsField(40, 120, 31)}
          <path d="M0 22 Q450 62 900 22" stroke="#2a3150" stroke-width="1.4" fill="none"/>${lights}
          <rect x="250" y="84" width="400" height="186" fill="#e6cfa0"/><rect x="244" y="78" width="412" height="10" fill="#c9a86a"/>
          ${[290, 610].map(x => `<path d="M${x - 26} 78 Q${x} 40 ${x + 26} 78Z" fill="#e6cfa0" stroke="${GOLD}" stroke-width="2"/><path d="M${x} 44 v-8" stroke="${GOLD}" stroke-width="2"/>`).join('')}
          ${[280, 560].map(x => `<path d="${arch(x, 110, 60, 70)}" fill="#3a2a40"/><path d="${arch(x, 110, 60, 70)}" fill="none" stroke="${GOLD}" stroke-width="1.5"/><path d="${arch(x + 8, 118, 44, 62)}" fill="#ffcf7a" opacity=".55"/>`).join('')}
          ${door(400, 130, 100, 140, o.doorOpen, false)}
          ${[361, 539].map(x => `<path d="M${x} 136 v10" stroke="${GOLD}"/><path d="M${x - 9} 146 h18 l-3 26 h-12z" fill="${GOLD}"/><circle cx="${x}" cy="160" r="16" fill="#ffd27a" opacity=".25"/><circle cx="${x}" cy="160" r="4" fill="#fff3c4"/>`).join('')}
          <rect y="270" width="900" height="90" fill="#262838"/><path d="M0 316 H900" stroke="#d9b866" stroke-width="2" stroke-dasharray="20 16" opacity=".6"/>
          <g><rect x="150" y="226" width="7" height="44" rx="3" fill="#f6f1e6"/><rect x="166" y="230" width="7" height="40" rx="3" fill="#f6f1e6"/><rect x="214" y="230" width="7" height="40" rx="3" fill="#f6f1e6"/><rect x="230" y="226" width="7" height="44" rx="3" fill="#f6f1e6"/>
            <ellipse cx="194" cy="222" rx="50" ry="22" fill="#f6f1e6"/><path d="M234 214 L254 176 L268 182 L258 214Z" fill="#f6f1e6"/><ellipse cx="264" cy="178" rx="11" ry="8" fill="#f6f1e6"/>
            <path d="M160 208 H228 V228 Q194 236 160 228Z" fill="#8c1d34"/><path d="M160 226 Q194 234 228 226" stroke="${GOLD2}" stroke-width="2" fill="none"/>
            <path d="M252 172 q-4 -14 8 -16" stroke="#c0392b" stroke-width="3" fill="none"/><path d="M144 216 q-12 8 -8 26" stroke="#e9e3d5" stroke-width="6" fill="none" stroke-linecap="round"/></g>
          <g><rect x="682" y="234" width="58" height="34" rx="14" fill="#b0503a"/><ellipse cx="682" cy="251" rx="6" ry="17" fill="#f6ead0"/><ellipse cx="740" cy="251" rx="6" ry="17" fill="#f6ead0"/><path d="M690 236 l10 30 l10 -30 l10 30 l10 -30" stroke="${GOLD2}" stroke-width="1.4" fill="none"/></g>
          <g><rect x="58" y="276" width="66" height="8" fill="#7a4a22"/><path d="M64 284 v14 M118 284 v14" stroke="#7a4a22" stroke-width="4"/>${egg(o, 'shehnai') ? EGG_ART.shehnai(66, 264) : ''}</g>`;
      },
    },
    mandap: {
      vb: '230 10 440 300',
      hots: { phool: [172, 232, 78, 62], basket2: [652, 232, 78, 62], agni: [416, 216, 68, 46], paan: [752, 280, 50, 30] },
      art(o) {
        let drapes = ''; for (let x = 0; x < 900; x += 90) drapes += `<path d="M${x} 0 Q${x + 45} 46 ${x + 90} 0" fill="${(x / 90) % 2 ? '#e7a4b4' : '#f3c9cf'}"/>`;
        let lights = ''; if (o.lit) for (let i = 0; i < 46; i++) lights += `<circle cx="${(i * 97) % 900}" cy="${50 + (i * 53) % 150}" r="2.4" fill="#fff3c4" opacity=".9"/>`;
        let mstr = ''; for (let x = 318; x <= 582; x += 22) mstr += `<path d="M${x} 96 V${150 + ((x * 5) % 40)}" stroke="${(x / 22) % 2 < 1 ? '#e8590c' : '#f2a71b'}" stroke-width="6" stroke-dasharray="5 3"/>`;
        const basket = x => `<path d="M${x} 262 L${x + 6} 292 H${x + 64} L${x + 70} 262Z" fill="#a87a3a"/><path d="M${x + 4} 272 H${x + 66}" stroke="#7a5a22"/>${[[12, -6, '#c0392b'], [24, -12, '#f2a71b'], [36, -8, '#fff'], [48, -13, '#c0392b'], [58, -6, '#f2a71b'], [30, 0, '#fff']].map(([dx, dy, c]) => `<circle cx="${x + dx}" cy="${262 + dy}" r="7" fill="${c}"/>`).join('')}`;
        return `
          <rect width="900" height="262" fill="#f6dcd6"/>${drapes}${lights}
          ${o.lit ? '<rect width="900" height="262" fill="#ffd27a" opacity=".12"/>' : ''}
          <rect y="262" width="900" height="98" fill="#e9b23a"/><path d="M0 290 H900" stroke="#c99a2a" stroke-width="2"/>
          <rect x="324" y="96" width="12" height="166" fill="${GOLD}"/><rect x="564" y="96" width="12" height="166" fill="${GOLD}"/>
          <path d="M296 98 L450 36 L604 98Z" fill="#8c1d34"/><path d="M296 98 H604" stroke="${GOLD2}" stroke-width="6"/>
          <path d="M310 104 q35 22 70 0 q35 22 70 0 q35 22 70 0 q35 22 70 0" stroke="#f3c9cf" stroke-width="5" fill="none"/>${mstr}
          <g><rect x="424" y="236" width="52" height="26" fill="#9c4a2a" stroke="#6b2f18" stroke-width="2"/><path d="M432 236 q8 -22 18 -28 q-2 14 8 10 q4 12 -6 18z" fill="#ff9a3c"/><path d="M444 236 q4 -12 8 -14 q0 8 4 6 q0 6 -4 8z" fill="#ffe08a"/>
            ${o.lit ? '<circle cx="450" cy="226" r="34" fill="#ffb347" opacity=".2"/>' : ''}</g>
          <g>${basket(176)}</g><g>${basket(656)}</g>
          <g><rect x="740" y="300" width="70" height="8" fill="#7a4a22"/>${egg(o, 'paan') ? EGG_ART.paan(758, 288) : ''}</g>`;
      },
    },
    pooja: {
      vb: '250 30 440 300',
      hots: { diyas: [330, 238, 240, 40], manas: [136, 214, 92, 60], thali: [640, 246, 100, 34], dhwaja: [56, 40, 70, 200], ghanti: [430, 24, 40, 74], door: [790, 110, 100, 184] },
      art(o) {
        const diyas = [0, 1, 2, 3, 4].map(i => diyaArt(370 + i * 40, 268, o.lit)).join('');
        return `
          <rect width="900" height="262" fill="#7a1f1f"/>
          ${[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => `<path d="M${i * 100} 0 v262" stroke="#8f2a24" stroke-width="40" opacity=".35"/>`).join('')}
          ${garland(0, 900, 20, 22, 44)}
          <g><path d="${arch(330, 70, 240, 170)}" fill="#5a3418"/><path d="${arch(342, 82, 216, 158)}" fill="#f2a33a"/>
            <path d="${arch(342, 82, 216, 158)}" fill="none" stroke="${GOLD2}" stroke-width="3"/>
            <path d="M342 150 Q450 128 558 150 V240 H342Z" fill="#e8590c" opacity=".9"/>
            <path d="M342 150 Q396 176 450 150 Q504 176 558 150" stroke="${GOLD2}" stroke-width="2" fill="none"/>
            <text x="450" y="128" text-anchor="middle" font-family="'Tiro Devanagari Hindi', serif" font-size="30" fill="#7a1f1f">श्री राम</text>
            <path d="M430 96 h40" stroke="#7a1f1f" stroke-width="2"/></g>
          ${egg(o, 'ghanti') ? EGG_ART.ghanti(440, 54) : ''}
          <g><path d="M90 40 V262" stroke="#7a4a22" stroke-width="4"/><path d="M92 44 L126 58 L92 72Z" fill="#f28c28"/></g>
          <rect y="262" width="900" height="98" fill="#c9a26a"/><rect x="300" y="262" width="300" height="12" fill="#8a5328"/>
          ${diyas}
          <g><path d="M142 270 L182 246 L222 270" stroke="#7a4a22" stroke-width="5" fill="none"/><path d="M148 256 L182 236 L216 256 L182 250Z" fill="#c0392b"/>
            <path d="M152 254 L182 238 L212 254" stroke="${GOLD2}" stroke-width="1.5" fill="none"/></g>
          <g><ellipse cx="690" cy="266" rx="46" ry="10" fill="${GOLD2}" stroke="#9c7a2f" stroke-width="2"/><circle cx="668" cy="262" r="5" fill="#c0392b"/><circle cx="712" cy="262" r="5" fill="#f2c94c"/>
            ${diyaArt(690, 262, true)}</g>
          ${door(800, 120, 80, 168, o.doorOpen, false)}`;
      },
    },
    mehendi: {
      vb: '200 30 480 310',
      hots: { motif: [330, 210, 200, 70], cones: [580, 240, 70, 36], jhoola: [96, 60, 110, 200], dholak: [680, 250, 70, 40], cone: [552, 286, 42, 24], gajra: [120, 230, 50, 20], door: [790, 110, 100, 184] },
      art(o) {
        const arches = [40, 260, 520].map(x => `<path d="${arch(x, 92, 90, 170)}" fill="#cfdcaf"/><path d="${arch(x, 92, 90, 170)}" fill="none" stroke="${GOLD}" stroke-width="2"/>`).join('');
        let hand = '<path d="M400 268 q-30 -6 -34 -36 l-10 -36 q-2 -8 6 -9 q7 0 9 8 l8 24 V178 q0 -9 8 -9 q8 0 8 9 v40 V168 q0 -9 8 -9 q8 0 8 9 v52 V174 q0 -9 8 -9 q8 0 8 9 v50 V188 q0 -8 7 -8 q7 0 7 8 v52 q0 24 -16 30z" fill="#f1cfae" stroke="#b9805a" stroke-width="1.5"/>';
        hand += `<g fill="none" stroke="#8a3b12" stroke-width="1.2"><circle cx="402" cy="236" r="9"/><circle cx="402" cy="236" r="4"/>${[0, 1, 2, 3, 4, 5, 6, 7].map(k => { const a = k * Math.PI / 4; return `<circle cx="${(402 + Math.cos(a) * 14).toFixed(1)}" cy="${(236 + Math.sin(a) * 14).toFixed(1)}" r="2.4"/>`; }).join('')}<path d="M380 212 q8 -6 16 0 M406 206 q8 -6 16 0"/></g>`;
        return `
          <rect width="900" height="262" fill="#e7eccf"/>${arches}
          ${garland(0, 900, 40, 24, 44)}
          <rect y="262" width="900" height="98" fill="#d9c9a0"/><path d="M0 290 H900" stroke="#c4b182" stroke-width="2"/>
          <g><path d="M120 40 V232 M190 40 V232" stroke="#a87a3a" stroke-width="2.2"/><rect x="108" y="230" width="94" height="10" rx="3" fill="#7a4a22"/><rect x="114" y="220" width="82" height="11" rx="5" fill="#2e8b57"/>
            ${garland(110, 200, 236, 8, 9)}${egg(o, 'gajra') ? EGG_ART.gajra(128, 214) : ''}</g>
          <g><rect x="320" y="270" width="220" height="10" fill="#7a4a22"/><path d="M330 280 v18 M530 280 v18" stroke="#7a4a22" stroke-width="5"/>${hand}</g>
          <g><path d="M582 270 q34 16 68 0z" fill="#9c7a2f"/><ellipse cx="616" cy="270" rx="34" ry="7" fill="${GOLD}"/>
            ${[0, 1, 2, 3].map(k => `<path d="M${596 + k * 12} 268 L${600 + k * 12} 244 L${604 + k * 12} 268Z" fill="#6b8f3a"/>`).join('')}</g>
          ${egg(o, 'cone') ? EGG_ART.cone(556, 292) : ''}
          <g><rect x="684" y="258" width="62" height="30" rx="13" fill="#b0503a"/><ellipse cx="684" cy="273" rx="6" ry="15" fill="#f6ead0"/><ellipse cx="746" cy="273" rx="6" ry="15" fill="#f6ead0"/></g>
          ${door(800, 120, 80, 168, o.doorOpen, false)}`;
      },
    },
    courtyard: {
      vb: '150 0 600 360',
      hots: {},
      art() {
        let lights = ''; for (let i = 0; i <= 30; i++) { const x = i * 30, y = 120 + Math.sin(i / 30 * Math.PI) * 26; lights += `<circle cx="${x}" cy="${y.toFixed(1)}" r="3" fill="${['#ffd27a', '#fff3d6'][i % 2]}"/>`; }
        return `
          <rect width="900" height="360" fill="#0b1633"/><rect width="900" height="200" fill="#122454" opacity=".6"/>
          ${starsField(90, 190, 11)}
          <path d="M700 50 a22 22 0 1 0 14 40 a18 18 0 1 1 -14 -40z" fill="#fff3d6"/>
          <path d="M0 210 V150 H120 V120 Q170 86 220 120 V150 H680 V120 Q730 86 780 120 V150 H900 V210Z" fill="#2a2140"/>
          ${[40, 160, 280, 560, 680, 800].map(x => `<path d="${arch(x, 160, 36, 50)}" fill="#ffcf7a" opacity=".7"/>`).join('')}
          <path d="M0 120 Q450 170 900 120" stroke="#3a3150" stroke-width="1.2" fill="none"/>${lights}
          <rect y="262" width="900" height="98" fill="#2a2230"/><path d="M0 262 H900" stroke="${GOLD}" stroke-width="2" opacity=".6"/>
          <g transform="translate(450 236)">
            <rect x="-150" y="20" width="300" height="8" rx="4" fill="#7a4a22"/>
            <path d="M-60 -10 Q0 -64 60 -10 V30 H-60Z" fill="#8c1d34" stroke="${GOLD2}" stroke-width="3"/>
            <path d="M-48 -6 Q0 -48 48 -6 V30 H-48Z" fill="#b0283c"/>
            <path d="M-48 2 Q0 20 48 2" stroke="${GOLD2}" stroke-width="2" fill="none"/>
            <path d="M0 -64 v-14" stroke="${GOLD2}" stroke-width="3"/><circle cx="0" cy="-80" r="4" fill="${GOLD2}"/>
            ${garland(-60, 60, -12, 16, 12).replace(/r="5"/g, 'r="3.6"')}
          </g>
          ${[230, 670].map(x => `<path d="M${x} 262 v-44" stroke="${GOLD}" stroke-width="2"/><path d="M${x - 9} 218 h18 l-3 20 h-12z" fill="${GOLD}"/><circle cx="${x}" cy="228" r="20" fill="#ffd27a" opacity=".22"/><circle cx="${x}" cy="228" r="4" fill="#fff3c4"/>`).join('')}
          ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(k => `<circle cx="${300 + (k * 47) % 300}" cy="${290 + (k * 13) % 50}" r="3" fill="${k % 2 ? '#e8590c' : '#f2a71b'}" opacity=".8"/>`).join('')}`;
      },
    },
    hall: {
      vb: '180 0 540 360',
      hots: {},
      art() {
        const arches = [60, 250, 560, 750].map(x => `<path d="${arch(x, 90, 90, 172)}" fill="#11605a"/><path d="${arch(x, 90, 90, 172)}" fill="none" stroke="${GOLD}" stroke-width="2"/><path d="${arch(x + 12, 104, 66, 158)}" fill="#ffcf7a" opacity=".25"/>`).join('');
        let chand = '';
        [300, 600].forEach(cx => { chand += `<path d="M${cx} 0 V34" stroke="${GOLD}" stroke-width="2"/>`; [[44, 40], [30, 56]].forEach(([w, y]) => { chand += `<path d="M${cx - w} ${y} Q${cx} ${y + 10} ${cx + w} ${y}" stroke="${GOLD}" stroke-width="2" fill="none"/>`; for (let k = -w; k <= w; k += 11) chand += `<path d="M${cx + k} ${y + 3} l2 7 l-2 4 l-2 -4z" fill="#e8f4f2"/>`; }); chand += `<circle cx="${cx}" cy="50" r="60" fill="#ffe7a8" opacity=".14"/>`; });
        return `
          <rect width="900" height="270" fill="#0f4c45"/>${arches}${chand}
          ${garland(0, 900, 24, 26, 44)}
          <path d="${arch(380, 70, 140, 192)}" fill="#ffe2a0"/><path d="${arch(380, 70, 140, 192)}" fill="none" stroke="${GOLD2}" stroke-width="4"/>
          <rect y="262" width="900" height="98" fill="#8c1d34"/><path d="M0 266 H900 M0 354 H900" stroke="${GOLD2}" stroke-width="2"/>
          ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(k => `<path d="M${40 + k * 82} 300 l10 12 l-10 12 l-10 -12z" fill="${GOLD2}" opacity=".6"/>`).join('')}
          ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(k => `<circle cx="${(k * 83) % 900}" cy="${150 + (k * 37) % 90}" r="2" fill="#fff3c4" opacity=".8"/>`).join('')}`;
      },
    },
  };
  function sceneSVG(key, o, vb, extra) {
    return `<svg viewBox="${vb || '0 0 900 360'}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">${SCENES[key].art(o || {})}${extra || ''}</svg>`;
  }

  /* ---------------------------------------------------------------- items, eggs */
  const ITEMS = {
    pot7: 'Violet colour pot', key: 'Brass key', kapde: 'Silk clothes', mithai: 'Box of mithai',
    nariyal: 'Coconut', shagun: 'Shagun potli', ring: 'Engagement ring', lari: 'Sehra string',
  };
  const ICON = {
    pot7: '<svg viewBox="0 0 24 24"><path d="M6 21 q0 -11 6 -11 q6 0 6 11z" fill="#8e44ad"/><rect x="7.5" y="7" width="9" height="3" rx="1" fill="#a560c4"/></svg>',
    key: '<svg viewBox="0 0 24 24"><circle cx="7" cy="12" r="4.5" fill="none" stroke="#b8913f" stroke-width="2.4"/><path d="M11.5 12 H21 M18 12 v3.5 M15 12 v2.5" stroke="#b8913f" stroke-width="2.4"/></svg>',
    kapde: '<svg viewBox="0 0 24 24"><rect x="3" y="15" width="18" height="4" rx="1" fill="#e67e22"/><rect x="4" y="11" width="16" height="4" rx="1" fill="#d6336c"/><rect x="5" y="7" width="14" height="4" rx="1" fill="#2e8b57"/></svg>',
    mithai: '<svg viewBox="0 0 24 24"><rect x="3" y="8" width="18" height="11" fill="#f0a6b8" stroke="#b8913f"/><path d="M3 12 h18 M12 8 v11" stroke="#b8913f"/></svg>',
    nariyal: '<svg viewBox="0 0 24 24"><ellipse cx="12" cy="14" rx="7" ry="8" fill="#7a4a22"/><path d="M12 6 q-2 -4 0 -5 q2 1 0 5" fill="#5a3418"/></svg>',
    shagun: '<svg viewBox="0 0 24 24"><path d="M6 21 q-3 -12 6 -13 q9 1 6 13z" fill="#c0392b"/><path d="M8 9 q4 3 8 0" stroke="#d9b866" stroke-width="2" fill="none"/></svg>',
    ring: '<svg viewBox="0 0 24 24"><circle cx="12" cy="15" r="6" fill="none" stroke="#d9b866" stroke-width="2.6"/><path d="M12 3 l3.5 3.5 -3.5 3.5 -3.5 -3.5z" fill="#cfeef2" stroke="#8fb8c0" stroke-width=".8"/></svg>',
    lari: '<svg viewBox="0 0 24 24"><g fill="#fbf6ea" stroke="#c9b48a" stroke-width=".7"><circle cx="5" cy="6" r="2.4"/><circle cx="8" cy="10" r="2.4"/><circle cx="11" cy="14" r="2.4"/><circle cx="15" cy="16" r="2.4"/><circle cx="19" cy="18" r="2.4"/></g></svg>',
  };
  const EGGS = {
    lifafa: 'A shagun envelope: ₹101 and a coin. Someone placed it here with great love.',
    jutti: 'The groom’s jutti! The first round of Joota Chupai is yours.',
    laddoo: 'A bowl of laddoos. One, just to taste.',
    chashma: 'Mamaji’s spectacles. He has been looking for them all evening.',
    gramophone: 'Old songs on a gramophone: an old tune for a new beginning.',
    kaleera: 'The soft chime of kaleere. They say whoever they fall on is next.',
    ghanti: 'A small temple bell. Its gentle ring fills the room.',
    cone: 'A spare mehendi cone. Perhaps a little design on your palm too?',
    gajra: 'A fresh mogra gajra left on the swing. The fragrance gave it away.',
    shehnai: 'A shehnai, waiting at the doorway. The baraat is almost here.',
    paan: 'A silver tray of meetha paan, for after the feast.',
  };

  /* ---------------------------------------------------------------- rooms per event id */
  function roomDefs(ctx) {
    const firstLine = (ctx.T.sunderkand || '').split('\n')[0];
    return {
      sunderkand: { scene: 'pooja', name: 'Pooja Kaksh', puzzles: ['diya'],
        intro: ['narr', 'The pooja room is quiet and fragrant. Five diyas wait on the ledge. Light them in the order the flame shows you.'],
        done: ['narr', 'The diyas are lit. May Hanuman ji bless every step ahead.'],
        note: 'Let us seek Hanuman ji’s blessings together.',
        hots: {
          diyas: { t: 'puzzle', pz: 'diya' },
          manas: { t: 'look', say: ['narr', firstLine ? `The Ramcharitmanas rests open at Sunderkand: “${firstLine}”` : 'The Ramcharitmanas rests open at Sunderkand.'] },
          thali: { t: 'look', say: ['narr', 'Roli, chawal, flowers and a diya. The aarti thali is ready.'] },
          dhwaja: { t: 'look', say: ['narr', 'A saffron dhwaja, gently stirring. Jai Shri Ram.'] },
          ghanti: { t: 'egg', egg: 'ghanti' },
          door: { t: 'door' },
        } },
      mehandi: { scene: 'mehendi', name: 'Mehendi Aangan', puzzles: ['motif'],
        intro: ['a', 'The mehendi courtyard! The artist left one part of my design unfinished. Will you help me choose the right motif?'],
        done: ['a', 'The design is complete. Now the colour only has to deepen.'],
        note: 'Mehendi, geet and an evening with family.',
        hots: {
          motif: { t: 'puzzle', pz: 'motif' },
          cones: { t: 'look', say: ['narr', 'A bowl of fresh mehendi cones. The fragrance is wonderful.'] },
          jhoola: { t: 'look', say: ['narr', 'A swing decked with marigolds, waiting for the geet to begin.'] },
          dholak: { t: 'look', say: ['a', 'The dholak for the geet. The singing will start any moment.'] },
          cone: { t: 'egg', egg: 'cone' },
          gajra: { t: 'egg', egg: 'gajra' },
          door: { t: 'door' },
        } },
      engagement: { scene: 'sangeet', name: 'Sangeet Mahal', puzzles: ['dholak'],
        intro: ['a', 'The Sangeet Mahal! But my engagement ring has gone missing… there is no sangeet without it.'],
        done: ['both', 'The ring is found and the rhythm is set. The sangeet evening awaits.'],
        note: 'Rings, music and dancing, late into the evening.',
        hots: {
          basket: { t: 'item', item: 'ring', say: ['a', 'Found it! In the flower basket, among the mogra: my ring.'] },
          velvet: { t: 'look', say: ['narr', 'The velvet box is empty. The real ring is elsewhere.'] },
          gaddi: { t: 'look', say: ['narr', 'Under the cushions: two coins and a forgotten chunri.'] },
          harmonium: { t: 'look', say: ['narr', 'Last night’s songs still linger in the harmonium.'] },
          dholak: { t: 'puzzle', pz: 'dholak' },
          door: { t: 'door' },
          gramophone: { t: 'egg', egg: 'gramophone' },
          kaleera: { t: 'egg', egg: 'kaleera' },
        } },
      bhaat: { scene: 'bhaat', name: 'Bhaat Kaksh', puzzles: ['thaal'],
        intro: ['n', 'The Bhaat chamber. Mamaji’s thaal needs clothes, mithai, a coconut and shagun. All of it is somewhere in this room.'],
        done: ['both', 'The thaal is complete: the love of the nanihaal, in all its finery.'],
        note: 'Blessings from the nanihaal, arriving in full splendour.',
        hots: {
          kapde: { t: 'item', item: 'kapde', say: ['narr', 'Folded silk on the chowki.'] },
          mithai: { t: 'item', item: 'mithai', say: ['narr', 'A box of silver-leaf mithai in the almirah.'] },
          nariyal: { t: 'item', item: 'nariyal', say: ['narr', 'A coconut on the kalash, a sign of auspicious beginnings.'] },
          shagun: { t: 'item', item: 'shagun', say: ['narr', 'A red silk shagun potli in a carved casket.'] },
          radio: { t: 'look', say: ['narr', 'An old radio, full of Vividh Bharati memories. It does not belong in the thaal.'] },
          takiya: { t: 'look', say: ['narr', 'A velvet bolster, meant for comfort, not for the thaal.'] },
          thaal: { t: 'puzzle', pz: 'thaal' },
          door: { t: 'door' },
          laddoo: { t: 'egg', egg: 'laddoo' },
          chashma: { t: 'egg', egg: 'chashma' },
        } },
      haldi: { scene: 'haldi', name: 'Haldi Aangan', lock: 'key', puzzles: ['rainbow'],
        intro: ['a', 'The courtyard door is locked. These colour pots seem to hold a secret. Shall we look closely?'],
        done: ['n', 'The key turns. Haldi colours and your company: let us go on.'],
        note: 'Morning sunshine, haldi, and the laughter of family.',
        hots: {
          tulsi: { t: 'item', item: 'pot7', say: ['narr', 'Behind the tulsi chaura, a violet colour pot was hiding.'] },
          jhoola: { t: 'look', say: ['narr', 'A swing with silk ropes. So many childhood evenings must have passed here.'] },
          urli: { t: 'look', say: ['narr', 'Marigolds float in a brass urli. The Haldi morning is being readied.'] },
          jharokha: { t: 'look', say: ['narr', 'Evening light through the jharokha. Someone up there is smiling.'] },
          pots: { t: 'puzzle', pz: 'rainbow' },
          door: { t: 'door' },
          lifafa: { t: 'egg', egg: 'lifafa' },
        } },
      ghudchadi: { scene: 'galiyara', name: 'Sehra Kaksh', puzzles: ['sehra'],
        intro: ['n', 'The groom’s chamber. My sehra is incomplete: one string has gone missing.'],
        done: ['n', 'The sehra is tied. The ghodi awaits.'],
        note: 'The sehra is tied with family blessings, and the groom mounts the ghodi.',
        hots: {
          lari: { t: 'item', item: 'lari', say: ['narr', 'A pearl string for the sehra, in the jewellery casket.'] },
          sehra: { t: 'puzzle', pz: 'sehra' },
          mirror: { t: 'look', say: ['n', 'An old mirror. Today it shows a groom: a little nervous, very happy.'] },
          door: { t: 'door' },
          jutti: { t: 'egg', egg: 'jutti' },
        } },
      baraat: { scene: 'gate', name: 'Baraat Dwaar', puzzles: ['maze'],
        intro: ['a', 'The baraat has reached the gate. Guide the ghodi through to the doorway.'],
        done: ['a', 'The baraat is at the door. What a sight!'],
        note: 'Dhol, lights and the ghodi: the baraat sets off from here.',
        hots: {
          gateDoor: { t: 'puzzle', pz: 'maze' },
          lantern: { t: 'look', say: ['narr', 'Brass lanterns, each with a tiny flame, welcoming the baraat.'] },
          ghodi: { t: 'look', say: ['n', 'Our ghodi: beautifully dressed, and calmer than the groom.'] },
          dhol: { t: 'look', say: ['narr', 'The dhol is ready, waiting for its first beat.'] },
          shehnai: { t: 'egg', egg: 'shehnai' },
        } },
      dinner: { scene: 'mandap', name: 'Mandap & Daawat', puzzles: ['memory'],
        intro: ['both', 'The mandap is ready, but the varmala flowers are scattered. Will you match the pairs?'],
        done: ['both', 'The varmala is ready. Now we only await your blessings.'],
        note: 'The varmala, the pheras, and a royal feast.',
        hots: {
          phool: { t: 'puzzle', pz: 'memory' },
          basket2: { t: 'look', say: ['narr', 'A basket of rose petals, to shower after the pheras.'] },
          agni: { t: 'look', say: ['narr', 'The sacred fire is ready. Seven vows, seven pheras.'] },
          paan: { t: 'egg', egg: 'paan' },
        } },
    };
  }

  /* ---------------------------------------------------------------- puzzle data */
  const RB = [['Red', '#c0392b'], ['Orange', '#e67e22'], ['Yellow', '#f1c40f'], ['Green', '#2e8b57'], ['Blue', '#2f6fbf'], ['Indigo', '#3f3a8c'], ['Violet', '#8e44ad']];
  const RB_ORDER = [3, 0, 5, 2, 6, 1, 4];
  const potSVG = c => `<svg viewBox="0 0 30 36" aria-hidden="true"><path d="M5 34 q0 -20 10 -20 q10 0 10 20z" fill="${c}"/><rect x="7" y="9" width="16" height="5" rx="2" fill="${c}"/><path d="M8 26 h14" stroke="#fff" stroke-width="1.2" opacity=".5"/></svg>`;
  const THAAL_NEED = ['kapde', 'mithai', 'nariyal', 'shagun'];
  const DHOL_SEQ = ['dha', 'dhin', 'na', 'dha'];
  const DHOL = { dha: 'Dha', dhin: 'Dhin', na: 'Na' };
  const LARIS = [1, 2, 3, 4, 5], LARI_MISSING = 3, LARI_ORDER = [4, 1, 5, 2, 3];
  const MAZE = ['..d.G', '.p...', '...m.', 'f.d..', 'S...p'];
  const BLOCK = {
    d: ['Dhol', 'The dhol players are lost in their rhythm. Take another way.'],
    p: ['Photo', 'The photographer wants one more picture. Smile, and move on.'],
    m: ['Guests', 'A cluster of guests is showering blessings. Go around them.'],
    f: ['Flowers', 'A cart of flowers stands in the way.'],
  };
  const HORSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 21 V13 q0 -6 5 -8 l2 -3 1 3 q4 2 4 7 l-1 3 q-2 2 -4 0 l-2 -1 v7z" fill="#0f4c45"/><path d="M11 6 q-3 1 -4 5" stroke="#6e1a2c" stroke-width="1.6" fill="none"/></svg>';
  const FLOWERS = [
    ['Genda', '<svg viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="15" fill="#e8590c"/>' + Array.from({ length: 10 }, (_, k) => { const a = k * Math.PI / 5; return `<circle cx="${(22 + Math.cos(a) * 10).toFixed(1)}" cy="${(22 + Math.sin(a) * 10).toFixed(1)}" r="5" fill="#f2a71b"/>`; }).join('') + '<circle cx="22" cy="22" r="5" fill="#c2410c"/></svg>'],
    ['Gulab', '<svg viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="15" fill="#b0203a"/><path d="M22 12 q8 2 8 10 q-2 8 -8 8 q-7 -1 -7 -7 q1 -5 6 -5 q4 1 4 4" stroke="#7a0f22" stroke-width="2" fill="none"/></svg>'],
    ['Mogra', '<svg viewBox="0 0 44 44" aria-hidden="true">' + Array.from({ length: 6 }, (_, k) => { const a = k * Math.PI / 3, cx = (22 + Math.cos(a) * 9).toFixed(1), cy = (22 + Math.sin(a) * 9).toFixed(1); return `<ellipse cx="${cx}" cy="${cy}" rx="7" ry="4.5" transform="rotate(${k * 60} ${cx} ${cy})" fill="#fff" stroke="#d8d0bc"/>`; }).join('') + '<circle cx="22" cy="22" r="4" fill="#f2d16b"/></svg>'],
  ];
  const MEM_ORDER = [0, 2, 1, 0, 1, 2];
  const DIYA_SEQ = [2, 0, 4, 1, 3];
  const DIYA_WORDS = ['first', 'second', 'third', 'fourth', 'fifth'];
  const MOTIF = {
    keri: '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 34 q-12 -2 -12 -14 q0 -12 14 -14 q-6 6 -2 12 q8 4 6 12 q-2 4 -6 4z" fill="none" stroke="#8a3b12" stroke-width="2"/><circle cx="17" cy="22" r="3" fill="#8a3b12"/></svg>',
    phool: '<svg viewBox="0 0 40 40" aria-hidden="true"><g fill="none" stroke="#8a3b12" stroke-width="2">' + [0, 1, 2, 3, 4, 5].map(k => { const a = k * Math.PI / 3, cx = (20 + Math.cos(a) * 9).toFixed(1), cy = (20 + Math.sin(a) * 9).toFixed(1); return `<ellipse cx="${cx}" cy="${cy}" rx="6" ry="3.6" transform="rotate(${k * 60} ${cx} ${cy})"/>`; }).join('') + '</g><circle cx="20" cy="20" r="3" fill="#8a3b12"/></svg>',
    patti: '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M8 32 Q8 10 32 8 Q30 30 8 32z M8 32 L26 14" fill="none" stroke="#8a3b12" stroke-width="2"/><path d="M14 26 l-3 -5 M19 21 l-2 -6 M14 26 l5 1 M19 21 l6 1" stroke="#8a3b12" stroke-width="1.4"/></svg>',
  };
  const MOTIF_GRID = ['keri', 'phool', 'patti', 'phool', 'patti', 'keri', 'patti', 'keri', null];
  const MOTIF_ANSWER = 'phool';
  const MOTIF_NAMES = { keri: 'Paisley (keri)', phool: 'Flower (phool)', patti: 'Leaf (patti)' };

  /* ================================================================ render */
  Invite.register('escape', {
    render(root, ctx) {
      const esc = ctx.esc, P = ctx.P, S = ctx.isStatic, RM = ctx.reducedMotion;
      const evs = ctx.events;
      const DEFS = roomDefs(ctx);
      const ROOMS = evs.filter(e => DEFS[e.id]).map(e => Object.assign({ ev: e }, DEFS[e.id]));
      const VID = evs.find(e => e.id === 'vidaai');
      const FIN_SCENE = VID ? 'courtyard' : 'hall';
      const isSk = ctx.occasion.key === 'sunderkand';

      const mono = `<svg viewBox="0 0 76 86" aria-hidden="true"><path d="M4 86V38A34 34 0 0 1 72 38V86Z" fill="#0f4c45"/><path d="M9 86V39A29 29 0 0 1 67 39V86" fill="none" stroke="#d9b866" stroke-width="1.2"/>
        <text x="25" y="58" text-anchor="middle" font-family="Prata, Georgia, serif" font-size="20" fill="#d9b866">${esc(P.groom[0])}</text>
        <text x="51" y="58" text-anchor="middle" font-family="Prata, Georgia, serif" font-size="20" fill="#d9b866">${esc(P.bride[0])}</text>
        <path d="M38 46l2.5 5 -2.5 5 -2.5 -5z" fill="#d9b866"/></svg>`;
      const finHead = VID ? 'Taaron ki Chhaon Mein' : isSk ? 'The path awaits' : 'Before the muhurat: you made it.';
      const finText = VID
        ? `Under the stars, ${P.groom} and ${P.bride} begin their journey together. Your blessings would make it complete.`
        : isSk
          ? 'The diyas are lit and the path is ready. We look forward to seeking Hanuman ji’s blessings with you.'
          : `With you by their side, ${P.groom} and ${P.bride} reached in time. We look forward to celebrating with you.`;
      const finVB = SCENES[FIN_SCENE].vb;
      const gan = (Invite.art && Invite.art.ganesh) ? Invite.art.ganesh({ size: 52, className: 'escape-ganesh-svg' }) : '';

      const mast = btns => `
        <header class="escape-mast">
          <p class="escape-shloka" lang="hi">${esc(ctx.T.ganeshShort)}</p>
          ${gan ? `<div class="escape-ganesh">${gan}</div>` : ''}
          <div class="escape-mono">${mono}</div>
          <p class="escape-eyebrow">${esc(ctx.occasion.title)} · A haveli · A few closed doors</p>
          <h1 class="escape-h1">Haveli Ke <em>Darwaze</em></h1>
          <p class="escape-lede"><b>${esc(ctx.greeting)}</b>, on this special evening the haveli’s doors have quietly closed, and you are inside with ${esc(P.groom)} and ${esc(P.bride)}. Find your way through; every chamber opens an invitation.</p>
          ${btns ? `<div class="escape-actions">
            <button type="button" class="escape-btn escape-primary" data-act="start">Enter the haveli</button>
            <button type="button" class="escape-btn" data-act="skip">Skip to details</button>
          </div>` : ''}
        </header>`;
      const details = `<section class="escape-details" aria-label="Your invitation"><h2 class="escape-sec">Your invitation</h2>${ctx.summaryHTML()}</section>`;

      /* ---------- static (image card) ---------- */
      if (S) {
        root.innerHTML = `<div class="escape-app escape-static">
          ${mast(false)}
          <section class="escape-finale">
            <div class="escape-hall"><div class="escape-hall-scene">${sceneSVG(FIN_SCENE, { lit: true }, finVB, COUPLE)}</div></div>
            <h2 class="escape-fin-h">${esc(finHead)}</h2>
            <p class="escape-fin-p">${esc(finText)}</p>
          </section>
          ${details}
        </div>`;
        ctx.ready();
        return;
      }

      /* ---------- interactive markup ---------- */
      const lastTimed = evs.slice().reverse().find(e => e.start);
      root.innerHTML = `<div class="escape-app">
        ${mast(true)}
        <section class="escape-game"${ROOMS.length ? '' : ' hidden'} aria-label="The haveli">
          <div class="escape-hud">
            <div class="escape-clock">
              <svg viewBox="0 0 40 40" aria-hidden="true">
                <circle cx="20" cy="20" r="18" fill="#fbf6ea" stroke="#d9b866" stroke-width="3"/>
                <g stroke="#7a5a22" stroke-width="1.2"><path d="M20 4v3M20 33v3M4 20h3M33 20h3"/></g>
                <path class="escape-hh" d="M20 20V11" stroke="#1f3d36" stroke-width="2.2" stroke-linecap="round"/>
                <path class="escape-mh" d="M20 20V7" stroke="#6e1a2c" stroke-width="1.4" stroke-linecap="round"/>
                <circle cx="20" cy="20" r="1.8" fill="#b8913f"/>
              </svg>
              <div><span class="escape-clock-t">—</span><small>${lastTimed ? 'Muhurat · ' + esc(lastTimed.time) : 'The muhurat'}</small></div>
            </div>
            <div class="escape-lamps" aria-label="Chambers"></div>
            <div class="escape-eggs"><span class="escape-egg-n">✦ 0</span><small>Hidden things</small></div>
          </div>
          <div class="escape-room-title"><span class="escape-ord"></span><h2 class="escape-room-name"></h2></div>
          <div class="escape-view" tabindex="0" aria-label="The chamber. Drag or use the arrows to look around; tap glinting things.">
            <div class="escape-scene"></div>
            <button type="button" class="escape-pan escape-pan-l" aria-label="Look left">‹</button>
            <button type="button" class="escape-pan escape-pan-r" aria-label="Look right">›</button>
            <div class="escape-pos" aria-hidden="true"><i></i></div>
          </div>
          <p class="escape-view-hint">Drag to look around · tap anything that glints</p>
          <div class="escape-speech">
            <div class="escape-por escape-por-n" aria-hidden="true">${POR_N}</div>
            <div class="escape-cap" aria-live="polite"><b class="escape-cap-who">The haveli</b><p class="escape-cap-t"></p></div>
            <div class="escape-por escape-por-a" aria-hidden="true">${POR_A}</div>
          </div>
          <div class="escape-inv"><span class="escape-inv-l">You carry</span><div class="escape-inv-items"></div></div>
          <div class="escape-next" hidden><button type="button" class="escape-btn escape-primary" data-act="next">On to the next chamber →</button></div>
        </section>
        <section class="escape-finale" hidden aria-label="Finale">
          <div class="escape-hall"><div class="escape-hall-scene"></div><div class="escape-leaf escape-leaf-l"></div><div class="escape-leaf escape-leaf-r"></div></div>
          <h2 class="escape-fin-h">${esc(finHead)}</h2>
          <p class="escape-fin-p">${esc(finText)}</p>
          <div class="escape-badge" hidden>
            <svg class="escape-medal" viewBox="0 0 58 58" aria-hidden="true"><circle cx="29" cy="29" r="26" fill="#d9b866"/><circle cx="29" cy="29" r="20" fill="none" stroke="#7a5a22" stroke-width="1.2"/><path d="M29 15l3.6 8.6 9.2.7-7 6 2.2 9-8-5-8 5 2.2-9-7-6 9.2-.7z" fill="#0b2e2b"/></svg>
            <h3>Shaadi Ke Asli Jasoos</h3>
            <p>Not a corner of the haveli escaped your eye. With guests like you, nothing at a wedding can ever go missing. With love, ${esc(P.groom)} &amp; ${esc(P.bride)}</p>
          </div>
          <button type="button" class="escape-btn escape-primary" data-act="deck">View invitation</button>
        </section>
        ${details}
        <div class="escape-pm" hidden role="dialog" aria-modal="true" aria-labelledby="escape-pm-title">
          <div class="escape-pm-back" data-act="pmclose"></div>
          <div class="escape-pm-card">
            <p class="escape-pm-kicker"></p>
            <h3 class="escape-pm-title" id="escape-pm-title"></h3>
            <p class="escape-pm-instr"></p>
            <div class="escape-pm-body"></div>
            <p class="escape-pm-msg" aria-live="polite"></p>
            <p class="escape-pm-hint" hidden></p>
            <div class="escape-pm-actions">
              <button type="button" class="escape-btn" data-act="hint">Hint</button>
              <button type="button" class="escape-btn" data-act="reveal">Show the answer</button>
              <button type="button" class="escape-btn escape-quiet" data-act="pmclose">Close</button>
            </div>
          </div>
        </div>
        <div class="escape-veil" aria-hidden="true"><div><span class="escape-veil-o"></span><b class="escape-veil-n"></b></div></div>
        <div class="escape-toast" role="status"></div>
      </div>`;

      const q = s => root.querySelector(s);
      const qa = s => Array.prototype.slice.call(root.querySelectorAll(s));
      const view = q('.escape-view'), sceneEl = q('.escape-scene'), pm = q('.escape-pm');
      const pmBody = q('.escape-pm-body'), pmMsgEl = q('.escape-pm-msg'), pmHint = q('.escape-pm-hint');
      const wait = ms => new Promise(r => setTimeout(r, RM ? Math.min(ms, 120) : ms));
      const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
      const smooth = RM ? 'auto' : 'smooth';
      const snd = n => ctx.sound.play(n);

      /* ---------- state ---------- */
      let roomIdx = 0, started = false, finished = false, busy = false, roomDone = false, doorOpen = false;
      let inv = [], hidden = new Set(), seen = new Set(), solved = new Set(), eggsFound = new Set();
      let rbPlaced = 0, sehraTied = 1, curPz = null, ps = {};
      const EGG_TOTAL = new Set(ROOMS.flatMap(r => Object.values(r.hots).filter(c => c.t === 'egg').map(c => c.egg))).size;
      const room = () => ROOMS[roomIdx];

      /* ---------- caption & toast ---------- */
      function say(who, text) {
        q('.escape-cap-who').textContent = who === 'n' ? P.groom : who === 'a' ? P.bride : who === 'both' ? `${P.groom} & ${P.bride}` : 'The haveli';
        q('.escape-cap-t').textContent = text;
        q('.escape-por-n').classList.toggle('is-on', who === 'n' || who === 'both');
        q('.escape-por-a').classList.toggle('is-on', who === 'a' || who === 'both');
      }
      let toastT = 0;
      function toast(html) {
        const t = q('.escape-toast'); t.innerHTML = html; t.classList.add('is-on');
        clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('is-on'), 3600);
      }

      /* ---------- muhurat clock: drifts toward the last timed event, never reaches it ---------- */
      const M = lastTimed ? +lastTimed.start.split(':')[0] * 60 + +lastTimed.start.split(':')[1] : 20 * 60 + 30;
      const T0 = M - 50, TCALL = M - 10, TMAX = M - 3;
      let gm = T0, acc = 0, called = false;
      function renderClock() {
        const h = Math.floor(gm / 60), m = gm % 60;
        q('.escape-clock-t').textContent = `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
        q('.escape-mh').setAttribute('transform', `rotate(${m * 6} 20 20)`);
        q('.escape-hh').setAttribute('transform', `rotate(${(h % 12) * 30 + m * .5} 20 20)`);
      }
      setInterval(() => {
        if (!started || finished || !pm.hidden || !root.isConnected) return;
        if (++acc >= (gm < M - 15 ? 4 : 10)) {
          acc = 0; if (gm < TMAX) gm++;
          if (gm >= TCALL && !called) { called = true; toast('<b>A note from Pandit ji:</b> “Everything is being readied. Come at your ease.”'); }
          renderClock();
        }
      }, 1000);

      /* ---------- HUD ---------- */
      function renderLamps() {
        const lampSvg = '<svg viewBox="0 0 20 24" aria-hidden="true"><path class="escape-flame" d="M10 2 q-5 7 0 11 q5 -4 0 -11z"/><path d="M2 15 h16 q-2 7 -8 7 q-6 0 -8 -7z" fill="#d9b866"/></svg>';
        q('.escape-lamps').innerHTML = ROOMS.map((_, i) => `<span class="${i < roomIdx || (i === roomIdx && roomDone) ? 'is-lit' : ''}">${lampSvg}</span>`).join('');
      }
      const renderEggs = () => { q('.escape-egg-n').textContent = `✦ ${eggsFound.size}/${EGG_TOTAL}`; };
      function renderInv(newId) {
        q('.escape-inv-items').innerHTML = inv.length
          ? inv.map(id => `<span class="escape-item${id === newId ? ' is-new' : ''}">${ICON[id]}${esc(ITEMS[id])}</span>`).join('')
          : '<span class="escape-inv-empty">Nothing yet. Look around the chamber.</span>';
      }

      /* ---------- scene, panning, hotspots ---------- */
      let VW = 0, VH = 0, SW = 0, panX = 0;
      function hotsHTML() {
        const r = room(), defs = SCENES[r.scene].hots;
        let h = '<g>';
        Object.keys(r.hots).forEach(id => {
          const cfg = r.hots[id];
          if ((cfg.t === 'item' && hidden.has(cfg.item)) || (cfg.t === 'egg' && eggsFound.has(cfg.egg)) || !defs[id]) return;
          const [x, y, w, hh] = defs[id];
          const gx = x + w / 2, gy = y + Math.min(14, hh / 3), s = cfg.t === 'egg' ? 3.5 : 6;
          h += `<rect class="escape-hit" data-hot="${id}" x="${x}" y="${y}" width="${w}" height="${hh}"/>`;
          h += `<path class="escape-glint${cfg.t === 'egg' ? ' is-egg' : ''}${seen.has(id) ? ' is-seen' : ''}" style="animation-delay:${((x * 7) % 23) / 10}s" d="M${gx} ${gy - s}L${gx + s * .25} ${gy - s * .25}L${gx + s} ${gy}L${gx + s * .25} ${gy + s * .25}L${gx} ${gy + s}L${gx - s * .25} ${gy + s * .25}L${gx - s} ${gy}L${gx - s * .25} ${gy - s * .25}Z"/>`;
        });
        return h + '</g>';
      }
      const roomEggs = () => new Set(Object.values(room().hots).filter(c => c.t === 'egg').map(c => c.egg));
      function drawScene() {
        const r = room();
        sceneEl.innerHTML = sceneSVG(r.scene, { hide: new Set([...hidden, ...eggsFound]), eggs: roomEggs(), doorOpen, lock: r.lock === 'key', lit: r.scene === 'pooja' && roomDone }, '0 0 900 360', hotsHTML());
        layout();
      }
      function layout() {
        if (!ROOMS.length) return;
        VW = view.clientWidth; VH = view.clientHeight; SW = Math.round(VH * 900 / 360);
        const svg = sceneEl.querySelector('svg');
        if (svg) { svg.setAttribute('width', SW); svg.setAttribute('height', VH); }
        setPan(panX, false);
      }
      function setPan(x, anim) {
        panX = clamp(x, 0, Math.max(0, SW - VW));
        sceneEl.style.transition = anim !== false && !RM ? 'transform .55s cubic-bezier(.3,.7,.3,1)' : 'none';
        sceneEl.style.transform = `translateX(${-panX}px)`;
        const bar = q('.escape-pos i');
        bar.style.width = (Math.min(1, VW / Math.max(1, SW)) * 100) + '%'; bar.style.left = (panX / Math.max(1, SW) * 100) + '%';
        q('.escape-pan-l').disabled = panX <= 1; q('.escape-pan-r').disabled = panX >= SW - VW - 1;
      }
      q('.escape-pan-l').addEventListener('click', () => setPan(panX - VW * .6));
      q('.escape-pan-r').addEventListener('click', () => setPan(panX + VW * .6));
      if (root.ResizeObserver || window.ResizeObserver) new ResizeObserver(layout).observe(view);

      let drag = null;
      view.addEventListener('pointerdown', e => { if (e.target.closest('.escape-pan')) return; drag = { x: e.clientX, p: panX, moved: false, target: e.target }; });
      view.addEventListener('pointermove', e => {
        if (!drag) return;
        const dx = e.clientX - drag.x;
        if (!drag.moved && Math.abs(dx) > 7) { drag.moved = true; view.classList.add('is-drag'); try { view.setPointerCapture(e.pointerId); } catch (er) { /* ignore */ } }
        if (drag.moved) setPan(drag.p - dx, false);
      });
      view.addEventListener('pointerup', () => {
        if (!drag) return;
        const d = drag; drag = null; view.classList.remove('is-drag');
        if (!d.moved) { const h = d.target.closest && d.target.closest('[data-hot]'); if (h) tapHot(h.getAttribute('data-hot')); }
      });
      view.addEventListener('pointercancel', () => { drag = null; view.classList.remove('is-drag'); });
      view.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft') { e.preventDefault(); setPan(panX - VW * .4); }
        if (e.key === 'ArrowRight') { e.preventDefault(); setPan(panX + VW * .4); }
      });

      function begin() { if (!started) { started = true; renderClock(); } }

      function tapHot(id) {
        if (busy || finished) return;
        begin();
        const cfg = room().hots[id];
        if (!cfg) return;
        seen.add(id); snd('tap');
        if (cfg.t === 'look') { say(cfg.say[0], cfg.say[1]); drawScene(); return; }
        if (cfg.t === 'item') {
          hidden.add(cfg.item); inv.push(cfg.item); snd('pop');
          say(cfg.say[0], cfg.say[1]); toast(`<b>Found:</b> ${esc(ITEMS[cfg.item])}`);
          renderInv(cfg.item); drawScene(); return;
        }
        if (cfg.t === 'egg') {
          eggsFound.add(cfg.egg); snd('chime'); renderEggs(); drawScene();
          toast(`<b>✦ Hidden thing ${eggsFound.size}/${EGG_TOTAL}</b> ${esc(EGGS[cfg.egg])}`);
          if (eggsFound.size === EGG_TOTAL && EGG_TOTAL > 1) setTimeout(() => toast('<b>✦ You found every hidden thing!</b> A small honour awaits you at the end.'), 3800);
          return;
        }
        if (cfg.t === 'door') { tapDoor(); return; }
        if (cfg.t === 'puzzle') {
          if (solved.has(cfg.pz)) { say('narr', 'This one is already solved.'); return; }
          openPuzzle(cfg.pz);
        }
      }
      function tapDoor() {
        const r = room();
        if (roomDone) { goNext(); return; }
        if (r.lock === 'key') {
          if (inv.includes('key')) { inv = inv.filter(x => x !== 'key'); renderInv(); completeRoom(); }
          else if (solved.has('rainbow')) { say('n', 'The key is in your tray. Tap the door once more.'); }
          else { snd('tap'); say('n', 'A brass lock on the door. The key must be somewhere in this courtyard.'); }
          return;
        }
        say('narr', 'The door stays shut until this chamber’s secret is solved.');
      }

      function renderRoom() {
        const r = room();
        roomDone = false; doorOpen = false; seen = new Set(); panX = 0;
        q('.escape-ord').textContent = ORD[roomIdx] || 'A chamber';
        q('.escape-room-name').textContent = r.name;
        q('.escape-next').hidden = true;
        drawScene(); renderLamps();
        say(r.intro[0], r.intro[1]);
      }

      /* ---------- puzzles ---------- */
      const pmMsg = (t, ok) => { pmMsgEl.textContent = t; pmMsgEl.classList.toggle('is-ok', !!ok); };
      const shake = el => { if (RM || !el) return; el.classList.remove('escape-shake'); void el.offsetWidth; el.classList.add('escape-shake'); };

      const PZ = {
        rainbow: {
          kicker: 'The colour pots', title: 'Indradhanush', instr: 'Arrange the colour pots on the shelf in the order of the rainbow.',
          hint: ['a', 'Think of the rainbow, from red to violet: red, orange, yellow, green, blue, indigo, violet.'],
          init() {
            ps.next = rbPlaced;
            const have = inv.includes('pot7');
            pmBody.innerHTML = `<div class="escape-shelf">${RB.map((_, i) => `<span class="escape-slot" data-slot="${i}"></span>`).join('')}</div>
              <div class="escape-pots">${RB_ORDER.filter(i => i !== 6 || have).map(i => `<button type="button" class="escape-pot" data-i="${i}">${potSVG(RB[i][1])}${RB[i][0]}</button>`).join('')}</div>`;
            const slot = i => pmBody.querySelector(`[data-slot="${i}"]`);
            for (let i = 0; i < rbPlaced; i++) { slot(i).innerHTML = potSVG(RB[i][1]); const b = pmBody.querySelector(`.escape-pot[data-i="${i}"]`); if (b) b.disabled = true; }
            if (!have) pmMsg('The shelf has seven places, but there are only six pots. The seventh must be somewhere in the courtyard.');
            pmBody.querySelectorAll('.escape-pot').forEach(b => b.addEventListener('click', () => {
              const i = +b.dataset.i;
              if (i === ps.next) {
                b.disabled = true; slot(i).innerHTML = potSVG(RB[i][1]); ps.next++; rbPlaced = ps.next; snd('tap');
                if (ps.next === 6 && !inv.includes('pot7')) pmMsg('Six colours in place. Now the violet pot is needed. Look around the courtyard.');
                if (ps.next === 7) pzSolved('rainbow', 'All seven colours in place. A small drawer beneath the shelf slides open…');
              } else { snd('tap'); shake(b); pmMsg('Not this colour yet. Think of the rainbow’s order.'); }
            }));
          },
          reveal() { RB.forEach((r, i) => { pmBody.querySelector(`[data-slot="${i}"]`).innerHTML = potSVG(r[1]); }); pmBody.querySelectorAll('.escape-pot').forEach(b => (b.disabled = true)); hidden.add('pot7'); },
          reward() { inv = inv.filter(x => x !== 'pot7'); inv.push('key'); renderInv('key'); toast('<b>Found:</b> Brass key'); say('a', 'A brass key! Try it on the door.'); },
        },
        thaal: {
          kicker: 'Preparing the Bhaat', title: 'Mamaji’s thaal', instr: 'Arrange all four shagun items on the thaal.',
          hint: ['n', 'For the Bhaat, the nanihaal brings clothes, mithai, a coconut and shagun. All four are in different corners of this room.'],
          init() {
            ps.placed = new Set();
            const pos = [[50, 24], [76, 50], [50, 76], [24, 50]];
            const draw = () => {
              pmBody.innerHTML = `<div class="escape-thaal"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="48" fill="#d9b866" stroke="#9c7a2f" stroke-width="2"/><circle cx="50" cy="50" r="38" fill="none" stroke="#9c7a2f" stroke-width="1"/><path d="M47 52 q3 -10 3 -12 q1 5 0 12z" fill="#ffb347"/><circle cx="50" cy="54" r="5" fill="#b8913f"/></svg>
                ${THAAL_NEED.map((k, i) => `<span class="escape-tslot${ps.placed.has(k) ? ' is-full' : ''}" style="left:${pos[i][0]}%;top:${pos[i][1]}%">${ps.placed.has(k) ? ICON[k] : esc(ITEMS[k].split(' ').pop())}</span>`).join('')}</div>
                <ul class="escape-check">${THAAL_NEED.map(k => { const got = inv.includes(k) || ps.placed.has(k); return `<li class="${got ? 'is-got' : ''}">${got ? '✓' : '○'} ${esc(ITEMS[k])}</li>`; }).join('')}</ul>
                <div class="escape-choices">${inv.filter(k => THAAL_NEED.includes(k) && !ps.placed.has(k)).map(k => `<button type="button" class="escape-item" data-k="${k}">${ICON[k]}${esc(ITEMS[k])}</button>`).join('')}</div>`;
              pmBody.querySelectorAll('.escape-choices .escape-item').forEach(b => b.addEventListener('click', () => {
                ps.placed.add(b.dataset.k); snd('pop'); draw();
                if (ps.placed.size === 4) pzSolved('thaal', 'The thaal is complete: the love of the nanihaal, in all its finery.');
              }));
            };
            draw();
            const missing = THAAL_NEED.filter(k => !inv.includes(k)).length;
            if (missing) pmMsg(`${missing} item${missing > 1 ? 's are' : ' is'} still missing. Look around the chamber.`);
            else pmMsg('You have everything. Place them on the thaal one by one.', true);
          },
          reveal() { THAAL_NEED.forEach(k => hidden.add(k)); },
          reward() { inv = inv.filter(k => !THAAL_NEED.includes(k)); renderInv(); },
        },
        dholak: {
          kicker: 'Before the sangeet', title: 'The dholak rhythm', instr: 'Tap “Listen”, watch the rhythm, then play the same beats on the dholak.',
          hint: ['a', 'The rhythm is: Dha, Dhin, Na, Dha. Gently, one beat at a time.'],
          needs: () => inv.includes('ring') ? null : ['a', 'Please find my ring first. What is a sangeet without the sagai?'],
          init() {
            ps.input = []; ps.playing = false;
            pmBody.innerHTML = `<div class="escape-pads">${Object.keys(DHOL).map(k => `<button type="button" class="escape-pad" data-k="${k}">${DHOL[k]}</button>`).join('')}</div>
              <div class="escape-seq" aria-live="polite"></div>
              <div class="escape-pm-actions"><button type="button" class="escape-btn escape-primary" data-listen>Listen ▸</button></div>`;
            const pads = Array.prototype.slice.call(pmBody.querySelectorAll('.escape-pad')), seq = pmBody.querySelector('.escape-seq');
            const hit = k => { const p = pads.find(x => x.dataset.k === k); p.classList.add('is-hit'); snd(k); setTimeout(() => p.classList.remove('is-hit'), 260); };
            pmBody.querySelector('[data-listen]').addEventListener('click', () => {
              if (ps.playing) return; ps.playing = true; ps.input = []; seq.innerHTML = ''; pmMsg('');
              pads.forEach(p => (p.disabled = true));
              DHOL_SEQ.forEach((k, i) => setTimeout(() => hit(k), 300 + i * 650));
              setTimeout(() => { ps.playing = false; pads.forEach(p => (p.disabled = false)); pmMsg('Your turn.', true); }, 300 + DHOL_SEQ.length * 650);
            });
            pads.forEach(p => p.addEventListener('click', () => {
              if (ps.playing) return;
              const k = p.dataset.k; hit(k); ps.input.push(k);
              seq.insertAdjacentHTML('beforeend', `<i>${DHOL[k]}</i>`);
              if (DHOL_SEQ[ps.input.length - 1] !== k) { pmMsg('The rhythm slipped a little. Tap “Listen” and try again.'); ps.input = []; setTimeout(() => (seq.innerHTML = ''), 600); return; }
              if (ps.input.length === DHOL_SEQ.length) { snd('dhol'); pzSolved('dholak', 'The rhythm is set. The doors of the Sangeet Mahal are opening…'); }
            }));
          },
          reveal() { pmBody.querySelector('.escape-seq').innerHTML = DHOL_SEQ.map(k => `<i>${DHOL[k]}</i>`).join(''); hidden.add('ring'); },
          reward() { inv = inv.filter(k => k !== 'ring'); renderInv(); },
        },
        sehra: {
          kicker: 'Readying the groom', title: 'The sehra strings', instr: 'Tie the strings to the sehra from the shortest to the longest.',
          hint: ['n', 'The shortest string first, the longest last. One string is in the jewellery casket.'],
          init() {
            ps.next = sehraTied;
            const have = inv.includes('lari');
            pmBody.innerHTML = `<div class="escape-band"></div><div class="escape-strings">${LARI_ORDER.map(L => `<button type="button" class="escape-str${L === LARI_MISSING && !have ? ' is-gap' : ''}" data-l="${L}" aria-label="String ${L}"><span class="escape-cord" style="height:${L * 20}px"></span>${Array.from({ length: L + 1 }, () => '<span class="escape-pearl"></span>').join('')}</button>`).join('')}</div>`;
            pmBody.querySelectorAll('.escape-str').forEach(b => { if (+b.dataset.l < sehraTied) b.classList.add('is-tied'); });
            if (!have) pmMsg('One string is missing, so the sehra will stay incomplete.');
            pmBody.querySelectorAll('.escape-str').forEach(b => b.addEventListener('click', () => {
              if (b.classList.contains('is-tied') || b.classList.contains('is-gap')) return;
              if (+b.dataset.l === ps.next) {
                b.classList.add('is-tied'); ps.next++; sehraTied = ps.next; snd('tap');
                if (ps.next === LARI_MISSING && !inv.includes('lari')) pmMsg('You don’t have the next string yet. Try the jewellery casket.');
                if (ps.next > LARIS.length) pzSolved('sehra', 'The sehra is complete. The groom is ready.');
              } else { shake(b); pmMsg('Not this string yet. Begin with the shortest.'); }
            }));
          },
          reveal() { pmBody.querySelectorAll('.escape-str').forEach(b => { b.classList.remove('is-gap'); b.classList.add('is-tied'); }); hidden.add('lari'); },
          reward() { inv = inv.filter(k => k !== 'lari'); renderInv(); },
        },
        maze: {
          kicker: 'The baraat’s path', title: 'To the doorway', instr: 'Use the arrows to guide the ghodi to the gate, around anything in the way.',
          hint: ['a', 'Go straight right first, then up, keeping clear of the guests.'],
          init() {
            ps.r = 4; ps.c = 0;
            pmBody.innerHTML = `<div class="escape-maze"></div>
              <div class="escape-arrows"><button type="button" class="escape-u" data-d="u" aria-label="Up">▲</button><button type="button" class="escape-l" data-d="l" aria-label="Left">◀</button><button type="button" class="escape-d" data-d="d" aria-label="Down">▼</button><button type="button" class="escape-r" data-d="r" aria-label="Right">▶</button></div>`;
            drawMaze();
            pmBody.querySelectorAll('.escape-arrows button').forEach(b => b.addEventListener('click', () => mazeStep(b.dataset.d)));
          },
          reveal() { ps.r = 0; ps.c = 4; drawMaze(); },
          reward() {},
        },
        memory: {
          kicker: 'Readying the varmala', title: 'Pairs of flowers', instr: 'Turn the cards two at a time and match the pairs of flowers.',
          hint: ['n', 'Marigold, rose and mogra: each flower has one pair. Remember where each one was.'],
          init() {
            ps.open = []; ps.done = 0; ps.lock = false;
            pmBody.innerHTML = `<div class="escape-mem">${MEM_ORDER.map((m, i) => `<button type="button" class="escape-card" data-m="${m}" aria-label="Card ${i + 1}"><span>${FLOWERS[m][1]}${FLOWERS[m][0]}</span></button>`).join('')}</div>`;
            pmBody.querySelectorAll('.escape-card').forEach(b => b.addEventListener('click', () => {
              if (ps.lock || b.classList.contains('is-up') || b.classList.contains('is-done')) return;
              b.classList.add('is-up'); ps.open.push(b); snd('tap');
              if (ps.open.length === 2) {
                const [x, y] = ps.open;
                if (x.dataset.m === y.dataset.m) {
                  x.classList.add('is-done'); y.classList.add('is-done'); ps.open = []; ps.done++; snd('pop');
                  if (ps.done === FLOWERS.length) pzSolved('memory', 'The varmala is ready. The mandap awaits.');
                } else { ps.lock = true; pmMsg('Not a pair. Remember them.'); setTimeout(() => { x.classList.remove('is-up'); y.classList.remove('is-up'); ps.open = []; ps.lock = false; }, 850); }
              }
            }));
          },
          reveal() { pmBody.querySelectorAll('.escape-card').forEach(b => b.classList.add('is-done')); },
          reward() {},
        },
        diya: {
          kicker: 'Sandhya deep', title: 'Light the diyas', instr: 'Tap “Watch” to see the order in which the flame moves, then light the diyas in the same order.',
          hint: ['narr', `The flame moves: ${DIYA_SEQ.map(i => DIYA_WORDS[i]).join(', ')}.`],
          init() {
            ps.input = 0; ps.playing = false;
            const dsvg = '<svg viewBox="0 0 40 44" aria-hidden="true"><circle class="escape-dglow" cx="20" cy="18" r="16" fill="#ffd27a"/><path class="escape-dflame" d="M20 6 q-7 11 0 18 q7 -7 0 -18z" fill="#ffb347"/><path d="M4 30 q16 16 32 0z" fill="#b5651d"/><path d="M4 30 h32" stroke="#7a3f12" stroke-width="2"/></svg>';
            pmBody.innerHTML = `<div class="escape-diyas">${[0, 1, 2, 3, 4].map(i => `<button type="button" class="escape-diya" data-i="${i}" aria-label="The ${DIYA_WORDS[i]} diya">${dsvg}</button>`).join('')}</div>
              <div class="escape-pm-actions"><button type="button" class="escape-btn escape-primary" data-watch>Watch ▸</button></div>`;
            const ds = Array.prototype.slice.call(pmBody.querySelectorAll('.escape-diya'));
            const flash = i => { ds[i].classList.add('is-glow'); snd('ding'); setTimeout(() => ds[i].classList.remove('is-glow'), 520); };
            pmBody.querySelector('[data-watch]').addEventListener('click', () => {
              if (ps.playing) return; ps.playing = true; ps.input = 0; pmMsg('');
              ds.forEach(d => { d.classList.remove('is-lit'); d.disabled = true; });
              DIYA_SEQ.forEach((i, k) => setTimeout(() => flash(i), 300 + k * 700));
              setTimeout(() => { ps.playing = false; ds.forEach(d => (d.disabled = false)); pmMsg('Now light them in the same order.', true); }, 300 + DIYA_SEQ.length * 700);
            });
            ds.forEach(d => d.addEventListener('click', () => {
              if (ps.playing || d.classList.contains('is-lit')) return;
              const i = +d.dataset.i;
              if (DIYA_SEQ[ps.input] === i) {
                d.classList.add('is-lit'); ps.input++; snd('ding');
                if (ps.input === DIYA_SEQ.length) { snd('bell'); pzSolved('diya', 'All five diyas glow. The path may begin.'); }
              } else {
                pmMsg('The flame went another way. Tap “Watch” to see it again.');
                ps.input = 0; ds.forEach(x => x.classList.remove('is-lit'));
              }
            }));
          },
          reveal() { pmBody.querySelectorAll('.escape-diya').forEach(d => d.classList.add('is-lit')); },
          reward() {},
        },
        motif: {
          kicker: 'The mehendi design', title: 'Complete the motif', instr: 'Each row repeats the same three motifs in turn. Choose the one that completes the pattern.',
          hint: ['a', 'In every row, the paisley, flower and leaf each appear once. Which one is missing from the last row?'],
          init() {
            pmBody.innerHTML = `<div class="escape-motif">${MOTIF_GRID.map(m => m ? `<span class="escape-mtile">${MOTIF[m]}</span>` : '<span class="escape-mtile is-q">?</span>').join('')}</div>
              <div class="escape-mopts">${['patti', 'phool', 'keri'].map(m => `<button type="button" class="escape-mopt" data-m="${m}">${MOTIF[m]}<span>${esc(MOTIF_NAMES[m])}</span></button>`).join('')}</div>`;
            pmBody.querySelectorAll('.escape-mopt').forEach(b => b.addEventListener('click', () => {
              if (b.dataset.m === MOTIF_ANSWER) {
                pmBody.querySelector('.is-q').innerHTML = MOTIF[MOTIF_ANSWER]; pmBody.querySelector('.is-q').classList.add('is-filled');
                snd('pop'); pzSolved('motif', 'The flower completes it. What a beautiful design.');
              } else { shake(b); pmMsg('That motif already appears in the last row. Try another.'); }
            }));
          },
          reveal() { const t = pmBody.querySelector('.is-q'); t.innerHTML = MOTIF[MOTIF_ANSWER]; t.classList.add('is-filled'); },
          reward() {},
        },
      };
      function drawMaze() {
        let h = '';
        MAZE.forEach((row, r) => row.split('').forEach((ch, c) => {
          if (r === ps.r && c === ps.c) h += `<div class="escape-cell is-me">${HORSE}</div>`;
          else if (ch === 'G') h += '<div class="escape-cell is-gate">Gate</div>';
          else if (BLOCK[ch]) h += `<div class="escape-cell is-block">${BLOCK[ch][0]}</div>`;
          else h += '<div class="escape-cell"></div>';
        }));
        pmBody.querySelector('.escape-maze').innerHTML = h;
      }
      function mazeStep(d) {
        if (curPz !== 'maze' || solved.has('maze')) return;
        const r = ps.r + (d === 'u' ? -1 : d === 'd' ? 1 : 0), c = ps.c + (d === 'l' ? -1 : d === 'r' ? 1 : 0);
        if (r < 0 || r > 4 || c < 0 || c > 4) { pmMsg('A wall that way.'); return; }
        const ch = MAZE[r][c];
        if (BLOCK[ch]) { pmMsg(BLOCK[ch][1]); shake(pmBody.querySelector('.escape-maze')); return; }
        ps.r = r; ps.c = c; drawMaze(); snd('tap'); pmMsg('');
        if (ch === 'G') { snd('dhol'); pzSolved('maze', 'The ghodi is at the gate! A baraat to remember.'); }
      }
      document.addEventListener('keydown', e => {
        if (pm.hidden) return;
        const map = { ArrowUp: 'u', ArrowDown: 'd', ArrowLeft: 'l', ArrowRight: 'r' };
        if (map[e.key] && curPz === 'maze') { e.preventDefault(); mazeStep(map[e.key]); }
        if (e.key === 'Escape') closePuzzle();
      });

      function openPuzzle(name) {
        const p = PZ[name];
        const need = p.needs && p.needs();
        if (need) { say(need[0], need[1]); return; }
        curPz = name; ps = {};
        q('.escape-pm-kicker').textContent = p.kicker; q('.escape-pm-title').textContent = p.title; q('.escape-pm-instr').textContent = p.instr;
        pmHint.hidden = true; pmMsg('');
        q('[data-act="hint"]').disabled = false; q('[data-act="reveal"]').disabled = false;
        pm.hidden = false; snd('whoosh');
        p.init();
        q('.escape-pm-card [data-act="pmclose"]').focus({ preventScroll: true });
      }
      function closePuzzle() { pm.hidden = true; curPz = null; }

      async function pzSolved(name, text) {
        if (solved.has(name)) return;
        solved.add(name); snd('success'); pmMsg(text, true);
        q('[data-act="hint"]').disabled = true; q('[data-act="reveal"]').disabled = true;
        await wait(1300);
        closePuzzle();
        PZ[name].reward();
        const r = room();
        if (!r.puzzles.every(p => solved.has(p))) { drawScene(); return; }
        if (r.lock === 'key') { drawScene(); return; } // the door opens with the key
        completeRoom();
      }

      /* ---------- progression ---------- */
      function artFor(r, lit) { return sceneSVG(r.scene, { lit: lit || r.scene === 'pooja' }, SCENES[r.scene].vb); }
      const pageFor = (r, i) => InviteDeck.eventPage(ctx, r.ev, { art: artFor(r, true), kicker: `${ORD[i] || 'A chamber'} · ${r.name}`, note: r.note });
      const vidPage = () => InviteDeck.eventPage(ctx, VID, { art: sceneSVG('courtyard', {}, SCENES.courtyard.vb, COUPLE), kicker: 'The finale · Taaron ki Chhaon Mein', note: 'Under the stars, with your blessings.' });

      async function completeRoom() {
        if (roomDone) return;
        const r = room();
        roomDone = true; busy = true; doorOpen = true;
        drawScene();
        const d = sceneEl.querySelector('.escape-door');
        if (d) d.classList.add('is-open');
        snd('whoosh');
        say(r.done[0], r.done[1]);
        renderLamps();
        await wait(1100);
        await InviteDeck.open([pageFor(r, roomIdx)], { single: true, cta: 'Continue', label: 'Invitation unlocked', theme: 'escape-deck', events: ctx.events });
        busy = false;
        if (roomIdx === ROOMS.length - 1) { finale(false); return; }
        q('.escape-next').hidden = false;
        say('narr', 'The door is open. Step into the next chamber, or tap the doorway.');
      }
      async function goNext() {
        if (busy) return;
        busy = true;
        const next = roomIdx + 1, veil = q('.escape-veil');
        q('.escape-veil-o').textContent = ORD[next] || 'A chamber'; q('.escape-veil-n').textContent = ROOMS[next].name;
        veil.classList.add('is-on');
        await wait(900);
        roomIdx = next; renderRoom();
        q('.escape-game').scrollIntoView({ behavior: 'auto', block: 'start' });
        await wait(500);
        veil.classList.remove('is-on');
        busy = false;
      }

      function fullDeck() {
        const pages = ROOMS.map((r, i) => pageFor(r, i));
        if (VID) pages.push(vidPage());
        evs.filter(e => e !== VID && !DEFS[e.id]).forEach(e => pages.push(InviteDeck.eventPage(ctx, e, {})));
        pages.push(InviteDeck.closingPage(ctx, { art: sceneSVG(FIN_SCENE, { lit: true }, finVB, COUPLE) }));
        return pages;
      }
      const openFullDeck = start => InviteDeck.open(fullDeck(), { start: start || 0, label: 'Your invitation', theme: 'escape-deck', events: ctx.events });

      async function finale(skip) {
        finished = true; closePuzzle();
        const fin = q('.escape-finale'), hall = q('.escape-hall');
        q('.escape-hall-scene').innerHTML = sceneSVG(FIN_SCENE, { lit: true }, finVB, COUPLE);
        q('.escape-badge').hidden = !(EGG_TOTAL > 1 && eggsFound.size === EGG_TOTAL);
        fin.hidden = false; hall.classList.remove('is-open');
        fin.scrollIntoView({ behavior: skip ? 'auto' : smooth, block: 'start' });
        if (skip || RM) { hall.classList.add('is-open'); openFullDeck(0); return; }
        await wait(700); hall.classList.add('is-open'); snd(VID ? 'bell' : 'success');
        await wait(1900);
        openFullDeck(0);
      }

      /* ---------- buttons ---------- */
      root.addEventListener('click', e => {
        const b = e.target.closest('[data-act]');
        if (!b) return;
        const act = b.dataset.act;
        if (act === 'start') {
          snd('tap'); begin();
          if (!ROOMS.length) { finale(false); return; }
          q('.escape-game').scrollIntoView({ behavior: smooth, block: 'start' });
        } else if (act === 'skip') {
          if (busy) return;
          snd('whoosh'); begin();
          ROOMS.forEach(r => r.puzzles.forEach(p => solved.add(p)));
          if (ROOMS.length) { roomIdx = ROOMS.length - 1; roomDone = true; doorOpen = true; q('.escape-ord').textContent = ORD[roomIdx] || ''; q('.escape-room-name').textContent = room().name; drawScene(); renderLamps(); say('both', 'No matter. The doors are open for you.'); }
          finale(true);
        } else if (act === 'next') { snd('tap'); goNext(); }
        else if (act === 'deck') { openFullDeck(0); }
        else if (act === 'pmclose') { closePuzzle(); }
        else if (act === 'hint' && curPz) { const h = PZ[curPz].hint; pmHint.textContent = h[1]; pmHint.hidden = false; say(h[0], h[1]); }
        else if (act === 'reveal' && curPz && !solved.has(curPz)) { PZ[curPz].reveal(); pzSolved(curPz, 'No matter. Here is the answer.'); }
      });

      /* ---------- boot ---------- */
      renderEggs(); renderInv();
      if (ROOMS.length) { renderClock(); renderRoom(); }
      ctx.ready();
    },
  });
})();
