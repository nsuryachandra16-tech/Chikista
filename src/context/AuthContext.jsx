import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      const token = localStorage.getItem('chikitsa_token');
      const storedUser = localStorage.getItem('chikitsa_user');
      
      if (token && storedUser && storedUser !== 'undefined') {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          
          // Background verification
          const response = await fetch('/api/auth/verify', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            if (data.error === 'User no longer exists') {
              console.warn('Session desync: User no longer exists in DB');
              logout();
              window.location.href = '/login';
            }
          }
        } catch (e) {
          console.error('Session initialization failed', e);
          logout();
        }
      }
      setLoading(false);
    };

    checkSession();
  }, []);

  const login = async (email, password) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { error: text || 'An unexpected error occurred' };
    }
    
    if (!response.ok) throw new Error(data.error || 'Request failed');

    if (data.token && data.user) {
      localStorage.setItem('chikitsa_token', data.token);
      localStorage.setItem('chikitsa_user', JSON.stringify(data.user));
      setUser(data.user);
    }
    return data.user;
  };

  const signup = async (email, password, name) => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { error: text || 'An unexpected error occurred' };
    }
    
    if (!response.ok) throw new Error(data.error || 'Signup failed');

    // No auto login until verification is complete
    return data;
  };

  const loginWithGoogle = async () => {
    // For now, this requires Firebase. Since the user said "no need firebase rn", 
    // I will disable this or point it to a mock local auth if they really want it.
    // Given the "mysql only" request, I'll provide a friendly error or just rely on email/pass.
    throw new Error('Google Login is currently disabled in SQL mode.');
  };

  const logout = () => {
    if (localStorage.getItem('chikitsa_token')) {
      localStorage.removeItem('chikitsa_token');
      localStorage.removeItem('chikitsa_user');
      setUser(null);
    }
  };

  const isRedirecting = React.useRef(false);

  /**
   * Helper for making authenticated requests that handles session desync
   */
  const authFetch = async (url, options = {}) => {
    const token = localStorage.getItem('chikitsa_token');
    
    if (!token && !isRedirecting.current) {
       isRedirecting.current = true;
       window.location.href = '/login';
       throw new Error('No authentication token');
    }

    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401 || response.status === 403) {
      if (!isRedirecting.current) {
        isRedirecting.current = true;
        logout();
        window.location.href = '/login';
        throw new Error('Session invalid or expired');
      }
    }

    return response;
  };

  const updateProfile = async (profileData) => {
    const response = await authFetch('/api/user', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { error: text || 'An unexpected error occurred' };
    }
    
    if (!response.ok) {
      throw new Error(data.error || 'Update failed');
    }

    if (data) {
      localStorage.setItem('chikitsa_user', JSON.stringify(data));
      setUser(data);
    }
    return data;
  };

  const upgradeSubscription = async () => {
    const response = await authFetch('/api/subscription/upgrade', {
      method: 'POST'
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { error: text || 'An unexpected error occurred' };
    }
    
    if (!response.ok) throw new Error(data.error || 'Upgrade failed');

    if (data.user) {
      localStorage.setItem('chikitsa_user', JSON.stringify(data.user));
      setUser(data.user);
    }
    return data.user;
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading, loginWithGoogle, updateProfile, upgradeSubscription, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
