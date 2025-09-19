import React, { createContext, useState } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // replace with real auth

  const signIn = (payload) => {
    setUser(payload);
  };

  const signOut = () => setUser(null);

  return <AuthContext.Provider value={{ user, signIn, signOut }}>{children}</AuthContext.Provider>;
}
