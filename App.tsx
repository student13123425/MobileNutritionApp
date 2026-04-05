import { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Button,
  Alert,
  StatusBar,
  Platform,
  StyleSheet 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { checkStartedFlag } from './src/CommunScripts/config';
import HomeScreen from './src/Homescreen';

type FeatureCardProps = {
  icon: string;
  title: string;
  description: string;
};

const HomePage = () => {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const value = await AsyncStorage.getItem('started');
        setStarted(value === 'true');
      } catch (e) {
        console.error('Error reading started flag:', e);
      }
    };
    load();
  }, []);

  const handleGetStarted = () => {
    AsyncStorage.setItem('started', 'true')
      .then(() => {
        navigationRef?.current?.navigate('Home');
      })
      .catch((e) => Alert.alert('Error', 'Could not save start status'));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.circleAvatar}>
            <Text style={styles.icon}>🍽️</Text>
          </View>
        </View>

        <Text style={styles.title}>GreenPlate</Text>

        <Text style={styles.subtitle}>
          Your AI-powered nutrition companion to track calories, identify food, and eat mindfully.
        </Text>

        <View style={styles.features}>
          <FeatureCard
            icon="📷"
            title="AI Food Scanner"
            description="Snap a photo and instantly identify your meal."
          />
          <FeatureCard
            icon="🔥"
            title="Calorie Tracker"
            description="Log meals and track daily calorie intake."
          />
          <FeatureCard
            icon="📅"
            title="Daily Insights"
            description="Get smart recommendations based on your habits."
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Get Started"
            onPress={handleGetStarted}
            color="#2e7d32"
          />
        </View>

        <Text style={styles.footnote}>
          Eat green. Live green. Stay healthy.
        </Text>
      </View>
    </SafeAreaView>
  );
};



const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <View style={styles.featureCard}>
      <Text style={styles.icon}>{icon}</Text>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
};

let navigationRef: React.RefObject<any> | null = null;

const App = () => {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const loadApp = async () => {
      try {
        const isStarted = await checkStartedFlag();
        setStarted(isStarted);
      } catch (e) {
        console.error('App init error:', e);
      }
    };

    loadApp();
  }, []);

  return (
    <NavigationContainer
      ref={navigationRef}
    >
      <Stack.Navigator id="app" initialRouteName={started ? 'HomeScreen' : 'Introduction'}>
        <Stack.Screen
          name="Introduction"
          component={HomePage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8f5e9',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  circleAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#c8e6c9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2e7d32',
    textAlign: 'center',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#2e7d32',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  features: {
    width: '100%',
    marginBottom: 30,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f1f8e9',
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c8e6c9',
  },
  featureText: {
    flex: 1,
    marginLeft: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2e7d32',
  },
  featureDescription: {
    fontSize: 14,
    color: '#388e3c',
    marginTop: 4,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 20,
  },
  footnote: {
    fontSize: 16,
    color: '#388e3c',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

const Stack = createNativeStackNavigator();

export default App;
