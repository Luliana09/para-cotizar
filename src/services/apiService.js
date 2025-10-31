import axios from 'axios';

// Configuración base de axios
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar el token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido o expirado
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH ====================

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('usuario', JSON.stringify(response.data.data.usuario));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  cambiarPassword: async (passwordActual, passwordNuevo) => {
    const response = await api.put('/auth/cambiar-password', {
      passwordActual,
      passwordNuevo
    });
    return response.data;
  },

  register: async (nombre, email, password, rol) => {
    const response = await api.post('/auth/register', {
      nombre,
      email,
      password,
      rol
    });
    return response.data;
  },

  getCurrentUser: () => {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

// ==================== CLIENTES ====================

export const clientesService = {
  getAll: async (search = '') => {
    const response = await api.get('/clientes', {
      params: { search }
    });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/clientes/${id}`);
    return response.data;
  },

  create: async (clienteData) => {
    const response = await api.post('/clientes', clienteData);
    return response.data;
  },

  update: async (id, clienteData) => {
    const response = await api.put(`/clientes/${id}`, clienteData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/clientes/${id}`);
    return response.data;
  }
};

// ==================== COTIZACIONES ====================

export const cotizacionesService = {
  getAll: async (filters = {}) => {
    const response = await api.get('/cotizaciones', {
      params: filters
    });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/cotizaciones/${id}`);
    return response.data;
  },

  create: async (cotizacionData) => {
    const response = await api.post('/cotizaciones', cotizacionData);
    return response.data;
  },

  update: async (id, cotizacionData) => {
    const response = await api.put(`/cotizaciones/${id}`, cotizacionData);
    return response.data;
  },

  cambiarEstado: async (id, estado) => {
    const response = await api.patch(`/cotizaciones/${id}/estado`, { estado });
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/cotizaciones/${id}`);
    return response.data;
  },

  getEstadisticas: async (filters = {}) => {
    const response = await api.get('/cotizaciones/stats/resumen', {
      params: filters
    });
    return response.data;
  },

  enviarParaAprobacion: async (id) => {
    const response = await api.post(`/cotizaciones/${id}/enviar-aprobacion`);
    return response.data;
  }
};

// ==================== USUARIOS ====================

export const usuariosService = {
  getAll: async () => {
    const response = await api.get('/auth/usuarios');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/auth/usuarios/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/auth/usuarios/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/auth/usuarios/${id}`);
    return response.data;
  },

  cambiarPassword: async (data) => {
    const response = await api.post('/auth/cambiar-password', data);
    return response.data;
  }
};

export default api;
