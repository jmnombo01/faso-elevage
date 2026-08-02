# Créer un token GitHub PAT en 30 secondes pour pousser Faso Élevage

## Pourquoi un token?

GitHub ne permet plus de pousser avec mot de passe. Il faut un token temporaire `ghp_...` (comme une clé). Je l'utilise 10 secondes pour pousser puis il est oublié (`.git/config` n'est même pas sauvegardé dans ce workspace).

## Étapes (depuis téléphone ou PC)

1. Va sur https://github.com/settings/tokens
   - Si pas connecté, connecte-toi avec jmnombo01

2. Clique `Generate new token` → `Generate new token (classic)` (2e option)

3. Remplis:
   - Note: `faso-elevage-push` (ou ce que tu veux)
   - Expiration: `7 days` ou `No expiration` pour MVP, ou `7 days` si tu veux temporaire
   - Coche UNIQUEMENT: `repo` (ça coche tout repo: repo:status, repo_deployment, public_repo, repo:invite, security_events)
   - Ne coche rien d'autre

4. En bas, clique vert `Generate token`

5. GitHub affiche `ghp_xxxxxxxxxxxx...` → **COPIE-LE immédiatement** (il ne s'affiche qu'une fois)

6. Colle-le ici dans le chat comme ça:
```
Token: ghp_abc123....
Repo: https://github.com/jmnombo01/faso-elevage
```

Je pousse instantanément dès réception.

## Sécurité

- Le token a seulement accès repo, pas à ton compte
- Tu peux le supprimer juste après dans https://github.com/settings/tokens → Delete
- Ici, `.git/config` est exclu des sauvegardes (voir règles workspace), donc même si snapshot, token pas sauvegardé
- Alternative: Après push, va supprimer token toi-même → Revoke

## Option sans token (si tu préfères)

Sur ton PC où tu as dézippé faso-elevage:

```bash
cd faso-elevage
git push -u origin main
# GitHub va ouvrir une fenêtre navigateur pour t'authentifier (GitHub CLI)
# Ou demande username + token: utilise username jmnombo01 et colle ghp_... comme password
```

---

Dès que tu as `ghp_...`, colle-le ici et je pousse tout (54 fichiers) en 5 secondes.
