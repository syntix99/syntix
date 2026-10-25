(() => {
const C = window.Syntix, $ = s => document.querySelector(s), esc = C.esc;
const TXT = {
  ru: { catalog: 'Каталог', feed: 'Лента', messages: 'Сообщения', login: 'Войти',
    noThreads: 'Диалогов пока нет. Открой профиль участника или нажми ✉ под его постом в ленте.',
    pick: 'Выбери диалог слева или начни новый из ленты или профиля участника.',
    ph: 'Напиши сообщение…', send: 'Отправить', you: 'Вы: ', back: '←', newChat: 'Новый диалог',
    signTitle: 'Войди, чтобы писать сообщения', signText: 'Личные сообщения доступны зарегистрированным участникам.', signLink: 'Войти или зарегистрироваться',
    dmOff: 'Этот пользователь отключил личные сообщения.', self: 'Нельзя написать самому себе.',
    failed: 'Не удалось отправить. Проверь правила Firestore.', loadError: 'Не удалось загрузить сообщения.',
    permHint: ' Опубликуй актуальный firestore.rules (Firebase Console → Firestore → Rules).', startHint: 'Напиши первое сообщение — диалог появится у вас обоих.', today: 'Сегодня' },
  en: { catalog: 'Directory', feed: 'Feed', messages: 'Messages', login: 'Log in',
    noThreads: 'No conversations yet. Open a member profile or press ✉ under their post in the feed.',
    pick: 'Pick a conversation on the left, or start a new one from the feed or a profile.',
    ph: 'Write a message…', send: 'Send', you: 'You: ', back: '←', newChat: 'New conversation',
    signTitle: 'Sign in to send messages', signText: 'Direct messages are available to registered members.', signLink: 'Log in or sign up',
    dmOff: 'This user has turned off direct messages.', self: 'You cannot message yourself.',
    failed: 'Could not send. Check Firestore rules.', loadError: 'Could not load messages.',
    permHint: ' Publish the latest firestore.rules (Firebase Console → Firestore → Rules).', startHint: 'Write the first message — the conversation will appear for both of you.', today: 'Today' }
};
let lang = C.lang();
const t = k => (TXT[lang] && TXT[lang][k]) ?? TXT.ru[k] ?? k;

let db, me = null, threads = [], cur = null, msgs = [], unsubMsgs = null, attached = false, firstSnap = true, unsubThreads = null;
const toParam = new URLSearchParams(location.search).get('to');
const tidOf = (a, b) => [a, b].sort().join('_');
const readKey = tid => `syntix-dm-read-${me.uid}-${tid}`;
const otherOf = th => th.participants.find(u => u !== me.uid);
const isUnread = th => th.lastSender !== me.uid && C.ms(th.lastAt) > (+localStorage.getItem(readKey(th.id)) || 0);
const errBox = e => { const code = (e && (e.code || e.message)) || ''; return `<div class="dm-empty"><div><div class="big">⚠️</div>${esc(t('loadError'))}${code === 'permission-denied' ? esc(t('permHint')) : ''}<div class="muted small">${esc(code)}</div></div></div>`; };

function paintStatic() {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i]').forEach(e => { const v = TXT[lang][e.dataset.i]; if (v !== undefined) e.textContent = v; });
  $('#language').textContent = lang === 'ru' ? 'EN' : 'RU';
}

function renderThreads() {
  const list = [...threads].sort((a, b) => C.ms(b.lastAt) - C.ms(a.lastAt));
  const draft = cur && !threads.some(x => x.id === cur.tid) ? cur : null;
  let html = '';
  if (draft) {
    const n = C.name(draft.other);
    html += `<button class="thread-item active" data-open="${esc(draft.other)}">${C.avatar(draft.other, n, 'md')}<div class="ti-main"><div class="ti-top"><span class="ti-name">${esc(n)}</span></div><div class="ti-last">${esc(t('newChat'))}</div></div></button>`;
  }
  html += list.map(th => {
    const o = otherOf(th), n = C.name(o), un = isUnread(th);
    return `<button class="thread-item ${cur && cur.tid === th.id ? 'active' : ''}" data-open="${esc(o)}">${C.avatar(o, n, 'md')}<div class="ti-main"><div class="ti-top"><span class="ti-name">${esc(n)}</span><span class="ti-time">${esc(C.ago(th.lastAt))}</span></div><div class="ti-last">${esc((th.lastSender === me.uid ? t('you') : '') + th.lastMessage)}</div></div>${un ? '<i class="ti-dot"></i>' : ''}</button>`;
  }).join('');
  $('#threads').innerHTML = html || `<p class="muted small" style="padding:12px">${esc(t('noThreads'))}</p>`;
}

function markRead() {
  if (!cur) return;
  const th = threads.find(x => x.id === cur.tid);
  if (th) { localStorage.setItem(readKey(cur.tid), String(Math.max(C.ms(th.lastAt), Date.now()))); renderThreads(); }
}

function renderShell() {
  const o = cur.other, n = C.name(o), draft = !threads.some(x => x.id === cur.tid);
  const off = draft && C.P.get(o)?.allowDms === false;
  $('#chat').innerHTML = `<div class="dm-head"><button type="button" class="mini-btn dm-back" id="dmBack" aria-label="Back">${esc(t('back'))}</button><a class="who" href="./profile.html?uid=${encodeURIComponent(o)}">${C.avatar(o, n, 'md')}<span>${esc(n)}</span></a></div><div class="dm-msgs" id="msgs"></div>${off ? `<div class="notice" style="margin:12px">${esc(t('dmOff'))}</div>` : `<form class="dm-form" id="dmForm"><textarea id="dmText" rows="1" maxlength="2000" placeholder="${esc(t('ph'))}"></textarea><button class="btn primary" type="submit" id="dmSend">${esc(t('send'))}</button></form>`}`;
  $('#dmPage').classList.add('chat-open');
}

function renderMsgs() {
  const box = $('#msgs'); if (!box) return;
  if (!msgs.length) { box.innerHTML = `<div class="dm-empty"><div><div class="big">👋</div>${esc(t('startHint'))}</div></div>`; return; }
  let last = '', html = '';
  msgs.forEach(m => {
    const ms = C.ms(m.createdAt) || Date.now(), d = new Date(ms), day = d.toDateString();
    if (day !== last) { last = day; html += `<div class="day-sep">${esc(day === new Date().toDateString() ? t('today') : d.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'long' }))}</div>`; }
    html += `<div class="bubble ${m.sender === me.uid ? 'me' : ''}">${C.rich(m.text)}<time>${esc(d.toLocaleTimeString(lang === 'ru' ? 'ru-RU' : 'en-US', { hour: '2-digit', minute: '2-digit' }))}</time></div>`;
  });
  box.innerHTML = html;
  box.scrollTop = box.scrollHeight;
}

function attach() {
  if (attached || !cur || !threads.some(x => x.id === cur.tid)) return;
  attached = true;
  unsubMsgs = db.collection('dm_threads').doc(cur.tid).collection('messages').orderBy('createdAt', 'asc').limitToLast(200)
    .onSnapshot(snap => {
      msgs = snap.docs.map(d => ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) }));
      renderMsgs(); markRead();
    }, err => { console.error('Syntix dm messages:', err); const b = $('#msgs'); if (b) b.innerHTML = errBox(err); });
}

