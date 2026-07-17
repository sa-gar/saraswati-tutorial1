# ============================================================
# Odoo Server Action: Broadcast Tutors
# ============================================================
# Model: crm.lead
# Action Type: Execute Python Code
# Name: Broadcast Tutors (Saraswati)
# Trigger: Button on CRM Lead form view
# ============================================================

import requests
import json

lead = record
BACKEND_URL = env['ir.config_parameter'].sudo().get_param(
    'saraswati.backend_url', 'https://your-api.saraswatitutorial.com'
)
SECRET = env['ir.config_parameter'].sudo().get_param(
    'saraswati.webhook_secret', 'saraswati_wh_secret_2024'
)

payload = {
    "leadId": lead.id,
    "broadcastType": "manual",
    "adminName": env.user.name,
}

try:
    response = requests.post(
        f"{BACKEND_URL}/api/broadcast-from-odoo",
        data=json.dumps(payload),
        headers={
            "Content-Type": "application/json",
            "X-Webhook-Secret": SECRET,
        },
        timeout=30,
    )
    response.raise_for_status()
    result = response.json()

    buckets = result.get("buckets", {})
    queued = result.get("queued", 0)
    skipped = result.get("alreadyQueued", 0)

    lead.message_post(
        body=(
            f"✅ <b>Broadcast Started for {result.get('requirementId', 'N/A')}</b><br/>"
            f"Queued: <b>{queued}</b> tutors | Already sent (skipped): {skipped}<br/>"
            f"📍 Exact: {buckets.get('exact', 0)} | "
            f"Nearby: {buckets.get('nearby', 0)} | "
            f"City: {buckets.get('city', 0)} | "
            f"Backup: {buckets.get('backup', 0)}"
        ),
        message_type="comment",
        subtype_xmlid="mail.mt_note",
    )

except requests.exceptions.Timeout:
    lead.message_post(
        body="⚠️ Broadcast: Request timed out. The broadcast may still be processing. Check the dashboard.",
        message_type="comment",
    )
except Exception as e:
    lead.message_post(
        body=f"❌ Broadcast failed: {str(e)}",
        message_type="comment",
    )
