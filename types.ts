export interface PitchLog {
  id: string;
  pitcherId: string;
  date: string; // YYYY-MM-DD
  count: number;
  type: 'game' | 'bullpen';
  notes?: string;
}

export interface ScheduledAppearance {
  id: string;
  pitcherId: string;
  date: string; // YYYY-MM-DD
  plannedCount?: number; // Deprecated: Kept for backward compatibility
  minPitches?: number;   // New: Minimum planned pitches
  maxPitches?: number;   // New: Maximum planned pitches
}

export interface Pitcher {
  id: string;
  name: string;
  number: string;
  throwArm: 'Right' | 'Left';
  logs: PitchLog[];
  schedule: ScheduledAppearance[];
}

export interface RestRule {
  maxPitches: number;
  restDays: number;
}

// Example standard rules (can be customized in a real app)
export const DEFAULT_REST_RULES: RestRule[] = [
  { maxPitches: 30, restDays: 0 },
  { maxPitches: 50, restDays: 1 },
  { maxPitches: 75, restDays: 2 },
  { maxPitches: 105, restDays: 3 },
  { maxPitches: 999, restDays: 4 },
];