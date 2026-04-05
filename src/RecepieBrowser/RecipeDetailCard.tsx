import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Recipe } from '../CommunScripts/objects';

interface Props {
  recipe: Recipe;
}

export const RecipeDetailCard: React.FC<Props> = ({ recipe }) => {
  const [showDescription, setShowDescription] = useState(true);
  const [showSteps, setShowSteps] = useState(true);
  const [showIngredients, setShowIngredients] = useState(true);
  const [showNutrition, setShowNutrition] = useState(true);

  const cleanString = (str: string) => {
    if (str.startsWith("'") && str.endsWith("'")) {
      return str.substring(1, str.length - 1);
    }
    return str;
  };

  const tagsList = Array.isArray(recipe.tags) ? recipe.tags : [];
  const cleanedTags = tagsList.map(tag => cleanString(tag.toString()));

  const ingredientsList = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
  const cleanedIngredients = ingredientsList.map(ing => cleanString(ing.toString()));

  const parsedSteps = (recipe.steps || '').split(',').map(s => cleanString(s.trim())).filter(s => s !== '');

  const nutritionData = parseNutrition(recipe.nutrition);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.recipeName}>{recipe.name ?? 'Unknown'}</Text>
      
      <View style={styles.minutesBadge}>
        <Text style={styles.minutesText}>Minutes: {recipe.minutes ?? 0}</Text>
      </View>

      <View style={styles.tagWrap}>
        {cleanedTags.map((tag, i) => (
          <View key={i} style={styles.tagChip}><Text style={styles.tagText}>{tag}</Text></View>
        ))}
      </View>

      {recipe.description && (
        <ExpandableCard 
          title="Description" 
          isExpanded={showDescription} 
          onToggle={() => setShowDescription(!showDescription)}
        >
          <Text style={styles.bodyText}>{recipe.description}</Text>
        </ExpandableCard>
      )}

      {nutritionData.length > 0 && (
        <ExpandableCard 
          title="Nutrition Facts" 
          isExpanded={showNutrition} 
          onToggle={() => setShowNutrition(!showNutrition)}
        >
          {nutritionData.map((item, i) => (
            <View key={i} style={styles.nutritionRow}>
              <Text style={styles.nutritionLabel}>{item.label}</Text>
              <Text style={styles.nutritionValue}>{item.value}</Text>
            </View>
          ))}
        </ExpandableCard>
      )}

      {parsedSteps.length > 0 && (
        <ExpandableCard 
          title="Preparation Steps" 
          isExpanded={showSteps} 
          onToggle={() => setShowSteps(!showSteps)}
        >
          {parsedSteps.map((step, i) => (
            <View key={i} style={styles.stepBox}>
              <Text style={styles.stepText}>{i + 1}. {step}</Text>
            </View>
          ))}
        </ExpandableCard>
      )}

      {cleanedIngredients.length > 0 && (
        <ExpandableCard 
          title="Ingredients" 
          isExpanded={showIngredients} 
          onToggle={() => setShowIngredients(!showIngredients)}
        >
          {cleanedIngredients.map((ing, i) => (
            <View key={i} style={styles.ingredientRow}>
              <Text style={styles.ingredientText}>• {ing}</Text>
            </View>
          ))}
        </ExpandableCard>
      )}
    </ScrollView>
  );
};

function parseNutrition(raw: any) {
  if (!raw) return [];
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const labels = ['Calories', 'Protein', 'Fat', 'Carbs', 'Sugar', 'Sodium', 'Cholesterol'];

    if (Array.isArray(parsed)) {
      return parsed.map((val: any, i: number) => ({
        label: labels[i] || `Nutrient ${i + 1}`,
        value: typeof val === 'number' ? val.toFixed(1).replace('.0', '') : val.toString()
      }));
    } else if (typeof parsed === 'object') {
      return Object.entries(parsed).map(([key, val]) => ({ label: key, value: val.toString() }));
    }
  } catch (e) {
    return [{ label: 'Nutrition', value: raw.toString() }];
  }
  return [];
}

const ExpandableCard = ({ title, children, isExpanded, onToggle }: any) => (
  <View style={styles.card}>
    <TouchableOpacity style={styles.cardHeader} onPress={onToggle}>
      <Text style={styles.cardHeaderText}>{title}</Text>
      <Text style={styles.arrow}>{isExpanded ? '▴' : '▾'}</Text>
    </TouchableOpacity>
    {isExpanded && <View style={styles.cardContent}>{children}</View>}
  </View>
);

const styles = StyleSheet.create({
  container: { padding: 16 },
  recipeName: { fontSize: 24, fontWeight: 'bold', color: '#1b5e20' },
  minutesBadge: {
    backgroundColor: '#2e7d32',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginVertical: 10,
  },
  minutesText: { color: 'white', fontWeight: '500' },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  tagChip: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: { color: 'white', fontSize: 12 },
  card: { backgroundColor: '#fff', borderRadius: 8, marginBottom: 16, elevation: 2, overflow: 'hidden' },
  cardHeader: {
    backgroundColor: '#2e7630',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardHeaderText: { color: 'white', fontWeight: '600', fontSize: 16 },
  arrow: { color: 'white' },
  cardContent: { padding: 15 },
  bodyText: { fontSize: 18, color: '#333' },
  stepBox: { backgroundColor: '#e8f5e9', padding: 12, borderRadius: 8, marginBottom: 8 },
  stepText: { fontSize: 16, fontWeight: '500', color: '#1b5e20' },
  ingredientRow: { flexDirection: 'row', paddingVertical: 4 },
  ingredientText: { fontSize: 18, color: '#333' },
  nutritionRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  nutritionLabel: { fontSize: 16, fontWeight: '500', color: '#2e7d32' },
  nutritionValue: { fontSize: 16, fontWeight: 'bold' },
});