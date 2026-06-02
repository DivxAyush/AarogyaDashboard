import React, { useMemo } from "react";
import {
    Card,
    CardContent,
    Typography,
    Box,
    Skeleton,
    IconButton,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

// ─────────────────────────────────────────────
// Mini Sparkline SVG — decorative trend line
// ─────────────────────────────────────────────
const MiniSparkline = ({ color = "#3b82f6" }) => {
    const points = "0,28 12,22 24,25 36,15 48,18 60,10 72,14 84,6 96,12 108,4 120,8";
    return (
        <svg width="100%" height="32" viewBox="0 0 120 32" preserveAspectRatio="none" style={{ display: "block" }}>
            <defs>
                <linearGradient id={`spark-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.02" />
                </linearGradient>
            </defs>
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
            />
            <polygon
                fill={`url(#spark-${color.replace("#", "")})`}
                points={`${points} 120,32 0,32`}
            />
        </svg>
    );
};

// ─────────────────────────────────────────────
// StatCard — Premium Dashboard KPI Card
// Glassmorphism, hover animation, trend, sparkline, skeleton
// ─────────────────────────────────────────────

const StatCard = ({ title, value, icon, color, loading = false, subtitle, onClick, trend }) => {
    const cardStyle = useMemo(
        () => ({
            borderRadius: "18px",
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.7)",
            boxShadow: "0 4px 24px rgba(25, 118, 210, 0.08), 0 1px 4px rgba(0,0,0,0.04)",
            transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1), box-shadow 0.25s cubic-bezier(0.4,0,0.2,1)",
            cursor: onClick ? "pointer" : "default",
            "&:hover": {
                transform: onClick ? "translateY(-6px) scale(1.015)" : "translateY(-3px)",
                boxShadow: `0 16px 48px ${color}22, 0 4px 16px rgba(0,0,0,0.06)`,
            },
            height: "100%",
            display: "flex",
            flexDirection: "column",
        }),
        [color, onClick]
    );

    // Auto-scale font size for large currency values
    const valueFontSize = useMemo(() => {
        const str = String(value || "");
        if (str.length > 18) return { xs: "1.1rem", md: "1.25rem" };
        if (str.length > 14) return { xs: "1.3rem", md: "1.45rem" };
        if (str.length > 10) return { xs: "1.5rem", md: "1.65rem" };
        return { xs: "1.7rem", md: "1.85rem" };
    }, [value]);

    // Skeleton loading state — matches final card dimensions exactly
    if (loading) {
        return (
            <Card sx={{ borderRadius: "18px", boxShadow: "0 4px 24px rgba(25,118,210,0.06)", height: "100%", display: "flex", flexDirection: "column" }}>
                <CardContent sx={{ p: 2.5, pb: 0, flexGrow: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                        <Skeleton variant="circular" width={44} height={44} sx={{ borderRadius: "14px" }} />
                        <Skeleton variant="circular" width={24} height={24} />
                    </Box>
                    <Skeleton variant="text" width="55%" height={16} sx={{ mb: 0.5 }} />
                    <Skeleton variant="text" width="80%" height={36} sx={{ mb: 0.5 }} />
                    <Skeleton variant="text" width="50%" height={14} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="40%" height={14} />
                </CardContent>
                <Box sx={{ px: 2.5, pb: 2 }}>
                    <Skeleton variant="rectangular" width="100%" height={28} sx={{ borderRadius: "6px" }} />
                </Box>
            </Card>
        );
    }

    return (
        <Card sx={cardStyle} onClick={onClick}>
            <CardContent sx={{ p: 2.5, pb: 0, flexGrow: 1, display: "flex", flexDirection: "column" }}>
                {/* Top row: Icon + Menu */}
                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1.5 }}>
                    <Box
                        sx={{
                            width: 44,
                            height: 44,
                            borderRadius: "14px",
                            background: `linear-gradient(135deg, ${color}20, ${color}40)`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                        }}
                    >
                        {icon}
                    </Box>
                    <IconButton size="small" sx={{ color: "#94a3b8", mt: -0.5, mr: -0.5 }}>
                        <MoreVertIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </Box>

                {/* Title */}
                <Typography
                    sx={{
                        color: "#607d8b",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: 1.2,
                        fontSize: "0.68rem",
                        mb: 0.5,
                    }}
                >
                    {title}
                </Typography>

                {/* Value */}
                <Typography
                    sx={{
                        fontWeight: 800,
                        color: "#0f172a",
                        lineHeight: 1.15,
                        letterSpacing: -0.5,
                        fontSize: valueFontSize,
                        mb: 0.3,
                        wordBreak: "break-word",
                    }}
                >
                    {value ?? "—"}
                </Typography>

                {/* Subtitle */}
                {subtitle && (
                    <Typography
                        variant="caption"
                        sx={{ color: "#94a3b8", display: "block", fontSize: "0.72rem" }}
                    >
                        {subtitle}
                    </Typography>
                )}


            </CardContent>

            {/* Sparkline at bottom */}
            <Box sx={{ px: 2.5, pb: 1.5, mt: "auto" }}>
                <MiniSparkline color={color} />
            </Box>
        </Card>
    );
};

export default React.memo(StatCard);
