export interface FinanceGoal {
  id: string;
  title: string;
  target: number;
  saved: number;
  expenses: number;
  deadline?: string;
}

export interface AnimeEntry {
  id: number;
  title: string;
  image: string;
  status: 'plan_to_watch' | 'completed';
  userRating?: number;
  episodes?: number;
  rating?: string;
  genres?: string[];
}

export interface AppState {
  financeGoals: FinanceGoal[];
  lastReset: string; // ISO timestamp
  animeList: AnimeEntry[];
  userName: string;
}

export const INITIAL_STATE: AppState = {
  financeGoals: [],
  lastReset: new Date().toISOString(),
  animeList: [],
  userName: 'Akaium',
};
