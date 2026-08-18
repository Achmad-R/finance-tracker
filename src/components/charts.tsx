"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatIDR } from "@/lib/format";

const COLORS = ["#2563EB", "#059669", "#E11D48", "#D97706", "#7C3AED", "#0EA5E9"];

function rupiah(v: number) {
  return formatIDR(Math.round(v * 100));
}

export function NetWorthChart({ data }: { data: { month: string; value: number }[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="nw" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#3F3F46" />
          <YAxis tick={{ fontSize: 12 }} stroke="#3F3F46" tickFormatter={(v) => `${Math.round(v / 1000000)}jt`} />
          <Tooltip formatter={(v: number) => rupiah(v)} />
          <Area type="monotone" dataKey="value" stroke="#2563EB" fill="url(#nw)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CashflowChart({
  data,
}: {
  data: { month: string; income: number; expense: number }[];
}) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#3F3F46" />
          <YAxis tick={{ fontSize: 12 }} stroke="#3F3F46" tickFormatter={(v) => `${Math.round(v / 1000000)}jt`} />
          <Tooltip formatter={(v: number) => rupiah(v)} />
          <Legend />
          <Bar dataKey="income" name="Pemasukan" fill="#059669" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" name="Pengeluaran" fill="#E11D48" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryChart({ data }: { data: { name: string; amount: number }[] }) {
  if (data.length === 0) {
    return <p className="py-12 text-center text-sm text-secondary">Belum ada pengeluaran bulan ini.</p>;
  }
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="amount" nameKey="name" outerRadius={90} label>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v: number) => rupiah(v)} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
