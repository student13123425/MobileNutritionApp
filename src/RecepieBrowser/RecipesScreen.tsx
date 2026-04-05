import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Recipe } from '../CommunScripts/objects';
import { dbService, recipeDb } from '../CommunScripts/database';

export const RecipesScreen: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    _loadRecipes();
  }, []);

  const _loadRecipes = async (query: string = '') => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const fetchedRecipes = await recipeDb.getRecipes(query);
      if (fetchedRecipes) {
        setRecipes(fetchedRecipes);
        if (fetchedRecipes.length === 0 && query !== '') {
          setErrorMessage('No recipes found.');
        }
      }
    } catch (e) {
      setErrorMessage('Failed to load recipes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const _onSearchTextChanged = (value: string) => {
    setSearchText(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      _loadRecipes(value);
    }, 300);
  };

  const noop = () => {};

  const renderRecipeItem = ({ item }: { item: Recipe }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => noop()}
    >
      <Text style={styles.cardTitle}>{item.name}</Text>
      <Text style={styles.cardSubtitle}>Minutes: {item.minutes}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBarWrapper}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search recipes by name..."
            placeholderTextColor="#81c784"
            value={searchText}
            onChangeText={_onSearchTextChanged}
          />
          {searchText !== '' && (
            <TouchableOpacity onPress={() => {
              setSearchText('');
              _loadRecipes('');
            }}>
              <Text style={{ color: '#2e7d32' }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.content}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#2e7d32" />
        ) : errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : (
          <FlatList
            data={recipes}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderRecipeItem}
            ListHeaderComponent={() => (
              <Text style={styles.resultsHeader}>Search Results</Text>
            )}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  searchContainer: {
    backgroundColor: '#2e7d32',
    padding: 15,
    paddingTop: 50,
  },
  searchBarWrapper: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    color: '#1b5e20',
  },
  content: { flex: 1, padding: 16 },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold' },
  cardSubtitle: { color: '#666', marginTop: 4 },
  resultsHeader: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  errorText: { color: 'red', fontSize: 18, textAlign: 'center', marginTop: 20 },
});