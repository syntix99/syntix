(() => {
const C = window.Syntix, $ = s => document.querySelector(s), esc = C.esc;
const TXT = {
  ru: {
    catalog: 'Каталог', feed: 'Лента', messages: 'Сообщения', navTop: 'Рейтинг', login: 'Войти',
    channels: 'КАНАЛЫ', newChannelShort: '＋', allPosts: 'Все посты', noChannels: 'Каналов пока нет. Создай первый!',
    signTitle: 'Есть чем поделиться?', signText: 'Войди или создай бесплатный аккаунт, чтобы публиковать, комментировать и писать в личные сообщения.', signLink: 'Войти или зарегистрироваться',
    titlePh: 'Заголовок (необязательно)', composePh: 'Поделись находкой, вопросом или промптом…', publish: 'Опубликовать', busy: 'Публикуем…',
    published: 'Пост опубликован', failed: 'Не удалось отправить. Проверь правила Firestore.', blocked: 'Публиковать в этом канале может только его владелец.',
    toolNone: '✦ Сервис (необязательно)', generalOpt: '🌐 Общая лента',
    sortNew: 'Новые', sortTop: 'Популярные', search: 'Поиск по ленте…', loadMore: 'Показать ещё',
    empty: 'Здесь пока тихо. Напиши первый пост!', emptyChan: 'В этом канале пока нет постов.', emptySearch: 'Ничего не найдено.',
    shortcuts: 'БЫСТРЫЕ ССЫЛКИ', myProfile: 'Мой профиль', suggest: 'Предложить сервис',
    rulesTitle: 'ПРАВИЛА', rule1: 'Делись личным опытом и полезными промптами.', rule2: 'Уважай других участников.', rule3: 'Без спама и личных данных.',
    noComments: 'Комментариев пока нет.', commentPh: 'Написать комментарий…', send: 'Отправить', needLogin: 'Войди, чтобы комментировать.',
    like: 'Нравится', share: 'Поделиться', copied: 'Ссылка скопирована', report: 'Пожаловаться', reportQ: 'Отправить жалобу на это сообщение?', reported: 'Жалоба отправлена. Спасибо!',
    del: 'Удалить', delQ: 'Удалить без возможности восстановления?', writeDm: 'Написать',
    join: 'Подписаться', leave: 'Отписаться', joinedLbl: 'Вы подписаны', deleteChannel: 'Удалить канал', deleteChannelQ: 'Удалить канал? Посты останутся, но канал исчезнет.',
    byOwner: 'Автор', openMode: 'Публиковать может каждый', ownerMode: 'Публикует только владелец', chanShare: 'Поделиться',
    chanNew: 'Новый канал', chanName: 'Название', chanDesc: 'Описание', chanIcon: 'Значок', chanMode: 'Кто может публиковать', chanCreate: 'Создать канал',
    chanCreated: 'Канал создан', scopeAll: 'Все', scopeFollowing: 'Подписки', follow: 'Подписаться', followingLbl: 'Вы подписаны', followEmpty: 'Подпишись на людей и каналы — их посты появятся здесь.', chanLogin: 'Войди в аккаунт, чтобы создать канал.', loadError: 'Не удалось загрузить ленту.',
    permHint: ' Опубликуй актуальный firestore.rules (Firebase Console → Firestore → Rules).', posts: 'постов', anonymous: 'Участник Syntix'
  },
  en: {
    catalog: 'Directory', feed: 'Feed', messages: 'Messages', navTop: 'Leaderboard', login: 'Log in',
    channels: 'CHANNELS', newChannelShort: '＋', allPosts: 'All posts', noChannels: 'No channels yet. Create the first one!',
    signTitle: 'Something to share?', signText: 'Sign in or create a free account to post, comment and send direct messages.', signLink: 'Log in or sign up',
    titlePh: 'Title (optional)', composePh: 'Share a find, a question or a prompt…', publish: 'Publish', busy: 'Publishing…',
    published: 'Post published', failed: 'Could not send. Check Firestore rules.', blocked: 'Only the owner can post in this channel.',
    toolNone: '✦ Tool (optional)', generalOpt: '🌐 General feed',
    sortNew: 'Latest', sortTop: 'Top', search: 'Search the feed…', loadMore: 'Load more',
    empty: 'It is quiet here. Write the first post!', emptyChan: 'No posts in this channel yet.', emptySearch: 'Nothing found.',
    shortcuts: 'QUICK LINKS', myProfile: 'My profile', suggest: 'Suggest a tool',
    rulesTitle: 'GUIDELINES', rule1: 'Share real experience and useful prompts.', rule2: 'Be respectful to others.', rule3: 'No spam or personal data.',
    noComments: 'No comments yet.', commentPh: 'Write a comment…', send: 'Send', needLogin: 'Sign in to comment.',
    like: 'Like', share: 'Share', copied: 'Link copied', report: 'Report', reportQ: 'Report this message?', reported: 'Report sent. Thank you!',
    del: 'Delete', delQ: 'Delete permanently?', writeDm: 'Message',
    join: 'Follow', leave: 'Unfollow', joinedLbl: 'Following', deleteChannel: 'Delete channel', deleteChannelQ: 'Delete this channel? Posts stay, the channel disappears.',
    byOwner: 'By', openMode: 'Anyone can post', ownerMode: 'Owner-only posting', chanShare: 'Share',
    chanNew: 'New channel', chanName: 'Name', chanDesc: 'Description', chanIcon: 'Icon', chanMode: 'Who can post', chanCreate: 'Create channel',
    chanCreated: 'Channel created', scopeAll: 'All', scopeFollowing: 'Following', follow: 'Follow', followingLbl: 'Following', followEmpty: 'Follow people and channels — their posts will show up here.', chanLogin: 'Sign in to create a channel.', loadError: 'Could not load the feed.',
    permHint: ' Publish the latest firestore.rules (Firebase Console → Firestore → Rules).', posts: 'posts', anonymous: 'Syntix member'
  }
};
let lang = C.lang();
const t = k => (TXT[lang] && TXT[lang][k]) ?? TXT.ru[k] ?? k;
const PAGE = 20, ICONS = ['💬', '🚀', '🎨', '💻', '🎬', '🎵', '📚', '🧠', '⚡', '🔥', '🌍', '🛠️'];

let db, me = null, channels = [], joined = new Set(), cur = '', posts = [], lastDoc = null, hasMore = false;
let sortMode = 'new', query = '', open = new Set(), likes = {}, comments = {}, loading = false, booted = false, pickedIcon = ICONS[0], tools = [], following = new Set(), scope = 'all';

const myName = () => (C.name(me.uid, me.displayName || (me.email || '').split('@')[0]) || t('anonymous')).slice(0, 60);
const chanById = id => channels.find(c => c.id === id);
const errBox = e => {
  const code = (e && (e.code || e.message)) || '';
  return `<div class="notice">${esc(t('loadError'))}${code === 'permission-denied' ? esc(t('permHint')) : ''}<div class="muted small">${esc(code)}</div></div>`;
};

/* ---------------- static text ---------------- */
function paintStatic() {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i]').forEach(e => { const v = TXT[lang][e.dataset.i]; if (v !== undefined) e.textContent = v; });
  document.querySelectorAll('[data-ph]').forEach(e => { e.placeholder = t(e.dataset.ph); });
  $('#language').textContent = lang === 'ru' ? 'EN' : 'RU';
  $('#chMode').innerHTML = `<option value="open">${esc(t('openMode'))}</option><option value="owner">${esc(t('ownerMode'))}</option>`;
  $('#iconPick').innerHTML = ICONS.map(i => `<button type="button" class="icon-opt ${i === pickedIcon ? 'on' : ''}" data-icon="${i}">${i}</button>`).join('');
  $('#cTool').innerHTML = `<option value="">${esc(t('toolNone'))}</option>` + tools.map(x => `<option value="${esc(x[0])}">${esc(x[0])}</option>`).join('');
}

/* ---------------- data ---------------- */
async function loadChannels() {
  const snap = await db.collection('channels').orderBy('createdAt', 'desc').limit(60).get();
  channels = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  const want = new URLSearchParams(location.search).get('channel');
  if (want && !chanById(want)) {
    try { const d = await db.collection('channels').doc(want).get(); if (d.exists) channels.push({ id: d.id, ...d.data() }); } catch { /* ignore */ }
  }
}
async function loadJoined() {
  joined = new Set(); following = new Set();
  if (!me) return;
  try { (await db.collection('profiles').doc(me.uid).collection('following').get()).forEach(d => following.add(d.id)); } catch (e) { console.warn('following', e); }
  try { (await db.collection('profiles').doc(me.uid).collection('joined').get()).forEach(d => joined.add(d.id)); } catch (e) { console.warn('joined', e); }
}
async function loadExtras(ids) {
  ids.forEach(id => { likes[id] = { n: 0, mine: false }; comments[id] = []; });
  for (let i = 0; i < ids.length; i += 10) {
    const chunk = ids.slice(i, i + 10);
    try {
      (await db.collection('post_likes').where('postId', 'in', chunk).get()).docs.forEach(d => {
        const x = d.data(); if (likes[x.postId]) { likes[x.postId].n++; if (me && x.uid === me.uid) likes[x.postId].mine = true; }
      });
    } catch (e) { console.warn('likes', e); }
    try {
      (await db.collection('community_comments').where('postId', 'in', chunk).get()).docs.forEach(d => {
        const c = { id: d.id, ...d.data() }; if (comments[c.postId]) comments[c.postId].push(c);
      });
    } catch (e) { console.warn('comments', e); }
  }
  ids.forEach(id => comments[id].sort((a, b) => (C.ms(a.createdAt) || Date.now()) - (C.ms(b.createdAt) || Date.now())));
  await C.loadProfiles(ids.flatMap(id => comments[id].map(c => c.uid)));
}
async function loadPosts(reset) {
  if (loading) return;
  loading = true;
  if (reset) { posts = []; lastDoc = null; hasMore = false; $('#feed').innerHTML = skeleton(); $('#more').style.display = 'none'; }
  try {
    let docs;
    if (cur === '' && scope === 'following') {
      const seen = new Map(), jobs = [], us = [...following], cs = [...joined];
      for (let i = 0; i < us.length; i += 10) jobs.push(db.collection('community_posts').where('uid', 'in', us.slice(i, i + 10)).limit(40).get());
      for (let i = 0; i < cs.length; i += 10) jobs.push(db.collection('community_posts').where('channelId', 'in', cs.slice(i, i + 10)).limit(40).get());
      (await Promise.all(jobs)).forEach(sn => sn.docs.forEach(d => seen.set(d.id, d)));
      docs = [...seen.values()];
      hasMore = false;
    } else if (cur === '') {
      let qy = db.collection('community_posts').orderBy('createdAt', 'desc').limit(PAGE);
      if (lastDoc) qy = qy.startAfter(lastDoc);
      docs = (await qy.get()).docs;
      if (docs.length) lastDoc = docs[docs.length - 1];
      hasMore = docs.length === PAGE;
    } else {
      docs = (await db.collection('community_posts').where('channelId', '==', cur).limit(100).get()).docs;
      hasMore = false;
    }
    const fresh = docs.map(d => ({ id: d.id, ...d.data() }));
    if (cur !== '' || scope === 'following') fresh.sort((a, b) => C.ms(b.createdAt) - C.ms(a.createdAt));
    posts = posts.concat(fresh);
    await Promise.all([C.loadProfiles(fresh.map(p => p.uid)), loadExtras(fresh.map(p => p.id))]);
  } catch (e) {
    console.error('Syntix feed:', e);
    $('#feed').innerHTML = errBox(e);
    loading = false;
    return;
  }
  loading = false;
  renderFeed();
}
async function reloadComments(postId) {
  try {
    const snap = await db.collection('community_comments').where('postId', '==', postId).get();
    comments[postId] = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (C.ms(a.createdAt) || Date.now()) - (C.ms(b.createdAt) || Date.now()));
    await C.loadProfiles(comments[postId].map(c => c.uid));
  } catch (e) { console.warn(e); }
  repaintPost(postId);
}

