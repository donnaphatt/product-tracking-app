import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Orders from './components/Orders';
import Analytics from './components/Analytics';
import AnalyticsPage from './components/AnalyticsPage';
import LiveSellingEvents from './components/LiveSellingEvents';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';

const navLinks = [
  { label: 'Dashboard', path: '/' },
  { label: 'Products', path: '/products' },
  { label: 'Live-Selling Events', path: '/live-events' },
  { label: 'Orders', path: '/orders' },
  { label: 'Analytics', path: '/analytics' },
];

function NavBar() {
  const location = useLocation();
  return (
    <AppBar position="static" color="primary" elevation={1}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Product Tracker
        </Typography>
        <Box>
          {navLinks.map(link => (
            <Button
              key={link.path}
              component={Link}
              to={link.path}
              color={location.pathname === link.path ? 'secondary' : 'inherit'}
              variant={location.pathname === link.path ? 'contained' : 'text'}
              sx={{ mx: 1, fontWeight: location.pathname === link.path ? 700 : 400 }}
            >
              {link.label}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

function App() {
  return (
    <Router>
      <NavBar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/live-events" element={<LiveSellingEvents />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
