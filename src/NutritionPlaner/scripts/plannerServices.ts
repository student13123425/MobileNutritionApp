import { FoodLogEntry } from "../../CommunScripts/objects";
import { NutritionalGoals } from "./goals_model";
import { DietPlanConfig, getPredefinedPlans } from "./plan_generator";
import { GoalValidator } from "./validate_goals";

export interface DailySummary {
  date: Date;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

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

interface Storage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

class WebStorage implements Storage {
  async getItem(key: string): Promise<string | null> {
    try {
      const value = localStorage.getItem(key);
      return value;
    } catch (e) {
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch (e) {}
  }
}

class NodeStorage implements Storage {
  private storage: Map<string, string> = new Map();

  async getItem(key: string): Promise<string | null> {
    return this.storage.get(key) || null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.storage.set(key, value);
  }
}

const getStorage = (): Storage => {
  if (typeof window !== 'undefined' && 'localStorage' in window) {
    return new WebStorage();
  }
  if (typeof global !== 'undefined' && 'localStorage' in global) {
    return new WebStorage();
  }
  return new NodeStorage();
};

export class PlannerService {
  private static instance: PlannerService;

  private constructor() {}

  public static getInstance(): PlannerService {
    if (!PlannerService.instance) {
      PlannerService.instance = new PlannerService();
    }
    return PlannerService.instance;
  }

  async getDailySummary(date: Date): Promise<DailySummary> {
    const logs = await this._fetchLogsForDate(date);
    const totals = this._calculateTotals(logs);

    return {
      date,
      calories: totals.calories,
      protein: totals.protein,
      carbs: totals.carbs,
      fat: totals.fat,
    };
  }

  async validateDailyGoals(
    date: Date,
    goals: NutritionalGoals
  ): Promise<ValidationResult> {
    const logs = await this._fetchLogsForDate(date);
    return GoalValidator.checkDailyGoals(goals, logs);
  }

  recommendPlans(goals: NutritionalGoals): DietPlanConfig[] {
    return getPredefinedPlans();
  }

  private async _fetchLogsForDate(date: Date): Promise<FoodLogEntry[]> {
    const key = `food_logs_${this._getDateKey(date)}`;
    const jsonList = await this._getStringList(key) ?? [];

    return jsonList.map((item) => JSON.parse(item));
  }

  private async _addFoodLog(entry: FoodLogEntry): Promise<void> {
    const key = `food_logs_${this._getDateKey(entry.createdAt)}`;
    const current = await this._getStringList(key) ?? [];
    current.push(JSON.stringify(entry));
    await this._setStringList(key, current);
  }

  private _getDateKey(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private _calculateTotals(entries: FoodLogEntry[]): {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
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

  private _safeGetNumber(obj: Record<string, any>, key: string): number {
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

  private async _getStringList(key: string): Promise<string[] | null> {
    const storage = getStorage();
    const value = await storage.getItem(key);
    return value ? JSON.parse(value) : null;
  }

  private async _setStringList(key: string, value: string[]): Promise<void> {
    const storage = getStorage();
    await storage.setItem(key, JSON.stringify(value));
  }
}