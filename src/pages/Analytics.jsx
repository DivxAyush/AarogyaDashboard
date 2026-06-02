import React from "react";
import { Box, Typography, Button } from "@mui/material";
import BarChartIcon from "@mui/icons-material/BarChart";
import DashboardLayout from "../layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";

// ─────────────────────────────────────────────
// Analytics Page — Coming Soon Placeholder
// ─────────────────────────────────────────────

const Analytics = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          textAlign: "center",
          py: 8,
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: "24px",
            background: "linear-gradient(135deg, #1565c0, #42a5f5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 3,
            boxShadow: "0 12px 40px rgba(25,118,210,0.25)",
          }}
        >
          <BarChartIcon sx={{ color: "#fff", fontSize: 40 }} />
        </Box>
        <Typography
          variant="h4"
          sx={{ fontWeight: 900, color: "#1a2035", mb: 1.5, letterSpacing: -0.5 }}
        >
          Analytics
        </Typography>
        <Typography variant="body1" sx={{ color: "#90a4ae", mb: 4, maxWidth: 380 }}>
          Advanced analytics and trend visualizations are currently in development. Check back soon!
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/")}
          sx={{
            borderRadius: "12px",
            background: "linear-gradient(135deg, #1565c0, #1976d2)",
            textTransform: "none",
            fontWeight: 600,
            px: 4,
            py: 1.2,
          }}
        >
          Back to Dashboard
        </Button>
      </Box>
    </DashboardLayout>
  );
};

export default Analytics;
