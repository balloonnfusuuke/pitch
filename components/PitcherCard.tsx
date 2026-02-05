import React from 'react';
import { Pitcher, DEFAULT_REST_RULES } from '../types';
import { Activity, Calendar, AlertCircle, CheckCircle } from 'lucide-react';

interface PitcherCardProps {
  pitcher: Pitcher;
  onSelect: (pitcher: Pitcher) => void;
}

const PitcherCard: React.FC<PitcherCardProps> = ({ pitcher, onSelect }) => {
  // Calculate availability
  const getLastLog = () => {
    if (pitcher.logs.length === 0) return null;
    return pitcher.logs.reduce((prev, current) => 
      (new Date(prev.date) > new Date(current.date)) ? prev : current
    );
  };

  const lastLog = getLastLog();
  
  const getRequiredRestDays = (count: number) => {
    for (const rule of DEFAULT_REST_RULES) {
      if (count <= rule.maxPitches) return rule.restDays;
    }
    return 4; // Max rest
  };

  let availabilityStatus = { text: '登板可能', color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle };
  let availableDateStr = '即日';

  if (lastLog) {
    const lastDate = new Date(lastLog.date);
    const restDays = getRequiredRestDays(lastLog.count);
    
    if (restDays > 0) {
      const nextAvailableDate = new Date(lastDate);
      nextAvailableDate.setDate(lastDate.getDate() + restDays + 1);
      
      const today = new Date();
      today.setHours(0,0,0,0);
      nextAvailableDate.setHours(0,0,0,0);

      if (nextAvailableDate > today) {
        availabilityStatus = { text: '要休息', color: 'text-red-600', bg: 'bg-red-100', icon: AlertCircle };
        availableDateStr = nextAvailableDate.toLocaleDateString();
      }
    }
  }

  return (
    <div 
      onClick={() => onSelect(pitcher)}
      className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-bold text-slate-800">{pitcher.name}</h3>
          <p className="text-sm text-slate-500">#{pitcher.number} • {pitcher.throwArm === 'Right' ? '右投' : '左投'}</p>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${availabilityStatus.bg} ${availabilityStatus.color}`}>
          <availabilityStatus.icon size={12} />
          {availabilityStatus.text}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between text-slate-600">
          <span className="flex items-center gap-2"><Activity size={14} /> 前回の球数</span>
          <span className="font-semibold">{lastLog ? `${lastLog.count}球` : '-'}</span>
        </div>
        <div className="flex items-center justify-between text-slate-600">
          <span className="flex items-center gap-2"><Calendar size={14} /> 次回登板可能</span>
          <span className="font-semibold">{availableDateStr}</span>
        </div>
      </div>
    </div>
  );
};

export default PitcherCard;
