import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Typography, Button, Paper, Grid, Chip, Box, Divider,
  Card, CardContent, CardActions, CardMedia, Avatar
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import SettingsIcon from '@mui/icons-material/Settings';
import { customerService, carService } from '../services/api';

const CustomerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [matchingCars, setMatchingCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [carsLoading, setCarsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCustomer();
  }, [id]);

  const loadCustomer = async () => {
    setLoading(true);
    try {
      const response = await customerService.getCustomerById(id);
      setCustomer(response.data);
      loadMatchingCars();
    } catch (err) {
      setError('Ошибка при загрузке информации о покупателе');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMatchingCars = async () => {
    setCarsLoading(true);
    try {
      const response = await carService.getAllCars();
      const allCars = response.data;
      
      const filteredCars = allCars.filter(car => {
        if (car.price > customer.maxPrice) return false;
        if (customer.preferredBrand && customer.preferredBrand !== '' && 
            car.brand?.name !== customer.preferredBrand) return false;
        if (customer.preferredModel && customer.preferredModel !== '' && 
            car.model?.name !== customer.preferredModel) return false;
        if (customer.condition && customer.condition !== '' && 
            car.condition !== customer.condition) return false;
        if (customer.yearFrom > 0 && car.year < customer.yearFrom) return false;
        if (customer.yearTo > 0 && car.year > customer.yearTo) return false;
        return true;
      });
      setMatchingCars(filteredCars);
    } catch (err) {
      console.error('Ошибка при загрузке подходящих автомобилей', err);
    } finally {
      setCarsLoading(false);
    }
  };

  const handleDeleteCustomer = async () => {
    try {
      await customerService.deleteCustomer(id);
      navigate('/customers');
    } catch (err) {
      console.error('Ошибка при удалении покупателя', err);
    }
  };

  const getCarImage = (car) => {
    return 'https://via.placeholder.com/300x150?text=' + (car.brand?.name || '') + '+' + (car.model?.name || '');
  };

  if (loading) {
    return <Typography>Загрузка...</Typography>;
  }

  if (error || !customer) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">{error || 'Покупатель не найден'}</Typography>
        <Button 
          component={Link} 
          to="/customers" 
          variant="contained" 
          sx={{ mt: 2 }}
          startIcon={<ArrowBackIcon />}
        >
          Вернуться к списку
        </Button>
      </Paper>
    );
  }

  return (
    <div>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button 
          component={Link} 
          to="/customers" 
          variant="outlined"
          startIcon={<ArrowBackIcon />}
        >
          Назад к списку
        </Button>
        <Button 
          variant="outlined" 
          color="error" 
          startIcon={<DeleteIcon />}
          onClick={handleDeleteCustomer}
        >
          Удалить
        </Button>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64, mr: 2 }}>
                <PersonIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h5">{customer.fullName}</Typography>
                <Typography variant="body1" color="text.secondary">{customer.contacts}</Typography>
              </Box>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              Предпочтения покупателя
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Марка</Typography>
                <Typography variant="body1">
                  {customer.preferredBrand || 'Любая'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Модель</Typography>
                <Typography variant="body1">
                  {customer.preferredModel || 'Любая'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">Год выпуска</Typography>
                <Typography variant="body1">
                  {customer.yearFrom && customer.yearTo 
                    ? `${customer.yearFrom} - ${customer.yearTo}`
                    : customer.yearFrom 
                      ? `От ${customer.yearFrom}`
                      : customer.yearTo 
                        ? `До ${customer.yearTo}`
                        : 'Любой'
                  }
                </Typography>
              </Grid>
              
              <Grid item xs={6} sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">Состояние</Typography>
                <Typography variant="body1">
                  {customer.condition || 'Любое'}
                </Typography>
              </Grid>
              
              <Grid item xs={6} sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">Максимальная цена</Typography>
                <Typography variant="h6" color="primary.main">
                  {customer.maxPrice.toLocaleString()} ₽
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Подходящие автомобили
              </Typography>
              <DirectionsCarIcon color="primary" />
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {carsLoading ? (
              <Typography>Загрузка подходящих автомобилей...</Typography>
            ) : matchingCars.length === 0 ? (
              <Typography>Нет подходящих автомобилей для этого покупателя</Typography>
            ) : (
              <Grid container spacing={2}>
                {matchingCars.map((car) => (
                  <Grid item xs={12} md={6} key={car.id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardMedia
                        component="img"
                        height="140"
                        image={getCarImage(car)}
                        alt={`${car.brand?.name || ''} ${car.model?.name || ''}`}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" component="div">
                          {car.brand?.name || ''} {car.model?.name || ''}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {car.year} г., {car.enginePower} л.с.
                        </Typography>
                        
                        <Box sx={{ mt: 1 }}>
                          {car.condition === 'новая' ? (
                            <Chip label="Новый" color="success" size="small" />
                          ) : (
                            <Chip label={`Пробег: ${car.mileage} км`} color="primary" size="small" />
                          )}
                        </Box>
                        
                        <Typography variant="h6" sx={{ mt: 2, color: car.price <= customer.maxPrice ? 'success.main' : 'error.main' }}>
                          {car.price.toLocaleString()} ₽
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button 
                          size="small" 
                          component={Link} 
                          to={`/cars/${car.id}`}
                        >
                          Подробнее
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default CustomerDetailPage; 