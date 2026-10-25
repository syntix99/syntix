(() => {
  const $ = s => document.querySelector(s);
  const ru = () => (localStorage.getItem('syntix-lang') || 'ru') === 'ru';
  const toolId = () => new URLSearchParams(location.search).get('id') || '';
  let db = null, user = null, favs = new Set();

  const col = () => db.collection('profiles').doc(user.uid).collection('favorites');

  function paint() {
    const b = $('#favBtn');
    if (!b) return;
    const on = favs.has(toolId());
    b.textContent = on ? (ru() ? '♥ В избранном' : '♥ In favorites') : (ru() ? '♡ В избранное' : '♡ Add to favorites');
    b.classList.toggle('active', on);
  }

  async function load() {
    favs = new Set();
    if (user) {
      try { (await col().get()).forEach(d => favs.add(d.id)); } catch (e) { console.warn('favorites', e); }
    }
    paint();
  }

  document.addEventListener('click', async e => {
    const b = e.target.closest('#favBtn');
    if (!b) return;
    if (!user) { location.href = './account.html#signup'; return; }
    const id = toolId(), tool = window.currentTool;
    if (!id || !tool) return;
    b.disabled = true;
    try {
      if (favs.has(id)) { await col().doc(id).delete(); favs.delete(id); }
      else {
        await col().doc(id).set({ slug: id, toolName: tool[0], createdAt: firebase.firestore.FieldValue.serverTimestamp() });
        favs.add(id);
      }
    } catch (err) { console.error(err); }
    const nb = $('#favBtn'); if (nb) nb.disabled = false;
    paint();
  });

  function start() {
    const cfg = window.SYNTIX_CONFIG?.firebase;
    if (!cfg || !cfg.apiKey || cfg.apiKey.startsWith('PASTE_') || !window.firebase) return;
    if (!firebase.apps.length) firebase.initializeApp(cfg);
    db = firebase.firestore();
    // tool.js re-renders #detail on load and language change
    new MutationObserver(paint).observe($('#detail'), { childList: true });
    firebase.auth().onAuthStateChanged(u => { user = u; load(); });
  }
  start();
})();
