import React, { createContext, useState, useEffect, useCallback, useContext } from "react";
import { getDistinctValues, getAllCollectionData, getAllRevenueData, getAllOutstandingData, getOpdPatientStats, getOpdFinancialStats, getIpdPatientStats, getIpdOccupancyStats } from "../api/api_fun";

export const DataContext = createContext();

export const useData = () => {
  return useContext(DataContext);
};

export const DataProvider = ({ children }) => {
  // ─── Filter State ───
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const firstDayOfMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;
  
  const [filters, setFilters] = useState({
    date: { from: firstDayOfMonthStr, to: todayStr, preset: "mtd" },
    dashboard: "",
    speciality: "",
    siteCode: "",
  });

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  // ─── Dropdown Options State ───
  const [siteCodes, setSiteCodes] = useState([]);
  const [specialities, setSpecialities] = useState([]);

  // ─── Global Data State ───
  const [allCollectionData, setAllCollectionData] = useState([]);
  const [allCollectionLoading, setAllCollectionLoading] = useState(true);

  const [allRevenueData, setAllRevenueData] = useState([]);
  const [allRevenueLoading, setAllRevenueLoading] = useState(true);

  const [allOutstandingData, setAllOutstandingData] = useState([]);
  const [allOutstandingLoading, setAllOutstandingLoading] = useState(true);

  const [opdPatientData, setOpdPatientData] = useState([]);
  const [opdFinancialData, setOpdFinancialData] = useState([]);
  const [opdStatsLoading, setOpdStatsLoading] = useState(true);

  const [ipdPatientData, setIpdPatientData] = useState([]);
  const [ipdOccupancyData, setIpdOccupancyData] = useState([]);
  const [ipdStatsLoading, setIpdStatsLoading] = useState(true);

  // ─── Fetch Dropdown Options on Mount ───
  useEffect(() => {
    // ID 1 is vw_collection
    getDistinctValues(1, "site_code")
      .then((res) => {
        if (res && res.length > 0) {
          const codes = res.map((row) => row.site_code || row.sit_code).filter(Boolean);
          setSiteCodes([...new Set(codes)]);
        }
      })
      .catch((err) => console.error("Failed to fetch site codes:", err));

    getDistinctValues(1, "speciality")
      .then((res) => {
        if (res && res.length > 0) {
          const specs = res.map((row) => row.speciality).filter(Boolean);
          setSpecialities([...new Set(specs)]);
        }
      })
      .catch((err) => console.error("Failed to fetch specialities:", err));
  }, []);

  // ─── Fetch Data Whenever Filters Change ───
  useEffect(() => {
    setAllCollectionLoading(true);
    setAllRevenueLoading(true);
    setAllOutstandingLoading(true);
    setOpdStatsLoading(true);
    setIpdStatsLoading(true);

    getAllCollectionData(filters)
      .then((res) => {
        setAllCollectionData(res || []);
        setAllCollectionLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch all collection data:", err);
        setAllCollectionLoading(false);
      });

    getAllRevenueData(filters)
      .then((res) => {
        setAllRevenueData(res || []);
        setAllRevenueLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch all revenue data:", err);
        setAllRevenueLoading(false);
      });

    getAllOutstandingData(filters)
      .then((res) => {
        setAllOutstandingData(res || []);
        setAllOutstandingLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch all outstanding data:", err);
        setAllOutstandingLoading(false);
      });

    Promise.all([
      getOpdPatientStats(filters).then(res => setOpdPatientData(res || [])).catch(console.error),
      getOpdFinancialStats(filters).then(res => setOpdFinancialData(res || [])).catch(console.error)
    ]).finally(() => setOpdStatsLoading(false));

    Promise.all([
      getIpdPatientStats(filters).then(res => setIpdPatientData(res || [])).catch(console.error),
      getIpdOccupancyStats(filters).then(res => setIpdOccupancyData(res || [])).catch(console.error)
    ]).finally(() => setIpdStatsLoading(false));

  }, [filters]);

  const value = {
    filters,
    handleFilterChange,
    siteCodes,
    specialities,
    allCollectionData,
    allCollectionLoading,
    allRevenueData,
    allRevenueLoading,
    allOutstandingData,
    allOutstandingLoading,
    opdPatientData,
    opdFinancialData,
    opdStatsLoading,
    ipdPatientData,
    ipdOccupancyData,
    ipdStatsLoading,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
