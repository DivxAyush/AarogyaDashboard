import React, { useState, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/Person";
import LockOutlinedIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import { useNavigate } from "react-router-dom";
import { STORAGE_KEYS, ROUTES } from "../utils/constants";
import { getToken } from "../api/api_fun";

// ─────────────────────────────────────────────
// Login Page — Modern Authentication UI
// ─────────────────────────────────────────────

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
        // ── Real Superset Authentication ──────────────
        const token = await getToken(form.username, form.password);

        // Token aur user info localStorage mein save karo
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
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #e3f2fd 0%, #f0f6ff 40%, #bbdefb 100%)",
        backgroundImage:
          "radial-gradient(ellipse at 20% 50%, rgba(25,118,210,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(2,136,209,0.10) 0%, transparent 60%)",
        p: 2,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decorative circles */}
      <Box
        sx={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(25,118,210,0.08), transparent 70%)",
          top: "-10%",
          left: "-5%",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(2,136,209,0.06), transparent 70%)",
          bottom: "5%",
          right: "5%",
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          width: "100%",
          maxWidth: 440,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Logo & Branding */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: "22px",
              background: "linear-gradient(135deg, #0d47a1 0%, #42a5f5 100%)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 12px 40px rgba(25,118,210,0.30)",
              mb: 2,
            }}
          >
            <LocalHospitalIcon sx={{ color: "#fff", fontSize: 36 }} />
          </Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 900, color: "#0d47a1", letterSpacing: -0.5 }}
          >
            AarogyaDashBoard
          </Typography>
          <Typography variant="body2" sx={{ color: "#78909c", mt: 0.5 }}>
            Healthcare Analytics Platform
          </Typography>
        </Box>

        {/* Login Card */}
        <Card
          elevation={0}
          sx={{
            borderRadius: "24px",
            background: "rgba(255,255,255,0.88)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.9)",
            boxShadow: "0 20px 60px rgba(25,118,210,0.15)",
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "#1a2035", mb: 0.5 }}
            >
              Sign In
            </Typography>
            <Typography variant="body2" sx={{ color: "#90a4ae", mb: 3 }}>
              Enter your credentials to access the dashboard
            </Typography>

            {error && (
              <Alert
                severity="error"
                sx={{ borderRadius: "12px", mb: 2.5, fontSize: "0.85rem" }}
                onClose={() => setError("")}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              {/* Username Field */}
              <TextField
                id="login-username"
                name="username"
                label="Username"
                value={form.username}
                onChange={handleChange}
                error={!!errors.username}
                helperText={errors.username}
                fullWidth
                autoComplete="username"
                autoFocus
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineIcon sx={{ color: "#90a4ae" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 2.5,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "14px",
                    "&:hover fieldset": { borderColor: "#1976d2" },
                    "&.Mui-focused fieldset": { borderColor: "#1976d2", borderWidth: 2 },
                  },
                }}
              />

              {/* Password Field */}
              <TextField
                id="login-password"
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                fullWidth
                autoComplete="current-password"
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon sx={{ color: "#90a4ae" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        id="toggle-password-visibility"
                        onClick={handleTogglePassword}
                        edge="end"
                        tabIndex={-1}
                        size="small"
                      >
                        {showPassword ? (
                          <VisibilityOffIcon fontSize="small" sx={{ color: "#90a4ae" }} />
                        ) : (
                          <VisibilityIcon fontSize="small" sx={{ color: "#90a4ae" }} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 3.5,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "14px",
                    "&:hover fieldset": { borderColor: "#1976d2" },
                    "&.Mui-focused fieldset": { borderColor: "#1976d2", borderWidth: 2 },
                  },
                }}
              />

              {/* Submit Button */}
              <Button
                id="login-submit-btn"
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  py: 1.5,
                  borderRadius: "14px",
                  background: loading
                    ? "#90a4ae"
                    : "linear-gradient(135deg, #0d47a1 0%, #1976d2 100%)",
                  boxShadow: loading ? "none" : "0 8px 24px rgba(25,118,210,0.35)",
                  textTransform: "none",
                  fontSize: "1rem",
                  fontWeight: 700,
                  letterSpacing: 0.3,
                  transition: "all 0.25s",
                  "&:hover": {
                    background: "linear-gradient(135deg, #0a3880 0%, #1565c0 100%)",
                    boxShadow: "0 12px 32px rgba(25,118,210,0.40)",
                    transform: "translateY(-1px)",
                  },
                  "&:active": { transform: "translateY(0)" },
                }}
              >
                {loading ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <CircularProgress size={20} sx={{ color: "#fff" }} />
                    <span>Signing In…</span>
                  </Box>
                ) : (
                  "Sign In"
                )}
              </Button>
            </Box>

            <Box
              sx={{
                mt: 3,
                p: 2,
                borderRadius: "12px",
                background: "linear-gradient(135deg, #e3f2fd, #f0f6ff)",
                border: "1px solid #bbdefb",
                display: "flex",
                alignItems: "flex-start",
                gap: 1,
              }}
            >
              <Typography variant="caption" sx={{ color: "#1565c0", lineHeight: 1.5 }}>
                🔐 <strong>Superset credentials</strong>
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Typography
          variant="caption"
          sx={{ display: "block", textAlign: "center", mt: 3, color: "#90a4ae" }}
        >
          © {new Date().getFullYear()} AarogyaDashBoard. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;
