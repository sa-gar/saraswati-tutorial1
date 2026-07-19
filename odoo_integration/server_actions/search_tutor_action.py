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

    # ── Collect tutor codes and phone numbers from ALL recommendation tiers ────
    # The recommendation engine returns tutors from MongoDB.  We need to match
    # them to Odoo records so we can open the Odoo list page showing exactly
    # those tutors.
    #
    # The backend API now resolves Odoo master-tutor IDs for us (odooIds /
    # odooModel fields in the response).  If those are present, use them
    # directly — this is the fastest, most accurate path.
    #
    # If the backend is an older version that doesn't include odooIds, fall
    # back to a local two-model lookup using tutor codes and phone numbers.

    def norm_phone(raw):
        """Strip non-digits, return last 10 (Indian mobile format)."""
        digits = "".join(c for c in str(raw or "") if c.isdigit())
        return digits[-10:] if len(digits) >= 10 else digits

    # ── Primary path: use pre-resolved Odoo IDs from the API ──────────────────
    api_odoo_ids   = data.get("odooIds",   [])
    api_odoo_model = data.get("odooModel", "x_master_tutors")

    if api_odoo_ids:
        found_ids   = list(api_odoo_ids)
        found_model = api_odoo_model

    else:
        # ── Fallback path: local Odoo ORM lookup ──────────────────────────────
        tutor_codes = []
        raw_phones  = []

        for tier in ["exact", "nearby", "city", "backup"]:
            for t in recs.get(tier, []):
                code = (t.get("tutorCode") or "").strip()
                if code:
                    tutor_codes.append(code)
                phone = (t.get("phone") or "").strip()
                if phone:
                    raw_phones.append(phone)
                wa = (t.get("whatsapp") or "").strip()
                if wa and wa != phone:
                    raw_phones.append(wa)

        tutor_codes = list(dict.fromkeys(tutor_codes))
        norm_phones = list(dict.fromkeys(norm_phone(p) for p in raw_phones if p))

        found_ids   = []
        found_model = "x_master_tutors"

        try:
            # ── Strategy 1: x_master_tutors ───────────────────────────────────
            # Written by upsertMasterTutor() on tutor registration.
            # Fields: x_tutor_id (code), x_mobile, x_whatsapp
            found_master = env["x_master_tutors"].browse()

            if tutor_codes:
                found_master = env["x_master_tutors"].search(
                    [("x_tutor_id", "in", tutor_codes)]
                )

            if norm_phones:
                # Odoo OR domain: N-1 "|"-prefixes before N leaf conditions
                # Each phone generates 2 leaves (mobile + whatsapp)
                mt_leaves = []
                for np in norm_phones:
                    mt_leaves.append(("x_mobile",   "like", np))
                    mt_leaves.append(("x_whatsapp", "like", np))
                phone_domain = ["|"] * (len(mt_leaves) - 1) + mt_leaves
                phone_matches = env["x_master_tutors"].search(phone_domain)
                found_master  = found_master | phone_matches

            if found_master:
                found_ids   = found_master.ids
                found_model = "x_master_tutors"

            # ── Strategy 2: x_tutor (Studio model, fallback) ──────────────────
            # Only 1 live record (TUT-001) as of last inspection, but kept as
            # a safety net in case more records are added in future.
            if not found_ids:
                found_xt = env["x_tutor"].browse()

                if tutor_codes:
                    found_xt = env["x_tutor"].search(
                        [("x_studio_tutor_id_4", "in", tutor_codes)]
                    )

                if not found_xt and norm_phones:
                    # Odoo OR domain: N-1 "|"-prefixes before N leaf conditions
                    xt_leaves = []
                    for np in norm_phones:
                        xt_leaves.append(("x_studio_mobile_number_3",   "like", np))
                        xt_leaves.append(("x_studio_whatsapp_number_2", "like", np))
                    phone_domain_xt = ["|"] * (len(xt_leaves) - 1) + xt_leaves
                    found_xt = env["x_tutor"].search(phone_domain_xt)

                if found_xt:
                    found_ids   = found_xt.ids
                    found_model = "x_tutor"

        except Exception as lookup_err:
            lead.message_post(
                body=f"⚠️ Matching Tutors lookup failed: {str(lookup_err)}",
                message_type="comment",
                subtype_xmlid="mail.mt_note",
            )

    # ── Debug note so admin can see what was matched ───────────────────────────
    debug_parts = [
        f"🔎 <b>Tutor Lookup</b>",
        f"API returned odooIds: {api_odoo_ids or '(none — fallback used)'}",
        f"Model used: <b>{found_model}</b>",
        f"Final Odoo IDs: {found_ids or '(none — page will be empty)'}",
    ]
    lead.message_post(
        body="<br/>".join(debug_parts),
        message_type="comment",
        subtype_xmlid="mail.mt_note",
    )

    # ── Return the Window Action ──────────────────────────────────────────────
    # Domain filters to exactly the matched records.  If found_ids is empty
    # (no Odoo records for the recommended tutors) the page shows nothing —
    # the debug note in the chatter explains why.
    action = {
        "type": "ir.actions.act_window",
        "name": f"Matching Tutors — {req_id}",
        "res_model": found_model,
        "view_mode": "list,form",
        "domain": [("id", "in", found_ids)] if found_ids else [("id", "=", False)],
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
