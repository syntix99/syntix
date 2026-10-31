from pathlib import Path
import json
import os
import sqlite3
from flask import Flask, jsonify, request, send_from_directory, session, abort

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
DB_PATH = Path(os.environ.get("SYNTIX_DB", BASE_DIR / "syntix.db"))

app = Flask(__name__, static_folder=None)
app.secret_key = os.environ.get("SECRET_KEY", "change-this-secret-before-deploy")

def db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS favorites (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                tool_name TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(session_id, tool_name)
            )
        """)

def current_session_id():
    if "sid" not in session:
        import secrets
        session["sid"] = secrets.token_urlsafe(24)
    return session["sid"]

@app.get("/")
def home():
    return send_from_directory(STATIC_DIR, "index.html")

@app.get("/api/health")
def health():
    return jsonify(status="ok", app="Syntix", version="1.0.0")

@app.get("/api/tools")
def tools():
    path = STATIC_DIR / "tools.json"
    if not path.exists():
        return jsonify([])
    with path.open(encoding="utf-8") as f:
        return jsonify(json.load(f))

@app.get("/api/favorites")
def get_favorites():
    sid = current_session_id()
    with db() as conn:
        rows = conn.execute(
            "SELECT tool_name FROM favorites WHERE session_id=? ORDER BY created_at DESC",
            (sid,)
        ).fetchall()
    return jsonify([row["tool_name"] for row in rows])

@app.post("/api/favorites")
def add_favorite():
    payload = request.get_json(silent=True) or {}
    name = str(payload.get("name", "")).strip()
    if not name or len(name) > 120:
        return jsonify(error="Укажи корректное название инструмента"), 400
    sid = current_session_id()
    with db() as conn:
        conn.execute(
            "INSERT OR IGNORE INTO favorites(session_id, tool_name) VALUES (?, ?)",
            (sid, name)
        )
    return jsonify(ok=True, name=name), 201

@app.delete("/api/favorites/<path:name>")
def delete_favorite(name):
    sid = current_session_id()
    with db() as conn:
        conn.execute(
            "DELETE FROM favorites WHERE session_id=? AND tool_name=?",
            (sid, name)
        )
    return jsonify(ok=True)

@app.route("/<path:filename>")
def assets(filename):
    # Keep existing HTML pages, stylesheets, scripts, images and JSON accessible.
    target = (STATIC_DIR / filename).resolve()
    if not str(target).startswith(str(STATIC_DIR.resolve())) or not target.is_file():
        abort(404)
    return send_from_directory(STATIC_DIR, filename)

@app.errorhandler(404)
def not_found(_error):
    custom_404 = STATIC_DIR / "404.html"
    if custom_404.exists():
        return send_from_directory(STATIC_DIR, "404.html"), 404
    return jsonify(error="Not found"), 404

init_db()

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=int(os.environ.get("PORT", 5000)), debug=True)
