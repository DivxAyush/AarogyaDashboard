import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
 Box,
 Typography,
 Chip,
 Alert,
 Paper,
 Divider,
 Skeleton,
 Grid,
 Card,
 CardContent,
 IconButton,
 CircularProgress,
} from "@mui/material";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import RefundIcon from "@mui/icons-material/Replay";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import GroupsIcon from "@mui/icons-material/Groups";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import SecurityIcon from "@mui/icons-material/Security";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PaymentIcon from "@mui/icons-material/Payment";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EventNoteIcon from "@mui/icons-material/EventNote";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import DashboardLayout from "../layouts/DashboardLayout";
import PaymentChart from "../components/PaymentChart";
import PaymentDetailsModal from "../components/PaymentDetailsModal";
import { getChartData, getDatasetData } from "../api/api_fun";
import { SUPERSET_CHART_ID } from "../utils/constants";

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
   <polyline fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
   <polygon fill={`url(#spark-${color.replace("#", "")})`} points={`${points} 120,32 0,32`} />
  </svg>
 );
};

const STAT_CONFIG = [
 {
  key: "totalCollection",
  title: "Total Collection",
  icon: <AttachMoneyIcon sx={{ fontSize: 24, color: "#2563eb" }} />,
  color: "#2563eb",
  subtitle: "Lifetime collections",
  trend: "14.2%",
  format: (v) => v !== null ? `₹${Number(v).toLocaleString("en-IN")}` : "Loading…",
  sql: `SELECT uhidno, patientname, receiptno, paymode, collection, refund, receiptdate, username, organization, receiptamt FROM prod_collection WHERE collection > 0 LIMIT 50`,
 },
 {
  key: "totalRefund",
  title: "Total Refund",
  icon: <RefundIcon sx={{ fontSize: 24, color: "#0ea5e9" }} />,
  color: "#0ea5e9",
  subtitle: "Lifetime refunds",
  trend: "8.7%",
  format: (v) => v !== null ? `₹${Number(v).toLocaleString("en-IN")}` : "Loading…",
  sql: `SELECT uhidno, patientname, receiptno, paymode, collection, refund, receiptdate, username, organization, receiptamt FROM prod_collection WHERE refund > 0 LIMIT 50`,
 },
 {
  key: "totalTransactions",
  title: "Total Transactions",
  icon: <ReceiptLongIcon sx={{ fontSize: 24, color: "#6366f1" }} />,
  color: "#6366f1",
  subtitle: "Unique payment receipts",
  trend: "5.3%",
  format: (v) => v !== null ? Number(v).toLocaleString("en-IN") : "Loading…",
  sql: `SELECT uhidno, patientname, receiptno, paymode, collection, refund, receiptdate, username, organization, receiptamt FROM prod_collection LIMIT 50`,
 },
];

// ─── Recent Activity Data ───
const RECENT_ACTIVITIES = [
 {
  icon: <PaymentIcon sx={{ fontSize: 18 }} />,
  iconBg: "#dbeafe",
  iconColor: "#2563eb",
  text: "Payment collection of ₹2.45 L received",
  time: "10:30 AM",
 },
 {
  icon: <PersonAddIcon sx={{ fontSize: 18 }} />,
  iconBg: "#dcfce7",
  iconColor: "#16a34a",
  text: "New patient registered",
  time: "09:45 AM",
 },
 {
  icon: <EventNoteIcon sx={{ fontSize: 18 }} />,
  iconBg: "#fef3c7",
  iconColor: "#d97706",
  text: "Appointment scheduled",
  time: "09:30 AM",
 },
 {
  icon: <CurrencyRupeeIcon sx={{ fontSize: 18 }} />,
  iconBg: "#fce7f3",
  iconColor: "#db2777",
  text: "Refund of ₹15,000 processed",
  time: "09:15 AM",
 },
];

