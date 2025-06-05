import React, { useState, useEffect } from 'react';
import {
  Typography, Button, Paper, Grid, Card, CardContent,
  CardActions, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, Divider, Box
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import StoreIcon from '@mui/icons-material/Store';
import { shopService, carService } from '../services/api';

const ShopsPage = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [newShop, setNewShop] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    description: ''
  });
  const [shopCars, setShopCars] = useState({});

  useEffect(() => {
    loadShops();
  }, []);

  const loadShops = async () => {
    setLoading(true);
    try {
      const response = await shopService.getAllShops();
      setShops(response.data);
      
      loadCarsPerShop(response.data);
    } catch (err) {
      setError('Ошибка при загрузке списка автосалонов');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCarsPerShop = async (shopsList) => {
    try {
      const response = await carService.getAllCars();
      const allCars = response.data;
      
      const carsPerShop = {};
      
      shopsList.forEach(shop => {
        const shopCars = allCars.filter(car => car.shopId === shop.id);
        
        const totalPrice = shopCars.reduce((sum, car) => sum + car.price, 0);
        
        const newCars = shopCars.filter(car => car.condition === 'new').length;
        const usedCars = shopCars.filter(car => car.condition === 'used').length;
        
        carsPerShop[shop.id] = {
          total: shopCars.length,
          newCount: newCars,
          usedCount: usedCars,
          totalPrice
        };
      });
      
      setShopCars(carsPerShop);
    } catch (err) {
      console.error('Ошибка при загрузке статистики автомобилей', err);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewShop({
      name: '',
      address: '',
      phone: '',
      email: '',
      description: ''
    });
  };

  const handleShopChange = (e) => {
    const { name, value } = e.target;
    setNewShop(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddShop = async () => {
    if (!newShop.name.trim()) return;
    
    try {
      await shopService.createShop(newShop);
      setOpenDialog(false);
      loadShops(); 
    } catch (err) {
      console.error('Ошибка при добавлении автосалона', err);
    }
  };

  return (
    <div>
      <Typography variant="h4" component="h1" className="page-title">
        Автосалоны
      </Typography>

      <div className="action-buttons">
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Добавить автосалон
        </Button>
      </div>

      {loading ? (
        <Typography>Загрузка...</Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : shops.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <StoreIcon fontSize="large" color="action" sx={{ mb: 2, fontSize: 60, opacity: 0.3 }} />
          <Typography variant="h6">Нет автосалонов для отображения</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Добавьте первый автосалон, чтобы начать работу с системой
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
            sx={{ mt: 2 }}
          >
            Добавить автосалон
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {shops.map((shop) => (
            <Grid item xs={12} md={4} key={shop.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <StoreIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      {shop.name}
                    </Typography>
                  </Box>
                  
                  {shop.address && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Адрес:</strong> {shop.address}
                    </Typography>
                  )}
                  
                  {(shop.phone || shop.email) && (
                    <Box sx={{ mb: 1.5 }}>
                      {shop.phone && (
                        <Typography variant="body2" color="text.secondary">
                          <strong>Телефон:</strong> {shop.phone}
                        </Typography>
                      )}
                      {shop.email && (
                        <Typography variant="body2" color="text.secondary">
                          <strong>Email:</strong> {shop.email}
                        </Typography>
                      )}
                    </Box>
                  )}
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  {shopCars[shop.id] ? (
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Всего автомобилей
                        </Typography>
                        <Typography variant="h6">
                          {shopCars[shop.id].total} шт.
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Общая стоимость
                        </Typography>
                        <Typography variant="h6">
                          {shopCars[shop.id].totalPrice.toLocaleString()} ₽
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Новых
                        </Typography>
                        <Typography variant="body1">
                          {shopCars[shop.id].newCount} шт.
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          С пробегом
                        </Typography>
                        <Typography variant="body1">
                          {shopCars[shop.id].usedCount} шт.
                        </Typography>
                      </Grid>
                    </Grid>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Загрузка данных...
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* добавление автосалона */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Добавить новый автосалон</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                name="name"
                label="Название автосалона"
                type="text"
                fullWidth
                value={newShop.name}
                onChange={handleShopChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                name="address"
                label="Адрес"
                type="text"
                fullWidth
                value={newShop.address}
                onChange={handleShopChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                margin="dense"
                name="phone"
                label="Номер телефона"
                type="tel"
                fullWidth
                value={newShop.phone}
                onChange={handleShopChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                margin="dense"
                name="email"
                label="Email"
                type="email"
                fullWidth
                value={newShop.email}
                onChange={handleShopChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                name="description"
                label="Описание"
                multiline
                rows={3}
                fullWidth
                value={newShop.description}
                onChange={handleShopChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button 
            onClick={handleAddShop} 
            variant="contained" 
            color="primary"
            disabled={!newShop.name.trim()}
          >
            Добавить
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ShopsPage; 