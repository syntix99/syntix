<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Диагностика — Syntix</title>
<style>
body{margin:0;padding:24px 16px 60px;background:#090b13;color:#e8eaf4;font:14px/1.6 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
main{max-width:760px;margin:0 auto}
h1{font-size:26px;margin:0 0 4px}h2{font-size:15px;margin:26px 0 8px;color:#b9a8ff}
.muted{color:#8d93ab;font-size:12px}
.row{display:flex;gap:10px;padding:7px 12px;border:1px solid #ffffff14;border-radius:10px;margin:5px 0;background:#0f121d;align-items:baseline}
.row b{flex:none;width:22px}.row span{flex:1;word-break:break-word}.row i{color:#8d93ab;font-style:normal;font-size:12px}
.ok b{color:#6df0c2}.bad b{color:#ff7d8d}.warn b{color:#ffcf7a}
button{font:inherit;padding:10px 16px;border-radius:10px;border:1px solid #9279ff77;background:#8b72fa22;color:#dcd3ff;cursor:pointer;margin:6px 8px 0 0}
pre{white-space:pre-wrap;background:#0f121d;border:1px solid #ffffff14;border-radius:10px;padding:12px;font-size:12px}
</style></head>
<body><main>
<h1>Диагностика сайта</h1><p class="muted">Эта страница проверяет файлы, Firebase и кэш. Пришли скриншот или скопируй итог внизу.</p>
<div id="out">Проверяем…</div>
<h2>Кэш и сервис-воркер</h2>
<div id="sw" class="muted"></div>
<button id="reset">Сбросить кэш и перезагрузить</button>
<h2>Итог для поддержки</h2><pre id="report"></pre><button id="copy">Скопировать итог</button>
</main>
<script defer src="https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js"></script>
<script defer src="https://www.gstatic.com/firebasejs/10.14.1/firebase-auth-compat.js"></script>
<script defer src="https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore-compat.js"></script>
<script defer src="./config.js"></script>
<script defer src="./health.js"></script>
</body></html>
