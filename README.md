/* Aggregated tool ratings, cached in the browser for 30 minutes (used by the catalog and the finder) */
(() => {
  const KEY = 'syntix-rt-v1', TTL = 30 * 60 * 1000;
  window.SyntixRatings = {
    async get() {
      try { const c = JSON.parse(localStorage.getItem(KEY) || 'null'); if (c && Date.now() - c.t < TTL) return c.r; } catch { /* ignore */ }
      const cfg = window.SYNTIX_CONFIG?.firebase;
      if (!cfg || !window.firebase || !firebase.firestore) return {};
      if (!firebase.apps.length) firebase.initializeApp(cfg);
      const snap = await firebase.firestore().collection('tool_ratings').orderBy('updatedAt', 'desc').limit(600).get();
      const m = {};
      snap.docs.forEach(d => { const x = d.data(), a = m[x.toolSlug] || (m[x.toolSlug] = { n: 0, sum: 0 }); a.n++; a.sum += x.value; });
      const r = {};
      Object.keys(m).forEach(k => { const a = m[k]; r[k] = { n: a.n, avg: a.sum / a.n, score: (a.sum + 7) / (a.n + 2) }; });
      try { localStorage.setItem(KEY, JSON.stringify({ t: Date.now(), r })); } catch { /* quota */ }
      return r;
    }
  };
})();
