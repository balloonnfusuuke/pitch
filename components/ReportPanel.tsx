import React from 'react';
import { Pitcher } from '../types';
import { Layers, TrendingUp } from 'lucide-react';

interface ReportPanelProps {
  pitcher: Pitcher;
}

const ReportPanel: React.FC<ReportPanelProps> = ({ pitcher }) => {
  // Sort logs by date descending
  const sortedLogs = [...pitcher.logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Statistics
  const totalPitches = sortedLogs.reduce((sum, log) => sum + log.count, 0);
  const totalGames = sortedLogs.filter(l => l.type === 'game').length;
  const totalBullpen = sortedLogs.filter(l => l.type === 'bullpen').length;
  const avgPitches = totalGames > 0 
    ? Math.round(sortedLogs.filter(l => l.type === 'game').reduce((sum, l) => sum + l.count, 0) / totalGames) 
    : 0;

  // Group by Month
  const groupedLogs: { [key: string]: typeof sortedLogs } = {};
  sortedLogs.forEach(log => {
    const date = new Date(log.date);
    const key = `${date.getFullYear()}年${date.getMonth() + 1}月`;
    if (!groupedLogs[key]) groupedLogs[key] = [];
    groupedLogs[key].push(log);
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium uppercase">総投球数</p>
          <p className="text-2xl font-bold text-slate-800">{totalPitches}<span className="text-sm font-normal text-slate-400 ml-1">球</span></p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
           <p className="text-xs text-slate-500 font-medium uppercase">試合登板数</p>
           <p className="text-2xl font-bold text-blue-600">{totalGames}<span className="text-sm font-normal text-slate-400 ml-1">試合</span></p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
           <p className="text-xs text-slate-500 font-medium uppercase">平均球数 (試合)</p>
           <p className="text-2xl font-bold text-slate-800">{avgPitches}<span className="text-sm font-normal text-slate-400 ml-1">球/試合</span></p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
           <p className="text-xs text-slate-500 font-medium uppercase">練習・ブルペン</p>
           <p className="text-2xl font-bold text-slate-600">{totalBullpen}<span className="text-sm font-normal text-slate-400 ml-1">回</span></p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-700 flex items-center gap-2">
            <Layers size={18} /> 月別活動レポート
          </h3>
        </div>
        
        {Object.keys(groupedLogs).length === 0 ? (
           <div className="p-8 text-center text-slate-400">データがありません</div>
        ) : (
          Object.entries(groupedLogs).map(([month, logs]) => (
            <div key={month} className="border-b border-slate-100 last:border-0">
              <div className="bg-slate-50/50 px-4 py-2 text-sm font-bold text-slate-600 sticky top-0 border-b border-slate-100 flex justify-between">
                <span>{month}</span>
                <span className="text-xs font-normal text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                  月間合計: {logs.reduce((sum, l) => sum + l.count, 0)}球
                </span>
              </div>
              <table className="w-full text-sm text-left">
                <thead className="text-slate-500 bg-white border-b border-slate-50">
                  <tr>
                    <th className="px-4 py-2 font-medium w-32">日付</th>
                    <th className="px-4 py-2 font-medium w-24">タイプ</th>
                    <th className="px-4 py-2 font-medium w-24 text-right">球数</th>
                    <th className="px-4 py-2 font-medium">メモ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-slate-800">{new Date(log.date).toLocaleDateString()}</td>
                       <td className="px-4 py-3">
                         <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                           log.type === 'game' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                         }`}>
                           {log.type === 'game' ? '試合' : '練習'}
                         </span>
                       </td>
                      <td className="px-4 py-3 font-bold text-slate-800 text-right">{log.count}</td>
                      <td className="px-4 py-3 text-slate-500">{log.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReportPanel;