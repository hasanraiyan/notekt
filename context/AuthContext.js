import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

const HARDCODED_USERNAME = 'user';
const HARDCODED_PASSWORD = 'password';

export const AuthProvider = ({ children }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      setIsSignedIn(!!token);
    } catch (e) {
      console.error("Error in checkAuthStatus", e);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const signIn = async (username, password, navigation) => {
    if (username === HARDCODED_USERNAME && password === HARDCODED_PASSWORD) {
      try {
        await AsyncStorage.setItem('userToken', 'real-auth-token');
        setIsSignedIn(true);
      } catch (error) {
        Alert.alert("Login Failed", "Something went wrong.");
        console.error("Login Error:", error);
      }
    } else {
      Alert.alert("Login Failed", "Invalid credentials.");
    }
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('userToken');
    setIsSignedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isSignedIn, setIsSignedIn, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
