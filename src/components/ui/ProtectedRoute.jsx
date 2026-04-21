import { Navigate } from "react-router-dom";

import { useAuth } from "@/lib/AuthContext";

function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
    </div>
  );
}

export default function ProtectedRoute({ children }) {
  const { authChecked, isLoadingAuth, user } = useAuth();

  if (!authChecked || isLoadingAuth) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate replace to="/not-registered" />;
  }

  return children;
}
