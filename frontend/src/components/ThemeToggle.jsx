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
      {/* Little stars that only become visible once the track turns
          into a night sky (in dark mode) - purely decorative. */}
      <span className="theme-toggle-star theme-toggle-star-1" aria-hidden="true"></span>
      <span className="theme-toggle-star theme-toggle-star-2" aria-hidden="true"></span>
      <span className="theme-toggle-star theme-toggle-star-3" aria-hidden="true"></span>

      {/* The sliding knob - its position is controlled entirely by CSS
          based on the current theme, so it glides across the track. */}
      <span className="theme-toggle-knob">
        <span key={theme} className="theme-toggle-icon">
          {theme === "light" ? "☀️" : "🌙"}
        </span>
      </span>
    </button>
  );
}