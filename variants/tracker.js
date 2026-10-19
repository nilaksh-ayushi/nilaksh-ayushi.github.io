/* Baraat Live Tracker — a delivery-app style order tracker where the "order" is the wedding.
   The groom (or, for non-wedding groups, the invitation) travels along a map; each invited event
   is an order stage. Ends with "Order delivered!", a star rating and the details as a receipt. */
(function () {
  'use strict';

  const WED_IDS = ['ghudchadi', 'baraat', 'dinner', 'vidaai'];
  const STAGE = {
    ghudchadi: 'Dulha has mounted the ghodi 🐎 (Sehra Bandi done)',
    baraat: 'Baraat has picked up the dhol wala 🥁, dancing en route',
    dinner: 'Your dinner is being served 🍽️',
    vidaai: 'Delivered with love, under the stars ✨',
    sunderkand: 'Pandit ji has begun the path 🙏',
    mehandi: 'Mehandi cones are out for delivery 🌿, geet in progress',
    engagement: 'Rings picked up 💍, DJ is warming up 🎶',
    bhaat: 'Mama ji has arrived with the Bhaat 🎁',
    haldi: 'Haldi is being applied 💛 (handle with care, may stain)',
  };

  // Map geometry (viewBox units).
  const VW = 360, VH = 220;
  const ROUTE = 'M40 162 C 66 158, 88 148, 110 134 S 150 112, 182 108 S 226 90, 254 80 S 292 64, 312 58';

  Invite.register('tracker', {
    render(root, ctx) {
      const esc = ctx.esc, P = ctx.P, S = ctx.isStatic, RM = ctx.reducedMotion;
      const AUTO = !S && new URLSearchParams(location.search).get('auto') === '1';
      const evs = ctx.events, N = evs.length;
      const wedding = evs.some(e => WED_IDS.includes(e.id));
      const firstWed = evs.find(e => WED_IDS.includes(e.id)) || evs[0];
      const orderNo = firstWed.date.split('-').reverse().join('');
      const lastEv = evs[N - 1];
      const baraatIdx = evs.findIndex(e => e.id === 'baraat');
      const who = ctx.guest || 'Family & Friends';

      const headline = wedding ? 'Your Dulha is on the way! 🐎' : 'Your invitation is on the way! 💌';
      const road = (lastEv.venueInfo.area.split(',')[0] || '').trim();
      const map = wedding ? {
        origin: '🏠 Gurgaon',
        city: 'DELHI',
        shield: 'NH-48',
        road: /road/i.test(road) ? road : '',
        dest: lastEv.venueInfo.short + ' 📍',
        aria: `Map: the groom's route from Gurgaon to ${lastEv.venueInfo.short}`,
      } : {
        origin: '🏠 ' + P.family,
        city: 'DELHI NCR',
        shield: '',
        road: '',
        dest: 'Your doorstep 📍',
        aria: 'Map: your invitation travelling from the family home to your doorstep',
      };
      const partner = {
        vehicle: wedding ? 'Ghodi (white)' : 'Scooty (decorated)',
        calls: wedding
          ? ['Dulha is busy getting ready 😄', 'Sehra is being tied, call back after the pheras 🙏', 'Phone is with Mummy ji now 📵']
          : [P.groom + ' is busy getting ready 😄', 'Rider is stuck in a selfie queue 📸', 'Phone is with Mummy ji now 📵'],
      };
      const tickers = {
        before: wedding
          ? ['Dhol wala is 2 km away 🥁', 'Ghodi fuelled up on gur & chana 🐎', 'Sehra being tied, please hold ✨']
          : ['Packed with love by the ' + P.family + ' 💌', 'Mithai on board 🍬', 'Rider is humming shaadi songs 🎶'],
        after: ['Baraat speed: 0.5 km/h (naagin dance in progress) 🐍', 'Traffic ahead: Chachu’s dance solo 🕺', 'Dhol wala refuses to stop 🥁'],
        done: wedding ? ['Delivered! The dhol is still playing 🥁'] : ['Delivered! Please collect in person 🙏'],
      };

      const timeOf = e => e.isTimeText ? `<i>${esc(e.time)}</i>` : esc(e.time);
      const stageTitle = e => STAGE[e.id] || `${e.name} is ready for you ✨`;

      /* ---------- markup ---------- */
      const svg = `
        <svg class="tracker-svg" viewBox="0 0 ${VW} ${VH}" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
          <rect width="${VW}" height="${VH}" fill="var(--tk-land)"/>
          <ellipse cx="92" cy="86" rx="30" ry="17" fill="var(--tk-park)"/>
          <ellipse cx="252" cy="152" rx="34" ry="19" fill="var(--tk-park)"/>
          <ellipse cx="296" cy="104" rx="16" ry="26" fill="var(--tk-park)"/>
          <ellipse cx="40" cy="40" rx="22" ry="14" fill="var(--tk-park)"/>
          <path d="M352 -4 C 334 46, 356 96, 338 146 S 350 196, 334 226" fill="none" stroke="var(--tk-water)" stroke-width="16" stroke-linecap="round"/>
          <g fill="none" stroke="var(--tk-road-edge)" stroke-width="7" stroke-linecap="round">
            <path d="M-4 62 L364 38"/><path d="M-4 138 L364 118"/><path d="M-4 204 L364 196"/>
            <path d="M66 -4 L112 224"/><path d="M152 -4 L172 224"/><path d="M242 -4 L214 224"/>
            <ellipse cx="182" cy="110" rx="62" ry="42"/>
          </g>
          <g fill="none" stroke="var(--tk-road)" stroke-width="4.5" stroke-linecap="round">
            <path d="M-4 62 L364 38"/><path d="M-4 138 L364 118"/><path d="M-4 204 L364 196"/>
            <path d="M66 -4 L112 224"/><path d="M152 -4 L172 224"/><path d="M242 -4 L214 224"/>
            <ellipse cx="182" cy="110" rx="62" ry="42"/>
          </g>
          <path d="${ROUTE}" fill="none" stroke="var(--tk-road-edge)" stroke-width="13" stroke-linecap="round"/>
          <path d="${ROUTE}" fill="none" stroke="var(--tk-road)" stroke-width="10" stroke-linecap="round"/>
          <path d="${ROUTE}" fill="none" stroke="var(--tk-gold)" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="0.1 8"/>
          <path class="tracker-done-path" d="${ROUTE}" fill="none" stroke="var(--tk-green)" stroke-width="5" stroke-linecap="round"/>
          <circle cx="40" cy="162" r="6" fill="var(--tk-green)" stroke="#fff" stroke-width="2.5"/>
          <circle class="tracker-dest-ring" cx="312" cy="58" r="12" fill="var(--tk-gold)" opacity=".28"/>
          <circle cx="312" cy="58" r="6.5" fill="var(--tk-gold)" stroke="#fff" stroke-width="2.5"/>
        </svg>`;
      const pct = (x, y) => `left:${(x / VW * 100).toFixed(2)}%;top:${(y / VH * 100).toFixed(2)}%`;
      const labels = `
        <span class="tracker-lbl tracker-lbl-origin" style="${pct(40, 162)}">${esc(map.origin)}</span>
        <span class="tracker-lbl tracker-lbl-city" style="${pct(186, 166)}">${esc(map.city)}</span>
        ${map.shield ? `<span class="tracker-lbl tracker-lbl-shield" style="${pct(84, 112)}">${esc(map.shield)}</span>` : ''}
        ${map.road ? `<span class="tracker-lbl tracker-lbl-road" style="${pct(214, 84)}">${esc(map.road)}</span>` : ''}
        <span class="tracker-lbl tracker-lbl-dest" style="${pct(312, 58)}">${esc(map.dest)}</span>
        ${wedding ? '<span class="tracker-dhol" aria-hidden="true">🥁</span>' : ''}
        <span class="tracker-rider" aria-hidden="true">
          <span class="tracker-rider-ic">${wedding ? '🐎' : '💌'}</span>${wedding ? '<span class="tracker-rider-crown">👑</span>' : ''}
        </span>`;

      const segs = evs.map(() => '<i></i>').join('');
      const stages = evs.map((e, i) => `
        <li class="tracker-st" data-i="${i + 1}">
          <span class="tracker-dot"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 12.5l4.2 4.2L18.5 7.5"/></svg></span>
          <div class="tracker-st-body">
            <p class="tracker-st-title"><span class="tracker-st-joke">${esc(stageTitle(e))}</span><span class="tracker-st-pend">${esc(e.name)}</span></p>
            <p class="tracker-st-ev">${esc(e.name)}</p>
            <p class="tracker-st-when">${timeOf(e)} · ${esc(e.dateShort)}</p>
            <p class="tracker-st-where">${esc(e.placeFull)}</p>
            ${S ? '' : `<div class="tracker-st-dir">${ctx.directionsHTML(e)}</div>`}
          </div>
        </li>`).join('');

      const stars = [1, 2, 3, 4, 5].map(n =>
        `<button type="button" class="tracker-star" data-n="${n}" aria-label="Rate ${n} star${n > 1 ? 's' : ''}" aria-pressed="false">★</button>`).join('');

      const receipt = `
        <section class="tracker-receipt" ${S ? '' : 'hidden'} aria-label="Order receipt">
          <div class="tracker-rc">
            <div class="tracker-rc-top">
              <span class="tracker-logo tracker-logo-sm" aria-hidden="true">SD</span>
              <p class="tracker-rc-brand">Shaadi<b>Dash</b> · Order receipt</p>
              <p class="tracker-rc-mono">Order #${esc(orderNo)} · ${S ? 'Confirmed' : 'Delivered'} ✓</p>
              <p class="tracker-rc-mono">Deliver to: ${esc(who)}</p>
            </div>
            <div class="tracker-rc-items">
              <p class="tracker-rc-h">Items</p>
              <p class="tracker-rc-row"><span>1 × Lifetime of happiness</span><i></i><b>Priceless</b></p>
              <p class="tracker-rc-row"><span>Packing: love & ashirwad</span><i></i><b>Free</b></p>
              <p class="tracker-rc-row"><span>Delivery fee</span><i></i><b>Your presence 🙏</b></p>
              <p class="tracker-rc-row tracker-rc-total"><span>Total</span><i></i><b>Priceless</b></p>
              <p class="tracker-rc-mono tracker-rc-paid">Paid via: Ashirwad (blessings) · ${N} event${N > 1 ? 's' : ''} below</p>
            </div>
            ${ctx.summaryHTML()}
            ${S ? '' : '<div class="tracker-again-wrap"><button type="button" class="tracker-again">↻ Track again</button></div>'}
          </div>
        </section>`;

      root.innerHTML = `
        <div class="tracker-app${S ? ' tracker-static' : ''}">
          <header class="tracker-bar">
            <div class="tracker-brand"><span class="tracker-logo" aria-hidden="true">SD</span><span>Shaadi<b>Dash</b></span></div>
            <span class="tracker-live"><i></i>LIVE</span>
          </header>
          <div class="tracker-addr">
            <span class="tracker-addr-ic" aria-hidden="true">📍</span>
            <div><small>Delivering to</small><strong>${esc(ctx.greeting)}</strong></div>
          </div>
          <div class="tracker-map" role="img" aria-label="${esc(map.aria)}">
            <div class="tracker-map-in">${svg}${labels}</div>
          </div>
          <section class="tracker-sheet">
            <p class="tracker-order">Order #${esc(orderNo)} · ${esc(ctx.occasion.title)}</p>
            <h1 class="tracker-head">${esc(headline)}</h1>
            <div class="tracker-meta">
              <span class="tracker-eta"></span>
              <span class="tracker-ticker"></span>
            </div>
            <div class="tracker-prog" aria-hidden="true">${segs}</div>
            <div class="tracker-partner">
              <span class="tracker-av" aria-hidden="true">🤵🏻</span>
              <div class="tracker-pt">
                <small>Your delivery partner</small>
                <strong>${esc(P.groom)} <span>⭐ 5.0</span></strong>
                <span>Vehicle: ${esc(partner.vehicle)}</span>
              </div>
              ${S ? '' : '<button type="button" class="tracker-call" aria-label="Call partner"><span aria-hidden="true">📞</span><small>Call<span class="tracker-call-x"> partner</span></small></button>'}
            </div>
          </section>
          <section class="tracker-tl-wrap">
            <h2 class="tracker-h2">Order updates</h2>
            <ol class="tracker-tl">
              <li class="tracker-st is-done" data-i="0">
                <span class="tracker-dot"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 12.5l4.2 4.2L18.5 7.5"/></svg></span>
                <div class="tracker-st-body">
                  <p class="tracker-st-title"><span class="tracker-st-joke">Order placed by the ${esc(P.family)} 💌</span></p>
                  <p class="tracker-st-when">${esc(ctx.occasion.title)} · ${esc(P.groom)} & ${esc(P.bride)}</p>
                </div>
              </li>
              ${stages}
            </ol>
          </section>
          ${S ? '' : `
          <section class="tracker-done" hidden>
            <span class="tracker-done-badge" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5.5 12.5l4.2 4.2L18.5 7.5"/></svg></span>
            <h2 class="tracker-done-h">Order delivered! 🎉</h2>
            <p class="tracker-done-p">Delivered to ${esc(who)}, packed with love by the ${esc(P.family)}.</p>
            <div class="tracker-rate">
              <p class="tracker-rate-q">Rate your ${wedding ? 'Baraat' : 'invitation'} experience</p>
              <div class="tracker-stars" role="group" aria-label="Rating">${stars}</div>
              <p class="tracker-thanks" aria-live="polite"></p>
            </div>
          </section>`}
          ${receipt}
          ${S ? '' : `
          <div class="tracker-actions">
            <button type="button" class="tracker-next"><span class="tracker-next-bar" aria-hidden="true"></span><span class="tracker-next-t">Track next update ›</span></button>
            <button type="button" class="tracker-skip">Skip to details</button>
          </div>
          <div class="tracker-toast" role="status" aria-live="polite"></div>
          <p class="tracker-sr" aria-live="polite"></p>`}
        </div>`;

      const $ = s => root.querySelector(s);
      const $$ = s => Array.prototype.slice.call(root.querySelectorAll(s));
      const path = $('.tracker-done-path'), appEl = $('.tracker-app'), mapEl = $('.tracker-map');
      const L = path.getTotalLength();
      path.setAttribute('stroke-dasharray', L + ' ' + L);
      const rider = $('.tracker-rider'), dhol = $('.tracker-dhol');
      const etaEl = $('.tracker-eta'), tickEl = $('.tracker-ticker'), headEl = $('.tracker-head');
      const segEls = $$('.tracker-prog i'), stEls = $$('.tracker-st');

      let step = 0, prog = 0, delivered = false;

      function place(el, p) {
        const pt = path.getPointAtLength(L * Math.max(0, Math.min(1, p)));
        el.style.left = (pt.x / VW * 100) + '%';
        el.style.top = (pt.y / VH * 100) + '%';
      }
      function setProg(p) {
        prog = p;
        path.setAttribute('stroke-dashoffset', String(L * (1 - p)));
        place(rider, p);
        if (dhol) {
          const withGroom = (baraatIdx >= 0 && step > baraatIdx) || step >= N;
          place(dhol, withGroom ? Math.max(0, p - 0.15) : Math.min(0.96, p + 0.2));
        }
      }
      const target = k => (k === 0 ? 0.02 : k / N);

      // setTimeout rather than rAF so headless/virtual-time captures (and background tabs) stay in sync.
      let raf = 0;
      const frame = fn => setTimeout(() => fn(performance.now()), 16);
      function moveTo(p, done) {
        clearTimeout(raf);
        const from = prog, dur = RM ? 0 : 1300, t0 = performance.now();
        if (!dur) { setProg(p); if (done) done(); return; }
        rider.classList.add('is-moving');
        const tick = now => {
          const t = Math.min(1, (now - t0) / dur), k = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
          setProg(from + (p - from) * k);
          if (t < 1) raf = frame(tick);
          else { rider.classList.remove('is-moving'); if (done) done(); }
        };
        raf = frame(tick);
      }

      function etaText() {
        if (delivered || step >= N) return 'Delivered ✓';
        if (baraatIdx >= 0 && step <= baraatIdx) return 'ETA ' + evs[baraatIdx].time;
        const nx = evs[step];
        return nx.isTimeText ? 'ETA: ' + nx.time : 'ETA ' + nx.time;
      }
      let tickList = [], tickI = 0, tickTimer = 0;
      function setTickers() {
        const list = step >= N ? tickers.done
          : (wedding && baraatIdx >= 0 && step > baraatIdx) ? tickers.after : tickers.before;
        if (list === tickList) return;
        tickList = list; tickI = 0; tickEl.textContent = list[0];
      }
      function rotateTicker() {
        if (tickList.length < 2) return;
        tickI = (tickI + 1) % tickList.length;
        tickEl.classList.add('is-swap');
        setTimeout(() => { tickEl.textContent = tickList[tickI]; tickEl.classList.remove('is-swap'); }, RM ? 0 : 220);
      }
      function paintStatus() {
        etaEl.textContent = etaText();
        setTickers();
        segEls.forEach((s, i) => s.classList.toggle('is-on', i < step));
        headEl.textContent = delivered ? 'Order delivered! 🎉' : headline;
      }

      /* ---------- static: final still ---------- */
      if (S) {
        step = N;
        stEls.forEach(li => li.classList.add('is-done'));
        segEls.forEach(s => s.classList.add('is-on'));
        setProg(1);
        etaEl.textContent = baraatIdx >= 0 ? 'ETA ' + evs[baraatIdx].time : 'Arriving soon';
        tickEl.textContent = tickers.before[0];
        if (wedding) tickEl.textContent += ' · ' + tickers.after[0];
        ctx.ready();
        return;
      }

      /* ---------- interactive ---------- */
      const nextBtn = $('.tracker-next'), skipBtn = $('.tracker-skip'), actions = $('.tracker-actions');
      const bar = $('.tracker-next-bar'), toast = $('.tracker-toast'), sr = $('.tracker-sr');
      const doneEl = $('.tracker-done'), rcEl = $('.tracker-receipt'), thanks = $('.tracker-thanks');
      const starEls = $$('.tracker-star');
      const timers = new Set();
      const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; };
      const clearAll = () => { timers.forEach(clearTimeout); timers.clear(); };
      const smooth = (RM || AUTO) ? 'auto' : 'smooth';

      const GAP = AUTO ? 2600 : 4800, FIRST = AUTO ? 1500 : 3500;
      function schedule(ms) {
        clearAll();
        if (delivered || step >= N) return;
        bar.style.animation = 'none';
        void bar.offsetWidth;
        bar.style.animation = RM ? 'none' : `tracker-fill ${ms}ms linear forwards`;
        later(advance, ms);
      }

      function advance() {
        if (delivered || step >= N) return;
        step++;
        const li = stEls[step];
        stEls.forEach(x => x.classList.remove('is-current'));
        li.classList.add('is-done', 'is-new', 'is-current');
        setTimeout(() => li.classList.remove('is-new'), 1200);
        sr.textContent = stageTitle(evs[step - 1]);
        ctx.sound.play(evs[step - 1].id === 'baraat' ? 'dhol' : 'ding');
        paintStatus();
        const r = li.getBoundingClientRect();
        // The map may be sticky at the top: keep the new stage's title just below it.
        const mb = Math.max(0, mapEl.getBoundingClientRect().bottom);
        if (r.top > innerHeight - 120 || r.top < mb) window.scrollBy({ top: r.top - mb - 14, behavior: smooth });
        moveTo(target(step));
        if (step >= N) { clearAll(); bar.style.animation = 'none'; later(deliver, RM ? 500 : 1500); }
        else schedule(GAP);
      }

      function confetti() {
        if (RM) return;
        const box = document.createElement('div');
        box.className = 'tracker-confetti';
        box.setAttribute('aria-hidden', 'true');
        const cols = ['#f2b01e', '#0a5c48', '#c2185b', '#7cc6a4', '#ffd86b', '#ffffff'];
        let html = '';
        for (let i = 0; i < 70; i++) {
          const w = 6 + Math.random() * 6;
          html += `<i style="left:${Math.random() * 100}%;width:${w}px;height:${w * (0.5 + Math.random())}px;` +
            `background:${cols[i % cols.length]};animation-duration:${2.2 + Math.random() * 1.6}s;` +
            `animation-delay:${Math.random() * 0.6}s;--r:${Math.random() * 720 - 360}deg;--x:${Math.random() * 80 - 40}px"></i>`;
        }
        box.innerHTML = html;
        root.querySelector('.tracker-app').appendChild(box);
        setTimeout(() => box.remove(), 4600);
      }

      function deliver(opts) {
        opts = opts || {};
        if (delivered) return;
        delivered = true;
        clearAll();
        paintStatus();
        actions.hidden = true;
        appEl.classList.add('is-delivered');
        doneEl.hidden = false; rcEl.hidden = false;
        setTimeout(() => doneEl.classList.add('is-in'), 30);
        ctx.sound.play('success');
        confetti();
        sr.textContent = 'Order delivered!';
        const to = opts.toReceipt ? rcEl : doneEl;
        setTimeout(() => to.scrollIntoView({ behavior: smooth, block: 'start' }), opts.toReceipt ? 50 : 350);
        if (AUTO) {
          later(() => rate(5), 2200);
          later(() => rcEl.scrollIntoView({ behavior: smooth, block: 'start' }), 4600);
        }
      }

      function finishAll() {
        clearAll();
        clearTimeout(raf);
        rider.classList.remove('is-moving');
        step = N;
        stEls.forEach(li => li.classList.add('is-done'));
        setProg(1);
        deliver({ toReceipt: true });
      }

      function rate(n) {
        starEls.forEach((s, i) => { s.classList.toggle('is-on', i < n); s.setAttribute('aria-pressed', String(i < n)); });
        starEls[n - 1].classList.remove('is-pop'); void starEls[n - 1].offsetWidth; starEls[n - 1].classList.add('is-pop');
        ctx.sound.play('success');
        thanks.textContent = n === 5 ? 'Thank you! Please collect your 5★ in person, on the dance floor 💃'
          : n === 4 ? '4★? Bring your dancing shoes and we’ll earn that last star 😄'
            : `Only ${n}★? Come for the dinner, you’ll change your mind 😄`;
      }

      let callI = 0, toastT = 0;
      function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add('is-on');
        clearTimeout(toastT);
        toastT = setTimeout(() => toast.classList.remove('is-on'), 2600);
      }

      function reset() {
        clearAll();
        clearTimeout(raf);
        rider.classList.remove('is-moving');
        delivered = false; step = 0;
        stEls.forEach((li, i) => { li.classList.toggle('is-done', i === 0); li.classList.remove('is-current'); });
        starEls.forEach(s => { s.classList.remove('is-on'); s.setAttribute('aria-pressed', 'false'); });
        thanks.textContent = '';
        appEl.classList.remove('is-delivered');
        doneEl.hidden = true; doneEl.classList.remove('is-in'); rcEl.hidden = true; actions.hidden = false;
        tickList = [];
        paintStatus();
        setProg(target(0));
        window.scrollTo({ top: 0, behavior: smooth });
        schedule(FIRST);
      }

      nextBtn.addEventListener('click', () => { ctx.sound.play('tap'); advance(); });
      skipBtn.addEventListener('click', () => { ctx.sound.play('whoosh'); finishAll(); });
      $('.tracker-call').addEventListener('click', () => {
        ctx.sound.play('pop');
        showToast(partner.calls[callI++ % partner.calls.length]);
      });
      starEls.forEach(s => s.addEventListener('click', () => rate(+s.dataset.n)));
      $('.tracker-again').addEventListener('click', () => { ctx.sound.play('tap'); reset(); });

      paintStatus();
      setProg(target(0));
      tickTimer = setInterval(rotateTicker, 3200);
      schedule(FIRST);
      ctx.ready();
    },
  });
})();
