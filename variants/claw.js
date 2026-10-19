/* Jodi Pakdo — a mela-arcade claw machine. Press "Pakdo!" twice to pull Nilaksh and then Ayushi out of a
   pile of plushies, then "Girao!" once per function: the couple is dropped into each function's zone and
   gets a costume change. Ends with a jackpot, the swipeable invite deck and the standard details block. */
(function () {
  'use strict';

  /* ---------- small art helpers ---------- */
  const garland = (x0, x1, yTop, yDip, r, colors, n) => {
    n = n || 12;
    let s = '';
    for (let i = 0; i <= n; i++) {
      const t = i / n, x = x0 + (x1 - x0) * t, y = yTop + (yDip - yTop) * (1 - Math.pow(2 * t - 1, 2));
      s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${colors[i % colors.length]}"/>`;
    }
    return s;
  };
  const sparkles = (pts, c) => pts.map(([x, y, r]) => `<path d="M${x} ${y - r}l${r * .3} ${r * .7} ${r * .7} ${r * .3} -${r * .7} ${r * .3} -${r * .3} ${r * .7} -${r * .3} -${r * .7} -${r * .7} -${r * .3} ${r * .7} -${r * .3}z" fill="${c}"/>`).join('');
  /* ---------- the dolls: original 3D-cartoon style (big glossy eyes, soft shading, rich outfits) ----------
     All coordinates live in a 60 × 80 box: head centre (30, 25) r 19.5, body 44–77. Shared gradients live in
     one hidden <svg> (see ensureDefs), so every copy of a doll (machine, deck pages) shares them. */
  const lay = (k, s) => `<g class="claw-lay claw-l-${k}">${s}</g>`;
  const SH = 'url(#claw-g-cloth)', GOLD = 'url(#claw-g-gold)';
  const BOY_D = 'M18.5 45 Q30 40.5 41.5 45 Q45 58 45.5 73.5 Q30 78 14.5 73.5 Q15 58 18.5 45Z';
  const GIRL_D = 'M19.5 45 Q30 40.5 40.5 45 Q46 60 51 74.5 Q30 81 9 74.5 Q14 60 19.5 45Z';
  const shade = d => `<path d="${d}" fill="${SH}"/>`;
  function arms(f, skin, trim) {
    return `<g><ellipse cx="14.2" cy="53.5" rx="4.6" ry="7.6" fill="${f}" transform="rotate(12 14.2 53.5)"/><ellipse cx="14.2" cy="53.5" rx="4.6" ry="7.6" fill="${SH}" transform="rotate(12 14.2 53.5)"/>
      <ellipse cx="45.8" cy="53.5" rx="4.6" ry="7.6" fill="${f}" transform="rotate(-12 45.8 53.5)"/><ellipse cx="45.8" cy="53.5" rx="4.6" ry="7.6" fill="${SH}" transform="rotate(-12 45.8 53.5)"/>
      ${trim ? `<path d="M11 59.6 q3.4 1.4 6.4 0 M43 59.6 q3 1.4 6.4 0" stroke="${trim}" stroke-width="1.5" fill="none" stroke-linecap="round"/>` : ''}
      <circle cx="13.8" cy="61.8" r="3.4" fill="${skin}"/><circle cx="46.2" cy="61.8" r="3.4" fill="${skin}"/>
      <circle cx="13" cy="60.8" r="1.2" fill="#fff" opacity=".35"/><circle cx="45.4" cy="60.8" r="1.2" fill="#fff" opacity=".35"/></g>`;
  }
  // Groom outfits: body + shading + placket + buttons + hem trim (+ extra), then sleeves.
  function boyOutfit(o) {
    return `<path d="${BOY_D}" fill="${o.base}"/>${shade(BOY_D)}
      <path d="M30 43.5 V76" stroke="${o.trim}" stroke-width="1.6"/>${[50, 56, 62, 68].map(y => `<circle cx="30" cy="${y}" r="1.25" fill="${o.button || o.trim}"/>`).join('')}
      <path d="M24.5 44.2 Q30 49 35.5 44.2" stroke="${o.trim}" stroke-width="1.8" fill="none"/>
      <path d="M15.2 71.6 Q30 76 44.8 71.6" stroke="${o.trim}" stroke-width="2.2" fill="none"/>${o.extra || ''}${arms(o.base, o.skin, o.trim)}`;
  }
  // Bride outfits: flared lehenga + choli band + gold hem bands + motifs, then sleeves.
  function girlOutfit(o) {
    const motifs = (o.motifs || [[20.5, 62], [30, 66.5], [39.5, 62], [25, 56.5], [35, 56.5], [15.5, 69.5], [44.5, 69.5], [30, 72.5]])
      .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.15" fill="${o.motif || o.trim}"/>`).join('');
    return `<path d="${GIRL_D}" fill="${o.base}"/><path d="M19.5 45 Q30 40.5 40.5 45 L41.6 51 Q30 54 18.4 51Z" fill="${o.choli || o.base}"/>${shade(GIRL_D)}
      <path d="M18.4 51 Q30 54 41.6 51" stroke="${o.trim}" stroke-width="1.4" fill="none"/>
      <path d="M10.6 71.6 Q30 77.6 49.4 71.6" stroke="${o.trim}" stroke-width="2.6" fill="none"/><path d="M12.4 67.6 Q30 72.8 47.6 67.6" stroke="${o.trim}" stroke-width="1" fill="none" opacity=".8"/>
      ${motifs}${o.extra || ''}${arms(o.choli || o.base, o.skin, o.trim)}`;
  }
  function bodyLayers(who, skin) {
    if (who === 'n') return [
      lay('kurtaN', boyOutfit({ base: '#fff3dc', trim: '#c9962b', skin,
        extra: '<path d="M18 46 Q25 56 39 73 L43.6 71.4 Q30 56 23 44.6Z" fill="#f08a24"/><path d="M18 46 Q25 56 39 73" stroke="#e8b84a" stroke-width=".9" fill="none"/>' })),
      lay('greenN', boyOutfit({ base: '#6f9e2e', trim: '#f5c21b', skin,
        extra: '<path d="M18.5 45 Q22 58 21 73.5 L15 73 Q15 58 18.5 45Z M41.5 45 Q38 58 39 73.5 L45 73 Q45 58 41.5 45Z" fill="#4e7a1c" opacity=".9"/>' })),
      lay('yellowN', boyOutfit({ base: '#ffcd2e', trim: '#e0761a', skin, button: '#fff3dc' })),
      lay('festN', boyOutfit({ base: '#13706b', trim: '#e8b84a', skin,
        extra: '<path d="M22 46 L30 52 L38 46" stroke="#fff3dc" stroke-width="1.4" fill="none"/>' + sparkles([[21.5, 61, 1.6], [38.5, 65, 1.6]], '#f5d36b') })),
      lay('sequinN', boyOutfit({ base: '#25296b', trim: '#d8dcff', skin, button: '#f5d36b',
        extra: sparkles([[21, 52, 1.7], [37, 50, 1.9], [25.5, 64, 1.5], [40, 62, 1.7], [34.5, 58, 1.3], [19, 67, 1.3], [33, 71, 1.4]], '#fff6c8') +
          '<path d="M35.6 49 l3.2 -1.6 l.8 2.6z" fill="#ff5fa2"/>' })),
      lay('sherwani', boyOutfit({ base: '#f6e3b4', trim: '#c9962b', skin, button: '#b8862b',
        extra: '<path d="M20 47 q2 3 0 6 q-2 3 0 6 M40 47 q-2 3 0 6 q2 3 0 6" stroke="#d9a840" stroke-width=".9" fill="none" opacity=".8"/>' +
          '<path d="M16.6 46.6 Q24.5 50 30 61 Q34 69 38.5 76.5 L34.4 77.4 Q29 67 24.4 58.6 Q20.4 52.2 14.8 49.8Z" fill="#8c1d34"/>' +
          '<path d="M16.6 46.6 Q24.5 50 30 61 Q34 69 38.5 76.5" stroke="#e8b84a" stroke-width="1" fill="none"/>' })),
    ].join('');
    return [
      lay('greenA', girlOutfit({ base: '#e7c22a', choli: '#4f8f2a', trim: '#2f6d1c', motif: '#3f7d22', skin })),
      lay('yellowA', girlOutfit({ base: '#ffcf3a', choli: '#ff9f1c', trim: '#e0761a', motif: '#2a9d5c', skin })),
      lay('festA', girlOutfit({ base: '#d0186a', choli: '#a8104f', trim: '#e8b84a', skin })),
      lay('sequinA', girlOutfit({ base: '#6d2be0', choli: '#4f1aa8', trim: '#ffc4ec', skin,
        extra: sparkles([[21.5, 56, 1.7], [37, 58, 1.9], [27, 66, 1.7], [41, 69, 1.5], [32, 61, 1.3], [17, 71, 1.4]], '#fff6c8') })),
      lay('lehenga', girlOutfit({ base: '#c8102e', choli: '#9e0c24', trim: '#e8b84a', skin,
        extra: '<path d="M12.6 64 Q30 69 47.4 64" stroke="#e8b84a" stroke-width="1.8" fill="none" opacity=".9"/>' +
          [[18, 66.5], [26, 68.5], [34, 68.5], [42, 66.5]].map(([x, y]) => `<path d="M${x} ${y - 2} l1.4 2 l-1.4 2 l-1.4 -2z" fill="#f5d36b"/>`).join('') })),
    ].join('');
  }
  function headLayers(who) {
    const crown = lay('crown', Array.from({ length: 9 }, (_, i) => {
      const x = 12.6 + i * 4.35, y = 9.4 - Math.sin(Math.PI * i / 8) * 5;
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" fill="${i % 2 ? '#ffc233' : '#ff8c1a'}"/><circle cx="${(x - .8).toFixed(1)}" cy="${(y - .9).toFixed(1)}" r=".9" fill="#fff3c4" opacity=".7"/>`;
    }).join('') + '<path d="M13 12 q-3.4 -2 -4.4 1.4 M47 12 q3.4 -2 4.4 1.4" stroke="#3f8f4f" stroke-width="2" fill="none" stroke-linecap="round"/>');
    const turban = (col, fold, trim) => {
      const d = 'M9.8 20.4 Q8.8 2.6 30 1.4 Q51.2 2.6 50.2 20.4 Q45 12 30 11.4 Q15 12 9.8 20.4Z';
      return `<path d="${d}" fill="${col}"/><path d="M12 15.6 Q30 4.6 48 15.6 M11 18.6 Q30 8.4 49 18.6 M14.6 9.6 Q30 1.6 45.4 9.6" stroke="${fold}" stroke-width="1.3" fill="none" opacity=".85"/>
        <path d="${d}" fill="${SH}"/><path d="M10.4 19.8 Q30 10 49.6 19.8" stroke="${trim}" stroke-width="1.8" fill="none"/>`;
    };
    if (who === 'n') return crown +
      lay('safa', turban('#c8102e', '#e8435c', '#e8b84a') +
        '<path d="M37.6 7.4 q5.6 -9.6 2.2 -15 q-1.4 7.6 -5.6 11z" fill="#fff6dc" stroke="#c9962b" stroke-width=".6"/>' +
        `<circle cx="35.6" cy="8.4" r="2.7" fill="${GOLD}"/><circle cx="35.6" cy="8.4" r="1.15" fill="#c8102e"/><circle cx="35.6" cy="12.2" r=".9" fill="#fff"/>`) +
      lay('base', turban('#f28c28', '#ffb04d', '#e8b84a'));
    const hood = (col, op) => {
      const d = 'M7.4 34.6 Q5.4 1.4 30 .8 Q54.6 1.4 52.6 34.6 L51.2 58.4 Q53.2 22.4 30 10.4 Q6.8 22.4 8.8 58.4Z';
      return `<path d="${d}" fill="${col}" opacity="${op}"/><path d="${d}" fill="${SH}"/>
        <path d="M8.8 58.4 Q6.8 22.4 30 10.4 Q53.2 22.4 51.2 58.4" stroke="#e8b84a" stroke-width="1.7" fill="none"/>
        ${[[12, 18], [48, 18], [8.6, 30], [51.4, 30], [30, 4.6]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".9" fill="#f5d36b"/>`).join('')}`;
    };
    return crown + lay('weddingDup', hood('#d0213f', '.97')) + lay('base', hood('#f39bbb', '.95'));
  }
  function frontLayers(who) {
    const genda = lay('genda', garland(18, 42, 45.4, 61, 2.6, ['#ff8c1a', '#ffc233'], 10));
    const shades = lay('shades', '<rect x="17.6" y="24.6" width="11.2" height="7.8" rx="3.4" fill="#ff4fa0"/><rect x="31.2" y="24.6" width="11.2" height="7.8" rx="3.4" fill="#ff4fa0"/><path d="M28.8 27.2 h2.4" stroke="#ff4fa0" stroke-width="1.6"/><rect x="19.2" y="25.8" width="4.2" height="1.7" rx=".85" fill="#fff" opacity=".85"/><rect x="32.8" y="25.8" width="4.2" height="1.7" rx=".85" fill="#fff" opacity=".85"/>');
    const gift = lay('gift', `<rect x="22.6" y="52" width="14.8" height="12.4" rx="1.8" fill="#ef4b3c"/><rect x="22.6" y="52" width="14.8" height="12.4" rx="1.8" fill="${SH}"/><rect x="28.8" y="52" width="2.4" height="12.4" fill="#f5c84b"/><path d="M30 52 q-6 -6 -7.2 -1 q1.2 2 7.2 1z M30 52 q6 -6 7.2 -1 q-1.2 2 -7.2 1z" fill="#f5c84b"/>`);
    const varmala = lay('varmala', garland(12.6, 47.4, 44, 70, 3.4, ['#d7263d', '#fff7e8', '#ff7aa2'], 13) + garland(16, 44, 45, 64, 1.5, ['#3f8f4f'], 9));
    const diya = lay('diya', '<circle cx="30" cy="57.6" r="10" fill="#ffd27a" opacity=".38"/><path d="M22.6 60.6 q7.4 6.2 14.8 0z" fill="#c9622b"/><path d="M30 60.6 q-2.6 -4.2 0 -8 q2.6 3.8 0 8z" fill="#ffb347"/><path d="M30 59.6 q-1 -1.8 0 -3.6 q1 1.8 0 3.6z" fill="#fff3c4"/>');
    if (who === 'n') return genda + gift + shades + diya +
      lay('tilak', '<path d="M30 16.4 v3.6" stroke="#d7263d" stroke-width="1.9" stroke-linecap="round"/><circle cx="30" cy="20.9" r=".75" fill="#f5c21b"/>') +
      lay('sehra', [11.6, 14.6, 45.4, 48.4].map(x => `<path d="M${x} 16 V37" stroke="#f5d36b" stroke-width="1.3" stroke-dasharray="2 1.3"/><circle cx="${x}" cy="38" r="1.4" fill="#fff7e8"/>`).join('') +
        [18, 21.6, 25.2, 28.8, 32.4, 36, 39.6, 43].map(x => `<path d="M${x} 12 V17.6" stroke="#f5d36b" stroke-width="1.2" stroke-dasharray="1.8 1.1"/><circle cx="${x}" cy="18.3" r=".75" fill="#fff7e8"/>`).join('')) + varmala;
    return genda + gift + shades + diya +
      lay('mehendi', `<g fill="#8a3b12">${[[13.8, 61.8], [46.2, 61.8]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".95"/><circle cx="${x - 1.6}" cy="${y - 1.4}" r=".55"/><circle cx="${x + 1.6}" cy="${y - 1.4}" r=".55"/><circle cx="${x - 1.6}" cy="${y + 1.4}" r=".55"/><circle cx="${x + 1.6}" cy="${y + 1.4}" r=".55"/>`).join('')}</g>`) +
      lay('cone', '<path d="M45 60 l10 -9 l2.2 2.2 l-10 9z" fill="#6b8e23"/><path d="M55 51 l2.6 -2.6" stroke="#8a3b12" stroke-width="2" stroke-linecap="round"/>') +
      lay('sparkDup', '<path d="M16 44 Q30 52 45.4 67 L40.4 71 Q28 57 13 50Z" fill="#ffc4ec" opacity=".92"/>' + sparkles([[22, 50, 1.6], [32, 58, 1.8], [40, 65, 1.5]], '#fff')) +
      lay('jewel', `<path d="M30 10.6 V14.4" stroke="#e8b84a" stroke-width=".9"/><circle cx="30" cy="15.6" r="2.3" fill="${GOLD}"/><circle cx="30" cy="15.6" r=".95" fill="#c8102e"/><path d="M28.6 17.6 l1.4 1.6 l1.4 -1.6" stroke="#fff7e8" stroke-width=".7" fill="none"/>` +
        `<path d="M10.8 30 v1.6 M49.2 30 v1.6" stroke="#e8b84a" stroke-width=".8"/><path d="M8.6 31.6 h4.4 l-2.2 4.4z M47 31.6 h4.4 l-2.2 4.4z" fill="${GOLD}"/><circle cx="10.8" cy="36.6" r=".8" fill="#fff7e8"/><circle cx="49.2" cy="36.6" r=".8" fill="#fff7e8"/>` +
        '<circle cx="27.4" cy="32.9" r="2.1" fill="none" stroke="#e8b84a" stroke-width=".85"/><path d="M29 32.2 Q38 30.6 47.6 29.6" stroke="#e8b84a" stroke-width=".45" fill="none"/>' +
        `<path d="M20.6 45.6 Q30 51.6 39.4 45.6" stroke="${GOLD}" stroke-width="2" fill="none"/><circle cx="30" cy="49.6" r="1.6" fill="#c8102e"/><circle cx="30" cy="49.6" r="2.2" fill="none" stroke="#e8b84a" stroke-width=".7"/>`) + varmala;
  }

  /* One doll. cfg: { g: 'b'|'g', skin, hair, out, hem, style, dup, topi, who } */
  function dollInner(cfg) {
    const { g, skin, hair, out, hem, style, dup, topi, who } = cfg;
    const girl = g === 'g';
    let s = '<ellipse cx="30" cy="78.2" rx="16" ry="2" fill="#2a0a10" opacity=".14"/>';
    // back hair
    if (girl) {
      s += style === 'braid'
        ? [[12, 30, 58], [48, 30, 58]].map(([x, y0, y1]) => `${[0, 1, 2, 3, 4].map(k => `<ellipse cx="${x + (k % 2 ? .8 : -.8)}" cy="${y0 + k * 6}" rx="3" ry="3.6" fill="${hair}"/>`).join('')}<circle cx="${x}" cy="${y1 + 1}" r="2.3" fill="#ff7aa2"/>`).join('')
        : `<circle cx="30" cy="5" r="6.6" fill="${hair}"/><path d="M26 2.4 q3 -2 6 -.6" stroke="#fff" stroke-width="1.2" opacity=".25" fill="none" stroke-linecap="round"/><path d="M11 28 Q8 45 15.4 51 L17.4 30Z M49 28 Q52 45 44.6 51 L42.6 30Z" fill="${hair}"/>`;
    }
    // shoes (mojari)
    s += '<path d="M17 76.2 q5.6 -3.4 11 0 q-5.4 2.8 -11 0z M32 76.2 q5.4 -3.4 11 0 q-5.6 2.8 -11 0z" fill="#b8862b"/>';
    // base outfit
    if (girl) s += girlOutfit({ base: out, trim: hem || '#fff7e8', skin, choli: out });
    else s += boyOutfit({ base: out, trim: '#fff7e8', skin, button: '#fff7e8' });
    if (who) s += bodyLayers(who, skin);
    // chin shadow, ears, head, face shading
    s += '<ellipse cx="30" cy="44.2" rx="9.6" ry="2.4" fill="#6b2a1e" opacity=".2"/>';
    s += `<circle cx="10.8" cy="28" r="3.2" fill="${skin}"/><circle cx="49.2" cy="28" r="3.2" fill="${skin}"/>`;
    s += `<circle cx="30" cy="25" r="19.5" fill="${skin}"/><circle cx="30" cy="25" r="19.5" fill="url(#claw-g-face)"/>`;
    // front hair with gloss
    s += girl
      ? `<path d="M10.4 27.4 Q9.4 4.6 30 4.2 Q50.6 4.6 49.6 27.4 Q46.4 13.8 30 12.4 Q13.6 13.8 10.4 27.4Z" fill="${hair}"/><path d="M30 4.6 V12.4" stroke="#fff" stroke-width=".6" opacity=".18"/>`
      : `<path d="M10.6 24.4 Q9.8 5.2 30 4.6 Q50.2 5.2 49.4 24.4 Q47 14.8 41 13 Q37 17.6 30 16 Q22 14.4 19 13 Q12.4 16 10.6 24.4Z" fill="${hair}"/>`;
    s += '<path d="M16.6 11.6 Q24.6 6.6 34.6 7.6" stroke="#fff" stroke-width="2.2" stroke-linecap="round" fill="none" opacity=".24"/>';
    if (topi) s += `<path d="M15.4 12.2 Q30 1.6 44.6 12.2 Q30 9 15.4 12.2Z" fill="${topi}"/><rect x="15.4" y="10.2" width="29.2" height="3.2" rx="1.6" fill="${topi}"/><rect x="15.4" y="10.2" width="29.2" height="3.2" rx="1.6" fill="${SH}"/>`;
    if (dup) s += `<path d="M8.6 32.6 Q6.6 4.6 30 4 Q53.4 4.6 51.4 32.6 L49.6 52.4 Q51.6 24 30 12 Q8.4 24 10.4 52.4Z" fill="${dup}" opacity=".9"/><path d="M8.6 32.6 Q6.6 4.6 30 4 Q53.4 4.6 51.4 32.6 L49.6 52.4 Q51.6 24 30 12 Q8.4 24 10.4 52.4Z" fill="${SH}"/>`;
    if (who) s += headLayers(who);
    // brows, big glossy eyes, lashes, nose, smile, blush, bindi
    s += '<path d="M19.4 21.4 Q22.6 19.8 25.8 21.2 M34.2 21.2 Q37.4 19.8 40.6 21.4" stroke="#4a2a22" stroke-width="1" fill="none" stroke-linecap="round"/>';
    s += `<ellipse cx="22.6" cy="28.4" rx="3.6" ry="4.4" fill="url(#claw-g-iris)"/><ellipse cx="37.4" cy="28.4" rx="3.6" ry="4.4" fill="url(#claw-g-iris)"/>
      <circle cx="23.9" cy="26.5" r="1.5" fill="#fff"/><circle cx="38.7" cy="26.5" r="1.5" fill="#fff"/><circle cx="21.6" cy="30.4" r=".7" fill="#fff" opacity=".9"/><circle cx="36.4" cy="30.4" r=".7" fill="#fff" opacity=".9"/>`;
    if (girl) s += '<path d="M18.8 26 Q22.6 22.6 26.4 25.6 M33.6 25.6 Q37.4 22.6 41.2 26" stroke="#3a1d22" stroke-width=".9" fill="none" stroke-linecap="round"/><path d="M19.2 25.4 l-1.8 -1.3 M19.9 24.4 l-1.3 -1.7 M40.8 25.4 l1.8 -1.3 M40.1 24.4 l1.3 -1.7" stroke="#3a1d22" stroke-width=".7" stroke-linecap="round"/>';
    s += '<path d="M29.4 31.8 q.6 .8 1.2 0" stroke="#a8603e" stroke-width=".8" fill="none" stroke-linecap="round" opacity=".7"/>';
    s += '<ellipse cx="17.2" cy="33.4" rx="3.8" ry="2.3" fill="url(#claw-g-blush)"/><ellipse cx="42.8" cy="33.4" rx="3.8" ry="2.3" fill="url(#claw-g-blush)"/>';
    s += girl
      ? '<path d="M27.6 34.4 Q30 37 32.4 34.4 Q30 35.4 27.6 34.4Z" fill="#d6456a"/><circle cx="30" cy="19.4" r="1.1" fill="#c8102e"/>'
      : '<path d="M27.2 34.4 Q30 37 32.8 34.4" stroke="#8a3b3b" stroke-width="1.3" fill="none" stroke-linecap="round"/>';
    if (who) s += frontLayers(who);
    return s;
  }
  const dollSVG = cfg => `<svg viewBox="0 0 60 80" aria-hidden="true" focusable="false">${dollInner(cfg)}</svg>`;
  const N_CFG = { g: 'b', skin: '#f0bf98', hair: '#2b1a14', out: '#fff3dc', who: 'n' };
  const A_CFG = { g: 'g', skin: '#f4c6a2', hair: '#2b1a14', out: '#f7b6cb', hem: '#e8b84a', style: 'bun', who: 'a' };
  // Shared gradients for every doll copy (kept out of display:none subtrees so they always resolve).
  function ensureDefs() {
    if (document.getElementById('claw-defs')) return;
    const d = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    d.id = 'claw-defs'; d.setAttribute('width', '0'); d.setAttribute('height', '0'); d.setAttribute('aria-hidden', 'true');
    d.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    d.innerHTML = `<defs>
      <radialGradient id="claw-g-face" cx=".36" cy=".3" r=".78"><stop offset="0" stop-color="#fff" stop-opacity=".42"/><stop offset=".42" stop-color="#fff" stop-opacity="0"/><stop offset=".8" stop-color="#a0502c" stop-opacity="0"/><stop offset="1" stop-color="#a0502c" stop-opacity=".3"/></radialGradient>
      <linearGradient id="claw-g-cloth" x1="0" y1="0" x2=".9" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".34"/><stop offset=".42" stop-color="#fff" stop-opacity="0"/><stop offset=".68" stop-color="#2a0a10" stop-opacity="0"/><stop offset="1" stop-color="#2a0a10" stop-opacity=".24"/></linearGradient>
      <radialGradient id="claw-g-iris" cx=".5" cy=".64" r=".62"><stop offset="0" stop-color="#8a5236"/><stop offset=".62" stop-color="#3e1f24"/><stop offset="1" stop-color="#26101c"/></radialGradient>
      <radialGradient id="claw-g-blush"><stop offset="0" stop-color="#ff6f92" stop-opacity=".6"/><stop offset="1" stop-color="#ff6f92" stop-opacity="0"/></radialGradient>
      <linearGradient id="claw-g-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff1b8"/><stop offset=".5" stop-color="#e8b84a"/><stop offset="1" stop-color="#b8862b"/></linearGradient>
    </defs>`;
    document.body.appendChild(d);
  }

  const LAYERS = ['base', 'kurtaN', 'tilak', 'diya', 'greenN', 'greenA', 'mehendi', 'cone', 'yellowN', 'yellowA', 'crown', 'genda',
    'festN', 'festA', 'gift', 'sequinN', 'sequinA', 'shades', 'sparkDup', 'sherwani', 'safa', 'sehra', 'varmala', 'lehenga', 'weddingDup', 'jewel'];
  const wcls = list => list.map(k => 'claw-w-' + k).join(' ');

  /* ---------- the plushie pile ---------- */
  const BOY_OUT = ['#4fa98f', '#f28c28', '#5b7cfa', '#ef4b3c', '#8a5cd6', '#2ab3c9', '#e0b32e'];
  const GIRL_OUT = ['#ff7aa2', '#8fd8c0', '#f5b82e', '#b36ad6', '#ff9b54', '#5fb3ff', '#e86a9a'];
  const SKINS = ['#f1c3a0', '#e2a87e', '#d79a72', '#f6cfb0'];
  const HAIRS = ['#2b1d16', '#3d2414', '#1d1310', '#4a2c18'];
  const TOYS = {
    dhol: '<svg viewBox="0 0 60 50" aria-hidden="true"><rect x="6" y="12" width="48" height="28" rx="6" fill="#f28c28"/><ellipse cx="6" cy="26" rx="5" ry="14" fill="#fff7e8"/><ellipse cx="54" cy="26" rx="5" ry="14" fill="#fff7e8"/><path d="M14 12l10 28M26 12l10 28M38 12l10 28" stroke="#8a3b00" stroke-width="2"/></svg>',
    genda: '<svg viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="20" fill="#ff9f1c"/>' + Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6; return `<circle cx="${(30 + 14 * Math.cos(a)).toFixed(1)}" cy="${(30 + 14 * Math.sin(a)).toFixed(1)}" r="6" fill="#ffc233"/>`; }).join('') + '<circle cx="30" cy="30" r="7" fill="#d96c00"/></svg>',
  };
  // [type, x (centre, fraction of width), feet (fraction of height), width (fraction), z, tilt]
  const PILE = [
    ['b', .10, .80, .19, 1, 'l'], ['g', .27, .79, .19, 1, ''], ['dhol', .45, .76, .16, 1, 'r'], ['g', .60, .79, .19, 1, 'r'], ['b', .77, .80, .19, 1, ''], ['g', .93, .79, .19, 1, 'l'],
    ['g', .06, .89, .19, 2, 'r'], ['b', .50, .88, .19, 2, 'l'], ['g', .87, .89, .19, 2, ''],
    ['genda', .14, .99, .15, 3, ''], ['b', .25, .995, .19, 3, 'r'], ['g', .40, .99, .19, 3, 'l'], ['b', .58, .995, .19, 3, ''], ['g', .74, .99, .19, 3, 'r'], ['dhol', .90, .985, .16, 3, 'l'],
  ];
  function pileHTML() {
    let bi = 0, gi = 0;
    return PILE.map(([t, x, feet, w, z, tilt]) => {
      let svg;
      if (t === 'b') { svg = dollSVG({ g: 'b', skin: SKINS[(bi + 1) % 4], hair: HAIRS[bi % 4], out: BOY_OUT[bi % BOY_OUT.length], topi: bi % 3 === 1 ? '#fff7e8' : null }); bi++; }
      else if (t === 'g') { svg = dollSVG({ g: 'g', skin: SKINS[gi % 4], hair: HAIRS[(gi + 2) % 4], out: GIRL_OUT[gi % GIRL_OUT.length], hem: '#fff7e8', style: gi % 2 ? 'braid' : 'bun', dup: gi % 3 === 0 ? GIRL_OUT[(gi + 3) % GIRL_OUT.length] : null }); gi++; }
      else svg = TOYS[t];
      return `<div class="claw-pile-item${tilt ? ' claw-tilt-' + tilt : ''}"${t === 'b' || t === 'g' ? ' data-k="d"' : ''} style="left:${x * 100}%;bottom:${((1 - feet) * 100).toFixed(1)}%;width:${w * 100}%;z-index:${z}">${svg}</div>`;
    }).join('');
  }

  const MAMAJI = `<svg viewBox="0 0 40 56" aria-hidden="true">
    <path d="M10 30 Q20 24 30 30 L32 54 H8Z" fill="#fff7e8" stroke="#d9c7a3"/>
    <path class="claw-wave" d="M30 32 L38 18" stroke="#e2a87e" stroke-width="5" stroke-linecap="round"/>
    <circle cx="20" cy="18" r="10" fill="#e2a87e"/>
    <path d="M9 15 Q10 2 20 3 Q30 2 31 15 Q20 9 9 15Z" fill="#f28c28"/><circle cx="20" cy="7" r="2.4" fill="#d7263d"/>
    <path d="M14 22 Q17 20 20 22 Q23 20 26 22" stroke="#2b1d16" stroke-width="2" fill="none" stroke-linecap="round"/>
    <circle cx="16.5" cy="17" r="1.3" fill="#24122d"/><circle cx="23.5" cy="17" r="1.3" fill="#24122d"/>
  </svg>`;

  /* ---------- zone art (100 × 70) per event id ---------- */
  const ART = {
    sunderkand: `<svg class="claw-art" viewBox="0 0 100 70" aria-hidden="true">
      <path d="M28 58 V30 Q50 4 72 30 V58Z" fill="#f28c28" opacity=".22"/><path d="M28 30 Q50 4 72 30" stroke="#c9a227" stroke-width="2" fill="none"/>
      <circle class="claw-glow" cx="64" cy="50" r="14" fill="#ffd27a" opacity=".4"/>
      <rect x="18" y="56" width="64" height="9" rx="2" fill="#b5562b"/><path d="M18 60 h64" stroke="#f5b82e" stroke-width="1.4"/>
      <ellipse cx="38" cy="48" rx="8" ry="8" fill="#c9a227"/><rect x="34" y="38" width="8" height="4" fill="#c9a227"/>
      <path d="M38 38 q-6 -3 -8 -8 q5 1 8 8z M38 38 q6 -3 8 -8 q-5 1 -8 8z" fill="#3f8f4f"/><circle cx="38" cy="33" r="3.4" fill="#8a5a2b"/>
      <path d="M56 54 q8 5 16 0z" fill="#c9622b"/><path d="M64 54 q-3 -5 0 -9 q3 4 0 9z" fill="#ffb347"/></svg>`,
    mehandi: `<svg class="claw-art" viewBox="0 0 100 70" aria-hidden="true">
      <ellipse cx="40" cy="58" rx="26" ry="8" fill="#c9a227"/><ellipse cx="40" cy="56" rx="21" ry="5" fill="#6b8e23"/>
      ${[[28, 52], [36, 50], [44, 51], [52, 53]].map(([x, y]) => `<path d="M${x} ${y} q5 -8 10 0 q-5 4 -10 0z" fill="#7fb53b"/>`).join('')}
      <path d="M70 60 l14 -26 l5 3 l-14 26z" fill="#6b8e23"/><path d="M84 34 l3 -5" stroke="#8a3b12" stroke-width="2.4" stroke-linecap="round"/>
      ${[[16, 34], [24, 28], [62, 26], [92, 52]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2" fill="#8a3b12" opacity=".5"/>`).join('')}</svg>`,
    engagement: `<svg class="claw-art" viewBox="0 0 100 70" aria-hidden="true">
      <g class="claw-ball"><path d="M50 -60V-12" stroke="#b9c3c9" stroke-width="1.5"/><circle cx="50" cy="-4" r="9" fill="#dfe6ea"/><path d="M41 -4h18M50 -13v18M43 -10l14 12M57 -10l-14 12" stroke="#9aa6ad" stroke-width=".8"/></g>
      <g>${[0, 1, 2, 3].map(i => `<rect class="claw-tile" x="${6 + i * 22}" y="52" width="21" height="8" fill="#3d1f4f"/>`).join('')}${[0, 1, 2, 3].map(i => `<rect class="claw-tile" x="${6 + i * 22}" y="61" width="21" height="8" fill="#5a2e70"/>`).join('')}</g>
      <rect x="38" y="36" width="24" height="16" rx="2" fill="#b3134d"/><circle cx="50" cy="38" r="5.5" fill="none" stroke="#f5b82e" stroke-width="2.4"/><path d="M50 30l3.5 3.5-3.5 3.5-3.5-3.5z" fill="#c9f1ff"/>
      <rect class="claw-lid" x="38" y="28" width="24" height="8" rx="2" fill="#7a0e3a"/></svg>`,
    bhaat: `<svg class="claw-art" viewBox="0 0 100 70" aria-hidden="true"><ellipse cx="50" cy="60" rx="46" ry="9" fill="#d6a83a" stroke="#9c7419" stroke-width="1.5"/>
      <rect x="18" y="34" width="22" height="22" rx="2" fill="#ef4b3c"/><rect x="27" y="34" width="4" height="22" fill="#f5b82e"/>
      <rect x="44" y="26" width="22" height="30" rx="2" fill="#4fa98f"/><rect x="44" y="38" width="22" height="4" fill="#fff7e8"/>
      <circle cx="78" cy="48" r="9" fill="#8a5a2b"/><path d="M74 40 q4 -8 8 0" stroke="#3f8f4f" stroke-width="3" fill="none"/></svg>`,
    haldi: `<svg class="claw-art" viewBox="0 0 100 70" aria-hidden="true"><path d="M8 34 H92 Q88 66 50 66 Q12 66 8 34Z" fill="#d99a2b"/><ellipse cx="50" cy="34" rx="42" ry="9" fill="#ffcf24"/><ellipse cx="40" cy="32" rx="14" ry="3" fill="#ffe680"/>
      ${garland(10, 90, 40, 40, 2.2, ['#ff8c1a', '#ffc233'])}</svg>`,
    ghudchadi: `<svg class="claw-art" viewBox="0 0 100 70" aria-hidden="true"><g class="claw-ghodi">
      <rect x="28" y="44" width="5" height="22" rx="2" fill="#fff"/><rect x="38" y="46" width="5" height="20" rx="2" fill="#fff"/><rect x="60" y="46" width="5" height="20" rx="2" fill="#fff"/><rect x="70" y="44" width="5" height="22" rx="2" fill="#fff"/>
      <ellipse cx="52" cy="40" rx="28" ry="13" fill="#fff" stroke="#d9cfc0"/>
      <path d="M74 36 L86 12 L96 16 L90 36Z" fill="#fff" stroke="#d9cfc0"/><ellipse cx="94" cy="14" rx="7" ry="5" fill="#fff" stroke="#d9cfc0"/>
      <path d="M84 10 q-2 -10 6 -12" stroke="#ef4b3c" stroke-width="3" fill="none"/><circle cx="94" cy="12" r="1.3" fill="#24122d"/>
      <path d="M34 30 H70 V44 Q52 50 34 44Z" fill="#ef4b3c"/><path d="M34 42 Q52 48 70 42" stroke="#f5b82e" stroke-width="2" fill="none"/>
      <path d="M24 36 q-10 6 -6 20" stroke="#e7ddcf" stroke-width="5" fill="none" stroke-linecap="round"/></g></svg>`,
    baraat: `<svg class="claw-art" viewBox="0 0 100 70" aria-hidden="true">
      <path d="M2 8 Q50 26 98 8" stroke="#6b4a7a" stroke-width="1" fill="none"/>
      <g>${Array.from({ length: 11 }, (_, i) => { const x = 4 + i * 9.2, y = 8 + Math.sin(i / 10 * Math.PI) * 9; return `<circle class="claw-bulb" cx="${x.toFixed(1)}" cy="${(y + 2).toFixed(1)}" r="2.2" fill="${['#ffd23f', '#ff5fa2', '#5fd3ff'][i % 3]}"/>`; }).join('')}</g>
      <rect x="22" y="36" width="56" height="26" rx="8" fill="#f28c28"/><ellipse cx="22" cy="49" rx="6" ry="13" fill="#fff7e8"/><ellipse cx="78" cy="49" rx="6" ry="13" fill="#fff7e8"/>
      <path d="M30 36l9 26M42 36l9 26M54 36l9 26" stroke="#8a3b00" stroke-width="2"/>
      <path d="M84 28 l8 -10" stroke="#8a5a2b" stroke-width="2.4" stroke-linecap="round"/><path d="M14 28 l-8 -10" stroke="#8a5a2b" stroke-width="2.4" stroke-linecap="round"/></svg>`,
    dinner: `<svg class="claw-art" viewBox="0 0 100 70" aria-hidden="true">
      <rect x="10" y="10" width="5" height="44" fill="#c9a227"/><rect x="85" y="10" width="5" height="44" fill="#c9a227"/>
      <path d="M2 12 L50 -10 L98 12Z" fill="#ef4b3c"/><path d="M2 12 H98" stroke="#f5b82e" stroke-width="3"/>
      ${garland(14, 86, 14, 26, 1.8, ['#ff8c1a', '#ffc233'])}
      <rect x="6" y="54" width="88" height="8" rx="2" fill="#fff7e8" stroke="#c9a227"/>
      ${[20, 38, 62, 80].map(x => `<ellipse cx="${x}" cy="53" rx="7" ry="2.6" fill="#d6a83a"/><circle cx="${x - 2}" cy="51.5" r="1.6" fill="#ff9f1c"/><circle cx="${x + 2}" cy="51.6" r="1.4" fill="#7fb53b"/>`).join('')}</svg>`,
    vidaai: `<svg class="claw-art" viewBox="0 0 100 70" aria-hidden="true">
      ${[[10, 6], [24, 14], [40, 4], [62, 10], [80, 4], [92, 16], [52, 20]].map(([x, y]) => `<circle class="claw-bulb" cx="${x}" cy="${y}" r="1.4" fill="#fff3c4"/>`).join('')}
      <path d="M84 6 a6 6 0 1 0 4 10 a5 5 0 1 1 -4 -10z" fill="#fff3c4"/>
      <path d="M6 40 H94" stroke="#8a5a2b" stroke-width="3" stroke-linecap="round"/>
      <path d="M28 40 Q50 18 72 40Z" fill="#c9a227"/><circle cx="50" cy="22" r="2.4" fill="#f5b82e"/>
      <rect x="28" y="40" width="44" height="22" rx="2" fill="#c8102e"/><path d="M28 44 h44" stroke="#f5b82e" stroke-width="2"/>
      <path d="M36 46 v14 M64 46 v14" stroke="#f5b82e" stroke-width="1.2"/><path d="M40 46 h20 v14 h-20z" fill="#ffc4ec" opacity=".75"/></svg>`,
  };
  const ZLABEL = { sunderkand: 'Sunderkand', mehandi: 'Mehandi', engagement: 'Ring + Sangeet', bhaat: 'Bhaat', haldi: 'Haldi', ghudchadi: 'Ghurchadi', baraat: 'Baraat', dinner: 'Wedding', vidaai: 'Vidaai' };
  const ZBG = { sunderkand: '#ffe7c2', mehandi: '#e6f2c8', engagement: '#4a2560', bhaat: '#c8f0e2', haldi: '#ffe7a0', ghudchadi: '#ffe0e8', baraat: '#3a2058', dinner: '#ffc9d7', vidaai: '#24122d' };
  const MSG = {
    sunderkand: 'Blessings first: the jodi joins the Sunderkand path. Jai Shri Ram 🙏',
    mehandi: 'Mehendi time! Rumour is a certain name is hidden in Ayushi’s design 🌿',
    engagement: 'Ring pehna di, and now the dance floor is ON! 💍',
    bhaat: 'Mamaji has arrived: gifts, blessings and more gifts 🎁',
    haldi: 'Haldi look ready, genda crowns and all 💛',
    ghudchadi: 'Sehra bandh gaya! Dulhe Raja is up on the ghodi 🐎',
    baraat: 'The baraat is moving. Dhol bajao! 🥁',
    dinner: 'Varmala done! Now the feast is served 🌸',
    vidaai: 'Taaron ki chhaon mein, with all our love and blessings ✨',
  };
  const OUTFIT = {
    sunderkand: { n: ['kurtaN', 'tilak', 'diya'], a: ['festA', 'base', 'diya'] },
    mehandi: { n: ['greenN'], a: ['greenA', 'mehendi', 'cone'] },
    engagement: { n: ['sequinN', 'shades'], a: ['sequinA', 'shades', 'sparkDup'] },
    bhaat: { n: ['festN', 'gift'], a: ['festA', 'gift'] },
    haldi: { n: ['yellowN', 'crown', 'genda'], a: ['yellowA', 'crown', 'genda'] },
    ghudchadi: { n: ['sherwani', 'safa', 'sehra'], a: ['festA', 'base'] },
    baraat: { n: ['sherwani', 'safa', 'sehra', 'genda'], a: ['festA', 'genda'] },
    dinner: { n: ['sherwani', 'safa', 'sehra', 'varmala'], a: ['lehenga', 'weddingDup', 'jewel', 'varmala'] },
    vidaai: { n: ['sherwani', 'safa', 'varmala'], a: ['lehenga', 'weddingDup', 'jewel', 'varmala'] },
  };
  const outfitOf = id => OUTFIT[id] || { n: ['festN'], a: ['festA'] };

  /* ---------- optional cartoon PNGs (ecard/img/claw/, see README.txt there) ----------
     groom.png / bride.png (base look), couple.png (jackpot + closing art), groom-<id>.png / bride-<id>.png
     per function outfit, plush-1..6.png for the pile. Every file is optional; a missing one falls back to
     the drawn SVG doll, so the card looks exactly as before when the folder is empty. */
  const IMG_DIR = 'img/claw/';
  const PICS = {};   // file name (no .png) -> url, only for files that actually loaded
  function loadPics(names) {
    return Promise.all(names.map(name => new Promise(res => {
      if (PICS[name]) { res(); return; }
      const im = new Image();
      im.onload = () => { if (im.naturalWidth > 0) PICS[name] = IMG_DIR + name + '.png'; res(); };
      im.onerror = () => res();
      im.src = IMG_DIR + name + '.png';
    })));
  }
  const artOf = id => ART[id] || ART.haldi;
  const TITLE = {
    wedding: 'Jodi Pakdo, Shaadi Karao!', engagement: 'Jodi Pakdo, Sagai Karao!', haldi: 'Jodi Pakdo, Haldi Lagao!',
    mehandi: 'Jodi Pakdo, Mehendi Lagao!', sunderkand: 'Jodi Pakdo, Ashirwad Lo!',
  };

  Invite.register('claw', {
    render(root, ctx) {
      const esc = ctx.esc, P = ctx.P, S = ctx.isStatic, RM = ctx.reducedMotion;
      const AUTO = !S && new URLSearchParams(location.search).get('auto') === '1';
      const evs = ctx.events, N = evs.length;
      const DECK = !S && window.InviteDeck;
      ensureDefs();
      const dates = ctx.days.length > 1
        ? `${ctx.days[0].dateShort} – ${ctx.days[ctx.days.length - 1].dateShort} 2026` : ctx.days[0].dateLong;

      // Layer visibility rules, generated from the layer list so CSS and art stay in sync.
      if (!document.getElementById('claw-layer-css')) {
        const st = document.createElement('style');
        st.id = 'claw-layer-css';
        st.textContent = LAYERS.map(k => `.claw-w-${k} .claw-l-${k}{display:inline}`).join('');
        document.head.appendChild(st);
      }

      /* ---------- zone layout: one row up to 3, else back + front rows ---------- */
      const twoRows = N > 3;
      const backN = twoRows ? Math.ceil(N / 2) : 0;
      const ZL = evs.map((e, i) => {
        if (!twoRows) return { row: 'front', cols: N, col: i, bottom: 0, height: 32 };
        const back = i < backN, cols = back ? backN : N - backN, col = back ? i : i - backN;
        return { row: back ? 'back' : 'front', cols, col, bottom: back ? 27 : 0, height: back ? 25 : 27 };
      });
      const maxCols = Math.max.apply(null, ZL.map(z => z.cols));
      const zoneCx = i => (ZL[i].col + 0.5) / ZL[i].cols;

      const zonesHTML = evs.map((e, i) => {
        const z = ZL[i], w = 100 / z.cols;
        return `<div class="claw-zone${z.row === 'back' ? ' claw-back' : ''}" style="left:${(z.col * w).toFixed(2)}%;width:${w.toFixed(2)}%;bottom:${z.bottom}%;height:${z.height}%;--d:${(i * .1).toFixed(2)}s">
          ${artOf(e.id)}${e.id === 'bhaat' ? `<div class="claw-mamaji">${MAMAJI}</div>` : ''}
          <span class="claw-zlabel">${esc(ZLABEL[e.id] || e.name)}</span><span class="claw-zarrow">Drops here</span></div>`;
      }).join('');

      root.innerHTML = `
        <div class="claw-app${S ? ' claw-static' : ''}">
          <header class="claw-head">
            ${window.Invite && Invite.ganeshBlockHTML ? Invite.ganeshBlockHTML({ size: 44, className: 'claw-ganesh' }) : `<p class="claw-shloka" lang="hi">${esc(ctx.T.ganeshShort)}</p>`}
            <p class="claw-eyebrow">${esc(P.groom)} ♥ ${esc(P.bride)} · ${esc(dates)}</p>
            <h1 class="claw-title">${esc(TITLE[ctx.occasion.key] || TITLE.wedding)}</h1>
            <p class="claw-greet"><b>${esc(ctx.greeting)}</b>, this machine is full of plushies, and somewhere in the pile ${esc(P.groom)} and ${esc(P.bride)} are hiding. Catch the jodi, then take them to ${N > 1 ? 'every function' : 'the function'} you’re invited to!</p>
          </header>
          <section class="claw-cabinet" aria-label="Claw machine">
            <p class="claw-topper"><span>Jodi Pakdo Machine</span></p>
            <div class="claw-box" role="img" aria-label="A claw machine full of plushies">
              <div class="claw-rail"></div>
              <div class="claw-pile">${pileHTML()}</div>
              ${zonesHTML}
              <div class="claw-doll claw-groom">${dollSVG(N_CFG)}<img class="claw-pic" alt=""><span class="claw-tag">${esc(P.groom)}</span></div>
              <div class="claw-doll claw-bride">${dollSVG(A_CFG)}<img class="claw-pic" alt=""><span class="claw-tag">${esc(P.bride)}</span></div>
              <div class="claw-claw">
                <div class="claw-carriage"></div>
                <div class="claw-cable"></div>
                <svg class="claw-head-svg" viewBox="0 0 56 44" aria-hidden="true">
                  <g class="claw-prong claw-prong-l"><path d="M24 10 L10 26 L16 40" stroke="#c3ccd1" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>
                  <g class="claw-prong claw-prong-r"><path d="M32 10 L46 26 L40 40" stroke="#c3ccd1" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>
                  <rect x="17" y="0" width="22" height="13" rx="4" fill="#f4f7f8" stroke="#8a969c" stroke-width="1.5"/>
                  <circle cx="28" cy="7" r="3" fill="#ef4b3c"/>
                </svg>
              </div>
              <div class="claw-glare"></div>
            </div>
            ${S ? '' : `
            <div class="claw-panel">
              <div class="claw-steps"><span class="claw-step claw-s1"></span><span class="claw-step claw-s2"></span></div>
              <p class="claw-say" aria-live="polite"></p>
              <button type="button" class="claw-act">Pakdo!</button>
              <div class="claw-row"><button type="button" class="claw-skip">Skip to details</button></div>
            </div>`}
          </section>
          <section class="claw-jackpot" ${S ? '' : 'hidden'} aria-live="polite">
            <div class="claw-jp-inner">
              <div class="claw-jp-couple"></div>
              <div class="claw-jp-track" aria-hidden="true">${'<span>JACKPOT: You’re invited! ★</span>'.repeat(4)}</div>
              <p class="claw-jp-text">Jodi taiyaar, everything is set. The only thing missing is you!</p>
            </div>
          </section>
          <section class="claw-details" ${S ? '' : 'hidden'} aria-label="Invitation details">
            <h2 class="claw-details-h">Your invitation</h2>
            ${S || !DECK ? '' : '<button type="button" class="claw-view">View invitation ›</button>'}
            ${ctx.summaryHTML()}
          </section>
        </div>`;

      const $ = s => root.querySelector(s);
      const $$ = s => Array.prototype.slice.call(root.querySelectorAll(s));
      const box = $('.claw-box'), claw = $('.claw-claw'), cable = $('.claw-cable');
      const zoneEls = $$('.claw-zone');
      const G = { el: $('.claw-groom'), who: 'groom', stage: -1, fx: .32, feet: .875, held: false, off: 0, rest: 'pile', zi: 0, dy: 0 };
      const B = { el: $('.claw-bride'), who: 'bride', stage: -1, fx: .70, feet: .885, held: false, off: 0, rest: 'pile', zi: 0, dy: 0 };
      const BASE = 70; // rail 14 + carriage 12 + claw head 44
      let W = 0, H = 0, dw = 0, clawF = .5, len = 8;
      let phase = 'catch', caught = 0, zoneIdx = 0, busy = false;

      /* ---------- geometry ---------- */
      const DH = () => dw * 80 / 60;
      const zoneFeet = i => { const z = ZL[i]; return H - H * (z.bottom / 100) - H * (z.height / 100) * 0.2; };
      const clawPx = () => clawF * W;
      const clawBottom = () => BASE + len;
      const targetDW = () => (phase === 'zones' || phase === 'done') ? Math.min(W * .17, (W / maxCols) * .5) : W * .19;
      const grabLen = feet => Math.max(8, (feet - DH()) + DH() * .12 - BASE);
      function place(d) {
        d.el.style.width = dw + 'px';
        let x, top;
        if (d.held) { x = clawPx() + d.off * dw; top = clawBottom() - DH() * .12; }
        else { x = d.fx * W; top = (d.rest === 'zone' ? zoneFeet(d.zi) : d.feet * H) - DH() + d.dy; }
        d.el.style.left = x + 'px'; d.el.style.top = top + 'px';
        d.el.style.zIndex = d.held ? 6 : d.rest === 'zone' ? (ZL[d.zi].row === 'back' ? 2 : 5) : 2;
      }
      function draw() { claw.style.left = clawPx() + 'px'; cable.style.height = Math.max(4, len) + 'px'; place(G); place(B); }
      function measure() { W = box.clientWidth; H = box.clientHeight; }

      function dress(d, list) {
        d.el.className = d.el.className.split(' ').filter(c => c.indexOf('claw-w-') !== 0).join(' ');
        list.forEach(k => d.el.classList.add('claw-w-' + k));
      }

      /* ---------- optional PNG characters ---------- */
      // Files to look for: base looks, the couple, the outfit for each of this guest's functions, pile plushies.
      const picNames = ['groom', 'bride', 'couple'].concat(
        ...evs.map(e => ['groom-' + e.id, 'bride-' + e.id]), [1, 2, 3, 4, 5, 6].map(n => 'plush-' + n));
      // Outfit picture for a stage: this function's file, else the latest earlier function's, else the base look.
      const picFor = (who, idx) => {
        for (let k = Math.min(idx, N - 1); k >= 0; k--) { const u = PICS[who + '-' + evs[k].id]; if (u) return u; }
        return PICS[who] || null;
      };
      function applyPic(d) {
        const u = picFor(d.who, d.stage), im = d.el.querySelector('.claw-pic');
        if (u) { if (im.getAttribute('src') !== u) im.setAttribute('src', u); d.el.classList.add('claw-has-pic'); }
        else d.el.classList.remove('claw-has-pic');
      }
      function refreshPics() {
        applyPic(G); applyPic(B);
        const plush = [1, 2, 3, 4, 5, 6].map(n => PICS['plush-' + n]).filter(Boolean);
        if (plush.length) $$('.claw-pile-item[data-k="d"]').forEach((el, k) => {
          if (!el.querySelector('.claw-pile-pic')) el.innerHTML = `<img class="claw-pile-pic" src="${plush[k % plush.length]}" alt="">`;
        });
        const jc = $('.claw-jp-couple');
        if (PICS.couple && !jc.firstChild) { jc.innerHTML = `<img src="${PICS.couple}" alt="${esc(P.groom)} and ${esc(P.bride)}">`; jc.classList.add('claw-on'); }
      }
      // A character inside deck art: the PNG when there is one, else the drawn doll.
      function figure(who, idx, x, y, w, h, cls) {
        const u = picFor(who, idx);
        if (u) return `<image href="${u}" x="${x}" y="${y - h * .1}" width="${w}" height="${h * 1.1}" preserveAspectRatio="xMidYMax meet"/>`;
        return `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 60 80" overflow="visible"><g class="${cls}">${dollInner(who === 'groom' ? N_CFG : A_CFG)}</g></svg>`;
      }

      /* ---------- deck pages ---------- */
      function deckArt(i) {
        const e = evs[i], o = outfitOf(e.id), dark = ['engagement', 'baraat', 'vidaai'].includes(e.id);
        const art = artOf(e.id).replace('<svg class="claw-art"', '<svg x="60" y="62" width="200" height="140" overflow="visible"');
        const gy = e.id === 'ghudchadi' ? 22 : 50;
        return `<svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs><radialGradient id="claw-dg-${e.id}" cx="50%" cy="38%" r="75%"><stop offset="0" stop-color="${dark ? '#6b3a86' : '#fff4f6'}"/><stop offset="1" stop-color="${ZBG[e.id] || '#ffd9e3'}"/></radialGradient></defs>
          <rect width="320" height="200" fill="url(#claw-dg-${e.id})"/>
          ${Array.from({ length: 18 }, (_, k) => `<circle cx="${(k * 53) % 320 + 8}" cy="${(k * 37) % 120 + 8}" r="${k % 3 ? 1.6 : 2.4}" fill="${dark ? '#fff' : '#ef4b3c'}" opacity="${dark ? .5 : .14}"/>`).join('')}
          ${art}
          ${figure('groom', i, e.id === 'ghudchadi' ? 132 : 96, gy, 62, 83, wcls(o.n))}
          ${figure('bride', i, e.id === 'ghudchadi' ? 70 : 162, 50, 62, 83, wcls(o.a))}
          ${sparkles([[78, 40, 5], [246, 52, 6], [258, 112, 4], [60, 120, 4]], dark ? '#ffd23f' : '#f5b82e')}
        </svg>`;
      }
      function closingArt() {
        const o = outfitOf(evs[N - 1].id);
        return `<svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <rect width="320" height="200" fill="#ffd9e3"/>
          ${Array.from({ length: 16 }, (_, k) => `<path d="M${(k * 61) % 300 + 10} ${(k * 43) % 170 + 14}c-3-4-9-1-6 4l6 6 6-6c3-5-3-8-6-4z" fill="#ef4b3c" opacity=".35"/>`).join('')}
          ${PICS.couple
            ? `<image href="${PICS.couple}" x="70" y="10" width="180" height="136" preserveAspectRatio="xMidYMax meet"/>`
            : figure('groom', N - 1, 92, 34, 70, 93, wcls(o.n)) + figure('bride', N - 1, 158, 34, 70, 93, wcls(o.a))}
          <rect x="70" y="150" width="180" height="30" rx="10" fill="#24122d"/><text x="160" y="171" text-anchor="middle" font-family="Shrikhand, Georgia, serif" font-size="17" fill="#f5b82e">JACKPOT!</text>
        </svg>`;
      }
      const page = i => InviteDeck.eventPage(ctx, evs[i], { art: deckArt(i), kicker: `Prize #${i + 1} · ${evs[i].dateShort}`, note: MSG[evs[i].id] || '' });
      function openFullDeck(start) {
        if (!DECK) return Promise.resolve();
        const pages = evs.map((_, i) => page(i));
        pages.push(InviteDeck.closingPage(ctx, { art: closingArt(), kicker: 'Jackpot: you’re invited!' }));
        return InviteDeck.open(pages, { start: start || 0, theme: 'claw-deck', events: ctx.events, label: 'Your prizes' });
      }

      /* ---------- static: final still ---------- */
      function finalState() {
        const last = N - 1, o = outfitOf(evs[last].id);
        phase = 'done'; caught = 2;
        box.classList.add('claw-floor-gone', 'claw-zones-up');
        if (evs[last].id === 'vidaai') box.classList.add('claw-night');
        measure(); dw = targetDW(); len = 8; clawF = .5;
        claw.classList.remove('claw-closed');
        G.held = B.held = false; G.rest = B.rest = 'zone'; G.zi = B.zi = last; G.dy = B.dy = 0;
        const cx = zoneCx(last) * W;
        G.fx = (cx - .48 * dw) / W; B.fx = (cx + .48 * dw) / W;
        if (evs[last].id === 'ghudchadi') { G.fx = cx / W + .02; B.fx = (cx - .9 * dw) / W; G.dy = -DH() * .38; }
        G.el.classList.add('claw-revealed'); B.el.classList.add('claw-revealed');
        dress(G, o.n); dress(B, o.a);
        G.stage = B.stage = last; refreshPics();
        zoneEls.forEach(z => z.classList.add('claw-done'));
        draw();
      }
      if (S) {
        finalState();
        new ResizeObserver(() => { measure(); dw = targetDW(); draw(); }).observe(box);
        Promise.race([loadPics(picNames), new Promise(r => setTimeout(r, 3000))])
          .then(() => { refreshPics(); draw(); ctx.ready(); });
        return;
      }

      /* ---------- interactive ---------- */
      const act = $('.claw-act'), sayEl = $('.claw-say'), skipBtn = $('.claw-skip');
      const jackEl = $('.claw-jackpot'), detEl = $('.claw-details');
      const say = t => { sayEl.textContent = t; };
      const smooth = (RM || AUTO) ? 'auto' : 'smooth';
      const zoneLabel = i => ZLABEL[evs[i].id] || evs[i].name;

      function tween(ms, step) {
        ms = RM ? Math.min(ms, 160) : ms;
        return new Promise(res => {
          const t0 = performance.now();
          const f = t => {
            const p = Math.min(1, (t - t0) / ms);
            step(p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
            if (p < 1) requestAnimationFrame(f); else res();
          };
          requestAnimationFrame(f);
        });
      }
      const wait = ms => new Promise(r => setTimeout(r, RM ? Math.min(ms, 200) : ms));
      const slideTo = (f, ms) => { const f0 = clawF; return tween(ms, e => { clawF = f0 + (f - f0) * e; draw(); }); };
      const setLen = (to, ms) => { const l0 = len; return tween(ms, e => { len = l0 + (to - l0) * e; draw(); }); };
      const flash = (d, cls, ms) => { d.el.classList.add(cls); setTimeout(() => d.el.classList.remove(cls), ms); };
      function setBtn(text, sub) { act.innerHTML = esc(text) + (sub ? `<small>${esc(sub)}</small>` : ''); }
      function updateSteps() {
        const s1 = $('.claw-s1'), s2 = $('.claw-s2');
        s1.classList.toggle('claw-on', phase === 'catch');
        s2.classList.toggle('claw-on', phase === 'zones');
        s1.textContent = `1 · Catch the jodi (${caught}/2)`;
        s2.textContent = `2 · ${N > 1 ? 'The functions' : 'The function'} (${phase === 'done' ? N : zoneIdx}/${N})`;
      }
      function setBusy(on) { busy = on; act.disabled = on; skipBtn.disabled = on; }
      function markZones() { zoneEls.forEach((z, i) => z.classList.toggle('claw-next', phase === 'zones' && i === zoneIdx && !busy)); }

      function spawn(cls, x, y, style, html) {
        if (RM) return;
        const p = document.createElement('i');
        p.className = 'claw-pt ' + cls; p.style.left = x + 'px'; p.style.top = y + 'px';
        Object.keys(style).forEach(k => p.style.setProperty(k, style[k]));
        if (html) p.innerHTML = html;
        box.appendChild(p); setTimeout(() => p.remove(), 2600);
      }
      function burstFloat(chars, colors, cx, cy, n, spread) {
        for (let k = 0; k < n; k++) spawn('claw-float', cx + (Math.random() - .5) * spread * .4, cy, {
          '--dx': (Math.random() - .5) * spread + 'px', '--dy': -(50 + Math.random() * 70) + 'px', '--del': (k * .05) + 's', color: colors[k % colors.length],
        }, chars[k % chars.length]);
      }
      function rain(i, colors, n, shape) {
        const cx = zoneCx(i) * W, zw = W / ZL[i].cols;
        for (let k = 0; k < n; k++) {
          const sq = shape === 'gift' && k % 2 === 0;
          spawn('claw-rain', cx + (Math.random() - .5) * zw * 1.1, -20, {
            '--dy': (zoneFeet(i) + 10) + 'px', '--r': (Math.random() * 360) + 'deg', '--del': (k * .06) + 's', '--t': (.9 + Math.random() * .4) + 's',
            width: sq ? '11px' : '9px', height: sq ? '11px' : shape === 'petal' ? '6px' : '9px', 'border-radius': sq ? '2px' : '50%',
            background: colors[k % colors.length],
          });
        }
      }
      async function costume(id, i) {
        G.el.classList.add('claw-spin'); B.el.classList.add('claw-spin');
        await wait(350);
        const o = outfitOf(id);
        dress(G, o.n); dress(B, o.a);
        G.stage = B.stage = i; applyPic(G); applyPic(B);
        burstFloat(['✦', '✧', '✦'], ['#f5b82e', '#fff', '#ff7aa2'], zoneCx(i) * W, zoneFeet(i) - DH() * .6, 12, 110);
        await wait(380);
        G.el.classList.remove('claw-spin'); B.el.classList.remove('claw-spin');
      }
      function auto(ms) { if (AUTO) setTimeout(() => { if (!busy && !act.hidden) act.click(); }, ms); }

      /* Act 1: catch the jodi from the pile (whatever the claw grabs turns out to be the couple). */
      async function grab() {
        setBusy(true);
        const target = caught === 0 ? G : B;
        say('Claw going down…');
        const dest = caught === 0 ? G.fx : (B.fx * W - .48 * dw) / W;
        await slideTo(Math.max(.08, Math.min(.92, dest)), 520);
        ctx.sound.play('whoosh');
        const L = grabLen(target.feet * H);
        await setLen(L, 850);
        claw.classList.add('claw-closed');
        await wait(280);
        target.held = true; target.off = target === G ? 0 : .48;
        await setLen(8, 900);
        target.el.classList.add('claw-revealed');
        ctx.sound.play('ding'); flash(target, 'claw-wiggle', 1400);
        burstFloat(['✦', '✧', '★'], ['#f5b82e', '#fff', '#ff7aa2'], clawPx() + target.off * dw, clawBottom() + DH() * .3, 14, 130);
        if (target === G) {
          caught = 1; updateSteps();
          say(`Arre, it’s ${P.groom}! The Dulha has been caught 😄`);
          await wait(900);
          await tween(420, e => { G.off = -.48 * e; draw(); });
          say(`Now find the Dulhan. Press Pakdo again!`);
          setBtn('Pakdo!', `Find ${P.bride}`);
          setBusy(false); auto(1200); return;
        }
        caught = 2; updateSteps(); ctx.sound.play('success');
        say(`And here’s ${P.bride}! Jodi caught ❤`);
        burstFloat(['❤', '♥'], ['#ef4b3c', '#ff7aa2', '#d7263d'], clawPx(), clawBottom() + 10, 14, 120);
        await wait(1500);
        await transformFloor();
        setBusy(false); markZones(); auto(1200);
      }

      async function transformFloor() {
        phase = 'zones'; updateSteps();
        say('The plushies are making way… the celebrations are coming up!');
        box.classList.add('claw-floor-gone');
        await wait(600);
        box.classList.add('claw-zones-up');
        const from = dw, to = targetDW();
        await tween(700, e => { dw = from + (to - from) * e; draw(); });
        await wait(450);
        zoneIdx = 0; updateSteps();
        say(`Press Girao and the jodi lands straight at ${zoneLabel(0)}.`);
        setBtn('Girao!', `At ${zoneLabel(0)}`);
      }

      /* Act 2: one tap per function. */
      async function dropZone() {
        const i = zoneIdx, e = evs[i], last = i === N - 1;
        setBusy(true); markZones();
        say(`Off to ${zoneLabel(i)}…`);
        await slideTo(zoneCx(i), 650);
        ctx.sound.play('whoosh');
        const L = grabLen(zoneFeet(i));
        await setLen(L, 800);
        claw.classList.remove('claw-closed');
        [G, B].forEach(d => { d.fx = (clawPx() + d.off * dw) / W; d.held = false; d.rest = 'zone'; d.zi = i; });
        await tween(260, k => { G.dy = B.dy = Math.sin(k * Math.PI) * -9; draw(); });
        G.dy = B.dy = 0; draw();
        setLen(Math.max(8, L - 46), 400);
        ctx.sound.play('pop');

        await animateZone(e, i);
        say(MSG[e.id] || `${e.name}: you’re invited!`);
        zoneIdx = i + 1; updateSteps();
        if (DECK) {
          const shown = InviteDeck.open([page(i)], { single: true, theme: 'claw-deck', events: ctx.events, label: 'Prize unlocked!', cta: last ? 'Jackpot!' : 'Next stop ›' });
          if (AUTO) setTimeout(() => InviteDeck.close(), 2200);
          await shown;
        } else await wait(900);
        zoneEls[i].classList.add('claw-done'); zoneEls[i].classList.remove('claw-disco', 'claw-lit', 'claw-glowing', 'claw-trot');
        box.classList.remove('claw-party'); G.el.classList.remove('claw-dance'); B.el.classList.remove('claw-dance');

        if (last) { phase = 'done'; updateSteps(); await finale(); setBusy(false); return; }

        if (G.dy) await tween(300, k => { G.dy *= (1 - k); draw(); });
        G.dy = 0;
        G.fx = (zoneCx(i) * W - .48 * dw) / W; B.fx = (zoneCx(i) * W + .48 * dw) / W; draw();
        await setLen(L, 450);
        claw.classList.add('claw-closed');
        await wait(220);
        G.held = true; G.off = -.48; B.held = true; B.off = .48;
        await setLen(8, 650);
        say(`Next stop: ${zoneLabel(zoneIdx)}. Press Girao!`);
        setBtn('Girao!', `At ${zoneLabel(zoneIdx)}`);
        setBusy(false); markZones(); auto(1200);
      }

      async function animateZone(e, i) {
        const el = zoneEls[i], cx = zoneCx(i) * W, cy = zoneFeet(i) - DH() * .55;
        switch (e.id) {
          case 'sunderkand':
            el.classList.add('claw-glowing'); ctx.sound.play('bell');
            await costume(e.id, i);
            flash(G, 'claw-sway', 3200); flash(B, 'claw-sway', 3200);
            await wait(1300); break;
          case 'mehandi':
            rain(i, ['#7fb53b', '#4c9a2a', '#f5c21b'], 14, 'petal');
            await costume(e.id, i); await wait(1000); break;
          case 'engagement':
            el.classList.add('claw-open'); ctx.sound.play('chime');
            await wait(400); await costume(e.id, i);
            el.classList.add('claw-disco'); box.classList.add('claw-party');
            G.el.classList.add('claw-dance'); B.el.classList.add('claw-dance');
            await wait(1700); break;
          case 'bhaat':
            el.classList.add('claw-mama');
            rain(i, ['#ef4b3c', '#4fa98f', '#f5b82e', '#ff9f1c'], 16, 'gift');
            await costume(e.id, i); await wait(1000); break;
          case 'haldi':
            rain(i, ['#ffc233', '#ff8c1a'], 18);
            await costume(e.id, i); await wait(900); break;
          case 'ghudchadi':
            await costume(e.id, i);
            el.classList.add('claw-trot'); ctx.sound.play('chime');
            await tween(500, k => { G.fx = (cx + .02 * W * k - .48 * dw * (1 - k)) / W; B.fx = (cx + (.48 - 1.38 * k) * dw) / W; G.dy = -DH() * .38 * k; draw(); });
            burstFloat(['✦', '✧'], ['#f5b82e', '#fff'], cx, cy - 20, 10, 100);
            await wait(1300); break;
          case 'baraat':
            el.classList.add('claw-lit'); ctx.sound.play('dhol');
            await costume(e.id, i);
            flash(G, 'claw-hop', 1800); flash(B, 'claw-hop', 1800);
            burstFloat(['♪', '♫'], ['#ffd23f', '#ff5fa2'], cx, cy, 10, 100);
            await wait(1400); break;
          case 'dinner':
            await costume(e.id, i); ctx.sound.play('success');
            burstFloat(['❤', '♥'], ['#ef4b3c', '#ff7aa2'], cx, cy - 10, 16, 130);
            await wait(1200); break;
          case 'vidaai':
            box.classList.add('claw-night'); el.classList.add('claw-lit'); ctx.sound.play('bell');
            await costume(e.id, i);
            rain(i, ['#ff9ec4', '#fff7e8', '#ffc4ec'], 20, 'petal');
            await wait(1600); break;
          default:
            await costume(e.id, i); await wait(900);
        }
      }

      function confetti() {
        if (RM) return;
        const c = document.createElement('div');
        c.className = 'claw-confetti'; c.setAttribute('aria-hidden', 'true');
        const cols = ['#f5b82e', '#ef4b3c', '#8fd8c0', '#ff7aa2', '#fff7e8'];
        let h = '';
        for (let k = 0; k < 44; k++) h += `<i style="left:${Math.random() * 100}%;background:${cols[k % cols.length]};--dx:${Math.random() * 140 - 70}px;animation-duration:${2 + Math.random() * 1.8}s;animation-delay:${Math.random() * .5}s"></i>`;
        c.innerHTML = h;
        root.querySelector('.claw-app').appendChild(c);
        setTimeout(() => c.remove(), 4500);
      }
      function reveal() { jackEl.hidden = false; detEl.hidden = false; }

      async function finale() {
        say('JACKPOT: you’re invited! 🎉');
        setLen(8, 500); slideTo(.5, 500);
        reveal(); confetti(); ctx.sound.play('success');
        setBtn('View invitation');
        await wait(RM ? 200 : 1100);
        jackEl.scrollIntoView({ behavior: smooth, block: 'start' });
        await wait(RM ? 100 : 700);
        openFullDeck(0);
        if (AUTO) setTimeout(() => { InviteDeck.close(); detEl.scrollIntoView({ behavior: smooth, block: 'start' }); }, 4500);
      }

      function skip() {
        if (busy) return;
        ctx.sound.play('whoosh');
        finalState();
        reveal();
        act.hidden = true; skipBtn.hidden = true;
        say('Jodi taiyaar, and your invitation is just below.');
        updateSteps(); markZones();
        detEl.scrollIntoView({ behavior: smooth, block: 'start' });
      }

      act.addEventListener('click', () => {
        if (busy) return;
        ctx.sound.play('tap');
        if (phase === 'catch') grab();
        else if (phase === 'zones') dropZone();
        else openFullDeck(0);
      });
      skipBtn.addEventListener('click', skip);
      const viewBtn = $('.claw-view');
      if (viewBtn) viewBtn.addEventListener('click', () => { ctx.sound.play('tap'); openFullDeck(0); });

      measure(); dw = targetDW(); draw();
      new ResizeObserver(() => { measure(); dw = targetDW(); draw(); }).observe(box);
      dress(G, ['base']); dress(B, ['base']);
      loadPics(picNames).then(refreshPics);
      say('Press Pakdo, let’s see who we catch!');
      setBtn('Pakdo!', 'From the pile of plushies');
      updateSteps();
      ctx.ready();
      auto(1500);
    },
  });
})();
