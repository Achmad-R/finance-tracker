"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";

export default function DeleteButton({
  action,
  id,
  label = "Hapus",
  className = "",
}: {
  action: (id: string) => void;
  id: string;
  label?: string;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm(`${label}?`)) startTransition(() => action(id));
      }}
      title={label}
      aria-label={label}
      className={`cursor-pointer rounded-md text-negative transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta/50 hover:opacity-70 disabled:opacity-50 ${className}`}
    >
      <Trash2 size={16} />
    </button>
  );
}
