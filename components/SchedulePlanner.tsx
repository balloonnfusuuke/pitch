import React, { useState } from 'react';
import { Pitcher, ScheduledAppearance } from '../types';
import { CalendarPlus, Trash2, ArrowRight } from 'lucide-react';

interface SchedulePlannerProps {
  pitcher: Pitcher;
  onAddSchedule: (pitcherId: string, schedule: ScheduledAppearance) => void;
  onRemoveSchedule: (pitcherId: string, scheduleId: string) => void;
}

const SchedulePlanner: React.FC<SchedulePlannerProps> = ({ pitcher, onAddSchedule, onRemoveSchedule }) => {
  const [date, setDate] = useState('');
  const [minCount, setMinCount] = useState<number>(50);
  const [maxCount, setMaxCount] = useState<number>(60);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;
    
    // Ensure min is not greater than max
    const finalMin = Math.min(minCount, maxCount);
    const finalMax = Math.max(minCount, maxCount);

    const newSchedule: ScheduledAppearance = {
      id: crypto.randomUUID(),
      pitcherId: pitcher.id,
      date,
      minPitches: finalMin,
      maxPitches: finalMax,
      // Fallback for compatibility if needed elsewhere
      plannedCount: finalMax 
    };
    onAddSchedule(pitcher.id, newSchedule);
    setDate('');
  };

  const sortedSchedule = [...pitcher.schedule].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const formatPitches = (s: ScheduledAppearance) => {
    if (s.minPitches !== undefined && s.maxPitches !== undefined) {
      if (s.minPitches === s.maxPitches) return `${s.maxPitches}球`;
      return `${s.minPitches}〜${s.maxPitches}球`;
    }
    // Backward compatibility
    return `${s.plannedCount || 0}球`;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 h-full">
      <h3 className="text-xl font-bold mb-4 text-slate-800">登板予定管理: {pitcher.name}</h3>
      
      <form onSubmit={handleSubmit} className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
        <div className="mb-3">
          <label className="block text-xs font-medium text-slate-500 mb-1">予定日</label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full text-sm rounded-md border-slate-300 p-2 border focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          />
        </div>
        
        <div className="mb-4">
           <label className="block text-xs font-medium text-slate-500 mb-1">予定球数 (範囲)</label>
           <div className="flex items-center gap-2">
             <div className="relative flex-1">
               <input
                type="number"
                min="0"
                value={minCount}
                onChange={(e) => setMinCount(Number(e.target.value))}
                className="w-full text-sm rounded-md border-slate-300 p-2 border text-center focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="最小"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">Min</span>
             </div>
             <span className="text-slate-400">〜</span>
             <div className="relative flex-1">
               <input
                type="number"
                min="0"
                value={maxCount}
                onChange={(e) => setMaxCount(Number(e.target.value))}
                className="w-full text-sm rounded-md border-slate-300 p-2 border text-center focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="最大"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">Max</span>
             </div>
           </div>
        </div>

        <button
          type="submit"
          className="w-full bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 flex items-center justify-center gap-2 text-sm font-medium transition-colors"
        >
          <CalendarPlus size={18} /> 予定を追加
        </button>
      </form>

      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">予定リスト</h4>
        {sortedSchedule.length === 0 && <p className="text-slate-400 text-sm italic text-center py-4">予定はありません</p>}
        {sortedSchedule.map((s) => (
          <div key={s.id} className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-lg shadow-sm hover:border-slate-300 transition-colors group">
            <div className="flex flex-col">
              <span className="font-bold text-slate-800 flex items-center gap-2">
                {new Date(s.date).toLocaleDateString()}
              </span>
              <span className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                予定: <span className="font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">{formatPitches(s)}</span>
              </span>
            </div>
            <button 
              onClick={() => onRemoveSchedule(pitcher.id, s.id)}
              className="text-slate-300 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
              title="削除"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SchedulePlanner;