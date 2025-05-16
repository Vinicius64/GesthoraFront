export const API_BASE_URL = 'https://gesthora.onrender.com';

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
  },
}; 