import { useMemo, useState } from 'react';
import { AuthContext } from './auth-context';

function isTokenValid(token) {
  if (!token) {
    return false;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.exp) {
      return true;
    }

    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

function getStoredToken() {
  const storedToken = localStorage.getItem('token');
  if (!isTokenValid(storedToken)) {
    localStorage.removeItem('token');
    return null;
  }

  return storedToken;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getStoredToken);

  function login(newToken) {
    if (!isTokenValid(newToken)) {
      localStorage.removeItem('token');
      setToken(null);
      return;
    }

    localStorage.setItem('token', newToken);
    setToken(newToken);
  }

  function logout() {
    localStorage.removeItem('token');
    setToken(null);
  }

  const value = useMemo(
    () => ({ token, isAuthenticated: isTokenValid(token), login, logout }),
    [token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
