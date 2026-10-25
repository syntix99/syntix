# Syntix — Firebase migration

This package replaces the previous Supabase browser integration with Firebase Authentication (email/password) and Cloud Firestore. The AI directory and detail pages are retained.

## Setup
1. Create a project at https://console.firebase.google.com/ (free Spark plan).
2. Add a **Web app** in Project settings and copy its Firebase web config into `config.js`. Replace every `PASTE_...` placeholder. Firebase web config is public client configuration; never paste a service account private key or Admin SDK credentials here.
3. In **Authentication → Sign-in method**, enable **Email/Password**.
4. In **Authentication → Settings → Authorized domains**, add your GitHub Pages hostname, e.g. `syntix99.github.io`.
5. Create **Firestore Database** in test/production mode, then open **Firestore → Rules** and paste `firestore.rules`, then Publish. Do not use unrestricted test rules.
6. Upload the contents of this folder to the root of the existing GitHub repository, replacing files with the same names. Keep `tools.json`, `app.js`, `tool.js`, `styles.css`, and `.nojekyll`. Commit changes and wait for GitHub Pages to deploy.

## Features
- Public read access for community posts and comments.
- Only signed-in users can create posts/comments.
- Users can edit/delete only their own documents at the Firestore rules layer.
- Global community feed, comments in feed, and discussions on AI tool detail pages.
- RU/EN language toggle retained.

## Notes
- This migration does not automatically copy old Supabase users or posts. Old Supabase data remains in Supabase unless you export/migrate it separately.
- Firestore may require a composite index for a query. If Firebase shows a `create index` link in the console, open it and create the suggested index.
- Never add Firebase Admin SDK/service account secrets to GitHub Pages.
- Firebase free plan has usage quotas. Review current limits in Firebase documentation.
- Verify registration, sign-in, posting, and comments on the deployed site after configuring the Firebase project. The package cannot be connected to your Firebase project until you provide your own web app config in `config.js`.


## Firebase configuration

`config.js` is populated with the Firebase Web App configuration for project `syntix-b5c57`. Firestore rules are in `firestore.rules`; publish them in Firebase Console → Firestore Database → Rules.


## Profiles (public)
- `profile.html` + `profile.js` + `profile.css`: public profile at `profile.html?uid=<uid>`; own profile at `profile.html` (needs sign-in).
- Data: `profiles/{uid}` (displayName, bio, avatar, showFavorites, lang, createdAt, updatedAt) and `profiles/{uid}/favorites/{toolSlug}`.
- Avatar is resized in the browser to 160×160 JPEG and stored as a data URL inside the profile document (no Firebase Storage needed).
- Favorites: heart button on `tool.html` (`favorites.js`). Visible to others only when the owner enables it in settings.
- Activity tab lists the user's posts and comments (simple `where uid ==` queries, no composite index needed).
- `nav-auth.js` turns the "Войти" button into "Профиль" when signed in.
- **Republish `firestore.rules`** (Firestore → Rules → Publish) after uploading these files.

## Site improvements (v2)
- **Catalog:** hearts now sync with Firestore when signed in (guests stay on localStorage; first login merges both). New "♥ Избранное" filter, `/` focuses search, `?cat=code&q=chat` deep links, category tag on tool pages links to the filtered catalog.
- **Comparison table** (`#comparison`) restored on the home page and added to the nav.
- **Tool pages:** "Similar tools" block (same category).
- **Community:** authors can delete their own posts/comments; comment loading uses one `in` query per 10 posts instead of one per post; tool discussions sorted client-side. **No composite indexes are required anymore.**
- **Account:** password reset ("Забыли пароль?"), specific error messages, signed-in users are redirected to their profile.
- **Rules:** `firestore.rules` validates fields and lengths for posts, comments, profiles and favorites. Republish after upload.
- Favicon added to all pages; Open Graph tags on the home page.

## v3
- **Ratings:** 1–5 stars on each tool page (`tool-rating.js`, collection `tool_ratings`, one rating per user, click the same star to remove). Average and count are visible to everyone. Needs republished `firestore.rules`.
- **Compare drawer:** ⚖ button on every catalog card, pick 2–3 tools and open a side-by-side table.
- **Search:** multi-word matching ("code chat"), `Esc` clears the search field.
- **Shared UI (`ui.js`):** toast notifications, "skip to content" link, Share button on tool pages.
- **Accessibility:** visible focus rings, `aria-live` result counter, reduced-motion support.

## v4
- **Likes** on community posts (`post_likes`), **reports** on posts/comments (`reports`, write-only: review them in Firebase Console → Firestore → `reports`; each report holds the collection name and document id).
- **Suggest a tool:** `suggest.html` writes to `tool_suggestions` (readable only by its author; you read all of them in the Console). Linked from the home page footer.
- **Tool pages:** latest community posts about the tool (`tool-posts.js`).
- **Profile:** new "Ratings" tab.
- Republish `firestore.rules` after uploading.

