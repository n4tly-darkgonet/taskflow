// context/AuthContext.jsx
// This holds the logged-in user's token and shares it with every page
// via React Context, so we don't have to pass it down manually through
// every component.
//
// The token is also saved in localStorage, so refreshing the page (or
// closing and reopening the tab) keeps you logged in. This is a real
// deployed website, not a sandboxed tool, so using localStorage here is
// completely normal - the same way most real websites keep you signed in.

import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);
const STORAGE_KEY = "taskflow-auth";

function getInitialAuth() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    // If the saved value is corrupted/unreadable for any reason, just
    // treat it as "not logged in" instead of crashing the whole app.
    return null;
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(getInitialAuth); // { token, username } | null

  function login(token, username) {
    const authData = { token, username };
    setAuth(authData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
  }

  function logout() {
    setAuth(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}