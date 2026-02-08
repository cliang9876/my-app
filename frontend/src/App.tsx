import React from "react";
import { useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./store/auth";
import httpClient from "./service/httpClients";
import Layout from "./layout/Layout";
import Header from "./layout/Header";
import Footer from "./layout/Footer";

function BootStrap({ children }: { children: React.ReactNode }) {
  const { setAccessToken, setAuthReady } = useAuth();
  React.useEffect(() => {
    httpClient
      .post("/auth/refresh")
      .then(({ data }) => {
        setAccessToken(data.accessToken);
      })
      .catch(() => {
        setAccessToken(null);
      })
      .finally(() => setAuthReady(true));
  }, [setAccessToken]);
  return <>{children}</>;
}

function AppShell() {
  const { accessToken, setAccessToken } = useAuth();
  const navigate = useNavigate();
  const isAuthed = Boolean(accessToken);

  const handleLogout = React.useCallback(async () => {
    try {
      await httpClient.post("/auth/logout");
    } catch (e) {
      // ignore logout errors; we'll still clear local state
    } finally {
      setAccessToken(null);
      navigate("/login", { replace: true });
    }
  }, [setAccessToken, navigate]);

  return (
    <div className="App app-root">
      <Header isAuthed={isAuthed} onLogout={handleLogout} />
      <Layout />
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BootStrap>
        <AppShell />
      </BootStrap>
    </AuthProvider>
  );
}

export default App;
