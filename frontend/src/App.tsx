import React from "react";
import { useRoutes, NavLink } from "react-router-dom";
import routes from "./router";
import Header from "./components/Header";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="App app-root">
      <Header />
      <nav className="app-nav">
        <NavLink to="/home">Home</NavLink>
        <NavLink to="/users">Users</NavLink>
      </nav>

      <main className="app-main">{useRoutes(routes)}</main>

      <Footer />
    </div>
  );
}

export default App;
