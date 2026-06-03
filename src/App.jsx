import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

// Import constants
import { ROUTES, STORAGE_KEYS } from "./utils/constants";

// Import pages directly (removed lazy loading for simplicity)
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard/HomeDashboard/Dashboard";
import GraphDetailPage from "./pages/Dashboard/HomeDashboard/GraphDetail/GraphDetailPage";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";

// ─────────────────────────────────────────────
// MUI Theme — Light Blue Corporate Theme
// ─────────────────────────────────────────────

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
      light: "#42a5f5",
      dark: "#1565c0",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#0288d1",
      light: "#26c6da",
      dark: "#01579b",
    },
    background: {
      default: "#f0f6ff",
      paper: "#ffffff",
    },
    text: {
      primary: "#1a2035",
      secondary: "#607d8b",
    },
    divider: "rgba(25,118,210,0.12)",
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
    h1: { fontWeight: 900 },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 800 },
    h4: { fontWeight: 800 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    body1: { lineHeight: 1.6 },
    body2: { lineHeight: 1.5 },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    "none",
    "0 2px 8px rgba(25,118,210,0.06)",
    "0 4px 12px rgba(25,118,210,0.08)",
    "0 6px 18px rgba(25,118,210,0.10)",
    "0 8px 24px rgba(25,118,210,0.12)",
    "0 10px 30px rgba(25,118,210,0.14)",
    "0 12px 36px rgba(25,118,210,0.16)",
    "0 14px 42px rgba(25,118,210,0.18)",
    "0 16px 48px rgba(25,118,210,0.20)",
    "0 18px 54px rgba(25,118,210,0.22)",
    "0 20px 60px rgba(25,118,210,0.24)",
    "0 22px 66px rgba(25,118,210,0.26)",
    "0 24px 72px rgba(25,118,210,0.28)",
    "0 26px 78px rgba(25,118,210,0.30)",
    "0 28px 84px rgba(25,118,210,0.32)",
    "0 30px 90px rgba(25,118,210,0.34)",
    "0 32px 96px rgba(25,118,210,0.36)",
    "0 34px 102px rgba(25,118,210,0.38)",
    "0 36px 108px rgba(25,118,210,0.40)",
    "0 38px 114px rgba(25,118,210,0.42)",
    "0 40px 120px rgba(25,118,210,0.44)",
    "0 42px 126px rgba(25,118,210,0.46)",
    "0 44px 132px rgba(25,118,210,0.48)",
    "0 46px 138px rgba(25,118,210,0.50)",
    "0 48px 144px rgba(25,118,210,0.52)",
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 12,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.8)",
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: "none",
        },
      },
    },
  },
});

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  return token ? children : <Navigate to={ROUTES.LOGIN} replace />;
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  return token ? <Navigate to={ROUTES.DASHBOARD} replace /> : children;
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path={ROUTES.LOGIN} element={<PublicRoute><Login /></PublicRoute>} />

          {/* Protected Routes */}
          <Route path={ROUTES.DASHBOARD} element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path={ROUTES.GRAPH_DETAIL} element={<ProtectedRoute><GraphDetailPage /></ProtectedRoute>} />
          <Route path={ROUTES.ANALYTICS} element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path={ROUTES.REPORTS} element={<ProtectedRoute><Reports /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
