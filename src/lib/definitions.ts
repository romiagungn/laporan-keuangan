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
