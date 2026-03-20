import React, { createContext, useState, useEffect, useCallback } from 'react';

export const AuthContext = createContext(null);

function decodeJwt(token) {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch {
    return null;
  }
}

function isTokenExpired(token) {
  const decoded = decodeJwt(token);
  if (!decoded || !decoded.exp) return true;
  return decoded.exp * 1000 < Date.now();
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('accessToken'));
  const [loading, setLoading] = useState(true);

  const clearAuth = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }, []);

  const setAuth = useCallback((accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    setToken(accessToken);
    const decoded = decodeJwt(accessToken);
    if (decoded) {
      setUser({
        id: decoded.id || decoded.userId,
        username: decoded.username,
        displayName: decoded.displayName,
        role: decoded.role,
        email: decoded.email,
        groups: decoded.groups || []
      });
    }
  }, []);

  const login = useCallback(async (username, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }
    setAuth(data.accessToken, data.refreshToken);
    return data;
  }, [setAuth]);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });
    } catch {
      // Ignore logout errors
    }
    clearAuth();
  }, [clearAuth]);

  const refreshTokenFn = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      clearAuth();
      return null;
    }
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });
      if (!res.ok) {
        clearAuth();
        return null;
      }
      const data = await res.json();
      setAuth(data.accessToken, data.refreshToken || refreshToken);
      return data.accessToken;
    } catch {
      clearAuth();
      return null;
    }
  }, [clearAuth, setAuth]);

  useEffect(() => {
    const init = async () => {
      const storedToken = localStorage.getItem('accessToken');
      if (storedToken && !isTokenExpired(storedToken)) {
        setAuth(storedToken);
      } else if (localStorage.getItem('refreshToken')) {
        await refreshTokenFn();
      } else {
        clearAuth();
      }
      setLoading(false);
    };
    init();
  }, [setAuth, clearAuth, refreshTokenFn]);

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'admin';

  const value = {
    user,
    token,
    login,
    logout,
    refreshToken: refreshTokenFn,
    isAuthenticated,
    isAdmin,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
