(() => {
const TXT = {
  ru: {
    catalog: 'Каталог', community: 'Сообщество',
    footer: 'Независимый каталог AI-инструментов. Информация о бесплатных планах может меняться.',
    loading: 'Загружаем профиль…',
    noFirebase: 'Не найдены настройки Firebase в config.js.',
    loadError: 'Не удалось загрузить профиль. Проверь настройки Firebase и правила Firestore.',
    member: 'Участник Syntix', you: 'ТВОЙ ПРОФИЛЬ', public: 'ПРОФИЛЬ УЧАСТНИКА',
    since: 'С нами с', noBio: 'Пока ничего не рассказано о себе.',
    edit: 'Редактировать', cancel: 'Отмена', save: 'Сохранить', saving: 'Сохраняем…',
    saved: 'Профиль сохранён.', fail: 'Не удалось сохранить. Проверь правила Firestore.',
    name: 'Имя', bio: 'О себе', avatar: 'Аватар', chooseAvatar: 'Загрузить фото', removeAvatar: 'Убрать фото',
    badFile: 'Выбери файл изображения.', needName: 'Укажи имя.',
    settings: 'Настройки', lang: 'Язык интерфейса', showFav: 'Показывать избранное другим пользователям',
    logout: 'Выйти', copy: 'Копировать ссылку', copied: 'Ссылка скопирована',
    favorites: 'Избранное', comments: 'Активность', ratings: 'Оценки', rateEmpty: 'Оценок пока нет. Оцени сервис на его странице.',
    favEmpty: 'В избранном пока пусто. Открой карточку AI-сервиса и нажми «В избранное».',
    favPrivate: 'Пользователь скрыл своё избранное.',
    comEmpty: 'Публикаций и комментариев пока нет.',
    kPost: 'Публикация', kComment: 'Комментарий в ленте', kTool: 'Обсуждение сервиса',
    remove: 'Убрать', open: 'Открыть ↗'
  },
  en: {
    catalog: 'Directory', community: 'Community',
    footer: 'Independent AI tools directory. Free plan details may change.',
    loading: 'Loading profile…',
    noFirebase: 'Firebase settings missing from config.js.',
    loadError: 'Could not load the profile. Check Firebase settings and Firestore rules.',
    member: 'Syntix member', you: 'YOUR PROFILE', public: 'MEMBER PROFILE',
    since: 'Member since', noBio: 'Nothing shared yet.',
    edit: 'Edit', cancel: 'Cancel', save: 'Save', saving: 'Saving…',
    saved: 'Profile saved.', fail: 'Could not save. Check Firestore rules.',
    name: 'Name', bio: 'About', avatar: 'Avatar', chooseAvatar: 'Upload photo', removeAvatar: 'Remove photo',
    badFile: 'Choose an image file.', needName: 'Enter a name.',
    settings: 'Settings', lang: 'Interface language', showFav: 'Show my favorites to other users',
    logout: 'Log out', copy: 'Copy link', copied: 'Link copied',
    favorites: 'Favorites', comments: 'Activity', ratings: 'Ratings', rateEmpty: 'No ratings yet. Rate a tool on its page.',
    favEmpty: 'No favorites yet. Open an AI tool page and press “Add to favorites”.',
    favPrivate: 'This user keeps favorites private.',
    comEmpty: 'No posts or comments yet.',
    kPost: 'Post', kComment: 'Feed comment', kTool: 'Tool discussion',
    remove: 'Remove', open: 'Open ↗'
  }
};
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const slug = s => String(s).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
let lang = localStorage.getItem('syntix-lang') || 'ru';
const t = k => TXT[lang][k] || TXT.ru[k] || k;
let db, auth, me = null, uid = null, profile = null, tools = [], tab = 'favorites', pendingAvatar, started = false;
const errBox = e => {
  const code = (e && (e.code || e.message)) || '';
  const hint = code === 'permission-denied'
    ? (lang === 'ru' ? ' Правила Firestore не пускают: опубликуй актуальный firestore.rules (Firebase Console → Firestore Database → Rules → Publish).' : ' Firestore rules deny access: publish the latest firestore.rules (Firebase Console → Firestore Database → Rules → Publish).')
    : '';
  return `<div class="detail-panel"><p>${esc(t('loadError'))}${esc(hint)}</p><p class="muted">${esc(code)}</p></div>`;
};
const root = $('#profile');
const own = () => !!me && me.uid === uid;

function paintStatic() {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i]').forEach(e => { if (TXT[lang][e.dataset.i]) e.textContent = t(e.dataset.i); });
  $('#language').textContent = lang === 'ru' ? 'EN' : 'RU';
  $('#year').textContent = new Date().getFullYear();
}
const dateText = ts => (ts?.toDate ? ts.toDate() : new Date()).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US');
function avatarHtml(p, cls) {
  if (p.avatar) return `<img class="profile-avatar ${cls || ''}" src="${esc(p.avatar)}" alt="">`;
  const ch = (p.displayName || 'S').trim().slice(0, 1).toUpperCase() || 'S';
  return `<span class="profile-avatar ${cls || ''}">${esc(ch)}</span>`;
}
function fileToAvatar(file) {
  return new Promise((res, rej) => {
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => {
      const s = Math.min(img.width, img.height), c = document.createElement('canvas');
      c.width = c.height = 160;
      c.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 160, 160);
      URL.revokeObjectURL(url);
      res(c.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('bad image')); };
    img.src = url;
  });
}

