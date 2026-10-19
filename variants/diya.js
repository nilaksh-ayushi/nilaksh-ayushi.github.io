/* Diya — devotional signature variant (G1 Sunderkand).
   Tap to light a brass diya: a spark, the flame, a temple bell, and the warm light spreads to reveal the card. */
(function () {
  'use strict';

  /* ---------- drawings ---------- */
  function defsSVG() {
    return `<svg class="diya-defs" width="0" height="0" aria-hidden="true" focusable="false"><defs>
      <linearGradient id="diyaBrass" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stop-color="#5a300a"/><stop offset=".2" stop-color="#a86f22"/>
        <stop offset=".42" stop-color="#f3d27c"/><stop offset=".6" stop-color="#d39a3a"/>
        <stop offset=".85" stop-color="#8a5416"/><stop offset="1" stop-color="#55300b"/>
      </linearGradient>
      <linearGradient id="diyaRim" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stop-color="#fbe6a2"/><stop offset="1" stop-color="#b47c26"/>
      </linearGradient>
      <radialGradient id="diyaOil" cx=".5" cy=".4" r=".65">
        <stop offset="0" stop-color="#8a4a0e"/><stop offset="1" stop-color="#341503"/>
      </radialGradient>
      <radialGradient id="diyaFlameO" cx=".5" cy=".9" r=".85" fx=".5" fy=".92">
        <stop offset="0" stop-color="#fff7cf"/><stop offset=".3" stop-color="#ffd24f"/>
        <stop offset=".66" stop-color="#ff9320"/><stop offset="1" stop-color="#e2441b"/>
      </radialGradient>
      <linearGradient id="diyaFlameI" x1="0" x2="0" y1="1" y2="0">
        <stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#fff3b4"/><stop offset="1" stop-color="#ffd862"/>
      </linearGradient>
      <radialGradient id="diyaSheen" cx=".5" cy=".18" r=".7">
        <stop offset="0" stop-color="#ffe7a4" stop-opacity=".85"/><stop offset="1" stop-color="#ffe7a4" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="diyaFlash">
        <stop offset="0" stop-color="#ffffff"/><stop offset=".4" stop-color="#ffeaa2" stop-opacity=".85"/>
        <stop offset="1" stop-color="#ffb040" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="diyaSindoor" cx=".5" cy=".38" r=".65">
        <stop offset="0" stop-color="#d9482b"/><stop offset="1" stop-color="#7a1710"/>
      </radialGradient>
      <linearGradient id="diyaFadeL" x1="0" x2="1"><stop offset="0" stop-color="#e2bd66" stop-opacity="0"/><stop offset="1" stop-color="#e2bd66"/></linearGradient>
      <linearGradient id="diyaFadeR" x1="1" x2="0"><stop offset="0" stop-color="#e2bd66" stop-opacity="0"/><stop offset="1" stop-color="#e2bd66"/></linearGradient>
      <linearGradient id="diyaGadaG" x1="0" x2="1"><stop offset="0" stop-color="#9a6420"/><stop offset=".45" stop-color="#f4d68a"/><stop offset="1" stop-color="#a06a22"/></linearGradient>
    </defs></svg>`;
  }

  function lampSVG() {
    const sparks = Array.from({ length: 9 }, (_, k) => {
      const a = (-165 + k * (150 / 8)) * Math.PI / 180, d = 16 + (k % 3) * 7;
      return `<circle class="diya-spark" r="${(1.2 + (k % 2) * .7).toFixed(1)}" style="--dx:${(Math.cos(a) * d).toFixed(1)}px;--dy:${(Math.sin(a) * d).toFixed(1)}px"/>`;
    }).join('');
    const body = `
      <path d="M80 168 L72 186 Q100 193 128 186 L120 168 Z"/>
      <path d="M36 128 C38 158 68 176 100 176 C132 176 162 158 164 128 Z"/>
      <ellipse cx="100" cy="128" rx="64" ry="13"/>`;
    return `<svg class="diya-svg" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      <ellipse cx="100" cy="191" rx="50" ry="5" fill="#000" opacity=".4"/>
      <path d="M80 168 L72 186 Q100 193 128 186 L120 168 Z" fill="url(#diyaBrass)"/>
      <ellipse cx="100" cy="186.5" rx="27" ry="3.4" fill="url(#diyaRim)" opacity=".55"/>
      <path d="M36 128 C38 158 68 176 100 176 C132 176 162 158 164 128 Z" fill="url(#diyaBrass)"/>
      <path d="M44 145 C64 161 136 161 156 145" fill="none" stroke="#5a300a" stroke-width="1.1" opacity=".6"/>
      <path d="M47 151 C66 165.5 134 165.5 153 151" fill="none" stroke="#f8dc8e" stroke-width="2.3" stroke-dasharray="0 7.2" stroke-linecap="round" opacity=".75"/>
      <path d="M51 157 C69 170 131 170 149 157" fill="none" stroke="#5a300a" stroke-width="1.1" opacity=".6"/>
      <ellipse cx="100" cy="128" rx="64" ry="13" fill="url(#diyaRim)"/>
      <ellipse cx="100" cy="129" rx="55" ry="8.8" fill="url(#diyaOil)"/>
      <clipPath id="diyaBowlClip">${body}</clipPath>
      <ellipse class="diya-sheen" cx="100" cy="134" rx="66" ry="42" fill="url(#diyaSheen)" clip-path="url(#diyaBowlClip)"/>
      <g class="diya-shade" fill="#0d0304">${body}</g>
      <path d="M95 131 Q99 125 100 117" stroke="#3b1e0a" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path d="M100 117 l.4 -1.8" stroke="#140902" stroke-width="2.4" stroke-linecap="round"/>
      <g transform="translate(100 115)"><circle class="diya-flash" r="15" fill="url(#diyaFlash)"/>${sparks}</g>
      <g transform="translate(100 124)"><g class="diya-flame">
        <path class="diya-flame-o" d="M0 0 C-17 -3 -19 -26 -9 -44 C-4 -54 -1 -66 0 -82 C2 -66 5 -55 10 -44 C19 -27 17 -3 0 0Z" fill="url(#diyaFlameO)"/>
        <path class="diya-flame-i" d="M0 -3 C-8 -5 -9 -18 -5 -28 C-2 -35 -1 -43 0 -52 C1 -43 3 -35 5 -28 C9 -18 8 -5 0 -3Z" fill="url(#diyaFlameI)"/>
        <ellipse cx="0" cy="-7" rx="3.4" ry="5" fill="#86b8ff" opacity=".5"/>
      </g></g>
    </svg>`;
  }

  function bellSVG() {
    return `<svg viewBox="0 0 56 100" aria-hidden="true" focusable="false"><g class="diya-bell-swing">
      <line x1="28" y1="0" x2="28" y2="33" stroke="#c99a45" stroke-width="2.4" stroke-dasharray="4 2.6" stroke-linecap="round"/>
      <circle cx="28" cy="37" r="4.4" fill="none" stroke="#dcb35c" stroke-width="2"/>
      <path d="M28 41 C16 41 13 54 12 66 C11 74 7 78 4 82 L52 82 C49 78 45 74 44 66 C43 54 40 41 28 41Z" fill="url(#diyaBrass)"/>
      <path d="M14.5 62 H41.5" stroke="#5a300a" stroke-width="1" opacity=".55"/>
      <path d="M13.6 67 H42.4" stroke="#f8dc8e" stroke-width="1.8" stroke-dasharray="0 4.5" stroke-linecap="round" opacity=".75"/>
      <rect x="3" y="81" width="50" height="4.2" rx="2.1" fill="#a8722a"/>
      <line x1="28" y1="85" x2="28" y2="88" stroke="#a8722a" stroke-width="1.6"/>
      <circle cx="28" cy="91" r="4.2" fill="#d6a64e"/>
    </g></svg>`;
  }

  // A gada (Hanuman ji's mace) drawn head-up around (140,50), then laid flat: dir -1 points the head left.
  function gadaSVG(tx, dir) {
    return `<g transform="translate(${tx} 50) rotate(${dir * 90}) scale(.9) translate(-140 -50)">
      <path d="M140 3 L143.6 11.5 L136.4 11.5 Z" fill="#f0cd7c"/>
      <circle cx="140" cy="23" r="12" fill="url(#diyaGadaG)"/>
      <path d="M134 13.5 Q130.5 23 134 32.5 M140 11 V35 M146 13.5 Q149.5 23 146 32.5" fill="none" stroke="#6b3f12" stroke-width="1" opacity=".6"/>
      <rect x="134" y="34" width="12" height="4" rx="1.6" fill="#e2bd66"/>
      <rect x="138" y="38" width="4" height="50" rx="2" fill="url(#diyaGadaG)"/>
      <path d="M137.6 76 H142.4 M137.6 80 H142.4" stroke="#6b3f12" stroke-width="1" opacity=".6"/>
      <circle cx="140" cy="91.5" r="4" fill="#e2bd66"/>
    </g>`;
  }

  // Hanuman ji's doodle (from core's shared art) inside a gold halo, flanked by fading rules and dots.
  function hanumanMotif() {
    const art = (Invite.art && Invite.art.hanuman) ? Invite.art.hanuman({ size: 104, className: 'diya-hmn-art' }) : '';
    return `<div class="diya-hmn" role="img" aria-label="Hanuman ji">
      <span class="diya-hmn-line diya-hmn-l" aria-hidden="true"></span><i class="diya-hmn-dot" aria-hidden="true"></i>
      <span class="diya-hmn-halo">${art}</span>
      <i class="diya-hmn-dot" aria-hidden="true"></i><span class="diya-hmn-line diya-hmn-r" aria-hidden="true"></span>
    </div>`;
  }

  function motifSVG(isSK) {
    if (isSK) return hanumanMotif();
    const word = 'श्री';
    const sides = isSK
      ? `<path d="M0 50 H24" stroke="url(#diyaFadeL)" stroke-width="1.2"/><path d="M276 50 H300" stroke="url(#diyaFadeR)" stroke-width="1.2"/>
         ${gadaSVG(70, -1)}${gadaSVG(230, 1)}`
      : `<path d="M10 50 H106" stroke="url(#diyaFadeL)" stroke-width="1.2"/><path d="M194 50 H290" stroke="url(#diyaFadeR)" stroke-width="1.2"/>
         <circle cx="108" cy="50" r="1.8" fill="#e2bd66"/><circle cx="192" cy="50" r="1.8" fill="#e2bd66"/>`;
    return `<svg viewBox="0 0 300 100" role="img" aria-label="${word}" focusable="false">
      ${sides}
      <circle cx="150" cy="50" r="36" fill="none" stroke="#e2bd66" stroke-width="2.4" stroke-dasharray="0 6.6" stroke-linecap="round" opacity=".85"/>
      <circle cx="150" cy="50" r="31" fill="#2a080b" stroke="#e2bd66" stroke-width="1.5"/>
      <circle cx="150" cy="50" r="27" fill="url(#diyaSindoor)"/>
      <circle cx="150" cy="50" r="24" fill="none" stroke="#f3cf7a" stroke-width=".8" opacity=".6"/>
      <text x="150" y="59" text-anchor="middle" class="diya-motif-word">${word}</text>
    </svg>`;
  }

  function dividerSVG() {
    return `<svg viewBox="0 0 220 18" aria-hidden="true" focusable="false">
      <path d="M0 9 H92" stroke="url(#diyaFadeL)" stroke-width="1"/><path d="M128 9 H220" stroke="url(#diyaFadeR)" stroke-width="1"/>
      <circle cx="97" cy="9" r="1.6" fill="#e2bd66"/><circle cx="123" cy="9" r="1.6" fill="#e2bd66"/>
      <path d="M110 1.5 L117.5 9 L110 16.5 L102.5 9 Z" fill="none" stroke="#e2bd66" stroke-width="1"/>
      <path d="M110 5.5 L113.5 9 L110 12.5 L106.5 9 Z" fill="#f59a32"/>
    </svg>`;
  }

  function cornerSVG(pos) {
    return `<svg class="diya-corner diya-corner-${pos}" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <path d="M1.5 39 V15 Q1.5 1.5 15 1.5 H39" fill="none" stroke="currentColor" stroke-width="1.2"/>
      <path d="M7 39 V19 Q7 7 19 7 H39" fill="none" stroke="currentColor" stroke-width=".8" opacity=".65"/>
      <path d="M13 22 Q13 13 22 13" fill="none" stroke="currentColor" stroke-width=".9" opacity=".8"/>
      <circle cx="13" cy="13" r="2.2" fill="#f59a32"/>
    </svg>`;
  }

  const PETAL = '<svg viewBox="0 0 20 28" aria-hidden="true"><path d="M10 1 C16 6 18 17 10 27 C2 17 4 6 10 1Z" fill="currentColor"/><path d="M10 4 V24" stroke="rgba(110,36,0,.35)" stroke-width=".8"/></svg>';

  /* ---------- variant ---------- */
  Invite.register('diya', {
    render(root, ctx) {
      const esc = ctx.esc, P = ctx.P, T = ctx.T;
      const isSK = ctx.events.some(e => e.id === 'sunderkand');
      const rm = ctx.reducedMotion;
      const auto = !ctx.isStatic && /[?&]auto=1(&|$)/.test(location.search);
      const verse = (isSK ? T.sunderkand : T.ganesh).split('\n');
      const embers = [[-14, 3.6, 0], [10, 4.4, 1.2], [-6, 3.9, 2.1], [16, 4.8, .6], [-10, 4.1, 2.9], [6, 3.4, 1.7]]
        .map(([dx, t, d]) => `<i style="--dx:${dx}px;--t:${t}s;--d:${d}s"></i>`).join('');
      let n = 0;
      const rv = () => `diya-rv" style="--i:${n++}`;

      const cls = ['diya-root'];
      if (rm) cls.push('is-rm');
      if (ctx.isStatic) cls.push('is-instant', 'is-lit', 'is-revealed', 'is-unveiled');

      root.innerHTML = `
        <div class="${cls.join(' ')}">
          ${defsSVG()}
          <div class="diya-bg" aria-hidden="true"></div>
          <div class="diya-bg diya-bg-lit" aria-hidden="true"></div>
          <div class="diya-light" aria-hidden="true"><div class="diya-wave"></div></div>
          <div class="diya-petals" aria-hidden="true"></div>
          <section class="diya-hero">
            <button class="diya-bell" type="button" aria-label="Ring the temple bell">${bellSVG()}</button>
            <p class="diya-kicker" lang="hi">सादर आमंत्रण</p>
            <h1 class="diya-greet">${esc(ctx.greeting)}</h1>
            <button class="diya-lamp" type="button" aria-label="Light the diya">
              <span class="diya-glow" aria-hidden="true"></span>
              ${lampSVG()}
              <span class="diya-embers" aria-hidden="true">${embers}</span>
            </button>
            <p class="diya-hint">Tap to light the diya 🪔</p>
            <button class="diya-skip" type="button">Skip to details</button>
          </section>
          <section class="diya-card" aria-label="Invitation">
            <div class="diya-sheet">
              ${cornerSVG('tl')}${cornerSVG('tr')}${cornerSVG('bl')}${cornerSVG('br')}
              <p class="diya-ganesh ${rv()}" lang="hi">${esc(T.ganeshShort)}</p>
              ${(Invite.art && Invite.art.ganesh) ? `<div class="diya-ganesh-art ${rv()}">${Invite.art.ganesh({ size: 46, className: 'diya-gn' })}</div>` : ''}
              <div class="diya-motif ${rv()}">${motifSVG(isSK)}</div>
              <blockquote class="diya-verse ${rv()}" lang="hi">
                ${verse.map(l => `<span>${esc(l)}</span>`).join('')}
                ${isSK ? '<cite>श्री रामचरितमानस · सुंदरकांड</cite>' : ''}
              </blockquote>
              <div class="diya-div ${rv()}">${dividerSVG()}</div>
              <h2 class="diya-title ${rv()}">${esc(ctx.occasion.title)}<span lang="hi">${esc(ctx.occasion.titleHi)}</span></h2>
              ${P.blessings ? `<p class="diya-bless ${rv()}">With the blessings of ${esc(P.blessings)}</p>` : ''}
              <p class="diya-hosts ${rv()}">${esc(P.groomParents)}</p>
              <p class="diya-line ${rv()}">${esc(ctx.occasion.line)}</p>
              <p class="diya-couple ${rv()}"><span>${esc(P.groom)}</span><em>with</em><span>${esc(P.bride)}</span></p>
              <p class="diya-bride ${rv()}">Daughter of ${esc(P.brideParents)}</p>
              <div class="diya-div diya-mark ${rv()}" id="diya-details">${dividerSVG()}<p class="diya-dkick">When &amp; where</p></div>
              <div class="diya-sum ${rv()}">${ctx.summaryHTML({ heading: false })}</div>
            </div>
            <p class="diya-close ${rv()}" lang="hi">${isSK ? '॥ जय श्री राम ॥' : '॥ शुभमस्तु ॥'}</p>
          </section>
        </div>`;

      const el = root.querySelector('.diya-root');
      const lamp = el.querySelector('.diya-lamp');
      const bell = el.querySelector('.diya-bell');
      const light = el.querySelector('.diya-light');
      const mark = el.querySelector('#diya-details');
      const later = (fn, ms) => setTimeout(fn, ms);
      // Scroll the window only: scrollIntoView would also scroll the overflow-clipped root itself.
      const toDetails = () => {
        const top = mark.getBoundingClientRect().top + (window.pageYOffset || 0) - 16;
        try { window.scrollTo({ top, behavior: rm ? 'auto' : 'smooth' }); } catch (e) { window.scrollTo(0, top); }
      };

      if (ctx.isStatic) {
        let done = false;
        const fin = () => { if (!done) { done = true; ctx.ready(); } };
        const fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
        fonts.then(() => requestAnimationFrame(() => requestAnimationFrame(fin)));
        later(fin, 2500);
        return;
      }

      let state = 0; // 0 unlit · 1 striking · 2 lit · 3 revealed

      function ring(silent) {
        bell.classList.remove('is-swing');
        void bell.offsetWidth;
        bell.classList.add('is-swing');
        if (!silent) ctx.sound.play('bell');
      }

      function spawnPetals() {
        if (rm) return;
        const box = el.querySelector('.diya-petals');
        const colors = ['#f6a21e', '#ef8614', '#e8641c', '#f9b934', '#d9481c'];
        let seed = 7;
        const rnd = (a, b) => { seed = (seed * 9301 + 49297) % 233280; return a + (b - a) * seed / 233280; };
        let html = '';
        for (let i = 0; i < 9; i++) {
          html += `<span class="diya-petal" style="--l:${rnd(3, 95).toFixed(1)}%;--s:${rnd(10, 16).toFixed(1)}px;` +
            `--t:${rnd(17, 27).toFixed(1)}s;--d:${(i * 1.6 + rnd(0, 1.5)).toFixed(1)}s;--dx:${rnd(-40, 40).toFixed(0)}px;` +
            `--r0:${rnd(0, 180).toFixed(0)}deg;color:${colors[i % colors.length]}">${PETAL}</span>`;
        }
        box.innerHTML = html;
      }

      function finish() { el.classList.add('is-unveiled'); ctx.ready(); }

      function reveal() {
        if (state === 3) return;
        state = 3;
        const r = lamp.getBoundingClientRect();
        light.style.setProperty('--x', (r.left + r.width / 2).toFixed(0) + 'px');
        light.style.setProperty('--y', (r.top + r.height * .41).toFixed(0) + 'px');
        el.classList.add('is-revealed');
        spawnPetals();
        later(finish, rm ? 900 : 3600);
      }

      function lit() {
        if (state >= 2) return;
        state = 2;
        el.classList.add('is-lit');
        lamp.setAttribute('aria-label', 'The diya is lit');
        ring();
      }

      function lightDiya() {
        if (state > 0) {
          if (state >= 2) { lamp.classList.remove('is-flare'); void lamp.offsetWidth; lamp.classList.add('is-flare'); }
          return;
        }
        state = 1;
        if (rm) { lit(); later(reveal, 400); return; }
        el.classList.add('is-striking');
        ctx.sound.play('splash');
        later(lit, 420);
        later(reveal, 1350);
      }

      function skip() {
        if (state < 3) {
          state = 2;
          el.classList.add('is-instant', 'is-lit');
          lamp.setAttribute('aria-label', 'The diya is lit');
          reveal();
          finish();
        }
        requestAnimationFrame(toDetails);
      }

      lamp.addEventListener('click', lightDiya);
      bell.addEventListener('click', () => ring());
      el.querySelector('.diya-skip').addEventListener('click', skip);

      if (auto) {
        later(() => ring(), 900);
        later(lightDiya, 2200);
        later(toDetails, 7600);
      }
    },
  });
})();
