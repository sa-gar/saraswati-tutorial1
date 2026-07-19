# ============================================================
# Odoo Server Action: Search Tutor
# ============================================================
# Model: crm.lead
# Action Type: Execute Python Code
# Name: Search Tutor (Saraswati)
# Trigger: Button on CRM Lead form view
#
# ⚠️  ODOO ONLINE (SaaS) USERS — DO NOT USE THIS FILE!
#     "Execute Python Code" with `import requests` fails on Odoo Online:
#       Validation Error: forbidden opcode(s): IMPORT_NAME
#     Use the "Send Webhook Notification" approach instead.
#     See: odoo_integration/webhook_actions/WEBHOOK_SETUP.md
#
# ✅  FOR ODOO SELF-HOSTED / ODOO.SH ONLY.
#
# HOW TO SET UP:
#   Settings → Technical → Actions → Server Actions → Create
#   Paste this code in the "Python Code" field.
# ============================================================

import requests
import json

lead = record  # current CRM lead record
BACKEND_URL = env['ir.config_parameter'].sudo().get_param(
    'saraswati.backend_url', 'https://your-api.saraswatitutorial.com'
)
SECRET = env['ir.config_parameter'].sudo().get_param(
    'saraswati.webhook_secret', 'saraswati_wh_secret_2024'
)

try:
    response = requests.get(
        f"{BACKEND_URL}/api/recommend-from-odoo",
        params={"leadId": lead.id},
        headers={
            "X-Webhook-Secret": SECRET,
            "Content-Type": "application/json",
        },
        timeout=25,
    )
    response.raise_for_status()
    data = response.json()

    recs = data.get("recommendations", {})
    lines = []
    for tier in ["exact", "nearby", "city", "backup"]:
        tutors = recs.get(tier, [])
        if not tutors:
            continue
        lines.append(f"<b>{tier.capitalize()} Match ({len(tutors)})</b>")
        for t in tutors[:5]:
            dist_str = f", {t.get('distanceKm', '?')} km" if t.get('distanceKm') is not None else ""
            lines.append(
                f"• {t['name']} — {t.get('matchPercentage', 0)}% match{dist_str} | {t.get('reason', '')}"
            )

    msg = "<br/>".join(lines) if lines else "No matching tutors found."
    req_id = data.get("lead", {}).get("requirementId", "N/A")
    lead.message_post(
        body=f"🔍 <b>Tutor Search Result for {req_id}</b><br/>{msg}",
        message_type="comment",
        subtype_xmlid="mail.mt_note",
    )

    # ── Option (a): Display filtered tutors in x_tutor (or x_master_tutors) ──
    tutor_codes = []
    for tier in ["exact", "nearby", "city", "backup"]:
        for t in recs.get(tier, []):
            if t.get("tutorCode"):
                tutor_codes.append(t["tutorCode"])

    tutor_ids = []
    res_model = "x_tutor"
    try:
        tutor_records = env["x_tutor"].search([
            "|", "|", "|",
            ("x_studio_tutor_id", "in", tutor_codes),
            ("x_studio_tutor_id_1", "in", tutor_codes),
            ("x_studio_tutor_id_2", "in", tutor_codes),
            ("x_studio_tutor_id_3", "in", tutor_codes)
        ])
        tutor_ids = tutor_records.ids
        res_model = "x_tutor"
    except Exception:
        try:
            tutor_records = env["x_master_tutors"].search([("x_tutor_id", "in", tutor_codes)])
            tutor_ids = tutor_records.ids
            res_model = "x_master_tutors"
        except Exception:
            pass

    action = {
        "type": "ir.actions.act_window",
        "name": f"Matching Tutors for {req_id}",
        "res_model": res_model,
        "view_mode": "tree,form",
        "domain": [("id", "in", tutor_ids)],
        "target": "current",
    }

except requests.exceptions.Timeout:
    lead.message_post(
        body="⚠️ Search Tutor: Request timed out. Please try again.",
        message_type="comment",
    )
except Exception as e:
    lead.message_post(
        body=f"❌ Search Tutor failed: {str(e)}",
        message_type="comment",
    )
