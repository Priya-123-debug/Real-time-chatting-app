// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { getMe } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  getMe()
    .then((res) => {
      // make sure response is actual user data not HTML
      if (res.data && typeof res.data === "object") {
        setUser(res.data);
      } else {
        setUser(null);
      }
    })
    .catch(() => setUser(null))
    .finally(() => setLoading(false));
}, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);