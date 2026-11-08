-- RR-399 A1: attempts never saved. "DutchAttempt"."itemId" was a required foreign key to "DutchItem", a table this product never
-- fills (items are served from the JSON bundles), so every attempt insert failed. Drop only that key; "itemId" stays a required
-- text column with its index ("DutchAttempt_itemId_idx"). No data changes. IF EXISTS: safe if the key is already gone.
ALTER TABLE "DutchAttempt" DROP CONSTRAINT IF EXISTS "DutchAttempt_itemId_fkey";
