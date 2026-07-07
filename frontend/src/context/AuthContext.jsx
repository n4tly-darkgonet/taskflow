// context/AuthContext.jsx
// This holds the logged-in user's token in memory and shares it with
// every page via React Context, so we don't have to pass it down
// manually through every component.
//
// Note: we deliberately do NOT use localStorage here (this app avoids
// browser storage by design). That means refreshing the page logs you
// out - a normal Vite React project you run locally can swap this for
// localStorage.setItem/getItem if you want the login to persist.

import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(null); // { token, username } | null

  const login = (token, username) => setAuth({ token, username });
  const logout = () => setAuth(null);

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
