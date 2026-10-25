/* Unread direct-message badge (tab bar, top nav, page title) */
(() => {
  const cfg = window.SYNTIX_CONFIG?.firebase;
  if (!cfg || !cfg.apiKey || cfg.apiKey.startsWith('PASTE_') || !window.firebase || !firebase.firestore || !firebase.auth) return;
  if (!firebase.apps.length) firebase.initializeApp(cfg);
  const baseTitle = document.title;
  let unsub = null, user = null, docs = [], count = 0;

  function compute() {
    count = 0;
    if (user) docs.forEach(d => {
      const x = d.data({ serverTimestamps: 'estimate' });
      if (x.lastSender === user.uid) return;
      const last = x.lastAt && x.lastAt.toMillis ? x.lastAt.toMillis() : 0;
      if (last > (+localStorage.getItem(`syntix-dm-read-${user.uid}-${d.id}`) || 0)) count++;
    });
    apply();
  }
  function apply() {
    document.querySelectorAll('.tabbar a[href="./messages.html"], nav a[href="./messages.html"]').forEach(a => {
      let b = a.querySelector('.badge');
      if (!count) { if (b) b.remove(); return; }
      if (!b) { b = document.createElement('i'); b.className = 'badge'; a.append(b); }
      b.textContent = count > 9 ? '9+' : String(count);
    });
    document.title = count ? `(${count}) ${baseTitle}` : baseTitle;
  }
  window.__applyBadge = apply;
  window.addEventListener('syntix-dm-read', compute);

  const db = firebase.firestore();
  firebase.auth().onAuthStateChanged(u => {
    user = u; if (unsub) { unsub(); unsub = null; } docs = []; count = 0; apply();
    if (!u) return;
    unsub = db.collection('dm_threads').where('participants', 'array-contains', u.uid).onSnapshot(s => { docs = s.docs; compute(); }, () => {});
  });
})();
