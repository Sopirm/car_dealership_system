import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Typography, Button, Card, CardContent, CardActions, 
  CardMedia, Grid, Chip, Box, Paper, Container
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { favoriteService, authService } from '../services/api';


const getTransmissionLabel = (transmission) => {
  switch (transmission) {
    case 'automatic': return 'Автоматическая';
    case 'manual': return 'Механическая';
    case 'robot': return 'Робот';
    case 'variator': return 'Вариатор';
    default: return transmission;
  }
};

const getConditionLabel = (condition) => {
  switch (condition) {
    case 'new': return 'Новый';
    case 'used': return 'С пробегом';
    default: return condition;
  }
};

const FavoritesPage = () => {
  const [favoriteCars, setFavoriteCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    if (!authService.isAuthenticated()) {
      setError('Вы должны войти в систему, чтобы видеть избранное');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await favoriteService.getFavorites();
      setFavoriteCars(response.data || []);
    } catch (err) {
      setError('Ошибка при загрузке избранного');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromFavorites = async (carId) => {
    try {
      await favoriteService.removeFromFavorites(carId);
      loadFavorites();
    } catch (err) {
      console.error('Ошибка при удалении из избранного', err);
    }
  };

  const getCarImage = (car) => {
    if (car.imagePath) {
      return `http://localhost:8080/${car.imagePath}`;
    }
    return 'https://via.placeholder.com/600x300?text=' + (car.brand?.name || '') + '+' + (car.model?.name || '');
  };

  if (loading) {
    return <Typography align="center" sx={{ mt: 4 }}>Загрузка...</Typography>;
  }

  if (error && !authService.isAuthenticated()) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" color="error" align="center">{error}</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button component={Link} to="/login" variant="contained" color="primary">
              Войти
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  if (error) {
    return <Typography color="error" align="center" sx={{ mt: 4 }}>{error}</Typography>;
  }

  if (favoriteCars.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" align="center">У вас нет избранных автомобилей</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button component={Link} to="/cars" variant="contained" color="primary">
              Перейти в каталог
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 2 }}>
        Избранное
      </Typography>

      <Grid container spacing={3}>
        {favoriteCars.map((car) => (
          <Grid item xs={12} sm={6} md={4} key={car.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                alt={`${car.brand?.name} ${car.model?.name}`}
                height="200"
                image={getCarImage(car)}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="div" gutterBottom>
                  {car.brand?.name} {car.model?.name} ({car.year})
                </Typography>
                <Typography color="text.secondary">{car.price.toLocaleString()} ₽</Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip 
                    label={getConditionLabel(car.condition)} 
                    color={car.condition === 'new' ? 'success' : 'primary'} 
                    size="small" 
                    sx={{ mr: 1, mb: 1 }}
                  />
                  <Chip 
                    label={getTransmissionLabel(car.transmission)} 
                    variant="outlined" 
                    size="small" 
                    sx={{ mr: 1, mb: 1 }}
                  />
                  {car.condition === 'used' && (
                    <Chip 
                      label={`${car.mileage.toLocaleString()} км`} 
                      variant="outlined" 
                      size="small" 
                      sx={{ mb: 1 }}
                    />
                  )}
                </Box>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  component={Link} 
                  to={`/cars/${car.id}`}
                >
                  Подробнее
                </Button>
                <Button
                  size="small"
                  color="error"
                  startIcon={<FavoriteIcon />}
                  onClick={() => removeFromFavorites(car.id)}
                >
                  Удалить из избранного
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default FavoritesPage; 