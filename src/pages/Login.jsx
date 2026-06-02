import React, { useState, useCallback } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
  Grid,
  Checkbox,
  FormControlLabel,
  Link,
  Paper,
} from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/Person";
import LockOutlinedIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import BarChartIcon from "@mui/icons-material/BarChart";
import PieChartIcon from "@mui/icons-material/PieChart";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { useNavigate } from "react-router-dom";
import { STORAGE_KEYS, ROUTES } from "../utils/constants";
import { getToken } from "../api/api_fun";

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});

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
        setError(err.message || "Login failed. Please check your credentials.");
      } finally {
        setLoading(false);
      }
    },
    [form, navigate, validate]
  );

  return (
    <Box sx={{ height: "100vh", width: "100vw", display: "flex", overflow: "hidden" }}>

      {/* LEFT SIDE: FORM */}
      <Box
        sx={{
          width: { xs: "100%", md: "45%", lg: "40%" },
          height: "100%",
          display: "flex",
          flexDirection: "column",
          bgcolor: "#ffffff",
          px: { xs: 4, sm: 8, md: 6, lg: 8 },
          py: { xs: 4, md: 4, lg: 5 },
          zIndex: 2,
          boxShadow: { md: "20px 0 40px rgba(0,0,0,0.03)" }
        }}
      >
        {/* Header (Logo) */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexShrink: 0 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              background: "linear-gradient(135deg, #1565c0 0%, #42a5f5 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(25,118,210,0.25)"
            }}
          >
            <LocalHospitalIcon sx={{ color: "#fff", fontSize: 20 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#1e293b", letterSpacing: -0.5 }}>
            Aarogya
          </Typography>
        </Box>

        {/* Center Form Area */}
        <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "center", width: "100%", maxWidth: 460, mx: "auto" }}>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, color: "#0f172a", mb: 1, fontSize: { xs: "2rem", md: "2.5rem" }, letterSpacing: -1 }}>
              Welcome Back
            </Typography>
            <Typography variant="body1" sx={{ color: "#64748b" }}>
              Enter your username and password to access your account.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: "10px" }} onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "#334155", mb: 1 }}>
              Username
            </Typography>
            <TextField
              fullWidth
              name="username"
              placeholder="username"
              value={form.username}
              onChange={handleChange}
              error={!!errors.username}
              helperText={errors.username}
              disabled={loading}
              sx={{ mb: 2.5, "& .MuiOutlinedInput-root": { borderRadius: "10px", bgcolor: "#f8fafc" } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlineIcon sx={{ color: "#94a3b8" }} />
                  </InputAdornment>
                ),
              }}
            />

            <Typography variant="body2" sx={{ fontWeight: 600, color: "#334155", mb: 1 }}>
              Password
            </Typography>
            <TextField
              fullWidth
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              value={form.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              disabled={loading}
              sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: "10px", bgcolor: "#f8fafc" } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: "#94a3b8" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleTogglePassword} edge="end" size="small">
                      {showPassword ? <VisibilityOffIcon sx={{ color: "#94a3b8", fontSize: 20 }} /> : <VisibilityIcon sx={{ color: "#94a3b8", fontSize: 20 }} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <FormControlLabel
                control={<Checkbox size="small" sx={{ color: "#cbd5e1", padding: "4px", "&.Mui-checked": { color: "#1976d2" } }} />}
                label={<Typography variant="body2" sx={{ color: "#64748b" }}>Remember Me</Typography>}
              />
              <Link href="#" underline="hover" sx={{ variant: "body2", color: "#1976d2", fontWeight: 600 }}>
                Forgot Password?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.5,
                borderRadius: "10px",
                textTransform: "none",
                fontSize: "1.05rem",
                fontWeight: 700,
                bgcolor: "#1976d2",
                boxShadow: "0 8px 20px rgba(25,118,210,0.25)",
                "&:hover": { bgcolor: "#1565c0" },
                mb: 4
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Log In"}
            </Button>

            <Divider sx={{ mb: 4, color: "#94a3b8", fontSize: "0.875rem", "&::before, &::after": { borderColor: "#e2e8f0" } }}>
              Or Login With
            </Divider>

            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{
                    py: 1.2,
                    borderRadius: "8px",
                    borderColor: "#e2e8f0",
                    color: "#475569",
                    textTransform: "none",
                    fontWeight: 600,
                    "&:hover": { bgcolor: "#f8fafc", borderColor: "#cbd5e1" }
                  }}
                >
                  Google
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{
                    py: 1.2,
                    borderRadius: "8px",
                    borderColor: "#e2e8f0",
                    color: "#475569",
                    textTransform: "none",
                    fontWeight: 600,
                    "&:hover": { bgcolor: "#f8fafc", borderColor: "#cbd5e1" }
                  }}
                >
                  Apple
                </Button>
              </Grid>
            </Grid>

            <Typography variant="body2" align="center" sx={{ color: "#64748b", display: "block" }}>
              Don't Have An Account?{" "}
              <Link href="#" underline="hover" sx={{ color: "#1976d2", fontWeight: 700 }}>
                Register Now.
              </Link>
            </Typography>
          </form>
        </Box>

        {/* Footer */}
        <Box sx={{ display: "flex", justifyContent: "space-between", flexShrink: 0, pt: 2, mt: 2, borderTop: "1px solid #f1f5f9", width: "100%", maxWidth: 460, mx: "auto" }}>
          <Typography variant="caption" sx={{ color: "#94a3b8" }}>
            Copyright © 2026 Dataman .
          </Typography>
          <Link href="#" underline="hover" sx={{ variant: "caption", color: "#94a3b8" }}>
            Privacy Policy
          </Link>
        </Box>
      </Box>

      {/* RIGHT SIDE: VISUAL BANNER */}
      <Box
        sx={{
          width: { xs: "0%", md: "55%", lg: "60%" },
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1565c0 0%, #1976d2 50%, #0d47a1 100%)",
          position: "relative",
          p: { md: 6, lg: 10 },
          overflow: "hidden"
        }}
      >
        {/* Decorative Background Patterns */}
        <Box sx={{ position: "absolute", top: "-10%", right: "-10%", width: "60vh", height: "60vh", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)" }} />
        <Box sx={{ position: "absolute", bottom: "-15%", left: "-10%", width: "80vh", height: "80vh", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)" }} />
        <Box sx={{ position: "absolute", top: "20%", left: "10%", width: "30vh", height: "30vh", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)" }} />

        {/* Banner Content Container */}
        <Box sx={{ position: "relative", zIndex: 1, maxWidth: 650, mx: "auto", width: "100%", display: "flex", flexDirection: "column", height: "100%", justifyContent: "center" }}>

          <Box sx={{ flexShrink: 0, mb: { md: 4, lg: 6 } }}>
            <Typography variant="h3" sx={{ color: "#fff", fontWeight: 800, mb: 2, lineHeight: 1.2, letterSpacing: -0.5, fontSize: { md: "2.5rem", lg: "3rem" } }}>
              Effortlessly manage your healthcare operations.
            </Typography>
            <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.8)", fontWeight: 400, lineHeight: 1.5, fontSize: { md: "1rem", lg: "1.15rem" } }}>
              Log in to access your analytics dashboard, monitor collections, and seamlessly manage your hospital's financial health.
            </Typography>
          </Box>

          {/* Dashboard Mockup - Scalable Container */}
          <Box sx={{ position: "relative", width: "100%", flexGrow: 1, minHeight: 250, maxHeight: 400 }}>

            {/* Main Board - Chart Area */}
            <Paper
              elevation={24}
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "80%",
                height: "90%",
                borderRadius: "16px",
                bgcolor: "rgba(255,255,255,0.95)",
                p: { md: 2, lg: 3 },
                boxShadow: "0 24px 60px rgba(0,0,0,0.2)",
                display: "flex",
                flexDirection: "column"
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#1e293b" }}>Revenue Overview</Typography>
                <Box sx={{ width: 80, height: 24, borderRadius: "12px", bgcolor: "#e2e8f0" }} />
              </Box>

              {/* Graph bars representation */}
              <Box sx={{ width: "100%", flexGrow: 1, borderRadius: "8px", bgcolor: "#f8fafc", display: "flex", alignItems: "flex-end", p: 2, gap: { md: 1, lg: 2 }, mb: 2 }}>
                <Box sx={{ flex: 1, height: "40%", bgcolor: "#e2e8f0", borderRadius: "4px 4px 0 0" }} />
                <Box sx={{ flex: 1, height: "65%", bgcolor: "#93c5fd", borderRadius: "4px 4px 0 0" }} />
                <Box sx={{ flex: 1, height: "90%", bgcolor: "#3b82f6", borderRadius: "4px 4px 0 0" }} />
                <Box sx={{ flex: 1, height: "55%", bgcolor: "#93c5fd", borderRadius: "4px 4px 0 0" }} />
                <Box sx={{ flex: 1, height: "75%", bgcolor: "#3b82f6", borderRadius: "4px 4px 0 0" }} />
                <Box sx={{ flex: 1, height: "100%", bgcolor: "#1d4ed8", borderRadius: "4px 4px 0 0" }} />
              </Box>

              {/* Stats row inside Mockup */}
              <Box sx={{ display: "flex", gap: 2, flexShrink: 0, height: 40 }}>
                <Box sx={{ flex: 1, height: "100%", borderRadius: "6px", bgcolor: "#f1f5f9" }} />
                <Box sx={{ flex: 1, height: "100%", borderRadius: "6px", bgcolor: "#f1f5f9" }} />
              </Box>
            </Paper>

            {/* Floating Widget 1: Pie Chart */}
            <Paper
              elevation={12}
              sx={{
                position: "absolute",
                top: -15,
                right: 0,
                width: { md: 180, lg: 220 },
                height: { md: 160, lg: 180 },
                borderRadius: "16px",
                bgcolor: "#fff",
                p: { md: 1.5, lg: 2.5 },
                boxShadow: "0 16px 40px rgba(0,0,0,0.15)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                zIndex: 2
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 700, color: "#1e293b", alignSelf: "flex-start", mb: 2 }}>Patient Composition</Typography>
              <Box sx={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center", flexGrow: 1 }}>
                <PieChartIcon sx={{ fontSize: { md: 70, lg: 80 }, color: "#42a5f5", opacity: 0.9 }} />
                <Box sx={{ position: "absolute", width: { md: 34, lg: 40 }, height: { md: 34, lg: 40 }, borderRadius: "50%", bgcolor: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: "#1565c0" }}>65%</Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", gap: 1, mt: 2, width: "100%" }}>
                <Box sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: "#42a5f5" }} />
                <Box sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: "#e2e8f0" }} />
              </Box>
            </Paper>

            {/* Floating Widget 2: Collection Stats */}
            <Paper
              elevation={12}
              sx={{
                position: "absolute",
                bottom: { md: 10, lg: 20 },
                right: { md: -10, lg: -20 },
                width: { md: 220, lg: 240 },
                borderRadius: "16px",
                bgcolor: "#1e293b",
                p: { md: 2, lg: 2.5 },
                boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                zIndex: 3
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: { md: 1, lg: 2 } }}>
                <Box>
                  <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", mb: 0.5 }}>Total Collections</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: "#fff", letterSpacing: -0.5, fontSize: { md: "1.25rem", lg: "1.5rem" } }}>₹8.40 Cr</Typography>
                </Box>
                <Box sx={{ p: 1, borderRadius: "10px", bgcolor: "rgba(59,130,246,0.2)" }}>
                  <TrendingUpIcon sx={{ color: "#60a5fa", fontSize: { md: 18, lg: 24 } }} />
                </Box>
              </Box>
              <Typography variant="caption" sx={{ color: "#4ade80", fontWeight: 600, display: "flex", alignItems: "center", gap: 0.5 }}>
                ▲ +14.2% <span style={{ color: "#64748b", fontWeight: 400 }}>from last month</span>
              </Typography>
            </Paper>

          </Box>
        </Box>

      </Box>
    </Box>
  );
};

export default Login;
