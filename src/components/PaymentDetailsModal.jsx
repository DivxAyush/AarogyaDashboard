import React, { useState, useCallback, useMemo } from "react";
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
import { ROWS_PER_PAGE_OPTIONS } from "../utils/constants";

// ─────────────────────────────────────────────
// PaymentDetailsModal — Drilldown Data Table
// Search | Pagination | CSV Export
// ─────────────────────────────────────────────

const COLUMNS = [
  { id: "uhidno", label: "UHID No" },
  { id: "patientname", label: "Patient Name" },
  { id: "receiptno", label: "Receipt No" },
  { id: "paymode", label: "Pay Mode" },
  { id: "collection", label: "Collection" },
  { id: "refund", label: "Refund" },
  { id: "receiptdate", label: "Receipt Date" },
  { id: "username", label: "User" },
  { id: "organization", label: "Organization" },
  { id: "receiptamt", label: "Amount" },
];

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

  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    if (!search.trim()) return data;
    const lower = search.toLowerCase();
    return data.filter((row) =>
      COLUMNS.some((col) =>
        String(row[col.id] ?? "").toLowerCase().includes(lower)
      )
    );
  }, [data, search]);

  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const handleExportCSV = useCallback(() => {
    if (!filteredData.length) return;
    const headers = COLUMNS.map((c) => c.label).join(",");
    const rows = filteredData.map((row) =>
      COLUMNS.map((c) => `"${String(row[c.id] ?? "").replace(/"/g, '""')}"`).join(",")
    );
    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `payment_${paymentMode}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [filteredData, paymentMode]);

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
            py: 2.5,
            background: "linear-gradient(135deg, #1565c0 0%, #1976d2 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700 }}>
              Payment Details
            </Typography>
            {paymentMode && (
              <Chip
                label={paymentMode}
                size="small"
                sx={{
                  mt: 0.5,
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "0.72rem",
                }}
              />
            )}
          </Box>
          <IconButton onClick={handleClose} sx={{ color: "#fff" }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* ── Toolbar ── */}
        <Box
          sx={{
            px: 3,
            py: 2,
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
            flexShrink: 0,
            borderBottom: "1px solid #e3f2fd",
            bgcolor: "#f8fbff",
          }}
        >
          <TextField
            size="small"
            placeholder="Search records…"
            value={search}
            onChange={handleSearchChange}
            sx={{ flex: 1, minWidth: 200, maxWidth: 360 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: "#90a4ae" }} />
                </InputAdornment>
              ),
              sx: { borderRadius: "10px", bgcolor: "#fff" },
            }}
          />
          <Typography variant="body2" sx={{ color: "#78909c", ml: "auto" }}>
            {filteredData.length} records
          </Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={<DownloadIcon />}
            onClick={handleExportCSV}
            disabled={!filteredData.length || loading}
            sx={{
              borderRadius: "10px",
              background: "linear-gradient(135deg, #1565c0, #1976d2)",
              textTransform: "none",
              fontWeight: 600,
              px: 2.5,
            }}
          >
            Export CSV
          </Button>
        </Box>

        {/* ── Table ── */}
        <Box sx={{ flex: 1, overflow: "auto" }}>
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
            <TableContainer component={Paper} elevation={0}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    {COLUMNS.map((col) => (
                      <TableCell
                        key={col.id}
                        sx={{
                          fontWeight: 700,
                          color: "#1565c0",
                          bgcolor: "#e3f2fd",
                          whiteSpace: "nowrap",
                          fontSize: "0.78rem",
                          letterSpacing: 0.3,
                          borderBottom: "2px solid #90caf9",
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
                        "&:nth-of-type(even)": { bgcolor: "#f8fbff" },
                        "&:hover": { bgcolor: "#e3f2fd" },
                        transition: "background 0.15s",
                      }}
                    >
                      {COLUMNS.map((col) => (
                        <TableCell
                          key={col.id}
                          sx={{ fontSize: "0.82rem", color: "#374151", whiteSpace: "nowrap" }}
                        >
                          {col.id === "collection" || col.id === "refund" || col.id === "receiptamt"
                            ? typeof row[col.id] === "number"
                              ? `₹${row[col.id].toLocaleString("en-IN")}`
                              : row[col.id] ?? "—"
                            : row[col.id] ?? "—"}
                        </TableCell>
                      ))}
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
              }}
            />
          </>
        )}
      </Box>
    </Modal>
  );
};

export default React.memo(PaymentDetailsModal);
