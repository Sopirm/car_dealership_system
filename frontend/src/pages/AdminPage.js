import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  Button,
  Paper
} from '@mui/material';
import { Link } from 'react-router-dom';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PeopleIcon from '@mui/icons-material/People';
import StoreIcon from '@mui/icons-material/Store';
import WorkIcon from '@mui/icons-material/Work';
import TimelineIcon from '@mui/icons-material/Timeline';
import CalculateIcon from '@mui/icons-material/Calculate';
import { authService } from '../services/api';

const AdminPage = () => {
  const user = authService.getCurrentUser();
  
  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mb: 4, mt: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Панель администратора
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1">
            Добро пожаловать, <strong>{user?.username || 'Администратор'}</strong>!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Выберите раздел для управления
          </Typography>
        </Box>
      </Paper>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <DirectionsCarIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
                <Typography variant="h6">Управление автомобилями</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Добавление, редактирование и удаление автомобилей в каталоге.
              </Typography>
            </CardContent>
            <CardActions>
              <Button component={Link} to="/cars" size="small">Открыть каталог автомобилей</Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <PeopleIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
                <Typography variant="h6">Управление клиентами</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Работа с базой клиентов, контакты и предпочтения.
              </Typography>
            </CardContent>
            <CardActions>
              <Button component={Link} to="/customers" size="small">Открыть базу клиентов</Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <WorkIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
                <Typography variant="h6">Управление персоналом</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Добавление и управление сотрудниками автосалона.
              </Typography>
            </CardContent>
            <CardActions>
              <Button component={Link} to="/employees" size="small">Управление сотрудниками</Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <StoreIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
                <Typography variant="h6">Управление автосалонами</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Управление филиалами и автосалонами сети.
              </Typography>
            </CardContent>
            <CardActions>
              <Button component={Link} to="/shops" size="small">Управление автосалонами</Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TimelineIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
                <Typography variant="h6">История продаж</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Статистика и отчеты по продажам автомобилей.
              </Typography>
            </CardContent>
            <CardActions>
              <Button component={Link} to="/sales" size="small">Просмотр истории продаж</Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <CalculateIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
                <Typography variant="h6">Калькулятор импорта</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Расчет стоимости импорта автомобилей из-за рубежа.
              </Typography>
            </CardContent>
            <CardActions>
              <Button component={Link} to="/calculator" size="small">Открыть калькулятор</Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminPage; 