import { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-card border border-hairline bg-surface p-5 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function PageHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <h1 className="text-2xl font-semibold text-ink">{title}</h1>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "positive" | "negative";
}) {
  const toneClass =
    tone === "positive"
      ? "text-positive"
      : tone === "negative"
        ? "text-negative"
        : "text-ink";
  return (
    <Card>
      <p className="text-sm text-secondary">{label}</p>
      <p className={`mt-1 text-xl font-semibold tabular sm:text-2xl ${toneClass}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-secondary">{hint}</p>}
    </Card>
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  type = "submit",
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  type?: "submit" | "button";
}) {
  const base =
    "cursor-pointer rounded-lg px-4 py-2 font-semibold transition-all duration-200";
  const variants = {
    primary: "bg-cta text-white hover:opacity-90",
    secondary: "border border-hairline bg-surface text-ink hover:shadow-sm",
    ghost: "text-cta hover:bg-cta/10",
  };
  return (
    <button type={type} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}

export function Label({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-ink">
      {children}
    </label>
  );
}

export function Input({ id, ...props }: { id: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      id={id}
      className="w-full rounded-lg border border-hairline px-3 py-2 text-ink outline-none transition-colors focus:border-primary"
      {...props}
    />
  );
}

export function Select({
  id,
  children,
  ...props
}: { id: string } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      id={id}
      className="w-full rounded-lg border border-hairline bg-surface px-3 py-2 text-ink outline-none transition-colors focus:border-primary"
      {...props}
    >
      {children}
    </select>
  );
}

export function Badge({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "positive" | "negative" | "cta";
}) {
  const tones = {
    default: "bg-hairline text-secondary",
    positive: "bg-positive/10 text-positive",
    negative: "bg-negative/10 text-negative",
    cta: "bg-cta/10 text-cta",
  };
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}
