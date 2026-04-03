import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';

// import { FoodItem } from '../CommunScripts/objects'; // Ensure this path exists or adjust accordingly

// Mocking external dependencies for compilation safety. 
// In your actual project, ensure these imports match your file structure.
import NutritionLoader from '../CommunComponents/LoadingComponent';

// --- MOCKS FOR UNDEFINED DEPENDENCIES (Remove if they exist in your project) ---
class GroqService {
  async getGroqApiKey() { return 'mock_key'; } // Replace with actual logic
  async validateApiKey(key: string) { return true; } // Replace with actual validation
  async generateDescription(foodName: string) { 
    return `AI generated description for ${foodName}. This is a sample text to demonstrate the UI layout.`; 
  }
}

// Define MapEntry class if not imported from elsewhere
class MapEntry<K, V> {
  constructor(public key: K, public value: V) {}
}

// Mock function to simulate fetching food data
async function getFoodItemByName(name: string): Promise<any | null> {
  // Simulate a delay or error for testing
  if (name === 'NotFound') return null;
  return {
    name,
    category: 'Fruits',
    nutrients: [
      { name: 'Calories', value: 95, unitName: 'kcal' },
      { name: 'Protein', value: 1.2, unitName: 'g' },
      { name: 'Carbs', value: 24, unitName: 'g' },
    ],
    portions: [
      { name: 'Small', value: 150, unitName: 'grams' },
      { name: 'Large', value: 300, unitName: 'grams' },
    ],
    brandedInfo: [
      { name: 'Brand A', value: 'Organic', unitName: '' },
    ]
  };
}

// --- END OF MOCKS ---

const { width } = Dimensions.get('window');

interface FoodItem {
  name: string;
  category: string;
  nutrients: any[];
  portions: any[];
  brandedInfo: any[];
}

interface FoodDetailScreenProps {
  foodName: string;
}