function render() {
  const p = profile, isOwn = own();
  const link = `${location.origin}${location.pathname}?uid=${encodeURIComponent(uid)}`;
  root.innerHTML = `
  <section class="detail-panel profile-card">
    ${avatarHtml(p, 'big')}
    <div class="profile-info">
      <small>${t(isOwn ? 'you' : 'public')}</small>
      <h1>${esc(p.displayName)}</h1>
      <p class="profile-bio">${p.bio ? esc(p.bio).replace(/\n/g, '<br>') : esc(t('noBio'))}</p>
      <p class="muted">${t('since')} ${esc(dateText(p.createdAt))}</p>
    </div>
    <div class="profile-actions">
      <button class="btn ghost" id="copyBtn" type="button" data-link="${esc(link)}">${t('copy')}</button>
      ${isOwn ? `<button class="btn ghost" id="editBtn" type="button">${t('edit')}</button><button class="btn ghost" id="logoutBtn" type="button">${t('logout')}</button>` : ''}
    </div>
  </section>
  ${isOwn ? `
  <form class="detail-panel profile-edit" id="editForm" style="display:none">
    <small>${t('settings').toUpperCase()}</small>
    <div class="profile-avatar-row">
      <div id="avatarPreview">${avatarHtml(p)}</div>
      <div>
        <input id="avatarFile" type="file" accept="image/*" hidden>
        <button class="btn ghost" type="button" id="avatarPick">${t('chooseAvatar')}</button>
        <button class="btn ghost" type="button" id="avatarClear">${t('removeAvatar')}</button>
      </div>
    </div>
    <label class="field"><span>${t('name')}</span><input id="pName" maxlength="40" required value="${esc(p.displayName)}"></label>
    <label class="field"><span>${t('bio')}</span><textarea id="pBio" rows="4" maxlength="300">${esc(p.bio || '')}</textarea></label>
    <label class="field"><span>${t('lang')}</span><select id="pLang"><option value="ru" ${lang === 'ru' ? 'selected' : ''}>Русский</option><option value="en" ${lang === 'en' ? 'selected' : ''}>English</option></select></label>
    <label class="profile-check"><input type="checkbox" id="pShowFav" ${p.showFavorites ? 'checked' : ''}><span>${t('showFav')}</span></label>
    <div class="profile-actions"><button class="btn primary" id="saveBtn" type="submit">${t('save')}</button><button class="btn ghost" id="cancelBtn" type="button">${t('cancel')}</button></div>
    <p class="message" id="pMsg" role="status"></p>
  </form>` : ''}
  <div class="ptabs">
    <button type="button" data-tab="favorites" class="${tab === 'favorites' ? 'active' : ''}">♥ ${t('favorites')}</button>
    <button type="button" data-tab="ratings" class="${tab === 'ratings' ? 'active' : ''}">★ ${t('ratings')}</button>
    <button type="button" data-tab="comments" class="${tab === 'comments' ? 'active' : ''}">✎ ${t('comments')}</button>
  </div>
  <div id="tabBody" class="feed-list"></div>`;
  bind();
  loadTab();
}

