/* Taaron ki Chhaon — a brass telescope on a Delhi rooftop.
   Act 1: focus the eyepiece and bring two stars (Nilaksh's calm one, Ayushi's sparkly one) into a binary orbit.
   Act 2: the guest drives the telescope; each invited function is a real sky object (keyed by event id).
   Act 3 (wedding groups only): Saptarishi → Vasishtha & Arundhati → Dhruv Tara, for the Vidaai
   "Taaron ki Chhaon Mein". Function details pop up in the shared InviteDeck; the page ends with ctx.summaryHTML(). */
(function () {
  'use strict';

  const SHORT = {
    sunderkand: 'Sunderkand', mehandi: 'Mehandi', engagement: 'Sagai & Sangeet', bhaat: 'Bhaat', haldi: 'Haldi',
    ghudchadi: 'Ghurchadi', baraat: 'Baraat', dinner: 'Dinner', vidaai: 'Vidaai',
  };
  // One sky object per function. Copy is keyed by event id; dates, times and places always come from ctx.events.
  const SKY = {
    sunderkand: { kind: 'mangal', name: 'Mangal', hi: 'मंगल', sci: 'Mars',
      ro: 'Target · Mangal (Mars) · the red planet',
      cap: 'Mangal, the steady red planet. Mangalvaar is Hanuman ji’s day, and every good beginning starts with his blessings.' },
    mehandi: { kind: 'chitra', name: 'Chitra', hi: 'चित्रा', sci: 'Spica',
      ro: 'Target · Chitra (Spica) · RA 13h 25m · Dec −11° 10′',
      cap: 'Chitra literally means “a picture”. The prettiest pictures of the season will be drawn in mehendi.' },
    engagement: { kind: 'rohini', name: 'Rohini', hi: 'रोहिणी', sci: 'Aldebaran',
      ro: 'Target · Rohini (Aldebaran) · RA 04h 36m · Dec +16° 31′',
      cap: 'Rohini, the Moon’s most beloved. A night of rings, raag and a lot of dancing.' },
    bhaat: { kind: 'krittika', name: 'Krittika', hi: 'कृत्तिका', sci: 'Pleiades',
      ro: 'Target · Krittika (Pleiades) · RA 03h 47m · Dec +24° 07′',
      cap: 'A whole family, shining together. Just like the nanihaal arriving with the Bhaat.' },
    haldi: { kind: 'shukra', name: 'Shukra', hi: 'शुक्र', sci: 'Venus',
      ro: 'Target · Shukra (Venus) · planet · low in the east',
      cap: 'The brightest star of the morning: Shukra, the planet of love. Haldi is a morning affair, and every bit as bright.' },
    ghudchadi: { kind: 'ashwini', name: 'Ashwini', hi: 'अश्विनी', sci: 'Hamal & Sheratan',
      ro: 'Target · Ashwini (Hamal & Sheratan) · RA 02h 07m · Dec +23° 28′',
      cap: 'Ashwini, the horse-headed nakshatra. Naturally, the dulha rides in on a ghodi.' },
    baraat: { kind: 'kalpurush', name: 'Kalpurush', hi: 'कालपुरुष', sci: 'Orion’s belt',
      ro: 'Target · Kalpurush (Orion) · the belt · RA 05h 36m',
      cap: 'Three stars marching in a perfect row: the baraat is on its way. (The real one will be louder, and far less in line.)' },
    dinner: { kind: 'brihaspati', name: 'Brihaspati', hi: 'बृहस्पति', sci: 'Jupiter',
      ro: 'Target · Brihaspati (Jupiter) · with four bright moons',
      cap: 'The biggest planet in the sky, for the grandest feast of the season.' },
  };
  const WED = ['ghudchadi', 'baraat', 'dinner', 'vidaai'];
  const BLESSINGS = ['Even the stars agree: jodi salamat rahe ✨', 'A shooting star, a full wish: sada khush raho', 'From the whole sky, dher saara pyaar'];

  Invite.register('stars', {
    render(root, ctx) {
      const esc = ctx.esc, P = ctx.P, S = ctx.isStatic, RM = ctx.reducedMotion;
      const AUTO = !S && new URLSearchParams(location.search).get('auto') === '1';
      const evs = ctx.events;
      const vidaai = evs.find(e => e.id === 'vidaai') || null;
      const exploreEvs = evs.filter(e => e.id !== 'vidaai');
      const hasFinale = evs.some(e => WED.includes(e.id));
      const shortOf = e => SHORT[e.id] || e.name;
      const skyOf = e => SKY[e.id] || { kind: 'chitra', name: 'A bright star', hi: '', sci: 'for ' + shortOf(e),
        ro: 'Target · a bright star', cap: 'A bright star, reserved just for this one.' };

      const LINES = {
        focus: 'All blurry? Turn the focus ring below until the sky goes sharp.',
        binary: `Two stars, two moods. One calm and steady: ${P.groom}. One bright and full of sparkle: ${P.bride}. See how they keep looking at each other… Drag one star towards the other.`,
        twirl: `${P.bride}’s star lights up with joy: one happy twirl around ${P.groom}’s!`,
        lock: 'In astronomy this is called a binary star: two stars that orbit each other forever. We call it a jodi.',
        name: 'One calm and steady, one bright and sparkly. Together, the whole sky.',
        explore: 'The telescope is yours now. Drag to look around the sky, or tap “Show the next star”.',
        arundhati: `After the pheras, the couple is shown Dhruv Tara and Arundhati: one steadfast, one forever beside Vasishtha. Soon, ${P.groom} and ${P.bride} too.`,
        dhruv: vidaai ? `Dhruv Tara never leaves its place. And the Vidaai will be “${vidaai.time}”, under these very stars.` : '',
        closing: 'That’s every star with your name on it. The sky is ready. Are you?',
      };
      const SAPTA_RO = 'Target · Saptarishi (Ursa Major) · Vasishtha RA 13h 24m · Dec +54° 56′';
      const SAPTA_CAP = 'Saptarishi: the seven sages, shining together. Look closely at the middle star of the handle: Vasishtha.';
      const DHRUV_RO = 'Target · Dhruv Tara (Polaris) · RA 02h 32m · Dec +89° 16′';
      const ARUN_RO = 'Target · Vasishtha + Arundhati (Mizar & Alcor) · 11.8′ apart';

      /* ---------- helpers ---------- */
      const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
      function rng(seed) { let s = seed % 2147483647; if (s <= 0) s += 2147483646; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
      function hexA(h, a) { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; }
      const wait = ms => new Promise(r => setTimeout(r, RM ? 0 : ms));
      function animate(ms, fn) {
        return new Promise(res => {
          if (RM) { fn(1); res(); return; }
          const t0 = performance.now();
          const f = t => { const p = Math.min(1, (t - t0) / ms); fn(p); if (p < 1) requestAnimationFrame(f); else res(); };
          requestAnimationFrame(f);
        });
      }

      /* ---------- world ---------- */
      const WORLD = { w: 3200, h: 2000, horizon: 1830 };
      const A1 = { x: 900, y: 460 };
      function group(bx, by, u, list) { return list.map(([a, b, rad, col]) => ({ x: bx + a * u, y: by + b * u, rad, col: col || '#f3f5ff' })); }

      // Finale objects (Saptarishi, Arundhati, Dhruv Tara) sit top-right.
      const SAPTA = group(2400, 900, 120, [
        [0, 0, 2.6, '#ffe2b8'], [0.08, 0.62, 2.4], [0.85, 0.75, 2.3], [0.92, 0.2, 1.7], [1.5, 0.12, 2.5], [2.05, 0.18, 2.4], [2.6, 0.6, 2.4],
      ]);
      const SAPTA_NAMES = ['Kratu', 'Pulaha', 'Pulastya', 'Atri', 'Angiras', 'Vasishtha', 'Marichi'];
      const SAPTA_LINES = [[0, 1], [1, 2], [2, 3], [3, 0], [3, 4], [4, 5], [5, 6]];
      const MIZAR = SAPTA[5], DUBHE = SAPTA[0], MERAK = SAPTA[1];
      const ARUNDHATI = { x: MIZAR.x + 11, y: MIZAR.y - 8 };
      const POLARIS = { x: DUBHE.x + (DUBHE.x - MERAK.x) * 5, y: DUBHE.y + (DUBHE.y - MERAK.y) * 5 };
      const SAPTA_VIEW = { x: 2556, y: 942, s: 0.95 };
      const DHRUV_VIEW = { x: 2454, y: 740, s: 0.6 };

      // Slots for 1–6 function objects, clear of Act 1 (A1) and the finale corner.
      const SLOTS = [{ x: 1350, y: 860 }, { x: 1800, y: 1250 }, { x: 1150, y: 1380 }, { x: 1980, y: 1040 }, { x: 1560, y: 1620 }, { x: 640, y: 1520 }];
      const LOW = { x: 620, y: 1690 };   // Shukra sits low over the horizon

      function build(kind, ax, ay) {
        const o = { kind, ax, ay, tx: ax, ty: ay, s: 1.4, stars: [], lines: [], lineCol: '#9fc0ff', lx: ax, ly: ay };
        if (kind === 'mangal') {
          o.planet = { x: ax, y: ay, r: 4, col: '#ff8a5c', spread: 6 }; o.s = 1.6;
        } else if (kind === 'chitra') {
          o.stars = group(ax, ay, 1, [[0, 0, 2.8, '#cfe0ff'], [-60, -40, 1.2], [-112, -72, 1.3], [52, -56, 1.1], [-34, -104, 1.2]]);
          o.lines = [[0, 1], [1, 2], [0, 3], [1, 4]]; o.lineCol = '#cfe0ff'; o.s = 1.4;
        } else if (kind === 'rohini') {
          o.stars = group(ax, ay - 13, 110, [[0, 0.12, 3.0, '#ffb27a'], [-0.22, 0.05, 1.4], [-0.5, -0.02, 1.5], [-0.32, -0.2, 1.3], [0.02, -0.4, 1.5], [1.25, -1.45, 2.2], [1.55, -0.62, 1.8]]);
          o.lines = [[2, 3], [3, 4], [4, 5], [2, 1], [1, 0], [0, 6]]; o.lineCol = '#ffb27a';
          o.moon = { x: ax + 155, y: ay + 137, r: 30 }; o.tx = ax + 50; o.ty = ay; o.s = 1.0;
        } else if (kind === 'krittika') {
          o.stars = group(ax, ay, 34, [[0, 0, 1.9, '#dfe8ff'], [0.75, 0.12, 1.6, '#dfe8ff'], [0.8, -0.12, 1.0, '#dfe8ff'], [-0.95, -0.32, 1.6, '#dfe8ff'], [-0.55, 0.38, 1.5, '#dfe8ff'], [-0.62, -0.6, 1.6, '#dfe8ff'], [-0.18, -0.88, 1.4, '#dfe8ff']]);
          o.lines = [[3, 5], [5, 6], [6, 0], [0, 1], [1, 2], [0, 4], [4, 3]]; o.lineCol = '#9fc0ff';
          o.haze = { x: ax - 6, y: ay - 6, r: 70, col: '130,160,255' }; o.tx = ax - 15; o.ty = ay - 10; o.s = 2.4;
          o.lx = ax + 26; o.ly = ay + 22;
        } else if (kind === 'shukra') {
          o.planet = { x: ax, y: ay, r: 4.5, col: '#fff4d6', spread: 7 }; o.ty = ay - 40; o.s = 1.5;
        } else if (kind === 'ashwini') {
          o.stars = group(ax, ay, 1, [[0, 0, 2.4, '#ffd9a8'], [-70, 28, 1.9], [-84, 46, 1.4]]);
          o.lines = [[0, 1], [1, 2]]; o.lineCol = '#ffd9a8'; o.tx = ax - 30; o.ty = ay + 15; o.s = 1.8;
        } else if (kind === 'kalpurush') {
          o.stars = group(ax, ay, 1, [[-38, 8, 1.9], [0, 0, 2.0], [40, -9, 2.1], [-80, -120, 2.6, '#ffb27a'], [62, -110, 1.9, '#dfe8ff'], [-58, 118, 1.8], [86, 105, 2.6, '#cfe0ff']]);
          o.lines = [[0, 1], [1, 2], [3, 0], [4, 2], [0, 5], [2, 6], [3, 4], [5, 6]]; o.lineCol = '#dfe8ff'; o.s = 1.1;
          o.lx = ax + 50; o.ly = ay;
        } else if (kind === 'brihaspati') {
          o.planet = { x: ax, y: ay, r: 5, col: '#ffe9c4', spread: 6 };
          o.moons = [[-22, 1], [-12, -0.5], [14, 0.6], [26, -1]].map(([dx, dy]) => ({ x: ax + dx, y: ay + dy })); o.s = 2.6;
        }
        return o;
      }

      const OBJS = [];
      (() => {
        const slots = SLOTS.slice();
        const hasHaldi = exploreEvs.some(e => e.id === 'haldi');
        if (hasHaldi) slots.pop();
        exploreEvs.forEach(e => {
          const sk = skyOf(e);
          const at = e.id === 'haldi' ? LOW : slots.shift();
          const o = build(sk.kind, at.x, at.y);
          Object.assign(o, { id: e.id, ev: e, name: sk.name, hi: sk.hi, sci: sk.sci, ro: sk.ro, cap: sk.cap });
          OBJS.push(o);
        });
      })();
      const objOf = id => OBJS.find(o => o.id === id);

      const BG = [];
      (() => {
        const r = rng(2122026);
        for (let i = 0; i < 1800; i++) {
          const x = r() * WORLD.w, y = r() * (WORLD.horizon - 20);
          if (Math.hypot(x - A1.x, y - A1.y) < 240 && r() < 0.75) continue;
          const m = r();
          BG.push({ x, y, rad: m < 0.025 ? 1.6 : m < 0.12 ? 1.05 : 0.35 + r() * 0.55,
            col: m < 0.06 ? '#ffd7a8' : (r() < 0.25 ? '#cddcff' : '#f3f5ff'), tw: r() * 6.28, sp: 0.4 + r() * 1.6 });
        }
      })();
      const SKYLINE = (() => {
        const r = rng(310), out = []; let x = 0;
        while (x < WORLD.w) { const w = 24 + r() * 50; out.push({ x, w, h: 18 + r() * 60 }); x += w; }
        return out;
      })();

      /* ---------- markup ---------- */
      function roofDecor() {
        const r = rng(41); let s = '';
        for (let i = 0; i < 60; i++) s += `<circle cx="${(r() * 360).toFixed(1)}" cy="${(r() * 210).toFixed(1)}" r="${(r() < 0.12 ? 1.3 : 0.6).toFixed(1)}" fill="#eef2ff" opacity="${(0.4 + r() * 0.6).toFixed(2)}"/>`;
        const q = (t, a, b, c) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * b + t * t * c;
        let b = '';
        [[0, 90, 180, 132, 178, 140], [180, 270, 360, 140, 104, 152]].forEach(([x0, x1, x2, y0, y1, y2], k) => {
          for (let i = 1; i < 10; i++) {
            const t = i / 10;
            b += `<circle class="stars-bulb" style="animation-delay:${(((i + k * 4) % 6) * 0.3).toFixed(1)}s" cx="${q(t, x0, x1, x2).toFixed(1)}" cy="${(q(t, y0, y1, y2) + 3).toFixed(1)}" r="2.6" fill="${['#ffcf6b', '#ff9fb8', '#fff3d6', '#9fe0d6'][i % 4]}"/>`;
          }
        });
        return { stars: s, bulbs: b };
      }
      const RD = roofDecor();
      const roofSVG = `
        <svg class="stars-roof" viewBox="0 0 360 400" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="stars-rsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050913"/><stop offset=".6" stop-color="#0f1a30"/><stop offset=".72" stop-color="#2e2638"/><stop offset="1" stop-color="#16121c"/></linearGradient>
            <linearGradient id="stars-brass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0d394"/><stop offset=".5" stop-color="#b98d3e"/><stop offset="1" stop-color="#7a5a22"/></linearGradient>
            <linearGradient id="stars-tank" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#08090c"/><stop offset=".35" stop-color="#2a2d36"/><stop offset="1" stop-color="#07080b"/></linearGradient>
          </defs>
          <rect width="360" height="400" fill="url(#stars-rsky)"/>
          <g>${RD.stars}</g>
          <path d="M0 272 V244 H14 V236 H26 V250 H40 V230 H52 V226 H58 V230 H66 V248 H72 L75 160 L77 156 L79 160 L82 248 H96 V238 H112 V244 Q122 224 132 244 H146 V232 H160 V250 H176 V236 H190 V242 H206 V228 H214 V222 H222 V228 H232 V246 H250 V238 H268 V250 H286 V234 H300 V244 H318 V226 H330 V244 H346 V238 H360 V272 Z" fill="#0a0d18"/>
          <g fill="#f2c46d" opacity=".45"><rect x="44" y="236" width="2" height="2"/><rect x="150" y="238" width="2" height="2"/><rect x="208" y="234" width="2" height="2"/><rect x="290" y="240" width="2" height="2"/><rect x="322" y="232" width="2" height="2"/></g>
          <rect y="284" width="360" height="4" fill="#2b2f44"/>
          <rect y="288" width="360" height="22" fill="#1b1e2c"/>
          <g stroke="#141722" stroke-width="1"><path d="M0 299 H360"/><path d="M30 288 V299 M90 288 V299 M150 288 V299 M210 288 V299 M270 288 V299 M330 288 V299 M60 299 V310 M120 299 V310 M180 299 V310 M240 299 V310 M300 299 V310"/></g>
          <rect y="310" width="360" height="90" fill="#12141c"/>
          <rect x="22" y="196" width="3" height="92" fill="#2a2d3a"/>
          <path d="M25 202 Q150 224 268 212" stroke="#3a3d4a" stroke-width="1.2" fill="none"/>
          <path d="M128 215 L170 217 L166 254 Q150 260 132 252 Z" fill="#b0185a" opacity=".8"/>
          <rect x="132" y="213" width="3" height="5" fill="#e0c07a"/><rect x="162" y="214" width="3" height="5" fill="#e0c07a"/>
          <rect x="258" y="278" width="76" height="10" fill="#22242f"/>
          <rect x="266" y="206" width="60" height="74" rx="6" fill="url(#stars-tank)"/>
          <ellipse cx="296" cy="206" rx="30" ry="6" fill="#1c1e26"/>
          <g stroke="#000" stroke-opacity=".55" stroke-width="1.5"><path d="M267 224 H325 M267 240 H325 M267 256 H325 M267 270 H325"/></g>
          <ellipse cx="296" cy="202" rx="9" ry="3" fill="#2a2d36"/>
          <path d="M0 132 Q90 178 180 140 Q270 104 360 152" stroke="#1b1d26" stroke-width="1.2" fill="none"/>
          <g>${RD.bulbs}</g>
          <path d="M28 330 L52 330 L48 352 L32 352 Z" fill="#a24f2a"/>
          <g fill="#3f8a4e"><circle cx="34" cy="322" r="5"/><circle cx="42" cy="316" r="6"/><circle cx="48" cy="324" r="5"/><circle cx="40" cy="327" r="4"/></g>
          <g fill="#d9d4c6"><rect x="212" y="300" width="34" height="6" rx="2"/><rect x="214" y="274" width="30" height="24" rx="4"/><rect x="214" y="306" width="4" height="26"/><rect x="240" y="306" width="4" height="26"/></g>
          <g class="stars-scope" role="button" tabindex="0" aria-label="Look through the telescope">
            <circle class="stars-scope-glow" cx="108" cy="322" r="18" fill="rgba(242,196,109,.28)"/>
            <g stroke="#6b5426" stroke-width="3.5" stroke-linecap="round"><path d="M150 300 L118 392"/><path d="M150 300 L182 392"/><path d="M150 300 L152 396"/></g>
            <rect x="142" y="290" width="16" height="14" rx="3" fill="#2a2d36"/>
            <g transform="rotate(-32 150 296)">
              <rect x="104" y="287" width="118" height="18" rx="4" fill="url(#stars-brass)"/>
              <rect x="214" y="284" width="16" height="24" rx="3" fill="#c9a35a"/>
              <rect x="150" y="285" width="5" height="22" fill="#7a5a22"/>
              <rect x="94" y="290" width="12" height="12" rx="2" fill="#3a2f1c"/>
            </g>
            <rect x="80" y="280" width="170" height="120" fill="transparent"/>
          </g>
        </svg>`;

      const datesLine = ctx.days.length > 1
        ? `${ctx.days[0].dateShort} – ${ctx.days[ctx.days.length - 1].dateShort} 2026`
        : ctx.days[0].dateLong;

      root.innerHTML = `
        <div class="stars-app${S ? ' is-static' : ''}">
          <header class="stars-intro">
            <p class="stars-eyebrow">One rooftop · one telescope · one story</p>
            <h1>Tonight, come up <em>to the chhat</em></h1>
            <p><b>${esc(ctx.greeting)}</b>, the Delhi sky has some news for you. ${S ? `Every star below carries one of your invitations.` : 'The telescope is waiting.'}</p>
          </header>
          <div class="stars-stage">
            <canvas class="stars-sky" role="img" aria-label="${esc(S ? 'A night sky over Delhi with each of your functions marked as a star' : 'The telescope eyepiece. You can also use the buttons below to drive the telescope.')}"></canvas>
            ${S ? '' : roofSVG}
            <div class="stars-toast" aria-live="polite"></div>
          </div>
          <div class="stars-focus-row" hidden>
            <label for="stars-focus">Focus</label>
            <input type="range" class="stars-focus" id="stars-focus" min="0" max="100" value="0" aria-label="Turn the focus ring">
          </div>
          <section class="stars-notes" aria-live="polite">
            <p class="stars-ro">${S ? 'Observatory log · Delhi · a December night' : 'Rooftop · Delhi · a December night'}</p>
            <p class="stars-cap">${S ? esc(LINES.name) : 'Something special is up in the sky tonight… Tap the telescope.'}</p>
          </section>
          <div class="stars-controls">
            <button type="button" class="stars-primary">Look through the telescope</button>
            <div class="stars-minor">
              <button type="button" class="stars-chart" aria-pressed="false" hidden>Sky chart</button>
              <button type="button" class="stars-skip">Skip to details</button>
            </div>
          </div>
          <div class="stars-chips" hidden></div>
          <section class="stars-invite" aria-label="Your invitation">
            <div class="stars-invite-head">
              <p class="stars-eyebrow">Observatory log · ${esc(ctx.occasion.title)}</p>
              <h2>${esc(P.groom)} <em>&amp;</em> ${esc(P.bride)}</h2>
              <p class="stars-eyebrow" style="margin-top:8px">${esc(datesLine)}</p>
            </div>
            <div class="stars-summary">${ctx.summaryHTML()}</div>
            ${S ? '' : '<button type="button" class="stars-primary stars-deck-open">View invitation</button>'}
          </section>
        </div>`;

      const q = s => root.querySelector(s);
      const app = q('.stars-app'), stage = q('.stars-stage'), cv = q('.stars-sky'), ctx2 = cv.getContext('2d');
      const roofEl = q('.stars-roof');
      const g = ctx2;

      /* ---------- state ---------- */
      let phase = S ? 'done' : 'roof', chart = false, savedCam = null, slewing = false, run = 0, deckOpen = false;
      const cam = { x: A1.x, y: A1.y, s: 1 };
      const visited = new Set(); let current = null;
      let showSaptaLines = false, pointerP = 0, arundhatiOn = false;
      const bin = { n: { bx: A1.x - 75, by: A1.y + 35, x: A1.x - 75, y: A1.y + 35 }, a: { bx: A1.x + 80, by: A1.y - 45, x: A1.x + 80, y: A1.y - 45 },
        drag: null, offx: 0, offy: 0, twirl: null, locked: false, mx: 0, my: 0, ang: 0, rad: 0, spd: 0, flash: 0 };
      let namePts = [], nameT0 = 0;
      const exploreList = () => OBJS.map(o => o.id);

      /* ---------- canvas ---------- */
      let W = 0, H = 0, CX = 0, CY = 0, R = 0;
      function resize() {
        const r = stage.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
        W = r.width || 360; H = r.height || 390;
        cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        CX = W / 2; CY = H / 2; R = Math.min(W, H) / 2 - 16;
      }
      const w2s = (x, y) => [CX + (x - cam.x) * cam.s, CY + (y - cam.y) * cam.s];
      const s2w = (px, py) => [cam.x + (px - CX) / cam.s, cam.y + (py - CY) / cam.s];

      function glow(px, py, rad, col, a, spread) {
        a = a == null ? 1 : a; spread = spread || 5;
        const gr = g.createRadialGradient(px, py, 0, px, py, rad * spread);
        gr.addColorStop(0, hexA(col, 0.5 * a)); gr.addColorStop(1, hexA(col, 0));
        g.fillStyle = gr; g.beginPath(); g.arc(px, py, rad * spread, 0, 7); g.fill();
        g.fillStyle = hexA(col, Math.min(1, a)); g.beginPath(); g.arc(px, py, rad, 0, 7); g.fill();
        g.fillStyle = `rgba(255,255,255,${Math.min(1, a) * 0.9})`; g.beginPath(); g.arc(px, py, rad * 0.5, 0, 7); g.fill();
      }
      function label(px, py, text, sub, col, align) {
        g.textAlign = align || 'left';
        g.font = '500 11px "IBM Plex Mono", monospace'; g.fillStyle = col || '#f2c46d';
        g.fillText(text, px, py);
        if (sub) { g.font = 'italic 400 13px Fraunces, Georgia, serif'; g.fillStyle = 'rgba(238,242,255,.78)'; g.fillText(sub, px, py + 15); }
      }
      const zr = () => clamp(Math.sqrt(cam.s), 0.6, 2.2);

      function drawCons(stars, lines, showLines, col) {
        if (showLines && lines.length) {
          g.strokeStyle = hexA(col, 0.38); g.lineWidth = 1;
          g.beginPath();
          lines.forEach(([i, j]) => { const [ax, ay] = w2s(stars[i].x, stars[i].y), [bx, by] = w2s(stars[j].x, stars[j].y); g.moveTo(ax, ay); g.lineTo(bx, by); });
          g.stroke();
        }
        const z = zr();
        stars.forEach(s => { const [px, py] = w2s(s.x, s.y); if (px < -40 || px > W + 40 || py < -40 || py > H + 40) return; glow(px, py, Math.max(0.9, s.rad * z * 0.75), s.col, 0.95, 4); });
      }

      function drawObj(o) {
        const seen = visited.has(o.id);
        if (o.haze) {
          const [hx, hy] = w2s(o.haze.x, o.haze.y), hr = Math.max(8, o.haze.r * cam.s);
          const hg = g.createRadialGradient(hx, hy, 0, hx, hy, hr);
          hg.addColorStop(0, `rgba(${o.haze.col},.14)`); hg.addColorStop(1, `rgba(${o.haze.col},0)`);
          g.fillStyle = hg; g.beginPath(); g.arc(hx, hy, hr, 0, 7); g.fill();
        }
        if (o.moon) {
          const [mox, moy] = w2s(o.moon.x, o.moon.y), mr = Math.max(5, o.moon.r * cam.s);
          if (mox > -mr * 4 && mox < W + mr * 4 && moy > -mr * 4 && moy < H + mr * 4) {
            const halo = g.createRadialGradient(mox, moy, mr * 0.8, mox, moy, mr * 4);
            halo.addColorStop(0, 'rgba(255,244,220,.22)'); halo.addColorStop(1, 'rgba(255,244,220,0)');
            g.fillStyle = halo; g.beginPath(); g.arc(mox, moy, mr * 4, 0, 7); g.fill();
            const mg = g.createRadialGradient(mox - mr * 0.3, moy - mr * 0.3, mr * 0.1, mox, moy, mr);
            mg.addColorStop(0, '#fff8e6'); mg.addColorStop(1, '#d9cfb6');
            g.fillStyle = mg; g.beginPath(); g.arc(mox, moy, mr, 0, 7); g.fill();
            g.fillStyle = 'rgba(5,9,19,.78)'; g.beginPath(); g.ellipse(mox + mr * 0.62, moy, mr * 0.55, mr, 0, -Math.PI / 2, Math.PI / 2); g.fill();
            g.fillStyle = 'rgba(150,140,120,.25)';
            [[-0.3, -0.2, 0.18], [0.05, 0.3, 0.12], [-0.45, 0.25, 0.1]].forEach(([a, b, c]) => { g.beginPath(); g.arc(mox + a * mr, moy + b * mr, c * mr, 0, 7); g.fill(); });
          }
        }
        drawCons(o.stars, o.lines, chart || seen, o.lineCol);
        if (o.planet) { const [px, py] = w2s(o.planet.x, o.planet.y); glow(px, py, o.planet.r * clamp(cam.s, 0.7, 1.6), o.planet.col, 1, o.planet.spread); }
        if (o.moons) {
          g.fillStyle = '#f3f0e6';
          o.moons.forEach(m => { const [px, py] = w2s(m.x, m.y); g.beginPath(); g.arc(px, py, Math.max(0.7, 0.9 * zr() * 0.6), 0, 7); g.fill(); });
        }
        if (seen && !chart && cam.s > 0.6) {
          const [lx, ly] = w2s(o.lx, o.ly);
          label(lx + 12, ly - 8, o.name.toUpperCase(), `${o.sci} · ${shortOf(o.ev)}`);
        }
      }

      function drawSky(t) {
        g.fillStyle = '#050913'; g.fillRect(0, 0, W, H);
        const [mx, my] = w2s(1500, 1000);
        g.save(); g.translate(mx, my); g.rotate(-0.55); g.scale(cam.s, cam.s);
        const mg = g.createRadialGradient(0, 0, 0, 0, 0, 1500);
        mg.addColorStop(0, 'rgba(150,160,220,.09)'); mg.addColorStop(1, 'rgba(150,160,220,0)');
        g.fillStyle = mg; g.beginPath(); g.ellipse(0, 0, 1900, 300, 0, 0, 7); g.fill(); g.restore();
        const [, hy] = w2s(0, WORLD.horizon);
        if (hy < H + 20) {
          const hg = g.createLinearGradient(0, hy - 320 * cam.s, 0, hy);
          hg.addColorStop(0, 'rgba(190,110,80,0)'); hg.addColorStop(1, 'rgba(190,110,80,.32)');
          g.fillStyle = hg; g.fillRect(0, hy - 320 * cam.s, W, 320 * cam.s);
        }
        const vx0 = cam.x - W / 2 / cam.s - 10, vx1 = cam.x + W / 2 / cam.s + 10, vy0 = cam.y - H / 2 / cam.s - 10, vy1 = cam.y + H / 2 / cam.s + 10;
        const z = zr();
        for (const s of BG) {
          if (s.x < vx0 || s.x > vx1 || s.y < vy0 || s.y > vy1) continue;
          const px = CX + (s.x - cam.x) * cam.s, py = CY + (s.y - cam.y) * cam.s;
          g.globalAlpha = (RM || S) ? 0.85 : 0.6 + 0.4 * Math.sin(t * 0.001 * s.sp + s.tw);
          g.fillStyle = s.col;
          const r = Math.max(0.45, s.rad * z);
          if (r < 0.9) g.fillRect(px - r, py - r, r * 2, r * 2); else { g.beginPath(); g.arc(px, py, r, 0, 7); g.fill(); }
        }
        g.globalAlpha = 1;

        OBJS.forEach(drawObj);

        if (hasFinale) {
          drawCons(SAPTA, SAPTA_LINES, showSaptaLines || chart, '#f2c46d');
          const [ppx, ppy] = w2s(POLARIS.x, POLARIS.y);
          glow(ppx, ppy, Math.max(1.2, 2.8 * zr() * 0.8), '#fff6e0', 1, 5);
          if (pointerP > 0) {
            const [mrx, mry] = w2s(MERAK.x, MERAK.y);
            const ex = mrx + (ppx - mrx) * pointerP, ey = mry + (ppy - mry) * pointerP;
            g.save(); g.setLineDash([4, 6]); g.strokeStyle = 'rgba(242,196,109,.55)'; g.lineWidth = 1.2;
            g.beginPath(); g.moveTo(mrx, mry); g.lineTo(ex, ey); g.stroke(); g.restore();
          }
          const aA = clamp((cam.s - 1.6) / 1.8, 0, 1);
          if (aA > 0) { const [ax, ay] = w2s(ARUNDHATI.x, ARUNDHATI.y); glow(ax, ay, 1.6 * zr() * 0.6, '#e6ecff', aA * 0.9, 4); }
          if (!chart) {
            if (showSaptaLines && cam.s > 0.5 && cam.s < 2) SAPTA.forEach((s, i) => { const [x, y] = w2s(s.x, s.y); label(x + 8, y - 8, SAPTA_NAMES[i].toUpperCase(), null, 'rgba(242,196,109,.75)'); });
            if (arundhatiOn && cam.s > 2) {
              const [x, y] = w2s(MIZAR.x, MIZAR.y), [ax, ay] = w2s(ARUNDHATI.x, ARUNDHATI.y);
              label(x - 12, y + 26, 'VASISHTHA', 'Mizar', '#f2c46d', 'right');
              label(ax + 14, ay - 12, 'ARUNDHATI', 'Alcor', '#e99ab0');
            }
            if (pointerP > 0.95 && cam.s < 2) label(ppx + 10, ppy - 6, 'DHRUV TARA', vidaai ? 'Polaris · Vidaai' : 'Polaris · steadfast');
          }
        }

        drawBinary(t);
        if (namePts.length) {
          const el = (performance.now() - nameT0) / 1600;
          for (const p of namePts) {
            const k = RM ? 1 : clamp((el - p.d) / 0.6, 0, 1), e = 1 - Math.pow(1 - k, 3);
            const x = bin.mx + (p.tx - bin.mx) * e, y = bin.my + (p.ty - bin.my) * e;
            const [px, py] = w2s(x, y);
            if (px < -10 || px > W + 10 || py < -10 || py > H + 10) continue;
            g.globalAlpha = (RM ? 0.9 : 0.65 + 0.35 * Math.sin(t * 0.002 + p.tw)) * (0.4 + 0.6 * k);
            g.fillStyle = '#f6efd9'; g.beginPath(); g.arc(px, py, p.rad * clamp(cam.s, 0.5, 1.4), 0, 7); g.fill();
          }
          g.globalAlpha = 1;
        }
        if (bin.flash > 0) { g.fillStyle = `rgba(255,248,230,${bin.flash * 0.5})`; g.fillRect(0, 0, W, H); }

        if (hy < H + 10) {
          g.fillStyle = '#05070d';
          g.beginPath(); g.moveTo(0, H); g.lineTo(0, hy);
          SKYLINE.forEach(b => {
            const [bx] = w2s(b.x, 0), bw = b.w * cam.s, bh = b.h * cam.s;
            if (bx > W || bx + bw < 0) return;
            g.lineTo(bx, hy - bh); g.lineTo(bx + bw, hy - bh);
          });
          g.lineTo(W, hy); g.lineTo(W, H); g.closePath(); g.fill();
          const [qx] = w2s(420, 0);
          g.beginPath(); g.moveTo(qx - 9 * cam.s, hy); g.lineTo(qx - 3 * cam.s, hy - 150 * cam.s); g.lineTo(qx + 3 * cam.s, hy - 150 * cam.s); g.lineTo(qx + 9 * cam.s, hy); g.fill();
        }

        if (!chart && ['explore', 'finale', 'done'].includes(phase) && cam.s > 0.7) {
          const [bx, by] = w2s(bin.mx, bin.my);
          if (Math.hypot(bx - CX, by - CY) < R) label(bx + 14, by + 4, `${P.groom.toUpperCase()} ♥ ${P.bride.toUpperCase()}`, 'binary star', 'rgba(233,154,176,.85)');
        }
      }

      function drawBinary(t) {
        if (phase === 'roof') return;
        const n = bin.n, a = bin.a;
        const [nx, ny] = w2s(n.x, n.y), [ax, ay] = w2s(a.x, a.y);
        if (!bin.locked) {
          if (!bin.twirl && !bin.drag && !RM) twinkleBetween(nx, ny, ax, ay, t);
          charStar(nx, ny, 'n', t);
          charStar(ax, ay, 'a', t);
        } else {
          const big = phase === 'binary' || phase === 'name';
          const sz = (big ? 3.6 : 2.2) * clamp(cam.s, 0.5, 1.4);
          glow(nx, ny, Math.max(1.4, sz), '#ffdf9a', 1, 5);
          glow(ax, ay, Math.max(1.4, sz), '#ffc6d9', 1, 5);
        }
      }
      function sparkle(x, y, s, col, al) {
        g.save(); g.globalAlpha = Math.max(0, al); g.fillStyle = col;
        g.beginPath(); g.moveTo(x, y - s);
        g.quadraticCurveTo(x, y, x + s, y); g.quadraticCurveTo(x, y, x, y + s);
        g.quadraticCurveTo(x, y, x - s, y); g.quadraticCurveTo(x, y, x, y - s);
        g.fill(); g.restore();
      }
      function twinkleBetween(x1, y1, x2, y2, t) {
        const Pd = 2600, k = (t % (2 * Pd)) / Pd, fwd = k < 1, p = fwd ? k : k - 1;
        if (p > 0.72) return;
        const qq = p / 0.72, e = qq * qq * (3 - 2 * qq);
        const sx = fwd ? x1 : x2, sy = fwd ? y1 : y2, ex = fwd ? x2 : x1, ey = fwd ? y2 : y1;
        const mx = (sx + ex) / 2, my = (sy + ey) / 2 - Math.hypot(ex - sx, ey - sy) * 0.28;
        const x = (1 - e) * (1 - e) * sx + 2 * (1 - e) * e * mx + e * e * ex, y = (1 - e) * (1 - e) * sy + 2 * (1 - e) * e * my + e * e * ey;
        sparkle(x, y, 4.2, fwd ? '#ffe7b0' : '#ffd6e4', Math.sin(qq * Math.PI));
      }
      function charStar(px, py, kind, t) {
        const isN = kind === 'n';
        const col = isN ? '#ffdf9a' : '#ffc6d9';
        const breathe = RM ? 1 : (isN ? 1 + 0.06 * Math.sin(t * 0.0016) : 1 + 0.12 * Math.sin(t * 0.005));
        glow(px, py, 4.6 * breathe, col, 1.05, isN ? 5.2 : 4.4);
        g.save(); g.translate(px, py);
        if (!isN && !RM) g.rotate(Math.sin(t * 0.0032) * 0.2);
        g.fillStyle = col;
        const L = isN ? 14 : 15.5, w = isN ? 3.3 : 2.6;
        g.beginPath(); g.moveTo(0, -L); g.quadraticCurveTo(w, -w, L, 0); g.quadraticCurveTo(w, w, 0, L); g.quadraticCurveTo(-w, w, -L, 0); g.quadraticCurveTo(-w, -w, 0, -L); g.fill();
        g.fillStyle = '#fffaf0'; g.beginPath(); g.arc(0, 0, 5.8, 0, 7); g.fill();
        g.fillStyle = '#2a1d30'; g.strokeStyle = '#2a1d30'; g.lineWidth = 1.1; g.lineCap = 'round';
        if (isN) {
          g.beginPath(); g.arc(-2.2, -0.4, 1.15, Math.PI, 0); g.stroke();
          g.beginPath(); g.arc(2.2, -0.4, 1.15, Math.PI, 0); g.stroke();
          g.beginPath(); g.arc(0, 1.1, 1.9, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();
          g.fillStyle = '#fff3c4';
          g.beginPath(); g.moveTo(0, 8.6); g.lineTo(-3.6, 6.6); g.lineTo(-3.6, 10.6); g.closePath();
          g.moveTo(0, 8.6); g.lineTo(3.6, 6.6); g.lineTo(3.6, 10.6); g.closePath(); g.fill();
          g.beginPath(); g.arc(0, 8.6, 1.1, 0, 7); g.fill();
        } else {
          g.beginPath(); g.arc(-2.1, -0.5, 1.15, 0, 7); g.fill();
          g.beginPath(); g.arc(2.1, -0.5, 1.15, 0, 7); g.fill();
          g.fillStyle = '#fff'; g.beginPath(); g.arc(-1.75, -0.9, 0.42, 0, 7); g.fill(); g.beginPath(); g.arc(2.45, -0.9, 0.42, 0, 7); g.fill();
          g.beginPath(); g.moveTo(-3, -1.5); g.lineTo(-3.9, -2.3); g.moveTo(3, -1.5); g.lineTo(3.9, -2.3); g.stroke();
          g.beginPath(); g.arc(0, 0.9, 2.2, 0.1 * Math.PI, 0.9 * Math.PI); g.stroke();
          g.fillStyle = 'rgba(255,120,150,.45)'; g.beginPath(); g.arc(-3.6, 1.6, 1.1, 0, 7); g.fill(); g.beginPath(); g.arc(3.6, 1.6, 1.1, 0, 7); g.fill();
        }
        g.restore();
        if (!isN) {
          for (let i = 0; i < 3; i++) {
            const ang = (RM ? 0 : t * 0.0016) + i * 2.09, r = 19 + (RM ? 0 : 3 * Math.sin(t * 0.004 + i));
            sparkle(px + Math.cos(ang) * r, py + Math.sin(ang) * r, 2.6, '#fff0f6', RM ? 0.8 : 0.45 + 0.55 * Math.abs(Math.sin(t * 0.006 + i * 1.7)));
          }
        }
        g.font = '500 10px "IBM Plex Mono", monospace'; g.fillStyle = 'rgba(238,242,255,.8)'; g.textAlign = 'center';
        g.fillText(isN ? P.groom.toUpperCase() : P.bride.toUpperCase(), px, py + 30);
      }

      function drawEyepiece() {
        const v = g.createRadialGradient(CX, CY, R * 0.55, CX, CY, R);
        v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.85)');
        g.fillStyle = v; g.beginPath(); g.arc(CX, CY, R, 0, 7); g.fill();
        g.strokeStyle = 'rgba(242,196,109,.3)'; g.lineWidth = 1;
        const gp = 14;
        g.beginPath();
        g.moveTo(CX - R + 14, CY); g.lineTo(CX - gp, CY); g.moveTo(CX + gp, CY); g.lineTo(CX + R - 14, CY);
        g.moveTo(CX, CY - R + 14); g.lineTo(CX, CY - gp); g.moveTo(CX, CY + gp); g.lineTo(CX, CY + R - 14);
        g.stroke();
        g.beginPath(); g.arc(CX, CY, gp * 2.2, 0, 7); g.stroke();
        const bg = g.createLinearGradient(CX - R, CY - R, CX + R, CY + R);
        bg.addColorStop(0, '#e7c886'); bg.addColorStop(0.5, '#8a6a2c'); bg.addColorStop(1, '#d9b46a');
        g.strokeStyle = bg; g.lineWidth = 9; g.beginPath(); g.arc(CX, CY, R + 4.5, 0, 7); g.stroke();
        g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 1; g.beginPath();
        for (let i = 0; i < 120; i++) { const a = (i / 120) * Math.PI * 2; g.moveTo(CX + Math.cos(a) * (R + 1), CY + Math.sin(a) * (R + 1)); g.lineTo(CX + Math.cos(a) * (R + 8), CY + Math.sin(a) * (R + 8)); }
        g.stroke();
        g.font = '500 10px "IBM Plex Mono", monospace'; g.fillStyle = 'rgba(242,196,109,.8)'; g.textAlign = 'center';
        g.fillText(`${Math.round(cam.s * 40)}×`, CX, CY + R - 16);
      }

      function chartTargets() {
        const list = OBJS.map(o => ({ id: o.id, x: o.tx, y: o.ty, text: `${o.name} · ${shortOf(o.ev)}` }));
        if (hasFinale) list.push({ id: 'sapta', x: SAPTA_VIEW.x, y: SAPTA_VIEW.y, text: 'Saptarishi · Arundhati' });
        if (hasFinale && vidaai) list.push({ id: 'dhruv', x: POLARIS.x, y: POLARIS.y, text: 'Dhruv Tara · Vidaai' });
        list.push({ id: 'start', x: A1.x, y: A1.y, text: `${P.groom} ♥ ${P.bride} · binary` });
        return list;
      }
      function fitView() {
        let x0 = A1.x - 260, x1 = A1.x + 260, y0 = A1.y - 200, y1 = A1.y + 200;
        const add = (x, y, pad) => { x0 = Math.min(x0, x - pad); x1 = Math.max(x1, x + pad); y0 = Math.min(y0, y - pad); y1 = Math.max(y1, y + pad); };
        OBJS.forEach(o => { add(o.tx, o.ty, 190); if (o.moon) add(o.moon.x, o.moon.y, 60); });
        if (hasFinale) { add(POLARIS.x, POLARIS.y, 120); add(SAPTA[6].x, SAPTA[6].y, 160); add(SAPTA[2].x, SAPTA[2].y, 80); }
        const s = Math.min(W / (x1 - x0), H / (y1 - y0)) * 0.95;
        return { x: (x0 + x1) / 2, y: (y0 + y1) / 2, s };
      }
      function drawChartLabels() {
        g.strokeStyle = 'rgba(201,163,90,.5)'; g.lineWidth = 1; g.strokeRect(8.5, 8.5, W - 17, H - 17);
        // Simple collision avoidance: nudge a label down (then up) until it clears the ones already placed.
        const boxes = [];
        g.font = '500 11px "IBM Plex Mono", monospace';
        chartTargets().forEach(c => {
          const [px, py] = w2s(c.x, c.y);
          g.strokeStyle = 'rgba(242,196,109,.7)'; g.beginPath(); g.arc(px, py, 9, 0, 7); g.stroke();
          const text = c.text.toUpperCase(), tw = g.measureText(text).width;
          const right = px + 12 + tw > W - 14 && px - 12 - tw > 14;
          const x0 = right ? px - 12 - tw : px + 12;
          let y = py + 4;
          const hit = yy => boxes.some(b => x0 < b.x1 && x0 + tw > b.x0 && yy - 11 < b.y1 && yy + 3 > b.y0);
          for (let k = 1; k <= 8 && hit(y); k++) y = py + 4 + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 15;
          boxes.push({ x0, x1: x0 + tw, y0: y - 11, y1: y + 3 });
          if (Math.abs(y - (py + 4)) > 2) {
            g.strokeStyle = 'rgba(242,196,109,.35)'; g.beginPath(); g.moveTo(px + (right ? -9 : 9), py); g.lineTo(right ? px - 11 : px + 11, y - 4); g.stroke();
          }
          label(right ? px - 12 : px + 12, y, text, null, c.id === 'start' ? '#e99ab0' : '#f2c46d', right ? 'right' : 'left');
          g.font = '500 11px "IBM Plex Mono", monospace';
        });
        g.font = '500 10px "IBM Plex Mono", monospace'; g.fillStyle = 'rgba(238,242,255,.6)'; g.textAlign = 'left';
        g.fillText(S ? 'SKY CHART · DELHI · A DECEMBER NIGHT' : 'SKY CHART · DELHI · TAP A STAR TO GO THERE', 18, H - 18);
      }

      // Shooting stars (screen space)
      let shoot = null, nextShoot = performance.now() + 6000, toastTimer = 0;
      function updateShoot(t, dt) {
        if (RM || chart || !['explore', 'finale', 'done'].includes(phase)) { shoot = null; return; }
        if (!shoot && t > nextShoot) {
          const dir = Math.random() < 0.5 ? 1 : -1, ang = 0.45 + Math.random() * 0.35;
          shoot = { x: CX - dir * R * 0.55, y: CY - R * 0.55 + Math.random() * R * 0.35, vx: dir * Math.cos(ang) * 210, vy: Math.sin(ang) * 210, life: 1 };
          nextShoot = t + 8000 + Math.random() * 6000;
        }
        if (shoot) { shoot.x += shoot.vx * dt; shoot.y += shoot.vy * dt; shoot.life -= dt * 0.6; if (shoot.life <= 0) shoot = null; }
      }
      function drawShoot() {
        if (!shoot) return;
        const tl = 70, gx = shoot.x - (shoot.vx / 210) * tl, gy = shoot.y - (shoot.vy / 210) * tl;
        const gr = g.createLinearGradient(shoot.x, shoot.y, gx, gy);
        gr.addColorStop(0, `rgba(255,248,225,${shoot.life})`); gr.addColorStop(1, 'rgba(255,248,225,0)');
        g.strokeStyle = gr; g.lineWidth = 1.8; g.beginPath(); g.moveTo(shoot.x, shoot.y); g.lineTo(gx, gy); g.stroke();
        glow(shoot.x, shoot.y, 1.8, '#fff8e1', shoot.life, 4);
      }
      function toast(text) {
        const el = q('.stars-toast');
        el.textContent = text; el.classList.add('is-on');
        clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('is-on'), 3400);
      }

      function draw(t) {
        g.clearRect(0, 0, W, H);
        const bg = g.createRadialGradient(CX, CY, R * 0.6, CX, CY, Math.max(W, H) * 0.75);
        bg.addColorStop(0, '#10151f'); bg.addColorStop(1, '#030407');
        g.fillStyle = bg; g.fillRect(0, 0, W, H);
        g.save(); g.beginPath();
        if (chart) g.rect(0, 0, W, H); else g.arc(CX, CY, R, 0, Math.PI * 2);
        g.clip();
        drawSky(t);
        drawShoot();
        g.restore();
        if (chart) drawChartLabels(); else drawEyepiece();
      }

      /* ---------- static (image) mode ---------- */
      if (S) {
        resize();
        chart = true;
        OBJS.forEach(o => visited.add(o.id));
        showSaptaLines = hasFinale; pointerP = hasFinale ? 1 : 0;
        bin.locked = true; bin.mx = A1.x; bin.my = A1.y;
        bin.n.x = A1.x - 13; bin.n.y = A1.y; bin.a.x = A1.x + 13; bin.a.y = A1.y;
        Object.assign(cam, fitView());
        draw(0);
        const fin = () => { resize(); Object.assign(cam, fitView()); draw(0); ctx.ready(); };
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => setTimeout(fin, 200)); else setTimeout(fin, 600);
        return;
      }

      /* ---------- update ---------- */
      function updateBinary(t, dt) {
        const n = bin.n, a = bin.a;
        if (bin.twirl) {
          const tw = bin.twirl, p = Math.min(1, (performance.now() - tw.t0) / tw.ms);
          const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
          const ang = tw.a0 + e * Math.PI * 2, rr = tw.r0 + (tw.r1 - tw.r0) * e;
          n.x = n.bx; n.y = n.by;
          a.x = n.x + Math.cos(ang) * rr; a.y = n.y + Math.sin(ang) * rr; a.bx = a.x; a.by = a.y;
          if (p >= 1) { bin.twirl = null; lock(); }
        } else if (!bin.locked) {
          const fl = RM || bin.drag === 'a' ? 0 : 1;
          a.x = a.bx + Math.sin(t * 0.0011) * 9 * fl;
          a.y = a.by + Math.cos(t * 0.0009) * 7 * fl - Math.abs(Math.sin(t * 0.004)) * 4 * fl;
          n.x = n.bx; n.y = n.by;
        } else {
          if (phase !== 'binary') { const k = Math.min(1, dt * 2.5); bin.mx += (A1.x - bin.mx) * k; bin.my += (A1.y - bin.my) * k; }
          bin.spd = Math.min(2.6, bin.spd + dt * 0.9);
          bin.ang += bin.spd * dt * (RM ? 0.3 : 1);
          bin.rad += (13 - bin.rad) * Math.min(1, dt * 1.5);
          const c = Math.cos(bin.ang), s = Math.sin(bin.ang);
          n.x = bin.mx - c * bin.rad; n.y = bin.my - s * bin.rad;
          a.x = bin.mx + c * bin.rad; a.y = bin.my + s * bin.rad;
        }
        if (bin.flash > 0) bin.flash = Math.max(0, bin.flash - dt * 1.2);
      }
      let lockCand = null, lockT = 0;
      function lockOn(t) {
        if (phase !== 'explore' || slewing || chart || deckOpen) { lockCand = null; return; }
        let hit = null;
        for (const o of OBJS) { const [px, py] = w2s(o.tx, o.ty); if (Math.hypot(px - CX, py - CY) < 48) { hit = o.id; break; } }
        if (hit !== lockCand) { lockCand = hit; lockT = t; } else if (hit && hit !== current && t - lockT > 650) identify(hit);
      }
      let last = performance.now();
      function frame(t) {
        if (!root.isConnected) return;
        const dt = Math.min(0.05, (t - last) / 1000); last = t;
        updateBinary(t, dt); updateShoot(t, dt); lockOn(t);
        draw(t);
        requestAnimationFrame(frame);
      }

      /* ---------- telescope motion ---------- */
      const primary = q('.stars-controls .stars-primary');
      function slewTo(x, y, s, ms) {
        ms = ms == null ? 1700 : ms;
        return new Promise(res => {
          const x0 = cam.x, y0 = cam.y, s0 = cam.s;
          if (RM || !ms) { cam.x = x; cam.y = y; cam.s = s; res(); return; }
          slewing = true; primary.disabled = true;
          const t0 = performance.now();
          const step = t => {
            const p = Math.min(1, (t - t0) / ms), e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
            cam.x = x0 + (x - x0) * e; cam.y = y0 + (y - y0) * e;
            cam.s = Math.exp(Math.log(s0) + (Math.log(s) - Math.log(s0)) * e);
            if (p < 1) requestAnimationFrame(step); else { slewing = false; primary.disabled = false; res(); }
          };
          requestAnimationFrame(step);
        });
      }

      /* ---------- UI helpers ---------- */
      let primaryFn = null;
      function setPrimary(text, fn) {
        if (!text) { primary.hidden = true; primaryFn = null; return; }
        primary.hidden = false; primary.textContent = text; primaryFn = fn;
      }
      primary.addEventListener('click', () => { if (primaryFn && !slewing) { ctx.sound.play('tap'); primaryFn(); } });
      function note(ro, cap) { q('.stars-ro').textContent = ro; q('.stars-cap').textContent = cap; }
      function setGrab(on) { stage.classList.toggle('is-grab', on); }

      /* ---------- invitation deck ---------- */
      const ART = makeArt(esc);
      function evPage(ev) {
        if (ev.id === 'vidaai') {
          return InviteDeck.eventPage(ctx, ev, { art: ART.finale(true), kicker: 'Dhruv Tara · Taaron ki chhaon',
            note: 'Dhruv Tara never leaves its place, and Arundhati never leaves Vasishtha’s side. The Vidaai, under these very stars.' });
        }
        const o = objOf(ev.id), sk = skyOf(ev);
        return InviteDeck.eventPage(ctx, ev, { art: (ART[sk.kind] || ART.chitra)(), kicker: `${sk.name} · ${sk.sci}`, note: o ? o.cap : sk.cap });
      }
      function closePage() {
        return InviteDeck.closingPage(ctx, { art: hasFinale ? ART.finale(!!vidaai) : (ART[skyOf(evs[evs.length - 1]).kind] || ART.chitra)(),
          kicker: 'Observatory log · ' + ctx.occasion.title });
      }
      function openDeck(pages, opts) {
        if (!window.InviteDeck) return Promise.resolve(0);
        pan = null; bin.drag = null; deckOpen = true;
        const p = InviteDeck.open(pages, Object.assign({ theme: 'stars-deck', events: ctx.events, label: 'Your invitation' }, opts));
        if (AUTO) setTimeout(() => InviteDeck.close(), 2400);
        return p.then(i => { deckOpen = false; return i; });
      }
      function showCard(ev) { return openDeck([evPage(ev)], { single: true, cta: 'Keep stargazing', label: shortOf(ev) }); }
      function openFull(start) { return openDeck(evs.map(evPage).concat([closePage()]), { start: start || 0 }); }

      function renderChips() {
        const show = ['explore', 'finale', 'done'].includes(phase);
        const el = q('.stars-chips');
        el.hidden = !show;
        const chips = OBJS.map(o => ({ id: o.id, name: o.name, sub: shortOf(o.ev), seen: visited.has(o.id) }));
        if (hasFinale) chips.push({ id: 'sapta', name: vidaai ? 'Dhruv Tara' : 'Saptarishi', sub: vidaai ? 'Vidaai' : 'Arundhati', seen: visited.has('sapta') });
        el.innerHTML = chips.map(c => `<button type="button" class="stars-chip${c.seen ? ' is-seen' : ''}${current === c.id ? ' is-on' : ''}" data-id="${esc(c.id)}">${c.seen ? '✦' : '·'} ${esc(c.name)}<small>${esc(c.sub)}</small></button>`).join('');
      }

      /* ---------- Act 1 ---------- */
      function enterScope() {
        if (phase !== 'roof') return;
        phase = 'zooming'; setPrimary(null); ctx.sound.play('whoosh');
        roofEl.classList.add('is-zoom');
        setTimeout(() => {
          roofEl.hidden = true; phase = 'focus';
          cv.style.filter = 'blur(14px)';
          q('.stars-focus-row').hidden = false;
          note('Eyepiece · 25 mm · focus: blurry', LINES.focus);
        }, RM ? 0 : 950);
      }
      const scopeEl = q('.stars-scope');
      scopeEl.addEventListener('click', enterScope);
      scopeEl.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); enterScope(); } });

      const focusEl = q('.stars-focus');
      focusEl.addEventListener('input', e => {
        if (phase !== 'focus') return;
        const v = +e.target.value;
        if (v >= 94) { cv.style.filter = 'none'; startBinary(); }
        else cv.style.filter = `blur(${((1 - v / 100) * 14).toFixed(1)}px)`;
      });

      function startBinary() {
        phase = 'binary'; q('.stars-focus-row').hidden = true; ctx.sound.play('chime'); setGrab(true);
        note('Eyepiece · focus sharp ✓ · two stars in view', LINES.binary);
        setPrimary('Bring the stars together', autoJoin);
      }
      async function autoJoin() {
        if (bin.locked || bin.twirl) return;
        setPrimary(null);
        const n = bin.n, a = bin.a, x0 = n.bx, y0 = n.by;
        await animate(1100, p => { const e = p * p * (3 - 2 * p); n.bx = x0 + (a.bx - 52 - x0) * e; n.by = y0 + (a.by + 14 - y0) * e; });
        startTwirl();
      }
      function checkMeet() {
        const n = bin.n, a = bin.a;
        if (Math.hypot(n.x - a.x, n.y - a.y) < 70) startTwirl();
      }
      function startTwirl() {
        if (bin.twirl || bin.locked) return;
        const n = bin.n, a = bin.a;
        bin.drag = null; setGrab(false); setPrimary(null);
        n.bx = n.x; n.by = n.y;
        const dx = a.x - n.x, dy = a.y - n.y;
        bin.twirl = { t0: performance.now(), ms: RM ? 1 : 1600, a0: Math.atan2(dy, dx), r0: Math.max(30, Math.hypot(dx, dy)), r1: 28 };
        note(`${P.bride}’s star · one happy twirl`, LINES.twirl);
        ctx.sound.play('pop');
      }
      function lock() {
        if (bin.locked) return;
        bin.locked = true; bin.drag = null; setGrab(false); setPrimary(null);
        const n = bin.n, a = bin.a;
        bin.mx = (n.x + a.x) / 2; bin.my = (n.y + a.y) / 2;
        bin.ang = Math.atan2(a.y - n.y, a.x - n.x); bin.rad = Math.max(14, Math.hypot(a.x - n.x, a.y - n.y) / 2); bin.spd = 0.8;
        note('Binary star · two stars, one orbit', LINES.lock);
        ctx.sound.play('success');
        const my = run;
        setTimeout(() => { if (my === run && phase === 'binary') startName(); }, RM ? 300 : 3600);
      }
      const fontsReady = document.fonts && document.fonts.load
        ? Promise.race([document.fonts.load('italic 600 40px Fraunces'), new Promise(r => setTimeout(r, 1500))]).catch(() => {})
        : Promise.resolve();
      function buildName() {
        const wpx = Math.max(220, R * 1.55), hpx = R * 1.5;
        const oc = document.createElement('canvas'); oc.width = Math.round(wpx); oc.height = Math.round(hpx);
        const o = oc.getContext('2d');
        o.fillStyle = '#fff'; o.textAlign = 'center'; o.textBaseline = 'middle';
        let fs = Math.round(wpx / 4.2);
        const setF = () => (o.font = `italic 600 ${fs}px Fraunces, Georgia, serif`);
        setF();
        const longest = P.groom.length >= P.bride.length ? P.groom : P.bride;
        while (o.measureText(longest).width > wpx * 0.9 && fs > 10) { fs -= 2; setF(); }
        o.fillText(P.groom, wpx / 2, hpx * 0.24);
        o.fillText(P.bride, wpx / 2, hpx * 0.78);
        const d = o.getImageData(0, 0, oc.width, oc.height).data;
        const step = Math.max(3, Math.round(fs / 11)), r = rng(77), pts = [];
        for (let y = 0; y < oc.height; y += step) for (let x = 0; x < oc.width; x += step) {
          if (d[(y * oc.width + x) * 4 + 3] > 140) pts.push({ tx: A1.x + (x - wpx / 2), ty: A1.y + (y - hpx / 2), d: r() * 0.5, tw: r() * 6.28, rad: 0.8 + r() * 0.9 });
        }
        namePts = pts;
      }
      async function startName() {
        phase = 'name'; bin.flash = RM ? 0 : 1;
        await fontsReady;
        buildName(); nameT0 = performance.now();
        note(`${P.groom} ♥ ${P.bride} · written in the sky`, LINES.name);
        ctx.sound.play('bell');
        const my = run;
        setTimeout(() => { if (my !== run) return; setPrimary('Use the telescope →', startExplore); q('.stars-chart').hidden = false; }, RM ? 0 : 2000);
      }

      /* ---------- Act 2 ---------- */
      function startExplore() {
        phase = 'explore'; setGrab(true);
        note('The telescope is yours · drag to look around', LINES.explore);
        renderChips(); updateNext();
      }
      function updateNext() {
        if (phase !== 'explore') return;
        const list = exploreList(), next = list.find(id => !visited.has(id)), total = list.length + (hasFinale ? 1 : 0);
        if (next) setPrimary(`Show the next star (${list.indexOf(next) + 1}/${total})`, () => goTo(next));
        else if (hasFinale) setPrimary(`Towards Saptarishi (${total}/${total}) →`, finaleStart);
        else { note('Every star found · the sky is ready', LINES.closing); finish(); }
      }
      async function goTo(id) {
        const my = ++run, o = objOf(id);
        await slewTo(o.tx, o.ty, o.s);
        if (my !== run) return;
        identify(id);
      }
      function identify(id) {
        const o = objOf(id);
        current = id; visited.add(id);
        note(o.ro, o.cap); ctx.sound.play('ding'); renderChips();
        showCard(o.ev).then(() => updateNext());
      }

      /* ---------- Act 3: Arundhati darshan ---------- */
      async function finaleStart() {
        const my = ++run;
        phase = 'finale'; setPrimary(null); renderChips();
        await slewTo(SAPTA_VIEW.x, SAPTA_VIEW.y, SAPTA_VIEW.s, 2000); if (my !== run) return;
        showSaptaLines = true; current = 'sapta'; renderChips();
        note(SAPTA_RO, SAPTA_CAP); ctx.sound.play('chime');
        setPrimary('Zoom into Vasishtha', zoomVasishtha);
      }
      async function zoomVasishtha() {
        const my = run; setPrimary(null);
        note('Zooming · towards Vasishtha…', 'Look closely, right beside Vasishtha…');
        await slewTo(MIZAR.x + 5, MIZAR.y - 4, 5.2, 2400); if (my !== run) return;
        arundhatiOn = true;
        note(ARUN_RO, LINES.arundhati); ctx.sound.play('bell');
        if (vidaai) setPrimary('On to Dhruv Tara', async () => { const m2 = run; setPrimary(null); await dhruvView(m2); if (m2 === run) { await showCard(vidaai); finish(); } });
        else { visited.add('sapta'); finish(); }
      }
      async function dhruvView(my) {
        showSaptaLines = true;
        await slewTo(DHRUV_VIEW.x, DHRUV_VIEW.y, DHRUV_VIEW.s, 2000); if (my !== run) return;
        note(DHRUV_RO, LINES.dhruv);
        await animate(1200, p => (pointerP = p)); if (my !== run) return;
        visited.add('sapta'); current = 'sapta'; renderChips();
      }
      function finish() {
        phase = 'done'; renderChips();
        setPrimary('View invitation', () => openFull(0));
        const my = run;
        setTimeout(() => { if (my === run && phase === 'done' && !deckOpen) openFull(0); }, RM ? 600 : 2600);
      }

      /* ---------- chips, chart, pointer ---------- */
      q('.stars-chips').addEventListener('click', e => { const b = e.target.closest('.stars-chip'); if (b) { ctx.sound.play('tap'); chipGo(b.dataset.id); } });
      async function chipGo(id) {
        if (slewing || phase === 'finale') return;
        if (id === 'sapta' || id === 'dhruv') {
          if (!visited.has('sapta')) { if (phase === 'explore') finaleStart(); return; }
          const my = ++run;
          if (vidaai) {
            await slewTo(DHRUV_VIEW.x, DHRUV_VIEW.y, DHRUV_VIEW.s); if (my !== run) return;
            current = 'sapta'; note(DHRUV_RO, LINES.dhruv); renderChips(); showCard(vidaai);
          } else {
            await slewTo(SAPTA_VIEW.x, SAPTA_VIEW.y, SAPTA_VIEW.s); if (my !== run) return;
            current = 'sapta'; note(SAPTA_RO, SAPTA_CAP); renderChips();
          }
          return;
        }
        if (id === 'start') { await slewTo(A1.x, A1.y, 1); return; }
        if (objOf(id)) goTo(id);
      }
      const chartBtn = q('.stars-chart');
      chartBtn.addEventListener('click', toggleChart);
      async function toggleChart() {
        if (slewing) return;
        ctx.sound.play('tap');
        if (!chart) {
          chart = true; savedCam = Object.assign({}, cam); chartBtn.setAttribute('aria-pressed', 'true'); chartBtn.textContent = 'Telescope view';
          setGrab(false);
          const f = fitView();
          await slewTo(f.x, f.y, f.s, 900);
        } else {
          chart = false; chartBtn.setAttribute('aria-pressed', 'false'); chartBtn.textContent = 'Sky chart';
          setGrab(['explore', 'done'].includes(phase));
          await slewTo(savedCam.x, savedCam.y, savedCam.s, 900);
        }
      }
      function local(e) { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
      let pan = null;
      cv.addEventListener('pointerdown', e => {
        const [px, py] = local(e);
        if (shoot && Math.hypot(px - shoot.x, py - shoot.y) < 50) { shoot = null; toast(BLESSINGS[Math.floor(Math.random() * BLESSINGS.length)]); ctx.sound.play('chime'); return; }
        if (phase === 'binary' && !bin.locked) {
          if (bin.twirl) return;
          const [wx, wy] = s2w(px, py);
          for (const k of ['n', 'a']) {
            const st = bin[k];
            if (Math.hypot(wx - st.x, wy - st.y) * cam.s < 42) { bin.drag = k; bin.offx = st.bx - wx; bin.offy = st.by - wy; try { cv.setPointerCapture(e.pointerId); } catch (er) { /* ignore */ } return; }
          }
          note('Two stars · bring them together', 'Hold one star and drag it towards the other.');
          return;
        }
        if (chart) {
          let best = null, bd = 44;
          chartTargets().forEach(c => { const [x, y] = w2s(c.x, c.y), d = Math.hypot(px - x, py - y); if (d < bd) { bd = d; best = c; } });
          if (best && ['explore', 'done'].includes(phase)) toggleChart().then(() => chipGo(best.id));
          return;
        }
        if (['explore', 'done'].includes(phase) && !slewing) { pan = { x: px, y: py, cx: cam.x, cy: cam.y }; try { cv.setPointerCapture(e.pointerId); } catch (er) { /* ignore */ } }
      });
      cv.addEventListener('pointermove', e => {
        const [px, py] = local(e);
        if (bin.drag) {
          const [wx, wy] = s2w(px, py), st = bin[bin.drag];
          let nx = wx + bin.offx, ny = wy + bin.offy;
          const lim = (R - 30) / cam.s, dx = nx - A1.x, dy = ny - A1.y, dd = Math.hypot(dx, dy);
          if (dd > lim) { nx = A1.x + (dx / dd) * lim; ny = A1.y + (dy / dd) * lim; }
          st.bx = nx; st.by = ny;
          checkMeet();
          return;
        }
        if (pan) { cam.x = clamp(pan.cx - (px - pan.x) / cam.s, 0, WORLD.w); cam.y = clamp(pan.cy - (py - pan.y) / cam.s, 0, WORLD.h); }
      });
      ['pointerup', 'pointercancel'].forEach(ev => cv.addEventListener(ev, () => { bin.drag = null; pan = null; }));
      document.addEventListener('keydown', e => {
        if (!['explore', 'done'].includes(phase) || chart || slewing || deckOpen) return;
        const k = { ArrowLeft: [-40, 0], ArrowRight: [40, 0], ArrowUp: [0, -40], ArrowDown: [0, 40] }[e.key];
        if (k && document.activeElement === document.body) { e.preventDefault(); cam.x = clamp(cam.x + k[0] / cam.s, 0, WORLD.w); cam.y = clamp(cam.y + k[1] / cam.s, 0, WORLD.h); }
      });

      /* ---------- skip ---------- */
      async function skipAll() {
        run++;
        ctx.sound.play('whoosh');
        if (roofEl) roofEl.hidden = true;
        cv.style.filter = 'none'; q('.stars-focus-row').hidden = true;
        if (!bin.locked) { bin.twirl = null; bin.locked = true; bin.drag = null; bin.mx = A1.x; bin.my = A1.y; bin.rad = 13; bin.spd = 2; }
        if (!namePts.length) { await fontsReady; buildName(); }
        nameT0 = performance.now() - 6000;
        OBJS.forEach(o => visited.add(o.id));
        if (hasFinale) { visited.add('sapta'); showSaptaLines = true; pointerP = vidaai ? 1 : 0; arundhatiOn = true; }
        phase = 'done'; setGrab(true); chartBtn.hidden = false;
        if (chart) { chart = false; chartBtn.setAttribute('aria-pressed', 'false'); chartBtn.textContent = 'Sky chart'; }
        const f = (resize(), fitView());
        chart = true; chartBtn.setAttribute('aria-pressed', 'true'); chartBtn.textContent = 'Telescope view';
        savedCam = { x: A1.x, y: A1.y, s: 1 };
        Object.assign(cam, f); setGrab(false);
        current = null; note('Observatory log · every star marked', LINES.name); renderChips();
        setPrimary('View invitation', () => openFull(0));
        q('.stars-invite').scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' });
      }
      q('.stars-skip').addEventListener('click', skipAll);
      q('.stars-deck-open').addEventListener('click', () => { ctx.sound.play('tap'); openFull(0); });

      /* ---------- auto (screen recording) ---------- */
      if (AUTO) {
        const drive = setInterval(() => {
          if (!root.isConnected) { clearInterval(drive); return; }
          if (deckOpen || slewing) return;
          if (phase === 'roof') enterScope();
          else if (phase === 'focus') { focusEl.value = '100'; focusEl.dispatchEvent(new Event('input')); }
          else if (phase === 'done') clearInterval(drive);
          else if (primaryFn && !primary.hidden) primaryFn();
        }, 2600);
      }

      /* ---------- boot ---------- */
      setPrimary('Look through the telescope', enterScope);
      resize();
      if (window.ResizeObserver) new ResizeObserver(resize).observe(stage);
      requestAnimationFrame(frame);
      ctx.ready();
    },
  });

  /* ---------- deck art: one inline SVG per sky object ---------- */
  function makeArt() {
    function rng(seed) { let s = seed % 2147483647; if (s <= 0) s += 2147483646; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
    function bgStars(seed, n, maxY) {
      const r = rng(seed); let s = '';
      for (let i = 0; i < n; i++) s += `<circle cx="${(r() * 320).toFixed(1)}" cy="${(r() * maxY).toFixed(1)}" r="${(r() < 0.1 ? 1.2 : 0.55).toFixed(2)}" fill="#eef2ff" opacity="${(0.35 + r() * 0.6).toFixed(2)}"/>`;
      return s;
    }
    const LBL = 'font-family="IBM Plex Mono, monospace" font-size="9" letter-spacing="1.5" fill="#f2c46d"';
    const SK = 'M0 200 V180 H20 V172 H38 V182 H58 V166 H74 V176 H86 L89 128 L91 124 L93 128 L96 176 H112 V170 H130 V180 Q142 160 154 180 H170 V168 H188 V178 H206 V164 H222 V174 H240 V168 H258 V180 H276 V170 H296 V176 H320 V200Z';
    const starDot = (x, y, r, id) => `<circle cx="${x}" cy="${y}" r="${r * 4}" fill="url(#${id})"/><circle cx="${x}" cy="${y}" r="${r * 0.7}" fill="#fff"/>`;
    const glowDef = (id, c) => `<radialGradient id="${id}"><stop offset="0" stop-color="#fff"/><stop offset=".3" stop-color="${c}" stop-opacity=".8"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`;
    const svg = inner => `<svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${inner}</svg>`;
    return {
      mangal: () => svg(`<defs><radialGradient id="sa-mg"><stop offset="0" stop-color="#ffd2b8"/><stop offset=".3" stop-color="#ff8a5c" stop-opacity=".8"/><stop offset="1" stop-color="#ff8a5c" stop-opacity="0"/></radialGradient>
        <radialGradient id="sa-mp" cx=".38" cy=".36"><stop offset="0" stop-color="#ffb08a"/><stop offset="1" stop-color="#b8442a"/></radialGradient></defs>
        <rect width="320" height="200" fill="#070a16"/>${bgStars(7, 60, 170)}
        <circle cx="160" cy="98" r="60" fill="url(#sa-mg)"/><circle cx="160" cy="98" r="15" fill="url(#sa-mp)"/>
        <path d="M150 92 q8 -4 16 2 M152 106 q6 3 12 -1" stroke="#8a2f1c" stroke-width="2" fill="none" opacity=".5"/>
        <path d="${SK}" fill="#04060c"/><text x="182" y="74" ${LBL}>MANGAL · मंगल</text>`),
      chitra: () => svg(`<defs>${glowDef('sa-cg', '#cfe0ff')}</defs>
        <rect width="320" height="200" fill="#060a16"/>${bgStars(13, 64, 200)}
        <path d="M168 104 L120 80 L70 58 M168 104 L214 76 M120 80 L136 40" stroke="rgba(207,224,255,.35)" stroke-width="1" fill="none"/>
        ${starDot(120, 80, 1.6, 'sa-cg')}${starDot(70, 58, 1.7, 'sa-cg')}${starDot(214, 76, 1.5, 'sa-cg')}${starDot(136, 40, 1.6, 'sa-cg')}
        <circle cx="168" cy="104" r="22" fill="url(#sa-cg)"/><path d="M168 78 L170 102 L194 104 L170 106 L168 130 L166 106 L142 104 L166 102Z" fill="#eef4ff" opacity=".9"/><circle cx="168" cy="104" r="4" fill="#fff"/>
        <text x="182" y="140" ${LBL}>CHITRA · चित्रा</text>`),
      rohini: () => {
        const v = [[150, 112], [128, 96], [112, 104], [96, 92], [120, 80], [104, 66]];
        return svg(`<defs><radialGradient id="sa-ra"><stop offset="0" stop-color="#fff2e0"/><stop offset=".3" stop-color="#ffb27a" stop-opacity=".85"/><stop offset="1" stop-color="#ffb27a" stop-opacity="0"/></radialGradient>
          <radialGradient id="sa-rm" cx=".42" cy=".42"><stop offset="0" stop-color="#fff8e6"/><stop offset="1" stop-color="#d9cfb6"/></radialGradient>
          <radialGradient id="sa-rh"><stop offset=".5" stop-color="#fff4dc" stop-opacity=".22"/><stop offset="1" stop-color="#fff4dc" stop-opacity="0"/></radialGradient></defs>
          <rect width="320" height="200" fill="#070b18"/>${bgStars(37, 60, 200)}
          <path d="M${v.map(p => p.join(' ')).join(' L')}" fill="none" stroke="rgba(255,178,122,.35)" stroke-width="1"/>
          ${v.slice(1).map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6" fill="#f3f5ff"/>`).join('')}
          <circle cx="150" cy="112" r="20" fill="url(#sa-ra)"/><circle cx="150" cy="112" r="3.4" fill="#fff"/>
          <circle cx="214" cy="120" r="60" fill="url(#sa-rh)"/>
          <circle cx="214" cy="120" r="26" fill="url(#sa-rm)"/><path d="M226 96 A26 26 0 0 1 226 144 A18 26 0 0 0 226 96Z" fill="rgba(7,11,24,.78)"/>
          <text x="132" y="140" ${LBL}>ROHINI · रोहिणी</text>`);
      },
      krittika: () => {
        const pts = [[0, 0, 3.4], [44, 7, 2.8], [47, -7, 2], [-56, -19, 2.8], [-32, 22, 2.6], [-36, -35, 2.8], [-11, -52, 2.4]];
        return svg(`<defs><radialGradient id="sa-kh"><stop offset="0" stop-color="#8fb0ff" stop-opacity=".32"/><stop offset="1" stop-color="#8fb0ff" stop-opacity="0"/></radialGradient>${glowDef('sa-kg', '#cfe0ff')}</defs>
          <rect width="320" height="200" fill="#060a16"/>${bgStars(23, 70, 200)}
          <ellipse cx="164" cy="104" rx="110" ry="80" fill="url(#sa-kh)"/>
          ${pts.map(([x, y, r]) => starDot(164 + x, 106 + y, r, 'sa-kg')).join('')}
          <text x="196" y="150" ${LBL}>KRITTIKA · कृत्तिका</text>`);
      },
      shukra: () => svg(`<defs><linearGradient id="sa-hs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#060b18"/><stop offset=".6" stop-color="#18213f"/><stop offset=".84" stop-color="#5d3a3e"/><stop offset="1" stop-color="#c67a4c"/></linearGradient>
        <radialGradient id="sa-hv"><stop offset="0" stop-color="#fffbe9"/><stop offset=".22" stop-color="#ffe9b0" stop-opacity=".75"/><stop offset="1" stop-color="#ffe9b0" stop-opacity="0"/></radialGradient></defs>
        <rect width="320" height="200" fill="url(#sa-hs)"/>${bgStars(11, 46, 130)}
        <circle cx="172" cy="118" r="52" fill="url(#sa-hv)"/>
        <path d="M172 88 L175 115 L202 118 L175 121 L172 148 L169 121 L142 118 L169 115Z" fill="#fff6dc" opacity=".9"/><circle cx="172" cy="118" r="5" fill="#fff"/>
        <path d="${SK}" fill="#04060c"/><text x="188" y="104" ${LBL}>SHUKRA · शुक्र</text>`),
      ashwini: () => svg(`<defs>${glowDef('sa-ag', '#ffd9a8')}</defs>
        <rect width="320" height="200" fill="#070a17"/>${bgStars(29, 66, 200)}
        <path d="M206 82 L136 112 L120 132" stroke="rgba(255,217,168,.45)" stroke-width="1.2" fill="none"/>
        <circle cx="206" cy="82" r="20" fill="url(#sa-ag)"/><circle cx="206" cy="82" r="3.4" fill="#fff"/>
        ${starDot(136, 112, 2.2, 'sa-ag')}${starDot(120, 132, 1.6, 'sa-ag')}
        <path d="M228 60 q14 -10 26 2 q4 10 -4 18 q6 10 -2 18" stroke="rgba(255,217,168,.22)" stroke-width="1.4" fill="none"/>
        <text x="150" y="160" ${LBL}>ASHWINI · अश्विनी</text>`),
      kalpurush: () => {
        const st = [[122, 108, 2.2], [160, 100, 2.3], [200, 91, 2.4], [80, -12 + 0, 0]];
        const fig = [[88, 30, 3.0, '#ffb27a'], [222, 40, 2.2, '#dfe8ff'], [104, 176, 2.2, '#dfe8ff'], [238, 168, 3.0, '#cfe0ff']];
        return svg(`<defs>${glowDef('sa-og', '#dfe8ff')}${glowDef('sa-or', '#ffb27a')}</defs>
          <rect width="320" height="200" fill="#060a16"/>${bgStars(41, 64, 200)}
          <path d="M88 30 L122 108 L104 176 M222 40 L200 91 L238 168 M88 30 L222 40 M104 176 L238 168 M122 108 L160 100 L200 91" stroke="rgba(223,232,255,.32)" stroke-width="1" fill="none"/>
          ${fig.map(([x, y, r, c]) => starDot(x, y, r, c === '#ffb27a' ? 'sa-or' : 'sa-og')).join('')}
          ${st.slice(0, 3).map(([x, y, r]) => starDot(x, y, r, 'sa-og')).join('')}
          <text x="168" y="124" ${LBL}>KALPURUSH · कालपुरुष</text>`);
      },
      brihaspati: () => svg(`<defs><radialGradient id="sa-jg"><stop offset="0" stop-color="#fff6e0" stop-opacity=".5"/><stop offset="1" stop-color="#fff6e0" stop-opacity="0"/></radialGradient>
        <clipPath id="sa-jc"><circle cx="160" cy="98" r="30"/></clipPath></defs>
        <rect width="320" height="200" fill="#070a16"/>${bgStars(53, 60, 200)}
        <circle cx="160" cy="98" r="62" fill="url(#sa-jg)"/>
        <g clip-path="url(#sa-jc)"><rect x="120" y="60" width="80" height="80" fill="#e9cfa4"/>
          <rect x="120" y="78" width="80" height="7" fill="#c99a6a"/><rect x="120" y="92" width="80" height="5" fill="#b9845a"/><rect x="120" y="106" width="80" height="8" fill="#d4ac7c"/><rect x="120" y="120" width="80" height="4" fill="#b9845a"/>
          <ellipse cx="172" cy="112" rx="6" ry="3.4" fill="#c0603e"/></g>
        ${[[96, 100], [112, 97], [212, 99], [232, 96]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2" fill="#f3f0e6"/>`).join('')}
        <text x="184" y="146" ${LBL}>BRIHASPATI · बृहस्पति</text>`),
      finale: withDhruv => {
        const st = [[40, 0], [45, 37], [108, 45], [114, 12], [160, 7], [204, 11], [248, 36]].map(([x, y]) => [x + 10, y + 108]);
        const pol = [st[0][0] + (st[0][0] - st[1][0]) * 2.3, st[0][1] + (st[0][1] - st[1][1]) * 2.3];
        return svg(`<defs>${glowDef('sa-wg', '#ffe2b8')}</defs>
          <rect width="320" height="200" fill="#060a16"/>${bgStars(59, 64, 200)}
          <path d="M${[0, 1, 2, 3, 0].map(i => st[i].join(' ')).join(' L')} M${st[3].join(' ')} L${st[4].join(' ')} L${st[5].join(' ')} L${st[6].join(' ')}" fill="none" stroke="rgba(242,196,109,.45)" stroke-width="1.1"/>
          ${withDhruv ? `<path d="M${st[1].join(' ')} L${pol.join(' ')}" stroke="rgba(242,196,109,.5)" stroke-width="1" stroke-dasharray="3 5"/>` : ''}
          ${st.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="url(#sa-wg)"/><circle cx="${x}" cy="${y}" r="1.9" fill="#fff"/>`).join('')}
          <circle cx="${st[5][0] + 8}" cy="${st[5][1] - 7}" r="1.1" fill="#e6ecff"/>
          ${withDhruv ? `<circle cx="${pol[0]}" cy="${pol[1]}" r="12" fill="url(#sa-wg)"/><circle cx="${pol[0]}" cy="${pol[1]}" r="2.6" fill="#fff"/><text x="${pol[0] + 12}" y="${pol[1] + 4}" ${LBL}>DHRUV TARA</text>` : ''}
          <text x="${st[5][0] - 26}" y="${st[5][1] + 22}" ${LBL}>VASISHTHA</text>
          <text x="${st[5][0] + 12}" y="${st[5][1] - 12}" font-family="IBM Plex Mono, monospace" font-size="9" letter-spacing="1.5" fill="#e99ab0">ARUNDHATI</text>`);
      },
    };
  }
})();