export const FoodDetailScreen = ({ foodName }: FoodDetailScreenProps) => {
  const [foodItem, setFoodItem] = useState<FoodItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiDescription, setAiDescription] = useState<string | null>(null);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isKeyError, setIsKeyError] = useState(false);

  const [showDescription, setShowDescription] = useState(true);
  const [showNutrients, setShowNutrients] = useState(true);
  const [showPortions, setShowPortions] = useState(true);
  const [showBrandedInfo, setShowBrandedInfo] = useState(true);

  // Fetch food data on mount
  useEffect(() => {
    loadFoodData();
  }, []);

  const loadFoodData = async () => {
    try {
      const result = await getFoodItemByName(foodName);
      if (!result) {
        Alert.alert('Error', `Food "${foodName}" not found.`);
        return;
      }
      setFoodItem(result);
    } catch (e) {
      Alert.alert('Error', 'Failed to load food details.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateDescription = async () => {
    setIsGeneratingDescription(true);
    setAiDescription(null);
    setErrorMessage(null);
    setIsKeyError(false);

    try {
      const groqService = new GroqService();
      const apiKey = await groqService.getGroqApiKey();

      if (!apiKey) {
        setIsKeyError(true);
        setErrorMessage('Groq API key is missing. Please provide a valid key in settings.');
        return;
      }

      // Note: In real implementation, validate logic might differ
      const isValid = await groqService.validateApiKey(apiKey);
      if (!isValid) {
        setIsKeyError(true);
        setErrorMessage('Invalid API Key. Please check your Groq settings.');
        return;
      }

      const description = await groqService.generateDescription(foodName);
      setAiDescription(description);
    } catch (e) {
      setErrorMessage('Network Error: Unable to connect to Groq services. Please check your connection.');
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const renderAISection = () => {
    if (isGeneratingDescription) {
      return (
        <View style={styles.section}>
          {/* Assuming NutritionLoader accepts text and themeColor */}
          <NutritionLoader text="Generating AI Description..." themeColor="#2E7D32" />
        </View>
      );
    }

    let content;
    let headerColor = '#2E7D32';

    if (errorMessage) {
      headerColor = isKeyError ? '#FF8F00' : '#D32F2F';
      content = (
        <View style={styles.errorContainer}>
          <View style={styles.errorIcon}>
            <Text style={styles.errorIconText}>
              {isKeyError ? '🔑' : '🌐'}
            </Text>
          </View>
          <View style={styles.errorContent}>
            <Text style={styles.errorTitle}>
              {isKeyError ? 'API Key Warning' : 'Connection Error'}
            </Text>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        </View>
      );
    } else if (aiDescription) {
      content = (
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>{aiDescription}</Text>
        </View>
      );
    } else {
      return null;
    }

    const trailing = errorMessage ? (
      <TouchableOpacity onPress={generateDescription}>
        <Text style={styles.refreshText}>🔄</Text>
      </TouchableOpacity>
    ) : null;

    return renderExpandableSection({
      title: 'Description',
      isExpanded: showDescription,
      onToggle: () => setShowDescription(!showDescription),
      backgroundColor: headerColor,
      trailing,
      child: content,
    });
  };

  const renderConditionalSection = ({
    title,
    isExpanded,
    items,
    onToggle,
  }: {
    title: string;
    isExpanded: boolean;
    items: any[];
    onToggle: () => void;
  }) => {
    const filteredContent = buildKeyValueList(items);
    if (!filteredContent) return null;

    return renderExpandableSection({
      title,
      isExpanded,
      onToggle,
      child: filteredContent,
    });
  };

  const renderErrorState = () => (
    <View style={styles.center}>
      <Text style={styles.errorText}>Food not found</Text>
      <Text style={styles.errorSubText}>
        Could not find details for "{foodName}" in the database.
      </Text>
    </View>
  );

  const renderExpandableSection = ({
    title,
    isExpanded,
    onToggle,
    child,
    backgroundColor = '#2E7D32',
    trailing,
  }: {
    title: string;
    isExpanded: boolean;
    onToggle: () => void;
    child: React.ReactNode;
    backgroundColor?: string;
    trailing?: React.ReactNode;
  }) => (
    <View style={styles.section}>
      {/* FIX: Wrapped in TouchableOpacity to support onPress */}
      <TouchableOpacity 
        style={[styles.sectionHeader, { backgroundColor }]}
        activeOpacity={0.7} // Adds a visual feedback effect on press
        onPress={onToggle} 
      >
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        {trailing}
        <Text style={styles.expandIcon}>
          {isExpanded ? '▼' : '▶'}
        </Text>
      </TouchableOpacity>
      
      {isExpanded && child}
    </View>
  );

  const buildKeyValueList = (items: any[]) => {
    const parsedItems: { label: string; value: string }[] = [];

    for (let i = 0; i < items.length; i++) {
      let item = items[i];
      let label = `Item ${i + 1}`;
      let value = item.toString();

      if (item && typeof item === 'object') {
        // Handle object with name/value properties
        if ('name' in item && item.name) {
          label = String(item.name);
          if ('value' in item && item.value !== null && String(item.value).trim() !== '') {
            value = String(item.value);
            if ('unitName' in item && item.unitName) {
              value += ` ${item.unitName}`;
            }
          } else if ('description' in item && item.description) {
            value = String(item.description);
          } else if ('amount' in item && item.amount) {
            value = String(item.amount);
            if ('unitName' in item && item.unitName) {
              value += ` ${item.unitName}`;
            }
          } else {
            label = 'Attribute';
            value = String(item.name);
          }
        } else if (item instanceof Map || item instanceof Object) {
          const keys = Object.keys(item);
          if (keys.length > 0) {
            label = keys[0];
            value = String((item as any)[keys[0]]);
          }
        }
      } else if (item instanceof MapEntry) {
        label = String(item.key);
        value = String(item.value);
      }

      parsedItems.push({ label, value });
    }

    // Merge serving_size and serving_size_unit
    const sizeIndex = parsedItems.findIndex((e) => e.label === 'serving_size');
    const unitIndex = parsedItems.findIndex((e) => e.label === 'serving_size_unit');
    if (sizeIndex !== -1 && unitIndex !== -1) {
      const combinedValue = `${parsedItems[sizeIndex].value} ${parsedItems[unitIndex].value}`.trim();
      parsedItems[sizeIndex] = { label: 'serving_size', value: combinedValue };
      parsedItems.splice(unitIndex, 1);
    }

    const validItems = parsedItems.filter((entry) => !getIfEmpty(entry.value));
    if (validItems.length === 0) return null;

    return (
      <View style={styles.listContainer}>
        {validItems.map((entry, index) => {
          if (entry.label.toLowerCase() === 'ingredients') {
            return (
              <View key={index} style={styles.ingredientSection}>
                <Text style={styles.ingredientTitle}>
                  {processFoodSectionName(entry.label)}
                </Text>
                <Text style={styles.ingredientText}>{entry.value}</Text>
              </View>
            );
          }

          return (
            <View key={index} style={styles.row}>
              <Text style={styles.label}>{processFoodSectionName(entry.label)}</Text>
              <Text style={styles.value}>{entry.value}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  const getIfEmpty = (value: string): boolean => {
    return !value || value.trim() === '';
  };

  const processFoodSectionName = (name: string): string => {
    const map: Record<string, string> = {
      calories: 'Calories',
      protein: 'Protein',
      carbs: 'Carbs',
      fat: 'Fat',
      serving_size: 'Serving Size',
      ingredients: 'Ingredients',
      description: 'Description',
    };
    return map[name.toLowerCase()] || name;
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading food details...</Text>
        <NutritionLoader text="Loading food details..." themeColor="#2E7D32" />
      </View>
    );
  }

  if (!foodItem) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.center}>
          {renderErrorState()}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.foodName}>{foodItem.name}</Text>
          <View style={styles.categoryChip}>
            <Text style={styles.categoryText}>{foodItem.category}</Text>
          </View>
        </View>

        {renderAISection()}

        {renderConditionalSection({
          title: 'Nutrients',
          isExpanded: showNutrients,
          items: foodItem.nutrients,
          onToggle: () => setShowNutrients(!showNutrients),
        })}

        {renderConditionalSection({
          title: 'Portions',
          isExpanded: showPortions,
          items: foodItem.portions,
          onToggle: () => setShowPortions(!showPortions),
        })}

        {renderConditionalSection({
          title: 'Branded Info',
          isExpanded: showBrandedInfo,
          items: Object.entries(foodItem.brandedInfo), // Note: entries might need mapping if structure differs
          onToggle: () => setShowBrandedInfo(!showBrandedInfo),
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  foodName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  categoryChip: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: 'flex-start', // Added for better alignment if needed
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  section: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#2E7D32',
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  expandIcon: {
    fontSize: 18,
    color: '#FFFFFF',
    marginLeft: 12, // Added spacing for icon
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FCE8E8',
    borderRadius: 8,
  },
  errorIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  // FIXED: Added missing style property below
  errorIconText: {
    fontSize: 20,
    lineHeight: 24,
  },
  errorContent: {
    flex: 1,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D32F2F',
  },
  errorText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  descriptionContainer: {
    padding: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  descriptionText: {
    fontSize: 16,
    color: '#000000',
    lineHeight: 24, // Better readability than 1.6 usually requires explicit height or lineHeight calculation
  },
  ingredientSection: {
    marginBottom: 16,
  },
  ingredientTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 4,
  },
  ingredientText: {
    fontSize: 16,
    color: '#000000',
    lineHeight: 24,
  },
  listContainer: {
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 16, // Added padding to align labels/values inside section
  },
  label: {
    fontSize: 18,
    fontWeight: '500',
    color: '#2E7D32',
    flex: 1,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    flex: 2,
    textAlign: 'right',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  errorSubText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
  },
  loadingText: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 16,
  },
  refreshText: {
    fontSize: 20,
    color: '#FFFFFF',
    padding: 8, // Added some padding for touch target
  },
});

export default FoodDetailScreen;
