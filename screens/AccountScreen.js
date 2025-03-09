// AccountScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  ScrollView,
  Alert,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AccountScreen = ({ navigation }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [name, setName] = useState('User');
  const [email, setEmail] = useState('user@example.com');
  const [isEditing, setIsEditing] = useState(false);
  
  // Load user data and theme preference
  useEffect(() => {
    const loadData = async () => {
      try {
        const darkMode = await AsyncStorage.getItem('darkMode');
        const userData = await AsyncStorage.getItem('userData');
        
        setIsDarkMode(darkMode === 'true');
        
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
  
  // Save user data
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
  
  // Toggle edit mode
  const toggleEditMode = () => {
    if (isEditing) {
      // If currently editing, save changes
      saveUserData();
    } else {
      // Enter edit mode
      setIsEditing(true);
    }
  };
  
  // Cancel editing
  const cancelEditing = () => {
    // Reset to original values
    const loadOriginalData = async () => {
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
    };
    
    loadOriginalData();
    setIsEditing(false);
  };
  
  // Change password
  const changePassword = () => {
    Alert.alert(
      'Change Password',
      'This feature will be available in a future update.',
      [{ text: 'OK' }]
    );
  };
  
  // Delete account
  const deleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be lost.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Coming Soon',
              'This feature will be available in a future update.',
              [{ text: 'OK' }]
            );
          },
        },
      ]
    );
  };
  
  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color={isDarkMode ? "white" : "black"}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>Account</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={toggleEditMode}
        >
          <Text style={styles.editButtonText}>
            {isEditing ? 'Save' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileSection}>
          <Image
            source={require('../assets/images/icon.png')}
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.changePhotoButton}>
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>
              Name
            </Text>
            {isEditing ? (
              <TextInput
                style={[styles.textInput, isDarkMode && styles.darkTextInput]}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor="#9CA3AF"
              />
            ) : (
              <Text style={[styles.inputValue, isDarkMode && styles.darkText]}>
                {name}
              </Text>
            )}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>
              Email
            </Text>
            {isEditing ? (
              <TextInput
                style={[styles.textInput, isDarkMode && styles.darkTextInput]}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            ) : (
              <Text style={[styles.inputValue, isDarkMode && styles.darkText]}>
                {email}
              </Text>
            )}
          </View>
          
          {isEditing && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={cancelEditing}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.securitySection}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            Security
          </Text>
          
          <TouchableOpacity 
            style={styles.securityOption}
            onPress={changePassword}
          >
            <Ionicons name="lock-closed-outline" size={22} color="#7B68EE" />
            <Text style={[styles.securityOptionText, isDarkMode && styles.darkText]}>
              Change Password
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.securityOption}
            onPress={deleteAccount}
          >
            <Ionicons name="trash-outline" size={22} color="#EF4444" />
            <Text style={styles.deleteAccountText}>
              Delete Account
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
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
    backgroundColor: '#7B68EE',
  },
  editButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  darkText: {
    color: 'white',
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
    backgroundColor: '#EDE9FE',
    marginBottom: 15,
  },
  changePhotoButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  changePhotoText: {
    color: '#7B68EE',
    fontWeight: '600',
  },
  formSection: {
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#6B7280',
  },
  inputValue: {
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  textInput: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    color: '#111827',
  },
  darkTextInput: {
    backgroundColor: '#2D2D2D',
    color: 'white',
  },
  cancelButton: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#6B7280',
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
    borderBottomColor: '#E5E7EB',
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
    color: '#EF4444',
  },
});

export default AccountScreen;