import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextInput as RNTextInput } from 'react-native';
import { getGroqApiKey, setGroqApiKey, isDarkModeEnabled, setDarkMode } from './CommunScripts/config';
import { AppColorsLight, AppColorsDark } from './style/colors';

type SettingsScreenProps = {
  lightColors?: typeof AppColorsLight;
  darkColors?: typeof AppColorsDark;
};

const SettingsScreen: React.FC<SettingsScreenProps> = ({ lightColors, darkColors }) => {
  const [apiKey, setApiKeyState] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [isKeyValid, setIsKeyValid] = useState<boolean | null>(null);
  const activeColors = lightColors || darkColors;

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const storedApiKey = await getGroqApiKey();
      setApiKeyState(storedApiKey);
      
      const darkModeEnabled = await isDarkModeEnabled();
      setIsDarkMode(darkModeEnabled);
    } catch (e) {
      console.error('Failed to load settings', e);
    } finally {
      setIsLoading(false);
    }
  };

  const validateKey = async (key: string) => {
    if (key.trim().length === 0) {
      setIsKeyValid(null);
      return;
    }

    setIsValidatingKey(true);
    
    try {
      // Validate Groq API key by attempting to call an endpoint
      const is_valid = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { Authorization: `Bearer ${key}` },
      })
        .then(res => res.status === 200)
        .then(() => true)
        .catch(() => false);
      
      setIsKeyValid(is_valid);
    } catch (e) {
      console.error('API validation failed', e);
      setIsKeyValid(false);
    } finally {
      setIsValidatingKey(false);
    }
  };

  const handleApiKeyChange = (text: string) => {
    setApiKeyState(text);
    validateKey(text);
  };

  const confirmClearPreferences = () => {
    Alert.alert(
      'Clear All Preferences',
      'Are you sure? This will reset all settings, API keys, and preferences. You may need to restart the app.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: () => clearAllPreferences(),
        },
      ]
    );
  };

  const clearAllPreferences = async () => {
    try {
      await AsyncStorage.clear();
      
      setApiKeyState('');
      setIsKeyValid(null);
      setIsDarkMode(false);
      
      Alert.alert(
        'Success',
        'All preferences have been cleared. Please restart the app.',
        [{ text: 'OK' }]
      );
    } catch (e) {
      console.error('Failed to clear preferences', e);
      Alert.alert('Error', 'Failed to clear preferences');
    }
  };

  const toggleDarkMode = async () => {
    const newMode = !isDarkMode;
    await setDarkMode(newMode);
    setIsDarkMode(newMode);
  };

  const getStatusCard = (status: boolean, loading: boolean) => {
    if (loading) {
      return (
        <View style={[styles.statusCard, styles.loadingCard]}>
          <ActivityIndicator size="small" color={activeColors.primaryGreen} />
          <Text style={[styles.statusText, { color: activeColors.primaryGreen }]}>Loading...</Text>
        </View>
      );
    }

    if (status) {
      return (
        <View style={[styles.statusCard, styles.successCard]}>
          <Icon name="check-circle" size={24} color="#FFFFFF" />
          <Text style={styles.statusText}>Ready</Text>
          <Text style={styles.statusSubtext}>Database is ready to use.</Text>
        </View>
      );
    }

    return (
      <View style={[styles.statusCard, styles.errorCard]}>
        <Icon name="error-outline" size={24} color={activeColors.primaryGreen} />
        <Text style={[styles.statusText, { color: activeColors.primaryGreen }]}>Database Missing</Text>
        <Text style={styles.statusSubtext}>Tap refresh to re-download from assets.</Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: activeColors.backgroundWhite }]}>{isLoading ? (
        <ActivityIndicator size="large" color={activeColors.primaryGreen} />
      ) : null}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: activeColors.backgroundWhite }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollPadding}>
        {/* Dark Mode Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dark Mode</Text>
          <View style={[styles.switchCard, { backgroundColor: activeColors.primaryGreen }]}>
            <TouchableOpacity onPress={toggleDarkMode} style={[styles.switchButton, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.3)' : 'transparent' }]}>
              <Icon name={isDarkMode ? 'dark-mode' : 'light-mode'} size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={[styles.switchLabel, { color: activeColors.backgroundWhite }]}>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</Text>
          </View>
        </View>

        {/* Groq API Key Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GROQ API Key</Text>
          <TouchableOpacity 
            onPress={() => apiKey ? validateKey(apiKey) : null} 
            style={[styles.inputCard, { borderColor: activeColors.primaryGreen }]}
          >
            <RNTextInput
              value={apiKey}
              onChangeText={handleApiKeyChange}
              placeholder="Enter your GROQ API key"
              placeholderTextColor={activeColors.primaryGreen}
              style={[styles.inputField, { color: apiKey ? '#000000' : activeColors.primaryGreen }]}
              secureTextEntry={!apiKey}
            />
            <Icon name={isKeyValid === true ? 'check-circle' : isKeyValid === false ? 'error' : isValidatingKey ? 'schedule' : 'lock-outline'} size={24} color={activeColors.primaryGreen} />
          </TouchableOpacity>
        </View>

        {/* Database Status Cards - Placeholders */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Database Status</Text>
          {getStatusCard(true, false)}
        </View>

        {/* Clear All Preferences Section */}
        <View style={[styles.section, styles.dangerSection]}>
          <Text style={[styles.sectionTitle, styles.dangerTitle]}>Danger Zone</Text>
          <TouchableOpacity onPress={confirmClearPreferences} style={styles.clearButton}>
            <Icon name="delete-forever" size={20} color="#FFFFFF" />
            <Text style={styles.clearButtonText}>Clear All Preferences</Text>
          </TouchableOpacity>
        </View>

        {/* Version Info */}
        <View style={[styles.section, styles.footerSection]}>
          <View style={styles.versionRow}>
            <Icon name="info-outline" size={20} color={activeColors.primaryGreen} />
            <Text style={[styles.versionText, { color: activeColors.primaryGreen }]}>Version 1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  content: {
    flex: 1,
  },
  scrollPadding: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 12,
  },
  dangerSection: {
    marginTop: 16,
  },
  dangerTitle: {
    color: '#d32f2f',
  },
  footerSection: {
    paddingVertical: 8,
  },
  versionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  versionText: {
    fontSize: 16,
  },
  statusCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  loadingCard: {
    backgroundColor: '#FFFFFF',
  },
  successCard: {
    backgroundColor: '#2e7d32',
  },
  errorCard: {
    backgroundColor: '#fff3e0',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statusSubtext: {
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 4,
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  inputField: {
    flex: 1,
    fontSize: 16,
  },
  switchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
  },
  switchButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d32f2f',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default SettingsScreen;
