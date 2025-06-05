import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Menu, 
  MenuItem, 
  IconButton, 
  Avatar, 
  Divider
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PersonIcon from '@mui/icons-material/Person';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { authService } from '../services/api';

const Header = ({ isAuthenticated = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  
  const user = authService.getCurrentUser();

  const isActive = (path) => {
    return location.pathname === path;
  };
  
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = () => {
    authService.logout();
    navigate('/login');
    handleClose();
  };
  
  const handleAdminDashboard = () => {
    navigate('/admin');
    handleClose();
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <DirectionsCarIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, color: 'white' }}>
          Автосалон
        </Typography>
        <Box>
          <Button 
            color="inherit" 
            component={Link} 
            to="/cars"
            sx={{ fontWeight: isActive('/cars') ? 'bold' : 'normal' }}
          >
            Автомобили
          </Button>
          
          <Button 
            color="inherit" 
            component={Link} 
            to="/calculator"
            sx={{ fontWeight: isActive('/calculator') ? 'bold' : 'normal' }}
          >
            Калькулятор
          </Button>
          {isAuthenticated && !authService.isAdmin() && (
            <Button 
              color="inherit" 
              component={Link} 
              to="/favorites"
              sx={{ fontWeight: isActive('/favorites') ? 'bold' : 'normal' }}
              startIcon={<FavoriteIcon />}
            >
              Избранное
            </Button>
          )}
          {isAuthenticated && authService.isAdmin() && (
            <>
              <Button 
                color="inherit" 
                component={Link} 
                to="/admin"
                sx={{ fontWeight: isActive('/admin') ? 'bold' : 'normal' }}
              >
                Админ-панель
              </Button>
              <Button 
                color="inherit" 
                component={Link} 
                to="/customers"
                sx={{ fontWeight: isActive('/customers') ? 'bold' : 'normal' }}
              >
                Покупатели
              </Button>
              <Button 
                color="inherit" 
                component={Link} 
                to="/shops"
                sx={{ fontWeight: isActive('/shops') ? 'bold' : 'normal' }}
              >
                Автосалоны
              </Button>
              <Button 
                color="inherit" 
                component={Link} 
                to="/employees"
                sx={{ fontWeight: isActive('/employees') ? 'bold' : 'normal' }}
              >
                Сотрудники
              </Button>
              <Button 
                color="inherit" 
                component={Link} 
                to="/sales"
                sx={{ fontWeight: isActive('/sales') ? 'bold' : 'normal' }}
                startIcon={<ReceiptIcon />}
              >
                Продажи
              </Button>
            </>
          )}
        </Box>
        
        {isAuthenticated ? (
          <Box sx={{ ml: 2 }}>
            <IconButton
              size="large"
              aria-label="учетная запись пользователя"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.dark' }}>
                {user?.username?.charAt(0).toUpperCase() || 'A'}
              </Avatar>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem disabled>
                <Typography variant="body2">
                  Вы вошли как <strong>{user?.username || 'Пользователь'}</strong>
                </Typography>
              </MenuItem>
              <Divider />
              {user?.isAdmin && (
                <MenuItem onClick={handleAdminDashboard}>
                  <DashboardIcon fontSize="small" sx={{ mr: 1 }} />
                  Панель администратора
                </MenuItem>
              )}
              <MenuItem onClick={handleLogout}>
                <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                Выйти
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box sx={{ ml: 2 }}>
            <Button
              color="inherit"
              component={Link}
              to="/login"
              sx={{ mr: 1 }}
              startIcon={<AccountCircleIcon />}
            >
              Войти
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/register"
              variant="outlined"
              sx={{ color: 'white', borderColor: 'rgba(255, 255, 255, 0.5)' }}
            >
              Регистрация
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header; 