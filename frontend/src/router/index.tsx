import React, { lazy } from "react";
import { RouteObject, Navigate } from "react-router-dom";
// import Users from "../views/Users";
// import Home from "../views/Home";

const Home = lazy(() => import("../views/Home"));
const Users = lazy(() => import("../views/Users"));
const Login = lazy(() => import("../views/Login"));

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Navigate to="/home" />
  },
  {
    path: "/home",
    element: <Home />
  },
  {
    path: "/users",
    element: <Users />
  },
  {
    path: "/login",
    element: <Login />
  }
];

export default routes;
