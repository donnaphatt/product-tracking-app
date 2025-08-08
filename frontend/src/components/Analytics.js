

import React, { useEffect, useState } from 'react';
import { getAnalytics } from '../api';
import { Box, Typography, Paper, CircularProgress, Alert } from '@mui/material';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAnalytics()
      .then(setData)
      .catch(() => setError('Failed to fetch analytics'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>Analytics</Typography>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {data && (
        <Paper sx={{ p: 3, mt: 2 }}>
          <Typography variant="h6">Total Revenue: <b>{data.total_revenue.toLocaleString(undefined, { style: 'currency', currency: 'THB' })}</b></Typography>
          <Typography variant="h6">Total Profit: <b>{data.total_profit.toLocaleString(undefined, { style: 'currency', currency: 'THB' })}</b></Typography>
          <Typography variant="h6">Average Days in Inventory: <b>{data.average_days_in_inventory.toFixed(2)}</b></Typography>
        </Paper>
      )}
    </Box>
  );
};

export default Analytics;
