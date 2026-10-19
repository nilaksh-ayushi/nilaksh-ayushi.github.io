/* Nilaksh & Ayushi — e-card runtime shared by every variant.

   VARIANT CONTRACT
   ----------------
   A variant lives in variants/<id>.js (+ optional variants/<id>.css) and registers itself:

     Invite.register('<id>', {
       render(root, ctx) { ... }     // build everything inside `root` (an empty <main>)
     });

   ctx (read-only):
     ctx.group        { n, code, slug, label, events:[n...], variant }
     ctx.events       events this guest is invited to, in order; each has the data.js fields plus
                      venueInfo {short,name,area,map}, place ("Spot, Venue"), placeFull (with city), dow ("Thursday"), dd ("03"),
                      day (3), mon ("Dec"), month ("December"), dateLong ("Thursday, 3 December 2026"),
                      dateShort ("Thu 3 Dec"), isTimeText (true when time is a phrase, e.g. Vidaai)
     ctx.days         the same events grouped by date: [{ date, dow, dd, mon, dateLong, dateShort, events:[...] }]
     ctx.guest        guest name from ?to= ('' when absent)
     ctx.greeting     'Dear Sharma Ji & Family' or 'Dear Family & Friends'
     ctx.occasion     { key, title, titleHi, line } — what this card is inviting to, worded for the group
     ctx.P, ctx.T     PEOPLE and TEXT from data.js
     ctx.isStatic     true when rendering a still image (?img=1): show the final state at once, no animation,
                      no sound, nothing that needs a tap. The page is screenshotted at 540 CSS px wide.
     ctx.reducedMotion true when the user prefers reduced motion: skip/shorten animation, keep it usable.
     ctx.sound.play(name)  'tap' | 'pop' | 'chime' | 'ding' | 'bell' | 'dhol' | 'success' | 'whoosh' | 'splash'
                      (synthesised; silent until the guest's first tap and when muted)
     ctx.esc(str)     HTML-escape
     ctx.summaryHTML(opts) standard details block (couple, family line, every event with Directions and
                      Add to calendar, host footer). Style via CSS variables (see core.css). opts:
                      { heading: false } to omit the couple header, { footer: false } to omit the host footer.
     ctx.calendarButtonHTML(label?) one button that downloads an .ics with all the guest's events
     ctx.directionsHTML(ev, label?) an <a> to the venue's map
     Invite.art.ganesh({size, className, stroke}) / Invite.art.hanuman(...)  minimal line-art doodle SVG
                      (stroke = currentColor, so it takes the text colour). Invite.ganeshBlockHTML(opts) =
                      '॥ श्री गणेशाय नमः ॥' with the Ganesh doodle under it (class inv-ganesh).
     ctx.ready()      call once the card is fully shown (used by the image renderer; harmless otherwise)

   Optional shared module (deck.js, loaded by invite.html): window.InviteDeck, a swipeable pop-up deck of
   designed invitation pages. InviteDeck.eventPage(ctx, ev, {art, kicker, note}) and InviteDeck.closingPage(ctx)
   build pages; InviteDeck.open(pages, {single, cta, theme, events: ctx.events}) shows them. Never open it
   when ctx.isStatic. See deck.js for details.

   Rules for variants: never show events outside ctx.events; always end with every event's name, date,
   time and place readable (ctx.summaryHTML is the easy way); work from 320 px to 540 px wide; no external
   images (draw with CSS/SVG/emoji); fonts only from Google Fonts via @import in the variant CSS. */
