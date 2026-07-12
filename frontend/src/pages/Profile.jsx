import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

function formatJoinDate(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

export default function Profile() {
  const { auth, logout } = useAuth();
  const { preference, setThemePreference } = useTheme();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.getProfile(auth.token).then((data) => {
      setProfile(data);
      setDisplayName(data.display_name || data.username);
      setEmail(data.email || "");
    });
  }, [auth.token]);

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    setSavedMessage("");
    setSaving(true);
    try {
      const updated = await api.updateProfile(auth.token, { display_name: displayName, email });
      setProfile(updated);
      setSavedMessage("Saved.");
      setTimeout(() => setSavedMessage(""), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  if (!profile) {
    return <div className="loading-screen">Loading profile...</div>;
  }

  const initial = (profile.display_name || profile.username)[0].toUpperCase();

  return (
    <div className="page">
      <header className="topbar">
        <Link to="/" className="brand" style={{ textDecoration: "none", color: "inherit" }}>
          <span className="brand-mark">T</span>
          TaskFlow
        </Link>
      </header>

      <main className="profile-page">
        <h1>Profile</h1>

        <section className="profile-card">
          <div className="profile-avatar">{initial}</div>
          <div className="profile-identity">
            <form onSubmit={handleSave} className="profile-name-form">
              <input
                className="profile-display-name-input"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Display name"
              />
              <div className="profile-username">@{profile.username}</div>
              <div className="profile-meta">
                Joined {formatJoinDate(profile.created_at)}
                {" · "}
                <input
                  className="profile-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email (optional)"
                />
              </div>

              {error && <div className="error-banner" style={{ marginTop: 12 }}>{error}</div>}

              <div className="profile-save-row">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving..." : "Save changes"}
                </button>
                {savedMessage && <span className="profile-saved-msg">{savedMessage}</span>}
              </div>
            </form>
          </div>
        </section>

        <section className="settings-section">
          <h2>Settings</h2>

          <div className="settings-row">
            <span className="settings-label">Language</span>
            <span className="settings-value">English</span>
          </div>

          <div className="settings-row settings-row-column">
            <span className="settings-label">Appearance</span>
            <div className="appearance-options">
              <button
                type="button"
                className={preference === "light" ? "appearance-btn active" : "appearance-btn"}
                onClick={() => setThemePreference("light")}
              >
                Light
              </button>
              <button
                type="button"
                className={preference === "dark" ? "appearance-btn active" : "appearance-btn"}
                onClick={() => setThemePreference("dark")}
              >
                Dark
              </button>
              <button
                type="button"
                className={preference === "system" ? "appearance-btn active" : "appearance-btn"}
                onClick={() => setThemePreference("system")}
              >
                System
              </button>
            </div>
          </div>
        </section>

        <button className="btn logout-btn" onClick={handleLogout}>
          Log out
        </button>
      </main>
    </div>
  );
}