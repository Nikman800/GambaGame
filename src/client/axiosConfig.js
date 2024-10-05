// axiosConfig.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api', // Replace with your API base URL
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

export default axiosInstance;