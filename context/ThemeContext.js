import React, { createContext, useState, useContext, useEffect } from 'react';
import { lightMode, darkMode } from '../constants/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const deviceTheme = useColorScheme();
  const [themePreference, setThemePreference] = useState('system');
  const [isDarkMode, setIsDarkMode] = useState(deviceTheme === 'dark');

  // Initialize theme from storage on component mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const storedPreference = await AsyncStorage.getItem('themePreference');
        if (storedPreference) {
          setThemePreference(storedPreference);
          if (storedPreference === 'light') {
            setIsDarkMode(false);
          } else if (storedPreference === 'dark') {
            setIsDarkMode(true);
          } else {
            // System preference
            setIsDarkMode(deviceTheme === 'dark');
          }
        }
      } catch (error) {
        console.error('Failed to load theme preference', error);
      }
    };

    loadThemePreference();
  }, [deviceTheme]);

  // Update theme when device theme changes if set to system
  useEffect(() => {
    if (themePreference === 'system') {
      setIsDarkMode(deviceTheme === 'dark');
    }
  }, [deviceTheme, themePreference]);

  const setThemeMode = async (mode) => {
    try {
      setThemePreference(mode);
      await AsyncStorage.setItem('themePreference', mode);

      if (mode === 'system') {
        setIsDarkMode(deviceTheme === 'dark');
      } else {
        setIsDarkMode(mode === 'dark');
      }
    } catch (error) {
      console.error('Failed to save theme preference', error);
    }
  };

  const toggleTheme = async () => {
    const newMode = isDarkMode ? 'light' : 'dark';
    await setThemeMode(newMode);
  };

  // Enhanced theme with additional properties
  const theme = isDarkMode ? {
    ...darkMode,
    headerBackground: darkMode.background,
    borderColor: '#303030',
    shadowColor: '#000000',
    tertiaryTextColor: '#9E9E9E',
    inactiveColor: '#555555',
    inputBackground: '#252525',
    cardShadow: 'rgba(0, 0, 0, 0.4)'
  } : {
    ...lightMode,
    headerBackground: lightMode.background,
    borderColor: '#E5E5E5',
    shadowColor: '#000000',
    tertiaryTextColor: '#9E9E9E',
    inactiveColor: '#D1D1D1',
    inputBackground: '#F9F9F9',
    cardShadow: 'rgba(0, 0, 0, 0.1)'
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      isDarkMode, 
      toggleTheme,
      themePreference,
      setThemeMode
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);