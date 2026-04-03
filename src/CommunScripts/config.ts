import AsyncStorage from '@react-native-async-storage/async-storage';
/**
 * Helper to retrieve a list of strings.
 * Since AsyncStorage only stores strings, we must JSON.parse the string back into an array.
 */
export const getStrings = async (key: string): Promise<string[] | null> => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value === null) return null;
    return JSON.parse(value); // Convert the stored JSON string back to an array
  } catch (e) {
    console.error(`Error getting string list for key: ${key}`, e);
    return null;
  }
};

/**
 * Helper to save a list of strings.
 * We must JSON.stringify the array before saving it as a single string.
 */
export const setStrings = async (key: string, values: string[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(values);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.error(`Error setting string list for key: ${key}`, e);
  }
};

/**
 * Checks if the app has been started.
 * Converts the string 'true'/'false' back into a boolean.
 */
export const checkStartedFlag = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem('started_flag');
    return value === 'true'; // Returns true only if the string is exactly 'true'
  } catch (e) {
    return false;
  }
};

/**
 * Sets the app started flag.
 * Converts boolean to string so it can be stored in AsyncStorage.
 */
export const setStartedFlag = async (value: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem('started_flag', value.toString());
  } catch (e) {
    console.error("Error setting started flag", e);
  }
};

/**
 * Retrieves the Groq API Key.
 */
export const getGroqApiKey = async (): Promise<string> => {
  try {
    const value = await AsyncStorage.getItem('groq_api_key');
    return value || '';
  } catch (e) {
    return '';
  }
};

/**
 * Saves the Groq API Key.
 */
export const setGroqApiKey = async (value: string): Promise<void> => {
  try {
    await AsyncStorage.setItem('groq_api_key', value);
  } catch (e) {
    console.error("Error setting Groq API key", e);
  }
};

/**
 * Checks if Dark Mode is enabled.
 */
export const isDarkModeEnabled = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem('dark_mode');
    return value === 'true';
  } catch (e) {
    return false;
  }
};

/**
 * Sets the Dark Mode preference.
 */
export const setDarkMode = async (value: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem('dark_mode', value.toString());
  } catch (e) {
    console.error("Error setting dark mode", e);
  }
};
