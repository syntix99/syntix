# Syntix bilingual refresh

A responsive static website for GitHub Pages.

- `index.html`: home page and tool directory
- `styles.css`: responsive dark interface
- `app.js`: bilingual RU/EN, live search, category filters, sorting, favorites
- `account.html` + `account.js`: email sign-in and sign-up with Supabase JS
- `config.js`: Supabase project URL and public publishable key
- `.nojekyll`: GitHub Pages marker

## Publish
1. Download and unzip this archive.
2. Open https://github.com/syntix99/syntix
3. Make a backup/branch before replacing existing files.
4. Upload the files to the repository root (same level as `index.html`) and commit.
5. Wait a few minutes for GitHub Pages to deploy.

This is a clean refresh package, not a patch against unseen current files. Keep a copy of the current repository before replacing anything. The browser config contains only the publishable key, never a Supabase secret/service_role key. Sign-in will remain unavailable until the Supabase API connection issue is fixed. Free plan labels are informational and should be checked against each provider's current terms.

## Community features (new)
- `community.html` is the public community feed. Everyone can read posts and comments; posting requires a signed-in Supabase account.
- Each AI tool detail page has its own comments section (`tool_comments`).
- `community.js` and `tool-community.js` power posting and discussions.
- `supabase-community.sql` creates the required tables, indexes, and Row Level Security policies.

### One-time Supabase setup
1. Open Supabase Dashboard for this project.
2. Go to **SQL Editor** → **New query**.
3. Paste the full contents of `supabase-community.sql` and click **Run**.
4. In **Authentication → URL Configuration**, add your GitHub Pages URL to the allowed redirect URLs if needed.
5. Commit all files from this archive to the repository root and wait for GitHub Pages to publish.

The public publishable key in `config.js` is intended for browser use. Never add a `service_role` or secret key to this repository. Supabase API connectivity must be working for shared posts/comments to load; static pages alone cannot sync data between users.
