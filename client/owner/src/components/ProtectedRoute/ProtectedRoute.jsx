import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, role } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = role?.toLowerCase();

  if (requiredRole && userRole !== requiredRole.toLowerCase()) {
    return <Navigate to="/" replace />;
  }

  return children;
}