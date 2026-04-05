import RNFS from 'react-native-fs';
import SQLite from 'react-native-sqlite-storage';
import { Buffer } from 'buffer';

export enum ScheduleType {
    SINGLE_EVENT = 'SINGLE_EVENT',
    RECURRING_WEEKLY = 'REC_WEEK',
    DAILY = 'DAILY'
}

export enum MealType {
    breakfast = 'breakfast',
    lunch = 'lunch',
    dinner = 'dinner',
    snack = 'snack'
}

export class TimeItem {
    constructor(
        public title: string,
        public type: ScheduleType,
        public startHour: number,
        public endHour: number,
        public recurringDays?: number[],
        public startDate?: Date,
        public endDate?: Date
    ) {}

    isTimeMatch(dateTime: Date): boolean {
        if (this.type === ScheduleType.SINGLE_EVENT && this.startDate && this.endDate) {
            return dateTime > this.startDate && dateTime < this.endDate;
        }
        if (this.type === ScheduleType.RECURRING_WEEKLY && this.recurringDays) {
            const dayIndex = dateTime.getDay();
            if (!this.recurringDays.includes(dayIndex)) return false;
        }
        const hour = dateTime.getHours();
        return hour >= this.startHour && hour < this.endHour;
    }
}

export class FoodItem {
    constructor(
        public name: string,
        public category: string,
        public nutrients: any[],
        public portions: any[],
        public attributes: any[],
        public brandedInfo: any
    ) {}

    static fromJson(json: any): FoodItem {
        return new FoodItem(
            json.name || '',
            json.category || '',
            json.nutrients || [],
            json.portions || [],
            json.attributes || [],
            json.brandedInfo || {}
        );
    }

    toJSON() {
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
    constructor(
        public name: string,
        public minutes: number,
        public steps: string,
        public description: string,
        public nutrition: string | null,
        public tags: string[],
        public ingredients: string[]
    ) {}

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

    static fromJson(json: any): Recipe {
        return new Recipe(
            json.name || '',
            json.minutes || 0,
            json.steps || '',
            json.description || '',
            json.nutrition || null,
            json.tags || [],
            json.ingredients || []
        );
    }
}

class Tokenizer {
    private static instance: Tokenizer;
    private forwardVocab: Map<string, number> = new Map();
    private reverseVocab: Map<number, string> = new Map();
    private isLoaded: boolean = false;

    private constructor() {}

    static getInstance(): Tokenizer {
        if (!Tokenizer.instance) Tokenizer.instance = new Tokenizer();
        return Tokenizer.instance;
    }

    async load() {
        if (this.isLoaded) return;
        const localPath = `${RNFS.DocumentDirectoryPath}/food_vocab.json`;
        try {
            if (await RNFS.exists(localPath)) {
                const jsonString = await RNFS.readFile(localPath, 'utf8');
                this._loadVocabFromJson(jsonString);
                this.isLoaded = true;
                return;
            }
        } catch (e) {}

        try {
            const jsonString = await RNFS.readFile(localPath, 'utf8');
            this._loadVocabFromJson(jsonString);
            this.isLoaded = true;
        } catch (e) {
            this.forwardVocab.set('<UNK>', 0);
            this.reverseVocab.set(0, '<UNK>');
            this.isLoaded = true;
        }
    }

    private _loadVocabFromJson(jsonString: string) {
        const jsonMap: Record<string, number> = JSON.parse(jsonString);
        for (const [key, value] of Object.entries(jsonMap)) {
            this.forwardVocab.set(key, value);
            this.reverseVocab.set(value, key);
        }
    }

    encode(text: string): Uint8Array {
        const cleanText = text.trim();
        const id = this.forwardVocab.get(cleanText);
        const targetId = id !== undefined ? id : (this.forwardVocab.size + 1);
        const buffer = new ArrayBuffer(4);
        const view = new DataView(buffer);
        view.setUint32(0, targetId, true);
        return new Uint8Array(buffer);
    }

    decode(blob: Uint8Array | null): string {
        if (!blob || blob.length === 0) return '';
        const words: string[] = [];
        for (let i = 0; i <= blob.length - 4; i += 4) {
            const view = new DataView(blob.buffer, blob.byteOffset + i, 4);
            const id = view.getUint32(0, true);
            const word = this.reverseVocab.get(id);
            if (word && !['<PAD>', '<UNK>', '<EOS>'].includes(word)) {
                words.push(word);
            }
        }
        return words.join(" | ");
    }
}

export class DatabaseService {
    private tokenizer = Tokenizer.getInstance();

