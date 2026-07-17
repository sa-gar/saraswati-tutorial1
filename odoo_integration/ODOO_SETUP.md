# Odoo Setup Guide — Saraswati Tutorials

Complete step-by-step guide to configure Odoo to work with the Node.js Broadcast System.

---

## Step 1 — Store Configuration in Odoo System Parameters

These parameters are read by all Server Actions. Set them **once** and all actions use them.

1. Go to: **Settings → Technical → Parameters → System Parameters**
2. Create two entries:

| Key | Value |
|-----|-------|
| `saraswati.backend_url` | `https://your-api.saraswatitutorial.com` |
| `saraswati.webhook_secret` | `saraswati_wh_secret_2024` (must match WEBHOOK_SECRET in .env) |

> ⚠️ Never paste the secret directly in Server Action code — always use ir.config_parameter.

---

## Step 2 — Activate Developer Mode

Server Actions require Developer Mode.

1. Go to: **Settings → General Settings**
2. Scroll to the bottom → click **Activate the developer mode**
3. URL will change to include `?debug=1`

---

## Step 3 — Create Server Actions

For each action, follow these steps:

**Settings → Technical → Actions → Server Actions → New**

### Action 1: Search Tutor

| Field | Value |
|-------|-------|
| Name | `Search Tutor (Saraswati)` |
| Model | `CRM Lead/Opportunity` (`crm.lead`) |
| Action Type | `Execute Python Code` |
| Python Code | *(paste contents of `server_actions/search_tutor_action.py`)* |

### Action 2: Broadcast Tutors

| Field | Value |
|-------|-------|
| Name | `Broadcast Tutors (Saraswati)` |
| Model | `CRM Lead/Opportunity` (`crm.lead`) |
| Action Type | `Execute Python Code` |
| Python Code | *(paste contents of `server_actions/broadcast_action.py`)* |

### Action 3: Retry Broadcast

| Field | Value |
|-------|-------|
| Name | `Retry Broadcast (Saraswati)` |
| Model | `CRM Lead/Opportunity` (`crm.lead`) |
| Action Type | `Execute Python Code` |
| Python Code | *(paste contents of `server_actions/retry_broadcast_action.py`)* |

### Action 4: Assign Tutor

| Field | Value |
|-------|-------|
| Name | `Assign Tutor (Saraswati)` |
| Model | `CRM Lead/Opportunity` (`crm.lead`) |
| Action Type | `Execute Python Code` |
| Python Code | *(paste contents of `server_actions/assign_tutor_action.py`)* |

---

## Step 4 — Add Actions to CRM Lead Form (Buttons)

To make these appear as buttons in the CRM Lead view:

1. Open any **CRM Lead** record in the CRM module
2. Click the **⚙️ (gear icon)** → **Add a Server Action to a Button**
   - OR go to: **Settings → Technical → Actions → Window Actions**
   - Find `crm.lead.action_crm_lead_all_leads` or similar
   - Add your server actions to the `action` context menu
3. The actions appear in the **Action** dropdown (⚙️) on the lead form

Alternatively, use **Odoo Studio** (if available):
1. Open a CRM Lead → Click **Studio** (paint palette icon)
2. Drag a **Button** widget to the form view
3. Set Button action → your server action

---

## Step 5 — Configure Automation Rules (Optional)

### Rule A: Auto Search Tutor on Lead Created

1. Go to: **Settings → Technical → Automation → Automated Actions**
2. Create:

| Field | Value |
|-------|-------|
| Name | `Auto Search Tutor on Lead Created` |
| Model | `CRM Lead/Opportunity` |
| Trigger | `When a record is created` |
| Before Update Filter | `Type is Parent` (if `x_studio_type = 'Parent'`) |
| Action | Server Action → `Search Tutor (Saraswati)` |
| Active | ✅ (enable when ready) |

### Rule B: Auto Broadcast on Lead Created (Optional)

Same as above but action = `Broadcast Tutors (Saraswati)`.

> ⚠️ Enable this only after testing manual broadcast works correctly. Auto-broadcast fires for every new parent lead.

---

## Step 6 — Test the Integration

### Test Search Tutor
1. Open any CRM Lead of type "Parent"
2. Click ⚙️ → **Search Tutor (Saraswati)**
3. Check the lead **Chatter** — recommendations should appear within 10 seconds
4. If it fails, check the chatter for the error message

### Test Broadcast
1. Same lead → ⚙️ → **Broadcast Tutors (Saraswati)**
2. Chatter should show: "✅ Broadcast Started — X tutors queued"
3. Tutors should receive WhatsApp messages within 1–2 minutes

### Test Tutor Reply
1. Reply "Interested" from the tutor's phone
2. Odoo chatter should show: "✅ Tutor [Name] replied: Interested"
3. This is posted by Node.js webhook after processing the reply

---

## Step 7 — Broadcast History on Every Lead

After each broadcast, the Odoo lead chatter automatically shows:
- ✅ Broadcast started (with bucket counts)
- ✅/❌ Each tutor reply (Interested / Not Interested)
- 🎉 Tutor assigned (with parent details sent confirmation)

No additional Odoo configuration needed — Node.js posts all events to chatter automatically.

---

## Sync Architecture Reference

```
Tutor registers (Website)
    ↓ immediately
MongoDB (master for broadcast fields)
    ↓ upsertMasterTutor()
Odoo x_master_tutors (master for profile fields)
    ↓ every 15 min (syncService.js)
MongoDB updated with latest Odoo profile data

CONFLICT RESOLUTION:
  Profile fields (name, area, subjects, grades) → Odoo wins
  Broadcast fields (onboardingCompleted, history) → MongoDB wins
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Chatter shows "No parent enquiry found with odooLeadId = X" | The lead was not created via Website. Create from website, or manually set `odooLeadId` in MongoDB. |
| Chatter shows "Request timed out" | Node.js server is down or unreachable. Check server health: `GET /api/health` |
| No WhatsApp messages sent | Check Node.js logs for Odoo authentication errors. Verify ODOO_URL, ODOO_USERNAME, ODOO_PASSWORD in .env |
| "Unauthorized webhook secret" error | `saraswati.webhook_secret` in Odoo does not match `WEBHOOK_SECRET` in .env |
| Recommendations show 0 tutors | No approved tutors in MongoDB matching the lead's grade/city. Check Tutor collection. |
