# Production Subdomain Deployment Guide: odoo.saraswatitutorials.com

This document provides step-by-step instructions to configure, deploy, and verify the dedicated production subdomain for Odoo without affecting the primary production website.

---

## 1. Domain & DNS Configuration (Registrar Side)

Since we do not have direct access to your DNS registrar (GoDaddy, Cloudflare, etc.), you must add the following DNS record manually:

### Scenario A: Odoo is hosted on Odoo Online / Odoo.sh (Recommended SaaS Setup)
Create a CNAME record to point your custom subdomain directly to Odoo's SaaS servers:

| Type  | Host / Name | Value / Target | TTL |
|-------|-------------|----------------|-----|
| CNAME | `odoo` | `saraswati-tutorials.odoo.com` | Automatic / 1 Hour |

*Note: After adding the DNS record, you must go to **Settings → General Settings → Custom Domain** inside your Odoo database dashboard and bind `odoo.saraswatitutorials.com` to complete the SSL handshakes on the Odoo SaaS platform.*

### Scenario B: Odoo is hosted on a Self-Managed Virtual Private Server (VPS)
If you are running a self-hosted Odoo instance (port `8069`), point the subdomain to your server's public IP address:

| Type  | Host / Name | Value / Target | TTL |
|-------|-------------|----------------|-----|
| A     | `odoo`      | `YOUR_VPS_PUBLIC_IP` | Automatic / 1 Hour |

---

## 2. Server Configuration & Nginx Reverse Proxy Setup
For self-hosted instances (Scenario B), configure Nginx to act as a secure reverse proxy using the provided configuration template:

### Step 1: Copy Nginx Config to the Server
Move the `odoo_nginx.conf` file to the Nginx configurations directory:
```bash
sudo cp odoo_nginx.conf /etc/nginx/sites-available/odoo.saraswatitutorials.com.conf
```

### Step 2: Enable the Virtual Host Configuration
Create a symbolic link to activate the site configuration:
```bash
sudo ln -s /etc/nginx/sites-available/odoo.saraswatitutorials.com.conf /etc/nginx/sites-enabled/
```

### Step 3: Configure Firewall (Ports 80 & 443)
Ensure your system firewall allows standard HTTP/HTTPS traffic:
- **UFW (Ubuntu/Debian)**:
  ```bash
  sudo ufw allow 'Nginx Full'
  ```
- **AWS / GCP / Cloud Security Groups**:
  Open inbound TCP ports `80` (HTTP) and `443` (HTTPS) for `0.0.0.0/0`.

---

## 3. SSL / HTTPS Certificate Installation (Let's Encrypt)

To secure the subdomain connection and prevent mixed-content warnings:

### Step 1: Install Certbot & Nginx Plugin
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
```

### Step 2: Request & Install SSL Certificates
Run Certbot to automatically scan Nginx virtual hosts, request certificates from Let's Encrypt, and install them:
```bash
sudo certbot --nginx -d odoo.saraswatitutorials.com
```

### Step 3: Test Certificate Auto-Renewal
Let's Encrypt certificates are valid for 90 days. Test the automated dry-run cron system:
```bash
sudo certbot renew --dry-run
```

### Step 4: Verify Nginx Syntax and Restart
Verify Nginx syntax before restarting the service to ensure zero downtime on existing sites:
```bash
sudo nginx -t
# Output should show: syntax is ok, test is successful
sudo systemctl restart nginx
```

---

## 4. Node.js Backend Integration Update

Once the subdomain is live and HTTPS is active:

1. Open the backend configuration file: `backend/.env`
2. Update the `ODOO_URL` parameter to point to the new custom subdomain:
   ```env
   # Old: ODOO_URL=https://saraswati-tutorials.odoo.com
   # New Custom Production Subdomain:
   ODOO_URL=https://odoo.saraswatitutorials.com
   ```
3. Restart your Node.js backend server instance to apply changes:
   ```bash
   npm run start
   ```

---

## 5. Post-Deployment Verification Checklist

Run these validation tests to ensure the setup is healthy:

### 1. DNS Resolution Test
Ensure the new subdomain correctly maps to your IP/Odoo SaaS host:
```bash
nslookup odoo.saraswatitutorials.com
# OR
ping odoo.saraswatitutorials.com
```

### 2. HTTPS Certificate Validation
Open `https://odoo.saraswatitutorials.com` in a browser. Verify:
- The lock icon is present.
- Clicking the lock shows "Connection secure" with a certificate issued by Let's Encrypt.

### 3. Authentication & JSON-RPC Access
Ensure the Node.js Broadcast System successfully authenticates via the reverse proxy:
```bash
# Check backend server console log for successful connection to Odoo URL
# Verify that WhatsApp Broadcasts and automated searches work seamlessly
```

### 4. Main Website Integrity
Confirm that `https://saraswatitutorials.com` remains unaffected and runs normally without errors or downtime.