## v5 — Feed, channels, direct messages
- **`community.html` is now a redirect** to the new **`feed.html`** (delete the old `community.js` from your repo, it is no longer used). Old posts/comments/likes stay: they use the same collections.
- **Channels:** create your own (name, description, icon, "anyone can post" or "owner-only"), follow/unfollow, share link, owner can delete the channel and any post inside it. Collections: `channels`, `profiles/{uid}/joined`, posts carry `channelId`.
- **Direct messages:** `messages.html` — real-time chats (`dm_threads/{uidA_uidB}/messages`). Open a chat via the ✉ button under a post or on a member profile (`messages.html?to=<uid>`). Members can switch DMs off in profile settings (`allowDms`); unread dots are tracked per device.
- **Feed UI:** avatars, relative time, likes, inline comments, sort (latest/top), search, load-more, tool and channel pills.
- **Shared helpers:** `core.js` (profiles cache, avatars, time, links). Styles in `social.css`.
- **Republish `firestore.rules`** — it was rewritten (channels, DMs, new post fields).

## v6 — Leaderboard, levels, achievements
- **`leaderboard.html`:** top members (week / month / all time, podium + list, "your rank" card) and top tools (Bayesian-weighted average rating). Includes the XP rules and the full achievements catalog.
- **Levels & achievements (`gamify.js`):** XP = post 10, comment 3, like on your post 2, tool rating 2, own channel 15. 13 achievements (first post, writer, critic, founder, 3/7-day streaks, complete profile…). Shown on every profile (🏆 Achievements tab + level badge); the owner gets a toast when a new one unlocks.
- **Nothing is stored:** scores are derived from public data (posts, comments, likes, ratings, channels), so they cannot be edited. Anti-abuse: max 5 posts and 10 comments per day count, self-likes are ignored.
- **Cost:** the leaderboard reads ~2,000 documents per refresh; the result is cached in the browser for 15 minutes. For a large audience move this to a scheduled Cloud Function that writes a `leaderboard` document.
- No new Firestore rules are needed (only public reads).

## v7
- **Tool finder** on the home page (🎯): pick tasks, get the 4 best matches, optionally weighted by community rating.
- **Ratings on catalog cards** + sort "По рейтингу" (`ratings.js`, cached 30 min).
- **Unread DM badge** on the Messages tab/link and in the page title (`badge.js`).
- **Following:** follow people (profile + feed) and channels; "Подписки" tab in the feed (`profiles/{uid}/following`, private). Republish `firestore.rules`.
- **Feed:** clickable #hashtags + trending tags row, inline previews for direct https image links, draft autosave, Ctrl/Cmd+Enter to publish.
- **PWA:** installable on phones (`manifest.json`, `sw.js`, icons). Network-first, so updates always win.

### Installing the app / icon troubleshooting
- Upload **all** of: `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png` (binary PNGs are easy to miss). Check that `https://<your-site>/icon-192.png` opens in a browser.
- The old `manifest.webmanifest` is replaced by `manifest.json` — delete the old file.
- The OS stores the icon at install time: **remove the already installed app and install again** after deploying.

## v8 — Premium 💎 (paid features)
**How it is secured.** Premium status lives in `premium/{uid}` = `{ until: <timestamp>, plan }`. Clients can only *read* it (rules: `allow write: if false`), so nobody can grant it to themselves. The valuable perks are enforced **by the Firestore rules**, not just hidden in the UI: long posts (15,000 chars), editing own posts, and the profile accent colour all call `isPremium()` in `firestore.rules`.

**Perks:** 💎 badge (feed, profile, leaderboard) · accent colour + gold avatar ring · edit own posts · posts up to 15,000 characters · compare up to 6 tools · Insights tab (activity chart, best posting hours, top posts) · CSV export of favourites · "Patron" achievement. (Insights and CSV export are UI-gated only — they show data that is public anyway.)

**Pages/files:** `premium.html` (pricing), `premium-page.js`, `premium.js` (status loader), `premium-config.js` (**edit prices and payment links here**), `functions/` + `firebase.json` + `.firebaserc` (optional webhook).

### Taking payments — pick ONE way to activate Premium
1. In your payment provider (e.g. **Stripe → Payment Links**) create two *recurring* prices (monthly / yearly). Put the payment-link URLs and the same prices into `premium-config.js`. The site adds `?client_reference_id=<uid>&prefilled_email=<email>` so every payment is tied to a user.
2. **Manual activation (free, no server):** when a payment arrives, find the `client_reference_id` (= user ID) in the provider dashboard, then in Firebase Console → Firestore → collection `premium` → add a document whose **ID is that user ID** with fields `until` (type **timestamp**, the end of the paid period) and `plan` (string, e.g. `monthly`). Premium turns on immediately.
3. **Automatic activation (needs the Blaze plan):** deploy `functions/` — `firebase functions:secrets:set STRIPE_SECRET_KEY`, `firebase functions:secrets:set STRIPE_WEBHOOK_SECRET`, `firebase deploy --only functions,firestore:rules`. Add the printed function URL as a webhook endpoint in Stripe for the events `checkout.session.completed` and `invoice.paid`. Try it in Stripe **test mode** first.
- Never put secret keys (Stripe `sk_…`) into any file that is published on GitHub Pages.
- **Republish `firestore.rules`** (new: `premium`, post editing, long posts, profile accent).
