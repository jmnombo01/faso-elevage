# API Faso Élevage - Documentation REST Phase 1

Base URL: `http://localhost:4000/api`

## Auth - OTP

### POST /auth/request-otp
Demande code OTP. En dev, retourne `debugOtp` pour tests.
```json
{ "phone": "70000000" }
```
Response: `{ message: "OTP envoyé", debugOtp: "123456" }`

### POST /auth/verify-otp
Vérifie OTP et crée user si nouveau.
```json
{ "phone": "70000000", "otp": "123456", "name": "Adama", "ville": "Ouagadougou" }
```
Si nouveau numéro sans name/ville -> `{ needSignup: true }`
Sinon -> `{ token, user }`

### GET /auth/me
Header: `Authorization: Bearer <token>`

## Listings

### GET /listings?ville=Ouagadougou&espece=POULET&minPrice=1000&maxPrice=100000&q=Bali&page=1
Public, seulement APPROUVEE par défaut. Pagination 20 max.
Response: `{ data: [], total, page, totalPages }`

### GET /listings/:id
Incrémente vues.

### POST /listings (auth)
Multipart/form-data
Fields: espece, race, ageMois, poidsKg, quantite, prixFcfa, ville, quartier, description, disponibilite
Files: photos[] max 5
Statut auto EN_ATTENTE pour modération.

### PUT /listings/:id (owner)
Même format, reset à EN_ATTENTE.

### DELETE /listings/:id (owner)

### PATCH /listings/:id/sold (owner)
Marque VENDUE.

## Favorites (auth)

- GET /favorites -> liste listings favoris
- POST /favorites/:listingId
- DELETE /favorites/:listingId

## Reports (auth)

- POST /reports { listingId, motif: ARNAQUE|PRIX_ABUSIF|PHOTO_TROMPEUSE|ANIMAL_MALADE|AUTRE, description? }

## Admin (role ADMIN)

- GET /admin/listings/pending
- PATCH /admin/listings/:id/validate { status: APPROUVEE|REJETEE } -> 1 clic succès
- GET /admin/users
- PATCH /admin/users/:id/block { isBlocked: bool }
- GET /admin/reports + PATCH /admin/reports/:id/resolve
- GET /admin/stats -> { totalUsers, totalListings, pending, approved, todayListings, byEspece, byVille, last7days }

## Codes erreur communs
- 401 Token manquant / invalide
- 403 Compte bloqué / admin requis
- 404 Introuvable
- 400 Validation zod

## CV: OTP Flow Burkina
1. Frontend collecte phone BF (8 chiffres)
2. Backend normalise +226 + crée OTP 6 chiffres expires 5min
3. En prod, appeler API SMS local (ex: CinetPay SMS, SMS BF aggregator) - actuel: console.log + debugOtp
4. Verify OTP -> JWT 7j

## Cloudinary
Si env DEMO, retourne picsum placeholder. En prod, config CLOUDINARY_* et Multer uploade files vers Cloudinary folder faso-elevage.

## Données réalistes seed
20 annonces couvrant toutes espèces, villes BF principales, prix FCFA réels. Admin: +22670000099
