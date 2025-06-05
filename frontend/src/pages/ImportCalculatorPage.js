import React, { useState } from 'react';
import { 
  Typography, TextField, Button, Paper, Grid, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import { calculatorService } from '../services/api';

const ImportCalculatorPage = () => {
  const [formData, setFormData] = useState({
    carPrice: '',
    carYear: new Date().getFullYear(),
    engineVolume: '',
    enginePower: '',
    country: 'ЕС'
  });
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const calculationData = {
        carPrice: parseFloat(formData.carPrice),
        carYear: parseInt(formData.carYear),
        engineVolume: parseFloat(formData.engineVolume),
        enginePower: parseInt(formData.enginePower),
        country: formData.country
      };

      const response = await calculatorService.calculateImport(calculationData);
      setResult(response.data);
    } catch (err) {
      setError('Ошибка при расчете стоимости. Пожалуйста, проверьте введенные данные.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 30 }, (_, i) => currentYear - i);

  return (
    <div>
      <Typography variant="h4" component="h1" className="page-title">
        Калькулятор стоимости автомобиля из-за границы
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <form onSubmit={handleSubmit}>
              <Typography variant="h6" gutterBottom>
                Введите данные об автомобиле
              </Typography>
              
              <div className="form-row">
                <TextField
                  fullWidth
                  label="Стоимость автомобиля"
                  name="carPrice"
                  value={formData.carPrice}
                  onChange={handleChange}
                  type="number"
                  required
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </div>
              
              <div className="form-row">
                <TextField
                  fullWidth
                  select
                  label="Год выпуска"
                  name="carYear"
                  value={formData.carYear}
                  onChange={handleChange}
                  required
                >
                  {yearOptions.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </TextField>
              </div>
              
              <div className="form-row">
                <TextField
                  fullWidth
                  label="Объем двигателя (л)"
                  name="engineVolume"
                  value={formData.engineVolume}
                  onChange={handleChange}
                  type="number"
                  required
                  InputProps={{ inputProps: { min: 0, step: 0.1 } }}
                />
              </div>
              
              <div className="form-row">
                <TextField
                  fullWidth
                  label="Мощность двигателя (л.с.)"
                  name="enginePower"
                  value={formData.enginePower}
                  onChange={handleChange}
                  type="number"
                  required
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </div>
              
              <div className="form-row">
                <TextField
                  fullWidth
                  select
                  label="Страна импорта"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="ЕС">Европейский Союз</MenuItem>
                  <MenuItem value="США">США</MenuItem>
                  <MenuItem value="Другие">Другие страны</MenuItem>
                </TextField>
              </div>
              
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? 'Расчет...' : 'Рассчитать'}
              </Button>
              
              {error && (
                <Typography color="error" sx={{ mt: 2 }}>
                  {error}
                </Typography>
              )}
            </form>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          {result && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Результаты расчета
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Наименование</TableCell>
                      <TableCell align="right">Сумма</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Стоимость автомобиля</TableCell>
                      <TableCell align="right">{result.carPrice.toLocaleString()} ₽</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Таможенная пошлина</TableCell>
                      <TableCell align="right">{result.customsFee.toLocaleString()} ₽</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Акцизный сбор</TableCell>
                      <TableCell align="right">{result.exciseTax.toLocaleString()} ₽</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>НДС</TableCell>
                      <TableCell align="right">{result.vat.toLocaleString()} ₽</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Утилизационный сбор</TableCell>
                      <TableCell align="right">{result.utilizationFee.toLocaleString()} ₽</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Регистрационный сбор</TableCell>
                      <TableCell align="right">{result.registrationFee.toLocaleString()} ₽</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Итоговая стоимость</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {result.totalCost.toLocaleString()} ₽
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Typography variant="body2" sx={{ mt: 2 }}>
                * Расчет является приблизительным и может отличаться от фактических затрат
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </div>
  );
};

export default ImportCalculatorPage; 