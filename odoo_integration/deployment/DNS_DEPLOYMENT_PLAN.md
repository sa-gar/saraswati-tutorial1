# GoDaddy DNS Configuration & Deployment Plan

This document details the configuration requirements, deployment steps, and verification procedures for setting up the GoDaddy DNS mapping for `odoo.saraswatitutorials.com` to point to the server IP `103.230.157.28`.

---

## 1. DNS Record Configuration details

Since direct access credentials to the GoDaddy DNS zone editor are not available, configure this record manually in the GoDaddy Domain Control Center:

| Field | Configuration Value | Note / Details |
|:---|:---|:---|
| **Type** | `A` (Address Record) | Points the subdomain to a static IPv4 address |
| **Host / Name** | `odoo` | Creates `odoo.saraswatitutorials.com` |
| **Points To (Value)**| `103.230.157.28` | Your production Odoo server destination |
| **TTL** | `600 seconds` (10 minutes) | Short TTL allows rapid propagation and quick rollback |

---

## 2. DNS Deployment Plan

### Current Record State
- **Subdomain**: `odoo.saraswatitutorials.com`
- **Current Status**: Does not resolve (NXDOMAIN) or points to no server.
- **Main Domain**: `saraswatitutorials.com` points to the primary production website server. (Will remain completely untouched).

### TTL Recommendation
- **Pre-deployment**: Set to **600 seconds** (10 minutes).
- **Post-propagation (Stable)**: Once verification is complete and stable for 48 hours, the TTL can be increased to **3600 seconds** (1 hour) or **14400 seconds** (4 hours) to reduce DNS queries and improve resolving speed.

### Rollback Plan
If routing issues occur, or the target Odoo server behaves unexpectedly:
1. Access the GoDaddy Domain Control Center.
2. Locate the `A` record for host `odoo`.
3. **Action**:
   - Option A: Delete the `A` record to disable the subdomain.
   - Option B: Repoint the `A` record to a maintenance page server IP (if available).
4. Since the initial TTL was set to 10 minutes, client caches will clear and follow the rollback within approximately 10 minutes.

### DNS Propagation Expectations
- **Local Propagation**: Usually occurs within 10 to 15 minutes due to the low TTL.
- **Global Propagation**: May take anywhere from 1 to 24 hours to replicate across all global public DNS resolvers (Cloudflare, Google, OpenDNS, local ISPs).

---

## 3. Verification & Validation Checklist

Perform the following verification checks after the record has been added:

### ✔ DNS Propagation Verification
Verify that the record is propagation-ready using a global DNS validation service:
- Run query on: [DNSChecker.org](https://dnschecker.org/#A/odoo.saraswatitutorials.com)
- Command line check:
  ```bash
  nslookup odoo.saraswatitutorials.com
  # or
  dig odoo.saraswatitutorials.com A +trace
  ```

### ✔ Correct IP Resolution
Confirm that the resolved IP address matches `103.230.157.28` exactly:
```bash
ping odoo.saraswatitutorials.com
# Response should indicate: Pinging odoo.saraswatitutorials.com [103.230.157.28]
```

### ✔ HTTPS Functionality
Verify that the SSL handshake is successful without any warnings:
- Open a web browser and navigate to `https://odoo.saraswatitutorials.com`.
- Inspect the SSL certificate to ensure it is valid, displays a secure lock icon, and Mixed Content warnings are absent in browser DevTools Console.

### ✔ Odoo Accessibility
Ensure the Odoo instance responds through the reverse proxy:
- Verify that the standard Odoo Login Page is fully rendered.
- Perform a test login to confirm full application functionality.
- Ensure the main website (`saraswatitutorials.com`) remains accessible and operates normally.
