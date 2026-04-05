import AsyncStorage from '@react-native-async-storage/async-storage';

export const getStrings = async (key: string): Promise<string[] | null> => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value === null) return null;
    return JSON.parse(value);
  } catch (e) {
    console.error(`Error getting string list for key: ${key}`, e);
    return null;
  }
};

export const setStrings = async (key: string, values: string[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(values);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.error(`Error setting string list for key: ${key}`, e);
  }
};

export const checkStartedFlag = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem('started_flag');
    return value === 'true';
  } catch (e) {
    return false;
  }
};

export const setStartedFlag = async (value: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem('started_flag', value.toString());
  } catch (e) {
    console.error("Error setting started flag", e);
  }
};

export const getGroqApiKey = async (): Promise<string> => {
  try {
    const value = await AsyncStorage.getItem('groq_api_key');
    return value || '';
  } catch (e) {
    return '';
  }
};

export const setGroqApiKey = async (value: string): Promise<void> => {
  try {
    await AsyncStorage.setItem('groq_api_key', value);
  } catch (e) {
    console.error("Error setting Groq API key", e);
  }
};

export const isDarkModeEnabled = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem('dark_mode');
    return value === 'true';
  } catch (e) {
    return false;
  }
};

export const setDarkMode = async (value: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem('dark_mode', value.toString());
  } catch (e) {
    console.error("Error setting dark mode", e);
  }
};