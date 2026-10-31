// Premium entitlements. Source of truth: Firestore `premium/{uid}` = { until: Timestamp, plan }.
// Clients can only READ it; it is written by the owner (Console) or by the Stripe webhook function.
(() => {
  const P = (window.Premium = { map: new Map(), meActive: false, meDoc: null, ready: false, db: null });
  const cfg = window.SYNTIX_CONFIG?.firebase;
  const init = () => {
    if (P.db) return true;
    if (!cfg || !cfg.apiKey || cfg.apiKey.startsWith('PASTE_') || !window.firebase || !firebase.firestore) return false;
    if (!firebase.apps.length) firebase.initializeApp(cfg);
    P.db = firebase.firestore();
    return true;
  };
  const active = d => !!(d && d.until && d.until.toMillis && d.until.toMillis() > Date.now());

  P.isActive = uid => P.map.get(uid) === true;
  P.badge = uid => (P.isActive(uid) ? '<span class="gem" title="Premium">💎</span>' : '');
  P.until = () => (P.meDoc && P.meDoc.until && P.meDoc.until.toDate ? P.meDoc.until.toDate() : null);

  // batch-load premium status for many users (cached per page)
  P.load = async uids => {
    if (!init()) return;
    const need = [...new Set((uids || []).filter(Boolean))].filter(u => !P.map.has(u));
    for (let i = 0; i < need.length; i += 10) {
      const chunk = need.slice(i, i + 10);
      try {
        const snap = await P.db.collection('premium').where(firebase.firestore.FieldPath.documentId(), 'in', chunk).get();
        snap.docs.forEach(d => P.map.set(d.id, active(d.data())));
      } catch (e) { console.warn('Syntix premium:', e); }
      chunk.forEach(u => { if (!P.map.has(u)) P.map.set(u, false); });
    }
  };

  if (init() && firebase.auth) {
    firebase.auth().onAuthStateChanged(async u => {
      P.meActive = false; P.meDoc = null;
      if (u) {
        try {
          const d = await P.db.collection('premium').doc(u.uid).get();
          P.meDoc = d.exists ? d.data() : null;
          P.meActive = active(P.meDoc);
          P.map.set(u.uid, P.meActive);
        } catch (e) { console.warn('Syntix premium (me):', e); }
      }
      P.ready = true;
      window.dispatchEvent(new Event('syntix-premium'));
    });
  }
})();
