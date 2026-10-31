// Shared UI helpers: toasts, skip link, share button
(() => {
  const ru = () => (localStorage.getItem('syntix-lang') || 'ru') === 'ru';

  window.toast = msg => {
    let w = document.querySelector('.toasts');
    if (!w) {
      w = document.createElement('div');
      w.className = 'toasts';
      w.setAttribute('role', 'status');
      w.setAttribute('aria-live', 'polite');
      document.body.append(w);
    }
    const d = document.createElement('div');
    d.className = 'toast';
    d.textContent = msg;
    w.append(d);
    setTimeout(() => d.classList.add('out'), 2600);
    setTimeout(() => d.remove(), 3000);
  };

  function skipLink() {
    const m = document.querySelector('main');
    if (!m || document.querySelector('.skip')) return;
    m.id = m.id || 'main';
    m.tabIndex = -1;
    const a = document.createElement('a');
    a.className = 'skip';
    a.href = '#' + m.id;
    a.textContent = ru() ? 'Перейти к содержимому' : 'Skip to content';
    document.body.prepend(a);
  }

  document.addEventListener('click', async e => {
    const b = e.target.closest('#shareBtn');
    if (!b) return;
    const data = { title: document.title, url: location.href };
    try {
      if (navigator.share) { await navigator.share(data); return; }
    } catch (err) { if (err && err.name === 'AbortError') return; }
    try {
      await navigator.clipboard.writeText(location.href);
      window.toast(ru() ? 'Ссылка скопирована' : 'Link copied');
    } catch { prompt('', location.href); }
  });

  function tabbar() {
    const r = ru();
    const file = location.pathname.split('/').pop() || 'index.html';
    const here = { 'index.html': 'index.html', 'tool.html': 'index.html', 'feed.html': 'feed.html', 'community.html': 'feed.html', 'leaderboard.html': 'leaderboard.html', 'messages.html': 'messages.html', 'profile.html': 'profile.html' }[file] || '';
    const items = [
      ['index.html', '✦', r ? 'Каталог' : 'Directory'],
      ['feed.html', '☰', r ? 'Лента' : 'Feed'],
      ['leaderboard.html', '🏆', r ? 'Рейтинг' : 'Top'],
      ['messages.html', '✉', r ? 'Сообщения' : 'Messages'],
      ['profile.html', '☺', r ? 'Профиль' : 'Profile']
    ];
    let bar = document.querySelector('.tabbar');
    if (!bar) {
      bar = document.createElement('div');
      bar.className = 'tabbar';
      bar.setAttribute('role', 'navigation');
      document.body.append(bar);
      document.body.classList.add('has-tabbar');
      const l = document.querySelector('#language');
      if (l) l.addEventListener('click', () => setTimeout(tabbar, 0));
    }
    bar.setAttribute('aria-label', r ? 'Основная навигация' : 'Main navigation');
    bar.innerHTML = items.map(([h, i, label]) => `<a href="./${h}" class="${h === here ? 'on' : ''}"${h === here ? ' aria-current="page"' : ''}><span aria-hidden="true">${i}</span>${label}</a>`).join('');
    if (window.__applyBadge) window.__applyBadge();
  }

  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('./sw.js').catch(() => {});
  skipLink();
  tabbar();
})();
