import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/authScreen/LoginScreen';
import SignupScreen from '../screens/authScreen/SignupScreen';
import HomeScreen from '../screens/HomeScreen';
import NotesDetailScreen from '../screens/NotesDetailScreen';
import AccountScreen from '../screens/settings/AccountScreen';
import AboutScreen from '../screens/settings/AboutScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';


const Stack = createStackNavigator();

export const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Splash" component={SplashScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Signup" component={SignupScreen} />
  </Stack.Navigator>
);

export const AppStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="NoteDetail" component={NotesDetailScreen} />
    <Stack.Screen name="About" component={AboutScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen name="Account" component={AccountScreen} />
  </Stack.Navigator>
);
