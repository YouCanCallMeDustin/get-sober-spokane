# Deployment & Domain Guide

This guide will walk you through the steps to get **Sober Spokane** live on your new domain: `www.getsoberspokane.com`.

## Phase 1: Purchase Your Domain

I recommend using [Namecheap](https://www.namecheap.com/) or [Google Domains (now Squarespace)](https://domains.squarespace.com/) for a clean experience.

1.  **Search**: Go to the registrar and search for `getsoberspokane.com`.
2.  **Purchase**: Follow the checkout process.
3.  **Keep it Open**: Once purchased, keep the dashboard open; we will need to update the "DNS Records" later.

## Phase 2: Push to GitHub

We need to get your code from your computer onto GitHub.

1.  **Verified**: Your code is already linked to `YouCanCallMeDustin/get-sober-spokane`.
2.  **Save/Push**: Once I finish the current sync, I will run `git push` to save everything online.

## Phase 3: Setup Hosting (Railway.app)

I recommend **Railway** because it handles Node.js + WebSockets + Sessions perfectly.

1.  **Sign Up**: Go to [Railway.app](https://railway.app/) and sign up with your GitHub account.
2.  **New Project**: Click "New Project" -> "Deploy from GitHub repo".
3.  **Select Repo**: Choose the `get-sober-spokane` repository.
4.  **Environment Variables**: We will need to copy your `.env` variables (Supabase URL, Keys, etc.) into the Railway "Variables" tab.

## Phase 4: Connect Domain

1.  In Railway, go to **Settings** -> **Domains**.
2.  Click "Custom Domain" and enter `www.getsoberspokane.com`.
3.  Railway will give you a **CNAME** or **A Record**.
4.  Copy that value back to your Domain Registrar's DNS settings.

---

### Ready?
I'm finishing the technical "push" now. Once I'm done, you can proceed with Phase 1 (Domain Purchase) and Phase 3 (Hosting).
