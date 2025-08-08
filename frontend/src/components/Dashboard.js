import React, { useEffect, useState } from 'react';
import { getProducts, getOrders, getAnalytics } from '../api';
import { Box, Typography, Paper, Grid, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      getProducts(),
      getOrders(),
      getAnalytics()
    ])
      .then(([prods, ords, an]) => {
        setProducts(prods);
        setOrders(ords);
        setAnalytics(an);
      })
      .catch(() => setError('Failed to fetch dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  const lowStock = products.filter(p => p.remaining_quantity <= 3);
  const recentOrders = orders.slice(-5).reverse();
  const recentProducts = products.slice(-5).reverse();

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">Total Products</Typography>
                <Typography variant="h4">{products.length}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">Total Orders</Typography>
                <Typography variant="h4">{orders.length}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">Total Revenue</Typography>
                <Typography variant="h4">{analytics ? analytics.total_revenue.toLocaleString(undefined, { style: 'currency', currency: 'THB' }) : '-'}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">Total Profit</Typography>
                <Typography variant="h4">{analytics ? analytics.total_profit.toLocaleString(undefined, { style: 'currency', currency: 'THB' }) : '-'}</Typography>
              </Paper>
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Recent Orders</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Order ID</TableCell>
                        <TableCell>Products</TableCell>
                        <TableCell>Revenue</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentOrders.map(order => (
                        <TableRow key={order.order_id}>
                          <TableCell>{order.order_id.slice(-6)}</TableCell>
                          <TableCell>
                            {order.products && order.products.map((item, idx) => {
                              const prod = products.find(p => String(p.product_id) === String(item.product_id));
                              return (
                                <span key={idx}>{prod ? prod.name : item.product_id} × {item.quantity}{idx < order.products.length - 1 ? ', ' : ''}</span>
                              );
                            })}
                          </TableCell>
                          <TableCell>{order.revenue.toLocaleString(undefined, { style: 'currency', currency: 'THB' })}</TableCell>
                          <TableCell>{order.status}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Low Stock Products (≤ 3)</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Remaining</TableCell>
                        <TableCell>Start Qty</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {lowStock.length === 0 ? (
                        <TableRow><TableCell colSpan={3} align="center">No low stock products</TableCell></TableRow>
                      ) : lowStock.map(product => (
                        <TableRow key={product.product_id}>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>{product.remaining_quantity}</TableCell>
                          <TableCell>{product.start_quantity}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Typography variant="h6" sx={{ mt: 3 }} gutterBottom>Recently Added Products</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Registered</TableCell>
                        <TableCell>Start Qty</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentProducts.map(product => (
                        <TableRow key={product.product_id}>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>{product.registration_date ? new Date(product.registration_date).toLocaleDateString() : ''}</TableCell>
                          <TableCell>{product.start_quantity}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default Dashboard;
