/* Simple Card — a plain, elegant invitation: no game, no music, no sound at all (data.js marks it silent, so
   core.js mutes every sound and hides the speaker button). Works for every group (?t=simple or the /simple page);
   Hindi with ?lang=hi or the /simple-hi page. */
(function () {
  'use strict';

  // A small gold flourish between sections.
  const FLOURISH = `<svg class="sc-flourish" viewBox="0 0 160 20" aria-hidden="true">
    <path d="M4 10 H62 M98 10 H156" />
    <path d="M62 10 C70 2 76 2 80 10 C84 18 90 18 98 10" />
    <path d="M62 10 C70 18 76 18 80 10 C84 2 90 2 98 10" />
    <circle cx="80" cy="10" r="2.4" class="sc-dot" />
  </svg>`;

  Invite.register('simple', {
    render(root, ctx) {
      const esc = ctx.esc, P = ctx.P, T = ctx.T, t = ctx.t;
      const isSk = ctx.occasion.key === 'sunderkand';

      const days = ctx.days.map(d => `
        <section class="sc-day sc-in">
          <h3 class="sc-date">${esc(d.dateLong)}</h3>
          ${d.events.map(e => `
            <div class="sc-ev">
              <p class="sc-ev-name">${esc(e.name)}</p>
              <p class="sc-ev-time">${e.isTimeText ? `<i>${esc(e.time)}</i>` : esc(e.time)}${e.note ? ` <span>· ${esc(e.note)}</span>` : ''}</p>
              <p class="sc-ev-place">${esc(e.placeFull)}</p>
              ${e.dress ? `<p class="sc-ev-dress">${t('Dress code', 'वेशभूषा')}: ${esc(e.dress)}</p>` : ''}
              ${ctx.isStatic ? '' : ctx.directionsHTML(e)}
            </div>`).join('')}
        </section>`).join('');

      root.innerHTML = `
        <div class="sc-root${ctx.isStatic || ctx.reducedMotion ? ' is-still' : ''}">
          <article class="sc-card">
            <div class="sc-in sc-god">${Invite.ganeshBlockHTML({ size: 54, stroke: 2.2 })}</div>
            <p class="sc-shloka sc-in" lang="sa">${esc(isSk ? T.sunderkand : T.ganesh).replace(/\n/g, '<br>')}</p>
            ${isSk ? `<div class="sc-in sc-god">${Invite.art.hanuman({ size: 60, stroke: 2 })}</div>` : ''}

            ${FLOURISH}

            <p class="sc-greet sc-in">${esc(ctx.greeting)}</p>
            <h1 class="sc-title sc-in">${esc(ctx.occasion.title)}</h1>

            <div class="sc-invite sc-in">
              <p class="sc-bless">${ctx.hi
                ? `<span class="sc-name">${esc(P.blessings)}</span><br>के आशीर्वाद से`
                : `With the divine blessings of<br><span class="sc-name">${esc(P.blessings)}</span>`}</p>
              <p class="sc-hosts">${esc(P.groomParents)}</p>
              <p class="sc-line">${esc(ctx.occasion.line)}</p>
              <h2 class="sc-couple">
                <span>${esc(P.groom)}</span>
                <em>${t('with', 'संग')}</em>
                <span>${esc(P.bride)}</span>
              </h2>
              <p class="sc-bride">${t('Daughter of', 'सुपुत्री')} <span class="sc-name">${esc(P.brideParents)}</span></p>
            </div>

            ${FLOURISH}

            <p class="sc-kicker sc-in">${t('Celebrations', 'कार्यक्रम')}</p>
            ${days}
            ${ctx.isStatic ? '' : `<div class="sc-actions sc-in">${ctx.calendarButtonHTML()}</div>`}

            <footer class="sc-foot sc-in">
              <p class="sc-foot-k">${t('With love,', 'सप्रेम,')}</p>
              <p class="sc-foot-hosts">${esc(P.hosts)}</p>
              <p class="sc-foot-addr">${esc(P.address)}</p>
              <p class="sc-phones">${P.phones.map(p => `<a class="sc-phone" href="tel:+91${esc(p)}"><span aria-hidden="true">📞</span> ${esc(p.replace(/^(\d{5})(\d{5})$/, '$1 $2'))}</a>`).join('')}</p>
              <p class="sc-end" lang="hi">${isSk ? '॥ जय श्री राम ॥' : '॥ शुभमस्तु ॥'}</p>
            </footer>
          </article>
        </div>`;

      const done = () => ctx.ready();
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(done, done); else done();
      if (ctx.isStatic || ctx.reducedMotion) return;

      // Gentle fade-in of each block as it scrolls into view.
      const items = root.querySelectorAll('.sc-in');
      if (!('IntersectionObserver' in window)) { items.forEach(el => el.classList.add('is-on')); return; }
      const io = new IntersectionObserver(list => list.forEach(x => {
        if (x.isIntersecting) { x.target.classList.add('is-on'); io.unobserve(x.target); }
      }), { rootMargin: '0px 0px -8% 0px' });
      items.forEach(el => io.observe(el));
    },
  });
})();
