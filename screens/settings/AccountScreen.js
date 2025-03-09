import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView,
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  ScrollView,
  Alert,
  Image,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';

const AccountScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const [name, setName] = useState('User');
  const [email, setEmail] = useState('user@example.com');
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const parsedData = JSON.parse(userData);
          setName(parsedData.name || 'User');
          setEmail(parsedData.email || 'user@example.com');
        }
      } catch (error) {
        console.error('Failed to load account data', error);
      }
    };
    loadData();
  }, []);
  
  const saveUserData = async () => {
    try {
      const userData = { name, email };
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      setIsEditing(false);
      Alert.alert('Success', 'Your account information has been updated.');
    } catch (error) {
      console.error('Failed to save user data', error);
      Alert.alert('Error', 'Failed to update account information. Please try again.');
    }
  };
  
  const toggleEditMode = () => {
    if (isEditing) {
      saveUserData();
    } else {
      setIsEditing(true);
    }
  };
  
  const cancelEditing = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const parsedData = JSON.parse(userData);
        setName(parsedData.name || 'User');
        setEmail(parsedData.email || 'user@example.com');
      }
    } catch (error) {
      console.error('Failed to load original account data', error);
    }
    setIsEditing(false);
  };
  
  const changePassword = () => {
    Alert.alert(
      'Change Password',
      'This feature will be available in a future update.',
      [{ text: 'OK' }]
    );
  };
  
  const deleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => {
            Alert.alert('Coming Soon', 'This feature will be available in a future update.', [{ text: 'OK' }]);
          }
        }
      ]
    );
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: theme.secondaryBackground }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={theme.textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textColor }]}>Account</Text>
        <TouchableOpacity 
          style={[styles.editButton, { backgroundColor: theme.primary }]}
          onPress={toggleEditMode}
        >
          <Text style={styles.editButtonText}>
            {isEditing ? 'Save' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <Image
            source={require('../../assets/images/icon.png')}
            style={[styles.profileImage, { backgroundColor: theme.primary }]}
          />
          <TouchableOpacity style={[styles.changePhotoButton, { backgroundColor: theme.secondaryBackground }]}>
            <Text style={[styles.changePhotoText, { color: theme.primary }]}>Change Photo</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.formSection}>
          <View style={[styles.inputGroup, { borderBottomColor: theme.secondaryBackground }]}>
            <Text style={[styles.inputLabel, { color: theme.textColor }]}>Name</Text>
            {isEditing ? (
              <TextInput
                style={[styles.textInput, { backgroundColor: theme.secondaryBackground, color: theme.textColor }]}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={theme.secondaryTextColor}
              />
            ) : (
              <Text style={[styles.inputValue, { backgroundColor: theme.secondaryBackground, color: theme.textColor }]}>{name}</Text>
            )}
          </View>
          
          <View style={[styles.inputGroup, { borderBottomColor: theme.secondaryBackground }]}>
            <Text style={[styles.inputLabel, { color: theme.textColor }]}>Email</Text>
            {isEditing ? (
              <TextInput
                style={[styles.textInput, { backgroundColor: theme.secondaryBackground, color: theme.textColor }]}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={theme.secondaryTextColor}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            ) : (
              <Text style={[styles.inputValue, { backgroundColor: theme.secondaryBackground, color: theme.textColor }]}>{email}</Text>
            )}
          </View>
          
          {isEditing && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={cancelEditing}
            >
              <Text style={[styles.cancelButtonText, { color: theme.textColor }]}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.securitySection}>
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>Security</Text>
          <TouchableOpacity 
            style={[styles.securityOption, { borderBottomColor: theme.secondaryBackground }]}
            onPress={changePassword}
          >
            <Ionicons name="lock-closed-outline" size={22} color={theme.primary} />
            <Text style={[styles.securityOptionText, { color: theme.textColor }]}>Change Password</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.textColor} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.securityOption, { borderBottomColor: theme.secondaryBackground }]}
            onPress={deleteAccount}
          >
            <Ionicons name="trash-outline" size={22} color="#EF4444" />
            <Text style={[styles.deleteAccountText, { color: theme.textColor }]}>Delete Account</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.textColor} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  changePhotoButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  changePhotoText: {
    fontWeight: '600',
  },
  formSection: {
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputValue: {
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  textInput: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  cancelButton: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  cancelButtonText: {
    fontWeight: '600',
  },
  securitySection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  securityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  securityOptionText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
  },
  deleteAccountText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
  },
});

export default AccountScreen;
