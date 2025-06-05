import React, { useState, useEffect } from 'react';
import {
  Typography, Button, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, Grid,
  FormControl, InputLabel, Select, MenuItem, IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { customerService, brandService, modelService } from '../services/api';

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [modelFilter, setModelFilter] = useState('');
  const [currentCustomer, setCurrentCustomer] = useState({
    fullName: '',
    contacts: '',
    preferredBrand: '',
    preferredModel: '',
    yearFrom: '',
    yearTo: '',
    condition: '',
    maxPrice: ''
  });

  useEffect(() => {
    loadCustomers();
    loadBrands();
  }, []);

  useEffect(() => {
    if (currentCustomer.preferredBrand) {
      loadModelsByBrand(currentCustomer.preferredBrand);
    } else {
      setModels([]);
    }
  }, [currentCustomer.preferredBrand]);

  const loadCustomers = async (model = '') => {
    setLoading(true);
    try {
      let response;
      if (model) {
        response = await customerService.getCustomersByModel(model);
      } else {
        response = await customerService.getAllCustomers();
      }
      setCustomers(response.data);
    } catch (err) {
      setError('Ошибка при загрузке списка покупателей');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadBrands = async () => {
    try {
      const response = await brandService.getAllBrands();
      setBrands(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке брендов', err);
    }
  };

  const loadModelsByBrand = async (brandName) => {
    try {
      const brand = brands.find(b => b.name === brandName);
      if (brand) {
        const response = await modelService.getModelsByBrand(brand.id);
        setModels(response.data);
      } else {
        setModels([]);
      }
    } catch (err) {
      console.error('Ошибка при загрузке моделей', err);
      setModels([]);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentCustomer({
      fullName: '',
      contacts: '',
      preferredBrand: '',
      preferredModel: '',
      yearFrom: '',
      yearTo: '',
      condition: '',
      maxPrice: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentCustomer({
      ...currentCustomer,
      [name]: value
    });
    if (name === 'preferredBrand') {
      setCurrentCustomer(prev => ({
        ...prev,
        preferredModel: ''
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      const customerData = {
        ...currentCustomer,
        yearFrom: currentCustomer.yearFrom ? parseInt(currentCustomer.yearFrom) : 0,
        yearTo: currentCustomer.yearTo ? parseInt(currentCustomer.yearTo) : 0,
        maxPrice: parseInt(currentCustomer.maxPrice)
      };

      await customerService.createCustomer(customerData);
      handleCloseDialog();
      loadCustomers(); 
    } catch (err) {
      console.error('Ошибка при добавлении покупателя', err);
    }
  };

  const handleDeleteCustomer = async (id) => {
    try {
      await customerService.deleteCustomer(id);
      loadCustomers();
    } catch (err) {
      console.error('Ошибка при удалении покупателя', err);
    }
  };

  const handleModelFilterChange = (e) => {
    setModelFilter(e.target.value);
  };

  const handleFilter = () => {
    loadCustomers(modelFilter);
  };

  const clearFilter = () => {
    setModelFilter('');
    loadCustomers();
  };

  return (
    <div>
      <Typography variant="h4" component="h1" className="page-title">
        Управление покупателями
      </Typography>

      <div className="action-buttons">
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Добавить покупателя
        </Button>

        <Paper
          component="form"
          sx={{ p: '2px 4px', ml: 2, display: 'flex', alignItems: 'center', width: 400 }}
        >
          <TextField
            sx={{ ml: 1, flex: 1 }}
            placeholder="Фильтр по модели"
            value={modelFilter}
            onChange={handleModelFilterChange}
          />
          <IconButton type="button" sx={{ p: '10px' }} onClick={handleFilter}>
            <SearchIcon />
          </IconButton>
          {modelFilter && (
            <Button size="small" onClick={clearFilter}>
              Очистить
            </Button>
          )}
        </Paper>
      </div>

      {loading ? (
        <Typography>Загрузка...</Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : customers.length === 0 ? (
        <Typography>Нет покупателей для отображения</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Полное имя</TableCell>
                <TableCell>Контакты</TableCell>
                <TableCell>Предпочтения</TableCell>
                <TableCell>Год выпуска</TableCell>
                <TableCell>Состояние</TableCell>
                <TableCell>Макс. цена</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.fullName}</TableCell>
                  <TableCell>{customer.contacts}</TableCell>
                  <TableCell>
                    {customer.preferredBrand && customer.preferredModel 
                      ? `${customer.preferredBrand} ${customer.preferredModel}`
                      : customer.preferredBrand || customer.preferredModel || 'Не указано'
                    }
                  </TableCell>
                  <TableCell>
                    {customer.yearFrom && customer.yearTo 
                      ? `${customer.yearFrom}-${customer.yearTo}`
                      : customer.yearFrom 
                        ? `от ${customer.yearFrom}`
                        : customer.yearTo 
                          ? `до ${customer.yearTo}`
                          : 'Не указано'
                    }
                  </TableCell>
                  <TableCell>{customer.condition || 'Любое'}</TableCell>
                  <TableCell>{customer.maxPrice.toLocaleString()} ₽</TableCell>
                  <TableCell>
                    <IconButton 
                      edge="end" 
                      color="error" 
                      onClick={() => handleDeleteCustomer(customer.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Добавить нового покупателя</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Полное имя"
                name="fullName"
                value={currentCustomer.fullName}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Контактная информация"
                name="contacts"
                value={currentCustomer.contacts}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Предпочитаемая марка</InputLabel>
                <Select
                  name="preferredBrand"
                  value={currentCustomer.preferredBrand}
                  onChange={handleChange}
                  label="Предпочитаемая марка"
                >
                  <MenuItem value="">Не выбрано</MenuItem>
                  {brands.map((brand) => (
                    <MenuItem key={brand.id} value={brand.name}>
                      {brand.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={!currentCustomer.preferredBrand}>
                <InputLabel>Предпочитаемая модель</InputLabel>
                <Select
                  name="preferredModel"
                  value={currentCustomer.preferredModel}
                  onChange={handleChange}
                  label="Предпочитаемая модель"
                >
                  <MenuItem value="">Не выбрано</MenuItem>
                  {models.map((model) => (
                    <MenuItem key={model.id} value={model.name}>
                      {model.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Год выпуска от"
                name="yearFrom"
                type="number"
                value={currentCustomer.yearFrom}
                onChange={handleChange}
                InputProps={{ inputProps: { min: 1900 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Год выпуска до"
                name="yearTo"
                type="number"
                value={currentCustomer.yearTo}
                onChange={handleChange}
                InputProps={{ inputProps: { min: 1900 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Состояние</InputLabel>
                <Select
                  name="condition"
                  value={currentCustomer.condition}
                  onChange={handleChange}
                  label="Состояние"
                >
                  <MenuItem value="">Любое</MenuItem>
                  <MenuItem value="новая">Новая</MenuItem>
                  <MenuItem value="с пробегом">С пробегом</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Максимальная цена (₽)"
                name="maxPrice"
                type="number"
                value={currentCustomer.maxPrice}
                onChange={handleChange}
                required
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Добавить
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CustomersPage; 