function bind() {
  $('#copyBtn').onclick = async e => {
    try { await navigator.clipboard.writeText(e.currentTarget.dataset.link); e.currentTarget.textContent = t('copied'); } catch { prompt('', e.currentTarget.dataset.link); }
  };
  document.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { tab = b.dataset.tab; render(); });
  if (!own()) return;
  const form = $('#editForm');
  pendingAvatar = undefined;
  $('#editBtn').onclick = () => { form.style.display = form.style.display === 'none' ? '' : 'none'; };
  $('#cancelBtn').onclick = () => render();
  $('#logoutBtn').onclick = async () => { await auth.signOut(); location.href = './index.html'; };
  $('#avatarPick').onclick = () => $('#avatarFile').click();
  $('#avatarClear').onclick = () => { pendingAvatar = ''; $('#avatarPreview').innerHTML = avatarHtml({ displayName: $('#pName').value }); };
  $('#avatarFile').onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    if (!f.type.startsWith('image/')) { $('#pMsg').className = 'message error'; $('#pMsg').textContent = t('badFile'); return; }
    try { pendingAvatar = await fileToAvatar(f); $('#avatarPreview').innerHTML = avatarHtml({ avatar: pendingAvatar }); }
    catch { $('#pMsg').className = 'message error'; $('#pMsg').textContent = t('badFile'); }
  };
  form.onsubmit = async e => {
    e.preventDefault();
    const msg = $('#pMsg'), btn = $('#saveBtn');
    const displayName = $('#pName').value.trim().slice(0, 40);
    if (!displayName) { msg.className = 'message error'; msg.textContent = t('needName'); return; }
    const data = {
      displayName,
      bio: $('#pBio').value.trim().slice(0, 300),
      avatar: pendingAvatar === undefined ? (profile.avatar || '') : pendingAvatar,
      showFavorites: $('#pShowFav').checked,
      lang: $('#pLang').value,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    btn.disabled = true; btn.textContent = t('saving');
    try {
      await db.collection('profiles').doc(uid).update(data);
      try { await me.updateProfile({ displayName }); } catch (err) { console.warn(err); }
      profile = { ...profile, ...data, updatedAt: null };
      lang = data.lang; localStorage.setItem('syntix-lang', lang);
      paintStatic(); render();
      const m = $('#pMsg'); m.className = 'message ok'; m.textContent = t('saved');
      $('#editForm').style.display = '';
    } catch (err) {
      console.error(err); msg.className = 'message error'; msg.textContent = t('fail');
      btn.disabled = false; btn.textContent = t('save');
    }
  };
}

async function loadTab() {
  const box = $('#tabBody');
  box.innerHTML = '<div class="detail-panel">…</div>';
  try { box.innerHTML = tab === 'favorites' ? await favoritesHtml() : tab === 'ratings' ? await ratingsHtml() : await activityHtml(); }
  catch (e) { console.error('Syntix profile tab:', e); box.innerHTML = errBox(e); return; }
  box.querySelectorAll('[data-unfav]').forEach(b => b.onclick = async () => {
    b.disabled = true;
    try { await db.collection('profiles').doc(uid).collection('favorites').doc(b.dataset.unfav).delete(); loadTab(); } catch (e) { console.error(e); b.disabled = false; }
  });
}

async function favoritesHtml() {
  if (!own() && !profile.showFavorites) return `<div class="detail-panel"><p>${esc(t('favPrivate'))}</p></div>`;
  const snap = await db.collection('profiles').doc(uid).collection('favorites').orderBy('createdAt', 'desc').get();
  if (snap.empty) return `<div class="detail-panel"><p>${esc(t('favEmpty'))}</p></div>`;
  return snap.docs.map(d => {
    const f = d.data(), tool = tools.find(x => slug(x[0]) === d.id);
    const name = tool ? tool[0] : f.toolName, sum = tool ? (lang === 'ru' ? tool[4] : tool[5]) : '';
    return `<article class="feed-card fav-card">
      ${tool ? `<div class="icon ${esc(tool[2])}">${esc(tool[1])}</div>` : ''}
      <div class="fav-text"><h3>${esc(name)}</h3>${sum ? `<p class="feed-body">${esc(sum)}</p>` : ''}
      <div class="feed-bottom"><a class="feed-tool" href="./tool.html?id=${encodeURIComponent(d.id)}">${t('open')}</a>${own() ? `<button class="btn ghost" type="button" data-unfav="${esc(d.id)}">${t('remove')}</button>` : ''}</div></div>
    </article>`;
  }).join('');
}

