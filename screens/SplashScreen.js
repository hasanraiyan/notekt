import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

const SplashScreen = ({ navigation }) => {
  const { setIsSignedIn } = useAuth();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        if (userToken) {
          setIsSignedIn(true);
          navigation.replace('Home');
        } else {
          setIsSignedIn(false);
          navigation.replace('Login');
        }
      } catch (error) {
        console.error('Error checking login status:', error);
        // Handle error appropriately, e.g., navigate to an error screen
        navigation.replace('Login'); // Or an error screen
      }
    };

    // Delay the check to show the splash screen for a minimum amount of time
    const timer = setTimeout(checkLoginStatus, 2000);
    return () => clearTimeout(timer);
  }, [navigation, setIsSignedIn]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/icon.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>notykt</Text>
      <ActivityIndicator size="large" color="white" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#7B68EE',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default SplashScreen;
