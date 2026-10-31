# Syntix — каталог AI-инструментов, лента, каналы, сообщения, рейтинг, Premium

Статический сайт для GitHub Pages + Firebase **на бесплатном плане Spark** (Auth + Firestore). Сервера нет, платный Blaze не нужен: всё «серверное» делают правила Firestore и бесплатный планировщик GitHub Actions. На Spark нельзя случайно получить счёт: при исчерпании квоты запросы просто отказывают до сброса.

## 1. Быстрый запуск

1. **Firebase Console** → *Authentication → Sign-in method* → включить **Email/Password**.
2. *Authentication → Settings → Authorized domains* → добавить домен сайта (`имя.github.io`).
3. *Firestore Database* → **Create database**.
4. *Firestore → Rules* → вставить **весь** файл `firestore.rules` → **Publish** (после каждого обновления проекта правила публикуются заново).
5. Загрузить **содержимое** проекта в **корень** репозитория (не саму папку), включая `.nojekyll`.
6. GitHub → *Settings → Pages* → *Deploy from a branch* → `main` / `/ (root)`.
7. Открыть `адрес-сайта/health.html`: все строки должны быть зелёными.

Настройки Firebase лежат в `config.js` (публичные, это нормально). Секретные ключи в файлы сайта **никогда** не класть.

## 2. Страницы

| Файл | Что это |
|---|---|
| `index.html` | Каталог: поиск, фильтры, сортировка по рейтингу, сравнение (3, Premium: 6), подбор инструмента, избранное |
| `tool.html?id=…` | Сервис: описание, оценка ★, избранное, посты и комментарии сообщества |
| `feed.html` | Лента: каналы, подписки, хэштеги, лайки, комментарии, редактирование постов (Premium) |
| `messages.html` | Личные сообщения в реальном времени |
| `notifications.html` | Уведомления: комментарии, лайки, новые подписчики (🔔 в шапке) |
| `leaderboard.html` | Рейтинг участников и инструментов, уровни и достижения |
| `profile.html?uid=…` | Публичный профиль, достижения, Insights (Premium) |
| `premium.html` | Тарифы Premium |
| `suggest.html` | Предложить сервис |
| `account.html` | Вход, регистрация, сброс пароля |
| `admin.html` | Модерация (только для администраторов, см. п. 4) |
| `health.html` | Самодиагностика |
| `404.html`, `community.html` | Страница ошибки и редирект старой ссылки |

## 3. Данные Firestore

| Коллекция | Кто пишет | Заметки |
|---|---|---|
| `profiles/{uid}` (+ `favorites`, `joined`, `following`) | владелец | профиль публичный; `joined`/`following` видит только владелец |
| `community_posts`, `community_comments`, `tool_comments` | вошедшие | автор удаляет своё; владелец канала и админ — любые в своей зоне |
| `channels` | вошедшие | режимы «пишут все» / «пишет только владелец» |
| `post_likes`, `tool_ratings` | вошедшие | id = `<объект>_<uid>`, одна запись на человека |
| `dm_threads/{uidA_uidB}/messages` | участники | читают только двое; получатель может отключить ЛС |
| `notifications/{uid}/items` | **другие** пользователи | запись принимается, только если действие реально произошло (есть комментарий/лайк/подписка) и касается получателя |
| `reports`, `tool_suggestions` | вошедшие | читают и удаляют только администраторы |
| `admins/{uid}`, `bans/{uid}` | admins — вручную в Console; bans — админы | забаненный не может публиковать и писать |
| `premium/{uid}`, `stats/*` | **никто из браузера** | пишет только `scripts/sync.js` (GitHub Actions) или владелец вручную |

Составные индексы создавать не нужно.

## 4. Модерация (бесплатно, через правила)
1. Зарегистрируйся на сайте, на странице `profile.html` скопируй свой ID (или возьми его в Firebase → Authentication).
2. Firebase Console → Firestore → создать коллекцию `admins` → документ с **ID = твой uid** (любое поле, например `ok: true`).
3. Открой `адрес-сайта/admin.html`: жалобы (удалить контент, забанить автора, закрыть), предложения сервисов, баны. Ссылки на страницу нигде нет, она не индексируется.

## 5. Бесплатная автоматизация (GitHub Actions)
Нужна, чтобы (а) рейтинг читался одним документом, а не ~2000, и (б) Premium включался автоматически после оплаты. Без неё сайт всё равно работает: рейтинг считается в браузере (дороже по чтениям), Premium включается вручную (п. 6).

1. Firebase Console → *Project settings → Service accounts* → **Generate new private key** → скачается JSON. Это ключ полного доступа: храни только в секретах.
2. GitHub → репозиторий → *Settings → Secrets and variables → Actions → New repository secret*:
   * `FIREBASE_SERVICE_ACCOUNT` — **весь** текст JSON;
   * `STRIPE_SECRET_KEY` — по желанию, **ограниченный** ключ Stripe (`rk_…`) с правом чтения *Checkout Sessions* и *Subscriptions*.
