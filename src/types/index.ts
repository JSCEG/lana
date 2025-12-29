export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  description: string;
  date: string;
  type: 'fixed_expense' | 'variable_expense' | 'income';
  frequency: 'one_time' | 'monthly' | 'yearly';
  created_at: string;
  category?: Category;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  amount_limit: number;
  period: string;
  category: Category;
  spent: number; // Calculated field
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline?: string;
  created_at: string;
}

export interface Investment {
  id: string;
  user_id: string;
  name: string;
  asset_type: string;
  invested_amount: number;
  current_value: number;
  purchase_date: string;
  created_at: string;
}
