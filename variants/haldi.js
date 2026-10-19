/* Haldi Splash — the card starts as plain white kurta cloth. Every tap (or drag) throws a handful of
   turmeric; the splats cut through the cloth and reveal the invitation underneath. After ~8 throws
   (or enough estimated coverage, or "Splash it all!") it bursts into marigold petals and the full
   details appear. Canvas work is cheap: DPR capped at 2, no pixel reads, coverage estimated from splat areas. */
(function () {
  'use strict';
  // Minimal Ganesh doodle (shared art from core.js), shown right after "Shri Ganeshay Namah".
  const GANESH = () => (window.Invite && Invite.art && Invite.art.ganesh) ? Invite.art.ganesh({ size: 42, className: 'haldi-ganesh-art' }) : '';

  const QUIPS = {
    bhaat: 'Mama ji arrives with blessings and gifts 🎁',
    haldi: 'A splash of turmeric, a touch of blessings, and a whole lot of love 💛',
    sunderkand: 'Hanuman ji’s blessings before the big days 🙏',
    mehandi: 'Henna, geet and a name hidden in the patterns 🌿',
    engagement: 'Rings, rhythm and a dance floor that won’t rest 💍',
    ghudchadi: 'Sehra on, ghodi ready, dulha shining 🐎',
    baraat: 'Dhol bajega, sab naachenge 🥁',
    dinner: 'Feast mode: fully on 🍽️',
    vidaai: 'Under the stars, with full hearts ✨',
  };
  const SUBS = {
    bhaat: 'A sister’s joy doubles when her brother stands by her side to bless her son.',
  };
  const FALLBACK = 'Come with love, leave with blessings 💛';
  const RAINBOW = ['#e53935', '#fb8c00', '#fdd835', '#43a047', '#1e88e5', '#3949ab', '#8e24aa'];
  const TAPS_TO_REVEAL = 8;
  const COVER_TO_REVEAL = 0.6;
  // Normalised spots used by auto mode, the keyboard and "Splash it all!".
  const SPOTS = [[0.28, 0.1], [0.74, 0.2], [0.36, 0.34], [0.8, 0.46], [0.22, 0.57], [0.64, 0.68], [0.3, 0.82], [0.74, 0.93],
    [0.55, 0.05], [0.5, 0.52], [0.15, 0.3], [0.85, 0.78]];

  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  /* An organic splat in unit space: a wobbly outline with a few tongues, plus droplets around it.
     drops: [x, y, size, angle, stretch] */
  function makeShape(rand) {
    const n = 20 + Math.floor(rand() * 6), rot = rand() * Math.PI * 2, TAU = Math.PI * 2;
    let rads = [];
    for (let i = 0; i < n; i++) rads.push(0.72 + rand() * 0.3);
    rads = rads.map((r, i) => (r * 2 + rads[(i + n - 1) % n] + rads[(i + 1) % n]) / 4);
    const drops = [];
    const spikes = 2 + Math.floor(rand() * 3);
    for (let s = 0; s < spikes; s++) {
      const i = Math.floor(rand() * n);
      rads[i] = 1.25 + rand() * 0.35;
      const a = rot + i / n * TAU, d = rads[i] * 0.95 + 0.12;
      drops.push([Math.cos(a) * d, Math.sin(a) * d, 0.08 + rand() * 0.04, a, 1]);
    }
    const pts = rads.map((r, i) => { const a = rot + i / n * TAU; return [Math.cos(a) * r, Math.sin(a) * r]; });
    const nd = 5 + Math.floor(rand() * 7);
    for (let k = 0; k < nd; k++) {
      const a = rand() * TAU, d = 1.15 + rand() * 0.75, sz = 0.035 + rand() * 0.07;
      drops.push([Math.cos(a) * d, Math.sin(a) * d, sz, a, 1 + rand() * 1.3]);
    }
    return { pts, drops };
  }

  function traceBlob(c, sh, cx, cy, R) {
    const p = sh.pts, n = p.length;
    const X = i => cx + p[i % n][0] * R, Y = i => cy + p[i % n][1] * R;
    c.moveTo((X(n - 1) + X(0)) / 2, (Y(n - 1) + Y(0)) / 2);
    for (let i = 0; i < n; i++) c.quadraticCurveTo(X(i), Y(i), (X(i) + X(i + 1)) / 2, (Y(i) + Y(i + 1)) / 2);
    c.closePath();
  }

  function blobD(sh, cx, cy, R) {
    const p = sh.pts, n = p.length, f = v => v.toFixed(1);
    const X = i => cx + p[i % n][0] * R, Y = i => cy + p[i % n][1] * R;
    let d = `M${f((X(n - 1) + X(0)) / 2)} ${f((Y(n - 1) + Y(0)) / 2)}`;
    for (let i = 0; i < n; i++) d += `Q${f(X(i))} ${f(Y(i))} ${f((X(i) + X(i + 1)) / 2)} ${f((Y(i) + Y(i + 1)) / 2)}`;
    return d + 'Z';
  }

  function splatSVG(sh, fill, rim) {
    const R = 22, c = 50;
    const drops = sh.drops.map(d => {
      const x = (c + d[0] * R).toFixed(1), y = (c + d[1] * R).toFixed(1);
      return `<ellipse cx="${x}" cy="${y}" rx="${(d[2] * R * d[4]).toFixed(1)}" ry="${(d[2] * R).toFixed(1)}" transform="rotate(${(d[3] * 180 / Math.PI).toFixed(0)} ${x} ${y})" fill="${fill}"/>`;
    }).join('');
    return `<svg viewBox="0 0 100 100" width="100%" height="100%" focusable="false"><path d="${blobD(sh, c, c, R)}" fill="${fill}" stroke="${rim}" stroke-width="1.2"/>${drops}</svg>`;
  }

  /* ---------- decor ---------- */
  function marigold(x, y, r, c1, c2) {
    let s = '';
    for (let i = 0; i < 10; i++) {
      const a = i / 10 * Math.PI * 2;
      s += `<circle cx="${(x + Math.cos(a) * r * 0.6).toFixed(1)}" cy="${(y + Math.sin(a) * r * 0.6).toFixed(1)}" r="${(r * 0.48).toFixed(1)}" fill="${c1}"/>`;
    }
    return s + `<circle cx="${x}" cy="${y}" r="${(r * 0.62).toFixed(1)}" fill="${c2}"/><circle cx="${x}" cy="${y}" r="${(r * 0.22).toFixed(1)}" fill="#b45309" opacity=".55"/>`;
  }
  function leaf(x, y, len, rot, fill) {
    return `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M0 0C7 ${len * 0.25} 6 ${len * 0.7} 0 ${len}C-6 ${len * 0.7} -7 ${len * 0.25} 0 0Z" fill="${fill || '#3f8a24'}"/><path d="M0 2V${len - 3}" stroke="#2b6316" stroke-width=".8"/></g>`;
  }
  const ORANGE = ['#f2780c', '#f59f00'], YELLOW = ['#f7b500', '#ffd43b'];
  function toranSVG() {
    let s = '';
    for (let x = 30; x < 540; x += 60) s += leaf(x - 6, 9, 34, 22) + leaf(x + 6, 9, 34, -22, '#4f9a2c');
    for (let x = 0; x <= 540; x += 60) {
      s += `<path d="M${x} 9V58" stroke="#7a4a12" stroke-width="1"/>`;
      [22, 37, 52].forEach((y, i) => { const c = i % 2 ? YELLOW : ORANGE; s += marigold(x, y, 7, c[0], c[1]); });
      s += `<path d="M${x} 59c3 2 3 6 0 8c-3-2-3-6 0-8z" fill="#d6336c"/>`;
    }
    s += '<path d="M0 8H540" stroke="#7a4a12" stroke-width="2"/>';
    for (let x = 10, i = 0; x < 540; x += 20, i++) { const c = i % 2 ? YELLOW : ORANGE; s += marigold(x, 8, 7.5, c[0], c[1]); }
    return `<svg class="haldi-toran" viewBox="0 0 540 70" preserveAspectRatio="xMidYMin slice" aria-hidden="true" focusable="false">${s}</svg>`;
  }
  function sprig(cls) {
    return `<svg class="haldi-sprig ${cls}" viewBox="0 0 70 50" aria-hidden="true" focusable="false">
      ${leaf(10, 10, 36, -62)}${leaf(12, 12, 30, -20, '#4f9a2c')}${leaf(8, 14, 26, -100, '#5aa832')}
      ${marigold(12, 12, 9, ORANGE[0], ORANGE[1])}</svg>`;
  }
  const ROSE = '<svg viewBox="0 0 20 28" focusable="false"><path d="M10 0C20 6 20 22 10 28C0 22 0 6 10 0Z" fill="#e0457b"/><path d="M10 4C13 10 13 18 10 24" stroke="#b8235a" stroke-width=".8" fill="none" opacity=".6"/></svg>';

  Invite.register('haldi', {
    render(root, ctx) {
      const esc = ctx.esc, P = ctx.P, S = ctx.isStatic, RM = ctx.reducedMotion;
      const auto = !S && new URLSearchParams(location.search).get('auto') === '1';
      const rand = mulberry32(20261203);
      const isHaldi = ctx.occasion.key === 'haldi';

      /* ----- card content (what the splashes reveal) ----- */
      function timeHTML(e) {
        const m = !e.isTimeText && /^(\d{1,2}:\d{2})\s*([AP]M)$/i.exec(e.time);
        return m ? `<b>${esc(m[1])}</b><small>${esc(m[2].toUpperCase())}</small>` : `<i>${esc(e.time)}</i>`;
      }
      const allMorning = ctx.days.length === 1 && ctx.events.every(e => e.start && +e.start.slice(0, 2) < 12);
      const schedTitle = allMorning ? '☀️ Morning schedule' : ctx.days.length > 1 ? '🗓️ Your celebration schedule' : '🗓️ The schedule';
      const sched = ctx.days.map(d => `
        <div class="haldi-day">
          <p class="haldi-day-h">${esc(d.dateLong)}</p>
          ${d.events.map(e => `
            <div class="haldi-ev">
              <div class="haldi-ev-time">${timeHTML(e)}</div>
              <div class="haldi-ev-body">
                <p class="haldi-ev-name">${esc(e.name)} <span lang="hi">${esc(e.hi)}</span></p>
                <p class="haldi-ev-quip">${esc(QUIPS[e.id] || FALLBACK)}</p>
                ${SUBS[e.id] ? `<p class="haldi-ev-sub">“${esc(SUBS[e.id])}”</p>` : ''}
                <p class="haldi-ev-place"><span aria-hidden="true">📍</span> ${esc(e.place)}${e.note ? ` · <span class="haldi-ev-note">${esc(e.note)}</span>` : ''}</p>
              </div>
            </div>`).join('')}
        </div>`).join('');
      const dressEvs = ctx.events.filter(e => e.dress);
      const isRainbow = dressEvs.some(e => /rainbow/i.test(e.dress));
      const dress = dressEvs.length ? `
        <div class="haldi-rainbow">
          <p class="haldi-rainbow-h">${isRainbow ? 'Wear the rainbow 🌈' : 'Dress code 👗'}</p>
          ${isRainbow ? `<div class="haldi-swatches" aria-hidden="true">${RAINBOW.map(c => `<span style="background:${c}"></span>`).join('')}</div>` : ''}
          ${dressEvs.map(e => `<p class="haldi-rainbow-t"><b>${esc(e.name)}:</b> ${esc(e.dress)}</p>`).join('')}
        </div>` : '';
      const tex = [[18, 12, 150], [86, 48, 190], [22, 86, 170]].map(t =>
        `<span style="left:${t[0]}%;top:${t[1]}%;width:${t[2]}px;height:${t[2]}px">${splatSVG(makeShape(rand), 'rgba(255,255,255,.28)', 'none')}</span>`).join('');
      const cardHTML = `
        <div class="haldi-card-tex" aria-hidden="true">${tex}</div>
        <div class="haldi-card-in">
          <p class="haldi-ganesh" lang="hi">${esc(ctx.T.ganeshShort)}</p>${GANESH()}
          <h1 class="haldi-title"><span class="haldi-title-hi" lang="hi">${esc(ctx.occasion.titleHi)}</span><span class="haldi-title-en">${esc(ctx.occasion.title)}</span></h1>
          <p class="haldi-bless"><small>With the divine blessings of</small>${esc(P.blessings)}</p>
          <p class="haldi-hosts"><strong>${esc(P.groomParents)}</strong> ${esc(ctx.occasion.line)}</p>
          <h2 class="haldi-couple"><span>${esc(P.groom)}</span> <em>&amp;</em> <span>${esc(P.bride)}</span></h2>
          <p class="haldi-bride">${esc(P.bride)}, daughter of ${esc(P.brideParents)}</p>
          <div class="haldi-sched"><h3 class="haldi-sched-h">${schedTitle}</h3>${sched}</div>
          ${dress}
        </div>`;

      const border = [[-1, 5, 78], [101, 15, 66], [-2, 44, 60], [102, 57, 74], [5, 99, 70], [95, 98, 80], [62, -1, 56], [28, 101, 48]]
        .map((b, i) => `<span class="haldi-bsplat" style="left:${b[0]}%;top:${b[1]}%;width:${b[2]}px;height:${b[2]}px;--i:${i}">${
          splatSVG(makeShape(rand), i % 2 ? '#f2900c' : '#f6b40e', 'rgba(170,80,0,.35)')}</span>`).join('');
      const roses = [[88, 118, 12, 30], [6, 132, 10, -20], [94, 168, 9, 70]].map(r =>
        `<span class="haldi-rose" style="left:${r[0]}%;top:${r[1]}px;width:${r[2]}px;transform:rotate(${r[3]}deg)">${ROSE}</span>`).join('');

      const subStatic = isHaldi ? 'Haldi lag gayi! Here’s your sunny invitation 💛' : 'Rang lag gaya! Here’s your sunny invitation 💛';
      root.innerHTML = `
        <div class="haldi-stage${S ? ' haldi-static' : ''}">
          ${toranSVG()}
          <div class="haldi-roses" aria-hidden="true">${roses}</div>
          <header class="haldi-head">
            <div class="haldi-head-row">
              <p class="haldi-kicker">Haldi Splash <span aria-hidden="true">💛</span></p>
              ${S ? '' : '<button type="button" class="haldi-skip">Skip to details ↓</button>'}
            </div>
            <p class="haldi-greet">${esc(ctx.greeting)},</p>
            <p class="haldi-sub">${S ? subStatic : 'Something sunny is hiding under this kurta…'}</p>
          </header>
          <div class="haldi-cardwrap${S ? ' haldi-revealed' : ''}">
            <div class="haldi-border" aria-hidden="true">${border}</div>
            <article class="haldi-card">${cardHTML}</article>
            ${sprig('haldi-sprig-tr')}${sprig('haldi-sprig-bl')}
            ${S ? '' : `<canvas class="haldi-cloth" tabindex="0" role="button" aria-label="Plain white kurta cloth. Press to throw a handful of haldi"></canvas>
            <div class="haldi-hint" aria-hidden="true"><span class="haldi-hand">👆</span><b>Tap to throw haldi! 💛</b><small>or drag across for a big splash</small></div>
            <div class="haldi-fx" aria-hidden="true"></div>`}
          </div>
          <section class="haldi-details" id="haldi-details"${S ? '' : ' hidden'}>
            <h2 class="haldi-details-h">The full details</h2>
            ${S ? '' : '<p class="haldi-details-sub">Directions &amp; calendar, all right here 👇</p>'}
            ${ctx.summaryHTML({ heading: false })}
          </section>
        </div>
        ${S ? '' : `
        <div class="haldi-bar">
          <div class="haldi-bowl" role="progressbar" aria-label="Haldi left in the katori" aria-valuemin="0" aria-valuemax="100" aria-valuenow="100">
            <svg class="haldi-katori" viewBox="0 0 64 46" aria-hidden="true" focusable="false">
              <defs>
                <linearGradient id="haldi-brass" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#f6d77a"/><stop offset=".5" stop-color="#c8902a"/><stop offset="1" stop-color="#875610"/></linearGradient>
                <radialGradient id="haldi-paste" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#ffe680"/><stop offset=".55" stop-color="#f6b40e"/><stop offset="1" stop-color="#d98a00"/></radialGradient>
              </defs>
              <ellipse cx="32" cy="16" rx="27" ry="5.5" fill="#5e3a0c"/>
              <g class="haldi-paste-g"><path d="M7 16Q10 1 32 2Q54 1 57 16Z" fill="url(#haldi-paste)"/><ellipse cx="23" cy="8" rx="6" ry="2" fill="#fff4b8" opacity=".75"/></g>
              <path d="M4 16Q6 40 32 40Q58 40 60 16Q46 21 32 21Q18 21 4 16Z" fill="url(#haldi-brass)"/>
              <path d="M4 16Q18 21 32 21Q46 21 60 16" fill="none" stroke="#fbe7a6" stroke-width="2"/>
              <path d="M14 27Q32 33 50 27" fill="none" stroke="#fbe7a6" stroke-width="1" opacity=".6"/>
              <rect x="22" y="39" width="20" height="5" rx="2.5" fill="#875610"/>
            </svg>
            <span class="haldi-bowl-txt"><small>Haldi left</small><b>100%</b></span>
          </div>
          <button type="button" class="haldi-all">Splash it all! <span aria-hidden="true">💥</span></button>
        </div>`}`;

      if (S) {
        const done = () => ctx.ready();
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(done, done); else done();
        return;
      }

      /* ----- interactive ----- */
      const $ = s => root.querySelector(s);
      const wrap = $('.haldi-cardwrap'), card = $('.haldi-card'), cv = $('.haldi-cloth'), hint = $('.haldi-hint');
      const fx = $('.haldi-fx'), bar = $('.haldi-bar'), bowl = $('.haldi-bowl'), paste = $('.haldi-paste-g');
      const pct = $('.haldi-bowl-txt b'), allBtn = $('.haldi-all'), skipBtn = $('.haldi-skip');
      const details = $('.haldi-details'), sub = $('.haldi-sub');
      const g = cv.getContext('2d');
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const splats = [];
      let W = 0, H = 0, taps = 0, area = 0, revealed = false, revealTimer = 0, lastSound = 0, spotIx = 0;

      function roundRect(x, y, w, h, r) {
        g.beginPath();
        g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
        g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
      }
      function paintCloth() {
        g.globalCompositeOperation = 'source-over';
        g.fillStyle = '#fdfcf8'; g.fillRect(0, 0, W, H);
        g.lineWidth = 1;
        g.strokeStyle = 'rgba(150,130,100,0.08)'; g.beginPath();
        for (let y = 0.5; y < H; y += 3) { g.moveTo(0, y); g.lineTo(W, y); }
        g.stroke();
        g.strokeStyle = 'rgba(150,130,100,0.06)'; g.beginPath();
        for (let x = 0.5; x < W; x += 3) { g.moveTo(x, 0); g.lineTo(x, H); }
        g.stroke();
        // chikankari-style buti
        g.fillStyle = 'rgba(190,175,150,0.4)'; g.beginPath();
        for (let y = 210, row = 0; y < H - 30; y += 74, row++) {
          for (let x = row % 2 ? 40 : 76; x < W - 24; x += 72) {
            for (let k = 0; k < 5; k++) {
              const a = k / 5 * Math.PI * 2, px = x + Math.cos(a) * 4.5, py = y + Math.sin(a) * 4.5;
              g.moveTo(px + 2.2, py); g.arc(px, py, 2.2, 0, Math.PI * 2);
            }
          }
        }
        g.fill();
        // collar and placket so it reads as a kurta
        const cx = W / 2;
        g.strokeStyle = 'rgba(170,150,115,0.55)'; g.lineWidth = 1.5;
        roundRect(cx - 48, -8, 96, 24, 10); g.stroke();
        g.beginPath(); g.moveTo(cx - 9, 16); g.lineTo(cx - 9, 140); g.lineTo(cx + 9, 140); g.lineTo(cx + 9, 16); g.stroke();
        g.fillStyle = '#efe6d2';
        [42, 78, 114].forEach(y => { g.beginPath(); g.arc(cx, y, 4.5, 0, Math.PI * 2); g.fill(); g.stroke(); });
        // stitched hem
        g.setLineDash([6, 5]); g.strokeStyle = 'rgba(190,160,110,0.5)';
        roundRect(10, 10, W - 20, H - 20, 16); g.stroke(); g.setLineDash([]);
      }
      function drawSplat(sp, k, full) {
        const cx = sp.x * W, cy = sp.y * H, R = sp.s * W;
        if (full) {
          g.globalCompositeOperation = 'source-over';
          const gr = g.createRadialGradient(cx, cy, R * 0.6, cx, cy, R * 1.6);
          gr.addColorStop(0, 'rgba(246,180,14,0.28)'); gr.addColorStop(1, 'rgba(246,180,14,0)');
          g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, R * 1.6, 0, Math.PI * 2); g.fill();
        }
        g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000';
        g.beginPath(); traceBlob(g, sp.sh, cx, cy, R * k); g.fill();
        if (!full) return;
        g.beginPath();
        sp.sh.drops.forEach(d => {
          const x = cx + d[0] * R, y = cy + d[1] * R, rx = d[2] * R * d[4];
          g.moveTo(x + rx * Math.cos(d[3]), y + rx * Math.sin(d[3]));
          g.ellipse(x, y, rx, d[2] * R, d[3], 0, Math.PI * 2);
        });
        g.fill();
        g.globalCompositeOperation = 'source-over';
        g.strokeStyle = 'rgba(214,110,0,0.5)'; g.lineWidth = 2;
        g.beginPath(); traceBlob(g, sp.sh, cx, cy, R); g.stroke();
      }
      function resize() {
        const w = Math.round(card.offsetWidth), h = Math.round(card.offsetHeight);
        if (!w || !h || (w === W && h === H)) return;
        W = w; H = h;
        cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        paintCloth();
        splats.forEach(sp => drawSplat(sp, 1, true));
      }
      resize();
      if (window.ResizeObserver) new ResizeObserver(resize).observe(card);
      else window.addEventListener('resize', resize);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(resize, () => {});

      function animateSplat(sp) {
        if (RM) { drawSplat(sp, 1, true); return; }
        drawSplat(sp, 0.5, false);
        requestAnimationFrame(() => { drawSplat(sp, 0.8, false); requestAnimationFrame(() => drawSplat(sp, 1, true)); });
      }
      function puff(x, y) {
        if (RM) return;
        const el = document.createElement('div');
        el.className = 'haldi-puff';
        el.style.left = x + 'px'; el.style.top = y + 'px';
        let h = '';
        for (let i = 0; i < 9; i++) h += `<i style="--a:${(i * 40 + rand() * 20).toFixed(0)}deg;--d:${(36 + rand() * 30).toFixed(0)}px"></i>`;
        el.innerHTML = h;
        fx.appendChild(el);
        setTimeout(() => el.remove(), 650);
      }
      const baseR = () => Math.max(58, Math.min(100, W * 0.21));
      function progress() { return Math.min(1, Math.max(taps / TAPS_TO_REVEAL, (1 - Math.exp(-area)) / COVER_TO_REVEAL)); }
      function update() {
        const p = progress(), left = Math.round((1 - p) * 100);
        paste.style.transform = `scaleY(${(1 - p).toFixed(3)})`;
        pct.textContent = left + '%';
        bowl.setAttribute('aria-valuenow', String(left));
        if (p >= 1 && !revealTimer) revealTimer = setTimeout(() => reveal(false), RM ? 150 : 550);
      }
      function throwAt(x, y, mult) {
        if (revealed || !W) return;
        const R = baseR() * mult * (0.85 + rand() * 0.3);
        const sp = { x: x / W, y: y / H, s: R / W, sh: makeShape(rand) };
        splats.push(sp);
        taps += mult;
        area += Math.PI * R * R * 1.1 / (W * H);
        animateSplat(sp);
        puff(x, y);
        const now = Date.now();
        if (now - lastSound > 110) { ctx.sound.play('splash'); lastSound = now; }
        hint.classList.add('haldi-hide');
        if (!RM) { wrap.classList.remove('haldi-thud'); void wrap.offsetWidth; wrap.classList.add('haldi-thud'); }
        update();
      }
      function nextSpot() {
        const s = SPOTS[spotIx++ % SPOTS.length];
        return [(s[0] + (rand() - 0.5) * 0.08) * W, (s[1] + (rand() - 0.5) * 0.05) * H];
      }

      let down = null;
      function local(e) {
        const r = cv.getBoundingClientRect();
        return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height];
      }
      cv.addEventListener('pointerdown', e => {
        if (e.button > 0) return;
        const p = local(e);
        down = { x: p[0], y: p[1], id: e.pointerId };
        throwAt(p[0], p[1], 1);
      });
      cv.addEventListener('pointermove', e => {
        if (!down || e.pointerId !== down.id) return;
        const p = local(e);
        if (Math.hypot(p[0] - down.x, p[1] - down.y) > baseR() * 0.75) {
          down.x = p[0]; down.y = p[1];
          throwAt(p[0], p[1], 0.6);
        }
      });
      ['pointerup', 'pointercancel', 'pointerleave'].forEach(t => cv.addEventListener(t, () => { down = null; }));
      cv.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); const s = nextSpot(); throwAt(s[0], s[1], 1); }
      });

      function scrollDetails() {
        bar.classList.add('haldi-bar-off');
        details.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' });
      }
      function petals() {
        const layer = document.createElement('div');
        layer.className = 'haldi-petals';
        layer.setAttribute('aria-hidden', 'true');
        const cols = ['#f2780c', '#f7b500', '#ffcf33', '#e8590c', '#f59f00', '#d6336c'];
        let h = '';
        for (let i = 0; i < 42; i++) {
          const a = rand() * Math.PI * 2, d = 60 + rand() * 160;
          h += `<i style="--bx:${(Math.cos(a) * d).toFixed(0)}px;--by:${(Math.sin(a) * d * 0.8 - 40).toFixed(0)}px;--sx:${((rand() - 0.5) * 140).toFixed(0)}px;--r:${(rand() * 720 - 360).toFixed(0)}deg;--c:${cols[i % cols.length]};--d:${(1.9 + rand() * 1.4).toFixed(2)}s;--w:${(8 + rand() * 8).toFixed(0)}px"></i>`;
        }
        layer.innerHTML = h + `<p class="haldi-toast">${isHaldi ? 'Haldi lag gayi!' : 'Rang lag gaya!'} 💛</p>`;
        document.body.appendChild(layer);
        setTimeout(() => layer.remove(), 3800);
      }
      function reveal(fast) {
        if (revealed) return;
        revealed = true; clearTimeout(revealTimer);
        ctx.sound.play('success');
        hint.classList.add('haldi-hide');
        cv.classList.add('haldi-gone');
        setTimeout(() => cv.remove(), RM || fast ? 30 : 900);
        wrap.classList.add('haldi-revealed');
        sub.textContent = subStatic;
        if (skipBtn) skipBtn.hidden = true;
        details.hidden = false;
        if (!RM && !fast) petals();
        bar.innerHTML = '<button type="button" class="haldi-all haldi-go">See the full details <span aria-hidden="true">👇</span></button>';
        bar.querySelector('button').addEventListener('click', () => { ctx.sound.play('tap'); scrollDetails(); });
        const checkBar = () => bar.classList.toggle('haldi-bar-off', details.getBoundingClientRect().top < window.innerHeight * 0.7);
        window.addEventListener('scroll', checkBar, { passive: true });
        setTimeout(checkBar, 50);
        ctx.ready();
        if (auto) setTimeout(scrollDetails, 2600);
      }
      function splashAll() {
        allBtn.disabled = true;
        let i = 0;
        const n = RM ? 0 : 5;
        (function step() {
          if (revealed) return;
          if (i++ < n) { const s = nextSpot(); throwAt(s[0], s[1], 1.2); setTimeout(step, 110); } else reveal(false);
        })();
      }
      allBtn.addEventListener('click', splashAll);
      skipBtn.addEventListener('click', () => {
        reveal(true);
        requestAnimationFrame(() => requestAnimationFrame(scrollDetails));
      });
      update();

      if (auto) {
        let k = 0;
        setTimeout(function tick() {
          if (revealed) return;
          const s = SPOTS[k++ % SPOTS.length];
          throwAt(s[0] * W, s[1] * H, 1);
          if (k < SPOTS.length) setTimeout(tick, 700);
        }, 1400);
      }
    },
  });
})();
