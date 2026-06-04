import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
 Box,
 Typography,
 Alert,
 Skeleton,
 Chip,
 IconButton,
 Select,
 MenuItem,
} from "@mui/material";
import BarChartIcon from "@mui/icons-material/BarChart";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { getChartData, getDatasetData } from "../api/api_fun";
import PaymentDetailsModal from "../pages/Dashboard/HomeDashboard/Detail/PaymentDetailsModal";
import { SUPERSET_CHART_ID } from "../utils/constants";
import { BarChart } from "@mui/x-charts/BarChart";
import { axisClasses } from "@mui/x-charts/ChartsAxis";

// Helper to auto-detect categories and numeric values
function detectKeys(dataArray) {
 if (!dataArray || dataArray.length === 0)
  return { categoryKey: "id", numericKeys: ["value"] };

 const firstRow = dataArray[0];
 const keys = Object.keys(firstRow);

 let categoryKey = keys.find((k) => typeof firstRow[k] === "string");
 if (!categoryKey) categoryKey = keys[0];

 const numericKeys = keys.filter(
  (k) => k !== categoryKey && typeof firstRow[k] === "number" && k !== "_id"
 );

 return { categoryKey, numericKeys };
}

// ─── Premium Chart Skeleton ───
const ChartSkeleton = () => (
 <Box
  sx={{
   borderRadius: "20px",
   background: "#fff",
   boxShadow: "0 4px 24px rgba(25,118,210,0.08)",
   border: "1px solid #e8f0fe",
   p: { xs: 2, md: 3 },
  }}
 >
  {/* Header skeleton */}
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
   <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: "12px" }} />
   <Box sx={{ flexGrow: 1 }}>
    <Skeleton variant="text" width="40%" height={22} />
    <Skeleton variant="text" width="55%" height={14} />
   </Box>
   <Skeleton variant="rounded" width={100} height={32} sx={{ borderRadius: "8px" }} />
  </Box>
  {/* Chart bars skeleton */}
  <Box sx={{ display: "flex", alignItems: "flex-end", gap: 2, height: 340, px: 2, pb: 2 }}>
   {[65, 80, 95, 55, 70, 45, 60].map((h, i) => (
    <Box key={i} sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1, alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
     <Skeleton
      variant="rectangular"
      width="70%"
      height={`${h}%`}
      sx={{
       borderRadius: "6px 6px 0 0",
       animation: "pulse 1.5s ease-in-out infinite",
       animationDelay: `${i * 0.15}s`,
      }}
     />
     <Skeleton variant="text" width="60%" height={14} />
    </Box>
   ))}
  </Box>
 </Box>
);

