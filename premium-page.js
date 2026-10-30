(() => {
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const CFG = Object.assign({ currency: '€', monthly: { price: '4.99', link: '' }, yearly: { price: '39.99', link: '' }, contact: '' }, window.SYNTIX_PREMIUM || {});
const TXT = {
  ru: { cat: 'Каталог', feed: 'Лента', top: 'Рейтинг', msg: 'Сообщения',
    sub: 'Больше возможностей для тех, кто живёт в AI. Поддержи проект и получи инструменты премиум-класса.',
    monthly: 'Месяц', yearly: 'Год', perMonth: '/ месяц', perYear: '/ год', save: 'выгода', billedYear: 'Оплата раз в год, экономия', billedMonth: 'Оплата раз в месяц, отмена в любой момент',
    buy: 'Оформить Premium', extend: 'Продлить Premium', login: 'Войти, чтобы оформить', notCfg: 'Приём платежей ещё не настроен владельцем сайта.', secure: 'Оплата проходит на защищённой странице платёжного сервиса. Данные карты мы не видим и не храним.',
    active: 'Premium активен до', yourId: 'Твой ID для поддержки:', copy: 'Копировать', copied: 'Скопировано',
    featTitle: 'Что входит', cmpTitle: 'Free и Premium', thF: 'Возможность', thFree: 'Free', thPrem: '💎 Premium', faqTitle: 'Частые вопросы',
    feats: [['💎', 'Значок Premium', 'Виден в ленте, профиле и рейтинге.'], ['🎨', 'Свой стиль профиля', 'Акцентный цвет карточки и золотая рамка аватара.'], ['✏️', 'Редактирование постов', 'Исправляй опечатки и дополняй публикации.'], ['📝', 'Длинные посты', 'До 15 000 символов вместо 5 000.'], ['⚖️', 'Сравнение до 6 инструментов', 'Вместо 3 в бесплатной версии.'], ['📈', 'Insights', 'График активности, лучшие часы публикаций и топ твоих постов.'], ['⬇️', 'Экспорт избранного', 'Выгрузка избранных сервисов в CSV.'], ['🏅', 'Достижение «Меценат»', 'Эксклюзивная награда в профиле.']],
    rows: [['Значок 💎', '—', '✓'], ['Акцентный цвет и рамка аватара', '—', '✓'], ['Редактирование постов', '—', '✓'], ['Длина поста', '5 000', '15 000'], ['Сравнение инструментов', 'до 3', 'до 6'], ['Insights (аналитика)', '—', '✓'], ['Экспорт избранного в CSV', '—', '✓'], ['Достижение «Меценат»', '—', '✓']],
    faq: [['Как проходит оплата?', 'На защищённой странице платёжного сервиса. Мы не видим и не храним данные карты.'], ['Когда включится Premium?', 'Обычно в течение часа после подтверждения платежа. Если статус не появился, напиши в поддержку и укажи свой ID (он показан выше).'], ['Как отменить подписку?', 'Через ссылку из письма платёжного сервиса. Доступ сохраняется до конца оплаченного периода.'], ['Что будет после окончания?', 'Твои посты, профиль и достижения останутся. Premium-возможности (редактирование, рамка, Insights и т. д.) отключатся.']],
    contact: 'Поддержка:' },
  en: { cat: 'Directory', feed: 'Feed', top: 'Leaderboard', msg: 'Messages',
    sub: 'More power for people who live in AI. Support the project and get premium-grade tools.',
    monthly: 'Monthly', yearly: 'Yearly', perMonth: '/ month', perYear: '/ year', save: 'save', billedYear: 'Billed once a year, you save', billedMonth: 'Billed monthly, cancel any time',
    buy: 'Get Premium', extend: 'Extend Premium', login: 'Sign in to subscribe', notCfg: 'Payments are not configured by the site owner yet.', secure: 'Payment happens on the payment provider’s secure page. We never see or store your card details.',
    active: 'Premium is active until', yourId: 'Your ID for support:', copy: 'Copy', copied: 'Copied',
    featTitle: 'What’s included', cmpTitle: 'Free vs Premium', thF: 'Feature', thFree: 'Free', thPrem: '💎 Premium', faqTitle: 'FAQ',
    feats: [['💎', 'Premium badge', 'Shown in the feed, on your profile and in the leaderboard.'], ['🎨', 'Your own profile style', 'Accent colour for your card and a gold avatar ring.'], ['✏️', 'Edit your posts', 'Fix typos and expand your publications.'], ['📝', 'Long posts', 'Up to 15,000 characters instead of 5,000.'], ['⚖️', 'Compare up to 6 tools', 'Instead of 3 on the free plan.'], ['📈', 'Insights', 'Activity chart, best posting hours and your top posts.'], ['⬇️', 'Export favourites', 'Download your favourite tools as CSV.'], ['🏅', '“Patron” achievement', 'An exclusive award on your profile.']],
    rows: [['💎 badge', '—', '✓'], ['Accent colour & avatar ring', '—', '✓'], ['Edit posts', '—', '✓'], ['Post length', '5,000', '15,000'], ['Tool comparison', 'up to 3', 'up to 6'], ['Insights (analytics)', '—', '✓'], ['Export favourites to CSV', '—', '✓'], ['“Patron” achievement', '—', '✓']],
    faq: [['How does payment work?', 'On the payment provider’s secure page. We never see or store card details.'], ['When does Premium turn on?', 'Usually within an hour after the payment is confirmed. If the status does not appear, contact support with your ID (shown above).'], ['How do I cancel?', 'Via the link in the payment provider’s e-mail. Access stays until the end of the paid period.'], ['What happens when it ends?', 'Your posts, profile and achievements stay. Premium perks (editing, ring, Insights, etc.) switch off.']],
    contact: 'Support:' }
};
let lang = localStorage.getItem('syntix-lang') || 'ru', plan = 'yearly', user = null;
const t = k => TXT[lang][k];

function paint() {
  document.documentElement.lang = lang;
  $('#language').textContent = lang === 'ru' ? 'EN' : 'RU';
  $('#nCat').textContent = t('cat'); $('#nFeed').textContent = t('feed'); $('#nTop').textContent = t('top'); $('#nMsg').textContent = t('msg');
  $('#sub').textContent = t('sub');
  const m = parseFloat(CFG.monthly.price), y = parseFloat(CFG.yearly.price), pct = m && y ? Math.round((1 - y / (m * 12)) * 100) : 0;
  $('#planM').textContent = t('monthly');
  $('#planY').innerHTML = esc(t('yearly')) + (pct > 0 ? ` <span class="save">−${pct}%</span>` : '');
  document.querySelectorAll('[data-plan]').forEach(b => b.classList.toggle('active', b.dataset.plan === plan));
  const cur = CFG[plan];
  $('#priceVal').textContent = CFG.currency + cur.price;
  $('#pricePer').textContent = t(plan === 'yearly' ? 'perYear' : 'perMonth');
  $('#priceSub').textContent = plan === 'yearly' && pct > 0 ? `${t('billedYear')} ${pct}%` : t('billedMonth');
  const act = window.Premium && Premium.meActive, until = window.Premium && Premium.until();
  $('#status').innerHTML = act && until ? `<div class="prem-active">💎 ${esc(t('active'))} <b>${esc(until.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }))}</b></div>` : '';
  const buy = $('#buyBtn');
  if (!user) { buy.textContent = t('login'); buy.disabled = false; $('#buyNote').textContent = ''; }
  else if (!cur.link) { buy.textContent = t('buy'); buy.disabled = true; $('#buyNote').textContent = t('notCfg'); }
  else { buy.textContent = t(act ? 'extend' : 'buy'); buy.disabled = false; $('#buyNote').textContent = t('secure'); }
  $('#uidLine').innerHTML = user ? `${esc(t('yourId'))} <code id="uidCode">${esc(user.uid)}</code> <button type="button" class="linkbtn" id="copyUid">${esc(t('copy'))}</button>` : '';
  $('#featTitle').textContent = t('featTitle');
  $('#featGrid').innerHTML = t('feats').map(([i, n, d]) => `<div class="feat"><div class="feat-ic">${i}</div><b>${esc(n)}</b><p>${esc(d)}</p></div>`).join('');
  $('#cmpTitle').textContent = t('cmpTitle'); $('#thF').textContent = t('thF'); $('#thFree').textContent = t('thFree'); $('#thPrem').textContent = t('thPrem');
  $('#cmpBody').innerHTML = t('rows').map(([a, b, c]) => `<tr><td>${esc(a)}</td><td>${esc(b)}</td><td class="yes">${esc(c)}</td></tr>`).join('');
  $('#faqTitle').textContent = t('faqTitle');
  $('#faq').innerHTML = t('faq').map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('');
  $('#contact').innerHTML = CFG.contact ? `${esc(t('contact'))} ${/^https?:/.test(CFG.contact) ? `<a href="${esc(CFG.contact)}" target="_blank" rel="noopener noreferrer">${esc(CFG.contact)}</a>` : `<a href="mailto:${esc(CFG.contact)}">${esc(CFG.contact)}</a>`}` : '';
}

document.addEventListener('click', async e => {
  const p = e.target.closest('[data-plan]');
  if (p) { plan = p.dataset.plan; paint(); return; }
  if (e.target.closest('#copyUid')) {
    try { await navigator.clipboard.writeText(user.uid); if (window.toast) toast(t('copied')); } catch { prompt('', user.uid); }
    return;
  }
  if (e.target.closest('#buyBtn')) {
    if (!user) { location.href = './account.html#signup'; return; }
    const link = CFG[plan].link; if (!link) return;
    const sep = link.includes('?') ? '&' : '?';
    location.href = `${link}${sep}client_reference_id=${encodeURIComponent(user.uid)}&prefilled_email=${encodeURIComponent(user.email || '')}`;
  }
});
$('#language').addEventListener('click', () => { lang = lang === 'ru' ? 'en' : 'ru'; localStorage.setItem('syntix-lang', lang); paint(); });
window.addEventListener('syntix-premium', paint);

paint();
const cfg = window.SYNTIX_CONFIG?.firebase;
if (cfg && cfg.apiKey && window.firebase) {
  if (!firebase.apps.length) firebase.initializeApp(cfg);
  firebase.auth().onAuthStateChanged(u => { user = u; paint(); });
}
})();
