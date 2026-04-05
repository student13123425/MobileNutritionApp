import { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  SafeAreaView 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

const TrackerScreen = () => <View style={styles.placeholder} />;
const ScanScreen = () => <View style={styles.placeholder} />;
const BrowseScreen = () => <View style={styles.placeholder} />;
const CalendarScreen = () => <View style={styles.placeholder} />;
const RecipesScreen = () => <View style={styles.placeholder} />;
const SettingsScreen = () => <View style={styles.placeholder} />;

const STORAGE_KEY = 'last_tab_index';

const SCREENS: React.ReactElement[] = [
  <TrackerScreen key="tracker" />,
  <ScanScreen key="scan" />,
  <BrowseScreen key="browse" />,
  <CalendarScreen key="calendar" />,
  <RecipesScreen key="recipes" />,
  <SettingsScreen key="settings" />,
];

const HomeScreen: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(2);

  useEffect(() => {
    loadLastIndex();
  }, []);

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

  const handleTabPress = async (index: number) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, index.toString());
      setCurrentIndex(index);
    } catch (e) {
      console.error("Failed to save index", e);
    }
  };

  const navItems = [
    { icon: 'trending-up' },
    { icon: 'camera-alt' },
    { icon: 'explore' },
    { icon: 'calendar-month' },
    { icon: 'restaurant' },
    { icon: 'settings' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.body}>
        {SCREENS[currentIndex]}
      </View>

      <View style={styles.bottomBarContainer}>
        <View style={styles.navBarInner}>
          {navItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.navItem}
              onPress={() => handleTabPress(index)}
            >
              <Icon 
                name={item.icon} 
                size={currentIndex === index ? 28 : 24} 
                color={currentIndex === index ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)'} 
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
    backgroundColor: '#fff',
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
    backgroundColor: '#2e7d32',
    borderTopWidth: 1,
    borderTopColor: '#81c784',
  },
  navBarInner: {
    flexDirection: 'row',
    height: 60,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;
