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
  Grid
} from "@mui/material";
import dayjs from "dayjs";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function TimesheetCalculator() {
  const [entries, setEntries] = useState([]);
  const [clockIn, setClockIn] = useState("");
  const [clockOut, setClockOut] = useState("");
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [hourRate, setHourRate] = useState(20);
  const [editingIndex, setEditingIndex] = useState(null);
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
    if (clockIn && clockOut) {
      const durationData = calculateDifference(clockIn, clockOut);
      const newEntry = {
        date,
        clockIn,
        clockOut,
        duration: durationData.formatted,
        totalMinutes: durationData.totalMinutes,
        totalPay: ((durationData.totalMinutes / 60) * hourRate).toFixed(2),
      };

      if (editingIndex === null) {
        setEntries([...entries, newEntry]);
      } else {
        const updatedEntries = [...entries];
        updatedEntries[editingIndex] = newEntry;
        setEntries(updatedEntries);
        setEditingIndex(null);
      }

      setClockIn("");
      setClockOut("");
      setDate(dayjs(date).add(1, "day").format("YYYY-MM-DD")); // ✅ Auto-increase date by 1 day
      setTimeout(() => clockInRef.current?.focus(), 100);
    }
  };

  const handleEditEntry = (index) => {
    const entry = entries[index];
    setClockIn(entry.clockIn);
    setClockOut(entry.clockOut);
    setDate(entry.date);
    setEditingIndex(index);
  };

  const handleDeleteEntry = (index) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <div className="no-print">
        <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
          Timesheet Calculator
        </Typography>

        <Card sx={{ p: 3, mb: 3, background: "#f9f9f9", boxShadow: 3, borderRadius: 2 }}>
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
                <Typography variant="subtitle1">Hourly Rate ($)</Typography>
                <TextField
                  type="number"
                  fullWidth
                  value={hourRate}
                  onChange={(e) => setHourRate(e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" color="primary" onClick={handleAddEntry} fullWidth sx={{ py: 1.5, fontSize: "1rem" }}>
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
                <TableCell className="no-print" sx={{ fontWeight: "bold" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.map((entry, index) => (
                <TableRow key={index} sx={{ "&:hover": { backgroundColor: "#f9f9f9" } }}>
                  <TableCell>{entry.date}</TableCell>
                  <TableCell>{entry.clockIn}</TableCell>
                  <TableCell>{entry.clockOut}</TableCell>
                  <TableCell>{entry.duration}</TableCell>
                  <TableCell>${entry.totalPay}</TableCell>
                  <TableCell className="no-print">
                    <IconButton onClick={() => handleEditEntry(index)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteEntry(index)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="no-print">
            <Button variant="contained" color="secondary" onClick={handlePrint} sx={{ mt: 2, display: "block", mx: "auto" }}>
              Print Report
            </Button>
          </div>
        </>
      )}

      {/* CSS for print mode */}
      <style>
        {`
          @media print {
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>
    </Container>
  );
}
