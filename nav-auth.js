(() => {
  const lang = () => localStorage.getItem('syntix-lang') || 'ru';
  let user = null, ready = false;

  function paint() {
    if (!ready) return;
    const ru = lang() === 'ru';
    document.querySelectorAll('a[href="./account.html"], a[data-nav-auth]').forEach(a => {
      if (user) {
        a.dataset.navAuth = '1';
        a.setAttribute('href', './profile.html');
        a.removeAttribute('data-i');
        a.textContent = ru ? 'Профиль' : 'Profile';
      } else if (a.dataset.navAuth) {
        a.setAttribute('href', './account.html');
        a.textContent = ru ? 'Войти' : 'Log in';
      }
    });
    document.querySelectorAll('.actions a[href="./account.html#signup"]').forEach(a => {
      a.style.display = user ? 'none' : '';
    });
  }

  function start() {
    const cfg = window.SYNTIX_CONFIG?.firebase;
    if (!cfg || !cfg.apiKey || cfg.apiKey.startsWith('PASTE_') || !window.firebase || !firebase.auth) return;
    if (!firebase.apps.length) firebase.initializeApp(cfg);
    firebase.auth().onAuthStateChanged(u => { user = u; ready = true; paint(); });
    const l = document.querySelector('#language');
    if (l) l.addEventListener('click', () => setTimeout(paint, 0));
  }
  start();
})();
