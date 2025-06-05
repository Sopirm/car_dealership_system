import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Typography, Paper, Table, TableContainer, TableHead,
  TableBody, TableRow, TableCell, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Grid, Card, CardContent, TextField,
  FormControl, Select, MenuItem, InputLabel
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DateRangeIcon from '@mui/icons-material/DateRange';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PersonIcon from '@mui/icons-material/Person';
import StoreIcon from '@mui/icons-material/Store';
import { saleService, shopService } from '../services/api';

const SalesHistoryPage = () => {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSale, setSelectedSale] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    shopId: '',
  });

  const applyFilters = React.useCallback((currentSales, currentFilters) => {
    let filtered = [...currentSales];

    if (currentFilters.startDate) {
      const startDate = new Date(currentFilters.startDate);
      filtered = filtered.filter(sale => 
        new Date(sale.saleDate) >= startDate
      );
    }

    if (currentFilters.endDate) {
      const endDate = new Date(currentFilters.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(sale => 
        new Date(sale.saleDate) <= endDate
      );
    }

    if (currentFilters.brandId) {
      filtered = filtered.filter(sale => 
        sale.car?.brandId === parseInt(currentFilters.brandId));
    }

    if (currentFilters.modelId) {
      filtered = filtered.filter(sale => 
        sale.car?.modelId === parseInt(currentFilters.modelId));
    }

    if (currentFilters.shopId) {
      filtered = filtered.filter(sale => 
        sale.shopId === parseInt(currentFilters.shopId));
    }

    return filtered;
  }, []);

  useEffect(() => {
    loadSales();
    loadShops();
  }, []);

  useEffect(() => {
    const filtered = applyFilters(sales, filters);
    setFilteredSales(filtered);
  }, [sales, filters, applyFilters]);

  const loadSales = async () => {
    setLoading(true);
    try {
      const response = await saleService.getAllSales();
      setSales(response.data);
    } catch (err) {
      setError('Ошибка при загрузке истории продаж');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadShops = async () => {
    try {
      const response = await shopService.getAllShops();
      setShops(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке автосалонов', err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      shopId: '',
    });
  };

  const handleShowDetails = (sale) => {
    setSelectedSale(sale);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
  };

  const getPaymentTypeLabel = (type) => {
    switch (type) {
      case 'cash': return 'Наличные';
      case 'credit': return 'Кредит';
      case 'lease': return 'Лизинг';
      default: return type;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateTotalSales = () => {
    return filteredSales.reduce((sum, sale) => sum + sale.salePrice, 0).toLocaleString() + ' ₽';
  };

  const calculateAveragePrice = () => {
    if (filteredSales.length === 0) return '0 ₽';
    const avg = filteredSales.reduce((sum, sale) => sum + sale.salePrice, 0) / filteredSales.length;
    return Math.round(avg).toLocaleString() + ' ₽';
  };

  return (
    <div>
      <Typography variant="h4" component="h1" className="page-title">
        История продаж
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Фильтры
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Дата начала"
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Дата окончания"
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Автосалон</InputLabel>
              <Select
                name="shopId"
                value={filters.shopId}
                onChange={handleFilterChange}
                label="Автосалон"
              >
                <MenuItem value="">Все автосалоны</MenuItem>
                {shops.map(shop => (
                  <MenuItem key={shop.id} value={shop.id}>{shop.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button 
              variant="outlined" 
              onClick={resetFilters}
              fullWidth
            >
              Сбросить
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Всего продаж
              </Typography>
              <Typography variant="h5" component="div">
                {filteredSales.length} шт.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Общая сумма
              </Typography>
              <Typography variant="h5" component="div">
                {calculateTotalSales()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Средняя цена
              </Typography>
              <Typography variant="h5" component="div">
                {calculateAveragePrice()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {loading ? (
        <Typography>Загрузка...</Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : filteredSales.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6">Нет данных о продажах за выбранный период</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Измените параметры фильтрации или добавьте новые продажи
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Дата продажи</TableCell>
                <TableCell>Автомобиль</TableCell>
                <TableCell>Покупатель</TableCell>
                <TableCell>Автосалон</TableCell>
                <TableCell>Сумма</TableCell>
                <TableCell>Тип оплаты</TableCell>
                <TableCell>Менеджер</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>{sale.id}</TableCell>
                  <TableCell>{formatDate(sale.saleDate)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <DirectionsCarIcon sx={{ mr: 1, fontSize: 16 }} />
                      {sale.car?.brand?.name} {sale.car?.model?.name}
                    </Box>
                  </TableCell>
                  <TableCell>{sale.customer?.fullName}</TableCell>
                  <TableCell>{sale.shop?.name}</TableCell>
                  <TableCell>{sale.salePrice.toLocaleString()} ₽</TableCell>
                  <TableCell>
                    <Chip 
                      label={getPaymentTypeLabel(sale.paymentType)} 
                      color={sale.paymentType === 'cash' ? 'success' : 'primary'} 
                      variant={sale.paymentType === 'lease' ? 'outlined' : 'filled'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{sale.employee?.fullName}</TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      onClick={() => handleShowDetails(sale)}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="md" fullWidth>
        <DialogTitle>
          Детали продажи #{selectedSale?.id}
        </DialogTitle>
        <DialogContent>
          {selectedSale && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Информация о продаже
                </Typography>
                <Box sx={{ backgroundColor: 'background.default', p: 2, borderRadius: 1 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Дата продажи
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(selectedSale.saleDate)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Тип оплаты
                      </Typography>
                      <Typography variant="body1">
                        {getPaymentTypeLabel(selectedSale.paymentType)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Сумма сделки
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        {selectedSale.salePrice.toLocaleString()} ₽
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  <DirectionsCarIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Информация об автомобиле
                </Typography>
                <Box sx={{ backgroundColor: 'background.default', p: 2, borderRadius: 1 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Марка и модель
                      </Typography>
                      <Typography variant="body1">
                        {selectedSale.car?.brand?.name || ''} {selectedSale.car?.model?.name || ''}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Год выпуска
                      </Typography>
                      <Typography variant="body1">
                        {selectedSale.car?.year || 'Не указан'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Состояние
                      </Typography>
                      <Typography variant="body1">
                        {selectedSale.car?.condition === 'new' ? 'Новый' : 'С пробегом'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Button 
                        component={Link} 
                        to={`/cars/${selectedSale.car?.id}`} 
                        variant="outlined" 
                        size="small"
                      >
                        Перейти к автомобилю
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" gutterBottom>
                  <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Покупатель
                </Typography>
                <Box sx={{ backgroundColor: 'background.default', p: 2, borderRadius: 1 }}>
                  <Typography variant="body1" gutterBottom>
                    {selectedSale.customer?.fullName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedSale.customer?.phone}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {selectedSale.customer?.email}
                  </Typography>
                  <Button 
                    component={Link} 
                    to={`/customers/${selectedSale.customer?.id}`} 
                    variant="outlined" 
                    size="small"
                    sx={{ mt: 1 }}
                  >
                    Профиль покупателя
                  </Button>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" gutterBottom>
                  <StoreIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Информация о автосалоне
                </Typography>
                <Box sx={{ backgroundColor: 'background.default', p: 2, borderRadius: 1 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Название
                      </Typography>
                      <Typography variant="body1">
                        {selectedSale.shop?.name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Адрес
                      </Typography>
                      <Typography variant="body1">
                        {selectedSale.shop?.address}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SalesHistoryPage; 