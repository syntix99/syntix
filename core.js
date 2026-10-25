/* Syntix shared helpers (feed + messages) */
(() => {
  const C = (window.Syntix = {});
  C.esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  C.slug = s => String(s).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  C.lang = () => localStorage.getItem('syntix-lang') || 'ru';
  C.ru = () => C.lang() === 'ru';
  C.tx = (a, b) => (C.ru() ? a : b);
  C.toast = m => { if (window.toast) window.toast(m); };

  C.init = () => {
    const cfg = window.SYNTIX_CONFIG?.firebase;
    if (!cfg || !cfg.apiKey || cfg.apiKey.startsWith('PASTE_') || !window.firebase) return false;
    if (!firebase.apps.length) firebase.initializeApp(cfg);
    C.db = firebase.firestore();
    C.auth = firebase.auth();
    return true;
  };
  C.now = () => firebase.firestore.FieldValue.serverTimestamp();
  C.ms = v => (v && v.toMillis ? v.toMillis() : 0);

  C.ago = v => {
    const t = C.ms(v);
    if (!t) return C.tx('только что', 'just now');
    const s = Math.round((t - Date.now()) / 1000), a = Math.abs(s);
    const rtf = new Intl.RelativeTimeFormat(C.ru() ? 'ru' : 'en', { numeric: 'auto' });
    if (a < 45) return C.tx('только что', 'just now');
    if (a < 3600) return rtf.format(Math.round(s / 60), 'minute');
    if (a < 86400) return rtf.format(Math.round(s / 3600), 'hour');
    if (a < 86400 * 7) return rtf.format(Math.round(s / 86400), 'day');
    return new Date(t).toLocaleDateString(C.ru() ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // text -> safe HTML with clickable links and line breaks
  C.rich = s => C.esc(s)
    .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer nofollow">$1</a>')
    .replace(/\n/g, '<br>');

  // ---- public profile cache ----
  C.P = new Map();
  C.loadProfiles = async uids => {
    const need = [...new Set((uids || []).filter(Boolean))].filter(u => !C.P.has(u));
    for (let i = 0; i < need.length; i += 10) {
      const chunk = need.slice(i, i + 10);
      try {
        const snap = await C.db.collection('profiles').where(firebase.firestore.FieldPath.documentId(), 'in', chunk).get();
        snap.docs.forEach(d => C.P.set(d.id, d.data()));
      } catch (e) { console.warn('Syntix profiles:', e); }
      chunk.forEach(u => { if (!C.P.has(u)) C.P.set(u, null); });
    }
  };
  C.name = (uid, fallback) => C.P.get(uid)?.displayName || fallback || C.tx('Участник Syntix', 'Syntix member');
  C.avatar = (uid, name, cls = '') => {
    const p = C.P.get(uid);
    if (p && p.avatar) return `<img class="av ${cls}" src="${C.esc(p.avatar)}" alt="">`;
    const letter = C.esc((name || 'S').trim().slice(0, 1).toUpperCase() || 'S');
    let h = 0;
    for (const ch of String(uid || name || '')) h = (h * 31 + ch.charCodeAt(0)) % 360;
    return `<span class="av ${cls}" style="background:linear-gradient(135deg,hsl(${h} 70% 72%),hsl(${(h + 45) % 360} 65% 55%))">${letter}</span>`;
  };

  // make sure the signed-in user has a public profile document
  C.ensureProfile = async u => {
    const ref = C.db.collection('profiles').doc(u.uid), snap = await ref.get();
    if (snap.exists) { C.P.set(u.uid, snap.data()); return snap.data(); }
    const ts = C.now();
    const d = {
      displayName: ((u.displayName || (u.email || '').split('@')[0] || '').trim().slice(0, 40)) || C.tx('Участник Syntix', 'Syntix member'),
      bio: '', avatar: '', showFavorites: true, allowDms: true, lang: C.lang(), createdAt: ts, updatedAt: ts
    };
    await ref.set(d);
    C.P.set(u.uid, { ...d, createdAt: null, updatedAt: null });
    return d;
  };
})();
