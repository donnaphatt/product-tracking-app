import React, { useEffect, useState } from 'react';
import { getLiveEvents, createLiveEvent, deleteLiveEvent } from '../api';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const LiveSellingEvents = () => {
  const [events, setEvents] = useState([]);
  const [open, setOpen] = useState(false);
  const [eventDate, setEventDate] = useState('');
  const [adsFee, setAdsFee] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');

  const fetchEvents = () => {
    getLiveEvents().then(setEvents).catch(() => setEvents([]));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreate = async () => {
    if (!eventDate || !adsFee) {
      setMessage('Event date and ads fee are required.');
      return;
    }
    try {
      await createLiveEvent({ event_date: eventDate, ads_fee: Number(adsFee), notes });
      setMessage('Event created!');
      setOpen(false);
      setEventDate(''); setAdsFee(''); setNotes('');
      fetchEvents();
    } catch {
      setMessage('Failed to create event.');
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await deleteLiveEvent(eventId);
      setMessage('Event deleted.');
      fetchEvents();
    } catch {
      setMessage('Failed to delete event.');
    }
  };

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>Live-Selling Events</Typography>
      <Button variant="contained" color="primary" onClick={() => setOpen(true)} sx={{ mb: 2 }}>
        Create New Event
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Create Live-Selling Event</DialogTitle>
        <DialogContent>
          <TextField
            type="date"
            label="Event Date"
            value={eventDate}
            onChange={e => setEventDate(e.target.value)}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            type="number"
            label="Ads Fee (THB)"
            value={adsFee}
            onChange={e => setAdsFee(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Notes"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            fullWidth
            margin="normal"
            multiline
            minRows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Create</Button>
        </DialogActions>
      </Dialog>
      {message && <Typography color={message.includes('fail') ? 'red' : 'green'} mt={1}>{message}</Typography>}
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Event Date</TableCell>
              <TableCell>Ads Fee (THB)</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell>Event ID</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.map(event => (
              <TableRow key={event.event_id}>
                <TableCell>{event.event_date}</TableCell>
                <TableCell>฿{Number(event.ads_fee).toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                <TableCell>{event.notes || '-'}</TableCell>
                <TableCell>{event.event_id}</TableCell>
                <TableCell align="right">
                  <IconButton color="error" onClick={() => handleDelete(event.event_id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {events.length === 0 && (
              <TableRow><TableCell colSpan={5} align="center">No events found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default LiveSellingEvents;
