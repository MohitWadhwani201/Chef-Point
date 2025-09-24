import axios from 'axios';

// Base URL for API
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Add token automatically if stored in localStorage
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
};

export const recipesApi = {
  generate: (ingredients) => API.post('/recipes/generate', { ingredients }),
  save: (recipe) => API.post('/recipes/save', recipe),
  fetchMyRecipes: () => API.get('/recipes/my-recipes'),
  update: (id, editedContent) => API.put(`/recipes/${id}`, { editedContent }),
  delete: (id) => API.delete(`/recipes/${id}`),
};

export default API;
