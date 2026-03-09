import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  logout,
  selectAuthUsername,
  selectIsAuthenticated,
} from "../features/auth/authSlice";
import LoginPage from "../pages/Login/LoginPage";
import DashboardPage from "../pages/Dashboard/DashboardPage";
import SchoolDetailPage from "../pages/SchoolDetails/SchoolDetailPage";
import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const username = useSelector(selectAuthUsername);
  const token = useSelector((state) => state.auth.token);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<LoginPage isAuthenticated={isAuthenticated} />}
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <DashboardPage
                username={username}
                token={token}
                onLogout={handleLogout}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/schools/:schoolCode"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <SchoolDetailPage token={token} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={
            <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
