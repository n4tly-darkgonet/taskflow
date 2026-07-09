import { useTheme } from "../context/ThemeContext.jsx";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      {/* The key={theme} is the trick here: whenever theme changes, React
          treats this as a brand new element instead of updating the old
          one, so the entrance animation below replays every time you
          click the button. */}
      <span key={theme} className="theme-toggle-icon">
        {theme === "light" ? "🌙" : "☀️"}
      </span>
    </button>
  );
}