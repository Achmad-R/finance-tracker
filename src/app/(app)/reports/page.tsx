import { createClient } from "@/lib/supabase/server";
import {
  categoryBreakdown,
  monthlyCashflow,
  netWorthSeries,
} from "@/lib/aggregate";
import { formatIDR, fromSen } from "@/lib/format";
import { Card, PageHeader } from "@/components/ui";
import { CategoryChart, CashflowChart, NetWorthChart } from "@/components/charts";

export default async function ReportsPage() {
  const supabase = createClient();
  const [{ data: accounts }, { data: transactions }, { data: categories }] =
    await Promise.all([
      supabase.from("accounts").select("*"),
      supabase.from("transactions").select("*"),
      supabase.from("categories").select("*"),
    ]);

  const accs = accounts ?? [];
  const txs = transactions ?? [];
  const cats = categories ?? [];

  const now = new Date();
  const cm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const cashflow = monthlyCashflow(txs).map((c) => ({
    month: c.month,
    income: fromSen(c.income),
    expense: fromSen(c.expense),
  }));
  const breakdown = categoryBreakdown(txs, cats, cm).map((s) => ({
    name: s.name,
    amount: fromSen(s.amount),
  }));
  const nw = netWorthSeries(accs, txs).map((p) => ({
    month: p.month,
    value: fromSen(p.value),
  }));

  return (
    <div>
      <PageHeader title="Laporan" />

      <div className="space-y-4">
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-ink">Net Worth</h2>
          <NetWorthChart data={nw} />
        </Card>
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-ink">Cashflow Bulanan</h2>
          <CashflowChart data={cashflow} />
        </Card>
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-ink">Pengeluaran per Kategori</h2>
          <CategoryChart data={breakdown} />
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-semibold text-ink">Ringkasan Bulanan</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-hairline text-left text-secondary">
                  <th className="py-2">Bulan</th>
                  <th className="py-2 text-right">Pemasukan</th>
                  <th className="py-2 text-right">Pengeluaran</th>
                  <th className="py-2 text-right">Net</th>
                </tr>
              </thead>
              <tbody>
                {cashflow.map((c) => (
                  <tr key={c.month} className="border-b border-hairline">
                    <td className="py-2 text-ink">{c.month}</td>
                    <td className="py-2 text-right tabular text-positive">
                      {formatIDR(c.income * 100)}
                    </td>
                    <td className="py-2 text-right tabular text-negative">
                      {formatIDR(c.expense * 100)}
                    </td>
                    <td className="py-2 text-right tabular text-ink">
                      {formatIDR((c.income - c.expense) * 100)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
