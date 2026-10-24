# iFix Services: website + contact backend

## Contents
- public/index.html  the full website
- public/logo.svg    standalone logo
- server.js          Node/Express server: serves the site, emails form submissions
- package.json       dependencies
- .env.example       copy to .env and fill in SMTP details (never commit .env)
- render.yaml        one-click blueprint for Render
- .gitignore

## Run locally
1. Install Node 18+
2. npm install
3. cp .env.example .env  (add SMTP details)
4. npm start  ->  http://localhost:3000

## Deploy (any host that runs Node)
Render, Railway, Fly.io, DigitalOcean App Platform, or a VPS (Nginx + PM2).
Set the variables from .env.example in the host's environment settings,
then point ifixservice.online DNS at the host and enable HTTPS.

## Before launch
- Fill in the fee terms placeholder in public/index.html (search "Add your exact terms").
- Register the business in Florida and confirm any licensing requirements.
- Send a test form submission to confirm email delivery.
