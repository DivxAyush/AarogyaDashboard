import React, { useMemo, useState } from "react";
import { Box, Paper, Typography, IconButton, Tooltip as MuiTooltip, Chip, Modal, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { BarChart, LineChart } from "@mui/x-charts";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CloseIcon from "@mui/icons-material/Close";
import PaymentDetailsModal from "../Detail/PaymentDetailsModal";

const CARD_STYLE = {
  p: 2,
  borderRadius: "16px",
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
  height: "100%",
  display: "flex",
  flexDirection: "column",
};

const formatValue = (v) => {
  if (!v) return "₹0";
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(1)}K`;
  return `₹${v.toLocaleString("en-IN")}`;
};

const formatFullINR = (v) => {
 const n = Number(v);
 return isNaN(n) ? "₹0" : `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const AggregatedDataModal = ({ open, onClose, title, dataset }) => {
 return (
  <Modal open={open} onClose={onClose} closeAfterTransition>
   <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: { xs: "95vw", sm: "600px" }, bgcolor: '#ffffff', boxShadow: 24, borderRadius: "12px", overflow: "hidden" }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
     <Typography sx={{ fontWeight: 800, fontSize: "1rem", color: "#1e293b" }}>{title}</Typography>
     <IconButton size="small" onClick={onClose}><CloseIcon sx={{ fontSize: 20 }} /></IconButton>
    </Box>
    <Box sx={{ p: 2, maxHeight: "70vh", overflowY: "auto" }}>
     <TableContainer>
      <Table size="small">
       <TableHead>
        <TableRow sx={{ bgcolor: "#f1f5f9" }}>
         <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Category</TableCell>
         <TableCell sx={{ fontWeight: 700, color: "#475569", textAlign: "right" }}>Collection</TableCell>
         <TableCell sx={{ fontWeight: 700, color: "#475569", textAlign: "right" }}>Refund</TableCell>
         <TableCell sx={{ fontWeight: 700, color: "#475569", textAlign: "right" }}>Net Amount</TableCell>
        </TableRow>
       </TableHead>
       <TableBody>
        {(dataset || []).map((row, i) => (
         <TableRow key={i} hover>
          <TableCell sx={{ fontWeight: 600, color: "#334155" }}>{row.name || row.label || row.financialyear}</TableCell>
          <TableCell sx={{ textAlign: "right", color: "#059669" }}>{formatFullINR(row.collection)}</TableCell>
          <TableCell sx={{ textAlign: "right", color: "#dc2626" }}>{formatFullINR(row.refund)}</TableCell>
          <TableCell sx={{ textAlign: "right", fontWeight: 700, color: "#2563eb" }}>{formatFullINR(row.net)}</TableCell>
         </TableRow>
        ))}
       </TableBody>
      </Table>
     </TableContainer>
    </Box>
   </Box>
  </Modal>
 );
};

