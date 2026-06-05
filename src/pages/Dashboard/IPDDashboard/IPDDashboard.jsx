import React, { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
 Box,
 Typography,
 Paper,
 Card,
 CardContent,
 IconButton,
 alpha,
} from "@mui/material";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import RefundIcon from "@mui/icons-material/Replay";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import SecurityIcon from "@mui/icons-material/Security";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import FavoriteIcon from "@mui/icons-material/Favorite";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PaymentDetailsModal from "../HomeDashboard/Detail/PaymentDetailsModal";
import RevenueDetailsModal from "../HomeDashboard/Detail/RevenueDetailsModal";
import OutstandingDetailsModal from "../HomeDashboard/Detail/OutstandingDetailsModal";
import StatsDetailsModal from "../HomeDashboard/Detail/StatsDetailsModal";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import BedIcon from "@mui/icons-material/Bed";
import { ROUTES } from "../../../utils/constants";
import { useData } from "../../../context/DataContext";

// ─── Shared card dimensions ───────────────────────────────────────────────────
const CARD_MIN_HEIGHT = 130;
const CARD_PADDING = "12px 14px 0 14px";
const CARD_RADIUS = "16px";
const CARD_SHADOW = "0 4px 24px rgba(25,118,210,0.08), 0 1px 4px rgba(0,0,0,0.04)";

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

const HEALTH_QUOTES = [
 "The greatest wealth is health. Fetching your data...",
 "Healing takes time, but your data won't... Just a moment!",
 "Wherever the art of medicine is loved, there is also a love of humanity.",
 "Good health and good sense are two of life's greatest blessings.",
 "Medicine cures diseases, but only doctors can cure patients."
];

const BouncingDotsLoader = () => {
 const [quote] = useState(() => HEALTH_QUOTES[Math.floor(Math.random() * HEALTH_QUOTES.length)]);
 return (
  <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '350px', width: '100%', gap: 3 }}>
   <Box sx={{ display: 'flex', gap: 1.5 }}>
    <style>{`
                    @keyframes googleBounce {
                        0%, 100% { transform: translateY(0) scale(1); }
                        50% { transform: translateY(-20px) scale(1.1); }
                    }
                    .g-dot {
                        width: 14px;
                        height: 14px;
                        border-radius: 50%;
                        animation: googleBounce 1.2s infinite ease-in-out;
                    }
                    .g-dot-1 { background-color: #4285F4; animation-delay: 0s; }
                    .g-dot-2 { background-color: #EA4335; animation-delay: 0.15s; }
                    .g-dot-3 { background-color: #FBBC05; animation-delay: 0.3s; }
                    .g-dot-4 { background-color: #34A853; animation-delay: 0.45s; }
                    .g-dot-5 { background-color: #8b5cf6; animation-delay: 0.6s; }
                `}</style>
    <Box className="g-dot g-dot-1" />
    <Box className="g-dot g-dot-2" />
    <Box className="g-dot g-dot-3" />
    <Box className="g-dot g-dot-4" />
    <Box className="g-dot g-dot-5" />
   </Box>
   <Typography sx={{ color: '#64748b', fontSize: '0.95rem', fontWeight: 600, fontStyle: 'italic', maxWidth: '80%', textAlign: 'center', animation: "fadeIn 0.5s ease-in-out" }}>
    "{quote}"
   </Typography>
  </Box>
 );
};

