// context/ThemeContext.jsx
// Manages the app's color theme. The user's actual PREFERENCE can be
// "light", "dark", or "system" (follow the OS). When it's "system", we
// track the OS's live setting and react if the person changes it while
// the page is open (e.g. their OS switches to dark mode at sunset).
//
// The preference is saved in localStorage, so it's remembered next time.

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);
const STORAGE_KEY = "taskflow-theme";

function getSystemPreference() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getInitialPreference() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "light" || saved === "dark" || saved === "system") return saved;
  return "system"; // no saved choice yet - default to following the OS
}

export function ThemeProvider({ children }) {
  const [preference, setPreference] = useState(getInitialPreference); // "light" | "dark" | "system"
  const [systemTheme, setSystemTheme] = useState(getSystemPreference);

  // Listen for the OS-level setting changing while the page is open,
  // so "System" mode reacts live instead of only checking once.
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => setSystemTheme(e.matches ? "dark" : "light");
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // The actual light/dark value applied to the page right now.
  const theme = preference === "system" ? systemTheme : preference;

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, preference);
  }, [preference, theme]);

  // Used by the small floating toggle button - a quick manual flip
  // between light and dark (moves you off "System" if you were on it).
  function toggleTheme() {
    setPreference(theme === "light" ? "dark" : "light");
  }

  // Used by the full Settings page - lets you explicitly choose
  // Light, Dark, or System.
  function setThemePreference(nextPreference) {
    setPreference(nextPreference);
  }

  return (
    <ThemeContext.Provider value={{ theme, preference, toggleTheme, setThemePreference }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}