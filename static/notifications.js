(() => {
const C = window.Syntix, $ = s => document.querySelector(s), esc = C.esc;
const TXT = {
  ru: { cat: 'Каталог', feed: 'Лента', top: 'Рейтинг', msg: 'Сообщения', h: 'Уведомления', sub: 'Ответы на твои посты, лайки и новые подписчики.',
    empty: 'Пока тихо. Когда кто-то прокомментирует, оценит твой пост или подпишется, это появится здесь.', markAll: 'Отметить все прочитанными',
    comment: 'прокомментировал(а) твой пост', like: 'оценил(а) твой пост', follow: 'подписался(лась) на тебя',
    signTitle: 'Войди, чтобы видеть уведомления', signLink: 'Войти или зарегистрироваться', loadError: 'Не удалось загрузить уведомления.',
    permHint: ' Опубликуй актуальный firestore.rules.', marked: 'Все отмечены прочитанными' },
  en: { cat: 'Directory', feed: 'Feed', top: 'Leaderboard', msg: 'Messages', h: 'Notifications', sub: 'Replies to your posts, likes and new followers.',
    empty: 'Quiet for now. When someone comments on, likes your post or follows you, it shows up here.', markAll: 'Mark all as read',
    comment: 'commented on your post', like: 'liked your post', follow: 'started following you',
    signTitle: 'Sign in to see notifications', signLink: 'Log in or sign up', loadError: 'Could not load notifications.',
    permHint: ' Publish the latest firestore.rules.', marked: 'All marked as read' }
};
let lang = C.lang(), db, me = null, items = [];
const t = k => TXT[lang][k];

function paintStatic() {
  document.documentElement.lang = lang;
  $('#language').textContent = lang === 'ru' ? 'EN' : 'RU';
  $('#nCat').textContent = t('cat'); $('#nFeed').textContent = t('feed'); $('#nTop').textContent = t('top'); $('#nMsg').textContent = t('msg');
  $('#h').textContent = t('h'); $('#sub').textContent = t('sub'); $('#markAll').textContent = t('markAll');
}
function render() {
  const box = $('#list');
  if (!me) { box.innerHTML = `<div class="empty-state"><div class="big">🔔</div><p>${esc(t('signTitle'))}</p><a class="btn primary" href="./account.html#signup">${esc(t('signLink'))}</a></div>`; $('#markAll').style.display = 'none'; return; }
  $('#markAll').style.display = items.some(i => i.wasUnread) ? '' : 'none';
  if (!items.length) { box.innerHTML = `<div class="empty-state"><div class="big">🔔</div><p>${esc(t('empty'))}</p></div>`; return; }
  box.innerHTML = items.map(i => {
    const name = C.name(i.fromUid, i.fromName);
    const href = i.type === 'follow' ? `./profile.html?uid=${encodeURIComponent(i.fromUid)}` : `./feed.html#post-${encodeURIComponent(i.postId)}`;
    return `<a class="notif ${i.wasUnread ? 'unread' : ''}" href="${href}">${C.avatar(i.fromUid, name, 'md')}<div class="notif-tx"><p><b>${esc(name)}</b> ${esc(t(i.type) || '')}</p>${i.snippet ? `<q>${esc(i.snippet)}</q>` : ''}<span class="when">${esc(C.ago(i.createdAt))}</span></div>${i.wasUnread ? '<i class="ti-dot"></i>' : ''}</a>`;
  }).join('');
}
async function load() {
  try {
    const snap = await db.collection('notifications').doc(me.uid).collection('items').orderBy('createdAt', 'desc').limit(50).get();
    items = snap.docs.map(d => ({ id: d.id, ...d.data(), wasUnread: d.data().read === false }));
    await C.loadProfiles(items.map(i => i.fromUid));
    render();
    markAll(true);
  } catch (e) {
    console.error('Syntix notifications:', e);
    $('#list').innerHTML = `<div class="notice">${esc(t('loadError'))}${e.code === 'permission-denied' ? esc(t('permHint')) : ''}<div class="muted small">${esc(e.code || e.message)}</div></div>`;
  }
}
async function markAll(silent) {
  const unread = items.filter(i => i.wasUnread);
  if (!unread.length) return;
  try {
    const batch = db.batch();
    unread.forEach(i => batch.update(db.collection('notifications').doc(me.uid).collection('items').doc(i.id), { read: true }));
    await batch.commit();
    if (!silent) { items.forEach(i => { i.wasUnread = false; }); render(); C.toast(t('marked')); }
  } catch (e) { console.warn('mark read', e); }
}
$('#markAll').addEventListener('click', () => markAll(false));
$('#language').addEventListener('click', () => { lang = lang === 'ru' ? 'en' : 'ru'; localStorage.setItem('syntix-lang', lang); paintStatic(); render(); });

paintStatic();
if (!C.init()) { $('#list').innerHTML = `<div class="notice">${esc(t('loadError'))}</div>`; }
else {
  db = C.db;
  C.auth.onAuthStateChanged(u => { me = u; if (u) load(); else render(); });
}
})();
