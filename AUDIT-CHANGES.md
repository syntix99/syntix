# Syntix — changes in this patched copy

This is a conservative first refactor based on the uploaded ZIP. It is not a claim that the production app has been deployed or end-to-end tested.

## Changes made

1. Moved the scheduled workflow to `.github/workflows/sync.yml`.
2. Changed the sync script's Gamify import to the actual repository-root path.
3. Added collection-count checks to sync metadata, so ordinary additions/deletions trigger a stats refresh even when the newest timestamp does not change.
4. Restricted updates to `community_comments` and `tool_comments` so users can change only `body` and `editedAt`; author UID, display name, creation timestamp, and parent/tool linkage are immutable.
5. Replaced Supabase Authentication on `en/account.html` and `ru/account.html` with the same Firebase Authentication project used by the main account page. Added `localized-account.js`.
6. Moved the optional Stripe webhook into `functions/`, added its own dependencies, and configured Firebase Functions in `firebase.json`.
7. Added operational notes to `README.md`.

## Validation performed

- `node --check` passed for all 31 JavaScript files.
- JSON parsing passed for all 5 JSON files.
- No Firebase Emulator, Stripe test event, browser end-to-end, or production deployment was run.

## Important before deployment

- **Supabase account migration:** Users created only in Supabase Auth will not automatically exist in Firebase Auth. Migrate users deliberately or provide an account-linking/migration flow before switching live users to the Firebase-only login.
- **GitHub Actions:** Add repository secret `FIREBASE_SERVICE_ACCOUNT` containing the service-account JSON. Add `STRIPE_SECRET_KEY` only if using the scheduled Stripe polling path.
- **Stripe:** Configure `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` as Firebase Functions secrets before deploying the optional webhook. Choose either scheduled Stripe polling or the webhook as the primary subscription sync path.
- **Deploy rules:** `firebase deploy --only firestore:rules`
- **Deploy optional webhook:** `firebase deploy --only functions`
- **Stats limitations:** `sync.js` still intentionally has collection scan caps. Counts now detect normal deletes, but the leaderboard is not yet a full historical analytics pipeline. Older-document edits that don't change the ordered timestamp and don't change collection count can still require a manual rebuild.
- **Rules testing:** Run Firestore Emulator tests before production. The revised comment rules should be verified against every comment-edit path in the UI.
- **Secrets:** Never commit Firebase service-account JSON, Stripe secret keys, or webhook secrets. The Firebase web API key and Supabase publishable key are public client configuration values, not service credentials.