    async copyDatabaseIfNotExists(assetPath: string, targetName: string, forceRefresh = false) {
        const destPath = `${RNFS.DocumentDirectoryPath}/${targetName}`;
        if (forceRefresh && await RNFS.exists(destPath)) {
            try {
                await RNFS.unlink(destPath);
            } catch (e) {}
        }
        if (!(await RNFS.exists(destPath))) {
            try {
                await RNFS.copyFile(assetPath, destPath);
            } catch (e) {}
        }
    }

    async getFoodNames(limit = 2000): Promise<string[]> {
        try {
            await this.tokenizer.load();
            const db = await SQLite.openDatabase({ name: 'food.db', location: 'default' });
            const names: string[] = [];

            await new Promise<void>((resolve, reject) => {
                db.transaction((tx) => {
                    tx.executeSql(
                        'SELECT name FROM food_items LIMIT ?',
                        [limit],
                        (_, res) => {
                            for (let i = 0; i < res.rows.length; i++) {
                                const b64 = res.rows.item(i).name;
                                const uint8 = Uint8Array.from(Buffer.from(b64, 'base64'));
                                const dec = this.tokenizer.decode(uint8);
                                if (dec) names.push(dec);
                            }
                            resolve();
                        },
                        (_, err) => { reject(err); return false; }
                    );
                });
            });

            return names.sort(() => Math.random() - 0.5);
        } catch (e) {
            return [];
        }
    }

    async searchFoodNames(query: string, limit = 50): Promise<string[]> {
        try {
            await this.tokenizer.load();
            const db = await SQLite.openDatabase({ name: 'food.db', location: 'default' });
            const queryBlob = this.tokenizer.encode(query);
            const b64Query = Buffer.from(queryBlob).toString('base64');
            const results: string[] = [];

            await new Promise<void>((resolve, reject) => {
                db.transaction((tx) => {
                    tx.executeSql(
                        `SELECT name FROM food_items WHERE INSTR(name, ?) > 0 LIMIT ?`,
                        [b64Query, limit],
                        (_, res) => {
                            for (let i = 0; i < res.rows.length; i++) {
                                const b64Name = res.rows.item(i).name;
                                const uint8 = Uint8Array.from(Buffer.from(b64Name, 'base64'));
                                const dec = this.tokenizer.decode(uint8);
                                if (dec) results.push(dec);
                            }
                            resolve();
                        },
                        (_, err) => { reject(err); return false; }
                    );
                });
            });
            return results;
        } catch (e) {
            return [];
        }
    }

