// planGenerator.ts
export interface DietPlanConfig {
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export function getPredefinedPlans(): DietPlanConfig[] {
  return [
    {
      name: 'Keto',
      description: 'High fat, low carb diet.',
      calories: 2000,
      protein: 150.0,
      carbs: 50.0,
      fat: 160.0,
    },
    {
      name: 'Vegan',
      description: 'Plant-based diet.',
      calories: 2000,
      protein: 80.0,
      carbs: 350.0,
      fat: 60.0,
    },
    {
      name: 'Carnivore',
      description: 'Meat-based diet.',
      calories: 2500,
      protein: 250.0,
      carbs: 0.0,
      fat: 180.0,
    },
    {
      name: 'Mediterranean',
      description: 'Healthy fats and whole grains.',
      calories: 2000,
      protein: 150.0,
      carbs: 250.0,
      fat: 80.0,
    },
    {
      name: 'Balanced',
      description: 'Standard healthy diet.',
      calories: 2000,
      protein: 160.0,
      carbs: 250.0,
      fat: 70.0,
    },
    {
      name: 'High Protein',
      description: 'Muscle building focus.',
      calories: 2400,
      protein: 220.0,
      carbs: 200.0,
      fat: 80.0,
    },
  ];
}

export function getIconForPlan(planName: string): string {
  const lowerName = planName.toLowerCase();
  switch (lowerName) {
    case 'keto':
      return 'bolt';
    case 'vegan':
      return 'local_florist';
    case 'carnivore':
      return 'lunch_dining';
    case 'mediterranean':
      return 'kitchen';
    case 'balanced':
      return 'restaurant_menu';
    case 'high protein':
      return 'fitness_center';
    default:
      return 'restaurant';
  }
}
