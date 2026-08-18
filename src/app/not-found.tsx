import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-3xl font-semibold text-ink">404</h1>
      <p className="text-secondary">Halaman tidak ditemukan.</p>
      <Link
        href="/dashboard"
        className="cursor-pointer rounded-lg bg-cta px-4 py-2 font-semibold text-white transition-all duration-200 hover:opacity-90"
      >
        Ke Dashboard
      </Link>
    </main>
  );
}
