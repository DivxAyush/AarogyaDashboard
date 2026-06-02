import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ROUTES, STORAGE_KEYS } from "../utils/constants";
import Loader from "../components/Loader";

// ─────────────────────────────────────────────
// AppRoutes — React Router DOM Config
// Lazy loading + Code splitting for all pages
// ─────────────────────────────────────────────

const Login = lazy(() => import("../pages/Login"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Analytics = lazy(() => import("../pages/Analytics"));
const Reports = lazy(() => import("../pages/Reports"));

// ── Protected Route Guard ─────────────────────
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  if (!token) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  return children;
};

// ── Public Route Guard (redirect if logged in) ─
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  if (token) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }
  return children;
};

const AppRoutes = () => {
  return (
    <Suspense fallback={<Loader fullScreen message="Loading page…" />}>
      <Routes>
        {/* Public Route */}
        <Route
          path={ROUTES.LOGIN}
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path={ROUTES.DASHBOARD}
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ANALYTICS}
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.REPORTS}
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
