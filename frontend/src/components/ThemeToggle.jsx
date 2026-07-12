import { useTheme } from "../context/ThemeContext.jsx";

// A simple two-button switch: one for Light, one for Dark. Clicking a
// button switches directly to that mode (no toggling back and forth -
// you pick exactly the one you want, like picking a radio option).
export default function ThemeToggle() {
  const { theme, setThemePreference } = useTheme();

  return (
    <div className="theme-toggle" role="group" aria-label="Theme">
      <button
        className={theme === "light" ? "theme-seg-btn active" : "theme-seg-btn"}
        onClick={() => setThemePreference("light")}
        aria-label="Light mode"
        title="Light mode"
      >
        ☀️
      </button>
      <button
        className={theme === "dark" ? "theme-seg-btn active" : "theme-seg-btn"}
        onClick={() => setThemePreference("dark")}
        aria-label="Dark mode"
        title="Dark mode"
      >
        🌙
      </button>
    </div>
  );
}