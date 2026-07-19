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

# ── Odoo Server Action globals ─────────────────────────────────────────────────
# These names are injected by Odoo at runtime into every "Execute Python Code"
# Server Action context.  They are NOT importable — declaring them here only
# satisfies static-analysis tools (Pylance / Pyright / Ruff F821).
# At runtime the try/except block below is never reached.
# See: https://www.odoo.com/documentation/17.0/developer/reference/backend/actions.html#python-code
try:
    env    = env     # noqa: F821  # Odoo ORM environment (models, config, …)
    record = record  # noqa: F821  # current crm.lead record
except NameError:
    # Running outside Odoo (e.g. linter, unit-test).
    # Define harmless stubs so the file can be parsed without errors.
    env    = None  # type: ignore[assignment]
    record = None  # type: ignore[assignment]
# ──────────────────────────────────────────────────────────────────────────────

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

    # ── Display filtered tutors from x_tutor (read-only — NO create/write/unlink) ──
    # Field confirmed by live inspection of master x_tutor records:
    #   x_studio_tutor_id_4  → the actual Tutor Code field (e.g. "TUT-001")
    #   x_studio_tutor_id, x_studio_tutor_id_1/2/3 → always false in real records
    # Phone fields confirmed: x_studio_mobile_number_3, x_studio_whatsapp_number_2
    tutor_codes = []
    tutor_phones = []
    for tier in ["exact", "nearby", "city", "backup"]:
        for t in recs.get(tier, []):
            if t.get("tutorCode"):
                tutor_codes.append(t["tutorCode"])
            if t.get("phone"):
                tutor_phones.append(str(t["phone"]).strip())
            if t.get("whatsapp") and t.get("whatsapp") != t.get("phone"):
                tutor_phones.append(str(t["whatsapp"]).strip())

    tutor_ids = []
    res_model = "x_tutor"

    try:
        found = env["x_tutor"]

        # Primary search: by tutor code in the confirmed correct field
        if tutor_codes:
            found = env["x_tutor"].search([("x_studio_tutor_id_4", "in", tutor_codes)])

        # Fallback: match by phone/WhatsApp if code lookup returns nothing
        if not found and tutor_phones:
            found = env["x_tutor"].search([
                "|",
                ("x_studio_mobile_number_3", "in", tutor_phones),
                ("x_studio_whatsapp_number_2", "in", tutor_phones),
            ])

        tutor_ids = found.ids
        res_model = "x_tutor"

    except Exception as lookup_err:
        lead.message_post(
            body=f"⚠️ Matching Tutors lookup failed: {str(lookup_err)}",
            message_type="comment",
            subtype_xmlid="mail.mt_note",
        )

    action = {
        "type": "ir.actions.act_window",
        "name": f"Matching Tutors — {req_id}",
        "res_model": res_model,
        "view_mode": "list,form",
        "domain": [("id", "in", tutor_ids)] if tutor_ids else [("id", "=", False)],
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
