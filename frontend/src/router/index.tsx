import React, { lazy } from "react";
import { RouteObject, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

const Home = lazy(() => import("../views/Home"));
const Users = lazy(() => import("../views/Users"));
const Login = lazy(() => import("../views/Login"));
const ErrorPage = lazy(() => import("../views/ErrorPage"));
const Files = lazy(() => import("../views/Files"));

const routes: RouteObject[] = [
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    )
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
  },
  {
    path: "/files",
    element: (
      <ProtectedRoute>
        <Files />
      </ProtectedRoute>
    )
  }
];

export default routes;