const STAT_CONFIG = [
 {
  key: "netCollection",
  title: "Net Collection",
  section: "collection",
  icon: <AttachMoneyIcon sx={{ fontSize: 24, color: "#2563eb" }} />,
  color: "#2563eb",
  subtitle: "Total net amount",
  format: (v) => { const n = Number(v); return !isNaN(n) ? `₹${n.toLocaleString("en-IN")}` : "₹0"; },
 },
 {
  key: "grossCollection",
  title: "Gross Collection",
  section: "collection",
  icon: <ReceiptLongIcon sx={{ fontSize: 24, color: "#6366f1" }} />,
  color: "#6366f1",
  subtitle: "Total gross amount",
  format: (v) => { const n = Number(v); return !isNaN(n) ? `₹${n.toLocaleString("en-IN")}` : "₹0"; },
 },
 {
  key: "refund",
  title: "Refund",
  section: "collection",
  icon: <RefundIcon sx={{ fontSize: 24, color: "#0ea5e9" }} />,
  color: "#0ea5e9",
  subtitle: "Total refunds",
  format: (v) => { const n = Number(v); return !isNaN(n) ? `₹${n.toLocaleString("en-IN")}` : "₹0"; },
 },
 {
  key: "revenue",
  title: "Net Revenue",
  section: "revenue",
  icon: <QueryStatsIcon sx={{ fontSize: 24, color: "#10b981" }} />,
  color: "#10b981",
  subtitle: "Total revenue",
  format: (v) => { const n = Number(v); return !isNaN(n) ? `₹${n.toLocaleString("en-IN")}` : "₹0"; },
 },
 {
  key: "grossRevenue",
  title: "Gross Revenue",
  section: "revenue",
  icon: <AttachMoneyIcon sx={{ fontSize: 24, color: "#f59e0b" }} />,
  color: "#f59e0b",
  subtitle: "Total gross revenue",
  format: (v) => { const n = Number(v); return !isNaN(n) ? `₹${n.toLocaleString("en-IN")}` : "₹0"; },
 },
 {
  key: "discount",
  title: "Discount",
  section: "revenue",
  icon: <AttachMoneyIcon sx={{ fontSize: 24, color: "#ef4444" }} />,
  color: "#ef4444",
  subtitle: "Total discount",
  format: (v) => { const n = Number(v); return !isNaN(n) ? `₹${n.toLocaleString("en-IN")}` : "₹0"; },
 },
 {
  key: "outstanding",
  title: "Total Outstanding",
  section: "outstanding",
  icon: <AttachMoneyIcon sx={{ fontSize: 24, color: "#eab308" }} />,
  color: "#eab308",
  subtitle: "Total outstanding amount",
  format: (v) => { const n = Number(v); return !isNaN(n) ? `₹${n.toLocaleString("en-IN")}` : "₹0"; },
 },
 {
  key: "cashPatientOutstanding",
  title: "Cash Patient Outstanding",
  section: "outstanding",
  icon: <AttachMoneyIcon sx={{ fontSize: 24, color: "#f97316" }} />,
  color: "#f97316",
  subtitle: "Outstanding for Cash Patients",
  format: (v) => { const n = Number(v); return !isNaN(n) ? `₹${n.toLocaleString("en-IN")}` : "₹0"; },
 },
 {
  key: "orgOutstanding",
  title: "Organization Outstanding",
  section: "outstanding",
  icon: <AttachMoneyIcon sx={{ fontSize: 24, color: "#8b5cf6" }} />,
  color: "#8b5cf6",
  subtitle: "Outstanding for Organizations",
  format: (v) => { const n = Number(v); return !isNaN(n) ? `₹${n.toLocaleString("en-IN")}` : "₹0"; },
 },
];

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

const IPD_PATIENT_STATS_CONFIG = [
 { key: "newAdmission", title: "New Admission", section: "patientStats", icon: <PersonAddAlt1Icon sx={{ fontSize: 24, color: "#10b981" }} />, color: "#10b981", subtitle: "Total new admissions" },
 { key: "direct", title: "Direct", section: "patientStats", icon: <ExitToAppIcon sx={{ fontSize: 24, color: "#f59e0b" }} />, color: "#f59e0b", subtitle: "Direct admissions" },
 { key: "viaOpd", title: "Via OPD", section: "patientStats", icon: <SyncAltIcon sx={{ fontSize: 24, color: "#3b82f6" }} />, color: "#3b82f6", subtitle: "Admissions via OPD" },
 { key: "advanceBooking", title: "Advance Booking", section: "patientStats", icon: <EventAvailableIcon sx={{ fontSize: 24, color: "#8b5cf6" }} />, color: "#8b5cf6", subtitle: "Advance bookings" },
 { key: "emergency", title: "Emergency", section: "patientStats", icon: <LocalHospitalIcon sx={{ fontSize: 24, color: "#ef4444" }} />, color: "#ef4444", subtitle: "Emergency admissions" },
 { key: "currentOccupancy", title: "Current Occupancy", section: "occupancyStats", icon: <BedIcon sx={{ fontSize: 24, color: "#06b6d4" }} />, color: "#06b6d4", subtitle: "Current occupancy" },
];

