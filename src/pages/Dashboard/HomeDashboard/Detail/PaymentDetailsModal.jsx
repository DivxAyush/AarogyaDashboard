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
import { ROWS_PER_PAGE_OPTIONS } from "../../../../utils/constants";

// ─────────────────────────────────────────────
// PaymentDetailsModal — Drilldown Data Table
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

const PaymentDetailsModal = ({ open, onClose, data, loading, paymentMode }) => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
      .filter(key => !IGNORE_KEYS.includes(key.toLowerCase()))
      .map(key => ({
        id: key,
        label: LABEL_MAP[key] || (key.charAt(0).toUpperCase() + key.slice(1))
      }));
  }, [data]);

  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    if (!search.trim()) return data;
    const lower = search.toLowerCase();
    return data.filter((row) =>
      columns.some((col) =>
        String(row[col.id] ?? "").toLowerCase().includes(lower)
      )
    );
  }, [data, search, columns]);

  const totals = useMemo(() => {
    if (!data || data.length === 0) return { collection: 0, refund: 0, netAmt: 0 };
    return data.reduce((acc, row) => {
      acc.collection += Number(row["collection"] || row["Collection"] || 0); // Gross Collection
      acc.refund += Number(row["refund"] || row["Refund"] || 0); // Refund
      acc.netAmt += Number(row["Receipt Amount"] || row["receiptamt"] || 0); // Net Collection
      return acc;
    }, { collection: 0, refund: 0, netAmt: 0 });
  }, [data]);

  const summaryLabels = {
    gross: "Gross Collection",
    deduction: "Refund",
    net: "Net Collection"
  };

  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const handleExportXLSX = useCallback(() => {
    exportToExcel(filteredData, columns, "Collection Details", `payment_${paymentMode}`);
  }, [filteredData, columns, paymentMode]);

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
              <ReceiptOutlinedIcon sx={{ color: "#fff", fontSize: 26 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ color: "#0f172a", fontWeight: 800, letterSpacing: "-0.5px", lineHeight: 1.2 }}>
                Collection/Refund Details
              </Typography>
              {paymentMode && (
                <Chip
                  label={paymentMode}
                  size="small"
                  sx={{
                    mt: 0.5,
                    bgcolor: "#e0f2fe",
                    color: "#0369a1",
                    fontWeight: 700,
                    fontSize: "0.7rem",
                    borderRadius: "6px",
                  }}
                />
              )}
            </Box>
          </Box>

          {/* ── Summary Bar ── */}
          <Box sx={{ display: "flex", gap: { xs: 1.5, sm: 2 }, mt: 3, flexWrap: { xs: "wrap", sm: "nowrap" }, position: "relative", zIndex: 2 }}>
            <Box sx={{ flex: "1 1 0", p: 1.5, borderRadius: "12px", background: "linear-gradient(135deg, #eff6ff, #dbeafe)", border: "1px solid #bfdbfe", display: "flex", flexDirection: "column" }}>
              <Typography variant="caption" sx={{ color: "#3b82f6", fontWeight: 700, textTransform: "uppercase", fontSize: "0.65rem", letterSpacing: 0.5 }}>{summaryLabels.gross}</Typography>
              <Typography variant="h6" sx={{ color: "#1e3a8a", fontWeight: 800 }}>₹{totals.collection.toLocaleString("en-IN")}</Typography>
            </Box>
            <Box sx={{ flex: "1 1 0", p: 1.5, borderRadius: "12px", background: "linear-gradient(135deg, #f0fdf4, #dcfce7)", border: "1px solid #bbf7d0", display: "flex", flexDirection: "column" }}>
              <Typography variant="caption" sx={{ color: "#16a34a", fontWeight: 700, textTransform: "uppercase", fontSize: "0.65rem", letterSpacing: 0.5 }}>{summaryLabels.deduction}</Typography>
              <Typography variant="h6" sx={{ color: "#14532d", fontWeight: 800 }}>₹{totals.refund.toLocaleString("en-IN")}</Typography>
            </Box>
            <Box sx={{ flex: "1 1 0", p: 1.5, borderRadius: "12px", background: "linear-gradient(135deg, #eef2ff, #e0e7ff)", border: "1px solid #c7d2fe", display: "flex", flexDirection: "column" }}>
              <Typography variant="caption" sx={{ color: "#6366f1", fontWeight: 700, textTransform: "uppercase", fontSize: "0.65rem", letterSpacing: 0.5 }}>{summaryLabels.net}</Typography>
              <Typography variant="h6" sx={{ color: "#312e81", fontWeight: 800 }}>₹{totals.netAmt.toLocaleString("en-IN")}</Typography>
            </Box>
          </Box>

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
            disabled={!filteredData.length || loading}
            sx={{
              display: { xs: "flex", sm: "none" },
              background: "linear-gradient(135deg, #1565c0, #1976d2)",
              color: "#fff",
              borderRadius: "8px",
              width: 40,
              height: 40,
              "&:hover": { opacity: 0.9 },
              "&.Mui-disabled": { background: "#e2e8f0", color: "#94a3b8" }
            }}
          >
            <DownloadIcon fontSize="small" />
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
                {data?.length === 0 ? "No records found for this payment mode." : "No results match your search."}
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

export default React.memo(PaymentDetailsModal);
