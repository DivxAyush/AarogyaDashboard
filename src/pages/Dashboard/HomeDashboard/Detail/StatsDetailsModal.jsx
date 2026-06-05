import React, { useState, useCallback, useMemo } from "react";
import { exportToExcel } from "../../../../utils/helper";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Chip,
  CircularProgress,
  InputAdornment,
  Divider,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
import FilterListIcon from "@mui/icons-material/FilterList";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import { ROWS_PER_PAGE_OPTIONS } from "../../../../utils/constants";

// ─────────────────────────────────────────────
// StatsDetailsModal — Drilldown Data Table with Tabs
// Search | Pagination | CSV Export
// ─────────────────────────────────────────────

const LABEL_MAP = {
  "date": "Receipt Date",
  "site_code": "Site",
  "sit_code": "Site",
  "UHID NO": "UHID No",
  "uhid": "UHID No",
  "Registration No": "Registration No",
  "reg no": "Registration No",
  "Receipt No": "Receipt No",
  "billno": "Bill No",
  "Patient Name": "Patient Name",
  "patientname": "Patient Name",
  "Consultant": "Consultant",
  "consultantname": "Consultant",
  "speciality": "Speciality",
  "Module": "Module",
  "module": "Module",
  "category": "Category",
  "Organization": "Organization",
  "organization": "Organization",
  "Receipt Amount": "Net Amt",
  "receiptamt": "Net Amt",
  "billamount": "Bill Amt",
  "netsettledamt": "Net Settled",
  "oh_amt_net": "Net Revenue",
  "grossamount": "Gross Revenue",
  "discount": "Discount",
  "collection": "Collection",
  "refund": "Refund",
  "balance": "Balance",
  "Payment Mode": "Pay Mode",
  "paymode": "Pay Mode",
  "username": "User",
};

const IGNORE_KEYS = ["tenantid", "year", "monthnumber", "monthname", "monthlabel", "financialyear", "finmonthnumber", "finquarternumber", "finmonthlabel"];

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "95vw", sm: "90vw", md: "85vw", lg: "80vw" },
  maxHeight: "90vh",
  bgcolor: "#ffffff",
  borderRadius: "20px",
  boxShadow: "0 24px 80px rgba(25,118,210,0.18)",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};

