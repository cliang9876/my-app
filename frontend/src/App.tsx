import React, { Suspense } from "react";
import { useRoutes, NavLink } from "react-router-dom";
import routes from "./router";
import Header from "./components/Header";
import Footer from "./components/Footer";

function App() {
  return (
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
  );
}

export default App;
