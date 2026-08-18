import { createClient } from "@/lib/supabase/server";
import { formatIDR, monthLabel } from "@/lib/format";
import { Button, Card, Input, Label, PageHeader, Select } from "@/components/ui";
import DeleteButton from "@/components/DeleteButton";
import { createBudget, deleteBudget } from "../actions";

export default async function BudgetsPage() {
  const supabase = createClient();
  const [{ data: budgets }, { data: categories }, { data: transactions }] =
    await Promise.all([
      supabase.from("budgets").select("*").order("month", { ascending: false }),
      supabase.from("categories").select("*"),
      supabase.from("transactions").select("*"),
    ]);

  const catName = new Map((categories ?? []).map((c) => [c.id, c.name]));
  const txs = transactions ?? [];
  const bList = budgets ?? [];

  const spentFor = (categoryId: string, month: string) =>
    txs
      .filter(
        (t) =>
          t.type === "expense" &&
          t.category_id === categoryId &&
          t.occurred_at.slice(0, 7) === month.slice(0, 7)
      )
      .reduce((s, t) => s + t.amount, 0);

  const now = new Date();
  const monthDefault = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const expenseCats = (categories ?? []).filter((c) => c.kind === "expense");

  return (
    <div>
      <PageHeader title="Budget" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {bList.length === 0 ? (
            <Card>
              <p className="text-sm text-secondary">Belum ada budget.</p>
            </Card>
          ) : (
            bList.map((b) => {
              const spent = spentFor(b.category_id, b.month);
              const pct = b.amount > 0 ? Math.min(100, Math.round((spent / b.amount) * 100)) : 0;
              const over = spent > b.amount;
              return (
                <Card key={b.id}>
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-ink">{catName.get(b.category_id)}</p>
                      <p className="text-xs text-secondary">{monthLabel(b.month)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="tabular text-sm text-ink">
                        {formatIDR(spent * 100)} / {formatIDR(b.amount * 100)}
                      </p>
                      <DeleteButton action={deleteBudget} id={b.id} label="Hapus budget" />
                    </div>
                   </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-hairline">
                    <div
                      className={`h-full rounded-full ${over ? "bg-negative" : "bg-cta"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {over && (
                    <p className="mt-1 text-xs text-negative">Melebihi budget!</p>
                  )}
                </Card>
              );
            })
          )}
        </div>

        <Card>
          <h2 className="mb-3 text-sm font-semibold text-ink">Tambah Budget</h2>
          <form action={createBudget} className="space-y-3">
            <div>
              <Label htmlFor="category_id">Kategori</Label>
              <Select id="category_id" name="category_id" required>
                <option value="">Pilih kategori</option>
                {expenseCats.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="amount">Limit (Rp)</Label>
              <Input id="amount" name="amount" type="number" min="0" step="100" required />
            </div>
            <div>
              <Label htmlFor="month">Bulan</Label>
              <Input id="month" name="month" type="month" defaultValue={monthDefault} required />
            </div>
            <Button>Tambah</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
