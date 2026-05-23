# FashionAura — E-commerce (mode marocaine)

```
fashionaura/
├── backend/     ← API Laravel + MySQL
└── frontend/    ← React (Vite)
```

## Démarrage rapide (Windows)

### 1. Base MySQL

Crée la base (phpMyAdmin ou MySQL) :

```sql
CREATE DATABASE fashionaura_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Configure `backend/.env` :

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=fashionaura_db
DB_USERNAME=root
DB_PASSWORD=votre_mot_de_passe
```

### 2. Première installation

Double-clique **`setup.bat`** ou manuellement :

```powershell
cd backend
copy .env.example .env
composer install
php artisan key:generate
php artisan fashionaura:ensure-data

cd ..\frontend
copy .env.example .env.local
npm install
```

> `fashionaura:ensure-data` lance les migrations et **remplit la BDD seulement si elle est vide** (ne supprime pas tes données existantes).

### 3. Lancer le site

Double-clique **`start.bat`** ou :

```powershell
# Terminal 1
cd backend
php artisan serve

# Terminal 2
cd frontend
npm run dev
```

Ouvre **http://localhost:5173**

---

## Prérequis

- PHP 8.2+ et [Composer](https://getcomposer.org/)
- **MySQL** (XAMPP, WAMP, Laragon, etc.)
- Node.js 18+ et npm

---

## API

Base : `http://localhost:8000/api`

Exemples : `/cities`, `/cities/tanger`, `/boutiques`, `/products`

Frontend : `frontend/.env.local` → `VITE_API_URL=http://localhost:8000/api`

---

## Coéquipière — « Cette ville n'existe pas »

1. MySQL démarré
2. `backend/.env` configuré (MySQL, pas SQLite)
3. `php artisan fashionaura:ensure-data` dans `backend/`
4. Backend lancé : `php artisan serve`
5. Frontend : `npm run dev`

---

## Build production

```powershell
cd frontend
npm run build
```

Sortie : `frontend/dist/`
