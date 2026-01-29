import React, { lazy } from "react";
import { RouteObject, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

const Home = lazy(() => import("../views/Home"));
const Users = lazy(() => import("../views/Users"));
const Login = lazy(() => import("../views/Login"));
const ErrorPage = lazy(() => import("../views/ErrorPage"));

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Navigate to="/login" />
  },
  {
    path: "/home",
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    )
  },
  {
    path: "/users",
    element: (
      <ProtectedRoute>
        <Users />
      </ProtectedRoute>
    )
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/errorPage",
    element: <ErrorPage />
  }
];

export default routes;
