import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  logout,
  selectAuthDisplayName,
  selectIsAuthenticated,
} from "../features/auth/authSlice";
import LoginPage from "../pages/Login/LoginPage";
import DashboardPage from "../pages/Dashboard/DashboardPage";
import SchoolDetailPage from "../pages/SchoolDetails/SchoolDetailPage";
import ProfilePage from "../pages/Profile/ProfilePage";
import ProtectedRoute from "./ProtectedRoute";
import AdminLayout from "../components/layout/AdminLayout";
import AddSchoolForm from "../components/schools/AddSchoolForm";
import AddOwnerForm from "../components/schools/AddOwnerForm";

function AppRoutes() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const displayName = useSelector(selectAuthDisplayName);
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
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <AdminLayout onLogout={handleLogout} />
            </ProtectedRoute>
          }
        >
          <Route
            path="/dashboard"
            element={<DashboardPage username={displayName} token={token} />}
          />
          <Route
            path="/dashboard/add-school"
            element={<AddSchoolForm username={displayName} token={token} />}
          />
          <Route
            path="/dashboard/add-owner"
            element={<AddOwnerForm username={displayName} token={token} />}
          />
          <Route
            path="/dashboard/schools/:schoolCode"
            element={<SchoolDetailPage token={token} />}
          />
          <Route path="/dashboard/profile" element={<ProfilePage />} />
        </Route>
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
