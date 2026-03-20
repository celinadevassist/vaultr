import { useCallback } from 'react';
import { useAuth } from './useAuth';

export function useApi() {
  const { token, refreshToken, logout } = useAuth();

  const request = useCallback(async (method, url, body, options = {}) => {
    const headers = {
      ...(body && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    };

    let res = await fetch(url, {
      method,
      headers,
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined
    });

    if (res.status === 401 && token) {
      const newToken = await refreshToken();
      if (newToken) {
        headers.Authorization = `Bearer ${newToken}`;
        res = await fetch(url, {
          method,
          headers,
          body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined
        });
      } else {
        logout();
        throw new Error('Session expired. Please log in again.');
      }
    }

    if (options.raw) return res;

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.error || `Request failed with status ${res.status}`);
    }

    return data;
  }, [token, refreshToken, logout]);

  const get = useCallback((url, options) => request('GET', url, null, options), [request]);
  const post = useCallback((url, body, options) => request('POST', url, body, options), [request]);
  const put = useCallback((url, body, options) => request('PUT', url, body, options), [request]);
  const del = useCallback((url, options) => request('DELETE', url, null, options), [request]);

  return { get, post, put, del };
}
