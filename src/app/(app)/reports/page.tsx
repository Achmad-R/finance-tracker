import { createClient } from "@/lib/supabase/server";
import {
  categoryBreakdown,
  monthlyCashflow,
  netWorthSeries,
} from "@/lib/aggregate";
import { formatIDR, fromSen, monthLabel } from "@/lib/format";
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
          <div className="space-y-2 sm:hidden">
            {cashflow.map((c) => (
              <div key={c.month} className="rounded-lg border border-hairline p-3">
                <p className="text-xs font-semibold text-secondary">
                  {monthLabel(c.month)}
                </p>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="text-secondary">Pemasukan</span>
                    <span className="tabular whitespace-nowrap text-positive">
                      {formatIDR(c.income * 100)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-secondary">Pengeluaran</span>
                    <span className="tabular whitespace-nowrap text-negative">
                      {formatIDR(c.expense * 100)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2 border-t border-hairline pt-1">
                    <span className="font-medium text-ink">Net</span>
                    <span className="tabular whitespace-nowrap font-medium text-ink">
                      {formatIDR((c.income - c.expense) * 100)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden overflow-x-auto sm:block">
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
                    <td className="whitespace-nowrap py-2 text-ink">{monthLabel(c.month)}</td>
                    <td className="whitespace-nowrap py-2 text-right tabular text-positive">
                      {formatIDR(c.income * 100)}
                    </td>
                    <td className="whitespace-nowrap py-2 text-right tabular text-negative">
                      {formatIDR(c.expense * 100)}
                    </td>
                    <td className="whitespace-nowrap py-2 text-right tabular text-ink">
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
