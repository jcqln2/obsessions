"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { getPreferredTheme, setTheme, type Theme } from "@/lib/theme";

type ThemeToggleProps = {
  className?: string;
  size?: "sm" | "md";
};

export function ThemeToggle({ className = "", size = "sm" }: ThemeToggleProps) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setThemeState(getPreferredTheme());
    setMounted(true);
  }, []);

  const iconSize = size === "md" ? 18 : 16;
  const buttonClass =
    size === "md"
      ? "flex h-9 w-9 items-center justify-center rounded-lg border border-app text-app-muted transition hover:bg-app-muted/10 hover:text-app"
      : "flex h-8 w-8 items-center justify-center rounded-lg text-app-muted transition hover:bg-app-muted/10 hover:text-app";

  const handleClick = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    setThemeState(next);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${buttonClass} ${className}`}
      aria-label={mounted && theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      title={mounted && theme === "dark" ? "Light mode" : "Dark mode"}
    >
      {mounted && theme === "dark" ? (
        <Sun width={iconSize} height={iconSize} aria-hidden />
      ) : (
        <Moon width={iconSize} height={iconSize} aria-hidden />
      )}
    </button>
  );
}
