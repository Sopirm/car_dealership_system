import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Alert,
  CircularProgress,
  Divider 
} from '@mui/material';
import { authService } from '../services/api';

const RegisterPage = () => {
  const [userData, setUserData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    fullName: ''
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (authService.isAuthenticated()) {
    return <Navigate to="/" />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // валидация формы
  const validateForm = () => {
    const newErrors = {};
    
    if (!userData.username.trim()) {
      newErrors.username = 'Имя пользователя обязательно';
    } else if (userData.username.length < 3) {
      newErrors.username = 'Имя пользователя должно содержать минимум 3 символа';
    }
    
    if (!userData.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (userData.password.length < 6) {
      newErrors.password = 'Пароль должен содержать минимум 6 символов';
    }
    
    if (userData.password !== userData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!userData.email) {
      newErrors.email = 'Email обязателен';
    } else if (!emailRegex.test(userData.email)) {
      newErrors.email = 'Введите корректный email';
    }
    
    if (!userData.fullName.trim()) {
      newErrors.fullName = 'ФИО обязательно';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setServerError('');
    setLoading(true);
    
    try {
      const { confirmPassword, ...registerData } = userData;
      const response = await authService.register(registerData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      navigate('/');
    } catch (err) {
      console.error('Ошибка регистрации:', err);
      setServerError(
        err.response?.data?.error || 
        'Произошла ошибка при регистрации. Пожалуйста, попробуйте еще раз.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="80vh"
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Регистрация
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 3 }}>
            Создайте личный аккаунт для доступа к автосалону
          </Typography>
          
          {serverError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {serverError}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Имя пользователя"
              name="username"
              value={userData.username}
              onChange={handleChange}
              margin="normal"
              error={!!errors.username}
              helperText={errors.username}
              required
              autoFocus
            />
            
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={userData.email}
              onChange={handleChange}
              margin="normal"
              error={!!errors.email}
              helperText={errors.email}
              required
            />
            
            <TextField
              fullWidth
              label="ФИО"
              name="fullName"
              value={userData.fullName}
              onChange={handleChange}
              margin="normal"
              error={!!errors.fullName}
              helperText={errors.fullName}
              required
            />
            
            <TextField
              fullWidth
              label="Пароль"
              name="password"
              type="password"
              value={userData.password}
              onChange={handleChange}
              margin="normal"
              error={!!errors.password}
              helperText={errors.password}
              required
            />
            
            <TextField
              fullWidth
              label="Повторите пароль"
              name="confirmPassword"
              type="password"
              value={userData.confirmPassword}
              onChange={handleChange}
              margin="normal"
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              required
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Зарегистрироваться'}
            </Button>
            
            <Divider sx={{ my: 2 }} />
            
            <Box display="flex" justifyContent="center">
              <Typography variant="body2">
                Уже зарегистрированы?{' '}
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  Войти
                </Link>
              </Typography>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterPage; 