/* Family Group Chat — the invite unfolds as a family group chat ("Aggarwal Parivar 💍")
   in a made-up messenger called "Chitthi". Signature variant for group 4. */
(function () {
  'use strict';

  const EMOJI = {
    sunderkand: '🙏', mehandi: '🌿', engagement: '💍', bhaat: '🎁', haldi: '💛',
    ghudchadi: '🐎', baraat: '🥁', dinner: '🍽️', vidaai: '🌙',
  };

  Invite.register('chat', {
    render(root, ctx) {
      const esc = ctx.esc;
      const P = ctx.P;
      const AUTO = /[?&]auto=1\b/.test(location.search);
      const STATIC = ctx.isStatic;
      const RM = ctx.reducedMotion;
      const has = id => ctx.events.some(e => e.id === id);
      const key = ctx.occasion.key;
      const guestName = ctx.guest || '';
      const firstMap = ctx.events[0].venueInfo.map;

      const WHO = {
        mummy: { name: 'Mummy', ini: 'M', c: '#b0306a' },
        papa: { name: 'Papa', ini: 'P', c: '#1d7466' },
        bua: { name: 'Bua ji', ini: 'B', c: '#7445b0' },
        chachu: { name: 'Chachu', ini: 'C', c: '#b9540b' },
        nilaksh: { name: P.groom, ini: P.groom.charAt(0), c: '#2b5fae' },
        couple: { name: `${P.groom} & ${P.bride}`, ini: `${P.groom.charAt(0)}♥${P.bride.charAt(0)}`, c: '#8a1c2b' },
      };
      const MEMBERS = `Mummy, Papa, Bua ji, Chachu, ${P.groom}, You`;

      /* ---------- script ---------- */
      function buildScript() {
        const s = [];
        s.push({ t: 'date', text: 'Today' });
        s.push({ t: 'sys', text: `Mummy added ${guestName || 'you'}` });
        s.push({ who: 'papa', text: 'Beta, card bhej diya sabko?' });
        s.push({ who: 'nilaksh', text: 'Haan Papa, bas ek special family reh gayi 😄' });
        s.push({ who: 'mummy', len: 30, html: `<span class="chat-at">@${esc(guestName || 'everyone')}</span> 🙏 you are invited!` });
        const intro = {
          wedding: `${P.groom} aur ${P.bride} ki shaadi hai! 💍 Saare functions neeche hain 👇`,
          engagement: `${P.groom} aur ${P.bride} ki sagai hai! 💍 Ring, music aur dance, sab kuch 👇`,
          haldi: 'Haldi aur Bhaat: subah subah poori family ka pyaar 💛 Details neeche 👇',
          mehandi: 'Mehandi aur geet ki shaam! 🌿 Dholak bajegi, mehandi lagegi 👇',
          sunderkand: 'Shaadi se pehle ghar pe Sunderkand Path rakha hai 🙏 Hanuman ji ka aashirwad lene zaroor aana.',
        }[key];
        if (intro) s.push({ who: 'mummy', text: intro });

        const n = ctx.events.length;
        ctx.events.forEach((ev, i) => {
          s.push({ who: i % 3 === 2 ? 'papa' : 'mummy', t: 'event', ev, i, n });
          const food = /dinner/i.test(ev.note || '');
          const lunch = /lunch/i.test(ev.note || '');
          switch (ev.id) {
            case 'engagement':
              s.push({ who: 'bua', t: 'sticker', emo: '💃🕺', label: 'Sangeet mein pehla dance mera!' });
              break;
            case 'ghudchadi':
              s.push({ who: 'chachu', text: 'Ghodi ke aage naachne ki booking meri 🐎' });
              break;
            case 'baraat':
              s.push({ who: 'bua', t: 'sticker', emo: '🥁💃', label: 'Naagin dance pakka!' });
              break;
            case 'dinner':
              s.push({ who: 'chachu', text: 'Dinner menu kya hai?' });
              s.push({ who: 'mummy', text: 'Aao toh sahi 😄' });
              break;
            case 'vidaai':
              s.push({ who: 'mummy', text: `Aur phir ${P.bride} ghar aayegi 🥹❤️` });
              break;
            case 'haldi':
              s.push({ who: 'bua', t: 'sticker', emo: '💛🌼', label: `Bach ke rehna ${P.groom}!` });
              if (ev.dress) s.push({ who: 'mummy', text: 'Rainbow colours pehen ke aana 🌈' });
              break;
            case 'bhaat':
              s.push({ who: 'papa', text: 'Nanihaal se Bhaat aayega, sab time pe aana 🎁' });
              break;
            case 'mehandi':
              s.push({ who: 'bua', t: 'sticker', emo: '💃🌿', label: 'Geet main shuru karungi!' });
              if (food) { s.push({ who: 'chachu', text: 'Dinner menu kya hai?' }); s.push({ who: 'mummy', text: 'Aao toh sahi 😄' }); }
              break;
            case 'sunderkand':
              s.push({ who: 'bua', t: 'sticker', emo: '🙏🚩', label: 'Jai Bajrang Bali!' });
              if (lunch) { s.push({ who: 'chachu', text: 'Path ke baad lunch bhi hai na? 😇' }); s.push({ who: 'mummy', text: 'Haan ji, aao toh sahi 😄' }); }
              break;
            default:
              if (food && !has('dinner')) { s.push({ who: 'chachu', text: 'Dinner menu kya hai?' }); s.push({ who: 'mummy', text: 'Aao toh sahi 😄' }); }
          }
        });

        const devotional = key === 'sunderkand';
        s.push({ who: 'nilaksh', t: 'voice', cap: devotional ? 'Bhajan mandali ki practice 🎶' : 'Dhol wale bhaiya ki practice 🥁 Volume full!' });
        s.push(devotional
          ? { who: 'bua', t: 'sticker', emo: '🎶🙏', label: 'Jai Shri Ram!' }
          : { who: 'bua', t: 'sticker', emo: '💃🕺', label: 'Ruk nahi sakti ab!' });
        s.push({ who: 'couple', t: 'couple', text: 'Aana zaroor hai!', len: 22 });
        s.push({ who: 'mummy', t: 'invite', len: 24 });
        return s;
      }
      const steps = buildScript();

      /* ---------- time stamps ---------- */
      const msgCount = steps.filter(x => x.who).length;
      const t0 = Date.now() - (msgCount + 1) * 48000;
      let msgIdx = 0, lastStamp = 0;
      const fmt = d => {
        let h = d.getHours(); const m = d.getMinutes(); const ap = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        return `${h}:${String(m).padStart(2, '0')} ${ap}`;
      };
      const stamp = ms => { lastStamp = Math.max(lastStamp, ms); return fmt(new Date(lastStamp)); };
      const nextTime = () => stamp(t0 + (msgIdx++) * 48000);
      const nowTime = () => stamp(Date.now());

      /* ---------- markup helpers ---------- */
      const av = w => `<span class="chat-av${w === 'couple' ? ' chat-av-couple' : ''}" style="--c:${WHO[w].c}" aria-hidden="true">${esc(WHO[w].ini)}</span>`;

      function mapArt(ev) {
        const flip = ev.venue === 'home' ? ' transform="translate(240 0) scale(-1 1)"' : '';
        return `<svg viewBox="0 0 240 84" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
          <rect width="240" height="84" fill="#efe5cc"/>
          <g${flip}>
            <rect x="14" y="8" width="46" height="26" rx="6" fill="#cfe2bb"/>
            <rect x="176" y="52" width="52" height="26" rx="6" fill="#cfe2bb"/>
            <path d="M-10 70 C 50 50, 110 92, 250 40" stroke="#bcd6e4" stroke-width="9" fill="none"/>
            <path d="M0 42 H240 M78 0 V84 M150 0 L190 84 M0 16 L240 6" stroke="#fffaf0" stroke-width="5" fill="none"/>
            <path d="M-5 60 L245 24" stroke="#f3c766" stroke-width="7" fill="none"/>
          </g>
          <ellipse cx="120" cy="47" rx="9" ry="3" fill="rgba(60,20,10,.25)"/>
          <g transform="translate(120 46)">
            <path d="M0 0 C -8 -11 -13 -17 -13 -24 A13 13 0 1 1 13 -24 C 13 -17 8 -11 0 0Z" fill="#8a1c2b"/>
            <circle cy="-24" r="5" fill="#fff4dc"/>
          </g>
        </svg>`;
      }

      function eventCard(s) {
        const ev = s.ev;
        const tag = s.n > 1 ? `Function ${s.i + 1} of ${s.n}` : 'Save the date';
        const time = ev.isTimeText
          ? `<i>${esc(ev.time)}</i>${ev.timeEn ? ` <span class="chat-ev-sub">(${esc(ev.timeEn)})</span>` : ''}`
          : esc(ev.time);
        const v = ev.venueInfo;
        const mapInner = `
            <span class="chat-map-art">${mapArt(ev)}</span>
            <span class="chat-map-cap"><b>${esc(v.name)}</b><small>${esc(v.area)}</small></span>
            ${STATIC ? '' : '<span class="chat-map-go">Directions ›</span>'}`;
        const map = STATIC
          ? `<div class="chat-map">${mapInner}</div>`
          : `<a class="chat-map" href="${esc(v.map)}" target="_blank" rel="noopener" aria-label="Directions to ${esc(v.name)}">${mapInner}</a>`;
        return `
          <div class="chat-ev">
            <div class="chat-ev-band"><span class="chat-ev-emo" aria-hidden="true">${EMOJI[ev.id] || '✨'}</span><span class="chat-ev-tag">📣 ${esc(tag)}</span></div>
            <div class="chat-ev-body">
              <h3 class="chat-ev-name">${esc(ev.name)}</h3>
              ${ev.hi ? `<p class="chat-ev-hi" lang="hi">${esc(ev.hi)}</p>` : ''}
              <ul class="chat-ev-facts">
                <li><span aria-hidden="true">📅</span><span>${esc(ev.dateLong)}</span></li>
                <li><span aria-hidden="true">⏰</span><span>${time}</span></li>
                <li><span aria-hidden="true">📍</span><span>${esc(ev.place)}</span></li>
                ${ev.note ? `<li><span aria-hidden="true">🍛</span><span>${esc(ev.note.charAt(0).toUpperCase() + ev.note.slice(1))}</span></li>` : ''}
                ${ev.dress ? `<li><span aria-hidden="true">🌈</span><span>Dress code: ${esc(ev.dress)}</span></li>` : ''}
              </ul>
            </div>
            ${map}
          </div>`;
      }

      function waveHTML() {
        let out = '';
        for (let i = 0; i < 30; i++) {
          const h = 22 + Math.round(70 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.45)));
          out += `<i style="--h:${h}%;--d:${(i % 6) * 0.07}s"></i>`;
        }
        return out;
      }

      function rowHTML(s, cont) {
        const w = WHO[s.who];
        const time = `<span class="chat-time">${s.now ? nowTime() : nextTime()}</span>`;
        const name = cont ? '' : `<span class="chat-name" style="color:${w.c}">${esc(w.name)}</span>`;
        let body = '', cls = '';
        switch (s.t) {
          case 'event':
            cls = ' chat-b-ev'; body = name + eventCard(s) + time; break;
          case 'sticker':
            return `<div class="chat-row chat-in${cont ? ' chat-cont' : ''}">${av(s.who)}
              <div class="chat-stk" role="img" aria-label="${esc(w.name)} sent a sticker: ${esc(s.label)}">
                <span class="chat-stk-emo" aria-hidden="true">${s.emo}</span>
                <span class="chat-stk-lbl">${esc(s.label)}</span>
                ${time}
              </div></div>`;
          case 'voice':
            cls = ' chat-b-voice';
            body = `${name}
              ${STATIC ? '<div class="chat-vn">' : `<button type="button" class="chat-vn" aria-label="Play voice note from ${esc(w.name)}">`}
                <span class="chat-vn-play" aria-hidden="true"><span class="chat-vn-tri"></span><span class="chat-vn-badge">🥁</span></span>
                <span class="chat-vn-wave" aria-hidden="true">${waveHTML()}</span>
                <span class="chat-vn-dur">0:07</span>
              ${STATIC ? '</div>' : '</button>'}
              <div class="chat-txt">${esc(s.cap)}</div>${time}`;
            break;
          case 'couple':
            cls = ' chat-b-couple';
            body = `${name}<div class="chat-txt"><span class="chat-big">${esc(s.text)}</span> 🙏❤️<span class="chat-sign">— ${esc(P.groom)} &amp; ${esc(P.bride)}</span></div>${time}`;
            break;
          case 'invite':
            return `<div class="chat-row chat-wide" id="chat-invite">
              <div class="chat-b chat-b-card">
                <span class="chat-name" style="color:${w.c}">${esc(w.name)} shared the invitation</span>
                <div class="chat-card-band"><span aria-hidden="true">💌</span><span>${esc(ctx.greeting)},</span></div>
                <div class="chat-card-sum">${ctx.summaryHTML()}</div>
                ${time}
              </div></div>`;
          default:
            body = `${name}<div class="chat-txt">${s.html || esc(s.text)}</div>${time}`;
        }
        return `<div class="chat-row chat-in${cont ? ' chat-cont' : ''}">${av(s.who)}<div class="chat-b${cls}">${body}</div></div>`;
      }

      /* ---------- skeleton ---------- */
      const pinInner = `<span class="chat-pin-ic" aria-hidden="true">📌</span>
        <span class="chat-pin-txt"><b>Pinned · Mummy</b><span>${esc(ctx.greeting)}: all ${ctx.events.length > 1 ? `${ctx.events.length} functions` : 'details'} here 💌</span></span>
        ${STATIC ? '' : '<span class="chat-pin-go">View</span>'}`;

      root.innerHTML = `
        <div class="chat-app${STATIC ? ' chat-static' : ''}">
          <header class="chat-top">
            <span class="chat-back" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22"><path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
            <span class="chat-gav" aria-hidden="true">💍</span>
            <div class="chat-ttl">
              <h1>Aggarwal Parivar 💍</h1>
              <p class="chat-sub">${esc(MEMBERS)}</p>
            </div>
          </header>
          ${STATIC ? `<div class="chat-pin">${pinInner}</div>` : `<button type="button" class="chat-pin" aria-label="Open pinned message with all details">${pinInner}</button>`}
          <div class="chat-scroll">
            <div class="chat-thread" role="log" aria-live="polite" aria-label="Family group chat"></div>
          </div>
          ${STATIC ? '' : `
          <div class="chat-skipwrap">
            <span class="chat-hint">Tap the chat to speed up</span>
            <button type="button" class="chat-skip">Skip to details ⏭</button>
          </div>`}
          <footer class="chat-bar">
            ${STATIC ? '' : `<div class="chat-chips" role="group" aria-label="Quick replies">
              <button type="button" class="chat-chip" data-reply="yes">🙏 Zaroor aayenge</button>
              ${has('engagement') ? '<button type="button" class="chat-chip" data-reply="sangeet">💃 Ready for Sangeet</button>' : ''}
              <a class="chat-chip" data-reply="dir" href="${esc(firstMap)}" target="_blank" rel="noopener">📍 Directions</a>
              <button type="button" class="chat-chip" data-reply="cal" data-inv-cal>📅 Save the date</button>
            </div>`}
            <div class="chat-input" aria-hidden="true">
              <span class="chat-input-box"><span class="chat-input-emo">😊</span><span class="chat-input-ph">Message</span></span>
              <span class="chat-send"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M4 12l16-8-6 16-2.5-6.5L4 12z" fill="currentColor"/></svg></span>
            </div>
          </footer>
        </div>`;

      const app = root.querySelector('.chat-app');
      const thread = root.querySelector('.chat-thread');
      const scroller = root.querySelector('.chat-scroll');
      const sub = root.querySelector('.chat-sub');
      let lastWho = null;

      function append(s, animate) {
        let html;
        if (s.t === 'date') html = `<div class="chat-date"><span>${esc(s.text)}</span></div>`;
        else if (s.t === 'sys') html = `<div class="chat-sys"><span>${esc(s.text)}</span></div>`;
        else html = rowHTML(s, s.who === lastWho && s.t !== 'invite');
        lastWho = s.who || null;
        const tmp = document.createElement('div');
        tmp.innerHTML = html.trim();
        const node = tmp.firstChild;
        if (animate && !RM) node.classList.add('chat-pop');
        thread.appendChild(node);
        return node;
      }

      /* ---------- static image ---------- */
      if (STATIC) {
        steps.forEach(s => append(s, false));
        const done = () => ctx.ready();
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(done, done); else done();
        return;
      }

      /* ---------- interactive ---------- */
      const nearBottom = () => scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 220;
      function toBottom(force) {
        if (!force && !nearBottom()) return;
        try { scroller.scrollTo({ top: scroller.scrollHeight, behavior: RM || AUTO ? 'auto' : 'smooth' }); }
        catch (e) { scroller.scrollTop = scroller.scrollHeight; }
      }

      function jumpToCard() {
        const card = root.querySelector('#chat-invite');
        if (!card) return;
        scroller.scrollTop += card.getBoundingClientRect().top - scroller.getBoundingClientRect().top - 8;
      }

      let typingNode = null;
      function showTyping(who) {
        hideTyping();
        const w = WHO[who];
        sub.textContent = `${who === 'couple' ? P.groom : w.name} is typing…`;
        sub.classList.add('is-typing');
        const d = document.createElement('div');
        d.className = 'chat-row chat-in chat-typing' + (RM ? '' : ' chat-pop');
        d.innerHTML = `${av(who)}<div class="chat-b"><span class="chat-dots" aria-label="${esc(w.name)} is typing"><i></i><i></i><i></i></span></div>`;
        thread.appendChild(d);
        typingNode = d;
        toBottom(true);
      }
      function hideTyping() {
        if (typingNode) { typingNode.remove(); typingNode = null; }
        sub.textContent = MEMBERS;
        sub.classList.remove('is-typing');
      }

      let hurryFn = null, fast = false, running = false, finished = false;
      function wait(ms) {
        if (fast) return Promise.resolve();
        return new Promise(res => {
          const done = () => { clearTimeout(t); if (hurryFn === done) hurryFn = null; res(); };
          const t = setTimeout(done, ms);
          hurryFn = done;
        });
      }
      const hurry = () => { if (hurryFn) hurryFn(); };

      const typeDur = s => {
        if (RM) return 350;
        if (s.t === 'event') return 1300;
        if (s.t === 'sticker') return 650;
        if (s.t === 'voice') return 1200;
        const len = s.len || (s.text || '').length;
        return Math.max(650, Math.min(1500, 450 + len * 22));
      };

      async function playChat() {
        running = true;
        for (const s of steps) {
          if (!fast && s.who) { showTyping(s.who); await wait(typeDur(s)); hideTyping(); }
          const node = append(s, !fast);
          if (!fast) {
            if (s.who) ctx.sound.play(s.t === 'couple' ? 'chime' : 'pop');
            toBottom(true);
            if (s.t === 'voice' && AUTO) setTimeout(() => playVoice(node.querySelector('.chat-vn')), 500);
            await wait(s.t === 'event' ? 1500 : s.t === 'voice' ? (AUTO ? 3200 : 1400) : s.who ? 650 : 400);
          }
        }
        running = false;
        finish();
      }

      function finish() {
        if (finished) return;
        finished = true;
        hideTyping();
        const sw = root.querySelector('.chat-skipwrap');
        if (sw) sw.classList.add('is-done');
        app.classList.add('chat-finished');
        ctx.ready();
        if (AUTO) autoTail();
      }

      function skipToDetails() {
        fast = true;
        hurry();
        hideTyping();
        if (!running && !finished) { steps.forEach(s => append(s, false)); finish(); }
        setTimeout(jumpToCard, 60);
        setTimeout(jumpToCard, 450);
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => setTimeout(jumpToCard, 30));
      }

      /* voice note */
      function playVoice(btn) {
        if (!btn || btn.classList.contains('is-playing')) return;
        btn.classList.add('is-playing');
        btn.setAttribute('aria-label', 'Playing voice note');
        ctx.sound.play('dhol');
        const t1 = setTimeout(() => ctx.sound.play('dhol'), 850);
        const t2 = setTimeout(() => ctx.sound.play('dhol'), 1700);
        const dur = btn.querySelector('.chat-vn-dur');
        let sec = 0;
        const iv = setInterval(() => { sec = Math.min(7, sec + 1); dur.textContent = '0:0' + sec; }, 370);
        setTimeout(() => {
          clearInterval(iv); clearTimeout(t1); clearTimeout(t2);
          btn.classList.remove('is-playing');
          btn.classList.add('is-played');
          dur.textContent = '0:07';
          btn.setAttribute('aria-label', 'Play voice note again');
        }, 2600);
      }

      /* quick replies */
      const REPLIES = {
        yes: { text: '🙏 Zaroor aayenge!', snd: 'pop', badge: '🥰', reply: 'Yayyy! 🥰 Intezaar rahega' },
        sangeet: { text: '💃 Ready for Sangeet!', snd: 'dhol', badge: '💃', reply: 'Bua ji ke saath dance-off pakka 😄💃' },
        dir: { text: '📍 Directions bhejo', snd: 'pop', badge: '👍', reply: 'Location upar har card mein hai 📍 Seedha aa jaana!' },
        cal: { text: '📅 Date save kar li!', snd: null, badge: '❤️', reply: 'Shabaash! Bhoolna mat 😄📅' },
      };
      function sendReply(kind) {
        const r = REPLIES[kind];
        if (!r) return;
        const node = document.createElement('div');
        node.className = 'chat-row chat-out' + (RM ? '' : ' chat-pop');
        node.innerHTML = `<div class="chat-b"><div class="chat-txt">${esc(r.text)}</div><span class="chat-time">${nowTime()} <span class="chat-ticks" aria-label="read">✓✓</span></span></div>`;
        if (typingNode) thread.insertBefore(node, typingNode); else thread.appendChild(node);
        lastWho = 'you';
        if (r.snd) ctx.sound.play(r.snd);
        toBottom(true);
        setTimeout(() => {
          const b = document.createElement('span');
          b.className = 'chat-react' + (RM ? '' : ' chat-pop');
          b.setAttribute('aria-label', 'Mummy reacted ' + r.badge);
          b.textContent = r.badge;
          node.querySelector('.chat-b').appendChild(b);
          if (!running) showTyping('mummy');
          setTimeout(() => {
            if (!running) hideTyping();
            const m = append({ who: 'mummy', text: r.reply, now: true }, true);
            if (typingNode) thread.insertBefore(m, typingNode);
            ctx.sound.play('pop');
            toBottom(true);
          }, running ? 200 : 900);
        }, 600);
      }

      /* group info sheet (pinned message) */
      let sheet = null;
      function openSheet() {
        if (!sheet) {
          sheet = document.createElement('div');
          sheet.className = 'chat-sheet';
          sheet.setAttribute('role', 'dialog');
          sheet.setAttribute('aria-modal', 'true');
          sheet.setAttribute('aria-label', 'Group info');
          sheet.innerHTML = `
            <div class="chat-sheet-top"><button type="button" class="chat-sheet-back">‹ Back to chat</button><span>Group info</span></div>
            <div class="chat-sheet-body">
              <div class="chat-gi">
                <span class="chat-gi-av" aria-hidden="true">💍</span>
                <h2>Aggarwal Parivar 💍</h2>
                <p>Group · 6 members</p>
              </div>
              <p class="chat-sheet-lbl">📌 Pinned by Mummy</p>
              <p class="chat-sheet-greet">${esc(ctx.greeting)},</p>
              ${ctx.summaryHTML()}
              <p class="chat-sheet-lbl">Members</p>
              <ul class="chat-members">
                ${['mummy', 'papa', 'bua', 'chachu', 'nilaksh'].map(w => `<li>${av(w)}<span>${esc(WHO[w].name)}</span>${w === 'mummy' ? '<em>Group admin</em>' : ''}</li>`).join('')}
                <li><span class="chat-av" style="--c:#c98a12" aria-hidden="true">★</span><span>You${guestName ? ` (${esc(guestName)})` : ''}</span><em>Special guest</em></li>
              </ul>
            </div>`;
          app.appendChild(sheet);
          sheet.querySelector('.chat-sheet-back').addEventListener('click', closeSheet);
          sheet.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });
        }
        sheet.hidden = false;
        sheet.classList.remove('is-out');
        sheet.scrollTop = 0;
        sheet.querySelector('.chat-sheet-back').focus({ preventScroll: true });
      }
      function closeSheet() {
        if (!sheet) return;
        ctx.sound.play('tap');
        sheet.hidden = true;
        toBottom(true);
      }

      /* wiring */
      scroller.addEventListener('click', e => {
        const vn = e.target.closest('.chat-vn');
        if (vn) { playVoice(vn); return; }
        if (e.target.closest('a,button')) return;
        hurry();
      });
      root.querySelector('.chat-skip').addEventListener('click', () => { ctx.sound.play('whoosh'); skipToDetails(); });
      root.querySelector('.chat-pin').addEventListener('click', () => {
        ctx.sound.play('tap');
        if (!finished) { fast = true; hurry(); hideTyping(); if (!running) { steps.forEach(s => append(s, false)); finish(); } }
        openSheet();
      });
      root.querySelector('.chat-chips').addEventListener('click', e => {
        const c = e.target.closest('[data-reply]');
        if (c) sendReply(c.getAttribute('data-reply'));
      });

      /* intro: a message notification with the greeting; the tap unlocks sound */
      const intro = document.createElement('div');
      intro.className = 'chat-intro';
      intro.innerHTML = `
        <div class="chat-toran" aria-hidden="true"></div>
        <div class="chat-intro-in">
          <p class="chat-intro-app"><span class="chat-logo" aria-hidden="true">✉</span> Chitthi</p>
          <div class="chat-notif">
            <span class="chat-gav" aria-hidden="true">💍</span>
            <div class="chat-notif-txt">
              <p class="chat-notif-top"><b>Aggarwal Parivar 💍</b><span>now</span></p>
              <p>Mummy: <span class="chat-at">@${esc(guestName || 'everyone')}</span> 🙏 you are invited!</p>
            </div>
          </div>
          <p class="chat-notif-more">+ ${msgCount - 1} more messages</p>
          <h1 class="chat-intro-greet">${esc(ctx.greeting)}</h1>
          <p class="chat-intro-line">Family group mein aapke liye ek khaas message hai 💌</p>
          <p class="chat-intro-couple">${esc(P.groom)} <span>&amp;</span> ${esc(P.bride)}</p>
          <p class="chat-intro-occ">${esc(ctx.occasion.title)}</p>
          <button type="button" class="chat-open">Open chat 💬</button>
          <button type="button" class="chat-intro-skip">Skip to details</button>
        </div>`;
      app.appendChild(intro);

      let started = false;
      function start(skip) {
        if (started) return;
        started = true;
        ctx.sound.play(skip ? 'whoosh' : 'pop');
        intro.classList.add('is-gone');
        setTimeout(() => intro.remove(), RM ? 0 : 450);
        if (skip) { fast = true; steps.forEach(s => append(s, false)); finish(); skipToDetails(); }
        else setTimeout(playChat, RM ? 100 : 500);
      }
      intro.querySelector('.chat-open').addEventListener('click', () => start(false));
      intro.querySelector('.chat-intro-skip').addEventListener('click', () => start(true));

      /* auto demo */
      function autoTail() {
        setTimeout(() => sendReply('yes'), 1200);
        if (has('engagement')) setTimeout(() => sendReply('sangeet'), 3600);
        setTimeout(jumpToCard, has('engagement') ? 6400 : 4000);
      }
      if (AUTO) setTimeout(() => start(false), 1600);
    },
  });
})();
