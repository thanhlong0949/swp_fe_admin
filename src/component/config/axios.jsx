import axios from 'axios'; // Changed import to the actual axios package
const baseURL = 'https://localhost:7167/api/';

const config = {
    baseURL: baseURL,
};

const api = axios.create(config);

api.defaults.baseURL = baseURL;

const handleBefore = (config) => {
    const token = localStorage.getItem('token')?.replaceAll('"', '');
    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
};
const endAuthAdmin = () => {
    localStorage.removeItem('token');
    window.location.href = '/loginAdmin';
}


api.interceptors.request.use(handleBefore);

export default api;
export { endAuthAdmin };
