import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Typography, Button, Card, CardContent, CardActions, 
  CardMedia, Grid, Chip, Box, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, Select, MenuItem,
  FormControl, InputLabel, IconButton, Paper, Slider, Accordion,
  AccordionSummary, AccordionDetails, Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import PhotoIcon from '@mui/icons-material/Photo';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { carService, shopService, brandService, modelService, authService, favoriteService } from '../services/api';
import axios from 'axios';

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

const CarsPage = ({ newCar, lowMileage }) => {
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [shops, setShops] = useState([]);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openBrandDialog, setOpenBrandDialog] = useState(false);
  const [openModelDialog, setOpenModelDialog] = useState(false);
  const [newBrand, setNewBrand] = useState({ name: '' });
  const [newModel, setNewModel] = useState({ name: '', brandId: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [favorites, setFavorites] = useState({});
  const [currentCar, setCurrentCar] = useState({
    brandId: '',
    modelId: '',
    year: new Date().getFullYear(),
    enginePower: '',
    transmission: 'automatic',
    condition: 'new',
    mileage: 0,
    color: '',
    vin: '',
    price: '',
    shopId: '',
    inStock: true,
    imagePath: ''
  });
  const [filters, setFilters] = useState({
    brandId: '',
    modelId: '',
    yearFrom: 1900,
    yearTo: new Date().getFullYear(),
    priceFrom: '',
    priceTo: '',
    condition: '',
    transmission: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    loadCars();
    loadShops();
    loadBrands();
    
    if (authService.isAuthenticated()) {
      loadFavorites();
    }
  }, [newCar, lowMileage]);

  useEffect(() => {
    if (currentCar.brandId) {
      loadModelsByBrand(currentCar.brandId);
    } else {
      setModels([]);
    }
  }, [currentCar.brandId]);

  useEffect(() => {
    if (filters.brandId) {
      loadFilteredModels(filters.brandId);
    }
  }, [filters.brandId]);

  useEffect(() => {
    if (cars.length > 0) {
      applyFilters();
    }
  }, [cars, filters]);

  const loadCars = async () => {
    setLoading(true);
    try {
      let response;
      if (newCar) {
        response = await carService.getNewCars();
      } else if (lowMileage) {
        response = await carService.getLowMileageCars();
      } else {
        response = await carService.getAllCars();
      }
      const carsData = response.data;
      setCars(carsData);
      setFilteredCars(carsData);
    } catch (err) {
      setError('Ошибка при загрузке списка автомобилей');
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

  const loadBrands = async () => {
    try {
      const response = await brandService.getAllBrands();
      setBrands(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке брендов', err);
    }
  };

  const loadModelsByBrand = async (brandId) => {
    if (!brandId) return;
    try {
      const response = await modelService.getModelsByBrand(brandId);
      setModels(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке моделей', err);
    }
  };

  const loadFilteredModels = async (brandId) => {
    if (!brandId) return;
    try {
      const response = await modelService.getModelsByBrand(brandId);
      setModels(response.data);
      setFilters(prev => ({ ...prev, modelId: '' }));
    } catch (err) {
      console.error('Ошибка при загрузке моделей для фильтра', err);
    }
  };

  const applyFilters = () => {
    let filtered = [...cars];
    
    if (filters.brandId) {
      filtered = filtered.filter(car => car.brandId.toString() === filters.brandId.toString());
    }
    
    if (filters.modelId) {
      filtered = filtered.filter(car => car.modelId.toString() === filters.modelId.toString());
    }
    
    if (filters.yearFrom) {
      filtered = filtered.filter(car => car.year >= filters.yearFrom);
    }
    
    if (filters.yearTo) {
      filtered = filtered.filter(car => car.year <= filters.yearTo);
    }
    
    if (filters.priceFrom) {
      filtered = filtered.filter(car => car.price >= filters.priceFrom);
    }
    
    if (filters.priceTo) {
      filtered = filtered.filter(car => car.price <= filters.priceTo);
    }
    
    if (filters.condition) {
      filtered = filtered.filter(car => car.condition === filters.condition);
    }

    if (filters.transmission) {
      filtered = filtered.filter(car => car.transmission === filters.transmission);
    }
    
    setFilteredCars(filtered);
  };

  const resetFilters = () => {
    setFilters({
      brandId: '',
      modelId: '',
      yearFrom: 1900,
      yearTo: new Date().getFullYear(),
      priceFrom: '',
      priceTo: '',
      condition: '',
      transmission: ''
    });
    setFilteredCars(cars);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentCar({
      brandId: '',
      modelId: '',
      year: new Date().getFullYear(),
      enginePower: '',
      transmission: 'automatic',
      condition: 'new',
      mileage: 0,
      color: '',
      vin: '',
      price: '',
      shopId: '',
      inStock: true,
      imagePath: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentCar({
      ...currentCar,
      [name]: value
    });
  };

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const uploadImage = async () => {
    if (!selectedFile) {
      return null;
    }
    
    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', selectedFile);
    
    try {
      const response = await axios.post('http://localhost:8080/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setUploadingImage(false);
      return response.data.filepath;
    } catch (err) {
      console.error('Ошибка при загрузке изображения', err);
      setUploadingImage(false);
      return null;
    }
  };

  const handleSubmit = async () => {
    try {
      if (!currentCar.brandId || !currentCar.modelId || !currentCar.year || 
          !currentCar.enginePower || !currentCar.price || !currentCar.shopId) {
        alert('Заполните все обязательные поля');
        return;
      }

      let imagePath = null;
      if (selectedFile) {
        imagePath = await uploadImage();
      }

      const carData = {
        ...currentCar,
        brandId: parseInt(currentCar.brandId),
        modelId: parseInt(currentCar.modelId),
        year: parseInt(currentCar.year),
        enginePower: parseInt(currentCar.enginePower),
        price: parseInt(currentCar.price),
        shopId: parseInt(currentCar.shopId),
        mileage: currentCar.condition === 'new' ? 0 : parseInt(currentCar.mileage),
        color: currentCar.color || '',
        vin: currentCar.vin || '',
        arrivalDate: new Date().toISOString(),
        imagePath: imagePath || ''
      };

      await carService.createCar(carData);
      handleCloseDialog();
      loadCars(); 
    } catch (err) {
      console.error('Ошибка при добавлении автомобиля', err);
      if (err.response && err.response.data) {
        alert(`Ошибка: ${err.response.data.error || 'Не удалось добавить автомобиль'}`);
      } else {
        alert('Произошла ошибка при добавлении автомобиля');
      }
    }
  };

  const getCarImage = (car) => {
    if (car.imagePath) {
      return `http://localhost:8080/${car.imagePath}`;
    }
    return 'https://via.placeholder.com/300x150?text=' + (car.brand?.name || '') + '+' + (car.model?.name || '');
  };

  const getTitle = () => {
    if (newCar) {
      return "Новые автомобили";
    } else if (lowMileage) {
      return "Автомобили с пробегом менее 30 000 км";
    }
    return "Список всех автомобилей";
  };

  const handleOpenBrandDialog = () => {
    setOpenBrandDialog(true);
  };

  const handleCloseBrandDialog = () => {
    setOpenBrandDialog(false);
    setNewBrand({ name: '' });
  };

  const handleOpenModelDialog = () => {
    if (!currentCar.brandId) {
      alert('Сначала выберите марку автомобиля');
      return;
    }
    setNewModel({ ...newModel, brandId: currentCar.brandId });
    setOpenModelDialog(true);
  };

  const handleCloseModelDialog = () => {
    setOpenModelDialog(false);
    setNewModel({ name: '', brandId: '' });
  };

  const handleBrandChange = (e) => {
    setNewBrand({ ...newBrand, [e.target.name]: e.target.value });
  };

  const handleModelChange = (e) => {
    setNewModel({ ...newModel, [e.target.name]: e.target.value });
  };

  const handleAddBrand = async () => {
    if (!newBrand.name.trim()) {
      alert('Введите название марки');
      return;
    }

    try {
      const response = await brandService.createBrand(newBrand);
      setBrands([...brands, response.data]);
      handleCloseBrandDialog();
      alert('Марка успешно добавлена');
    } catch (err) {
      console.error('Ошибка при добавлении марки', err);
      alert('Ошибка при добавлении марки');
    }
  };

  const handleAddModel = async () => {
    if (!newModel.name.trim()) {
      alert('Введите название модели');
      return;
    }

    try {
      const response = await modelService.createModel(newModel);
      setModels([...models, response.data]);
      handleCloseModelDialog();
      alert('Модель успешно добавлена');
    } catch (err) {
      console.error('Ошибка при добавлении модели', err);
      alert('Ошибка при добавлении модели');
    }
  };

  const loadFavorites = async () => {
    if (!authService.isAuthenticated()) return;
    
    try {
      const response = await favoriteService.getFavorites();
      const favMap = {};
      response.data.forEach(car => {
        favMap[car.id] = true;
      });
      setFavorites(favMap);
    } catch (err) {
      console.error('Ошибка при загрузке избранного', err);
    }
  };

  const toggleFavorite = async (e, carId) => {
    e.preventDefault();  
    e.stopPropagation();

    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    try {
      if (favorites[carId]) {
        await favoriteService.removeFromFavorites(carId);
        setFavorites(prev => ({ ...prev, [carId]: false }));
      } else {
        await favoriteService.addToFavorites(carId);
        setFavorites(prev => ({ ...prev, [carId]: true }));
      }
    } catch (err) {
      console.error('Ошибка при работе с избранным', err);
    }
  };

  return (
    <div>
      <Typography variant="h4" component="h1" className="page-title">
        {getTitle()}
      </Typography>

      <div className="action-buttons">
        {authService.isAuthenticated() && authService.isAdmin() && (
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
          >
            Добавить автомобиль
          </Button>
        )}
        
        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          sx={{ ml: authService.isAuthenticated() ? 1 : 0 }}
          onClick={() => navigate('/cars')}
          disabled={!newCar && !lowMileage}
        >
          Все автомобили
        </Button>
        
        <Button
          variant="outlined"
          sx={{ ml: 1 }}
          onClick={() => navigate('/cars/new')}
          disabled={newCar}
        >
          Только новые
        </Button>
        
        <Button
          variant="outlined"
          sx={{ ml: 1 }}
          onClick={() => navigate('/cars/low-mileage')}
          disabled={lowMileage}
        >
          Малый пробег
        </Button>

        <Button
          variant="outlined"
          sx={{ ml: 1 }}
          startIcon={<FilterListIcon />}
          onClick={() => setShowFilters(!showFilters)}
          color={showFilters ? "primary" : "inherit"}
        >
          Фильтры
        </Button>
      </div>

      {/* фильтры */}
      {showFilters && (
        <Paper sx={{ p: 2, mt: 2, mb: 2 }}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Фильтры автомобилей</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Марка</InputLabel>
                    <Select
                      name="brandId"
                      value={filters.brandId}
                      onChange={handleFilterChange}
                      label="Марка"
                    >
                      <MenuItem value="">Все марки</MenuItem>
                      {brands.map((brand) => (
                        <MenuItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4} md={3}>
                  <FormControl fullWidth disabled={!filters.brandId}>
                    <InputLabel>Модель</InputLabel>
                    <Select
                      name="modelId"
                      value={filters.modelId}
                      onChange={handleFilterChange}
                      label="Модель"
                    >
                      <MenuItem value="">Все модели</MenuItem>
                      {models.map((model) => (
                        <MenuItem key={model.id} value={model.id}>
                          {model.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Состояние</InputLabel>
                    <Select
                      name="condition"
                      value={filters.condition}
                      onChange={handleFilterChange}
                      label="Состояние"
                    >
                      <MenuItem value="">Любое</MenuItem>
                      <MenuItem value="new">Новый</MenuItem>
                      <MenuItem value="used">С пробегом</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Коробка передач</InputLabel>
                    <Select
                      name="transmission"
                      value={filters.transmission}
                      onChange={handleFilterChange}
                      label="Коробка передач"
                    >
                      <MenuItem value="">Любая</MenuItem>
                      <MenuItem value="automatic">Автоматическая</MenuItem>
                      <MenuItem value="manual">Ручная</MenuItem>
                      <MenuItem value="robot">Робот</MenuItem>
                      <MenuItem value="variator">Вариатор</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography gutterBottom>Год выпуска</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="От"
                        type="number"
                        name="yearFrom"
                        value={filters.yearFrom}
                        onChange={handleFilterChange}
                        InputProps={{ inputProps: { min: 1900, max: new Date().getFullYear() } }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="До"
                        type="number"
                        name="yearTo"
                        value={filters.yearTo}
                        onChange={handleFilterChange}
                        InputProps={{ inputProps: { min: 1900, max: new Date().getFullYear() } }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography gutterBottom>Цена, ₽</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="От"
                        type="number"
                        name="priceFrom"
                        value={filters.priceFrom}
                        onChange={handleFilterChange}
                        InputProps={{ inputProps: { min: 0 } }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="До"
                        type="number"
                        name="priceTo"
                        value={filters.priceTo}
                        onChange={handleFilterChange}
                        InputProps={{ inputProps: { min: 0 } }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ mt: 1, mb: 2 }} />
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    onClick={resetFilters}
                    sx={{ mr: 1 }}
                  >
                    Сбросить фильтры
                  </Button>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Найдено автомобилей: {filteredCars.length}
                  </Typography>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Paper>
      )}

      {loading ? (
        <Typography>Загрузка...</Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : filteredCars.length === 0 ? (
        <Typography>Нет автомобилей для отображения</Typography>
      ) : (
        <div className="card-grid">
          {filteredCars.map((car) => (
            <Card key={car.id} className="card-grid-item">
              <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <CardMedia
                  component="img"
                  height="150"
                  image={getCarImage(car)}
                  alt={`${car.brand?.name || ''} ${car.model?.name || ''}`}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h6" component="div">
                      {car.brand?.name || ''} {car.model?.name || ''}
                    </Typography>
                    {authService.isAuthenticated() && (
                      <IconButton 
                        size="small"
                        color={favorites[car.id] ? "error" : "default"} 
                        onClick={(e) => toggleFavorite(e, car.id)}
                        aria-label={favorites[car.id] ? "Удалить из избранного" : "Добавить в избранное"}
                      >
                        {favorites[car.id] ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                      </IconButton>
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {car.year} г., {car.enginePower} л.с., {getTransmissionLabel(car.transmission)}
                  </Typography>
                  
                  <Box sx={{ mt: 1, mb: 1 }}>
                    {car.condition === 'new' ? (
                      <Chip label={getConditionLabel(car.condition)} color="success" size="small" />
                    ) : (
                      <Chip label={`Пробег: ${car.mileage} км`} color="primary" size="small" />
                    )}
                  </Box>
                  
                  <Typography variant="body1" component="div" sx={{ fontWeight: 'bold', mt: 1 }}>
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
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* добавление авто */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Добавить новый автомобиль</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Марка</InputLabel>
                <Select
                  name="brandId"
                  value={currentCar.brandId}
                  onChange={handleChange}
                  label="Марка"
                  required
                >
                  {brands.map((brand) => (
                    <MenuItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button 
                size="small" 
                startIcon={<AddIcon />}
                onClick={handleOpenBrandDialog}
                sx={{ mt: 1 }}
              >
                Добавить марку
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Модель</InputLabel>
                <Select
                  name="modelId"
                  value={currentCar.modelId}
                  onChange={handleChange}
                  label="Модель"
                  required
                  disabled={!currentCar.brandId}
                >
                  {models.map((model) => (
                    <MenuItem key={model.id} value={model.id}>
                      {model.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button 
                size="small" 
                startIcon={<AddIcon />}
                onClick={handleOpenModelDialog}
                sx={{ mt: 1 }}
                disabled={!currentCar.brandId}
              >
                Добавить модель
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Год выпуска"
                name="year"
                type="number"
                value={currentCar.year}
                onChange={handleChange}
                required
                InputProps={{ inputProps: { min: 1900, max: new Date().getFullYear() } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Мощность двигателя (л.с.)"
                name="enginePower"
                type="number"
                value={currentCar.enginePower}
                onChange={handleChange}
                required
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Коробка передач</InputLabel>
                <Select
                  name="transmission"
                  value={currentCar.transmission}
                  onChange={handleChange}
                  label="Коробка передач"
                  required
                >
                  <MenuItem value="automatic">Автоматическая</MenuItem>
                  <MenuItem value="manual">Ручная</MenuItem>
                  <MenuItem value="robot">Робот</MenuItem>
                  <MenuItem value="variator">Вариатор</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Состояние</InputLabel>
                <Select
                  name="condition"
                  value={currentCar.condition}
                  onChange={handleChange}
                  label="Состояние"
                  required
                >
                  <MenuItem value="new">Новая</MenuItem>
                  <MenuItem value="used">С пробегом</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {currentCar.condition === 'used' && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Пробег (км)"
                  name="mileage"
                  type="number"
                  value={currentCar.mileage}
                  onChange={handleChange}
                  required
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="VIN номер"
                name="vin"
                value={currentCar.vin}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Цвет"
                name="color"
                value={currentCar.color}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Цена (₽)"
                name="price"
                type="number"
                value={currentCar.price}
                onChange={handleChange}
                required
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Автосалон</InputLabel>
                <Select
                  name="shopId"
                  value={currentCar.shopId}
                  onChange={handleChange}
                  label="Автосалон"
                  required
                >
                  {shops.map((shop) => (
                    <MenuItem key={shop.id} value={shop.id}>
                      {shop.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>В наличии</InputLabel>
                <Select
                  name="inStock"
                  value={currentCar.inStock}
                  onChange={handleChange}
                  label="В наличии"
                  required
                >
                  <MenuItem value={true}>В наличии</MenuItem>
                  <MenuItem value={false}>На комиссии</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ border: '1px dashed grey', p: 2, borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Загрузить фотографию автомобиля
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<PhotoIcon />}
                  sx={{ mt: 1 }}
                >
                  Выбрать файл
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleFileSelect}
                  />
                </Button>
                {selectedFile && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Выбран файл: {selectedFile.name}
                  </Typography>
                )}
              </Box>
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

      {/* добавление марки */}
      <Dialog open={openBrandDialog} onClose={handleCloseBrandDialog}>
        <DialogTitle>Добавить новую марку</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Название марки"
            type="text"
            fullWidth
            value={newBrand.name}
            onChange={handleBrandChange}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBrandDialog}>Отмена</Button>
          <Button onClick={handleAddBrand} color="primary">
            Добавить
          </Button>
        </DialogActions>
      </Dialog>

      {/* добавление модели */}
      <Dialog open={openModelDialog} onClose={handleCloseModelDialog}>
        <DialogTitle>Добавить новую модель</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Марка</InputLabel>
            <Select
              name="brandId"
              value={newModel.brandId}
              onChange={handleModelChange}
              label="Марка"
              required
            >
              {brands.map((brand) => (
                <MenuItem key={brand.id} value={brand.id}>
                  {brand.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            name="name"
            label="Название модели"
            type="text"
            fullWidth
            value={newModel.name}
            onChange={handleModelChange}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModelDialog}>Отмена</Button>
          <Button onClick={handleAddModel} color="primary">
            Добавить
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CarsPage; 