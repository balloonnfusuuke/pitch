import React, { useState, useRef } from 'react';
import { Pitcher, PitchLog, ScheduledAppearance } from '../types';
import { ChevronLeft, ChevronRight, Info, RotateCcw, Plus, Minus, Printer, FileInput, Calendar } from 'lucide-react';

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

  const [inputMode, setInputMode] = useState<'plan' | 'result'>('plan');
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

  const getCellDisplayValue = (pitcher: Pitcher, dateKey: string) => {
    const log = getLog(pitcher, dateKey);
    const schedule = getSchedule(pitcher, dateKey);

    if (inputMode === 'result') {
      return log ? log.count.toString() : '';
    } else {
      if (!schedule) return '';
      if (schedule.minPitches !== undefined && schedule.maxPitches !== undefined) {
        if (schedule.minPitches === schedule.maxPitches) return `${schedule.maxPitches}`;
        return `${schedule.minPitches}-${schedule.maxPitches}`;
      }
      return schedule.plannedCount?.toString() || '';
    }
  };

  const getCellPlaceholder = (pitcher: Pitcher, dateKey: string) => {
    if (inputMode === 'result') {
      const schedule = getSchedule(pitcher, dateKey);
      if (schedule) {
        const max = schedule.maxPitches ?? schedule.plannedCount;
        return `予:${max}`;
      }
      return '-';
    }
    return '-';
  };

  const handleCellBlur = (e: React.FocusEvent<HTMLInputElement>, pitcherId: string, dateKey: string) => {
    const value = e.target.value.trim();
    
    if (inputMode === 'result') {
      // Update Log
      if (!value) {
        onUpdateLog(pitcherId, dateKey, null); // Delete log
        return;
      }
      const count = parseInt(value);
      if (!isNaN(count)) {
        onUpdateLog(pitcherId, dateKey, count);
      }
    } else {
      // Update Schedule
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
          /* Adjust input appearance for print */
          input {
            border: none !important;
            background: transparent !important;
            padding: 0 !important;
          }
          /* Color adjustments for print readability */
          .bg-slate-50 { background-color: #f8fafc !important; -webkit-print-color-adjust: exact; }
          .bg-indigo-100 { background-color: #e0e7ff !important; -webkit-print-color-adjust: exact; }
          .bg-blue-50 { background-color: #eff6ff !important; -webkit-print-color-adjust: exact; }
          .bg-red-50 { background-color: #fef2f2 !important; -webkit-print-color-adjust: exact; }
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

        {/* Mode Toggle & Print */}
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setInputMode('plan')}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-bold rounded-md transition-all ${inputMode === 'plan' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Calendar size={16} /> 予定入力
            </button>
            <button 
              onClick={() => setInputMode('result')}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-bold rounded-md transition-all ${inputMode === 'result' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <FileInput size={16} /> 実績入力
            </button>
          </div>
          
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors shadow-sm font-bold text-sm"
          >
            <Printer size={16} /> <span className="hidden sm:inline">印刷</span>
          </button>
        </div>
      </div>
      
      <div className="flex items-center gap-2 text-xs text-slate-500 px-1 no-print">
        <Info size={14} />
        {inputMode === 'plan' ? (
          <span>予定モード: 「50」や「30-50」と入力。合計は予定（最大値）で計算されます。</span>
        ) : (
          <span>実績モード: 実際の球数を入力。入力がある日は実績値が合計に反映されます。</span>
        )}
      </div>

      {/* Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto" ref={tableRef}>
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
                    const hasLog = !!log;
                    const hasSchedule = !!schedule;
                    
                    // Cell Styling
                    let bgClass = '';
                    let textClass = 'text-slate-500';
                    
                    if (hasLog) {
                      bgClass = 'bg-indigo-100 print:bg-slate-200';
                      textClass = 'font-bold text-indigo-900';
                    } else if (hasSchedule) {
                      bgClass = 'bg-blue-50/30';
                      textClass = 'text-blue-700 font-medium';
                    }

                    return (
                      <td key={`${index}-${dateKey}`} className={`p-1 border-b border-r border-slate-100 text-center relative ${bgClass}`}>
                         <input 
                           type="text" 
                           defaultValue={getCellDisplayValue(pitcher, dateKey)}
                           // Force re-render when mode changes
                           key={`${dateKey}-${inputMode}-${hasLog ? log.count : 'n'}-${hasSchedule ? schedule?.id : 'n'}`} 
                           placeholder={getCellPlaceholder(pitcher, dateKey)}
                           onBlur={(e) => handleCellBlur(e, pitcher.id, dateKey)}
                           onKeyDown={handleKeyDown}
                           className={`w-full h-full p-2 text-center text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 rounded transition-all bg-transparent placeholder:text-slate-300 ${textClass}`}
                         />
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