/* ---------------- render ---------------- */
const skeleton = () => [1, 2, 3].map(() => '<div class="post skel"><div class="sk a"></div><div class="sk b"></div><div class="sk c"></div></div>').join('');

function renderChannels() {
  const list = [...channels].sort((a, b) => joined.has(b.id) - joined.has(a.id));
  $('#chanList').innerHTML = list.map(c => `<button type="button" class="chan ${cur === c.id ? 'active' : ''}" data-ch="${esc(c.id)}"><span class="ci">${esc(c.icon || '💬')}</span><span class="cn">${esc(c.name)}</span>${c.mode === 'owner' ? '<span class="lock" title="' + esc(t('ownerMode')) + '">📢</span>' : ''}${joined.has(c.id) ? '<i class="jdot"></i>' : ''}</button>`).join('') || `<p class="muted small pad">${esc(t('noChannels'))}</p>`;
  $('#allBtn').classList.toggle('active', cur === '');
}
function renderBanner() {
  const b = $('#chanBanner'), ch = chanById(cur);
  if (!ch) { b.innerHTML = ''; return; }
  const isOwner = me && ch.ownerUid === me.uid, isJoined = joined.has(ch.id);
  b.innerHTML = `<section class="chan-banner"><div class="cb-icon">${esc(ch.icon || '💬')}</div><div class="cb-info"><small>${esc(t(ch.mode === 'owner' ? 'ownerMode' : 'openMode'))}</small><h1>${esc(ch.name)}</h1>${ch.desc ? `<p>${esc(ch.desc)}</p>` : ''}<p class="muted small">${esc(t('byOwner'))} <a class="author-link" href="./profile.html?uid=${encodeURIComponent(ch.ownerUid)}">${esc(ch.ownerName || t('anonymous'))}</a></p></div><div class="cb-actions">${me ? `<button type="button" class="btn ${isJoined ? 'ghost' : 'primary'}" id="joinBtn">${esc(isJoined ? t('leave') : t('join'))}</button>` : ''}<button type="button" class="btn ghost" id="shareChannel">${esc(t('chanShare'))}</button>${isOwner ? `<button type="button" class="btn ghost danger" id="delChannel">${esc(t('deleteChannel'))}</button>` : ''}</div></section>`;
}
function renderComposer() {
  const card = $('#composeCard') || $('#composeForm'), sign = $('#signCard'), note = $('#blockedNote');
  if (!me) { card.style.display = 'none'; note.style.display = 'none'; sign.style.display = ''; return; }
  sign.style.display = 'none';
  const ch = chanById(cur), blocked = ch && ch.mode === 'owner' && ch.ownerUid !== me.uid;
  card.style.display = blocked ? 'none' : '';
  note.style.display = blocked ? '' : 'none';
  const allowed = channels.filter(c => c.mode === 'open' || c.ownerUid === me.uid);
  $('#cChan').innerHTML = `<option value="">${esc(t('generalOpt'))}</option>` + allowed.map(c => `<option value="${esc(c.id)}">${esc((c.icon || '💬') + ' ' + c.name)}</option>`).join('');
  $('#cChan').value = !blocked && allowed.some(c => c.id === cur) ? cur : '';
  $('#cAv').innerHTML = C.avatar(me.uid, myName(), 'md');
}
function commentHtml(c) {
  const name = C.name(c.uid, c.authorName), own = me && c.uid === me.uid;
  return `<div class="cm" id="c-${esc(c.id)}"><a href="./profile.html?uid=${encodeURIComponent(c.uid)}">${C.avatar(c.uid, name, 'xs')}</a><div class="cm-body"><div class="cm-head"><a class="author-link" href="./profile.html?uid=${encodeURIComponent(c.uid)}">${esc(name)}</a><span class="when">${esc(C.ago(c.createdAt))}</span>${me && !own ? `<button class="linkbtn" type="button" data-report="community_comments" data-id="${esc(c.id)}">${esc(t('report'))}</button>` : ''}${own ? `<button class="linkbtn" type="button" data-del="community_comments" data-id="${esc(c.id)}" data-post="${esc(c.postId)}">${esc(t('del'))}</button>` : ''}</div><p>${C.rich(c.body, { tags: true })}</p></div></div>`;
}
function threadHtml(p) {
  const cm = comments[p.id] || [];
  return `<div class="thread">${cm.map(commentHtml).join('') || `<p class="muted small">${esc(t('noComments'))}</p>`}${me ? `<form class="cform" data-post="${esc(p.id)}"><input name="body" required maxlength="3000" placeholder="${esc(t('commentPh'))}" autocomplete="off"><button class="btn primary" type="submit">${esc(t('send'))}</button></form>` : `<a class="muted small" href="./account.html#signup">${esc(t('needLogin'))}</a>`}</div>`;
}
function postHtml(p) {
  const ch = chanById(p.channelId), name = C.name(p.uid, p.authorName), L = likes[p.id] || { n: 0, mine: false }, cm = comments[p.id] || [];
  const own = me && p.uid === me.uid, canDel = me && (own || (ch && ch.ownerUid === me.uid));
  const href = `./profile.html?uid=${encodeURIComponent(p.uid)}`;
  return `<article class="post" id="post-${esc(p.id)}"><header class="post-head"><a href="${href}">${C.avatar(p.uid, name, 'md')}</a><div class="post-who"><a class="author-link" href="${href}">${esc(name)}</a><span class="when" title="${esc(p.createdAt?.toDate ? p.createdAt.toDate().toLocaleString() : '')}">${esc(C.ago(p.createdAt))}</span></div>${me && !own ? followBtn(p.uid) : ''}${ch && cur === '' ? `<button type="button" class="pill chpill" data-ch="${esc(ch.id)}">${esc((ch.icon || '💬') + ' ' + ch.name)}</button>` : ''}</header>${p.title ? `<h3 class="post-title">${esc(p.title)}</h3>` : ''}<p class="post-body">${C.rich(p.body, { tags: true })}</p>${C.media(p.body)}${p.toolName ? `<a class="pill tool" href="./tool.html?id=${encodeURIComponent(C.slug(p.toolName))}">✦ ${esc(p.toolName)}</a>` : ''}<footer class="post-actions"><button type="button" class="act like ${L.mine ? 'on' : ''}" data-like="${esc(p.id)}" aria-pressed="${L.mine}" title="${esc(t('like'))}">${L.mine ? '♥' : '♡'} <b>${L.n}</b></button><button type="button" class="act" data-toggle="${esc(p.id)}">💬 <b>${cm.length}</b></button><button type="button" class="act" data-share="${esc(p.id)}" title="${esc(t('share'))}">↗</button>${me && !own ? `<a class="act" href="./messages.html?to=${encodeURIComponent(p.uid)}" title="${esc(t('writeDm'))}">✉</a>` : ''}<span class="grow"></span>${me && !own ? `<button type="button" class="act quiet" data-report="community_posts" data-id="${esc(p.id)}">${esc(t('report'))}</button>` : ''}${canDel ? `<button type="button" class="act quiet" data-del="community_posts" data-id="${esc(p.id)}">${esc(t('del'))}</button>` : ''}</footer>${open.has(p.id) ? threadHtml(p) : ''}</article>`;
}
function renderFeed() {
  const ql = query.trim().toLowerCase();
  let list = posts.filter(p => !ql || [p.title, p.body, p.authorName, p.toolName, C.name(p.uid, p.authorName)].join(' ').toLowerCase().includes(ql));
  if (sortMode === 'top') list = [...list].sort((a, b) => ((likes[b.id]?.n || 0) * 2 + (comments[b.id]?.length || 0)) - ((likes[a.id]?.n || 0) * 2 + (comments[a.id]?.length || 0)) || C.ms(b.createdAt) - C.ms(a.createdAt));
  $('#feed').innerHTML = list.length ? list.map(postHtml).join('') : `<div class="empty-state"><div class="big">${ql ? '🔍' : '✨'}</div><p>${esc(ql ? t('emptySearch') : cur ? t('emptyChan') : scope === 'following' ? t('followEmpty') : t('empty'))}</p></div>`;
  $('#more').style.display = hasMore && !ql ? '' : 'none';
  renderTags();
}
function repaintPost(id) {
  const p = posts.find(x => x.id === id), el = document.getElementById('post-' + id);
  if (p && el) el.outerHTML = postHtml(p);
}
const followBtn = uid => `<button type="button" class="follow-btn ${following.has(uid) ? 'on' : ''}" data-follow="${esc(uid)}">${following.has(uid) ? '✓ ' + esc(t('followingLbl')) : '＋ ' + esc(t('follow'))}</button>`;
function renderTags() {
  const m = new Map();
  posts.forEach(p => new Set(C.tags((p.title || '') + ' ' + p.body)).forEach(g => m.set(g, (m.get(g) || 0) + 1)));
  const top = [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 8);
  const active = query.startsWith('#') ? query.slice(1).toLowerCase() : '';
  $('#tagRow').innerHTML = top.map(([g, n]) => `<button type="button" class="tag-chip ${g === active ? 'on' : ''}" data-tag="${esc(g)}">#${esc(g)} <i>${n}</i></button>`).join('') + (active ? '<button type="button" class="tag-chip" data-tag="">✕</button>' : '');
}
function syncScope() {
  if (!me) scope = 'all';
  $('#scopePills').style.display = me && cur === '' ? '' : 'none';
  document.querySelectorAll('[data-scope]').forEach(b => b.classList.toggle('active', b.dataset.scope === scope));
}
async function toggleFollow(uid) {
  const ref = db.collection('profiles').doc(me.uid).collection('following').doc(uid);
  try {
    if (following.has(uid)) { await ref.delete(); following.delete(uid); }
    else { await ref.set({ uid, createdAt: C.now() }); following.add(uid); }
  } catch (e) { console.error(e); C.toast(t('failed')); return; }
  if (scope === 'following' && !following.has(uid)) loadPosts(true); else renderFeed();
}
const DRAFT = 'syntix-draft';
function saveDraft() { try { localStorage.setItem(DRAFT, JSON.stringify({ t: $('#cTitle').value, b: $('#cBody').value })); } catch { /* ignore */ } }
function restoreDraft() {
  try { const d = JSON.parse(localStorage.getItem(DRAFT) || 'null'); if (d) { $('#cTitle').value = d.t || ''; $('#cBody').value = d.b || ''; $('#cCount').textContent = `${$('#cBody').value.length} / 5000`; } } catch { /* ignore */ }
}

