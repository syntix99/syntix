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
