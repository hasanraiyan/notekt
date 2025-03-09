// AboutScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { appVersion } from '../../constants/constants';
const AboutScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();


  // Helper to open URL
  const openURL = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.error(`Cannot open URL: ${url}`);
      }
    } catch (error) {
      console.error(`Error opening URL: ${url}`, error);
    }
  };

  const openGithub = () => {
    openURL('https://github.com/hasanraiyan/notekt');
  };

  const sendEmail = () => {
    openURL('mailto:raiyanhasan2006@gmail.com');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.secondaryBackground }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={theme.textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textColor }]}>About</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* App Info */}
        <View style={styles.appInfoSection}>
          <Image
            source={require('../../assets/images/icon.png')}
            style={[styles.appIcon, { backgroundColor: theme.primary }]}
          />
          <Text style={[styles.appName, { color: theme.textColor }]}>Noty KT</Text>
          <Text style={[styles.versionText, { color: theme.secondaryTextColor }]}>{appVersion}</Text>
          <Text style={[styles.appDescription, { color: theme.secondaryTextColor }]}>
            A simple, modern note-taking app built with React Native
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: isDarkMode ? '#333333' : '#E5E7EB' }]} />

        {/* Links */}
        <View style={styles.linksSection}>
          <TouchableOpacity style={[styles.linkItem, { backgroundColor: theme.secondaryBackground }]} onPress={openGithub}>
            <Ionicons name="logo-github" size={24} color={theme.primary} />
            <Text style={[styles.linkText, { color: theme.textColor }]}>GitHub Repository</Text>
            <Ionicons name="open-outline" size={20} color={theme.secondaryTextColor} />
          </TouchableOpacity>
        </View>

        <View style={[styles.divider, { backgroundColor: isDarkMode ? '#333333' : '#E5E7EB' }]} />

        {/* Developer Info */}
        <View style={styles.developerSection}>
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>Developer</Text>
          <View style={[styles.developerInfo, { backgroundColor: theme.secondaryBackground }]}>
            <Image
              source={require('../../assets/images/icon.png')}
              style={[styles.developerAvatar, { backgroundColor: theme.primary }]}
            />
            <View style={styles.developerDetails}>
              <Text style={[styles.developerName, { color: theme.textColor }]}>Raiyan Hasan</Text>
              <Text style={[styles.developerBio, { color: theme.secondaryTextColor }]}>
                Android Developer & Open Source Enthusiast
              </Text>
              <View style={styles.socialLinks}>
                <TouchableOpacity style={styles.socialButton} onPress={sendEmail}>
                  <Ionicons name="mail-outline" size={20} color={theme.textColor} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton} onPress={openGithub}>
                  <Ionicons name="logo-github" size={20} color={theme.textColor} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: isDarkMode ? '#333333' : '#E5E7EB' }]} />

        {/* License Info */}
        <View style={styles.licenseSection}>
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>License</Text>
          <Text style={[styles.licenseText, { color: theme.secondaryTextColor }]}>
            Licensed under the Apache License, Version 2.0
          </Text>
          <TouchableOpacity
            style={[styles.licenseButton, { backgroundColor: theme.primary }]}
            onPress={() => openURL('https://www.apache.org/licenses/LICENSE-2.0')}
          >
            <Text style={styles.licenseButtonText}>View License</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.copyrightText, { color: theme.secondaryTextColor }]}>
          © 2023 Raiyan Hasan. All rights reserved.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  appInfoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  versionText: {
    fontSize: 16,
    marginBottom: 12,
  },
  appDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  divider: {
    height: 1,
    marginVertical: 24,
  },
  linksSection: {
    marginBottom: 8,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  linkText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  developerSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  developerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
  },
  developerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  developerDetails: {
    flex: 1,
  },
  developerName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  developerBio: {
    fontSize: 14,
    marginBottom: 8,
  },
  socialLinks: {
    flexDirection: 'row',
  },
  socialButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  licenseSection: {
    marginBottom: 24,
  },
  licenseText: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  licenseButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  licenseButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  copyrightText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default AboutScreen;
