import React, { useMemo, useState } from "react";
import { Box, Typography, Paper, Skeleton, IconButton, Tooltip as MuiTooltip, Chip, Modal, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CloseIcon from "@mui/icons-material/Close";
import OutstandingDetailsModal from "../Detail/OutstandingDetailsModal";

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
 return isNaN(n) ? "₹0" : `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

const truncate = (str, max = 16) => str.length > max ? str.substring(0, max) + '...' : str;

const CARD_STYLE = {
 borderRadius: "12px",
 background: "#fff",
 border: "1px solid #e2e8f0",
 boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
 overflow: "hidden",
 p: 2,
};

const PIE_COLORS = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6", "#06b6d4", "#f97316", "#ec4899", "#14b8a6", "#6366f1"];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <Box sx={{ bgcolor: '#fff', p: 1, border: '1px solid #e2e8f0', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                {label && <Typography sx={{ fontWeight: 700, fontSize: '11px', color: '#1e293b', mb: 0.5 }}>{label}</Typography>}
                {payload.map((entry, index) => (
                    <Box key={`item-${index}`} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 0.25 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: entry.color }} />
                            <Typography sx={{ fontSize: '10px', color: '#475569', fontWeight: 500 }}>{entry.name}</Typography>
                        </Box>
                        <Typography sx={{ fontSize: '10px', fontWeight: 700, color: '#0f172a' }}>{formatFullINR(entry.value)}</Typography>
                    </Box>
                ))}
            </Box>
        );
    }
    return null;
};

const DashboardSkeleton = () => {
    const glassCard = {
        ...CARD_STYLE,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.5))',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.8)',
    };
    
    const mockBarData = [
        [60, 20], [45, 15], [80, 25], [35, 10], [50, 15]
    ];

    return (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "repeat(3, 1fr)" }, gap: 3, mt: 2 }}>
            <Paper elevation={0} sx={glassCard}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Skeleton animation="wave" variant="text" width={150} height={24} />
                    <Skeleton animation="wave" variant="rounded" width={70} height={26} sx={{ borderRadius: '6px' }} />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', justifyContent: 'center', flex: 1, mt: 2, gap: 3 }}>
                    <Skeleton animation="wave" variant="circular" width={200} height={200} />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, minWidth: 120 }}>
                        {[1, 2, 3, 4, 5].map(i => (
                            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Skeleton animation="wave" variant="circular" width={10} height={10} />
                                <Skeleton animation="wave" variant="text" width={80} height={16} />
                            </Box>
                        ))}
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, pt: 3, borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                    <Skeleton animation="wave" variant="text" width={200} height={24} />
                </Box>
            </Paper>

            {[1, 2, 3, 4, 5].map(i => (
                <Paper key={i} elevation={0} sx={glassCard}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Skeleton animation="wave" variant="text" width={180} height={24} />
                        <Skeleton animation="wave" variant="rounded" width={70} height={26} sx={{ borderRadius: '6px' }} />
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 4 }}>
                        {mockBarData.map((widths, j) => (
                            <Box key={j} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Skeleton animation="wave" variant="text" width={40} height={16} />
                                <Box sx={{ flex: 1, display: 'flex', gap: 1 }}>
                                    <Skeleton animation="wave" variant="rounded" width={`${widths[0]}%`} height={12} sx={{ borderRadius: 1 }} />
                                    <Skeleton animation="wave" variant="rounded" width={`${widths[1]}%`} height={12} sx={{ borderRadius: 1 }} />
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Paper>
            ))}
        </Box>
    );
};

const AggregatedDataModal = ({ open, onClose, title, dataset }) => {
 return (
  <Modal open={open} onClose={onClose} closeAfterTransition>
   <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: { xs: "95vw", sm: "500px" }, bgcolor: '#ffffff', boxShadow: 24, borderRadius: "12px", overflow: "hidden" }}>
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
         <TableCell sx={{ fontWeight: 700, color: "#475569", textAlign: "right" }}>Outstanding Balance</TableCell>
        </TableRow>
       </TableHead>
       <TableBody>
        {(dataset || []).map((row, i) => (
         <TableRow key={i} hover>
          <TableCell sx={{ fontWeight: 600, color: "#334155" }}>{row.name || row.label}</TableCell>
          <TableCell sx={{ textAlign: "right", fontWeight: 700, color: "#d97706" }}>{formatFullINR(row.balance)}</TableCell>
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

const MISOutstandingDashboard = ({ allOutstandingData, loading }) => {
 const [modalOpen, setModalOpen] = useState(false);
 const [chartFilters, setChartFilters] = useState({
  module: null,
  organization: null,
  consultant: null,
  speciality: null
 });
 const [aggModal, setAggModal] = useState({ open: false, title: "", dataset: [] });

 // Aggregations
 const { modules, organizations, consultants, specialities, fullModules, fullOrganizations, fullConsultants, fullSpecialities, totalBalance, filteredData } = useMemo(() => {
  if (!allOutstandingData?.length) return { modules: [], organizations: [], consultants: [], specialities: [], fullModules: [], fullOrganizations: [], fullConsultants: [], fullSpecialities: [], totalBalance: 0, filteredData: [] };

  const rowMatches = (row, exceptKey = null) => {
   for (const key in chartFilters) {
    if (key === exceptKey || !chartFilters[key]) continue;
    const val = chartFilters[key];

    let rowVal = "";
    if (key === "module") rowVal = getStr(row, "module", "Module") || "(Blank)";
    if (key === "organization") rowVal = getStr(row, "organization", "Organization", "org") || "(Blank)";
    if (key === "consultant") rowVal = getStr(row, "consultantname", "Consultant", "consultant") || "(Blank)";
    if (key === "speciality") rowVal = getStr(row, "speciality", "Speciality") || "(Blank)";

    if (key === "module" && Array.isArray(val.originalNames)) {
     if (!val.originalNames.includes(rowVal)) return false;
    } else {
     if (rowVal !== val.name) return false;
    }
   }
   return true;
  };

  const filteredDataSet = allOutstandingData.filter(row => rowMatches(row));

  const modMap = {};
  const orgMap = {};
  const consMap = {};
  const specMap = {};
  let totalBal = 0;

  allOutstandingData.forEach(row => {
   const bal = getNum(row, "outstanding", "Outstanding", "balance", "Balance");

   if (rowMatches(row)) {
    totalBal += bal;
   }

   const add = (map, keyVal) => {
    const k = keyVal || "(Blank)";
    if (!map[k]) map[k] = { name: k, balance: 0 };
    map[k].balance += bal;
   };

   if (rowMatches(row, "module")) add(modMap, getStr(row, "module", "Module"));
   if (rowMatches(row, "organization")) add(orgMap, getStr(row, "organization", "Organization", "org"));
   if (rowMatches(row, "consultant")) add(consMap, getStr(row, "consultantname", "Consultant", "consultant"));
   if (rowMatches(row, "speciality")) add(specMap, getStr(row, "speciality", "Speciality"));
  });

  const toArr = (map) => Object.values(map).sort((a, b) => b.balance - a.balance);

  const allMods = toArr(modMap);
  let finalModules = allMods;
  if (allMods.length > 5) {
   finalModules = allMods.slice(0, 5).map(m => ({ ...m, originalNames: [m.name] }));
   const others = allMods.slice(5).reduce((acc, val) => {
    acc.balance += val.balance;
    acc.originalNames.push(val.name);
    return acc;
   }, { name: "Others", balance: 0, originalNames: [] });
   finalModules.push(others);
  } else {
   finalModules = allMods.map(m => ({ ...m, originalNames: [m.name] }));
  }

  const modulesData = finalModules.map((d, i) => ({ ...d, id: i, value: d.balance > 0 ? d.balance : 0, label: truncate(d.name, 16) }));

  const fullOrganizations = toArr(orgMap);
  const fullConsultants = toArr(consMap);
  const fullSpecialities = toArr(specMap);

  return {
   modules: modulesData,
   organizations: fullOrganizations.slice(0, 10),
   consultants: fullConsultants.slice(0, 10),
   specialities: fullSpecialities.slice(0, 10),
   fullModules: allMods,
   fullOrganizations,
   fullConsultants,
   fullSpecialities,
   totalBalance: totalBal,
   filteredData: filteredDataSet
  };
 }, [allOutstandingData, chartFilters]);

 if (loading) {
  return <DashboardSkeleton />;
 }

 const colors = {
  balance: "#f59e0b", // Amber for Outstanding
 };

 const chartSx = {
  "& path, & rect": { cursor: "pointer !important" },
  "& .MuiChartsAxis-tickLabel": { fill: "#64748b", fontSize: "0.75rem", fontWeight: 500 },
  "& .MuiChartsAxis-line": { stroke: "#cbd5e1", strokeWidth: 1.5 },
  "& .MuiChartsAxis-tick": { stroke: "#cbd5e1" },
 };

 const renderBarChart = (title, dataset, fullDataset, filterKey, minH = 280) => {
  const currentFilter = chartFilters[filterKey];

  const chartData = dataset.map(d => ({
   ...d,
   balanceLog: Math.max(0, d.balance > 0 ? Math.log10(d.balance) : 0)
  }));

  const leftMargin = 5;

  return (
   <Paper elevation={0} sx={{ ...CARD_STYLE, display: "flex", flexDirection: "column" }}>
    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1, flexWrap: "wrap", gap: 1 }}>
     <Box sx={{ flex: 1, minWidth: "120px" }}>
      <Typography sx={{ fontWeight: 800, fontSize: "0.85rem", color: "#1e293b" }}>{title}</Typography>
      {fullDataset && fullDataset.length > dataset.length && (
       <Typography sx={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 600 }}>Showing Top 10 entries</Typography>
      )}
     </Box>
     <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
      {currentFilter && (
       <>
        <Chip label={`Filtered: ${currentFilter.name}`} size="small" sx={{ fontSize: "0.6rem", height: 20, bgcolor: "#e0f2fe", color: "#0284c7", fontWeight: 700, maxWidth: { xs: 120, sm: 200 } }} />
        <MuiTooltip title="Clear Filter">
         <IconButton size="small" onClick={() => setChartFilters(prev => ({ ...prev, [filterKey]: null }))} sx={{ p: 0.5, bgcolor: "#fee2e2", color: "#ef4444", "&:hover": { bgcolor: "#fecaca" } }}>
          <FilterAltOffIcon sx={{ fontSize: 14 }} />
         </IconButton>
        </MuiTooltip>
       </>
      )}
      <Chip
       label="View All"
       size="small"
       onClick={() => setAggModal({ open: true, title: `${title} Details`, dataset: fullDataset })}
       sx={{ fontSize: "0.65rem", height: 22, bgcolor: "#f1f5f9", color: "#475569", fontWeight: 700, cursor: "pointer", "&:hover": { bgcolor: "#e2e8f0" } }}
      />
      <MuiTooltip title="View Data">
       <IconButton size="small" onClick={() => setModalOpen(true)} sx={{ p: 0.5, color: "#64748b", cursor: "pointer" }}>
        <MoreVertIcon sx={{ fontSize: 18, cursor: "pointer" }} />
       </IconButton>
      </MuiTooltip>
     </Box>
    </Box>
    <Box sx={{ flex: 1, minHeight: minH }}>
     {chartData.length > 0 ? (
      <BarChart
       dataset={chartData}
       layout="horizontal"
       yAxis={[{
        scaleType: "band",
        categoryGapRatio: 0.2,
        dataKey: "name",
        tickLabelStyle: { fontSize: 10, fontWeight: 600, fill: "#475569" },
        valueFormatter: (v) => truncate(v, 14),
        disableLine: true,
        disableTicks: true
       }]}
       xAxis={[{
        scaleType: "linear",
        min: 0,
        valueFormatter: (v) => {
         if (v === 0) return '0';
         if (!Number.isInteger(v)) return '';
         if (v >= 10000000) return `${(v / 10000000).toFixed(1)}Cr`;
         return `${(v / 100000).toFixed(1)}L`;
        },
        tickLabelStyle: { fontSize: 10, fill: '#64748b', fontWeight: 600 },
        disableLine: false,
        disableTicks: true
       }]}
       series={[
        {
         dataKey: "balance",
         label: "Outstanding",
         color: colors.balance,
         valueFormatter: (v) => formatFullINR(v),
         barLabelPlacement: "outside",
         barLabel: (item) => {
             let val = item?.value ?? item;
             if (!val || val === 0) return '';
             if (val >= 10000000) return `${(val / 10000000).toFixed(2)}Cr`;
             if (val >= 100000) return `${(val / 100000).toFixed(2)}L`;
             if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
             return val.toString();
         }
        },
       ]}
       slotProps={{
           legend: {
               direction: 'row',
               position: { vertical: 'top', horizontal: 'middle' },
               itemMarkWidth: 10,
               itemMarkHeight: 10,
               labelStyle: { fontSize: 11, fontWeight: 600, fill: '#475569' }
           },
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
       }}
       margin={{ top: 40, right: 30, left: 5, bottom: 25 }}
       sx={{
        ...chartSx,
        "& .MuiBarElement-root": { rx: 4 },
       }}
       onItemClick={(event, item) => {
        const clickedData = chartData[item.dataIndex];
        if (clickedData) {
         setChartFilters(prev => ({ ...prev, [filterKey]: prev[filterKey]?.name === clickedData.name ? null : clickedData }));
        }
       }}
      />
     ) : (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#94a3b8" }}>
       No data available
      </Box>
     )}
    </Box>
   </Paper>
  );
 };

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
   {/* TOP ROW: Pie (Module) + Bar (Speciality) */}
   <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1.5fr" }, gap: 2 }}>

    <Paper elevation={0} sx={{ ...CARD_STYLE, display: "flex", flexDirection: "column" }}>
     <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1, flexWrap: "wrap", gap: 1 }}>
      <Typography sx={{ fontWeight: 800, fontSize: "0.85rem", color: "#1e293b", flex: 1, minWidth: "120px" }}>Outstanding by Module</Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
       {chartFilters.module && (
        <>
         <Chip label={`Filtered: ${chartFilters.module.name}`} size="small" sx={{ fontSize: "0.6rem", height: 20, bgcolor: "#e0f2fe", color: "#0284c7", fontWeight: 700, maxWidth: { xs: 120, sm: 200 } }} />
         <MuiTooltip title="Clear Filter">
          <IconButton size="small" onClick={() => setChartFilters(prev => ({ ...prev, module: null }))} sx={{ p: 0.5, bgcolor: "#fee2e2", color: "#ef4444", "&:hover": { bgcolor: "#fecaca" } }}>
           <FilterAltOffIcon sx={{ fontSize: 14 }} />
          </IconButton>
         </MuiTooltip>
        </>
       )}
       <Chip
        label="View All"
        size="small"
        onClick={() => setAggModal({ open: true, title: `Module Wise Outstanding Details`, dataset: fullModules })}
        sx={{ fontSize: "0.65rem", height: 22, bgcolor: "#f1f5f9", color: "#475569", fontWeight: 700, cursor: "pointer", "&:hover": { bgcolor: "#e2e8f0" } }}
       />
       <MuiTooltip title="View Data">
        <IconButton size="small" onClick={() => setModalOpen(true)} sx={{ p: 0.5, color: "#64748b", cursor: "pointer" }}>
         <MoreVertIcon sx={{ fontSize: 18, cursor: "pointer" }} />
        </IconButton>
       </MuiTooltip>
      </Box>
     </Box>
     <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
       <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', justifyContent: 'center', flex: 1, mt: 2, gap: { xs: 3, sm: 0 } }}>
           <Box sx={{ position: 'relative', width: 200, height: 200 }}>
               {modules.length > 0 ? (
                   <PieChart width={200} height={200}>
                       <Pie data={modules} dataKey="value" nameKey="label" cx="50%" cy="50%" innerRadius={65} outerRadius={95} stroke="none" paddingAngle={2} cursor="pointer" onClick={(data) => {
                           setChartFilters(prev => ({ ...prev, module: prev.module?.name === data.label ? null : { name: data.label, originalNames: data.originalNames } }));
                       }}>
                           {modules.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                       </Pie>
                       <RechartsTooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 1000 }} />
                   </PieChart>
               ) : (
                   <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#94a3b8" }}>No data</Box>
               )}
               {modules.length > 0 && (
                   <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                       <Typography sx={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', maxWidth: 110, textAlign: 'center', wordBreak: 'break-word', lineHeight: 1.2 }}>
                           {formatFullINR(totalBalance)}
                       </Typography>
                       <Typography sx={{ fontSize: '11px', color: '#64748b', fontWeight: 500, mt: 0.5 }}>Total Outstanding</Typography>
                   </Box>
               )}
           </Box>
           {modules.length > 0 && (
               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, ml: { sm: 4 }, minWidth: 140, width: { xs: '100%', sm: 'auto' } }}>
                   {modules.map((entry, index) => (
                       <Box key={`legend-${index}`} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                               <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: PIE_COLORS[index % PIE_COLORS.length] }} />
                               <Typography sx={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>{truncate(entry.label, 14)}</Typography>
                           </Box>
                           <Typography sx={{ fontSize: '12px', color: '#334155', fontWeight: 700 }}>{totalBalance > 0 ? ((entry.balance / totalBalance) * 100).toFixed(1) : 0}%</Typography>
                       </Box>
                   ))}
               </Box>
           )}
       </Box>
       {modules.length > 0 && (
           <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: { xs: 1, sm: 2 }, mt: 3, pt: 3, borderTop: '1px solid #f1f5f9' }}>
               <Typography sx={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Top Module</Typography>
               <Chip label={modules[0].name} sx={{ bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 700, fontSize: '12px', height: 26, borderRadius: '6px' }} />
               <Typography sx={{ fontSize: '13px', color: '#0f172a', fontWeight: 800 }}>{formatFullINR(modules[0].balance)}</Typography>
           </Box>
       )}
     </Box>
    </Paper>

    {renderBarChart("Speciality Wise Outstanding", specialities, fullSpecialities, "speciality", 420)}
   </Box>

   {/* BOTTOM ROW: Organization, Consultant */}
   <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
    {renderBarChart("Module Wise Outstanding", [...modules].sort((a, b) => b.balance - a.balance), fullModules, "module", 420)}
    {renderBarChart("Organization Wise Outstanding", organizations, fullOrganizations, "organization", 420)}
    {renderBarChart("Consultant Wise Outstanding", consultants, fullConsultants, "consultant", 420)}
   </Box>

   <OutstandingDetailsModal
    open={modalOpen}
    onClose={() => setModalOpen(false)}
    data={filteredData}
    loading={loading}
    paymentMode="Outstanding"
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

export default React.memo(MISOutstandingDashboard);
