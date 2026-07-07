import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Dashboard() {
  const { auth, logout } = useAuth();
  const [boards, setBoards] = useState(null); // null = still loading
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.getBoards(auth.token).then(setBoards).catch(() => setBoards([]));
  }, [auth.token]);

  async function handleCreate(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    const board = await api.createBoard(auth.token, newName.trim());
    setNewName("");
    setCreating(false);
    navigate(`/boards/${board.id}`);
  }

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">T</span>
          TaskFlow
        </div>
        <div className="topbar-right">
          <span>{auth.username}</span>
          <button className="btn" onClick={logout}>Log out</button>
        </div>
      </header>

      <main className="dashboard">
        <div className="dashboard-header">
          <h1>Your boards</h1>
        </div>

        {boards === null && <div className="empty-state">Loading your boards...</div>}

        {boards && boards.length === 0 && !creating && (
          <div className="empty-state">
            <p>You don't have any boards yet.</p>
          </div>
        )}

        {boards && (
          <div className="board-grid">
            {boards.map((board) => (
              <Link key={board.id} to={`/boards/${board.id}`} className="board-tile">
                <div className="board-tile-icon">{board.name[0].toUpperCase()}</div>
                <h3>{board.name}</h3>
              </Link>
            ))}

            {creating ? (
              <form onSubmit={handleCreate} className="board-tile" style={{ borderStyle: "solid" }}>
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onBlur={() => !newName.trim() && setCreating(false)}
                  placeholder="Board name"
                  style={{
                    border: "1px solid var(--line)",
                    borderRadius: 8,
                    padding: "8px 10px",
                    fontSize: 14,
                  }}
                />
              </form>
            ) : (
              <button
                className="board-tile board-tile-new"
                onClick={() => setCreating(true)}
                style={{ minHeight: 90 }}
              >
                + New board
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
