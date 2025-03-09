// SettingsScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Switch,
  ScrollView,
  Alert,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

const SettingItem = ({ icon, title, subtitle, onPress, value, isSwitch }) => (
  <TouchableOpacity 
    style={styles.settingItem} 
    onPress={onPress}
    disabled={isSwitch}
  >
    <View style={styles.settingIcon}>
      <Ionicons name={icon} size={22} color="#7B68EE" />
    </View>
    <View style={styles.settingContent}>
      <Text style={styles.settingTitle}>{title}</Text>
      {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
    </View>
    {isSwitch ? (
      <Switch
        value={value}
        onValueChange={onPress}
        trackColor={{ false: '#E5E7EB', true: '#7B68EE' }}
        thumbColor={'#FFF'}
      />
    ) : (
      <Ionicons name="chevron-forward" size={20} color="#6B7280" />
    )}
  </TouchableOpacity>
);

const SettingSection = ({ title, children }) => (
  <View style={styles.settingSection}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionContent}>
      {children}
    </View>
  </View>
);

const SettingsScreen = ({ navigation }) => {
  const { signOut } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [appVersion, setAppVersion] = useState('v0.0.1');
  
  // Load settings from AsyncStorage when the component mounts
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const darkMode = await AsyncStorage.getItem('darkMode');
        const notifications = await AsyncStorage.getItem('notifications');
        const autoSave = await AsyncStorage.getItem('autoSave');
        
        setIsDarkMode(darkMode === 'true');
        setNotificationsEnabled(notifications !== 'false'); // Default true
        setAutoSaveEnabled(autoSave !== 'false'); // Default true
      } catch (error) {
        console.error('Failed to load settings', error);
      }
    };
    
    loadSettings();
  }, []);
  
  // Save settings to AsyncStorage when they change
  const saveSettings = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, String(value));
    } catch (error) {
      console.error(`Failed to save ${key} setting`, error);
    }
  };
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    saveSettings('darkMode', newValue);
    // You would also need to update the app's theme here
  };
  
  // Toggle notifications
  const toggleNotifications = () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    saveSettings('notifications', newValue);
  };
  
  // Toggle auto-save
  const toggleAutoSave = () => {
    const newValue = !autoSaveEnabled;
    setAutoSaveEnabled(newValue);
    saveSettings('autoSave', newValue);
  };
  
  // Navigate to account screen
  const navigateToAccount = () => {
    navigation.navigate('Account');
  };
  
  // Navigate to about screen
  const navigateToAbout = () => {
    navigation.navigate('About');
  };
  
  // Handle sign out
  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          onPress: () => signOut(),
          style: 'destructive',
        },
      ]
    );
  };
  
  // Handle clear data
  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to clear all notes? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('notes');
              Alert.alert('Success', 'All notes have been cleared.');
            } catch (error) {
              console.error('Failed to clear notes', error);
              Alert.alert('Error', 'Failed to clear notes. Please try again.');
            }
          },
          style: 'destructive',
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
        <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>Settings</Text>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <Image
            source={require('../assets/images/icon.png')}
            style={styles.profileImage}
          />
          <Text style={[styles.appName, isDarkMode && styles.darkText]}>Noty KT</Text>
          <Text style={styles.versionText}>{appVersion}</Text>
        </View>
        
        <SettingSection title="Appearance">
          <SettingItem
            icon="moon-outline"
            title="Dark Mode"
            isSwitch={true}
            value={isDarkMode}
            onPress={toggleDarkMode}
          />
        </SettingSection>
        
        <SettingSection title="Preferences">
          <SettingItem
            icon="notifications-outline"
            title="Notifications"
            subtitle="Receive reminders and updates"
            isSwitch={true}
            value={notificationsEnabled}
            onPress={toggleNotifications}
          />
          <SettingItem
            icon="save-outline"
            title="Auto-Save"
            subtitle="Automatically save notes while typing"
            isSwitch={true}
            value={autoSaveEnabled}
            onPress={toggleAutoSave}
          />
        </SettingSection>
        
        <SettingSection title="Account">
          <SettingItem
            icon="person-outline"
            title="Account Settings"
            subtitle="Manage your profile and preferences"
            onPress={navigateToAccount}
          />
          <SettingItem
            icon="log-out-outline"
            title="Sign Out"
            subtitle="Log out of your account"
            onPress={handleSignOut}
          />
        </SettingSection>
        
        <SettingSection title="Data">
          <SettingItem
            icon="cloud-upload-outline"
            title="Backup & Sync"
            subtitle="Backup your notes to the cloud"
            onPress={() => Alert.alert('Coming Soon', 'This feature will be available in a future update.')}
          />
          <SettingItem
            icon="trash-outline"
            title="Clear All Data"
            subtitle="Delete all notes"
            onPress={handleClearData}
          />
        </SettingSection>
        
        <SettingSection title="About">
          <SettingItem
            icon="information-circle-outline"
            title="About Noty KT"
            subtitle="Learn more about the app"
            onPress={navigateToAbout}
          />
          <SettingItem
            icon="heart-outline"
            title="Rate the App"
            subtitle="If you enjoy using Noty KT, please rate it"
            onPress={() => Alert.alert('Coming Soon', 'This feature will be available when the app is published.')}
          />
          <SettingItem
            icon="help-circle-outline"
            title="Help & Support"
            subtitle="Get assistance or report issues"
            onPress={() => Alert.alert('Support', 'For support, please join our Slack channel or email shreyaspatil@gmail.com')}
          />
        </SettingSection>
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
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  darkText: {
    color: 'white',
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 10,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#7B68EE',
    marginBottom: 10,
  },
  appName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  versionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  settingSection: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7B68EE',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  sectionContent: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
});

export default SettingsScreen;