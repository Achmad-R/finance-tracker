import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/lib/types";
import { Badge, Button, Card, Input, Label, PageHeader, Select } from "@/components/ui";
import SubmitButton from "@/components/SubmitButton";
import DeleteButton from "@/components/DeleteButton";
import { createCategory, deleteCategory } from "../actions";

function buildTree(cats: Category[]): { node: Category; children: any[] }[] {
  const byParent = new Map<string | null, Category[]>();
  for (const c of cats) {
    const key = c.parent_id;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(c);
  }
  const make = (parent: string | null): any[] =>
    (byParent.get(parent) ?? []).map((node) => ({ node, children: make(node.id) }));
  return make(null);
}

export default async function CategoriesPage() {
  const supabase = createClient();
  const { data: categories } = await supabase.from("categories").select("*");
  const cats = categories ?? [];
  const tree = buildTree(cats);

  const renderNodes = (nodes: any[], depth = 0) => (
    <ul className={depth === 0 ? "space-y-1" : "ml-4 space-y-1 border-l border-hairline pl-3"}>
      {nodes.map(({ node, children }) => (
        <li key={node.id}>
          <div className="flex items-center gap-2 py-1">
            <span className="text-ink">{node.name}</span>
            <Badge tone={node.kind === "income" ? "positive" : "default"}>
              {node.kind === "income" ? "Pemasukan" : "Pengeluaran"}
            </Badge>
            <DeleteButton action={deleteCategory} id={node.id} label="Hapus kategori" />
          </div>
          {children.length > 0 && renderNodes(children, depth + 1)}
        </li>
      ))}
    </ul>
  );

  return (
    <div>
      <PageHeader title="Kategori" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold text-ink">Struktur</h2>
          {tree.length === 0 ? (
            <p className="text-sm text-secondary">Belum ada kategori. Tambahkan kategori di form di atas.</p>
          ) : (
            renderNodes(tree)
          )}
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-semibold text-ink">Tambah Kategori</h2>
          <form action={createCategory} className="space-y-3">
            <div>
              <Label htmlFor="name">Nama</Label>
              <Input id="name" name="name" placeholder="Makanan" required />
            </div>
            <div>
              <Label htmlFor="kind">Jenis</Label>
              <Select id="kind" name="kind" defaultValue="expense">
                <option value="expense">Pengeluaran</option>
                <option value="income">Pemasukan</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="parent_id">Induk (opsional)</Label>
              <Select id="parent_id" name="parent_id">
                <option value="">— Tanpa induk —</option>
                {cats.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <SubmitButton>Tambah</SubmitButton>
          </form>
        </Card>
      </div>
    </div>
  );
}
