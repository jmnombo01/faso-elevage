# Plan d'implémentation Phase 1 → Phase 2

## Phase 1 (MVP) - livré ici

**Objectif:** Valider demande à coût minimal, annonces gratuites.

Checklist livrables:
- [x] Structure monorepo claire
- [x] Migrations PostgreSQL 001_init.sql + Prisma schema
- [x] API REST complète (auth OTP, listings CRUD + recherche/filtres, favoris, signalement, admin)
- [x] Frontend responsive mobile-first: accueil recherche, liste, fiche, publier, mes-annonces, admin basique
- [x] Seed 20 annonces réalistes BF
- [x] Déploiement Docker + Railway ready

Critères succès:
- Publication <2 min: formulaire optimisé mobile, 5 photos max, champs essentiels seulement
- Recherche <3 clics: filtres persistants homepage, catégorie espece en 1 clic
- Modération 1 clic: /admin pending avec bouton Approuver/Rejeter

Stack respectée: Next.js Tailwind PWA-ready, Express, PostgreSQL, Cloudinary, JWT OTP, Docker. Pas Flutter/Redis/paiement.

## Comment lancer

Voir README.md - docker-compose up pour DB, puis backend + frontend dev.

Test OTP dev: API retourne debugOtp visible dans UI login.

Admin seed: phone +22670000099 est ADMIN après seed.

## Phase 2 - Comment ajouter après traction

**Condition déclenchement:** >100 annonces actives + >50 acheteurs uniques/jour + rétention 30%

**Ordre monétisation (priorité):**
1. Table Payments + mise en avant payante (boost) - intégration CinetPay Mobile Money agrégateur Orange/Moov/Telecel
2. Badge vendeur vérifié payant
3. Table Messages (messagerie interne) + Notifications
4. Redis cache recherche si >1000 listings
5. Flutter si >30% trafic mobile web + demande app

Tables Phase 2 (ne pas créer maintenant):
- payments (id, user_id, listing_id, montant, provider, statut, type: BOOST|BADGE)
- messages (id, sender_id, receiver_id, listing_id, content)
- notifications (id, user_id, type, payload, read)

Ne pas faire en Phase 1: livraison, escrow, assurance, aliments vétérinaires, RDV veto, enchères.

## Risques BF spécifiques gérés
- Arnaque: validation manuelle EN_ATTENTE par défaut + signalement + blocage user
- Faible bande passante: images Cloudinary optimisées, max 5 photos 5MB
- Téléphone seulement: PWA-ready, responsive, auth sans email
- Prix FCFA: integer, filtre min/max
