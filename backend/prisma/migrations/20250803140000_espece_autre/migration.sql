-- Phase 1.5 - Ajout AUTRE + champ libre pour animaux non catégorisés

-- Ajoute valeur AUTRE à l'enum Espece (Postgres ne permet pas ADD VALUE dans transaction si enum utilisé, mais on tente)
DO $$ BEGIN
  ALTER TYPE "Espece" ADD VALUE 'AUTRE';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Ajoute colonne custom
ALTER TABLE "listings" ADD COLUMN IF NOT EXISTS "espece_custom" TEXT;
