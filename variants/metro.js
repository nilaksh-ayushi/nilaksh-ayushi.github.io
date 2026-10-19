/* Shaadi Metro — touch in, ride the Nilaksh & Ayushi Line, one station per invited function.
   Signature variant for group 3. Works for any group (1..n events, any dates). */
(function () {
  'use strict';
  // Minimal Ganesh doodle (shared art from core.js), shown right after "Shri Ganeshay Namah".
  const GANESH = () => (window.Invite && Invite.art && Invite.art.ganesh) ? Invite.art.ganesh({ size: 44, className: 'metro-ganesh-art' }) : '';

  // Line colour per day. Any other date gets a spare line (violet, then green, ...).
  const FIXED = {
    '2026-12-02': { en: 'Pink Line', hi: 'गुलाबी लाइन', c: '#E4007C', ink: '#fff', tx: '#C2006A' },
    '2026-12-03': { en: 'Yellow Line', hi: 'पीली लाइन', c: '#FFCB05', ink: '#1b1b1b', tx: '#8A6400' },
    '2026-12-04': { en: 'Blue Line', hi: 'नीली लाइन', c: '#0D63B6', ink: '#fff', tx: '#0D63B6' },
  };
  const SPARE = [
    { en: 'Violet Line', hi: 'बैंगनी लाइन', c: '#7A2E9C', ink: '#fff', tx: '#7A2E9C' },
    { en: 'Green Line', hi: 'हरी लाइन', c: '#00A651', ink: '#fff', tx: '#00783A' },
    { en: 'Magenta Line', hi: 'मैजेंटा लाइन', c: '#B0126B', ink: '#fff', tx: '#B0126B' },
    { en: 'Grey Line', hi: 'ग्रे लाइन', c: '#6B7380', ink: '#fff', tx: '#4F5661' },
  ];
  const HI_MON = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
  const EN_MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const HEA_HI = 'हैप्पिली एवर आफ़्टर';

  const ICON_TAP = '<svg class="metro-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M7 8.5a5 5 0 0 1 0 7"/><path d="M11 6a8.5 8.5 0 0 1 0 12"/><path d="M15 3.5a12 12 0 0 1 0 17"/></svg>';
  const LOGO = '<svg class="metro-logo" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="19" fill="#151a24"/><circle cx="20" cy="20" r="17.2" fill="none" stroke="#fff" stroke-opacity=".18"/><circle cx="16" cy="22" r="7" fill="none" stroke="#FFCB05" stroke-width="2.8"/><circle cx="24" cy="22" r="7" fill="none" stroke="#E4007C" stroke-width="2.8"/><path d="M24 9.6l2.3 2.6-2.3 2.6-2.3-2.6z" fill="#7fd3ff"/></svg>';

  function render(root, ctx) {
    const esc = ctx.esc, P = ctx.P, t = ctx.t, HI = ctx.hi;   // HI: Hindi version (?lang=hi), Hindi text only
    const AUTO = /[?&]auto=1(&|$)/.test(location.search);
    const RM = ctx.reducedMotion;

    // From this guest's events only: the hosted site never has the other groups' events.
    const spareDates = Array.from(new Set(ctx.events.map(e => e.date))).filter(d => !FIXED[d]).sort();
    const lineFor = date => FIXED[date] || SPARE[Math.max(0, spareDates.indexOf(date)) % SPARE.length];
    const hiDate = date => { const p = date.split('-').map(Number); return p[2] + ' ' + HI_MON[p[1] - 1]; };
    const enDate = date => { const p = date.split('-').map(Number); return p[2] + ' ' + EN_MON[p[1] - 1]; };
    const shortHi = ev => String(ev.hi || '').split(/,| एवं /)[0].trim();
    const short = ev => (HI ? shortHi(ev) : ev.name.split(/,| & | with /)[0].trim());
    const tiny = ev => short(ev).split(' ')[0];
    const lineVars = l => `--c:${l.c};--ink:${l.ink};--tx:${l.tx}`;
    const couple = `${P.groom} &amp; ${P.bride}`;
    const coupleLine = t(`${couple} Line`, `${P.groom}–${P.bride} लाइन`);
    const lineName = l => (HI ? l.hi : l.en);
    const evs = ctx.events, single = evs.length === 1;
    const hasBaraat = evs.some(e => e.id === 'baraat');

    const first = ctx.days[0], last = ctx.days[ctx.days.length - 1];
    const year = first.date.slice(0, 4);
    const valid = ctx.days.length === 1 ? `${+first.dd} ${first.mon} ${year}`
      : first.mon === last.mon ? `${+first.dd}–${+last.dd} ${last.mon} ${year}`
        : `${+first.dd} ${first.mon} – ${+last.dd} ${last.mon} ${year}`;

    // Route: origin, stations (with an interchange between days), terminus.
    const nodes = [{ type: 'origin', line: lineFor(first.date) }];
    let stCount = 0;
    ctx.days.forEach((d, di) => {
      if (di > 0) nodes.push({ type: 'ic', from: lineFor(ctx.days[di - 1].date), line: lineFor(d.date), day: d });
      d.events.forEach(ev => nodes.push({ type: 'stn', ev, line: lineFor(ev.date), k: ++stCount }));
    });
    nodes.push({ type: 'end', line: lineFor(last.date) });
    const segColor = i => (nodes[i + 1].type === 'stn' ? nodes[i + 1].line.c : nodes[i].line.c);
    const ruleGrad = ctx.days.length === 1 ? lineFor(first.date).c
      : `linear-gradient(90deg,${ctx.days.map((d, i) => {
        const a = (i / ctx.days.length * 100).toFixed(2), b = ((i + 1) / ctx.days.length * 100).toFixed(2);
        return `${lineFor(d.date).c} ${a}% ${b}%`;
      }).join(',')})`;

    if (ctx.isStatic) { renderPosterImpl(root, ctx, { lineFor, ruleGrad, enDate, hiDate, lineVars, short, coupleLine, lineName }); return; }

    /* ---------- timers ---------- */
    let timers = [];
    const later = (fn, ms) => { timers.push(setTimeout(fn, ms)); };
    const clearAll = () => { timers.forEach(clearTimeout); timers = []; };
    const T = ms => (RM ? Math.min(ms, 120) : ms);

    /* ---------- markup ---------- */
    root.innerHTML = `
      <div class="metro-app" style="--rule:${ruleGrad}">
        <button type="button" class="metro-skip">${t('Skip to details ↓', 'सीधे विवरण देखें ↓')}</button>

        <section class="metro-stage metro-s-card" data-s="card">
          <p class="metro-ganesh" lang="hi">${esc(ctx.T.ganeshShort)}</p>${GANESH()}
          <div class="metro-brand">${LOGO}<span>${t('<b>Shaadi Metro</b><i lang="hi">शादी मेट्रो</i>', '<b>शादी मेट्रो</b>')}</span></div>
          <div class="metro-card" aria-label="${t('Smart card for', 'स्मार्ट कार्ड:')} ${esc(ctx.greeting)}">
            <svg class="metro-card-art" viewBox="0 0 120 120" aria-hidden="true">
              <path d="M40 -10 C 70 40, 90 60, 140 70" stroke="#E4007C" stroke-width="10" fill="none"/>
              <path d="M58 -10 C 84 32, 100 46, 140 50" stroke="#FFCB05" stroke-width="10" fill="none"/>
              <path d="M76 -10 C 96 22, 110 30, 140 30" stroke="#0D63B6" stroke-width="10" fill="none"/>
            </svg>
            <div class="metro-card-top">${LOGO}<span>${t('<b>SHAADI METRO</b><i>Smart Card</i>', '<b>शादी मेट्रो</b><i>स्मार्ट कार्ड</i>')}</span>${ICON_TAP}</div>
            <p class="metro-card-k">${t('Card holder', 'कार्डधारक')}</p>
            <p class="metro-card-greet">${esc(ctx.greeting)}</p>
            <p class="metro-card-line"><span class="metro-roundel" style="--c:${lineFor(first.date).c}"></span>${coupleLine}</p>
            <div class="metro-card-foot"><span>${t('Valid', 'मान्य')} ${esc(valid)}</span><span>${t('Balance ∞ pyaar', 'बैलेंस ∞ प्यार')}</span></div>
          </div>
          <div class="metro-gate" aria-hidden="true">
            <div class="metro-cab metro-cab-l"><span class="metro-reader">${ICON_TAP}</span><span class="metro-light"></span></div>
            <div class="metro-pass"><span class="metro-flap metro-flap-l"></span><span class="metro-flap metro-flap-r"></span></div>
            <div class="metro-cab metro-cab-r"><span class="metro-light"></span></div>
          </div>
          <p class="metro-status" aria-live="polite">${t('Your card is ready. Touch in at the gate.', 'आपका कार्ड तैयार है। गेट पर कार्ड टच करें।')}</p>
          <button type="button" class="metro-cta metro-touch">${ICON_TAP}<span>${t('Touch in', 'टच करें')}</span></button>
        </section>

        <section class="metro-stage metro-s-platform" data-s="platform" hidden>
          <div class="metro-board" role="status">
            <div class="metro-board-top"><span>${t('PLATFORM 1', 'प्लेटफ़ॉर्म 1')}</span><span>${esc(first.dd)} ${esc(first.mon.toUpperCase())}</span></div>
            <div class="metro-board-dest" data-flip="SHAADI EXPRESS"></div>
            <div class="metro-board-dest2" data-flip="&rarr; HAPPILY EVER AFTER"></div>
            ${HI ? '' : `<div class="metro-board-hi" lang="hi">शादी एक्सप्रेस → ${HEA_HI}</div>`}
            ${single ? `<div class="metro-board-row">${t('EXPRESS · NON-STOP', 'एक्सप्रेस · नॉन-स्टॉप')}</div>`
              : `<div class="metro-board-row">${HI ? `${stCount} स्टेशन · ${ctx.days.length} दिन` : `${stCount} STOPS · ${ctx.days.length} ${ctx.days.length > 1 ? 'DAYS' : 'DAY'}`}</div>`}
            <div class="metro-board-eta">&nbsp;</div>
          </div>
          <p class="metro-sst">${t('*1 min in Shaadi Standard Time', '*शादी स्टैंडर्ड टाइम में 1 मिनट')}</p>
          <div class="metro-scene" aria-hidden="true">
            <div class="metro-car">
              <div class="metro-car-led">${t('SHAADI EXPRESS', 'शादी एक्सप्रेस')}</div>
              <div class="metro-garland"></div>
              <div class="metro-car-body">
                <span class="metro-win"></span>
                <span class="metro-door"><span class="metro-inside"><i></i><i></i><i></i></span><span class="metro-leaf metro-leaf-l"></span><span class="metro-leaf metro-leaf-r"></span></span>
                <span class="metro-win"></span>
              </div>
              <div class="metro-car-stripe"></div>
            </div>
            <div class="metro-gap-line"></div>
            <div class="metro-edge"></div>
            <div class="metro-floor"><span class="metro-gap">${t('MIND THE GAP 💍', 'दूरी का ध्यान रखें 💍')}</span></div>
          </div>
          <p class="metro-seat">${HI ? `<b>${esc(ctx.guest || 'आप')}</b> के लिए सीटें आरक्षित` : `Seats reserved for <b>${esc(ctx.guest || 'you')}</b>`}</p>
          <button type="button" class="metro-cta metro-board-btn" hidden><span>${t('Board the train', 'ट्रेन में सवार हों')}</span> ▸</button>
        </section>

        <section class="metro-stage metro-s-ride" data-s="ride" hidden>
          <div class="metro-cabin" aria-hidden="true"><span class="metro-bar"></span>
            ${'<span class="metro-grip"><i></i></span>'.repeat(7)}
          </div>
          <div class="metro-led metro-ann" aria-live="polite">
            <p class="metro-ann-hi" lang="hi"></p><p class="metro-ann-en"></p><p class="metro-ann-doors"></p>
          </div>
          <div class="metro-mapcard">
            <div class="metro-map-title"><b>${coupleLine}</b><span>${single ? t('Express service', 'एक्सप्रेस सेवा') : t('Route map', 'मार्ग मानचित्र')}</span></div>
            <div class="metro-map"><div class="metro-track"></div></div>
            <p class="metro-map-legend"><span>🏠 ${t('Gurgaon', 'गुड़गांव')}</span><span class="metro-legend-rule"></span><span>${t('Happily Ever After', HEA_HI)} ❤️</span></p>
          </div>
          <div class="metro-signwrap"></div>
          <div class="metro-controls">
            <span class="metro-progress"></span>
            <button type="button" class="metro-cta metro-next">${t('Next station ▸', 'अगला स्टेशन ▸')}</button>
          </div>
        </section>

        <section class="metro-stage metro-s-end" data-s="end" hidden></section>
      </div>`;

    const $ = s => root.querySelector(s);
    const app = $('.metro-app');
    const stages = Array.from(root.querySelectorAll('.metro-stage'));
    const skip = $('.metro-skip');

    function show(name) {
      stages.forEach(s => { s.hidden = s.dataset.s !== name; });
      app.dataset.stage = name;
      skip.hidden = name === 'end';
      window.scrollTo(0, 0);
    }
    skip.addEventListener('click', () => { clearAll(); showEnd(false); });
    show('card');

    /* ---------- 1. smart card + gate ---------- */
    const card = $('.metro-card'), gate = $('.metro-gate'), status = $('.metro-status'), touch = $('.metro-touch');
    let touched = false;
    function touchIn() {
      if (touched) return; touched = true;
      touch.disabled = true;
      const c = card.getBoundingClientRect(), r = $('.metro-reader').getBoundingClientRect();
      const dx = (r.left + r.width / 2) - (c.left + c.width / 2), dy = (r.top + r.height / 2) - (c.top + c.height / 2);
      card.style.transform = `translate(${dx}px, ${dy}px) scale(.36) rotate(-6deg)`;
      later(() => {
        gate.classList.add('is-ok');
        status.textContent = t('Beep! Welcome aboard ✓', 'बीप! आपका स्वागत है ✓');
        ctx.sound.play('chime');
      }, T(700));
      later(() => { gate.classList.add('is-open'); card.classList.add('is-gone'); }, T(1000));
      later(showPlatform, T(2100));
    }
    touch.addEventListener('click', touchIn);
    card.addEventListener('click', touchIn);

    /* ---------- 2. platform ---------- */
    const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    function flip(el, text, delay) {
      el.setAttribute('aria-label', text);
      if (RM || HI) { el.textContent = text; return; }   // Devanagari letters can't be flipped one code point at a time
      const chars = Array.from(text);
      el.innerHTML = chars.map(() => '<span aria-hidden="true">&nbsp;</span>').join('');
      const spans = Array.from(el.children), t0 = Date.now() + delay;
      const id = setInterval(() => {
        const now = Date.now() - t0;
        let done = true;
        spans.forEach((s, i) => {
          if (now < 0) { done = false; return; }
          if (now >= 260 + i * 45 || chars[i] === ' ') s.textContent = chars[i] === ' ' ? ' ' : chars[i];
          else { done = false; s.textContent = GLYPHS[(Math.random() * GLYPHS.length) | 0]; }
        });
        if (done) clearInterval(id);
      }, 55);
      timers.push(setTimeout(() => clearInterval(id), delay + 4000));
    }
    let platformShown = false;
    function showPlatform() {
      if (platformShown) return; platformShown = true;
      show('platform');
      const sec = $('.metro-s-platform'), eta = $('.metro-board-eta'), btn = $('.metro-board-btn');
      flip($('.metro-board-dest'), t('SHAADI EXPRESS', 'शादी एक्सप्रेस'), 150);
      flip($('.metro-board-dest2'), t('→ HAPPILY EVER AFTER', '→ ' + HEA_HI), 500);
      later(() => { eta.textContent = t('ARRIVING IN 1 MIN', '1 मिनट में आ रही है'); }, T(1300));
      later(() => { eta.textContent = t('ARRIVING IN 30 SEC', '30 सेकंड में आ रही है'); }, T(2100));
      later(() => { eta.textContent = t('ARRIVING NOW', 'ट्रेन आ रही है'); eta.classList.add('is-blink'); sec.classList.add('is-arriving'); ctx.sound.play('whoosh'); }, T(2800));
      later(() => { sec.classList.add('is-doors'); ctx.sound.play('ding'); }, T(4300));
      later(() => {
        btn.hidden = false; eta.textContent = t('NOW BOARDING', 'कृपया सवार हों'); eta.classList.remove('is-blink');
        if (!AUTO) btn.focus({ preventScroll: true });
        if (btn.scrollIntoView) btn.scrollIntoView({ block: 'nearest', behavior: RM ? 'auto' : 'smooth' });
      }, T(4700));
      if (AUTO) later(startRide, T(6200));
    }
    $('.metro-board-btn').addEventListener('click', startRide);

    /* ---------- 3. the ride ---------- */
    const track = $('.metro-track'), signwrap = $('.metro-signwrap'), nextBtn = $('.metro-next'), progress = $('.metro-progress');
    const annHi = $('.metro-ann-hi'), annEn = $('.metro-ann-en'), annDoors = $('.metro-ann-doors');
    const n = nodes.length, X = i => (i / (n - 1) * 100).toFixed(3) + '%';
    let up = true;
    track.innerHTML = nodes.slice(0, -1).map((nd, i) =>
      `<span class="metro-seg" style="left:${X(i)};width:${(100 / (n - 1)).toFixed(3)}%;background:${segColor(i)}"></span>`).join('') +
      nodes.map((nd, i) => {
        if (nd.type === 'origin') return `<span class="metro-node metro-node-origin" style="left:${X(i)}" title="${t('Gurgaon', 'गुड़गांव')}">🏠</span>`;
        if (nd.type === 'end') return `<span class="metro-node metro-node-end" style="left:${X(i)}" title="${t('Happily Ever After', HEA_HI)}">♥</span>`;
        if (nd.type === 'ic') return `<span class="metro-node metro-node-ic" style="left:${X(i)};--c1:${nd.from.c};--c2:${nd.line.c}" title="${t('Interchange', 'इंटरचेंज')}"></span>`;
        const cls = up ? 'metro-up' : 'metro-down'; up = !up;
        return `<span class="metro-node metro-node-stn" style="left:${X(i)};${lineVars(nd.line)}"><span class="metro-lbl ${cls}">${esc(tiny(nd.ev))}</span></span>`;
      }).join('') +
      `<span class="metro-train" style="left:${X(0)}"><i></i><i></i><i></i></span>`;
    const nodeEls = Array.from(track.querySelectorAll('.metro-node'));
    const train = track.querySelector('.metro-train');

    let cur = 0, busy = false, rideStarted = false;
    function startRide() {
      if (rideStarted) return; rideStarted = true;
      clearAll();
      show('ride');
      annHi.textContent = 'शादी एक्सप्रेस में आपका स्वागत है।';
      annEn.textContent = t('Welcome aboard the Shaadi Express.', '');
      annDoors.textContent = '';
      signwrap.innerHTML = welcomeHTML();
      paintControls();
      if (AUTO) later(next, T(2600));
    }

    function welcomeHTML() {
      const firstStn = nodes[1].ev;
      return `<article class="metro-sign metro-welcome metro-in">
        <p class="metro-welcome-k">${t('Seat reserved for', 'सीट आरक्षित')}</p>
        <p class="metro-welcome-g">${esc(ctx.greeting.replace(/^(Dear|आदरणीय)\s+/, ''))}</p>
        <p class="metro-welcome-t">${HI ? (single
          ? `यह <b>एक्सप्रेस सेवा</b> है, <b>${esc(short(firstStn))}</b> तक नॉन-स्टॉप।`
          : `${ctx.days.length} ${ctx.days.length > 1 ? 'दिनों' : 'दिन'} में ${stCount} स्टेशन, गुड़गांव से ${HEA_HI} तक।`) : single
          ? `This is an <b>Express service</b>, non-stop to <b>${esc(short(firstStn))}</b>.`
          : `${stCount} stations across ${ctx.days.length} ${ctx.days.length > 1 ? 'days' : 'day'}, from Gurgaon to Happily Ever After.`}</p>
        <div class="metro-sticker"><span class="metro-sticker-ico" aria-hidden="true">👩 👴 🕺</span><span>${HI
          ? `<b>आरक्षित सीटें</b>महिलाएँ · वरिष्ठ नागरिक · ${hasBaraat ? 'बाराती' : 'शादी के मेहमान'}`
          : `<b>Reserved seats</b>Ladies · Seniors · ${hasBaraat ? 'Baraatis' : 'Shaadi guests'}`}</span></div>
        <p class="metro-hint">${HI ? `<b>${single ? 'प्रस्थान' : 'अगला स्टेशन'}</b> दबाएँ या ← स्वाइप करें`
          : `Tap <b>${single ? 'Depart' : 'Next station'}</b> or swipe ← to ride`}</p>
      </article>`;
    }

    function stationHTML(nd) {
      const ev = nd.ev, l = nd.line, night = ev.isTimeText;
      const time = night && !HI
        ? `<dd><b>${esc(ev.time)}</b><span class="metro-sub">${ev.timeHi ? `<span lang="hi">${esc(ev.timeHi)}</span> · ` : ''}${esc(ev.timeEn || '')}</span></dd>`
        : `<dd><b>${esc(ev.time)}</b></dd>`;
      return `<article class="metro-sign metro-in${night ? ' metro-night' : ''}" style="${lineVars(l)}">
        ${night ? '<span class="metro-stars" aria-hidden="true"></span><span class="metro-moon" aria-hidden="true">🌙</span>' : ''}
        <div class="metro-sign-bar"><span class="metro-roundel"></span><span>${HI ? esc(l.hi) : `${esc(l.en)} · <span lang="hi">${esc(l.hi)}</span>`}</span><span class="metro-sign-no">${single ? t('Express', 'एक्सप्रेस') : `${t('Stop', 'स्टेशन')} ${nd.k}/${stCount}`}</span></div>
        <div class="metro-sign-name">${HI ? '' : `<span lang="hi">${esc(ev.hi)}</span>`}<h2>${esc(ev.name)}</h2></div>
        <dl class="metro-info">
          <div><dt>${t('Date', 'दिनांक')}</dt><dd>${esc(ev.dateLong)}</dd></div>
          <div><dt>${t('Time', 'समय')}</dt>${time}</div>
          <div><dt>${t('Venue', 'स्थान')}</dt><dd>${esc(ev.placeFull)}</dd></div>
          ${ev.note ? `<div><dt>${t('Note', 'विशेष')}</dt><dd>${esc(ev.note[0].toUpperCase() + ev.note.slice(1))}</dd></div>` : ''}
          ${ev.dress ? `<div><dt>${t('Dress', 'वेशभूषा')}</dt><dd>${esc(ev.dress)}</dd></div>` : ''}
        </dl>
        <div class="metro-sign-act">${ctx.directionsHTML(ev, t('Directions ↗', 'रास्ता देखें ↗'))}</div>
      </article>`;
    }

    function interchangeHTML(nd) {
      const d = nd.day;
      const ahead = d.events.length;
      return `<article class="metro-sign metro-ic metro-in" style="--c1:${nd.from.c};--c2:${nd.line.c};${lineVars(nd.line)}">
        <div class="metro-ic-sym" aria-hidden="true"><span></span><span></span></div>
        ${HI ? `<h2>इंटरचेंज</h2>
        <p class="metro-ic-to"><b>${esc(hiDate(d.date))}</b> के लिए यहाँ बदलें</p>
        <p class="metro-ic-line"><span class="metro-pill">${esc(nd.line.hi)}</span> ${esc(d.dow)} · आगे ${ahead} स्टेशन</p>` : `
        <p class="metro-ic-hi" lang="hi">इंटरचेंज</p>
        <h2>Interchange</h2>
        <p class="metro-ic-to">Change here for <b>${esc(enDate(d.date))}</b></p>
        <p class="metro-ic-to-hi" lang="hi">${esc(hiDate(d.date))} के लिए यहाँ बदलें</p>
        <p class="metro-ic-line"><span class="metro-pill">${esc(nd.line.en)}</span> ${esc(d.dow)} · ${ahead} ${ahead > 1 ? 'stations' : 'station'} ahead</p>`}
      </article>`;
    }

    function endHTML() {
      return `<article class="metro-sign metro-hea metro-in">
        <span class="metro-hea-roundel" aria-hidden="true">♥</span>
        <div class="metro-sign-name">${HI ? `<h2>${HEA_HI}</h2>` : `<span lang="hi">${HEA_HI}</span><h2>Happily Ever After</h2>`}</div>
        <p class="metro-hea-t">${t('Terminal station · this ride ends where forever begins.', 'अंतिम स्टेशन · यह सफ़र वहाँ ख़त्म होता है जहाँ जीवन भर का साथ शुरू होता है।')}</p>
        <button type="button" class="metro-cta metro-out">${t('Step out ▸', 'बाहर निकलें ▸')}</button>
      </article>`;
    }

    function paintControls() {
      const nx = nodes[cur + 1];
      const nd = nodes[cur];
      if (!nx) { nextBtn.hidden = true; progress.textContent = t('Terminus', 'अंतिम स्टेशन'); return; }
      nextBtn.hidden = false;
      const c = segColor(cur), l = nx.type === 'stn' ? nx.line : nodes[cur].line;
      nextBtn.style.cssText = `--c:${c};--ink:${l.ink}`;
      nextBtn.textContent = HI
        ? (cur === 0 ? (single ? 'प्रस्थान ▸' : 'सफ़र शुरू करें ▸')
          : nx.type === 'ic' ? 'आगे: इंटरचेंज ⇄' : nx.type === 'end' ? 'अंतिम स्टेशन ♥ ▸' : 'अगला स्टेशन ▸')
        : cur === 0 ? (single ? 'Depart ▸' : 'Start the ride ▸')
          : nx.type === 'ic' ? 'Next: Interchange ⇄' : nx.type === 'end' ? 'Final stop ♥ ▸' : 'Next station ▸';
      progress.textContent = HI
        ? (nd.type === 'origin' ? (single ? 'एक्सप्रेस · नॉन-स्टॉप' : `आगे ${stCount} स्टेशन`)
          : nd.type === 'ic' ? 'इंटरचेंज' : single ? 'एक्सप्रेस' : `स्टेशन ${nd.k} / ${stCount}`)
        : nd.type === 'origin' ? (single ? 'Express · non-stop' : `${stCount} stops ahead`)
          : nd.type === 'ic' ? 'Interchange' : single ? 'Express' : `Stop ${nd.k} of ${stCount}`;
    }

    function next() {
      if (busy || cur >= n - 1) return;
      go(cur + 1);
    }
    function go(i) {
      busy = true;
      const nd = nodes[i], prev = cur;
      cur = i;
      ctx.sound.play(prev === 0 ? 'whoosh' : 'tap');
      // announcement
      annDoors.textContent = '';
      if (nd.type === 'stn' && single) {
        annHi.textContent = `यह एक्सप्रेस सेवा है, ${shortHi(nd.ev)} तक नॉन-स्टॉप।`;
        annEn.textContent = t(`Express service, non-stop to ${short(nd.ev)}.`, '');
      } else if (nd.type === 'stn') {
        annHi.textContent = `अगला स्टेशन: ${shortHi(nd.ev)} है।`;
        annEn.textContent = t(`Next station: ${short(nd.ev)}.`, '');
      } else if (nd.type === 'ic') {
        annHi.textContent = `इंटरचेंज स्टेशन। ${hiDate(nd.day.date)} के लिए यहाँ बदलें।`;
        annEn.textContent = t(`Interchange. Change here for ${enDate(nd.day.date)}, ${nd.line.en}.`, '');
      } else {
        annHi.textContent = `यह ट्रेन यहीं समाप्त होती है: ${HEA_HI}।`;
        annEn.textContent = t('This train terminates at Happily Ever After.', '');
      }
      const old = signwrap.firstElementChild;
      if (old) old.classList.add('metro-out-anim');
      app.classList.add('is-moving');
      nextBtn.disabled = true;
      train.style.left = X(i);
      nodeEls.forEach((el, k) => { el.classList.toggle('is-past', k < i); el.classList.remove('is-here'); });
      later(() => arrive(nd), T(1300));
    }
    function arrive(nd) {
      app.classList.remove('is-moving');
      // settle the train exactly on the station (no-op if the transition already finished)
      train.style.transition = 'none'; train.style.left = X(cur); void train.offsetWidth; train.style.transition = '';
      nodeEls[cur].classList.add('is-here');
      if (nd.type === 'stn') {
        signwrap.innerHTML = stationHTML(nd);
        if (nd.k % 2 === 1 && !single) annDoors.innerHTML = '<span lang="hi">दरवाज़े बाईं ओर खुलेंगे।</span>' + t('<span>Doors will open on the left.</span>', '');
        ctx.sound.play('ding');
      } else if (nd.type === 'ic') {
        signwrap.innerHTML = interchangeHTML(nd);
        ctx.sound.play('pop');
      } else {
        signwrap.innerHTML = endHTML();
        annDoors.innerHTML = '<span lang="hi">कृपया अपना सारा आशीर्वाद साथ ले जाएँ।</span>' + t('<span>Please take all your blessings with you.</span>', '');
        signwrap.querySelector('.metro-out').addEventListener('click', () => { clearAll(); showEnd(true); });
        later(() => showEnd(true), T(AUTO ? 2600 : 3200));
      }
      nextBtn.disabled = false;
      paintControls();
      busy = false;
      if (AUTO && nd.type !== 'end') later(next, T(nd.type === 'ic' ? 2200 : 2800));
    }
    nextBtn.addEventListener('click', next);
    const ride = $('.metro-s-ride');
    let sx = 0, sy = 0;
    ride.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    ride.addEventListener('touchend', e => {
      const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
      if (dx < -50 && Math.abs(dx) > Math.abs(dy) * 1.3 && !e.target.closest('a,button')) next();
    }, { passive: true });

    /* ---------- 4. terminus ---------- */
    let ended = false;
    function showEnd(fromRide) {
      if (ended) return; ended = true;
      const sec = $('.metro-s-end');
      sec.innerHTML = `
        <div class="metro-end-sign">
          <span class="metro-hea-roundel" aria-hidden="true">♥</span>
          ${HI ? `<h1>${HEA_HI}</h1>` : `<p class="metro-end-hi" lang="hi">${HEA_HI}</p>
          <h1>Happily Ever After</h1>`}
          <p class="metro-end-k">${HI ? `अंतिम स्टेशन · ${esc(ctx.greeting)}, आप पहुँच गए हैं` : `Terminal station · ${esc(ctx.greeting)}, you have arrived`}</p>
          <div class="metro-end-rule"></div>
        </div>
        <div class="metro-sum">${ctx.summaryHTML()}</div>
        <p class="metro-again-wrap"><button type="button" class="metro-again">↺ ${t('Ride again', 'फिर से सफ़र करें')}</button></p>`;
      Array.from(sec.querySelectorAll('.inv-sum-day')).forEach((el, i) => {
        const d = ctx.days[i]; if (!d) return;
        const l = lineFor(d.date);
        el.setAttribute('style', lineVars(l));
        const h = el.querySelector('h3');
        if (h) h.insertAdjacentHTML('afterbegin', `<span class="metro-badge">${esc(lineName(l))}</span>`);
      });
      sec.querySelector('.metro-again').addEventListener('click', () => {
        clearAll(); root.innerHTML = ''; render(root, ctx);
      });
      show('end');
      if (fromRide) ctx.sound.play('success');
      ctx.ready();
    }

    if (AUTO) later(touchIn, 1400);
  }

  /* ---------- static poster ---------- */
  function renderPosterImpl(root, ctx, h) {
    const esc = ctx.esc, P = ctx.P, t = ctx.t, HI = ctx.hi;
    const rows = [];
    let prevBot = 'transparent';
    const push = (html, bot, cls, style) => {
      rows.push(`<li class="metro-p-row ${cls}" style="--top:${prevBot};--bot:${bot};${style || ''}">${html}</li>`);
      prevBot = bot;
    };
    const firstLine = h.lineFor(ctx.days[0].date);
    push(`<span class="metro-p-dot metro-p-home">🏠</span><div>${t('<b>Gurgaon</b> <span class="metro-p-muted">· boarding point, the groom’s home</span>', '<b>गुड़गांव</b> <span class="metro-p-muted">· यात्रा आरंभ, वर का घर</span>')}</div>`,
      firstLine.c, 'metro-p-origin');
    ctx.days.forEach((d, di) => {
      const l = h.lineFor(d.date);
      if (di > 0) {
        const pl = h.lineFor(ctx.days[di - 1].date);
        push(`<span class="metro-p-dot metro-p-ic" style="--c1:${pl.c};--c2:${l.c}"></span><div>${HI ? `<b>इंटरचेंज</b> <span class="metro-p-muted">· ${esc(h.hiDate(d.date))} के लिए यहाँ बदलें</span>` : `<b>Interchange</b> <span class="metro-p-muted">· change here for ${esc(h.enDate(d.date))}</span>`}</div>`,
          l.c, 'metro-p-icrow');
      }
      push(`<span class="metro-p-day"><span class="metro-badge" style="${h.lineVars(l)}">${esc(h.lineName(l))}</span> ${esc(d.dateLong)}</span>`, l.c, 'metro-p-dayrow');
      d.events.forEach(ev => {
        const time = ev.isTimeText && !HI
          ? `${esc(ev.time)}${ev.timeHi ? ` · <span lang="hi">${esc(ev.timeHi)}</span>` : ''}${ev.timeEn ? ` · ${esc(ev.timeEn)}` : ''}`
          : esc(ev.time);
        push(`<span class="metro-p-dot" style="--c:${l.c}"></span>
          <div class="metro-p-stn">
            <p class="metro-p-name"><b>${esc(ev.name)}</b>${HI ? '' : ` <span lang="hi">${esc(ev.hi)}</span>`}</p>
            <p class="metro-p-time" style="--tx:${l.tx}">${time}</p>
            <p class="metro-p-place">${esc(ev.placeFull)}</p>
            ${ev.note ? `<p class="metro-p-muted">${esc(ev.note[0].toUpperCase() + ev.note.slice(1))}</p>` : ''}
            ${ev.dress ? `<p class="metro-p-muted">${t('Dress code', 'वेशभूषा')}: ${esc(ev.dress)}</p>` : ''}
          </div>`, l.c, 'metro-p-stnrow' + (ev.isTimeText ? ' metro-p-night' : ''));
      });
    });
    push(`<span class="metro-p-dot metro-p-heart">♥</span><div>${HI ? `<b>${HEA_HI}</b>` : `<b>Happily Ever After</b> <span lang="hi" class="metro-p-muted">· ${HEA_HI}</span>`}</div>`,
      'transparent', 'metro-p-end');

    const single = ctx.events.length === 1;
    root.innerHTML = `
      <div class="metro-poster" style="--rule:${h.ruleGrad}">
        <header class="metro-p-head">
          <p class="metro-ganesh" lang="hi">${esc(ctx.T.ganeshShort)}</p>${GANESH()}
          <div class="metro-brand">${LOGO}<span>${t('<b>Shaadi Metro</b><i lang="hi">शादी मेट्रो</i>', '<b>शादी मेट्रो</b>')}</span></div>
          <p class="metro-p-greet">${esc(ctx.greeting)}</p>
          <p class="metro-p-bless">${HI ? `${esc(P.blessings)}<small>के आशीर्वाद से</small>` : `<small>With the divine blessings of</small>${esc(P.blessings)}`}</p>
          <p class="metro-p-line"><span class="metro-p-hosts">${esc(P.groomParents)}</span>${esc(ctx.occasion.line)}</p>
          <h1 class="metro-p-couple">${esc(P.groom)} <span>${t('&amp;', 'संग')}</span> ${esc(P.bride)}</h1>
          <p class="metro-p-bride">${esc(P.bride)}, ${t('daughter of', 'सुपुत्री')} ${esc(P.brideParents)}</p>
        </header>
        <div class="metro-p-rule"></div>
        <div class="metro-p-body">
          <p class="metro-p-title"><b>${h.coupleLine}</b><span>${HI
            ? (single ? `एक्सप्रेस सेवा · ${esc(h.short(ctx.events[0]))} तक नॉन-स्टॉप` : 'मार्ग मानचित्र')
            : single ? `Express service · non-stop to ${esc(h.short(ctx.events[0]))}` : 'Route map · मार्ग मानचित्र'}</span></p>
          <ol class="metro-p-map">${rows.join('')}</ol>
        </div>
        <footer class="metro-p-foot">
          <p>${t('With love', 'सप्रेम')}, ${esc(P.hosts)} · ${esc(P.address)}</p>
          <p>${P.phones.map(esc).join(' · ')}</p>
          <p class="metro-p-gap">${t('<span>MIND THE GAP 💍</span> Open your invite link for directions &amp; calendar', '<span>दूरी का ध्यान रखें 💍</span> रास्ते और कैलेंडर के लिए अपना निमंत्रण लिंक खोलें')}</p>
        </footer>
      </div>`;
    const done = () => ctx.ready();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(done, done); else done();
  }

  Invite.register('metro', { render });
})();
