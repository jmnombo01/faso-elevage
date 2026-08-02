#!/bin/bash
# Script déploiement Railway Faso Élevage MVP
set -e

echo "🇧🇫 Déploiement Faso Élevage sur Railway"

if ! command -v railway &> /dev/null; then
  echo "Installation Railway CLI..."
  npm i -g @railway/cli
fi

echo "1. Login Railway..."
railway login

echo "2. Init projet..."
railway init --name faso-elevage || railway link

echo "3. Ajout PostgreSQL..."
railway add --plugin postgresql || echo "Postgres déjà existant ou ajout manuel requis"

echo "4. Deploy Backend..."
echo "   Configure Root Directory = /backend dans dashboard si ce script échoue"
railway up --service backend --detach || echo "Deploy backend via dashboard"

echo "5. Migrations + Seed (après premier deploy backend)..."
read -p "Backend déployé? [y/N] " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  railway run --service backend npx prisma migrate deploy
  railway run --service backend npx tsx seeds/seed.ts || railway run --service backend npm run seed
fi

echo "6. Deploy Frontend..."
echo "   N'oublie pas de set NEXT_PUBLIC_API_URL dans variables frontend"
railway up --service frontend --detach || echo "Deploy frontend via dashboard"

echo "✅ Déploiements lancés. Vérifie dashboard railway.app"
echo "   Backend health: /health"
echo "   Frontend: /"
echo "   N'oublie pas FRONTEND_URL dans backend env = URL frontend"
