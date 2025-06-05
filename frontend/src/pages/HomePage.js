import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Typography, Button, Paper, Grid, Card, CardContent, 
  CardMedia, Box, Divider, CardActions
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PeopleIcon from '@mui/icons-material/People';
import StoreIcon from '@mui/icons-material/Store';
import CalculateIcon from '@mui/icons-material/Calculate';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { carService, marketService, authService } from '../services/api';

const HomePage = () => {
  const [expensiveCar, setExpensiveCar] = useState(null);
  const [marketRatio, setMarketRatio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (authService.isAdmin()) {
          const expensiveCarResponse = await carService.getMostExpensiveCar();
          setExpensiveCar(expensiveCarResponse.data);
          const marketRatioResponse = await marketService.getMarketRatio();
          setMarketRatio(marketRatioResponse.data);
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных для домашней страницы', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div>
      <Paper sx={{ p: 4, textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Информационная система автосалона
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Управление каталогом автомобилей и работа с покупателями
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Button 
            variant="contained" 
            color="primary" 
            component={Link} 
            to="/cars"
            size="large"
            sx={{ mr: 2 }}
          >
            Каталог автомобилей
          </Button>
          <Button
            variant="outlined"
            component={Link}
            to="/calculator"
            size="large"
          >
            Калькулятор импорта
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={4}>
        <Grid item xs={12} md={authService.isAuthenticated() && authService.isAdmin() ? 6 : 12}>
          <Typography variant="h5" gutterBottom>
            Быстрые ссылки
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={authService.isAuthenticated() && authService.isAdmin() ? 6 : 6}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <DirectionsCarIcon fontSize="large" color="primary" />
                  <Typography variant="h6" sx={{ mt: 1 }}>
                    Автомобили
                  </Typography>
                  <Button 
                    component={Link} 
                    to="/cars" 
                    variant="text" 
                    sx={{ mt: 1 }}
                  >
                    Каталог автомобилей
                  </Button>
                  <Button 
                    component={Link} 
                    to="/cars/new" 
                    variant="text" 
                  >
                    Новые автомобили
                  </Button>
                  <Button 
                    component={Link} 
                    to="/cars/low-mileage" 
                    variant="text"
                  >
                    Малый пробег
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={authService.isAuthenticated() ? 6 : 6}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <CalculateIcon fontSize="large" color="primary" />
                  <Typography variant="h6" sx={{ mt: 1 }}>
                    Калькулятор
                  </Typography>
                  <Button 
                    component={Link} 
                    to="/calculator" 
                    variant="text" 
                    sx={{ mt: 1 }}
                  >
                    Расчет импорта
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            {authService.isAuthenticated() && (
              <>
                {authService.isAdmin() && (
                  <>
                    <Grid item xs={6}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <PeopleIcon fontSize="large" color="primary" />
                          <Typography variant="h6" sx={{ mt: 1 }}>
                            Покупатели
                          </Typography>
                          <Button 
                            component={Link} 
                            to="/customers" 
                            variant="text" 
                            sx={{ mt: 1 }}
                          >
                            Список покупателей
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <StoreIcon fontSize="large" color="primary" />
                          <Typography variant="h6" sx={{ mt: 1 }}>
                            Автосалоны
                          </Typography>
                          <Button 
                            component={Link} 
                            to="/shops" 
                            variant="text" 
                            sx={{ mt: 1 }}
                          >
                            Список автосалонов
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <AdminPanelSettingsIcon fontSize="large" color="primary" />
                          <Typography variant="h6" sx={{ mt: 1 }}>
                            Админ-панель
                          </Typography>
                          <Button 
                            component={Link} 
                            to="/admin" 
                            variant="text" 
                            sx={{ mt: 1 }}
                          >
                            Открыть
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  </>
                )}
              </>
            )}
          </Grid>
        </Grid>

        {authService.isAuthenticated() && authService.isAdmin() && (
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              Статистика
            </Typography>
            <Paper sx={{ p: 3 }}>
              {loading ? (
                <Typography>Загрузка данных...</Typography>
              ) : (
                <>
                  <Typography variant="h6">
                    Самый дорогой автомобиль
                  </Typography>
                  {expensiveCar && (
                    <Box sx={{ display: 'flex', mt: 2, mb: 3 }}>
                      <CardMedia
                        component="img"
                        sx={{ width: 120, height: 80, objectFit: 'cover' }}
                        image={`https://via.placeholder.com/120x80?text=${expensiveCar.brand?.name || ''}_${expensiveCar.model?.name || ''}`}
                        alt={`${expensiveCar.brand?.name || ''} ${expensiveCar.model?.name || ''}`}
                      />
                      <Box sx={{ ml: 2 }}>
                        <Typography variant="subtitle1">
                          {expensiveCar.brand?.name || ''} {expensiveCar.model?.name || ''}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {expensiveCar.year} г., {expensiveCar.enginePower} л.с.
                        </Typography>
                        <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                          {expensiveCar.price.toLocaleString()} ₽
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="h6">
                    Соотношение спроса и предложения
                  </Typography>
                  {marketRatio && (
                    <Box sx={{ mt: 2 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'white', textAlign: 'center' }}>
                            <Typography variant="body2">Бюджет покупателей</Typography>
                            <Typography variant="h6">
                              {marketRatio.totalCustomerBudget.toLocaleString()} ₽
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6}>
                          <Paper sx={{ p: 2, bgcolor: 'secondary.light', color: 'white', textAlign: 'center' }}>
                            <Typography variant="body2">Стоимость автомобилей</Typography>
                            <Typography variant="h6">
                              {marketRatio.totalCarPrice.toLocaleString()} ₽
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>

                      <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Typography variant="body2">
                          Соотношение бюджетов покупателей к стоимости автомобилей
                        </Typography>
                        <Typography variant="h5" sx={{ mt: 1 }}>
                          {marketRatio.ratio.toFixed(2)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {marketRatio.ratio > 1 
                            ? 'Покупательная способность превышает предложение' 
                            : 'Предложение превышает покупательную способность'}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </>
              )}
            </Paper>
          </Grid>
        )}
      </Grid>
    </div>
  );
};

export default HomePage; 