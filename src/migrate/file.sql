CREATE TABLE "budgets" (
                           "id" serial PRIMARY KEY NOT NULL,
                           "user_id" integer NOT NULL,
                           "category_id" integer NOT NULL,
                           "amount" numeric(10, 2) NOT NULL,
                           "month" integer NOT NULL,
                           "year" integer NOT NULL,
                           "created_at" timestamp DEFAULT now() NOT NULL,
                           "created_by" integer NOT NULL
);

CREATE TABLE "categories" (
                              "id" serial PRIMARY KEY NOT NULL,
                              "name" varchar(256) NOT NULL,
                              "user_id" integer NOT NULL,
                              "created_at" timestamp DEFAULT now() NOT NULL,
                              "created_by" integer NOT NULL
);

CREATE TABLE "expenses" (
                            "id" serial PRIMARY KEY NOT NULL,
                            "user_id" integer NOT NULL,
                            "category_id" integer,
                            "amount" numeric(10, 2) NOT NULL,
                            "description" text,
                            "date" date NOT NULL,
                            "created_at" timestamp DEFAULT now() NOT NULL,
                            "created_by" integer NOT NULL
);

CREATE TABLE "incomes" (
                           "id" serial PRIMARY KEY NOT NULL,
                           "user_id" integer NOT NULL,
                           "amount" numeric(10, 2) NOT NULL,
                           "source" varchar(256) NOT NULL,
                           "description" text,
                           "date" date NOT NULL,
                           "created_at" timestamp DEFAULT now() NOT NULL,
                           "created_by" integer NOT NULL
);

CREATE TABLE "recurring_transactions" (
                                          "id" serial PRIMARY KEY NOT NULL,
                                          "user_id" integer NOT NULL,
                                          "type" varchar(50) NOT NULL,
                                          "amount" numeric(10, 2) NOT NULL,
                                          "description" text,
                                          "category_id" integer,
                                          "source" varchar(256),
                                          "frequency" varchar(50) NOT NULL,
                                          "start_date" date NOT NULL,
                                          "next_date" date NOT NULL,
                                          "end_date" date,
                                          "created_at" timestamp DEFAULT now() NOT NULL,
                                          "created_by" integer NOT NULL
);

CREATE TABLE "users" (
                         "id" serial PRIMARY KEY NOT NULL,
                         "name" text,
                         "email" text NOT NULL,
                         "password" text NOT NULL,
                         "created_at" timestamp DEFAULT now() NOT NULL,
);

ALTER TABLE "budgets"
    ADD CONSTRAINT "budgets_user_id_users_id_fk"
        FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "budgets"
    ADD CONSTRAINT "budgets_category_id_categories_id_fk"
        FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "budgets"
    ADD CONSTRAINT "budgets_created_by_users_id_fk"
        FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "categories"
    ADD CONSTRAINT "categories_user_id_users_id_fk"
        FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "categories"
    ADD CONSTRAINT "categories_created_by_users_id_fk"
        FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "expenses"
    ADD CONSTRAINT "expenses_user_id_users_id_fk"
        FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "expenses"
    ADD CONSTRAINT "expenses_category_id_categories_id_fk"
        FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "expenses"
    ADD CONSTRAINT "expenses_created_by_users_id_fk"
        FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "incomes"
    ADD CONSTRAINT "incomes_user_id_users_id_fk"
        FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "incomes"
    ADD CONSTRAINT "incomes_created_by_users_id_fk"
        FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "recurring_transactions"
    ADD CONSTRAINT "recurring_transactions_user_id_users_id_fk"
        FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "recurring_transactions"
    ADD CONSTRAINT "recurring_transactions_category_id_categories_id_fk"
        FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "recurring_transactions"
    ADD CONSTRAINT "recurring_transactions_created_by_users_id_fk"
        FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

CREATE UNIQUE INDEX "unique_budget_idx"
    ON "budgets" USING btree ("user_id", "category_id", "year", "month");

CREATE UNIQUE INDEX "unique_idx"
    ON "users" USING btree ("email");
