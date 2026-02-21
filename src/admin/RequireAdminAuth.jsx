import React from "react";
import { Navigate } from "react-router-dom";
import { getToken } from "../services/tokenStorage";

export default function RequireAdminAuth({ children }) {
  const token = getToken();
  if (!token) return <Navigate to="/admin/login" replace />;
  return children;
}
