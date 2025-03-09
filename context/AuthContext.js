import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        setIsSignedIn(!!token && validateToken(token));
      } catch (e) {
        console.error("Error in checkAuthStatus", e)
      }
    };
    checkAuthStatus();
  }, []);

  const validateToken = (token) => {
    // In a real app, you would validate the token with the server
    // For this example, we just check if the token exists
    return !!token;
  };

  const signIn = async () => {
    await AsyncStorage.setItem('userToken', 'dummy-auth-token');
    setIsSignedIn(true);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('userToken');
    setIsSignedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isSignedIn, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
