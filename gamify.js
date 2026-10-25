/* Syntix levels, XP and achievements.
   Everything is derived from public documents (posts, comments, likes, ratings, channels),
   so nothing is stored in profiles and users cannot edit their own score. */
(() => {
  const XP = { p: 10, c: 3, l: 2, r: 2, ch: 15 };      // post, comment, like received, rating, channel
  const DAY_CAP = { p: 5, c: 10 };                    // anti-spam: max XP-eligible posts / comments per day
  const DAY = 86400000;
  const LEVELS = [
    [1, '🌱', 'Новичок', 'Newcomer'], [3, '🙂', 'Участник', 'Member'], [5, '🔥', 'Активист', 'Activist'],
    [8, '🎯', 'Эксперт', 'Expert'], [12, '👑', 'Мастер', 'Master'], [18, '🏆', 'Легенда', 'Legend']
  ];
  const levelStart = l => 15 * (l - 1) * (l - 1);
  const levelOf = xp => 1 + Math.floor(Math.sqrt(Math.max(0, xp) / 15));
  const ms = v => (v && v.toMillis ? v.toMillis() : 0) || Date.now();

  function levelInfo(xp) {
    const l = levelOf(xp), cur = levelStart(l), next = levelStart(l + 1);
    let tier = LEVELS[0];
    for (const x of LEVELS) if (l >= x[0]) tier = x;
    return { level: l, icon: tier[1], ru: tier[2], en: tier[3], cur, next, pct: Math.min(100, Math.round(((xp - cur) / (next - cur)) * 100)) };
  }

  const empty = () => ({ p: 0, c: 0, l: 0, r: 0, ch: 0, xp: 0, days: new Set() });

  // events: [type, uid, ms]; returns Map(uid -> stats)
  function build(events, since = 0) {
    const out = new Map(), caps = new Map();
    for (const [type, uid, t] of events) {
      if (!uid || t < since) continue;
      let s = out.get(uid); if (!s) { s = empty(); out.set(uid, s); }
      const day = Math.floor(t / DAY);
      if (DAY_CAP[type]) {
        const k = uid + '|' + type + '|' + day, n = (caps.get(k) || 0) + 1;
        caps.set(k, n);
        if (n > DAY_CAP[type]) continue;
      }
      s[type]++; s.xp += XP[type];
      if (type === 'p' || type === 'c') s.days.add(day);
    }
    return out;
  }

  function streakOf(days) {
    const a = [...days].sort((x, y) => x - y);
    let best = 0, run = 0, prev = null;
    for (const d of a) { run = prev !== null && d === prev + 1 ? run + 1 : 1; best = Math.max(best, run); prev = d; }
    return best;
  }

  const ACH = [
    { id: 'first_post', icon: '📝', ru: 'Первый пост', en: 'First post', dr: 'Опубликуй первый пост', de: 'Publish your first post', goal: 1, val: s => s.p },
    { id: 'writer', icon: '✍️', ru: 'Автор', en: 'Writer', dr: 'Опубликуй 10 постов', de: 'Publish 10 posts', goal: 10, val: s => s.p },
    { id: 'chronicler', icon: '📚', ru: 'Летописец', en: 'Chronicler', dr: 'Опубликуй 50 постов', de: 'Publish 50 posts', goal: 50, val: s => s.p },
    { id: 'talker', icon: '💬', ru: 'Общительный', en: 'Sociable', dr: 'Оставь 5 комментариев', de: 'Leave 5 comments', goal: 5, val: s => s.c },
    { id: 'soul', icon: '🗣️', ru: 'Душа компании', en: 'Life of the party', dr: 'Оставь 50 комментариев', de: 'Leave 50 comments', goal: 50, val: s => s.c },
    { id: 'loved', icon: '❤️', ru: 'Признание', en: 'Recognition', dr: 'Получи 5 лайков на свои посты', de: 'Get 5 likes on your posts', goal: 5, val: s => s.l },
    { id: 'star', icon: '🌟', ru: 'Звезда ленты', en: 'Feed star', dr: 'Получи 50 лайков на свои посты', de: 'Get 50 likes on your posts', goal: 50, val: s => s.l },
    { id: 'critic', icon: '⭐', ru: 'Критик', en: 'Critic', dr: 'Оцени 5 сервисов', de: 'Rate 5 tools', goal: 5, val: s => s.r },
    { id: 'judge', icon: '🎯', ru: 'Эксперт-оценщик', en: 'Master rater', dr: 'Оцени 25 сервисов', de: 'Rate 25 tools', goal: 25, val: s => s.r },
    { id: 'founder', icon: '📢', ru: 'Основатель', en: 'Founder', dr: 'Создай свой канал', de: 'Create your own channel', goal: 1, val: s => s.ch },
    { id: 'streak3', icon: '🔥', ru: 'На волне', en: 'On a roll', dr: 'Будь активен 3 дня подряд', de: 'Be active 3 days in a row', goal: 3, val: (s, x) => x.streak },
    { id: 'streak7', icon: '⚡', ru: 'Неделя огня', en: 'Week of fire', dr: 'Будь активен 7 дней подряд', de: 'Be active 7 days in a row', goal: 7, val: (s, x) => x.streak },
    { id: 'card', icon: '🪪', ru: 'Визитка', en: 'Calling card', dr: 'Добавь аватар и описание в профиль', de: 'Add an avatar and a bio to your profile', goal: 1, val: (s, x) => (x.profileComplete ? 1 : 0) }
  ];

  function achievements(stats, extra = {}) {
    const s = stats || empty();
    const x = { streak: streakOf(s.days), profileComplete: !!extra.profileComplete };
    return ACH.map(a => { const v = a.val(s, x); return { ...a, v: Math.min(v, a.goal), done: v >= a.goal }; });
  }

  // full stats for one user (profile page): only a handful of cheap `where uid ==` queries
  async function loadUser(db, uid, profile) {
    const q = (c, f, n) => db.collection(c).where(f, '==', uid).limit(n).get().then(s => s.docs).catch(e => { console.warn('gamify', c, e); return []; });
    const [posts, coms, tcoms, rates, chans] = await Promise.all([
      q('community_posts', 'uid', 100), q('community_comments', 'uid', 200), q('tool_comments', 'uid', 200), q('tool_ratings', 'uid', 200), q('channels', 'ownerUid', 50)
    ]);
    const ev = [];
    posts.forEach(d => ev.push(['p', uid, ms(d.data().createdAt)]));
    coms.concat(tcoms).forEach(d => ev.push(['c', uid, ms(d.data().createdAt)]));
    rates.forEach(d => ev.push(['r', uid, ms(d.data().updatedAt)]));
    chans.forEach(d => ev.push(['ch', uid, ms(d.data().createdAt)]));
    const ids = posts.map(d => d.id), chunks = [];
    for (let i = 0; i < ids.length; i += 10) chunks.push(ids.slice(i, i + 10));
    const likeSnaps = await Promise.all(chunks.map(c => db.collection('post_likes').where('postId', 'in', c).get().then(s => s.docs).catch(() => [])));
    likeSnaps.flat().forEach(d => { const x = d.data(); if (x.uid !== uid) ev.push(['l', uid, ms(x.createdAt)]); });
    const stats = build(ev).get(uid) || empty();
    const complete = !!(profile && profile.avatar && profile.bio);
    return { stats, xp: stats.xp, info: levelInfo(stats.xp), streak: streakOf(stats.days), ach: achievements(stats, { profileComplete: complete }) };
  }

  window.Gamify = { XP, DAY_CAP, DAY, ACH, levelInfo, build, achievements, streakOf, loadUser, empty };
})();