const MISCollectionAnalysis = ({ allCollectionData, loading }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [aggModal, setAggModal] = useState({ open: false, title: "", dataset: [] });

  const {
    fyData,
    quarterData,
    monthData,
    moduleData,
    finYears,
  } = useMemo(() => {
    if (!allCollectionData?.length) {
      return { fyData: [], quarterData: [], monthData: [], moduleData: [], finYears: [] };
    }

    const fyMap = {};
    const qMap = {};
    const mMap = {};
    const modMap = {};

    const fySet = new Set();

    // Init month map with 1-12
    const monthNames = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
    monthNames.forEach((m, idx) => {
      mMap[idx + 1] = { name: m, monthNum: idx + 1, collection: 0, refund: 0, net: 0 };
    });

    // Init quarter map with 1-4
    [1, 2, 3, 4].forEach(q => {
      qMap[q] = { name: `Q${q}`, collection: 0, refund: 0, net: 0 };
    });

    allCollectionData.forEach(row => {
      const fy = row.financialyear || "Unknown";
      if (fy !== "Unknown") fySet.add(fy);
      
      const coll = Number(row.collection) || 0;
      const ref = Number(row.refund) || 0;
      const netAmt = Number(row["Receipt Amount"]) || 0;
      
      // Financial Year Map
      if (!fyMap[fy]) fyMap[fy] = { financialyear: fy, collection: 0, refund: 0, net: 0 };
      fyMap[fy].collection += coll;
      fyMap[fy].refund += ref;
      fyMap[fy].net += netAmt;

      // Quarter Map
      const q = row.finquarternumber;
      if (q && qMap[q]) {
        qMap[q][fy] = (qMap[q][fy] || 0) + coll;
        qMap[q].collection += coll;
        qMap[q].refund += ref;
        qMap[q].net += netAmt;
      }

      // Month Map
      const m = row.finmonthnumber;
      if (m && mMap[m]) {
        mMap[m][fy] = (mMap[m][fy] || 0) + coll;
        mMap[m].collection += coll;
        mMap[m].refund += ref;
        mMap[m].net += netAmt;
      }

      // Module Map
      const mod = row.Module || "(Blank)";
      if (!modMap[mod]) modMap[mod] = { name: mod, collection: 0, refund: 0, net: 0 };
      modMap[mod][fy] = (modMap[mod][fy] || 0) + coll;
      modMap[mod].collection += coll;
      modMap[mod].refund += ref;
      modMap[mod].net += netAmt;
    });

    const finYearsArr = Array.from(fySet).sort();

    const finalFyData = Object.values(fyMap).sort((a, b) => a.financialyear.localeCompare(b.financialyear));
    const finalQuarterData = [1, 2, 3, 4].map(q => qMap[q]);
    const finalMonthData = Object.values(mMap).sort((a, b) => a.monthNum - b.monthNum);
    
    // Sort modules by total collection across all years
    const finalModuleData = Object.values(modMap).sort((a, b) => {
      const totalA = finYearsArr.reduce((sum, fy) => sum + (a[fy] || 0), 0);
      const totalB = finYearsArr.reduce((sum, fy) => sum + (b[fy] || 0), 0);
      return totalB - totalA;
    });

    return {
      fyData: finalFyData,
      quarterData: finalQuarterData,
      monthData: finalMonthData,
      moduleData: finalModuleData,
      finYears: finYearsArr
    };
  }, [allCollectionData]);

  if (loading) {
    return <Box sx={{ p: 4, textAlign: "center" }}>Loading Analysis...</Box>;
  }

  if (!finYears.length) {
    return <Box sx={{ p: 4, textAlign: "center", color: "#64748b" }}>No data available for analysis</Box>;
  }

  const getFyLineColor = (index) => {
    const colors = ["#3b82f6", "#22c55e", "#ef4444", "#eab308", "#8b5cf6"];
    return colors[index % colors.length];
  };

  const lineSeries = finYears.map((fy, idx) => ({
    dataKey: fy,
    label: fy,
    color: getFyLineColor(idx),
    showMark: true,
    valueFormatter: (v) => formatValue(v),
    curve: "catmullRom"
  }));

  const barSeries = finYears.map((fy, idx) => ({
    dataKey: fy,
    label: fy,
    color: getFyLineColor(idx),
    valueFormatter: (v) => formatValue(v)
  }));

  const chartSx = {
    "& .MuiChartsAxis-tickLabel": { fill: "#475569", fontSize: "0.75rem", fontWeight: 600 },
    "& .MuiChartsAxis-line": { stroke: "#cbd5e1" },
    "& .MuiChartsAxis-tick": { stroke: "#cbd5e1" },
  };

  const renderHeaderOptions = (title, dataset) => (
   <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
    <Chip 
     label="View All" 
     size="small" 
     onClick={() => setAggModal({ open: true, title: `${title} Details`, dataset })} 
     sx={{ fontSize: "0.65rem", height: 22, bgcolor: "#f1f5f9", color: "#475569", fontWeight: 700, cursor: "pointer", "&:hover": { bgcolor: "#e2e8f0" } }} 
    />
    <MuiTooltip title="View Data">
     <IconButton size="small" onClick={() => setModalOpen(true)} sx={{ p: 0.5, color: "#64748b", cursor: "pointer" }}>
      <MoreVertIcon sx={{ fontSize: 18, cursor: "pointer" }} />
     </IconButton>
    </MuiTooltip>
   </Box>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
      {/* Top Row */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
        
        {/* Financial Year Wise */}
        <Paper elevation={0} sx={CARD_STYLE}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
           <Typography sx={{ fontWeight: 800, fontSize: "0.85rem", color: "#1e293b" }}>
             Financial Year Wise Collection
           </Typography>
           {renderHeaderOptions("Financial Year Wise Collection", fyData)}
          </Box>
          <Box sx={{ flex: 1, minHeight: 250 }}>
            {fyData.length > 0 ? (
              <BarChart
                dataset={fyData}
                xAxis={[{ scaleType: "band", dataKey: "financialyear" }]}
                yAxis={[{ valueFormatter: (v) => formatValue(v) }]}
                series={[{ 
                  dataKey: "collection", 
                  color: "#93c5fd", 
                  valueFormatter: (v) => formatValue(v) 
                }]}
                margin={{ left: 60, right: 20, top: 20, bottom: 40 }}
                sx={chartSx}
                slotProps={{ legend: { hidden: true } }}
              />
            ) : null}
          </Box>
        </Paper>

        {/* Quarter Wise */}
        <Paper elevation={0} sx={CARD_STYLE}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography sx={{ fontWeight: 800, fontSize: "0.85rem", color: "#1e293b" }}>
              Quarter Wise Collection
            </Typography>
            {renderHeaderOptions("Quarter Wise Collection", quarterData)}
          </Box>
          <Box sx={{ flex: 1, minHeight: 250 }}>
            {quarterData.length > 0 ? (
              <LineChart
                dataset={quarterData}
                xAxis={[{ scaleType: "point", dataKey: "name" }]}
                yAxis={[{ valueFormatter: (v) => formatValue(v) }]}
                series={lineSeries}
                margin={{ left: 60, right: 20, top: 40, bottom: 40 }}
                sx={chartSx}
                slotProps={{
                  legend: { direction: 'row', position: { vertical: 'top', horizontal: 'right' }, padding: 0 }
                }}
              />
            ) : null}
          </Box>
        </Paper>

      </Box>

      {/* Bottom Row */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.5fr 1fr" }, gap: 2 }}>
        
        {/* Month Wise */}
        <Paper elevation={0} sx={CARD_STYLE}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography sx={{ fontWeight: 800, fontSize: "0.85rem", color: "#1e293b" }}>
              Month Wise Collection
            </Typography>
            {renderHeaderOptions("Month Wise Collection", monthData)}
          </Box>
          <Box sx={{ flex: 1, minHeight: 300 }}>
            {monthData.length > 0 ? (
              <LineChart
                dataset={monthData}
                xAxis={[{ scaleType: "point", dataKey: "name" }]}
                yAxis={[{ valueFormatter: (v) => formatValue(v) }]}
                series={lineSeries}
                margin={{ left: 60, right: 20, top: 40, bottom: 40 }}
                sx={chartSx}
                slotProps={{
                  legend: { direction: 'row', position: { vertical: 'top', horizontal: 'right' }, padding: 0 }
                }}
              />
            ) : null}
          </Box>
        </Paper>

        {/* Module Wise */}
        <Paper elevation={0} sx={CARD_STYLE}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography sx={{ fontWeight: 800, fontSize: "0.85rem", color: "#1e293b" }}>
              Module Wise Collection
            </Typography>
            {renderHeaderOptions("Module Wise Collection", moduleData)}
          </Box>
          <Box sx={{ flex: 1, minHeight: 300 }}>
            {moduleData.length > 0 ? (
              <BarChart
                dataset={moduleData.slice(0, 8)}
                xAxis={[{ scaleType: "band", dataKey: "name", tickLabelStyle: { fontSize: 10 } }]}
                yAxis={[{ valueFormatter: (v) => formatValue(v) }]}
                series={barSeries}
                margin={{ left: 60, right: 20, top: 40, bottom: 60 }}
                sx={chartSx}
                slotProps={{
                  legend: { direction: 'row', position: { vertical: 'top', horizontal: 'right' }, padding: 0 }
                }}
              />
            ) : null}
          </Box>
        </Paper>

      </Box>

      <PaymentDetailsModal 
       open={modalOpen} 
       onClose={() => setModalOpen(false)} 
       data={allCollectionData} 
       loading={loading} 
       paymentMode="Collection" 
      />

      <AggregatedDataModal
       open={aggModal.open}
       onClose={() => setAggModal(prev => ({ ...prev, open: false }))}
       title={aggModal.title}
       dataset={aggModal.dataset}
      />
    </Box>
  );
};

export default MISCollectionAnalysis;
