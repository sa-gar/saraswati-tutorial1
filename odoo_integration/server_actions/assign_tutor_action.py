# ============================================================
# Odoo Server Action: Assign Tutor
# ============================================================
# Model: crm.lead
# Action Type: Execute Python Code
# Name: Assign Tutor (Saraswati)
# Trigger: Button on CRM Lead form view
#
# REQUIRES: x_studio_assigned_tutor_phone field on the lead
#           set by admin before clicking this button.
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

# Get tutor phone from the lead's custom field
tutor_phone = getattr(lead, 'x_studio_assigned_tutor_phone', None) or lead.phone

if not tutor_phone:
    lead.message_post(
        body="⚠️ Assign Tutor: Please set the assigned tutor phone number first.",
        message_type="comment",
    )
    raise UserError("Set x_studio_assigned_tutor_phone before assigning.")

payload = {
    "odooLeadId": lead.id,
    "tutorPhone": tutor_phone,
    "demoDate": str(getattr(lead, 'x_studio_demo_date', '') or ''),
    "demoTime": str(getattr(lead, 'x_studio_demo_time', '') or ''),
    "adminName": env.user.name,
}

try:
    response = requests.post(
        f"{BACKEND_URL}/api/assign-tutor-from-odoo",
        data=json.dumps(payload),
        headers={
            "Content-Type": "application/json",
            "X-Webhook-Secret": SECRET,
        },
        timeout=20,
    )
    response.raise_for_status()
    result = response.json()

    lead.message_post(
        body=(
            f"🎉 <b>Tutor Assigned: {result.get('tutorName', 'N/A')}</b><br/>"
            f"Parent details WhatsApp sent: {'✅' if result.get('parentDetailsSent') else '❌'}"
        ),
        message_type="comment",
        subtype_xmlid="mail.mt_note",
    )

except Exception as e:
    lead.message_post(
        body=f"❌ Assign Tutor failed: {str(e)}",
        message_type="comment",
    )
