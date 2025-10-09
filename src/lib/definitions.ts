import { financialGoals } from "@/lib/schema";

export type Expense = {
  id: number;
  user_id: string;
  date: string;
  category: string;
  description?: string | null;
  amount: number;
  payment_method?: string | null;
  created_at: string;
  created_by?: string | null;
};

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};

export type Category = {
  id: number;
  name: string;
  userId: number;
};

export type Income = {
  id: number;
  userId: number;
  date: string;
  source: string;
  description?: string | null;
  amount: number;
  createdAt: string;
};

export type RecurringTransaction = {
  id: number;
  userId: number;
  type: string;
  amount: number;
  description?: string | null;
  categoryId?: number | null;
  source?: string | null;
  frequency: string;
  startDate: string;
  nextDate: string;
  endDate?: string | null;
  createdAt: string;
};

export type FinancialGoal = typeof financialGoals.$inferSelect;