import axios from 'axios';

//export const API_BASE_URL = 'https://gesthora.onrender.com';
export const API_BASE_URL = 'http://localhost:3306';

export const api = {
  baseURL: API_BASE_URL,
  endpoints: {
    login: '/login',
    adminProfile: '/admin/profile',
    employeeProfile: '/employee/profile',
    companies: '/companies',
    createUser: '/create-user',
    clockIn: '/employee/clock-in',
    clockInToday: '/employee/clock-in/today',
    workTime: '/employee/work-time',
    resetPassword: '/employee/reset-password/send-code',
    editUser: '/edit-user',
    findUser: '/find-user',
    managerEmployees: '/manager/employees',
    managerEmployee: (id: string) => `/manager/employee/${id}`,
  },
};

// Interceptor global para tratar token inválido
axios.interceptors.response.use(
  response => response,
  error => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403 ||
        (error.response.data && error.response.data.message === 'Token inválido ou não fornecido'))
    ) {
      localStorage.removeItem('token');
      localStorage.removeItem('perfil');
      localStorage.removeItem('nome');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
); 