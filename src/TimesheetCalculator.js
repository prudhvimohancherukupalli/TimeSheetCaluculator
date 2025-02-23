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
} from "@mui/material";
import dayjs from "dayjs";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PrintIcon from "@mui/icons-material/Print";

export default function TimesheetCalculator() {
  const [entries, setEntries] = useState([]);
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD")); // Default to today's date
  const [clockIn, setClockIn] = useState("");
  const [clockOut, setClockOut] = useState("");
  const [hourlyRate, setHourlyRate] = useState(20);
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
      const { formatted, totalMinutes } = calculateDifference(clockIn, clockOut);
      
      let newDate = date;
      if (!editingIndex && entries.length > 0 && date === entries[entries.length - 1].date) {
        newDate = dayjs(entries[entries.length - 1].date).add(1, "day").format("YYYY-MM-DD");
      }

      if (editingIndex === null) {
        setEntries([...entries, { date: newDate, clockIn, clockOut, duration: formatted, totalMinutes }]);
      } else {
        const updatedEntries = [...entries];
        updatedEntries[editingIndex] = { date: newDate, clockIn, clockOut, duration: formatted, totalMinutes };
        setEntries(updatedEntries);
        setEditingIndex(null);
      }

      setDate(newDate);
      setClockIn("");
      setClockOut("");
      setTimeout(() => clockInRef.current?.focus(), 100);
    }
  };

  const handleEditEntry = (index) => {
    setDate(entries[index].date);
    setClockIn(entries[index].clockIn);
    setClockOut(entries[index].clockOut);
    setEditingIndex(index);
  };

  const handleDeleteEntry = (index) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const handlePrint = () => {
    const printSection = document.getElementById("print-section").innerHTML;
    const newWindow = window.open("", "_blank");
    newWindow.document.write(`
      <html>
        <head>
          <title>Timesheet Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background: #f0f0f0; font-weight: bold; }
            h2 { text-align: center; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <h2>Timesheet Report</h2>
          ${printSection}
        </body>
      </html>
    `);
    newWindow.document.close();
    newWindow.print();
  };

  const totalMinutes = entries.reduce((sum, entry) => sum + entry.totalMinutes, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  const totalPay = ((totalMinutes / 60) * hourlyRate).toFixed(2);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
        Timesheet Calculator
      </Typography>

      {/* Input Section */}
      <Card sx={{ p: 3, mb: 3, background: "#f9f9f9", boxShadow: 3, borderRadius: 2 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <Typography variant="subtitle1" gutterBottom>Date</Typography>
              <TextField
                type="date"
                fullWidth
                value={date}
                onChange={(e) => setDate(e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={3}>
              <Typography variant="subtitle1" gutterBottom>Hourly Rate ($)</Typography>
              <TextField
                type="number"
                fullWidth
                value={hourlyRate}
                onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 20)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={3}>
              <Typography variant="subtitle1" gutterBottom>Clock In Time</Typography>
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
              <Typography variant="subtitle1" gutterBottom>Clock Out Time</Typography>
              <TextField
                type="time"
                fullWidth
                value={clockOut}
                onChange={(e) => setClockOut(e.target.value)}
                variant="outlined"
              />
            </Grid>
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

      {/* Table & Summary */}
      {entries.length > 0 && (
        <div id="print-section">
          <Table sx={{ mt: 3, border: "1px solid #ddd", borderRadius: 2 }}>
            <TableHead sx={{ backgroundColor: "#f0f0f0" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Clock In</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Clock Out</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Duration</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.map((entry, index) => (
                <TableRow key={index} sx={{ "&:hover": { backgroundColor: "#f9f9f9" } }}>
                  <TableCell>{entry.date}</TableCell>
                  <TableCell>{entry.clockIn}</TableCell>
                  <TableCell>{entry.clockOut}</TableCell>
                  <TableCell>{entry.duration}</TableCell>
                  <TableCell>
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

          <Typography variant="h6" sx={{ mt: 2, fontWeight: "bold" }}>
            Total Time: {totalHours} hours {remainingMinutes} minutes | Total Pay: ${totalPay}
          </Typography>
        </div>
      )}

      {entries.length > 0 && (
        <Button variant="contained" color="secondary" startIcon={<PrintIcon />} sx={{ mt: 2 }} onClick={handlePrint}>
          Print Report
        </Button>
      )}
    </Container>
  );
}
