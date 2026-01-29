import React, { createContext, useContext, useEffect, useState } from "react";
import { setAccessToken as setTokenRef } from "../service/tokenStore";

type AuthCtx = {
  accessToken: string | null;
  setAccessToken: (t: string | null) => void;
};
const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  useEffect(() => {
    setTokenRef(accessToken);
  }, [accessToken]);
  return (
    <AuthContext.Provider value={{ accessToken, setAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
