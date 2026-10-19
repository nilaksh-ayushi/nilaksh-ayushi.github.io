/* Nilaksh & Ayushi — InviteDeck: swipeable invitation pages that pop up over any variant.
   Loaded by invite.html after core.js. Optional for variants (stars, claw and escape use it).

   API
     InviteDeck.open(pages, opts) -> Promise (resolves with the last page index when the deck closes)
       opts: { start, single, cta, label, theme, events }
         single  one page with a CTA button instead of page dots (e.g. "a function just unlocked")
         theme   extra class on the deck root, so a variant can style it: .ideck.<theme> .ideck-card { ... }
         events  ctx.events, for the "Add to calendar" buttons inside the deck
     InviteDeck.eventPage(ctx, ev, { art, kicker, note })   page for one decorated event (ctx.events item)
     InviteDeck.closingPage(ctx, { art, kicker })           family / blessings / contact page
     InviteDeck.close()

   Page objects (if building by hand)
     { kind: 'event', kicker, title, hi, art, date, time, timeIsText, note, venue, dress, map, schedule:[[t,name,where]] }
     { kind: 'custom', html }

   Theme tokens (set on html.v-<id> or .ideck.<theme>):
     --ideck-backdrop --ideck-card --ideck-ink --ideck-muted --ideck-accent --ideck-accent-ink
     --ideck-line --ideck-art-bg --ideck-display --ideck-body --ideck-radius --ideck-shadow
   Never call this in static (image) mode: show ctx.summaryHTML() instead. */
