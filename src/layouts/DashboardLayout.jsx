import React from "react";
import { Box, Toolbar } from "@mui/material";
import Navbar from "../components/Navbar";

const DashboardLayout = ({ children }) => {
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "#f0f6ff",
        overflow: "hidden",
      }}
    >
      <Navbar />

      <Box
        component="main"
        sx={{
          boxSizing: "border-box",
          width: "100%",
          minHeight: "100vh",
          bgcolor: "#f0f6ff",
          backgroundImage:
            "radial-gradient(ellipse at 80% 10%, rgba(25,118,210,0.07) 0%, transparent 60%), radial-gradient(ellipse at 20% 90%, rgba(2,136,209,0.05) 0%, transparent 60%)",
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, md: 64 } }} />
        <Box
          sx={{
            px: { xs: 1, sm: 2, md: 2 },
            py: { xs: 2, md: 3 },
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default React.memo(DashboardLayout);
