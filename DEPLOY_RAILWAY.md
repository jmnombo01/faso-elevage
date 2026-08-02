# Déploiement Faso Élevage sur Railway — Guide Complet MVP Phase 1

> Temps estimé: 8 minutes

## Architecture Railway

```
Railway Project "faso-elevage"
├─ Service postgres (Railway PostgreSQL plugin)
├─ Service backend (Node Express) -> port 4000
└─ Service frontend (Next.js) -> port 3000
```

## Étape 1 — Préparer GitHub (1 min)

```bash
cd /home/user/faso-elevage
git init
git add .
git commit -m "feat: MVP Phase 1 Faso Elevage - Railway ready"
# Crée repo https://github.com/TON_USER/faso-elevage
git remote add origin https://github.com/TON_USER/faso-elevage.git
git push -u origin main
```

## Étape 2 — Créer Projet Railway (2 min)

1. Va sur https://railway.app → Login avec GitHub
2. New Project → Deploy from GitHub repo → choisis `faso-elevage`
3. Railway détecte monorepo → on va configurer 2 services manuellement

**Supprime le service auto** et crée:

### A) Service DATABASE

- Dans projet → New → Database → Add PostgreSQL
- Copie `DATABASE_URL` (Railway le génère automatiquement)

### B) Service BACKEND

- New → GitHub Repo → même repo → Settings:
  - Root Directory: `/backend`
  - Builder: Nixpacks (auto)
  - Variables d'environnement (onglet Variables):
```
DATABASE_URL=${{Postgres.DATABASE_URL}}   # Reference variable Railway
JWT_SECRET=change-moi-en-prod-super-secret-32-chars-min
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://ton-frontend.up.railway.app  # mettras après frontend deploy
CLOUDINARY_CLOUD_NAME=ton_cloud_name
CLOUDINARY_API_KEY=ton_key
CLOUDINARY_API_SECRET=ton_secret
# Si pas Cloudinary, laisse demo → placeholder picsum
```
  - Deploy → regarde logs: doit afficher "prisma migrate deploy" puis "API démarrée"

Vérifie: `https://backend-production-xxxx.up.railway.app/health` doit retourner `{ status: "ok" }`

### C) Service FRONTEND

- New → GitHub Repo → même repo → Settings:
  - Root Directory: `/frontend`
  - Builder: Nixpacks
  - Variables:
```
NEXT_PUBLIC_API_URL=https://ton-backend.up.railway.app/api
NODE_ENV=production
```
  - Deploy

Une fois frontend déployé, copie son URL public (ex: `https://faso-elevage-frontend.up.railway.app`) et mets-la dans `FRONTEND_URL` du backend → Redeploy backend. Ça règle CORS.

## Étape 3 — Migrations + Seed (1 min)

Railway n'exécute pas le seed auto. Deux options:

**Option A - Railway CLI (recommandé)**
```bash
npm i -g @railway/cli
railway login
railway link   # choisis projet faso-elevage + service backend
railway run npm run seed:prod   # exécute seed en prod via DATABASE_URL railway
```

**Option B - Depuis dashboard**
- Service backend → Settings → Deploy → Custom Start Command temporaire:
```
npx prisma migrate deploy && npx tsx seeds/seed.ts && node dist/server.js
```
Redeploy → seed exécuté → remet start command normal `npx prisma migrate deploy && node dist/server.js`

Tu as 20 annonces + 6 users dont admin `+22670000099`.

## Étape 4 — Vérification Production

1. Frontend: https://ton-frontend.railway.app → doit afficher 14 annonces APPROUVEE (70% du seed)
2. Login: `/login` → phone `70000099` → OTP en logs backend (`railway logs`) → copie OTP
3. Admin: `/admin` → vérifie pending contient 4 annonces EN_ATTENTE → bouton Approuver 1 clic

## Variables Production Obligatoires

Backend:
- `DATABASE_URL` auto injecté par Railway Postgres reference
- `JWT_SECRET` → génère avec `openssl rand -base64 32`
- `CLOUDINARY_*` → crée compte gratuit https://cloudinary.com (10GB free) → Dashboard → copie credentials
- `FRONTEND_URL` = URL frontend railway pour CORS

Frontend:
- `NEXT_PUBLIC_API_URL` = URL backend + /api (ex: `https://backend.../api`)

## Coûts Railway MVP

- Postgres: ~$5/mois (ou free tier 500h)
- Backend: ~$5/mois (512MB RAM suffit)
- Frontend: ~$5/mois
Total MVP: ~$15/mois ou $0 avec trial $5 credit.

Alternative ultra-cheap: déployer backend + DB sur Railway free, frontend sur Vercel free (0$).

## Alternative Vercel pour Frontend (gratuit)

Si tu veux économiser:
1. Importe repo faso-elevage sur vercel.com
2. Root directory: `frontend`
3. Env `NEXT_PUBLIC_API_URL` = url backend railway
4. Deploy → URL vercel.app → mets cette URL dans `FRONTEND_URL` backend

## Monitoring

- Railway → backend → Metrics: CPU/RAM
- Logs: `railway logs --service backend`
- Healthcheck: ajoute dans Railway service backend Settings → Health Check Path: `/health`

## Troubleshooting

- `Can't reach database` → vérifie reference variable `${{Postgres.DATABASE_URL}}` pas texte brut
- CORS error → FRONTEND_URL backend doit matcher exactement URL frontend (https pas http)
- Images ne s'affichent pas → Cloudinary demo renvoie picsum, en prod mets vraies clés ou laisse demo pour MVP
- Seed échoue → `relation "users" does not exist` → migrate deploy pas passé, vérifie logs start command

## Sécurité Prod à ajouter après validation

- Rate limit OTP (5 req/min/phone)
- Cloudinary signed upload
- Helmet, express-rate-limit
- Sentry pour logs erreurs

---

Tu veux que je pousse ce projet vers ton GitHub automatiquement ou tu préfères le faire toi-même?
