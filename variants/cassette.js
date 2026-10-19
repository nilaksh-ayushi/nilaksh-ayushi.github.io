/* Sangeet Playlist: a 90s Bollywood mixtape. Signature card for group 5 (Engagement), works for any group.
   Press PLAY on the deck: the reels spin, the tape winds, and the LCD scrolls each event as a "track", each
   with its own synthesised music (see STYLES); the tape fast-forwards between tracks and Rewind spools back. At the end of Side A the J-card unfolds into liner notes
   (ctx.summaryHTML). Rewind replays, Eject flips to Side B (dance-floor rules), Pause pauses. */
(function () {
  'use strict';

  /* ---------- track titles (by event id; fallback "<name> (Live)") ---------- */
  const TRACK_TITLES = {
    sunderkand: 'Sunderkand (Live Bhajan Session)',
    mehandi: 'Mehandi (Geet Acoustic Session)',
    bhaat: 'Bhaat (Nanihaal Edition)',
    haldi: 'Haldi (Yellow Remix)',
    ghudchadi: 'Sehra Bandi & Ghurchadi (Ghodi Groove)',
    baraat: 'Baraat (Dhol Version)',
    dinner: 'Dinner (Shahi Daawat Interlude)',
    vidaai: 'Vidaai (Unplugged)',
  };
  // Hindi version (?lang=hi) of every title above and of the engagement parts below.
  const TITLES_HI = {
    'Sunderkand (Live Bhajan Session)': 'सुंदरकांड (लाइव भजन सेशन)',
    'Mehandi (Geet Acoustic Session)': 'मेहंदी (ढोलक और गीत सेशन)',
    'Bhaat (Nanihaal Edition)': 'भात (ननिहाल एडिशन)',
    'Haldi (Yellow Remix)': 'हल्दी (पीला रीमिक्स)',
    'Sehra Bandi & Ghurchadi (Ghodi Groove)': 'सेहराबंदी एवं घुड़चढ़ी (घोड़ी ग्रूव)',
    'Baraat (Dhol Version)': 'बारात (ढोल वर्ज़न)',
    'Dinner (Shahi Daawat Interlude)': 'प्रीतिभोज (शाही दावत)',
    'Vidaai (Unplugged)': 'विदाई (अनप्लग्ड)',
    'Sagai (feat. Goad)': 'सगाई (गोद के साथ)',
    'Cocktail Party (Extended Dance Mix)': 'कॉकटेल पार्टी (एक्सटेंडेड डांस मिक्स)',
    'Sangeet (Non-Stop Dhamaka Mix)': 'संगीत (नॉन-स्टॉप धमाका मिक्स)',
  };
  // The engagement evening is split into several tracks that share its time and place.
  const PART_STYLES = {
    sagai: '(Ring Ceremony Edit)',
    goad: '(Blessings Edit)',
    'cocktail party': '(Extended Dance Mix)',
    sangeet: '(Non-Stop Dhamaka Mix)',
  };
  function engagementTitles(name) {
    const parts = name.split(/\s*(?:,|&)\s*/).map(s => s.trim()).filter(Boolean);
    if (parts.length < 2) return [name + ' (Live)'];
    const low = parts.map(p => p.toLowerCase());
    const used = {};
    const out = [];
    const si = low.indexOf('sagai'), gi = low.indexOf('goad');
    if (si >= 0 && gi >= 0) { out.push(parts[si] + ' (feat. ' + parts[gi] + ')'); used[si] = used[gi] = 1; }
    parts.forEach((p, i) => { if (!used[i]) out.push(p + ' ' + (PART_STYLES[low[i]] || '(Live)')); });
    return out;
  }
  function tracksFor(events, hi) {
    const out = [];
    events.forEach(ev => {
      const name = (ev.en || ev).name;   // English name, also in Hindi mode
      let titles = ev.id === 'engagement' ? engagementTitles(name) : [TRACK_TITLES[ev.id] || name + ' (Live)'];
      const en = titles;
      if (hi) titles = titles.map(x => TITLES_HI[x] || x.replace(name, ev.name).replace(' (Live)', ' (लाइव)'));
      titles.forEach((title, k) => out.push({ no: out.length + 1, title, ev, first: k === 0, style: styleOf(ev.id, en[k]) }));
    });
    return out;
  }
  function splitTitle(t) {
    const m = /^(.*?)\s*(\([^)]*\))\s*$/.exec(t);
    return m ? [m[1], m[2]] : [t, ''];
  }
  const pad2 = n => String(n).padStart(2, '0');

  /* ---------- music: every track has its own style ----------
     A style is a 2-bar loop (32 sixteenth-note steps) at its own tempo: drum lanes (one character per step,
     '.' = rest; the map turns a character into [instrument, velocity]), tunes in sargam, a bassline (step → Hz)
     and a chord pad (one chord per bar). Tunes have one token per step: S r R g G m M P d D n N (lower-case
     r g d n = komal, M = tivra), a digit for another octave (N0 = the Ni below, S2 = the Sa above), '-' holds
     the note, '.' rests. */
  const SW = { S: 0, r: 1, R: 2, g: 3, G: 4, m: 5, M: 6, P: 7, d: 8, D: 9, n: 10, N: 11 };
  const note = (x, sa) => sa * Math.pow(2, (SW[x[0]] + 12 * (x.length > 1 ? +x[1] - 1 : 0)) / 12);
  const chord = (sa, s) => s.split(' ').map(x => note(x, sa));
  function tune(str, sa) {
    const out = {};
    let last = -1;
    str.trim().split(/\s+/).forEach((x, i) => {
      if (x === '-') { if (last >= 0) out[last][1]++; return; }
      last = -1;
      if (x === '.') return;
      out[i] = [note(x, sa), 1];
      last = i;
    });
    return out;
  }
  const DHOL = { D: ['dagga', 1], d: ['dagga', 0.6], h: ['tilli', 1], t: ['tilli', 0.45] };
  const DHOLAK = { D: ['dha', 1], g: ['ge', 1], n: ['na', 1], N: ['na', 0.6], t: ['ti', 1], k: ['ti', 0.6] };
  const TABLA = { D: ['dha', 0.7], g: ['ge', 0.7], n: ['na', 0.8], t: ['tin', 1], k: ['ti', 0.5] };
  const PERC = { K: ['kick', 1], k: ['kick', 0.45], C: ['clap', 1], c: ['clap', 0.5], h: ['hat', 1], o: ['ohat', 1], s: ['shaker', 1],
    x: ['spoon', 1], j: ['ching', 1], q: ['chak', 1], g: ['ghung', 1], z: ['chimta', 1] };
  const STYLES = {
    // a dhol pick-up under the "Side A" title
    intro: { bpm: 100, lanes: [['D...t.t.ttth', DHOL, 0.7]] },
    // Sagai: a soft romantic ballad (electric piano, gentle beat)
    sagai: { bpm: 84,
      lanes: [['k...c.....k.c...', PERC, 0.6], ['..s...s...s...s.', PERC, 0.2]],
      tunes: [['keys', tune('P - G - P - D - P - - - G - R - S - R - G - - - R - S - - - . . . .', 523.25), 0.16]],
      bass: { 0: 130.81, 10: 130.81, 16: 110, 26: 110 },
      pad: ['keys', [chord(261.63, 'S G P'), chord(261.63, 'D0 S G')]] },
    // Cocktail party: four-on-the-floor club beat, off-beat bass, chord stabs and a synth hook
    cocktail: { bpm: 124,
      lanes: [['K...K...K...K...', PERC, 0.9], ['....C.......C...', PERC, 0.6], ['..o...o...o...o.', PERC, 0.3], ['hh.hhh.hhh.hhh.h', PERC, 0.15]],
      tunes: [['synth', tune('P2 . P2 . g2 . m2 . P2 . . . n . m2 . P2 . P2 . g2 . m2 . g2 . S2 . . . . .', 220), 0.05]],
      bass: { 2: 110, 6: 110, 10: 110, 14: 110, 18: 87.31, 22: 87.31, 26: 98, 30: 98 },
      stabs: [[3, 11], [chord(220, 'S g P'), chord(220, 'd0 S g')]] },
    // Sangeet: bhangra (dhol chaal, tumbi riff, bass, harmonium chords, chimta)
    sangeet: { bpm: 100, swing: 0.12,
      lanes: [['D..hD.h.D..hDhh.', DHOL, 0.85], ['..z...z...z...z.', PERC, 0.3]],
      tunes: [['tumbi', tune('S2 . . g2 . . m2 . g2 . . S2 . . n . S2 . . g2 . . P2 . m2 . g2 . S2 . . .', 329.63), 0.045]],
      bass: { 0: 82.41, 3: 82.41, 6: 82.41, 8: 98, 11: 82.41, 14: 73.42, 16: 65.41, 19: 65.41, 22: 65.41, 24: 98, 27: 73.42, 30: 73.42 },
      pad: ['harmonium', [chord(329.63, 'S0 g0 P0'), chord(261.63, 'S0 G0 P0')]] },
    // Sunderkand: bhajan (dholak, manjira, harmonium)
    bhajan: { bpm: 84,
      lanes: [['D.g.n.t.n.k.D.n.', DHOLAK, 0.6], ['j...q...j...q...', PERC, 0.3]],
      tunes: [['harmonium', tune('G - G - G - R G m - G - R - S - R - G - R - S - N0 - S - - - . .', 293.66), 0.06]],
      pad: ['harmonium', [chord(293.66, 'S0 P0 S')]] },
    // Mehandi geet: the ladies' dholak with spoon and claps, a bansuri tune, ghungroo
    geet: { bpm: 104, swing: 0.1,
      lanes: [['D.g.n.t.n.k.g.n.', DHOLAK, 0.7], ['..x...x...x...x.', PERC, 0.25], ['....C.......C...', PERC, 0.4], ['g...............................', PERC, 0.2]],
      tunes: [['flute', tune('S - R - G - G - G - R - G P G - R - S - R - G - R - S - - - . . . .', 349.23), 0.08]] },
    // Bhaat / Goad: auspicious shehnai over a drone, soft dholak
    shehnai: { bpm: 92,
      lanes: [['D...n...D.D.n...', DHOLAK, 0.6]],
      tunes: [['shehnai', tune('P - D P m P G - R - G - R S - - N0 - S - R - G - R - S - - - . .', 440), 0.05]],
      pad: ['harmonium', [chord(220, 'S P S2')]] },
    // Haldi: bright and playful (santoor runs, dholak, claps, shaker, ghungroo)
    haldi: { bpm: 116,
      lanes: [['D.n.t.n.D.n.t.nk', DHOLAK, 0.6], ['....C.......C...', PERC, 0.45], ['ssssssssssssssss', PERC, 0.1], ['g.......g.......', PERC, 0.2]],
      tunes: [['santoor', tune('S . G P S2 . P G R . G P D . P G S . G P S2 . D P G . R . S . . .', 523.25), 0.2]],
      bass: { 0: 130.81, 8: 196, 16: 130.81, 24: 196 } },
    // Sehra bandi & ghurchadi: shehnai over the dhol (raag Yaman)
    ghodi: { bpm: 108, swing: 0.12,
      lanes: [['D..hD.h.D..hDhh.', DHOL, 0.85]],
      tunes: [['shehnai', tune('G - M D N - D P M - G - R - S - N0 R G - M G R - S - - - . . . .', 392), 0.05]] },
    // Baraat: the brass band and a hard dhol
    baraat: { bpm: 132,
      lanes: [['D.hhD.hhD.hhDhDh', DHOL, 0.9], ['j...............', PERC, 0.3]],
      tunes: [['brass', tune('S2 - S2 - N - D - P - D - N - S2 - R2 - S2 - N - D - P - - - P - - -', 261.63), 0.07]],
      bass: { 0: 65.41, 8: 98, 16: 65.41, 24: 98 } },
    // Dinner: a lounge interlude (sitar, light tabla, electric piano)
    dinner: { bpm: 88, swing: 0.15,
      lanes: [['D..t.nD.t..n.g..', TABLA, 0.5]],
      tunes: [['sitar', tune('S . . G M . D . N . D . M G . . R . . S N0 . D0 . N0 . R . S . . .', 293.66), 0.18]],
      bass: { 0: 73.42, 6: 73.42, 10: 110, 16: 98, 22: 98, 26: 146.83 },
      pad: ['keys', [chord(146.83, 'S G P N'), chord(146.83, 'm P N R2')]] },
    // Vidaai: unplugged (bansuri in Bhairavi over tanpura and harmonium, no drums)
    vidaai: { bpm: 66,
      tunes: [['flute', tune('S - r - g - - - m - g - r - S - n0 - S - r - g - r - S - - - - - - -', 440), 0.13],
        ['santoor', tune('P0 . . . S . . . S . . . S0 . . . P0 . . . S . . . S . . . S0 . . .', 440), 0.07]],
      pad: ['harmonium', [chord(220, 'S g P'), chord(174.61, 'S G P')]] },
  };
  const EVENT_STYLE = { sunderkand: 'bhajan', mehandi: 'geet', bhaat: 'shehnai', haldi: 'haldi', ghudchadi: 'ghodi',
    baraat: 'baraat', dinner: 'dinner', vidaai: 'vidaai' };
  function styleOf(id, title) {
    if (id === 'engagement') {
      const low = title.toLowerCase();
      return /^sagai/.test(low) ? 'sagai' : /^goad/.test(low) ? 'shehnai' : /cocktail/.test(low) ? 'cocktail' : 'sangeet';
    }
    return EVENT_STYLE[id] || 'sangeet';
  }

  // For the VU meter when there is no audio.
  const BPM = 100;
  const STEP_MS = 60000 / BPM / 4;            // 16th notes
  const DRUM = 'D..hD.h.D..hDhh.';           // D = dhol bass (dagga), h = high (tilli)

  const ICONS = {
    rew: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11.5 6v12L3 12zM21 6v12l-8.5-6z"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15L20 12z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>',
    eject: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4l8 9H4zM4 16h16v3.5H4z"/></svg>',
  };

  /* ---------- cassette drawing (viewBox 400 x 256) ---------- */
  const HOLES_D =
    'M108 118A20 20 0 1 0 148 118A20 20 0 1 0 108 118Z' +
    'M252 118A20 20 0 1 0 292 118A20 20 0 1 0 252 118Z' +
    'M150 100H250A5 5 0 0 1 255 105V131A5 5 0 0 1 250 136H150A5 5 0 0 1 145 131V105A5 5 0 0 1 150 100Z';
  const LABEL_D =
    'M26 16H374A8 8 0 0 1 382 24V170A8 8 0 0 1 374 178H26A8 8 0 0 1 18 170V24A8 8 0 0 1 26 16Z' +
    HOLES_D;
  const R_MIN = 17, R_MAX = 44;

  function hub(cx, cy, cls) {
    let teeth = '';
    for (let i = 0; i < 6; i++) {
      teeth += `<rect x="${cx - 1.6}" y="${cy - 10.6}" width="3.2" height="4.6" rx="1" fill="#efe4cf" transform="rotate(${i * 60} ${cx} ${cy})"/>`;
    }
    return `<g class="cassette-hub cassette-hub-${cls}">
      <circle cx="${cx}" cy="${cy}" r="15" fill="#efe4cf" stroke="#b49c78" stroke-width="1"/>
      <circle cx="${cx}" cy="${cy}" r="10.6" fill="#1a0f14"/>
      ${teeth}
      <circle cx="${cx}" cy="${cy - 12.8}" r="1.3" fill="#b49c78"/>
      <circle cx="${cx + 11.1}" cy="${cy + 6.4}" r="1.3" fill="#b49c78"/>
      <circle cx="${cx - 11.1}" cy="${cy + 6.4}" r="1.3" fill="#b49c78"/>
    </g>`;
  }
  function screw(x, y, p) {
    return `<circle cx="${x}" cy="${y}" r="5.5" fill="url(#${p}screw)" stroke="#5c4320" stroke-width=".8"/>` +
      `<path d="M${x - 3} ${y - 1.1}L${x + 3} ${y + 1.1}M${x + 1.1} ${y - 3}L${x - 1.1} ${y + 3}" stroke="#4a3418" stroke-width="1.2"/>`;
  }
  function cassetteSVG(side, o) {
    const p = 'cassette-' + side + '-';
    const isA = side === 'a';
    const esc = o.esc;
    const t = o.t;
    const title = isA
      ? `${esc(o.groom)} <tspan class="cassette-t-heart">♥</tspan> ${esc(o.bride)} · ${t('Sangeet Mix', 'संगीत मिक्स')} ’${esc(o.yy)}`
      : t('Side B · Dance-floor rules ↓', 'साइड B · डांस फ़्लोर के नियम ↓');
    return `<svg class="cassette-svg" viewBox="0 0 400 256" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="${p}shell" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a2848"/><stop offset=".55" stop-color="#2e1830"/><stop offset="1" stop-color="#1c0e1e"/></linearGradient>
        <linearGradient id="${p}gloss" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".35" stop-color="#fff" stop-opacity=".04"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient>
        <radialGradient id="${p}pack"><stop offset=".3" stop-color="#8a5634"/><stop offset=".75" stop-color="#5e3622"/><stop offset=".97" stop-color="#3a2015"/><stop offset="1" stop-color="#c79b6a"/></radialGradient>
        <linearGradient id="${p}paper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f8f1e2"/><stop offset="1" stop-color="#ecdfc6"/></linearGradient>
        <radialGradient id="${p}screw" cx=".35" cy=".35"><stop offset="0" stop-color="#f3d98f"/><stop offset="1" stop-color="#9c7a36"/></radialGradient>
        <clipPath id="${p}clip"><path clip-rule="evenodd" d="${LABEL_D}"/></clipPath>
      </defs>
      <rect x="2" y="2" width="396" height="252" rx="16" fill="url(#${p}shell)" stroke="#c9a45c" stroke-opacity=".75" stroke-width="2"/>
      <rect x="9" y="9" width="382" height="238" rx="11" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="1"/>
      <rect x="40" y="2" width="22" height="7" rx="2" fill="#12060f"/><rect x="338" y="2" width="22" height="7" rx="2" fill="#12060f"/>
      <rect x="62" y="82" width="276" height="74" rx="12" fill="#0c050e"/>
      <circle class="cassette-pack cassette-pack-l" cx="128" cy="118" r="${R_MAX}" fill="url(#${p}pack)"/>
      <circle class="cassette-pack cassette-pack-r" cx="272" cy="118" r="${R_MIN}" fill="url(#${p}pack)"/>
      ${hub(128, 118, 'l')}${hub(272, 118, 'r')}
      <path fill-rule="evenodd" fill="url(#${p}paper)" d="${LABEL_D}"/>
      <g clip-path="url(#${p}clip)">
        <rect x="18" y="146" width="364" height="18" fill="${isA ? '#5b2a4f' : '#9a5566'}"/>
        <rect x="18" y="164" width="364" height="5" fill="#c9a45c"/>
        <rect x="18" y="169" width="364" height="5" fill="${isA ? '#b56576' : '#5b2a4f'}"/>
        <line x1="30" y1="51" x2="370" y2="51" stroke="#d6c4a2" stroke-width=".9"/>
        <line x1="30" y1="81" x2="370" y2="81" stroke="#d6c4a2" stroke-width=".9"/>
      </g>
      <path fill="none" stroke="#000" stroke-opacity=".35" stroke-width="1.4" d="${HOLES_D}"/>
      <rect x="40" y="99" width="38" height="38" rx="7" fill="${isA ? '#5b2a4f' : '#9a5566'}"/>
      <text class="cassette-t-side" x="59" y="129" text-anchor="middle" font-size="29">${isA ? 'A' : 'B'}</text>
      <text class="cassette-t-print" x="337" y="116" text-anchor="middle" font-size="18">C-90</text>
      <text class="cassette-t-print2" x="337" y="134" text-anchor="middle" font-size="14">HI-FI</text>
      <text class="cassette-t-band" x="200" y="159.5" text-anchor="middle" font-size="12.5">${isA ? t('SIDE A · ', 'साइड A · ') + esc(o.band) + t(' · STEREO', ' · स्टीरियो') : t('SIDE B · BONUS TRACKS · STEREO', 'साइड B · बोनस ट्रैक · स्टीरियो')}</text>
      <text class="cassette-t-title" x="200" y="45" text-anchor="middle" font-size="22" data-fit="336" data-min="15" transform="rotate(-1.2 200 38)">${title}</text>
      <text class="cassette-t-pen" x="34" y="74" font-size="20" data-fit="330" data-min="16.5" data-ellipsis="1" transform="rotate(-.7 34 70)"><tspan class="cassette-t-mf">${t('Made for:', 'किसके लिए:')}</tspan> <tspan class="cassette-t-guest">${esc(o.guest)}</tspan></text>
      <path d="M86 254L104 202H296L314 254Z" fill="#1a0e1b" stroke="#c9a45c" stroke-opacity=".4"/>
      <circle cx="134" cy="234" r="6" fill="#050205"/><circle cx="266" cy="234" r="6" fill="#050205"/>
      <rect x="164" y="222" width="12" height="12" rx="2" fill="#050205"/><rect x="224" y="222" width="12" height="12" rx="2" fill="#050205"/>
      <rect x="108" y="248" width="184" height="4" fill="#3d2318"/>
      <rect x="192" y="242" width="16" height="6" rx="1" fill="#c9b48a"/>
      ${screw(16, 16, p)}${screw(384, 16, p)}${screw(16, 240, p)}${screw(384, 240, p)}${screw(200, 214, p)}
      <rect x="2" y="2" width="396" height="252" rx="16" fill="url(#${p}gloss)" pointer-events="none"/>
    </svg>`;
  }

  function lightsSVG() {
    // A sagging garland of fairy lights across the top of the page.
    const bulbs = [];
    const cols = ['#f3d9a4', '#e3a5ad', '#d9b56a'];
    const seg = (x0, y0, cx, cy, x1, y1, n, off) => {
      for (let i = 1; i < n; i++) {
        const t = i / n, u = 1 - t;
        bulbs.push({ x: u * u * x0 + 2 * u * t * cx + t * t * x1, y: u * u * y0 + 2 * u * t * cy + t * t * y1, c: cols[(i + off) % 3] });
      }
    };
    seg(-10, 6, 135, 58, 270, 10, 9, 0);
    seg(270, 10, 405, 58, 550, 6, 9, 1);
    return `<svg class="cassette-lights" viewBox="0 0 540 64" preserveAspectRatio="xMidYMin slice" aria-hidden="true" focusable="false">
      <path d="M-10 6Q135 58 270 10Q405 58 550 6" fill="none" stroke="#4a3426" stroke-width="1.4"/>
      ${bulbs.map((b, i) => `<g class="cassette-bulb cassette-bulb-${i % 3}"><circle cx="${b.x.toFixed(1)}" cy="${(b.y + 5).toFixed(1)}" r="8" fill="${b.c}" opacity=".22"/><circle cx="${b.x.toFixed(1)}" cy="${(b.y + 5).toFixed(1)}" r="3.2" fill="${b.c}"/></g>`).join('')}
    </svg>`;
  }

  Invite.register('cassette', {
    render(root, ctx) {
      const esc = ctx.esc, P = ctx.P;
      const t_ = ctx.t, HI = ctx.hi;   // Hindi version (?lang=hi). (t is the tape position below.)
      const S = ctx.isStatic, RM = ctx.reducedMotion;
      const AUTO = /[?&]auto=1(?:&|$)/.test(location.search);
      const tracks = tracksFor(ctx.events, HI);
      const N = tracks.length;
      const guest = ctx.guest || t_('Family & Friends', 'परिवारजन एवं मित्रगण');
      const END_TITLE = t_('END OF SIDE A ✓', 'साइड A समाप्त ✓');
      const END_INFO = t_('LINER NOTES BELOW ↓ · ◀◀ REWIND TO REPLAY', 'पूरी जानकारी नीचे ↓ · दोबारा सुनने के लिए ◀◀ रिवाइंड');
      const PRESS = t_('PRESS ▶ PLAY', '▶ प्ले दबाएँ');
      const TRK = t_('TRK', 'ट्रैक');
      const EJECT_A = t_('Eject: flip to Side B', 'इजेक्ट: साइड B पर पलटें');
      const READY_INFO = HI ? `साइड A · ${N} ट्रैक · ${guest} के लिए` : `SIDE A · ${N} TRACK${N > 1 ? 'S' : ''} · MADE FOR ${guest.toUpperCase()}`;
      const d0 = ctx.days[0], dN = ctx.days[ctx.days.length - 1];
      const band = (ctx.days.length === 1 ? d0.dateShort : `${d0.events[0].day} ${d0.mon} – ${dN.events[0].day} ${dN.mon}`).toUpperCase();
      const yy = ctx.events[0].date.slice(2, 4);
      const svgOpts = { esc, t: t_, groom: P.groom, bride: P.bride, yy, band, guest };
      const groomFam = (P.family || '').split(' ')[0];
      const brideFam = (P.brideParents || '').trim().split(/\s+/).pop();
      const dancey = ctx.events.some(e => ['engagement', 'baraat', 'ghudchadi', 'haldi', 'mehandi'].indexOf(e.id) >= 0);
      const ganesh = (window.Invite && Invite.art && Invite.art.ganesh) ? Invite.art.ganesh({ size: 48 }) : '';
      const venues = [];
      ctx.events.forEach(e => {
        const v = HI && e.venueInfo.hi ? e.venueInfo.hi.name : e.venueInfo.name;
        if (venues.indexOf(v) < 0) venues.push(v);
      });

      /* ---- J-card track list ---- */
      const trackRow = tr => {
        const [main, paren] = splitTitle(tr.title);
        const e = tr.ev;
        return `<li class="cassette-track" data-i="${tr.no - 1}">
          <span class="cassette-track-no" aria-hidden="true">${pad2(tr.no)}</span>
          <span class="cassette-track-name"><span class="cassette-track-main">${esc(main)}</span>${paren ? ` <em>${esc(paren)}</em>` : ''}</span>
          <span class="cassette-track-time${e.isTimeText ? ' is-text' : ''}">${esc(e.time)}</span>
          ${tr.first ? `<span class="cassette-track-place">${esc(e.placeFull)}</span>` : ''}
        </li>`;
      };
      const trackList = ctx.days.map(d => {
        const dayTracks = tracks.filter(tr => tr.ev.date === d.date);
        return `<div class="cassette-tday">
          <h3 class="cassette-tday-h">${esc(d.dateLong)}</h3>
          <ol class="cassette-tracks" start="${dayTracks[0].no}">${dayTracks.map(trackRow).join('')}</ol>
        </div>`;
      }).join('');

      /* ---- liner notes: split ctx.summaryHTML into the header (panel 2) and the details (panel 3) ---- */
      const tmp = document.createElement('div');
      tmp.innerHTML = ctx.summaryHTML();
      const sum = tmp.querySelector('.inv-sum');
      const head = sum.querySelector('.inv-sum-head');
      if (head && !head.querySelector('.inv-sum-bless') && head.textContent.indexOf(P.blessings) < 0) {
        const bl = document.createElement('p');
        bl.className = 'cassette-bless';
        bl.innerHTML = HI ? `<b>${esc(P.blessings)}</b>के आशीर्वाद से` : `With the divine blessings of<b>${esc(P.blessings)}</b>`;
        const hosts = head.querySelector('.inv-sum-hosts');
        if (hosts) head.insertBefore(bl, hosts); else head.insertBefore(bl, head.firstChild);
      }
      const headHTML = head ? head.outerHTML : '';
      if (head) head.remove();
      const restHTML = sum.innerHTML;

      const credits = `
        <dl class="cassette-credits">
          <div><dt>${t_('Lead vocals', 'मुख्य गायक')}</dt><dd>${esc(P.groom)} ${t_('&amp;', 'और')} ${esc(P.bride)}</dd></div>
          <div><dt>${t_('Executive producers', 'निर्माता')}</dt><dd>${HI ? `${esc(groomFam)} एवं ${esc(brideFam)} परिवार` : `The ${esc(groomFam)} &amp; ${esc(brideFam)} families`}</dd></div>
          <div><dt>${t_('Recorded live at', 'लाइव रिकॉर्डिंग')}</dt><dd>${venues.map(esc).join(t_(' &amp; ', ' एवं '))}</dd></div>
          <div><dt>${t_('Backing vocals', 'कोरस')}</dt><dd>${t_('All of you, very loudly ♥', 'आप सब, ज़ोर-ज़ोर से ♥')}</dd></div>
        </dl>`;

      const sideB = `
        <div class="cassette-bnote" aria-hidden="true">
          <div class="cassette-bnote-paper">
            ${HI ? `<h2>साइड B · डांस फ़्लोर के नियम</h2>
            <ol>
              <li>कोई बैठेगा नहीं। कुर्सियाँ सिर्फ़ सजावट के लिए हैं।</li>
              <li>अंकल जी का सोलो डांस ज़रूरी है।</li>
              <li>हर गाना “बस, आख़िरी गाना” है।</li>
              <li>जूते मर्ज़ी से, मुस्कान ज़रूरी।</li>
            </ol>
            <p class="cassette-bnote-sign">मैनेजमेंट (मम्मी जी)</p>` : `<h2>Side B · Dance-floor rules</h2>
            <ol>
              <li>No sitting. The chairs are only for decoration.</li>
              <li>Uncle ji ka solo is mandatory.</li>
              <li>Every song is “bas, last song”.</li>
              <li>Shoes optional, smiles compulsory.</li>
            </ol>
            <p class="cassette-bnote-sign">The Management (Mummy ji)</p>`}
          </div>
        </div>`;

      const deck = `
        <section class="cassette-deck" aria-label="${t_('Cassette player', 'कैसेट प्लेयर')}">
          <div class="cassette-deck-top">
            <span class="cassette-brand">${t_('BAJAO', 'बजाओ')}<b>·90</b></span>
            <span class="cassette-brand-sub">${t_('Stereo cassette deck · Auto-reverse', 'स्टीरियो कैसेट डेक · ऑटो-रिवर्स')}</span>
            <span class="cassette-led" aria-hidden="true"></span>
          </div>
          <div class="cassette-lcd">
            <div class="cassette-lcd-row">
              <span class="cassette-lcd-state" aria-hidden="true">■</span>
              <span class="cassette-lcd-label">${t_('NOW PLAYING', 'अभी बज रहा है')}</span>
              <span class="cassette-lcd-trk">${TRK} --/${pad2(N)}</span>
              <span class="cassette-lcd-time">0:00</span>
            </div>
            <div class="cassette-lcd-line cassette-lcd-title"><span>${PRESS}</span></div>
            <div class="cassette-lcd-line cassette-lcd-info"><span>${esc(READY_INFO)}</span></div>
          </div>
          <div class="cassette-vu" aria-hidden="true">
            <div class="cassette-vu-row"><span>L</span><i><b></b></i></div>
            <div class="cassette-vu-row"><span>R</span><i><b></b></i></div>
          </div>
          <div class="cassette-keys">
            <button type="button" class="cassette-key cassette-key-rew" data-k="rew" aria-label="${t_('Rewind and replay', 'रिवाइंड करके फिर से सुनें')}">${ICONS.rew}<span>${t_('Rewind', 'रिवाइंड')}</span></button>
            <button type="button" class="cassette-key cassette-key-play" data-k="play" aria-label="${t_('Play', 'प्ले')}" aria-pressed="false">${ICONS.play}<span>${t_('PLAY', 'प्ले')}</span></button>
            <button type="button" class="cassette-key cassette-key-pause" data-k="pause" aria-label="${t_('Pause', 'पॉज़')}" aria-pressed="false">${ICONS.pause}<span>${t_('Pause', 'पॉज़')}</span></button>
            <button type="button" class="cassette-key cassette-key-eject" data-k="eject" aria-label="${EJECT_A}">${ICONS.eject}<span>${t_('Eject', 'इजेक्ट')}</span></button>
          </div>
        </section>`;

      root.innerHTML = `
        <div class="cassette-wrap${S ? ' is-static' : ''}">
          <div class="cassette-grain" aria-hidden="true"></div>
          ${lightsSVG()}
          ${S ? '' : `<button type="button" class="cassette-skip">${t_('Skip to details ↓', 'सीधे विवरण देखें ↓')}</button>`}
          <header class="cassette-head">
            <p class="cassette-kicker">${t_('Shaadi Records presents', 'शादी रिकॉर्ड्स पेश करते हैं')}</p>
            <h1 class="cassette-greet${ctx.greeting.length > 30 ? ' is-long' : ''}">${esc(ctx.greeting)}</h1>
            <p class="cassette-sub">${HI
              ? (S ? `हमने आपके लिए एक मिक्सटेप बनाई है। साइड A पर है: ${esc(ctx.occasion.title)}।` : 'हमने आपके लिए एक मिक्सटेप बनाई है। ▶ प्ले दबाएँ।')
              : S ? 'We made you a mixtape. Side A is our ' + esc(ctx.occasion.title) + '.' : 'We made you a mixtape. Press ▶ Play.'}</p>
          </header>
          <div class="cassette-flip">
            <div class="cassette-card">
              <div class="cassette-face cassette-face-a">${cassetteSVG('a', svgOpts)}</div>
              ${S ? '' : `<div class="cassette-face cassette-face-b">${cassetteSVG('b', svgOpts)}</div>`}
            </div>
          </div>
          ${S ? '' : sideB + deck}
          <section class="cassette-jcard" aria-label="${t_('Track list and liner notes', 'ट्रैक लिस्ट और पूरी जानकारी')}">
            <div class="cassette-panel cassette-panel-cover">
              <div class="cassette-spine" aria-hidden="true"><span>${t_('Sangeet Mix', 'संगीत मिक्स')} ’${esc(yy)}</span></div>
              <div class="cassette-cover-body">
                <div class="cassette-cover-head">
                  <span class="cassette-cover-side">${t_('Side A', 'साइड A')}</span>
                  <span class="cassette-cover-hi" lang="hi">${esc(ctx.occasion.titleHi)}</span>
                </div>
                <p class="cassette-cover-mix">${HI ? 'ट्रैक लिस्ट' : `${esc(ctx.occasion.title)} · the track list`}</p>
                ${trackList}
                ${S ? '' : `<p class="cassette-cover-hint">${t_('Liner notes unfold after the last track ↓', 'आख़िरी ट्रैक के बाद पूरी जानकारी खुलेगी ↓')}</p>`}
              </div>
            </div>
            <div class="cassette-panel cassette-panel-notes"${S ? '' : ' hidden'}>
              <div class="cassette-shloka">
                <p lang="hi">${esc(ctx.T.ganeshShort)}</p>
                ${ganesh ? `<span class="cassette-ganesh">${ganesh}</span>` : ''}
              </div>
              <p class="cassette-notes-title">${t_('Liner notes', 'लाइनर नोट्स')}</p>
              ${credits}
              <div class="inv-sum cassette-sum">${headHTML}</div>
            </div>
            <div class="cassette-panel cassette-panel-details"${S ? '' : ' hidden'}>
              <div class="inv-sum cassette-sum">${restHTML}</div>
              ${S ? `<p class="cassette-outro">${dancey ? t_('Side A ends here. The dancing doesn’t.', 'साइड A यहीं ख़त्म होती है, डांस नहीं।') : t_('Side A ends here. See you there!', 'साइड A यहीं ख़त्म होती है। वहीं मिलते हैं!')}</p>`
                : `<p class="cassette-outro"><button type="button" class="cassette-again">${t_('◀◀ Rewind &amp; play again', '◀◀ रिवाइंड करके फिर से सुनें')}</button></p>`}
            </div>
          </section>
          <p class="cassette-sr" aria-live="polite"></p>
        </div>`;

      const $ = sel => root.querySelector(sel);
      const $$ = sel => Array.prototype.slice.call(root.querySelectorAll(sel));

      /* ---- fit hand-written label lines to the label width (SVG units, so width-independent) ---- */
      function fitLabels() {
        $$('text[data-fit]').forEach(t => {
          const max = +t.getAttribute('data-fit'), min = +t.getAttribute('data-min');
          let fs = +t.getAttribute('font-size'), guard = 0;
          try {
            while (t.getComputedTextLength() > max && fs > min && guard++ < 60) { fs -= 0.5; t.setAttribute('font-size', fs); }
            if (t.getAttribute('data-ellipsis')) {
              const g = t.querySelector('.cassette-t-guest');
              guard = 0;
              while (g && t.getComputedTextLength() > max && g.textContent.length > 4 && guard++ < 120) {
                g.textContent = g.textContent.replace(/…$/, '').slice(0, -1).trimEnd() + '…';
              }
            }
          } catch (e) { /* not laid out */ }
        });
      }
      const fontsReady = new Promise(res => {
        let done = false;
        const fin = () => { if (!done) { done = true; res(); } };
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(fin, fin);
        setTimeout(fin, 2500);
      });

      if (S) {
        fontsReady.then(() => { fitLabels(); setTimeout(ctx.ready, 50); });
        return;
      }
      fontsReady.then(fitLabels);

      /* ================= interactive ================= */
      const wrap = $('.cassette-wrap');
      const card = $('.cassette-card'), flip = $('.cassette-flip');
      const bnote = $('.cassette-bnote');
      const lcdState = $('.cassette-lcd-state'), lcdTrk = $('.cassette-lcd-trk'), lcdTime = $('.cassette-lcd-time');
      const lcdTitle = $('.cassette-lcd-title span'), lcdInfo = $('.cassette-lcd-info span');
      const vuBars = $$('.cassette-vu-row b');
      const keys = {};
      $$('.cassette-key').forEach(b => { keys[b.getAttribute('data-k')] = b; });
      const rows = $$('.cassette-track');
      const panels = [$('.cassette-panel-notes'), $('.cassette-panel-details')];
      const hint = $('.cassette-cover-hint');
      const sr = $('.cassette-sr');
      const packs = {
        aL: $('.cassette-face-a .cassette-pack-l'), aR: $('.cassette-face-a .cassette-pack-r'),
        bL: $('.cassette-face-b .cassette-pack-l'), bR: $('.cassette-face-b .cassette-pack-r'),
      };
      const hubL = $('.cassette-face-a .cassette-hub-l'), hubR = $('.cassette-face-a .cassette-hub-r');

      const INTRO = RM ? 600 : 1800;
      const TRACK = RM ? 2600 : (N <= 3 ? 5200 : N <= 5 ? 4200 : N <= 7 ? 3600 : 3000);
      const SEEK = RM ? 0 : 750;      // the tape fast-forwards to each track
      const SEG = SEEK + TRACK;
      const TOTAL = INTRO + N * SEG;
      // Where the tape is: track k (-1 = the intro) and whether it is still winding on to it.
      function where(tt) {
        if (tt < INTRO) return { k: -1, seek: false };
        const k = Math.min(N - 1, Math.floor((tt - INTRO) / SEG));
        return { k, seek: tt - INTRO - k * SEG < SEEK };
      }

      let mode = 'idle';            // idle | play | pause | rew | end
      let seeking = false;          // playing, but fast-forwarding to the next track
      let side = 'a';
      let t = 0, cur = -2, vStep = 0, rewRate = 8, after = null;
      let angL = 0, angR = 0;
      let lvl = [0, 0];
      let unfolded = false;

      /* ---- audio: plays through the shared graph (ctx.sound.graph) and checks ctx.sound.muted before every note ---- */
      let ac = null, kit = null, fx = null,  // fx: the shared bus, for deck noises that ignore the pause gate
      master = null, mus = null, aK = -3, aStep = 0, aNext = 0;
      function ensureAudio() {
        try {
          if (!ac) {
            const g = ctx.sound.graph && ctx.sound.graph();
            if (!g) return null;
            ac = g.ac; kit = g.kit; fx = g.input;
            master = ac.createGain(); master.gain.value = 0.8; master.connect(g.input);
            const send = ac.createGain(); send.gain.value = 0.16; master.connect(send); send.connect(g.hall);
            newBus();
          }
          if (ac.state === 'suspended') ac.resume();
        } catch (e) { ac = null; }
        return ac;
      }
      // Each track plays into its own gain; starting a new one fades out whatever the last track left ringing.
      function newBus() {
        if (mus) {
          const old = mus;
          old.gain.setTargetAtTime(0.0001, ac.currentTime, 0.015);
          setTimeout(() => { try { old.disconnect(); } catch (e) { /* ignore */ } }, 400);
        }
        mus = ac.createGain(); mus.connect(master);
      }
      function env(g, at, a, peak, d) {
        g.gain.setValueAtTime(0.0001, at);
        g.gain.exponentialRampToValueAtTime(peak, at + a);
        g.gain.exponentialRampToValueAtTime(0.0001, at + d);
      }
      const o0 = at => Math.max(0, at - ac.currentTime - 0.005);   // absolute time → the kit's "seconds from now"
      const D = o => Object.assign({ dest: mus }, o);
      const INS = {
        dagga: (at, v) => kit.drum(o0(at), 118, 52, D({ v: 0.75 * v, d: 0.42, slap: 0.12 * v, sf: 600, pan: -0.15 })),
        tilli: (at, v) => kit.drum(o0(at), 520, 400, D({ v: 0.22 * v, d: 0.12, slap: 0.22 * v, sf: 3200, pan: 0.25, glide: 0.05 })),
        ge: (at, v) => kit.drum(o0(at), 140, 75, D({ v: 0.5 * v, d: 0.32, slap: 0.05 * v, sf: 500, pan: -0.1, glide: 0.2 })),
        na: (at, v) => kit.drum(o0(at), 720, 660, D({ v: 0.18 * v, d: 0.22, slap: 0.18 * v, sf: 4200, pan: 0.2, glide: 0.15 })),
        dha: (at, v) => { INS.ge(at, v); INS.na(at, 0.8 * v); },
        ti: (at, v) => kit.drum(o0(at), 950, 900, D({ v: 0.07 * v, d: 0.06, slap: 0.14 * v, sf: 3000, pan: 0.2 })),
        tin: (at, v) => kit.drum(o0(at), 880, 860, D({ v: 0.15 * v, d: 0.4, slap: 0.08 * v, sf: 5000, pan: 0.2, glide: 0.3 })),
        ching: (at, v) => {
          [2900, 4170, 5350].forEach((f, i) => kit.osc(o0(at), D({ f, v: 0.04 * v / (i + 1), a: 0.001, d: 0.7, pan: 0.35, rev: 0.25 })));
          kit.noise(o0(at), D({ d: 0.05, v: 0.05 * v, hp: 6000, pan: 0.35 }));
        },
        chak: (at, v) => {
          [2900, 4170].forEach(f => kit.osc(o0(at), D({ f, v: 0.025 * v, a: 0.001, d: 0.07, pan: 0.35 })));
          kit.noise(o0(at), D({ d: 0.03, v: 0.06 * v, hp: 5000, pan: 0.35 }));
        },
        clap: (at, v) => [0, 0.011, 0.022].forEach((x, i) => kit.noise(o0(at) + x, D({ d: i === 2 ? 0.12 : 0.012, v: 0.2 * v, bp: 1300, q: 1.1, rev: 0.15 }))),
        spoon: (at, v) => { kit.osc(o0(at), D({ f: 3300, v: 0.03 * v, a: 0.001, d: 0.05, pan: -0.3 })); kit.noise(o0(at), D({ d: 0.015, v: 0.05 * v, hp: 4000, pan: -0.3 })); },
        shaker: (at, v) => kit.noise(o0(at), D({ a: 0.01, d: 0.06, v: 0.045 * v, hp: 6500, pan: 0.3 })),
        kick: (at, v) => { kit.osc(o0(at), D({ f: 160, f2: 45, glide: 0.09, v: 0.7 * v, a: 0.002, d: 0.32 })); kit.noise(o0(at), D({ d: 0.01, v: 0.08 * v, hp: 2000 })); },
        hat: (at, v) => kit.noise(o0(at), D({ d: 0.035, v: 0.05 * v, hp: 8000, pan: 0.2 })),
        ohat: (at, v) => kit.noise(o0(at), D({ a: 0.003, d: 0.16, v: 0.05 * v, hp: 7000, pan: -0.2 })),
        ghung: (at, v) => kit.ghungroo(o0(at), D({ n: 8, d: 0.25, v: 0.03 * v })),
        chimta: (at, v) => { kit.noise(o0(at), D({ d: 0.06, v: 0.04 * v, bp: 5200, q: 1.5 })); kit.osc(o0(at), D({ f: 3400, v: 0.015 * v, a: 0.001, d: 0.08 })); },
      };
      // Tumbi: a single bright string, plucked hard: the pitch snaps down and a resonant filter gives the twang.
      function tumbi(at, f, v) {
        const fl = ac.createBiquadFilter(), g = ac.createGain();
        fl.type = 'lowpass'; fl.Q.value = 7;
        fl.frequency.setValueAtTime(4800, at); fl.frequency.exponentialRampToValueAtTime(700, at + 0.22);
        env(g, at, 0.002, v, 0.28);
        ['square', 'sawtooth'].forEach((type, i) => {
          const o = ac.createOscillator();
          o.type = type; o.detune.value = i ? 7 : 0;
          o.frequency.setValueAtTime(f * 1.04, at); o.frequency.exponentialRampToValueAtTime(f, at + 0.025);
          o.connect(fl); o.start(at); o.stop(at + 0.35);
        });
        fl.connect(g); g.connect(mus);
      }
      function bass(at, f) {
        const o = ac.createOscillator(), sub = ac.createOscillator(), fl = ac.createBiquadFilter(), g = ac.createGain();
        o.type = 'sawtooth'; o.frequency.value = f; sub.frequency.value = f;
        fl.type = 'lowpass'; fl.Q.value = 2; fl.frequency.setValueAtTime(700, at); fl.frequency.exponentialRampToValueAtTime(180, at + 0.2);
        env(g, at, 0.004, 0.2, 0.26);
        o.connect(fl); sub.connect(fl); fl.connect(g); g.connect(mus);
        o.start(at); sub.start(at); o.stop(at + 0.3); sub.stop(at + 0.3);
      }
      // Harmonium: two slightly detuned reeds per note, held for the bar.
      function harmonium(at, notes, len) {
        const fl = ac.createBiquadFilter(), g = ac.createGain();
        fl.type = 'lowpass'; fl.frequency.value = 1500;
        g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(0.045, at + 0.12);
        g.gain.setValueAtTime(0.045, at + len - 0.15); g.gain.exponentialRampToValueAtTime(0.0001, at + len);
        notes.forEach(f => [-6, 6].forEach(c => {
          const o = ac.createOscillator();
          o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = c;
          o.connect(fl); o.start(at); o.stop(at + len + 0.05);
        }));
        fl.connect(g); g.connect(mus);
      }
      // Lead voices: (time, Hz, length in s, volume).
      const LEAD = {
        harmonium: (at, f, l, v) => [-5, 5].forEach(c => kit.osc(o0(at), D({ f, det: c, type: 'sawtooth', v: v / 2, a: 0.03, hold: l * 0.85, d: l + 0.1, lp: 2200, rev: 0.2 }))),
        shehnai: (at, f, l, v) => kit.osc(o0(at), D({ f: f * 0.97, f2: f, glide: 0.06, type: 'sawtooth', v, a: 0.03, hold: l * 0.8, d: l + 0.12, vib: [5.5, f * 0.012], lp: 2600, q: 3, rev: 0.3 })),
        flute: (at, f, l, v) => {
          kit.osc(o0(at), D({ f: f * 0.985, f2: f, glide: 0.05, type: 'triangle', v, a: 0.06, hold: l * 0.8, d: l + 0.15, vib: [5, f * 0.008], rev: 0.4 }));
          kit.noise(o0(at), D({ a: 0.05, d: Math.min(0.4, l), v: v * 0.3, bp: f * 2, q: 3 }));
        },
        santoor: (at, f, l, v) => kit.pluck(o0(at), f, D({ v, pan: (Math.random() - 0.5) * 0.6, rev: 0.3 })),
        sitar: (at, f, l, v) => {
          kit.pluck(o0(at), f, D({ v, rev: 0.25 }));
          kit.osc(o0(at), D({ f: f * 1.01, f2: f, glide: 0.08, type: 'sawtooth', v: v * 0.25, d: Math.max(0.3, l), lp: 3200, to: 700, q: 5 }));
        },
        brass: (at, f, l, v) => {
          [-8, 0, 8].forEach(c => kit.osc(o0(at), D({ f, det: c, type: 'sawtooth', v: v / 3, a: 0.035, hold: l * 0.7, d: l + 0.08, lp: 1000, to: 2600, vib: [6, f * 0.006], rev: 0.15 })));
          kit.osc(o0(at), D({ f: f / 2, type: 'sawtooth', v: v / 4, a: 0.03, hold: l * 0.7, d: l + 0.08, lp: 900 }));
        },
        keys: (at, f, l, v) => kit.fm(o0(at), f, D({ ratio: 1, index: 1.1, v, d: Math.max(0.7, l + 0.5), rev: 0.35 })),
        synth: (at, f, l, v) => ['square', 'sawtooth'].forEach((type, i) => kit.osc(o0(at), D({ f, det: i ? 9 : 0, type, v: v / 2, a: 0.004, hold: l * 0.5, d: l + 0.05, lp: 3000, to: 900, q: 3, rev: 0.2 }))),
        tumbi: (at, f, l, v) => tumbi(at, f, v),
      };
      const PADS = {
        harmonium,
        keys: (at, notes, len) => notes.forEach(f => kit.fm(o0(at), f, D({ ratio: 1, index: 0.7, v: 0.035, a: 0.01, d: len, rev: 0.35 }))),
        stab: (at, notes) => notes.forEach(f => [-7, 7].forEach(c => kit.osc(o0(at), D({ f, det: c, type: 'sawtooth', v: 0.018, a: 0.004, d: 0.18, lp: 2400, to: 700, q: 2, rev: 0.25 })))),
      };
      // One step of a style: plays it (unless muted) and returns how hard it hits, for the VU meter.
      function runStep(st, s, at, play) {
        const ls = s % 32, stepS = 15 / st.bpm;
        let a = 0;
        (st.lanes || []).forEach(([pat, map, w]) => {
          const h = map[pat[s % pat.length]];
          if (h) { if (play) INS[h[0]](at, h[1]); a = Math.max(a, w * h[1]); }
        });
        (st.tunes || []).forEach(([voice, notes, v]) => {
          const n = notes[ls];
          if (n) { if (play) LEAD[voice](at, n[0], n[1] * stepS, v); a = Math.max(a, 0.5); }
        });
        if (play && st.bass && st.bass[ls]) bass(at, st.bass[ls]);
        if (play && st.pad && ls % 16 === 0) PADS[st.pad[0]](at, st.pad[1][(ls / 16) % st.pad[1].length], 16 * stepS);
        if (play && st.stabs && st.stabs[0].indexOf(ls % 16) >= 0) PADS.stab(at, st.stabs[1][Math.floor(ls / 16) % st.stabs[1].length]);
        return a;
      }
      function bump(a, ms) {
        setTimeout(() => { lvl[0] = Math.max(lvl[0], a + Math.random() * 0.12); lvl[1] = Math.max(lvl[1], a - 0.05 + Math.random() * 0.12); }, Math.max(0, ms));
      }
      function audioTick() {
        if (!ac || ac.state !== 'running' || mode !== 'play') return;
        const w = where(t);
        if (w.seek) { if (aK !== -3) { aK = -3; newBus(); } return; }   // silent while the tape winds on
        if (w.k !== aK) { if (aK !== -3) newBus(); aK = w.k; aStep = 0; aNext = ac.currentTime + 0.03; }
        const st = STYLES[w.k < 0 ? 'intro' : tracks[w.k].style], stepS = 15 / st.bpm;
        if (aNext < ac.currentTime) aNext = ac.currentTime + 0.03;
        while (aNext < ac.currentTime + 0.15) {
          const at = aNext + (st.swing && aStep % 2 ? stepS * st.swing : 0);
          const a = runStep(st, aStep, at, !ctx.sound.muted);
          if (a) bump(a, (at - ac.currentTime) * 1000);
          aStep++; aNext += stepS;
        }
      }
      // The tape winding at speed (fast-forward between tracks, or rewinding): motor whir, hiss, the music
      // chattering past at chipmunk pitch, and the clunk when it stops.
      function windSound(dur, back) {
        if (!ac || ac.state !== 'running' || ctx.sound.muted) return;
        const M = o => Object.assign({ dest: fx }, o);
        kit.osc(0.02, M({ f: back ? 900 : 220, f2: back ? 320 : 760, glide: dur, type: 'sawtooth', v: 0.03, a: 0.08, hold: Math.max(0.05, dur - 0.2), d: dur, lp: 2000 }));
        kit.noise(0.02, M({ a: 0.08, hold: Math.max(0.05, dur - 0.2), d: dur, v: 0.05, bp: 2600, q: 0.8 }));
        for (let x = 0.05; x < dur - 0.08; x += 0.035 + Math.random() * 0.02) {
          kit.osc(x, M({ f: 700 + Math.random() * 2200, type: 'square', v: 0.012, a: 0.002, d: 0.03, lp: 3200 }));
        }
        kit.osc(dur, M({ f: 150, f2: 70, v: 0.2, d: 0.07 }));
        kit.noise(dur, M({ d: 0.02, v: 0.1, hp: 2500 }));
      }
      function audioGate(on) {
        if (!ac || !master) return;
        try {
          const now = ac.currentTime;
          master.gain.cancelScheduledValues(now);
          if (on) master.gain.setValueAtTime(0.8, now); else master.gain.setTargetAtTime(0.0001, now, 0.02);
        } catch (e) { /* ignore */ }
      }
      function clunk() {
        if (!ac || ac.state !== 'running' || ctx.sound.muted) return;
        kit.osc(0.01, { f: 180, f2: 70, v: 0.35, d: 0.12, dest: fx });
        kit.noise(0.01, { d: 0.06, v: 0.25, lp: 1500, dest: fx });
      }

      /* ---- LCD ---- */
      function marquee(span) {
        if (span._anim) { try { span._anim.cancel(); } catch (e) { /* ignore */ } span._anim = null; }
        span.style.transform = '';
        if (RM || !span.animate) return;
        const box = span.parentNode.clientWidth, w = span.scrollWidth;
        const over = w - box;
        if (over <= 4) return;
        const dur = Math.max(TRACK - 200, over / 0.07 + 1600);
        span._anim = span.animate([
          { transform: 'translateX(0)' }, { transform: 'translateX(0)', offset: 0.18 },
          { transform: `translateX(${-over - 6}px)`, offset: 0.85 }, { transform: `translateX(${-over - 6}px)` },
        ], { duration: dur, iterations: Infinity, easing: 'linear' });
        if (mode === 'pause') span._anim.pause();
      }
      function lcd(title, info) {
        lcdTitle.textContent = title; lcdInfo.textContent = info;
        marquee(lcdTitle); marquee(lcdInfo);
      }
      function paintState() {
        lcdState.textContent = mode === 'play' && seeking ? '▶▶' : { idle: '■', play: '▶', pause: '❚❚', rew: '◀◀', end: '■' }[mode];
        wrap.classList.toggle('is-winding', mode === 'rew' || (mode === 'play' && seeking));
        keys.play.classList.toggle('is-down', mode === 'play' || mode === 'rew');
        keys.play.setAttribute('aria-pressed', String(mode === 'play'));
        keys.pause.classList.toggle('is-down', mode === 'pause');
        keys.pause.setAttribute('aria-pressed', String(mode === 'pause'));
        wrap.classList.toggle('is-playing', mode === 'play');
        [lcdTitle, lcdInfo].forEach(s => { if (s._anim) { try { mode === 'pause' ? s._anim.pause() : s._anim.play(); } catch (e) { /* ignore */ } } });
      }
      function setTrack(i) {
        if (i === cur) return;
        cur = i;
        rows.forEach((r, k) => { r.classList.toggle('is-now', k === i); r.classList.toggle('is-done', i >= 0 && k < i); });
        if (i === -1) {
          lcdTrk.textContent = `${TRK} --/${pad2(N)}`;
          if (HI) lcd(`♫ साइड A · संगीत मिक्स ’${yy}`, `${guest} को समर्पित · सप्रेम, ${P.groom} ♥ ${P.bride}`);
          else lcd(`♫ SIDE A · SANGEET MIX ’${yy}`, `DEDICATED TO ${guest.toUpperCase()} · WITH LOVE, ${P.groom.toUpperCase()} ♥ ${P.bride.toUpperCase()}`);
          return;
        }
        const tr = tracks[i], e = tr.ev;
        lcdTrk.textContent = `${TRK} ${pad2(tr.no)}/${pad2(N)}`;
        lcd(tr.title.toUpperCase(), `${e.dateShort} · ${e.time} · ${e.place}`.toUpperCase());
        sr.textContent = `${t_('Track', 'ट्रैक')} ${tr.no}: ${tr.title}. ${e.dateLong}, ${e.time}, ${e.placeFull}.`;
      }

      /* ---- tape + meters ---- */
      function drawTape() {
        const p = Math.min(1, Math.max(0, t / TOTAL));
        const k = R_MAX * R_MAX - R_MIN * R_MIN;
        const rL = Math.sqrt(R_MIN * R_MIN + k * (1 - p)), rR = Math.sqrt(R_MIN * R_MIN + k * p);
        packs.aL.setAttribute('r', rL.toFixed(2)); packs.aR.setAttribute('r', rR.toFixed(2));
        packs.bL.setAttribute('r', rR.toFixed(2)); packs.bR.setAttribute('r', rL.toFixed(2));
        return [rL, rR];
      }
      function hit(s) {
        const ch = DRUM[s % 16];
        const j = () => Math.random() * 0.12;
        let a = 0;
        if (ch === 'D') a = 0.84; else if (ch === 'h') a = 0.62; else if (s % 2 === 0) a = 0.38;
        if (a) { lvl[0] = Math.max(lvl[0], a + j()); lvl[1] = Math.max(lvl[1], a - 0.05 + j()); }
      }
      function drawVU() {
        vuBars.forEach((b, i) => { b.style.setProperty('--l', (Math.round(Math.min(1, lvl[i]) * 16) / 16).toFixed(4)); });
      }

      let raf = 0, dog = 0, lastT = 0;
      const now = () => (window.performance && performance.now) ? performance.now() : Date.now();
      function active() { return mode === 'play' || mode === 'rew' || lvl[0] > 0.02 || lvl[1] > 0.02; }
      function tick() {
        const n = now();
        const dt = Math.min(250, Math.max(0, n - lastT));
        lastT = n;
        if (mode === 'play') {
          t += dt;
          const w = where(t);
          if (w.seek !== seeking) { seeking = w.seek; if (seeking) windSound(SEEK / 1000, false); paintState(); }
          if (seeking) flicker();
          else if (!ac) { const st = Math.floor(t / STEP_MS); while (vStep < st) { vStep++; hit(vStep); } }
          audioTick();
          setTrack(w.k);
          if (t >= TOTAL) { t = TOTAL; endSide(); }
        } else if (mode === 'rew') {
          t -= dt * rewRate;
          flicker();
          if (t <= 0) { t = 0; rewDone(); }
        }
        const r = drawTape();
        if (mode === 'play' || mode === 'rew') {
          const dir = mode === 'rew' ? -rewRate : seeking ? 8 : (RM ? 0.4 : 1);
          const K = 360 * R_MIN * 0.9;
          angL = (angL + dir * K / r[0] * dt / 1000) % 360;
          angR = (angR + dir * K / r[1] * dt / 1000) % 360;
          hubL.setAttribute('transform', `rotate(${angL.toFixed(1)} 128 118)`);
          hubR.setAttribute('transform', `rotate(${angR.toFixed(1)} 272 118)`);
        }
        const decay = Math.pow(0.25, dt / 260);
        lvl[0] *= decay; lvl[1] *= decay;
        drawVU();
        const secs = Math.floor(t / 1000);
        lcdTime.textContent = `${Math.floor(secs / 60)}:${pad2(secs % 60)}`;
      }
      function flicker() {   // the meters twitch while the tape winds
        if (Math.random() < 0.5) { lvl[0] = Math.max(lvl[0], 0.25 + Math.random() * 0.3); lvl[1] = Math.max(lvl[1], 0.2 + Math.random() * 0.3); }
      }
      function frame() { raf = 0; tick(); if (active()) raf = requestAnimationFrame(frame); }
      function loop() {
        if (!raf && window.requestAnimationFrame) { lastT = now(); raf = requestAnimationFrame(frame); }
        if (!dog) {
          if (!raf) lastT = now();
          // Safety net for WebViews / headless renderers that throttle requestAnimationFrame.
          dog = setInterval(() => {
            if (now() - lastT > 90) tick();
            if (!active()) { clearInterval(dog); dog = 0; }
          }, 45);
        }
      }

      /* ---- transport ---- */
      function play() {
        if (mode === 'play' || mode === 'rew') return;
        if (mode === 'end') { rewind(); return; }
        if (t === 0) { vStep = 0; aStep = 0; aK = -2; seeking = false; cur = -2; }
        vStep = Math.floor(t / STEP_MS);
        aNext = 0;
        mode = 'play';
        audioGate(true);
        if (t === 0) setTrack(-1); else { const c = cur; cur = -2; setTrack(c); }
        paintState(); loop();
      }
      function pause() {
        if (mode === 'play') { mode = 'pause'; audioGate(false); paintState(); }
        else if (mode === 'pause') play();
      }
      function rewind() {
        if (mode === 'rew') return;
        if (t === 0) { play(); return; }
        audioGate(false);
        mode = 'rew';
        rewRate = Math.max(6, t / (RM ? 500 : 1500));
        rows.forEach(r => r.classList.remove('is-now', 'is-done'));
        cur = -2;
        lcdTrk.textContent = `${TRK} --/${pad2(N)}`;
        lcd(t_('◀◀ REWINDING…', '◀◀ रिवाइंड हो रहा है…'), t_('ONE MORE TIME, FROM THE TOP', 'एक बार फिर, शुरू से'));
        seeking = false;
        windSound(Math.min(2.5, t / rewRate / 1000), true);
        paintState(); loop();
      }
      function rewDone() { mode = 'idle'; play(); }
      function endSide() {
        mode = 'end';
        audioGate(false); clunk();
        rows.forEach(r => { r.classList.remove('is-now'); r.classList.add('is-done'); });
        cur = N;
        lcdTrk.textContent = `${TRK} ${pad2(N)}/${pad2(N)}`;
        lcd(END_TITLE, END_INFO);
        sr.textContent = t_('End of Side A. The liner notes with all the details are below.', 'साइड A समाप्त। पूरी जानकारी नीचे है।');
        paintState();
        if (!unfolded) setTimeout(() => unfold(false, true), RM ? 150 : 700);
        if (after) { const f = after; after = null; f(); }
      }
      function unfold(instant, scroll) {
        if (unfolded) return;
        unfolded = true;
        if (hint) hint.hidden = true;
        panels.forEach((p, i) => {
          const show = () => {
            p.hidden = false;
            if (!instant && !RM) { p.classList.add('is-unfolding'); setTimeout(() => p.classList.remove('is-unfolding'), 900); }
          };
          if (instant || RM) show(); else setTimeout(show, i * 520);
        });
        if (!instant) ctx.sound.play('chime');
        if (scroll) setTimeout(() => scrollToEl(panels[0], 64), instant ? 0 : 120);
      }
      function scrollToEl(el, off) {
        const y = el.getBoundingClientRect().top + (window.pageYOffset || 0) - (off || 0);
        try { window.scrollTo({ top: y, behavior: RM ? 'auto' : 'smooth' }); } catch (e) { window.scrollTo(0, y); }
      }
      function eject() {
        if (mode === 'play' || mode === 'rew') { if (mode === 'rew') t = Math.max(0, t); mode = 'pause'; audioGate(false); paintState(); }
        side = side === 'a' ? 'b' : 'a';
        const toB = side === 'b';
        card.classList.toggle('is-b', toB);
        if (!RM) { flip.classList.remove('is-eject'); void flip.offsetWidth; flip.classList.add('is-eject'); }
        bnote.classList.toggle('is-open', toB);
        bnote.setAttribute('aria-hidden', String(!toB));
        keys.eject.setAttribute('aria-label', toB ? t_('Eject: flip back to Side A', 'इजेक्ट: वापस साइड A पर') : EJECT_A);
        if (toB) {
          lcd(t_('SIDE B · BONUS TRACK', 'साइड B · बोनस ट्रैक'), t_('DANCE-FLOOR RULES · 1. NO SITTING · 2. UNCLE JI KA SOLO MANDATORY', 'डांस फ़्लोर के नियम · 1. कोई बैठेगा नहीं · 2. अंकल जी का सोलो ज़रूरी'));
          sr.textContent = t_('Side B: Dance-floor rules. 1, no sitting. 2, Uncle ji ka solo is mandatory. 3, every song is the last song. 4, shoes optional, smiles compulsory.',
            'साइड B: डांस फ़्लोर के नियम। 1, कोई बैठेगा नहीं। 2, अंकल जी का सोलो डांस ज़रूरी है। 3, हर गाना आख़िरी गाना है। 4, जूते मर्ज़ी से, मुस्कान ज़रूरी।');
        } else {
          const c = cur; cur = -2;
          if (mode === 'end') lcd(END_TITLE, END_INFO);
          else if (t === 0) lcd(PRESS, READY_INFO);
          else setTrack(c);
          if (cur === -2) cur = c;
        }
        ctx.sound.play('pop');
      }
      function onPlayKey() {
        if (side === 'b') { eject(); setTimeout(play, RM ? 50 : 650); return; }
        play();
      }
      function skip() {
        if (mode !== 'end') {
          if (side === 'b') eject();
          t = TOTAL; mode = 'end';
          audioGate(false);
          rows.forEach(r => { r.classList.remove('is-now'); r.classList.add('is-done'); });
          cur = N;
          lcdTrk.textContent = `${TRK} ${pad2(N)}/${pad2(N)}`;
          lcd(END_TITLE, END_INFO);
          drawTape(); paintState(); loop();
        }
        unfold(true, false);
        setTimeout(() => scrollToEl(panels[0], 64), 30);
      }

      const tap = b => { b.classList.remove('is-tap'); void b.offsetWidth; b.classList.add('is-tap'); setTimeout(() => b.classList.remove('is-tap'), 200); };
      root.addEventListener('click', e => {
        const k = e.target.closest('.cassette-key');
        if (k) {
          ensureAudio();
          ctx.sound.play('tap');
          tap(k);
          const a = k.getAttribute('data-k');
          if (a === 'play') onPlayKey();
          else if (a === 'pause') { if (side === 'a') pause(); }
          else if (a === 'rew') { if (side === 'b') eject(); rewind(); }
          else if (a === 'eject') eject();
          return;
        }
        if (e.target.closest('.cassette-skip')) { ctx.sound.play('tap'); skip(); }
        if (e.target.closest('.cassette-again')) {
          ensureAudio(); ctx.sound.play('tap');
          scrollToEl(flip, 70);
          if (side === 'b') eject();
          setTimeout(rewind, RM ? 0 : 450);
        }
      });

      drawTape(); drawVU();
      setTimeout(() => { marquee(lcdInfo); }, 400);
      fontsReady.then(() => { marquee(lcdTitle); marquee(lcdInfo); ctx.ready(); });

      /* ---- preview hook: ?sideb=1 opens on Side B (for previews/screenshots) ---- */
      if (/[?&]sideb=1(?:&|$)/.test(location.search)) setTimeout(eject, 300);

      /* ---- auto demo (?auto=1) ---- */
      if (AUTO) {
        setTimeout(() => { tap(keys.play); ensureAudio(); play(); }, 1500);
        after = () => {
          setTimeout(() => { scrollToEl(wrap, 0); }, 4200);
          setTimeout(() => { tap(keys.eject); eject(); }, 5000);
          setTimeout(() => { tap(keys.eject); eject(); }, 9000);
          setTimeout(() => { scrollToEl(panels[0], 64); }, 9800);
        };
      }
    },
  });
})();
