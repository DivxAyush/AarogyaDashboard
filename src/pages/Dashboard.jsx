import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
 Box,
 Grid,
 Typography,
 Breadcrumbs,
 Link,
 Chip,
 Alert,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import RefundIcon from "@mui/icons-material/Replay";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import DashboardLayout from "../layouts/DashboardLayout";
import StatCard from "../components/StatCard";
import PaymentChart from "../components/PaymentChart";
import PaymentDetailsModal from "../components/PaymentDetailsModal";
import { getChartData, getDatasetData } from "../api/api_fun";
import { SUPERSET_CHART_ID } from "../utils/constants";

const STAT_CONFIG = [
 {
  key: "totalCollection",
  title: "Total Collection",
  icon: <AttachMoneyIcon sx={{ fontSize: 26, color: "#1976d2" }} />,
  color: "#1976d2",
  subtitle: "Lifetime collections",
  format: (v) => v !== null ? `₹${Number(v).toLocaleString("en-IN")}` : "Loading…",
  sql: `SELECT uhidno, patientname, receiptno, paymode, collection, refund, receiptdate, username, organization, receiptamt FROM prod_collection WHERE collection > 0 LIMIT 50`,
 },
 {
  key: "totalRefund",
  title: "Total Refund",
  icon: <RefundIcon sx={{ fontSize: 26, color: "#0288d1" }} />,
  color: "#0288d1",
  subtitle: "Lifetime refunds",
  format: (v) => v !== null ? `₹${Number(v).toLocaleString("en-IN")}` : "Loading…",
  sql: `SELECT uhidno, patientname, receiptno, paymode, collection, refund, receiptdate, username, organization, receiptamt FROM prod_collection WHERE refund > 0 LIMIT 50`,
 },
 {
  key: "totalTransactions",
  title: "Total Transactions",
  icon: <ReceiptLongIcon sx={{ fontSize: 26, color: "#039be5" }} />,
  color: "#039be5",
  subtitle: "Unique payment receipts",
  format: (v) => v !== null ? Number(v).toLocaleString("en-IN") : "Loading…",
  sql: `SELECT uhidno, patientname, receiptno, paymode, collection, refund, receiptdate, username, organization, receiptamt FROM prod_collection LIMIT 50`,
 },
];

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

 return (
  <DashboardLayout>
   {/* Page Header */}
   <Box sx={{ mb: 1 }}>
    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
     <Box>
      <Typography
       variant="h4"
       sx={{ fontWeight: 900, color: "#1a2035", letterSpacing: -0.5, lineHeight: 1.2 }}
      >
       Dashboard
      </Typography>

     </Box>
     <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Chip
       label={currentDate}
       size="small"
       sx={{
        bgcolor: "#e3f2fd",
        color: "#1565c0",
        fontWeight: 600,
        fontSize: "0.76rem",
        borderRadius: "8px",
       }}
      />
      <Chip
       label="Live"
       size="small"
       sx={{
        bgcolor: "#e8f5e9",
        color: "#2e7d32",
        fontWeight: 700,
        fontSize: "0.72rem",
        borderRadius: "8px",
        "& .MuiChip-label": { display: "flex", alignItems: "center", gap: 0.5 },
       }}
       icon={
        <Box
         sx={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          bgcolor: "#4caf50",
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

   {/* Error State */}
   {statsError && (
    <Alert severity="warning" sx={{ mb: 3, borderRadius: "12px" }}>
     {statsError}
    </Alert>
   )}

   {/* Stat Cards — click pe modal khulega */}
   <Grid
    container
    spacing={2}
    sx={{ mb: 4 }}
   >
    {STAT_CONFIG.map((stat) => (
     <Grid
      xs={12}
      sm={4}
      md={4}
      key={stat.key}
      sx={{ display: "flex" }}
     >
      <StatCard
       title={stat.title}
       value={stat.format(stats[stat.key])}
       icon={stat.icon}
       color={stat.color}
       loading={statsLoading}
       subtitle={stat.subtitle}
       onClick={() => handleCardClick(stat)}
      />
     </Grid>
    ))}
   </Grid>

   {/* Chart Section */}
   <Box sx={{ mb: 2.5, display: "flex", alignItems: "center", gap: 1.5 }}>
    <Typography variant="h6" sx={{ fontWeight: 800, color: "#1a2035" }}>
     Payment Mode Analysis
    </Typography>
    <Chip
     label="Interactive"
     size="small"
     sx={{
      bgcolor: "#e3f2fd",
      color: "#1565c0",
      fontWeight: 600,
      fontSize: "0.70rem",
      borderRadius: "6px",
     }}
    />
   </Box>

   <Box sx={{ mb: 4 }}>
    <PaymentChart />
   </Box>

   {/* Info Footer */}
   <Box
    sx={{
     mt: 2,
     p: 2.5,
     borderRadius: "14px",
     background: "rgba(255,255,255,0.7)",
     border: "1px solid #e3f2fd",
     display: "flex",
     alignItems: "center",
     gap: 1.5,
     flexWrap: "wrap",
    }}
   >

   </Box>

   {/* Card Drilldown Modal */}
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
