import React, { useState } from 'react';
import { Pitcher } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Sparkles, Loader2 } from 'lucide-react';
import { analyzeWorkload } from '../services/geminiService';

interface AnalyticsPanelProps {
  pitcher: Pitcher;
}

const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ pitcher }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Prepare chart data (last 10 outings)
  const chartData = [...pitcher.logs]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-10)
    .map(log => ({
      date: new Date(log.date).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }),
      count: log.count,
      type: log.type
    }));

  const handleAnalyze = async () => {
    setLoading(true);
    const result = await analyzeWorkload(pitcher);
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
        <h3 className="text-xl font-bold mb-4 text-slate-800">球数履歴 (直近10回)</h3>
        <div className="h-64 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" fontSize={12} tickMargin={10} />
                <YAxis fontSize={12} />
                <Tooltip 
                   contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                   cursor={{fill: '#f1f5f9'}}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.type === 'game' ? '#3b82f6' : '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">データがありません</div>
          )}
        </div>
        <div className="flex gap-4 mt-2 text-xs text-slate-500 justify-center">
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-500 rounded-sm"></div> 試合</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-slate-400 rounded-sm"></div> 練習/ブルペン</div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
            <Sparkles className="text-indigo-600" /> AIコーチング分析
          </h3>
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
            {loading ? '分析中...' : '分析を実行'}
          </button>
        </div>

        {analysis ? (
          <div className="prose prose-sm prose-indigo bg-white/80 p-4 rounded-lg shadow-sm">
            <div className="whitespace-pre-wrap">{analysis}</div>
          </div>
        ) : (
          <div className="text-center py-8 text-indigo-400 text-sm">
            「分析を実行」ボタンを押すと、Geminiが直近の登板と今後の予定からアドバイスを提供します。
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPanel;
