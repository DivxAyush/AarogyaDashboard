import React, { useMemo, useState } from "react";
import { Box, Paper, Typography, IconButton, Tooltip as MuiTooltip, Chip, Modal, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { BarChart, LineChart } from "@mui/x-charts";
import { Skeleton } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CloseIcon from "@mui/icons-material/Close";
import PaymentDetailsModal from "../Detail/PaymentDetailsModal";

const AnalysisSkeleton = () => {
    const glassCard = {
        ...CARD_STYLE,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.5))',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.8)',
    };
    
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
                {[1, 2].map(i => (
                    <Paper key={i} elevation={0} sx={glassCard}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Skeleton animation="wave" variant="text" width={200} height={24} />
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Skeleton animation="wave" variant="rounded" width={60} height={26} sx={{ borderRadius: '6px' }} />
                                <Skeleton animation="wave" variant="circular" width={26} height={26} />
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 250, mt: 4, pb: 2 }}>
                            {[1, 2, 3, 4, 5, 6].map(j => (
                                <Box key={j} sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                                    <Skeleton animation="wave" variant="rounded" width="60%" height={`${(j * 17) % 60 + 30}%`} sx={{ borderRadius: '4px 4px 0 0' }} />
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                ))}
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.5fr 1fr" }, gap: 2 }}>
                {[1, 2].map(i => (
                    <Paper key={i} elevation={0} sx={glassCard}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Skeleton animation="wave" variant="text" width={200} height={24} />
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Skeleton animation="wave" variant="rounded" width={60} height={26} sx={{ borderRadius: '6px' }} />
                                <Skeleton animation="wave" variant="circular" width={26} height={26} />
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 300, mt: 4, pb: 2 }}>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(j => (
                                <Box key={j} sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                                    <Skeleton animation="wave" variant="rounded" width="50%" height={`${(j * 23) % 70 + 20}%`} sx={{ borderRadius: '4px 4px 0 0' }} />
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                ))}
            </Box>
        </Box>
    );
};

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
         <TableCell sx={{ fontWeight: 700, color: "#475569", textAlign: "right" }}>Gross Revenue</TableCell>
         <TableCell sx={{ fontWeight: 700, color: "#475569", textAlign: "right" }}>Discount</TableCell>
         <TableCell sx={{ fontWeight: 700, color: "#475569", textAlign: "right" }}>Net Revenue</TableCell>
        </TableRow>
       </TableHead>
       <TableBody>
        {(dataset || []).map((row, i) => (
         <TableRow key={i} hover>
          <TableCell sx={{ fontWeight: 600, color: "#334155" }}>{row.name || row.label || row.financialyear}</TableCell>
          <TableCell sx={{ textAlign: "right", color: "#059669" }}>{formatFullINR(row.gross)}</TableCell>
          <TableCell sx={{ textAlign: "right", color: "#dc2626" }}>{formatFullINR(row.discount)}</TableCell>
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

const MISRevenueAnalysis = ({ allRevenueData, loading }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [aggModal, setAggModal] = useState({ open: false, title: "", dataset: [] });

  const {
    fyData,
    quarterData,
    monthData,
    moduleData,
    finYears,
  } = useMemo(() => {
    if (!allRevenueData?.length) {
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
      mMap[idx + 1] = { name: m, monthNum: idx + 1, gross: 0, discount: 0, net: 0 };
    });

    // Init quarter map with 1-4
    [1, 2, 3, 4].forEach(q => {
      qMap[q] = { name: `Q${q}`, gross: 0, discount: 0, net: 0 };
    });

    allRevenueData.forEach(row => {
      const fy = row.financialyear || "Unknown";
      if (fy !== "Unknown") fySet.add(fy);
      
      const grossAmt = Number(row.grossamount) || 0;
      const discAmt = Number(row.discount) || 0;
      const netAmt = Number(row.oh_amt_net) || 0;
      
      // Financial Year Map
      if (!fyMap[fy]) fyMap[fy] = { financialyear: fy, gross: 0, discount: 0, net: 0 };
      fyMap[fy].gross += grossAmt;
      fyMap[fy].discount += discAmt;
      fyMap[fy].net += netAmt;

      // Quarter Map
      const q = row.finquarternumber;
      if (q && qMap[q]) {
        qMap[q][fy] = (qMap[q][fy] || 0) + netAmt; // We track net revenue across years
        qMap[q].gross += grossAmt;
        qMap[q].discount += discAmt;
        qMap[q].net += netAmt;
      }

      // Month Map
      const m = row.finmonthnumber;
      if (m && mMap[m]) {
        mMap[m][fy] = (mMap[m][fy] || 0) + netAmt;
        mMap[m].gross += grossAmt;
        mMap[m].discount += discAmt;
        mMap[m].net += netAmt;
      }

      // Module Map
      const mod = row.module || "(Blank)";
      if (!modMap[mod]) modMap[mod] = { name: mod, gross: 0, discount: 0, net: 0 };
      modMap[mod][fy] = (modMap[mod][fy] || 0) + netAmt;
      modMap[mod].gross += grossAmt;
      modMap[mod].discount += discAmt;
      modMap[mod].net += netAmt;
    });

    const finYearsArr = Array.from(fySet).sort();

    const finalFyData = Object.values(fyMap).sort((a, b) => a.financialyear.localeCompare(b.financialyear));
    const finalQuarterData = [1, 2, 3, 4].map(q => qMap[q]);
    const finalMonthData = Object.values(mMap).sort((a, b) => a.monthNum - b.monthNum);
    
    // Sort modules by total net across all years
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
  }, [allRevenueData]);

  if (loading) {
    return <AnalysisSkeleton />;
  }

  if (!finYears.length) {
    return <Box sx={{ p: 4, textAlign: "center", color: "#64748b" }}>No data available for analysis</Box>;
  }

  const getFyLineColor = (index) => {
    const colors = ["#10b981", "#3b82f6", "#ef4444", "#eab308", "#8b5cf6"];
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
    valueFormatter: (v) => formatValue(v),
    barLabelPlacement: "outside",
    barLabel: (item) => {
        let val = item?.value ?? item;
        if (!val || val === 0) return '';
        if (val >= 10000000) return `${(val / 10000000).toFixed(2)}Cr`;
        if (val >= 100000) return `${(val / 100000).toFixed(2)}L`;
        if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
        return val.toString();
    }
  }));

  const chartSx = {
    "& .MuiChartsAxis-tickLabel": { fill: "#475569", fontSize: "0.75rem", fontWeight: 600 },
    "& .MuiChartsAxis-line": { stroke: "#cbd5e1" },
    "& .MuiChartsAxis-tick": { stroke: "#cbd5e1" },
  };

  const tooltipProps = {
    legend: { direction: 'row', position: { vertical: 'top', horizontal: 'middle' }, itemMarkWidth: 10, itemMarkHeight: 10, labelStyle: { fontSize: 11, fontWeight: 600, fill: '#475569' } },
    popper: {
        sx: {
            "& .MuiChartsTooltip-root": { p: 0.5, borderRadius: '6px' },
            "& .MuiChartsTooltip-table": { '& td, & th': { p: '2px 6px !important', fontSize: '10px !important' } },
            "& .MuiTypography-root": { fontSize: '10px !important', fontWeight: 'bold' },
            "& .MuiChartsTooltip-mark": { width: '8px !important', height: '8px !important' }
        }
    },
    bar: { rx: 4, ry: 4 },
    barLabel: { style: { fontSize: '8px', fill: '#64748b', fontWeight: 600 } }
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
      <style>{`
          .MuiChartsTooltip-root { padding: 4px 8px !important; border-radius: 6px !important; }
          .MuiChartsTooltip-table { margin: 0 !important; }
          .MuiChartsTooltip-cell { padding: 2px 4px !important; }
          .MuiChartsTooltip-labelCell, .MuiChartsTooltip-valueCell { font-size: 10px !important; font-weight: 600 !important; }
          .MuiChartsTooltip-mark { width: 6px !important; height: 6px !important; border-radius: 50% !important; box-shadow: none !important; margin-right: 4px !important; }
          .MuiBarLabel-root { font-size: 4.5px !important; font-weight: 600 !important; fill: #64748b !important; }
          .recharts-wrapper, .recharts-surface, .recharts-pie-sector, path, svg { outline: none !important; -webkit-tap-highlight-color: transparent !important; }
      `}</style>
      {/* Top Row */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
        
        {/* Financial Year Wise */}
        <Paper elevation={0} sx={CARD_STYLE}>
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2, flexWrap: "wrap", gap: 1 }}>
           <Typography sx={{ fontWeight: 800, fontSize: "0.85rem", color: "#1e293b", flex: 1, minWidth: "120px" }}>
             Financial Year Wise Net Revenue
           </Typography>
           <Box sx={{ display: "flex", justifyContent: "flex-end", flexShrink: 0 }}>
             {renderHeaderOptions("Financial Year Wise Revenue", fyData)}
           </Box>
          </Box>
          <Box sx={{ flex: 1, minHeight: 250 }}>
            {fyData.length > 0 ? (
              <BarChart
                dataset={fyData}
                xAxis={[{ scaleType: "band", dataKey: "financialyear" }]}
                yAxis={[{ valueFormatter: (v) => formatValue(v) }]}
                series={[{ 
                  dataKey: "net", 
                  color: "#6ee7b7", 
                  valueFormatter: (v) => formatValue(v) 
                }]}
                margin={{ left: 60, right: 20, top: 20, bottom: 40 }}
                sx={chartSx}
                slotProps={tooltipProps}
              />
            ) : null}
          </Box>
        </Paper>

        {/* Quarter Wise */}
        <Paper elevation={0} sx={CARD_STYLE}>
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2, flexWrap: "wrap", gap: 1 }}>
            <Typography sx={{ fontWeight: 800, fontSize: "0.85rem", color: "#1e293b", flex: 1, minWidth: "120px" }}>
              Quarter Wise Net Revenue
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "flex-end", flexShrink: 0 }}>
              {renderHeaderOptions("Quarter Wise Revenue", quarterData)}
            </Box>
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
                slotProps={tooltipProps}
              />
            ) : null}
          </Box>
        </Paper>

      </Box>

      {/* Bottom Row */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.5fr 1fr" }, gap: 2 }}>
        
        {/* Month Wise */}
        <Paper elevation={0} sx={CARD_STYLE}>
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2, flexWrap: "wrap", gap: 1 }}>
            <Typography sx={{ fontWeight: 800, fontSize: "0.85rem", color: "#1e293b", flex: 1, minWidth: "120px" }}>
              Month Wise Net Revenue
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "flex-end", flexShrink: 0 }}>
              {renderHeaderOptions("Month Wise Revenue", monthData)}
            </Box>
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
                slotProps={tooltipProps}
              />
            ) : null}
          </Box>
        </Paper>

        {/* Module Wise */}
        <Paper elevation={0} sx={CARD_STYLE}>
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2, flexWrap: "wrap", gap: 1 }}>
            <Typography sx={{ fontWeight: 800, fontSize: "0.85rem", color: "#1e293b", flex: 1, minWidth: "120px" }}>
              Module Wise Net Revenue
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "flex-end", flexShrink: 0 }}>
              {renderHeaderOptions("Module Wise Revenue", moduleData)}
            </Box>
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
                slotProps={tooltipProps}
              />
            ) : null}
          </Box>
        </Paper>

      </Box>

      <PaymentDetailsModal 
       open={modalOpen} 
       onClose={() => setModalOpen(false)} 
       data={allRevenueData} 
       loading={loading} 
       paymentMode="Revenue" 
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

export default MISRevenueAnalysis;
