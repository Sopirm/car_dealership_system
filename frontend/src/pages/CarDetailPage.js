import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Typography, Button, Paper, Grid, Chip, Box, Divider,
  Card, CardContent, Avatar, List, ListItem, ListItemText,
  ListItemAvatar, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import { carService, customerService, saleService, employeeService, authService, favoriteService } from '../services/api';

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

const CarDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [matchingCustomers, setMatchingCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [saleDialogOpen, setSaleDialogOpen] = useState(false);
  const [allCustomers, setAllCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [saleData, setSaleData] = useState({
    carId: '',
    customerId: '',
    shopId: '',
    salePrice: '',
    paymentType: 'cash',
    employeeId: ''
  });

  useEffect(() => {
    loadCarDetails();
    
    if (authService.isAuthenticated() && authService.isAdmin()) {
      loadAllCustomers();
      loadEmployees();
    }
    if (authService.isAuthenticated()) {
      checkIsFavorite();
    }
  }, [id]);

  useEffect(() => {
    if (car) {
      setSaleData(prev => ({
        ...prev,
        carId: car.id,
        shopId: car.shopId,
        salePrice: car.price
      }));
    }
  }, [car]);

  const loadCarDetails = async () => {
    setLoading(true);
    try {
      const response = await carService.getCarById(id);
      setCar(response.data);
      if (authService.isAuthenticated() && authService.isAdmin()) {
        loadMatchingCustomers(response.data.id);
      }
    } catch (err) {
      setError('Ошибка при загрузке информации об автомобиле');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMatchingCustomers = async (carId) => {
    setCustomersLoading(true);
    try {
      const response = await customerService.getCustomersForCar(carId);
      setMatchingCustomers(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке потенциальных покупателей', err);
    } finally {
      setCustomersLoading(false);
    }
  };

  const loadAllCustomers = async () => {
    try {
      const response = await customerService.getAllCustomers();
      setAllCustomers(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке списка клиентов', err);
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await employeeService.getAllEmployees();
      setEmployees(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке списка сотрудников', err);
    }
  };

  const checkIsFavorite = async () => {
    if (!authService.isAuthenticated()) return;
    
    try {
      const response = await favoriteService.checkIsFavorite(id);
      setIsFavorite(response.data.isFavorite);
    } catch (err) {
      console.error('Ошибка при проверке избранного', err);
    }
  };

  const toggleFavorite = async () => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    try {
      if (isFavorite) {
        await favoriteService.removeFromFavorites(id);
      } else {
        await favoriteService.addToFavorites(id);
      }
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error('Ошибка при работе с избранным', err);
    }
  };

  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  const handleOpenSaleDialog = () => {
    setSaleDialogOpen(true);
  };

  const handleCloseSaleDialog = () => {
    setSaleDialogOpen(false);
  };

  const handleDeleteCar = async () => {
    try {
      await carService.deleteCar(id);
      navigate('/cars');
    } catch (err) {
      console.error('Ошибка при удалении автомобиля', err);
    }
  };

  const handleSaleChange = (e) => {
    const { name, value } = e.target;
    setSaleData({
      ...saleData,
      [name]: value
    });
  };

  const handleSaleSubmit = async () => {
    try {
      if (!saleData.customerId || !saleData.employeeId || !saleData.salePrice) {
        alert('Пожалуйста, заполните все обязательные поля');
        return;
      }

      const saleToSubmit = {
        ...saleData,
        saleDate: new Date().toISOString(),
        carId: parseInt(saleData.carId),
        customerId: parseInt(saleData.customerId),
        shopId: parseInt(saleData.shopId),
        employeeId: parseInt(saleData.employeeId),
        salePrice: parseInt(saleData.salePrice)
      };

      await saleService.createSale(saleToSubmit);
      alert('Продажа успешно оформлена');
      setSaleDialogOpen(false);
      navigate('/sales');
    } catch (err) {
      console.error('Ошибка при оформлении продажи', err);
      alert(`Ошибка при оформлении продажи: ${err.message}`);
    }
  };

  const getCarImage = (car) => {
    if (car.imagePath) {
      return `http://localhost:8080/${car.imagePath}`;
    }
    return '/car-placeholder.png';
  };

  if (loading) {
    return <Typography>Загрузка...</Typography>;
  }

  if (error || !car) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">{error || 'Автомобиль не найден'}</Typography>
        <Button 
          component={Link} 
          to="/cars" 
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
      <Button
        component={Link}
        to="/cars"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 2 }}
      >
        Вернуться к списку
      </Button>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <img 
              src={getCarImage(car)} 
              alt={`${car.brand?.name || ''} ${car.model?.name || ''}`}
              style={{ width: '100%', borderRadius: '4px' }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {car.brand?.name} {car.model?.name} ({car.year})
              </Typography>
              {authService.isAuthenticated() && (
                <Button
                  variant="outlined"
                  color={isFavorite ? "error" : "primary"}
                  startIcon={isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  onClick={toggleFavorite}
                >
                  {isFavorite ? 'В избранном' : 'Добавить в избранное'}
                </Button>
              )}
            </Box>
            
            <Chip 
              label={car.condition === 'new' ? 'Новый автомобиль' : `Пробег: ${car.mileage} км`}
              color={car.condition === 'new' ? 'success' : 'primary'} 
              sx={{ mb: 2 }}
            />

            <Typography variant="h5" color="primary" gutterBottom>
              {car.price?.toLocaleString()} ₽
            </Typography>

            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Год выпуска
                </Typography>
                <Typography variant="body1">
                  {car.year}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Мощность двигателя
                </Typography>
                <Typography variant="body1">
                  {car.enginePower} л.с.
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Коробка передач
                </Typography>
                <Typography variant="body1">
                  {getTransmissionLabel(car.transmission)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Автосалон
                </Typography>
                <Typography variant="body1">
                  {car.shop?.name || 'Не указан'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Особенности
                </Typography>
                <Typography variant="body1">
                  {car.features || 'Нет данных'}
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              {authService.isAuthenticated() && authService.isAdmin() && (
                <>
                  <Button 
                    variant="contained" 
                    color="primary"
                    startIcon={<ShoppingCartIcon />}
                    onClick={handleOpenSaleDialog}
                    disabled={!car.inStock}
                  >
                    Оформить покупку
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleOpenDeleteDialog}
                  >
                    Удалить
                  </Button>
                </>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Характеристики
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Марка</Typography>
                <Typography variant="body1">{car.brand?.name || ''}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Модель</Typography>
                <Typography variant="body1">{car.model?.name || ''}</Typography>
              </Grid>
              
              <Grid item xs={6} sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">Год выпуска</Typography>
                <Typography variant="body1">{car.year}</Typography>
              </Grid>
              <Grid item xs={6} sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">Состояние</Typography>
                <Typography variant="body1">{getConditionLabel(car.condition)}</Typography>
              </Grid>
              
              <Grid item xs={6} sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">Мощность</Typography>
                <Typography variant="body1">{car.enginePower} л.с.</Typography>
              </Grid>
              <Grid item xs={6} sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">Коробка передач</Typography>
                <Typography variant="body1">{getTransmissionLabel(car.transmission)}</Typography>
              </Grid>
              
              {car.condition !== 'new' && (
                <Grid item xs={6} sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">Пробег</Typography>
                  <Typography variant="body1">{car.mileage.toLocaleString()} км</Typography>
                </Grid>
              )}
              
              {car.features && (
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">Особенности</Typography>
                  <Typography variant="body1">{car.features}</Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
          
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Информация об автосалоне
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {car.shop?.name || 'Не указан'}
                  </Typography>
                </Box>
              </Grid>
              
              {car.shop?.address && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationOnIcon color="action" fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {car.shop.address}
                    </Typography>
                  </Box>
                </Grid>
              )}
              
              {car.shop?.phone && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PhoneIcon color="action" fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {car.shop.phone}
                    </Typography>
                  </Box>
                </Grid>
              )}
              
              {car.shop?.email && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EmailIcon color="action" fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {car.shop.email}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={5}>
          {authService.isAuthenticated() && authService.isAdmin() && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Потенциальные покупатели
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {customersLoading ? (
                <Typography>Загрузка списка потенциальных покупателей...</Typography>
              ) : matchingCustomers.length === 0 ? (
                <Typography>Нет подходящих покупателей</Typography>
              ) : (
                <List>
                  {matchingCustomers.map((customer) => (
                    <Card key={customer.id} sx={{ mb: 2 }}>
                      <CardContent sx={{ pb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                            <PersonIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1">
                              {customer.fullName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {customer.phone || customer.email || 'Нет контактов'}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Предпочтения: {customer.preferredBrand} {customer.preferredModel}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Бюджет до: {customer.maxPrice.toLocaleString()} ₽
                          </Typography>
                        </Box>
                        
                        <Button 
                          component={Link}
                          to={`/customers/${customer.id}`}
                          size="small"
                          sx={{ mt: 1 }}
                        >
                          Подробнее
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </List>
              )}
            </Paper>
          )}
        </Grid>
      </Grid>
      
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы действительно хотите удалить автомобиль {car.brand?.name || ''} {car.model?.name || ''}?
            Это действие невозможно отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Отмена</Button>
          <Button onClick={handleDeleteCar} color="error" variant="contained">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      {/* оформление продажи */}
      <Dialog open={saleDialogOpen} onClose={handleCloseSaleDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Оформление продажи автомобиля</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              {car?.brand?.name} {car?.model?.name}, {car?.year} г.
            </Typography>

            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Покупатель</InputLabel>
                  <Select
                    name="customerId"
                    value={saleData.customerId}
                    onChange={handleSaleChange}
                    label="Покупатель"
                  >
                    {allCustomers.map((customer) => (
                      <MenuItem key={customer.id} value={customer.id}>
                        {customer.fullName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Цена продажи (₽)"
                  name="salePrice"
                  type="number"
                  value={saleData.salePrice}
                  onChange={handleSaleChange}
                  required
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Тип оплаты</InputLabel>
                  <Select
                    name="paymentType"
                    value={saleData.paymentType}
                    onChange={handleSaleChange}
                    label="Тип оплаты"
                  >
                    <MenuItem value="cash">Наличные</MenuItem>
                    <MenuItem value="credit">Кредит</MenuItem>
                    <MenuItem value="lease">Лизинг</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Менеджер продажи</InputLabel>
                  <Select
                    name="employeeId"
                    value={saleData.employeeId}
                    onChange={handleSaleChange}
                    label="Менеджер продажи"
                  >
                    {employees.map((employee) => (
                      <MenuItem key={employee.id} value={employee.id}>
                        {employee.fullName} ({employee.position})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSaleDialog}>Отмена</Button>
          <Button 
            onClick={handleSaleSubmit} 
            variant="contained" 
            color="primary"
            disabled={!saleData.customerId || !saleData.employeeId || !saleData.salePrice}
          >
            Оформить продажу
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CarDetailPage; 