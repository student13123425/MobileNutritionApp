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
import { AppColorsLight, AppColorsDark } from '../style/colors';

type RecipesScreenProps = {
  lightColors?: typeof AppColorsLight;
  darkColors?: typeof AppColorsDark;
};

const getActiveColors = (lightColors?: any, darkColors?: any) => {
  return lightColors || darkColors || AppColorsLight;
};

const layoutStyles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: { padding: 15, paddingTop: 50 },
  searchBarWrapper: { flexDirection: 'row', borderRadius: 8, alignItems: 'center', paddingHorizontal: 10 },
  searchInput: { flex: 1, height: 45 },
  content: { flex: 1, padding: 16 },
  card: { 
    padding: 15, 
    borderRadius: 8, 
    marginBottom: 16, 
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold' },
  cardSubtitle: { marginTop: 4 },
  resultsHeader: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  errorText: { fontSize: 18, textAlign: 'center', marginTop: 20 },
});

export const RecipesScreen: React.FC<RecipesScreenProps> = ({ lightColors, darkColors }) => {
  const activeColors = getActiveColors(lightColors, darkColors);
  
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

  const renderRecipeItem = ({ item }: { item: Recipe }) => (
    <TouchableOpacity style={layoutStyles.card}>
      <Text style={[layoutStyles.cardTitle, { color: activeColors.primaryGreen }]}>{item.name}</Text>
      <Text style={{ ...layoutStyles.cardSubtitle, color: '#666' }}>Minutes: {item.minutes}</Text>
    </TouchableOpacity>
  );

  const noop = () => {};

  return (
    <View style={layoutStyles.container}>
      <View style={[layoutStyles.searchContainer, { backgroundColor: activeColors.primaryGreen }]}>
        <View style={layoutStyles.searchBarWrapper}>
          <TextInput
            style={[layoutStyles.searchInput, { color: activeColors.primaryGreen }]}
            placeholder="Search recipes by name..."
            placeholderTextColor={activeColors.lightGreen}
            value={searchText}
            onChangeText={_onSearchTextChanged}
          />
          {searchText !== '' && (
            <TouchableOpacity onPress={() => {
              setSearchText('');
              _loadRecipes('');
            }}>
              <Text style={{ color: activeColors.primaryGreen, fontWeight: 'bold' }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={layoutStyles.content}>
        {isLoading ? (
          <ActivityIndicator size="large" color={activeColors.primaryGreen} />
        ) : errorMessage ? (
          <Text style={{ ...layoutStyles.errorText, color: '#f44336' }}>{errorMessage}</Text>
        ) : (
          <FlatList
            data={recipes}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderRecipeItem}
            ListHeaderComponent={() => (
              <Text style={{ ...layoutStyles.resultsHeader, color: activeColors.primaryGreen }}>{activeColors.backgroundWhite === '#fff' ? 'Search Results' : 'Rezultate căutare'}</Text>
            )}
          />
        )}
      </View>
    </View>
  );
};

export default RecipesScreen;