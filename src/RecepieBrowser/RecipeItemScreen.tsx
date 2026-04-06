import React from 'react';
import { SafeAreaView, StyleSheet, View, Text, Platform } from 'react-native';
import { RecipeDetailCard } from './RecipeDetailCard';
import { Recipe } from '../CommunScripts/objects';
import { AppColorsLight, AppColorsDark } from '../style/colors';

type RecipeItemScreenProps = {
  recipe: Recipe;
  lightColors?: typeof AppColorsLight;
  darkColors?: typeof AppColorsDark;
};

const getActiveColors = (lightColors?: any, darkColors?: any) => {
  return lightColors || darkColors || AppColorsLight;
};

export const RecipeItemScreen: React.FC<RecipeItemScreenProps> = ({ recipe, lightColors, darkColors }) => {
  const activeColors = getActiveColors(lightColors, darkColors);
  
  return (
    <View style={styles.container}>
      <View style={[styles.appBar, { backgroundColor: activeColors.primaryGreen }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: '#FFFFFF' }]}>{recipe.name}</Text>
        </View>
      </View>

      <SafeAreaView style={styles.safeArea}>
        <RecipeDetailCard recipe={recipe} />
      </SafeAreaView>
    </View>
  );
};

const layoutStyles = StyleSheet.create({
  container: { flex: 1 },
  appBar: { paddingTop: Platform.OS === 'ios' ? 50 : 24, paddingBottom: 15, paddingHorizontal: 20, elevation: 4 },
  headerContent: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: 'bold' },
  safeArea: { flex: 1 },
});

const styles = StyleSheet.create({
  container: layoutStyles.container,
  appBar: { ...layoutStyles.appBar },
  headerContent: layoutStyles.headerContent,
  title: layoutStyles.title,
  safeArea: layoutStyles.safeArea,
});

export default RecipeItemScreen;