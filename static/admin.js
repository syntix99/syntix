(() => {
const C = window.Syntix, $ = s => document.querySelector(s), esc = C.esc;
let db, me = null, tab = 'reports';
const LABEL = { community_posts: 'Пост', community_comments: 'Комментарий в ленте', tool_comments: 'Комментарий к сервису' };

const when = ts => (ts && ts.toDate ? ts.toDate().toLocaleString('ru-RU') : '');
const errBox = e => `<div class="notice">Ошибка: ${esc((e && (e.code || e.message)) || e)}${e && e.code === 'permission-denied' ? '. Опубликуй актуальный firestore.rules.' : ''}</div>`;

async function reportsHtml() {
  const snap = await db.collection('reports').orderBy('createdAt', 'desc').limit(100).get();
  if (snap.empty) return '<div class="empty-state"><div class="big">✅</div><p>Жалоб нет.</p></div>';
  const groups = new Map();
  snap.docs.forEach(d => {
    const r = d.data(), k = r.col + '/' + r.docId;
    const g = groups.get(k) || { col: r.col, docId: r.docId, reports: [] };
    g.reports.push({ id: d.id, uid: r.uid, at: r.createdAt }); groups.set(k, g);
  });
  const list = [...groups.values()];
  await Promise.all(list.map(async g => { try { const d = await db.collection(g.col).doc(g.docId).get(); g.doc = d.exists ? d.data() : null; } catch { g.doc = null; } }));
  await C.loadProfiles(list.map(g => g.doc && g.doc.uid));
  return list.map(g => {
    const d = g.doc, gid = esc(g.col + '/' + g.docId);
    const link = g.col === 'tool_comments' && d ? `./tool.html?id=${encodeURIComponent(C.slug(d.toolName))}#comments` : g.col === 'community_posts' ? `./feed.html#post-${encodeURIComponent(g.docId)}` : './feed.html';
    return `<article class="adm-card"><div class="adm-head"><b>${esc(LABEL[g.col] || g.col)}</b><span class="muted small">жалоб: ${g.reports.length} · ${esc(when(g.reports[0].at))}</span></div>
      ${d ? `<p class="adm-who">Автор: <a class="author-link" href="./profile.html?uid=${encodeURIComponent(d.uid)}">${esc(C.name(d.uid, d.authorName))}</a></p>${d.title ? `<h3>${esc(d.title)}</h3>` : ''}<p class="adm-body">${esc(String(d.body || '').slice(0, 400))}</p>` : '<p class="muted">Контент уже удалён.</p>'}
      <div class="adm-actions">${d ? `<a class="btn ghost" href="${link}" target="_blank" rel="noopener">Открыть</a><button class="btn ghost danger" data-del-content="${gid}">Удалить контент</button><button class="btn ghost danger" data-ban="${esc(d.uid)}" data-reason="${gid}">Забанить автора</button>` : ''}<button class="btn ghost" data-dismiss="${gid}">Закрыть жалобы</button></div></article>`;
  }).join('');
}
async function suggestHtml() {
  const snap = await db.collection('tool_suggestions').orderBy('createdAt', 'desc').limit(100).get();
  if (snap.empty) return '<div class="empty-state"><div class="big">💡</div><p>Предложений нет.</p></div>';
  return snap.docs.map(d => { const s = d.data(); return `<article class="adm-card"><div class="adm-head"><b>${esc(s.name)}</b><span class="muted small">${esc(s.category)} · ${esc(when(s.createdAt))}</span></div><p class="adm-body"><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer nofollow">${esc(s.url)}</a></p>${s.note ? `<p class="adm-body">${esc(s.note)}</p>` : ''}<div class="adm-actions"><button class="btn ghost danger" data-del-sug="${esc(d.id)}">Удалить</button></div></article>`; }).join('');
}
async function bansHtml() {
  const snap = await db.collection('bans').limit(100).get();
  if (snap.empty) return '<div class="empty-state"><div class="big">🕊️</div><p>Банов нет.</p></div>';
  await C.loadProfiles(snap.docs.map(d => d.id));
  return snap.docs.map(d => { const b = d.data(); return `<article class="adm-card"><div class="adm-head"><b><a class="author-link" href="./profile.html?uid=${encodeURIComponent(d.id)}">${esc(C.name(d.id))}</a></b><span class="muted small">${esc(when(b.createdAt))}</span></div><p class="adm-body">${esc(b.reason || '')}</p><div class="adm-actions"><button class="btn ghost" data-unban="${esc(d.id)}">Снять бан</button></div></article>`; }).join('');
}
async function show() {
  document.querySelectorAll('[data-atab]').forEach(b => b.classList.toggle('active', b.dataset.atab === tab));
  $('#panel').innerHTML = '<div class="empty-state"><div class="big">⏳</div></div>';
  try { $('#panel').innerHTML = await ({ reports: reportsHtml, suggest: suggestHtml, bans: bansHtml })[tab](); }
  catch (e) { console.error('Syntix admin:', e); $('#panel').innerHTML = errBox(e); }
}

document.addEventListener('click', async e => {
  const g = sel => e.target.closest(sel);
  let b;
  if ((b = g('[data-atab]'))) { tab = b.dataset.atab; show(); return; }
  try {
    if ((b = g('[data-del-content]'))) {
      if (!confirm('Удалить этот контент безвозвратно?')) return;
      const [col, id] = b.dataset.delContent.split('/');
      await db.collection(col).doc(id).delete(); await dismiss(b.dataset.delContent); C.toast('Удалено'); show();
    } else if ((b = g('[data-dismiss]'))) { await dismiss(b.dataset.dismiss); C.toast('Жалобы закрыты'); show(); }
    else if ((b = g('[data-ban]'))) {
      if (!confirm('Забанить автора? Он не сможет публиковать и писать.')) return;
      await db.collection('bans').doc(b.dataset.ban).set({ reason: 'жалоба: ' + b.dataset.reason, by: me.uid, createdAt: C.now() }); C.toast('Автор забанен');
    } else if ((b = g('[data-unban]'))) { await db.collection('bans').doc(b.dataset.unban).delete(); C.toast('Бан снят'); show(); }
    else if ((b = g('[data-del-sug]'))) { await db.collection('tool_suggestions').doc(b.dataset.delSug).delete(); show(); }
  } catch (err) { console.error(err); C.toast('Не получилось: ' + (err.code || err.message)); }
});
async function dismiss(key) {
  const [col, id] = key.split('/');
  const snap = await db.collection('reports').where('docId', '==', id).get();
  const batch = db.batch();
  snap.docs.filter(d => d.data().col === col).forEach(d => batch.delete(d.ref));
  await batch.commit();
}

function start() {
  if (!C.init()) { $('#who').textContent = 'Firebase не настроен.'; return; }
  db = C.db;
  C.auth.onAuthStateChanged(async u => {
    me = u;
    if (!u) { $('#who').innerHTML = 'Войди в аккаунт администратора. <a href="./account.html">Войти</a>'; return; }
    let ok = false;
    try { ok = (await db.collection('admins').doc(u.uid).get()).exists; } catch (e) { console.warn(e); }
    if (!ok) { $('#who').innerHTML = `Нет доступа. Чтобы стать администратором, создай в Firebase Console → Firestore документ <code>admins/${esc(u.uid)}</code> (любое поле).`; return; }
    $('#who').textContent = 'Администратор: ' + (u.displayName || u.email);
    $('#tabs').style.display = ''; show();
  });
}
start();
})();
