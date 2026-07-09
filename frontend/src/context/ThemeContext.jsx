// context/ThemeContext.jsx
// Manages whether the app is in light or dark mode. The choice is saved
// in the browser's localStorage, so it's remembered next time you visit -
// this is a real deployed website (not a sandboxed tool), so using
// localStorage here is completely normal and expected.

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

function getInitialTheme() {
  const saved = localStorage.getItem("taskflow-theme");
  if (saved === "light" || saved === "dark") return saved;
  // No saved preference yet - default to whatever the user's OS/browser prefers.
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  // Whenever the theme changes, apply it to the page and remember it.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("taskflow-theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}