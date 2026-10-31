# Syntix — Python / Flask edition

Эта сборка переносит запуск сайта на Python + Flask и сохраняет исходный интерфейс Syntix из предоставленного архива: HTML, CSS, JavaScript, страницы RU/EN, изображения и каталог `tools.json`.

## Запуск локально

Требуется Python 3.10+.

```bash
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS / Linux:
source .venv/bin/activate

pip install -r requirements.txt
python app.py
```

Откройте http://127.0.0.1:5000

## Что добавлено на Python

- Flask-сервер раздаёт исходные страницы и ресурсы.
- `GET /api/health` — проверка сервера.
- `GET /api/tools` — каталог из `static/tools.json`.
- `GET /api/favorites` — избранное текущей сессии.
- `POST /api/favorites` с JSON `{"name":"ChatGPT"}` — добавить избранное.
- `DELETE /api/favorites/<name>` — удалить избранное.
- SQLite создаётся автоматически в `syntix.db`.

Избранное в API привязано к браузерной сессии. Это не полноценная регистрация пользователей. Для настоящих аккаунтов, восстановления пароля и безопасной авторизации потребуется отдельный этап разработки.

## Публикация

GitHub Pages не запускает Flask. Для Python-сервера используйте Render, Railway или другой хостинг Python.

Для Render:
- Build command: `pip install -r requirements.txt`
- Start command: `gunicorn app:app`
- Добавьте переменную окружения `SECRET_KEY` со случайным длинным значением.
- Для сохранения SQLite между перезапусками нужен постоянный диск; для production лучше PostgreSQL.

## Структура

- `app.py` — Flask-приложение и API.
- `static/` — исходные файлы интерфейса Syntix.
- `static/tools.json` — каталог инструментов.
