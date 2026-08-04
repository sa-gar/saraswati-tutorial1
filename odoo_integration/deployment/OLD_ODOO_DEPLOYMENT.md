# Old Odoo Subdomain Deployment Guide
## `odoo2.saraswatitutorials.com` → Self-Hosted Odoo on Port 8070

**Server IP:** `103.230.157.28`
**Target instance:** Old Odoo, running locally on `127.0.0.1:8070`
**Production Odoo (unchanged):** `odoo.saraswatitutorials.com` → `saraswati-tutorials.odoo.com`

> [!IMPORTANT]
> This guide covers **every** step needed to deploy the new subdomain from scratch.
> Steps are designed to be executed in order. Do not skip steps.

---

## Pre-Deployment Checklist

Before starting, verify these on the VPS:

```bash
# 1. Confirm old Odoo is actually running on port 8070
ss -tlnp | grep 8070
# Expected: LISTEN  0  128  127.0.0.1:8070  ...

# 2. Confirm the longpolling port (usually main+2 = 8072)
ss -tlnp | grep 8072

# 3. Confirm Nginx is installed and running
nginx -v
sudo systemctl status nginx

# 4. Confirm Certbot is installed
certbot --version

# 5. Confirm PostgreSQL is running
sudo systemctl status postgresql
```

---

## STEP 1 — GoDaddy DNS: Add A Record

