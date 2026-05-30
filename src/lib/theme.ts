export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "obsessions-theme";

export function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (raw === "light" || raw === "dark") return raw;
  } catch {
    /* private browsing */
  }
  return null;
}

export function getPreferredTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = getStoredTheme();
  if (stored) return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.dataset.theme = theme;
}

export function setTheme(theme: Theme): void {
  applyTheme(theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
}

export function toggleTheme(): Theme {
  const next: Theme = document.documentElement.classList.contains("dark") ? "light" : "dark";
  setTheme(next);
  return next;
}

/** Inline script for layout — prevents flash of wrong theme. */
export const themeInitScript = `(function(){try{var k="obsessions-theme";var t=localStorage.getItem(k);var d=t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);document.documentElement.dataset.theme=d?"dark":"light";}catch(e){}})();`;
