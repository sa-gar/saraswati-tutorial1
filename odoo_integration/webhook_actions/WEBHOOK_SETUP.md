# Odoo Online (SaaS) Webhook Setup — Saraswati Tutorials

> **Why this guide exists**
>
> Odoo Online (SaaS) **blocks Python imports** in Server Actions.  
> The legacy `Execute Python Code` approach with `import requests` fails:
> ```
> Validation Error: forbidden opcode(s): IMPORT_NAME
> ```
> The solution is Odoo's native **"Send Webhook Notification"** action type,
> which requires zero Python code and works on all Odoo Online plans.

---

## Architecture Overview

```
Admin clicks button in Odoo CRM Lead form
         ↓
Odoo "Send Webhook Notification" action
         ↓  POST  +  X-Webhook-Secret header
Node.js  /api/odoo/search-tutor  OR  /api/odoo/broadcast
         ↓
resolveLeadAndRecommend()  →  ParentEnquiry (MongoDB)
         ↓
getRecommendations()  →  4-bucket tutor matching
         ↓
addOdooChatterMessage()  →  Odoo CRM Lead chatter
         ↓  (broadcast endpoint only)
broadcastService.enqueue()  →  WhatsApp messages
```

---

## Webhook Endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST https://<backend>/api/odoo/search-tutor` | Calculate tutor recommendations & post to chatter |
| `POST https://<backend>/api/odoo/broadcast` | Enqueue broadcast to tutors & post to chatter |

**Payload sent by Odoo (automatically):**
```json
{
  "_id":    123,
  "_model": "crm.lead",
  "_action": "Search Tutor (Saraswati)"
}
```

**Required header:**
```
X-Webhook-Secret: <value of WEBHOOK_SECRET in backend .env>
```

---

## Step 1 — Verify Backend .env

Ensure your backend `.env` has:
```
WEBHOOK_SECRET=saraswati_wh_secret_2024
```
> This value must match the header you set in each Odoo webhook action.

---

## Step 2 — Activate Developer Mode in Odoo Online

1. Go to **Settings → General Settings**
2. Scroll to bottom → **Activate the developer mode**
3. URL changes to include `?debug=1`

---

## Step 3 — Create "Search Tutor" Webhook Action

1. Go to: **Settings → Technical → Actions → Server Actions → New**

| Field | Value |
|-------|-------|
| **Name** | `Search Tutor (Saraswati)` |
| **Model** | `CRM Lead/Opportunity` (`crm.lead`) |
| **Action Type** | `Send Webhook Notification` |
| **URL** | `https://<your-backend>/api/odoo/search-tutor` |
| **HTTP Method** | `POST` |

2. Under **Request Headers**, add:

| Key | Value |
|-----|-------|
| `X-Webhook-Secret` | `saraswati_wh_secret_2024` |
| `Content-Type` | `application/json` |

3. Click **Save**

> The **Webhook Body** field is NOT needed — Odoo automatically sends `_id`, `_model`, and `_action`.

---

## Step 4 — Create "Broadcast Tutors" Webhook Action

1. Go to: **Settings → Technical → Actions → Server Actions → New**

| Field | Value |
|-------|-------|
| **Name** | `Broadcast Tutors (Saraswati)` |
| **Model** | `CRM Lead/Opportunity` (`crm.lead`) |
| **Action Type** | `Send Webhook Notification` |
| **URL** | `https://<your-backend>/api/odoo/broadcast` |
| **HTTP Method** | `POST` |

2. Under **Request Headers**, add:

| Key | Value |
|-----|-------|
| `X-Webhook-Secret` | `saraswati_wh_secret_2024` |
| `Content-Type` | `application/json` |

3. Click **Save**

---

## Step 5 — Add Actions to CRM Lead Form (Buttons)

### Option A: Action Menu (⚙️ gear icon) — no Studio required

1. Open any CRM Lead record
2. Click the ⚙️ **gear icon** → **Add a Custom Action**
3. Select your server action from the dropdown

The action now appears in the ⚙️ menu on every CRM Lead.

### Option B: Button via Odoo Studio (if available)

1. Open a CRM Lead → click **Studio** (paint palette icon)
2. Drag a **Button** widget onto the form view
3. Set **Button Action** → your server action
4. Save the studio customisation

---

## Step 6 — Test the Integration

### Test Search Tutor

