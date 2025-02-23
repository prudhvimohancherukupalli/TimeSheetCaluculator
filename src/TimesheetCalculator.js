import React, { useState, useRef } from "react";
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
  Snackbar
} from "@mui/material";
import dayjs from "dayjs";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} variant="filled" ref={ref} {...props} />;
});

export default function TimesheetCalculator() {
  const [entries, setEntries] = useState([]);
  const [clockIn, setClockIn] = useState("");
  const [clockOut, setClockOut] = useState("");
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [hourRate, setHourRate] = useState(20);
  const [bulkEntry, setBulkEntry] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [startDate, setStartDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [showActions, setShowActions] = useState(true); // to control visibility of actions column
  const clockInRef = useRef(null);

  const calculateDifference = (inTime, outTime) => {
    const start = dayjs(`2024-01-01 ${inTime}`);
    const end = dayjs(`2024-01-01 ${outTime}`);
    const diff = end.diff(start, "minute");
    const hr = Math.floor(diff / 60);
    const mi = diff % 60;
    return { formatted: `${hr}h ${mi}m`, totalMinutes: diff };
  };

  const handleAddEntry = () => {
    // Validate inputs
    if (!clockIn || !clockOut || !hourRate) {
      setError("Please fill in all fields.");
      setOpenSnackbar(true);
      return;
    }

    let newEntries = [];
    if (bulkEntry) {
      let current = dayjs(startDate);
      while (current.isBefore(dayjs(endDate).add(1, "day"))) {
        const durationData = calculateDifference(clockIn, clockOut);
        newEntries.push({
          date: current.format("YYYY-MM-DD"),
          clockIn,
          clockOut,
          duration: durationData.formatted,
          totalMinutes: durationData.totalMinutes,
          totalPay: ((durationData.totalMinutes / 60) * hourRate).toFixed(2),
        });
        current = current.add(1, "day");
      }
    } else {
      const durationData = calculateDifference(clockIn, clockOut);
      newEntries.push({
        date,
        clockIn,
        clockOut,
        duration: durationData.formatted,
        totalMinutes: durationData.totalMinutes,
        totalPay: ((durationData.totalMinutes / 60) * hourRate).toFixed(2),
      });
    }

    setEntries([...entries, ...newEntries]);
    setClockIn("");
    setClockOut("");
    setDate(dayjs(date).add(1, "day").format("YYYY-MM-DD"));
    setStartDate(dayjs(endDate).add(1, "day").format("YYYY-MM-DD"));
    setEndDate(dayjs(endDate).add(1, "day").format("YYYY-MM-DD"));
    setTimeout(() => clockInRef.current?.focus(), 100);
  };

  const handleEditEntry = (index) => {
    const entry = entries[index];
    setClockIn(entry.clockIn);
    setClockOut(entry.clockOut);
    setDate(entry.date);
    setEditingIndex(index);

    // Scroll to top
    window.scrollTo(0, 0);

    // Uncheck the bulk entry checkbox
    setBulkEntry(false);
  };

  const handleDeleteEntry = (index) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const handlePrintReport = () => {
    setShowActions(false); // Hide actions column for printing
    window.print();
    setShowActions(true); // Re-enable actions column after printing
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <div className="no-print">
        <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
          Timesheet Calculator
        </Typography>

        <Card sx={{ p: 4, mb: 3, background: "#f9f9f9", boxShadow: 3, borderRadius: 2 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={3}>
                <Typography variant="subtitle1">Date</Typography>
                <TextField
                  type="date"
                  fullWidth
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  variant="outlined"
                  disabled={bulkEntry}
                />
              </Grid>
              <Grid item xs={3}>
                <Typography variant="subtitle1">Clock In Time</Typography>
                <TextField
                  type="time"
                  fullWidth
                  value={clockIn}
                  onChange={(e) => setClockIn(e.target.value)}
                  variant="outlined"
                  inputRef={clockInRef}
                />
              </Grid>
              <Grid item xs={3}>
                <Typography variant="subtitle1">Clock Out Time</Typography>
                <TextField
                  type="time"
                  fullWidth
                  value={clockOut}
                  onChange={(e) => setClockOut(e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={3}>
                <Typography variant="subtitle1">Hourly Pay Rate ($)</Typography>
                <TextField
                  type="number"
                  fullWidth
                  value={hourRate}
                  onChange={(e) => setHourRate(Number(e.target.value))}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={<Checkbox checked={bulkEntry} onChange={(e) => setBulkEntry(e.target.checked)} />}
                  label="Add multiple entries for a date range"
                />
              </Grid>

              {bulkEntry && (
                <>
                  <Grid item xs={6}>
                    <Typography variant="subtitle1">Start Date</Typography>
                    <TextField
                      type="date"
                      fullWidth
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle1">End Date</Typography>
                    <TextField
                      type="date"
                      fullWidth
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      variant="outlined"
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddEntry}
                  fullWidth
                  sx={{ py: 1.5, fontSize: "1rem" }}
                >
                  {editingIndex === null ? "Add Entry" : "Update Entry"}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </div>

      {entries.length > 0 && (
        <>
          <Table sx={{ mt: 3, border: "1px solid #ddd", borderRadius: 2 }}>
            <TableHead sx={{ backgroundColor: "#f0f0f0" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Clock In</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Clock Out</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Duration</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Total Pay ($)</TableCell>
                {showActions && (
                  <TableCell className="no-print" sx={{ fontWeight: "bold" }}>Actions</TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell>{entry.date}</TableCell>
                  <TableCell>{entry.clockIn}</TableCell>
                  <TableCell>{entry.clockOut}</TableCell>
                  <TableCell>{entry.duration}</TableCell>
                  <TableCell>${entry.totalPay}</TableCell>
                  {showActions && (
                    <TableCell className="no-print">
                      <IconButton onClick={() => handleEditEntry(index)} color="primary"><EditIcon /></IconButton>
                      <IconButton onClick={() => handleDeleteEntry(index)} color="error"><DeleteIcon /></IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Button
            variant="contained"
            color="secondary"
            onClick={handlePrintReport}
            fullWidth
            sx={{ mt: 2, mb: 3 }}
            disabled={entries.length === 0}
          >
            Print Report
          </Button>
        </>
      )}

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
        <Alert onClose={() => setOpenSnackbar(false)} severity="error">{error}</Alert>
      </Snackbar>

      <style jsx global>{`
        @media print {
          .no-print {
            display: none;
          }
          .MuiTableCell-root {
            border: 1px solid #ddd;
            padding: 8px;
          }
        }
      `}</style>
    </Container>
  );
}
