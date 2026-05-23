# FashionAura — E-commerce (Moroccan fashion)

One website, one structure:

```
fashionaura/
├── backend/          ← Laravel API (both devs)
└── frontend/       ← React app (both devs)
```

## What is inside

| Area | Pages / features |
|------|------------------|
| **Landing & cities** (Aya) | `/` landing map, `/cities/:slug` city experience, dashboards |
| **Shop** (Ahlam) | `/boutiques`, `/products`, `/panier`, `/favoris` |

All routes are connected in `frontend/src/router/AppRouter.jsx`.

---

## Quick start (Windows)

### 1. First-time setup

```powershell
# Backend
cd backend
copy .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed

# Frontend
cd ..\frontend
copy .env.example .env.local
npm install
```

### 2. Run the site

Double-click **`start.bat`** at the project root, or run manually:

```powershell
# Terminal 1
cd backend
php artisan serve

# Terminal 2
cd frontend
npm run dev
```

Open **http://localhost:5173**

---

## Requirements

- PHP 8.2+ and [Composer](https://getcomposer.org/)
- Node.js 18+ and npm
- SQLite (default) — no MySQL needed for local demo

---

## API

Base URL: `http://localhost:8000/api`

Examples: `/cities`, `/boutiques`, `/products`, `/cart` (auth required)

---

## Production build

```powershell
cd frontend
npm run build
```

Output: `frontend/dist/`
