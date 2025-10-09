-- CREATE TABLE "custom_reports" (
-- 	"id" serial PRIMARY KEY NOT NULL,
-- 	"name" varchar(256) NOT NULL,
-- 	"user_id" integer NOT NULL,
-- 	"filters" jsonb DEFAULT '{}' NOT NULL,
-- 	"created_at" timestamp DEFAULT now() NOT NULL
-- );
-- --> statement-breakpoint
-- Add the owner_id column as nullable
ALTER TABLE "families" ADD COLUMN "owner_id" integer;
--> statement-breakpoint
-- Update existing families to have a default owner (the first user)
UPDATE "families" SET "owner_id" = (SELECT id FROM "users" ORDER BY id ASC LIMIT 1) WHERE "owner_id" IS NULL;
--> statement-breakpoint
-- Now, set the column to NOT NULL
ALTER TABLE "families" ALTER COLUMN "owner_id" SET NOT NULL;
--> statement-breakpoint
-- ALTER TABLE "custom_reports" ADD CONSTRAINT "custom_reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
-- --> statement-breakpoint
ALTER TABLE "families" ADD CONSTRAINT "families_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;