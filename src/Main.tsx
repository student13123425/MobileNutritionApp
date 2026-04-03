// App.tsx

import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as RNFS from 'react-native-fs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { copyJsonAssetIfNotExists, copyTextAssetIfNotExists, DatabaseService,} from './CommunScripts/database';
import Introduction from './introduction';
import { checkStartedFlag } from './CommunScripts/config';
import HomeScreen from './Homescreen';

const Stack = createNativeStackNavigator();
const dbService = new DatabaseService();

// Main App component - keeping the same structure
const App = () => {
  React.useEffect(() => {
    // Preload databases and initialize AI when app starts
    preloadDatabases();
    initAI();
  }, []);

  const [hasStarted, setHasStarted] = React.useState(false);

  React.useEffect(() => {
    checkStartedFlag().then(value => setHasStarted(value));
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator id='main' initialRouteName={hasStarted ? "Home" : "Introduction"}>
        <Stack.Screen
          name="Introduction"
          component={Introduction}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// FeatureCard component - React Native version (same as before)
interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <View style={styles.card}>
      <Icon name={icon} size={32} color="#388E3C" />
      <View style={styles.cardContent}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description} numberOfLines={2}>{description}</Text>
      </View>
    </View>
  );
};

// HomePage component - React Native version (same as before)
const HomePage = ({ navigation }: { navigation: any }) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.iconContainer}>
          <View style={styles.appIcon}>
            <Icon name="food-bank" size={50} color="#2E7D32" />
          </View>
        </View>

        <Text style={styles.title}>GreenPlate</Text>
        <Text style={styles.subtitle}>
          Your AI-powered nutrition companion to track calories, identify food, and eat mindfully.
        </Text>

        <View style={styles.featuresContainer}>
          <FeatureCard
            icon="camera-alt"
            title="AI Food Scanner"
            description="Snap a photo and instantly identify your meal."
          />
          <View style={styles.spacer} />

          <FeatureCard
            icon="local-fire-department"
            title="Calorie Tracker"
            description="Log meals and track daily calorie intake."
          />
          <View style={styles.spacer} />

          <FeatureCard
            icon="schedule"
            title="Daily Insights"
            description="Get smart recommendations based on your habits."
          />
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Introduction')}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Eat green. Live green. Stay healthy.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles for the components (same as before)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  appIcon: {
    width: 120,
    height: 120,
    backgroundColor: '#C8E6C9',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold' as any,
    color: '#1B5E20',
    letterSpacing: 1.2,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: '#2E7D32',
    marginBottom: 15,
    textAlign: 'center',
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  cardContent: {
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: '#1B5E20',
  },
  spacer: {
    height: 16,
  },
  button: {
    backgroundColor: '#388E3C',
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 4,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold' as any,
    color: '#FFFFFF',
  },
  footerText: {
    fontSize: 16,
    color: '#3E5028',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

// Database preloading function that uses the imported database service
async function preloadDatabases() {
  try {
    console.log("Starting database preloading...");

    // Use the database service methods directly
    await dbService.copyDatabaseIfNotExists('assets/food.db', 'food.db');
    await dbService.copyDatabaseIfNotExists('assets/recipes.db', 'recipes.db');

    // For JSON and text files, we'll need to implement similar functions in the database service
    await copyJsonAssetIfNotExists('assets/food_vocab.json', 'food_vocab.json');
    await copyTextAssetIfNotExists("assets/food_names.json", "food_names.txt");
    await copyTextAssetIfNotExists("assets/recipes_names.txt", "recipes_names.txt");

    console.log("Preloading complete.");
  } catch (e) {
    console.error("Error during preloading:", e);
  }
}

// AI initialization function
async function initAI() {
  try {
    const assetPath = 'assets/Qwen3.5-0.8B-Q4_K_M.gguf';
    const fileName = 'Qwen3.5-0.8B-Q4_K_M.gguf';

    // Use the database service to copy the AI model if needed
    await dbService.copyDatabaseIfNotExists(assetPath, fileName);

    console.log("AI initialized successfully");
  } catch (e) {
    console.error("Error initializing AI:", e);
  }
}
