import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  integer,
  date,
  uniqueIndex,
  decimal,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable(
    "users",
    {
      id: serial("id").primaryKey(),
      name: text("name"),
      email: text("email").notNull(),
      password: text("password").notNull(),
      familyId: integer("family_id").references((): any => families.id),
      createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (users) => ({
      uniqueIdx: uniqueIndex("unique_idx").on(users.email),
    }),
);

export const families = pgTable("families", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  ownerId: integer("owner_id")
      .notNull()
      .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  categoryId: integer("category_id").references(() => categories.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  paymentMethod: text("payment_method"),
  date: date("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: text("created_by"),
});

export const incomes = pgTable("incomes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  source: varchar("source", { length: 256 }).notNull(),
  description: text("description"),
  date: date("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: text("created_by"),
});

export const budgets = pgTable(
  "budgets",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    month: integer("month").notNull(), // 1-12
    year: integer("year").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    createdBy: text("created_by"),
  },
  (budgets) => {
    return {
      uniqueBudget: uniqueIndex("unique_budget_idx").on(
        budgets.userId,
        budgets.categoryId,
        budgets.year,
        budgets.month,
      ),
    };
  },
);

export const recurringTransactions = pgTable("recurring_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  categoryId: integer("category_id").references(() => categories.id), // For expenses
  source: varchar("source", { length: 256 }),
  frequency: varchar("frequency", { length: 50 }).notNull(),
  startDate: date("start_date").notNull(),
  nextDate: date("next_date").notNull(),
  endDate: date("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: text("created_by"),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  expenses: many(expenses),
  categories: many(categories),
  incomes: many(incomes),
  budgets: many(budgets),
  recurringTransactions: many(recurringTransactions),
  financialGoals: many(financialGoals),
  customReports: many(customReports),
  family: one(families, {
    fields: [users.familyId],
    references: [families.id],
    relationName: "family_members",
  }),
  ownedFamily: one(families, {
    fields: [users.id],
    references: [families.ownerId],
    relationName: "family_owner",
  }),
}));

export const familiesRelations = relations(families, ({ one, many }) => ({
  members: many(users, { relationName: "family_members" }),
  owner: one(users, {
    fields: [families.ownerId],
    references: [users.id],
    relationName: "family_owner",
  }),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, {
    fields: [categories.userId],
    references: [users.id],
  }),
  expenses: many(expenses),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  user: one(users, {
    fields: [expenses.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [expenses.categoryId],
    references: [categories.id],
  }),
}));

export const incomesRelations = relations(incomes, ({ one }) => ({
  user: one(users, {
    fields: [incomes.userId],
    references: [users.id],
  }),
}));

export const budgetsRelations = relations(budgets, ({ one }) => ({
  user: one(users, {
    fields: [budgets.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [budgets.categoryId],
    references: [categories.id],
  }),
}));

export const recurringTransactionsRelations = relations(
  recurringTransactions,
  ({ one }) => ({
    user: one(users, {
      fields: [recurringTransactions.userId],
      references: [users.id],
    }),
    category: one(categories, {
      fields: [recurringTransactions.categoryId],
      references: [categories.id],
    }),
  }),
);

export const financialGoals = pgTable("financial_goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  name: varchar("name", { length: 256 }).notNull(),
  targetAmount: decimal("target_amount", { precision: 12, scale: 2 }).notNull(),
  currentAmount: decimal("current_amount", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),
  targetDate: date("target_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: text("created_by"),
});

export const financialGoalsRelations = relations(financialGoals, ({ one }) => ({
  user: one(users, {
    fields: [financialGoals.userId],
    references: [users.id],
  }),
}));

export const customReports = pgTable("custom_reports", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  filters: jsonb("filters").notNull().default('{}'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customReportsRelations = relations(customReports, ({ one }) => ({
  user: one(users, {
    fields: [customReports.userId],
    references: [users.id],
  }),
}));