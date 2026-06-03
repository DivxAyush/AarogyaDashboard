import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

// ─────────────────────────────────────────────
// Loader Component — Full screen or inline
// ─────────────────────────────────────────────

const Loader = ({ fullScreen = false, message = "Loading..." }) => {
  if (fullScreen) {
    return (
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(6px)",
          gap: 2,
        }}
      >
        <CircularProgress
          size={56}
          thickness={4}
          sx={{ color: "#1976d2" }}
        />
        <Typography
          variant="body1"
          sx={{ color: "#1976d2", fontWeight: 500, letterSpacing: 0.5 }}
        >
          {message}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: 6,
        gap: 2,
      }}
    >
      <CircularProgress size={40} thickness={4} sx={{ color: "#1976d2" }} />
      <Typography variant="body2" sx={{ color: "#1976d2", fontWeight: 500 }}>
        {message}
      </Typography>
    </Box>
  );
};

export default React.memo(Loader);
