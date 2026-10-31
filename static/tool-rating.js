(() => {
  const $ = s => document.querySelector(s);
  const ru = () => (localStorage.getItem('syntix-lang') || 'ru') === 'ru';
  const tx = (a, b) => (ru() ? a : b);
  const slug = s => String(s).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const id = new URLSearchParams(location.search).get('id') || '';
  let db = null, u = null, rows = [], busy = false;

  const plural = n => {
    if (!ru()) return n === 1 ? 'rating' : 'ratings';
    const a = n % 10, b = n % 100;
    return a === 1 && b !== 11 ? 'оценка' : a >= 2 && a <= 4 && (b < 10 || b >= 20) ? 'оценки' : 'оценок';
  };

  function paint() {
    const box = $('#rating');
    if (!box || box.dataset.ok !== '1') return;
    const n = rows.length;
    const avg = n ? rows.reduce((s, r) => s + r.value, 0) / n : 0;
    const mine = u ? rows.find(r => r.uid === u.uid) : null;
    const v = mine ? mine.value : 0;
    $('#ratingKicker').textContent = tx('РЕЙТИНГ СООБЩЕСТВА', 'COMMUNITY RATING');
    $('#ratingAvg').textContent = n ? avg.toFixed(1) : '—';
    $('#ratingCount').textContent = n ? `${n} ${plural(n)}` : tx('Оценок пока нет', 'No ratings yet');
    $('#stars').innerHTML = [1, 2, 3, 4, 5].map(i =>
      `<button type="button" data-v="${i}" class="${i <= v ? 'on' : ''}" aria-label="${i}/5" aria-pressed="${i === v}">★</button>`).join('');
    $('#ratingHint').textContent = !u
      ? tx('Войди, чтобы поставить оценку.', 'Sign in to rate.')
      : v
        ? tx(`Твоя оценка: ${v}. Нажми ту же звезду, чтобы убрать её.`, `Your rating: ${v}. Click the same star to remove it.`)
        : tx('Поставь оценку этому сервису.', 'Rate this tool.');
  }

  document.addEventListener('click', async e => {
    const b = e.target.closest('#stars button');
    if (!b || busy) return;
    if (!u) { location.href = './account.html#signup'; return; }
    const v = +b.dataset.v;
    const mine = rows.find(r => r.uid === u.uid);
    const ref = db.collection('tool_ratings').doc(id + '_' + u.uid);
    busy = true;
    try {
      if (mine && mine.value === v) {
        await ref.delete();
        rows = rows.filter(r => r.uid !== u.uid);
      } else {
        await ref.set({ toolSlug: id, uid: u.uid, value: v, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
        rows = rows.filter(r => r.uid !== u.uid);
        rows.push({ toolSlug: id, uid: u.uid, value: v });
      }
    } catch (err) {
      console.error('Syntix rating:', err);
      if (window.toast) toast(tx('Не удалось сохранить оценку. Проверь правила Firestore.', 'Could not save rating. Check Firestore rules.'));
    }
    busy = false;
    try { localStorage.removeItem('syntix-rt-v1'); } catch {  }
    paint();
  });

  async function start() {
    if (!id) return;
    const cfg = window.SYNTIX_CONFIG?.firebase;
    if (!cfg || !cfg.apiKey || cfg.apiKey.startsWith('PASTE_') || !window.firebase) return;
    try {
      const arr = await (await fetch('./tools.json')).json();
      if (!arr.some(x => slug(x[0]) === id)) return;
    } catch { return; }
    if (!firebase.apps.length) firebase.initializeApp(cfg);
    db = firebase.firestore();
    const box = $('#rating');
    box.dataset.ok = '1';
    box.style.display = '';
    paint();
    const l = $('#language');
    if (l) l.addEventListener('click', () => setTimeout(paint, 0));
    firebase.auth().onAuthStateChanged(x => { u = x; paint(); });
    try {
      const snap = await db.collection('tool_ratings').where('toolSlug', '==', id).limit(500).get();
      rows = snap.docs.map(d => d.data());
    } catch (e) { console.warn('Syntix ratings:', e); }
    paint();
  }
  start();
})();
