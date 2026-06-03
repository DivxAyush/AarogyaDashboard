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
 alpha,
} from "@mui/material";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import RefundIcon from "@mui/icons-material/Replay";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import SecurityIcon from "@mui/icons-material/Security";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PaymentIcon from "@mui/icons-material/Payment";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EventNoteIcon from "@mui/icons-material/EventNote";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DashboardLayout from "../layouts/DashboardLayout";
import PaymentChart from "../components/PaymentChart";
import PaymentDetailsModal from "../components/PaymentDetailsModal";
import RevenueDetailsModal from "../components/RevenueDetailsModal";
import OutstandingDetailsModal from "../components/OutstandingDetailsModal";
import DashboardFilterBar from "../components/DashboardFilterBar";
import OPDDashboard from "./dashboards/OPDDashboard";
import IPDDashboard from "./dashboards/IPDDashboard";
import PharmacyDashboard from "./dashboards/PharmacyDashboard";
import { getChartData, getDatasetData, getAllCollectionData, getAllRevenueData, getAllOutstandingData } from "../api/api_fun";
import { SUPERSET_CHART_ID } from "../utils/constants";

// ─── Shared card dimensions ───────────────────────────────────────────────────
const CARD_MIN_HEIGHT = 210; // px — ALL 4 cards must match this
const CARD_PADDING = "20px 20px 0 20px"; // top/side padding (bottom handled by sparkline wrapper)
const CARD_RADIUS = "18px";
const CARD_SHADOW = "0 4px 24px rgba(25,118,210,0.08), 0 1px 4px rgba(0,0,0,0.04)";

// ─── Mini sparkline ───────────────────────────────────────────────────────────
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

// ─── Skeleton summary card — exact same shell as the real card ────────────────
const SkeletonSummaryCard = () => (
 <Box
  sx={{
   borderRadius: CARD_RADIUS,
   background: "rgba(255,255,255,0.92)",
   backdropFilter: "blur(12px)",
   border: "1px solid rgba(255,255,255,0.7)",
   boxShadow: CARD_SHADOW,
   minHeight: CARD_MIN_HEIGHT,
   height: "100%",
   display: "flex",
   flexDirection: "column",
   overflow: "hidden",
  }}
 >
  {/* top content area */}
  <Box sx={{ p: "20px 20px 0 20px", flexGrow: 1, display: "flex", flexDirection: "column" }}>
   {/* icon + kebab row */}
   <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1.5 }}>
    <Skeleton variant="rounded" width={44} height={44} sx={{ borderRadius: "14px" }} />
    <Skeleton variant="circular" width={28} height={28} />
   </Box>
   {/* title */}
   <Skeleton variant="text" width="55%" height={14} sx={{ mb: 0.8 }} />
   {/* value */}
   <Skeleton variant="text" width="90%" height={36} sx={{ mb: 0.4 }} />
   {/* subtitle */}
   <Skeleton variant="text" width="65%" height={13} sx={{ mb: 1 }} />
  </Box>
  {/* sparkline area — fixed height, pinned to bottom */}
  <Box sx={{ px: "20px", pb: "12px", flexShrink: 0 }}>
   <Skeleton variant="rounded" width="100%" height={32} sx={{ borderRadius: "6px" }} />
  </Box>
 </Box>
);

// ─── Skeleton Aarogya promo card — same shell as the real promo card ──────────
const SkeletonPromoCard = () => (
 <Box
  sx={{
   borderRadius: CARD_RADIUS,
   background: "linear-gradient(135deg, #c7d8f8 0%, #dbeafe 100%)",
   minHeight: CARD_MIN_HEIGHT,
   height: "100%",
   display: "flex",
   flexDirection: "column",
   justifyContent: "flex-end",
   p: "20px",
   overflow: "hidden",
  }}
 >
  <Skeleton variant="text" width="60%" height={22} sx={{ mb: 1, bgcolor: "rgba(255,255,255,0.5)" }} />
  <Skeleton variant="text" width="80%" height={16} sx={{ bgcolor: "rgba(255,255,255,0.4)" }} />
 </Box>
);

