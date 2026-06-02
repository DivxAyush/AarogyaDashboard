import React, { useMemo } from "react";
import {
 Card,
 CardContent,
 Typography,
 Box,
 Skeleton,
} from "@mui/material";

// ─────────────────────────────────────────────
// StatCard — Dashboard Statistic Card
// Glass effect, hover animation, skeleton loading
// ─────────────────────────────────────────────

const StatCard = ({ title, value, icon, color, loading = false, subtitle, onClick }) => {
 const cardStyle = useMemo(
  () => ({
   borderRadius: "16px",
   background: "rgba(255,255,255,0.85)",
   backdropFilter: "blur(10px)",
   border: "1px solid rgba(255,255,255,0.6)",
   boxShadow: "0 4px 24px rgba(25, 118, 210, 0.10)",
   transition: "transform 0.22s cubic-bezier(0.4,0,0.2,1), box-shadow 0.22s cubic-bezier(0.4,0,0.2,1)",
   cursor: onClick ? "pointer" : "default",
   "&:hover": {
    transform: onClick ? "translateY(-6px) scale(1.02)" : "translateY(-4px)",
    boxShadow: `0 12px 40px ${color}33`,
   },
   height: "100%",
  }),
  [color, onClick]
 );

 if (loading) {
  return (
   <Card sx={{ borderRadius: "16px", boxShadow: "0 4px 24px rgba(25, 118, 210, 0.08)" }}>
    <CardContent sx={{ p: 3 }}>
     <Skeleton variant="circular" width={48} height={48} sx={{ mb: 2 }} />
     <Skeleton variant="text" width="60%" height={20} />
     <Skeleton variant="text" width="80%" height={40} sx={{ mt: 1 }} />
     <Skeleton variant="text" width="50%" height={16} sx={{ mt: 1 }} />
    </CardContent>
   </Card>
  );
 }

 return (
  <Card sx={cardStyle} onClick={onClick}>
   <CardContent sx={{ p: 3 }}>
    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
     <Box>
      <Typography
       variant="body2"
       sx={{
        color: "#607d8b",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: 1,
        fontSize: "0.70rem",
        mb: 1,
       }}
      >
       {title}
      </Typography>
      <Typography
       variant="h4"
       sx={{
        fontWeight: 800,
        color: "#1a2035",
        lineHeight: 1.1,
        letterSpacing: -0.5,
       }}
      >
       {value ?? "—"}
      </Typography>
      {subtitle && (
       <Typography
        variant="caption"
        sx={{ color: "#90a4ae", mt: 0.5, display: "block" }}
       >
        {subtitle}
       </Typography>
      )}
     </Box>

     <Box
      sx={{
       width: 52,
       height: 52,
       borderRadius: "14px",
       background: `linear-gradient(135deg, ${color}22, ${color}44)`,
       display: "flex",
       alignItems: "center",
       justifyContent: "center",
       fontSize: "1.6rem",
       flexShrink: 0,
      }}
     >
      {icon}
     </Box>
    </Box>

    {/* Bottom accent bar */}
    <Box
     sx={{
      mt: 2.5,
      height: 4,
      borderRadius: 2,
      background: `linear-gradient(90deg, ${color}, ${color}66)`,
     }}
    />
   </CardContent>
  </Card>
 );
};

export default React.memo(StatCard);
