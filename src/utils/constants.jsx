// ─────────────────────────────────────────────
// App-wide Constants
// ─────────────────────────────────────────────

export const APP_NAME = "AarogyaDashBoard";
export const APP_VERSION = "1.0.0";

// Route paths
export const ROUTES = {
  LOGIN: "/login",
  DASHBOARD: "/",
  ANALYTICS: "/analytics",
  REPORTS: "/reports",
};

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: "aarogya_token",
  USER: "aarogya_user",
};

// Sidebar navigation items
export const NAV_ITEMS = [
  { label: "Dashboard", path: ROUTES.DASHBOARD, icon: "Dashboard" },
  { label: "Analytics", path: ROUTES.ANALYTICS, icon: "BarChart" },
  { label: "Reports", path: ROUTES.REPORTS, icon: "Description" },
];

// Superset config
export const SUPERSET_CHART_ID = 117;

// Table pagination options
export const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

// Light Blue Theme tokens
export const THEME = {
  primary: "#1976d2",
  primaryLight: "#42a5f5",
  primaryDark: "#1565c0",
  secondary: "#0288d1",
  background: "#f0f6ff",
  cardBg: "#ffffff",
  sidebar: "#0d47a1",
  sidebarText: "#e3f2fd",
};
