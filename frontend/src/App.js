import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Orders from './components/Orders';
import Analytics from './components/Analytics';
import AnalyticsPage from './components/AnalyticsPage';
import LiveSellingEvents from './components/LiveSellingEvents';
import Login from './components/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppBar, Toolbar, Typography, Button, Container, Box, CircularProgress } from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';

const navLinks = [
  { label: 'Dashboard', path: '/' },
  { label: 'Products', path: '/products' },
  { label: 'Live-Selling Events', path: '/live-events' },
  { label: 'Orders', path: '/orders' },
  { label: 'Analytics', path: '/analytics' },
];

function NavBar() {
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <AppBar position="static" color="primary" elevation={1}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Product Tracker
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
          <Button
            onClick={handleLogout}
            color="inherit"
            startIcon={<LogoutIcon />}
            sx={{ ml: 2, fontWeight: 400 }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

function AppContent() {
  const { isAuthenticated, loading, login } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={login} />;
  }

  return (
    <>
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
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
