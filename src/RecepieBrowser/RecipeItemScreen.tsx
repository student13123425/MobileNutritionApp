import React from 'react';
import { SafeAreaView, StyleSheet, View, Text, Platform } from 'react-native';
import { RecipeDetailCard } from './RecipeDetailCard';
import { Recipe } from '../CommunScripts/objects';

interface Props {
  recipe: Recipe;
}

export const RecipeItemScreen: React.FC<Props> = ({ recipe }) => {
  return (
    <View style={styles.container}>
      {/* Header/AppBar Simulation */}
      <View style={styles.appBar}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{recipe.name}</Text>
        </View>
      </View>

      <SafeAreaView style={styles.safeArea}>
        <RecipeDetailCard recipe={recipe} />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  appBar: {
    backgroundColor: '#2e7d32', // green.shade700
    paddingTop: Platform.OS === 'ios' ? 50 : 24, // Adjust for iOS status bar
    paddingBottom: 15,
    paddingHorizontal: 20,
    elevation: 4,
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold' as const, // Explicitly typed for TypeScript
  },
  safeArea: {
    flex: 1,
  },
});
