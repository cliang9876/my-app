import React, { Suspense } from "react";
import { NavLink, useRoutes } from "react-router-dom";
import { useAuth } from "../store/auth";
import routes from "../router";

const Layout: React.FC = () => {
  const { accessToken } = useAuth();
  const isAuthed = Boolean(accessToken);

  return (
    <>
      {isAuthed && (
        <nav className="app-nav">
          <NavLink to="/home">Home</NavLink>
          <NavLink to="/users">Users</NavLink>
          <NavLink to="/files">Files</NavLink>
        </nav>
      )}

      <Suspense fallback="">
        <main className="app-main">{useRoutes(routes)}</main>
      </Suspense>
    </>
  );
};

export default Layout;
