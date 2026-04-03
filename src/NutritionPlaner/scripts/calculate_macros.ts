import { FoodLogEntry, PlannedMeal } from "../../CommunScripts/objects";

// Utility to safely extract number from a value (string, number, null, etc.)
function _getDouble(data: Record<string, any>, key: string): number {
  const value = data[key];
  if (value === null || value === undefined) return 0.0;

  if (typeof value === 'number') return value;

  try {
    const parsed = parseFloat(value.toString());
    return isNaN(parsed) ? 0.0 : parsed;
  } catch {
    return 0.0;
  }
}

export class MacroCalculator {
  /**
   * Calculates total macros from a list of FoodLogEntry
   * @param logs List of food log entries
   * @returns Object with totals for calories, protein, carbs, fat, sugar, sodium, fiber
   */
  static calculateTotals(logs: FoodLogEntry[]): Record<string, number> {
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;
    let sugar = 0;
    let sodium = 0;
    let fiber = 0;

    for (const entry of logs) {
      const data = entry.nutritionData;

      if (data && typeof data === 'object') {
        calories += _getDouble(data, 'calories');
        protein += _getDouble(data, 'protein');
        carbs += _getDouble(data, 'carbs');
        fat += _getDouble(data, 'fat');
        sugar += _getDouble(data, 'sugar');
        sodium += _getDouble(data, 'sodium');
        fiber += _getDouble(data, 'fiber');
      }
    }

    return {
      calories,
      protein,
      carbs,
      fat,
      sugar,
      sodium,
      fiber,
    };
  }

  /**
   * Calculates total macros from a list of PlannedMeal
   * @param meals List of planned meals
   * @returns Object with totals for calories, protein, carbs, fat
   */
  static calculatePlanTotals(meals: PlannedMeal[]): Record<string, number> {
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;

    for (const meal of meals) {
      for (const item of meal.items) {
        const nutrients = item.nutrients;
        if (Array.isArray(nutrients) && nutrients.length > 0) {
          const firstNutrient = nutrients[0];

          if (typeof firstNutrient === 'object' && firstNutrient !== null) {
            calories += _getDouble(firstNutrient, 'calories');
            protein += _getDouble(firstNutrient, 'protein');
            carbs += _getDouble(firstNutrient, 'carbs');
            fat += _getDouble(firstNutrient, 'fat');
          }
        }
      }
    }

    return {
      calories,
      protein,
      carbs,
      fat,
    };
  }

  /**
   * Generates a daily summary object for logging or UI display
   * @param logs List of food log entries
   * @param date Date of the summary
   * @returns Summary object with date and total macros
   */
  static getDailySummary(logs: FoodLogEntry[], date: Date): Record<string, any> {
    const totals = this.calculateTotals(logs);

    return {
      date: date.toISOString(),
      totalCalories: totals.calories,
      totalProtein: totals.protein,
      totalCarbs: totals.carbs,
      totalFat: totals.fat,
    };
  }
}
