// src/Kambaz/Account/ProtectedRoute.tsx
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRoute({
  children,
}: {
  children: ReactNode;
}) {
  const { currentUser } = useSelector((state: any) => state.accountReducer);

  // If no user, send them to the /Kambaz sign‑in page
  if (!currentUser) {
    return <Navigate to="/Kambaz/Account/Signin" replace />;
  }

  // Otherwise render whatever was inside this <ProtectedRoute>…
  return <>{children}</>;
}