async function openChat(other) {
  if (!other || other === me.uid) { if (other === me.uid) C.toast(t('self')); return; }
  if (unsubMsgs) { unsubMsgs(); unsubMsgs = null; }
  attached = false; msgs = [];
  cur = { tid: tidOf(me.uid, other), other };
  await C.loadProfiles([other]);
  history.replaceState(null, '', `?to=${encodeURIComponent(other)}`);
  renderShell(); renderMsgs(); renderThreads(); attach(); markRead();
  const ta = $('#dmText'); if (ta) ta.focus();
}

async function sendMessage() {
  const ta = $('#dmText'), text = ta.value.trim(); if (!text || !cur) return;
  const btn = $('#dmSend'); btn.disabled = true; ta.disabled = true;
  const [a, b] = [me.uid, cur.other].sort();
  const tref = db.collection('dm_threads').doc(cur.tid), mref = tref.collection('messages').doc();
  try {
    const batch = db.batch(), now = C.now();
    batch.set(tref, { participants: [a, b], lastMessage: text.slice(0, 200), lastAt: now, lastSender: me.uid });
    batch.set(mref, { sender: me.uid, text, createdAt: now });
    await batch.commit();
    ta.value = ''; ta.style.height = '';
  } catch (e) { console.error('Syntix dm send:', e); C.toast(t('failed')); }
  btn.disabled = false; ta.disabled = false; ta.focus();
}

