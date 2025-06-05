import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CarsPage from './pages/CarsPage';
import CustomersPage from './pages/CustomersPage';
import ShopsPage from './pages/ShopsPage';
import CarDetailPage from './pages/CarDetailPage';
import CustomerDetailPage from './pages/CustomerDetailPage';
import ImportCalculatorPage from './pages/ImportCalculatorPage';
import EmployeesPage from './pages/EmployeesPage';
import SalesHistoryPage from './pages/SalesHistoryPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import FavoritesPage from './pages/FavoritesPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useLocation } from 'react-router-dom';
import { authService } from './services/api';
import './App.css';
import RegisterPage from './pages/RegisterPage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  
  const isAuthenticated = authService.isAuthenticated();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="app">
        {!isLoginPage && <Header isAuthenticated={isAuthenticated} />}
        <main className="main-content">
          <Routes>
            {/* публичные */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/cars" element={<CarsPage />} />
            <Route path="/cars/:id" element={<CarDetailPage />} />
            <Route path="/cars/new" element={<CarsPage newCar={true} />} />
            <Route path="/cars/low-mileage" element={<CarsPage lowMileage={true} />} />
            <Route path="/calculator" element={<ImportCalculatorPage />} />

            {/* избранное */}
            <Route element={<ProtectedRoute requireAdmin={false} />}>
              <Route path="/favorites" element={<FavoritesPage />} />
            </Route>

            {/* админка */}
            <Route element={<ProtectedRoute requireAdmin={true} />}>
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/customers/:id" element={<CustomerDetailPage />} />
              <Route path="/shops" element={<ShopsPage />} />
              <Route path="/employees" element={<EmployeesPage />} />
              <Route path="/sales" element={<SalesHistoryPage />} />
            </Route>
          </Routes>
        </main>
        {!isLoginPage && <Footer />}
      </div>
    </ThemeProvider>
  );
}

export default App; 