import React from "react";
import { Navigate, useLocation } from "react-router-dom";

type ProtectedRouteProps = { children: React.ReactElement };

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  const location = useLocation();

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      ></Navigate>
    );
  }

  return children;
}
