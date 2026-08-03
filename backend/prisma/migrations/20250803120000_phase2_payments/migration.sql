-- Phase 2 - Payments + Boost + Badge Vérifié

CREATE TYPE "PaymentType" AS ENUM ('BOOST', 'BADGE');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED');
CREATE TYPE "PaymentProvider" AS ENUM ('CINETPAY', 'PAYDUNYA', 'MOCK');

-- Alter users
ALTER TABLE "users" ADD COLUMN "is_verified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "verified_until" TIMESTAMPTZ;

-- Alter listings
ALTER TABLE "listings" ADD COLUMN "is_boosted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "listings" ADD COLUMN "boosted_until" TIMESTAMPTZ;
CREATE INDEX "listings_is_boosted_boosted_until_idx" ON "listings"("is_boosted", "boosted_until");

-- Create payments table
CREATE TABLE "payments" (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  listing_id TEXT REFERENCES "listings"(id) ON DELETE SET NULL,
  type "PaymentType" NOT NULL,
  amount_fcfa INT NOT NULL,
  duration_days INT,
  provider "PaymentProvider" DEFAULT 'CINETPAY' NOT NULL,
  provider_tx_id TEXT,
  status "PaymentStatus" DEFAULT 'PENDING' NOT NULL,
  phone VARCHAR(20),
  operator VARCHAR(20),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX "payments_user_id_idx" ON "payments"(user_id);
CREATE INDEX "payments_listing_id_idx" ON "payments"(listing_id);
CREATE INDEX "payments_status_idx" ON "payments"(status);
CREATE INDEX "payments_type_idx" ON "payments"(type);

CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS payments_updated_at ON "payments";
CREATE TRIGGER payments_updated_at BEFORE UPDATE ON "payments" FOR EACH ROW EXECUTE FUNCTION update_updated_at();
