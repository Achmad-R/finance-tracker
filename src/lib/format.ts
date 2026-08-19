export function toSen(rupiah: number): number {
  return Math.round(rupiah * 100);
}

export function fromSen(sen: number): number {
  return sen / 100;
}

export function formatIDR(sen: number): string {
  const rupiah = sen / 100;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  })
    .format(rupiah)
    .replace(/\s/g, "\u00A0");
}

export function monthKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}

export function monthLabel(month: string): string {
  const [y, m] = month.split("-");
  const date = new Date(Number(y), Number(m) - 1, 1);
  return date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
}
