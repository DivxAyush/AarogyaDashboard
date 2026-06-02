import React, { useCallback } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
  Button,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import LogoutIcon from "@mui/icons-material/Logout";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import { STORAGE_KEYS, APP_NAME } from "../utils/constants";
import { useNavigate } from "react-router-dom";

// ─────────────────────────────────────────────
// Navbar — Top Application Bar
// ─────────────────────────────────────────────

const Navbar = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER)) || {};
    } catch {
      return {};
    }
  })();

  const handleLogout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    navigate("/login", { replace: true });
  }, [navigate]);

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "U";

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: "100%",
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(25,118,210,0.12)",
        color: "#1a2035",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 56, md: 64 }, px: { xs: 1.5, md: 3 } }}>


        {/* Logo + Title */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexGrow: 1 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              background: "linear-gradient(135deg, #1565c0 0%, #42a5f5 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Typography sx={{ color: "#fff", fontWeight: 900, fontSize: "1rem", lineHeight: 1 }}>
              A
            </Typography>
          </Box>
          <Box>
            <Typography
              variant={isMobile ? "body1" : "h6"}
              sx={{ fontWeight: 800, color: "#1565c0", lineHeight: 1, letterSpacing: -0.3 }}
            >
              {APP_NAME}
            </Typography>
            {!isMobile && (
              <Typography variant="caption" sx={{ color: "#90a4ae", lineHeight: 1 }}>
                Healthcare Analytics Platform
              </Typography>
            )}
          </Box>
        </Box>

        {/* Right actions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, md: 1.5 } }}>
          <Tooltip title="Notifications">
            <IconButton sx={{ color: "#78909c", "&:hover": { bgcolor: "#e3f2fd", color: "#1976d2" } }}>
              <NotificationsNoneIcon />
            </IconButton>
          </Tooltip>

          {/* User avatar */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                background: "linear-gradient(135deg, #1565c0, #42a5f5)",
                fontSize: "0.85rem",
                fontWeight: 700,
              }}
            >
              {initials}
            </Avatar>
            {!isMobile && (
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: "#1a2035", lineHeight: 1.2 }}>
                  {user?.username || "Admin"}
                </Typography>
                <Typography variant="caption" sx={{ color: "#90a4ae", lineHeight: 1 }}>
                  Administrator
                </Typography>
              </Box>
            )}
          </Box>

          {isMobile ? (
            <Tooltip title="Logout">
              <IconButton onClick={handleLogout} sx={{ color: "#ef5350" }}>
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <Button
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
              variant="outlined"
              size="small"
              sx={{
                borderColor: "#ef5350",
                color: "#ef5350",
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "10px",
                px: 2,
                "&:hover": { bgcolor: "#ffebee", borderColor: "#c62828" },
              }}
            >
              Logout
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default React.memo(Navbar);
