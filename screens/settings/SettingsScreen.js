import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  Image,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { clearDB } from '../../database/database';


const SettingItem = ({ icon, title, subtitle, onPress, value, isSwitch, theme }) => (
  <TouchableOpacity
    style={[styles.settingItem, { borderBottomColor: theme.secondaryBackground }]}
    onPress={onPress}
    disabled={isSwitch}
  >
    <View style={[styles.settingIcon, {backgroundColor: theme.settingIconBackground}]}>
      <Ionicons name={icon} size={22} color={theme.primary} />
    </View>
    <View style={styles.settingContent}>
      <Text style={[styles.settingTitle, { color: theme.textColor }]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.settingSubtitle, { color: theme.secondaryTextColor }]}>
          {subtitle}
        </Text>
      )}
    </View>
    {isSwitch ? (
      <Switch
        value={value}
        onValueChange={onPress}
        trackColor={{ false: '#E5E7EB', true: theme.primary }}
        thumbColor={'#FFF'}
      />
    ) : (
      <Ionicons name="chevron-forward" size={20} color={theme.textColor} />
    )}
  </TouchableOpacity>
);

const SettingSection = ({ title, children, theme }) => (
  <View style={styles.settingSection}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={[styles.sectionContent, { backgroundColor: theme.secondaryBackground }]}>
      {children}
    </View>
  </View>
);

const SettingsScreen = ({ navigation }) => {
  const { signOut } = useAuth();
  const { theme, toggleTheme, isDarkMode } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [appVersion, setAppVersion] = useState('v0.0.1');

  const loadSettings = useCallback(async () => {
    try {
      const notifications = await AsyncStorage.getItem('notifications');
      const autoSave = await AsyncStorage.getItem('autoSave');

      setNotificationsEnabled(notifications === null ? true : notifications !== 'false'); // default true if null
      setAutoSaveEnabled(autoSave === null ? true : autoSave !== 'false'); // default true if null
    } catch (error) {
      console.error('Failed to load settings', error);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const toggleNotifications = async () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    try {
      await AsyncStorage.setItem('notifications', newValue.toString());
    } catch (error) {
      console.error('Failed to save notification setting', error);
    }
  };

  const toggleAutoSave = async () => {
    const newValue = !autoSaveEnabled;
    setAutoSaveEnabled(newValue);
    try {
      await AsyncStorage.setItem('autoSave', newValue.toString());
    } catch (error) {
      console.error('Failed to save auto-save setting', error);
    }
  };

  const navigateToAccount = () => {
    navigation.navigate('Account');
  };

  const navigateToAbout = () => {
    navigation.navigate('About');
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', onPress: () => signOut(), style: 'destructive' },
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to clear all notes? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          onPress: async () => {
            try {
              await clearDB();
              Alert.alert('Success', 'All notes have been cleared from the database.');
            } catch (error) {
              console.error('Failed to clear notes', error);
              Alert.alert('Error', 'Failed to clear notes. Please try again.');
            }
          },
          style: 'destructive'
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.secondaryBackground }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={theme.textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textColor }]}>Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <Image
            source={require('../../assets/images/icon.png')}
            style={[styles.profileImage,{backgroundColor: theme.primary}] }
          />
          <Text style={[styles.appName, { color: theme.textColor }]}>Noty KT</Text>
          <Text style={styles.versionText}>{appVersion}</Text>
        </View>

        <SettingSection title="Appearance" theme={theme}>
          <SettingItem
            icon="moon-outline"
            title="Dark Mode"
            isSwitch={true}
            value={isDarkMode}
            onPress={toggleTheme}
            theme={theme}
          />
        </SettingSection>

        <SettingSection title="Preferences" theme={theme}>
          <SettingItem
            icon="notifications-outline"
            title="Notifications"
            subtitle="Receive reminders and updates"
            isSwitch={true}
            value={notificationsEnabled}
            onPress={toggleNotifications}
            theme={theme}
          />
          <SettingItem
            icon="save-outline"
            title="Auto-Save"
            subtitle="Automatically save notes while typing"
            isSwitch={true}
            value={autoSaveEnabled}
            onPress={toggleAutoSave}
            theme={theme}
          />
        </SettingSection>

        <SettingSection title="Account" theme={theme}>
          <SettingItem
            icon="person-outline"
            title="Account Settings"
            subtitle="Manage your profile and preferences"
            onPress={navigateToAccount}
            theme={theme}
          />
          <SettingItem
            icon="log-out-outline"
            title="Sign Out"
            subtitle="Log out of your account"
            onPress={handleSignOut}
            theme={theme}
          />
        </SettingSection>

        <SettingSection title="Data" theme={theme}>
          <SettingItem
            icon="cloud-upload-outline"
            title="Backup & Sync"
            subtitle="Backup your notes to the cloud"
            onPress={() => Alert.alert('Coming Soon', 'This feature will be available in a future update.')}
            theme={theme}
          />
          <SettingItem
            icon="trash-outline"
            title="Clear All Data"
            subtitle="Delete all notes"
            onPress={handleClearData}
            theme={theme}
          />
        </SettingSection>

        <SettingSection title="About" theme={theme}>
          <SettingItem
            icon="information-circle-outline"
            title="About Noty KT"
            subtitle="Learn more about the app"
            onPress={navigateToAbout}
            theme={theme}
          />
          <SettingItem
            icon="heart-outline"
            title="Rate the App"
            subtitle="If you enjoy using Noty KT, please rate it"
            onPress={() => Alert.alert('Coming Soon', 'This feature will be available when the app is published.')}
            theme={theme}
          />
          <SettingItem
            icon="help-circle-outline"
            title="Help & Support"
            subtitle="Get assistance or report issues"
            onPress={() => Alert.alert('Support', 'For support, please join our Slack channel or email raiyanhasan2006@gmail.com')}
            theme={theme}
          />
        </SettingSection>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
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
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
    marginTop: 4,
  },
});

export default SettingsScreen;