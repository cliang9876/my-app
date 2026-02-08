import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../store/auth";
import { getAccessToken } from "../service/tokenStore";

type ProtectedRouteProps = { children: React.ReactElement };

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { accessToken, authReady } = useAuth();
  const token =
    accessToken ?? (typeof window !== "undefined" ? getAccessToken() : null);
  const location = useLocation();

  if (!authReady) {
    return null;
  }

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
