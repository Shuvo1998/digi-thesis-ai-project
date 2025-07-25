import axios from 'axios';

const api = axios.create({
    baseURL: 'https://digi-thesis-ai-project.onrender.com/api',
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['x-auth-token'] = token;
    }
    return config;
});

export default api;
