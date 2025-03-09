// App.js
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from './context/AuthContext';
import { initDB } from './database/database';
import { AuthStack, AppStack } from './navigation/NavigationStacks';
import { ThemeProvider, useTheme } from './context/ThemeContext';

const MainNavigator = () => {
  const { isSignedIn } = useAuth();
  const { theme } = useTheme();

  return (
    <NavigationContainer theme={{ colors: { background: theme.background } }}>
      {isSignedIn ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default function App() {
  initDB();

  return (
    <ThemeProvider>
      <AuthProvider>
        <MainNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}
