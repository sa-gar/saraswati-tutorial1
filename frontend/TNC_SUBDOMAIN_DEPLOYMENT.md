# TNC Subdomain — DNS & Deployment Guide

## Subdomain Target
`tnc.saraswatitutorials.com` (or `tnc.saraswatitutorial.com` — whichever matches your registrar)

---

## Step 1 — Deploy to Vercel

The frontend is already a Vite + React SPA deployed on Vercel. No separate project is needed.

**In the Vercel Dashboard:**

1. Open your existing **Saraswati Tutorials frontend project**
2. Go to **Settings → Domains**
3. Click **Add Domain**
4. Enter: `tnc.saraswatitutorials.com`
5. Vercel will show you the required DNS record — it will be one of:

```
# Option A — CNAME (most common for subdomains)
tnc   CNAME   cname.vercel-dns.com.

# Option B — A record (if CNAME not supported at root)
tnc   A       76.76.21.21
```

6. Vercel automatically provisions a **free Let's Encrypt SSL certificate** once DNS propagates.

---

## Step 2 — Add DNS Record

Log into your **domain registrar** (GoDaddy / Cloudflare / Namecheap / etc.).

Go to **DNS Management** and add:

| Type  | Name | Value                  | TTL  |
|-------|------|------------------------|------|
| CNAME | tnc  | cname.vercel-dns.com.  | Auto |

> **If your DNS is managed by Cloudflare:**
> Turn **Proxy OFF** (grey cloud icon) for this record, so Vercel can provision SSL correctly.

---

## Step 3 — Wait for Propagation

DNS propagation typically takes **5–30 minutes** (up to 48 hours in rare cases).

Test with:
```bash
nslookup tnc.saraswatitutorials.com
```

---

## Step 4 — Verify

Once DNS propagates, open:
```
https://tnc.saraswatitutorials.com
```

The page should load directly with:
- HTTPS (padlock visible)
- Saraswati Tutorials logo
- Parent Onboarding content
- All 5 sections visible

---

## How Subdomain Routing Works (Technical)

The React app detects the hostname at runtime:

```js
// App.jsx
const isTncSubdomain =
  host === "tnc.saraswatitutorials.com" ||
  host === "tnc.saraswatitutorial.com" ||
  host.startsWith("tnc.");
```

When true, the root `/` route renders ParentOnboarding directly.
The Vercel SPA rewrite `"/(.*)" => "/"` ensures all paths serve index.html.

---

## Current Status

| Item | Status |
|---|---|
| Code | Complete |
| Build | Passing |
| Vercel Deploy | Pending (push to git + verify in Vercel dashboard) |
| Vercel Domain Config | Pending (add domain in dashboard) |
| DNS Record | Pending (add at registrar) |
| SSL | Auto-provisioned after DNS |
| Live URL | Pending DNS propagation |

STATUS: CODE COMPLETE — DEPLOYMENT PENDING
