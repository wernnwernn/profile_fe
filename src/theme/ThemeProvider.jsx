import React, { createContext, useEffect, useMemo, useState } from "react";
import { applyTheme, getInitialTheme } from "./theme";

export const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
});

export default function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => setThemeState((p) => (p === "dark" ? "light" : "dark"));
  const setTheme = (t) => setThemeState(t === "dark" ? "dark" : "light");

  const value = useMemo(() => ({ theme, toggleTheme, setTheme }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
