import React, { useState, useCallback, useEffect } from "react";
import {
    Box,
    TextField,
    Button,
    Typography,
    InputAdornment,
    IconButton,
    Alert,
    CircularProgress,
    Checkbox,
    FormControlLabel,
    Link,
    Paper,
    Stack,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import SecurityIcon from "@mui/icons-material/Security";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useNavigate } from "react-router-dom";
import { STORAGE_KEYS, ROUTES } from "../utils/constants";
import { getToken } from "../api/api_fun";

/* ────────────────── keyframe animations ────────────────── */
const fadeInUp = {
    "@keyframes fadeInUp": {
        "0%": { opacity: 0, transform: "translateY(30px)" },
        "100%": { opacity: 1, transform: "translateY(0)" },
    },
};

const floatAnim = {
    "@keyframes float": {
        "0%, 100%": { transform: "translateY(0px)" },
        "50%": { transform: "translateY(-8px)" },
    },
};

const pulseGlow = {
    "@keyframes pulseGlow": {
        "0%, 100%": { boxShadow: "0 0 20px rgba(96,165,250,0.15)" },
        "50%": { boxShadow: "0 0 40px rgba(96,165,250,0.3)" },
    },
};

/* ─────────── Donut Chart SVG Component ─────────── */
const DonutChart = ({ percentage = 65, size = 80, strokeWidth = 10 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <Box sx={{ position: "relative", width: size, height: size }}>
            <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
                {/* Background ring */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth={strokeWidth}
                />
                {/* Foreground ring */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 1.5s ease-in-out" }}
                />
                {/* Secondary segment */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#93c5fd"
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${(15 / 100) * circumference} ${circumference}`}
                    strokeDashoffset={-((percentage / 100) * circumference)}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 1.5s ease-in-out" }}
                />
            </svg>
            <Box
                sx={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Typography
                    variant="caption"
                    sx={{ fontWeight: 800, color: "#1e293b", fontSize: "0.85rem" }}
                >
                    {percentage}%
                </Typography>
            </Box>
        </Box>
    );
};

/* ═══════════════════════ MAIN LOGIN COMPONENT ═══════════════════════ */
const Login = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({ username: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [errors, setErrors] = useState({});
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 100);
        return () => clearTimeout(t);
    }, []);

    const validate = useCallback(() => {
        const newErrors = {};
        if (!form.username.trim()) newErrors.username = "Username is required.";
        if (!form.password) {
            newErrors.password = "Password is required.";
        } else if (form.password.length < 4) {
            newErrors.password = "Password must be at least 4 characters.";
        }
        return newErrors;
    }, [form]);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
        setError("");
    }, []);

    const handleTogglePassword = useCallback(() => {
        setShowPassword((prev) => !prev);
    }, []);

    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault();
            const validationErrors = validate();
            if (Object.keys(validationErrors).length > 0) {
                setErrors(validationErrors);
                return;
            }

            setLoading(true);
            setError("");

            try {
                const token = await getToken(form.username, form.password);
                localStorage.setItem(STORAGE_KEYS.TOKEN, token);
                localStorage.setItem(
                    STORAGE_KEYS.USER,
                    JSON.stringify({ username: form.username, role: "User" })
                );
                navigate(ROUTES.DASHBOARD, { replace: true });
            } catch (err) {
                if (err.message && err.message.includes("401")) {
                    setError("Wrong username or password");
                } else {
                    setError(err.message || "Login failed. Please check your credentials.");
                }
            } finally {
                setLoading(false);
            }
        },
        [form, navigate, validate]
    );

    /* ─── animation helper ─── */
    const animDelay = (d) => ({
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.7s ease ${d}s, transform 0.7s ease ${d}s`,
    });

    return (
        <Box
            sx={{
                height: "100vh",
                width: "100vw",
                display: "flex",
                overflow: "hidden",
                bgcolor: "#ffffff",
                ...fadeInUp,
                ...floatAnim,
                ...pulseGlow,
            }}
        >
            {/* ═══════════════════ LEFT SIDE: LOGIN FORM ═══════════════════ */}
            <Box
                sx={{
                    width: { xs: "100%", md: "45%", lg: "42%" },
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    bgcolor: "#ffffff",
                    px: { xs: 3, sm: 6, md: 5, lg: 7 },
                    py: { xs: 4, md: 4, lg: 5 },
                    zIndex: 2,
                    position: "relative",
                }}
            >
                {/* ── Logo ── */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexShrink: 0, ...animDelay(0.1) }}>
                    <Box
                        component="img"
                        src="/logo_icon.png"
                        alt="Logo Icon"
                        sx={{
                            width: { xs: 40, md: 44 },
                            height: { xs: 40, md: 44 },
                            objectFit: "contain",
                            flexShrink: 0,
                        }}
                    />
                    <Box
                        component="img"
                        src="/logo_text.png"
                        alt="Aarogya Dashboard"
                        sx={{
                            height: { xs: 38, md: 46 },
                            objectFit: "contain",
                        }}
                    />
                </Box>

                {/* ── Center Form ── */}
                <Box
                    sx={{
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        width: "100%",
                        maxWidth: 420,
                        mx: "auto",
                    }}
                >
                    {/* Heading */}
                    <Box sx={{ mb: 4, ...animDelay(0.15) }}>
                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: 800,
                                color: "#0f172a",
                                mb: 1,
                                fontSize: { xs: "2rem", md: "2.25rem", lg: "2.5rem" },
                                letterSpacing: -1,
                                lineHeight: 1.15,
                            }}
                        >
                            Welcome Back
                        </Typography>
                        <Typography variant="body1" sx={{ color: "#64748b", fontSize: "0.95rem" }}>
                            Enter your username and password to access your account.
                        </Typography>
                    </Box>

                    {/* Error Alert */}
                    {error && (
                        <Alert
                            severity="error"
                            sx={{ mb: 3, borderRadius: "12px" }}
                            onClose={() => setError("")}
                        >
                            {error}
                        </Alert>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        {/* Username */}
                        <Box sx={animDelay(0.2)}>
                            <Typography
                                variant="body2"
                                sx={{ fontWeight: 600, color: "#334155", mb: 0.8 }}
                            >
                                Username
                            </Typography>
                            <TextField
                                fullWidth
                                id="login-username"
                                name="username"
                                placeholder="username"
                                value={form.username}
                                onChange={handleChange}
                                error={!!errors.username}
                                helperText={errors.username}
                                disabled={loading}
                                sx={{
                                    mb: 2.5,
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "12px",
                                        bgcolor: "#f8fafc",
                                        fontSize: "0.95rem",
                                        "& fieldset": {
                                            borderColor: "#e2e8f0",
                                        },
                                        "&:hover fieldset": {
                                            borderColor: "#cbd5e1",
                                        },
                                        "&.Mui-focused fieldset": {
                                            borderColor: "#3b82f6",
                                            borderWidth: "2px",
                                        },
                                    },
                                }}
                            />
                        </Box>

                        {/* Password */}
                        <Box sx={{ ...animDelay(0.25), position: "relative" }}>
                            <Typography
                                variant="body2"
                                sx={{ fontWeight: 600, color: "#334155", mb: 0.8 }}
                            >
                                Password
                            </Typography>
                            <TextField
                                fullWidth
                                id="login-password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter password"
                                value={form.password}
                                onChange={handleChange}
                                error={!!errors.password}
                                helperText={errors.password}
                                disabled={loading}
                                sx={{
                                    mb: 2,
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "12px",
                                        bgcolor: "#f8fafc",
                                        fontSize: "0.95rem",
                                        paddingRight: "45px", // Ensure text doesn't overlap icon
                                        "& fieldset": {
                                            borderColor: "#e2e8f0",
                                        },
                                        "&:hover fieldset": {
                                            borderColor: "#cbd5e1",
                                        },
                                        "&.Mui-focused fieldset": {
                                            borderColor: "#3b82f6",
                                            borderWidth: "2px",
                                        },
                                    },
                                }}
                            />
                            {/* Absolute positioned eye icon */}
                            <IconButton
                                onClick={handleTogglePassword}
                                disableRipple
                                size="small"
                                sx={{
                                    position: "absolute",
                                    right: 12,
                                    top: 36, // Adjust to center vertically in the input field
                                    color: "#64748b",
                                    zIndex: 10,
                                }}
                            >
                                {showPassword ? (
                                    <VisibilityOffIcon sx={{ fontSize: 22 }} />
                                ) : (
                                    <VisibilityIcon sx={{ fontSize: 22 }} />
                                )}
                            </IconButton>
                        </Box>

                        {/* Login Button */}
                        <Box sx={{ ...animDelay(0.35), mt: 3 }}>
                            <Button
                                id="login-submit-btn"
                                type="submit"
                                fullWidth
                                variant="contained"
                                disabled={loading}
                                sx={{
                                    py: 1.6,
                                    borderRadius: "12px",
                                    textTransform: "none",
                                    fontSize: "1.05rem",
                                    fontWeight: 700,
                                    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                                    boxShadow: "0 8px 24px rgba(37,99,235,0.3)",
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        background: "linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)",
                                        boxShadow: "0 12px 28px rgba(37,99,235,0.4)",
                                        transform: "translateY(-1px)",
                                    },
                                    "&:active": {
                                        transform: "translateY(0)",
                                    },
                                }}
                            >
                                {loading ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    "Log In"
                                )}
                            </Button>
                        </Box>
                    </form>
                </Box>

                {/* ── Footer ── */}
                <Box
                    sx={{
                        flexShrink: 0,
                        pt: 2,
                        width: "100%",
                        maxWidth: 420,
                        mx: "auto",
                        ...animDelay(0.4),
                    }}
                >
                    <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                        Copyright © 2026 Dataman
                    </Typography>
                </Box>
            </Box>

            {/* ═══════════════════ RIGHT SIDE: VISUAL BANNER ═══════════════════ */}
            <Box
                sx={{
                    width: { xs: "0%", md: "55%", lg: "58%" },
                    display: { xs: "none", md: "flex" },
                    flexDirection: "column",
                    justifyContent: "center",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* ── Multi-layer Background ── */}
                {/* Base gradient */}
                <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(135deg, #1e40af 0%, #2563eb 40%, #3b82f6 70%, #1e3a8a 100%)",
                        zIndex: 0,
                    }}
                />

                {/* Hospital building image overlay */}
                <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage: "url('/hospital_bg.png')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        opacity: 0.12,
                        zIndex: 1,
                        filter: "blur(1px)",
                    }}
                />

                {/* Radial glow effects */}
                <Box
                    sx={{
                        position: "absolute",
                        top: "-15%",
                        right: "-10%",
                        width: "55vh",
                        height: "55vh",
                        borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(96,165,250,0.25) 0%, transparent 70%)",
                        zIndex: 2,
                    }}
                />
                <Box
                    sx={{
                        position: "absolute",
                        bottom: "-20%",
                        left: "-8%",
                        width: "70vh",
                        height: "70vh",
                        borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)",
                        zIndex: 2,
                    }}
                />
                <Box
                    sx={{
                        position: "absolute",
                        top: "40%",
                        left: "20%",
                        width: "30vh",
                        height: "30vh",
                        borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(147,197,253,0.15) 0%, transparent 70%)",
                        zIndex: 2,
                    }}
                />

                {/* ── Content Container ── */}
                <Box
                    sx={{
                        position: "relative",
                        zIndex: 5,
                        maxWidth: 680,
                        mx: "auto",
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        px: { md: 4, lg: 6 },
                        py: { md: 5, lg: 6 },
                    }}
                >
                    {/* ── Hero Text ── */}
                    <Box sx={{ flexShrink: 0, mb: { md: 3, lg: 4 }, ...animDelay(0.2) }}>
                        <Typography
                            variant="h3"
                            sx={{
                                color: "#fff",
                                fontWeight: 800,
                                mb: 2,
                                lineHeight: 1.15,
                                letterSpacing: -0.5,
                                fontSize: { md: "2.2rem", lg: "2.75rem" },
                                textShadow: "0 2px 20px rgba(0,0,0,0.15)",
                            }}
                        >
                            Effortlessly manage your healthcare operations.
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{
                                color: "rgba(255,255,255,0.8)",
                                fontWeight: 400,
                                lineHeight: 1.6,
                                fontSize: { md: "0.95rem", lg: "1.05rem" },
                                maxWidth: 520,
                            }}
                        >
                            Log in to access your analytics dashboard, monitor collections, and
                            seamlessly manage your hospital's financial health.
                        </Typography>
                    </Box>

                    {/* ── Dashboard Mockup ── */}
                    <Box
                        sx={{
                            position: "relative",
                            width: "100%",
                            flexGrow: 1,
                            minHeight: { md: 280, lg: 340 },
                            maxHeight: { md: 360, lg: 420 },
                            ...animDelay(0.35),
                        }}
                    >
                        {/* ─── Main Card: Revenue Overview ─── */}
                        <Paper
                            elevation={0}
                            sx={{
                                position: "absolute",
                                top: { md: 15, lg: 10 },
                                left: 0,
                                width: { md: "70%", lg: "72%" },
                                height: { md: "80%", lg: "82%" },
                                borderRadius: "16px",
                                bgcolor: "#fff",
                                p: { md: 2, lg: 2.5 },
                                boxShadow: "0 25px 60px rgba(0,0,0,0.2), 0 10px 24px rgba(0,0,0,0.1)",
                                display: "flex",
                                flexDirection: "column",
                                animation: "float 6s ease-in-out infinite",
                                zIndex: 1,
                            }}
                        >
                            {/* Header row */}
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    mb: { md: 1.5, lg: 2.5 },
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontWeight: 800,
                                        color: "#1e293b",
                                        fontSize: { md: "0.85rem", lg: "0.95rem" },
                                    }}
                                >
                                    Revenue Overview
                                </Typography>
                            </Box>

                            {/* ── Bar chart area ── */}
                            <Box
                                sx={{
                                    width: "100%",
                                    flexGrow: 1,
                                    borderRadius: "8px",
                                    bgcolor: "#f8fafc",
                                    display: "flex",
                                    alignItems: "flex-end",
                                    justifyContent: "center",
                                    px: { md: 2, lg: 3 },
                                    pb: { md: 2, lg: 2.5 },
                                    pt: { md: 1, lg: 1.5 },
                                    gap: { md: "6px", lg: "10px" },
                                }}
                            >
                                {/* 6 bars matching exact reference pattern */}
                                {[
                                    { h: "38%", c: "#c7d2fe" },
                                    { h: "58%", c: "#a5b4fc" },
                                    { h: "82%", c: "#818cf8" },
                                    { h: "45%", c: "#93c5fd" },
                                    { h: "68%", c: "#60a5fa" },
                                    { h: "100%", c: "#3b82f6" },
                                ].map((bar, i) => (
                                    <Box
                                        key={i}
                                        sx={{
                                            flex: 1,
                                            maxWidth: { md: 36, lg: 48 },
                                            height: bar.h,
                                            bgcolor: bar.c,
                                            borderRadius: "5px 5px 0 0",
                                            transition: "all 0.5s cubic-bezier(0.4,0,0.2,1)",
                                            transitionDelay: `${i * 0.1}s`,
                                            cursor: "pointer",
                                            "&:hover": {
                                                filter: "brightness(0.92)",
                                                transform: "scaleY(1.04)",
                                                transformOrigin: "bottom",
                                            },
                                        }}
                                    />
                                ))}
                            </Box>
                        </Paper>

                        {/* ─── Floating Widget: Patient Composition (top-right) ─── */}
                        <Paper
                            elevation={0}
                            sx={{
                                position: "absolute",
                                top: { md: -8, lg: -12 },
                                right: { md: 5, lg: 10 },
                                width: { md: 165, lg: 200 },
                                borderRadius: "14px",
                                bgcolor: "#fff",
                                px: { md: 1.5, lg: 2 },
                                py: { md: 1.5, lg: 1.8 },
                                boxShadow: "0 16px 48px rgba(0,0,0,0.16), 0 6px 16px rgba(0,0,0,0.08)",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                zIndex: 4,
                                animation: "float 5s ease-in-out infinite",
                                animationDelay: "0.8s",
                            }}
                        >
                            <Typography
                                sx={{
                                    fontWeight: 700,
                                    color: "#1e293b",
                                    alignSelf: "flex-start",
                                    mb: 1,
                                    fontSize: { md: "0.72rem", lg: "0.82rem" },
                                }}
                            >
                                Patient Composition
                            </Typography>

                            {/* Donut Chart */}
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
                                <DonutChart percentage={65} size={70} strokeWidth={8} />
                            </Box>

                            {/* Legend progress bar */}
                            <Box sx={{ display: "flex", gap: 0.6, mt: 1.5, width: "100%" }}>
                                <Box sx={{ flex: 2.5, height: 4, borderRadius: 2, bgcolor: "#3b82f6" }} />
                                <Box sx={{ flex: 1.5, height: 4, borderRadius: 2, bgcolor: "#93c5fd" }} />
                                <Box sx={{ flex: 0.8, height: 4, borderRadius: 2, bgcolor: "#e2e8f0" }} />
                            </Box>
                        </Paper>

                        {/* ─── Floating Widget: Total Collections (bottom-right dark card) ─── */}
                        <Paper
                            elevation={0}
                            sx={{
                                position: "absolute",
                                bottom: { md: 5, lg: 10 },
                                right: { md: -5, lg: -10 },
                                width: { md: 200, lg: 235 },
                                borderRadius: "14px",
                                bgcolor: "#1e293b",
                                p: { md: 1.8, lg: 2.2 },
                                boxShadow: "0 20px 56px rgba(0,0,0,0.35), 0 10px 24px rgba(0,0,0,0.2)",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                zIndex: 5,
                                animation: "float 7s ease-in-out infinite",
                                animationDelay: "1.8s",
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                    mb: 1.2,
                                }}
                            >
                                <Box>
                                    <Typography
                                        sx={{
                                            color: "#94a3b8",
                                            display: "block",
                                            mb: 0.4,
                                            fontSize: "0.68rem",
                                            fontWeight: 500,
                                        }}
                                    >
                                        Total Collections
                                    </Typography>
                                    <Typography
                                        sx={{
                                            fontWeight: 800,
                                            color: "#fff",
                                            letterSpacing: -0.5,
                                            fontSize: { md: "1.3rem", lg: "1.55rem" },
                                            lineHeight: 1.2,
                                        }}
                                    >
                                        ₹8.40 Cr
                                    </Typography>
                                </Box>
                                <Box
                                    sx={{
                                        width: { md: 32, lg: 38 },
                                        height: { md: 32, lg: 38 },
                                        borderRadius: "10px",
                                        bgcolor: "rgba(96,165,250,0.15)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <TrendingUpIcon sx={{ color: "#60a5fa", fontSize: { md: 18, lg: 22 } }} />
                                </Box>
                            </Box>
                            <Typography
                                variant="caption"
                                sx={{
                                    color: "#4ade80",
                                    fontWeight: 600,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                    fontSize: "0.72rem",
                                }}
                            >
                                ▲ +14.2%{" "}
                                <span style={{ color: "#64748b", fontWeight: 400 }}>
                                    from last month
                                </span>
                            </Typography>
                        </Paper>
                    </Box>

                    {/* ── Bottom Features Strip ── */}
                    <Stack
                        direction="row"
                        spacing={{ md: 2, lg: 3 }}
                        sx={{
                            mt: { md: 2, lg: 3 },
                            flexShrink: 0,
                            ...animDelay(0.5),
                        }}
                    >
                        {[
                            { icon: <QueryStatsIcon sx={{ fontSize: 18 }} />, label: "Real-time Analytics" },
                            { icon: <SecurityIcon sx={{ fontSize: 18 }} />, label: "Secure & Reliable" },
                            { icon: <SmartToyIcon sx={{ fontSize: 18 }} />, label: "Smart Management" },
                            { icon: <FavoriteIcon sx={{ fontSize: 18 }} />, label: "Better Outcomes" },
                        ].map((feat, i) => (
                            <Box
                                key={i}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.8,
                                    color: "rgba(255,255,255,0.75)",
                                    transition: "color 0.3s ease",
                                    "&:hover": { color: "#fff" },
                                }}
                            >
                                {feat.icon}
                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontWeight: 500,
                                        fontSize: { md: "0.65rem", lg: "0.72rem" },
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {feat.label}
                                </Typography>
                            </Box>
                        ))}
                    </Stack>
                </Box>
            </Box>
        </Box>
    );
};

export default Login;
