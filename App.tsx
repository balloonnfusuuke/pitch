import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Pitcher, PitchLog, ScheduledAppearance } from './types';
import { loadPitchers, savePitchers } from './services/storageService';
import PitcherCard from './components/PitcherCard';
import PitchLogForm from './components/PitchLogForm';
import SchedulePlanner from './components/SchedulePlanner';
import AnalyticsPanel from './components/AnalyticsPanel';
import ReportPanel from './components/ReportPanel';
import GlobalSchedulePanel from './components/GlobalSchedulePanel';
import GridSchedulePanel from './components/GridSchedulePanel';
import SystemHelpPanel from './components/SystemHelpPanel';
import { Users, ClipboardList, Calendar, Plus, X, FileText, List, Grid3X3, HelpCircle } from 'lucide-react';

const App: React.FC = () => {
  const [pitchers, setPitchers] = useState<Pitcher[]>([]);
  const [selectedPitcher, setSelectedPitcher] = useState<Pitcher | null>(null);
  
  // App View State
  const [view, setView] = useState<'roster' | 'detail'>('roster');
  
  // Roster Sub-tabs
  const [rosterTab, setRosterTab] = useState<'list' | 'global_schedule' | 'grid'>('list');

  // Detail Sub-tabs
  const [detailTab, setDetailTab] = useState<'log' | 'report' | 'schedule' | 'analysis'>('log');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSystemHelp, setShowSystemHelp] = useState(false);
  
  const [newPitcherName, setNewPitcherName] = useState('');
  const [newPitcherNumber, setNewPitcherNumber] = useState('');
  const [newPitcherArm, setNewPitcherArm] = useState<'Right' | 'Left'>('Right');

  useEffect(() => {
    setPitchers(loadPitchers());
  }, []);

  const handleAddPitcher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPitcherName) return;
    
    const newPitcher: Pitcher = {
      id: crypto.randomUUID(),
      name: newPitcherName,
      number: newPitcherNumber,
      throwArm: newPitcherArm,
      logs: [],
      schedule: []
    };

    const updated = [...pitchers, newPitcher];
    setPitchers(updated);
    savePitchers(updated);
    
    // Reset form
    setNewPitcherName('');
    setNewPitcherNumber('');
    setShowAddModal(false);
  };

  const handleSelectPitcher = (pitcher: Pitcher) => {
    setSelectedPitcher(pitcher);
    setView('detail');
    setDetailTab('log'); // Default to log view
  };

  const handleSaveLog = (pitcherId: string, log: PitchLog) => {
    const updatedPitchers = pitchers.map(p => {
      if (p.id === pitcherId) {
        return { ...p, logs: [...p.logs, log] };
      }
      return p;
    });
    setPitchers(updatedPitchers);
    savePitchers(updatedPitchers);
    
    // Update selected pitcher reference
    const updatedSelected = updatedPitchers.find(p => p.id === pitcherId) || null;
    setSelectedPitcher(updatedSelected);
    
    alert('記録を保存しました');
  };

  const handleAddSchedule = (pitcherId: string, schedule: ScheduledAppearance) => {
    const updatedPitchers = pitchers.map(p => {
      if (p.id === pitcherId) {
        return { ...p, schedule: [...p.schedule, schedule] };
      }
      return p;
    });
    setPitchers(updatedPitchers);
    savePitchers(updatedPitchers);

    const updatedSelected = updatedPitchers.find(p => p.id === pitcherId) || null;
    setSelectedPitcher(updatedSelected);
  };

  const handleRemoveSchedule = (pitcherId: string, scheduleId: string) => {
     const updatedPitchers = pitchers.map(p => {
      if (p.id === pitcherId) {
        return { ...p, schedule: p.schedule.filter(s => s.id !== scheduleId) };
      }
      return p;
    });
    setPitchers(updatedPitchers);
    savePitchers(updatedPitchers);

    const updatedSelected = updatedPitchers.find(p => p.id === pitcherId) || null;
    setSelectedPitcher(updatedSelected);
  };

  // Handler for Grid updates (Plan)
  const handleGridUpdateSchedule = (pitcherId: string, date: string, min: number, max: number) => {
    const updatedPitchers = pitchers.map(p => {
      if (p.id === pitcherId) {
        // Remove existing schedule for this date if exists
        const filteredSchedule = p.schedule.filter(s => s.date !== date);
        
        const newSchedule: ScheduledAppearance = {
          id: crypto.randomUUID(),
          pitcherId: pitcherId,
          date: date,
          minPitches: min,
          maxPitches: max,
          plannedCount: max // fallback
        };
        
        return { ...p, schedule: [...filteredSchedule, newSchedule] };
      }
      return p;
    });
    setPitchers(updatedPitchers);
    savePitchers(updatedPitchers);
  };

  const handleGridRemoveSchedule = (pitcherId: string, date: string) => {
    const updatedPitchers = pitchers.map(p => {
      if (p.id === pitcherId) {
        return { ...p, schedule: p.schedule.filter(s => s.date !== date) };
      }
      return p;
    });
    setPitchers(updatedPitchers);
    savePitchers(updatedPitchers);
  };

  // Handler for Grid updates (Log/Actual)
  const handleGridUpdateLog = (pitcherId: string, date: string, count: number | null) => {
    const updatedPitchers = pitchers.map(p => {
      if (p.id === pitcherId) {
        // Remove existing log for this date if exists
        const filteredLogs = p.logs.filter(l => l.date !== date);
        
        if (count === null) {
            return { ...p, logs: filteredLogs };
        }

        const newLog: PitchLog = {
          id: crypto.randomUUID(),
          pitcherId: pitcherId,
          date: date,
          count: count,
          type: 'game', // Defaulting to game for grid quick entry
          notes: ''
        };
        
        return { ...p, logs: [...filteredLogs, newLog] };
      }
      return p;
    });
    setPitchers(updatedPitchers);
    savePitchers(updatedPitchers);
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-slate-900 text-white p-4 sticky top-0 z-10 shadow-lg print:hidden">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('roster')}>
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold">P</div>
            <h1 className="text-xl font-bold tracking-tight">PitchCommand</h1>
          </div>
          
          <div className="flex items-center gap-4">
             {view === 'detail' && (
              <button 
                onClick={() => setView('roster')} 
                className="text-sm text-slate-300 hover:text-white flex items-center gap-1"
              >
                <List size={16} /> <span className="hidden sm:inline">一覧に戻る</span>
              </button>
            )}
            <button 
              onClick={() => setShowSystemHelp(true)}
              className="text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <HelpCircle size={16} /> <span>使い方</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 mt-4 print:p-0 print:max-w-none print:mt-0">
        {view === 'roster' && (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 print:hidden">
               {/* Main Toggle Tabs */}
               <div className="bg-slate-200 p-1 rounded-xl flex gap-1 shadow-inner overflow-x-auto max-w-full">
                 <button 
                   onClick={() => setRosterTab('list')}
                   className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                     rosterTab === 'list' 
                       ? 'bg-white text-blue-600 shadow-sm' 
                       : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                   }`}
                 >
                   <Users size={16} /> 投手リスト
                 </button>
                 <button 
                   onClick={() => setRosterTab('global_schedule')}
                   className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                     rosterTab === 'global_schedule' 
                       ? 'bg-white text-blue-600 shadow-sm' 
                       : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                   }`}
                 >
                   <List size={16} /> 予定リスト
                 </button>
                 <button 
                   onClick={() => setRosterTab('grid')}
                   className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                     rosterTab === 'grid' 
                       ? 'bg-white text-blue-600 shadow-sm' 
                       : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                   }`}
                 >
                   <Grid3X3 size={16} /> 予定表(表形式)
                 </button>
               </div>

               {/* Action Button (Only show on list view) */}
               {rosterTab === 'list' && (
                 <button 
                  onClick={() => setShowAddModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-sm transition-colors text-sm font-bold ml-auto sm:ml-0"
                >
                  <Plus size={18} /> 投手を追加
                </button>
               )}
            </div>

            {rosterTab === 'list' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
                {pitchers.length === 0 && (
                  <div className="col-span-full text-center py-12 text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
                    <p>登録されている投手がいません</p>
                    <button onClick={() => setShowAddModal(true)} className="mt-4 text-blue-600 hover:underline">
                      最初の投手を追加
                    </button>
                  </div>
                )}
                {pitchers.map(p => (
                  <PitcherCard key={p.id} pitcher={p} onSelect={handleSelectPitcher} />
                ))}
              </div>
            )}

            {rosterTab === 'global_schedule' && (
               <GlobalSchedulePanel pitchers={pitchers} />
            )}

            {rosterTab === 'grid' && (
              <GridSchedulePanel 
                pitchers={pitchers} 
                onUpdateSchedule={handleGridUpdateSchedule}
                onRemoveSchedule={handleGridRemoveSchedule}
                onUpdateLog={handleGridUpdateLog}
              />
            )}
          </>
        )}

        {view === 'detail' && selectedPitcher && (
          <div className="animate-fade-in">
             <div className="mb-6">
               <h2 className="text-3xl font-bold text-slate-900">{selectedPitcher.name} <span className="text-lg font-normal text-slate-500">#{selectedPitcher.number}</span></h2>
               <p className="text-slate-500 text-sm">
                 {selectedPitcher.throwArm === 'Right' ? '右投げ' : '左投げ'} • 登録済記録: {selectedPitcher.logs.length}件
               </p>
             </div>

             {/* Tab Navigation */}
             <div className="flex border-b border-slate-200 mb-6 overflow-x-auto">
               <button 
                 onClick={() => setDetailTab('log')}
                 className={`px-4 py-3 text-sm font-medium flex items-center gap-2 whitespace-nowrap border-b-2 transition-colors ${
                   detailTab === 'log' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                 }`}
               >
                 <ClipboardList size={18} /> 記録入力
               </button>
               <button 
                 onClick={() => setDetailTab('report')}
                 className={`px-4 py-3 text-sm font-medium flex items-center gap-2 whitespace-nowrap border-b-2 transition-colors ${
                   detailTab === 'report' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                 }`}
               >
                 <FileText size={18} /> レポート
               </button>
               <button 
                 onClick={() => setDetailTab('schedule')}
                 className={`px-4 py-3 text-sm font-medium flex items-center gap-2 whitespace-nowrap border-b-2 transition-colors ${
                   detailTab === 'schedule' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                 }`}
               >
                 <Calendar size={18} /> 登板予定
               </button>
               <button 
                 onClick={() => setDetailTab('analysis')}
                 className={`px-4 py-3 text-sm font-medium flex items-center gap-2 whitespace-nowrap border-b-2 transition-colors ${
                   detailTab === 'analysis' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                 }`}
               >
                 <Users size={18} /> 分析・コーチング
               </button>
             </div>

             <div className="min-h-[400px]">
               {detailTab === 'log' && (
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                   <div className="lg:col-span-1">
                      <PitchLogForm pitcher={selectedPitcher} onSave={handleSaveLog} onCancel={() => {}} />
                   </div>
                   <div className="lg:col-span-2">
                     <h3 className="font-bold text-slate-700 mb-3">最近の記録</h3>
                     <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                       <table className="w-full text-sm text-left">
                         <thead className="bg-slate-50 text-slate-500">
                           <tr>
                             <th className="px-4 py-3 font-medium">日付</th>
                             <th className="px-4 py-3 font-medium">球数</th>
                             <th className="px-4 py-3 font-medium">タイプ</th>
                             <th className="px-4 py-3 font-medium">メモ</th>
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100">
                           {[...selectedPitcher.logs]
                             .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                             .slice(0, 5) // Show only recent 5 in the log entry tab
                             .map(log => (
                             <tr key={log.id} className="hover:bg-slate-50">
                               <td className="px-4 py-3">{new Date(log.date).toLocaleDateString()}</td>
                               <td className="px-4 py-3 font-bold">{log.count}</td>
                               <td className="px-4 py-3">
                                 <span className={`px-2 py-0.5 rounded text-xs ${log.type === 'game' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                                   {log.type === 'game' ? '試合' : '練習'}
                                 </span>
                               </td>
                               <td className="px-4 py-3 text-slate-500 truncate max-w-[150px]">{log.notes || '-'}</td>
                             </tr>
                           ))}
                           {selectedPitcher.logs.length === 0 && (
                             <tr>
                               <td colSpan={4} className="px-4 py-8 text-center text-slate-400">記録がありません</td>
                             </tr>
                           )}
                           {selectedPitcher.logs.length > 5 && (
                             <tr>
                               <td colSpan={4} className="px-4 py-3 text-center text-slate-500 text-xs bg-slate-50 cursor-pointer hover:bg-slate-100" onClick={() => setDetailTab('report')}>
                                 すべての記録を見るには「レポート」タブへ
                               </td>
                             </tr>
                           )}
                         </tbody>
                       </table>
                     </div>
                   </div>
                 </div>
               )}

               {detailTab === 'report' && (
                 <ReportPanel pitcher={selectedPitcher} />
               )}

               {detailTab === 'schedule' && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <SchedulePlanner 
                    pitcher={selectedPitcher} 
                    onAddSchedule={handleAddSchedule}
                    onRemoveSchedule={handleRemoveSchedule}
                   />
                   <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                      <h4 className="font-bold text-slate-700 mb-2">スケジュール管理のヒント</h4>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        無理な連投は怪我のリスクを高めます。試合での投球数に応じて、適切な休息日を挟むようにスケジュールを組みましょう。
                        AI分析タブを使用すると、現在の負荷状況に基づいたアドバイスが得られます。
                      </p>
                   </div>
                 </div>
               )}

               {detailTab === 'analysis' && (
                 <AnalyticsPanel pitcher={selectedPitcher} />
               )}
             </div>
          </div>
        )}
      </main>

      {/* System Help Modal */}
      {showSystemHelp && (
        <SystemHelpPanel onClose={() => setShowSystemHelp(false)} />
      )}

      {/* Add Pitcher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-scale-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-800">新規投手登録</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddPitcher} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">名前</label>
                <input 
                  type="text" 
                  required
                  value={newPitcherName}
                  onChange={(e) => setNewPitcherName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="例: 佐藤 健太"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">背番号</label>
                  <input 
                    type="text" 
                    value={newPitcherNumber}
                    onChange={(e) => setNewPitcherNumber(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="18"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">利き腕</label>
                  <select 
                    value={newPitcherArm}
                    onChange={(e) => setNewPitcherArm(e.target.value as 'Right' | 'Left')}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Right">右投げ</option>
                    <option value="Left">左投げ</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg"
                >
                  キャンセル
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-md"
                >
                  登録する
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);