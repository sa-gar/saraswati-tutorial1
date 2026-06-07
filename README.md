# Saraswati Tutorial

Welcome to the Saraswati Tutorial platform. This repository contains the source code for the main website, administrator controls, blog editors, and the specialized **Services Division subdomain** setup.

---

## Project Structure

The project is structured as a monorepo containing:
- **`frontend/`**: Built with React (v18), Vite, Tailwind CSS (v4), and Framer Motion.
- **`backend/`**: Built with Node.js, Express, MongoDB (Mongoose), Cloudinary for media uploads, and Odoo CRM integration.

---

## Getting Started

### Prerequisites
Make sure you have Node.js (v18+) and npm installed on your system.

### Local Development

1. **Start Backend Server**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   The backend server will launch at `http://localhost:5000` and automatically connect to MongoDB.

2. **Start Frontend Dev Server**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   The frontend Vite server will launch at `http://localhost:5173`.
   - To test the **main website**, visit: `http://localhost:5173/`
   - To test the **Services subdomain**, visit: `http://services.localhost:5173/`

---

## Core Fixes & Features Implemented

### 1. Centralized Environment Routing
- Frontend uses [config.js](file:///c:/Users/niles/OneDrive/Desktop/saraswati%20tutorial/saraswati-tutorial1/frontend/src/config.js) to dynamically resolve the API base address depending on where the application is running:
  - **Local Development**: Routes traffic to `http://localhost:5000/api`.
  - **Production Deployment**: Routes traffic to the Render backend at `https://saraswati-tutorial1-2.onrender.com/api`.
- All page components import `API_BASE` from this central file.

### 2. PDF Document Uploads
- Backend upload processor at [uploadRoutes.js](file:///c:/Users/niles/OneDrive/Desktop/saraswati%20tutorial/saraswati-tutorial1/backend/routes/uploadRoutes.js) now supports both image and PDF formats (`application/pdf`) for document verification.
- Frontend [TutorRegistration.jsx](file:///c:/Users/niles/OneDrive/Desktop/saraswati%20tutorial/saraswati-tutorial1/frontend/src/pages/TutorRegistration.jsx) accepts PDFs under ID Proof, Education Certificates, and Appraisal Documents.

### 3. Subdomain Routing (`services.domain.com`)
- The app detects the `services.` prefix dynamically. On the Services Subdomain:
  - Hides physical storefront addresses and Google Maps embeds.
  - Dynamically swaps footer contact numbers to the service phone (`+91 9041157689`) and service email (`services@saraswatitutorial.com`).
  - Swaps the floating WhatsApp chat button to route to the service number.
  - Links header and footer navs back to the root main domain.

### 4. Dedicated Services Contact Page
- Created [ServicesContactPage.jsx](file:///c:/Users/niles/OneDrive/Desktop/saraswati%20tutorial/saraswati-tutorial1/frontend/src/pages/ServicesContactPage.jsx) for the subdomain contact path `/contact`.
- Crafted with premium dark layout styling, Outfit/Jakarta typography, shifting background blur mesh orbs, glassmorphism panels, and smooth Framer Motion list entry/hover animations.

### 5. Local SEO Schema Segregation
- Removed static schema markup blocks from `index.html`.
- Migrated schema markup to React Helmet inside page layouts:
  - **Main Website**: Injects standard `EducationalOrganization` and storefront `LocalBusiness` schemas.
  - **Subdomain Website**: Injects a specialized `LocalBusiness` / `Service` schema featuring `areaServed` (covering Bangalore and surrounding regions) and service telephone numbers, avoiding SEO signal conflicts.

### 6. Dynamic Analytics Streams
- Re-coded GA4 tags inside `index.html`. The page checks hostname during runtime and routes traffic to stream `G-JV6G65QVLJ` (Main Website) or placeholder stream `G-XXXXXXXXXX` (Service Subdomain).

---

## Production Deployment & DNS Configuration

To deploy and map the Services subdomain:

1. **DNS CNAME Setup**:
   Go to your domain host (e.g. GoDaddy) and add a CNAME record:
   - **Host/Name**: `services`
   - **Points to / Target**: Your deployed frontend domain (e.g. `yourproject.vercel.app`).
2. **Add Domain in Hosting Dashboard**:
   In your Vercel or Render hosting dashboard, add `services.saraswatitutorial.com` under custom domains on your project. The host will automatically provision an SSL certificate for the subdomain.
3. **Update Subdomain Analytics ID**:
   Open [index.html](file:///c:/Users/niles/OneDrive/Desktop/saraswati%20tutorial/saraswati-tutorial1/frontend/index.html#L47) and replace the `G-XXXXXXXXXX` placeholder with the GA4 Measurement ID of your subdomain stream.
