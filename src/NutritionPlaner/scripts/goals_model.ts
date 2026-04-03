// goalsModel.ts
export interface NutritionalGoals {
  targetCalories: number;
  targetProteinGrams: number;
  targetCarbsGrams: number;
  targetFatGrams: number;
  targetSugarGrams: number;
  targetSodiumMilligrams: number;
  targetFiberGrams: number;
}

export interface GoalCalculatorResult {
  targetCalories: number;
  targetProteinGrams: number;
  targetCarbsGrams: number;
  targetFatGrams: number;
  targetSugarGrams: number;
  targetSodiumMilligrams: number;
  targetFiberGrams: number;
}

export type Gender = 'male' | 'female';
export type GoalPurpose = 'maintain' | 'lose_weight' | 'gain_muscle';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export class GoalCalculator {
  static calculateBMR({
    weightKg,
    heightCm,
    age,
    gender,
    activityLevel = 'moderate',
  }: {
    weightKg: number;
    heightCm: number;
    age: number;
    gender: Gender;
    activityLevel?: ActivityLevel;
  }): number {
    let bmr: number;

    if (gender === 'male') {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
    } else {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
    }

    const multipliers: Record<ActivityLevel, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };

    const factor = multipliers[activityLevel.toLowerCase() as ActivityLevel] || 1.55;
    return Math.round(bmr * factor);
  }

  static calculateDailyGoals({
    weightKg,
    heightCm,
    age,
    gender,
    activityLevel = 'moderate',
    purpose = 'maintain',
  }: {
    weightKg: number;
    heightCm: number;
    age: number;
    gender: Gender;
    activityLevel?: ActivityLevel;
    purpose?: GoalPurpose;
  }): NutritionalGoals {
    const bmr = this.calculateBMR({
      weightKg,
      heightCm,
      age,
      gender,
      activityLevel,
    });

    let targetCalories: number;

    switch (purpose) {
      case 'lose_weight':
        targetCalories = bmr - 500;
        break;
      case 'gain_muscle':
        targetCalories = bmr + 300;
        break;
      default:
        targetCalories = bmr;
    }

    const minCalories = gender === 'female' ? 1200 : 1500;
    if (targetCalories < minCalories) targetCalories = minCalories;

    const proteinCalories = targetCalories * 0.3;
    const carbCalories = targetCalories * 0.4;
    const fatCalories = targetCalories * 0.3;

    const proteinGrams = proteinCalories / 4;
    const carbsGrams = carbCalories / 4;
    const fatGrams = fatCalories / 9;

    const sugarGrams = targetCalories * 0.125;
    const sodiumMilligrams = 2300.0;
    const fiberGrams = 28.0;

    return {
      targetCalories,
      targetProteinGrams: proteinGrams,
      targetCarbsGrams: carbsGrams,
      targetFatGrams: fatGrams,
      targetSugarGrams: sugarGrams,
      targetSodiumMilligrams: sodiumMilligrams,
      targetFiberGrams: fiberGrams,
    };
  }

  static calculateBMI({ weightKg, heightCm }: { weightKg: number; heightCm: number }): string {
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);

    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal Weight';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  }

  static calculateIdealWeightRange({ heightCm }: { heightCm: number }): { min: number; max: number } {
    const heightM = heightCm / 100;
    const minWeight = 18.5 * (heightM * heightM);
    const maxWeight = 24.9 * (heightM * heightM);
    return { min: minWeight, max: maxWeight };
  }
}
