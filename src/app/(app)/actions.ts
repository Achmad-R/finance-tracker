"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { toSen } from "@/lib/format";
import { z } from "zod";
import {
  accountSchema,
  budgetSchema,
  categorySchema,
  credentialsSchema,
  field,
  recurringSchema,
  transactionSchema,
} from "@/lib/validation";

const uuid = z.string().uuid();

async function userIdOrNull() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function signInWithPassword(formData: FormData) {
  const parsed = credentialsSchema.safeParse({
    email: field(formData, "email"),
    password: field(formData, "password"),
  });
  if (!parsed.success) redirect("/login?error=1");

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) redirect("/login?error=1");
  redirect("/dashboard");
}

export async function createAccount(formData: FormData) {
  const userId = await userIdOrNull();
  if (!userId) return;
  const parsed = accountSchema.safeParse({
    name: field(formData, "name"),
    type: field(formData, "type"),
  });
  if (!parsed.success) return;

  const supabase = createClient();
  await supabase
    .from("accounts")
    .insert({ user_id: userId, name: parsed.data.name, type: parsed.data.type });
  revalidatePath("/accounts");
  revalidatePath("/dashboard");
}

export async function createCategory(formData: FormData) {
  const userId = await userIdOrNull();
  if (!userId) return;
  const parsed = categorySchema.safeParse({
    name: field(formData, "name"),
    kind: field(formData, "kind"),
    parent_id: field(formData, "parent_id"),
  });
  if (!parsed.success) return;

  const supabase = createClient();
  await supabase.from("categories").insert({
    user_id: userId,
    name: parsed.data.name,
    kind: parsed.data.kind,
    parent_id: parsed.data.parent_id ?? null,
  });
  revalidatePath("/categories");
}

export async function createTransaction(formData: FormData) {
  const userId = await userIdOrNull();
  if (!userId) return;
  const parsed = transactionSchema.safeParse({
    type: field(formData, "type"),
    account_id: field(formData, "account_id"),
    to_account_id: field(formData, "to_account_id"),
    category_id: field(formData, "category_id"),
    amount: field(formData, "amount"),
    occurred_at: field(formData, "occurred_at"),
    note: field(formData, "note"),
  });
  if (!parsed.success) return;
  const d = parsed.data;
  if (d.type === "transfer" && !d.to_account_id) return;

  const supabase = createClient();
  await supabase.from("transactions").insert({
    user_id: userId,
    type: d.type,
    account_id: d.account_id,
    to_account_id: d.type === "transfer" ? d.to_account_id ?? null : null,
    category_id: d.type === "transfer" ? null : d.category_id ?? null,
    amount: toSen(d.amount),
    occurred_at: new Date(d.occurred_at).toISOString(),
    note: d.note ?? null,
  });
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
}

export async function createBudget(formData: FormData) {
  const userId = await userIdOrNull();
  if (!userId) return;
  const parsed = budgetSchema.safeParse({
    category_id: field(formData, "category_id"),
    amount: field(formData, "amount"),
    month: field(formData, "month"),
  });
  if (!parsed.success) return;

  const supabase = createClient();
  await supabase.from("budgets").insert({
    user_id: userId,
    category_id: parsed.data.category_id,
    amount: toSen(parsed.data.amount),
    month: `${parsed.data.month}-01`,
  });
  revalidatePath("/budgets");
}

export async function createRecurring(formData: FormData) {
  const userId = await userIdOrNull();
  if (!userId) return;
  const parsed = recurringSchema.safeParse({
    type: field(formData, "type"),
    account_id: field(formData, "account_id"),
    category_id: field(formData, "category_id"),
    amount: field(formData, "amount"),
    frequency: field(formData, "frequency"),
    interval: field(formData, "interval"),
    next_run: field(formData, "next_run"),
    end_at: field(formData, "end_at"),
  });
  if (!parsed.success) return;
  const d = parsed.data;
  if (d.type === "transfer" && !d.to_account_id) return;

  const supabase = createClient();
  await supabase.from("recurring_rules").insert({
    user_id: userId,
    type: d.type,
    account_id: d.account_id,
    category_id: d.type === "transfer" ? null : d.category_id ?? null,
    amount: toSen(d.amount),
    frequency: d.frequency,
    interval: d.interval,
    next_run: new Date(d.next_run).toISOString(),
    end_at: d.end_at ? new Date(d.end_at).toISOString() : null,
  });
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
}

