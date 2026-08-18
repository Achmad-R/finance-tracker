"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    setDark(isDark);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Ganti tema"
      className="cursor-pointer rounded-lg p-2 text-secondary transition-colors duration-200 hover:bg-hairline hover:text-ink"
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