const IPDDashboard = () => {
 const navigate = useNavigate();

 // Card drilldown modal state
 const [modalOpen, setModalOpen] = useState(false);
 const [modalTitle, setModalTitle] = useState("");
 const [modalKey, setModalKey] = useState("");
 const [drillData, setDrillData] = useState([]);
 const [drillLoading, setDrillLoading] = useState(false);

 const {
  allCollectionData,
  allCollectionLoading,
  allRevenueData,
  allRevenueLoading,
  allOutstandingData,
  allOutstandingLoading,
  ipdPatientData,
  ipdOccupancyData,
  ipdStatsLoading,
 } = useData();

 // Local Data Filtering for IPD
 const ipdCollectionData = useMemo(() => {
  return allCollectionData?.filter(r => {
   const mod = (r.module || r.Module)?.toUpperCase();
   return mod === "IPD / EMERGENCY (ADVANCE)" || mod === "IPD / EMERGENCY (DISCHARGE)";
  }) || [];
 }, [allCollectionData]);

 const ipdRevenueData = useMemo(() => {
  return allRevenueData?.filter(r => (r.module || r.Module)?.toUpperCase() === "IPD") || [];
 }, [allRevenueData]);

 const ipdOutstandingData = useMemo(() => {
  return allOutstandingData?.filter(r => (r.module || r.Module)?.toUpperCase() === "IPD") || [];
 }, [allOutstandingData]);

 const handleCardClick = useCallback((stat) => {
  setModalTitle(stat.title);
  setModalKey(stat.key);
  setDrillData([]);
  setDrillLoading(true);
  setModalOpen(true);

  setTimeout(() => {
   let dataset = [];
   if (stat.section === "collection") dataset = ipdCollectionData;
   else if (stat.section === "revenue") dataset = ipdRevenueData;
   else if (stat.section === "outstanding") dataset = ipdOutstandingData;
   else if (stat.section === "patientStats") dataset = ipdPatientData;
   else if (stat.key === "currentOccupancy") dataset = ipdOccupancyData;

   let filtered = dataset || [];
   if (stat.key === "netCollection") {
    filtered = filtered.filter(r => r["Receipt Amount"] !== null && r["Receipt Amount"] !== undefined);
   } else if (stat.key === "cashPatientOutstanding") {
    filtered = filtered.filter(r => {
     const org = r.organization || r.Organization;
     return org && org.toLowerCase() === "cash patient";
    });
   } else if (stat.key === "orgOutstanding") {
    filtered = filtered.filter(r => {
     const org = r.organization || r.Organization;
     return !org || org.toLowerCase() !== "cash patient";
    });
   } else if (stat.key === "currentOccupancy") {
    filtered = ipdOccupancyData.map(d => ({
     categoryname: d.categoryname,
     vacant: d.vacant,
     occupied: d.occupied,
     outofservice: d.outofservice,
     total: d.total
    }));
   } else if (stat.section === "patientStats") {
    // Map all data so the modal can filter it via tabs
    filtered = ipdPatientData.map(d => ({
     tenantid: d.tenantid,
     date: d.date,
     "UHID": d.regdocid,
     ipd_code: d.ipd_code,
     patientname: d.patientname,
     consultantname: d.consultantname,
     referredby: d.referredby,
     organization: d.organization,
     _regdocid: d.regdocid,
     _oldcategory: d.oldcategory
    }));
   }

   setDrillData(filtered);
   setDrillLoading(false);
  }, 300);
 }, [ipdCollectionData, ipdRevenueData, ipdOutstandingData, ipdPatientData]);

 const handleModalClose = useCallback(() => {
  setModalOpen(false);
  setModalTitle("");
  setModalKey("");
  setDrillData([]);
 }, []);

 const stats = useMemo(() => {
  const netCollection = ipdCollectionData.reduce(
   (acc, row) => acc + Number(row["Receipt Amount"] || 0),
   0
  );
  const grossCollection = ipdCollectionData.reduce(
   (acc, row) => acc + Number(row["collection"] || row["Collection"] || 0),
   0
  );
  const refund = ipdCollectionData.reduce(
   (acc, row) => acc + Number(row["refund"] || row["Refund"] || 0),
   0
  );

  const revenue = ipdRevenueData.reduce((acc, row) => acc + Number(row["oh_amt_net"] || row["oh_amt_net"] || 0), 0);
  const grossRevenue = ipdRevenueData.reduce((acc, row) => acc + Number(row["grossamount"] || row["Grossamount"] || 0), 0);
  const discount = ipdRevenueData.reduce((acc, row) => acc + Number(row["discount"] || row["Discount"] || 0), 0);

  const outstanding = ipdOutstandingData.reduce((acc, row) => acc + Number(row["outstanding"] || row["Outstanding"] || row["balance"] || row["Balance"] || 0), 0);

  const cashPatientOutstanding = ipdOutstandingData.reduce((acc, row) => {
   const isCash = (row.organization || row.Organization) === "Cash Patient";
   return isCash ? acc + Number(row["outstanding"] || row["Outstanding"] || row["balance"] || row["Balance"] || 0) : acc;
  }, 0);

  const orgOutstanding = ipdOutstandingData.reduce((acc, row) => {
   const isCash = (row.organization || row.Organization) === "Cash Patient";
   return !isCash ? acc + Number(row["outstanding"] || row["Outstanding"] || row["balance"] || row["Balance"] || 0) : acc;
  }, 0);

  return { netCollection, grossCollection, refund, revenue, grossRevenue, discount, outstanding, cashPatientOutstanding, orgOutstanding };
 }, [ipdCollectionData, ipdRevenueData, ipdOutstandingData]);

 const ipdPatientStats = useMemo(() => {
  // New Admission: Count of regdocid in vw_ipd
  const newAdmissionCount = ipdPatientData.filter(d => d.regdocid).length;

  // Direct: Count where oldcategory is null or empty
  const directCount = ipdPatientData.filter(d => d.oldcategory === null || d.oldcategory === "").length;

  // Via OPD: Count where oldcategory is OPDPB, OPD, or OPDIN
  const viaOpdCount = ipdPatientData.filter(d => ["OPDPB", "OPD", "OPDIN"].includes(d.oldcategory)).length;

  // Advance Booking: Count where oldcategory is ADVBK
  const advanceBookingCount = ipdPatientData.filter(d => d.oldcategory === "ADVBK").length;

  // Emergency: Count where oldcategory is EMRG
  const emergencyCount = ipdPatientData.filter(d => d.oldcategory === "EMRG").length;

  // Current Occupancy: Sum of 'occupied' in vw_currentoccupancy
  const currentOccupancyCount = ipdOccupancyData.reduce((acc, row) => acc + Number(row.occupied || 0), 0);

  return {
   newAdmission: newAdmissionCount,
   direct: directCount,
   viaOpd: viaOpdCount,
   advanceBooking: advanceBookingCount,
   emergency: emergencyCount,
   currentOccupancy: currentOccupancyCount
  };
 }, [ipdPatientData, ipdOccupancyData]);

 const isDataLoading = allCollectionLoading || allRevenueLoading || allOutstandingLoading || ipdStatsLoading;

 return (
  <Box sx={{ animation: "fadeIn 0.3s ease-in-out", "@keyframes fadeIn": { "0%": { opacity: 0 }, "100%": { opacity: 1 } } }}>
   {isDataLoading ? <BouncingDotsLoader /> : (
    <>
     {/* ── Patient & Occupancy Stats ── */}
     <Box sx={{ mb: 2 }}>
      <Paper
       elevation={0}
       sx={{
        p: { xs: 1, md: 1.5 },
        pt: { xs: 1, md: 1 },
        borderRadius: "16px",
        background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
        border: "1px solid #bae6fd",
        boxShadow: "0 4px 20px rgba(14, 165, 233, 0.1)",
       }}
      >
       <Typography sx={{ fontSize: "0.7rem", fontWeight: 800, color: "#0284c7", mb: 1, textTransform: "uppercase", letterSpacing: "1px", ml: 0.5 }}>
        Patient Stats
       </Typography>
       <Box
        sx={{
         display: "grid",
         gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", md: "repeat(6, 1fr)" },
         gap: { xs: 1, md: 0 },
        }}
       >
        {IPD_PATIENT_STATS_CONFIG.map((stat, i) => (
         <Box
          key={stat.key}
          onClick={() => handleCardClick(stat)}
          sx={{
           p: { xs: 1, md: 1.25 },
           borderRadius: "12px",
           display: "flex",
           alignItems: "center",
           gap: { xs: 1, md: 1.5 },
           cursor: "pointer",
           transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
           position: "relative",
           overflow: "hidden",
           "&:hover": {
            bgcolor: "#ffffff",
            boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
            transform: "translateY(-2px) scale(1.02)",
            zIndex: 2,
            "& .hover-glow": { opacity: 1 },
           },
           ...(i !== IPD_PATIENT_STATS_CONFIG.length - 1 && {
            "&::after": {
             content: '""',
             position: "absolute",
             right: 0,
             top: "25%",
             height: "50%",
             width: "1px",
             bgcolor: { xs: "transparent", md: "#bae6fd" },
            }
           })
          }}
         >
          {/* Subtle background glow effect on hover */}
          <Box
           className="hover-glow"
           sx={{
            position: "absolute",
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
            background: `radial-gradient(circle at center, ${alpha(stat.color, 0.05)}, transparent)`,
            opacity: 0,
            transition: "opacity 0.3s",
           }}
          />
          <Box
           sx={{
            width: { xs: 36, md: 44 },
            height: { xs: 36, md: 44 },
            borderRadius: "12px",
            background: `linear-gradient(135deg, ${alpha(stat.color, 0.15)}, ${alpha(stat.color, 0.05)})`,
            color: stat.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            position: "relative",
            zIndex: 1,
            boxShadow: `inset 0 0 0 1px ${alpha(stat.color, 0.1)}`,
           }}
          >
           {React.cloneElement(stat.icon, { sx: { fontSize: "1.2rem" } })}
          </Box>
          <Box sx={{ position: "relative", zIndex: 1, minWidth: 0 }}>
           <Typography sx={{ color: "#475569", fontSize: { xs: "0.6rem", md: "0.7rem" }, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {stat.title}
           </Typography>
           <Typography sx={{ color: "#0f172a", fontSize: "clamp(1rem, 3.5vw, 1.25rem)", fontWeight: 800, mt: 0, lineHeight: 1, textShadow: "0 1px 2px rgba(0,0,0,0.02)", wordBreak: "break-word" }}>
            {ipdPatientStats[stat.key] || 0}
           </Typography>
          </Box>
         </Box>
        ))}
       </Box>
      </Paper>
     </Box>

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
      {STAT_CONFIG.map((stat) => {
       const value = stats[stat.key];
       const formattedValue = stat.format(value);
       const str = String(formattedValue || "");
       let valueFontSize = { xs: "1.4rem", md: "1.55rem" };
       if (str.length > 18) valueFontSize = { xs: "0.9rem", md: "1.05rem" };
       else if (str.length > 14) valueFontSize = { xs: "1.1rem", md: "1.2rem" };
       else if (str.length > 10) valueFontSize = { xs: "1.25rem", md: "1.35rem" };

       return (
        <Box key={stat.key} sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 16px)", md: "1 1 calc(33.333% - 16px)" }, minWidth: 0 }}>
         <Card
          onClick={() => navigate(ROUTES.GRAPH_DETAIL, { state: { section: stat.section, cardTitle: `IPD ${stat.title} Analytics`, filterModule: 'IPD' } })}
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
          <CardContent
           sx={{
            p: CARD_PADDING,
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            "&:last-child": { pb: 0 },
           }}
          >
           <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1 }}>
            <Box
             sx={{
              width: 36, height: 36,
              borderRadius: "10px",
              background: alpha(stat.color, 0.12),
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
             }}
            >
             {React.cloneElement(stat.icon, { sx: { fontSize: 20, color: stat.color } })}
            </Box>
            <IconButton size="small" sx={{ color: "#94a3b8", mt: -0.5, mr: -0.5 }}
             onClick={(e) => { e.stopPropagation(); handleCardClick(stat); }}
            >
             <MoreVertIcon sx={{ fontSize: 18 }} />
            </IconButton>
           </Box>

           <Typography sx={{ color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, fontSize: "0.6rem", mb: 0.2 }}>
            {stat.title}
           </Typography>

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

           {stat.subtitle && (
            <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", fontSize: "0.68rem", mb: 0.5 }}>
             {stat.subtitle}
            </Typography>
           )}
          </CardContent>

          <Box sx={{ px: "14px", pb: "8px", flexShrink: 0 }}>
           <MiniSparkline color={stat.color} />
          </Box>
         </Card>
        </Box>
       );
      })}
     </Box>

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
    </>
   )}

   {["newAdmission", "direct", "viaOpd", "advanceBooking", "emergency", "currentOccupancy"].includes(modalKey) ? (
    <StatsDetailsModal
     open={modalOpen}
     onClose={handleModalClose}
     data={drillData}
     loading={drillLoading}
     type={modalKey === "currentOccupancy" ? "generic" : "ipd"}
     title={modalKey === "currentOccupancy" ? "Current Occupancy Details" : "Patient Admissions Details"}
     activeTab={modalTitle}
     showTotals={modalKey === "currentOccupancy"}
    />
   ) : ["outstanding", "cashPatientOutstanding", "orgOutstanding"].includes(modalKey) ? (
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
 );
};

export default IPDDashboard;
