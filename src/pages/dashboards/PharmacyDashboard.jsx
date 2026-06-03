import React from "react";
import { Box, Typography, Paper } from "@mui/material";

const PharmacyDashboard = () => {
  return (
    <Box sx={{ p: 2 }}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: "16px",
          border: "1px dashed #cbd5e1",
          bgcolor: "#f8fafc",
          textAlign: "center",
          minHeight: "400px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#334155", mb: 1 }}>
          Pharmacy Dashboard
        </Typography>
        <Typography variant="body1" sx={{ color: "#64748b" }}>
          Pharmacy analytics and insights will be displayed here.
        </Typography>
      </Paper>
    </Box>
  );
};

export default PharmacyDashboard;