const StatsDetailsModal = ({ open, onClose, data, loading, type, activeTab, title, showTotals }) => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isExporting, setIsExporting] = useState(false);

  const handleSearchChange = useCallback((e) => {
    setSearch(e.target.value);
    setPage(0);
  }, []);

  const handleChangePage = useCallback((_, newPage) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  }, []);

  const columns = useMemo(() => {
    if (!data || data.length === 0) return [];
    const firstRow = data[0];
    return Object.keys(firstRow)
      .filter(key => !IGNORE_KEYS.includes(key.toLowerCase()) && !key.startsWith("_"))
      .map(key => ({
        id: key,
        label: LABEL_MAP[key] || (key.charAt(0).toUpperCase() + key.slice(1))
      }));
  }, [data]);

  const tabs = useMemo(() => {
    if (type === "patient") return ["New Visited", "Revisit"];
    if (type === "financial") return ["Booked", "Postponed", "Cancelled"];
    if (type === "ipd") return ["New Admission", "Direct", "Via OPD", "Advance Booking", "Emergency"];
    return [];
  }, [type]);

  const [currentTab, setCurrentTab] = useState(activeTab || tabs[0]);

  React.useEffect(() => {
    if (open) setCurrentTab(activeTab || tabs[0]);
  }, [open, activeTab, tabs]);

  const tabFilteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    if (tabs.length === 0) return data; // No tabs = no tab filtering

    return data.filter(row => {
      if (type === "patient") {
        const f = row.freshregistration || row.Freshregistration || row.FRESHREGISTRATION;
        if (currentTab === "New Visited") return f === "Fresh";
        if (currentTab === "Revisit") return f === "Revisit";
        return true;
      } else if (type === "financial") {
        if (currentTab === "Booked") return Number(row.booked || row.Booked || row.BOOKED) === 1;
        if (currentTab === "Cancelled") return Number(row.cancel || row.Cancel || row.CANCEL) === 1;
        if (currentTab === "Postponed") return Number(row.postpone || row.Postpone || row.POSTPONE) === 1;
        return true;
      } else if (type === "ipd") {
        if (currentTab === "New Admission") return !!row._regdocid;
        if (currentTab === "Direct") return row._oldcategory === null || row._oldcategory === "";
        if (currentTab === "Via OPD") return ["OPDPB", "OPD", "OPDIN"].includes(row._oldcategory);
        if (currentTab === "Advance Booking") return row._oldcategory === "ADVBK";
        if (currentTab === "Emergency") return row._oldcategory === "EMRG";
        return true;
      }
      return true;
    });
  }, [data, type, currentTab, tabs]);

  const filteredData = useMemo(() => {
    if (!tabFilteredData || tabFilteredData.length === 0) return [];
    if (!search.trim()) return tabFilteredData;
    const lowerSearch = search.toLowerCase();
    return tabFilteredData.filter(row =>
      Object.values(row).some(
        val => val && val.toString().toLowerCase().includes(lowerSearch)
      )
    );
  }, [tabFilteredData, search]);

  const totals = useMemo(() => {
    if (!showTotals || !filteredData || filteredData.length === 0) return null;
    const totalsRow = {};
    columns.forEach((col, idx) => {
      const isNumeric = filteredData.every(r => typeof r[col.id] === 'number' || (r[col.id] !== null && r[col.id] !== "" && !isNaN(Number(r[col.id]))));
      if (isNumeric && col.id !== 'tenantid' && col.id !== 'date') {
        totalsRow[col.id] = filteredData.reduce((acc, r) => acc + Number(r[col.id] || 0), 0);
      } else {
        totalsRow[col.id] = idx === 0 ? "Total" : "";
      }
    });
    return totalsRow;
  }, [showTotals, filteredData, columns]);

  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const handleExportXLSX = useCallback(() => {
    setIsExporting(true);
    setTimeout(() => {
      exportToExcel(filteredData, columns, `${type}_stats`, `${type}_${currentTab}`);
      setIsExporting(false);
    }, 100);
  }, [filteredData, columns, type, currentTab]);

  const handleClose = useCallback(() => {
    setSearch("");
    setPage(0);
    onClose();
  }, [onClose]);

  return (
    <Modal open={open} onClose={handleClose} closeAfterTransition>
      <Box sx={modalStyle}>
        {/* ── Header ── */}
        <Box
          sx={{
            px: 3,
            py: 3,
            bgcolor: "#ffffff",
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
            position: "relative",
            borderBottom: "1px solid #f1f5f9",
          }}
        >
          {/* Top Row: Icon + Title */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, position: "relative", zIndex: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "14px",
                background: "linear-gradient(135deg, #60a5fa, #3b82f6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
              }}
            >
              {type === "patient" ? <PersonAddAlt1Icon sx={{ color: "#fff", fontSize: 26 }} /> : <ReceiptOutlinedIcon sx={{ color: "#fff", fontSize: 26 }} />}
            </Box>
            <Box>
              <Typography variant="h5" sx={{ color: "#0f172a", fontWeight: 800, letterSpacing: "-0.5px", lineHeight: 1.2, fontSize: { xs: "1.2rem", sm: "1.5rem" } }}>
                {title || (type === "patient" ? "Patient Visit Details" : "Appointment Details")}
              </Typography>
            </Box>
          </Box>

          {/* ── Tabs / Filters ── */}
          {tabs.length > 0 && (
          <Box sx={{ display: "flex", gap: { xs: 1, sm: 1.5 }, mt: 3, flexWrap: "wrap", position: "relative", zIndex: 2 }}>
            {tabs.map(tab => (
              <Button
                key={tab}
                variant={currentTab === tab ? "contained" : "outlined"}
                onClick={() => { setCurrentTab(tab); setPage(0); }}
                sx={{
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: 700,
                  px: 2,
                  py: 0.5,
                  ...(currentTab === tab 
                    ? { background: "linear-gradient(135deg, #1565c0, #1976d2)", color: "#fff", boxShadow: "0 4px 12px rgba(25,118,210,0.3)" }
                    : { borderColor: "#cbd5e1", color: "#475569", "&:hover": { bgcolor: "#f1f5f9", borderColor: "#94a3b8" } }
                  )
                }}
              >
                {tab}
              </Button>
            ))}
          </Box>
          )}

          {/* Right Side: Generated Illustration — hidden on mobile */}
          <Box
            sx={{
              display: { xs: "none", sm: "block" },
              position: "absolute",
              right: 60,
              top: 0,
              bottom: 0,
              width: 250,
              backgroundImage: "url('/payment_modal_bg.png')",
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right center",
              mixBlendMode: "multiply",
            }}
          />

          <IconButton
            onClick={handleClose}
            sx={{
              color: "#64748b",
              position: "absolute",
              top: 12,
              right: 12,
              zIndex: 3
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* ── Toolbar ── */}
        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            py: 2,
            display: "flex",
            alignItems: "center",
            gap: { xs: 1, sm: 2 },
            flexWrap: { xs: "nowrap", sm: "wrap" },
            flexShrink: 0,
            bgcolor: "#ffffff",
          }}
        >
          <TextField
            size="small"
            placeholder="Search by UHID, Patient, Receipt No, Pay Mode..."
            value={search}
            onChange={handleSearchChange}
            sx={{
              flex: 1,
              minWidth: { xs: 0, sm: 250 },
              maxWidth: { xs: "none", sm: 400 },
              "& .MuiInputBase-input": {
                fontSize: "0.75rem",
              },
              "& .MuiInputBase-input::placeholder": {
                fontSize: "0.8rem",
                color: "#3b82f6",
                opacity: 1,
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: "#3b82f6" }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: "8px",
                bgcolor: "#fff",
                "& fieldset": { borderColor: "#e2e8f0" }
              },
            }}
          />

          <Typography variant="body2" sx={{ display: { xs: "none", sm: "block" }, color: "#64748b", ml: "auto", fontWeight: 500 }}>
            {filteredData.length} records
          </Typography>
          
          <Button
            variant="contained"
            size="small"
            startIcon={<DownloadIcon />}
            onClick={handleExportXLSX}
            disabled={!filteredData.length || loading}
            sx={{
              display: { xs: "none", sm: "flex" },
              borderRadius: "10px",
              background: "linear-gradient(135deg, #1565c0, #1976d2)",
              textTransform: "none",
              fontWeight: 600,
              px: 2.5,
            }}
          >
            Export Excel
          </Button>

          <IconButton
            onClick={handleExportXLSX}
            disabled={!filteredData.length || loading || isExporting}
            sx={{
              display: { xs: "flex", sm: "none" },
              background: "linear-gradient(135deg, #1565c0, #1976d2)",
              color: "#fff",
              borderRadius: "8px",
              width: 32,
              height: 32,
              "&:hover": { opacity: 0.9 },
              "&.Mui-disabled": { background: "#e2e8f0", color: "#94a3b8" }
            }}
          >
            {isExporting ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon fontSize="small" />}
          </IconButton>
        </Box>

        {/* ── Table ── */}
        <Box sx={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {loading ? (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", py: 8 }}>
              <CircularProgress sx={{ color: "#1976d2" }} />
            </Box>
          ) : filteredData.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="body1" sx={{ color: "#90a4ae", fontWeight: 500 }}>
                {data?.length === 0 ? "No records found." : "No results match your search or filter."}
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ flex: 1, overflow: "auto" }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    {columns.map((col) => (
                      <TableCell
                        key={col.id}
                        sx={{
                          fontWeight: 700,
                          color: "#3b82f6",
                          bgcolor: "#f8fafc",
                          whiteSpace: "nowrap",
                          fontSize: "0.75rem",
                          borderBottom: "none",
                          borderTop: "1px solid #f1f5f9",
                        }}
                      >
                        {col.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedData.map((row, idx) => (
                    <TableRow
                      key={idx}
                      hover
                      sx={{
                        "&:nth-of-type(even)": { bgcolor: "#f4f9ff" }, // Light blue for alternate rows
                        "& td": { borderBottom: "1px solid #f1f5f9" },
                        "&:hover": { bgcolor: "#eef5ff" },
                        transition: "background 0.15s",
                      }}
                    >
                      {columns.map((col) => {
                        let content = row[col.id] ?? "—";
                        let customStyle = { fontSize: "0.8rem", color: "#475569", whiteSpace: "nowrap" };

                        if (["collection", "Receipt Amount", "billamount", "netsettledamt", "oh_amt_net", "grossamount", "balance"].includes(col.id)) {
                          if (typeof row[col.id] === "number") {
                            content = `₹${row[col.id].toLocaleString("en-IN")}`;
                          }
                        } else if (["refund", "discount"].includes(col.id)) {
                          if (typeof row[col.id] === "number") {
                            content = `₹${row[col.id].toLocaleString("en-IN")}`;
                          }
                          customStyle.color = "#16a34a"; // Green for refund/discount
                          customStyle.fontWeight = 600;
                        } else if (col.id === "Payment Mode" || col.id === "paymode") {
                          content = (
                            <Chip
                              label={content}
                              size="small"
                              sx={{
                                bgcolor: "#dcfce7",
                                color: "#16a34a",
                                fontWeight: 700,
                                fontSize: "0.7rem",
                                height: 22,
                                borderRadius: "6px"
                              }}
                            />
                          );
                        } else if (col.id === "date") {
                          if (content !== "—") {
                            const d = new Date(content);
                            if (!isNaN(d)) {
                              content = d.toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' });
                            }
                          }
                        }

                        return (
                          <TableCell key={col.id} sx={customStyle}>
                            {content}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                  {totals && (
                    <TableRow>
                      {columns.map((col) => (
                        <TableCell 
                          key={`total-${col.id}`} 
                          sx={{ 
                            position: "sticky",
                            bottom: 0,
                            zIndex: 2,
                            bgcolor: "#f1f5f9",
                            fontWeight: 700, 
                            color: "#0f172a", 
                            fontSize: "0.85rem", 
                            borderTop: "2px solid #cbd5e1",
                            boxShadow: "0 -2px 10px rgba(0,0,0,0.05)"
                          }}
                        >
                          {totals[col.id]}
                        </TableCell>
                      ))}
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>

        {/* ── Pagination ── */}
        {!loading && filteredData.length > 0 && (
          <>
            <Divider />
            <TablePagination
              component="div"
              count={filteredData.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
              sx={{
                flexShrink: 0,
                bgcolor: "#f8fbff",
                "& .MuiTablePagination-toolbar": { minHeight: 48 },
                "& .MuiTablePagination-selectLabel": {
                  display: { xs: "none", sm: "block" },
                },
              }}
            />
          </>
        )}
      </Box>
    </Modal>
  );
};

export default React.memo(StatsDetailsModal);
