# Xtreme Go Karting — Full-Stack Booking Platform

Modern, mobile-friendly booking site for **Xtreme Go Karting** with online reservations, admin dashboard, walk-in (offline) bookings, custom add-ons/charges, reviews, and a lightweight Node/Express API.

**Live**
- **Web:** https://xtreme-go.vercel.app
- **API:** https://xtreme-go.onrender.com

---

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Monorepo Structure](#monorepo-structure)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [Deployment (Render + Vercel)](#deployment-render--vercel)
- [API Overview](#api-overview)
- [Booking & Timezone Rules](#booking--timezone-rules)
- [Customization](#customization)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)
- [License](#license)

---

## Features

### Customer
- Clean, animated landing (no track preview), pricing, and responsive UI.
- Email sign-in; view bookings in **Account**.
- Book **Karts** (by laps) and **Games** (PS5 / 8-Ball Pool / Snooker) by **hours**.
- Time-zone aware: **blocks past dates/times**, enforces business hours & slot capacity.
- **Reviews:** visitors submit name + message; newest render at the bottom.
- Quick links to Instagram + Google Maps.

### Admin
- Secure login via **environment variables** (no hardcoded creds).
- **Walk-in (offline) bookings:** set **any number of hours** for games.
- **Custom charges** (name + price) to attach snacks/drinks/etc. to a booking.
- Staff check-in screen by booking code.

---

## Tech Stack
- **Frontend:** React + Vite, Tailwind CSS  
- **Backend:** Node.js, Express, JSON file store  
- **Auth:** JWT (httpOnly cookie)  
- **Dates/Times:** dayjs (UTC + timezone)  
- **Deploy:** Vercel (web) + Render (API)

> File-store is perfect for small venues and free hosting. Swap to Postgres/Mongo for scale.

---

## Monorepo Structure

```text
xtreme-fullstack-animated-reviews-hours-v2/
├─ api/                      # Express API (Render)
│  ├─ data/                  # JSON: products, bookings, users, reviews, settings
│  ├─ index.js               # API entry (ESM)
│  ├─ package.json
│  └─ store.js
└─ web/                      # React app (Vercel)
   ├─ src/
   │  ├─ pages/              # Home, Pricing, Book, Account, Admin, Staff
   │  ├─ ui/                 # Hero, Navbar, Reviews, etc.
   │  ├─ store.js            # API client + auth
   │  └─ styles.css
   ├─ index.html
   ├─ package.json
   └─ vite.config.js
Environment Variables
Render (API) → Settings → Environment
Required

ADMIN_EMAIL – admin login email (e.g. admin@xtreme.com)

Either ADMIN_PASSWORD – plain password
or ADMIN_PASSWORD_HASH – bcrypt hash of the admin password

Generate a hash locally:

bash
Copy
Edit
node -e "console.log(require('bcryptjs').hashSync('StrongPass123', 10))"
JWT_SECRET – long random string

BUSINESS_TZ – IANA timezone (e.g. Asia/Kolkata)

Build/Start (API)

Root Directory: xtreme-fullstack-animated-reviews-hours-v2/api

Build: npm install

Start: node index.js

Vercel (Web) → Settings → Environment
VITE_API_BASE – your Render API URL (e.g. https://xtreme-go.onrender.com)

Build (Web)

Root Directory: xtreme-fullstack-animated-reviews-hours-v2/web

Build: npm run build

Output: dist

Local Development
bash
Copy
Edit
# API
cd xtreme-fullstack-animated-reviews-hours-v2/api
npm install
# set envs in your shell (ADMIN_EMAIL, ADMIN_PASSWORD or HASH, JWT_SECRET, BUSINESS_TZ)
node index.js   # http://localhost:4000

# Web
cd ../web
npm install
echo "VITE_API_BASE=http://localhost:4000" > .env
npm run dev     # http://localhost:5173
Deployment (free)
API — Render
New Web Service → select repo

Root Dir: xtreme-fullstack-animated-reviews-hours-v2/api

Build: npm install • Start: node index.js

Add env vars → Deploy
Health: open / and /api/products

Web — Vercel
New Project → same repo

Root Dir: xtreme-fullstack-animated-reviews-hours-v2/web

Build: npm run build • Output: dist

Env VITE_API_BASE → Deploy

API Overview
Base: https://xtreme-go.onrender.com

Public
GET / – health

GET /api/products

GET /api/reviews

POST /api/reviews – { "name": "Your Name", "message": "Great track!" }

GET /api/availability?date=YYYY-MM-DD&productId=<id>

Auth / Account
POST /api/auth/login – { "email": "user@example.com" } → JWT cookie

POST /api/auth/logout

GET /api/account – profile + bookings

POST /api/bookings

json
Copy
Edit
{
  "productId": "superKart_7laps",
  "date": "2025-08-12",
  "time": "14:30",
  "hours": 1,
  "qty": 1
}
Admin (JWT, role: admin)
POST /api/admin/walkin

POST /api/admin/bookings/:code/charge – { "name": "Nachos + Coke", "price": 220 }

POST /api/admin/checkin – { "code": "ABC123" }

Booking & Timezone Rules
All comparisons use BUSINESS_TZ via dayjs (utc + timezone).

Past dates/times are rejected for both online and walk-ins.

Slot length, hours, and capacity enforced from settings.json.

Games support any hour duration for walk-ins (admin).

Customization
Prices/variants → api/data/products.json

Hours, slot length, capacity, tax → api/data/settings.json

UI/branding → web/src/ui/* (Hero, Navbar, colors, etc.)

Timezone → env BUSINESS_TZ (e.g., Europe/London)

Troubleshooting
Web cannot reach API: verify VITE_API_BASE and redeploy web.

Vercel build fails/no output: root must be /web, output dist.

Admin login fails: set only one of ADMIN_PASSWORD or ADMIN_PASSWORD_HASH; check ADMIN_EMAIL; watch Render logs.

Node 22 + dayjs ESM: imports use .js extensions (already fixed).

Roadmap
Stripe/Razorpay payments

Multiple tracks/locations + staff roles

Email/SMS confirmations & reminders

Postgres + Prisma

Rate limiting & audit logs

Review moderation & star ratings

License
MIT — free to use/modify. Attribution appreciated.

csharp
Copy
Edit

If you want this tailored with your logo/screenshots later, ping me and I’ll slot them in.
