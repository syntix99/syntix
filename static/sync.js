// Syntix sync — runs in GitHub Actions (free), NOT in the browser and NOT on Firebase Functions.
//  1) stats/leaderboard + stats/ratings: one precomputed document each, so visitors read 1 doc instead of ~2000
//  2) Stripe -> premium/{uid}: activates and renews Premium by polling Stripe (no Blaze plan, no webhook)
// Secrets (GitHub repo -> Settings -> Secrets and variables -> Actions):
//   FIREBASE_SERVICE_ACCOUNT  the whole service-account JSON (Firebase Console -> Project settings -> Service accounts)
//   STRIPE_SECRET_KEY         optional; use a RESTRICTED key with read access to Checkout Sessions and Subscriptions
// Optional env: STATS_MIN_INTERVAL_MIN (default 120) keeps Firestore reads inside the free quota.
const path = require('path');
global.window = global.window || {};
require(path.join(__dirname, '..', 'gamify.js'));          // same scoring code as the website
const G = global.window.Gamify;

const MIN = 60000, DAY = 86400000;
const toMs = v => (v && typeof v.toMillis === 'function' ? v.toMillis() : 0) || Date.now();
const log = (...a) => console.log('[sync]', ...a);

// ---------------- leaderboard + ratings ----------------
const CAPS = { community_posts: 500, community_comments: 800, tool_comments: 400, tool_ratings: 1500, post_likes: 1500, channels: 200 };
const ORDER = { community_posts: 'createdAt', community_comments: 'createdAt', tool_comments: 'createdAt', tool_ratings: 'updatedAt', post_likes: 'createdAt', channels: 'createdAt' };

async function newest(db, col) {
  const s = await db.collection(col).orderBy(ORDER[col], 'desc').limit(1).get();
  return s.empty ? 0 : toMs(s.docs[0].data()[ORDER[col]]);
}

function buildStats(rows) {
  const { posts, comments, tcomments, ratings, channels, likes } = rows;
  const ev = [], author = {};
  posts.forEach(d => { const x = d.data(); author[d.id] = x.uid; ev.push(['p', x.uid, toMs(x.createdAt)]); });
  comments.concat(tcomments).forEach(d => { const x = d.data(); ev.push(['c', x.uid, toMs(x.createdAt)]); });
  ratings.forEach(d => { const x = d.data(); ev.push(['r', x.uid, toMs(x.updatedAt)]); });
  channels.forEach(d => { const x = d.data(); ev.push(['ch', x.ownerUid, toMs(x.createdAt)]); });
  likes.forEach(d => { const x = d.data(), a = author[x.postId]; if (a && a !== x.uid) ev.push(['l', a, toMs(x.createdAt)]); });
  const now = Date.now(), all = G.build(ev, 0);
  const top = since => [...G.build(ev, since).entries()].filter(([, s]) => s.xp > 0)
    .sort((a, b) => b[1].xp - a[1].xp || b[1].p - a[1].p).slice(0, 50)
    .map(([u, s]) => { const t = all.get(u) || s; return { u, x: s.xp, tx: t.xp, p: t.p, c: t.c, l: t.l, r: t.r, ch: t.ch, s: G.streakOf(t.days) }; });
  const m = {};
  ratings.forEach(d => { const x = d.data(), a = m[x.toolSlug] || (m[x.toolSlug] = { n: 0, sum: 0 }); a.n++; a.sum += x.value; });
  const slugs = Object.keys(m);
  const tools = slugs.map(s => ({ s, n: m[s].n, a: m[s].sum / m[s].n, c: (m[s].sum + 7) / (m[s].n + 2) }));
  const r = {};
  slugs.forEach(s => { r[s] = { n: m[s].n, avg: m[s].sum / m[s].n, score: (m[s].sum + 7) / (m[s].n + 2) }; });
  return { users: { week: top(now - 7 * DAY), month: top(now - 30 * DAY), all: top(0) }, tools, ratings: r };
}

