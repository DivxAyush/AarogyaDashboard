import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Box, Typography, IconButton, Chip, Tabs, Tab, Select, MenuItem, FormControl } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "../../../../layouts/DashboardLayout";
import DashboardFilterBar from "../../../../layouts/DashboardFilterBar";
import GraphWiseDetail from "./GraphWiseDetail";
import MISCollectionDashboard from "./MISCollectionDashboard";
import MISCollectionAnalysis from "./MISCollectionAnalysis";
import MISRevenueDashboard from "./MISRevenueDashboard";
import MISRevenueAnalysis from "./MISRevenueAnalysis";
import MISOutstandingDashboard from "./MISOutstandingDashboard";
import MISOutstandingAnalysis from "./MISOutstandingAnalysis";
import { useData } from "../../../../context/DataContext";

const toLocalISODate = (d) => {
 const y = d.getFullYear();
 const m = String(d.getMonth() + 1).padStart(2, "0");
 const day = String(d.getDate()).padStart(2, "0");
 return `${y}-${m}-${day}`;
};

 const GraphDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { section = "collection", cardTitle = "Collection Analytics", filterModule } = location.state || {};

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const initialTab = filterModule ? `${filterModule.toUpperCase()} Dashboard` : "Home Dashboard";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [collectionSubTab, setCollectionSubTab] = useState(0);
  const [revenueSubTab, setRevenueSubTab] = useState(0);
  const [outstandingSubTab, setOutstandingSubTab] = useState(0);
  const { filters, handleFilterChange, siteCodes, specialities, allCollectionData, allCollectionLoading, allRevenueData, allRevenueLoading,
   allOutstandingData, allOutstandingLoading, } = useData();

  const filteredCollectionData = useMemo(() => {
    if (!filterModule) return allCollectionData;
    return allCollectionData?.filter(r => {
      const mod = (r.module || r.Module)?.toUpperCase();
      if (filterModule.toUpperCase() === "IPD") {
        return mod === "IPD / EMERGENCY (ADVANCE)" || mod === "IPD / EMERGENCY (DISCHARGE)";
      }
      return mod === filterModule.toUpperCase();
    }) || [];
  }, [allCollectionData, filterModule]);

  const filteredRevenueData = useMemo(() => {
    if (!filterModule) return allRevenueData;
    return allRevenueData?.filter(r => (r.module || r.Module)?.toUpperCase() === filterModule.toUpperCase()) || [];
  }, [allRevenueData, filterModule]);

  const filteredOutstandingData = useMemo(() => {
    if (!filterModule) return allOutstandingData;
    return allOutstandingData?.filter(r => (r.module || r.Module)?.toUpperCase() === filterModule.toUpperCase()) || [];
  }, [allOutstandingData, filterModule]);

  const stats = useMemo(() => {
   const netCollection = (filteredCollectionData || []).reduce((a, r) => a + Number(r["Receipt Amount"] || 0), 0);
   const grossCollection = (filteredCollectionData || []).reduce((a, r) => a + Number(r.collection || r.Collection || 0), 0);
   const refund = (filteredCollectionData || []).reduce((a, r) => a + Number(r.refund || r.Refund || 0), 0);
   const revenue = (filteredRevenueData || []).reduce((a, r) => a + Number(r.oh_amt_net || 0), 0);
   const grossRevenue = (filteredRevenueData || []).reduce((a, r) => a + Number(r.grossamount || 0), 0);
   const discount = (filteredRevenueData || []).reduce((a, r) => a + Number(r.discount || r.Discount || 0), 0);
   const outstanding = (filteredOutstandingData || []).reduce((a, r) => a + Number(r.outstanding || r.Outstanding || r.balance || r.Balance || 0), 0);
   const cashPatientOutstanding = (filteredOutstandingData || []).reduce((a, r) => {
    const isCash = (r.organization || r.Organization || "").toLowerCase() === "cash patient";
    return isCash ? a + Number(r.outstanding || r.Outstanding || r.balance || r.Balance || 0) : a;
   }, 0);
   const orgOutstanding = outstanding - cashPatientOutstanding;
   return { netCollection, grossCollection, refund, revenue, grossRevenue, discount, outstanding, cashPatientOutstanding, orgOutstanding };
  }, [filteredCollectionData, filteredRevenueData, filteredOutstandingData]);

  const loading = allCollectionLoading || allRevenueLoading || allOutstandingLoading;

  const sectionLabel = section === "collection" ? "Collection" : section === "revenue" ? "Revenue" : "Outstanding";
  const sectionColor = section === "collection" ? "#3b82f6" : section === "revenue" ? "#10b981" : "#f59e0b";

  return (
   <DashboardLayout>
    <DashboardFilterBar
     filters={filters}
     onChange={handleFilterChange}
     activeTab={activeTab}
     onTabChange={(tab) => {
      setActiveTab(tab);
      if (tab !== "Home Dashboard" && tab !== `${filterModule?.toUpperCase() || ''} Dashboard`) {
          navigate("/", { state: { defaultTab: tab } });
      } else {
          navigate("/", { state: { defaultTab: tab } });
      }
     }}
     siteCodes={siteCodes}
     specialities={specialities}
    />

    <Box sx={{ animation: "fadeIn 0.3s ease-in-out", "@keyframes fadeIn": { "0%": { opacity: 0 }, "100%": { opacity: 1 } } }}>
     <Box sx={{
      display: "flex", alignItems: "center", gap: 1.5, mb: 2, mt: 1,
      px: { xs: 1.5, md: 2.5 }, py: { xs: 1, md: 1.5 }, borderRadius: "14px",
      background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)",
      border: "1px solid rgba(255,255,255,0.7)",
      boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      overflowX: "auto",
     }}>
      <IconButton
       onClick={() => navigate("/", { state: { defaultTab: activeTab } })}
       sx={{
        bgcolor: `${sectionColor}12`, color: sectionColor,
        "&:hover": { bgcolor: `${sectionColor}22` },
       }}
      >
       <ArrowBackIcon />
      </IconButton>
      <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>

       <Box sx={{ display: { xs: "none", md: "block" } }}>
        <Typography sx={{ fontWeight: 800, fontSize: { md: "1.1rem" }, color: "#0f172a", lineHeight: 1.2 }}>
         {cardTitle}
        </Typography>
        <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8" }}>
         Detailed graph analytics and drill-down insights
        </Typography>
       </Box>

       {section === "collection" ? (
        <>
         {/* Desktop Tabs */}
         <Box sx={{ display: { xs: "none", md: "flex" }, p: 0.5, bgcolor: "#f1f5f9", borderRadius: "10px", gap: 0.5, border: "1px solid #e2e8f0" }}>
          {["MIS Front Office Collection", "Analysis"].map((label, idx) => (
           <Box
            key={idx}
            onClick={() => setCollectionSubTab(idx)}
            sx={{
             px: 2.5,
             py: 0.75,
             fontSize: "0.8rem",
             fontWeight: collectionSubTab === idx ? 800 : 600,
             color: collectionSubTab === idx ? "#0f172a" : "#64748b",
             bgcolor: collectionSubTab === idx ? "#ffffff" : "transparent",
             borderRadius: "8px",
             cursor: "pointer",
             boxShadow: collectionSubTab === idx ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
             transition: "all 0.2s ease",
             whiteSpace: "nowrap"
            }}
           >
            {label}
           </Box>
          ))}
         </Box>
         {/* Mobile Dropdown */}
         <FormControl sx={{ display: { xs: "block", md: "none" }, minWidth: 220 }} size="small">
          <Select
           value={collectionSubTab}
           onChange={(e) => setCollectionSubTab(e.target.value)}
           sx={{
            fontSize: "0.8rem",
            fontWeight: 700,
            color: "#0f172a",
            bgcolor: "#f1f5f9",
            borderRadius: "8px",
            height: 36,
            "& .MuiOutlinedInput-notchedOutline": { border: "1px solid #e2e8f0" }
           }}
          >
           <MenuItem value={0} sx={{ fontSize: "0.8rem", fontWeight: 600 }}>MIS Front Office Collection</MenuItem>
           <MenuItem value={1} sx={{ fontSize: "0.8rem", fontWeight: 600 }}>Analysis</MenuItem>
          </Select>
         </FormControl>
        </>
       ) : section === "revenue" ? (
        <>
         {/* Desktop Tabs */}
         <Box sx={{ display: { xs: "none", md: "flex" }, p: 0.5, bgcolor: "#f1f5f9", borderRadius: "10px", gap: 0.5, border: "1px solid #e2e8f0" }}>
          {["MIS Revenue Analytics", "Analysis"].map((label, idx) => (
           <Box
            key={idx}
            onClick={() => setRevenueSubTab(idx)}
            sx={{
             px: 2.5,
             py: 0.75,
             fontSize: "0.8rem",
             fontWeight: revenueSubTab === idx ? 800 : 600,
             color: revenueSubTab === idx ? "#0f172a" : "#64748b",
             bgcolor: revenueSubTab === idx ? "#ffffff" : "transparent",
             borderRadius: "8px",
             cursor: "pointer",
             boxShadow: revenueSubTab === idx ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
             transition: "all 0.2s ease",
             whiteSpace: "nowrap"
            }}
           >
            {label}
           </Box>
          ))}
         </Box>
         {/* Mobile Dropdown */}
         <FormControl sx={{ display: { xs: "block", md: "none" }, minWidth: 220 }} size="small">
          <Select
           value={revenueSubTab}
           onChange={(e) => setRevenueSubTab(e.target.value)}
           sx={{
            fontSize: "0.8rem",
            fontWeight: 700,
            color: "#0f172a",
            bgcolor: "#f1f5f9",
            borderRadius: "8px",
            height: 36,
            "& .MuiOutlinedInput-notchedOutline": { border: "1px solid #e2e8f0" }
           }}
          >
           <MenuItem value={0} sx={{ fontSize: "0.8rem", fontWeight: 600 }}>MIS Revenue Analytics</MenuItem>
           <MenuItem value={1} sx={{ fontSize: "0.8rem", fontWeight: 600 }}>Analysis</MenuItem>
          </Select>
         </FormControl>
        </>
       ) : section === "outstanding" ? (
        <>
         {/* Desktop Tabs */}
         <Box sx={{ display: { xs: "none", md: "flex" }, p: 0.5, bgcolor: "#f1f5f9", borderRadius: "10px", gap: 0.5, border: "1px solid #e2e8f0" }}>
          {["MIS Outstanding Analytics", "Analysis"].map((label, idx) => (
           <Box
            key={idx}
            onClick={() => setOutstandingSubTab(idx)}
            sx={{
             px: 2.5,
             py: 0.75,
             fontSize: "0.8rem",
             fontWeight: outstandingSubTab === idx ? 800 : 600,
             color: outstandingSubTab === idx ? "#0f172a" : "#64748b",
             bgcolor: outstandingSubTab === idx ? "#ffffff" : "transparent",
             borderRadius: "8px",
             cursor: "pointer",
             boxShadow: outstandingSubTab === idx ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
             transition: "all 0.2s ease",
             whiteSpace: "nowrap"
            }}
           >
            {label}
           </Box>
          ))}
         </Box>
         {/* Mobile Dropdown */}
         <FormControl sx={{ display: { xs: "block", md: "none" }, minWidth: 220 }} size="small">
          <Select
           value={outstandingSubTab}
           onChange={(e) => setOutstandingSubTab(e.target.value)}
           sx={{
            fontSize: "0.8rem",
            fontWeight: 700,
            color: "#0f172a",
            bgcolor: "#f1f5f9",
            borderRadius: "8px",
            height: 36,
            "& .MuiOutlinedInput-notchedOutline": { border: "1px solid #e2e8f0" }
           }}
          >
           <MenuItem value={0} sx={{ fontSize: "0.8rem", fontWeight: 600 }}>MIS Outstanding Analytics</MenuItem>
           <MenuItem value={1} sx={{ fontSize: "0.8rem", fontWeight: 600 }}>Analysis</MenuItem>
          </Select>
         </FormControl>
        </>
       ) : (
        <Chip
         label={sectionLabel}
         size="small"
         sx={{
          fontWeight: 700, fontSize: "0.72rem",
          bgcolor: `${sectionColor}15`, color: sectionColor,
          border: `1px solid ${sectionColor}30`,
         }}
        />
       )}
      </Box>
     </Box>

     {section === "collection" ? (
      <>
       {collectionSubTab === 0 ? (
        <MISCollectionDashboard
         allCollectionData={filteredCollectionData}
         loading={loading}
        />
       ) : (
        <MISCollectionAnalysis
         allCollectionData={filteredCollectionData}
         loading={loading}
        />
       )}
      </>
     ) : section === "revenue" ? (
      <>
       {revenueSubTab === 0 ? (
        <MISRevenueDashboard
         allRevenueData={filteredRevenueData}
         loading={loading}
        />
       ) : (
        <MISRevenueAnalysis
         allRevenueData={filteredRevenueData}
         loading={loading}
        />
       )}
      </>
     ) : section === "outstanding" ? (
      <>
       {outstandingSubTab === 0 ? (
        <MISOutstandingDashboard
         allOutstandingData={filteredOutstandingData}
         loading={loading}
        />
       ) : (
        <MISOutstandingAnalysis
         allOutstandingData={filteredOutstandingData}
         loading={loading}
        />
       )}
      </>
     ) : (
      <GraphWiseDetail
       stats={stats}
       allCollectionData={filteredCollectionData}
       allRevenueData={filteredRevenueData}
       allOutstandingData={filteredOutstandingData}
       loading={loading}
       activeSection={section}
      />
     )}
    </Box>
   </DashboardLayout>
  );
 };

export default GraphDetailPage;
