/* Starts the e-card (loaded by invite.html after data.js).
   On this computer data.js defines window.INVITE in plain text. On the hosted site, scripts/build_site.py
   replaces it with window.INVITE_LOCKED: one AES-GCM box per group, keyed by SHA-256(salt + the group's
   link code). So the published files never list the codes or events, and only a real ?i= link opens a card;
   anything else gets a generic page. */
(function () {
  'use strict';
  const app = document.getElementById('app');
  const b64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));

  async function unlock(L, code) {
    if (!code || !(window.crypto && crypto.subtle)) return null;
    const raw = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(L.salt + code));
    const key = await crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['decrypt']);
    for (const box of L.boxes) {
      try {
        const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(box.iv) }, key, b64(box.ct));
        return JSON.parse(new TextDecoder().decode(plain));
      } catch (e) { /* another group's box */ }
    }
    return null;
  }

  function load(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src; s.onload = resolve; s.onerror = reject;
      document.body.appendChild(s);
    });
  }

  function generic(L) {
    const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    app.innerHTML = `
      <div class="inv-sum-wrap" style="min-height:100vh;display:flex;align-items:center;justify-content:center">
        <div class="inv-sum"><header class="inv-sum-head">
          <p class="inv-sum-kicker">Shubh Vivah</p>
          <h2 class="inv-sum-couple"><span>${esc(L.groom)}</span><em>with</em><span>${esc(L.bride)}</span></h2>
          <p class="inv-sum-line">${esc(L.weddingDate)}</p>
          <p class="inv-sum-line">Please open the invitation link exactly as it was sent to you.</p>
        </header></div>
      </div>`;
    document.documentElement.setAttribute('data-ready', '1');
  }

  async function boot() {
    if (!window.INVITE) {
      const L = window.INVITE_LOCKED;
      const data = await unlock(L, (new URLSearchParams(location.search).get('i') || '').trim());
      if (!data) return generic(L);
      window.INVITE = data;
    }
    await load('core.js');
    await load('deck.js');
    Invite.start(app, Invite.fromLocation());
  }
  boot();
})();