async function syncStats(db, admin) {
  const minGap = (parseInt(process.env.STATS_MIN_INTERVAL_MIN, 10) || 120) * MIN;
  const metaRef = db.collection('stats').doc('meta');
  const meta = (await metaRef.get()).data() || {};
  if (meta.t && Date.now() - meta.t < minGap) { log('stats: refreshed recently, skipping'); return false; }
  // cheap change detection: 6 single-document reads
  const marks = {};
  for (const col of Object.keys(CAPS)) marks[col] = await newest(db, col);
  if (meta.t && JSON.stringify(marks) === JSON.stringify(meta.marks || {})) { log('stats: nothing new since last run'); return false; }
  const get = async col => (await db.collection(col).orderBy(ORDER[col], 'desc').limit(CAPS[col]).get()).docs;
  const rows = { posts: await get('community_posts'), comments: await get('community_comments'), tcomments: await get('tool_comments'), ratings: await get('tool_ratings'), channels: await get('channels'), likes: await get('post_likes') };
  const out = buildStats(rows);
  const t = Date.now();
  await db.collection('stats').doc('leaderboard').set({ t, users: out.users, tools: out.tools });
  await db.collection('stats').doc('ratings').set({ t, r: out.ratings });
  await metaRef.set({ t, marks });
  log('stats: written', Object.values(rows).reduce((n, a) => n + a.length, 0), 'docs read');
  return true;
}

// ---------------- Stripe -> premium ----------------
const periodEnd = sub => (sub.current_period_end || (sub.items && sub.items.data && sub.items.data[0] && sub.items.data[0].current_period_end) || 0) * 1000;
const planOf = sub => { const p = sub.items && sub.items.data && sub.items.data[0] && sub.items.data[0].price; return (p && p.recurring && p.recurring.interval) || 'unknown'; };
const UID_RE = /^[A-Za-z0-9]{20,40}$/;

async function grant(db, admin, uid, sub, source) {
  const end = periodEnd(sub);
  if (!end) return false;
  const ref = db.collection('premium').doc(uid), cur = (await ref.get()).data();
  const curEnd = cur && cur.until && cur.until.toMillis ? cur.until.toMillis() : 0;
  if (cur && end <= curEnd) return false;                 // only ever extend; the doc follows the subscription that ends last
  await ref.set({ until: admin.firestore.Timestamp.fromMillis(Math.max(end, curEnd)), plan: planOf(sub), subscriptionId: sub.id, source, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
  log('premium: granted/extended', uid, new Date(Math.max(end, curEnd)).toISOString());
  return true;
}

async function syncPremium(db, admin, stripe) {
  if (!stripe) { log('premium: STRIPE_SECRET_KEY not set, skipping'); return; }
  // 1) new checkouts from the last 3 days
  const since = Math.floor(Date.now() / 1000) - 3 * 86400;
  const sessions = await stripe.checkout.sessions.list({ created: { gte: since }, limit: 100 });
  for (const s of sessions.data) {
    const uid = s.client_reference_id;
    if (s.status !== 'complete' || !uid || !UID_RE.test(uid) || s.mode !== 'subscription' || !s.subscription) continue;
    if (s.payment_status !== 'paid' && s.payment_status !== 'no_payment_required') continue;
    if (!(await db.collection('profiles').doc(uid).get()).exists) { log('premium: unknown uid, skipped', uid); continue; }
    const sub = await stripe.subscriptions.retrieve(typeof s.subscription === 'string' ? s.subscription : s.subscription.id);
    if (sub.status === 'active' || sub.status === 'trialing') await grant(db, admin, uid, sub, 'stripe');
  }
  // 2) renewals: re-read every subscription we already know
  const known = await db.collection('premium').where('source', '==', 'stripe').get();
  for (const d of known.docs) {
    const id = d.data().subscriptionId; if (!id) continue;
    try { const sub = await stripe.subscriptions.retrieve(id); if (sub.status === 'active' || sub.status === 'trialing') await grant(db, admin, d.id, sub, 'stripe'); }
    catch (e) { log('premium: could not read subscription', id, e.message); }
  }
}

// ---------------- main ----------------
async function main() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) { log('FIREBASE_SERVICE_ACCOUNT is not set — nothing to do (see README).'); return; }
  const admin = require('firebase-admin');
  admin.initializeApp({ credential: admin.credential.cert(JSON.parse(raw)) });
  const db = admin.firestore();
  const Stripe = process.env.STRIPE_SECRET_KEY ? require('stripe') : null;
  const stripe = Stripe ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
  try { await syncPremium(db, admin, stripe); } catch (e) { console.error('[sync] premium failed:', e.message); process.exitCode = 1; }
  try { await syncStats(db, admin); } catch (e) { console.error('[sync] stats failed:', e.message); process.exitCode = 1; }
}

if (require.main === module) main().catch(e => { console.error(e); process.exit(1); });
module.exports = { buildStats, syncStats, syncPremium, grant, periodEnd };
