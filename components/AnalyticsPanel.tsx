import React, { useState, useMemo, useEffect } from 'react';
import { Pitcher } from '../types';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, ReferenceLine, ComposedChart, Line, ReferenceArea
} from 'recharts';
import { Sparkles, Loader2, Activity, AlertTriangle, Info, HelpCircle, ShieldCheck, ShieldAlert, Timer, ChevronDown, ChevronUp, ArrowRight, Calculator, TrendingUp, BookOpen, Scale } from 'lucide-react';
import { analyzeWorkload } from '../services/geminiService';

interface AnalyticsPanelProps {
  pitcher: Pitcher;
}

// Helper to format date as YYYY-MM-DD (Local Time)
const formatDateStr = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ pitcher }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  
  // Simulation State: Map of "YYYY-MM-DD" -> pitch count
  const [simulationMap, setSimulationMap] = useState<Record<string, number>>({});

  // Initialize simulation with scheduled data
  useEffect(() => {
    const initialSim: Record<string, number> = {};
    const today = new Date();
    // Pre-fill next 7 days from schedule
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const dStr = formatDateStr(d);
      
      const schedule = pitcher.schedule.find(s => s.date === dStr);
      // Default to maxPitches or plannedCount, or 0
      if (schedule) {
        initialSim[dStr] = schedule.maxPitches ?? schedule.plannedCount ?? 0;
      } else {
        initialSim[dStr] = 0;
      }
    }
    setSimulationMap(initialSim);
  }, [pitcher]);

  const handleSimulationChange = (dateStr: string, val: string) => {
    const num = parseInt(val) || 0;
    setSimulationMap(prev => ({ ...prev, [dateStr]: num }));
  };

  // --- Core Calculation Logic ---

  const todayStr = formatDateStr(new Date());

  // Get effective pitch count for a date (Past=Log, Future=Simulation)
  const getEffectivePitches = (dateStr: string) => {
    // If date is strictly before today, use logs (Actual)
    if (dateStr < todayStr) {
      return pitcher.logs.find(l => l.date === dateStr)?.count || 0;
    }
    // If today or future, use simulation map
    return simulationMap[dateStr] ?? 0;
  };

  const getFirstLogDate = () => {
    if (pitcher.logs.length === 0) return new Date();
    const sorted = [...pitcher.logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return new Date(sorted[0].date);
  };

  const firstLogDate = useMemo(() => getFirstLogDate(), [pitcher.logs]);

  // Unified Metric Calculator
  const calculateMetrics = (targetDateStr: string) => {
    const targetDate = new Date(targetDateStr);
    
    // 1. Determine Data Age
    const diffTime = targetDate.getTime() - firstLogDate.getTime();
    const daysSinceStart = Math.max(Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1, 0);

    // 2. Identify Phase
    let phase: '1_insufficient' | '2_reference' | '3_semistable' | '4_official' = '1_insufficient';
    if (daysSinceStart >= 28) phase = '4_official';
    else if (daysSinceStart >= 14) phase = '3_semistable';
    else if (daysSinceStart >= 7) phase = '2_reference';
    else phase = '1_insufficient';

    // 3. Calculate Loads
    let acuteLoad = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(targetDate);
      d.setDate(d.getDate() - i);
      acuteLoad += getEffectivePitches(formatDateStr(d));
    }

    let chronicLoadWeekly = 0;
    if (phase !== '1_insufficient') {
      const chronicDays = Math.min(daysSinceStart, 28);
      let totalLoad = 0;
      for (let i = 0; i < chronicDays; i++) {
        const d = new Date(targetDate);
        d.setDate(d.getDate() - i);
        totalLoad += getEffectivePitches(formatDateStr(d));
      }
      const chronicDailyAvg = chronicDays > 0 ? totalLoad / chronicDays : 0;
      chronicLoadWeekly = chronicDailyAvg * 7;
    }

    const acwr = chronicLoadWeekly === 0 ? 0 : acuteLoad / chronicLoadWeekly;

    return { acwr, acuteLoad, chronicLoadWeekly, phase, daysSinceStart };
  };

  // Current Stats (Today)
  const currentStats = calculateMetrics(todayStr);

  // --- Data for Graph (Past 28 days + Future 7 days) ---
  const chartData = useMemo(() => {
    const data = [];
    
    // 1. Past 28 days
    for (let i = 28; i > 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = formatDateStr(d);
      const metrics = calculateMetrics(dStr);
      data.push({
        date: d.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }),
        fullDate: dStr,
        
        // Load Data
        acuteLoadActual: metrics.acuteLoad, 
        acuteLoadPredicted: null,
        
        // ACWR Data
        acwrActual: metrics.phase !== '1_insufficient' ? metrics.acwr : null,
        acwrPredicted: null
      });
    }

    // 2. Today (Connecting point)
    data.push({
      date: '今日',
      fullDate: todayStr,
      
      // Load Data
      acuteLoadActual: currentStats.acuteLoad,    
      acuteLoadPredicted: currentStats.acuteLoad, 
      
      // ACWR Data
      acwrActual: currentStats.phase !== '1_insufficient' ? currentStats.acwr : null,
      acwrPredicted: currentStats.phase !== '1_insufficient' ? currentStats.acwr : null,
    });

    // 3. Future 7 days
    for (let i = 1; i <= 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dStr = formatDateStr(d);
      const metrics = calculateMetrics(dStr);
      data.push({
        date: d.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }),
        fullDate: dStr,
        
        // Load Data
        acuteLoadActual: null,                 
        acuteLoadPredicted: metrics.acuteLoad, 

        // ACWR Data
        acwrActual: null,
        acwrPredicted: metrics.phase !== '1_insufficient' ? metrics.acwr : null
      });
    }
    return data;
  }, [pitcher.logs, simulationMap, currentStats]);

  // --- UI Helpers ---

  const getStatusConfig = (acwr: number, phase: string) => {
    if (phase === '1_insufficient') return { color: 'bg-slate-100 text-slate-500', label: 'データ不足', icon: Timer };
    if (phase === '2_reference') return { color: 'bg-blue-50 text-blue-700', label: '参考値', icon: Info };

    if (phase === '3_semistable') {
       if (acwr >= 1.5) return { color: 'bg-yellow-100 text-yellow-800', label: 'WARNING', icon: AlertTriangle };
       if (acwr >= 1.3) return { color: 'bg-yellow-100 text-yellow-800', label: 'WARNING', icon: AlertTriangle };
       if (acwr >= 0.8) return { color: 'bg-emerald-100 text-emerald-800', label: 'SAFE', icon: ShieldCheck };
       return { color: 'bg-blue-50 text-blue-700', label: 'LOW', icon: Activity };
    }

    // Phase 4
    if (acwr > 1.5) return { color: 'bg-red-100 text-red-800', label: 'DANGER', icon: ShieldAlert };
    if (acwr >= 1.3) return { color: 'bg-orange-100 text-orange-800', label: 'WARNING', icon: AlertTriangle };
    if (acwr >= 0.8) return { color: 'bg-emerald-100 text-emerald-800', label: 'SAFE', icon: ShieldCheck };
    return { color: 'bg-blue-50 text-blue-700', label: 'LOW', icon: Activity };
  };

  // --- Render Sections ---

  const renderStatusCard = () => {
    const { acwr, phase, daysSinceStart } = currentStats;
    const { color, label, icon: Icon } = getStatusConfig(acwr, phase);
    
    let mainColor = "bg-slate-50 border-slate-200";
    let desc = "";
    
    if (phase === '1_insufficient') {
      mainColor = "bg-slate-50 border-slate-200";
      desc = `データ蓄積中 (残り${Math.max(7 - daysSinceStart, 1)}日)`;
    } else if (phase === '2_reference') {
      mainColor = "bg-blue-50 border-blue-200 text-blue-900";
      desc = "データ不足のため参考値です";
    } else if (acwr > 1.5 && phase === '4_official') {
      mainColor = "bg-red-50 border-red-200 text-red-900";
      desc = "故障リスクが高まっています。休息を推奨。";
    } else if (acwr >= 1.3) {
      mainColor = "bg-yellow-50 border-yellow-200 text-yellow-900";
      desc = "負荷が高まっています。注意してください。";
    } else if (acwr >= 0.8) {
      mainColor = "bg-emerald-50 border-emerald-200 text-emerald-900";
      desc = "理想的な負荷バランスです。";
    } else {
      mainColor = "bg-blue-50 border-blue-200 text-blue-900";
      desc = "負荷が低めです。";
    }

    return (
      <div id="acwr-status-card" className={`p-5 rounded-xl border ${mainColor} flex items-center gap-4 transition-colors`}>
         <div className="p-3 bg-white/60 rounded-full shadow-sm shrink-0">
           <Icon size={32} className={mainColor.includes('red') ? 'text-red-600' : mainColor.includes('emerald') ? 'text-emerald-600' : 'text-slate-600'} />
         </div>
         <div>
           <div className="flex items-center gap-2 mb-1">
             <span className="text-sm font-bold opacity-80 uppercase tracking-wider">Current Status</span>
             <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/60`}>
                {phase === '4_official' ? '信頼度: 高' : phase === '3_semistable' ? '信頼度: 中' : '信頼度: 低'}
             </span>
           </div>
           <div className="text-2xl font-bold mb-1 flex items-end gap-2">
             {label} 
             {phase !== '1_insufficient' && <span className="text-xl opacity-80 font-mono">{acwr.toFixed(2)}</span>}
           </div>
           <div className="text-sm opacity-90">{desc}</div>
         </div>
      </div>
    );
  };

  const handleAnalyze = async () => {
    setLoading(true);
    const result = await analyzeWorkload(pitcher);
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header & Help */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-slate-800">ACWR コンディション分析</h3>
          </div>
          <button 
             onClick={() => setShowExplanation(!showExplanation)}
             className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
          >
            <HelpCircle size={14} />
            ACWRとは？
            {showExplanation ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {showExplanation && (
           <div className="bg-white p-5 rounded-xl border border-slate-200 mb-6 text-sm text-slate-700 animate-fade-in shadow-sm">
             
             {/* Section 1: Core Concept */}
             <div className="mb-5 pb-5 border-b border-slate-100">
                <h4 className="font-bold text-lg text-slate-800 mb-3 flex items-center gap-2">
                  <Activity className="text-blue-600" size={20} /> ACWRとは？（考え方の核）
                </h4>
                <p className="leading-relaxed mb-3">
                  ACWRは<strong>「最近の負荷が、これまで体が慣れてきた負荷と比べて、どれくらい急激に変化しているか」</strong>を捉える指標です。
                </p>
                <div className="bg-blue-50 p-4 rounded-lg text-blue-800 font-medium">
                  負荷の「絶対量（球数が多いか）」ではなく、負荷の<strong>「変化のしかた（急増・急減）」</strong>に注目して怪我のリスクを予測します。
                </div>
             </div>

             {/* Section 2: Origin & Theory */}
             <div className="mb-5 pb-5 border-b border-slate-100">
                <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <BookOpen className="text-indigo-600" size={18} /> 考案・背景
                </h4>
                <div className="flex flex-col gap-3">
                  <p className="text-slate-600 leading-relaxed">
                     オーストラリアのスポーツ科学者 <strong>Tim Gabbett</strong> 氏によって体系化されました。
                     彼は多くのプロスポーツデータを分析し、<strong>「体が適応できるスピードを超えて負荷が変化した時」</strong>に怪我が起きるという「Training load is related to injury risk」の視点を確立しました。
                  </p>
                </div>
             </div>

             {/* Section 3: Mechanism */}
             <div className="mb-5 pb-5 border-b border-slate-100">
               <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                 <Scale className="text-orange-500" size={18} /> 故障リスクのメカニズム
               </h4>
               <p className="mb-3 text-slate-600">ACWRは以下の2つの負荷の「ギャップ」を見てリスクを判断します。</p>
               <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="block text-xs font-bold text-slate-400 uppercase mb-1">Chronic Load (慢性負荷)</span>
                    <p className="font-bold text-slate-700 text-base mb-1">体が耐えられる体を作ってきた履歴</p>
                    <p className="text-xs text-slate-500">
                       過去28日間の平均など。<br/>これが高い＝<strong>「基礎体力・準備ができている」</strong>状態。
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="block text-xs font-bold text-slate-400 uppercase mb-1">Acute Load (急性負荷)</span>
                    <p className="font-bold text-slate-700 text-base mb-1">今、体にかかっている最新のストレス</p>
                    <p className="text-xs text-slate-500">
                       直近7日間の合計など。<br/>これが慢性負荷より急に高くなると危険。
                    </p>
                  </div>
               </div>
             </div>

             {/* Section 4: Interpretation & Zones */}
             <div>
                <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <ShieldCheck className="text-emerald-600" size={18} /> リスクの判断基準と活用
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                  <div className="flex items-center gap-2 p-2 bg-emerald-50 text-emerald-800 rounded border border-emerald-100">
                    <ShieldCheck size={20} className="shrink-0" />
                    <div>
                      <span className="block font-bold text-sm">0.8 - 1.3 (Safe)</span>
                      <span>理想的な負荷バランス</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-red-50 text-red-800 rounded border border-red-100">
                    <ShieldAlert size={20} className="shrink-0" />
                    <div>
                      <span className="block font-bold text-sm">1.5 以上 (Danger)</span>
                      <span>負荷の急増による高リスク</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-500 text-right italic">
                  ※ ACWRは故障を予言する魔法の数値ではなく、負荷管理の意思決定を支援する指標です。
                </p>
             </div>
           </div>
        )}

        {/* Status Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="col-span-1 md:col-span-2">
            {renderStatusCard()}
          </div>
          
          {/* Mini Gauge / Info */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
            {currentStats.phase === '1_insufficient' ? (
              <div className="text-center text-slate-400">
                <Timer className="mx-auto mb-2 opacity-50" size={24} />
                <p className="text-xs">データ収集中</p>
              </div>
            ) : (
              <>
                 <div className="flex justify-between text-xs text-slate-500 mb-2">
                   <span>Acute (7日)</span>
                   <span className="font-bold">{currentStats.acuteLoad}球</span>
                 </div>
                 <div className="w-full bg-slate-100 h-2 rounded-full mb-4 overflow-hidden">
                   <div className="bg-blue-500 h-full" style={{ width: `${Math.min(currentStats.acuteLoad / 200 * 100, 100)}%` }}></div>
                 </div>
                 <div className="flex justify-between text-xs text-slate-500 mb-2">
                   <span>Chronic (週平均)</span>
                   <span className="font-bold">{Math.round(currentStats.chronicLoadWeekly)}球</span>
                 </div>
                 <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                   <div className="bg-slate-400 h-full" style={{ width: `${Math.min(currentStats.chronicLoadWeekly / 200 * 100, 100)}%` }}></div>
                 </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Simulator Section */}
      <section id="what-if-simulator" className="bg-indigo-50/50 p-5 rounded-xl border border-indigo-100">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="text-indigo-600" size={20} />
          <h4 className="font-bold text-slate-800">負荷予測シミュレーター (What-if)</h4>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          今後の予定球数を入力すると、ACWRの変動予測とリスク判定が即座に更新されます。
        </p>
        
        <div className="flex gap-3 overflow-x-auto pb-2">
          {Array.from({ length: 7 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() + i); // Today + i (0 is Today)
            const dStr = formatDateStr(d);
            const metrics = calculateMetrics(dStr);
            const status = getStatusConfig(metrics.acwr, metrics.phase);
            const isToday = i === 0;

            return (
              <div key={dStr} className={`min-w-[100px] bg-white rounded-lg border shadow-sm flex flex-col items-center p-3 ${isToday ? 'border-indigo-300 ring-1 ring-indigo-100' : 'border-slate-200'}`}>
                <div className={`text-xs font-bold mb-2 ${isToday ? 'text-indigo-600' : 'text-slate-500'}`}>
                  {d.toLocaleDateString(undefined, {month:'numeric', day:'numeric'})}
                  {isToday && <span className="text-[10px] ml-1">(今日)</span>}
                </div>
                
                <input 
                  type="number" 
                  min="0"
                  value={simulationMap[dStr] || ''}
                  onChange={(e) => handleSimulationChange(dStr, e.target.value)}
                  className="w-16 text-center text-sm font-bold border border-slate-200 rounded p-1 mb-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="0"
                />

                {metrics.phase !== '1_insufficient' ? (
                  <div className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${status.color}`}>
                    {metrics.acwr.toFixed(2)}
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-400">-</span>
                )}
                
                {metrics.phase !== '1_insufficient' && metrics.acwr > 1.5 && metrics.phase === '4_official' && (
                  <div className="mt-1 text-[10px] text-red-600 font-bold animate-pulse">危険</div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Load Graph */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <h4 className="text-sm font-bold text-slate-600 mb-4 flex items-center gap-2">
             <Activity size={16} /> 負荷推移と予測 (Acute Load)
           </h4>
           <div className="h-64 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                 <defs>
                   <linearGradient id="colorHistory" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis 
                    dataKey="date" 
                    fontSize={11} 
                    tickMargin={10} 
                    stroke="#94a3b8" 
                    interval="preserveStartEnd"
                 />
                 <YAxis fontSize={11} stroke="#94a3b8" />
                 <Tooltip 
                   contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                   labelStyle={{ color: '#64748b' }}
                 />
                 
                 {/* Reference Line for Today */}
                 <ReferenceLine x="今日" stroke="#94a3b8" strokeDasharray="3 3" label={{ position: 'top', value: 'Today', fontSize: 10, fill: '#64748b' }} />

                 {/* History Area (Actual values) */}
                 <Area 
                   type="monotone" 
                   dataKey="acuteLoadActual" 
                   stroke="#3b82f6" 
                   strokeWidth={2}
                   fill="url(#colorHistory)" 
                   name="負荷(実績)"
                 />
                 
                 {/* Future Line (Predicted values) */}
                 <Line 
                   type="monotone" 
                   dataKey="acuteLoadPredicted" 
                   stroke="#8b5cf6" 
                   strokeWidth={2}
                   strokeDasharray="5 5"
                   dot={{r: 4, fill: '#8b5cf6'}}
                   name="負荷(予測)"
                 />
               </ComposedChart>
             </ResponsiveContainer>
           </div>
        </section>

        {/* ACWR Graph */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <h4 className="text-sm font-bold text-slate-600 mb-4 flex items-center gap-2">
             <TrendingUp size={16} /> ACWR推移と予測 (Risk Ratio)
           </h4>
           <div className="h-64 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis 
                    dataKey="date" 
                    fontSize={11} 
                    tickMargin={10} 
                    stroke="#94a3b8" 
                    interval="preserveStartEnd"
                 />
                 <YAxis 
                   fontSize={11} 
                   stroke="#94a3b8" 
                   domain={[0, 2.0]} 
                   ticks={[0, 0.5, 0.8, 1.0, 1.3, 1.5, 2.0]}
                 />
                 <Tooltip 
                   contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                   labelStyle={{ color: '#64748b' }}
                 />
                 
                 {/* Safe Zone (0.8 - 1.3) */}
                 <ReferenceArea y1={0.8} y2={1.3} fill="#10b981" fillOpacity={0.1} label={{ position: 'insideRight', value: 'Safe Zone', fontSize: 10, fill: '#059669' }} />
                 
                 {/* Danger Line (1.5) */}
                 <ReferenceLine y={1.5} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'right', value: 'Danger', fontSize: 10, fill: '#ef4444' }} />

                 {/* Reference Line for Today */}
                 <ReferenceLine x="今日" stroke="#94a3b8" strokeDasharray="3 3" />

                 {/* Actual ACWR Line */}
                 <Line 
                   type="monotone" 
                   dataKey="acwrActual" 
                   stroke="#f59e0b" 
                   strokeWidth={2}
                   dot={{r: 2, fill: '#f59e0b'}}
                   name="ACWR(実績)"
                   connectNulls
                 />
                 
                 {/* Predicted ACWR Line */}
                 <Line 
                   type="monotone" 
                   dataKey="acwrPredicted" 
                   stroke="#f97316" 
                   strokeWidth={2}
                   strokeDasharray="5 5"
                   dot={{r: 2, fill: '#f97316'}}
                   name="ACWR(予測)"
                   connectNulls
                 />
               </ComposedChart>
             </ResponsiveContainer>
           </div>
        </section>
      </div>

      {/* AI Analysis Section */}
      <section id="ai-analysis-section" className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100">
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
            ACWRデータや今後のスケジュールを元に、AIが具体的なアドバイスを提供します。
          </div>
        )}
      </section>
    </div>
  );
};

export default AnalyticsPanel;