export enum ScheduleType {
  SINGLE_EVENT = 'SINGLE_EVENT',
  REC_WEEKLY = 'REC_WEEKLY',
  DAILY = 'DAILY'
}

export const AppColorsLight = {
  primaryGreen: '#2E7D32',
  lightGreen: '#81C784',
  white: '#FFFFFF',
  opacityWhite70: 'rgba(255, 255, 255, 0.7)',
  backgroundWhite: '#FFF',
  backgroundLightGray: '#F0F0F0',
} as const;

export const AppColorsDark = {
  primaryGreen: '#66BB6A',
  lightGreen: '#A5D6A7',
  white: '#FFFFFF',
  opacityWhite70: 'rgba(255, 255, 255, 0.7)',
  backgroundWhite: '#1A1A1A',
  backgroundLightGray: '#2D2D2D',
} as const;

export type AppColorKey = keyof typeof AppColorsLight;

export enum MealType {
  breakfast = 'breakfast',
  lunch = 'lunch',
  dinner = 'dinner',
  snack = 'snack'
}

export class TimeItem {
  type: ScheduleType;
  title: string;
  startHour: number;
  endHour: number;
  recurringDays?: number[];
  startDate?: Date;
  endDate?: Date;

  constructor(data: Partial<TimeItem>) {
    this.type = data.type || ScheduleType.DAILY;
    this.title = data.title || '';
    this.startHour = data.startHour || 0;
    this.endHour = data.endHour || 24;
    this.recurringDays = data.recurringDays;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
  }

  isTimeMatch(date: Date): boolean {
    if (this.type === ScheduleType.SINGLE_EVENT && this.startDate && this.endDate) {
      return date >= this.startDate && date <= this.endDate;
    }

    if (this.type === ScheduleType.REC_WEEKLY && this.recurringDays) {
      const dayIndex = date.getDay();
      if (!this.recurringDays.includes(dayIndex)) return false;
    }

    const hour = date.getHours();
    return hour >= this.startHour && hour < this.endHour;
  }
}

export class FoodItem {
  name: string;
  category: string;
  nutrients: Array<Record<string, any>>;
  portions: Array<Record<string, any>>;
  attributes: Array<Record<string, any>>;
  brandedInfo: Record<string, any>;

  constructor(data: Partial<FoodItem>) {
    this.name = data.name || '';
    this.category = data.category || '';
    this.nutrients = data.nutrients || [];
    this.portions = data.portions || [];
    this.attributes = data.attributes || [];
    this.brandedInfo = data.brandedInfo || {};
  }

  static fromJson(json: any): FoodItem {
    return new FoodItem({
      name: json.name,
      category: json.category,
      nutrients: json.nutrients,
      portions: json.portions,
      attributes: json.attributes,
      brandedInfo: json.brandedInfo,
    });
  }

  toJson(): any {
    return {
      name: this.name,
      category: this.category,
      nutrients: this.nutrients,
      portions: this.portions,
      attributes: this.attributes,
      brandedInfo: this.brandedInfo,
    };
  }
}

export class Recipe {
  name: string;
  minutes: number;
  steps: string;
  description: string;
  nutrition?: string;
  tags: string[];
  ingredients: string[];

  constructor(data: Partial<Recipe>) {
    this.name = data.name || '';
    this.minutes = data.minutes || 0;
    this.steps = data.steps || '';
    this.description = data.description || '';
    this.nutrition = data.nutrition;
    this.tags = data.tags || [];
    this.ingredients = data.ingredients || [];
  }

  static fromJson(json: any): Recipe {
    return new Recipe({
      name: json.name,
      minutes: json.minutes,
      steps: json.steps,
      description: json.description,
      nutrition: json.nutrition,
      tags: json.tags,
      ingredients: json.ingredients,
    });
  }

  toJson(): any {
    return {
      name: this.name,
      minutes: this.minutes,
      steps: this.steps,
      description: this.description,
      nutrition: this.nutrition,
      tags: this.tags,
      ingredients: this.ingredients,
    };
  }
}

export class DailyGoals {
  id: number;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  date?: string;

  constructor(data: Partial<DailyGoals>) {
    this.id = data.id || 0;
    this.targetCalories = data.targetCalories || 0;
    this.targetProtein = data.targetProtein || 0.0;
    this.targetCarbs = data.targetCarbs || 0.0;
    this.targetFat = data.targetFat || 0.0;
    this.date = data.date;
  }

  static fromJson(json: any): DailyGoals {
    return new DailyGoals({
      id: json.id,
      targetCalories: json.targetCalories,
      targetProtein: json.targetProtein,
      targetCarbs: json.targetCarbs,
      targetFat: json.targetFat,
      date: json.date,
    });
  }

  toJson(): any {
    return {
      id: this.id,
      targetCalories: this.targetCalories,
      targetProtein: this.targetProtein,
      targetCarbs: this.targetCarbs,
      targetFat: this.targetFat,
      date: this.date,
    };
  }
}

