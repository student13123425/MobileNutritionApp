import { FoodLogEntry, PlannedMeal } from "../../CommunScripts/objects";
import { NutritionalGoals } from "./goals_model";

export interface ValidationResult {
  isMet: boolean;
  consumedCalories: number;
  consumedProtein: number;
  consumedCarbs: number;
  consumedFat: number;
  remainingCalories: number;
  remainingProtein: number;
  remainingCarbs: number;
  remainingFat: number;
}

export class GoalValidator {
  static checkDailyGoals(
    goals: NutritionalGoals,
    logs: FoodLogEntry[]
  ): ValidationResult {
    const consumed = this._calculateTotals(logs);

    const cCalories = consumed.calories ?? 0;
    const cProtein = consumed.protein ?? 0;
    const cCarbs = consumed.carbs ?? 0;
    const cFat = consumed.fat ?? 0;

    const remainingCalories = goals.targetCalories - cCalories;
    const remainingProtein = goals.targetProteinGrams - cProtein;
    const remainingCarbs = goals.targetCarbsGrams - cCarbs;
    const remainingFat = goals.targetFatGrams - cFat;

    const metCalories = cCalories >= goals.targetCalories;
    const metProtein = cProtein >= goals.targetProteinGrams;
    const metCarbs = cCarbs >= goals.targetCarbsGrams;
    const metFat = cFat >= goals.targetFatGrams;

    return {
      isMet: metCalories && metProtein && metCarbs && metFat,
      consumedCalories: cCalories,
      consumedProtein: cProtein,
      consumedCarbs: cCarbs,
      consumedFat: cFat,
      remainingCalories,
      remainingProtein,
      remainingCarbs,
      remainingFat,
    };
  }

  static checkDailyGoalsWithPlan(
    goals: NutritionalGoals,
    meals: PlannedMeal[]
  ): ValidationResult {
    const planned = this._calculatePlanTotals(meals);

    const pCalories = planned.calories ?? 0;
    const pProtein = planned.protein ?? 0;
    const pCarbs = planned.carbs ?? 0;
    const pFat = planned.fat ?? 0;

    const remainingCalories = goals.targetCalories - pCalories;
    const remainingProtein = goals.targetProteinGrams - pProtein;
    const remainingCarbs = goals.targetCarbsGrams - pCarbs;
    const remainingFat = goals.targetFatGrams - pFat;

    const metCalories = pCalories >= goals.targetCalories;
    const metProtein = pProtein >= goals.targetProteinGrams;
    const metCarbs = pCarbs >= goals.targetCarbsGrams;
    const metFat = pFat >= goals.targetFatGrams;

    return {
      isMet: metCalories && metProtein && metCarbs && metFat,
      consumedCalories: pCalories,
      consumedProtein: pProtein,
      consumedCarbs: pCarbs,
      consumedFat: pFat,
      remainingCalories,
      remainingProtein,
      remainingCarbs,
      remainingFat,
    };
  }

  static getProgressPercentage(current: number, target: number): number {
    if (target === 0) return 100;
    const percentage = (current / target) * 100;
    return percentage > 100 ? 100 : percentage < 0 ? 0 : percentage;
  }

  static getProgressColor(current: number, target: number): string {
    if (target === 0) return '#4CAF50';

    const percentage = current / target;

    if (percentage >= 1.0) return '#4CAF50';
    if (percentage >= 0.75) return '#8BC34A';
    if (percentage >= 0.5) return '#FFC107';
    if (percentage >= 0.25) return '#FF5722';
    return '#F44336';
  }

  private static _calculateTotals(entries: FoodLogEntry[]): {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  } {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    for (const entry of entries) {
      const data = entry.nutritionData;
      if (!data || typeof data !== 'object') continue;

      totalCalories += this._safeGetNumber(data, 'calories');
      totalProtein += this._safeGetNumber(data, 'protein');
      totalCarbs += this._safeGetNumber(data, 'carbs');
      totalFat += this._safeGetNumber(data, 'fat');
    }

    return {
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat,
    };
  }

  private static _calculatePlanTotals(meals: PlannedMeal[]): {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  } {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    for (const meal of meals) {
      for (const item of meal.items) {
        const nutrients = item.nutrients;
        if (!Array.isArray(nutrients) || nutrients.length === 0) continue;

        for (const nutrient of nutrients) {
          if (!nutrient || typeof nutrient !== 'object') continue;

          const name = (nutrient.name || '').toLowerCase();
          const value = this._safeGetNumber(nutrient, 'value');

          if (name.includes('calories')) {
            totalCalories += value;
          } else if (name.includes('protein')) {
            totalProtein += value;
          } else if (name.includes('carb')) {
            totalCarbs += value;
          } else if (name.includes('fat')) {
            totalFat += value;
          }
        }
      }
    }

    return {
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat,
    };
  }

  private static _safeGetNumber(obj: Record<string, any>, key: string): number {
    const value = obj[key];
    if (value == null) return 0;

    if (typeof value === 'number') return value;

    try {
      const parsed = parseFloat(value.toString());
      return isNaN(parsed) ? 0 : parsed;
    } catch {
      return 0;
    }
  }
}