(() => {
const C = window.Syntix, G = window.Gamify, $ = s => document.querySelector(s), esc = C.esc;
const TXT = {
  ru: { catalog: 'Каталог', feed: 'Лента', messages: 'Сообщения', navTop: 'Рейтинг', login: 'Войти',
    title: 'Рейтинг <em>Syntix.</em>', sub: 'Лучшие участники и инструменты. Очки начисляются только за настоящую активность.',
    tabUsers: '👥 Участники', tabTools: '✦ Инструменты', week: 'Неделя', month: 'Месяц', all: 'Всё время',
    you: 'Твоё место', noYou: 'Пока у тебя нет очков за этот период. Опубликуй пост или оставь комментарий!', signHint: 'Войди, чтобы увидеть своё место в рейтинге.',
    empty: 'В рейтинге пока никого. Стань первым!', outTop: 'Ты пока вне топ-50. Публикуй и комментируй, чтобы подняться!', hour: 'ч назад', toolsEmpty: 'Оценок пока нет. Оцени сервис на его странице.', ratings: 'оценок', lvl: 'Ур.',
    howKicker: 'КАК ЭТО РАБОТАЕТ', howTitle: 'Как начисляются очки', how: [['📝', 'Пост', '+10'], ['💬', 'Комментарий', '+3'], ['❤️', 'Лайк на твой пост', '+2'], ['⭐', 'Оценка сервиса', '+2'], ['📢', 'Свой канал', '+15']],
    howNote: 'Лимиты: до 5 постов и 10 комментариев в день приносят очки; лайки самому себе не считаются. Учитывается недавняя активность (последние посты, комментарии, лайки и оценки), данные обновляются раз в 15 минут.',
    updated: 'Обновлено', refresh: 'Обновить', now: 'только что', min: 'мин назад', achTitle: 'Все достижения', loadError: 'Не удалось загрузить рейтинг.',
    permHint: ' Опубликуй актуальный firestore.rules (Firebase Console → Firestore → Rules).' },
  en: { catalog: 'Directory', feed: 'Feed', messages: 'Messages', navTop: 'Leaderboard', login: 'Log in',
    title: 'Syntix <em>Leaderboard.</em>', sub: 'Top members and tools. Points are earned only through real activity.',
    tabUsers: '👥 Members', tabTools: '✦ Tools', week: 'Week', month: 'Month', all: 'All time',
    you: 'Your rank', noYou: 'You have no points for this period yet. Publish a post or leave a comment!', signHint: 'Sign in to see your rank.',
    empty: 'Nobody here yet. Be the first!', outTop: 'You are outside the top 50 for now. Post and comment to climb!', hour: 'h ago', toolsEmpty: 'No ratings yet. Rate a tool on its page.', ratings: 'ratings', lvl: 'Lv.',
    howKicker: 'HOW IT WORKS', howTitle: 'How points are earned', how: [['📝', 'Post', '+10'], ['💬', 'Comment', '+3'], ['❤️', 'Like on your post', '+2'], ['⭐', 'Tool rating', '+2'], ['📢', 'Your own channel', '+15']],
    howNote: 'Limits: up to 5 posts and 10 comments per day earn points; likes on your own posts do not count. Recent activity is counted (latest posts, comments, likes and ratings); data refreshes every 15 minutes.',
    updated: 'Updated', refresh: 'Refresh', now: 'just now', min: 'min ago', achTitle: 'All achievements', loadError: 'Could not load the leaderboard.',
    permHint: ' Publish the latest firestore.rules (Firebase Console → Firestore → Rules).' }
};
let lang = C.lang();
const t = k => (TXT[lang] && TXT[lang][k]) ?? TXT.ru[k] ?? k;
const TTL = 15 * 60 * 1000, KEY = 'syntix-lb-v2';
let db, me = null, data = null, tools = [], tab = 'users', period = 'all', error = null;

const errBox = e => { const code = (e && (e.code || e.message)) || ''; return `<div class="notice">${esc(t('loadError'))}${code === 'permission-denied' ? esc(t('permHint')) : ''}<div class="muted small">${esc(code)}</div></div>`; };

// ---------- data ----------
async function fetchGlobal() {
  let failed = 0, firstErr = null;
  const g = (c, f, n) => db.collection(c).orderBy(f, 'desc').limit(n).get().then(s => s.docs).catch(e => { failed++; firstErr = firstErr || e; console.warn('Syntix lb', c, e); return []; });
  const [posts, coms, tcoms, rates, chans, likes] = await Promise.all([
    g('community_posts', 'createdAt', 200), g('community_comments', 'createdAt', 300), g('tool_comments', 'createdAt', 300),
    g('tool_ratings', 'updatedAt', 600), g('channels', 'createdAt', 100), g('post_likes', 'createdAt', 600)
  ]);
  if (failed === 6) throw firstErr;
  const ms = v => (v && v.toMillis ? v.toMillis() : 0) || Date.now();
  const ev = [], author = {};
  posts.forEach(d => { const x = d.data(); author[d.id] = x.uid; ev.push(['p', x.uid, ms(x.createdAt)]); });
  coms.concat(tcoms).forEach(d => { const x = d.data(); ev.push(['c', x.uid, ms(x.createdAt)]); });
  rates.forEach(d => { const x = d.data(); ev.push(['r', x.uid, ms(x.updatedAt)]); });
  chans.forEach(d => { const x = d.data(); ev.push(['ch', x.ownerUid, ms(x.createdAt)]); });
  likes.forEach(d => { const x = d.data(), a = author[x.postId]; if (a && a !== x.uid) ev.push(['l', a, ms(x.createdAt)]); });
  const tr = rates.map(d => { const x = d.data(); return [x.toolSlug, x.value]; });
  return { t: Date.now(), ev, tr };
}
async function load(force) {
  if (!force) {
    try { const c = JSON.parse(localStorage.getItem(KEY) || 'null'); if (c && Date.now() - c.f < (c.mode === 'server' ? TTL : 4 * TTL)) { data = c; return; } } catch {  }
  }
  data = null;
  try {
    const d = await db.collection('stats').doc('leaderboard').get();
    if (d.exists) { const x = d.data(); data = { mode: 'server', t: x.t, users: x.users || {}, tools: x.tools || [] }; }
  } catch (e) { console.warn('stats/leaderboard', e); }
  if (!data) { data = await fetchGlobal(); data.mode = 'client'; }
  data.f = Date.now();
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {  }
}

// ---------- render ----------
function paintStatic() {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i]').forEach(e => { const v = TXT[lang][e.dataset.i]; if (v !== undefined) e.textContent = v; });
  $('#language').textContent = lang === 'ru' ? 'EN' : 'RU';
  $('#lbTitle').innerHTML = t('title'); $('#lbSub').textContent = t('sub');
  $('#tabUsers').textContent = t('tabUsers'); $('#tabTools').textContent = t('tabTools');
  $('#pWeek').textContent = t('week'); $('#pMonth').textContent = t('month'); $('#pAll').textContent = t('all');
  $('#periods').style.display = tab === 'users' ? '' : 'none';
  $('#howKicker').textContent = t('howKicker'); $('#howTitle').textContent = t('howTitle'); $('#howNote').textContent = t('howNote');
  $('#howGrid').innerHTML = t('how').map(([i, n, x]) => `<div class="how-item"><span class="hi">${i}</span><span>${esc(n)}</span><b>${esc(x)}</b></div>`).join('');
  $('#achTitle').textContent = t('achTitle');
  $('#achAll').innerHTML = G.ACH.map(a => achCard({ ...a, v: 0, done: false }, true)).join('');
  $('#refresh').textContent = t('refresh');
}
function achCard(a, catalog) {
  const pct = Math.round((a.v / a.goal) * 100);
  return `<div class="ach ${a.done ? 'done' : ''}"><div class="ach-ic">${a.icon}</div><div class="ach-tx"><b>${esc(lang === 'ru' ? a.ru : a.en)}</b><p>${esc(lang === 'ru' ? a.dr : a.de)}</p>${catalog ? '' : `<div class="mini-bar"><i style="width:${pct}%"></i></div>`}</div></div>`;
}
const gem = uid => (window.Premium ? Premium.badge(uid) : '');
const lvlPill = info => `<span class="lvlmini">${info.icon} ${esc(t('lvl'))} ${info.level}</span>`;

function rankUsers() {
  if (data.mode === 'server') {
    return (data.users[period] || []).map(e => ({ uid: e.u, xp: e.x, total: { xp: e.tx, p: e.p, c: e.c, l: e.l, r: e.r, ch: e.ch, streak: e.s, days: new Set() } }));
  }
  const since = period === 'week' ? Date.now() - 7 * G.DAY : period === 'month' ? Date.now() - 30 * G.DAY : 0;
  const per = G.build(data.ev, since), all = G.build(data.ev, 0);
  const ranked = [...per.entries()].filter(([, s]) => s.xp > 0).sort((a, b) => b[1].xp - a[1].xp || b[1].p - a[1].p).map(([uid, s]) => ({ uid, xp: s.xp, total: all.get(uid) || s }));
  return ranked;
}

async function renderUsers() {
  const ranked = rankUsers(), top = ranked.slice(0, 30);
  await C.loadProfiles(top.map(e => e.uid).concat(me ? [me.uid] : []));
  if (window.Premium) await Premium.load(top.map(e => e.uid).concat(me ? [me.uid] : []));
  const view = e => {
    const p = C.P.get(e.uid), name = C.name(e.uid), info = G.levelInfo(e.total.xp);
    const ach = G.achievements(e.total, { profileComplete: !!(p && p.avatar && p.bio), premium: !!(window.Premium && Premium.isActive(e.uid)) }).filter(a => a.done);
    return { ...e, name, info, icons: ach.slice(0, 4).map(a => a.icon).join(''), nAch: ach.length };
  };
  const rows = top.map(view);
  // my card
  if (!me) $('#meCard').innerHTML = `<div class="notice">${esc(t('signHint'))}</div>`;
  else {
    const i = ranked.findIndex(e => e.uid === me.uid);
    if (i < 0) $('#meCard').innerHTML = `<div class="notice">${esc(t(data.mode === 'server' && period === 'all' ? 'outTop' : 'noYou'))}</div>`;
    else { const v = view(ranked[i]); $('#meCard').innerHTML = `<div class="me-card"><div class="me-rank">#${i + 1}</div>${C.avatar(me.uid, v.name, 'lg')}<div class="me-info"><small>${esc(t('you'))}</small><b>${esc(v.name)}${gem(v.uid)}</b><span>${lvlPill(v.info)} · ${v.xp} XP · 🏅 ${v.nAch}</span></div></div>`; }
  }
  if (!rows.length) { $('#board').innerHTML = `<div class="empty-state"><div class="big">🏁</div><p>${esc(t('empty'))}</p></div>`; return; }
  const pod = [1, 0, 2].filter(i => rows[i]).map(i => {
    const e = rows[i];
    return `<a class="pod p${i + 1}" href="./profile.html?uid=${encodeURIComponent(e.uid)}"><span class="medal">${['🥇', '🥈', '🥉'][i]}</span>${C.avatar(e.uid, e.name, 'lg')}<b>${esc(e.name)}${gem(e.uid)}</b>${lvlPill(e.info)}<span class="pxp">${e.xp} XP</span><span class="picons">${e.icons}</span></a>`;
  }).join('');
  const list = rows.slice(3).map((e, k) => `<a class="lb-row ${me && e.uid === me.uid ? 'mine' : ''}" href="./profile.html?uid=${encodeURIComponent(e.uid)}"><span class="lb-rank">${k + 4}</span>${C.avatar(e.uid, e.name, 'md')}<span class="lb-name">${esc(e.name)}${gem(e.uid)}<small>${lvlPill(e.info)} <span class="picons">${e.icons}</span></small></span><b class="lb-xp">${e.xp} XP</b></a>`).join('');
  $('#board').innerHTML = `<div class="podium">${pod}</div>${list ? `<div class="lb-list">${list}</div>` : ''}`;
}

function renderTools() {
  $('#meCard').innerHTML = '';
  let rows;
  if (data.mode === 'server') {
    rows = data.tools.map(x => ({ slug: x.s, n: x.n, avg: x.a, score: x.c, tool: tools.find(z => C.slug(z[0]) === x.s) }));
  } else {
    const m = new Map();
    data.tr.forEach(([slug, v]) => { const x = m.get(slug) || { n: 0, sum: 0 }; x.n++; x.sum += v; m.set(slug, x); });
    rows = [...m.entries()].map(([slug, x]) => ({ slug, n: x.n, avg: x.sum / x.n, score: (x.sum + 3.5 * 2) / (x.n + 2), tool: tools.find(z => C.slug(z[0]) === slug) }));
  }
  rows = rows.filter(r => r.tool).sort((a, b) => b.score - a.score || b.n - a.n).slice(0, 20);
  if (!rows.length) { $('#board').innerHTML = `<div class="empty-state"><div class="big">⭐</div><p>${esc(t('toolsEmpty'))}</p></div>`; return; }
  $('#board').innerHTML = `<div class="lb-list">${rows.map((r, i) => `<a class="lb-row" href="./tool.html?id=${encodeURIComponent(r.slug)}"><span class="lb-rank">${i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}</span><div class="icon ${esc(r.tool[2])}">${esc(r.tool[1])}</div><span class="lb-name">${esc(r.tool[0])}<small>${esc(lang === 'ru' ? r.tool[4] : r.tool[5])}</small></span><b class="lb-xp">★ ${r.avg.toFixed(1)}<small>${r.n} ${esc(t('ratings'))}</small></b></a>`).join('')}</div>`;
}

async function render() {
  document.querySelectorAll('[data-tab]').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('[data-period]').forEach(b => b.classList.toggle('active', b.dataset.period === period));
  $('#periods').style.display = tab === 'users' ? '' : 'none';
  if (error) { $('#board').innerHTML = errBox(error); return; }
  if (!data) return;
  const mins = Math.round((Date.now() - data.t) / 60000);
  $('#updated').textContent = `${t('updated')}: ${mins < 1 ? t('now') : mins < 120 ? mins + ' ' + t('min') : Math.round(mins / 60) + ' ' + t('hour')}`;
  if (tab === 'users') await renderUsers(); else renderTools();
}

// ---------- events ----------
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-tab],[data-period],#refresh');
  if (!b) return;
  if (b.dataset.tab) { tab = b.dataset.tab; render(); }
  else if (b.dataset.period) { period = b.dataset.period; render(); }
  else if (b.id === 'refresh') {
    $('#board').innerHTML = '<div class="empty-state"><p>…</p></div>';
    try { error = null; await load(true); } catch (err) { error = err; }
    render();
  }
});
$('#language').addEventListener('click', () => { lang = lang === 'ru' ? 'en' : 'ru'; localStorage.setItem('syntix-lang', lang); paintStatic(); render(); });

async function start() {
  paintStatic();
  $('#board').innerHTML = '<div class="empty-state"><div class="big">⏳</div></div>';
  if (!C.init()) { $('#board').innerHTML = errBox({ message: 'config' }); return; }
  db = C.db;
  try { tools = await (await fetch('./tools.json')).json(); } catch { tools = []; }
  let first = true;
  C.auth.onAuthStateChanged(async u => {
    me = u;
    if (first) {
      first = false;
      try { await load(false); } catch (err) { console.error('Syntix leaderboard:', err); error = err; }
    }
    render();
  });
}
start();
})();
