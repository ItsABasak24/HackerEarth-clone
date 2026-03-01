import { Navigate, useLocation } from "react-router-dom";
import React from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) => {
  const location = useLocation();

  const userToken = localStorage.getItem("token");
  const adminToken = localStorage.getItem("adminToken");

  const isValidUserToken =
    userToken &&
    userToken !== "undefined" &&
    userToken !== "null";

  const isValidAdminToken =
    adminToken &&
    adminToken !== "undefined" &&
    adminToken !== "null";

  // 🔐 Admin Route Protection
  if (requireAdmin) {
    if (!isValidAdminToken) {
      return (
        <Navigate
          to="/admin-login"
          state={{ from: location }}
          replace
        />
      );
    }
    return <>{children}</>;
  }

  // 🔐 Normal User Route Protection
  if (!isValidUserToken) {
    return (
      <Navigate
        to="/register"
        state={{ from: location }}
        replace
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
