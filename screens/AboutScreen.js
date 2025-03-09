// AboutScreen.js
import React, { useState, useEffect } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';

const AboutScreen = ({ navigation }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const appVersion = 'v0.0.1';

    // Load theme preference
    useEffect(() => {
        const loadTheme = async () => {
            try {
                const darkMode = await AsyncStorage.getItem('darkMode');
                setIsDarkMode(darkMode === 'true');
            } catch (error) {
                console.error('Failed to load theme preference', error);
            }
        };

        loadTheme();
    }, []);

    // Open URL helper
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

    // Open Github repository
    const openGithub = () => {
        openURL('https://github.com/hasanraiyan/notekt');
    };

    // Send email
    const sendEmail = () => {
        openURL('mailto:raiyanhasan2006@gmail.com');
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
                <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>About</Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.appInfoSection}>
                    <Image
                        source={require('../assets/images/icon.png')}
                        style={styles.appIcon}
                    />
                    <Text style={[styles.appName, isDarkMode && styles.darkText]}>Noty KT</Text>
                    <Text style={styles.versionText}>{appVersion}</Text>
                    <Text style={[styles.appDescription, isDarkMode && styles.darkSubText]}>
                        A simple, modern note-taking app built with React Native
                    </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.linksSection}>
                    <TouchableOpacity
                        style={styles.linkItem}
                        onPress={openGithub}
                    >
                        <Ionicons name="logo-github" size={24} color="#7B68EE" />
                        <Text style={[styles.linkText, isDarkMode && styles.darkText]}>
                            GitHub Repository
                        </Text>
                        <Ionicons name="open-outline" size={20} color="#6B7280" />
                    </TouchableOpacity>
                </View>

                <View style={styles.divider} />

                <View style={styles.developerSection}>
                    <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
                        Developer
                    </Text>

                    <View style={styles.developerInfo}>
                        <Image
                            source={require('../assets/images/icon.png')}
                            style={styles.developerAvatar}
                        />
                        <View style={styles.developerDetails}>
                            <Text style={[styles.developerName, isDarkMode && styles.darkText]}>
                                Raiyan Hasan
                            </Text>
                            <Text style={[styles.developerBio, isDarkMode && styles.darkSubText]}>
                                Android Developer & Open Source Enthusiast
                            </Text>

                            <View style={styles.socialLinks}>
                              

                                <TouchableOpacity
                                    style={styles.socialButton}
                                    onPress={sendEmail}
                                >
                                    <Ionicons name="mail-outline" size={20} color="#EA4335" />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.socialButton}
                                    onPress={openGithub}
                                >
                                    <Ionicons name="logo-github" size={20} color="#333" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.licenseSection}>
                    <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
                        License
                    </Text>
                    <Text style={[styles.licenseText, isDarkMode && styles.darkSubText]}>
                        Licensed under the Apache License, Version 2.0
                    </Text>
                    <TouchableOpacity
                        style={styles.licenseButton}
                        onPress={() => openURL('https://www.apache.org/licenses/LICENSE-2.0')}
                    >
                        <Text style={styles.licenseButtonText}>View License</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.copyrightText}>
                    © 2023 Raiyan Hasan. All rights reserved.
                </Text>
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
    darkSubText: {
        color: '#A0A0A0',
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
        backgroundColor: '#7B68EE',
        marginBottom: 16,
    },
    appName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    versionText: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 12,
    },
    appDescription: {
        fontSize: 16,
        color: '#4B5563',
        textAlign: 'center',
        lineHeight: 24,
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
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
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        marginBottom: 12,
    },
    linkText: {
        flex: 1,
        fontSize: 16,
        marginLeft: 12,
        color: '#1F2937',
    },
    developerSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
        color: '#1F2937',
    },
    developerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
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
        color: '#1F2937',
    },
    developerBio: {
        fontSize: 14,
        color: '#4B5563',
        marginBottom: 12,
    },
    socialLinks: {
        flexDirection: 'row',
    },
    socialButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#EDE9FE',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    licenseSection: {
        marginBottom: 24,
    },
    licenseText: {
        fontSize: 14,
        color: '#4B5563',
        marginBottom: 16,
        lineHeight: 20,
    },
    licenseButton: {
        backgroundColor: '#7B68EE',
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
        color: '#9CA3AF',
        textAlign: 'center',
        marginTop: 16,
    }
});

export default AboutScreen;