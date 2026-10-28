(() => {
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const lines = [], rows = [];
const add = (state, text, note) => { rows.push(`<div class="row ${state}"><b>${state === 'ok' ? '✓' : state === 'bad' ? '✗' : '!'}</b><span>${esc(text)}${note ? ` <i>— ${esc(note)}</i>` : ''}</span></div>`); lines.push(`${state === 'ok' ? 'OK ' : state === 'bad' ? 'BAD' : 'WARN'} ${text}${note ? ' — ' + note : ''}`); };
const head = t => { rows.push(`<h2>${esc(t)}</h2>`); lines.push(`\n## ${t}`); };

// file -> text that must be inside the CURRENT version (detects old copies left on the server)
const FILES = {
  'index.html': 'finderBtn', 'feed.html': 'tagRow', 'messages.html': 'dmPage', 'leaderboard.html': 'lbTitle', 'profile.html': 'premium.js',
  'tool.html': 'tool-posts.js', 'suggest.html': 'sSubmit', 'account.html': 'resetrow', 'premium.html': 'buyBtn', 'community.html': 'feed.html',
  'app.js': 'syntix-premium', 'feed.js': 'data-edit-open', 'profile.js': 'insightsHtml', 'messages.js': 'syntix-dm-read', 'leaderboard.js': 'gem',
  'gamify.js': 'patron', 'core.js': 'C.media', 'ui.js': 'tabbar', 'badge.js': '__applyBadge', 'premium.js': 'meActive', 'premium-page.js': 'buyBtn',
  'premium-config.js': 'SYNTIX_PREMIUM', 'ratings.js': 'syntix-rt-v1', 'nav-auth.js': 'navAuth', 'favorites.js': 'favBtn', 'tool.js': 'related', 'tool-rating.js': 'tool_ratings',
  'tool-posts.js': 'toolPosts', 'tool-community.js': 'data-report', 'suggest.js': 'tool_suggestions', 'account.js': 'sendPasswordResetEmail', 'config.js': 'SYNTIX_CONFIG',
  'styles.css': '', 'social.css': 'podium', 'profile.css': 'prem-card', 'tools.json': 'ChatGPT', 'manifest.json': 'maskable', 'sw.js': 'syntix-v2',
  '404.html': 'KNOWN', 'robots.txt': 'User-agent', 'icon-192.png': null, 'icon-512.png': null, 'icon-maskable-512.png': null, 'apple-touch-icon.png': null
};

async function checkFiles() {
  head('Файлы на сайте');
  let missing = 0, stale = 0;
  await Promise.all(Object.entries(FILES).map(async ([f, marker]) => {
    try {
      const r = await fetch('./' + f + '?_=' + Date.now(), { cache: 'no-store' });
      if (!r.ok) { missing++; return { f, s: 'bad', n: `нет на сайте (код ${r.status})` }; }
      if (marker === null) return { f, s: 'ok' };
      const txt = await r.text();
      if (marker && !txt.includes(marker)) { stale++; return { f, s: 'warn', n: 'старая версия — загрузи свежий файл' }; }
      return { f, s: 'ok' };
    } catch (e) { missing++; return { f, s: 'bad', n: 'не загрузился: ' + e.message }; }
  })).then(res => res.sort((a, b) => ({ bad: 0, warn: 1, ok: 2 }[a.s] - { bad: 0, warn: 1, ok: 2 }[b.s]) || a.f.localeCompare(b.f))
    .forEach(x => { if (x.s !== 'ok') add(x.s, x.f, x.n); }));
  if (!missing && !stale) add('ok', 'Все ' + Object.keys(FILES).length + ' файлов на месте и актуальны');
  else add(missing ? 'bad' : 'warn', `Итого: не хватает ${missing}, устарело ${stale}`, 'загрузи эти файлы в КОРЕНЬ репозитория');
}

async function checkFirebase() {
  head('Firebase');
  const cfg = window.SYNTIX_CONFIG && window.SYNTIX_CONFIG.firebase;
  if (!window.firebase) { add('bad', 'Библиотека Firebase не загрузилась', 'нет интернета или её блокирует блокировщик рекламы'); return; }
  if (!cfg || !cfg.apiKey) { add('bad', 'В config.js нет настроек Firebase (window.SYNTIX_CONFIG)', 'config.js старый или повреждён'); return; }
  add('ok', 'Настройки Firebase найдены', cfg.projectId);
  try { if (!firebase.apps.length) firebase.initializeApp(cfg); } catch (e) { add('bad', 'Firebase не инициализировался', e.message); return; }
  const db = firebase.firestore();
  const cols = ['community_posts', 'channels', 'profiles', 'tool_ratings', 'post_likes', 'premium'];
  let denied = 0;
  for (const c of cols) {
    try { await db.collection(c).limit(1).get(); add('ok', `Чтение «${c}» разрешено`); }
    catch (e) {
      if (e.code === 'permission-denied') denied++;
      add('bad', `Чтение «${c}» не удалось`, e.code === 'permission-denied' ? 'правила Firestore не пускают — опубликуй свежий firestore.rules' : (e.code || e.message));
    }
  }
  if (denied) add('bad', 'Почти наверняка в Firebase опубликованы старые правила', 'Firebase Console → Firestore Database → Rules → вставь firestore.rules → Publish');
  try {
    await new Promise(res => { const u = firebase.auth().onAuthStateChanged(x => { add(x ? 'ok' : 'warn', x ? 'Вход выполнен: ' + (x.email || x.uid) : 'Ты не вошёл в аккаунт (это нормально для проверки)'); u(); res(); }); });
  } catch (e) { add('warn', 'Проверка входа не удалась', e.message); }
}

async function swInfo() {
  let t = '';
  try {
    const regs = navigator.serviceWorker ? await navigator.serviceWorker.getRegistrations() : [];
    const keys = window.caches ? await caches.keys() : [];
    t = `Сервис-воркеров: ${regs.length}. Кэшей: ${keys.length}${keys.length ? ' (' + keys.join(', ') + ')' : ''}.`;
  } catch (e) { t = 'Не удалось прочитать: ' + e.message; }
  $('#sw').textContent = t; lines.push('\n## Кэш\n' + t);
}

async function run() {
  lines.push('Syntix diagnostics ' + new Date().toISOString(), 'URL: ' + location.href, 'UA: ' + navigator.userAgent);
  await checkFiles(); await checkFirebase(); await swInfo();
  $('#out').innerHTML = rows.join('');
  $('#report').textContent = lines.join('\n');
}

$('#reset').onclick = async () => {
  try {
    if (navigator.serviceWorker) (await navigator.serviceWorker.getRegistrations()).forEach(r => r.unregister());
    if (window.caches) (await caches.keys()).forEach(k => caches.delete(k));
  } catch (e) {  }
  setTimeout(() => location.reload(), 400);
};
$('#copy').onclick = async () => { try { await navigator.clipboard.writeText($('#report').textContent); $('#copy').textContent = 'Скопировано ✓'; } catch {  } };
window.addEventListener('load', run);
})();