1. Open a CRM Lead of type "Parent" that exists in MongoDB
2. Click ⚙️ → **Search Tutor (Saraswati)**
3. Wait 5–10 seconds
4. Check the lead **Chatter** — recommendations appear:
   ```
   🔍 Tutor Recommendations for REQ-2024-001:
   Exact Match (3)
   • Priya Sharma — 92% match, 2.1 km | subject + grade + area
   • Rahul Mehta  — 88% match, 3.4 km | subject + grade
   ...
   ```

### Test Broadcast

1. Same CRM Lead → ⚙️ → **Broadcast Tutors (Saraswati)**
2. Chatter shows:
   ```
   ✅ Broadcast started for REQ-2024-001
   Tutors queued: 12 | Already sent (skipped): 3
   📍 Exact: 3 | Nearby: 4 | City: 5 | Backup: 0
   ```
3. Tutors receive WhatsApp messages within 1–2 minutes

---

## Example Webhook Payloads

### Search Tutor — payload sent by Odoo:
```json
{
  "_id": 123,
  "_model": "crm.lead",
  "_action": "Search Tutor (Saraswati)"
}
```

### Search Tutor — response from Node.js:
```json
{
  "success": true,
  "message": "Recommendations calculated and posted to Odoo chatter.",
  "odooLeadId": 123,
  "requirementId": "REQ-2024-001",
  "buckets": {
    "exact":  3,
    "nearby": 4,
    "city":   5,
    "backup": 0
  },
  "totalFound": 12
}
```

### Broadcast — payload sent by Odoo:
```json
{
  "_id": 123,
  "_model": "crm.lead",
  "_action": "Broadcast (Saraswati)"
}
```

### Broadcast — response from Node.js:
```json
{
  "success": true,
  "message": "Broadcast started. 12 tutors queued.",
  "odooLeadId": 123,
  "requirementId": "REQ-2024-001",
  "queued": 12,
  "alreadyQueued": 3,
  "buckets": {
    "exact":  3,
    "nearby": 4,
    "city":   5,
    "backup": 0
  },
  "queueStatus": { ... }
}
```

---

## Backward Compatibility

The legacy endpoints remain fully operational for Odoo Self-hosted / Odoo.sh:

| Legacy Endpoint | Still Works? |
|----------------|-------------|
| `GET  /api/recommend-from-odoo?leadId=123` | ✅ Unchanged |
| `POST /api/broadcast-from-odoo` | ✅ Unchanged |

**Do not change** the existing Python Server Actions on self-hosted if they work.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Odoo shows `forbidden opcode(s): IMPORT_NAME` | Using "Execute Python Code" with `import requests` on Odoo Online | Use "Send Webhook Notification" action type (this guide) |
| Chatter shows `Unauthorized — invalid webhook secret` | `X-Webhook-Secret` header value doesn't match `WEBHOOK_SECRET` in `.env` | Sync both values |
| Chatter shows `No parent enquiry found with odooLeadId = X` | Lead was not created via the website or not synced to MongoDB | Create the lead via the website, or manually set `odooLeadId` in MongoDB |
| No chatter message appears at all | Node.js server is unreachable from Odoo | Check `GET https://<backend>/api/health`. Verify server is running and accessible. |
| Webhook returns 404 from Node.js | Wrong URL in Odoo webhook action | URL must be `https://<backend>/api/odoo/search-tutor` (not `/api/recommend-from-odoo`) |
| Odoo Online shows `Timeout` | Recommendation engine taking > 30s | Check MongoDB connection. Verify tutor index exists. |

---

## Environment Variables Reference

No new environment variables are required for Odoo Online.  
The same `WEBHOOK_SECRET` used for the legacy endpoints is reused.

| Variable | Purpose | Example |
|----------|---------|---------|
| `WEBHOOK_SECRET` | Authenticates all `/api/odoo/*` and `/api/*-from-odoo` requests | `saraswati_wh_secret_2024` |

---

## Files in This Directory

| File | Purpose |
|------|---------|
| `WEBHOOK_SETUP.md` | This guide — Odoo Online "Send Webhook Notification" setup |

## Legacy Files (Odoo Self-hosted / Odoo.sh only)

| File | Purpose |
|------|---------|
| `../server_actions/search_tutor_action.py` | Python code for "Execute Python Code" Search Tutor action |
| `../server_actions/broadcast_action.py` | Python code for "Execute Python Code" Broadcast action |
| `../server_actions/retry_broadcast_action.py` | Python code for "Execute Python Code" Retry Broadcast action |
| `../server_actions/assign_tutor_action.py` | Python code for "Execute Python Code" Assign Tutor action |
