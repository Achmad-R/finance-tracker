# Design System — Finance Tracker (Baseline Snapshot)

> Snapshot konfigurasi UI/UX **sebelum** batch perbaikan (kontras/a11y).
> Tanggal: 2026-08-19. Sumber: `src/app/globals.css`, `tailwind.config.ts`,
> `src/components/ui.tsx`, `src/components/charts.tsx`, `src/components/nav/Sidebar.tsx`,
> halaman-halaman di `src/app`.

## 1. Teknologi & strategi

- Next.js 14.2 App Router (Server Components + Server Actions)
- Tailwind CSS 3.4, `darkMode: "class"` (toggle `.dark` di `<html>`)
- CSS variables untuk token semantik (mode light/dark)
- Icons: `lucide-react` (ukuran 16–18, stroke default)
- Charts: `recharts` v2
- Font: `IBM Plex Sans` via `next/font/google`, `display: swap`, di root layout
- Bahasa UI: Indonesia; format angka IDR via `Intl.NumberFormat("id-ID")`

## 2. Design tokens (nilai aktual baseline)

### Warna — Light (`:root`)

| Token | Hex | Pemakaian |
|---|---|---|
| `--bg` | `#fafafa` | Latar halaman |
| `--surface` | `#ffffff` | Card, sidebar, input |
| `--ink` | `#09090b` | Teks utama |
| `--secondary` | `#3f3f46` | Teks sekunder (≈7.6:1 ✓ AA) |
| `--hairline` | `#e2e8f0` | Border/pembatas |

### Warna — Dark (`.dark`)

| Token | Hex |
|---|---|
| `--bg` | `#0a0a0b` |
| `--surface` | `#18181b` |
| `--ink` | `#fafafa` |
| `--secondary` | `#a1a1aa` |
| `--hairline` | `#27272a` |

### Warna fungsional (hardcoded di `tailwind.config.ts`, sama untuk kedua mode)

| Token | Hex | Pemakaian | Kontras baseline |
|---|---|---|---|
| `cta` | `#2563eb` | Tombol solid (`bg-cta text-white`), teks accent, badge, nav aktif | Putih di atas `#2563eb` = 5.2:1 ✓; `text-cta` di dark = **3.4:1 ✗** |
| `positive` | `#059669` | Jumlah pemasukan, badge, bar chart | Light **4.0:1 ✗**, dark **4.0:1 ✗** |
| `negative` | `#e11d48` | Jumlah pengeluaran, badge, hapus, bar chart | Light 4.9:1 ✓, dark **3.8:1 ✗** |
| `warning` | `#d97706` | (terdefinisi, belum terpakai) | — |
| `primary` | `#18181b` | Focus border input | — |

### Chart colors (hardcoded di `charts.tsx`)

`#2563EB`, `#059669`, `#E11D48`, `#D97706`, `#7C3AED`, `#0EA5E9` — area gradient biru
(40% → 0% opacity), grid `#E2E8F0`, axis `#3F3F46`.

## 3. Tipografi

- **Font:** IBM Plex Sans 300/400/500/600/700, `font-sans` via CSS var `--font-sans`
- **Scale aktual:** H1 `text-2xl font-semibold` (PageHeader), card title `text-sm font-semibold`,
  body `text-sm`/`text-base`, meta `text-xs text-secondary`, KPI `text-xl sm:text-2xl font-semibold`
- **Angka:** kelas `.tabular` (`font-variant-numeric: tabular-nums`) pada semua nilai uang
- **Format uang:** `formatIDR` = `Intl.NumberFormat("id-ID", {currency IDR, 0 desimal})`
  → "Rp 1.200.000" (spasi biasa; menjadi non-breaking setelah perbaikan)

## 4. Bentuk & bayangan

- **Radius:** card `rounded-card` = 12px; input/select/button `rounded-lg` = 8px;
  badge `rounded-full` (pill); progress bar `rounded-full`
- **Shadows (definisi config):** sm `0 1px 2px rgba(0,0,0,.05)`, md `.1`, lg `.1`, xl `.15` —
  hanya `shadow-sm` yang dipakai (Card)

## 5. Layout & breakpoints

