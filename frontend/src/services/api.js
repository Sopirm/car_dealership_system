import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// аутентификация
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  checkAuth: () => api.get('/auth/check'),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
  isAdmin: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user).isAdmin : false;
  },
};

// автомобили
export const carService = {
  getAllCars: () => api.get('/cars'),
  getCarById: (id) => api.get(`/cars/${id}`),
  createCar: (car) => api.post('/admin/cars', car),
  updateCar: (id, car) => api.put(`/admin/cars/${id}`, car),
  deleteCar: (id) => api.delete(`/admin/cars/${id}`),
  getNewCars: () => api.get('/cars/new'),
  getLowMileageCars: () => api.get('/cars/low-mileage'),
  getMostExpensiveCar: () => api.get('/cars/most-expensive'),
};

// покупатели
export const customerService = {
  getAllCustomers: () => api.get('/customers'),
  getCustomerById: (id) => api.get(`/customers/${id}`),
  createCustomer: (customer) => api.post('/admin/customers', customer),
  updateCustomer: (id, customer) => api.put(`/admin/customers/${id}`, customer),
  deleteCustomer: (id) => api.delete(`/admin/customers/${id}`),
  getCustomersByModel: (model) => api.get(`/customers/by-model?model=${model}`),
  getCustomersForCar: (carId) => api.get(`/customers/match-car/${carId}`),
};

// автосалоны
export const shopService = {
  getAllShops: () => api.get('/shops'),
  getShopById: (id) => api.get(`/shops/${id}`),
  createShop: (shop) => api.post('/admin/shops', shop),
};

// марки 
export const brandService = {
  getAllBrands: () => api.get('/brands'),
  getBrandById: (id) => api.get(`/brands/${id}`),
  createBrand: (brand) => api.post('/admin/brands', brand),
};

// модели
export const modelService = {
  getAllModels: () => api.get('/models'),
  getModelsByBrand: (brandId) => api.get(`/brands/${brandId}/models`),
  createModel: (model) => api.post('/admin/models', model),
};

// расчеты
export const calculatorService = {
  calculateMonthlyPayment: (data) => api.post('/calculator/monthly-payment', data),
  calculateTotalCost: (data) => api.post('/calculator/total-cost', data),
  calculateImport: (data) => api.post('/calculator/import', data),
};

// рыночная статистика
export const marketService = {
  getMarketRatio: () => api.get('/market/ratio'),
};

// сотрудники
export const employeeService = {
  getAllEmployees: () => api.get('/employees'),
  getEmployeeById: (id) => api.get(`/employees/${id}`),
  createEmployee: (employee) => api.post('/admin/employees', employee),
  updateEmployee: (id, employee) => api.put(`/admin/employees/${id}`, employee),
  deleteEmployee: (id) => api.delete(`/admin/employees/${id}`),
};

// продажи
export const saleService = {
  getAllSales: () => api.get('/sales'),
  getSaleById: (id) => api.get(`/sales/${id}`),
  createSale: (sale) => api.post('/admin/sales', sale),
};

// избранные автомобили
export const favoriteService = {
  getFavorites: () => api.get('/user/favorites'),
  addToFavorites: (carId) => api.post(`/user/favorites/${carId}`),
  removeFromFavorites: (carId) => api.delete(`/user/favorites/${carId}`),
  checkIsFavorite: (carId) => api.get(`/user/favorites/${carId}`),
};

export default api; 