# Trackr — Expense Tracker

Trackr is a full-stack personal finance app to track income, expenses, recurring payments, debts, investments and savings — with **AI-powered bill scanning** and an installable **PWA** experience.

**Live demo:** https://trackr-finance.vercel.app

> First load may take ~30–50 seconds — the backend runs on a free tier that sleeps when idle and needs a moment to wake up.

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Local setup](#local-setup)
- [Environment variables](#environment-variables)
- [Deployment](#deployment)
- [Security](#security)
- [License](#license)

---

## Features

- **Transactions** — add income/expenses with categories, notes and dates; amounts are encrypted at rest.
- **AI bill scanning** — snap or upload a photo of a bill and Gemini Vision extracts the amount, merchant, category and date. You review and confirm before it's saved.
- **Recurring transactions** — schedule daily/weekly/monthly/yearly payments, with skip/snooze/mark-paid and history.
- **Dashboard & reports** — monthly summaries, category breakdowns and 6-month trends (charts), plus CSV/PDF export.
- **Spending calendar** — see transactions and upcoming recurring payments by day.
- **Notifications** — reminders for upcoming recurring payments.
- **Dark mode** — full light/dark theming.
- **PWA** — installable on mobile/desktop, works offline (app shell), with its own icon and splash.
- **Auth & security** — JWT auth, password hashing (bcrypt), Helmet headers, rate limiting, and AES-encrypted amounts.

---

## Tech stack

- **Frontend:** React (Create React App), Ant Design, Tailwind CSS, React Router, Chart.js, axios, dayjs
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT, bcryptjs, Helmet, express-rate-limit, Multer
- **AI:** Google Gemini (vision) for bill scanning
- **Hosting:** Frontend on Vercel, backend on Render, database on MongoDB Atlas

---

## Architecture

This is a monorepo with two independent packages:

```
expense-tracker-react/
├── src/              # React frontend (root package.json)
├── public/           # static assets, manifest, service worker output
├── backend/          # Express API (its own package.json)
│   ├── controllers/  # route handlers
│   ├── models/       # Mongoose schemas
│   ├── routes/       # Express routers
│   ├── middleware/   # auth, validation, async + error handling
│   ├── utils/        # AES encryption helpers
│   └── cron/         # recurring-payment reminder job
└── vercel.json       # SPA rewrite for client-side routing
```

- The **frontend** is a static build served by Vercel and talks to the backend over HTTPS.
- The **backend** is a standalone Express server on Render; it reads its own `backend/.env`.
- Transaction amounts are **AES-256 encrypted** before being stored in MongoDB and decrypted on read.
- Totals (income/expenses/net) are **derived from transactions** on demand rather than stored, to avoid drift.

---

## Local setup

### Prerequisites
- Node.js (v18+ recommended)
- A MongoDB connection string (e.g. a free MongoDB Atlas cluster)
- A Google Gemini API key (free tier) from https://aistudio.google.com/apikey — only needed for bill scanning

### 1. Clone
```bash
git clone https://github.com/dineshkharah/expense-tracker-react.git
cd expense-tracker-react
```

### 2. Backend
```bash
cd backend
npm install
```
Create `backend/.env` — copy `backend/.env.example` and fill in your values. See the [Environment variables](#environment-variables) table for what each one is.

Run it:
```bash
npm run dev      # nodemon (development)
# or
npm start        # node server.js (production)
```

### 3. Frontend
From the project root (open a second terminal):
```bash
npm install
```
Create a root `.env` — copy `.env.example` and set `REACT_APP_API_URL` to your backend URL.

Run it:
```bash
npm start
```
The app opens at http://localhost:3000.

> **Note on `ENCRYPTION_KEY`:** it must be exactly 32 bytes (for AES-256). The server refuses to start otherwise. Don't change it once you have encrypted data — existing amounts become unreadable.

---

## Environment variables

| Variable | Where | Description |
|---|---|---|
| `MONGO_URI` | backend | MongoDB connection string |
| `JWT_SECRET` | backend | Secret for signing JWTs |
| `ENCRYPTION_KEY` | backend | 32-byte key for AES-256 encryption of amounts |
| `GEMINI_API_KEY` | backend | Google Gemini API key for bill scanning |
| `GEMINI_MODEL` | backend | Gemini model id (e.g. `gemini-2.5-flash`) |
| `NOTIFICATION_RETENTION_DAYS` | backend | Days to keep notifications (default 60) |
| `PORT` | backend | Server port (host provides this in production) |
| `NODE_ENV` | backend | Set to `production` to lock CORS to `CLIENT_URL` |
| `CLIENT_URL` | backend | Allowed frontend origin(s) in production |
| `REACT_APP_API_URL` | frontend | Base URL of the backend API |

---

## Deployment

- **Backend (Render):** root directory `backend`, build `npm install`, start `npm start`. Set all backend env vars plus `NODE_ENV=production` and `CLIENT_URL=<your Vercel URL>`. Allow access from anywhere in MongoDB Atlas network settings.
- **Frontend (Vercel):** framework Create React App, root directory `./`. Set `REACT_APP_API_URL=<your Render URL>`.

---

## Security

Measures in place:

- **Passwords** hashed with bcrypt; never stored or returned in plaintext.
- **Auth** via JWT with issuer/audience claims and a 1-day expiry.
- **Transaction amounts** encrypted at rest with AES-256.
- **NoSQL injection** blocked by sanitizing `$`/`.` keys from all request input.
- **Brute-force / abuse** mitigated with rate limiting (global, stricter on auth and bill-scan endpoints).
- **Hardening:** Helmet security headers, CORS locked to the configured origin in production, request body size limits, and generic auth errors to avoid user enumeration.
- **Input validation** on auth routes (email normalization, password complexity).

Known trade-offs (acceptable for this project's scope):

- The JWT is stored in `localStorage` for simplicity. This is exposed to XSS; a production-grade app would use httpOnly cookies. React/Ant Design escape output by default, which keeps the XSS surface low.
- `npm audit` reports advisories in Create React App's build-time tooling (webpack/dev-server, etc.). These are dev dependencies that do not ship to the browser or run in production, and `react-scripts` cannot be upgraded without breaking the build.

---

## Screenshots

_Coming soon._

---

## License

[MIT](LICENSE)
