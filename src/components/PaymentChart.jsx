import React, { useState, useCallback, useEffect, useMemo } from "react";
import { Box, Typography, Alert, Skeleton } from "@mui/material";
import BarChartIcon from "@mui/icons-material/BarChart";
import { getChartData, getDatasetData } from "../api/api_fun";
import PaymentDetailsModal from "./PaymentDetailsModal";
import { SUPERSET_CHART_ID } from "../utils/constants";
import { BarChart } from '@mui/x-charts/BarChart';
import { axisClasses } from '@mui/x-charts/ChartsAxis';

// Helper to auto-detect categories and numeric values
function detectKeys(dataArray) {
 if (!dataArray || dataArray.length === 0) return { categoryKey: "id", numericKeys: ["value"] };

 const firstRow = dataArray[0];
 const keys = Object.keys(firstRow);

 // Find first string column for XAxis (fallback to first key)
 let categoryKey = keys.find((k) => typeof firstRow[k] === "string");
 if (!categoryKey) categoryKey = keys[0];

 // Find all number columns for Bars (ignore _id if we generate one)
 const numericKeys = keys.filter(
  (k) => k !== categoryKey && typeof firstRow[k] === "number" && k !== "_id"
 );

 return { categoryKey, numericKeys };
}

const ChartSkeleton = () => (
 <Box sx={{ px: 2 }}>
  <Skeleton variant="rectangular" height={400} sx={{ borderRadius: "12px" }} />
 </Box>
);

const PaymentChart = () => {
 const [data, setData] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState("");

 const [modalOpen, setModalOpen] = useState(false);
 const [selected, setSelected] = useState("");
 const [drillData, setDrillData] = useState([]);
 const [drillLoading, setDrillLoading] = useState(false);

 useEffect(() => {
  getChartData(SUPERSET_CHART_ID)
   .then((result) => {
    const validData = (result || []).map((row, index) => {
     const newRow = { _id: index }; // unique id fallback
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

 const handleBarClick = useCallback(
  async (event, barItemIdentifier) => {
   // In MUI x-charts, click handler receives (event, barItemIdentifier)
   if (barItemIdentifier && barItemIdentifier.dataIndex !== undefined) {
    const clickedRow = data[barItemIdentifier.dataIndex];
    const paymentMode = clickedRow[categoryKey];

    setSelected(paymentMode);
    setDrillData([]);
    setDrillLoading(true);
    setModalOpen(true);

    try {
     const result = await getDatasetData(
      `SELECT uhidno, patientname, receiptno, paymode, collection, refund, receiptdate, username, organization, receiptamt FROM prod_collection WHERE paymode='${paymentMode}' LIMIT 50`
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

 if (loading) return <ChartSkeleton />;
 if (error) return <Alert severity="error" sx={{ borderRadius: "12px", m: 2 }}>{error}</Alert>;
 if (!data.length) return <Alert severity="info" sx={{ borderRadius: "12px", m: 2 }}>No chart data available.</Alert>;

 // Map numeric keys to MUI X-Charts series
 const series = numericKeys.map(key => ({
  dataKey: key,
  label: key,
  valueFormatter: (value) => value ? `₹${value.toLocaleString("en-IN")}` : "₹0"
 }));

 return (
  <>
   <Box
    sx={{
     borderRadius: "20px",
     background: "#fff",
     boxShadow: "0 4px 24px rgba(25,118,210,0.10)",
     border: "1px solid #e3f2fd",
     p: { xs: 2, md: 3 },
     width: "100%",
     display: "block"
    }}
   >
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
     <Box
      sx={{
       width: 40,
       height: 40,
       borderRadius: "12px",
       background: "linear-gradient(135deg, #1565c0, #42a5f5)",
       display: "flex",
       alignItems: "center",
       justifyContent: "center",
      }}
     >
      <BarChartIcon sx={{ color: "#fff", fontSize: 22 }} />
     </Box>
     <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a2035", lineHeight: 1.2 }}>
       Payment Mode Analysis
      </Typography>
      <Typography variant="caption" sx={{ color: "#90a4ae" }}>
       Click on a bar to view detailed records
      </Typography>
     </Box>
    </Box>

    <Box sx={{ width: '100%', height: 480 }}>
     <BarChart
      dataset={data}
      xAxis={[{
       scaleType: 'band',
       dataKey: categoryKey,
       tickLabelStyle: {
        angle: -35,
        textAnchor: 'end',
        fontSize: 11,
        fill: '#64748b',
        fontWeight: 500
       },
       tickPlacement: 'middle',
      }]}
      yAxis={[{
       tickLabelStyle: { fill: '#64748b', fontSize: 11, fontWeight: 500 },
       valueFormatter: (value) => {
        if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
        if (value >= 100000) return `₹${(value / 100000).toFixed(2)}L`;
        if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
        return `₹${value}`;
       }
      }]}
      series={series}
      colors={["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"]}
      grid={{ horizontal: true }}
      borderRadius={4}
      slotProps={{
       legend: {
        direction: 'row',
        position: { vertical: 'top', horizontal: 'right' },
        padding: -10,
        labelStyle: { fontSize: 13, fontWeight: 600, fill: '#334155' }
       },
      }}
      margin={{ top: 40, right: 20, bottom: 90, left: 70 }}
      onItemClick={handleBarClick}
      sx={{
       [`.${axisClasses.root}`]: {
        [`.${axisClasses.tick}, .${axisClasses.line}`]: {
         stroke: '#cbd5e1',
         strokeWidth: 1.5,
        },
       },
       '& .MuiChartsGrid-line': {
        strokeDasharray: '4 4',
        stroke: '#e2e8f0',
       },
       cursor: 'pointer'
      }}
     />
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