3. Создай файл workflow: *Add file → Create new file*, имя `.github/workflows/sync.yml`, вставь содержимое из проекта, Commit.
4. Вкладка *Actions* → «Syntix sync» → *Run workflow*. В логе должно быть `stats: written …`.
5. Дальше он сам запускается каждые 15 минут. Чтения Firestore экономятся: сводка пересчитывается не чаще раза в 2 часа и только если появилась новая активность (переменная `STATS_MIN_INTERVAL_MIN`).

Важно: GitHub **отключает** расписание, если в репозитории 60 дней не было коммитов. Любой коммит или кнопка *Run workflow* включает его снова.

## 6. Premium 💎
Привилегии проверяют сами правила (`isPremium()`): длинные посты (15 000), редактирование своих постов, акцентный цвет профиля. Остальное: значок 💎, рамка аватара, сравнение до 6, Insights, экспорт избранного в CSV, достижение «Меценат».

**Оплата.** В Stripe → Payment Links создай две **повторяющиеся** цены (месяц/год), впиши ссылки и те же цены в `premium-config.js`. Сайт добавляет к ссылке `?client_reference_id=<uid>&prefilled_email=<email>`.
**Включение** (один из способов):
* **автоматически:** п. 5 (опрос Stripe, задержка до ~15–30 минут, продления подхватываются тоже);
* **вручную:** Firebase Console → Firestore → `premium` → документ с **ID = uid плательщика**, поля `until` (тип **timestamp**) и `plan` (строка).

Юридические тексты (оферта, возвраты, налоги) оформляются отдельно.

## 7. Лимиты бесплатного плана и как мы в них укладываемся
Spark: **50 000 чтений, 20 000 записей, 20 000 удалений в день**, 1 ГиБ данных. Страница ленты читает порядка 100–150 документов, каталог и профиль заметно меньше, 🔔 и счётчик сообщений держат до ~50 документов. Это примерно **300–400 посещений в день**. Что уже сделано для экономии: рейтинг и оценки каталога читаются одним документом `stats/*`, всё кэшируется в браузере, чтения не дублируются. Если упрёшься в лимит: уменьши размер страницы ленты (`PAGE` в `feed.js`) или перейди на платный план.

## 8. Как считаются очки
Пост +10, комментарий +3, лайк на свой пост +2, оценка сервиса +2, свой канал +15. Очки считаются из публичных данных и нигде не хранятся, подделать их нельзя. В день учитывается не больше 5 постов и 10 комментариев, лайки самому себе не считаются.

## 9. Если что-то не работает
* `health.html`: красное — нет файла, жёлтое — старая версия, `permission-denied` — опубликуй свежий `firestore.rules`.
* Иконка приложения: загрузи все `icon-*.png` и `manifest.json`, удали установленное приложение и установи заново.
* **Не копируй код из чата** — теряются символы. Скачивай файлы или бери архив.
* Тесты и проверки (для разработчика): `node --check` для всех `*.js`; логика очков и синхронизации лежит в `gamify.js` и `scripts/sync.js`.

## 10. Чего здесь нет
Email-уведомления, подтверждение почты и загрузка картинок в посты требуют серверной части или платного хранилища. Карта сайта `sitemap.xml` требует точного адреса сайта.

## Repository maintenance notes

- The scheduled sync workflow is stored at `.github/workflows/sync.yml` and runs `node sync.js` from the repository root.
- Configure the `FIREBASE_SERVICE_ACCOUNT` GitHub Actions secret before expecting scheduled statistics synchronization to run. `STRIPE_SECRET_KEY` is optional and only enables the Stripe polling portion. The optional Stripe webhook is isolated in `functions/` with its own dependencies; configure `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` using Firebase Functions secrets before deploying it. Choose either webhook-based updates or scheduled Stripe polling as the primary subscription sync path to avoid unnecessary duplicate processing.
- The English and Russian account pages now use the same Firebase Authentication project as the main account page. Existing accounts that were created only in the former Supabase Auth project are not automatically migrated; migrate those users deliberately before switching production traffic.
- Firestore comment edits are restricted to the comment body and edit timestamp. Deploy the updated rules with `firebase deploy --only firestore:rules`. The optional webhook can be deployed with `firebase deploy --only functions` after setting its secrets.
- The precomputed leaderboard still intentionally has collection scan caps in `sync.js`; it is not yet an all-records analytics pipeline. The sync change detector now compares newest timestamps and collection counts, so ordinary deletions are detected, but changes to older records that preserve collection counts and do not update the ordered timestamp can still require a manual full rebuild. Review scan limits and Firestore costs before growing the dataset.
