import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button, Card, Input, Label, PageHeader, Select } from "@/components/ui";
import { updateTransaction } from "../../../actions";

export default async function EditTransactionPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { error?: string; saved?: string };
}) {
  const supabase = createClient();
  const [{ data: tx }, { data: accounts }, { data: categories }] = await Promise.all([
    supabase.from("transactions").select("*").eq("id", params.id).single(),
    supabase.from("accounts").select("*"),
    supabase.from("categories").select("*"),
  ]);

  if (!tx) notFound();

  const occurredLocal = new Date(tx.occurred_at).toISOString().slice(0, 16);
  const amountRupiah = (tx.amount / 100).toString();

  return (
    <div>
      <Link
        href="/transactions"
        className="mb-4 inline-flex cursor-pointer items-center gap-1 text-sm text-secondary transition-colors hover:text-ink"
      >
        <ArrowLeft size={16} /> Kembali
      </Link>
      <PageHeader title="Edit Transaksi" />

      {searchParams?.error === "1" && (
        <p className="mb-4 rounded-md bg-negative/10 px-3 py-2 text-sm text-negative">
          Gagal menyimpan transaksi. Periksa kembali isian, lalu coba lagi.
        </p>
      )}

      {searchParams?.saved === "1" && (
        <p className="mb-4 rounded-md bg-positive/10 px-3 py-2 text-sm text-positive">
          Transaksi berhasil disimpan.
        </p>
      )}

      <Card className="max-w-md">
        <form action={updateTransaction} className="space-y-3">
          <input type="hidden" name="id" value={tx.id} />
          <div>
            <Label htmlFor="type">Tipe</Label>
            <Select id="type" name="type" defaultValue={tx.type}>
              <option value="expense">Pengeluaran</option>
              <option value="income">Pemasukan</option>
              <option value="transfer">Transfer</option>
              <option value="opening">Saldo Awal</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="account_id">Akun</Label>
            <Select id="account_id" name="account_id" defaultValue={tx.account_id} required>
              {(accounts ?? []).map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="to_account_id">Ke akun (transfer)</Label>
            <Select id="to_account_id" name="to_account_id" defaultValue={tx.to_account_id ?? ""}>
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
            <Select id="category_id" name="category_id" defaultValue={tx.category_id ?? ""}>
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
            <Input id="amount" name="amount" type="number" min="0" step="100" defaultValue={amountRupiah} required />
          </div>
          <div>
            <Label htmlFor="occurred_at">Tanggal</Label>
            <Input id="occurred_at" name="occurred_at" type="datetime-local" defaultValue={occurredLocal} required />
          </div>
          <div>
            <Label htmlFor="note">Catatan</Label>
            <Input id="note" name="note" defaultValue={tx.note ?? ""} placeholder="Opsional" />
          </div>
          <Button>Simpan</Button>
        </form>
      </Card>
    </div>
  );
}
