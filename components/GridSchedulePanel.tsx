import React, { useState, useRef } from 'react';
import { Pitcher, PitchLog, ScheduledAppearance } from '../types';
import { ChevronLeft, ChevronRight, Info, RotateCcw, Plus, Minus, Printer, HelpCircle, X, ArrowDown } from 'lucide-react';

interface GridSchedulePanelProps {
  pitchers: Pitcher[];
  onUpdateSchedule: (pitcherId: string, date: string, min: number, max: number) => void;
  onRemoveSchedule: (pitcherId: string, date: string) => void;
  onUpdateLog: (pitcherId: string, date: string, count: number | null) => void;
}

const GridSchedulePanel: React.FC<GridSchedulePanelProps> = ({ 
  pitchers, 
  onUpdateSchedule, 
  onRemoveSchedule,
  onUpdateLog 
}) => {
  const [columnDates, setColumnDates] = useState<string[]>(() => {
    const today = new Date();
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      dates.push(`${year}-${month}-${day}`);
    }
    return dates;
  });

  const [showHelp, setShowHelp] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  const shiftDates = (days: number) => {
    setColumnDates(prev => prev.map(dateStr => {
      const [y, m, d] = dateStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      date.setDate(date.getDate() + days);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }));
  };

  const handleDateChange = (index: number, newDate: string) => {
    if (!newDate) return;
    setColumnDates(prev => {
      const next = [...prev];
      next[index] = newDate;
      return next;
    });
  };

  const resetDates = () => {
     const today = new Date();
     const dates = [];
     const count = columnDates.length > 0 ? columnDates.length : 7;
     for (let i = 0; i < count; i++) {
       const d = new Date(today);
       d.setDate(today.getDate() + i);
       const year = d.getFullYear();
       const month = String(d.getMonth() + 1).padStart(2, '0');
       const day = String(d.getDate()).padStart(2, '0');
       dates.push(`${year}-${month}-${day}`);
     }
     setColumnDates(dates);
  };

  const addColumn = () => {
    setColumnDates(prev => {
      if (prev.length === 0) {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return [`${year}-${month}-${day}`];
      }
      const last = prev[prev.length - 1];
      const [y, m, d] = last.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      date.setDate(date.getDate() + 1);
      
      const ny = date.getFullYear();
      const nm = String(date.getMonth() + 1).padStart(2, '0');
      const nd = String(date.getDate()).padStart(2, '0');
      return [...prev, `${ny}-${nm}-${nd}`];
    });
  };

  const removeColumn = () => {
    setColumnDates(prev => {
      if (prev.length <= 1) return prev;
      return prev.slice(0, -1);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  // --- Data Helpers ---

  const getDayColor = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const day = date.getDay();
    if (day === 0) return 'text-red-600 bg-red-50';
    if (day === 6) return 'text-blue-600 bg-blue-50';
    return 'text-slate-700 bg-slate-50';
  };

  const getDayLabel = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString(undefined, { weekday: 'short' });
  };

  const getSchedule = (pitcher: Pitcher, dateKey: string) => {
    return pitcher.schedule.find(s => s.date === dateKey);
  };

  const getLog = (pitcher: Pitcher, dateKey: string) => {
    return pitcher.logs.find(l => l.date === dateKey);
  };

  // --- Calculations ---

  const getEffectiveValue = (pitcher: Pitcher, dateKey: string) => {
    const log = getLog(pitcher, dateKey);
    const schedule = getSchedule(pitcher, dateKey);

    if (log) return { min: log.count, max: log.count, isActual: true };
    if (schedule) {
      const min = schedule.minPitches ?? schedule.plannedCount ?? 0;
      const max = schedule.maxPitches ?? schedule.plannedCount ?? 0;
      return { min, max, isActual: false };
    }
    return { min: 0, max: 0, isActual: false };
  };

  const calculateRowTotal = (pitcher: Pitcher) => {
    let minTotal = 0;
    let maxTotal = 0;

    columnDates.forEach(date => {
      const { min, max } = getEffectiveValue(pitcher, date);
      minTotal += min;
      maxTotal += max;
    });

    if (minTotal === 0 && maxTotal === 0) return '-';
    if (minTotal === maxTotal) return `${maxTotal}`;
    return `${minTotal}〜${maxTotal}`;
  };

  const calculateColumnTotal = (dateKey: string) => {
    let minTotal = 0;
    let maxTotal = 0;

    pitchers.forEach(pitcher => {
      const { min, max } = getEffectiveValue(pitcher, dateKey);
      minTotal += min;
      maxTotal += max;
    });

    if (minTotal === 0 && maxTotal === 0) return '-';
    if (minTotal === maxTotal) return `${maxTotal}`;
    return `${minTotal}〜${maxTotal}`;
  };

  const calculateGrandTotal = () => {
    let minTotal = 0;
    let maxTotal = 0;

    pitchers.forEach(pitcher => {
      columnDates.forEach(date => {
        const { min, max } = getEffectiveValue(pitcher, date);
        minTotal += min;
        maxTotal += max;
      });
    });

    if (minTotal === 0 && maxTotal === 0) return '-';
    if (minTotal === maxTotal) return `${maxTotal}`;
    return `${minTotal}〜${maxTotal}`;
  };

  // --- Input Handling ---

  const getPlanDisplayValue = (pitcher: Pitcher, dateKey: string) => {
    const schedule = getSchedule(pitcher, dateKey);
    if (!schedule) return '';
    if (schedule.minPitches !== undefined && schedule.maxPitches !== undefined) {
      if (schedule.minPitches === schedule.maxPitches) return `${schedule.maxPitches}`;
      return `${schedule.minPitches}-${schedule.maxPitches}`;
    }
    return schedule.plannedCount?.toString() || '';
  };

  const getResultDisplayValue = (pitcher: Pitcher, dateKey: string) => {
    const log = getLog(pitcher, dateKey);
    return log ? log.count.toString() : '';
  };

  const handlePlanBlur = (e: React.FocusEvent<HTMLInputElement>, pitcherId: string, dateKey: string) => {
    const value = e.target.value.trim();
    if (!value) {
      onRemoveSchedule(pitcherId, dateKey);
      return;
    }
    // Parse input: "50" or "50-60"
    let min = 0;
    let max = 0;

    if (value.includes('-')) {
      const parts = value.split('-');
      min = parseInt(parts[0]) || 0;
      max = parseInt(parts[1]) || min;
    } else if (value.includes('~')) {
      const parts = value.split('~');
      min = parseInt(parts[0]) || 0;
      max = parseInt(parts[1]) || min;
    } else {
      max = parseInt(value) || 0;
      min = max;
    }

    if (max > 0) {
      if (min > max) { const temp = min; min = max; max = temp; }
      onUpdateSchedule(pitcherId, dateKey, min, max);
    }
  };

  const handleResultBlur = (e: React.FocusEvent<HTMLInputElement>, pitcherId: string, dateKey: string) => {
    const value = e.target.value.trim();
    if (!value) {
      onUpdateLog(pitcherId, dateKey, null); // Delete log
      return;
    }
    const count = parseInt(value);
    if (!isNaN(count)) {
      onUpdateLog(pitcherId, dateKey, count);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className="space-y-4 animate-fade-in print-container">
      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: landscape;
            margin: 5mm;
          }
          body * {
            visibility: hidden;
          }
          .print-container, .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-width: none !important;
          }
          .no-print {
            display: none !important;
          }
          /* Ensure table fits */
          table {
            width: 100% !important;
            font-size: 10px;
          }
          th, td {
            padding: 4px !important;
          }
          input {
            border: none !important;
            background: transparent !important;
            padding: 0 !important;
          }
          .input-group {
             border-bottom: 1px dashed #ccc;
          }
        }
      `}</style>

      {/* Controls */}
      <div className="flex flex-col xl:flex-row justify-between items-center gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm no-print">
        {/* Date Nav */}
        <div className="flex items-center gap-2">
           <button onClick={() => shiftDates(-7)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
             <ChevronLeft size={20} />
           </button>
           <button onClick={resetDates} className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
             <RotateCcw size={14} /> <span>リセット</span>
           </button>
           <button onClick={() => shiftDates(7)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
             <ChevronRight size={20} />
           </button>
           <div className="h-6 w-px bg-slate-300 mx-1"></div>
           <button onClick={removeColumn} disabled={columnDates.length <= 1} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed">
             <Minus size={20} />
           </button>
           <span className="text-xs font-bold text-slate-500">列</span>
           <button onClick={addColumn} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-blue-600">
             <Plus size={20} />
           </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button 
             onClick={() => setShowHelp(true)}
             className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-sm font-medium"
           >
             <HelpCircle size={18} /> <span className="hidden sm:inline">使い方</span>
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors shadow-sm font-bold text-sm"
          >
            <Printer size={16} /> <span className="hidden sm:inline">印刷</span>
          </button>
        </div>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 no-print animate-fade-in" onClick={() => setShowHelp(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <HelpCircle className="text-blue-500" /> 予定表の使い方
              </h3>
              <button onClick={() => setShowHelp(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="w-24 h-24 border border-slate-200 rounded flex flex-col shrink-0">
                  <div className="h-1/2 border-b border-dashed border-slate-200 bg-yellow-50/50 flex items-center justify-center text-xs text-slate-500">
                    予定: 50
                  </div>
                  <div className="h-1/2 bg-indigo-50 flex items-center justify-center font-bold text-indigo-700">
                    実績: 55
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-slate-700 mb-1">セルの入力方法</h4>
                  <ul className="text-sm text-slate-600 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="bg-slate-200 text-slate-700 px-1.5 rounded text-xs font-bold mt-0.5">上段</span>
                      <span><strong>予定球数</strong>を入力します。「50」や「30-50」のように範囲指定も可能です。</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-indigo-100 text-indigo-700 px-1.5 rounded text-xs font-bold mt-0.5">下段</span>
                      <span><strong>実績球数</strong>を入力します。実際に投げた球数を記録します。</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-600 border border-slate-100">
                <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <ArrowDown size={16} /> 合計計算のルール
                </h4>
                <p>
                  各日・各選手の合計球数は、<strong>「実績」が入力されている場合は実績値</strong>を、
                  まだ実績がない場合は<strong>「予定（最大値）」</strong>を使用して計算されます。
                </p>
              </div>

              <div className="text-sm text-slate-500 border-t pt-4">
                <p className="mb-1">💡 ヒント</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>日付列は「+」ボタンで翌日を追加、「-」ボタンで削除できます。</li>
                  <li>ヘッダーの日付をクリックすると、カレンダーから日付を変更できます。</li>
                  <li>「印刷」ボタンを押すと、A4用紙（横向き）に合わせたレイアウトで印刷されます。</li>
                </ul>
              </div>
            </div>
            
            <button 
              onClick={() => setShowHelp(false)}
              className="mt-6 w-full py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
            >
              理解しました
            </button>
          </div>
        </div>
      )}

      {/* Grid */}
      <div id="grid-table-container" className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto" ref={tableRef}>
        <table className="w-full border-collapse min-w-[800px]">
          <thead>
            <tr>
              <th className="p-3 border-b border-r border-slate-200 bg-slate-50 text-left w-48 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                <span className="text-sm font-bold text-slate-700">選手名</span>
              </th>
              {columnDates.map((dateStr, index) => (
                <th key={`${index}-${dateStr}`} className={`p-2 border-b border-r border-slate-200 min-w-[80px] text-center ${getDayColor(dateStr)} relative group`}>
                   <div className="flex flex-col items-center justify-center">
                     <input 
                       type="date" 
                       value={dateStr}
                       onChange={(e) => handleDateChange(index, e.target.value)}
                       className={`bg-transparent border-none outline-none text-xs font-bold w-full text-center cursor-pointer ${getDayColor(dateStr)} focus:ring-1 focus:ring-blue-300 rounded no-print`}
                     />
                     {/* Print only label */}
                     <div className="hidden print:block text-xs font-bold">
                        {new Date(dateStr).toLocaleDateString(undefined, {month:'numeric', day:'numeric'})}
                     </div>

                     <div className="text-[10px] opacity-75 pointer-events-none">
                       {getDayLabel(dateStr)}
                     </div>
                   </div>
                </th>
              ))}
              <th className="p-3 border-b border-slate-200 bg-slate-100 text-center min-w-[80px]">
                <span className="text-sm font-bold text-slate-700">期間計</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {pitchers.length === 0 ? (
              <tr>
                <td colSpan={columnDates.length + 2} className="p-8 text-center text-slate-400">
                  投手が登録されていません
                </td>
              </tr>
            ) : (
              pitchers.map(pitcher => (
                <tr key={pitcher.id} className="hover:bg-slate-50 group break-inside-avoid">
                  <td className="p-3 border-b border-r border-slate-200 bg-white sticky left-0 z-10 group-hover:bg-slate-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                    <div className="font-bold text-slate-800 text-sm">{pitcher.name}</div>
                    <div className="text-xs text-slate-400">#{pitcher.number}</div>
                  </td>
                  {columnDates.map((dateKey, index) => {
                    const log = getLog(pitcher, dateKey);
                    const schedule = getSchedule(pitcher, dateKey);
                    
                    return (
                      <td key={`${index}-${dateKey}`} className="p-0 border-b border-r border-slate-200 align-top h-16">
                         <div className="flex flex-col h-full">
                           {/* Plan Input (Top) */}
                           <div className="h-1/2 w-full border-b border-dashed border-slate-100 input-group">
                             <input 
                               type="text" 
                               defaultValue={getPlanDisplayValue(pitcher, dateKey)}
                               key={`plan-${dateKey}-${schedule?.id || 'new'}`}
                               placeholder="予"
                               onBlur={(e) => handlePlanBlur(e, pitcher.id, dateKey)}
                               onKeyDown={handleKeyDown}
                               className={`w-full h-full text-center text-xs outline-none focus:bg-yellow-50 transition-all bg-transparent placeholder:text-slate-200 ${schedule ? 'text-slate-600' : 'text-slate-400'}`}
                             />
                           </div>
                           
                           {/* Result Input (Bottom) */}
                           <div className={`h-1/2 w-full ${log ? 'bg-indigo-50/50 print:bg-transparent' : ''}`}>
                             <input 
                               type="text" 
                               defaultValue={getResultDisplayValue(pitcher, dateKey)}
                               key={`res-${dateKey}-${log?.count || 'new'}`}
                               placeholder="実"
                               onBlur={(e) => handleResultBlur(e, pitcher.id, dateKey)}
                               onKeyDown={handleKeyDown}
                               className={`w-full h-full text-center text-sm outline-none focus:bg-white focus:ring-1 focus:ring-blue-300 transition-all bg-transparent placeholder:text-slate-200 ${log ? 'font-bold text-indigo-700' : 'text-slate-500'}`}
                             />
                           </div>
                         </div>
                      </td>
                    );
                  })}
                  <td className="p-3 border-b border-slate-200 bg-slate-50 text-center font-bold text-slate-700 text-sm">
                    {calculateRowTotal(pitcher)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {/* Footer with Daily Totals */}
          <tfoot>
            <tr className="break-inside-avoid">
              <td className="p-3 border-r border-slate-200 bg-slate-100 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                <span className="text-sm font-bold text-slate-700">合計 (日)</span>
              </td>
              {columnDates.map((dateKey, index) => (
                <td key={`total-${index}`} className="p-2 border-r border-slate-200 bg-slate-50 text-center font-bold text-slate-800 text-sm">
                  {calculateColumnTotal(dateKey)}
                </td>
              ))}
              <td className="p-3 bg-slate-200 text-center font-bold text-slate-900 text-sm">
                {calculateGrandTotal()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default GridSchedulePanel;