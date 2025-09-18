import React, { createContext, useState } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState({ name: "Admin" });

  function signIn() {
    setUser({ name: "Admin" });
  }
  function signOut() {
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, signIn, signOut }}>{children}</AuthContext.Provider>;
}
