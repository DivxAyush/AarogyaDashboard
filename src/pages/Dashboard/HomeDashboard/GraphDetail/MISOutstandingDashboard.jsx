import React, { useMemo, useState } from "react";
import { Box, Typography, Paper, Skeleton, IconButton, Tooltip as MuiTooltip, Chip, Modal, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";
import { useDrawingArea } from "@mui/x-charts/hooks";
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

function PieCenterLabel({ children }) {
 const { width, height, left, top } = useDrawingArea();
 return (
  <text x={left + width / 2} y={top + height / 2} textAnchor="middle" dominantBaseline="central" style={{ fill: "#0f172a", fontSize: "0.85rem", fontWeight: 800 }}>
   {children}
  </text>
 );
}

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
  return (
   <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, mt: 2 }}>
    {[1, 2, 3, 4].map(i => <Skeleton key={i} variant="rounded" width="100%" height={280} sx={{ borderRadius: "12px" }} />)}
   </Box>
  );
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

  const leftMargin = 90;

  return (
   <Paper elevation={0} sx={{ ...CARD_STYLE, display: "flex", flexDirection: "column" }}>
    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1 }}>
     <Box>
      <Typography sx={{ fontWeight: 800, fontSize: "0.85rem", color: "#1e293b" }}>{title}</Typography>
      {fullDataset && fullDataset.length > dataset.length && (
       <Typography sx={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 600 }}>Showing Top 10 entries</Typography>
      )}
     </Box>
     <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      {currentFilter && (
       <>
        <Chip label={`Filtered: ${currentFilter.name}`} size="small" sx={{ fontSize: "0.6rem", height: 20, bgcolor: "#e0f2fe", color: "#0284c7", fontWeight: 700 }} />
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
        dataKey: "name",
        tickLabelStyle: { fontSize: 11, fontWeight: 600, fill: "#334155" },
        valueFormatter: (v) => truncate(v, 14)
       }]}
       xAxis={[{
        scaleType: "linear",
        min: 0,
        valueFormatter: (v) => {
         if (v === 0) return '0';
         if (!Number.isInteger(v)) return '';
         return Math.round(Math.pow(10, v)).toLocaleString("en-IN");
        },
        tickLabelStyle: { fontSize: 10 }
       }]}
       series={[
        {
         dataKey: "balanceLog",
         label: "Outstanding",
         color: colors.balance,
         valueFormatter: (v, ctx) => {
          const d = chartData[ctx?.dataIndex];
          return formatFullINR(d?.balance || 0);
         }
        },
       ]}
       margin={{ left: leftMargin, right: 20, top: 40, bottom: 20 }}
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

   {/* TOP ROW: Pie (Module) + Bar (Speciality) */}
   <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1.5fr" }, gap: 2 }}>

    <Paper elevation={0} sx={{ ...CARD_STYLE, display: "flex", flexDirection: "column" }}>
     <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
      <Typography sx={{ fontWeight: 800, fontSize: "0.85rem", color: "#1e293b" }}>Outstanding by Module</Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
       {chartFilters.module && (
        <>
         <Chip label={`Filtered: ${chartFilters.module.name}`} size="small" sx={{ fontSize: "0.6rem", height: 20, bgcolor: "#e0f2fe", color: "#0284c7", fontWeight: 700 }} />
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
     <Box sx={{ flex: 1, minHeight: 420 }}>
      {modules.length > 0 ? (
       <PieChart
        series={[{
         data: modules,
         innerRadius: 75,
         outerRadius: 110,
         paddingAngle: 2,
         cornerRadius: 4,
         valueFormatter: (v) => {
          return `Outstanding: ${formatINR(v.balance)}`;
         }
        }]}
        margin={{ top: 40, bottom: 60, left: 10, right: 10 }}
        slotProps={{
         legend: { direction: 'row', position: { vertical: 'bottom', horizontal: 'middle' }, padding: 0 }
        }}
        sx={chartSx}
        onItemClick={(event, item) => {
         const clickedModule = modules[item.dataIndex];
         setChartFilters(prev => ({ ...prev, module: prev.module?.name === clickedModule.label ? null : { name: clickedModule.label, originalNames: clickedModule.originalNames } }));
        }}
       >
        <PieCenterLabel>{formatFullINR(totalBalance)}</PieCenterLabel>
       </PieChart>
      ) : (
       <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#94a3b8" }}>
        No data available
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
