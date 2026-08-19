import Link from "next/link";
import { Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { deriveBalances } from "@/lib/aggregate";
import { formatIDR } from "@/lib/format";
import { Badge, Button, Card, Input, Label, PageHeader, Select } from "@/components/ui";
import SubmitButton from "@/components/SubmitButton";
import DeleteButton from "@/components/DeleteButton";
import { createAccount, deleteAccount } from "../actions";

export default async function AccountsPage() {
  const supabase = createClient();
  const [{ data: accounts }, { data: transactions }] = await Promise.all([
    supabase.from("accounts").select("*"),
    supabase.from("transactions").select("*"),
  ]);

  const { balances } = deriveBalances(accounts ?? [], transactions ?? []);

  return (
    <div>
      <PageHeader title="Akun" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold text-ink">Daftar Akun</h2>
          {balances.length === 0 ? (
            <p className="text-sm text-secondary">Belum ada akun. Tambahkan akun pertama di form di atas.</p>
          ) : (
            <ul className="divide-y divide-hairline">
              {balances.map((acc) => (
                <li
                  key={acc.id}
                  className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <p className="truncate font-medium text-ink">{acc.name}</p>
                    <Badge tone={acc.type === "asset" ? "positive" : "negative"}>
                      {acc.type === "asset" ? "Aset" : "Liabilitas"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <p className="tabular text-lg font-semibold text-ink">
                      {formatIDR(acc.balance)}
                    </p>
                    <Link
                      href={`/accounts/${acc.id}/edit`}
                      className="cursor-pointer text-secondary transition-colors hover:text-ink"
                      aria-label="Edit"
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton action={deleteAccount} id={acc.id} label="Hapus akun" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-semibold text-ink">Tambah Akun</h2>
          <form action={createAccount} className="space-y-3">
            <div>
              <Label htmlFor="name">Nama</Label>
              <Input id="name" name="name" placeholder="Bank BCA" required />
            </div>
            <div>
              <Label htmlFor="type">Tipe</Label>
              <Select id="type" name="type" defaultValue="asset">
                <option value="asset">Aset (bank, tunai, e-wallet)</option>
                <option value="liability">Liabilitas (kartu kredit, pinjaman)</option>
              </Select>
            </div>
            <SubmitButton>Tambah</SubmitButton>
          </form>
        </Card>
      </div>
    </div>
  );
}
