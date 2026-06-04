import React, { useMemo, useState, useCallback } from "react";
import { Box, Typography, Paper, Skeleton, IconButton, Collapse } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { LineChart } from "@mui/x-charts/LineChart";
import { PieChart } from "@mui/x-charts/PieChart";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PieChartIcon from "@mui/icons-material/PieChart";
import BarChartIcon from "@mui/icons-material/BarChart";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import CloseIcon from "@mui/icons-material/Close";

const formatINR = (v) => {
 const n = Number(v);
 if (isNaN(n)) return "₹0";
 if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
 if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
 if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
 return `₹${n.toLocaleString("en-IN")}`;
};

const formatFullINR = (v) => {
 const n = Number(v);
 return isNaN(n) ? "₹0" : `₹${n.toLocaleString("en-IN")}`;
};

const getNum = (row, ...keys) => {
 for (const k of keys) {
  const v = row[k];
  if (v !== undefined && v !== null && v !== "") return Number(v) || 0;
 }
 return 0;
};

const getStr = (row, ...keys) => {
 for (const k of keys) {
  const v = row[k];
  if (v !== undefined && v !== null && v !== "") return String(v);
 }
 return "";
};

const CARD_STYLE = {
 borderRadius: "16px",
 background: "rgba(255,255,255,0.92)",
 backdropFilter: "blur(12px)",
 border: "1px solid rgba(255,255,255,0.7)",
 boxShadow: "0 4px 24px rgba(25,118,210,0.08), 0 1px 4px rgba(0,0,0,0.04)",
 overflow: "hidden",
};

const ChartHeader = ({ icon, title, subtitle, color }) => (
 <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2.5, pt: 2.5, pb: 1 }}>
  <Box sx={{
   width: 40, height: 40, borderRadius: "12px",
   background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center",
  }}>
   {React.cloneElement(icon, { sx: { fontSize: 22, color } })}
  </Box>
  <Box>
   <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "#0f172a", lineHeight: 1.2 }}>{title}</Typography>
   <Typography sx={{ fontSize: "0.7rem", color: "#94a3b8" }}>{subtitle}</Typography>
  </Box>
 </Box>
);

const DrillCard = ({ data, onClose }) => {
 if (!data) return null;
 return (
  <Collapse in={!!data}>
   <Box sx={{ mx: 2.5, mb: 2, p: 2, borderRadius: "12px", background: "linear-gradient(135deg, #f0f9ff, #e0f2fe)", border: "1px solid #bae6fd" }}>
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
     <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: "#0369a1" }}>{data.name}</Typography>
     <IconButton size="small" onClick={onClose}><CloseIcon sx={{ fontSize: 16 }} /></IconButton>
    </Box>
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
     {data.metrics.map((m, i) => (
      <Box key={i} sx={{ flex: "1 1 100px", p: 1, borderRadius: "8px", bgcolor: "#fff", textAlign: "center" }}>
       <Typography sx={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>{m.label}</Typography>
       <Typography sx={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a" }}>{m.value}</Typography>
      </Box>
     ))}
    </Box>
   </Box>
  </Collapse>
 );
};

const NoDataBox = ({ message }) => (
 <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: 280, color: "#94a3b8" }}>
  <Typography sx={{ fontSize: "0.85rem" }}>{message}</Typography>
 </Box>
);

