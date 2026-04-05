import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  TextInput,
  Keyboard,
  Platform,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const getFoodNames = (options?: { limit?: number }) => {
  return new Promise<string[]>((resolve) => {
    setTimeout(() => {
      const mockFoods = [
        'Apple',
        'Banana',
        'Orange',
        'Broccoli',
        'Chicken Breast',
        'Salmon',
        'Brown Rice',
        'Oatmeal',
        'Eggs',
        'Milk',
        'Yogurt',
        'Peanut Butter',
        'Lentils',
        'Sweet Potato',
        'Avocado',
      ];
      const limited = options?.limit ? mockFoods.slice(0, options.limit) : mockFoods;
      resolve(limited);
    }, 500);
  });
};

const searchFoodNames = (query: string, options?: { limit?: number }) => {
  return new Promise<string[]>((resolve) => {
    setTimeout(() => {
      const mockFoods = [
        'Apple',
        'Banana',
        'Orange',
        'Broccoli',
        'Chicken Breast',
        'Salmon',
        'Brown Rice',
        'Oatmeal',
        'Eggs',
        'Milk',
        'Yogurt',
        'Peanut Butter',
        'Lentils',
        'Sweet Potato',
        'Avocado',
      ];
      const filtered = mockFoods.filter((food) =>
        food.toLowerCase().includes(query.toLowerCase())
      );
      const limited = options?.limit ? filtered.slice(0, options.limit) : filtered;
      resolve(limited);
    }, 600);
  });
};

const NutritionLoader = ({ text, themeColor }: { text: string; themeColor: string }) => (
  <View style={styles.loaderContainer}>
    <ActivityIndicator size="large" color={themeColor} />
    <Text style={styles.loaderText}>{text}</Text>
  </View>
);

export const BrowseScreen = () => {
  const [foods, setFoods] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const searchController = useRef<TextInput>(null);

  useEffect(() => {
    loadFoods();
    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, []);

  const loadFoods = async (query: string = '') => {
    if (!searchController.current) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const fetched = query === ''
        ? await getFoodNames({ limit: 2000 })
        : await searchFoodNames(query, { limit: 50 });

      if (!fetched) {
        setFoods([]);
      } else {
        setFoods(fetched);
        if (fetched.length === 0 && query !== '') {
          setErrorMessage('No foods found.');
        } else {
          setErrorMessage(null);
        }
      }
    } catch (e) {
      setErrorMessage('Failed to load foods. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onSearchTextChanged = (value: string) => {
    if (debounceTimer) clearTimeout(debounceTimer);

    const timer = setTimeout(() => {
      setSearchText(value);
      loadFoods(value);
    }, 300);

    setDebounceTimer(timer);
  };

  const openFoodDetails = (foodName: string) => {
    Alert.alert('Navigate', `Food: ${foodName}`);
  };

  const clearSearch = () => {
    setSearchText('');
    if (searchController.current) {
      searchController.current.clear();
    }
    loadFoods('');
  };

  const renderFoodItem = ({ item }: { item: string }) => (
    <TouchableOpacity onPress={() => openFoodDetails(item)}>
      <View style={styles.card}>
        <Text style={styles.foodText}>{item}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.center}>
      <Text style={styles.noFoodsText}>No food items found.</Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.center}>
      <Text style={styles.errorText}>{errorMessage}</Text>
    </View>
  );

  const renderLoading = () => (
    <View style={styles.center}>
      <NutritionLoader text="Loading foods…" themeColor="#2E7D32" />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.appBar}>
        <Text style={styles.appBarText}>Browse Foods</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <TextInput
            ref={searchController}
            style={styles.searchInput}
            placeholder="Search foods by name..."
            placeholderTextColor="#8BC34A"
            value={searchText}
            onChangeText={onSearchTextChanged}
            onSubmitEditing={() => Keyboard.dismiss()}
            accessibilityLabel="Search foods"
          />
          {searchText !== '' && (
            <TouchableOpacity onPress={clearSearch}>
              <Text style={styles.clearText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.content}>
        {isLoading ? (
          renderLoading()
        ) : errorMessage ? (
          renderError()
        ) : foods && foods.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Search Results</Text>
            <FlatList
              data={foods}
              keyExtractor={(item) => item}
              renderItem={renderFoodItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />
          </>
        ) : (
          renderEmpty()
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  appBar: {
    backgroundColor: '#2E7D32',
    paddingVertical: 12,
    alignItems: 'center',
  },
  appBarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#8BC34A',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 50,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
  },
  clearText: {
    fontSize: 20,
    color: '#8BC34A',
    paddingHorizontal: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2E7D32',
  },
  card: {
    marginVertical: 8,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  foodText: {
    fontSize: 16,
    color: '#000000',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  noFoodsText: {
    fontSize: 16,
    color: '#666666',
  },
  errorText: {
    fontSize: 18,
    color: '#D32F2F',
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 16,
  },
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 12,
    fontSize: 16,
    color: '#2E7D32',
  },
});