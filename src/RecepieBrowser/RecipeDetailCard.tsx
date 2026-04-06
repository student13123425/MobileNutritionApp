import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Recipe } from '../CommunScripts/objects';
import { AppColorsLight, AppColorsDark } from '../style/colors';

type RecipeDetailCardProps = {
  recipe: Recipe;
  lightColors?: typeof AppColorsLight;
  darkColors?: typeof AppColorsDark;
};

const getActiveColors = (lightColors?: any, darkColors?: any) => {
  return lightColors || darkColors || AppColorsLight;
};

const layoutStyles = StyleSheet.create({
  container: { padding: 16 },
  recipeName: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  minutesBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginVertical: 10,
  },
  minutesText: { fontWeight: '500' },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  tagChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginRight: 8, marginBottom: 8 },
  tagText: { fontSize: 12 },
  card: { 
    borderRadius: 8, 
    marginBottom: 16, 
    elevation: 2, 
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  cardHeader: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardHeaderText: { fontWeight: '600', fontSize: 16 },
  arrow: {},
  cardContent: { padding: 15 },
  bodyText: { fontSize: 18, color: '#333' },
  stepBox: { 
    backgroundColor: '#e8f5e9', 
    padding: 12, 
    borderRadius: 8, 
    marginBottom: 8,
  },
  stepText: { fontSize: 16, fontWeight: '500' },
  ingredientRow: { flexDirection: 'row', paddingVertical: 4 },
  ingredientText: { fontSize: 18, color: '#333' },
  nutritionRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingVertical: 8, 
    borderBottomWidth: 0.5, 
    borderBottomColor: '#eee',
  },
  nutritionLabel: { fontSize: 16, fontWeight: '500' },
  nutritionValue: { fontSize: 16, fontWeight: 'bold' },
});

export const RecipeDetailCard: React.FC<RecipeDetailCardProps> = ({ recipe, lightColors, darkColors }) => {
  const activeColors = getActiveColors(lightColors, darkColors);
  
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
    <ScrollView style={layoutStyles.container}>
      <Text style={[layoutStyles.recipeName, { color: activeColors.primaryGreen }]}>{recipe.name ?? 'Unknown'}</Text>
      
      <View style={[layoutStyles.minutesBadge, { backgroundColor: activeColors.primaryGreen }]}>
        <Text style={[layoutStyles.minutesText, { color: '#FFFFFF' }]}>Minutes: {recipe.minutes ?? 0}</Text>
      </View>

      <View style={layoutStyles.tagWrap}>
        {cleanedTags.map((tag, i) => (
          <View key={i} style={[layoutStyles.tagChip, { backgroundColor: activeColors.primaryGreen }]}><Text style={[layoutStyles.tagText, { color: '#FFFFFF' }]}>{tag}</Text></View>
        ))}
      </View>

      {recipe.description && (
        <ExpandableCard 
          title="Description" 
          isExpanded={showDescription} 
          onToggle={() => setShowDescription(!showDescription)}
          activeColors={activeColors}
        >
          <Text style={[layoutStyles.bodyText, { color: '#333' }]}>{recipe.description}</Text>
        </ExpandableCard>
      )}

      {nutritionData.length > 0 && (
        <ExpandableCard 
          title="Nutrition Facts" 
          isExpanded={showNutrition} 
          onToggle={() => setShowNutrition(!showNutrition)}
          activeColors={activeColors}
        >
          {nutritionData.map((item, i) => (
            <View key={i} style={layoutStyles.nutritionRow}>
              <Text style={[layoutStyles.nutritionLabel, { color: activeColors.primaryGreen }]}>{item.label}</Text>
              <Text style={layoutStyles.nutritionValue}>{item.value}</Text>
            </View>
          ))}
        </ExpandableCard>
      )}

      {parsedSteps.length > 0 && (
        <ExpandableCard 
          title="Preparation Steps" 
          isExpanded={showSteps} 
          onToggle={() => setShowSteps(!showSteps)}
          activeColors={activeColors}
        >
          {parsedSteps.map((step, i) => (
            <View key={i} style={[layoutStyles.stepBox, { backgroundColor: activeColors.lightGreen }]}>
              <Text style={[layoutStyles.stepText, { color: activeColors.primaryGreen }]}>{i + 1}. {step}</Text>
            </View>
          ))}
        </ExpandableCard>
      )}

      {cleanedIngredients.length > 0 && (
        <ExpandableCard 
          title="Ingredients" 
          isExpanded={showIngredients} 
          onToggle={() => setShowIngredients(!showIngredients)}
          activeColors={activeColors}
        >
          {cleanedIngredients.map((ing, i) => (
            <View key={i} style={layoutStyles.ingredientRow}>
              <Text style={[layoutStyles.ingredientText, { color: '#333' }]}>{'• '}{ing}</Text>
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

type ExpandableCardProps = {
  title: string;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  activeColors?: typeof AppColorsLight | typeof AppColorsDark;
};

const ExpandableCard = ({ title, children, isExpanded, onToggle, activeColors }: ExpandableCardProps) => {
  const headerBgColor = activeColors ? (activeColors.backgroundWhite === '#fff' ? '#2e7630' : 'rgba(128,128,128,0.3)') : '#2e7630';
  
  return (
    <View style={[layoutStyles.card, { backgroundColor: activeColors.backgroundWhite }]} key={title.toLowerCase()}>
      <TouchableOpacity 
        style={[layoutStyles.cardHeader, { backgroundColor: headerBgColor }]} 
        onPress={onToggle}
      >
        <Text style={[layoutStyles.cardHeaderText, { color: '#FFFFFF' }]}>{title}</Text>
        <Text style={[layoutStyles.arrow, { color: '#FFFFFF' }]}>{isExpanded ? '▴' : '▾'}</Text>
      </TouchableOpacity>
      {isExpanded && <View style={layoutStyles.cardContent}>{children}</View>}
    </View>
  );
};

export default RecipeDetailCard;