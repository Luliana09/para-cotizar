import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/apiService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un usuario guardado en localStorage
    const usuarioGuardado = authService.getCurrentUser();
    const token = localStorage.getItem('token');

    if (usuarioGuardado && token) {
      setUsuario(usuarioGuardado);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (emailOrToken, password) => {
    // Si se proporciona un token directamente (para registro)
    if (typeof emailOrToken === 'string' && !password && typeof password === 'undefined') {
      // Es un token del registro
      return { success: true };
    }

    // Login normal con email y password
    try {
      const response = await authService.login(emailOrToken, password);
      if (response.success) {
        setUsuario(response.data.usuario);
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al iniciar sesión';
      return { success: false, message };
    }
  };

  // Función para actualizar el estado después del registro
  const updateAuth = (token, usuarioData) => {
    setUsuario(usuarioData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    authService.logout();
    setUsuario(null);
    setIsAuthenticated(false);
  };

  const value = {
    usuario,
    isAuthenticated,
    loading,
    login,
    updateAuth,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
