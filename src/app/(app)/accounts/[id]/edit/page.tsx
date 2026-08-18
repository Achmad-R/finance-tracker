import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button, Card, Input, Label, PageHeader, Select } from "@/components/ui";
import { updateAccount } from "../../../actions";

export default async function EditAccountPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: account } = await supabase
    .from("accounts")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!account) notFound();

  return (
    <div>
      <Link
        href="/accounts"
        className="mb-4 inline-flex cursor-pointer items-center gap-1 text-sm text-secondary transition-colors hover:text-ink"
      >
        <ArrowLeft size={16} /> Kembali
      </Link>
      <PageHeader title="Edit Akun" />

      <Card className="max-w-md">
        <form action={updateAccount} className="space-y-3">
          <input type="hidden" name="id" value={account.id} />
          <div>
            <Label htmlFor="name">Nama</Label>
            <Input id="name" name="name" defaultValue={account.name} required />
          </div>
          <div>
            <Label htmlFor="type">Tipe</Label>
            <Select id="type" name="type" defaultValue={account.type}>
              <option value="asset">Aset</option>
              <option value="liability">Liabilitas</option>
            </Select>
          </div>
          <Button>Simpan</Button>
        </form>
      </Card>
    </div>
  );
}
