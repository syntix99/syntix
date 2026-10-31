(() => {
  const lang = document.documentElement.lang === 'en' ? 'en' : 'ru';
  const text = {
    en: {
      wait: 'Please wait…', created: 'Account created. You are signed in.',
      createdCheck: 'Account created. Check your inbox if email confirmation is enabled.',
      signed: 'You are signed in.', signedOut: 'You have signed out.',
      missing: 'Firebase is not configured. Check config.js.',
      error: 'Could not complete the request. Check your connection and Firebase settings.',
      exists: 'This email is already registered. Try signing in.',
      credentials: 'Incorrect email or password.',
      weak: 'Password must contain at least 6 characters.',
      tooMany: 'Too many attempts. Please wait and try again.',
      logout: 'Sign out', signup: 'Create account', login: 'Sign in'
    },
    ru: {
      wait: 'Подождите…', created: 'Аккаунт создан. Вы вошли.',
      createdCheck: 'Аккаунт создан. Проверьте почту, если подтверждение email включено.',
      signed: 'Вы вошли в аккаунт.', signedOut: 'Вы вышли из аккаунта.',
      missing: 'Firebase не настроен. Проверьте config.js.',
      error: 'Не удалось выполнить запрос. Проверьте соединение и настройки Firebase.',
      exists: 'Этот email уже зарегистрирован. Попробуйте войти.',
      credentials: 'Неверный email или пароль.',
      weak: 'Пароль должен содержать не менее 6 символов.',
      tooMany: 'Слишком много попыток. Подождите и повторите.',
      logout: 'Выйти', signup: 'Создать аккаунт', login: 'Войти'
    }
  }[lang];

  const form = document.querySelector('#auth-form');
  const emailInput = document.querySelector('#email');
  const passwordInput = document.querySelector('#password');
  const message = document.querySelector('#auth-message');
  const submit = document.querySelector('#submit-auth');
  const panel = document.querySelector('#signed-in-panel');
  const userEmail = document.querySelector('#user-email');
  const logout = document.querySelector('#logout');
  if (!form || !window.firebase || !window.SYNTIX_CONFIG?.firebase) {
    if (message) message.textContent = text.missing;
    return;
  }

  try {
    if (!firebase.apps.length) firebase.initializeApp(window.SYNTIX_CONFIG.firebase);
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    if (message) message.textContent = text.missing;
    return;
  }

  const auth = firebase.auth();
  const modes = [...document.querySelectorAll('input[name="mode"]')];
  const selectedMode = () => modes.find(input => input.checked)?.value || 'signup';
  const setMessage = (value, isError = false) => {
    message.textContent = value;
    message.style.color = isError ? '#fca5a5' : '#86efac';
  };
  const refreshMode = () => {
    submit.textContent = selectedMode() === 'login' ? text.login : text.signup;
    passwordInput.autocomplete = selectedMode() === 'login' ? 'current-password' : 'new-password';
    message.textContent = '';
  };

  modes.forEach(input => input.addEventListener('change', refreshMode));
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    if (!email || password.length < 6) {
      setMessage(text.weak, true);
      return;
    }
    submit.disabled = true;
    setMessage(text.wait);
    try {
      if (selectedMode() === 'signup') {
        const result = await auth.createUserWithEmailAndPassword(email, password);
        setMessage(result.user ? text.created : text.createdCheck);
      } else {
        await auth.signInWithEmailAndPassword(email, password);
        setMessage(text.signed);
      }
    } catch (error) {
      const messages = {
        'auth/email-already-in-use': text.exists,
        'auth/invalid-credential': text.credentials,
        'auth/wrong-password': text.credentials,
        'auth/user-not-found': text.credentials,
        'auth/weak-password': text.weak,
        'auth/too-many-requests': text.tooMany
      };
      setMessage(messages[error.code] || text.error, true);
      console.error('Syntix Firebase auth:', error);
    } finally {
      submit.disabled = false;
      refreshMode();
    }
  });

  logout?.addEventListener('click', async () => {
    logout.disabled = true;
    try {
      await auth.signOut();
      setMessage(text.signedOut);
    } catch (error) {
      setMessage(text.error, true);
      console.error(error);
    } finally {
      logout.disabled = false;
    }
  });

  auth.onAuthStateChanged(user => {
    if (user) {
      userEmail.textContent = user.email || (lang === 'ru' ? 'Пользователь' : 'User');
      panel.hidden = false;
      form.hidden = true;
    } else {
      panel.hidden = true;
      form.hidden = false;
    }
  });
  refreshMode();
})();
