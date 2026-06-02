import React, { useCallback } from "react";
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  useMediaQuery,
  useTheme,
  Tooltip,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BarChartIcon from "@mui/icons-material/BarChart";
import DescriptionIcon from "@mui/icons-material/Description";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import { useNavigate, useLocation } from "react-router-dom";
import { NAV_ITEMS, ROUTES } from "../utils/constants";

// ─────────────────────────────────────────────
// Sidebar — Navigation Drawer
// ─────────────────────────────────────────────

const DRAWER_WIDTH = 240;

const ICON_MAP = {
  Dashboard: <DashboardIcon />,
  BarChart: <BarChartIcon />,
  Description: <DescriptionIcon />,
};

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleNav = useCallback(
    (path) => {
      navigate(path);
      if (isMobile) onClose();
    },
    [navigate, isMobile, onClose]
  );

  const drawerContent = (
    <Box
      sx={{
        width: DRAWER_WIDTH,
        height: "100%",
        background: "linear-gradient(180deg, #0d47a1 0%, #1565c0 40%, #1976d2 100%)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Brand Section */}
      <Box
        sx={{
          px: 3,
          py: 3.5,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          borderBottom: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: "14px",
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(10px)",
          }}
        >
          <LocalHospitalIcon sx={{ color: "#fff", fontSize: 22 }} />
        </Box>
        <Box>
          <Typography
            sx={{ color: "#fff", fontWeight: 800, fontSize: "1rem", lineHeight: 1.2 }}
          >
            Aarogya
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.55)", fontSize: "0.72rem" }}>
            Health Analytics
          </Typography>
        </Box>
      </Box>

      {/* Navigation Label */}
      <Box sx={{ px: 3, pt: 3, pb: 1 }}>
        <Typography
          sx={{
            color: "rgba(255,255,255,0.45)",
            fontSize: "0.68rem",
            fontWeight: 700,
            letterSpacing: 1.5,
            textTransform: "uppercase",
          }}
        >
          Main Menu
        </Typography>
      </Box>

      {/* Nav Items */}
      <List sx={{ px: 1.5, flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <Tooltip title={item.label} placement="right" disableHoverListener>
                <ListItemButton
                  onClick={() => handleNav(item.path)}
                  sx={{
                    borderRadius: "12px",
                    px: 2,
                    py: 1.2,
                    background: isActive
                      ? "rgba(255,255,255,0.18)"
                      : "transparent",
                    border: isActive
                      ? "1px solid rgba(255,255,255,0.22)"
                      : "1px solid transparent",
                    backdropFilter: isActive ? "blur(8px)" : "none",
                    transition: "all 0.18s ease",
                    "&:hover": {
                      background: "rgba(255,255,255,0.12)",
                      border: "1px solid rgba(255,255,255,0.15)",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 38,
                      color: isActive ? "#fff" : "rgba(255,255,255,0.65)",
                    }}
                  >
                    {ICON_MAP[item.icon]}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        sx={{
                          fontSize: "0.9rem",
                          fontWeight: isActive ? 700 : 500,
                          color: isActive ? "#fff" : "rgba(255,255,255,0.75)",
                        }}
                      >
                        {item.label}
                      </Typography>
                    }
                  />
                  {isActive && (
                    <Box
                      sx={{
                        width: 4,
                        height: 20,
                        borderRadius: 2,
                        bgcolor: "#fff",
                        ml: 1,
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", mx: 2 }} />

      {/* Footer */}
      <Box sx={{ px: 3, py: 2.5 }}>
        <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: "0.7rem", textAlign: "center" }}>
          AarogyaDashBoard v1.0.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box component="nav">
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={isMobile ? open : false}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box", border: "none" },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="persistent"
        open={open}
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            border: "none",
            transition: "width 0.25s",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default React.memo(Sidebar);