const PaymentChart = () => {
 const [data, setData] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState("");
 const [filterValue, setFilterValue] = useState("this_month");

 const [modalOpen, setModalOpen] = useState(false);
 const [selected, setSelected] = useState("");
 const [drillData, setDrillData] = useState([]);
 const [drillLoading, setDrillLoading] = useState(false);

 useEffect(() => {
  getChartData(SUPERSET_CHART_ID)
   .then((result) => {
    const validData = (result || []).map((row, index) => {
     const newRow = { _id: index };
     Object.keys(row).forEach((key) => {
      const value = row[key];
      if (!isNaN(value) && value !== "" && value !== null) {
       newRow[key] = Number(value);
      } else {
       newRow[key] = value || "Unknown";
      }
     });
     return newRow;
    });
    setData(validData);
    setLoading(false);
   })
   .catch((err) => {
    setError("Data fetch failed: " + err.message);
    setLoading(false);
   });
 }, []);

 const { categoryKey, numericKeys } = useMemo(() => {
  return detectKeys(data);
 }, [data]);

 const handleChartClick = useCallback(
  async (event, axisData) => {
   if (axisData && axisData.dataIndex !== null && axisData.dataIndex !== undefined) {
    const clickedRow = data[axisData.dataIndex];
    const paymentMode = clickedRow[categoryKey];

    setSelected(paymentMode);
    setDrillData([]);
    setDrillLoading(true);
    setModalOpen(true);

    try {
     const result = await getDatasetData(
      `SELECT uhidno, patientname, receiptno, paymode, collection, refund, receiptdate, username, organization,site_code, receiptamt FROM vw_collection WHERE paymode='${paymentMode}'`
     );
     setDrillData(result || []);
    } catch (err) {
     setDrillData([]);
    } finally {
     setDrillLoading(false);
    }
   }
  },
  [data, categoryKey]
 );

 const handleCloseModal = useCallback(() => {
  setModalOpen(false);
  setSelected("");
  setDrillData([]);
 }, []);

 const topModesText = useMemo(() => {
  if (!data || data.length === 0) return "No data available to analyze.";

  const modeTotals = data.map((row) => {
   let total = 0;
   numericKeys.forEach((key) => {
    total += Number(row[key] || 0);
   });
   return { mode: row[categoryKey], total };
  });

  modeTotals.sort((a, b) => b.total - a.total);

  if (modeTotals.length >= 2) {
   return `${modeTotals[0].mode} and ${modeTotals[1].mode} are the top performing payment modes this month.`;
  } else if (modeTotals.length === 1) {
   return `${modeTotals[0].mode} is the top performing payment mode this month.`;
  }
  return "Payment modes analysis complete.";
 }, [data, categoryKey, numericKeys]);

 if (loading) return <ChartSkeleton />;
 if (error)
  return (
   <Alert severity="error" sx={{ borderRadius: "12px", m: 2 }}>
    {error}
   </Alert>
  );
 if (!data.length)
  return (
   <Alert severity="info" sx={{ borderRadius: "12px", m: 2 }}>
    No chart data available.
   </Alert>
  );

 const series = numericKeys.map((key) => ({
  dataKey: key,
  label: key,
  valueFormatter: (value) =>
   value ? `₹${value.toLocaleString("en-IN")}` : "₹0",
 }));

 return (
  <>
   <Box
    sx={{
     borderRadius: "20px",
     background: "#fff",
     boxShadow: "0 4px 24px rgba(25,118,210,0.08), 0 1px 4px rgba(0,0,0,0.03)",
     border: "1px solid #e8f0fe",
     p: { xs: 2, md: 3 },
     width: "100%",
    }}
   >
    {/* ── Header ── */}
    <Box
     sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      mb: 1.5,
      flexWrap: "wrap",
      gap: 1,
     }}
    >
     <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Box
       sx={{
        width: 40,
        height: 40,
        borderRadius: "12px",
        background: "linear-gradient(135deg, #1e40af, #3b82f6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
       }}
      >
       <BarChartIcon sx={{ color: "#fff", fontSize: 22 }} />
      </Box>
      <Box>
       <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography
         variant="h6"
         sx={{ fontWeight: 700, color: "#0f172a", lineHeight: 1.2, fontSize: "1rem" }}
        >
         Payment Mode Analysis
        </Typography>
        <Chip
         label="Interactive"
         size="small"
         sx={{
          bgcolor: "#eff6ff",
          color: "#2563eb",
          fontWeight: 600,
          fontSize: "0.65rem",
          height: 22,
          borderRadius: "6px",
         }}
        />
       </Box>
       <Typography variant="caption" sx={{ color: "#94a3b8" }}>
        Click on a bar to view detailed records
       </Typography>
      </Box>
     </Box>


    </Box>

    {/* ── Chart ── */}
    <Box sx={{ width: "100%", height: { xs: 360, md: 420 } }}>
     <BarChart
      dataset={data}
      xAxis={[
       {
        scaleType: "band",
        dataKey: categoryKey,
        tickLabelStyle: {
         angle: -35,
         textAnchor: "end",
         fontSize: 11,
         fill: "#64748b",
         fontWeight: 500,
        },
        tickPlacement: "middle",
       },
      ]}
      yAxis={[
       {
        tickLabelStyle: { fill: "#64748b", fontSize: 11, fontWeight: 500 },
        valueFormatter: (value) => {
         if (value >= 10000000)
          return `₹${(value / 10000000).toFixed(1)}Cr`;
         if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
         if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
         return `₹${value}`;
        },
       },
      ]}
      series={series}
      colors={["#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899"]}
      grid={{ horizontal: true }}
      borderRadius={5}
      slotProps={{
       legend: {
        direction: "row",
        position: { vertical: "top", horizontal: "right" },
        padding: -10,
       },
      }}
      margin={{ top: 15, right: 15, bottom: 45, left: 60 }}
      onAxisClick={handleChartClick}
      sx={{
       [`.${axisClasses.root}`]: {
        [`.${axisClasses.tick}, .${axisClasses.line}`]: {
         stroke: "#e2e8f0",
         strokeWidth: 1,
        },
       },
       "& .MuiChartsGrid-line": {
        strokeDasharray: "4 4",
        stroke: "#f1f5f9",
       },
       cursor: "pointer",
      }}
     />
    </Box>

    {/* ── Footer insight ── */}
    <Box
     sx={{
      display: "flex",
      alignItems: "center",
      gap: 0.8,
      mt: 1,
      pt: 1.5,
      borderTop: "1px solid #f1f5f9",
     }}
    >
     <InfoOutlinedIcon sx={{ fontSize: 16, color: "#4282EA" }} />
     <Typography sx={{ fontSize: "0.75rem", color: "#4282EA", fontWeight: 500 }}>
      {topModesText}
     </Typography>
    </Box>
   </Box>

   <PaymentDetailsModal
    open={modalOpen}
    onClose={handleCloseModal}
    data={drillData}
    loading={drillLoading}
    paymentMode={selected}
   />
  </>
 );
};

export default React.memo(PaymentChart);


