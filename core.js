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
     ctx.hi, ctx.t(en, hi)  Hindi mode (?lang=hi or a /<variant>-hi page): ctx.hi is true and ctx.t returns the
                      Hindi text. In Hindi mode ctx.events, ctx.days, ctx.P, ctx.greeting and ctx.occasion already
                      hold Hindi (name, time, place, placeFull, dow, mon, month, dateLong, dateShort, note, dress;
                      the English originals stay in ev.en, P.en and occasion.en), and summaryHTML and the buttons are
                      in Hindi. A variant only translates its own wording. hindi-fonts.css adds Devanagari letters
                      to the English-only web fonts.
     ctx.greeting     'Dear Sharma Ji & Family' or 'Dear Family & Friends'
     ctx.occasion     { key, title, titleHi, line } — what this card is inviting to, worded for the group
     ctx.P, ctx.T     PEOPLE and TEXT from data.js
     ctx.isStatic     true when rendering a still image (?img=1): show the final state at once, no animation,
                      no sound, nothing that needs a tap. The page is screenshotted at 540 CSS px wide.
     ctx.reducedMotion true when the user prefers reduced motion: skip/shorten animation, keep it usable.
     ctx.sound.play(name)  'tap' | 'pop' | 'chime' | 'ding' | 'bell' | 'dhol' | 'success' | 'whoosh' | 'splash'
                      (+ dholak bols 'dha' | 'dhin' | 'na'). Synthesised; silent until the guest's first tap and
                      when muted. Each variant has a sound theme in core.js (themes.<id>) that gives these names its
                      own sound, so a new variant can add one there instead of changing its calls.
     ctx.sound.say([{ text, lang: 'hi' | 'en' }, ...], delayMs)  speak with the device's voice (skips a language
                      the device has no voice for); ctx.sound.hush() stops it.
     ctx.esc(str)     HTML-escape
     ctx.summaryHTML(opts) standard details block (couple, family line, every event with Directions and
                      Add to calendar, host footer). Style via CSS variables (see core.css). opts:
                      { heading: false } to omit the couple header, { footer: false } to omit the host footer.
     ctx.calendarButtonHTML(label?) one button that downloads an .ics with all the guest's events
     ctx.directionsHTML(ev, label?) an <a> to the venue's map
     Invite.hindi.date(iso, short?) / .time(ev) / .place(ev)  Hindi date, time and place (data.js hi fields)
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

  function decorate(ev, hi) {
    const [y, m, d] = ev.date.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    const v = D.VENUES[ev.venue];
    const dow = DOW[dt.getUTCDay()];
    const out = Object.assign({}, ev, {
      venueInfo: v,
      place: ev.spot ? ev.spot + ', ' + v.short : v.name,
      placeFull: ev.spot ? `${ev.spot}, ${v.short}, ${v.area.split(',').pop().trim()}` : `${v.name}, ${v.area}`,
      dow, day: d, dd: String(d).padStart(2, '0'),
      mon: MON[m - 1].slice(0, 3), month: MON[m - 1],
      dateLong: `${dow}, ${d} ${MON[m - 1]} ${y}`,
      dateShort: `${dow.slice(0, 3)} ${d} ${MON[m - 1].slice(0, 3)}`,
      isTimeText: !ev.start,
    });
    if (!hi) return out;
    // Hindi mode: the same fields in Hindi, English originals kept in out.en (used for the calendar file).
    const en = {};
    ['name', 'time', 'place', 'placeFull', 'dow', 'mon', 'month', 'dateLong', 'dateShort', 'note', 'dress'].forEach(k => { en[k] = out[k]; });
    const vh = v.hi || {};
    return Object.assign(out, {
      en,
      name: ev.hi || ev.name,
      time: hindi.time(ev),
      place: ev.spot ? `${ev.spotHi || ev.spot}, ${vh.short || v.short}` : (vh.name || v.name),
      placeFull: hindi.place(out),
      dow: DOW_HI[dt.getUTCDay()], mon: MON_HI[m - 1], month: MON_HI[m - 1],
      dateLong: hindi.date(ev.date), dateShort: hindi.date(ev.date, true),
      note: ev.noteHi || ev.note, dress: ev.dressHi || ev.dress,
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
      lineHi: 'अपने सुपुत्र के शुभ विवाह के पावन अवसर पर आपको सादर आमंत्रित करते हैं',
    };
    if (has(3)) return {
      key: 'engagement', title: 'Sagai & Sangeet', titleHi: 'सगाई एवं संगीत',
      line: 'invite you to an evening of rings, music and dancing at the engagement of their son',
      lineHi: 'अपने सुपुत्र की सगाई एवं संगीत संध्या में आपको सादर आमंत्रित करते हैं',
    };
    if (has(4) || has(5)) return {
      key: 'haldi', title: 'Haldi & Bhaat', titleHi: 'हल्दी एवं भात',
      line: 'invite you to a morning of turmeric, blessings and family love as they get their son ready for his wedding',
      lineHi: 'अपने सुपुत्र के विवाह से पूर्व हल्दी एवं भात की रस्मों में आपको सादर आमंत्रित करते हैं',
    };
    if (has(2)) return {
      key: 'mehandi', title: 'Mehandi', titleHi: 'मेहंदी',
      line: 'invite you to an afternoon of mehandi and geet ahead of the wedding of their son',
      lineHi: 'अपने सुपुत्र के विवाह से पूर्व मेहंदी एवं गीत में आपको सादर आमंत्रित करते हैं',
    };
    return {
      key: 'sunderkand', title: 'Shri Sunderkand Path', titleHi: 'श्री सुंदरकांड पाठ',
      line: 'invite you to seek Hanuman ji’s blessings at the Sunderkand Path ahead of the wedding of their son',
      lineHi: 'अपने सुपुत्र के विवाह से पूर्व हनुमान जी का आशीर्वाद लेने हेतु श्री सुंदरकांड पाठ में आपको सादर आमंत्रित करते हैं',
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

  /* ---------- sound (WebAudio, no files) ----------
     Every card plays the same names (tap, pop, chime, ...) and each card has a theme that gives a name its own
     sound: a 'ding' is the doors chime on the metro, a coin on the claw machine, a glass ting elsewhere.
     The instruments are synthesised (struck brass, plucked santoor strings, dhol, ghungroo, a shehnai reed) and
     everything runs through a soft compressor and a small synthetic hall. sound.say() speaks text with the
     device's own voice (the metro announcements). */
  const sound = (function () {
    let ac = null, unlocked = false, muted = false, theme = '', bus = null, hall = null, nbuf = null;
    const strings = {};
    try { muted = localStorage.getItem('invite-muted') === '1'; } catch (e) { /* storage blocked */ }
    function ctxA() {
      if (!ac) { const A = root.AudioContext || root.webkitAudioContext; if (A) { ac = new A(); wire(); } }
      if (ac && ac.state === 'suspended') ac.resume();
      return ac;
    }
    function wire() {
      const comp = ac.createDynamicsCompressor();
      comp.threshold.value = -16; comp.knee.value = 10; comp.ratio.value = 4; comp.attack.value = 0.003; comp.release.value = 0.25;
      comp.connect(ac.destination);
      bus = ac.createGain(); bus.gain.value = 0.9; bus.connect(comp);
      // the hall: 2.4 s of decaying stereo noise as a reverb impulse
      const sr = ac.sampleRate, len = Math.floor(sr * 2.4), ir = ac.createBuffer(2, len, sr);
      for (let c = 0; c < 2; c++) {
        const d = ir.getChannelData(c);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 4);
      }
      const conv = ac.createConvolver(); conv.buffer = ir;
      hall = ac.createGain(); hall.gain.value = 0.5;
      hall.connect(conv); conv.connect(comp);
      nbuf = ac.createBuffer(1, sr, sr);
      const ch = nbuf.getChannelData(0);
      for (let i = 0; i < sr; i++) ch[i] = Math.random() * 2 - 1;
    }

    /* -- building blocks. Times (t0) are seconds from now. Shared options: v volume, a attack, hold (stay at v
          this long), d total length, lp/hp/bp filter Hz with `to` = sweep target and q, pan (-1..1) with
          pan2 = sweep target, rev = how much goes to the hall (0..1), dest = node to play into (default: the bus). -- */
    const at = t0 => ac.currentTime + 0.005 + (t0 || 0);
    const rnd = (a, b) => a + Math.random() * (b - a);
    function out(node, t, o) {
      let n = node;
      if ((o.pan || o.pan2 != null) && ac.createStereoPanner) {
        const p = ac.createStereoPanner();
        p.pan.setValueAtTime(o.pan || 0, t);
        if (o.pan2 != null) p.pan.linearRampToValueAtTime(o.pan2, t + (o.d || 0.3));
        n.connect(p); n = p;
      }
      n.connect(o.dest || bus);
      if (o.rev) { const s = ac.createGain(); s.gain.value = o.rev; n.connect(s); s.connect(hall); }
    }
    function envelope(g, t, o) {
      const v = o.v || 0.2, a = o.a || 0.004, d = o.d || 0.3;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(v, t + a);
      if (o.hold) g.gain.setValueAtTime(v, t + a + o.hold);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    }
    function filt(n, t, o) {
      const type = o.lp ? 'lowpass' : o.hp ? 'highpass' : o.bp ? 'bandpass' : '';
      if (!type) return n;
      const f = ac.createBiquadFilter();
      f.type = type; f.Q.value = o.q || 0.8;
      f.frequency.setValueAtTime(o.lp || o.hp || o.bp, t);
      if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t + (o.d || 0.3));
      n.connect(f); return f;
    }
    // One oscillator. Extra options: f, f2 (glide to, over `glide` s), type, det (cents), vib [rate Hz, depth Hz].
    function osc(t0, o) {
      const t = at(t0), d = o.d || 0.3, s = ac.createOscillator(), g = ac.createGain();
      s.type = o.type || 'sine';
      s.frequency.setValueAtTime(o.f, t);
      if (o.f2) s.frequency.exponentialRampToValueAtTime(o.f2, t + (o.glide || d));
      if (o.det) s.detune.value = o.det;
      if (o.vib) {
        const l = ac.createOscillator(), lg = ac.createGain();
        l.frequency.value = o.vib[0]; lg.gain.value = o.vib[1];
        l.connect(lg); lg.connect(s.frequency); l.start(t); l.stop(t + d + 0.1);
      }
      envelope(g, t, o);
      filt(s, t, o).connect(g); out(g, t, o);
      s.start(t); s.stop(t + d + 0.1);
    }
    function noise(t0, o) {
      o = Object.assign({ a: 0.002, d: 0.2 }, o);
      const t = at(t0), s = ac.createBufferSource(), g = ac.createGain();
      s.buffer = nbuf; s.loop = true;
      envelope(g, t, o);
      filt(s, t, o).connect(g); out(g, t, o);
      s.start(t, Math.random() * 0.5); s.stop(t + o.d + 0.05);
    }
    // FM: a sine wobbled by another at ratio × f; the wobble dies before the note does, so it starts bright and
    // mellows. ratio 3.5 ≈ tubular bell, 4 ≈ marimba / vibraphone, 7 ≈ celesta.
    function fm(t0, f, o) {
      o = Object.assign({ a: 0.002, d: 1 }, o);
      const t = at(t0), c = ac.createOscillator(), m = ac.createOscillator(), mg = ac.createGain(), g = ac.createGain();
      c.frequency.value = f; m.frequency.value = f * (o.ratio || 3.5);
      const I = f * (o.index || 1.5);
      mg.gain.setValueAtTime(I, t); mg.gain.exponentialRampToValueAtTime(Math.max(0.5, I * 0.03), t + o.d * 0.5);
      m.connect(mg); mg.connect(c.frequency);
      envelope(g, t, o);
      c.connect(g); out(g, t, o);
      c.start(t); m.start(t); c.stop(t + o.d + 0.1); m.stop(t + o.d + 0.1);
    }
    // Struck brass (a temple ghanti): inharmonic partials, each a slightly detuned pair so it shimmers,
    // a low hum, and the clapper's tick.
    const BRASS = [[1, 1, 1], [2.02, 0.5, 0.75], [2.76, 0.42, 0.6], [4.07, 0.3, 0.45], [5.4, 0.2, 0.3], [6.85, 0.12, 0.2]];
    function brass(t0, f, o) {
      const v = o.v || 0.1, d = o.d || 3, rev = o.rev == null ? 0.45 : o.rev;
      BRASS.forEach(([r, amp, len]) => [-1, 1].forEach(sg =>
        osc(t0, { f: f * r + sg * rnd(0.8, 2.2), v: v * amp / 2, a: 0.002, d: d * len, pan: o.pan, rev, dest: o.dest })));
      osc(t0, { f: f * 0.5, v: v * 0.25, a: 0.01, d: d * 0.8, rev: 0.3, dest: o.dest });
      noise(t0, { d: 0.03, v: v * 0.8, bp: Math.min(f * 6, 9000), q: 2, pan: o.pan, dest: o.dest });
    }
    // Plucked / hammered string (Karplus–Strong), rendered once per pitch: santoor.
    function pluck(t0, f, o) {
      const key = Math.round(f);
      let buf = strings[key];
      if (!buf) {
        const sr = ac.sampleRate, len = Math.floor(sr * 1.8), N = Math.max(2, Math.round(sr / f));
        const k = Math.pow(0.001, 1 / (f * 1.6));   // fades to -60 dB in about 1.6 s
        buf = ac.createBuffer(1, len, sr);
        const y = buf.getChannelData(0);
        for (let i = 0; i < N; i++) y[i] = Math.random() * 2 - 1;
        y[N] = y[0];
        for (let i = N + 1; i < len; i++) y[i] = k * (0.6 * y[i - N] + 0.4 * y[i - N - 1]);
        strings[key] = buf;
      }
      const t = at(t0), s = ac.createBufferSource(), g = ac.createGain();
      s.buffer = buf; g.gain.value = o.v || 0.2;
      s.connect(g); out(g, t, o); s.start(t);
    }
    // Hand drum: a sine that drops in pitch (the skin) plus a slap of filtered noise (the hand).
    function drum(t0, f, f2, o) {
      osc(t0, { f, f2, glide: o.glide || 0.12, v: o.v || 0.6, a: 0.002, d: o.d || 0.35, pan: o.pan, rev: o.rev || 0.08, dest: o.dest });
      noise(t0, { d: o.sd || 0.05, v: o.slap || 0.15, bp: o.sf || 1500, q: 1.2, pan: o.pan, dest: o.dest });
    }
    const dagga = (t0, v) => drum(t0, 118, 52, { v: (v || 1) * 0.75, d: 0.42, slap: (v || 1) * 0.12, sf: 600, pan: -0.15 });
    const tilli = (t0, v) => drum(t0, 520, 400, { v: (v || 1) * 0.22, d: 0.12, slap: (v || 1) * 0.22, sf: 3200, pan: 0.25, glide: 0.05 });
    // One bar of the bhangra chaal (D..hD.h.), 0.7 s, so it can repeat every 0.85 s.
    function dhol(t0) { dagga(t0); tilli(t0, 0.5); tilli(t0 + 0.3); dagga(t0 + 0.4); tilli(t0 + 0.5, 0.4); tilli(t0 + 0.6); }
    // Two bars of the chaal and a roll into a big closing beat (about 2.2 s): the dhol has started.
    function dholGroove(t0) {
      Array.from('D..hD.h.D..hDhh.').forEach((c, i) => {
        const tt = t0 + i * 0.1;
        if (c === 'D') { dagga(tt); tilli(tt, 0.4); } else if (c === 'h') tilli(tt); else if (i % 2 === 0) tilli(tt, 0.3);
      });
      [0, 0.06, 0.12, 0.18].forEach((x, i) => tilli(t0 + 1.6 + x, 0.5 + i * 0.15));
      dagga(t0 + 1.84, 1.2); tilli(t0 + 1.84, 1.2);
    }
    // Ghungroo: a shake of tiny bells.
    function ghungroo(t0, o) {
      const n = o.n || 16, d = o.d || 0.5, v = o.v || 0.05;
      for (let i = 0; i < n; i++) {
        const tt = t0 + d * Math.pow(i / n, 1.6) + rnd(0, 0.02), f = rnd(3800, 6800), p = rnd(-0.5, 0.5);
        osc(tt, { f, v: v * (1 - i / n * 0.6), a: 0.001, d: rnd(0.06, 0.16), pan: p, rev: 0.25, dest: o.dest });
        osc(tt, { f: f * 1.47, v: v * 0.3, a: 0.001, d: 0.05, pan: p, dest: o.dest });
      }
      noise(t0, { a: 0.01, d: d * 0.6, v: v * 1.2, hp: 6000, dest: o.dest });
    }
    // Shehnai: a reedy sawtooth with vibrato that slides into each note (meend). notes: [[Hz, start, length], ...]
    function shehnai(t0, notes, v) {
      notes.forEach(([f, s, l], i) => {
        const from = i ? notes[i - 1][0] : f * 0.97;
        osc(t0 + s, { f: from, f2: f, glide: 0.06, type: 'sawtooth', v: v || 0.05, a: 0.03, hold: Math.max(0.01, l - 0.08),
          d: l + 0.12, vib: [5.5, f * 0.012], lp: 2600, q: 3, rev: 0.35 });
      });
    }

    // Sa Re Ga Pa Dha (C pentatonic), two octaves from C5.
    const SA = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51, 1567.98, 1760];
    const santoorRun = (t0, idx, v) => idx.forEach((k, i) => pluck(t0 + i * 0.075, SA[k], { v: v || 0.3, pan: -0.4 + (i / idx.length) * 0.8, rev: 0.35 }));
    const base = {
      tap: () => { osc(0, { f: rnd(1500, 1700), f2: 900, v: 0.1, d: 0.05, rev: 0.05 }); noise(0, { d: 0.015, v: 0.05, bp: 3000, q: 2 }); },
      pop: () => osc(0, { f: rnd(360, 420), f2: 1150, glide: 0.07, v: 0.22, d: 0.13, rev: 0.12 }),
      chime: () => { fm(0, 1318.51, { ratio: 3.5, index: 1.2, v: 0.12, d: 1.6, pan: -0.25, rev: 0.45 }); fm(0.16, 987.77, { ratio: 3.5, index: 1.2, v: 0.12, d: 2, pan: 0.25, rev: 0.45 }); },
      ding: () => { fm(0, 1760, { ratio: 2.01, index: 0.8, v: 0.11, d: 0.9, rev: 0.35 }); osc(0, { f: 5280, v: 0.015, d: 0.25 }); },
      bell: () => brass(0, rnd(600, 660), { v: 0.12, d: 3 }),
      dhol: () => dhol(0),
      success: () => { santoorRun(0, [0, 1, 2, 3, 5]); fm(0.42, 2093, { ratio: 7, index: 0.4, v: 0.04, d: 1.2, rev: 0.6 }); },
      whoosh: () => noise(0, { a: 0.22, d: 0.6, v: 0.28, bp: 300, to: 2800, q: 1.2, pan: -0.6, pan2: 0.6, rev: 0.25 }),
      splash: () => {
        noise(0, { d: 0.32, v: 0.32, lp: 2600, to: 300 });
        for (let i = 0; i < 4; i++) { const f = rnd(700, 1100); osc(rnd(0.02, 0.18), { f, f2: f * 1.8, v: 0.06, d: 0.06 }); }
      },
      // dholak bols
      dha: () => { dagga(0); tilli(0, 0.8); },
      dhin: () => { dagga(0, 0.8); drum(0, 330, 300, { v: 0.2, d: 0.5, slap: 0.1, sf: 2500, pan: 0.2, glide: 0.3 }); },
      na: () => drum(0, 720, 660, { v: 0.24, d: 0.28, slap: 0.26, sf: 4200, pan: 0.25, glide: 0.2 }),
    };
    const swipe = () => noise(0, { a: 0.06, d: 0.25, v: 0.2, bp: 900, to: 4500, q: 1.4, pan: -0.3, pan2: 0.3 });
    const square = (t0, f, v, hold, o) => osc(t0, Object.assign({ f, type: 'square', v, hold, d: hold + 0.06, lp: 5000 }, o));
    const themes = {
      metro: {
        tap: () => square(0, 1250, 0.035, 0.06, { lp: 3000 }),                          // card reader beep
        chime: () => { square(0, 1000, 0.03, 0.08, { lp: 3000 }); [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => fm(0.18 + i * 0.13, f, { ratio: 4, index: 0.6, v: 0.09, d: 1, rev: 0.35 })); },
        ding: () => [783.99, 659.25, 523.25].forEach((f, i) => fm(i * 0.22, f, { ratio: 4, index: 0.7, v: 0.11, d: 0.9, rev: 0.3 })),   // doors chime
        pop: () => { noise(0, { d: 0.02, v: 0.15, hp: 2000 }); fm(0.02, 1046.5, { ratio: 4, index: 0.6, v: 0.08, d: 0.6, rev: 0.3 }); fm(0.17, 1318.51, { ratio: 4, index: 0.6, v: 0.08, d: 0.8, rev: 0.3 }); },
        announce: () => { fm(0, 659.25, { ratio: 3.5, index: 0.9, v: 0.09, d: 1.2, rev: 0.4 }); fm(0.3, 523.25, { ratio: 3.5, index: 0.9, v: 0.09, d: 1.4, rev: 0.4 }); },
        whoosh: () => {                                                                    // a train pulling in / out
          noise(0, { a: 0.6, d: 1.8, v: 0.35, lp: 160, to: 700, q: 0.7 });
          noise(0.2, { a: 0.5, d: 1.3, v: 0.16, bp: 500, to: 2200, q: 1, pan: -0.8, pan2: 0.8 });
          [0.35, 0.47, 0.8, 0.92, 1.25, 1.37].forEach(t => noise(t, { d: 0.03, v: 0.08, bp: 1800, q: 2 }));
        },
        success: () => [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((f, i) => fm(i * 0.12, f, { ratio: 4, index: 0.6, v: 0.09, d: 1.4, rev: 0.4 })),
      },
      chat: {
        tap: () => { noise(0, { d: 0.012, v: 0.1, hp: 3500 }); osc(0, { f: rnd(2300, 2700), v: 0.02, d: 0.02 }); },
        pop: () => { osc(0, { f: 600, f2: 1350, glide: 0.04, v: 0.2, d: 0.09 }); osc(0.035, { f: 1800, v: 0.03, d: 0.05 }); },
        chime: () => { fm(0, 1046.5, { ratio: 4, index: 0.8, v: 0.11, d: 0.7, rev: 0.25 }); fm(0.11, 1567.98, { ratio: 4, index: 0.8, v: 0.1, d: 0.9, rev: 0.25 }); },
        whoosh: swipe,
      },
      cassette: {
        tap: () => { osc(0, { f: 170, f2: 80, v: 0.3, d: 0.08 }); noise(0, { d: 0.035, v: 0.22, lp: 1800 }); noise(0.045, { d: 0.012, v: 0.07, hp: 4000 }); },
        pop: () => { noise(0, { d: 0.02, v: 0.18, hp: 1500 }); osc(0.01, { f: 900, f2: 420, type: 'triangle', v: 0.05, d: 0.18, vib: [32, 60] }); },
        whoosh: () => { osc(0, { f: 260, f2: 1100, glide: 0.7, type: 'sawtooth', v: 0.035, a: 0.05, d: 0.8, lp: 2200 }); noise(0, { a: 0.1, d: 0.8, v: 0.06, bp: 2500 }); },
      },
      tracker: {
        pop: () => osc(0, { f: 900, f2: 1400, glide: 0.03, v: 0.12, d: 0.07 }),
        ding: () => { fm(0, 1567.98, { ratio: 2, index: 0.5, v: 0.1, d: 0.6, rev: 0.2 }); fm(0.08, 2093, { ratio: 2, index: 0.5, v: 0.08, d: 0.8, rev: 0.25 }); },
        success: () => { [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => fm(i * 0.09, f, { ratio: 4, index: 0.9, v: 0.12, d: 0.8, rev: 0.3 })); ghungroo(0.36, { n: 10, d: 0.35, v: 0.035 }); },
        whoosh: swipe,
      },
      haldi: {
        splash: () => { noise(0, { d: 0.16, v: 0.3, lp: 1400, to: 240, q: 3 }); const f = rnd(450, 650); osc(rnd(0.02, 0.06), { f, f2: f * 2.4, glide: 0.04, v: 0.08, d: 0.06 }); },
        success: () => { base.success(); ghungroo(0.1, { n: 18, d: 0.6, v: 0.045 }); },
      },
      diya: {
        splash: () => {                                    // a matchstick scraped along the box, then the flame catching
          for (let i = 0; i < 7; i++) noise(i * 0.022 + rnd(0, 0.01), { d: 0.03, v: rnd(0.12, 0.25), bp: rnd(2500, 4500), q: 1.5 });
          noise(0.16, { a: 0.04, d: 0.6, v: 0.34, lp: 350, to: 1500, q: 0.7, rev: 0.15 });
          noise(0.16, { a: 0.05, d: 0.9, v: 0.05, bp: 5000, q: 0.5 });
          for (let i = 0; i < 6; i++) noise(0.3 + rnd(0, 0.9), { d: 0.008, v: rnd(0.03, 0.08), hp: 3000 });
        },
        bell: () => { const f = rnd(590, 640); brass(0, f, { v: 0.13, d: 3.4, rev: 0.55 }); brass(0.55, f, { v: 0.08, d: 3, rev: 0.55 }); },   // the temple bell, rung twice
        chime: () => brass(0, rnd(980, 1100), { v: 0.06, d: 1.8 }),
      },
      mehendi: {
        tap: () => noise(0, { d: 0.05, v: 0.2, bp: rnd(2000, 2800), q: 0.7 }),
        chime: () => santoorRun(0, [5, 3, 2, 1, 0, 2, 3, 5], 0.26),
        dhol: () => { dhol(0); ghungroo(0.4, { n: 10, d: 0.3, v: 0.035 }); },
        success: () => { dholGroove(0); ghungroo(1.84, { n: 18, d: 0.6, v: 0.045 }); santoorRun(1.9, [0, 2, 3, 5, 7], 0.24); },   // found him: the dhol starts up
        whoosh: () => noise(0, { a: 0.12, d: 0.4, v: 0.14, bp: 1200, to: 3500, q: 0.8, pan: 0.4, pan2: -0.4 }),
      },
      stars: {
        tap: () => fm(0, rnd(2400, 2800), { ratio: 3, index: 0.4, v: 0.07, d: 0.35, rev: 0.5 }),
        pop: () => osc(0, { f: 480, f2: 900, glide: 0.08, v: 0.14, d: 0.2, rev: 0.45 }),
        chime: () => [5, 7, 9, 8, 6].forEach((k, i) => fm(i * 0.07, SA[k] * 1.5, { ratio: 7, index: 0.35, v: 0.06, d: 1.2, pan: rnd(-0.6, 0.6), rev: 0.65 })),
        ding: () => { fm(0, 2093, { ratio: 7, index: 0.3, v: 0.07, d: 1, rev: 0.6 }); fm(0.09, 3136, { ratio: 7, index: 0.3, v: 0.05, d: 1, rev: 0.6 }); },
        bell: () => { [261.63, 392, 659.25].forEach(f => osc(0, { f, type: 'triangle', v: 0.035, a: 0.5, d: 3, rev: 0.7, det: rnd(-6, 6) })); fm(0, 1046.5, { ratio: 3.5, index: 0.8, v: 0.06, d: 2.5, rev: 0.7 }); },
        whoosh: () => { noise(0, { a: 0.5, d: 1.4, v: 0.22, bp: 200, to: 1600, q: 1, pan: -0.5, pan2: 0.5, rev: 0.6 }); osc(0, { f: 90, f2: 45, v: 0.12, a: 0.3, d: 1.4 }); },
        success: () => SA.forEach((f, i) => fm(i * 0.08, f, { ratio: 7, index: 0.35, v: 0.06, d: 1.6, pan: -0.5 + i * 0.1, rev: 0.6 })),
      },
      claw: {                                              // arcade machine (the festive reveals keep the shared bell / chime / dhol)
        tap: () => square(0, 880, 0.07, 0.015),
        pop: () => osc(0, { f: 440, f2: 1320, glide: 0.06, type: 'square', v: 0.08, d: 0.1, lp: 4000 }),
        ding: () => { square(0, 987.77, 0.045, 0.06); square(0.07, 1318.51, 0.045, 0.3); },          // coin
        success: () => {
          [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98].forEach((f, i) => square(i * 0.065, f, 0.04, 0.05));
          [1046.5, 1318.51, 1567.98].forEach(f => square(0.42, f, 0.022, 0.3, { lp: 4000 }));
          osc(0.42, { f: 261.63, type: 'triangle', v: 0.12, hold: 0.3, d: 0.6 });
        },
        whoosh: () => { osc(0, { f: 110, f2: 150, type: 'sawtooth', v: 0.06, a: 0.05, hold: 0.4, d: 0.65, lp: 900, vib: [16, 8] }); noise(0, { a: 0.05, hold: 0.4, d: 0.65, v: 0.05, lp: 500 }); },
      },
      escape: {
        tap: () => { osc(0, { f: rnd(850, 950), f2: 600, type: 'triangle', v: 0.16, d: 0.045 }); noise(0, { d: 0.02, v: 0.08, bp: 1800, q: 3 }); },   // wooden click
        pop: () => { pluck(0, 783.99, { v: 0.28, rev: 0.25 }); pluck(0.07, 1174.66, { v: 0.24, rev: 0.25 }); },                              // picked something up
        chime: () => [3, 5, 7].forEach((k, i) => fm(i * 0.08, SA[k], { ratio: 7, index: 0.4, v: 0.07, d: 1.1, rev: 0.5 })),
        success: () => {                                   // puzzle solved: a shehnai phrase (Ga Pa Dha Pa Ga Re Sa)
          shehnai(0, [[550, 0, 0.18], [660, 0.18, 0.18], [733.3, 0.36, 0.3], [660, 0.66, 0.2], [550, 0.86, 0.2], [495, 1.06, 0.2], [440, 1.26, 0.6]], 0.08);
          ghungroo(1.26, { n: 10, d: 0.35, v: 0.03 });
        },
        whoosh: () => { noise(0, { a: 0.2, d: 0.8, v: 0.3, lp: 250, to: 900 }); osc(0, { f: 60, f2: 45, v: 0.15, a: 0.1, d: 0.8 }); },     // a heavy door
      },
      patrika: { tap: () => fm(0, 1318.51, { ratio: 3.5, index: 1, v: 0.06, d: 0.8, rev: 0.4 }) },
    };

    /* -- speech: parts [{ text, lang: 'hi' | 'en' }] are spoken in order; a part with no voice for its language on
          this device is skipped. A new call cuts off the last one. -- */
    const speech = root.speechSynthesis;
    let voices = [], sayId = 0;
    function loadVoices() { try { voices = speech.getVoices() || []; } catch (e) { voices = []; } }
    if (speech) { loadVoices(); try { speech.addEventListener('voiceschanged', loadVoices); } catch (e) { speech.onvoiceschanged = loadVoices; } }
    function voiceFor(lang) {
      if (!voices.length) loadVoices();
      const want = lang === 'hi' ? [/^hi[-_]IN/i, /^hi/i] : [/^en[-_]IN/i, /^en[-_]GB/i, /^en/i];
      const female = /female|heera|kalpana|swara|lekha|veena|neerja|google/i;
      for (const re of want) {
        const m = voices.filter(v => re.test(v.lang));
        if (m.length) return m.find(v => female.test(v.name)) || m[0];
      }
      return null;
    }
    function hush() { sayId++; try { if (speech) speech.cancel(); } catch (e) { /* ignore */ } }

    function unlock() {
      unlocked = true; ctxA();
      // iOS only lets a page speak after it has spoken once inside a tap.
      if (speech && theme === 'metro') try { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; speech.speak(u); } catch (e) { /* ignore */ }
    }
    ['pointerdown', 'keydown', 'touchstart'].forEach(t => root.addEventListener(t, unlock, { once: true, capture: true }));
    return {
      play(name) {
        if (muted || !unlocked || Invite.isStatic) return;
        const p = (themes[theme] && themes[theme][name]) || base[name];
        if (!p) return;
        try { if (ctxA()) p(); } catch (e) { /* audio unavailable */ }
      },
      say(parts, delayMs) {
        if (!speech || muted || !unlocked || Invite.isStatic) return;
        hush();
        const id = sayId;
        setTimeout(() => {
          if (id !== sayId || muted) return;
          try {
            parts.forEach(p => {
              const vo = p.text && voiceFor(p.lang);
              if (!vo) return;
              const u = new SpeechSynthesisUtterance(p.text);
              u.voice = vo; u.lang = vo.lang; u.rate = 0.95; u.pitch = 1.05;
              speech.speak(u);
            });
          } catch (e) { /* speech unavailable */ }
        }, delayMs || 60);
      },
      hush,
      setTheme(id) { theme = id || ''; },
      // The shared audio graph, for a variant that makes its own music (cassette): { ac, input, hall, kit } or
      // null. kit holds the instruments above; they take t0 in seconds from now and a `dest` node.
      graph() { return ctxA() ? { ac, input: bus, hall, kit: { osc, noise, fm, pluck, drum, brass, ghungroo } } : null; },
      get muted() { return muted; },
      setMuted(v) {
        muted = !!v;
        if (muted) hush();
        try { localStorage.setItem('invite-muted', muted ? '1' : '0'); } catch (e) { /* storage blocked */ }
      },
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

  /* ---------- Hindi wording (the patrika card and the studio's Hindi message) ---------- */
  const DOW_HI = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
  const MON_HI = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
  const hindi = {
    // 'शनिवार, 28 नवंबर 2026' (short: without the year)
    date(iso, short) {
      const [y, m, d] = iso.split('-').map(Number);
      return `${DOW_HI[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]}, ${d} ${MON_HI[m - 1]}${short ? '' : ' ' + y}`;
    },
    // 'सायं 7:00 बजे'; a phrase time (Vidaai) uses timeHi
    time(ev) {
      if (!ev.start) return ev.timeHi || ev.time;
      const [h, m] = ev.start.split(':').map(Number);
      const part = h < 12 ? 'प्रातः' : h < 16 ? 'दोपहर' : h < 20 ? 'सायं' : 'रात्रि';
      return `${part} ${(h % 12) || 12}:${String(m).padStart(2, '0')} बजे`;
    },
    // Hindi placeFull for a decorated event
    place(ev) {
      const v = ev.venueInfo.hi;
      if (!v) return ev.placeFull;
      if (!ev.spot) return `${v.name}, ${v.area}`;
      return `${ev.spotHi || ev.spot}, ${v.short}, ${v.area.split(',').pop().trim()}`;
    },
  };

  /* ---------- markup helpers ---------- */
  function directionsHTML(ev, label) {
    return `<a class="inv-btn inv-dir" href="${esc(ev.venueInfo.map)}" target="_blank" rel="noopener">${esc(label || (Invite.lang === 'hi' ? 'रास्ता देखें' : 'Directions'))}</a>`;
  }
  function calendarButtonHTML(label) {
    return `<button type="button" class="inv-btn inv-cal" data-inv-cal>${esc(label || (Invite.lang === 'hi' ? 'कैलेंडर में जोड़ें' : 'Add to calendar'))}</button>`;
  }
  function timeHTML(e) {
    return e.isTimeText ? `<i>${esc(e.time)}</i>` : esc(e.time);
  }

  // Hindi details block: same markup and classes as the English one, Hindi word order.
  function summaryHi(ctx, opts) {
    const P = ctx.P;
    const head = opts.heading === false ? '' : `
      <header class="inv-sum-head">
        <p class="inv-sum-kicker">${esc(ctx.occasion.title)}</p>
        <p class="inv-sum-bless"><span class="inv-name">${esc(P.blessings)}</span><br>के आशीर्वाद से</p>
        <p class="inv-sum-hosts"><span class="inv-name">${esc(P.groomParents)}</span></p>
        <p class="inv-sum-line">${esc(ctx.occasion.line)}</p>
        <h2 class="inv-sum-couple"><span>${esc(P.groom)}</span><em>संग</em><span>${esc(P.bride)}</span></h2>
        <p class="inv-sum-bride">सुपुत्री <span class="inv-name">${esc(P.brideParents)}</span></p>
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
              ${e.dress ? `<span class="inv-sum-note">वेशभूषा: ${esc(e.dress)}</span>` : ''}
            </div>
            ${ctx.isStatic ? '' : directionsHTML(e)}
          </div>`).join('')}
      </section>`).join('');
    const foot = opts.footer === false ? '' : `
      <footer class="inv-sum-foot">
        <p class="inv-sum-love">सप्रेम,<br><span class="inv-name">${esc(P.hosts)}</span></p>
        <p class="inv-sum-addr">${esc(P.address)}</p>
        <p class="inv-sum-phones">${P.phones.map(p => `<a class="inv-sum-phone" href="tel:+91${esc(p)}"><span aria-hidden="true">📞</span> ${esc(p.replace(/^(\d{5})(\d{5})$/, '$1 $2'))}</a>`).join('')}</p>
      </footer>`;
    const cal = ctx.isStatic ? '' : `<div class="inv-sum-actions">${calendarButtonHTML()}</div>`;
    return `<div class="inv-sum inv-sum-hi" lang="hi">${head}${days}${cal}${foot}</div>`;
  }

  function makeSummary(ctx) {
    return function summaryHTML(opts) {
      opts = opts || {};
      const P = ctx.P;
      if (ctx.hi) return summaryHi(ctx, opts);
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
          <p class="inv-sum-love">With love,<br><span class="inv-name">${esc(P.hosts)}</span></p>
          <p class="inv-sum-addr">${esc(P.address)}</p>
          <p class="inv-sum-phones">${P.phones.map(p => `<a class="inv-sum-phone" href="tel:+91${esc(p)}"><span aria-hidden="true">📞</span> ${esc(p.replace(/^(\d{5})(\d{5})$/, '$1 $2'))}</a>`).join('')}</p>
        </footer>`;
      const cal = ctx.isStatic ? '' : `<div class="inv-sum-actions">${calendarButtonHTML()}</div>`;
      return `<div class="inv-sum">${head}${days}${cal}${foot}</div>`;
    };
  }

  /* ---------- public API ---------- */
  const registry = {};
  const Invite = {
    data: D, esc, decorate, groupByDay, occasionFor, buildIcs, sound, art, ganeshBlockHTML, hindi,
    isStatic: false, lang: 'en',

    register(id, impl) { registry[id] = impl; },

    groupFor(code) {
      return D.GROUPS.find(g => g.code === code) || D.GROUPS.find(g => g.n === D.DEFAULT_GROUP);
    },

    fromLocation(loc) {
      loc = loc || root.location;
      const q = new URLSearchParams(loc.search);
      // Hosted links are /<variant>?i=… (one page per variant, so WhatsApp shows that card's preview).
      // An unknown page name such as "invite" falls back to the group's own variant in start().
      // A "-hi" page (/metro-hi) or ?lang=hi opens the Hindi version of the card.
      const page = loc.pathname.split('/').pop().replace(/\.html$/, '');
      const lang = q.get('lang') || (/-hi$/.test(page) ? 'hi' : 'en');
      return { code: q.get('i') || '', guest: (q.get('to') || '').trim().slice(0, 80), variant: q.get('t') || page.replace(/-hi$/, ''),
        img: q.get('img') === '1', lang: lang === 'hi' ? 'hi' : 'en' };
    },

    buildCtx(opts) {
      const group = Invite.groupFor(opts.code);
      const hi = opts.lang === 'hi';
      Invite.lang = hi ? 'hi' : 'en';
      const events = group.events.map(n => decorate(D.EVENTS.find(e => e.n === n), hi));
      const occ = occasionFor(group.events);
      const ctx = {
        group, events, days: groupByDay(events),
        guest: opts.guest || '',
        hi, lang: Invite.lang, t: (en, h) => (hi ? h : en),
        greeting: hi ? (opts.guest ? 'आदरणीय ' + opts.guest : 'आदरणीय परिवारजन एवं मित्रगण')
          : opts.guest ? 'Dear ' + opts.guest : 'Dear Family & Friends',
        occasion: hi ? Object.assign({}, occ, { title: occ.titleHi, line: occ.lineHi, en: occ }) : occ,
        P: hi ? Object.assign({}, D.PEOPLE, D.PEOPLE.hi, { en: D.PEOPLE }) : D.PEOPLE, T: D.TEXT,
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
      const known = D.VARIANTS.some(v => v.id === opts.variant);
      const id = known ? opts.variant : Invite.groupFor(opts.code).variant;
      if (id === 'patrika') opts = Object.assign({}, opts, { lang: 'hi' });   // the plain Hindi card is always Hindi
      const ctx = Invite.buildCtx(opts);
      Invite.isStatic = ctx.isStatic;
      sound.setTheme(id);
      document.documentElement.classList.add('v-' + id);
      if (ctx.hi) {
        document.documentElement.lang = 'hi';
        document.documentElement.classList.add('lang-hi');
        const f = document.createElement('link');
        f.rel = 'stylesheet'; f.href = 'hindi-fonts.css';
        document.head.appendChild(f);
      }
      if (ctx.isStatic) {
        document.documentElement.classList.add('img');
        // The image renderer reads this (via --dump-dom) to size the screenshot to the content.
        setInterval(() => document.documentElement.setAttribute('data-height',
          Math.ceil(Math.max(document.documentElement.scrollHeight, document.body.scrollHeight))), 250);
      }
      if (ctx.hi) document.title = `${ctx.P.groom} संग ${ctx.P.bride}` + (ctx.guest ? ` · ${ctx.guest} के लिए` : '');
      else if (ctx.guest) document.title = `${D.PEOPLE.groom} & ${D.PEOPLE.bride} · for ${ctx.guest}`;

      // One delegated handler for every "Add to calendar" button any variant renders.
      mount.addEventListener('click', e => {
        // The calendar file keeps the English names and places so map apps can find them.
        if (e.target.closest('[data-inv-cal]')) { sound.play('ding'); Invite.downloadIcs(ctx.events.map(ev => Object.assign({}, ev, ev.en))); }
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
