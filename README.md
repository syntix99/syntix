# Syntix.ai

Static bilingual AI tools directory for GitHub Pages, with Supabase Auth wired into the Russian and English account pages.

## Publish on GitHub Pages
1. Upload/replace the contents of this archive in the root of `syntix99/syntix` (keep the `ru` and `en` folders).
2. Commit changes to the `main` branch.
3. Wait for GitHub Pages to deploy.

## Supabase Auth setup
1. In Supabase, open Authentication → URL Configuration.
2. Set Site URL to `https://syntix99.github.io/syntix/`.
3. Add these Redirect URLs:
   - `https://syntix99.github.io/syntix/**`
4. In Authentication → Sign In / Providers, make sure Email is enabled and sign-ups are allowed.
5. Email confirmation can stay enabled. The account page tells new users to confirm their email.

The browser uses only the project's public Project URL and Publishable key in `supabase-client.js`. Never add a database password, `sb_secret_...` key, or `service_role` key to this repository.

## Account pages
- Russian: `/syntix/ru/account.html`
- English: `/syntix/en/account.html`

The app uses the Supabase JavaScript v2 client via esm.sh. Since this is a static site, authorization works in the browser; private server-side operations must not be placed in these files. Set appropriate Row Level Security policies before adding user-owned database tables.
