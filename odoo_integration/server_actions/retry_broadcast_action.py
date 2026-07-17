# ============================================================
# Odoo Server Action: Retry Broadcast
# ============================================================
# Model: crm.lead
# Action Type: Execute Python Code
# Name: Retry Broadcast (Saraswati)
# Trigger: Button on CRM Lead form view
# Use when: Previous broadcast had failures and you want to retry
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

# Force=True bypasses deduplication — re-broadcasts to all matched tutors
payload = {
    "leadId": lead.id,
    "broadcastType": "retry",
    "adminName": env.user.name,
    "force": True,
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

    lead.message_post(
        body=(
            f"🔄 <b>Retry Broadcast for {result.get('requirementId', 'N/A')}</b><br/>"
            f"Re-queued: <b>{result.get('queued', 0)}</b> tutors (force=True, dedup bypassed)"
        ),
        message_type="comment",
        subtype_xmlid="mail.mt_note",
    )

except Exception as e:
    lead.message_post(
        body=f"❌ Retry Broadcast failed: {str(e)}",
        message_type="comment",
    )
