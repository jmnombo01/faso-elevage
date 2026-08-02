# GitHub → Railway - Guide express Faso Élevage

## Ton projet est prêt

- Git initialisé localement (branche `main`, commit `11ee7ce`)
- 54 fichiers sans node_modules
- Prêt à push

Le ZIP est dans `/home/user/faso-elevage.zip` → télécharge via viewer.

## Option A — Créer nouveau repo faso-elevage (2 min)

1. Va sur https://github.com/new
   - Repository name: `faso-elevage`
   - Description: `Plateforme vente animaux élevage Burkina Faso - MVP Phase 1`
   - Public
   - ⚠️ Ne coche PAS Add README / .gitignore (on a déjà)
   - Create repository

2. GitHub te montre une page avec commands. Copie les 3 commandes du `...or push an existing repository`:

```bash
# Dans ton terminal local où tu as dézippé faso-elevage
cd faso-elevage

# Remplace TON_USERNAME par ton username GitHub
git remote add origin https://github.com/TON_USERNAME/faso-elevage.git
git branch -M main
git push -u origin main
```

Si tu as déjà fait `git init` (comme ici), fais plutôt:
```bash
git remote set-url origin https://github.com/TON_USERNAME/faso-elevage.git
git push -u origin main
```

3. Code sur GitHub → vérifie que tu vois `README.md` avec Faso Élevage

## Option B — Upload ZIP direct sur GitHub (sans terminal)

1. https://github.com/new → crée repo `faso-elevage` vide
2. Sur page repo vide, clique `uploading an existing file`
3. Glisse-dépose tout le contenu du ZIP (ou le ZIP dézippé)
4. Commit direct to main

Moins propre mais fonctionne pour MVP.

## Ensuite → Railway Deploy automatique

1. https://railway.app → New Project → Deploy from GitHub repo → choisis `faso-elevage`
2. Railway détecte monorepo → Tu dois créer 2 services comme dans `DEPLOY_RAILWAY.md`:
   - Service 1: Root Directory `/backend`
   - Service 2: Root Directory `/frontend`
   - Add Postgres plugin
3. Set variables env (voir DEPLOY_RAILWAY.md)
4. Deploy → auto redéploie à chaque push GitHub (CI/CD gratuit)

## Vérifier que tout est OK sur GitHub

Ton repo doit avoir:
```
faso-elevage/
├── backend/ (API)
├── frontend/ (Next.js)
├── docker-compose.yml
├── railway.json
├── DEPLOY_RAILWAY.md
└── README.md
```

Pas de `node_modules`, pas de `.env` avec secrets.

## Pour mettre à jour le code plus tard

```bash
# après modifs
git add .
git commit -m "feat: ajout X"
git push
# Railway redéploie auto en 2 min
```

## Si tu veux que je push auto avec token

Génère un PAT sur https://github.com/settings/tokens → New token classic → scopes repo → copie token
Puis donne-moi:
- Ton username GitHub
- Nom repo (faso-elevage)
- Token

Je ferai `git push https://TOKEN@github.com/USER/REPO.git` depuis ici (token non stocké).

---

Besoin du ZIP? Il est prêt à `/home/user/faso-elevage.zip` → dis-moi si tu veux que je l'expose en téléchargement.
