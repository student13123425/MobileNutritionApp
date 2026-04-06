import { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  SafeAreaView,
  Text 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppColorsLight, AppColorsDark } from './style/colors';
import { isDarkModeEnabled, setDarkMode } from './CommunScripts/config';
import SettingsScreen from './SettingsScreen';

const TrackerScreen = () => <View style={styles.placeholder} />;
const ScanScreen = () => <View style={styles.placeholder} />;
const BrowseScreen = () => <View style={styles.placeholder} />;
const CalendarScreen = () => <View style={styles.placeholder} />;
const RecipesScreen = () => <View style={styles.placeholder} />;

const STORAGE_KEY = 'last_tab_index';

const navItems = [
  { icon: 'trending-up', label: 'Tracker' },
  { icon: 'camera-alt', label: 'Scan' },
  { icon: 'explore', label: 'Browse' },
  { icon: 'calendar-month', label: 'Calendar' },
  { icon: 'restaurant', label: 'Recipes' },
  { icon: 'settings', label: 'Settings' },
];

const SCREENS = [TrackerScreen, ScanScreen, BrowseScreen, CalendarScreen, RecipesScreen, SettingsScreen];

type HomeScreenProps = {
  lightColors?: typeof AppColorsLight;
  darkColors?: typeof AppColorsDark;
};

const HomeScreen: React.FC<HomeScreenProps> = ({ lightColors, darkColors }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  
  // Get active colors based on props or defaults
  const getActiveColors = (): typeof AppColorsLight | typeof AppColorsDark => {
    if (lightColors) return lightColors;
    if (darkColors) return darkColors;
    return AppColorsLight;
  };
  
  const activeColors = getActiveColors();

  useEffect(() => {
    loadTheme();
    loadLastIndex();
  }, []);

  const loadTheme = async () => {
    try {
      const darkModeEnabled = await isDarkModeEnabled();
      setIsDarkMode(darkModeEnabled);
    } catch (e) {
      console.error("Failed to load theme", e);
    }
  };

  const handleTabPress = async (index: number) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, index.toString());
      setCurrentIndex(index);
    } catch (e) {
      console.error("Failed to save index", e);
    }
  };

  const loadLastIndex = async () => {
    try {
      const savedIdx = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedIdx !== null) {
        const parsedIdx = parseInt(savedIdx, 10);
        if (parsedIdx >= 0 && parsedIdx < SCREENS.length) {
          setCurrentIndex(parsedIdx);
        }
      }
    } catch (e) {
      console.error("Failed to load index", e);
    }
  };

  const handleThemeToggle = async () => {
    try {
      const newDarkMode = !isDarkMode;
      await setDarkMode(newDarkMode);
      setIsDarkMode(newDarkMode);
    } catch (e) {
      console.error("Failed to toggle theme", e);
    }
  };

  const isSettingsTab = currentIndex === SCREENS.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.body, { backgroundColor: activeColors.backgroundWhite }]} />

      <View 
        style={[
          styles.bottomBarContainer,
          { backgroundColor: activeColors.primaryGreen, borderTopColor: activeColors.lightGreen },
        ]}
      >
        {isSettingsTab ? (
          <TouchableOpacity onPress={handleThemeToggle} style={styles.themeToggle}>
            <Icon name={isDarkMode ? 'dark-mode' : 'light-mode'} size={20} color="white" />
            <Text style={styles.themeText}>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</Text>
          </TouchableOpacity>
        ) : null}

        <View style={styles.navBarInner}>
          {navItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.navItem, { opacity: currentIndex === index ? 1 : 0.7 }]}
              onPress={() => handleTabPress(index)}
            >
              <Icon 
                name={item.icon} 
                size={currentIndex === index ? 28 : 24} 
                color="#FFFFFF" 
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  bottomBarContainer: {
    flexDirection: 'row',
    height: 76,
    paddingTop: 4,
    borderTopWidth: 1,
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 4,
    gap: 6,
  },
  themeText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  navBarInner: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
});

export default HomeScreen;