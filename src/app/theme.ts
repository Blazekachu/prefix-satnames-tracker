export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "pst-theme";

export function normalizeTheme(value: string | null | undefined): Theme {
  return value === "light" || value === "dark" ? value : "dark";
}

export function readStoredTheme(): Theme {
  try {
    return normalizeTheme(localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return "dark";
  }
}

export function writeStoredTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // ignore quota / private mode
  }
}

export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute("data-theme", theme);
  writeStoredTheme(theme);
}

export function toggleTheme(): Theme {
  const next: Theme = readStoredTheme() === "light" ? "dark" : "light";
  applyTheme(next);
  return next;
}