document.addEventListener('click', e => {
  const o = e.target.closest('[data-open]');
  if (o) { openChat(o.dataset.open); return; }
  if (e.target.closest('#dmBack')) { $('#dmPage').classList.remove('chat-open'); }
});
document.addEventListener('submit', e => { if (e.target.id === 'dmForm') { e.preventDefault(); sendMessage(); } });
document.addEventListener('keydown', e => {
  if (e.target.id === 'dmText' && e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});
document.addEventListener('input', e => {
  if (e.target.id === 'dmText') { const el = e.target; el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 140) + 'px'; }
});
$('#language').addEventListener('click', () => {
  lang = lang === 'ru' ? 'en' : 'ru'; localStorage.setItem('syntix-lang', lang); paintStatic();
  if (me) { renderThreads(); if (cur) { renderShell(); renderMsgs(); } else showPick(); }
});

function showPick() { $('#chat').innerHTML = `<div class="dm-empty"><div><div class="big">✉️</div>${esc(t('pick'))}</div></div>`; }
function showSign() {
  $('#threads').innerHTML = '';
  $('#chat').innerHTML = `<div class="dm-empty"><div><div class="big">🔒</div><h3 style="margin:0 0 6px">${esc(t('signTitle'))}</h3><p class="muted small" style="margin:0 0 14px">${esc(t('signText'))}</p><a class="btn primary" href="./account.html#signup">${esc(t('signLink'))}</a></div></div>`;
}

function subscribeThreads() {
  if (unsubThreads) unsubThreads();
  unsubThreads = db.collection('dm_threads').where('participants', 'array-contains', me.uid).onSnapshot(async snap => {
    threads = snap.docs.map(d => ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) }));
    await C.loadProfiles(threads.map(otherOf));
    renderThreads();
    if (cur) { attach(); if (attached) markRead(); }
    if (firstSnap) {
      firstSnap = false;
      if (toParam) openChat(toParam); else showPick();
    }
  }, err => {
    console.error('Syntix dm threads:', err);
    $('#threads').innerHTML = '';
    $('#chat').innerHTML = errBox(err);
  });
}

function trackViewport() {
  const vv = window.visualViewport;
  if (!vv) return;
  const fit = () => {
    const root = document.documentElement.style;
    root.setProperty('--vvh', vv.height + 'px');
    root.setProperty('--vvt', vv.offsetTop + 'px');
    const box = $('#msgs'); if (box) box.scrollTop = box.scrollHeight;
  };
  vv.addEventListener('resize', fit); vv.addEventListener('scroll', fit); fit();
}

function start() {
  trackViewport();
  paintStatic();
  if (!C.init()) { $('#chat').innerHTML = errBox({ message: 'config' }); return; }
  db = C.db;
  C.auth.onAuthStateChanged(async u => {
    me = u;
    if (!u) { if (unsubThreads) unsubThreads(); showSign(); return; }
    try { await C.ensureProfile(u); } catch (e) { console.warn('profile', e); }
    firstSnap = true; showPick(); subscribeThreads();
  });
}
start();
})();
