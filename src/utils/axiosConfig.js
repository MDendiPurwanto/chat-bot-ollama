import axios from 'axios';

// Konfigurasi base URL Ollama
axios.defaults.baseURL = 'http://localhost:11434/api';

// Interceptor untuk error handling
axios.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response ? error.response.data : error.message);
    return Promise.reject(error);
  }
);

export default axios;