    async getFoodItemByName(name: string): Promise<FoodItem | null> {
        try {
            await this.tokenizer.load();
            const db = await SQLite.openDatabase({ name: 'food.db', location: 'default' });
            const blob = this.tokenizer.encode(name);
            const b64Name = Buffer.from(blob).toString('base64');

            let foundItem: FoodItem | null = null;

            await new Promise<void>((resolve, reject) => {
                db.transaction((tx) => {
                    tx.executeSql(
                        `SELECT fi.name, fi.category, bf.brand_name, bf.ingredients,
                              bf.serving_size, bf.serving_size_unit, bf.household_serving_fulltext,
                              bf.branded_food_category, p.id as p_id, p.fdc_id as p_fdc_id, p.amount,
                              p.measure_unit_id, p.portion_description, p.gram_weight, a.id as a_id,
                              a.fdc_id as a_fdc_id, a.name as a_name, a.value as a_value,
                              fn.id as fn_id, fn.nutrient_id, fn.amount as fn_amount, nt.id as nt_id,
                              nt.name as nt_name, nt.unit_name, nt.rank
                              FROM food_items fi
                              LEFT JOIN branded_food bf ON fi.id = bf.fdc_id
                              LEFT JOIN portions p ON fi.id = p.fdc_id
                              LEFT JOIN food_attributes a ON fi.id = a.fdc_id
                              LEFT JOIN food_nutrients fn ON fi.id = fn.fdc_id
                              LEFT JOIN nutrient_types nt ON fn.nutrient_id = nt.id
                              WHERE fi.name = ?`,
                        [b64Name],
                        (_, res) => {
                            if (res.rows.length > 0) {
                                const row = res.rows.item(0);
                                const dec = (col: string) => {
                                    if (!col) return '';
                                    return this.tokenizer.decode(Uint8Array.from(Buffer.from(col, 'base64')));
                                };

                                const nutrients: any[] = [];
                                const portions: any[] = [];
                                const attributes: any[] = [];
                                let brandedInfo: any = {};

                                const seenN = new Set();
                                const seenP = new Set();
                                const seenA = new Set();

                                for (let i = 0; i < res.rows.length; i++) {
                                    const r = res.rows.item(i);
                                    if (Object.keys(brandedInfo).length === 0 && r.brand_name) {
                                        brandedInfo = {
                                            brand_name: dec(r.brand_name),
                                            ingredients: dec(r.ingredients),
                                            serving_size: r.serving_size,
                                            serving_size_unit: dec(r.serving_size_unit),
                                            household_serving_fulltext: dec(r.household_serving_fulltext),
                                            branded_food_category: dec(r.branded_food_category)
                                        };
                                    }

                                    if (r.fn_id && !seenN.has(r.fn_id)) {
                                        nutrients.push({
                                            name: dec(r.nt_name),
                                            unit: dec(r.unit_name),
                                            amount: r.fn_amount,
                                            rank: r.rank
                                        });
                                        seenN.add(r.fn_id);
                                    }

                                    if (r.p_id && !seenP.has(r.p_id)) {
                                        portions.push({
                                            fdc_id: r.p_fdc_id,
                                            amount: r.amount,
                                            description: dec(r.portion_description),
                                            gram_weight: r.gram_weight
                                        });
                                        seenP.add(r.p_id);
                                    }

                                    if (r.a_id && !seenA.has(r.a_id)) {
                                        attributes.push({
                                            name: dec(r.a_name),
                                            value: dec(r.a_value)
                                        });
                                        seenA.add(r.a_id);
                                    }
                                }

                                foundItem = new FoodItem(
                                    dec(row.name),
                                    dec(row.category),
                                    nutrients,
                                    portions,
                                    attributes,
                                    brandedInfo
                                );
                            }
                            resolve();
                        },
                        (_, err) => { reject(err); return false; }
                    );
                });
            });
            return foundItem;
        } catch (e) {
            return null;
        }
    }
}

class RecipeDatabase {
    private static instance: RecipeDatabase;
    private db: SQLite.SQLiteDatabase | null = null;

    private constructor() {}

    static getInstance(): RecipeDatabase {
        if (!RecipeDatabase.instance) RecipeDatabase.instance = new RecipeDatabase();
        return RecipeDatabase.instance;
    }

    async getDatabase() {
        if (this.db) return this.db;
        this.db = await SQLite.openDatabase({ name: 'recipes.db', location: 'default' });
        return this.db;
    }

    async getRecipes(searchQuery = '', limit = 50): Promise<Recipe[]> {
        const db = await this.getDatabase();
        const recipes: Recipe[] = [];
        const whereClause = searchQuery ? 'name LIKE ?' : '';
        const args: any[] = searchQuery ? [`%${searchQuery.trim()}%`] : [];

        try {
            await new Promise<void>((resolve, reject) => {
                db!.transaction((tx) => {
                    tx.executeSql(
                        `SELECT * FROM recipes ${whereClause} LIMIT ?`,
                        [...args, limit],
                        (_, res) => {
                            for (let i = 0; i < res.rows.length; i++) {
                                const r = res.rows.item(i);
                                recipes.push(new Recipe(
                                    r.name,
                                    r.minutes,
                                    r.steps,
                                    r.description,
                                    r.nutrition,
                                    [],
                                    []
                                ));
                            }
                            resolve();
                        },
                        (_, err) => { reject(err); return false; }
                    );
                });
            });
            return recipes;
        } catch (e) {
            return [];
        }
    }
}

export async function copyJsonAssetIfNotExists(source: string, destination: string) {
  const destPath = `${RNFS.DocumentDirectoryPath}/${destination}`;
  if (!(await RNFS.exists(destPath))) {
    try {
      await RNFS.copyFile(
        source,
        destPath,
      );
      console.log(`Copied JSON asset ${source} to ${destPath}`);
    } catch (e) {
      console.error(`Error copying JSON asset ${source}:`, e);
      throw e;
    }
  }
}

export const dbService = new DatabaseService();
export const recipeDb = RecipeDatabase.getInstance();