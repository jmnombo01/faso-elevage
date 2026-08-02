# Créer ton repo faso-elevage en 2 minutes (même depuis téléphone)

Si tu n'arrives pas à créer un repo, c'est probablement une de ces 3 raisons. Voici la solution pour chaque:

## CAS 1 - Tu n'as pas de compte GitHub

1. Va sur https://github.com → Sign up
2. Email + mot de passe + username (ex: adama-elevage)
3. Valide email
4. Maintenant tu peux créer repo

## CAS 2 - Tu as un compte mais github.com/new ne marche pas

**Méthode la plus simple (sans ligne de commande):**

1. Connecte-toi sur https://github.com
2. En haut à droite, clique sur `+` → `New repository` (ou va direct à https://github.com/new)
3. Remplis:
   - Repository name: `faso-elevage` (obligatoire)
   - Description: `Faso Elevage - vente animaux Burkina` (optionnel)
   - **Public** (coché)
   - ❌ **NE COCHE PAS** "Add a README file"
   - ❌ **NE COCHE PAS** "Add .gitignore"
   - ❌ Laisse License à None
4. Clique `Create repository` (bouton vert)

Si ça ne marche pas, dis-moi quel message d'erreur s'affiche en bas (screenshot).

**Astuce téléphone:** Tourne en mode paysage, ou demande version ordinateur dans navigateur (3 points ⋮ → Version pour ordinateur).

## CAS 3 - Tu veux déployer sans GitHub (PLUS SIMPLE!)

Tu peux déployer Faso Elevage sur Railway **sans jamais créer de repo GitHub** !

**Sur ton PC (après avoir téléchargé faso-elevage.zip):**

```bash
# 1. Dézippe
cd ~/Downloads && unzip faso-elevage.zip && cd faso-elevage

# 2. Installe Railway CLI
npm i -g @railway/cli

# 3. Login Railway (ouvre navigateur)
railway login

# 4. Crée projet Railway direct
railway init
# → Nom: faso-elevage
# → Choisis Empty Project

# 5. Ajoute Postgres
railway add --plugin postgresql

# 6. Deploy Backend
cd backend
railway up --service backend

# 7. Deploy Frontend (autre terminal)
cd ../frontend
railway up --service frontend
```

Et c'est déployé! Pas besoin de GitHub du tout. Railway héberge le code lui-même.

---

## OPTION ULTRA-SIMPLE QUE JE PEUX FAIRE POUR TOI

Si tu n'y arrives vraiment pas:

1. Télécharge le ZIP que j'ai préparé: `/home/user/faso-elevage.zip` dans le workspace (bouton Download)
2. Va sur https://github.com/new → crée repo vide `faso-elevage`
3. Une fois repo vide créé, sur la page du repo vide, clique sur `uploading an existing file` (lien bleu)
4. Glisse-dépose TOUS les fichiers du ZIP dézippé (ou le dossier backend + frontend)
5. En bas, écris `MVP Faso Elevage` et clique `Commit new files`

Pas de ligne de commande, juste glisser-déposer!

---

## Dis-moi où tu bloques exactement

Copie ici:
- Le message d'erreur GitHub
- Ou dis "je n'ai pas de compte"
- Ou "je suis sur téléphone et je ne vois pas le bouton"

Je t'aide immédiatement avec la bonne solution.

---

## En attendant, ton projet est déjà prêt

- Git local prêt: branche main, 1 commit
- ZIP prêt: faso-elevage.zip (54 Ko)
- Guide déploiement Railway: DEPLOY_RAILWAY.md
- Code 100% fonctionnel même sans GitHub (docker-compose up local)
