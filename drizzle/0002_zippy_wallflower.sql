ALTER TABLE "budgets" ADD COLUMN "created_by" text;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "created_by" text;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "created_by" text;--> statement-breakpoint
ALTER TABLE "incomes" ADD COLUMN "created_by" text;--> statement-breakpoint
ALTER TABLE "recurring_transactions" ADD COLUMN "created_by" text;