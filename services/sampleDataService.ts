import { Pitcher, PitchLog, ScheduledAppearance } from '../types';

export const generateSampleData = (): Pitcher[] => {
  const today = new Date();
  
  // Helper to get YYYY-MM-DD relative to today
  const getDateStr = (offsetDays: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offsetDays);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 1. High Workload Pitcher (Danger Zone)
  const pitcher1: Pitcher = {
    id: 'sample-p1',
    name: '豪速 太郎',
    number: '18',
    throwArm: 'Right',
    logs: [],
    schedule: []
  };

  // Generate logs for P1 (Heavy usage)
  // Recent intense workload
  [-28, -24, -20, -14, -10, -5, -1].forEach(offset => {
    pitcher1.logs.push({
      id: crypto.randomUUID(),
      pitcherId: pitcher1.id,
      date: getDateStr(offset),
      count: offset > -7 ? 110 : 90, // Heavy recently
      type: 'game',
      notes: 'サンプルデータ: 先発'
    });
  });

  // Schedule for P1
  pitcher1.schedule.push({
    id: crypto.randomUUID(),
    pitcherId: pitcher1.id,
    date: getDateStr(3),
    minPitches: 80,
    maxPitches: 100,
    plannedCount: 100
  });

  // 2. Balanced Pitcher (Safe Zone)
  const pitcher2: Pitcher = {
    id: 'sample-p2',
    name: '技巧 次郎',
    number: '11',
    throwArm: 'Left',
    logs: [],
    schedule: []
  };

  // Regular cadence
  [-25, -18, -11, -4].forEach(offset => {
    pitcher2.logs.push({
      id: crypto.randomUUID(),
      pitcherId: pitcher2.id,
      date: getDateStr(offset),
      count: 70,
      type: 'game',
      notes: 'サンプルデータ: 安定したローテーション'
    });
  });

  pitcher2.schedule.push({
    id: crypto.randomUUID(),
    pitcherId: pitcher2.id,
    date: getDateStr(2),
    minPitches: 60,
    maxPitches: 80,
    plannedCount: 70
  });

  // 3. Returning from Injury/Low Load
  const pitcher3: Pitcher = {
    id: 'sample-p3',
    name: '育成 三郎',
    number: '45',
    throwArm: 'Right',
    logs: [],
    schedule: []
  };

  // Only light bullpen sessions
  [-10, -5, -2].forEach(offset => {
    pitcher3.logs.push({
      id: crypto.randomUUID(),
      pitcherId: pitcher3.id,
      date: getDateStr(offset),
      count: 30,
      type: 'bullpen',
      notes: 'サンプルデータ: 調整中'
    });
  });

  return [pitcher1, pitcher2, pitcher3];
};