import React from 'react';
import { Pitcher, ScheduledAppearance } from '../types';
import { Calendar, User } from 'lucide-react';

interface GlobalSchedulePanelProps {
  pitchers: Pitcher[];
}

const GlobalSchedulePanel: React.FC<GlobalSchedulePanelProps> = ({ pitchers }) => {
  // Aggregate all scheduled appearances
  const allSchedules = pitchers.flatMap(p => 
    p.schedule.map(s => ({
      ...s,
      pitcherName: p.name,
      pitcherNumber: p.number,
      throwArm: p.throwArm
    }))
  );

  // Sort by date (ascending)
  const sortedSchedules = allSchedules.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Filter for dates (showing all future and recent past - e.g. from yesterday)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0,0,0,0);

  const upcoming = sortedSchedules.filter(s => new Date(s.date) >= yesterday);

  // Group by Date
  const groupedByDate: { [date: string]: typeof upcoming } = {};
  upcoming.forEach(s => {
    if (!groupedByDate[s.date]) groupedByDate[s.date] = [];
    groupedByDate[s.date].push(s);
  });

  const getDayColor = (dateString: string) => {
    const day = new Date(dateString).getDay();
    if (day === 0) return 'text-red-600 bg-red-50'; // Sunday
    if (day === 6) return 'text-blue-600 bg-blue-50'; // Saturday
    return 'text-slate-700 bg-slate-100';
  };

  const formatPitches = (s: ScheduledAppearance) => {
    if (s.minPitches !== undefined && s.maxPitches !== undefined) {
      if (s.minPitches === s.maxPitches) return `${s.maxPitches}球`;
      return `${s.minPitches}〜${s.maxPitches}球`;
    }
    return `${s.plannedCount || 0}球`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="text-blue-600" size={20} /> チーム全体 登板予定表
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            全投手の今後の登板予定と予定球数の一覧です
          </p>
        </div>
        
        {Object.keys(groupedByDate).length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center text-slate-400">
            <Calendar size={48} className="mb-4 opacity-20" />
            <p>予定されている登板はありません。</p>
            <p className="text-sm mt-2">各投手の詳細画面から予定を追加してください。</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {Object.entries(groupedByDate).map(([date, items]) => (
              <div key={date} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center mb-3">
                   <div className={`font-bold px-3 py-1 rounded text-sm flex items-center gap-2 ${getDayColor(date)}`}>
                     <span>{new Date(date).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</span>
                     <span className="text-xs opacity-75">({new Date(date).toLocaleDateString(undefined, { weekday: 'short' })})</span>
                   </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pl-2 border-l-2 border-slate-100 ml-2">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-white shadow-sm relative overflow-hidden group">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                      <div className="flex items-center gap-3 pl-2">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm border border-slate-200">
                          {item.pitcherNumber}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{item.pitcherName}</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider">{item.throwArm === 'Right' ? 'Right' : 'Left'} Hand</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400 font-medium mb-0.5">予定球数</p>
                        <p className="text-lg font-bold text-blue-600 leading-none">{formatPitches(item)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalSchedulePanel;