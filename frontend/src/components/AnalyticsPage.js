import React, { useEffect, useState } from 'react';
import { getOrders } from '../api';
import { Box, Typography, Paper, CircularProgress, Alert, Grid, TextField, MenuItem } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#1976d2', '#26a69a', '#ef5350', '#ffa726', '#ab47bc', '#66bb6a', '#ff7043', '#29b6f6'];

function getTopProducts(orders, topN = 5) {
  const productMap = {};
  orders.forEach(order => {
    (order.products || []).forEach(item => {
      const key = item.product_id;
      if (!productMap[key]) productMap[key] = { product_id: key, quantity: 0, revenue: 0 };
      productMap[key].quantity += item.quantity || 0;
      productMap[key].revenue += (item.quantity || 0) * (item.price || 0);
    });
  });
  return Object.values(productMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, topN);
}

function getChannelBreakdown(orders) {
  const channelMap = {};
  orders.forEach(order => {
    const key = order.sales_channel || 'Unknown';
    if (!channelMap[key]) channelMap[key] = { channel: key, revenue: 0, orders: 0 };
    channelMap[key].revenue += Number(order.revenue || 0);
    channelMap[key].orders += 1;
  });
  return Object.values(channelMap);
}

const AnalyticsPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [series, setSeries] = useState([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [channelData, setChannelData] = useState([]);
  const [profit, setProfit] = useState(0);
  const [avgOrderValue, setAvgOrderValue] = useState(0);
  const [topProductName, setTopProductName] = useState('');
  const [topChannel, setTopChannel] = useState('');

  useEffect(() => {
    getOrders()
      .then(data => {
        setOrders(data);
        setFilteredOrders(data);
        // Group by sold_date
        const grouped = {};
        data.forEach(order => {
          if (!order.sold_date) return;
          if (!grouped[order.sold_date]) grouped[order.sold_date] = { sold_date: order.sold_date, revenue: 0, orders: 0 };
          grouped[order.sold_date].revenue += Number(order.revenue || 0);
          grouped[order.sold_date].orders += 1;
        });
        // Convert to sorted array
        const arr = Object.values(grouped).sort((a, b) => new Date(a.sold_date) - new Date(b.sold_date));
        setSeries(arr);

        // Top products and channels
        setTopProducts(getTopProducts(data));
        setChannelData(getChannelBreakdown(data));

        // Profit and AOV (use backend-calculated total_cost and profit)
        const totalProfit = data.reduce((sum, o) => sum + Number(o.profit || 0), 0);
        setProfit(totalProfit);
        setAvgOrderValue(data.length ? data.reduce((sum, o) => sum + Number(o.revenue || 0), 0) / data.length : 0);
        // Top product and channel names
        const topProd = getTopProducts(data, 1)[0];
        setTopProductName(topProd ? topProd.product_id : '-');
        const topChan = getChannelBreakdown(data).sort((a, b) => b.orders - a.orders)[0];
        setTopChannel(topChan ? topChan.channel : '-');
      })
      .catch(() => setError('Failed to fetch orders'))
      .finally(() => setLoading(false));
  }, []);

  // Date filtering
  const handleDateChange = (field) => (e) => {
    const val = e.target.value;
    setDateRange(prev => ({ ...prev, [field]: val }));
    // Filter orders by date
    if (field === 'start') {
      setFilteredOrders(orders.filter(o => (!val || o.sold_date >= val) && (!dateRange.end || o.sold_date <= dateRange.end)));
    } else {
      setFilteredOrders(orders.filter(o => (!dateRange.start || o.sold_date >= dateRange.start) && (!val || o.sold_date <= val)));
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>Analytics</Typography>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={2}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">Total Orders</Typography>
                <Typography variant="h4">{filteredOrders.length}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">Total Revenue</Typography>
                <Typography variant="h4">฿{filteredOrders.reduce((sum, o) => sum + Number(o.revenue || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">Total Profit</Typography>
                <Typography variant="h4">฿{filteredOrders.reduce((sum, o) => sum + (Number(o.revenue || 0) - Number(o.total_cost || 0)), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">Avg. Order Value</Typography>
                <Typography variant="h4">฿{filteredOrders.length ? (filteredOrders.reduce((sum, o) => sum + Number(o.revenue || 0), 0) / filteredOrders.length).toLocaleString('en-US', { minimumFractionDigits: 2 }) : 0}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">Top Product</Typography>
                <Typography variant="h4">{topProductName}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">Top Channel</Typography>
                <Typography variant="h4">{topChannel}</Typography>
              </Paper>
            </Grid>
          </Grid>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Start Date"
                type="date"
                value={dateRange.start}
                onChange={handleDateChange('start')}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="End Date"
                type="date"
                value={dateRange.end}
                onChange={handleDateChange('end')}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
          </Grid>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>Revenue Over Time</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={series} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sold_date" />
                <YAxis />
                <Tooltip formatter={v => `฿${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2 })}`} />
                <Line type="monotone" dataKey="revenue" stroke="#1976d2" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>Orders Over Time</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={series} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sold_date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="orders" stroke="#ef5350" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>Top Products (by Quantity)</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="product_id" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="quantity" fill="#1976d2">
                  {topProducts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>Sales Channel Breakdown</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={channelData} dataKey="orders" nameKey="channel" cx="50%" cy="50%" outerRadius={100} label>
                  {channelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default AnalyticsPage;
