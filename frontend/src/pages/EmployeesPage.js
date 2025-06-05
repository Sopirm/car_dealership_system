import React, { useState, useEffect } from 'react';
import {
  Typography, Button, Paper, Grid, Card, CardContent,
  CardActions, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, FormControl, InputLabel, Select, MenuItem,
  Box, Divider, IconButton, Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { employeeService, shopService } from '../services/api';

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  
  const [employeeData, setEmployeeData] = useState({
    shopId: '',
    fullName: '',
    position: 'manager',
    phone: '',
    email: '',
    hireDate: new Date().toISOString().split('T')[0],
    salary: ''
  });

  useEffect(() => {
    loadEmployees();
    loadShops();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const response = await employeeService.getAllEmployees();
      setEmployees(response.data);
    } catch (err) {
      setError('Ошибка при загрузке списка сотрудников');
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

  const handleOpenDialog = (edit = false, employee = null) => {
    if (edit && employee) {
      setEmployeeData({
        id: employee.id,
        shopId: employee.shopId,
        fullName: employee.fullName,
        position: employee.position,
        phone: employee.phone || '',
        email: employee.email || '',
        hireDate: new Date(employee.hireDate).toISOString().split('T')[0],
        salary: employee.salary
      });
      setEditMode(true);
    } else {
      setEmployeeData({
        shopId: '',
        fullName: '',
        position: 'manager',
        phone: '',
        email: '',
        hireDate: new Date().toISOString().split('T')[0],
        salary: ''
      });
      setEditMode(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
  };

  const handleOpenDeleteDialog = (employeeId) => {
    setSelectedEmployeeId(employeeId);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedEmployeeId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployeeData({
      ...employeeData,
      [name]: value
    });
  };

  const handleSubmit = async () => {
    if (!employeeData.fullName || !employeeData.shopId || !employeeData.salary) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    try {
      const empData = {
        ...employeeData,
        shopId: parseInt(employeeData.shopId),
        salary: parseInt(employeeData.salary)
      };

      if (editMode) {
        await employeeService.updateEmployee(empData.id, empData);
        alert('Данные сотрудника успешно обновлены');
      } else {
        await employeeService.createEmployee(empData);
        alert('Новый сотрудник успешно добавлен');
      }
      
      handleCloseDialog();
      loadEmployees();
    } catch (err) {
      console.error('Ошибка при сохранении данных сотрудника', err);
      alert('Произошла ошибка при сохранении данных');
    }
  };

  const handleDeleteEmployee = async () => {
    if (!selectedEmployeeId) return;
    
    try {
      await employeeService.deleteEmployee(selectedEmployeeId);
      alert('Сотрудник успешно удален');
      handleCloseDeleteDialog();
      loadEmployees();
    } catch (err) {
      console.error('Ошибка при удалении сотрудника', err);
      alert('Произошла ошибка при удалении сотрудника');
    }
  };

  const getPositionLabel = (position) => {
    switch (position) {
      case 'manager': return 'Менеджер';
      case 'salesman': return 'Продавец';
      case 'mechanic': return 'Механик';
      default: return position;
    }
  };

  return (
    <div>
      <Typography variant="h4" component="h1" className="page-title">
        Управление сотрудниками
      </Typography>

      <div className="action-buttons">
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Добавить сотрудника
        </Button>
      </div>

      {loading ? (
        <Typography>Загрузка...</Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : employees.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <PersonIcon fontSize="large" color="action" sx={{ mb: 2, fontSize: 60, opacity: 0.3 }} />
          <Typography variant="h6">Нет сотрудников для отображения</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Добавьте первого сотрудника для начала работы
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>ФИО</TableCell>
                <TableCell>Должность</TableCell>
                <TableCell>Автосалон</TableCell>
                <TableCell>Телефон</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Дата найма</TableCell>
                <TableCell>Зарплата</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.id}</TableCell>
                  <TableCell>{employee.fullName}</TableCell>
                  <TableCell>
                    <Chip 
                      label={getPositionLabel(employee.position)} 
                      color={employee.position === 'manager' ? 'primary' : 'default'}
                      variant={employee.position === 'mechanic' ? 'outlined' : 'filled'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{employee.shop?.name}</TableCell>
                  <TableCell>
                    <Typography variant="body2">{employee.phone}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{employee.email}</Typography>
                  </TableCell>
                  <TableCell>
                    {new Date(employee.hireDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{employee.salary.toLocaleString()} ₽</TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => handleOpenDialog(true, employee)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleOpenDeleteDialog(employee.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* редактирование сотрудника */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editMode ? 'Редактировать данные сотрудника' : 'Добавить нового сотрудника'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ФИО"
                name="fullName"
                value={employeeData.fullName}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Автосалон</InputLabel>
                <Select
                  name="shopId"
                  value={employeeData.shopId}
                  onChange={handleChange}
                  label="Автосалон"
                >
                  {shops.map((shop) => (
                    <MenuItem key={shop.id} value={shop.id}>
                      {shop.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Должность</InputLabel>
                <Select
                  name="position"
                  value={employeeData.position}
                  onChange={handleChange}
                  label="Должность"
                >
                  <MenuItem value="manager">Менеджер</MenuItem>
                  <MenuItem value="salesman">Продавец</MenuItem>
                  <MenuItem value="mechanic">Механик</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Телефон"
                name="phone"
                value={employeeData.phone}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={employeeData.email}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Дата найма"
                name="hireDate"
                type="date"
                value={employeeData.hireDate}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Зарплата (₽)"
                name="salary"
                type="number"
                value={employeeData.salary}
                onChange={handleChange}
                required
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={!employeeData.fullName || !employeeData.shopId || !employeeData.salary}
          >
            {editMode ? 'Сохранить' : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы действительно хотите удалить этого сотрудника?
            Это действие невозможно отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Отмена</Button>
          <Button onClick={handleDeleteEmployee} color="error" variant="contained">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default EmployeesPage; 