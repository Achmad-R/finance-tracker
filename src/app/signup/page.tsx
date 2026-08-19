import Link from "next/link";
import { Wallet } from "lucide-react";
import { signUp } from "@/app/login/actions";

export default function SignUpPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const hasError = searchParams?.error === "1";

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-card border border-hairline bg-surface p-8 shadow-md">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-card bg-cta-btn text-white">
            <Wallet size={20} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-ink">Buat Akun</h1>
            <p className="text-sm text-secondary">Daftar untuk mulai mencatat keuangan</p>
          </div>
        </div>

        {hasError && (
          <p className="mb-4 rounded-md bg-negative/10 px-3 py-2 text-sm text-negative">
            Pendaftaran gagal. Pastikan email valid dan password minimal 6 karakter.
          </p>
        )}

        <form action={signUp} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-hairline bg-surface px-3 py-2 text-ink outline-none transition-colors focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-ink">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className="w-full rounded-lg border border-hairline bg-surface px-3 py-2 text-ink outline-none transition-colors focus:border-primary"
            />
          </div>
          <button
            type="submit"
            className="w-full cursor-pointer rounded-lg bg-cta-btn px-4 py-2 font-semibold text-white transition-all duration-200 hover:opacity-90"
          >
            Daftar
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-secondary">
          Sudah punya akun?{" "}
          <Link href="/login" className="cursor-pointer font-medium text-cta hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </main>
  );
}