function paintAll() { paintStatic(); renderChannels(); renderBanner(); renderComposer(); syncScope(); }

/* ---------------- actions ---------------- */
function selectChannel(id) {
  cur = id; open.clear(); scope = 'all';
  history.replaceState(null, '', id ? `?channel=${encodeURIComponent(id)}` : location.pathname);
  renderChannels(); renderBanner(); renderComposer(); loadPosts(true);
}
async function toggleLike(id, btn) {
  if (!me) { location.href = './account.html#signup'; return; }
  const s = likes[id] || (likes[id] = { n: 0, mine: false }), ref = db.collection('post_likes').doc(id + '_' + me.uid);
  btn.disabled = true;
  try {
    if (s.mine) { await ref.delete(); s.mine = false; s.n = Math.max(0, s.n - 1); }
    else { await ref.set({ postId: id, uid: me.uid, createdAt: C.now() }); s.mine = true; s.n++; }
  } catch (e) { console.error(e); C.toast(t('failed')); }
  repaintPost(id);
}
async function toggleJoin() {
  const ref = db.collection('profiles').doc(me.uid).collection('joined').doc(cur);
  try {
    if (joined.has(cur)) { await ref.delete(); joined.delete(cur); }
    else { await ref.set({ cid: cur, joinedAt: C.now() }); joined.add(cur); }
  } catch (e) { console.error(e); C.toast(t('failed')); }
  renderChannels(); renderBanner();
}

