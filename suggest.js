(() => {
const TXT = {
  ru: { catalog:'Каталог', community:'Сообщество', h:'Предложи <em>сервис.</em>', sub:'Знаешь полезный AI-инструмент, которого нет в каталоге? Расскажи нам.',
    signTitle:'Нужен аккаунт', signText:'Войди или создай бесплатный аккаунт, чтобы отправить предложение.', signLink:'Войти или зарегистрироваться',
    name:'Название сервиса', url:'Ссылка на официальный сайт', cat:'Категория', note:'Чем он полезен? (необязательно)', send:'Отправить', busy:'Отправляем…',
    ok:'Спасибо! Предложение отправлено на рассмотрение.', fail:'Не удалось отправить. Проверь правила Firestore.', badUrl:'Укажи ссылку, начинающуюся с http:// или https://',
    sideTitle:'Что дальше?', sideText:'Мы проверяем каждое предложение вручную: смотрим, что сервис работает, и уточняем условия бесплатного плана перед добавлением.',
    cats:{text:'Текст и чат',image:'Изображения',video:'Видео и аудио',code:'Код',work:'Продуктивность'} },
  en: { catalog:'Directory', community:'Community', h:'Suggest a <em>tool.</em>', sub:'Know a useful AI tool that is missing from the directory? Tell us.',
    signTitle:'Account required', signText:'Log in or create a free account to send a suggestion.', signLink:'Log in or sign up',
    name:'Tool name', url:'Official website link', cat:'Category', note:'Why is it useful? (optional)', send:'Submit', busy:'Sending…',
    ok:'Thanks! Your suggestion was sent for review.', fail:'Could not send. Check Firestore rules.', badUrl:'Enter a link starting with http:// or https://',
    sideTitle:'What happens next?', sideText:'We review every suggestion manually: we check that the service works and confirm its free-plan terms before adding it.',
    cats:{text:'Text & chat',image:'Images',video:'Video & audio',code:'Coding',work:'Productivity'} }
};
const $ = s => document.querySelector(s);
let lang = localStorage.getItem('syntix-lang') || 'ru', db = null, user = null;
const t = k => TXT[lang][k];

function paint() {
  document.documentElement.lang = lang;
  $('#language').textContent = lang === 'ru' ? 'EN' : 'RU';
  $('#navCatalog').textContent = t('catalog'); $('#navCommunity').textContent = t('community');
  $('#h').innerHTML = t('h'); $('#sub').textContent = t('sub');
  $('#signTitle').textContent = t('signTitle'); $('#signText').textContent = t('signText'); $('#signLink').textContent = t('signLink');
  $('#lName').textContent = t('name'); $('#lUrl').textContent = t('url'); $('#lCat').textContent = t('cat'); $('#lNote').textContent = t('note');
  $('#sSubmit').textContent = t('send'); $('#sideTitle').textContent = t('sideTitle'); $('#sideText').textContent = t('sideText');
  const cur = $('#sCat').value || 'text';
  $('#sCat').innerHTML = Object.entries(t('cats')).map(([k, v]) => `<option value="${k}">${v}</option>`).join('');
  $('#sCat').value = cur;
  $('#year').textContent = new Date().getFullYear();
  $('#form').hidden = !user; $('#signPrompt').hidden = !!user;
}

$('#language').addEventListener('click', () => { lang = lang === 'ru' ? 'en' : 'ru'; localStorage.setItem('syntix-lang', lang); paint(); });

$('#form').addEventListener('submit', async e => {
  e.preventDefault();
  const msg = $('#sMsg'), btn = $('#sSubmit');
  const name = $('#sName').value.trim(), url = $('#sUrl').value.trim(), note = $('#sNote').value.trim();
  if (!/^https?:\/\/.+/i.test(url)) { msg.className = 'message error'; msg.textContent = t('badUrl'); return; }
  btn.disabled = true; btn.textContent = t('busy');
  try {
    await db.collection('tool_suggestions').add({ name, url, category: $('#sCat').value, note, uid: user.uid, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    $('#form').reset(); msg.className = 'message ok'; msg.textContent = t('ok');
    if (window.toast) toast(t('ok'));
  } catch (err) { console.error('Syntix suggest:', err); msg.className = 'message error'; msg.textContent = t('fail'); }
  btn.disabled = false; btn.textContent = t('send');
});

paint();
const cfg = window.SYNTIX_CONFIG?.firebase;
if (cfg && cfg.apiKey && !cfg.apiKey.startsWith('PASTE_') && window.firebase) {
  if (!firebase.apps.length) firebase.initializeApp(cfg);
  db = firebase.firestore();
  firebase.auth().onAuthStateChanged(u => { user = u; paint(); });
}
})();
