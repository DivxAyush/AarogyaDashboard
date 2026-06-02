import React from "react";
import { Box, Typography, Button } from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import DashboardLayout from "../layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";

// ─────────────────────────────────────────────
// Reports Page — Coming Soon Placeholder
// ─────────────────────────────────────────────

const Reports = () => {
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
            background: "linear-gradient(135deg, #0288d1, #26c6da)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 3,
            boxShadow: "0 12px 40px rgba(2,136,209,0.25)",
          }}
        >
          <DescriptionIcon sx={{ color: "#fff", fontSize: 40 }} />
        </Box>
        <Typography
          variant="h4"
          sx={{ fontWeight: 900, color: "#1a2035", mb: 1.5, letterSpacing: -0.5 }}
        >
          Reports
        </Typography>
        <Typography variant="body1" sx={{ color: "#90a4ae", mb: 4, maxWidth: 380 }}>
          Automated report generation and scheduled exports are coming soon. Stay tuned!
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/")}
          sx={{
            borderRadius: "12px",
            background: "linear-gradient(135deg, #0288d1, #039be5)",
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

export default Reports;
