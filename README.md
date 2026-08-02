# Faso Élevage - Phase 1 MVP

Plateforme d'annonces d'animaux d'élevage au Burkina Faso. Connecte éleveurs et acheteurs.

**Nom choisi: Faso Élevage** - plus local, mémorable, SEO-friendly que les alternatives.

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template?from=github)

> Déploiement 8 min: voir `DEPLOY_RAILWAY.md` pour guide complet pas-à-pas
> Variables prod exemples: `backend/.env.production.example` + `frontend/.env.production.example`

## Stack (Phase 1 respectée)

- **Frontend:** Next.js 14 App Router + Tailwind CSS + PWA-ready
- **Backend:** Node.js Express + TypeScript - API REST
- **DB:** PostgreSQL 15
- **Images:** Cloudinary
- **Auth:** JWT + OTP SMS (mock en dev, prêt pour CinetPay SMS)
- **Deploy:** Docker + docker-compose, prêt Railway/VPS

> ❌ Pas de Flutter, Redis, Paiement en Phase 1.

## Structure du monorepo

```
faso-elevage/
├── backend/               # API Express
│   ├── src/
│   │   ├── config/        # db, cloudinary, jwt
│   │   ├── modules/
│   │   │   ├── auth/      # OTP login
│   │   │   ├── users/
│   │   │   ├── listings/  # CRUD annonces + recherche
│   │   │   ├── favorites/
│   │   │   ├── reports/   # signalements
│   │   │   └── admin/     # modération + stats
│   │   ├── middlewares/
│   │   ├── utils/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── prisma/schema.prisma
│   ├── migrations/001_init.sql
│   ├── seeds/seed.ts      # 20 annonces réalistes BF
│   ├── Dockerfile
│   └── package.json
├── frontend/              # Next.js
│   ├── app/
│   │   ├── page.tsx           # Accueil + recherche
│   │   ├── annonces/[id]/     # Fiche annonce
│   │   ├── publier/           # Formulaire
│   │   ├── mes-annonces/      # Dashboard vendeur
│   │   ├── favoris/
│   │   ├── login/
│   │   └── admin/             # Back-office
│   ├── components/
│   ├── lib/
│   └── package.json
└── docker-compose.yml
```

## Installation Rapide

```bash
# 1. Lancer DB
docker-compose up -d postgres

# 2. Backend
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run seed
npm run dev # port 4000

# 3. Frontend
cd ../frontend
cp .env.example .env.local
npm install
npm run dev # port 3000
```

## API Endpoints (Phase 1)

### Auth
- POST /api/auth/request-otp { phone }
- POST /api/auth/verify-otp { phone, otp, name? }
- GET /api/auth/me

### Listings
- GET /api/listings?ville=Ouagadougou&espece=POULET&minPrice=5000&maxPrice=50000&page=1
- GET /api/listings/:id
- POST /api/listings (auth)
- PUT /api/listings/:id (owner)
- DELETE /api/listings/:id (owner)
- PATCH /api/listings/:id/sold (owner)

### Favorites
- GET /api/favorites (auth)
- POST /api/favorites/:listingId (auth)
- DELETE /api/favorites/:listingId (auth)

### Reports
- POST /api/reports { listingId, motif, description }

### Admin (role ADMIN)
- GET /api/admin/listings/pending
- PATCH /api/admin/listings/:id/validate { status: APPROUVEE|REJETEE }
- GET /api/admin/users
- PATCH /api/admin/users/:id/block
- GET /api/admin/reports
- GET /api/admin/stats

## Critères de succès validés

- Publication < 2 min sur mobile: formulaire 5 étapes, upload 5 photos max
- Recherche < 3 clics: filtres persistants page d'accueil
- Modération 1 clic: boutons Approuver/Rejeter dans /admin

## Villes & Données BF Réalistes

Villes: Ouagadougou, Bobo-Dioulasso, Koudougou, Ouahigouya, Kaya, Banfora, Dédougou, Fada N'Gourma, Tenkodogo, Houndé
Prix: FCFA (1000 = petit poulet, 450k = bœuf)
Espèces: POULET, PINTADE, LAPIN, BOVIN, OVIN, CAPRIN, PORCIN

## Phase 2 - Ne pas implémenter maintenant
Voir prompt initial. Tables Payments, Messages, Notifications + Mobile Money.
