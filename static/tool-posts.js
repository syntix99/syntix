(() => {
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const slug = s => String(s).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const ru = () => (localStorage.getItem('syntix-lang') || 'ru') === 'ru';
  let rows = [];

  function paint() {
    const box = $('#toolPosts');
    if (!box || !rows.length) return;
    box.style.display = '';
    $('#tpTitle').textContent = ru() ? 'Из сообщества' : 'From the community';
    $('#tpAll').textContent = ru() ? 'Вся лента ↗' : 'Full feed ↗';
    $('#tpList').innerHTML = rows.slice(0, 3).map(p => {
      const body = String(p.body || '');
      const name = esc(p.authorName || (ru() ? 'Участник Syntix' : 'Syntix member'));
      const who = p.uid ? `<a class="author-link" href="./profile.html?uid=${encodeURIComponent(p.uid)}">${name}</a>` : `<span>${name}</span>`;
      const date = (p.createdAt?.toDate ? p.createdAt.toDate() : new Date()).toLocaleDateString(ru() ? 'ru-RU' : 'en-US');
      return `<article class="feed-card"><div class="feed-meta"><span class="avatar">${esc(name.slice(0, 1).toUpperCase())}</span>${who}<span>·</span><time>${esc(date)}</time></div>${p.title ? `<h3>${esc(p.title)}</h3>` : ''}<p class="feed-body">${esc(body.slice(0, 240))}${body.length > 240 ? '…' : ''}</p></article>`;
    }).join('');
  }

  async function start() {
    const id = new URLSearchParams(location.search).get('id') || '';
    const cfg = window.SYNTIX_CONFIG?.firebase;
    if (!id || !cfg || !cfg.apiKey || cfg.apiKey.startsWith('PASTE_') || !window.firebase) return;
    let tool;
    try { tool = (await (await fetch('./tools.json')).json()).find(x => slug(x[0]) === id); } catch { return; }
    if (!tool) return;
    if (!firebase.apps.length) firebase.initializeApp(cfg);
    try {
      const snap = await firebase.firestore().collection('community_posts').where('toolName', '==', tool[0]).limit(30).get();
      rows = snap.docs.map(d => d.data()).sort((a, b) => (b.createdAt?.toMillis?.() || Date.now()) - (a.createdAt?.toMillis?.() || Date.now()));
    } catch (e) { console.warn('Syntix tool posts:', e); return; }
    paint();
    const l = $('#language');
    if (l) l.addEventListener('click', () => setTimeout(paint, 0));
  }
  start();
})();
