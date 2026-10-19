/* Patrika — the Hindi card. Everything in Devanagari, large type, no game: for guests who find Roman script
   hard to read. Works for every group (send with ?t=patrika or the /patrika page). Hindi wording comes from
   the hi / noteHi / spotHi / dressHi fields in data.js; when one is missing the English text is shown. */
(function () {
  'use strict';
  // What follows "<groom> संग <bride>" in the invitation sentence, per occasion (see occasionFor in core.js).
  const LINE = {
    wedding: 'के शुभ विवाह के पावन अवसर पर आपको सादर आमंत्रित करते हैं।',
    engagement: 'की सगाई एवं संगीत संध्या में आपको सादर आमंत्रित करते हैं।',
    haldi: 'के शुभ विवाह के उपलक्ष्य में हल्दी एवं भात की रस्मों में आपको सादर आमंत्रित करते हैं।',
    mehandi: 'के शुभ विवाह के उपलक्ष्य में मेहंदी एवं गीत में आपको सादर आमंत्रित करते हैं।',
    sunderkand: 'के शुभ विवाह से पूर्व, हनुमान जी के आशीर्वाद हेतु श्री सुंदरकांड पाठ में आपको सादर आमंत्रित करते हैं।',
  };

  // A marigold toran (garland) for the top edge of the card.
  function toran() {
    const n = 11, w = 540, step = w / n;
    let s = '';
    for (let i = 0; i < n; i++) {
      const x = step * i + step / 2, drop = i % 2 ? 34 : 50;
      s += `<path d="M${x - step / 2} 6 Q${x} 26 ${x + step / 2} 6" class="pk-rope"/>`;
      s += `<line x1="${x}" y1="16" x2="${x}" y2="${drop - 8}" class="pk-rope"/>`;
      s += `<circle cx="${x}" cy="${drop - 10}" r="5.5" class="pk-mg2"/><circle cx="${x}" cy="${drop}" r="7.5" class="pk-mg${i % 2 ? 1 : 3}"/>`;
      s += `<path d="M${x - 9} ${drop + 5} q9 12 18 0 q-9 4 -18 0Z" class="pk-leaf"/>`;
    }
    return `<svg class="pk-toran" viewBox="0 0 ${w} 66" preserveAspectRatio="none" aria-hidden="true">${s}</svg>`;
  }

  Invite.register('patrika', {
    render(root, ctx) {
      const esc = ctx.esc, P = ctx.P, H = P.hi || {}, T = ctx.T;
      const hi = (k) => esc(H[k] || P[k]);
      const isSk = ctx.occasion.key === 'sunderkand';
      document.documentElement.lang = 'hi';
      if (ctx.guest) document.title = `${H.groom || P.groom} संग ${H.bride || P.bride} · ${ctx.guest} के लिए`;

      const days = ctx.days.map(d => `
        <section class="pk-day pk-in">
          <h3 class="pk-date">${esc(Invite.hindi.date(d.date))}</h3>
          ${d.events.map(e => `
            <div class="pk-ev">
              <p class="pk-ev-name">${esc(e.hi || e.name)}</p>
              <p class="pk-ev-time"><span aria-hidden="true">🕰️</span> ${esc(Invite.hindi.time(e))}</p>
              ${e.note ? `<p class="pk-ev-note">${esc(e.noteHi || e.note)}</p>` : ''}
              <p class="pk-ev-place"><span aria-hidden="true">📍</span> ${esc(Invite.hindi.place(e))}</p>
              ${e.dress ? `<p class="pk-ev-note">वेशभूषा: ${esc(e.dressHi || e.dress)}</p>` : ''}
              ${ctx.isStatic ? '' : ctx.directionsHTML(e, 'रास्ता देखें (नक्शा)')}
            </div>`).join('')}
        </section>`).join('');

      root.innerHTML = `
        <div class="pk-root${ctx.isStatic || ctx.reducedMotion ? ' is-still' : ''}">
          ${toran()}
          <article class="pk-card">
            <span class="pk-corner pk-tl"></span><span class="pk-corner pk-tr"></span>
            <span class="pk-corner pk-bl"></span><span class="pk-corner pk-br"></span>

            <div class="pk-in">${Invite.ganeshBlockHTML({ size: 64, stroke: 2.2 })}</div>
            <p class="pk-shloka pk-in" lang="sa">${esc(isSk ? T.sunderkand : T.ganesh).replace(/\n/g, '<br>')}</p>
            ${isSk ? `<div class="pk-in pk-art">${Invite.art.hanuman({ size: 70, stroke: 2 })}</div>` : ''}

            <div class="pk-rule pk-in" aria-hidden="true"><span>❁</span></div>

            <p class="pk-kicker pk-in">सादर आमंत्रण</p>
            <p class="pk-greet pk-in">${ctx.guest ? esc(ctx.guest) : 'प्रिय परिवारजन एवं मित्रगण'}</p>
            <h1 class="pk-title pk-in">${esc(ctx.occasion.titleHi)}</h1>

            <div class="pk-invite pk-in">
              <p class="pk-bless">${hi('blessings')}<br><span>के आशीर्वाद से</span></p>
              <p class="pk-hosts">${hi('groomParents')}</p>
              <p class="pk-lead">अपने सुपुत्र</p>
              <h2 class="pk-couple">
                <span>चि. ${hi('groom')}</span>
                <em>संग</em>
                <span>सौ.कां. ${hi('bride')}</span>
              </h2>
              <p class="pk-bride">सुपुत्री ${hi('brideParents')}</p>
              <p class="pk-line">${esc(LINE[ctx.occasion.key])}</p>
            </div>

            <div class="pk-rule pk-in" aria-hidden="true"><span>❁</span></div>
            <p class="pk-kicker pk-in">कार्यक्रम</p>
            ${days}
            ${ctx.isStatic ? '' : `<div class="pk-actions pk-in">${ctx.calendarButtonHTML('कैलेंडर में जोड़ें')}</div>`}

            <footer class="pk-foot pk-in">
              <p class="pk-foot-k">स्वागतोत्सुक</p>
              <p class="pk-foot-hosts">${hi('hosts')}</p>
              <p class="pk-foot-addr">${hi('address')}</p>
              <p class="pk-phones">${P.phones.map(p => `<a class="pk-phone" href="tel:+91${esc(p)}"><span aria-hidden="true">📞</span> ${esc(p.replace(/^(\d{5})(\d{5})$/, '$1 $2'))}</a>`).join('')}</p>
              <p class="pk-end">${isSk ? '॥ जय श्री राम ॥' : '॥ शुभमस्तु ॥'}</p>
            </footer>
          </article>
        </div>`;

      const done = () => ctx.ready();
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(done, done); else done();
      if (ctx.isStatic || ctx.reducedMotion) return;

      // Gentle fade-in of each block as it scrolls into view.
      const items = root.querySelectorAll('.pk-in');
      if (!('IntersectionObserver' in window)) { items.forEach(el => el.classList.add('is-on')); return; }
      const io = new IntersectionObserver(list => list.forEach(x => {
        if (x.isIntersecting) { x.target.classList.add('is-on'); io.unobserve(x.target); }
      }), { rootMargin: '0px 0px -8% 0px' });
      items.forEach(el => io.observe(el));
      root.addEventListener('click', e => { if (e.target.closest('.inv-dir')) ctx.sound.play('tap'); });
    },
  });
})();
