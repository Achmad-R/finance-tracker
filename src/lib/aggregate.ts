import type { Account, Category, TransactionRow } from "@/lib/types";

type Tx = TransactionRow;

function contribution(tx: Tx, accountId: string, isLiability: boolean): number {
  const isSource = tx.account_id === accountId;
  const isDest = tx.to_account_id === accountId;

  if (!isSource && !isDest) return 0;

  if (!isLiability) {
    if (tx.type === "income" || tx.type === "opening") return isSource ? tx.amount : 0;
    if (tx.type === "expense") return isSource ? -tx.amount : 0;
    // transfer
    if (tx.type === "transfer") return isSource ? -tx.amount : tx.amount;
    return 0;
  }

  // liability
  if (tx.type === "expense" || tx.type === "opening") return isSource ? tx.amount : 0;
  if (tx.type === "transfer") return isSource ? tx.amount : -tx.amount;
  return 0;
}

export interface AccountBalance extends Account {
  balance: number;
}

export function deriveBalances(
  accounts: Account[],
  transactions: Tx[]
): { balances: AccountBalance[]; netWorth: number } {
  const netByAccount = new Map<string, number>();
  for (const acc of accounts) netByAccount.set(acc.id, 0);

  for (const tx of transactions) {
    if (tx.account_id) {
      const acc = accounts.find((a) => a.id === tx.account_id);
      if (acc) {
        netByAccount.set(
          acc.id,
          (netByAccount.get(acc.id) ?? 0) +
            contribution(tx, acc.id, acc.type === "liability")
        );
      }
    }
    if (tx.to_account_id) {
      const acc = accounts.find((a) => a.id === tx.to_account_id);
      if (acc) {
        netByAccount.set(
          acc.id,
          (netByAccount.get(acc.id) ?? 0) +
            contribution(tx, acc.id, acc.type === "liability")
        );
      }
    }
  }

  let netWorth = 0;
  const balances: AccountBalance[] = accounts.map((acc) => {
    const balance = netByAccount.get(acc.id) ?? 0;
    if (acc.type === "asset") netWorth += balance;
    else netWorth -= balance;
    return { ...acc, balance };
  });

  return { balances, netWorth };
}

function monthKeyOf(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export interface MonthlyCashflow {
  month: string;
  income: number;
  expense: number;
}

export function monthlyCashflow(transactions: Tx[]): MonthlyCashflow[] {
  const map = new Map<string, { income: number; expense: number }>();
  for (const tx of transactions) {
    if (tx.type === "income") {
      const k = monthKeyOf(tx.occurred_at);
      const cur = map.get(k) ?? { income: 0, expense: 0 };
      cur.income += tx.amount;
      map.set(k, cur);
    } else if (tx.type === "expense") {
      const k = monthKeyOf(tx.occurred_at);
      const cur = map.get(k) ?? { income: 0, expense: 0 };
      cur.expense += tx.amount;
      map.set(k, cur);
    }
  }
  return Array.from(map.entries())
    .map(([month, v]) => ({ month, ...v }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

export interface CategorySlice {
  name: string;
  amount: number;
}

export function categoryBreakdown(
  transactions: Tx[],
  categories: Category[],
  month: string
): CategorySlice[] {
  const byId = new Map(categories.map((c) => [c.id, c]));
  const totals = new Map<string, number>();

  for (const tx of transactions) {
    if (tx.type !== "expense") continue;
    if (monthKeyOf(tx.occurred_at) !== month) continue;
    if (!tx.category_id) {
      totals.set("(Tanpa kategori)", (totals.get("(Tanpa kategori)") ?? 0) + tx.amount);
      continue;
    }
    const cat = byId.get(tx.category_id);
    const name = cat ? cat.name : "(Tanpa kategori)";
    totals.set(name, (totals.get(name) ?? 0) + tx.amount);
  }

  return Array.from(totals.entries())
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export interface NetWorthPoint {
  month: string;
  value: number;
}

export function netWorthSeries(
  accounts: Account[],
  transactions: Tx[]
): NetWorthPoint[] {
  const liability = new Set(
    accounts.filter((a) => a.type === "liability").map((a) => a.id)
  );

  const sorted = [...transactions].sort(
    (a, b) => new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime()
  );

  let cum = 0;
  let lastMonth = "";
  const points: NetWorthPoint[] = [];

  for (const tx of sorted) {
    const apply = (accountId: string, delta: number) => {
      if (!accountId) return;
      cum += liability.has(accountId) ? -delta : delta;
    };
    if (tx.type === "income" || tx.type === "opening") apply(tx.account_id, tx.amount);
    else if (tx.type === "expense") apply(tx.account_id, -tx.amount);
    else if (tx.type === "transfer") {
      apply(tx.account_id, -tx.amount);
      apply(tx.to_account_id ?? "", tx.amount);
    }

    const m = monthKeyOf(tx.occurred_at);
    if (m !== lastMonth) {
      points.push({ month: m, value: cum });
      lastMonth = m;
    } else if (points.length > 0) {
      points[points.length - 1].value = cum;
    }
  }

  return points;
}
