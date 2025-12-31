import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tokens, setTokens] = useState({
    access_token: null,
    refresh_token: null
  });

  const extractUserFromToken = useCallback((decodedToken) => {
    let userData = {
      id: decodedToken.id || decodedToken.sub,
      name: decodedToken.name || '',
      email: decodedToken.email || '',
      role: decodedToken.role || 'MEMBER',
    };

    // Add role-specific fields
    if (userData.role === 'ADMIN' || userData.role === 'SUPER_ADMIN') {
      userData.adminId = decodedToken.id;
      userData.permissions = decodedToken.permissions || [];
    } else {
      userData.memberId = decodedToken.id;
      userData.membershipNo = decodedToken.membershipNo || decodedToken.id;
      userData.status = decodedToken.status;
    }

    return userData;
  }, []);

  const checkAuthState = useCallback(async () => {
    try {
      const [accessToken, refreshToken, storedUser] = await Promise.all([
        AsyncStorage.getItem('access_token'),
        AsyncStorage.getItem('refresh_token'),
        AsyncStorage.getItem('user_info')
      ]);

      if (accessToken && refreshToken && storedUser) {
        const userData = JSON.parse(storedUser);

        // Optionally validate token expiry here
        setUser(userData);
        setTokens({
          access_token: accessToken,
          refresh_token: refreshToken
        });
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      await clearAuthStorage();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthState();
  }, [checkAuthState]);

  const clearAuthStorage = async () => {
    try {
      await AsyncStorage.multiRemove([
        'access_token',
        'refresh_token',
        'user_info'
      ]);
    } catch (error) {
      console.error('Error clearing auth storage:', error);
    }
  };

  const login = async (userData, accessToken, refreshToken) => {
    try {
      await AsyncStorage.multiSet([
        ['access_token', accessToken],
        ['refresh_token', refreshToken],
        ['user_info', JSON.stringify(userData)]
      ]);

      setUser(userData);
      setTokens({
        access_token: accessToken,
        refresh_token: refreshToken
      });
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await clearAuthStorage();
      setUser(null);
      setTokens({ access_token: null, refresh_token: null });
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const updateUser = async (updatedData) => {
    try {
      const newUserData = { ...user, ...updatedData };
      await AsyncStorage.setItem('user_info', JSON.stringify(newUserData));
      setUser(newUserData);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const refreshAccessToken = async () => {
    try {
      // Implement token refresh logic here
      // const response = await axios.post(`${BASE_URL}/refresh-token`, {
      //   refresh_token: tokens.refresh_token
      // });
      // const newAccessToken = response.data.access_token;
      // await AsyncStorage.setItem('access_token', newAccessToken);
      // setTokens(prev => ({ ...prev, access_token: newAccessToken }));
      // return newAccessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
      throw error;
    }
  };

  const value = {
    user,
    tokens,
    isAuthenticated,
    loading,
    login,
    logout,
    updateUser,
    refreshAccessToken,
    checkAuthState,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};