// ─── Bottom Features ───
const FEATURES = [
 {
  icon: <QueryStatsIcon sx={{ fontSize: 22 }} />,
  iconBg: "linear-gradient(135deg, #dbeafe, #eff6ff)",
  iconColor: "#2563eb",
  title: "Real-time Analytics",
  desc: "Live insights and monitoring",
 },
 {
  icon: <SecurityIcon sx={{ fontSize: 22 }} />,
  iconBg: "linear-gradient(135deg, #dcfce7, #f0fdf4)",
  iconColor: "#16a34a",
  title: "Secure & Reliable",
  desc: "Bank-level security guarantee",
 },
 {
  icon: <SmartToyIcon sx={{ fontSize: 22 }} />,
  iconBg: "linear-gradient(135deg, #fef3c7, #fffbeb)",
  iconColor: "#d97706",
  title: "Smart Management",
  desc: "Intelligent workflow automation",
 },
 {
  icon: <FavoriteIcon sx={{ fontSize: 22 }} />,
  iconBg: "linear-gradient(135deg, #fce7f3, #fff1f2)",
  iconColor: "#db2777",
  title: "Better Outcomes",
  desc: "Improved patient care",
 },
];

// ─── Get greeting based on time ───
function getGreeting() {
 const h = new Date().getHours();
 if (h < 12) return "Good Morning";
 if (h < 17) return "Good Afternoon";
 return "Good Evening";
}

