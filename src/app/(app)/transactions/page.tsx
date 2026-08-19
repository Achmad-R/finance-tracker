import Link from "next/link";
import { Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatIDR } from "@/lib/format";
import { Badge, Button, Card, Input, Label, PageHeader, Select } from "@/components/ui";
import SubmitButton from "@/components/SubmitButton";
import DeleteButton from "@/components/DeleteButton";
import { createTransaction, deleteTransaction, deleteRecurring } from "../actions";

const PAGE_SIZE = 15;

const typeLabel: Record<string, string> = {
  income: "Pemasukan",
  expense: "Pengeluaran",
  transfer: "Transfer",
  opening: "Saldo Awal",
};

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: { page?: string; type?: string };
}) {
  const supabase = createClient();
  const page = Math.max(1, Number(searchParams.page ?? "1") || 1);
  const typeFilter =
    searchParams.type && searchParams.type !== "all" ? searchParams.type : null;

  const buildQuery = () => {
    let q = supabase.from("transactions").select("*", { count: "exact" });
    if (typeFilter) q = q.eq("type", typeFilter);
    return q;
  };

  const [{ count }, { data: transactions }, { data: accounts }, { data: categories }, { data: rules }] =
    await Promise.all([
      buildQuery(),
      buildQuery()
        .order("occurred_at", { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1),
      supabase.from("accounts").select("*"),
      supabase.from("categories").select("*"),
      supabase.from("recurring_rules").select("*").order("next_run", { ascending: true }),
    ]);

  const accName = new Map((accounts ?? []).map((a) => [a.id, a.name]));
  const catName = new Map((categories ?? []).map((c) => [c.id, c.name]));
  const nowLocal = new Date().toISOString().slice(0, 16);

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const qs = (p: number) =>
    `/transactions?page=${p}${typeFilter ? `&type=${typeFilter}` : ""}`;

  return (
    <div>
      <PageHeader title="Transaksi" />

      <form method="get" className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
        <div>
          <Label htmlFor="type">Filter tipe</Label>
          <Select id="type" name="type" defaultValue={typeFilter ?? "all"}>
            <option value="all">Semua</option>
            <option value="income">Pemasukan</option>
            <option value="expense">Pengeluaran</option>
            <option value="transfer">Transfer</option>
            <option value="opening">Saldo Awal</option>
          </Select>
        </div>
        <Button type="submit">Filter</Button>
      </form>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">Riwayat</h2>
            <span className="text-xs text-secondary">
              {total} transaksi
            </span>
          </div>
          {!transactions || transactions.length === 0 ? (
            <p className="text-sm text-secondary">Belum ada transaksi. Tambahkan transaksi baru di form di atas.</p>
          ) : (
            <ul className="divide-y divide-hairline">
              {transactions.map((tx) => (
                <li
                  key={tx.id}
                  className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">
                      {tx.note || typeLabel[tx.type] || tx.type}
                    </p>
                    <p className="truncate text-xs text-secondary">
                      {accName.get(tx.account_id)}
                      {tx.to_account_id ? ` → ${accName.get(tx.to_account_id)}` : ""}
                      {tx.category_id ? ` · ${catName.get(tx.category_id)}` : ""}
                      {" · "}
                      {new Date(tx.occurred_at).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <div className="text-right">
                      <p
                        className={`tabular font-semibold ${
                          tx.type === "expense" || tx.type === "transfer"
                            ? "text-negative"
                            : "text-positive"
                        }`}
                      >
                        {formatIDR(tx.amount)}
                      </p>
                      <Badge tone="default">{typeLabel[tx.type]}</Badge>
                    </div>
                    <Link
                      href={`/transactions/${tx.id}/edit`}
                      className="cursor-pointer text-secondary transition-colors hover:text-ink"
                      aria-label="Edit"
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton
                      action={deleteTransaction}
                      id={tx.id}
                      label="Hapus transaksi"
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-semibold text-ink">Tambah Transaksi</h2>
          <form action={createTransaction} className="space-y-3">
            <div>
              <Label htmlFor="type">Tipe</Label>
              <Select id="type" name="type" defaultValue="expense">
                <option value="expense">Pengeluaran</option>
                <option value="income">Pemasukan</option>
                <option value="transfer">Transfer</option>
                <option value="opening">Saldo Awal</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="account_id">Akun</Label>
              <Select id="account_id" name="account_id" required>
                <option value="">Pilih akun</option>
                {(accounts ?? []).map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="to_account_id">Ke akun (transfer)</Label>
              <Select id="to_account_id" name="to_account_id">
                <option value="">—</option>
                {(accounts ?? []).map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="category_id">Kategori</Label>
              <Select id="category_id" name="category_id">
                <option value="">—</option>
                {(categories ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="amount">Jumlah (Rp)</Label>
              <Input id="amount" name="amount" type="number" inputMode="numeric" min="0" step="100" required />
            </div>
            <div>
              <Label htmlFor="occurred_at">Tanggal</Label>
              <Input id="occurred_at" name="occurred_at" type="datetime-local" defaultValue={nowLocal} required />
            </div>
            <div>
              <Label htmlFor="note">Catatan</Label>
              <Input id="note" name="note" placeholder="Opsional" />
            </div>
            <SubmitButton>Tambah</SubmitButton>
          </form>
        </Card>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-secondary">
          Halaman {page} dari {totalPages}
        </span>
        <div className="flex gap-2">
          <Link
            href={qs(page - 1)}
            aria-disabled={page <= 1}
            className={`cursor-pointer rounded-lg border border-hairline px-3 py-1.5 text-sm font-medium transition-colors ${
              page <= 1 ? "pointer-events-none opacity-50" : "hover:bg-hairline"
            }`}
          >
            Sebelumnya
          </Link>
          <Link
            href={qs(page + 1)}
            aria-disabled={page >= totalPages}
            className={`cursor-pointer rounded-lg border border-hairline px-3 py-1.5 text-sm font-medium transition-colors ${
              page >= totalPages ? "pointer-events-none opacity-50" : "hover:bg-hairline"
            }`}
          >
            Berikutnya
          </Link>
        </div>
      </div>

      <Card className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-ink">Aturan Berulang</h2>
        {!rules || rules.length === 0 ? (
          <p className="text-sm text-secondary">Belum ada aturan berulang.</p>
        ) : (
          <ul className="divide-y divide-hairline">
            {rules.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-2 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{r.note || typeLabel[r.type]}</p>
                  <p className="truncate text-xs text-secondary">
                    {accName.get(r.account_id)} · {r.frequency} ·{" "}
                    {formatIDR(r.amount)}
                  </p>
                </div>
                <DeleteButton
                  action={deleteRecurring}
                  id={r.id}
                  label="Hapus aturan"
                  className="shrink-0"
                />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
