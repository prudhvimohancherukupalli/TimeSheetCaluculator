import React, { useState,useRef } from 'react';
import { Container, TextField, Button, Table, TableHead, TableRow, TableCell, TableBody, Typography, IconButton, Card, CardContent, Grid } from '@mui/material';
import dayjs from 'dayjs';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function TimesheetCalculator() {
    const [entries, setEntries] = useState([]);
    const [clockIn, setClockIn] = useState("");
    const [clockOut, setClockOut] = useState("");
    const [editingIndex, setEditingIndex] = useState(null);
    const clockInRef = useRef(null);

    const calculateDifference = (inTime, outTime) => {
        const start = dayjs(`2024-01-01 ${inTime}`);
        const end = dayjs(`2024-01-01 ${outTime}`);
        const diff = end.diff(start, "minute");
        const hr = Math.floor(diff / 60);
        const mi = diff % 60;
        return `${hr}h ${mi}m`;
    };

    const handleAddEntry = () => {
        if (clockIn && clockOut) {
            const duration = calculateDifference(clockIn, clockOut);
            if (editingIndex === null) {
                setEntries([...entries, { clockIn, clockOut, duration }]);
            } else {
                const updatedEntries = [...entries];
                updatedEntries[editingIndex] = { clockIn, clockOut, duration };
                setEntries(updatedEntries);
                setEditingIndex(null);
            }
            setClockIn("");
            setClockOut("");
            setTimeout(()=>clockInRef.current?.focus(),100);
        }
    };

    const handleEditEntry = (index) => {
        setClockIn(entries[index].clockIn);
        setClockOut(entries[index].clockOut);
        setEditingIndex(index);
    };

    const handleDeleteEntry = (index) => {
        setEntries(entries.filter((_, i) => i !== index));
    };

    const totalMinutes = entries.reduce((sum, entry) => {
        const [hr, mi] = entry.duration.split("h ").join("").split("m").map(Number);
        return sum + hr * 60 + mi;
    }, 0);

    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
                Timesheet Calculator
            </Typography>

            {/* Card for Inputs */}
            <Card sx={{ p: 3, mb: 3, background: "#f9f9f9", boxShadow: 3, borderRadius: 2 }}>
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
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
                        <Grid item xs={6}>
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
                            <Button variant="contained" color="primary" onClick={handleAddEntry} fullWidth sx={{ py: 1.5, fontSize: "1rem" }}>
                                {editingIndex === null ? "Add Entry" : "Update Entry"}
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Table Section */}
            {entries.length > 0 && (
                <Table sx={{ mt: 3, border: "1px solid #ddd", borderRadius: 2 }}>
                    <TableHead sx={{ backgroundColor: "#f0f0f0" }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: "bold" }}>Clock In</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Clock Out</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Duration</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {entries.map((entry, index) => (
                            <TableRow key={index} sx={{ "&:hover": { backgroundColor: "#f9f9f9" } }}>
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
            )}

            {/* Total Hours Section */}
            {entries.length > 0 && (
                <Typography variant="h6" sx={{ mt: 3, textAlign: "center", background: "#1976d2", color: "#fff", p: 2, borderRadius: 1 }}>
                    Total Time: {totalHours} hours {remainingMinutes} minutes
                </Typography>
            )}
        </Container>
    );
}
