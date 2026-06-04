import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Popover,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  CircularProgress,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CheckIcon from "@mui/icons-material/Check";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import { useData } from "../context/DataContext";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function toLocalISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDisplay(from, to) {
  if (!from) return "Select Date";
  const opts = { day: "2-digit", month: "short", year: "numeric" };
  const f = new Date(from).toLocaleDateString("en-IN", opts);
  const t = new Date(to).toLocaleDateString("en-IN", opts);
  if (from === to) return f;
  return `${f} – ${t}`;
}

const PRESET_BUTTONS = [
  { label: "Today", key: "today" },
  { label: "Yesterday", key: "yesterday" },
  { label: "Month Till Date", key: "mtd" },
  { label: "Custom", key: "custom" },
];

// ─── DateFilter popover ───────────────────────────────────────────────────────
const DateFilterButton = ({ value, onChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [activePreset, setActivePreset] = useState(value?.preset || "today");
  const [customFrom, setCustomFrom] = useState(toLocalISODate(new Date()));
  const [customTo, setCustomTo] = useState(toLocalISODate(new Date()));

  const open = Boolean(anchorEl);

  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const applyPreset = useCallback(
    (key) => {
      setActivePreset(key);
      const today = new Date();
      let from, to;
      if (key === "today") {
        from = to = toLocalISODate(today);
      } else if (key === "yesterday") {
        const y = new Date(today);
        y.setDate(today.getDate() - 1);
        from = to = toLocalISODate(y);
      } else if (key === "mtd") {
        from = toLocalISODate(new Date(today.getFullYear(), today.getMonth(), 1));
        to = toLocalISODate(today);
      } else {
        return; // custom — don't apply yet
      }
      onChange({ from, to, preset: key });
      if (key !== "custom") handleClose();
    },
    [onChange]
  );

  const applyCustom = useCallback(() => {
    onChange({ from: customFrom, to: customTo, preset: "custom" });
    handleClose();
  }, [customFrom, customTo, onChange]);

  const displayLabel = value?.from ? formatDisplay(value.from, value.to) : "Today";

  return (
    <>
      <Button
        onClick={handleOpen}
        variant="outlined"
        size="small"
        startIcon={<CalendarMonthIcon sx={{ fontSize: 16 }} />}
        endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 16, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }} />}
        sx={{
          borderRadius: "10px",
          borderColor: "#e2e8f0",
          color: "#334155",
          fontWeight: 600,
          fontSize: "0.82rem",
          height: 38,
          px: 2,
          textTransform: "none",
          bgcolor: "#fff",
          "&:hover": { borderColor: "#3b82f6", bgcolor: "#f8faff" },
        }}
      >
        {displayLabel}
      </Button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              borderRadius: "14px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
              border: "1px solid #e2e8f0",
              width: 300,
              overflow: "hidden",
            },
          },
        }}
      >
        {/* Header */}
        <Box sx={{ px: 2.5, py: 1.5, bgcolor: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
          <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: "#0f172a" }}>
            Select Date Range
          </Typography>
        </Box>

        {/* Preset Buttons */}
        <Box sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 0.5 }}>
          {PRESET_BUTTONS.map((btn) => (
            <Button
              key={btn.key}
              onClick={() => applyPreset(btn.key)}
              fullWidth
              startIcon={activePreset === btn.key ? <CheckIcon sx={{ fontSize: 16 }} /> : null}
              sx={{
                justifyContent: "flex-start",
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.82rem",
                borderRadius: "8px",
                py: 0.8,
                px: 1.5,
                color: activePreset === btn.key ? "#2563eb" : "#475569",
                bgcolor: activePreset === btn.key ? "#eff6ff" : "transparent",
                "&:hover": { bgcolor: activePreset === btn.key ? "#dbeafe" : "#f8fafc" },
              }}
            >
              {btn.label}
            </Button>
          ))}
        </Box>

        {/* Custom date pickers */}
        {activePreset === "custom" && (
          <>
            <Divider />
            <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
              <TextField
                label="From Date"
                type="date"
                size="small"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: customTo } }}
                fullWidth
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
              />
              <TextField
                label="To Date"
                type="date"
                size="small"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: customFrom } }}
                fullWidth
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
              />
              <Button
                variant="contained"
                size="small"
                onClick={applyCustom}
                sx={{
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #2563eb, #3b82f6)",
                  boxShadow: "none",
                  "&:hover": { boxShadow: "0 4px 12px rgba(37,99,235,0.3)" },
                }}
              >
                Apply
              </Button>
            </Box>
          </>
        )}
      </Popover>
    </>
  );
};

