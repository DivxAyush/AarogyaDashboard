import React, { useMemo, useState, useRef } from "react";
import { Box, Typography, Paper, Skeleton, IconButton, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination } from "@mui/material";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

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

const CARD_STYLE = {
 borderRadius: "16px",
 background: "#ffffff",
 border: "1px solid #e2e8f0",
 boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
 overflow: "hidden",
 p: 2,
};

const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#06b6d4", "#6366f1"];

const CustomTooltip = ({ active, payload }) => {
 if (active && payload && payload.length) {
  return (
   <Box sx={{ bgcolor: "rgba(255, 255, 255, 0.95)", p: 1, borderRadius: "6px", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", border: "1px solid #e2e8f0" }}>
    <Typography sx={{ fontWeight: 600, color: "#475569", fontSize: "0.65rem", mb: 0.25 }}>{payload[0].name}</Typography>
    <Typography sx={{ color: payload[0].payload.fill, fontWeight: 700, fontSize: "0.75rem" }}>{formatFullINR(payload[0].value)}</Typography>
   </Box>
  );
 }
 return null;
};

const ScrollableLegend = ({ data, activeFilter, type, handlePieClick }) => {
 const scrollRef = useRef(null);
 const [isDown, setIsDown] = useState(false);
 const [startX, setStartX] = useState(0);
 const [scrollLeft, setScrollLeft] = useState(0);
 const [isDragging, setIsDragging] = useState(false);

 const scroll = (offset) => {
  if (scrollRef.current) {
   scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  }
 };

 const onMouseDown = (e) => {
  setIsDown(true);
  setIsDragging(false);
  setStartX(e.pageX - scrollRef.current.offsetLeft);
  setScrollLeft(scrollRef.current.scrollLeft);
 };

 const onMouseLeave = () => setIsDown(false);
 const onMouseUp = () => setIsDown(false);

 const onMouseMove = (e) => {
  if (!isDown) return;
  e.preventDefault();
  const x = e.pageX - scrollRef.current.offsetLeft;
  const walk = (x - startX) * 1.5;
  if (Math.abs(walk) > 5) setIsDragging(true);
  if (scrollRef.current) scrollRef.current.scrollLeft = scrollLeft - walk;
 };

 const handleClick = (entry) => {
  if (!isDragging) handlePieClick(type, entry);
 };

 return (
  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mt: 1 }}>
   <IconButton size="small" onClick={() => scroll(-150)} sx={{ p: 0.5 }}>
    <ChevronLeftIcon sx={{ fontSize: 18 }} />
   </IconButton>

   <Box
    ref={scrollRef}
    onMouseDown={onMouseDown}
    onMouseLeave={onMouseLeave}
    onMouseUp={onMouseUp}
    onMouseMove={onMouseMove}
    sx={{
     display: 'flex',
     overflowX: 'auto',
     scrollbarWidth: 'none',
     '&::-webkit-scrollbar': { display: 'none' },
     gap: 1.5,
     flex: 1,
     px: 1,
     scrollBehavior: isDown ? 'auto' : 'smooth',
     cursor: isDown ? 'grabbing' : 'grab'
    }}
   >
    {data.map((entry, index) => {
     const isFaded = activeFilter.type === type && activeFilter.value !== entry.name;
     return (
      <Box
       key={index}
       onClick={() => handleClick(entry)}
       sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        opacity: isFaded ? 0.3 : 1,
        transition: "opacity 0.3s",
        flexShrink: 0,
        userSelect: 'none'
       }}
      >
       <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: PIE_COLORS[index % PIE_COLORS.length] }} />
       <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#475569', whiteSpace: 'nowrap' }}>
        {entry.name}
       </Typography>
      </Box>
     );
    })}
   </Box>

   <IconButton size="small" onClick={() => scroll(150)} sx={{ p: 0.5 }}>
    <ChevronRightIcon sx={{ fontSize: 18 }} />
   </IconButton>
  </Box>
 );
};

