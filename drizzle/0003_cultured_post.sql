CREATE TABLE "families" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "family_id" integer;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_family_id_families_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."families"("id") ON DELETE no action ON UPDATE no action;