// ─── DashboardFilterBar ───────────────────────────────────────────────────────
const TABS = ["Home Dashboard", "OPD Dashboard", "IPD Dashboard", "Pharmacy Dashboard"];

const DashboardFilterBar = ({ filters, onChange, activeTab, onTabChange, siteCodes = [], specialities = [] }) => {
  const handleDateChange = useCallback(
    (dateVal) => onChange({ ...filters, date: dateVal }),
    [filters, onChange]
  );
  const handleSpecialityChange = useCallback(
    (e) => onChange({ ...filters, speciality: e.target.value }),
    [filters, onChange]
  );
  const handleSiteChange = useCallback(
    (e) => onChange({ ...filters, siteCode: e.target.value }),
    [filters, onChange]
  );

  const { allCollectionLoading, allRevenueLoading, allOutstandingLoading } = useData();
  const isGlobalLoading = allCollectionLoading || allRevenueLoading || allOutstandingLoading;

  const [mobileModalOpen, setMobileModalOpen] = useState(false);
  const [mobileFilters, setMobileFilters] = useState(filters);
  const [isApplying, setIsApplying] = useState(false);

  // Sync mobile filters when opening modal
  React.useEffect(() => {
    if (mobileModalOpen) {
      setMobileFilters(filters);
    }
  }, [mobileModalOpen, filters]);

  // Handle auto-close on loading complete
  React.useEffect(() => {
    if (isApplying && !isGlobalLoading) {
      setIsApplying(false);
      setMobileModalOpen(false);
    }
  }, [isGlobalLoading, isApplying]);

  const handleApplyMobileFilters = () => {
    setIsApplying(true);
    onChange(mobileFilters);
  };

  const selectSx = {
    borderRadius: "10px",
    height: 38,
    fontSize: "0.82rem",
    fontWeight: 600,
    color: "#334155",
    bgcolor: "#fff",
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e2e8f0" },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#3b82f6" },
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        flexWrap: "wrap",
        mb: 1.5,
        mt: -1,
        py: 1.5,
        px: 2.5,
        bgcolor: "#fff",
        borderRadius: "14px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      }}
    >
      {/* Desktop Tabs / Label */}
      <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 1 }}>
        {TABS.map(tab => (
          <Button
            key={tab}
            onClick={() => onTabChange(tab)}
            sx={{
              textTransform: "none",
              fontWeight: activeTab === tab ? 700 : 600,
              color: activeTab === tab ? "#1976d2" : "#64748b",
              bgcolor: activeTab === tab ? "#eff6ff" : "transparent",
              borderRadius: "8px",
              px: 1.5,
              py: 0.5,
              '&:hover': { bgcolor: activeTab === tab ? "#eff6ff" : "#f1f5f9" },
              transition: "all 0.2s ease"
            }}
          >
            {tab}
          </Button>
        ))}
        <Box sx={{ width: "1px", height: 24, bgcolor: "#e2e8f0", mx: 1 }} />
      </Box>

      {/* Mobile Tabs Dropdown */}
      <Box sx={{ display: { xs: "block", md: "none" }, flex: 1, minWidth: 140 }}>
        <FormControl size="small" fullWidth>
          <Select
            value={activeTab}
            onChange={(e) => onTabChange(e.target.value)}
            sx={{
              ...selectSx,
              fontWeight: 700,
              color: "#1976d2",
              bgcolor: "#eff6ff",
              "& fieldset": { border: "none" }
            }}
          >
            {TABS.map(tab => (
              <MenuItem key={tab} value={tab} sx={{ fontWeight: 600 }}>{tab}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Desktop Filters */}
      <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 1.5 }}>
        <DateFilterButton value={filters.date} onChange={handleDateChange} />

        <FormControl size="small" sx={{ width: 180 }}>
          <Select
            value={filters.speciality || ""}
            onChange={handleSpecialityChange}
            displayEmpty
            sx={selectSx}
            endAdornment={
              filters.speciality ? (
                <IconButton
                  size="small"
                  sx={{ position: "absolute", right: 28, p: 0.2 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange({ ...filters, speciality: "" });
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <CloseIcon sx={{ fontSize: 16, color: "#64748b" }} />
                </IconButton>
              ) : null
            }
            renderValue={(v) =>
              v ? (
                <Box sx={{ maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {v}
                </Box>
              ) : (
                <span style={{ color: "#94a3b8", fontWeight: 600 }}>Speciality</span>
              )
            }
          >
            <MenuItem value="">All Specialities</MenuItem>
            {specialities.map((spec, idx) => (
              <MenuItem key={idx} value={spec}>{spec}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ width: 140 }}>
          <Select
            value={filters.siteCode || ""}
            onChange={handleSiteChange}
            displayEmpty
            sx={selectSx}
            endAdornment={
              filters.siteCode ? (
                <IconButton
                  size="small"
                  sx={{ position: "absolute", right: 28, p: 0.2 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange({ ...filters, siteCode: "" });
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <CloseIcon sx={{ fontSize: 16, color: "#64748b" }} />
                </IconButton>
              ) : null
            }
            renderValue={(v) =>
              v ? (
                <Box sx={{ maxWidth: 60, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {v}
                </Box>
              ) : (
                <span style={{ color: "#94a3b8", fontWeight: 600 }}>Site Code</span>
              )
            }
          >
            <MenuItem value="">All Sites</MenuItem>
            {siteCodes.map((code, idx) => (
              <MenuItem key={idx} value={code}>{code}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Mobile Filter Button */}
      <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center" }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<FilterListIcon />}
          onClick={() => setMobileModalOpen(true)}
          sx={{
            borderRadius: "10px",
            borderColor: "#e2e8f0",
            color: "#334155",
            fontWeight: 600,
            height: 38,
            textTransform: "none",
          }}
        >
          Filters
        </Button>
      </Box>

      {/* Removed filter chips */}

      {/* Mobile Filter Modal */}
      <Dialog
        open={mobileModalOpen}
        onClose={() => setMobileModalOpen(false)}
        fullWidth
        maxWidth="xs"
        slotProps={{ paper: { sx: { borderRadius: "16px" } } }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontWeight: 800, color: "#0f172a" }}>
          Filters
          <IconButton onClick={() => setMobileModalOpen(false)} size="small" sx={{ color: "#64748b" }} disabled={isApplying}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 3, pb: 4 }}>
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748b", mb: 0.5, display: "block", textTransform: "uppercase" }}>
              Date Range
            </Typography>
            <DateFilterButton value={mobileFilters.date} onChange={(dateVal) => setMobileFilters({ ...mobileFilters, date: dateVal })} />
          </Box>

          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748b", mb: 0.5, display: "block", textTransform: "uppercase" }}>
              Speciality
            </Typography>
            <FormControl size="small" fullWidth>
              <Select
                value={mobileFilters.speciality || ""}
                onChange={(e) => setMobileFilters({ ...mobileFilters, speciality: e.target.value })}
                displayEmpty
                sx={selectSx}
                endAdornment={
                  mobileFilters.speciality ? (
                    <IconButton
                      size="small"
                      sx={{ position: "absolute", right: 28, p: 0.2 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setMobileFilters({ ...mobileFilters, speciality: "" });
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <CloseIcon sx={{ fontSize: 16, color: "#64748b" }} />
                    </IconButton>
                  ) : null
                }
                renderValue={(v) =>
                  v ? (
                    <Box sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {v}
                    </Box>
                  ) : (
                    <span style={{ color: "#94a3b8", fontWeight: 600 }}>Select Speciality</span>
                  )
                }
              >
                <MenuItem value="">All Specialities</MenuItem>
                {specialities.map((spec, idx) => (
                  <MenuItem key={idx} value={spec}>{spec}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748b", mb: 0.5, display: "block", textTransform: "uppercase" }}>
              Site Code
            </Typography>
            <FormControl size="small" fullWidth>
              <Select
                value={mobileFilters.siteCode || ""}
                onChange={(e) => setMobileFilters({ ...mobileFilters, siteCode: e.target.value })}
                displayEmpty
                sx={selectSx}
                endAdornment={
                  mobileFilters.siteCode ? (
                    <IconButton
                      size="small"
                      sx={{ position: "absolute", right: 28, p: 0.2 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setMobileFilters({ ...mobileFilters, siteCode: "" });
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <CloseIcon sx={{ fontSize: 16, color: "#64748b" }} />
                    </IconButton>
                  ) : null
                }
                renderValue={(v) =>
                  v ? (
                    <Box sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {v}
                    </Box>
                  ) : (
                    <span style={{ color: "#94a3b8", fontWeight: 600 }}>Select Site Code</span>
                  )
                }
              >
                <MenuItem value="">All Sites</MenuItem>
                {siteCodes.map((code, idx) => (
                  <MenuItem key={idx} value={code}>{code}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          <Button
            variant="contained"
            fullWidth
            onClick={handleApplyMobileFilters}
            disabled={isApplying}
            sx={{
              mt: 1,
              borderRadius: "10px",
              py: 1.2,
              fontWeight: 700,
              textTransform: "none",
              background: "linear-gradient(135deg, #2563eb, #3b82f6)",
              "&:hover": { opacity: 0.9 },
            }}
          >
            {isApplying ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Apply Filters"}
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default DashboardFilterBar;