const DashboardSkeleton = () => {
 return (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
   <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 3 }}>
    {[1, 2, 3].map(i => (
     <Paper key={i} elevation={0} sx={{ ...CARD_STYLE, height: 350 }}>
      <Skeleton animation="wave" variant="text" width={180} height={24} sx={{ mb: 2 }} />
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, height: '100%' }}>
       <Skeleton animation="wave" variant="circular" width={200} height={200} />
      </Box>
     </Paper>
    ))}
   </Box>
   <Paper elevation={0} sx={{ ...CARD_STYLE, mt: 2, height: 400 }}>
    <Skeleton animation="wave" variant="rectangular" width="100%" height={350} sx={{ borderRadius: "8px" }} />
   </Paper>
  </Box>
 );
};

const MISOutstandingDashboard = ({ allOutstandingData, loading }) => {
 const [activeFilter, setActiveFilter] = useState({ type: null, value: null });
 const [page, setPage] = useState(0);
 const [rowsPerPage, setRowsPerPage] = useState(10);
 const gridRef = useRef(null);

 const { modules, organizations, specialities, filteredData } = useMemo(() => {
  if (!allOutstandingData?.length) return { modules: [], organizations: [], specialities: [], filteredData: [] };

  const modMap = {};
  const orgMap = {};
  const specMap = {};

  let filteredSet = allOutstandingData;

  // Apply Active Filter to the Grid
  if (activeFilter.type) {
   filteredSet = allOutstandingData.filter(row => {
    let rowVal = "";
    if (activeFilter.type === "module") rowVal = getStr(row, "module", "Module") || "(Blank)";
    if (activeFilter.type === "organization") rowVal = getStr(row, "organization", "Organization", "org") || "(Blank)";
    if (activeFilter.type === "speciality") rowVal = getStr(row, "speciality", "Speciality") || "(Blank)";
    return rowVal === activeFilter.value;
   });
  }

  allOutstandingData.forEach(row => {
   const bal = getNum(row, "outstanding", "Outstanding", "balance", "Balance");

   const mod = getStr(row, "module", "Module") || "(Blank)";
   const org = getStr(row, "organization", "Organization", "org") || "(Blank)";
   const spec = getStr(row, "speciality", "Speciality") || "(Blank)";

   if (!modMap[mod]) modMap[mod] = { name: mod, value: 0 };
   modMap[mod].value += bal;

   if (!orgMap[org]) orgMap[org] = { name: org, value: 0 };
   orgMap[org].value += bal;

   if (!specMap[spec]) specMap[spec] = { name: spec, value: 0 };
   specMap[spec].value += bal;
  });

  const toArr = (map) => Object.values(map).sort((a, b) => b.value - a.value);

  // Grouping Top 15 + Others for Organization and Speciality to avoid clutter
  const processTop10 = (arr) => {
   if (arr.length <= 15) return arr;
   const top10 = arr.slice(0, 14);
   const others = arr.slice(14).reduce((acc, curr) => {
    acc.value += curr.value;
    return acc;
   }, { name: "Others", value: 0 });
   return [...top10, others];
  };

  return {
   modules: toArr(modMap),
   organizations: processTop10(toArr(orgMap)),
   specialities: processTop10(toArr(specMap)),
   filteredData: filteredSet
  };
 }, [allOutstandingData, activeFilter]);

 if (loading) {
  return <DashboardSkeleton />;
 }

 const handlePieClick = (type, entry) => {
  // If clicking "Others", do not filter as it's an aggregation
  if (entry.name === "Others") return;

  setActiveFilter(prev => {
   if (prev.type === type && prev.value === entry.name) return { type: null, value: null };
   return { type, value: entry.name };
  });
  setPage(0);

  // Scroll down to the grid smoothly after a short delay to allow React to update
  setTimeout(() => {
   gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
 };

 const clearFilter = () => {
  setActiveFilter({ type: null, value: null });
  setPage(0);
 };

 const renderPieChartCard = (title, data, type) => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  const topData = data.slice(0, 3);

  return (
   <Paper elevation={0} sx={{ ...CARD_STYLE, display: "flex", flexDirection: "column" }}>
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
     <Typography sx={{ fontWeight: 800, fontSize: { xs: '0.75rem', xl: '0.85rem' }, color: "#1e293b", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</Typography>
    </Box>
    <Box sx={{ width: "100%", height: 180, position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
     {data.length > 0 ? (
      <Box sx={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'space-between', px: { xs: 0, sm: 1 } }}>
       <Box sx={{ flexShrink: 0 }}>
        <PieChart width={130} height={130}>
         <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={60}
          innerRadius={0}
          dataKey="value"
          nameKey="name"
          onClick={(entry) => handlePieClick(type, entry)}
          style={{ cursor: "pointer", outline: "none" }}
          stroke="#fff"
          strokeWidth={2}
         >
          {data.map((entry, index) => (
           <Cell
            key={`cell-${index}`}
            fill={PIE_COLORS[index % PIE_COLORS.length]}
            style={{
             opacity: (activeFilter.type === type && activeFilter.value !== entry.name) ? 0.3 : 1,
             transition: "opacity 0.3s"
            }}
           />
          ))}
         </Pie>
         <RechartsTooltip content={<CustomTooltip />} />
        </PieChart>
       </Box>

       <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, ml: { xs: 1, sm: 2 }, gap: 1, justifyContent: 'center', overflow: 'hidden' }}>
        <Box>
         <Typography sx={{ fontSize: { xs: '0.55rem', xl: '0.65rem' }, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Amount</Typography>
         <Typography sx={{ fontSize: { xs: '0.8rem', xl: '1rem' }, color: '#0f172a', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{formatFullINR(total)}</Typography>
        </Box>
        {topData.length > 0 && (
         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
          {topData.map((d, i) => (
           <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', pb: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, maxWidth: '70%' }}>
             <Box sx={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, bgcolor: PIE_COLORS[data.findIndex(item => item.name === d.name) % PIE_COLORS.length] }} />
             <Typography sx={{ fontSize: { xs: '0.55rem', xl: '0.65rem' }, color: '#475569', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {d.name}
             </Typography>
            </Box>
            <Typography sx={{ fontSize: { xs: '0.55rem', xl: '0.65rem' }, color: '#334155', fontWeight: 800, whiteSpace: 'nowrap' }}>
             {total > 0 ? ((d.value / total) * 100).toFixed(1) : 0}%
            </Typography>
           </Box>
          ))}
         </Box>
        )}
       </Box>
      </Box>
     ) : (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#94a3b8" }}>
       No data available
      </Box>
     )}
    </Box>
    <Box sx={{ mt: 'auto', borderTop: '1px solid #f1f5f9', pt: 1 }}>
     <ScrollableLegend data={data} activeFilter={activeFilter} type={type} handlePieClick={handlePieClick} />
    </Box>
   </Paper>
  );
 };

 const columns = [
  { id: "date", label: "Bill Date" },
  { id: "organization", label: "Organization" },
  { id: "uhid", label: "UHID" },
  { id: "reg no", label: "Reg No" },
  { id: "billno", label: "Bill No" },
  { id: "patientname", label: "Patient Name" },
  { id: "consultantname", label: "Consultant Name" },
  { id: "module", label: "Module" },
  { id: "billamount", label: "Bill Amount" },
  { id: "receiptamt", label: "Receipt Amount" },
  { id: "adjust_patient_receipt", label: "Adjust From Patient Receipt" },
  { id: "adjusted_tds", label: "Adjusted TDS" },
 ];

 const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

 return (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2, pb: 4 }}>
   <style>{`
        .recharts-wrapper, .recharts-surface, .recharts-pie-sector, path, svg { outline: none !important; -webkit-tap-highlight-color: transparent !important; }
      `}</style>

   {/* ─── 3 Pie Charts ─── */}
   <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 2 }}>
    {renderPieChartCard("Module Wise Outstanding", modules, "module")}
    {renderPieChartCard("Organization Wise Outstanding", organizations, "organization")}
    {renderPieChartCard("Speciality Wise Outstanding", specialities, "speciality")}
   </Box>

   {/* ─── Data Grid ─── */}
   <Paper ref={gridRef} elevation={0} sx={{ ...CARD_STYLE, mt: 1, p: 0, display: "flex", flexDirection: "column" }}>
    <Box sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1, borderBottom: "1px solid #f1f5f9" }}>
     <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", color: "#0f172a" }}>Outstanding Details</Typography>
     {activeFilter.type && (
      <Chip
       label={`${activeFilter.type.charAt(0).toUpperCase() + activeFilter.type.slice(1)}: ${activeFilter.value}`}
       onDelete={clearFilter}
       deleteIcon={<CloseIcon />}
       sx={{ bgcolor: "#e0f2fe", color: "#0369a1", fontWeight: 700, borderRadius: "8px" }}
      />
     )}
    </Box>

    <TableContainer sx={{ maxHeight: 500, borderBottom: "1px solid #f1f5f9" }}>
     <Table stickyHeader size="small" aria-label="outstanding data table">
      <TableHead>
       <TableRow>
        {columns.map((column) => (
         <TableCell
          key={column.id}
          sx={{
           fontWeight: 700,
           bgcolor: "#1e293b",
           color: "#ffffff",
           fontSize: "0.75rem",
           whiteSpace: "nowrap",
           borderBottom: "none",
          }}
         >
          {column.label}
         </TableCell>
        ))}
       </TableRow>
      </TableHead>
      <TableBody>
       {paginatedData.length > 0 ? (
        paginatedData.map((row, index) => (
         <TableRow hover key={index} sx={{ "&:nth-of-type(even)": { bgcolor: "#f8fafc" }, "& td": { borderBottom: "1px solid #f1f5f9" } }}>
          {columns.map((column) => {
           let value = row[column.id] || row[column.id.charAt(0).toUpperCase() + column.id.slice(1)];

           if (column.id === "patientname") value = getStr(row, "patientname", "Patient Name", "patient");
           if (column.id === "consultantname") value = getStr(row, "consultantname", "Consultant");
           if (column.id === "organization") value = getStr(row, "organization", "Organization", "org");
           if (column.id === "module") value = getStr(row, "module", "Module");
           if (column.id === "uhid") value = getStr(row, "uhid", "UHID NO", "UHID");
           if (column.id === "reg no") value = getStr(row, "reg no", "Registration No");
           if (column.id === "billno") value = getStr(row, "billno", "Bill No");

           if (column.id === "receiptamt") value = getNum(row, "receiptamt", "Receipt Amount", "Receipt Amt");
           if (column.id === "billamount") value = getNum(row, "billamount", "Bill Amount");
           if (column.id === "adjust_patient_receipt") value = 0;
           if (column.id === "adjusted_tds") value = 0;

           if (column.id === "date") {
            const dStr = getStr(row, "date", "Bill Date", "bill_date");
            if (dStr && dStr !== "—") {
             const d = new Date(dStr);
             if (!isNaN(d)) {
              value = d.toLocaleDateString("en-IN", { day: '2-digit', month: '2-digit', year: 'numeric' });
             } else {
              value = "—";
             }
            } else {
             value = "—";
            }
           }

           if (["billamount", "receiptamt", "adjust_patient_receipt", "adjusted_tds"].includes(column.id)) {
            value = (typeof value === "number" || !isNaN(Number(value))) ? Number(value).toLocaleString("en-IN") : "0";
           }

           return (
            <TableCell key={column.id} sx={{ fontSize: "0.75rem", color: "#334155", whiteSpace: "nowrap" }}>
             {value || "—"}
            </TableCell>
           );
          })}
         </TableRow>
        ))
       ) : (
        <TableRow>
         <TableCell colSpan={columns.length} sx={{ textAlign: "center", py: 4, color: "#64748b", fontWeight: 600 }}>
          No records found
         </TableCell>
        </TableRow>
       )}
      </TableBody>
     </Table>
    </TableContainer>
    <TablePagination
     rowsPerPageOptions={[10, 25, 50, 100]}
     component="div"
     count={filteredData.length}
     rowsPerPage={rowsPerPage}
     page={page}
     onPageChange={(e, newPage) => setPage(newPage)}
     onRowsPerPageChange={(e) => {
      setRowsPerPage(parseInt(e.target.value, 10));
      setPage(0);
     }}
     sx={{
      bgcolor: "#f8fbff",
      borderTop: "none",
      "& .MuiTablePagination-toolbar": { minHeight: 48 },
     }}
    />
   </Paper>
  </Box>
 );
};

export default React.memo(MISOutstandingDashboard);