const STAT_CONFIG = [
 {
  key: "netCollection",
  title: "Net Collection",
  icon: <AttachMoneyIcon sx={{ fontSize: 24, color: "#2563eb" }} />,
  color: "#2563eb",
  subtitle: "Total net amount",
  format: (v) => { const n = Number(v); return !isNaN(n) ? `₹${n.toLocaleString("en-IN")}` : "₹0"; },
  sql: `SELECT * FROM vw_collection WHERE "Receipt Amount" IS NOT NULL `,
 },
 {
  key: "grossCollection",
  title: "Gross Collection",
  icon: <ReceiptLongIcon sx={{ fontSize: 24, color: "#6366f1" }} />,
  color: "#6366f1",
  subtitle: "Total gross amount",
  format: (v) => { const n = Number(v); return !isNaN(n) ? `₹${n.toLocaleString("en-IN")}` : "₹0"; },
  sql: `SELECT * FROM vw_collection`,
 },
 {
  key: "refund",
  title: "Refund",
  icon: <RefundIcon sx={{ fontSize: 24, color: "#0ea5e9" }} />,
  color: "#0ea5e9",
  subtitle: "Total refunds",
  format: (v) => { const n = Number(v); return !isNaN(n) ? `₹${n.toLocaleString("en-IN")}` : "₹0"; },
  sql: `SELECT * FROM vw_collection`,
 },
 {
  key: "revenue",
  title: "Net Revenue",
  icon: <QueryStatsIcon sx={{ fontSize: 24, color: "#10b981" }} />,
  color: "#10b981",
  subtitle: "Total revenue",
  format: (v) => { const n = Number(v); return !isNaN(n) ? `₹${n.toLocaleString("en-IN")}` : "₹0"; },
  sql: `SELECT * FROM vw_revenue`,
 },
 {
  key: "grossRevenue",
  title: "Gross Revenue",
  icon: <AttachMoneyIcon sx={{ fontSize: 24, color: "#f59e0b" }} />,
  color: "#f59e0b",
  subtitle: "Total gross revenue",
  format: (v) => { const n = Number(v); return !isNaN(n) ? `₹${n.toLocaleString("en-IN")}` : "₹0"; },
  sql: `SELECT * FROM vw_revenue`,
 },
 {
  key: "discount",
  title: "Discount",
  icon: <AttachMoneyIcon sx={{ fontSize: 24, color: "#ef4444" }} />,
  color: "#ef4444",
  subtitle: "Total discount",
  format: (v) => { const n = Number(v); return !isNaN(n) ? `₹${n.toLocaleString("en-IN")}` : "₹0"; },
  sql: `SELECT * FROM vw_revenue`,
 },
 {
  key: "outstanding",
  title: "Total Outstanding",
  icon: <AttachMoneyIcon sx={{ fontSize: 24, color: "#eab308" }} />,
  color: "#eab308",
  subtitle: "Total outstanding amount",
  format: (v) => { const n = Number(v); return !isNaN(n) ? `₹${n.toLocaleString("en-IN")}` : "₹0"; },
  sql: `SELECT * FROM vw_outstanding`,
 },
 {
  key: "cashPatientOutstanding",
  title: "Cash Patient Outstanding",
  icon: <AttachMoneyIcon sx={{ fontSize: 24, color: "#f97316" }} />,
  color: "#f97316",
  subtitle: "Outstanding for Cash Patients",
  format: (v) => { const n = Number(v); return !isNaN(n) ? `₹${n.toLocaleString("en-IN")}` : "₹0"; },
  sql: `SELECT * FROM vw_outstanding WHERE organization='Cash Patient' `,
 },
 {
  key: "orgOutstanding",
  title: "Organization Outstanding",
  icon: <AttachMoneyIcon sx={{ fontSize: 24, color: "#8b5cf6" }} />,
  color: "#8b5cf6",
  subtitle: "Outstanding for Organizations",
  format: (v) => { const n = Number(v); return !isNaN(n) ? `₹${n.toLocaleString("en-IN")}` : "₹0"; },
  sql: `SELECT * FROM vw_outstanding WHERE organization!='Cash Patient' `,
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
 const [activeTab, setActiveTab] = useState("Home Dashboard");
 const [chartData, setChartData] = useState([]);
 const [statsLoading, setStatsLoading] = useState(true);
 const [statsError, setStatsError] = useState("");

 // Card drilldown modal state
 const [modalOpen, setModalOpen] = useState(false);
 const [modalTitle, setModalTitle] = useState("");
 const [modalKey, setModalKey] = useState("");
 const [drillData, setDrillData] = useState([]);
 const [drillLoading, setDrillLoading] = useState(false);

 // Payment Mode global data state
 const [paymentModeData, setPaymentModeData] = useState([]);
 const [paymentModeLoading, setPaymentModeLoading] = useState(true);

 // All collection data state
 const [allCollectionData, setAllCollectionData] = useState([]);
 const [allCollectionLoading, setAllCollectionLoading] = useState(true);

 // All revenue data state
 const [allRevenueData, setAllRevenueData] = useState([]);
 const [allRevenueLoading, setAllRevenueLoading] = useState(true);

 // All outstanding data state
 const [allOutstandingData, setAllOutstandingData] = useState([]);
 const [allOutstandingLoading, setAllOutstandingLoading] = useState(true);

 // Dynamic Dropdown states
 const [siteCodes, setSiteCodes] = useState([]);
 const [specialities, setSpecialities] = useState([]);

 // Filter state
 const today = new Date();
 const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
 const firstDayOfMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;
 const [filters, setFilters] = useState({
  date: { from: firstDayOfMonthStr, to: todayStr, preset: "mtd" },
  dashboard: "",
  speciality: "",
  siteCode: "",
 });
 const handleFilterChange = useCallback((newFilters) => {
  setFilters(newFilters);
 }, []);

 useEffect(() => {
  // Fetch distinct site codes
  getDatasetData("SELECT DISTINCT site_code FROM vw_collection WHERE site_code IS NOT NULL")
   .then((res) => {
    if (res && res.length > 0) {
     const codes = res.map((row) => row.site_code).filter(Boolean);
     setSiteCodes(codes);
    }
   })
   .catch((err) => console.error("Failed to fetch site codes:", err));

  // Fetch distinct specialities
  getDatasetData("SELECT DISTINCT speciality FROM vw_collection WHERE speciality IS NOT NULL")
   .then((res) => {
    if (res && res.length > 0) {
     const specs = res.map((row) => row.speciality).filter(Boolean);
     setSpecialities(specs);
    }
   })
   .catch((err) => console.error("Failed to fetch specialities:", err));
 }, []);

 useEffect(() => {
  setAllCollectionLoading(true);
  setAllRevenueLoading(true);
  setAllOutstandingLoading(true);

  getAllCollectionData(filters)
   .then((res) => {
    setAllCollectionData(res || []);
    setAllCollectionLoading(false);
   })
   .catch((err) => {
    console.error("Failed to fetch all collection data:", err);
    setAllCollectionLoading(false);
   });

  getAllRevenueData(filters)
   .then((res) => {
    setAllRevenueData(res || []);
    setAllRevenueLoading(false);
   })
   .catch((err) => {
    console.error("Failed to fetch all revenue data:", err);
    setAllRevenueLoading(false);
   });

  getAllOutstandingData(filters)
   .then((res) => {
    setAllOutstandingData(res || []);
    setAllOutstandingLoading(false);
   })
   .catch((err) => {
    console.error("Failed to fetch all outstanding data:", err);
    setAllOutstandingLoading(false);
   });
 }, [filters]);

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
  setModalKey(stat.key);
  setDrillData([]);
  setDrillLoading(true);
  setModalOpen(true);

  try {
   let query = stat.sql;
   if (query.toUpperCase().includes("WHERE")) {
    if (filters.date?.from) query += ` AND CAST(date AS DATE) >= '${filters.date.from}'`;
    if (filters.date?.to) query += ` AND CAST(date AS DATE) <= '${filters.date.to}'`;
    if (filters.siteCode) query += ` AND site_code = '${filters.siteCode}'`;
    if (filters.speciality) query += ` AND speciality = '${filters.speciality}'`;
   } else {
    query += " WHERE 1=1";
    if (filters.date?.from) query += ` AND CAST(date AS DATE) >= '${filters.date.from}'`;
    if (filters.date?.to) query += ` AND CAST(date AS DATE) <= '${filters.date.to}'`;
    if (filters.siteCode) query += ` AND site_code = '${filters.siteCode}'`;
    if (filters.speciality) query += ` AND speciality = '${filters.speciality}'`;
   }

   const result = await getDatasetData(query);
   setDrillData(result || []);
  } catch (err) {
   setDrillData([]);
  } finally {
   setDrillLoading(false);
  }
 }, [filters]);

 const handleModalClose = useCallback(() => {
  setModalOpen(false);
  setModalTitle("");
  setModalKey("");
  setDrillData([]);
 }, []);

 const stats = useMemo(() => {
  if (!allCollectionData || allCollectionData.length === 0) {
   return { netCollection: 0, grossCollection: 0, refund: 0 };
  }

  const netCollection = allCollectionData.reduce(
   (acc, row) => acc + Number(row["Receipt Amount"] || 0),
   0
  );
  const grossCollection = allCollectionData.reduce(
   (acc, row) => acc + Number(row["collection"] || row["Collection"] || 0),
   0
  );
  const refund = allCollectionData.reduce(
   (acc, row) => acc + Number(row["refund"] || row["Refund"] || 0),
   0
  );

  const revenue = (!allRevenueData || allRevenueData.length === 0)
   ? 0
   : allRevenueData.reduce((acc, row) => acc + Number(row["oh_amt_net"] || row["oh_amt_net"] || 0), 0);

  const grossRevenue = (!allRevenueData || allRevenueData.length === 0)
   ? 0
   : allRevenueData.reduce((acc, row) => acc + Number(row["grossamount"] || row["Grossamount"] || 0), 0);

  const discount = (!allRevenueData || allRevenueData.length === 0)
   ? 0
   : allRevenueData.reduce((acc, row) => acc + Number(row["discount"] || row["Discount"] || 0), 0);

  const outstanding = (!allOutstandingData || allOutstandingData.length === 0)
   ? 0
   : allOutstandingData.reduce((acc, row) => acc + Number(row["outstanding"] || row["Outstanding"] || row["balance"] || row["Balance"] || 0), 0);

  const cashPatientOutstanding = (!allOutstandingData || allOutstandingData.length === 0)
   ? 0
   : allOutstandingData.reduce((acc, row) => {
    const isCash = (row.organization || row.Organization) === "Cash Patient";
    return isCash ? acc + Number(row["outstanding"] || row["Outstanding"] || row["balance"] || row["Balance"] || 0) : acc;
   }, 0);

  const orgOutstanding = (!allOutstandingData || allOutstandingData.length === 0)
   ? 0
   : allOutstandingData.reduce((acc, row) => {
    const isCash = (row.organization || row.Organization) === "Cash Patient";
    return !isCash ? acc + Number(row["outstanding"] || row["Outstanding"] || row["balance"] || row["Balance"] || 0) : acc;
   }, 0);

  return { netCollection, grossCollection, refund, revenue, grossRevenue, discount, outstanding, cashPatientOutstanding, orgOutstanding };
 }, [allCollectionData, allRevenueData, allOutstandingData]);

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

 // statsLoading → skeleton row using the same flex container as real cards
 const renderSkeletonCards = () => (
  <Box
   sx={{
    display: "flex",
    flexDirection: { xs: "column", sm: "row" },
    flexWrap: "wrap",
    gap: 2,
    mb: 2,
    width: "100%",
    alignItems: "stretch",
   }}
  >
   {[...Array(9)].map((_, i) => (
    <Box key={i} sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 16px)", md: "1 1 calc(33.333% - 16px)" }, minWidth: 0 }}>
     <SkeletonPromoCard />
    </Box>
   ))}
  </Box>
 );

 return (
  <DashboardLayout>
   {/* ═══════ Dashboard Filter Bar ═══════ */}
   <DashboardFilterBar
    filters={filters}
    onChange={handleFilterChange}
    activeTab={activeTab}
    onTabChange={setActiveTab}
    siteCodes={siteCodes}
    specialities={specialities}
   />

   {activeTab === "Home Dashboard" && (
    <Box sx={{ animation: "fadeIn 0.3s ease-in-out", "@keyframes fadeIn": { "0%": { opacity: 0 }, "100%": { opacity: 1 } } }}>
     {/* ═══════ Error State ═══════ */}
     {statsError && (
      <Alert severity="warning" sx={{ mb: 3, borderRadius: "14px" }}>
       {statsError}
      </Alert>
     )}

     {/* ═══════ KPI Cards Row — Flex (pixel-perfect equal width, Grahaak style) ═══════ */}
     {statsLoading ? renderSkeletonCards() : (
      <Box
       sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        flexWrap: "wrap",
        gap: 2,
        mb: 2,
        width: "100%",
        alignItems: "stretch",  /* all slots grow to the tallest card */
       }}
      >
       {STAT_CONFIG.map((stat) => {
        const value = stats[stat.key];
        const formattedValue = stat.format(value);
        const str = String(formattedValue || "");
        // font-size shrinks for long text — card height stays FIXED
        let valueFontSize = { xs: "1.7rem", md: "1.85rem" };
        if (str.length > 18) valueFontSize = { xs: "1.05rem", md: "1.15rem" };
        else if (str.length > 14) valueFontSize = { xs: "1.2rem", md: "1.35rem" };
        else if (str.length > 10) valueFontSize = { xs: "1.45rem", md: "1.6rem" };

        return (
         /* flex: 1 1 calc(33.333% - 16px) makes it wrap neatly for 6 cards */
         <Box key={stat.key} sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 16px)", md: "1 1 calc(33.333% - 16px)" }, minWidth: 0 }}>
          <Card
           onClick={() => handleCardClick(stat)}
           sx={{
            borderRadius: CARD_RADIUS,
            minHeight: CARD_MIN_HEIGHT,
            width: "100%",
            height: "100%",
            overflow: "hidden",
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.7)",
            boxShadow: CARD_SHADOW,
            display: "flex",
            flexDirection: "column",
            cursor: "pointer",
            transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1), box-shadow 0.25s cubic-bezier(0.4,0,0.2,1)",
            "&:hover": {
             transform: "translateY(-6px) scale(1.015)",
             boxShadow: `0 16px 48px ${stat.color}22, 0 4px 16px rgba(0,0,0,0.06)`,
            },
           }}
          >
           {/* top content — grows */}
           <CardContent
            sx={{
             p: CARD_PADDING,
             flexGrow: 1,
             display: "flex",
             flexDirection: "column",
             "&:last-child": { pb: 0 },
            }}
           >
            {/* Icon + kebab */}
            <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
             <Box
              sx={{
               width: 48, height: 48,
               borderRadius: "14px",
               background: alpha(stat.color, 0.12),
               display: "flex", alignItems: "center", justifyContent: "center",
               flexShrink: 0,
              }}
             >
              {stat.icon}
             </Box>
             <IconButton size="small" sx={{ color: "#94a3b8", mt: -0.5, mr: -0.5 }}>
              <MoreVertIcon sx={{ fontSize: 18 }} />
             </IconButton>
            </Box>

            {/* Label */}
            <Typography sx={{ color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, fontSize: "0.68rem", mb: 0.5 }}>
             {stat.title}
            </Typography>

            {/* Value */}
            <Typography
             sx={{
              fontWeight: 800, color: "#0f172a",
              lineHeight: 1.15, letterSpacing: -0.5,
              fontSize: valueFontSize,
              mb: 0.3,
              wordBreak: "break-word",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
             }}
            >
             {formattedValue}
            </Typography>

            {/* Subtitle */}
            {stat.subtitle && (
             <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", fontSize: "0.72rem", mb: 2 }}>
              {stat.subtitle}
             </Typography>
            )}
           </CardContent>

           {/* Sparkline — pinned at bottom */}
           <Box sx={{ px: "20px", pb: "12px", flexShrink: 0 }}>
            <MiniSparkline color={stat.color} />
           </Box>
          </Card>
         </Box>
        );
       })}
      </Box>
     )}

     {/* ═══════ Analytics Section ═══════ */}
     {/* <Box sx={{ mb: 2, width: "100%", boxSizing: "border-box" }}>
      <PaymentChart />
     </Box> */}

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

     {/* ═══════ Drilldown Modals ═══════ */}
     {["outstanding", "cashPatientOutstanding", "orgOutstanding"].includes(modalKey) ? (
      <OutstandingDetailsModal
       open={modalOpen}
       onClose={handleModalClose}
       data={drillData}
       loading={drillLoading}
      />
     ) : ["revenue", "grossRevenue", "discount"].includes(modalKey) ? (
      <RevenueDetailsModal
       open={modalOpen}
       onClose={handleModalClose}
       data={drillData}
       loading={drillLoading}
      />
     ) : (
      <PaymentDetailsModal
       open={modalOpen}
       onClose={handleModalClose}
       data={drillData}
       loading={drillLoading}
       paymentMode={modalTitle}
      />
     )}
    </Box>
   )}

   {activeTab === "OPD Dashboard" && <OPDDashboard />}
   {activeTab === "IPD Dashboard" && <IPDDashboard />}
   {activeTab === "Pharmacy Dashboard" && <PharmacyDashboard />}
  </DashboardLayout>
 );
};

export default Dashboard;
