import { z } from "zod";

const optId = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.string().uuid().optional()
);

const optStr = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.string().trim().max(200).optional()
);

export function field(formData: FormData, key: string): string {
  const v = formData.get(key);
  return v === null ? "" : String(v);
}

export const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

export const accountSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(80),
  type: z.enum(["asset", "liability"]),
});

export const categorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(80),
  kind: z.enum(["income", "expense"]),
  parent_id: optId,
});

export const transactionSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.enum(["income", "expense", "transfer", "opening"]),
  account_id: z.string().uuid(),
  to_account_id: optId,
  category_id: optId,
  amount: z.coerce.number().positive().max(1e15),
  occurred_at: z.string().min(1),
  note: optStr,
});

export const budgetSchema = z.object({
  category_id: z.string().uuid(),
  amount: z.coerce.number().positive().max(1e15),
  month: z.string().regex(/^\d{4}-\d{2}$/, "Format bulan tidak valid"),
});

export const recurringSchema = z.object({
  type: z.enum(["income", "expense", "transfer", "opening"]),
  account_id: z.string().uuid(),
  to_account_id: optId,
  category_id: optId,
  amount: z.coerce.number().positive().max(1e15),
  frequency: z.enum(["daily", "weekly", "monthly"]),
  interval: z.coerce.number().int().min(1).max(365),
  next_run: z.string().min(1),
  end_at: optStr,
});