export async function updateAccount(formData: FormData) {
  const userId = await userIdOrNull();
  if (!userId) return;
  const id = field(formData, "id");
  if (!uuid.safeParse(id).success) return;
  const parsed = accountSchema.safeParse({
    name: field(formData, "name"),
    type: field(formData, "type"),
  });
  if (!parsed.success) return;

  const supabase = createClient();
  await supabase
    .from("accounts")
    .update({ name: parsed.data.name, type: parsed.data.type })
    .eq("id", id)
    .eq("user_id", userId);
  revalidatePath("/accounts");
  revalidatePath("/dashboard");
}

export async function updateTransaction(formData: FormData) {
  const userId = await userIdOrNull();
  if (!userId) return;
  const id = field(formData, "id");
  if (!uuid.safeParse(id).success) return;
  const parsed = transactionSchema.safeParse({
    type: field(formData, "type"),
    account_id: field(formData, "account_id"),
    to_account_id: field(formData, "to_account_id"),
    category_id: field(formData, "category_id"),
    amount: field(formData, "amount"),
    occurred_at: field(formData, "occurred_at"),
    note: field(formData, "note"),
  });
  if (!parsed.success || (parsed.data.type === "transfer" && !parsed.data.to_account_id)) {
    redirect(`/transactions/${id}/edit?error=1`);
  }
  const d = parsed.data;

  const supabase = createClient();
  const { error } = await supabase
    .from("transactions")
    .update({
      type: d.type,
      account_id: d.account_id,
      to_account_id: d.type === "transfer" ? d.to_account_id ?? null : null,
      category_id: d.type === "transfer" ? null : d.category_id ?? null,
      amount: toSen(d.amount),
      occurred_at: new Date(d.occurred_at).toISOString(),
      note: d.note ?? null,
    })
    .eq("id", id)
    .eq("user_id", userId);
  if (error) redirect(`/transactions/${id}/edit?error=1`);
  redirect("/transactions");
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
}

export async function deleteTransaction(id: string) {
  const userId = await userIdOrNull();
  if (!userId || !uuid.safeParse(id).success) return;
  const supabase = createClient();
  await supabase.from("transactions").delete().eq("id", id).eq("user_id", userId);
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
}

export async function deleteAccount(id: string) {
  const userId = await userIdOrNull();
  if (!userId || !uuid.safeParse(id).success) return;
  const supabase = createClient();
  await supabase.from("accounts").delete().eq("id", id).eq("user_id", userId);
  revalidatePath("/accounts");
  revalidatePath("/dashboard");
}

export async function deleteCategory(id: string) {
  const userId = await userIdOrNull();
  if (!userId || !uuid.safeParse(id).success) return;
  const supabase = createClient();
  await supabase.from("categories").delete().eq("id", id).eq("user_id", userId);
  revalidatePath("/categories");
}

export async function deleteBudget(id: string) {
  const userId = await userIdOrNull();
  if (!userId || !uuid.safeParse(id).success) return;
  const supabase = createClient();
  await supabase.from("budgets").delete().eq("id", id).eq("user_id", userId);
  revalidatePath("/budgets");
}

export async function deleteRecurring(id: string) {
  const userId = await userIdOrNull();
  if (!userId || !uuid.safeParse(id).success) return;
  const supabase = createClient();
  await supabase.from("recurring_rules").delete().eq("id", id).eq("user_id", userId);
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
}

