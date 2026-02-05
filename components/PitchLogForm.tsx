import React, { useState } from 'react';
import { Pitcher, PitchLog, DEFAULT_REST_RULES } from '../types';
import { Save } from 'lucide-react';

interface PitchLogFormProps {
  pitcher: Pitcher;
  onSave: (pitcherId: string, log: PitchLog) => void;
  onCancel: () => void;
}

const PitchLogForm: React.FC<PitchLogFormProps> = ({ pitcher, onSave, onCancel }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [count, setCount] = useState<number>(0);
  const [type, setType] = useState<'game' | 'bullpen'>('game');
  const [notes, setNotes] = useState('');

  const calculateRest = (pitchCount: number) => {
    for (const rule of DEFAULT_REST_RULES) {
      if (pitchCount <= rule.maxPitches) return rule.restDays;
    }
    return 4;
  };

  const restDays = calculateRest(count);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: PitchLog = {
      id: crypto.randomUUID(),
      pitcherId: pitcher.id,
      date,
      count,
      type,
      notes
    };
    onSave(pitcher.id, newLog);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
      <h3 className="text-xl font-bold mb-4 text-slate-800">登板記録の入力: {pitcher.name}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">日付</label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-md border-slate-300 shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">球数</label>
            <input
              type="number"
              min="0"
              required
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full rounded-md border-slate-300 shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">タイプ</label>
             <select 
               value={type} 
               onChange={(e) => setType(e.target.value as 'game' | 'bullpen')}
               className="w-full rounded-md border-slate-300 shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500"
             >
               <option value="game">試合</option>
               <option value="bullpen">ブルペン/練習</option>
             </select>
          </div>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-800 font-semibold">推定休息日: {restDays}日</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">メモ</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-md border-slate-300 shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
          ></textarea>
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            <Save size={16} /> 保存
          </button>
        </div>
      </form>
    </div>
  );
};

export default PitchLogForm;
