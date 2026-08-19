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
    <aside className="w-full shrink-0 border-b border-hairline bg-surface p-3 lg:flex lg:w-60 lg:flex-col lg:border-b-0 lg:border-r lg:p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-card bg-cta text-white">
            <Wallet size={18} />
          </div>
          <span className="hidden text-lg font-semibold text-ink min-[360px]:inline">
            Finance
          </span>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <form action={signOut} className="lg:hidden">
            <button
              type="submit"
              aria-label="Keluar"
              className="flex cursor-pointer items-center rounded-lg p-2 text-secondary transition-colors duration-200 hover:bg-negative/10 hover:text-negative"
            >
              <LogOut size={18} />
            </button>
          </form>
        </div>
      </div>

      <nav className="mt-2 flex gap-1 overflow-x-auto lg:mt-6 lg:flex-1 lg:flex-col lg:gap-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex shrink-0 cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ${
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

      <form action={signOut} className="mt-4 hidden lg:block">
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