export async function seedDemo() {
  const userId = await userIdOrNull();
  if (!userId) return;
  const supabase = createClient();

  const now = new Date();
  const iso = (offsetDays: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - offsetDays);
    return d.toISOString();
  };

  const { data: accounts } = await supabase
    .from("accounts")
    .insert([
      { user_id: userId, name: "Bank BCA", type: "asset" },
      { user_id: userId, name: "Dompet", type: "asset" },
      { user_id: userId, name: "Kartu Kredit", type: "liability" },
    ])
    .select();

  const { data: parents } = await supabase
    .from("categories")
    .insert([
      { user_id: userId, name: "Pemasukan", kind: "income" },
      { user_id: userId, name: "Makanan", kind: "expense" },
      { user_id: userId, name: "Transport", kind: "expense" },
      { user_id: userId, name: "Hiburan", kind: "expense" },
      { user_id: userId, name: "Tagihan", kind: "expense" },
    ])
    .select();

  const pid = (name: string) => parents?.find((c) => c.name === name)?.id;
  const { data: children } = await supabase
    .from("categories")
    .insert([
      { user_id: userId, name: "Restoran", kind: "expense", parent_id: pid("Makanan") },
      { user_id: userId, name: "Listrik", kind: "expense", parent_id: pid("Tagihan") },
    ])
    .select();

  const categories = [...(parents ?? []), ...(children ?? [])];
  const id = (name: string) => categories.find((c) => c.name === name)?.id;
  const acc = (name: string) => accounts?.find((a) => a.name === name)?.id;

  const bank = acc("Bank BCA")!;
  const cash = acc("Dompet")!;
  const card = acc("Kartu Kredit")!;
  const makanan = id("Makanan")!;
  const restoran = id("Restoran")!;
  const transport = id("Transport")!;
  const hiburan = id("Hiburan")!;
  const listrik = id("Listrik")!;
  const pemasukan = id("Pemasukan")!;

  await supabase.from("transactions").insert([
    { user_id: userId, type: "opening", account_id: bank, amount: toSen(10000000), occurred_at: iso(90), note: "Saldo awal" },
    { user_id: userId, type: "opening", account_id: cash, amount: toSen(500000), occurred_at: iso(90), note: "Saldo awal" },
    { user_id: userId, type: "opening", account_id: card, amount: toSen(2000000), occurred_at: iso(90), note: "Saldo awal" },
    { user_id: userId, type: "income", account_id: bank, category_id: pemasukan, amount: toSen(8000000), occurred_at: iso(60), note: "Gaji" },
    { user_id: userId, type: "income", account_id: bank, category_id: pemasukan, amount: toSen(8000000), occurred_at: iso(30), note: "Gaji" },
    { user_id: userId, type: "expense", account_id: bank, category_id: makanan, amount: toSen(120000), occurred_at: iso(55) },
    { user_id: userId, type: "expense", account_id: card, category_id: restoran, amount: toSen(250000), occurred_at: iso(50) },
    { user_id: userId, type: "expense", account_id: cash, category_id: transport, amount: toSen(30000), occurred_at: iso(45) },
    { user_id: userId, type: "expense", account_id: cash, category_id: hiburan, amount: toSen(75000), occurred_at: iso(40) },
    { user_id: userId, type: "expense", account_id: card, category_id: listrik, amount: toSen(350000), occurred_at: iso(35) },
    { user_id: userId, type: "transfer", account_id: bank, to_account_id: card, amount: toSen(500000), occurred_at: iso(20), note: "Bayar kartu kredit" },
  ]);

  const monthNow = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  await supabase.from("budgets").insert([
    { user_id: userId, category_id: makanan, amount: toSen(2000000), month: `${monthNow}-01` },
    { user_id: userId, category_id: transport, amount: toSen(500000), month: `${monthNow}-01` },
    { user_id: userId, category_id: hiburan, amount: toSen(500000), month: `${monthNow}-01` },
  ]);

  const nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1, 1);
  await supabase.from("recurring_rules").insert({
    user_id: userId,
    type: "income",
    account_id: bank,
    category_id: pemasukan,
    amount: toSen(8000000),
    frequency: "monthly",
    interval: 1,
    next_run: nextMonth.toISOString(),
    end_at: null,
    note: "Gaji bulanan",
  });

  revalidatePath("/dashboard");
  revalidatePath("/accounts");
  revalidatePath("/transactions");
  revalidatePath("/categories");
  revalidatePath("/budgets");
  revalidatePath("/reports");
}