- Breakpoints Tailwind default: `sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536
- Kontainer: `max-w-7xl mx-auto` (main content), `bg-background`
- Sidebar `w-60` (240px) di `≥lg`; di `<lg` menjadi top bar: logo + ThemeToggle + ikon keluar,
  nav horizontal scroll
- Padding main: `p-4 sm:p-6 lg:p-8`
- Grid halaman: dashboard `sm:grid-cols-2 lg:grid-cols-4` (KPI) + `lg:grid-cols-2` (chart);
  transaksi/recurring `lg:grid-cols-3`; laporan satu kolom

## 6. Komponen (`src/components/ui.tsx`)

| Komponen | API | Detail baseline |
|---|---|---|
| `Card` | `className` | `rounded-card border-hairline bg-surface p-5 shadow-sm` |
| `PageHeader` | `title`, `action?` | `mb-6`, H1 `text-2xl` + aksi kanan |
| `StatCard` | `label`, `value`, `hint?`, `tone?` | Label `text-sm text-secondary`, value `tabular text-xl sm:text-2xl` tone ink/positive/negative |
| `Button` | `children`, `variant` (primary/secondary/ghost), `type` | base `cursor-pointer rounded-lg px-4 py-2 font-semibold transition-all duration-200`; primary `bg-cta text-white hover:opacity-90`; **tanpa disabled/pending state** |
| `Label` | `htmlFor` | `mb-1 block text-sm font-medium` |
| `Input` | `id` + atribut input | `w-full rounded-lg border-hairline px-3 py-2 outline-none focus:border-primary` |
| `Select` | `id` + atribut select | sama dengan Input |
| `Badge` | `children`, `tone` (default/positive/negative/cta) | `rounded-full px-2.5 py-0.5 text-xs`, tone: `bg-{tone}/10 text-{tone}` |
| `DeleteButton` | `action`, `id`, `label`, `className` | Client; `confirm()` + `useTransition`, `disabled={pending}`, ikon Trash2 16 |

Lainnya: `ThemeToggle` (client), `Sidebar` (client, `usePathname`), `SubmitButton` belum ada.

## 7. Pola halaman

- **Form:** label di atas input (`Label` + `htmlFor`), aksi Server Action, error via
  redirect `?error=1` → banner `bg-negative/10 text-negative` (tanpa `role="alert"`)
- **Input jumlah:** `type="number" min="0" step="100"` (tanpa `inputmode`)
- **Empty states:** teks polos `text-sm text-secondary` ("Belum ada transaksi." dll.) di
  semua daftar + chart kategori
- **Filter transaksi:** `GET` form → query params (`type`, `month`, `page`)
- **Pagination:** prev/next dengan `aria-disabled`
- **Redirect:** setelah edit sukses → kembali ke daftar
- **Auth:** `/login`, `/signup` kartu centered, tombol solid `bg-cta`, link `text-cta`
- **Dashboard:** 4 StatCard (Total Aset, Total Liabilitas, Net Worth, Pengeluaran Bulan Ini)
  + kartu "Isi data demo" + NetWorthChart + CashflowChart
- **Not-found:** `bg-cta` button kembali ke dashboard

## 8. Charts (`src/components/charts.tsx`)

- `NetWorthChart`: AreaChart, tinggi `h-64`, gradient `#2563EB` 40%→0, tooltip formatIDR
- `CashflowChart`: BarChart income `#059669` / expense `#E11D48`, Legend
- `CategoryChart`: PieChart 6 warna, label langsung, empty state "Belum ada pengeluaran bulan ini."
- Semua dalam `ResponsiveContainer` 100%

## 9. Konvensi lintas

- `cursor-pointer` pada tombol & link
- Transisi `transition-colors duration-200` (hover: opacity/bg/warna)
- `truncate` pada teks list yang panjang, `min-w-0` di flex
- `prefers-reduced-motion: reduce` mematikan semua transisi/animasi (globals.css)
- Tidak ada emoji sebagai ikon; tidak ada `—` (em-dash) di UI
- `color-scheme: light` / `.dark color-scheme: dark`

## 10. Referensi audit

Audit ui-ux-pro-max (2026-08-19) menemukan: kontras `positive`/`negative`/`cta` gagal
WCAG AA di salah satu/both mode; tombol submit tanpa pending state; error banner tanpa
`role="alert"`; input jumlah tanpa `inputmode="numeric"`; focus ring lemah; empty states
tanpa ajakan aksi. Batch perbaikan (1–2) mengubah bagian di atas; dokumen ini adalah
baseline sebelum perubahan itu.