/* ═══════════════════════ DASHBOARD COMPONENT ═══════════════════════ */
const Dashboard = () => {
 const [chartData, setChartData] = useState([]);
 const [statsLoading, setStatsLoading] = useState(true);
 const [statsError, setStatsError] = useState("");

 // Card drilldown modal state
 const [modalOpen, setModalOpen] = useState(false);
 const [modalTitle, setModalTitle] = useState("");
 const [drillData, setDrillData] = useState([]);
 const [drillLoading, setDrillLoading] = useState(false);

 useEffect(() => {
  getChartData(SUPERSET_CHART_ID)
   .then((result) => {
    setChartData(result || []);
    setStatsLoading(false);
   })
   .catch((err) => {
    setStatsError("Could not load stats: " + err.message);
    setStatsLoading(false);
   });
 }, []);

 // Card click karne pe ye function chalega
 const handleCardClick = useCallback(async (stat) => {
  setModalTitle(stat.title);
  setDrillData([]);
  setDrillLoading(true);
  setModalOpen(true);

  try {
   const result = await getDatasetData(stat.sql);
   setDrillData(result || []);
  } catch (err) {
   setDrillData([]);
  } finally {
   setDrillLoading(false);
  }
 }, []);

 const handleModalClose = useCallback(() => {
  setModalOpen(false);
  setModalTitle("");
  setDrillData([]);
 }, []);

 const stats = useMemo(() => {
  if (!chartData || chartData.length === 0) {
   return { totalCollection: null, totalRefund: null, totalTransactions: null };
  }

  const totalCollection = chartData.reduce(
   (acc, row) => acc + Number(row["collection"] || row["Collection"] || 0),
   0
  );
  const totalRefund = chartData.reduce(
   (acc, row) => acc + Number(row["refund"] || row["Refund"] || 0),
   0
  );
  const totalTransactions = chartData.length;

  return { totalCollection, totalRefund, totalTransactions };
 }, [chartData]);

 const currentDate = useMemo(
  () =>
   new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
   }),
  []
 );

 const user = useMemo(() => {
  try {
   return JSON.parse(localStorage.getItem("aarogya_user")) || {};
  } catch {
   return {};
  }
 }, []);

 if (statsLoading) {
  return (
   <DashboardLayout>
    <Box sx={{ display: "flex", height: "80vh", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 2 }}>
     <CircularProgress size={60} thickness={4} sx={{ color: "#2563eb" }} />
     <Typography sx={{ color: "#64748b", fontWeight: 600 }}>Loading Dashboard...</Typography>
    </Box>
   </DashboardLayout>
  );
 }

 return (
  <DashboardLayout>
   {/* ═══════ Welcome Hero Section ═══════ */}
   <Box sx={{ mb: 3 }}>
    <Box
     sx={{
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 2,
     }}
    >
     <Box>
      <Typography
       variant="h4"
       sx={{
        fontWeight: 800,
        color: "#0f172a",
        letterSpacing: -0.5,
        lineHeight: 1.2,
        mb: 0.5,
        fontSize: { xs: "1.5rem", md: "1.85rem" },
       }}
      >
       {getGreeting()}, {user?.role || "Administrator"}! 👋
      </Typography>
      <Typography
       sx={{ color: "#64748b", fontSize: "0.9rem" }}
      >
       Here's what's happening with your healthcare operations today.
      </Typography>
     </Box>
     <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Chip
       label={currentDate}
       size="small"
       icon={
        <CalendarMonthIcon
         sx={{ fontSize: 16, color: "#2563eb !important" }}
        />
       }
       sx={{
        bgcolor: "#eff6ff",
        color: "#1e40af",
        fontWeight: 600,
        fontSize: "0.76rem",
        borderRadius: "10px",
        border: "1px solid #dbeafe",
       }}
      />
      <Chip
       label="Live"
       size="small"
       sx={{
        bgcolor: "#f0fdf4",
        color: "#16a34a",
        fontWeight: 700,
        fontSize: "0.72rem",
        borderRadius: "10px",
        border: "1px solid #dcfce7",
        "& .MuiChip-label": {
         display: "flex",
         alignItems: "center",
         gap: 0.5,
        },
       }}
       icon={
        <Box
         sx={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          bgcolor: "#22c55e",
          animation: "pulse 1.5s infinite",
          "@keyframes pulse": {
           "0%, 100%": { opacity: 1 },
           "50%": { opacity: 0.3 },
          },
         }}
        />
       }
      />
     </Box>
    </Box>
   </Box>

   {/* ═══════ Error State ═══════ */}
   {statsError && (
    <Alert severity="warning" sx={{ mb: 3, borderRadius: "14px" }}>
     {statsError}
    </Alert>
   )}

   {/* ═══════ KPI Cards Row — Grid ═══════ */}
   <Grid container spacing={2.5} sx={{ mb: 3 }}>
    {STAT_CONFIG.map((stat) => {
     const value = stats[stat.key];
     const formattedValue = stat.format(value);
     const str = String(formattedValue || "");
     let fontSize = { xs: "1.7rem", md: "1.85rem" };
     if (str.length > 18) fontSize = { xs: "1.1rem", md: "1.25rem" };
     else if (str.length > 14) fontSize = { xs: "1.3rem", md: "1.45rem" };
     else if (str.length > 10) fontSize = { xs: "1.5rem", md: "1.65rem" };

     const cardStyle = {
      borderRadius: "18px",
      background: "rgba(255,255,255,0.92)",
      backdropFilter: "blur(12px)",
      border: "1px solid rgba(255,255,255,0.7)",
      boxShadow: "0 4px 24px rgba(25, 118, 210, 0.08), 0 1px 4px rgba(0,0,0,0.04)",
      transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1), box-shadow 0.25s cubic-bezier(0.4,0,0.2,1)",
      cursor: "pointer",
      "&:hover": {
       transform: "translateY(-6px) scale(1.015)",
       boxShadow: `0 16px 48px ${stat.color}22, 0 4px 16px rgba(0,0,0,0.06)`,
      },
      height: "100%",
      display: "flex",
      flexDirection: "column",
     };

     return (
      <Grid item xs={12} sm={6} md={3} lg={3} key={stat.key} sx={{ display: "flex" }}>
        <Card sx={cardStyle} onClick={() => handleCardClick(stat)}>
         <CardContent sx={{ p: 2.5, pb: 0, flexGrow: 1, display: "flex", flexDirection: "column" }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1.5 }}>
           <Box
            sx={{
             width: 44,
             height: 44,
             borderRadius: "14px",
             background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}40)`,
             display: "flex",
             alignItems: "center",
             justifyContent: "center",
             flexShrink: 0,
            }}
           >
            {stat.icon}
           </Box>
           <IconButton size="small" sx={{ color: "#94a3b8", mt: -0.5, mr: -0.5 }}>
            <MoreVertIcon sx={{ fontSize: 18 }} />
           </IconButton>
          </Box>

          <Typography sx={{ color: "#607d8b", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, fontSize: "0.68rem", mb: 0.5 }}>
           {stat.title}
          </Typography>

          <Typography sx={{ fontWeight: 800, color: "#0f172a", lineHeight: 1.15, letterSpacing: -0.5, fontSize, mb: 0.3, wordBreak: "break-word" }}>
           {formattedValue}
          </Typography>

          {stat.subtitle && (
           <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", fontSize: "0.72rem" }}>
            {stat.subtitle}
           </Typography>
          )}

          {stat.trend && (
           <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1.2 }}>
            <TrendingUpIcon sx={{ fontSize: 14, color: "#22c55e" }} />
            <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#22c55e" }}>
             {stat.trend}
            </Typography>
            <Typography sx={{ fontSize: "0.68rem", color: "#94a3b8", ml: 0.3 }}>
             vs last month
            </Typography>
           </Box>
          )}
         </CardContent>

         <Box sx={{ px: 2.5, pb: 1.5, mt: "auto" }}>
          <MiniSparkline color={stat.color} />
         </Box>
        </Card>
      </Grid>
     );
    })}

    {/* Card 4 — Aarogya Healthcare (Static Promo Card) */}
    <Grid item xs={12} sm={6} md={3} lg={3} sx={{ display: "flex" }}>
     <Paper
      elevation={0}
      sx={{
       borderRadius: "18px",
       background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)",
       overflow: "hidden",
       position: "relative",
       width: "100%",
       display: "flex",
       flexDirection: "column",
       justifyContent: "flex-end",
       p: 2.5,
       cursor: "default",
       transition: "transform 0.25s ease, box-shadow 0.25s ease",
       "&:hover": {
        transform: "translateY(-3px)",
        boxShadow: "0 16px 48px rgba(37,99,235,0.25)",
       },
      }}
     >
      {/* Hospital illustration */}
      <Box
       sx={{
        position: "absolute",
        top: 0,
        right: 0,
        width: "58%",
        height: "100%",
        backgroundImage: "url('/healthcare_card.png')",
        backgroundSize: "contain",
        backgroundPosition: "right center",
        backgroundRepeat: "no-repeat",
        opacity: 0.75,
       }}
      />
      {/* Content */}
      <Box sx={{ position: "relative", zIndex: 2 }}>
       <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: "1.05rem", lineHeight: 1.2, mb: 0.8 }}>
        Aarogya Healthcare
       </Typography>
       <Typography sx={{ color: "rgba(255,255,255,0.78)", fontSize: "0.76rem", lineHeight: 1.5 }}>
        Smart analytics for better healthcare
       </Typography>
      </Box>
     </Paper>
    </Grid>
   </Grid>

   {/* ═══════ Analytics Section ═══════ */}
   <Box sx={{ mb: 3, width: "100%", boxSizing: "border-box" }}>
    <PaymentChart />
   </Box>

   {/* ═══════ Bottom Features Strip — Static 4 Equal Cards ═══════ */}
   <Box sx={{ display: "flex", gap: 1.5, width: "100%", flexWrap: { xs: "wrap", sm: "nowrap" }, boxSizing: "border-box" }}>
    {FEATURES.map((feat, i) => (
     <Box key={i} sx={{ flex: "1 1 0", minWidth: { xs: "calc(50% - 6px)", sm: 0 } }}>
      <Paper
       elevation={0}
       sx={{
        borderRadius: "16px",
        bgcolor: "#fff",
        border: "1px solid #e8f0fe",
        boxShadow: "0 2px 12px rgba(25,118,210,0.04)",
        p: 2,
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        height: "100%",
        transition: "all 0.25s ease",
        cursor: "default",
        "&:hover": {
         transform: "translateY(-3px)",
         boxShadow: "0 8px 28px rgba(25,118,210,0.1)",
        },
       }}
      >
       <Box
        sx={{
         width: 40,
         height: 40,
         borderRadius: "12px",
         background: feat.iconBg,
         display: "flex",
         alignItems: "center",
         justifyContent: "center",
         color: feat.iconColor,
         flexShrink: 0,
        }}
       >
        {feat.icon}
       </Box>
       <Box>
        <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.82rem", lineHeight: 1.2 }}>
         {feat.title}
        </Typography>
        <Typography sx={{ color: "#94a3b8", fontSize: "0.68rem", lineHeight: 1.3 }}>
         {feat.desc}
        </Typography>
       </Box>
      </Paper>
     </Box>
    ))}
   </Box>

   {/* ═══════ Card Drilldown Modal ═══════ */}
   <PaymentDetailsModal
    open={modalOpen}
    onClose={handleModalClose}
    data={drillData}
    loading={drillLoading}
    paymentMode={modalTitle}
   />
  </DashboardLayout>
 );
};

export default Dashboard;
