import React from 'react';
import { Pitcher, ScheduledAppearance } from '../types';
import { Activity, Calendar, Trash2 } from 'lucide-react';

interface PitcherCardProps {
  pitcher: Pitcher;
  onSelect: (pitcher: Pitcher) => void;
  onDelete: (pitcherId: string) => void;
}

const PitcherCard: React.FC<PitcherCardProps> = ({ pitcher, onSelect, onDelete }) => {
  // Get last log for "Last Pitch Count" display
  const getLastLog = () => {
    if (pitcher.logs.length === 0) return null;
    return pitcher.logs.reduce((prev, current) => 
      (new Date(prev.date) > new Date(current.date)) ? prev : current
    );
  };

  const lastLog = getLastLog();
  
  // Calculate Next Scheduled Date
  const getNextSchedule = () => {
    const today = new Date();
    today.setHours(0,0,0,0);

    const futureSchedules = pitcher.schedule
      .filter(s => {
        const d = new Date(s.date);
        d.setHours(0,0,0,0);
        return d >= today;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return futureSchedules.length > 0 ? futureSchedules[0] : null;
  };

  const nextSchedule = getNextSchedule();

  const formatPitches = (s: ScheduledAppearance) => {
    if (s.minPitches !== undefined && s.maxPitches !== undefined) {
      if (s.minPitches === s.maxPitches) return `${s.maxPitches}球`;
      return `${s.minPitches}〜${s.maxPitches}球`;
    }
    return `${s.plannedCount || 0}球`;
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card selection
    if (window.confirm(`${pitcher.name} を削除してもよろしいですか？\nこの操作は取り消せません。`)) {
      onDelete(pitcher.id);
    }
  };

  return (
    <div 
      onClick={() => onSelect(pitcher)}
      className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 cursor-pointer hover:shadow-md transition-shadow group relative"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-bold text-slate-800">{pitcher.name}</h3>
          <p className="text-sm text-slate-500">#{pitcher.number} • {pitcher.throwArm === 'Right' ? '右投' : '左投'}</p>
        </div>
        <button
          onClick={handleDelete}
          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
          title="削除"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between text-slate-600">
          <span className="flex items-center gap-2"><Activity size={14} /> 前回の球数</span>
          <span className="font-semibold">{lastLog ? `${lastLog.count}球` : '-'}</span>
        </div>
        <div className="flex items-center justify-between text-slate-600">
          <span className="flex items-center gap-2"><Calendar size={14} /> 次回登板予定日</span>
          <span className="font-semibold">
            {nextSchedule ? (
              <span className="flex items-center gap-1">
                 {new Date(nextSchedule.date).toLocaleDateString(undefined, {month:'numeric', day:'numeric'})}
                 <span className="text-xs text-slate-400">({formatPitches(nextSchedule)})</span>
              </span>
            ) : '未定'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PitcherCard;