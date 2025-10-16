export type DrinkEntry = {
  beverage: string;
  quantity: number;
  abv: number;
  calories: number;
  cost: number;
};

export type CravingEntry = {
  intensity: number;
  triggers?: string;
};

export type DailyLogPayload = {
  date: string;
  drinks: DrinkEntry[];
  cravings: CravingEntry[];
  notes?: string;
};

export type DailyLogResponse = DailyLogPayload & {
  id: string;
  totalCalories: number;
  totalCost: number;
  totalStandardDrinks: number;
};

export type TrendRange = 'day' | 'week' | 'month';

export type TrendPoint = {
  date: string;
  drinks: number;
  cravings: number;
  calories: number;
  cost: number;
};

export type TrendSummary = {
  totalDrinks: number;
  totalCalories: number;
  totalCost: number;
  averageCravingIntensity: number;
};

export type TrendResponse = {
  range: TrendRange;
  startDate: string;
  endDate: string;
  points: TrendPoint[];
  summary: TrendSummary;
};
