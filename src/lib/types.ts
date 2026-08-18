export type AccountType = "asset" | "liability";
export type CategoryKind = "income" | "expense";
export type TransactionType = "income" | "expense" | "transfer" | "opening";
export type Frequency = "daily" | "weekly" | "monthly";

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  parent_id: string | null;
  kind: CategoryKind;
}

export interface TransactionRow {
  id: string;
  user_id: string;
  account_id: string;
  to_account_id: string | null;
  category_id: string | null;
  amount: number;
  type: TransactionType;
  occurred_at: string;
  note: string | null;
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  month: string;
}

export interface RecurringRule {
  id: string;
  user_id: string;
  account_id: string;
  to_account_id: string | null;
  category_id: string | null;
  amount: number;
  type: TransactionType;
  frequency: Frequency;
  interval: number;
  next_run: string;
  end_at: string | null;
  note: string | null;
}