(function (root) {
  'use strict';

  const CSS = `
  .ideck { position: fixed; inset: 0; z-index: 1200; display: grid; grid-template: minmax(0, 1fr) / minmax(0, 1fr); place-items: center;
    padding: calc(12px + env(safe-area-inset-top, 0px)) 0 calc(12px + env(safe-area-inset-bottom, 0px)); }
  .ideck-backdrop { position: absolute; inset: 0; background: var(--ideck-backdrop, rgba(10,8,14,.74));
    backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); animation: ideckFade .3s ease both; }
  .ideck-shell { position: relative; width: min(440px, 100%); height: min(760px, 100%); display: flex; flex-direction: column;
    animation: ideckRise .45s cubic-bezier(.2,.9,.3,1.1) both; }
  .ideck-top { display: flex; justify-content: space-between; align-items: center; padding: 0 22px 10px; color: #fff;
    font: 600 12px/1 var(--ideck-body, system-ui, sans-serif); letter-spacing: .14em; text-transform: uppercase; }
  .ideck-close { width: 38px; height: 38px; border-radius: 50%; border: 1px solid rgba(255,255,255,.45); background: rgba(0,0,0,.25);
    color: #fff; font-size: 20px; line-height: 1; cursor: pointer; }
  .ideck-track { flex: 1; min-height: 0; display: flex; overflow-x: auto; overflow-y: hidden; scroll-snap-type: x mandatory;
    scroll-behavior: smooth; scrollbar-width: none; overscroll-behavior-x: contain; }
  .ideck-track::-webkit-scrollbar { display: none; }
  .ideck-track:focus-visible { outline: none; }
  .ideck-page { flex: 0 0 100%; scroll-snap-align: center; scroll-snap-stop: always; padding: 0 16px; display: flex; min-height: 0; }
  .ideck-card { position: relative; flex: 1; min-height: 0; overflow: hidden auto; border-radius: var(--ideck-radius, 22px);
    background: var(--ideck-card, #fffaf2); color: var(--ideck-ink, #2a1a14); box-shadow: var(--ideck-shadow, 0 24px 60px rgba(0,0,0,.45));
    font: 400 15px/1.55 var(--ideck-body, system-ui, sans-serif); scrollbar-width: thin; }
  .ideck-art { position: relative; aspect-ratio: 16 / 10; max-width: 100%; background: var(--ideck-art-bg, #f3e3c8); overflow: hidden; }
  .ideck-art > svg, .ideck-art > img { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
  .ideck-page .ideck-art > * { transition: transform 1.2s cubic-bezier(.2,.8,.2,1), opacity .8s ease; }
  .ideck-page:not(.is-active) .ideck-art > * { transform: scale(1.08); opacity: .6; }
  .ideck-body { padding: 18px 22px 24px; }
  .ideck-kicker { margin: 0; font: 600 11px/1.4 var(--ideck-body, system-ui, sans-serif); letter-spacing: .18em; text-transform: uppercase; color: var(--ideck-accent, #9b1c31); }
  .ideck-title { margin: 6px 0 0; font: 600 clamp(26px, 7.5vw, 36px)/1.08 var(--ideck-display, Georgia, serif); text-wrap: balance; color: var(--ideck-title, var(--ideck-accent, #9b1c31)); }
  .ideck-hi { margin: 4px 0 0; font-size: 16px; color: var(--ideck-muted, #7a5a4a); }
  .ideck-when { margin-top: 14px; display: grid; gap: 2px; padding: 12px 14px; border-radius: 14px; background: var(--ideck-line, rgba(0,0,0,.05)); }
  .ideck-date { font: 600 18px/1.25 var(--ideck-display, Georgia, serif); }
  .ideck-time { font-weight: 600; color: var(--ideck-accent, #9b1c31); }
  .ideck-time i { font-weight: 500; }
  .ideck-sched { list-style: none; margin: 14px 0 0; padding: 0; display: grid; }
  .ideck-sched li { position: relative; display: grid; grid-template-columns: 5.6em 1fr; gap: 12px; padding: 8px 0 8px 16px; border-left: 2px solid var(--ideck-line, rgba(0,0,0,.1)); }
  .ideck-sched li::before { content: ""; position: absolute; left: -6px; top: 14px; width: 10px; height: 10px; border-radius: 50%; background: var(--ideck-accent, #9b1c31); }
  .ideck-sched b { font-variant-numeric: tabular-nums; color: var(--ideck-accent, #9b1c31); }
  .ideck-sched small { display: block; color: var(--ideck-muted, #7a5a4a); font-size: 13px; }
  .ideck-facts { margin: 14px 0 0; display: grid; gap: 10px; }
  .ideck-facts div { display: grid; gap: 1px; }
  .ideck-facts dt { font-size: 10.5px; font-weight: 600; letter-spacing: .16em; text-transform: uppercase; color: var(--ideck-muted, #7a5a4a); }
  .ideck-facts dd { margin: 0; }
  .ideck-note { margin: 14px 0 0; font-style: italic; color: var(--ideck-muted, #7a5a4a); }
  .ideck-acts { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
  .ideck-btn { display: inline-flex; align-items: center; padding: 10px 16px; border-radius: 999px; border: 0; cursor: pointer;
    background: var(--ideck-accent, #9b1c31); color: var(--ideck-accent-ink, #fff); font: 600 14px/1 var(--ideck-body, system-ui, sans-serif); text-decoration: none; }
  .ideck-btn.ghost { color: var(--ideck-cal-ink, var(--ideck-accent, #9b1c31)); background: rgba(128, 128, 128, .12);
    background: color-mix(in srgb, currentColor 12%, transparent); box-shadow: inset 0 0 0 1.5px currentColor; }
  .ideck-close-page { padding: 30px 24px 28px; text-align: center; }
  .ideck-close-page .ic-shloka { margin: 0; font-size: 14px; color: var(--ideck-accent, #9b1c31); }
  .ideck-close-page .ic-doodle { margin: 6px auto 0; color: var(--ideck-accent, #9b1c31); }
  .ideck-close-page .ic-doodle svg { display: block; margin: 0 auto; }
  .ideck-close-page .ic-name, .ideck-close-page b { color: var(--ideck-name, var(--ideck-accent, #9b1c31)); }
  .ideck-close-page .ic-kicker { margin: 14px 0 0; font-size: 11px; font-weight: 600; letter-spacing: .2em; text-transform: uppercase; color: var(--ideck-muted, #7a5a4a); }
  .ideck-close-page .ic-couple { margin: 6px 0 0; font: 600 34px/1.1 var(--ideck-display, Georgia, serif); color: var(--ideck-accent, #9b1c31); }
  .ideck-close-page .ic-bless { margin: 16px 0 0; padding: 12px; border-radius: 12px; box-shadow: inset 0 0 0 1px var(--ideck-line, rgba(0,0,0,.12)); }
  .ideck-close-page .ic-bless small { display: block; font-size: 10.5px; font-weight: 600; letter-spacing: .18em; text-transform: uppercase; color: var(--ideck-muted, #7a5a4a); margin-bottom: 3px; }
  .ideck-close-page p { margin: 12px 0 0; }
  .ideck-close-page .ic-muted { color: var(--ideck-muted, #7a5a4a); font-size: 13.5px; }
  .ideck-close-page .ic-phones a { color: inherit; font-weight: 600; }
  .ideck-close-page .ic-sign { font: 600 22px/1.3 var(--ideck-display, Georgia, serif); color: var(--ideck-accent, #9b1c31); }
  .ideck-nav { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 14px 22px 0; }
  .ideck-nav button { min-width: 48px; height: 48px; border-radius: 999px; border: 1px solid rgba(255,255,255,.45); background: rgba(0,0,0,.25);
    color: #fff; font-size: 18px; cursor: pointer; }
  .ideck-nav button:disabled { opacity: .3; cursor: default; }
  .ideck-dots { display: flex; gap: 7px; flex-wrap: wrap; justify-content: center; }
  .ideck-dots i { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,.35); transition: width .25s, background .25s; }
  .ideck-dots i.on { width: 22px; border-radius: 4px; background: #fff; }
  .ideck-cta { display: block; margin: 14px auto 0; padding: 14px 28px; border: 0; border-radius: 999px; background: #fff; color: #1b1418;
    font: 700 16px/1 var(--ideck-body, system-ui, sans-serif); cursor: pointer; box-shadow: 0 8px 24px rgba(0,0,0,.3); }
  .ideck-hint { text-align: center; margin: 10px 0 0; color: rgba(255,255,255,.75); font: 500 12.5px/1 var(--ideck-body, system-ui, sans-serif); }
  .ideck :focus-visible { outline: 3px solid var(--ideck-accent, #9b1c31); outline-offset: 3px; }
  @keyframes ideckFade { from { opacity: 0; } }
  @keyframes ideckRise { from { opacity: 0; transform: translateY(40px) scale(.96); } }
  .ideck.closing .ideck-backdrop { animation: ideckFade .25s ease reverse both; }
  .ideck.closing .ideck-shell { animation: ideckRise .25s ease-in reverse both; }
  @media (prefers-reduced-motion: reduce) {
    .ideck-backdrop, .ideck-shell, .ideck.closing .ideck-backdrop, .ideck.closing .ideck-shell { animation: none; }
    .ideck-track { scroll-behavior: auto; }
    .ideck-page .ideck-art > * { transition: none; transform: none !important; opacity: 1 !important; }
  }`;

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function pageHTML(p) {
    if (p.kind === 'custom') return `<article class="ideck-card ideck-custom">${p.html}</article>`;
    const sched = p.schedule && p.schedule.length
      ? `<ol class="ideck-sched">${p.schedule.map(([t, n, w]) => `<li><b>${esc(t)}</b><span>${esc(n)}${w ? `<small>${esc(w)}</small>` : ''}</span></li>`).join('')}</ol>` : '';
    return `<article class="ideck-card">
      ${p.art ? `<div class="ideck-art">${p.art}</div>` : ''}
      <div class="ideck-body">
        ${p.kicker ? `<p class="ideck-kicker">${esc(p.kicker)}</p>` : ''}
        <h2 class="ideck-title">${esc(p.title)}</h2>
        ${p.hi ? `<p class="ideck-hi">${esc(p.hi)}</p>` : ''}
        ${p.date || p.time ? `<div class="ideck-when">${p.date ? `<span class="ideck-date">${esc(p.date)}</span>` : ''}${p.time ? `<span class="ideck-time">${p.timeIsText ? `<i>${esc(p.time)}</i>` : esc(p.time)}</span>` : ''}</div>` : ''}
        ${sched}
        <dl class="ideck-facts">
          ${p.venue ? `<div><dt>Venue</dt><dd>${esc(p.venue)}</dd></div>` : ''}
          ${p.dress ? `<div><dt>Dress code</dt><dd>${esc(p.dress)}</dd></div>` : ''}
        </dl>
        ${p.note ? `<p class="ideck-note">${esc(p.note)}</p>` : ''}
        <div class="ideck-acts">
          ${p.map ? `<a class="ideck-btn" href="${esc(p.map)}" target="_blank" rel="noopener">Directions</a>` : ''}
          <button type="button" class="ideck-btn ghost" data-ideck-cal>Add to calendar</button>
        </div>
      </div>
    </article>`;
  }

  function eventPage(ctx, ev, extra) {
    extra = extra || {};
    const time = ev.isTimeText
      ? ev.time + (ev.timeEn ? ' (' + ev.timeEn + ')' : '')
      : ev.time + (ev.note ? ' · ' + ev.note : '');
    return {
      kind: 'event', art: extra.art || '', kicker: extra.kicker || ctx.occasion.title,
      title: ev.name, hi: ev.hi, date: ev.dateLong, time, timeIsText: ev.isTimeText,
      venue: ev.placeFull, dress: ev.dress, note: extra.note || '', map: ev.venueInfo.map,
    };
  }

  function closingPage(ctx, extra) {
    extra = extra || {};
    const P = ctx.P, T = ctx.T;
    const dates = ctx.days.length > 1
      ? `${ctx.days[0].dateShort} – ${ctx.days[ctx.days.length - 1].dateShort} 2026`
      : ctx.days[0].dateLong;
    const isSK = ctx.occasion.key === 'sunderkand';
    const shloka = isSK ? '॥ श्री राम ॥' : T.ganeshShort;
    const A = root.Invite && root.Invite.art;
    const doodle = A ? `<div class="ic-doodle">${isSK ? A.hanuman({ size: 52 }) : A.ganesh({ size: 52 })}</div>` : '';
    return { kind: 'custom', html: `
      ${extra.art ? `<div class="ideck-art">${extra.art}</div>` : ''}
      <div class="ideck-close-page">
        <p class="ic-shloka" lang="hi">${esc(shloka)}</p>
        ${doodle}
        <p class="ic-kicker">${esc(extra.kicker || ctx.occasion.title)}</p>
        <h2 class="ic-couple">${esc(P.groom)} &amp; ${esc(P.bride)}</h2>
        <p class="ic-muted">${esc(dates)}</p>
        <div class="ic-bless"><small>With the divine blessings of</small><span class="ic-name">${esc(P.blessings)}</span></div>
        <p><b>${esc(P.groom)}</b><br><span class="ic-muted">son of <span class="ic-name">${esc(P.groomParents)}</span></span></p>
        <p><b>${esc(P.bride)}</b><br><span class="ic-muted">daughter of <span class="ic-name">${esc(P.brideParents)}</span></span></p>
        <p class="ic-muted">${esc(ctx.greeting)}, we look forward to celebrating with you.</p>
        <p class="ic-muted">${esc(P.address)}</p>
        <p class="ic-phones">${P.phones.map(p => `<a href="tel:+91${esc(p)}">${esc(p)}</a>`).join(' · ')}</p>
        <div class="ideck-acts" style="justify-content:center"><button type="button" class="ideck-btn" data-ideck-cal>Add all to calendar</button></div>
        <p class="ic-sign">With love, <span class="ic-name">${esc(P.family)}</span></p>
      </div>` };
  }

  let styled = false, active = null;

  function open(pages, opts) {
    opts = opts || {};
    if (!styled) { const s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s); styled = true; }
    if (active) active.close(true);
    const single = !!opts.single || pages.length === 1;
    const el = document.createElement('div');
    el.className = 'ideck' + (opts.theme ? ' ' + opts.theme : '');
    el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', opts.label || 'Invitation');
    el.innerHTML = `
      <div class="ideck-backdrop"></div>
      <div class="ideck-shell">
        <div class="ideck-top"><span class="ideck-count" aria-live="polite"></span><button type="button" class="ideck-close" aria-label="Close">×</button></div>
        <div class="ideck-track" tabindex="0">${pages.map(p => `<section class="ideck-page">${pageHTML(p)}</section>`).join('')}</div>
        ${single
          ? `<button type="button" class="ideck-cta">${esc(opts.cta || 'Continue')}</button>`
          : `<div class="ideck-nav"><button type="button" class="ideck-prev" aria-label="Previous page">←</button><div class="ideck-dots">${pages.map(() => '<i></i>').join('')}</div><button type="button" class="ideck-next" aria-label="Next page">→</button></div>
             <p class="ideck-hint">Swipe for the next page</p>`}
      </div>`;
    document.body.appendChild(el);
    const prevFocus = document.activeElement;
    const track = el.querySelector('.ideck-track');
    const pagesEl = Array.prototype.slice.call(el.querySelectorAll('.ideck-page'));
    const dots = Array.prototype.slice.call(el.querySelectorAll('.ideck-dots i'));
    const count = el.querySelector('.ideck-count');
    const prevB = el.querySelector('.ideck-prev'), nextB = el.querySelector('.ideck-next');
    let idx = -1;
    const play = n => { if (root.Invite && root.Invite.sound) root.Invite.sound.play(n); };

    function setIdx(i) {
      if (i === idx) return;
      if (idx >= 0) play('tap');
      idx = i;
      pagesEl.forEach((p, k) => p.classList.toggle('is-active', k === i));
      dots.forEach((d, k) => d.classList.toggle('on', k === i));
      count.textContent = single ? (opts.label || '') : `${i + 1} / ${pages.length}`;
      if (prevB) prevB.disabled = i === 0;
      if (nextB) nextB.disabled = i === pages.length - 1;
      const hint = el.querySelector('.ideck-hint');
      if (hint && i > 0) hint.style.visibility = 'hidden';
    }
    const go = i => { i = Math.max(0, Math.min(pages.length - 1, i)); track.scrollTo({ left: i * track.clientWidth }); };
    track.addEventListener('scroll', () => setIdx(Math.round(track.scrollLeft / Math.max(1, track.clientWidth))), { passive: true });

    let resolve;
    const done = new Promise(r => (resolve = r));
    function close(instant) {
      if (!el.isConnected) return;
      document.removeEventListener('keydown', onKey);
      const finish = () => { el.remove(); if (prevFocus && prevFocus.focus) prevFocus.focus({ preventScroll: true }); active = null; resolve(idx); };
      if (instant || (root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches)) finish();
      else { el.classList.add('closing'); setTimeout(finish, 240); }
    }
    function onKey(e) {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') go(idx + 1);
      else if (e.key === 'ArrowLeft') go(idx - 1);
    }
    document.addEventListener('keydown', onKey);
    el.querySelector('.ideck-close').addEventListener('click', () => close());
    el.querySelector('.ideck-backdrop').addEventListener('click', () => close());
    if (prevB) prevB.addEventListener('click', () => go(idx - 1));
    if (nextB) nextB.addEventListener('click', () => go(idx + 1));
    const cta = el.querySelector('.ideck-cta');
    if (cta) cta.addEventListener('click', () => { play('tap'); close(); });
    el.addEventListener('click', e => {
      if (e.target.closest('[data-ideck-cal]') && root.Invite && opts.events) { play('ding'); root.Invite.downloadIcs(opts.events); }
    });

    const start = Math.max(0, Math.min(pages.length - 1, opts.start || 0));
    play('whoosh');
    requestAnimationFrame(() => {
      track.style.scrollBehavior = 'auto';
      track.scrollLeft = start * track.clientWidth;
      track.style.scrollBehavior = '';
      setIdx(start);
      (cta || el.querySelector('.ideck-close')).focus({ preventScroll: true });
    });
    active = { close, el, go };
    return done;
  }

  root.InviteDeck = { open, close: () => active && active.close(), pageHTML, eventPage, closingPage };
})(window);
