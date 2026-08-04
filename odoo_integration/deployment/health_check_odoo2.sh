#!/bin/bash
# ==========================================================================
# Health Check Script: odoo2.saraswatitutorials.com
# Run on the VPS after deployment to verify all components are healthy.
# Usage: chmod +x health_check_odoo2.sh && ./health_check_odoo2.sh
# ==========================================================================

SUBDOMAIN="odoo2.saraswatitutorials.com"
PROD_ODOO="odoo.saraswatitutorials.com"
SERVER_IP="103.230.157.28"
PORT=8070
LONG_PORT=8072
PASS=0
FAIL=0

GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[0;33m"
RESET="\033[0m"

pass() { echo -e "${GREEN}✅ PASS${RESET} — $1"; ((PASS++)); }
fail() { echo -e "${RED}❌ FAIL${RESET} — $1"; ((FAIL++)); }
info() { echo -e "${YELLOW}ℹ  INFO${RESET} — $1"; }

echo ""
echo "══════════════════════════════════════════════════════════════"
echo "  Health Check: $SUBDOMAIN"
echo "  Server IP:    $SERVER_IP"
echo "  Date:         $(date)"
echo "══════════════════════════════════════════════════════════════"
echo ""

# ── 1. DNS Resolution ─────────────────────────────────────────────────────
echo "[ 1/8 ] DNS Resolution"
RESOLVED=$(dig +short "$SUBDOMAIN" A 2>/dev/null | head -1)
if [ "$RESOLVED" = "$SERVER_IP" ]; then
    pass "DNS resolves to $SERVER_IP"
else
    fail "Expected $SERVER_IP, got: '${RESOLVED:-NXDOMAIN}'"
    info "Ensure the GoDaddy A record (host: odoo2, value: $SERVER_IP) has been added and propagated."
fi
echo ""

# ── 2. Old Odoo Port 8070 ────────────────────────────────────────────────
echo "[ 2/8 ] Old Odoo Main Port ($PORT)"
if ss -tlnp 2>/dev/null | grep -q ":$PORT"; then
    pass "Port $PORT is listening"
else
    fail "Port $PORT is NOT listening"
    info "Start the old Odoo instance: sudo systemctl start odoo2 (or your service name)"
fi
echo ""

# ── 3. Old Odoo Longpolling Port 8072 ────────────────────────────────────
echo "[ 3/8 ] Old Odoo Longpolling Port ($LONG_PORT)"
if ss -tlnp 2>/dev/null | grep -q ":$LONG_PORT"; then
    pass "Port $LONG_PORT (longpolling) is listening"
else
    fail "Port $LONG_PORT (longpolling) is NOT listening"
    info "Longpolling is required for real-time Odoo chat/notifications. Check old Odoo config."
fi
echo ""

# ── 4. HTTP → HTTPS Redirect ─────────────────────────────────────────────
echo "[ 4/8 ] HTTP → HTTPS Redirect"
CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "http://$SUBDOMAIN/" 2>/dev/null)
if [ "$CODE" = "301" ] || [ "$CODE" = "302" ]; then
    pass "HTTP redirects to HTTPS (HTTP $CODE)"
else
    fail "Expected 301/302, got: $CODE"
    info "Check the HTTP server block in /etc/nginx/sites-enabled/odoo2.saraswatitutorials.com.conf"
fi
echo ""

# ── 5. HTTPS Response ────────────────────────────────────────────────────
echo "[ 5/8 ] HTTPS Response from Old Odoo"
CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 "https://$SUBDOMAIN/web/login" 2>/dev/null)
if [ "$CODE" = "200" ]; then
    pass "HTTPS returns 200 OK — Odoo login page is accessible"
elif [ "$CODE" = "303" ] || [ "$CODE" = "302" ]; then
    pass "HTTPS returns $CODE (redirect to login — acceptable)"
else
    fail "Expected 200, got: $CODE"
    info "Check Nginx error log: sudo tail -50 /var/log/nginx/odoo2.error.log"
fi
echo ""

# ── 6. SSL Certificate ───────────────────────────────────────────────────
echo "[ 6/8 ] SSL Certificate Validity"
EXPIRY=$(echo | openssl s_client -connect "$SUBDOMAIN:443" -servername "$SUBDOMAIN" 2>/dev/null \
    | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)
if [ -n "$EXPIRY" ]; then
    pass "SSL certificate valid — expires: $EXPIRY"
else
    fail "Could not retrieve SSL certificate"
    info "Run: sudo certbot --nginx -d $SUBDOMAIN"
fi
echo ""

# ── 7. Production Odoo Isolation Check ───────────────────────────────────
echo "[ 7/8 ] Production Odoo Isolation (odoo.$PROD_ODOO)"
CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "https://$PROD_ODOO/" 2>/dev/null)
if [ "$CODE" = "200" ] || [ "$CODE" = "301" ] || [ "$CODE" = "302" ]; then
    pass "Production Odoo ($PROD_ODOO) still accessible — no conflict ($CODE)"
else
    fail "Production Odoo returned unexpected status: $CODE"
    info "Check /etc/nginx/sites-enabled/ to ensure the odoo.saraswatitutorials.com config is intact"
fi
echo ""

# ── 8. PostgreSQL ────────────────────────────────────────────────────────
echo "[ 8/8 ] PostgreSQL Service"
if systemctl is-active --quiet postgresql 2>/dev/null; then
    pass "PostgreSQL is running"
else
    fail "PostgreSQL is NOT running"
    info "Start it: sudo systemctl start postgresql && sudo systemctl enable postgresql"
fi
echo ""

# ── Summary ──────────────────────────────────────────────────────────────
echo "══════════════════════════════════════════════════════════════"
TOTAL=$((PASS + FAIL))
echo -e "  Results: ${GREEN}$PASS passed${RESET} / ${RED}$FAIL failed${RESET} out of $TOTAL checks"
echo "══════════════════════════════════════════════════════════════"

if [ "$FAIL" -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All checks passed. Deployment is healthy.${RESET}\n"
    exit 0
else
    echo -e "\n${RED}⚠  $FAIL check(s) failed. Review the items above.${RESET}\n"
    echo "Quick debug commands:"
    echo "  sudo nginx -t"
    echo "  sudo tail -50 /var/log/nginx/odoo2.error.log"
    echo "  sudo systemctl status odoo2"
    echo "  sudo systemctl status postgresql"
    echo ""
    exit 1
fi
