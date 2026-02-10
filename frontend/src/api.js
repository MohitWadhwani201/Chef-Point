import axios from "axios";

const API = axios.create({
  baseURL:   import.meta.env.REACT_APP_API_URL ,
});

// Attach token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Centralized error handling
API.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong";

    return Promise.reject(new Error(message));
  }
);

export const authApi = {
  login: (data) => API.post("/auth/login", data),
  register: (data) => API.post("/auth/register", data),
};

export const recipesApi = {
  generate: (ingredients) => API.post("/recipes/generate", { ingredients }),
  save: (recipe) => API.post("/recipes/save", recipe),
  fetchMyRecipes: () => API.get("/recipes/my-recipes"),
  update: (id, editedContent) => API.put(`/recipes/${id}`, { editedContent }),
  delete: (id) => API.delete(`/recipes/${id}`),
};

export default API;