const GraphWiseDetail = ({ stats, allCollectionData, allRevenueData, allOutstandingData, loading }) => {
 const [drillData, setDrillData] = useState({ bar: null, line: null, pie: null, stacked: null });

 const closeDrill = useCallback((key) => setDrillData(prev => ({ ...prev, [key]: null })), []);

 const collectionByPaymode = useMemo(() => {
  if (!allCollectionData?.length) return [];
  const grouped = {};
  allCollectionData.forEach(row => {
   const mode = getStr(row, "paymode", "Payment Mode", "pay_mode") || "Other";
   if (!grouped[mode]) grouped[mode] = { name: mode, collection: 0, refund: 0, net: 0 };
   grouped[mode].collection += getNum(row, "collection", "Collection");
   grouped[mode].refund += getNum(row, "refund", "Refund");
   grouped[mode].net += getNum(row, "Receipt Amount", "receiptamt", "receipt_amount");
  });
  return Object.values(grouped).sort((a, b) => b.collection - a.collection).slice(0, 8);
 }, [allCollectionData]);

 const revenueTrend = useMemo(() => {
  if (!allRevenueData?.length) return [];
  const grouped = {};
  allRevenueData.forEach(row => {
   const rawDate = row.date || row.Date || row.bill_date || "";
   if (!rawDate) return;
   const d = new Date(rawDate);
   if (isNaN(d.getTime())) return;
   const key = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
   if (!grouped[key]) grouped[key] = { name: key, gross: 0, discount: 0, net: 0, _ts: d.getTime() };
   grouped[key].gross += getNum(row, "grossamount", "Grossamount", "gross_amount");
   grouped[key].discount += getNum(row, "discount", "Discount");
   grouped[key].net += getNum(row, "oh_amt_net", "net_amount", "netamount");
  });
  return Object.values(grouped).sort((a, b) => a._ts - b._ts);
 }, [allRevenueData]);

 const outstandingSplit = useMemo(() => {
  if (!allOutstandingData?.length) return [];
  let cashTotal = 0, orgTotal = 0;
  allOutstandingData.forEach(row => {
   const bal = getNum(row, "outstanding", "Outstanding", "balance", "Balance");
   const org = getStr(row, "organization", "Organization").toLowerCase();
   if (org === "cash patient") cashTotal += bal; else orgTotal += bal;
  });
  return [
   { id: 0, value: cashTotal, label: "Cash Patient", color: "#8b5cf6" },
   { id: 1, value: orgTotal, label: "Organization", color: "#f97316" },
  ].filter(d => d.value > 0);
 }, [allOutstandingData]);

 const revenueBySpeciality = useMemo(() => {
  if (!allRevenueData?.length) return [];
  const grouped = {};
  allRevenueData.forEach(row => {
   const spec = getStr(row, "speciality", "Speciality", "department") || "Unknown";
   if (!grouped[spec]) grouped[spec] = { name: spec, gross: 0, discount: 0, net: 0 };
   grouped[spec].gross += getNum(row, "grossamount", "Grossamount", "gross_amount");
   grouped[spec].discount += getNum(row, "discount", "Discount");
   grouped[spec].net += getNum(row, "oh_amt_net", "net_amount", "netamount");
  });
  return Object.values(grouped).sort((a, b) => b.gross - a.gross).slice(0, 8);
 }, [allRevenueData]);

 const handleBarClick = useCallback((_, d) => {
  if (!d?.dataIndex === undefined) return;
  const item = collectionByPaymode[d.dataIndex];
  if (!item) return;
  setDrillData(prev => ({
   ...prev, bar: {
    name: `${item.name} — Collection Breakdown`,
    metrics: [
     { label: "Gross", value: formatFullINR(item.collection) },
     { label: "Refund", value: formatFullINR(item.refund) },
     { label: "Net", value: formatFullINR(item.net) },
    ]
   }
  }));
 }, [collectionByPaymode]);

 const handleLineClick = useCallback((_, d) => {
  if (d?.dataIndex === undefined) return;
  const item = revenueTrend[d.dataIndex];
  if (!item) return;
  setDrillData(prev => ({
   ...prev, line: {
    name: `${item.name} — Revenue Details`,
    metrics: [
     { label: "Gross Revenue", value: formatFullINR(item.gross) },
     { label: "Discount", value: formatFullINR(item.discount) },
     { label: "Net Revenue", value: formatFullINR(item.net) },
    ]
   }
  }));
 }, [revenueTrend]);

 const handlePieClick = useCallback((_, d) => {
  if (d?.dataIndex === undefined) return;
  const item = outstandingSplit[d.dataIndex];
  if (!item) return;
  const total = outstandingSplit.reduce((a, b) => a + b.value, 0) || 1;
  const count = allOutstandingData?.filter(row => {
   const org = getStr(row, "organization", "Organization").toLowerCase();
   return item.label === "Cash Patient" ? org === "cash patient" : org !== "cash patient";
  }).length || 0;
  setDrillData(prev => ({
   ...prev, pie: {
    name: `${item.label} — Outstanding`,
    metrics: [
     { label: "Amount", value: formatFullINR(item.value) },
     { label: "Records", value: count.toLocaleString() },
     { label: "Share", value: `${((item.value / total) * 100).toFixed(1)}%` },
    ]
   }
  }));
 }, [outstandingSplit, allOutstandingData]);

 const handleStackedClick = useCallback((_, d) => {
  if (d?.dataIndex === undefined) return;
  const item = revenueBySpeciality[d.dataIndex];
  if (!item) return;
  setDrillData(prev => ({
   ...prev, stacked: {
    name: `${item.name} — Revenue`,
    metrics: [
     { label: "Gross", value: formatFullINR(item.gross) },
     { label: "Discount", value: formatFullINR(item.discount) },
     { label: "Net", value: formatFullINR(item.net) },
    ]
   }
  }));
 }, [revenueBySpeciality]);

 if (loading) {
  return (
   <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, mt: 2 }}>
    {[1, 2, 3, 4].map(i => (
     <Box key={i} sx={{ ...CARD_STYLE, p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
       <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: "12px" }} />
       <Box sx={{ flex: 1 }}><Skeleton width="50%" height={18} /><Skeleton width="70%" height={12} /></Box>
      </Box>
      <Skeleton variant="rounded" width="100%" height={250} sx={{ borderRadius: "12px" }} />
     </Box>
    ))}
   </Box>
  );
 }


 const chartSx = {
  "& .MuiChartsAxis-tickLabel": { fontSize: "0.7rem", fill: "#64748b" },
  "& .MuiChartsLegend-root": { fontSize: "0.7rem" },
 };

 return (
  <Box sx={{ mt: 2 }}>
   <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
    <Box sx={CARD_STYLE}>
     <ChartHeader icon={<BarChartIcon />} title="Collection by Pay Mode" subtitle="Click bars for breakdown" color="#3b82f6" />
     <DrillCard data={drillData.bar} onClose={() => closeDrill("bar")} />
     <Box sx={{ px: 1, pb: 2 }}>
      {collectionByPaymode.length > 0 ? (
       <BarChart
        height={280}
        xAxis={[{ scaleType: "band", data: collectionByPaymode.map(d => d.name) }]}
        yAxis={[{ valueFormatter: formatINR }]}
        series={[
         { data: collectionByPaymode.map(d => d.collection), label: "Collection", color: "#3b82f6" },
         { data: collectionByPaymode.map(d => d.refund), label: "Refund", color: "#22c55e" },
         { data: collectionByPaymode.map(d => d.net), label: "Net", color: "#6366f1" },
        ]}
        onItemClick={handleBarClick}
        sx={chartSx}
       />
      ) : <NoDataBox message="No collection data available" />}
     </Box>
    </Box>

    <Box sx={CARD_STYLE}>
     <ChartHeader icon={<ShowChartIcon />} title="Revenue Trend" subtitle="Click points for details" color="#10b981" />
     <DrillCard data={drillData.line} onClose={() => closeDrill("line")} />
     <Box sx={{ px: 1, pb: 2 }}>
      {revenueTrend.length > 0 ? (
       <LineChart
        height={280}
        xAxis={[{ scaleType: "point", data: revenueTrend.map(d => d.name) }]}
        yAxis={[{ valueFormatter: formatINR }]}
        series={[
         { data: revenueTrend.map(d => d.gross), label: "Gross", color: "#f59e0b", area: true },
         { data: revenueTrend.map(d => d.net), label: "Net", color: "#10b981", area: true },
         { data: revenueTrend.map(d => d.discount), label: "Discount", color: "#ef4444" },
        ]}
        onItemClick={handleLineClick}
        sx={chartSx}
       />
      ) : <NoDataBox message="No revenue data available" />}
     </Box>
    </Box>

    <Box sx={CARD_STYLE}>
     <ChartHeader icon={<PieChartIcon />} title="Outstanding Split" subtitle="Click slices for details" color="#8b5cf6" />
     <DrillCard data={drillData.pie} onClose={() => closeDrill("pie")} />
     <Box sx={{ px: 1, pb: 2 }}>
      {outstandingSplit.length > 0 ? (
       <PieChart
        height={280}
        series={[{
         data: outstandingSplit,
         innerRadius: 60,
         outerRadius: 100,
         paddingAngle: 4,
         cornerRadius: 6,
         highlightScope: { fade: "global", highlight: "item" },
         valueFormatter: (v) => formatINR(v.value),
        }]}
        margin={{ left: 10, right: 10, top: 20, bottom: 20 }}
        onItemClick={handlePieClick}
        sx={chartSx}
       />
      ) : <NoDataBox message="No outstanding data available" />}
     </Box>
    </Box>

    <Box sx={CARD_STYLE}>
     <ChartHeader icon={<TrendingUpIcon />} title="Revenue by Speciality" subtitle="Click bars for breakdown" color="#f59e0b" />
     <DrillCard data={drillData.stacked} onClose={() => closeDrill("stacked")} />
     <Box sx={{ px: 1, pb: 2 }}>
      {revenueBySpeciality.length > 0 ? (
       <BarChart
        height={280}
        xAxis={[{ scaleType: "band", data: revenueBySpeciality.map(d => d.name) }]}
        yAxis={[{ valueFormatter: formatINR }]}
        series={[
         { data: revenueBySpeciality.map(d => d.gross), label: "Gross", color: "#f59e0b", stack: "revenue" },
         { data: revenueBySpeciality.map(d => d.discount), label: "Discount", color: "#ef4444", stack: "revenue" },
         { data: revenueBySpeciality.map(d => d.net), label: "Net", color: "#10b981" },
        ]}
        onItemClick={handleStackedClick}
        sx={chartSx}
       />
      ) : <NoDataBox message="No revenue data available" />}
     </Box>
    </Box>
   </Box>
  </Box>
 );
};

export default React.memo(GraphWiseDetail);