(function (root) {
  'use strict';
  const D = root.INVITE;
  const DOW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function decorate(ev) {
    const [y, m, d] = ev.date.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    const v = D.VENUES[ev.venue];
    const dow = DOW[dt.getUTCDay()];
    return Object.assign({}, ev, {
      venueInfo: v,
      place: ev.spot ? ev.spot + ', ' + v.short : v.name,
      placeFull: ev.spot ? `${ev.spot}, ${v.short}, ${v.area.split(',').pop().trim()}` : `${v.name}, ${v.area}`,
      dow, day: d, dd: String(d).padStart(2, '0'),
      mon: MON[m - 1].slice(0, 3), month: MON[m - 1],
      dateLong: `${dow}, ${d} ${MON[m - 1]} ${y}`,
      dateShort: `${dow.slice(0, 3)} ${d} ${MON[m - 1].slice(0, 3)}`,
      isTimeText: !ev.start,
    });
  }

  function groupByDay(evs) {
    const out = [];
    evs.forEach(e => {
      let d = out[out.length - 1];
      if (!d || d.date !== e.date) {
        d = { date: e.date, dow: e.dow, dd: e.dd, mon: e.mon, dateLong: e.dateLong, dateShort: e.dateShort, events: [] };
        out.push(d);
      }
      d.events.push(e);
    });
    return out;
  }

  function occasionFor(nums) {
    const has = n => nums.includes(n);
    if (has(6) || has(7) || has(8) || has(9)) return {
      key: 'wedding', title: 'Shubh Vivah', titleHi: 'शुभ विवाह',
      line: 'request the pleasure of your company at the wedding celebrations of their son',
    };
    if (has(3)) return {
      key: 'engagement', title: 'Sagai & Sangeet', titleHi: 'सगाई एवं संगीत',
      line: 'invite you to an evening of rings, music and dancing at the engagement of their son',
    };
    if (has(4) || has(5)) return {
      key: 'haldi', title: 'Haldi & Bhaat', titleHi: 'हल्दी एवं भात',
      line: 'invite you to a morning of turmeric, blessings and family love as they get their son ready for his wedding',
    };
    if (has(2)) return {
      key: 'mehandi', title: 'Mehandi', titleHi: 'मेहंदी',
      line: 'invite you to an afternoon of mehandi, geet and dinner ahead of the wedding of their son',
    };
    return {
      key: 'sunderkand', title: 'Shri Sunderkand Path', titleHi: 'श्री सुंदरकांड पाठ',
      line: 'invite you to seek Hanuman ji’s blessings at the Sunderkand Path ahead of the wedding of their son',
    };
  }

  /* ---------- calendar ---------- */
  function icsStamp(date, hhmm, addMin) {
    // IST is UTC+5:30 all year.
    const [y, m, d] = date.split('-').map(Number);
    const [hh, mm] = hhmm.split(':').map(Number);
    const t = new Date(Date.UTC(y, m - 1, d, hh, mm) - 330 * 60000 + (addMin || 0) * 60000);
    return t.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  }
  function buildIcs(evs) {
    const P = D.PEOPLE;
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Nilaksh Ayushi//Invite//EN', 'CALSCALE:GREGORIAN'];
    evs.forEach(e => {
      lines.push('BEGIN:VEVENT', `UID:${e.id}-2026@nilaksh-ayushi`, 'DTSTAMP:20261011T000000Z');
      if (e.start) {
        lines.push(`DTSTART:${icsStamp(e.date, e.start)}`, `DTEND:${icsStamp(e.date, e.start, 120)}`);
      } else {
        const d = e.date.replace(/-/g, '');
        const next = new Date(Date.UTC(...e.date.split('-').map((x, i) => i === 1 ? x - 1 : +x)) + 864e5)
          .toISOString().slice(0, 10).replace(/-/g, '');
        lines.push(`DTSTART;VALUE=DATE:${d}`, `DTEND;VALUE=DATE:${next}`);
      }
      const what = `${e.name} · ${P.groom} & ${P.bride}`;
      lines.push(`SUMMARY:${what.replace(/([,;])/g, '\\$1')}`,
        `LOCATION:${(e.place + ', ' + e.venueInfo.area).replace(/([,;])/g, '\\$1')}`,
        `DESCRIPTION:${(e.note ? e.note + '. ' : '') + 'Directions: ' + e.venueInfo.map}`,
        'END:VEVENT');
    });
    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  }

  /* ---------- sound (WebAudio, no files) ---------- */
  const sound = (function () {
    let ac = null, unlocked = false, muted = false;
    try { muted = localStorage.getItem('invite-muted') === '1'; } catch (e) { /* storage blocked */ }
    function ctxA() {
      if (!ac) { const A = root.AudioContext || root.webkitAudioContext; if (A) ac = new A(); }
      if (ac && ac.state === 'suspended') ac.resume();
      return ac;
    }
    function tone(f, t0, dur, type, vol, f2) {
      const a = ac, o = a.createOscillator(), g = a.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(f, a.currentTime + t0);
      if (f2) o.frequency.exponentialRampToValueAtTime(f2, a.currentTime + t0 + dur);
      g.gain.setValueAtTime(0.0001, a.currentTime + t0);
      g.gain.exponentialRampToValueAtTime(vol || 0.2, a.currentTime + t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + t0 + dur);
      o.connect(g).connect(a.destination); o.start(a.currentTime + t0); o.stop(a.currentTime + t0 + dur + 0.05);
    }
    function noise(t0, dur, vol, from, to) {
      const a = ac, len = Math.floor(a.sampleRate * dur), buf = a.createBuffer(1, len, a.sampleRate);
      const ch = buf.getChannelData(0); for (let i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1;
      const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
      s.buffer = buf; f.type = 'bandpass'; f.Q.value = 0.8;
      f.frequency.setValueAtTime(from, a.currentTime + t0); f.frequency.exponentialRampToValueAtTime(to, a.currentTime + t0 + dur);
      g.gain.setValueAtTime(vol, a.currentTime + t0); g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + t0 + dur);
      s.connect(f).connect(g).connect(a.destination); s.start(a.currentTime + t0);
    }
    const presets = {
      tap: () => tone(660, 0, 0.06, 'triangle', 0.12),
      pop: () => tone(420, 0, 0.12, 'sine', 0.25, 900),
      chime: () => { tone(988, 0, 0.5, 'sine', 0.2); tone(784, 0.28, 0.7, 'sine', 0.2); },
      ding: () => { tone(1320, 0, 0.18, 'sine', 0.18); tone(1760, 0.09, 0.25, 'sine', 0.12); },
      bell: () => { [523, 1046, 1569, 2092].forEach((f, i) => tone(f, 0, 2.4 - i * 0.4, 'sine', 0.12 / (i + 1))); },
      dhol: () => { [0, 0.18, 0.36, 0.45, 0.63].forEach((t, i) => tone(i % 2 ? 180 : 90, t, 0.2, 'sine', 0.5, i % 2 ? 120 : 50)); },
      success: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.09, 0.35, 'triangle', 0.15)),
      whoosh: () => noise(0, 0.5, 0.25, 300, 3000),
      splash: () => noise(0, 0.25, 0.35, 2000, 400),
    };
    function unlock() { unlocked = true; ctxA(); }
    ['pointerdown', 'keydown', 'touchstart'].forEach(t => root.addEventListener(t, unlock, { once: true, capture: true }));
    return {
      play(name) {
        if (muted || !unlocked || Invite.isStatic || !presets[name]) return;
        try { if (ctxA()) presets[name](); } catch (e) { /* audio unavailable */ }
      },
      get muted() { return muted; },
      setMuted(v) { muted = !!v; try { localStorage.setItem('invite-muted', muted ? '1' : '0'); } catch (e) { /* storage blocked */ } },
    };
  })();

  /* ---------- devotional doodles (minimal line art, inherit text colour) ---------- */
  // Seated Ganesh ji, front-facing, as on wedding cards: mukut, big ears, trunk to one side, four arms
  // (lotus, ankush, abhaya, modak), rounded belly, crossed legs on a lotus asana, mushak at the base.
  const GANESH_ART = `<g stroke-linecap="round" stroke-linejoin="round">
  <circle cx="50" cy="3.6" r="1.5" fill="currentColor" stroke="none"/>
  <path d="M42.5 20 L44 11.5 L50 5.8 L56 11.5 L57.5 20"/>
  <path d="M41 20.2 C46 19 54 19 59 20.2"/>
  <path d="M40.5 22.5 C31 19 24.5 25 25.2 32.5 C26 40 33 43.5 40 39.5"/>
  <path d="M59.5 22.5 C69 19 75.5 25 74.8 32.5 C74 40 67 43.5 60 39.5"/>
  <path d="M41 22 C40 28 40.6 34.5 44.5 38.5"/>
  <path d="M59 22 C60 28 59.4 34.5 55.5 38.5"/>
  <circle cx="45.5" cy="28.5" r="1.15" fill="currentColor" stroke="none"/>
  <circle cx="54.5" cy="28.5" r="1.15" fill="currentColor" stroke="none"/>
  <path d="M50 22.2 V26.2"/>
  <path d="M46.2 36 C46 43 48 47.5 53 49.6 C57.2 51.4 60.4 49.6 59.6 46.6 C58.9 44.4 56.2 44.9 56.6 47"/>
  <path d="M53.8 36.5 C53.8 40.5 54.8 43 57 44.2"/>
  <path d="M43.4 38.2 L41.6 41.4"/>
  <path d="M37.5 41.5 C27 42 20.5 37.5 19.6 31"/>
  <circle cx="19.4" cy="28.2" r="2.6"/>
  <path d="M62.5 41.5 C73 42 79.5 37.5 80.4 31"/>
  <path d="M80.4 31 C80 26.8 83.6 25.6 85 28.2"/>
  <path d="M38 42 C33.6 45 31.6 50.5 33.4 56.5"/>
  <path d="M62 42 C66.4 45 68.4 50.5 66.6 56.5"/>
  <path d="M36 60.5 C36 52.5 43 49.4 50 49.4 C57 49.4 64 52.5 64 60.5 C64 68.5 57 73.4 50 73.4 C43 73.4 36 68.5 36 60.5 Z"/>
  <circle cx="50" cy="64.5" r="1" fill="currentColor" stroke="none"/>
  <path d="M34.2 46.5 C29.6 50 27.6 54.5 28.4 59.2"/>
  <path d="M24 63.4 C24 59.6 26.8 57.6 28.6 55.2 C30.4 57.6 33.2 59.6 33.2 63.4 C33.2 66 24 66 24 63.4 Z"/>
  <path d="M65.8 46.5 C70.6 49 73.4 51 73.6 47.4"/>
  <path d="M71.6 46.6 C70.6 42.6 71.6 38.6 74.4 37.4 C77.2 38.6 78.2 42.6 77.2 46.6 C76 47.8 72.8 47.8 71.6 46.6 Z"/>
  <path d="M29.5 77 C33.5 71.6 44 72.4 50 76.4 C56 72.4 66.5 71.6 70.5 77 C72.4 82 66 85.6 50 85 C34 85.6 27.6 82 29.5 77 Z"/>
  <path d="M55.5 79 C59.5 77 63.6 77.6 65 80"/>
  <path d="M25 87.5 C31 92 69 92 75 87.5"/>
  <path d="M27 89.5 C29 96.5 35.5 96.5 37.6 91 C39.8 97.6 46.2 97.6 50 92 C53.8 97.6 60.2 97.6 62.4 91 C64.5 96.5 71 96.5 73 89.5"/>
  <path d="M77.4 104 C77 100.6 80 98.6 83.4 99 C85.6 99.3 87.6 100.6 89.6 102.4 C87.8 103.6 85 104.3 82 104.3 C80 104.3 78.4 104.4 77.4 104 Z"/>
  <path d="M81.6 99.4 C81 97.4 82.6 96.2 84 97.2 C84.6 97.8 84.6 98.8 84.2 99.4"/>
  <circle cx="87" cy="101.6" r=".8" fill="currentColor" stroke="none"/>
  <path d="M77.6 103.6 C74.6 103.2 72.6 104.6 72.8 107"/>
</g>`;
  // Hanuman ji bowing in devotion: profile facing right, kneeling on one knee, head gently bowed with eyes
  // closed, hands folded in namaste, ornate mukut and kundal, tail rising behind in an S-curve, gada upright.
  const HANUMAN_ART = `<g stroke-linecap="round" stroke-linejoin="round">
  <path d="M41.5 62 C30 64 22 58 22 48 C22 40 28 36 32 30 C35 25 33 19 29 18 C26 17.6 24.6 20.6 26.8 22"/>
  <g transform="rotate(14 47 40)">
    <path d="M43.6 21 L44.6 15 L47.6 17.6 L51 9 L54.4 17.6 L57.4 15 L58.4 21"/>
    <path d="M43 21.6 C48 20 53.6 20 59 21.6"/>
    <circle cx="51" cy="16.4" r="1.2" fill="currentColor" stroke="none"/>
    <circle cx="51" cy="6.8" r="1.2" fill="currentColor" stroke="none"/>
    <path d="M43.4 22 C40.2 26.6 40.4 34 44.4 39"/>
    <path d="M58.4 22 C59.8 24.6 60.2 27 60 28.6 C63.6 29.4 67.6 31.4 68.4 34 C68.8 35.6 67.6 36.8 65.6 37 C61.6 37.6 57.8 39.6 54.4 40.8 C51.4 41.6 48.6 41 46.6 39.6"/>
    <path d="M62.8 35.4 C64.4 35.7 65.8 35.6 66.9 35.2"/>
    <path d="M54.6 28.4 C55.8 29.6 57.4 29.6 58.4 28.4"/>
    <path d="M54.4 25.9 C55.8 25.1 57.4 25.2 58.4 25.8" stroke-width="1.4"/>
    <path d="M57.6 22.8 C57.6 25.4 59.4 25.4 59.4 22.8"/>
    <path d="M48.2 27.6 C45.8 27.6 45.2 31.4 47.6 32.2"/>
    <circle cx="47.2" cy="35" r="1.9"/>
  </g>
  <path d="M45.4 41 C41 48 40.6 57 42.6 65.6"/>
  <path d="M54.6 43 C57.4 47.6 58 52.4 56.6 56.8"/>
  <path d="M50.4 46 C48.2 50 48.2 54 50.2 57.6 C54 57.4 57.4 55 59.4 52"/>
  <path d="M59.6 53 C58.6 49 59.8 45.2 62.4 42.8 C63.8 46 63.6 50.2 61.4 53.6 C60.8 54 60 53.8 59.6 53Z"/>
  <path d="M42 65.6 C46 67.6 51.6 67.4 55.6 64"/>
  <path d="M54.6 63.4 C60.6 61.6 67.4 61 71.6 62.6 C73.4 63.4 73.8 65.6 72.8 67"/>
  <path d="M56.6 64.8 C60.4 64.6 64.4 65.2 67.2 66.4" opacity=".55"/>
  <path d="M73 66.6 C72.8 75 72 84 71.4 92.6"/>
  <path d="M67.8 68.4 C68 76 67.6 85 67 92.6"/>
  <path d="M67 92.8 C70 93.6 74 93.6 77.2 92.8"/>
  <path d="M51 69 C53.2 76 54 84 53.6 92.6 C52.6 94.2 49.6 94.2 48.2 92.6 C46 85 44 77 43.2 68.6"/>
  <path d="M48.6 93.6 C42 94.4 35 94.4 29.6 93.8 C28.2 92.2 29 90 31.2 90"/>
  <path d="M14 96.6 C34 94.8 70 94.8 94 96.6"/>
  <path d="M86 94.4 V60"/>
  <path d="M83.6 62 H88.4"/>
  <circle cx="86" cy="52.6" r="7"/>
  <path d="M79.6 51 C83.6 52.2 88.4 52.2 92.4 51" opacity=".6"/>
  <path d="M80 55 C84 56.2 88 56.2 92 55" opacity=".6"/>
  <path d="M86 45.6 V42.2"/>
  <circle cx="86" cy="40.6" r="1.4" fill="currentColor" stroke="none"/>
</g>`;
  function doodle(paths, label, opts) {
    opts = opts || {};
    const w = opts.size || 56, hgt = Math.round(w * 1.1);
    return `<svg class="inv-doodle${opts.className ? ' ' + esc(opts.className) : ''}" width="${w}" height="${hgt}" viewBox="0 0 100 110" ` +
      `fill="none" stroke="currentColor" stroke-width="${opts.stroke || 2}" role="img" aria-label="${label}" focusable="false">${paths}</svg>`;
  }
  const art = {
    ganesh: opts => doodle(GANESH_ART, 'Shri Ganesh', opts),
    hanuman: opts => doodle(HANUMAN_ART, 'Shri Hanuman', opts),
  };
  function ganeshBlockHTML(opts) {
    return `<div class="inv-ganesh"><p lang="hi">${esc(D.TEXT.ganeshShort)}</p>${art.ganesh(opts)}</div>`;
  }

  /* ---------- markup helpers ---------- */
  function directionsHTML(ev, label) {
    return `<a class="inv-btn inv-dir" href="${esc(ev.venueInfo.map)}" target="_blank" rel="noopener">${esc(label || 'Directions')}</a>`;
  }
  function calendarButtonHTML(label) {
    return `<button type="button" class="inv-btn inv-cal" data-inv-cal>${esc(label || 'Add to calendar')}</button>`;
  }
  function timeHTML(e) {
    return e.isTimeText ? `<i>${esc(e.time)}</i>` : esc(e.time);
  }

  function makeSummary(ctx) {
    return function summaryHTML(opts) {
      opts = opts || {};
      const P = ctx.P;
      const head = opts.heading === false ? '' : `
        <header class="inv-sum-head">
          <p class="inv-sum-kicker">${esc(ctx.occasion.title)}</p>
          <p class="inv-sum-bless">With the divine blessings of<br><span class="inv-name">${esc(P.blessings)}</span></p>
          <p class="inv-sum-hosts"><span class="inv-name">${esc(P.groomParents)}</span></p>
          <p class="inv-sum-line">${esc(ctx.occasion.line)}</p>
          <h2 class="inv-sum-couple"><span>${esc(P.groom)}</span><em>with</em><span>${esc(P.bride)}</span></h2>
          <p class="inv-sum-bride">Daughter of <span class="inv-name">${esc(P.brideParents)}</span></p>
        </header>`;
      const days = ctx.days.map(d => `
        <section class="inv-sum-day">
          <h3>${esc(d.dateLong)}</h3>
          ${d.events.map(e => `
            <div class="inv-sum-ev">
              <div class="inv-sum-time">${timeHTML(e)}</div>
              <div class="inv-sum-what">
                <strong>${esc(e.name)}</strong>${e.note ? ` <span class="inv-sum-note">${esc(e.note)}</span>` : ''}
                <span class="inv-sum-place">${esc(e.placeFull)}</span>
                ${e.dress ? `<span class="inv-sum-note">Dress code: ${esc(e.dress)}</span>` : ''}
              </div>
              ${ctx.isStatic ? '' : directionsHTML(e)}
            </div>`).join('')}
        </section>`).join('');
      const foot = opts.footer === false ? '' : `
        <footer class="inv-sum-foot">
          <p>With love, <span class="inv-name">${esc(P.hosts)}</span></p>
          <p>${esc(P.address)}</p>
          <p>${P.phones.map(p => `<a href="tel:+91${esc(p)}">${esc(p)}</a>`).join(' · ')}</p>
        </footer>`;
      const cal = ctx.isStatic ? '' : `<div class="inv-sum-actions">${calendarButtonHTML()}</div>`;
      return `<div class="inv-sum">${head}${days}${cal}${foot}</div>`;
    };
  }

  /* ---------- public API ---------- */
  const registry = {};
  const Invite = {
    data: D, esc, decorate, groupByDay, occasionFor, buildIcs, sound, art, ganeshBlockHTML,
    isStatic: false,

    register(id, impl) { registry[id] = impl; },

    groupFor(code) {
      return D.GROUPS.find(g => g.code === code) || D.GROUPS.find(g => g.n === D.DEFAULT_GROUP);
    },

    fromLocation(loc) {
      loc = loc || root.location;
      const q = new URLSearchParams(loc.search);
      // Hosted links are /<variant>?i=… (one page per variant, so WhatsApp shows that card's preview).
      // An unknown page name such as "invite" falls back to the group's own variant in start().
      const page = loc.pathname.split('/').pop().replace(/\.html$/, '');
      return { code: q.get('i') || '', guest: (q.get('to') || '').trim().slice(0, 80), variant: q.get('t') || page, img: q.get('img') === '1' };
    },

    buildCtx(opts) {
      const group = Invite.groupFor(opts.code);
      const events = group.events.map(n => decorate(D.EVENTS.find(e => e.n === n)));
      const ctx = {
        group, events, days: groupByDay(events),
        guest: opts.guest || '',
        greeting: opts.guest ? 'Dear ' + opts.guest : 'Dear Family & Friends',
        occasion: occasionFor(group.events),
        P: D.PEOPLE, T: D.TEXT,
        isStatic: !!opts.img,
        reducedMotion: !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches),
        sound, esc, directionsHTML, calendarButtonHTML,
        ready() { document.documentElement.setAttribute('data-ready', '1'); },
      };
      ctx.summaryHTML = makeSummary(ctx);
      return ctx;
    },

    downloadIcs(evs) {
      const blob = new Blob([buildIcs(evs)], { type: 'text/calendar;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'nilaksh-ayushi.ics';
      document.body.appendChild(a); a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    },

    /* Loads variants/<id>.css + .js and renders into `mount`. Used by invite.html. */
    start(mount, opts) {
      const ctx = Invite.buildCtx(opts);
      Invite.isStatic = ctx.isStatic;
      const known = D.VARIANTS.some(v => v.id === opts.variant);
      const id = known ? opts.variant : ctx.group.variant;
      document.documentElement.classList.add('v-' + id);
      if (ctx.isStatic) {
        document.documentElement.classList.add('img');
        // The image renderer reads this (via --dump-dom) to size the screenshot to the content.
        setInterval(() => document.documentElement.setAttribute('data-height',
          Math.ceil(Math.max(document.documentElement.scrollHeight, document.body.scrollHeight))), 250);
      }
      if (ctx.guest) document.title = `${D.PEOPLE.groom} & ${D.PEOPLE.bride} · for ${ctx.guest}`;

      // One delegated handler for every "Add to calendar" button any variant renders.
      mount.addEventListener('click', e => {
        if (e.target.closest('[data-inv-cal]')) { sound.play('ding'); Invite.downloadIcs(ctx.events); }
      });
      if (!ctx.isStatic) Invite.mountSoundToggle();

      const css = document.createElement('link');
      css.rel = 'stylesheet'; css.href = `variants/${id}.css`;
      document.head.appendChild(css);
      const js = document.createElement('script');
      js.src = `variants/${id}.js`;
      js.onload = () => {
        const v = registry[id];
        if (!v) { mount.innerHTML = '<div class="inv-sum-wrap">' + ctx.summaryHTML() + '</div>'; ctx.ready(); return; }
        try { v.render(mount, ctx); } catch (err) {
          console.error(err);
          mount.innerHTML = '<div class="inv-sum-wrap">' + ctx.summaryHTML() + '</div>'; ctx.ready();
        }
      };
      js.onerror = () => { mount.innerHTML = '<div class="inv-sum-wrap">' + ctx.summaryHTML() + '</div>'; ctx.ready(); };
      document.body.appendChild(js);
      return ctx;
    },

    mountSoundToggle() {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'inv-sound';
      const paint = () => {
        b.textContent = sound.muted ? '🔇' : '🔊';
        b.setAttribute('aria-label', sound.muted ? 'Turn sound on' : 'Turn sound off');
      };
      b.addEventListener('click', () => { sound.setMuted(!sound.muted); paint(); sound.play('tap'); });
      paint();
      document.body.appendChild(b);
    },
  };

  root.Invite = Invite;
})(window);
