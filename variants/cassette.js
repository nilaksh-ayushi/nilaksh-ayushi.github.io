/* Sangeet Playlist: a 90s Bollywood mixtape. Signature card for group 5 (Engagement), works for any group.
   Press PLAY on the deck: the reels spin, the tape winds, the VU meter dances to a synthesised dhol loop,
   and the LCD scrolls each event as a "track". At the end of Side A the J-card unfolds into liner notes
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
  function tracksFor(events) {
    const out = [];
    events.forEach(ev => {
      const titles = ev.id === 'engagement' ? engagementTitles(ev.name) : [TRACK_TITLES[ev.id] || ev.name + ' (Live)'];
      titles.forEach((title, k) => out.push({ no: out.length + 1, title, ev, first: k === 0 }));
    });
    return out;
  }
  function splitTitle(t) {
    const m = /^(.*?)\s*(\([^)]*\))\s*$/.exec(t);
    return m ? [m[1], m[2]] : [t, ''];
  }
  const pad2 = n => String(n).padStart(2, '0');

  /* ---------- beat ---------- */
  const BPM = 100;
  const STEP_MS = 60000 / BPM / 4;            // 16th notes
  const DRUM = 'D..hD.h.D..hDhh.';           // D = dhol bass (dagga), h = high (tilli)
  const TUMBI = { 0: 659, 3: 784, 6: 880, 8: 784, 11: 659, 14: 587, 16: 659, 19: 784, 22: 988, 24: 880, 26: 784, 28: 659 };

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
    const title = isA
      ? `${esc(o.groom)} <tspan class="cassette-t-heart">♥</tspan> ${esc(o.bride)} · Sangeet Mix ’${esc(o.yy)}`
      : 'Side B · Dance-floor rules ↓';
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
      <text class="cassette-t-band" x="200" y="159.5" text-anchor="middle" font-size="12.5">${isA ? 'SIDE A · ' + esc(o.band) + ' · STEREO' : 'SIDE B · BONUS TRACKS · STEREO'}</text>
      <text class="cassette-t-title" x="200" y="45" text-anchor="middle" font-size="22" data-fit="336" data-min="15" transform="rotate(-1.2 200 38)">${title}</text>
      <text class="cassette-t-pen" x="34" y="74" font-size="20" data-fit="330" data-min="16.5" data-ellipsis="1" transform="rotate(-.7 34 70)"><tspan class="cassette-t-mf">Made for:</tspan> <tspan class="cassette-t-guest">${esc(o.guest)}</tspan></text>
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
      const S = ctx.isStatic, RM = ctx.reducedMotion;
      const AUTO = /[?&]auto=1(?:&|$)/.test(location.search);
      const tracks = tracksFor(ctx.events);
      const N = tracks.length;
      const guest = ctx.guest || 'Family & Friends';
      const d0 = ctx.days[0], dN = ctx.days[ctx.days.length - 1];
      const band = (ctx.days.length === 1 ? d0.dateShort : `${d0.events[0].day} ${d0.mon} – ${dN.events[0].day} ${dN.mon}`).toUpperCase();
      const yy = ctx.events[0].date.slice(2, 4);
      const svgOpts = { esc, groom: P.groom, bride: P.bride, yy, band, guest };
      const groomFam = (P.family || '').split(' ')[0];
      const brideFam = (P.brideParents || '').trim().split(/\s+/).pop();
      const dancey = ctx.events.some(e => ['engagement', 'baraat', 'ghudchadi', 'haldi', 'mehandi'].indexOf(e.id) >= 0);
      const ganesh = (window.Invite && Invite.art && Invite.art.ganesh) ? Invite.art.ganesh({ size: 48 }) : '';
      const venues = [];
      ctx.events.forEach(e => { if (venues.indexOf(e.venueInfo.name) < 0) venues.push(e.venueInfo.name); });

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
        bl.innerHTML = `With the divine blessings of<b>${esc(P.blessings)}</b>`;
        const hosts = head.querySelector('.inv-sum-hosts');
        if (hosts) head.insertBefore(bl, hosts); else head.insertBefore(bl, head.firstChild);
      }
      const headHTML = head ? head.outerHTML : '';
      if (head) head.remove();
      const restHTML = sum.innerHTML;

      const credits = `
        <dl class="cassette-credits">
          <div><dt>Lead vocals</dt><dd>${esc(P.groom)} &amp; ${esc(P.bride)}</dd></div>
          <div><dt>Executive producers</dt><dd>The ${esc(groomFam)} &amp; ${esc(brideFam)} families</dd></div>
          <div><dt>Recorded live at</dt><dd>${venues.map(esc).join(' &amp; ')}</dd></div>
          <div><dt>Backing vocals</dt><dd>All of you, very loudly ♥</dd></div>
        </dl>`;

      const sideB = `
        <div class="cassette-bnote" aria-hidden="true">
          <div class="cassette-bnote-paper">
            <h2>Side B · Dance-floor rules</h2>
            <ol>
              <li>No sitting. The chairs are only for decoration.</li>
              <li>Uncle ji ka solo is mandatory.</li>
              <li>Every song is “bas, last song”.</li>
              <li>Shoes optional, smiles compulsory.</li>
            </ol>
            <p class="cassette-bnote-sign">The Management (Mummy ji)</p>
          </div>
        </div>`;

      const deck = `
        <section class="cassette-deck" aria-label="Cassette player">
          <div class="cassette-deck-top">
            <span class="cassette-brand">BAJAO<b>·90</b></span>
            <span class="cassette-brand-sub">Stereo cassette deck · Auto-reverse</span>
            <span class="cassette-led" aria-hidden="true"></span>
          </div>
          <div class="cassette-lcd">
            <div class="cassette-lcd-row">
              <span class="cassette-lcd-state" aria-hidden="true">■</span>
              <span class="cassette-lcd-label">NOW PLAYING</span>
              <span class="cassette-lcd-trk">TRK --/${pad2(N)}</span>
              <span class="cassette-lcd-time">0:00</span>
            </div>
            <div class="cassette-lcd-line cassette-lcd-title"><span>PRESS ▶ PLAY</span></div>
            <div class="cassette-lcd-line cassette-lcd-info"><span>SIDE A · ${N} TRACK${N > 1 ? 'S' : ''} · MADE FOR ${esc(guest.toUpperCase())}</span></div>
          </div>
          <div class="cassette-vu" aria-hidden="true">
            <div class="cassette-vu-row"><span>L</span><i><b></b></i></div>
            <div class="cassette-vu-row"><span>R</span><i><b></b></i></div>
          </div>
          <div class="cassette-keys">
            <button type="button" class="cassette-key cassette-key-rew" data-k="rew" aria-label="Rewind and replay">${ICONS.rew}<span>Rewind</span></button>
            <button type="button" class="cassette-key cassette-key-play" data-k="play" aria-label="Play" aria-pressed="false">${ICONS.play}<span>PLAY</span></button>
            <button type="button" class="cassette-key cassette-key-pause" data-k="pause" aria-label="Pause" aria-pressed="false">${ICONS.pause}<span>Pause</span></button>
            <button type="button" class="cassette-key cassette-key-eject" data-k="eject" aria-label="Eject: flip to Side B">${ICONS.eject}<span>Eject</span></button>
          </div>
        </section>`;

      root.innerHTML = `
        <div class="cassette-wrap${S ? ' is-static' : ''}">
          <div class="cassette-grain" aria-hidden="true"></div>
          ${lightsSVG()}
          ${S ? '' : '<button type="button" class="cassette-skip">Skip to details ↓</button>'}
          <header class="cassette-head">
            <p class="cassette-kicker">Shaadi Records presents</p>
            <h1 class="cassette-greet${ctx.greeting.length > 30 ? ' is-long' : ''}">${esc(ctx.greeting)}</h1>
            <p class="cassette-sub">${S ? 'We made you a mixtape. Side A is our ' + esc(ctx.occasion.title) + '.' : 'We made you a mixtape. Press ▶ Play.'}</p>
          </header>
          <div class="cassette-flip">
            <div class="cassette-card">
              <div class="cassette-face cassette-face-a">${cassetteSVG('a', svgOpts)}</div>
              ${S ? '' : `<div class="cassette-face cassette-face-b">${cassetteSVG('b', svgOpts)}</div>`}
            </div>
          </div>
          ${S ? '' : sideB + deck}
          <section class="cassette-jcard" aria-label="Track list and liner notes">
            <div class="cassette-panel cassette-panel-cover">
              <div class="cassette-spine" aria-hidden="true"><span>Sangeet Mix ’${esc(yy)}</span></div>
              <div class="cassette-cover-body">
                <div class="cassette-cover-head">
                  <span class="cassette-cover-side">Side A</span>
                  <span class="cassette-cover-hi" lang="hi">${esc(ctx.occasion.titleHi)}</span>
                </div>
                <p class="cassette-cover-mix">${esc(ctx.occasion.title)} · the track list</p>
                ${trackList}
                ${S ? '' : '<p class="cassette-cover-hint">Liner notes unfold after the last track ↓</p>'}
              </div>
            </div>
            <div class="cassette-panel cassette-panel-notes"${S ? '' : ' hidden'}>
              <div class="cassette-shloka">
                <p lang="hi">${esc(ctx.T.ganeshShort)}</p>
                ${ganesh ? `<span class="cassette-ganesh">${ganesh}</span>` : ''}
              </div>
              <p class="cassette-notes-title">Liner notes</p>
              ${credits}
              <div class="inv-sum cassette-sum">${headHTML}</div>
            </div>
            <div class="cassette-panel cassette-panel-details"${S ? '' : ' hidden'}>
              <div class="inv-sum cassette-sum">${restHTML}</div>
              ${S ? `<p class="cassette-outro">${dancey ? 'Side A ends here. The dancing doesn’t.' : 'Side A ends here. See you there!'}</p>` : '<p class="cassette-outro"><button type="button" class="cassette-again">◀◀ Rewind &amp; play again</button></p>'}
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
      const TRACK = RM ? 2600 : (N <= 3 ? 4200 : N <= 5 ? 3400 : N <= 7 ? 3000 : 2600);
      const TOTAL = INTRO + N * TRACK;

      let mode = 'idle';            // idle | play | pause | rew | end
      let side = 'a';
      let t = 0, cur = -2, vStep = 0, rewRate = 8, after = null;
      let angL = 0, angR = 0;
      let lvl = [0, 0];
      let unfolded = false;

      /* ---- audio (own WebAudio graph; checks ctx.sound.muted before every beat) ---- */
      let ac = null, master = null, noiseBuf = null, aStep = 0, aNext = 0;
      function ensureAudio() {
        try {
          if (!ac) {
            const A = window.AudioContext || window.webkitAudioContext;
            if (!A) return null;
            ac = new A();
            master = ac.createGain(); master.gain.value = 0.5; master.connect(ac.destination);
            const len = ac.sampleRate;
            noiseBuf = ac.createBuffer(1, len, ac.sampleRate);
            const ch = noiseBuf.getChannelData(0);
            for (let i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1;
          }
          if (ac.state === 'suspended') ac.resume();
        } catch (e) { ac = null; }
        return ac;
      }
      function env(g, at, a, peak, d) {
        g.gain.setValueAtTime(0.0001, at);
        g.gain.exponentialRampToValueAtTime(peak, at + a);
        g.gain.exponentialRampToValueAtTime(0.0001, at + d);
      }
      function noiseHit(at, dur, v, type, f) {
        const s = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain();
        s.buffer = noiseBuf; fl.type = type; fl.frequency.value = f;
        env(g, at, 0.002, v, dur);
        s.connect(fl); fl.connect(g); g.connect(master);
        s.start(at, Math.random() * 0.5, dur + 0.05);
      }
      function tone(at, f0, f1, dur, v, type) {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = type || 'sine';
        o.frequency.setValueAtTime(f0, at); o.frequency.exponentialRampToValueAtTime(f1, at + dur * 0.7);
        env(g, at, 0.004, v, dur);
        o.connect(g); g.connect(master); o.start(at); o.stop(at + dur + 0.05);
      }
      function tumbi(at, f, v) {
        const o = ac.createOscillator(), fl = ac.createBiquadFilter(), g = ac.createGain();
        o.type = 'square';
        o.frequency.setValueAtTime(f * 1.03, at); o.frequency.exponentialRampToValueAtTime(f, at + 0.03);
        fl.type = 'lowpass'; fl.frequency.setValueAtTime(3800, at); fl.frequency.exponentialRampToValueAtTime(800, at + 0.2);
        env(g, at, 0.003, v, 0.22);
        o.connect(fl); fl.connect(g); g.connect(master); o.start(at); o.stop(at + 0.3);
      }
      function playStep(s, at) {
        const ch = DRUM[s % 16];
        if (ch === 'D') { tone(at, 130, 52, 0.32, 0.75); noiseHit(at, 0.03, 0.18, 'lowpass', 900); }
        else if (ch === 'h') { tone(at, 520, 380, 0.11, 0.22, 'triangle'); noiseHit(at, 0.05, 0.16, 'bandpass', 3200); }
        if (s % 2 === 0 && ch !== 'D') noiseHit(at, 0.035, 0.05, 'highpass', 7000);
        const n = TUMBI[s % 32];
        if (n && s >= 16) tumbi(at, n, 0.05);
      }
      function audioTick() {
        if (!ac || ac.state !== 'running' || mode !== 'play') return;
        const stepS = STEP_MS / 1000;
        if (aNext < ac.currentTime) aNext = ac.currentTime + 0.05;
        while (aNext < ac.currentTime + 0.15) {
          if (!ctx.sound.muted) playStep(aStep, aNext + (aStep % 2 ? stepS * 0.12 : 0));
          aStep++; aNext += stepS;
        }
      }
      function audioGate(on) {
        if (!ac || !master) return;
        try {
          const now = ac.currentTime;
          master.gain.cancelScheduledValues(now);
          if (on) master.gain.setValueAtTime(0.5, now); else master.gain.setTargetAtTime(0.0001, now, 0.02);
        } catch (e) { /* ignore */ }
      }
      function clunk() {
        if (!ac || ac.state !== 'running' || ctx.sound.muted) return;
        audioGate(true);
        const now = ac.currentTime + 0.01;
        tone(now, 180, 70, 0.12, 0.35); noiseHit(now, 0.06, 0.25, 'lowpass', 1500);
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
        lcdState.textContent = { idle: '■', play: '▶', pause: '❚❚', rew: '◀◀', end: '■' }[mode];
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
          lcdTrk.textContent = `TRK --/${pad2(N)}`;
          lcd(`♫ SIDE A · SANGEET MIX ’${yy}`, `DEDICATED TO ${guest.toUpperCase()} · WITH LOVE, ${P.groom.toUpperCase()} ♥ ${P.bride.toUpperCase()}`);
          return;
        }
        const tr = tracks[i], e = tr.ev;
        lcdTrk.textContent = `TRK ${pad2(tr.no)}/${pad2(N)}`;
        lcd(tr.title.toUpperCase(), `${e.dateShort} · ${e.time} · ${e.place}`.toUpperCase());
        sr.textContent = `Track ${tr.no}: ${tr.title}. ${e.dateLong}, ${e.time}, ${e.placeFull}.`;
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
        if (TUMBI[s % 32] && s >= 16) a += 0.1;
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
          const st = Math.floor(t / STEP_MS);
          while (vStep < st) { vStep++; hit(vStep); }
          audioTick();
          setTrack(t < INTRO ? -1 : Math.min(N - 1, Math.floor((t - INTRO) / TRACK)));
          if (t >= TOTAL) { t = TOTAL; endSide(); }
        } else if (mode === 'rew') {
          t -= dt * rewRate;
          if (Math.random() < 0.5) { lvl[0] = Math.max(lvl[0], 0.25 + Math.random() * 0.3); lvl[1] = Math.max(lvl[1], 0.2 + Math.random() * 0.3); }
          if (t <= 0) { t = 0; rewDone(); }
        }
        const r = drawTape();
        if (mode === 'play' || mode === 'rew') {
          const dir = mode === 'rew' ? -rewRate : (RM ? 0.4 : 1);
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
        if (t === 0) { vStep = 0; aStep = 0; cur = -2; }
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
        lcdTrk.textContent = `TRK --/${pad2(N)}`;
        lcd('◀◀ REWINDING…', 'ONE MORE TIME, FROM THE TOP');
        ctx.sound.play('whoosh');
        paintState(); loop();
      }
      function rewDone() { mode = 'idle'; play(); }
      function endSide() {
        mode = 'end';
        audioGate(false); clunk();
        rows.forEach(r => { r.classList.remove('is-now'); r.classList.add('is-done'); });
        cur = N;
        lcdTrk.textContent = `TRK ${pad2(N)}/${pad2(N)}`;
        lcd('END OF SIDE A ✓', 'LINER NOTES BELOW ↓ · ◀◀ REWIND TO REPLAY');
        sr.textContent = 'End of Side A. The liner notes with all the details are below.';
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
        keys.eject.setAttribute('aria-label', toB ? 'Eject: flip back to Side A' : 'Eject: flip to Side B');
        if (toB) {
          lcd('SIDE B · BONUS TRACK', 'DANCE-FLOOR RULES · 1. NO SITTING · 2. UNCLE JI KA SOLO MANDATORY');
          sr.textContent = 'Side B: Dance-floor rules. 1, no sitting. 2, Uncle ji ka solo is mandatory. 3, every song is the last song. 4, shoes optional, smiles compulsory.';
        } else {
          const c = cur; cur = -2;
          if (mode === 'end') lcd('END OF SIDE A ✓', 'LINER NOTES BELOW ↓ · ◀◀ REWIND TO REPLAY');
          else if (t === 0) lcd('PRESS ▶ PLAY', `SIDE A · ${N} TRACK${N > 1 ? 'S' : ''} · MADE FOR ${guest.toUpperCase()}`);
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
          lcdTrk.textContent = `TRK ${pad2(N)}/${pad2(N)}`;
          lcd('END OF SIDE A ✓', 'LINER NOTES BELOW ↓ · ◀◀ REWIND TO REPLAY');
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
