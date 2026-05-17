import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/authContext";

/**
 * Bảo vệ route theo trạng thái đăng nhập + role.
 *
 * Cách dùng:
 *   <ProtectedRoute>...children...</ProtectedRoute>                     // chỉ cần đăng nhập
 *   <ProtectedRoute roles={['ADMIN']}>...                                // bắt buộc ADMIN
 *   <ProtectedRoute roles={['ADMIN','STAFF']}>...                        // ADMIN hoặc STAFF
 *
 * Khi không đủ quyền: đẩy về "/" thay vì /login để tránh loop.
 */
const ProtectedRoute = ({ children, roles }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (Array.isArray(roles) && roles.length > 0) {
    const userRole = (user.role || "")
      .trim()
      .toUpperCase()
      .replace(/^ROLE_/, "");
    const allowed = roles.map((r) => r.trim().toUpperCase()).includes(userRole);
    if (!allowed) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