Login to [GoDaddy Domain Control Center](https://dcc.godaddy.com) → DNS → Manage Zones → `saraswatitutorials.com`

Add the following record:

| Field | Value |
|-------|-------|
| **Type** | `A` |
| **Host / Name** | `odoo2` |
| **Points To** | `103.230.157.28` |
| **TTL** | `600 seconds` (10 minutes — allows fast rollback) |

> [!NOTE]
> The main domain `saraswatitutorials.com` and `odoo.saraswatitutorials.com` records remain **completely untouched**.

### DNS Propagation
- Local/regional: 10–15 minutes (low TTL)
- Global: up to 24 hours

### Verify DNS (run after 10–15 minutes)
```bash
nslookup odoo2.saraswatitutorials.com
# Expected: Address: 103.230.157.28

dig odoo2.saraswatitutorials.com A +short
# Expected: 103.230.157.28
```

---

## STEP 2 — Upload Nginx Config to the VPS

From your **local machine** (Windows), copy `odoo2_nginx.conf` to the VPS:

```bash
# Using SCP (replace /path/to/ with actual path if needed)
scp "odoo_integration/deployment/odoo2_nginx.conf" root@103.230.157.28:/etc/nginx/sites-available/odoo2.saraswatitutorials.com.conf
```

Or copy the file content manually via your VPS SSH session:

```bash
# On the VPS — create the file
sudo nano /etc/nginx/sites-available/odoo2.saraswatitutorials.com.conf
# Paste the contents of odoo2_nginx.conf, then Ctrl+X → Y → Enter
```

---

## STEP 3 — Enable the Nginx Virtual Host

```bash
# Create a symlink to activate the site
sudo ln -s /etc/nginx/sites-available/odoo2.saraswatitutorials.com.conf \
           /etc/nginx/sites-enabled/odoo2.saraswatitutorials.com.conf

# Verify the symlink was created
ls -la /etc/nginx/sites-enabled/ | grep odoo2
```

---

## STEP 4 — Verify Firewall (Ports 80 & 443)

The firewall should already be open from the `odoo.saraswatitutorials.com` deployment. Confirm:

```bash
# UFW (Ubuntu/Debian)
sudo ufw status verbose | grep -E "80|443|Nginx"
# Expected: Nginx Full  ALLOW IN  Anywhere

# If not already open:
sudo ufw allow 'Nginx Full'
sudo ufw reload
```

> [!NOTE]
> Port `8070` does **NOT** need to be open externally — Nginx talks to it internally via `127.0.0.1:8070`.

---

## STEP 5 — Test Nginx Configuration

**Always do this before reloading Nginx to avoid taking down production.**

```bash
sudo nginx -t
# Expected output:
#   nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
#   nginx: configuration file /etc/nginx/nginx.conf test is successful
```

If the test fails, fix the config before proceeding. **Do not reload Nginx with a failing config.**

---

## STEP 6 — Obtain SSL Certificate (Let's Encrypt)

> [!IMPORTANT]
> DNS must have propagated (Step 1) before running Certbot, or it will fail.
> Verify with `nslookup odoo2.saraswatitutorials.com` first.

```bash
# Provision SSL certificate for the new subdomain only
sudo certbot --nginx -d odoo2.saraswatitutorials.com
```

Certbot will:
1. Detect the Nginx virtual host for `odoo2.saraswatitutorials.com`
2. Request a certificate from Let's Encrypt
3. Write the cert paths into the Nginx config automatically
4. Offer to redirect HTTP → HTTPS (select **Yes**)

### Verify Auto-Renewal (dry run)
```bash
sudo certbot renew --dry-run
# Expected: "Congratulations, all renewals succeeded."
```

---

## STEP 7 — Reload Nginx

```bash
# Final syntax check
sudo nginx -t

# Reload (zero-downtime — does NOT restart Nginx, only reloads config)
sudo systemctl reload nginx

# Verify Nginx is still healthy
sudo systemctl status nginx
```

---

## STEP 8 — Verify Old Odoo Service

Confirm the old Odoo instance is running and healthy:

```bash
# If managed by systemd (common name — adjust if different)
sudo systemctl status odoo2
# OR
sudo systemctl status odoo-old

# If running as a background process
ps aux | grep "8070"
# Expected: python3 odoo-bin ... --xmlrpc-port=8070

# Direct local HTTP check
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8070/web/login
# Expected: 200
```

---

## STEP 9 — Verify PostgreSQL

Ensure the old Odoo's database is accessible:

```bash
# List all PostgreSQL databases
sudo -u postgres psql -c "\l"
# Confirm the old Odoo database name appears in the list

# Check PostgreSQL is listening
sudo systemctl status postgresql

# Confirm the old Odoo user can connect
sudo -u postgres psql -c "\du"
```

---

## STEP 10 — Full Post-Deployment Validation

Run all 8 checks in sequence:

### ✔ Check 1: DNS Resolution
```bash
nslookup odoo2.saraswatitutorials.com
# → Address: 103.230.157.28
```

### ✔ Check 2: Port Accessibility
```bash
ss -tlnp | grep 8070
# → LISTEN 0 128 127.0.0.1:8070
```

### ✔ Check 3: HTTPS Response
```bash
curl -I https://odoo2.saraswatitutorials.com
# → HTTP/2 200
# → server: nginx
```

### ✔ Check 4: SSL Certificate Validity
```bash
echo | openssl s_client -connect odoo2.saraswatitutorials.com:443 -servername odoo2.saraswatitutorials.com 2>/dev/null | openssl x509 -noout -dates
# → notAfter= should be 90 days from today
```

### ✔ Check 5: Old Odoo Login Page Loads
Open in browser: `https://odoo2.saraswatitutorials.com/web/login`
- Verify the Odoo login form renders without errors
- Check browser console for mixed-content warnings (should be none)

### ✔ Check 6: Old Odoo Functional Login
Log in with the old Odoo admin credentials and verify:
- CRM module loads
- Records are visible
- No database connection errors

### ✔ Check 7: Production Odoo Still Accessible (No Conflict)
```bash
curl -I https://odoo.saraswatitutorials.com
# → HTTP/2 200  (still healthy)
```
Open `https://odoo.saraswatitutorials.com` in browser — confirm it works normally.

### ✔ Check 8: Main Website Still Accessible
```bash
curl -I https://saraswatitutorials.com
# → HTTP/2 200  (still healthy)
```

---

## Rollback Plan

If issues occur at any step:

### Rollback Option A — Disable the Nginx virtual host
```bash
sudo rm /etc/nginx/sites-enabled/odoo2.saraswatitutorials.com.conf
sudo nginx -t && sudo systemctl reload nginx
```
This immediately stops routing traffic to the old Odoo without touching DNS.

### Rollback Option B — Remove DNS record
1. Log into GoDaddy Domain Control Center
2. Find the `A` record with Host `odoo2`
3. Delete it
4. Due to TTL of 600s, propagation clears within ~10 minutes

### Rollback Option C — Full revert (both above)
Execute Rollback A + Rollback B simultaneously for immediate, clean isolation.

> [!CAUTION]
> Removing the DNS record alone does not immediately stop existing connections — also run Rollback A to be safe.

---

## Automatic Restart Configuration

Ensure the old Odoo instance restarts automatically after a server reboot:

```bash
# Check if it is already enabled
sudo systemctl is-enabled odoo2   # or the actual service name

# If not enabled, enable it
sudo systemctl enable odoo2

# Test: simulate a restart
sudo systemctl restart odoo2
sudo systemctl status odoo2
# → Active: active (running)
```

If the old Odoo is not managed by systemd, create a service unit:

```bash
sudo nano /etc/systemd/system/odoo2.service
```

Template:
```ini
[Unit]
Description=Old Odoo 2 Instance (Port 8070)
After=network.target postgresql.service
Requires=postgresql.service

[Service]
Type=simple
User=odoo
ExecStart=/usr/bin/python3 /opt/odoo2/odoo-bin \
    --config=/etc/odoo2.conf \
    --xmlrpc-port=8070 \
    --longpolling-port=8072
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable odoo2
sudo systemctl start odoo2
```

---

## Health Check Script

Save this as `odoo_integration/deployment/health_check_odoo2.sh` and run it on the VPS anytime:

```bash
#!/bin/bash
# Health check for odoo2.saraswatitutorials.com

SUBDOMAIN="odoo2.saraswatitutorials.com"
SERVER_IP="103.230.157.28"
PORT=8070

echo "=============================================="
echo "  Health Check: $SUBDOMAIN"
echo "  $(date)"
echo "=============================================="

# 1. DNS
echo -n "[DNS]       Resolves to $SERVER_IP?  "
RESOLVED=$(dig +short $SUBDOMAIN A | head -1)
[ "$RESOLVED" = "$SERVER_IP" ] && echo "✅ PASS ($RESOLVED)" || echo "❌ FAIL (got: $RESOLVED)"

# 2. Port
echo -n "[PORT]      $PORT listening?           "
ss -tlnp | grep -q ":$PORT" && echo "✅ PASS" || echo "❌ FAIL"

# 3. HTTP → HTTPS redirect
echo -n "[REDIRECT]  HTTP redirects to HTTPS?  "
CODE=$(curl -s -o /dev/null -w "%{http_code}" http://$SUBDOMAIN/)
[ "$CODE" = "301" ] && echo "✅ PASS (301)" || echo "❌ FAIL (got: $CODE)"

# 4. HTTPS response
echo -n "[HTTPS]     Returns 200?               "
CODE=$(curl -s -o /dev/null -w "%{http_code}" https://$SUBDOMAIN/web/login)
[ "$CODE" = "200" ] && echo "✅ PASS" || echo "❌ FAIL (got: $CODE)"

# 5. SSL cert expiry
echo -n "[SSL]       Certificate valid?         "
EXPIRY=$(echo | openssl s_client -connect $SUBDOMAIN:443 -servername $SUBDOMAIN 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)
[ -n "$EXPIRY" ] && echo "✅ PASS (expires: $EXPIRY)" || echo "❌ FAIL"

# 6. Nginx
echo -n "[NGINX]     Service running?           "
systemctl is-active --quiet nginx && echo "✅ PASS" || echo "❌ FAIL"

# 7. PostgreSQL
echo -n "[POSTGRES]  Service running?           "
systemctl is-active --quiet postgresql && echo "✅ PASS" || echo "❌ FAIL"

# 8. Production Odoo not affected
echo -n "[PROD ODOO] odoo.saraswatitutorials.com still up? "
CODE=$(curl -s -o /dev/null -w "%{http_code}" https://odoo.saraswatitutorials.com/ 2>/dev/null)
[ "$CODE" = "200" ] || [ "$CODE" = "301" ] || [ "$CODE" = "302" ] && echo "✅ PASS ($CODE)" || echo "❌ FAIL (got: $CODE)"

echo "=============================================="
```

Make it executable and run:
```bash
chmod +x odoo_integration/deployment/health_check_odoo2.sh
./odoo_integration/deployment/health_check_odoo2.sh
```

---

## Known Limitations

| Limitation | Details |
|---|---|
| **No direct VPS access** | All configs were prepared locally. Manual deployment required. |
| **Longpolling port assumption** | Port `8072` assumed. If the old instance uses a custom longpolling port, update `upstream odoo2_longpolling` in `odoo2_nginx.conf`. |
| **No GoDaddy API access** | DNS `A` record must be added manually via the GoDaddy web console. |
| **Shared PostgreSQL** | The old and production Odoo share the PostgreSQL server. A PostgreSQL crash would affect both. Consider scheduled `pg_dump` backups. |
| **SSL cert independence** | The new cert (`odoo2.*`) is fully independent from `odoo.*` — expiry of one does not affect the other. |

---

## Existing Architecture: Before & After

```
BEFORE
──────
saraswatitutorials.com           → Main Website (VPS)
odoo.saraswatitutorials.com      → Nginx → saraswati-tutorials.odoo.com (SaaS)

AFTER
─────
saraswatitutorials.com           → Main Website (VPS)        [UNCHANGED]
odoo.saraswatitutorials.com      → Nginx → SaaS Odoo         [UNCHANGED]
odoo2.saraswatitutorials.com     → Nginx → 127.0.0.1:8070   [NEW]
```

No changes to the production Odoo route, backend `.env`, or Node.js server.
