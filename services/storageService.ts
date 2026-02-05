import { Pitcher } from '../types';

const STORAGE_KEY = 'pitch_command_data_v1';

export const loadPitchers = (): Pitcher[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load data", error);
    return [];
  }
};

export const savePitchers = (pitchers: Pitcher[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pitchers));
  } catch (error) {
    console.error("Failed to save data", error);
  }
};