document.addEventListener('click', async e => {
  const g = sel => e.target.closest(sel);
  let b;
  if ((b = g('[data-ch]'))) { selectChannel(b.dataset.ch); return; }
  if ((b = g('[data-like]'))) { toggleLike(b.dataset.like, b); return; }
  if ((b = g('[data-toggle]'))) { const id = b.dataset.toggle; open.has(id) ? open.delete(id) : open.add(id); repaintPost(id); return; }
  if ((b = g('[data-share]'))) {
    const url = `${location.origin}${location.pathname}${cur ? '?channel=' + encodeURIComponent(cur) : ''}#post-${b.dataset.share}`;
    try { await navigator.clipboard.writeText(url); C.toast(t('copied')); } catch { prompt('', url); }
    return;
  }
  if ((b = g('[data-del]'))) {
    if (!confirm(t('delQ'))) return;
    try {
      await db.collection(b.dataset.del).doc(b.dataset.id).delete();
      if (b.dataset.del === 'community_posts') { posts = posts.filter(p => p.id !== b.dataset.id); renderFeed(); }
      else reloadComments(b.dataset.post);
    } catch (err) { console.error(err); C.toast(t('failed')); }
    return;
  }
  if ((b = g('[data-report]'))) {
    if (!me || !confirm(t('reportQ'))) return;
    const col = b.dataset.report, docId = b.dataset.id;
    try { await db.collection('reports').doc(col + '_' + docId + '_' + me.uid).set({ col, docId, uid: me.uid, createdAt: C.now() }); C.toast(t('reported')); }
    catch (err) { console.error(err); C.toast(t('failed')); }
    return;
  }
  if ((b = g('[data-tag]'))) {
    const tg = b.dataset.tag;
    query = tg && query.toLowerCase() !== '#' + tg ? '#' + tg : '';
    $('#search').value = query; renderFeed(); return;
  }
  if ((b = g('[data-follow]'))) { toggleFollow(b.dataset.follow); return; }
  if ((b = g('[data-scope]'))) {
    if (scope !== b.dataset.scope) { scope = b.dataset.scope; syncScope(); loadPosts(true); }
    return;
  }
  if ((b = g('[data-sort]'))) {
    sortMode = b.dataset.sort;
    document.querySelectorAll('[data-sort]').forEach(x => x.classList.toggle('active', x === b));
    renderFeed(); return;
  }
  if ((b = g('[data-icon]'))) {
    pickedIcon = b.dataset.icon;
    document.querySelectorAll('.icon-opt').forEach(x => x.classList.toggle('on', x === b)); return;
  }
  if (g('#more')) { loadPosts(false); return; }
  if (g('#newChannel')) {
    if (!me) { C.toast(t('chanLogin')); setTimeout(() => { location.href = './account.html#signup'; }, 900); return; }
    $('#chMsg').textContent = ''; $('#chanDlg').showModal(); return;
  }
  if (g('#chanClose')) { $('#chanDlg').close(); return; }
  if (e.target === $('#chanDlg')) { $('#chanDlg').close(); return; }
  if (g('#joinBtn')) { toggleJoin(); return; }
  if (g('#shareChannel')) {
    const url = `${location.origin}${location.pathname}?channel=${encodeURIComponent(cur)}`;
    try { await navigator.clipboard.writeText(url); C.toast(t('copied')); } catch { prompt('', url); }
    return;
  }
  if (g('#delChannel')) {
    if (!confirm(t('deleteChannelQ'))) return;
    try { await db.collection('channels').doc(cur).delete(); channels = channels.filter(c => c.id !== cur); selectChannel(''); }
    catch (err) { console.error(err); C.toast(t('failed')); }
  }
});

