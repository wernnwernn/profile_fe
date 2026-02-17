export const THEME_KEY = "profile_theme";

export const getInitialTheme = () => {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "dark" || saved === "light") return saved;

  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
  return prefersDark ? "dark" : "light";
};

export const applyTheme = (theme) => {
  const t = theme === "dark" ? "dark" : "light";
  document.documentElement.setAttribute("data-bs-theme", t);
  localStorage.setItem(THEME_KEY, t);
};
