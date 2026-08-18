"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  Tags,
  Target,
  BarChart3,
  LogOut,
} from "lucide-react";
import { signOut } from "@/app/(app)/actions";
import ThemeToggle from "@/components/ThemeToggle";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/accounts", label: "Akun", icon: Wallet },
  { href: "/transactions", label: "Transaksi", icon: ArrowLeftRight },
  { href: "/categories", label: "Kategori", icon: Tags },
  { href: "/budgets", label: "Budget", icon: Target },
  { href: "/reports", label: "Laporan", icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-hairline bg-surface p-4">
      <div className="mb-6 flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-card bg-cta text-white">
            <Wallet size={18} />
          </div>
          <span className="text-lg font-semibold text-ink">Finance</span>
        </div>
        <ThemeToggle />
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                active
                  ? "bg-cta/10 text-cta"
                  : "text-secondary hover:bg-hairline hover:text-ink"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <form action={signOut} className="mt-4">
        <button
          type="submit"
          className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-secondary transition-colors duration-200 hover:bg-negative/10 hover:text-negative"
        >
          <LogOut size={18} />
          Keluar
        </button>
      </form>
    </aside>
  );
}