document.addEventListener('submit', async e => {
  const f = e.target;
  if (f.id === 'composeForm') {
    e.preventDefault();
    if (!me) return;
    const body = $('#cBody').value.trim(); if (!body) return;
    const btn = $('#cSubmit'); btn.disabled = true; btn.textContent = t('busy');
    try {
      await db.collection('community_posts').add({ title: $('#cTitle').value.trim(), body, toolName: $('#cTool').value, channelId: $('#cChan').value, uid: me.uid, authorName: myName(), createdAt: C.now() });
      localStorage.removeItem(DRAFT);
      $('#cBody').value = ''; $('#cTitle').value = ''; $('#cTool').value = ''; $('#cCount').textContent = '0 / 5000'; $('#cBody').style.height = '';
      C.toast(t('published'));
      const target = $('#cChan').value; if (target !== cur) selectChannel(target); else loadPosts(true);
    } catch (err) { console.error('Syntix post:', err); C.toast(t('failed')); }
    btn.disabled = false; btn.textContent = t('publish');
  } else if (f.classList.contains('cform')) {
    e.preventDefault();
    if (!me) return;
    const input = f.elements.body, body = input.value.trim(), postId = f.dataset.post; if (!body) return;
    input.disabled = true;
    try {
      await db.collection('community_comments').add({ postId, body, uid: me.uid, authorName: myName(), createdAt: C.now() });
      await reloadComments(postId);
    } catch (err) { console.error(err); C.toast(t('failed')); input.disabled = false; }
  } else if (f.id === 'chanForm') {
    e.preventDefault();
    if (!me) return;
    const btn = $('#chSubmit'); btn.disabled = true;
    try {
      const ref = await db.collection('channels').add({ name: $('#chName').value.trim(), desc: $('#chDesc').value.trim(), icon: pickedIcon, mode: $('#chMode').value, ownerUid: me.uid, ownerName: myName(), createdAt: C.now() });
      try { await db.collection('profiles').doc(me.uid).collection('joined').doc(ref.id).set({ cid: ref.id, joinedAt: C.now() }); joined.add(ref.id); } catch { /* optional */ }
      f.reset(); $('#chanDlg').close();
      await loadChannels(); C.toast(t('chanCreated')); selectChannel(ref.id);
    } catch (err) { console.error('Syntix channel:', err); $('#chMsg').className = 'message error'; $('#chMsg').textContent = t('failed'); }
    btn.disabled = false;
  }
});

