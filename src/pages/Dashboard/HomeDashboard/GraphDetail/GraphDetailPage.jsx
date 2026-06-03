import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Box, Typography, IconButton, Chip } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "../../../../layouts/DashboardLayout";
import DashboardFilterBar from "../../../../layouts/DashboardFilterBar";
import GraphWiseDetail from "./GraphWiseDetail";
import { getAllCollectionData, getAllRevenueData, getAllOutstandingData } from "../../../../api/api_fun";

const toLocalISODate = (d) => {
 const y = d.getFullYear();
 const m = String(d.getMonth() + 1).padStart(2, "0");
 const day = String(d.getDate()).padStart(2, "0");
 return `${y}-${m}-${day}`;
};

const GraphDetailPage = () => {
 const navigate = useNavigate();
 const location = useLocation();
 const { section = "collection", cardTitle = "Collection Analytics" } = location.state || {};

 const [activeTab, setActiveTab] = useState("Home Dashboard");
 const today = toLocalISODate(new Date());
 const [filters, setFilters] = useState({ date: { from: today, to: today, preset: "today" }, speciality: "", siteCode: "" });

 const [allCollectionData, setAllCollectionData] = useState([]);
 const [allCollectionLoading, setAllCollectionLoading] = useState(true);
 const [allRevenueData, setAllRevenueData] = useState([]);
 const [allRevenueLoading, setAllRevenueLoading] = useState(true);
 const [allOutstandingData, setAllOutstandingData] = useState([]);
 const [allOutstandingLoading, setAllOutstandingLoading] = useState(true);

 const [siteCodes, setSiteCodes] = useState([]);
 const [specialities, setSpecialities] = useState([]);

 const handleFilterChange = useCallback((newFilters) => setFilters(newFilters), []);

 useEffect(() => {
  setAllCollectionLoading(true);
  setAllRevenueLoading(true);
  setAllOutstandingLoading(true);

  getAllCollectionData(filters)
   .then((res) => {
    setAllCollectionData(res || []);
    const sites = [...new Set((res || []).map(r => r.site_code || r.sit_code).filter(Boolean))];
    const specs = [...new Set((res || []).map(r => r.speciality).filter(Boolean))];
    setSiteCodes(sites);
    setSpecialities(specs);
    setAllCollectionLoading(false);
   })
   .catch(() => setAllCollectionLoading(false));

  getAllRevenueData(filters)
   .then((res) => { setAllRevenueData(res || []); setAllRevenueLoading(false); })
   .catch(() => setAllRevenueLoading(false));

  getAllOutstandingData(filters)
   .then((res) => { setAllOutstandingData(res || []); setAllOutstandingLoading(false); })
   .catch(() => setAllOutstandingLoading(false));
 }, [filters]);

 const stats = useMemo(() => {
  const netCollection = (allCollectionData || []).reduce((a, r) => a + Number(r["Receipt Amount"] || 0), 0);
  const grossCollection = (allCollectionData || []).reduce((a, r) => a + Number(r.collection || r.Collection || 0), 0);
  const refund = (allCollectionData || []).reduce((a, r) => a + Number(r.refund || r.Refund || 0), 0);
  const revenue = (allRevenueData || []).reduce((a, r) => a + Number(r.oh_amt_net || 0), 0);
  const grossRevenue = (allRevenueData || []).reduce((a, r) => a + Number(r.grossamount || 0), 0);
  const discount = (allRevenueData || []).reduce((a, r) => a + Number(r.discount || r.Discount || 0), 0);
  const outstanding = (allOutstandingData || []).reduce((a, r) => a + Number(r.outstanding || r.Outstanding || r.balance || r.Balance || 0), 0);
  const cashPatientOutstanding = (allOutstandingData || []).reduce((a, r) => {
   const isCash = (r.organization || r.Organization || "").toLowerCase() === "cash patient";
   return isCash ? a + Number(r.outstanding || r.Outstanding || r.balance || r.Balance || 0) : a;
  }, 0);
  const orgOutstanding = outstanding - cashPatientOutstanding;
  return { netCollection, grossCollection, refund, revenue, grossRevenue, discount, outstanding, cashPatientOutstanding, orgOutstanding };
 }, [allCollectionData, allRevenueData, allOutstandingData]);

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
     if (tab !== "Home Dashboard") navigate("/");
    }}
    siteCodes={siteCodes}
    specialities={specialities}
   />

   <Box sx={{ animation: "fadeIn 0.3s ease-in-out", "@keyframes fadeIn": { "0%": { opacity: 0 }, "100%": { opacity: 1 } } }}>
    <Box sx={{
     display: "flex", alignItems: "center", gap: 1.5, mb: 2, mt: 1,
     px: 2.5, py: 1.5, borderRadius: "14px",
     background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)",
     border: "1px solid rgba(255,255,255,0.7)",
     boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
    }}>
     <IconButton
      onClick={() => navigate(-1)}
      sx={{
       bgcolor: `${sectionColor}12`, color: sectionColor,
       "&:hover": { bgcolor: `${sectionColor}22` },
      }}
     >
      <ArrowBackIcon />
     </IconButton>
     <Box sx={{ flex: 1 }}>
      <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", color: "#0f172a", lineHeight: 1.2 }}>
       {cardTitle}
      </Typography>
      <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8" }}>
       Detailed graph analytics and drill-down insights
      </Typography>
     </Box>
     <Chip
      label={sectionLabel}
      size="small"
      sx={{
       fontWeight: 700, fontSize: "0.72rem",
       bgcolor: `${sectionColor}15`, color: sectionColor,
       border: `1px solid ${sectionColor}30`,
      }}
     />
    </Box>

    <GraphWiseDetail
     stats={stats}
     allCollectionData={allCollectionData}
     allRevenueData={allRevenueData}
     allOutstandingData={allOutstandingData}
     loading={loading}
     activeSection={section}
    />
   </Box>
  </DashboardLayout>
 );
};

export default GraphDetailPage;
