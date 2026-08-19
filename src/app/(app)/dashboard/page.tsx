import { createClient } from "@/lib/supabase/server";
import { runDueRecurring } from "@/lib/recurring";
import {
  categoryBreakdown,
  deriveBalances,
  monthlyCashflow,
  netWorthSeries,
} from "@/lib/aggregate";
import { formatIDR, fromSen } from "@/lib/format";
import { Card, PageHeader, StatCard } from "@/components/ui";
import { CategoryChart, CashflowChart, NetWorthChart } from "@/components/charts";
import { seedDemo } from "../actions";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user!.id;

  await runDueRecurring(supabase, userId);

  const [{ data: accounts }, { data: transactions }, { data: categories }] =
    await Promise.all([
      supabase.from("accounts").select("*"),
      supabase.from("transactions").select("*"),
      supabase.from("categories").select("*"),
    ]);

  const accs = accounts ?? [];
  const txs = transactions ?? [];
  const cats = categories ?? [];

  const { balances, netWorth } = deriveBalances(accs, txs);
  const totalAssets = balances.filter((b) => b.type === "asset").reduce((s, b) => s + b.balance, 0);
  const totalLiabilities = balances
    .filter((b) => b.type === "liability")
    .reduce((s, b) => s + b.balance, 0);

  const now = new Date();
  const cm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const cashflow = monthlyCashflow(txs);
  const current = cashflow.find((c) => c.month === cm);
  const breakdown = categoryBreakdown(txs, cats, cm).map((s) => ({
    name: s.name,
    amount: fromSen(s.amount),
  }));
  const nw = netWorthSeries(accs, txs).map((p) => ({
    month: p.month,
    value: fromSen(p.value),
  }));

  const isEmpty = accs.length === 0;

  return (
    <div>
      <PageHeader title="Dashboard" />

      {isEmpty && (
        <Card className="mb-6 flex items-center justify-between">
          <div>
            <p className="font-medium text-ink">Belum ada data</p>
            <p className="text-sm text-secondary">
              Isi data contoh agar dashboard langsung terlihat hidup.
            </p>
          </div>
          <form action={seedDemo}>
            <button
              type="submit"
              className="cursor-pointer rounded-lg bg-cta px-4 py-2 font-semibold text-white transition-all duration-200 hover:opacity-90"
            >
              Isi data demo
            </button>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Net Worth" value={formatIDR(netWorth)} tone={netWorth >= 0 ? "positive" : "negative"} />
        <StatCard label="Total Aset" value={formatIDR(totalAssets)} />
        <StatCard label="Total Liabilitas" value={formatIDR(totalLiabilities)} tone="negative" />
        <StatCard
          label="Bulan ini"
          value={formatIDR(current?.income ?? 0)}
          hint={`Keluar ${formatIDR(current?.expense ?? 0)}`}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-ink">Tren Net Worth</h2>
          <NetWorthChart data={nw} />
        </Card>
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-ink">Cashflow Bulanan</h2>
          <CashflowChart
            data={cashflow.map((c) => ({
              month: c.month,
              income: fromSen(c.income),
              expense: fromSen(c.expense),
            }))}
          />
        </Card>
        <Card className="lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold text-ink">Pengeluaran per Kategori</h2>
          <CategoryChart data={breakdown} />
        </Card>
      </div>
    </div>
  );
}