export class FoodLogEntry {
  id?: number;
  foodName: string;
  recipeId?: string;
  nutritionData?: Record<string, any>;
  timeFrame: TimeItem;
  notes?: string;
  createdAt: Date;

  constructor(data: Partial<FoodLogEntry>) {
    this.id = data.id;
    this.foodName = data.foodName || '';
    this.recipeId = data.recipeId;
    this.nutritionData = data.nutritionData;
    this.timeFrame = data.timeFrame!;
    this.notes = data.notes;
    this.createdAt = data.createdAt || new Date();
  }

  static fromJson(json: any): FoodLogEntry {
    const timeFrame = new TimeItem({
      title: json.timeFrameTitle || 'Unknown',
      type: json.timeFrameType === ScheduleType.SINGLE_EVENT ? ScheduleType.SINGLE_EVENT :
            json.timeFrameType === ScheduleType.REC_WEEKLY ? ScheduleType.REC_WEEKLY : ScheduleType.DAILY,
      startHour: json.timeFrameStartHour || 0,
      endHour: json.timeFrameEndHour || 24,
    });

    return new FoodLogEntry({
      id: json.id,
      foodName: json.foodName,
      recipeId: json.recipeId,
      notes: json.notes,
      createdAt: new Date(json.createdAt),
      timeFrame: timeFrame,
      nutritionData: json.nutritionData,
    });
  }

  toJson(): any {
    return {
      id: this.id,
      foodName: this.foodName,
      recipeId: this.recipeId,
      notes: this.notes,
      createdAt: this.createdAt.toISOString(),
      timeFrameTitle: this.timeFrame.title,
      timeFrameType: this.timeFrame.type,
      timeFrameStartHour: this.timeFrame.startHour,
      timeFrameEndHour: this.timeFrame.endHour,
      nutritionData: this.nutritionData,
    };
  }
}

export class PlannedMeal {
  type: MealType;
  items: FoodItem[];

  constructor(data: Partial<PlannedMeal>) {
    this.type = data.type || MealType.breakfast;
    this.items = data.items || [];
  }

  getTotalNutrition(): Record<string, number> {
    let calories = 0, protein = 0, carbs = 0, fat = 0;

    for (const item of this.items) {
      for (const nutrient of item.nutrients) {
        const name = (nutrient.name || '').toLowerCase();
        const val = Number(nutrient.value || 0);

        if (name.includes('calories')) calories += val;
        else if (name.includes('protein')) protein += val;
        else if (name.includes('carb')) carbs += val;
        else if (name.includes('fat')) fat += val;
      }
    }

    return { calories, protein, carbs, fat };
  }

  static fromJson(json: any): PlannedMeal {
    const items = (json.items || []).map((i: any) => FoodItem.fromJson(i));
    return new PlannedMeal({
      type: json.type as MealType,
      items: items
    });
  }

  toJson(): any {
    return {
      type: this.type,
      items: this.items.map(i => i.toJson()),
    };
  }
}

export class DailyPlan {
  date: Date;
  meals: PlannedMeal[];
  isCompleted: boolean;

  constructor(data: Partial<DailyPlan>) {
    this.date = data.date || new Date();
    this.meals = data.meals || [];
    this.isCompleted = data.isCompleted || false;
  }

  static fromJson(json: any): DailyPlan {
    return new DailyPlan({
      date: new Date(json.date),
      meals: (json.meals || []).map((m: any) => PlannedMeal.fromJson(m)),
      isCompleted: json.isCompleted,
    });
  }

  toJson(): any {
    return {
      date: this.date.toISOString(),
      meals: this.meals.map(m => m.toJson()),
      isCompleted: this.isCompleted,
    };
  }
}

export class DietPlan {
  id: number;
  name: string;
  startDate: Date;
  endDate: Date;
  days: DailyPlan[];
  isActive: boolean;

  constructor(data: Partial<DietPlan>) {
    this.id = data.id || 0;
    this.name = data.name || '';
    this.startDate = data.startDate || new Date();
    this.endDate = data.endDate || new Date();
    this.days = data.days || [];
    this.isActive = data.isActive || false;
  }

  get totalDays(): number {
    return this.days.length;
  }

  isDateInRange(date: Date): boolean {
    return date >= this.startDate && date <= this.endDate;
  }

  static fromJson(json: any): DietPlan {
    return new DietPlan({
      id: json.id,
      name: json.name,
      startDate: new Date(json.startDate),
      endDate: new Date(json.endDate),
      days: (json.days || []).map((d: any) => DailyPlan.fromJson(d)),
      isActive: json.isActive,
    });
  }

  toJson(): any {
    return {
      id: this.id,
      name: this.name,
      startDate: this.startDate.toISOString(),
      endDate: this.endDate.toString(),
      days: this.days.map(d => d.toJson()),
      isActive: this.isActive,
    };
  }
}