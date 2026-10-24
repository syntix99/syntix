/* Shared UI helpers: toasts, skip link, share button */
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

  skipLink();
})();