$('#search').addEventListener('input', e => { query = e.target.value; renderFeed(); });
$('#cTitle').addEventListener('input', saveDraft);
$('#cBody').addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); $('#composeForm').requestSubmit(); } });
$('#cBody').addEventListener('input', e => {
  saveDraft();
  const el = e.target; $('#cCount').textContent = `${el.value.length} / 5000`;
  el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 320) + 'px';
});
$('#language').addEventListener('click', () => {
  lang = lang === 'ru' ? 'en' : 'ru'; localStorage.setItem('syntix-lang', lang);
  paintAll(); renderFeed();
});

/* ---------------- boot ---------------- */
async function boot() {
  try { tools = await (await fetch('./tools.json')).json(); } catch { tools = []; }
  paintStatic(); restoreDraft();
  try { await loadChannels(); } catch (e) { console.warn('channels', e); channels = []; }
  const want = new URLSearchParams(location.search).get('channel');
  if (want && chanById(want)) cur = want;
  paintAll();
  await loadPosts(true);
  booted = true;
  if (location.hash.startsWith('#post-')) setTimeout(() => document.getElementById(location.hash.slice(1))?.scrollIntoView({ block: 'center' }), 200);
}

function start() {
  paintStatic();
  if (!C.init()) { $('#feed').innerHTML = `<div class="notice">${esc(t('loadError'))}</div>`; return; }
  db = C.db;
  let first = true;
  C.auth.onAuthStateChanged(async u => {
    me = u;
    if (u) { try { await C.ensureProfile(u); } catch (e) { console.warn('profile', e); } await loadJoined(); } else joined = new Set();
    if (first) { first = false; await boot(); return; }
    if (booted) { await loadExtras(posts.map(p => p.id)); paintAll(); renderFeed(); }
  });
}
start();
})();
