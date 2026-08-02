-- Faso Élevage - Phase 1 MVP
-- Schema PostgreSQL complet

CREATE TYPE "Espece" AS ENUM ('POULET', 'PINTADE', 'LAPIN', 'BOVIN', 'OVIN', 'CAPRIN', 'PORCIN');
CREATE TYPE "StatutAnnonce" AS ENUM ('EN_ATTENTE', 'APPROUVEE', 'REJETEE', 'VENDUE');
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "MotifSignalement" AS ENUM ('ARNAQUE', 'PRIX_ABUSIF', 'PHOTO_TROMPEUSE', 'ANIMAL_MALADE', 'AUTRE');

CREATE TABLE "users" (
  id TEXT PRIMARY KEY,
  phone VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  ville VARCHAR(50) NOT NULL,
  quartier VARCHAR(100),
  photo_url TEXT,
  role "Role" DEFAULT 'USER' NOT NULL,
  is_blocked BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_users_phone ON "users"(phone);
CREATE INDEX idx_users_ville ON "users"(ville);

CREATE TABLE "otps" (
  id TEXT PRIMARY KEY,
  phone VARCHAR(20) NOT NULL,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_otps_phone_code ON "otps"(phone, code);

CREATE TABLE "listings" (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  espece "Espece" NOT NULL,
  race VARCHAR(100),
  age_mois INT,
  poids_kg DECIMAL(8,2),
  quantite INT DEFAULT 1 NOT NULL,
  prix_fcfa INT NOT NULL,
  ville VARCHAR(50) NOT NULL,
  quartier VARCHAR(100),
  description TEXT,
  photos TEXT[] DEFAULT '{}' NOT NULL,
  disponibilite DATE,
  statut "StatutAnnonce" DEFAULT 'EN_ATTENTE' NOT NULL,
  vues INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_listings_espece ON "listings"(espece);
CREATE INDEX idx_listings_ville ON "listings"(ville);
CREATE INDEX idx_listings_prix ON "listings"(prix_fcfa);
CREATE INDEX idx_listings_statut ON "listings"(statut);
CREATE INDEX idx_listings_user ON "listings"(user_id);
CREATE INDEX idx_listings_created ON "listings"(created_at DESC);

CREATE TABLE "favorites" (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  listing_id TEXT NOT NULL REFERENCES "listings"(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, listing_id)
);

CREATE TABLE "reports" (
  id TEXT PRIMARY KEY,
  listing_id TEXT NOT NULL REFERENCES "listings"(id) ON DELETE CASCADE,
  reporter_id TEXT REFERENCES "users"(id) ON DELETE SET NULL,
  motif "MotifSignalement" NOT NULL,
  description TEXT,
  is_resolved BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_reports_listing ON "reports"(listing_id);
CREATE INDEX idx_reports_resolved ON "reports"(is_resolved);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER users_updated_at BEFORE UPDATE ON "users" FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER listings_updated_at BEFORE UPDATE ON "listings" FOR EACH ROW EXECUTE FUNCTION update_updated_at();
