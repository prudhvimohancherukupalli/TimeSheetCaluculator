// TimesheetCalculator.jsx (glassy theme + optional Name/Month + no OT)
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Container,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  IconButton,
  Card,
  CardContent,
  Grid,
  Checkbox,
  FormControlLabel,
  Snackbar,
  Stack,
  Paper,
  Divider,
  Tooltip,
  useMediaQuery
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PrintIcon from "@mui/icons-material/Print";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import EditIcon from '@mui/icons-material/Edit';
import ClearAllIcon from "@mui/icons-material/ClearAll";
import dayjs from "dayjs";
import MuiAlert from "@mui/material/Alert";
import "./TimesheetCalculator.css";

const LS_KEY = "timesheet_calculator_v5_glassy";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} variant="filled" ref={ref} {...props} />;
});

// helpers
const toMinutes = (hhmm) => {
  const [h, m] = (hhmm || "0:0").split(":").map(Number);
  return h * 60 + m;
};
const fmtHM = (mins) => {
  const sign = mins < 0 ? "-" : "";
  const abs = Math.abs(mins);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `${sign}${h}h ${m}m`;
};
const currency = (n) =>
  (isNaN(n) ? 0 : Number(n)).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
const sanitize = (s) =>
  (s || "")
    .trim()
    .replace(/[^\w-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

export default function TimesheetCalculator() {
  const isMobile = useMediaQuery("(max-width:900px)");
  const clockInRef = useRef(null);

  // optional header fields
  const [personName, setPersonName] = useState("");
  const [month, setMonth] = useState(""); // YYYY-MM

  const [entries, setEntries] = useState([]);
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [clockIn, setClockIn] = useState("");
  const [clockOut, setClockOut] = useState("");
  const [breakMin, setBreakMin] = useState(0);
  const [hourRate, setHourRate] = useState(0);

  const [bulkEntry, setBulkEntry] = useState(false);
  const [startDate, setStartDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [includeWeekends, setIncludeWeekends] = useState(true);

  const [editingIndex, setEditingIndex] = useState(null);
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [showActions, setShowActions] = useState(true);

  // load
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        setEntries(data.entries || []);
        setHourRate(data.hourRate ?? 0);
        setPersonName(data.personName ?? "");
        setMonth(data.month ?? "");
      }
    } catch {}
  }, []);

  // save
  useEffect(() => {
    localStorage.setItem(
      LS_KEY,
      JSON.stringify({ entries, hourRate, personName, month })
    );
  }, [entries, hourRate, personName, month]);

  // calc minutes (supports overnight)
  const calcMinutesWorked = (inTime, outTime, breakMinutes = 0) => {
    if (!inTime || !outTime) return 0;
    let start = toMinutes(inTime);
    let end = toMinutes(outTime);
    if (end < start) end += 24 * 60; // overnight
    const total = Math.max(0, end - start - (Number(breakMinutes) || 0));
    return total;
  };

  const validateInputs = () => {
    if (!clockIn || !clockOut) return "Enter both Clock In and Clock Out.";
    if (Number(hourRate) <= 0) return "Hourly rate must be greater than 0.";
    if (Number(breakMin) < 0) return "Break minutes cannot be negative.";
    if (bulkEntry) {
      const sd = dayjs(startDate);
      const ed = dayjs(endDate);
      if (!sd.isValid() || !ed.isValid()) return "Enter a valid date range.";
      if (sd.isAfter(ed)) return "Start Date cannot be after End Date.";
    }
    return "";
  };

  const buildEntry = (isoDate) => {
    const totalMinutes = calcMinutesWorked(clockIn, clockOut, breakMin);
    return {
      date: isoDate,
      clockIn,
      clockOut,
      breakMin: Number(breakMin) || 0,
      totalMinutes,
      duration: fmtHM(totalMinutes),
      totalPay: ((totalMinutes / 60) * Number(hourRate || 0)).toFixed(2),
    };
  };

  const handleAddOrUpdate = () => {
    const v = validateInputs();
    if (v) {
      setError(v);
      setOpenSnackbar(true);
      return;
    }

    if (editingIndex !== null) {
      const updated = [...entries];
      updated[editingIndex] = buildEntry(date);
      setEntries(updated);
      setEditingIndex(null);
    } else {
      let toAdd = [];
      if (bulkEntry) {
        let cur = dayjs(startDate);
        const end = dayjs(endDate);
        while (cur.isSame(end) || cur.isBefore(end)) {
          if (includeWeekends || (cur.day() !== 0 && cur.day() !== 6)) {
            toAdd.push(buildEntry(cur.format("YYYY-MM-DD")));
          }
          cur = cur.add(1, "day");
        }
      } else {
        toAdd.push(buildEntry(date));
      }
      setEntries((prev) => [...prev, ...toAdd]);
    }

    setClockIn("");
    setClockOut("");
    setBreakMin(0);
    setDate(dayjs(date).add(1, "day").format("YYYY-MM-DD"));
    if (bulkEntry) {
      setStartDate(dayjs(endDate).add(1, "day").format("YYYY-MM-DD"));
      setEndDate(dayjs(endDate).add(1, "day").format("YYYY-MM-DD"));
    }
    setTimeout(() => clockInRef.current?.focus(), 50);
  };

  const handleEdit = (idx) => {
    const e = entries[idx];
    setClockIn(e.clockIn);
    setClockOut(e.clockOut);
    setBreakMin(e.breakMin || 0);
    setDate(e.date);
    setEditingIndex(idx);
    setBulkEntry(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleDelete = (idx) => setEntries((prev) => prev.filter((_, i) => i !== idx));

  // filenames
  const filenamePrefix = () => {
    const parts = [];
    if (month) parts.push(sanitize(month)); // YYYY-MM
    if (personName) parts.push(sanitize(personName));
    return parts.length ? `timesheet_${parts.join("_")}` : "timesheet";
  };

  const exportCSV = () => {
    const rows = [
      ...(personName || month
        ? [["Name", personName || ""], ["Month", month || ""], ["", ""]]
        : []),
      ["Date", "Clock In", "Clock Out", "Break (min)", "Duration", "Total Pay ($)"],
      ...entries.map((e) => [
        e.date,
        e.clockIn,
        e.clockOut,
        e.breakMin,
        e.duration,
        e.totalPay,
      ]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const ts = dayjs().format("YYYYMMDD_HHmm");
    a.href = url;
    a.download = `${filenamePrefix()}_${ts}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const prevTitle = document.title;
    const ts = dayjs().format("YYYYMMDD_HHmm");
    document.title = `${filenamePrefix()}_${ts}`;
    document.body.classList.add("print-mode");
    setShowActions(false);
    window.print();
    document.body.classList.remove("print-mode");
    setShowActions(true);
    document.title = prevTitle;
  };

  const handleClearAll = () => {
    setEntries([]);
    setEditingIndex(null);
  };

  const totals = useMemo(() => {
    const totalMinutes = entries.reduce((s, e) => s + (e.totalMinutes || 0), 0);
    const totalPay = entries.reduce((s, e) => s + Number(e.totalPay || 0), 0);
    return { totalMinutes, totalDuration: fmtHM(totalMinutes), totalPay };
  }, [entries]);

  return (
    <div className="glass-bg">
      <Container maxWidth="lg" sx={{ my: 4 }}>
        <div className="glass-header">
          <Typography variant="h4" align="center" fontWeight={800} className="glass-title">
            Timesheet Calculator
          </Typography>
          {(personName || month) && (
            <Typography align="center" className="glass-subtitle">
              {personName ? <><b>{personName}</b></> : null}
              {personName && month ? " • " : null}
              {month ? <><b>{month}</b></> : null}
            </Typography>
          )}
        </div>

        {/* Optional header fields */}
        <Paper className="no-print glass-card" sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">Name (optional)</Typography>
              <TextField
                fullWidth
                placeholder="Enter your name (optional)"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                InputProps={{ className: "glass-input" }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">Month (optional)</Typography>
              <TextField
                fullWidth
                type="month"
                placeholder="YYYY-MM"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                helperText="Used in export/print filename if provided"
                InputProps={{ className: "glass-input" }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* controls */}
        <Paper className="no-print glass-card" sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Typography variant="subtitle2">Date</Typography>
              <TextField
                type="date"
                fullWidth
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={!!bulkEntry}
                InputProps={{ className: "glass-input" }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2.5}>
              <Typography variant="subtitle2">Clock In</Typography>
              <TextField
                type="time"
                fullWidth
                inputRef={clockInRef}
                value={clockIn}
                onChange={(e) => setClockIn(e.target.value)}
                inputProps={{ step: 300 }}
                InputProps={{ className: "glass-input" }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2.5}>
              <Typography variant="subtitle2">Clock Out</Typography>
              <TextField
                type="time"
                fullWidth
                value={clockOut}
                onChange={(e) => setClockOut(e.target.value)}
                inputProps={{ step: 300 }}
                helperText="Overnight OK (22:00 → 06:00)"
                InputProps={{ className: "glass-input" }}
              />
            </Grid>

            <Grid item xs={6} sm={4} md={2}>
              <Typography variant="subtitle2">Break (min)</Typography>
              <TextField
                type="number"
                fullWidth
                value={breakMin}
                onChange={(e) => setBreakMin(e.target.value)}
                inputProps={{ min: 0 }}
                InputProps={{ className: "glass-input" }}
              />
            </Grid>

            <Grid item xs={6} sm={4} md={2}>
              <Typography variant="subtitle2">Hourly Rate ($)</Typography>
              <TextField
                type="number"
                fullWidth
                value={hourRate}
                onChange={(e) => setHourRate(Number(e.target.value))}
                inputProps={{ min: 0, step: "0.01" }}
                InputProps={{ className: "glass-input" }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={bulkEntry}
                    onChange={(e) => setBulkEntry(e.target.checked)}
                  />
                }
                label="Add multiple entries across a date range"
              />
            </Grid>

            {bulkEntry && (
              <>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2">Start Date</Typography>
                  <TextField
                    type="date"
                    fullWidth
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputProps={{ className: "glass-input" }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2">End Date</Typography>
                  <TextField
                    type="date"
                    fullWidth
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    InputProps={{ className: "glass-input" }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={includeWeekends}
                        onChange={(e) => setIncludeWeekends(e.target.checked)}
                      />
                    }
                    label="Include weekends"
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12} md={6}>
              <Button
                className="glass-btn"
                variant="contained"
                fullWidth
                onClick={handleAddOrUpdate}
                sx={{ height: 56 }}
              >
                {editingIndex === null ? "Add Entry" : "Update Entry"}
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={1}>
                <Tooltip title="Export CSV">
                  <Button
                    className="glass-btn secondary"
                    fullWidth
                    variant="outlined"
                    startIcon={<FileDownloadIcon />}
                    onClick={exportCSV}
                  >
                    Export CSV
                  </Button>
                </Tooltip>
                <Tooltip title="Print">
                  <Button
                    className="glass-btn secondary"
                    fullWidth
                    variant="outlined"
                    startIcon={<PrintIcon />}
                    onClick={handlePrint}
                  >
                    Print
                  </Button>
                </Tooltip>
                <Tooltip title="Clear all entries">
                  <Button
                    className="glass-btn danger"
                    fullWidth
                    variant="outlined"
                    startIcon={<ClearAllIcon />}
                    onClick={handleClearAll}
                  >
                    Clear
                  </Button>
                </Tooltip>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* summary */}
        <Paper className="glass-card" sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h6" className="glass-section-title" gutterBottom>
                Summary
              </Typography>
              {(personName || month) && (
                <Typography variant="body2" className="glass-muted">
                  {personName ? <>Name: <b>{personName}</b></> : null}
                  {personName && month ? " • " : null}
                  {month ? <>Month: <b>{month}</b></> : null}
                </Typography>
              )}
            </Grid>
            <Grid item xs={6} md={3}>
              <Card elevation={0} className="glass-card inner">
                <CardContent>
                  <Typography variant="body2" className="glass-muted">Total Duration</Typography>
                  <Typography variant="h6">{totals.totalDuration}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card elevation={0} className="glass-card inner">
                <CardContent>
                  <Typography variant="body2" className="glass-muted">Total Pay</Typography>
                  <Typography variant="h6">{currency(totals.totalPay)}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>

        {/* entries */}
        {entries.length > 0 ? (
          <>
            {!isMobile ? (
              <Paper className="glass-card" sx={{ p: 1, overflowX: "auto" }}>
                <Table size="small" sx={{ minWidth: 720 }} className="glass-table">
                  <TableHead>
                    <TableRow>
                      <TableCell className="glass-th">Date</TableCell>
                      <TableCell className="glass-th">Clock In</TableCell>
                      <TableCell className="glass-th">Clock Out</TableCell>
                      <TableCell className="glass-th">Break (min)</TableCell>
                      <TableCell className="glass-th">Duration</TableCell>
                      <TableCell className="glass-th">Total Pay</TableCell>
                      {showActions && (
                        <TableCell className="no-print glass-th">Actions</TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {entries.map((e, i) => (
                      <TableRow key={`${e.date}-${i}`} className="glass-row">
                        <TableCell>{e.date}</TableCell>
                        <TableCell>{e.clockIn}</TableCell>
                        <TableCell>{e.clockOut}</TableCell>
                        <TableCell>{e.breakMin}</TableCell>
                        <TableCell>{e.duration}</TableCell>
                        <TableCell>{currency(e.totalPay)}</TableCell>
                        {showActions && (
                          <TableCell className="no-print">
                            <IconButton color="primary" onClick={() => handleEdit(i)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton color="error" onClick={() => handleDelete(i)}>
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            ) : (
              <Stack spacing={1.5}>
                {entries.map((e, i) => (
                  <Card key={`${e.date}-${i}`} className="glass-card" variant="outlined">
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle1" fontWeight={700}>
                          {e.date}
                        </Typography>
                        {showActions && (
                          <Stack direction="row" spacing={1}>
                            <IconButton size="small" color="primary" onClick={() => handleEdit(i)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => handleDelete(i)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        )}
                      </Stack>
                      <Divider sx={{ my: 1 }} />
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="caption" className="glass-muted">In</Typography>
                          <Typography>{e.clockIn}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" className="glass-muted">Out</Typography>
                          <Typography>{e.clockOut}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" className="glass-muted">Break</Typography>
                          <Typography>{e.breakMin} min</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" className="glass-muted">Duration</Typography>
                          <Typography>{e.duration}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="caption" className="glass-muted">Pay</Typography>
                          <Typography>{currency(e.totalPay)}</Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </>
        ) : (
          <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
            No entries yet. Add your first one above.
          </Typography>
        )}

        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000}
          onClose={() => setOpenSnackbar(false)}
        >
          <Alert severity="error" onClose={() => setOpenSnackbar(false)}>
            {error}
          </Alert>
        </Snackbar>
      </Container>
    </div>
  );
}
