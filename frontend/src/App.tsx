import React, { Suspense } from "react";
import { useRoutes, NavLink } from "react-router-dom";
import { AuthProvider, useAuth } from "./store/auth";
import httpClient from "./service/httpClients";
import routes from "./router";
import Header from "./components/Header";
import Footer from "./components/Footer";

function BootStrap({ children }: { children: React.ReactNode }) {
  const { setAccessToken } = useAuth();
  React.useEffect(() => {
    httpClient
      .post("/auth/refresh")
      .then(({ data }) => {
        setAccessToken(data.accessToken);
      })
      .catch(() => {
        setAccessToken(null);
      });
  }, [setAccessToken]);
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <BootStrap>
        <div className="App app-root">
          <Header />
          <nav className="app-nav">
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/home">Home</NavLink>
            <NavLink to="/users">Users</NavLink>
          </nav>

          <Suspense fallback="">
            <main className="app-main">{useRoutes(routes)}</main>
          </Suspense>

          <Footer />
        </div>
      </BootStrap>
    </AuthProvider>
  );
}

export default App;
