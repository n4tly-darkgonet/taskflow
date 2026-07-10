import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import ThemeToggle from "./components/ThemeToggle.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Board from "./pages/Board.jsx";

// Wrap any page that requires login in this - if there's no logged-in
// user, bounce back to the login page instead of showing the page.
function RequireAuth({ children }) {
  const { auth } = useAuth();
  if (!auth) return <Navigate to="/login" replace />;
  return children;
}

// The homepage shows different things depending on whether you're
// logged in: a public landing page explaining TaskFlow for visitors,
// or straight into the dashboard for people who already have an account.
function Home() {
  const { auth } = useAuth();
  return auth ? <Dashboard /> : <Landing />;
}

export default function App() {
  return (
    <>
      <ThemeToggle />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
        <Route
          path="/boards/:boardId"
          element={
            <RequireAuth>
              <Board />
            </RequireAuth>
          }
        />
      </Routes>
    </>
  );
}