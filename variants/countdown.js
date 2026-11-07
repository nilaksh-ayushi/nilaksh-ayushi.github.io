/* Shaadi Countdown — a live countdown to each of the guest's own functions: a route of stops, a flap board for the
   next one, the guest's full schedule with map links, a dhol easter egg, and a party popper while a function is on.
   Works for every group (?t=countdown or the /countdown page); Hindi with ?lang=hi or the /countdown-hi page. */
(function () {
  'use strict';

  const HOUR = 3600e3;
  const NO_POP = ['sunderkand', 'vidaai'];   // confetti would feel wrong at the path and at the bidaai

  Invite.register('countdown', {
    render(root, ctx) {
      const esc = ctx.esc, t = ctx.t, P = ctx.P;
      const L = {
        eyebrow: t('Shaadi Countdown', 'शादी काउंटडाउन'),
        next: t('Next up', 'अगला कार्यक्रम'),
        startsIn: t('Starts in', 'शुरू होने में'),
        endsIn: t('Ends in', 'समाप्त होने में'),
        dayBegins: d => t(`${d} begins in`, `${d} शुरू होने में`),
        units: { d: t('Days', 'दिन'), h: t('Hours', 'घंटे'), m: t('Minutes', 'मिनट'), s: t('Seconds', 'सेकंड') },
        status: { upcoming: t('Upcoming', 'आगामी'), live: t('Happening now', 'अभी चल रहा है'), done: t('Done', 'संपन्न') },
        then: t('Then', 'उसके बाद'),
        last: t('This is your last function on the board.', 'यह आपका अंतिम कार्यक्रम है।'),
        wrap: t('That’s a wrap', 'सब संपन्न हुआ'),
        thanks: t('Thank you for celebrating with us!', 'हमारे साथ उत्सव मनाने के लिए धन्यवाद!'),
        count: (n, done) => t(`${n} function${n === 1 ? '' : 's'} · ${done} done · times in IST`, `${n} कार्यक्रम · ${done} संपन्न · समय भारतीय (IST)`),
        map: t('open in Google Maps', 'गूगल मैप्स में खोलें'),
        dhol: t('Play the dhol', 'ढोल बजाएँ'),
        popper: t('Pop a party popper', 'पार्टी पॉपर चलाएँ'),
      };
      const BEATS = t(
        ['Dha!', 'Dhin dhin!', 'Padosi jaag gaye', 'Mama ji ne kamar kas li', 'DJ wale babu, gaana laga do', 'Ghodi bhi thirak rahi hai', 'Ab toh naachna padega! Milte hain shaadi mein.'],
        ['धा!', 'धिन धिन!', 'पड़ोसी जाग गए', 'मामा जी ने कमर कस ली', 'डीजे वाले बाबू, गाना लगा दो', 'घोड़ी भी थिरक रही है', 'अब तो नाचना पड़ेगा! मिलते हैं शादी में।']);
      const POPS = t(['Mubarak ho!', 'Aur zor se!', 'Naacho naacho!', 'Ek aur popper!', 'Shaadi mubarak!'],
        ['मुबारक हो!', 'और ज़ोर से!', 'नाचो नाचो!', 'एक और पॉपर!', 'शादी मुबारक!']);
      const EGG = { idle: t('Psst… dhol bajao.', 'ज़रा ढोल बजाइए।'), hint: t('Tap it. Go on.', 'टैप कीजिए।'), again: t('Phir se bajao?', 'फिर से बजाएँ?') };
      const POP_IDLE = t('Party popper chalao!', 'पार्टी पॉपर चलाइए!');

      // An event counts as on for 2 hours (as in the calendar file), or until the guest's next event starts.
      const list = ctx.events
        .map(ev => ({ ev, s: Date.parse(`${ev.date}T${ev.start || '00:00'}:00+05:30`) }))
        .sort((a, b) => a.s - b.s);
      list.forEach((x, i) => {
        const nx = list[i + 1];
        x.e = nx && nx.s > x.s ? Math.min(x.s + 2 * HOUR, nx.s) : x.s + 2 * HOUR;
      });
      const statusOf = (x, now) => now < x.s ? 'upcoming' : now < x.e ? 'live' : 'done';
      const focusOf = now => {
        const i = list.findIndex(x => statusOf(x, now) === 'live');
        return i >= 0 ? i : list.findIndex(x => statusOf(x, now) === 'upcoming');
      };
      const keyOf = (fi, now) => fi + ':' + (fi >= 0 ? statusOf(list[fi], now) : 'none');

      const p2 = n => String(n).padStart(2, '0');
      const parts = ms => {
        const s = Math.floor(Math.max(0, ms) / 1000);
        return { d: Math.floor(s / 86400), h: Math.floor(s % 86400 / 3600), m: Math.floor(s % 3600 / 60), s: s % 60 };
      };
      const compact = ms => {
        const p = parts(ms), u = ctx.hi ? [' दिन', ' घंटे', ' मिनट', ' सेकंड'] : ['d', 'h', 'm', 's'];
        const bits = p.d ? [[p.d, 0], [p.h, 1], [p.m, 2]] : p.h ? [[p.h, 1], [p.m, 2], [p.s, 3]] : [[p.m, 2], [p.s, 3]];
        return bits.map(([v, i], k) => (k ? p2(v) : v) + u[i]).join(' ');
      };
      const shortName = ev => ev.name.split(/,| with | एवं /)[0].replace(' Ceremony', '');
      const PIN = '<svg class="cd-pin" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21.5s7-6.2 7-11.5a7 7 0 1 0-14 0c0 5.3 7 11.5 7 11.5z"/><circle cx="12" cy="10" r="2.5"/></svg>';
      const placeHtml = ev => {
        const map = ev.venueInfo && ev.venueInfo.map;
        return /^https:\/\//.test(map || '') && !ctx.isStatic
          ? `<a class="cd-place-link" href="${esc(map)}" target="_blank" rel="noopener" aria-label="${esc(ev.placeFull)}, ${esc(L.map)}">${PIN}${esc(ev.placeFull)}</a>`
          : esc(ev.placeFull);
      };
      const nameHtml = (ev, cls) => `<strong class="${cls}">${esc(ev.name)}</strong>${!ctx.hi && ev.hi ? `<span class="cd-hi" lang="hi">${esc(ev.hi)}</span>` : ''}`;

      let focusKey = '', beats = 0, pops = 0, poppedFor = '';
      const eggText = () => !beats ? [EGG.idle, EGG.hint]
        : [BEATS[beats - 1], beats === BEATS.length ? EGG.again : `${beats} / ${BEATS.length}`];

      /* ---------- markup ---------- */
      function headHtml(now) {
        const done = list.filter(x => statusOf(x, now) === 'done').length;
        return `<header class="cd-sign"><div class="cd-sign-in">
          <p class="cd-eyebrow">${esc(L.eyebrow)} · <span lang="hi">शुभ विवाह</span></p>
          <h1>${esc(P.groom)} &amp; ${esc(P.bride)}</h1>
          <p class="cd-greet">${esc(ctx.greeting)}</p>
          <p class="cd-sub">${esc(L.count(list.length, done))}</p>
        </div></header>`;
      }

      function routeHtml(fi, now) {
        if (list.length < 2) return '';
        const stops = list.map((x, i) => `<li class="cd-stop is-${statusOf(x, now)}${i === fi ? ' is-focus' : ''}" data-fn="${esc(x.ev.id)}">
          <span class="cd-dot"></span><span class="cd-stop-name">${esc(shortName(x.ev))}</span>
          <span class="cd-stop-day">${esc(x.ev.dateShort)}</span><span class="cd-stop-time">${esc(x.ev.time)}</span></li>`).join('');
        return `<section class="cd-route" aria-label="${esc(t('Your functions', 'आपके कार्यक्रम'))}"><div class="cd-route-scroll">
          <div class="cd-route-track" style="--n:${list.length}"><div class="cd-rail" aria-hidden="true"><div class="cd-rail-fill" id="cd-rail-fill"></div></div>
          <ol class="cd-stops">${stops}</ol></div></div></section>`;
      }

      function heroHtml(fi, now) {
        if (fi < 0) {
          return `<section class="cd-board cd-hero"><p class="cd-kicker">${esc(L.wrap)}</p><h2>${esc(L.thanks)}</h2></section>`;
        }
        const x = list[fi], ev = x.ev, st = statusOf(x, now), nx = list[fi + 1];
        const label = st === 'live' ? L.endsIn : ev.isTimeText && !ev.start ? L.dayBegins(ev.dateShort) : L.startsIn;
        const units = ['d', 'h', 'm', 's'].map(u => `<div class="cd-unit"><div class="cd-tiles" data-u="${u}"></div><span>${esc(L.units[u])}</span></div>`).join('');
        const canPop = st === 'live' && !NO_POP.includes(ev.id) && !ctx.isStatic;
        return `<section class="cd-board cd-hero is-${st}" data-fn="${esc(ev.id)}" aria-labelledby="cd-hero-name">
          <p class="cd-kicker"><span class="cd-lamp"></span>${esc(st === 'live' ? L.status.live : L.next)}</p>
          <h2 id="cd-hero-name">${esc(ev.name)}</h2>
          ${!ctx.hi && ev.hi ? `<p class="cd-hero-hi" lang="hi">${esc(ev.hi)}</p>` : ''}
          <p class="cd-meta"><span>${esc(ev.dateLong)} · ${esc(ev.time)}</span><span>${placeHtml(ev)}</span></p>
          ${ev.note ? `<p class="cd-note">${esc(ev.note)}</p>` : ''}
          ${ev.dress ? `<p class="cd-note">${esc(t('Dress code', 'वेशभूषा'))}: ${esc(ev.dress)}</p>` : ''}
          <div aria-hidden="true"><p class="cd-count-label">${esc(label)}</p><div class="cd-flaps">${units}</div></div>
          <p class="cd-sr" id="cd-hero-sr"></p>
          ${canPop ? `<div class="cd-pop"><button class="cd-pop-btn" id="cd-pop-btn" type="button" aria-label="${esc(L.popper)}">🎉</button><p class="cd-pop-line" id="cd-pop-line" aria-live="polite">${esc(pops ? POPS[(pops - 1) % POPS.length] : POP_IDLE)}</p></div>` : ''}
          <p class="cd-after">${nx ? `${esc(L.then)} <strong>${esc(nx.ev.name)}</strong> · ${esc(nx.ev.dateShort)}, ${esc(nx.ev.time)}` : esc(L.last)}</p>
        </section>`;
      }

      function scheduleHtml(fi, now) {
        const rows = list.map((x, i) => {
          const st = statusOf(x, now), ev = x.ev;
          return `<li class="cd-row is-${st}${i === fi ? ' is-focus' : ''}" data-fn="${esc(ev.id)}" data-i="${i}">
            <div class="cd-row-top"><span class="cd-when"><span class="cd-day">${esc(ev.dateShort)}</span> <span class="cd-clock">${esc(ev.time)}</span></span>
              <span class="cd-pill"><span class="cd-lamp"></span>${esc(L.status[st])}</span></div>
            <div class="cd-row-name">${nameHtml(ev, 'cd-name')}</div>
            <p class="cd-place">${placeHtml(ev)}</p>
            ${ev.note ? `<p class="cd-row-note">${esc(ev.note)}</p>` : ''}
            ${ev.dress ? `<p class="cd-row-note">${esc(t('Dress code', 'वेशभूषा'))}: ${esc(ev.dress)}</p>` : ''}
            <p class="cd-left" data-left></p>
          </li>`;
        }).join('');
        return `<section class="cd-board cd-sched" aria-label="${esc(t('Your schedule', 'आपका कार्यक्रम'))}"><ol class="cd-rows">${rows}</ol></section>`;
      }

      function footHtml() {
        if (ctx.isStatic) return '';
        const [line, hint] = eggText();
        return `<footer class="cd-foot">
          <div class="cd-egg"><button class="cd-dhol" id="cd-dhol" type="button" aria-label="${esc(L.dhol)}">🥁</button>
            <div><p class="cd-egg-line" id="cd-egg-line" aria-live="polite">${esc(line)}</p><p class="cd-egg-hint" id="cd-egg-hint">${esc(hint)}</p></div></div>
          <div class="cd-cal">${ctx.calendarButtonHTML()}</div>
        </footer>`;
      }

      /* ---------- render + tick ---------- */
      function render() {
        const now = Date.now(), fi = focusOf(now);
        focusKey = keyOf(fi, now);
        root.innerHTML = `<div class="cd${ctx.isStatic || ctx.reducedMotion ? ' is-still' : ''}">${headHtml(now)}
          <main class="cd-wrap">${routeHtml(fi, now)}${heroHtml(fi, now)}${scheduleHtml(fi, now)}${footHtml()}</main></div>`;
        const dhol = root.querySelector('#cd-dhol');
        if (dhol) dhol.addEventListener('click', onDhol);
        const pb = root.querySelector('#cd-pop-btn');
        if (pb) {
          pb.addEventListener('click', onPop);
          if (poppedFor !== focusKey) {
            poppedFor = focusKey;
            const r = pb.getBoundingClientRect();
            confetti(r.left + r.width / 2, r.top + r.height / 2);
          }
        }
        tick(true);
      }

      function setTiles(box, str, all) {
        if (box.children.length !== str.length) {
          box.innerHTML = [...str].map(c => `<b class="cd-tile${all && !ctx.isStatic ? ' turn' : ''}">${c}</b>`).join('');
          return;
        }
        [...str].forEach((c, i) => {
          const tile = box.children[i];
          if (tile.textContent !== c) {
            tile.textContent = c;
            tile.classList.remove('turn');
            void tile.offsetWidth;
            tile.classList.add('turn');
          }
        });
      }

      let lastMinute = -1;
      function tick(all) {
        const now = Date.now(), fi = focusOf(now);
        if (!all && keyOf(fi, now) !== focusKey) { render(); return; }
        if (fi >= 0) {
          const x = list[fi], live = statusOf(x, now) === 'live';
          const left = live ? x.e - now : x.s - now, p = parts(left);
          const vals = { d: p2(p.d), h: p2(p.h), m: p2(p.m), s: p2(p.s) };
          root.querySelectorAll('.cd-hero .cd-tiles').forEach(box => setTiles(box, vals[box.dataset.u], all));
          const minute = Math.floor(left / 60000), sr = root.querySelector('#cd-hero-sr');
          if (sr && minute !== lastMinute) {
            lastMinute = minute;
            sr.textContent = `${x.ev.name}: ${live ? L.endsIn : L.startsIn} ${compact(left)}`;
          }
        }
        root.querySelectorAll('.cd-row').forEach(row => {
          const x = list[+row.dataset.i], cell = row.querySelector('[data-left]'), st = statusOf(x, now);
          cell.textContent = st === 'upcoming' ? t(`in ${compact(x.s - now)}`, `${compact(x.s - now)} बाकी`)
            : st === 'live' ? t(`ends in ${compact(x.e - now)}`, `${compact(x.e - now)} में समाप्त`)
            : t(`ended ${x.ev.dateShort}`, `${x.ev.dateShort} को संपन्न`);
        });
        const fill = root.querySelector('#cd-rail-fill');
        if (fill) {
          const n = list.length - 1;
          let pos;
          if (fi < 0) pos = 1;
          else if (statusOf(list[fi], now) === 'live' || fi === 0) pos = fi / n;
          else {
            const a = list[fi - 1].e, b = list[fi].s;
            pos = (fi - 1 + (b > a ? Math.min(1, Math.max(0, (now - a) / (b - a))) : 1)) / n;
          }
          fill.style.width = (pos * 100).toFixed(3) + '%';
        }
      }

      /* ---------- dhol easter egg and party popper ---------- */
      function bump(btn) {
        btn.classList.remove('hit');
        void btn.offsetWidth;
        btn.classList.add('hit');
      }
      function onDhol(e) {
        beats = beats % BEATS.length + 1;
        const last = beats === BEATS.length;
        ctx.sound.play(last ? 'success' : 'dhol');
        bump(e.currentTarget);
        const [line, hint] = eggText();
        root.querySelector('#cd-egg-line').textContent = line;
        root.querySelector('#cd-egg-hint').textContent = hint;
        if (last) petals();
      }
      function onPop(e) {
        const r = e.currentTarget.getBoundingClientRect();
        pops++;
        ctx.sound.play('pop');
        bump(e.currentTarget);
        root.querySelector('#cd-pop-line').textContent = POPS[(pops - 1) % POPS.length];
        confetti(r.left + r.width / 2, r.top + r.height / 2);
      }
      function confetti(x, y) {
        if (ctx.reducedMotion || ctx.isStatic) return;
        const colours = ['#f5a623', '#e8791b', '#f9d3dc', '#c6f2d4', '#8f1846'];
        for (let i = 0; i < 60; i++) {
          const c = document.createElement('span');
          c.className = 'cd-confetti';
          c.style.left = x + 'px';
          c.style.top = y + 'px';
          c.style.background = colours[i % colours.length];
          document.body.appendChild(c);
          const a = Math.random() * Math.PI * 2, v = 80 + Math.random() * 180;
          const dx = Math.cos(a) * v, dy = Math.sin(a) * v - 120;
          const anim = c.animate([
            { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
            { transform: `translate(${dx}px,${dy}px) rotate(${Math.random() * 360}deg)`, opacity: 1, offset: .35 },
            { transform: `translate(${dx * 1.4}px,${dy + 420}px) rotate(${Math.random() * 900}deg)`, opacity: 0 },
          ], { duration: 1600 + Math.random() * 900, easing: 'cubic-bezier(.2,.6,.4,1)' });
          anim.onfinish = () => c.remove();
        }
      }
      function petals() {
        if (ctx.reducedMotion) return;
        const colours = ['#f5a623', '#e8791b', '#f8cf72'];
        for (let i = 0; i < 40; i++) {
          const p = document.createElement('span');
          p.className = 'cd-petal';
          p.style.left = (Math.random() * 100) + 'vw';
          p.style.background = colours[i % 3];
          p.style.setProperty('--x', (Math.random() * 140 - 70) + 'px');
          p.style.setProperty('--d', (2.4 + Math.random() * 2) + 's');
          p.style.animationDelay = (Math.random() * .8) + 's';
          p.addEventListener('animationend', () => p.remove());
          document.body.appendChild(p);
        }
      }

      render();
      ctx.ready();
      if (!ctx.isStatic) {
        setInterval(() => tick(false), 1000);
        document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(false); });
      }
    },
  });
})();
