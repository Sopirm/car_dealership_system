import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { authService } from '../services/api';


const ProtectedRoute = ({ requireAdmin = false }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyAuth = async () => {
      if (!authService.isAuthenticated()) {
        setIsLoading(false);
        return;
      }

      try {
        await authService.checkAuth();
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Authentication verification failed:', err);
        authService.logout();
        setError('Ваша сессия истекла. Пожалуйста, войдите снова.');
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, []);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: window.location.pathname, error }} />;
  }

  if (requireAdmin && !authService.isAdmin()) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

export default ProtectedRoute; 