async function activityHtml() {
  const q = c => db.collection(c).where('uid', '==', uid).limit(50).get().then(s => s.docs.map(d => ({ id: d.id, c, ...d.data() }))).catch(e => { console.warn(c, e); return []; });
  const rows = (await Promise.all([q('community_posts'), q('community_comments'), q('tool_comments')])).flat();
  rows.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
  if (!rows.length) return `<div class="detail-panel"><p>${esc(t('comEmpty'))}</p></div>`;
  return rows.slice(0, 60).map(r => {
    const kind = r.c === 'community_posts' ? t('kPost') : r.c === 'community_comments' ? t('kComment') : t('kTool');
    const href = r.c === 'tool_comments' ? `./tool.html?id=${encodeURIComponent(slug(r.toolName || ''))}#comments` : './community.html';
    const label = r.c === 'tool_comments' ? r.toolName : (r.toolName || '');
    return `<article class="feed-card">
      <div class="feed-meta"><span>${esc(kind)}</span><span>·</span><time>${esc(dateText(r.createdAt))}</time></div>
      ${r.title ? `<h3>${esc(r.title)}</h3>` : ''}
      <p class="feed-body">${esc(r.body).replace(/\n/g, '<br>')}</p>
      <div class="feed-bottom"><a class="feed-tool" href="${href}">${esc(label || t('open'))} ↗</a></div>
    </article>`;
  }).join('');
}

async function ratingsHtml() {
  const snap = await db.collection('tool_ratings').where('uid', '==', uid).limit(100).get();
  const rows = snap.docs.map(d => d.data()).sort((a, b) => (b.updatedAt?.toMillis?.() || 0) - (a.updatedAt?.toMillis?.() || 0));
  if (!rows.length) return `<div class="detail-panel"><p>${esc(t('rateEmpty'))}</p></div>`;
  return rows.map(r => {
    const tool = tools.find(x => slug(x[0]) === r.toolSlug);
    if (!tool) return '';
    return `<article class="feed-card fav-card"><div class="icon ${esc(tool[2])}">${esc(tool[1])}</div><div class="fav-text"><h3>${esc(tool[0])}</h3><p class="feed-body rating-stars" aria-label="${r.value}/5">${'★'.repeat(r.value)}${'☆'.repeat(5 - r.value)}</p><div class="feed-bottom"><a class="feed-tool" href="./tool.html?id=${encodeURIComponent(r.toolSlug)}">${t('open')}</a></div></div></article>`;
  }).join('');
}

async function run() {
  const param = new URLSearchParams(location.search).get('uid');
  uid = param || (me && me.uid);
  if (!uid) { location.href = './account.html'; return; }
  try {
    try { tools = await (await fetch('./tools.json')).json(); } catch { tools = []; }
    const ref = db.collection('profiles').doc(uid), snap = await ref.get();
    if (snap.exists) profile = snap.data();
    else if (own()) {
      const ts = firebase.firestore.FieldValue.serverTimestamp();
      const d = { displayName: (me.displayName || me.email?.split('@')[0] || t('member')).trim().slice(0, 40) || t('member'), bio: '', avatar: '', showFavorites: true, lang, createdAt: ts, updatedAt: ts };
      await ref.set(d);
      profile = { ...d, createdAt: null, updatedAt: null };
    } else profile = { displayName: t('member'), bio: '', avatar: '', showFavorites: false, createdAt: null };
    if (own() && !localStorage.getItem('syntix-lang') && profile.lang) { lang = profile.lang; paintStatic(); }
    document.title = `${profile.displayName} — Syntix`;
    render();
  } catch (e) {
    console.error('Syntix profile:', e);
    root.innerHTML = errBox(e);
  }
}

function init() {
  paintStatic();
  const cfg = window.SYNTIX_CONFIG?.firebase;
  if (!cfg || !cfg.apiKey || cfg.apiKey.startsWith('PASTE_') || !window.firebase) { root.innerHTML = `<div class="detail-panel"><p>${esc(t('noFirebase'))}</p></div>`; return; }
  if (!firebase.apps.length) firebase.initializeApp(cfg);
  db = firebase.firestore(); auth = firebase.auth();
  $('#language').addEventListener('click', () => { lang = lang === 'ru' ? 'en' : 'ru'; localStorage.setItem('syntix-lang', lang); paintStatic(); if (profile) render(); });
  auth.onAuthStateChanged(u => {
    if (started) { if ((u && u.uid) !== (me && me.uid)) location.reload(); return; }
    started = true; me = u; run();
  });
}
init();
})();
