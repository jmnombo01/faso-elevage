# Token 403 - Permission denied - Solution

Ton token `github_pat_...` que tu viens de donner est un **Fine-Grained PAT** mais il n'a pas accès au repo `faso-elevage`.

GitHub a renvoyé:
```
remote: Permission to jmnombo01/faso-elevage.git denied
error: 403
```

## Pourquoi?

Les tokens `github_pat_...` (nouveau format) demandent de choisir explicitement:
- Resource owner: jmnombo01
- Repositories: faso-elevage
- Permissions Contents: Read & Write

Si tu as laissé "Only select repositories" vide, le token n'a accès à aucun repo → 403.

## Solution 1 - Le plus simple: Génère un Classic Token (ghp_...)

Les classic tokens sont plus simples, pas besoin de choisir repo.

1. Va sur https://github.com/settings/tokens
2. **SUPPRIME d'abord l'ancien token** que tu viens de coller (car il est maintenant public dans ce chat - par sécurité):
   - Clique sur le token que tu viens de créer (faso-elevage-push) → `Delete` → confirme
3. Maintenant clique `Generate new token` → **`Generate new token (classic)`** (pas fine-grained)
4. Note: `faso-elevage-classic`
5. Expiration: 7 days
6. **Coche uniquement**: `repo` (toutes les sous-cases repo se cochent)
7. En bas `Generate token`
8. Copie le token qui commence par `ghp_...` (pas `github_pat_...`)

Ensuite colle-le ici, je pousse en 5 sec. Je le supprime juste après.

## Solution 2 - Corrige ton Fine-Grained Token actuel

1. https://github.com/settings/tokens → clique sur ton token existant
2. Dans `Repository access` → choisis `Only select repositories` → `Add repositories` → cherche `faso-elevage` → Add
3. Dans `Permissions` → `Repository permissions` → `Contents` → met `Read and write`
4. Save

Mais plus simple de refaire un Classic Token (Solution 1).

## Solution 3 - Sans token du tout (upload manuel, 1 min)

Si tu ne veux plus gérer de token:

1. Sur https://github.com/jmnombo01/faso-elevage
2. Tu vois "Quick setup - upload files" → clique `uploading an existing file`
3. Télécharge faso-elevage.zip depuis workspace, dézippe sur ton PC
4. Sur GitHub upload page, glisse-dépose TOUS les fichiers dézippés (sauf .git)
5. En bas: Commit message `MVP Faso Elevage` → `Commit new files`

Et c'est sur GitHub, pas besoin de ligne de commande.

---

Dès que tu as un nouveau token `ghp_...`, colle-le ici. Je pousse et je supprime le token de la config immédiatement (comme je viens de le faire pour l'ancien).
