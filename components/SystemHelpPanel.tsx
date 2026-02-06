import React from 'react';
import { X, Users, Calendar, Grid3X3, ClipboardList, Sparkles, FileText, Activity, PlayCircle } from 'lucide-react';

interface SystemHelpPanelProps {
  onClose: () => void;
  onStartTutorial: () => void;
}

const SystemHelpPanel: React.FC<SystemHelpPanelProps> = ({ onClose, onStartTutorial }) => {
  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Activity className="text-blue-600" /> PitchCommand ユーザーマニュアル
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500 hover:text-slate-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-12">
          
          {/* Welcome / Action Area */}
          <section className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 rounded-2xl text-white shadow-lg relative overflow-hidden">
             <div className="relative z-10">
               <h3 className="text-2xl font-bold mb-2">インタラクティブ・チュートリアル</h3>
               <p className="text-blue-100 mb-6 max-w-xl">
                 サンプルデータを自動で読み込み、実際の画面操作をハイライト付きで体験できるガイドツアーです。初めての方はこちらからどうぞ。
               </p>
               <button 
                 onClick={onStartTutorial}
                 className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-50 transition-all shadow-md transform hover:scale-105 ring-4 ring-white/30"
               >
                 <PlayCircle size={20} />
                 デモデータでツアーを開始
               </button>
             </div>
             {/* Decorative circles */}
             <div className="absolute -right-10 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
             <div className="absolute top-10 right-20 w-32 h-32 bg-indigo-400/20 rounded-full blur-2xl"></div>
          </section>

          {/* Section 1: Overview */}
          <section>
            <h3 className="text-2xl font-bold text-slate-900 mb-4 border-b border-slate-200 pb-2">
              1. システムの概要
            </h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              PitchCommandは、投手の球数管理（予定と実績）、コンディション管理、そしてAIによる分析を一元管理できるシステムです。
              チーム全体のスケジュールを把握する「ロスター画面」と、個人の詳細な記録を管理する「選手詳細画面」で構成されています。
            </p>
          </section>

          {/* Section 2: Roster Screen */}
          <section>
            <h3 className="text-2xl font-bold text-slate-900 mb-4 border-b border-slate-200 pb-2">
              2. トップ画面（ロスター管理）
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <h4 className="font-bold text-blue-700 flex items-center gap-2 mb-2">
                    <Users size={18} /> 投手リスト
                  </h4>
                  <p className="text-sm text-slate-600">
                    登録されている投手の一覧です。カードをクリックすると、その選手の詳細画面（記録入力など）へ移動します。
                    「投手を追加」ボタンから新規登録が可能です。
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <h4 className="font-bold text-blue-700 flex items-center gap-2 mb-2">
                    <Calendar size={18} /> 予定リスト
                  </h4>
                  <p className="text-sm text-slate-600">
                    チーム全体の今後の登板予定を時系列リスト形式で確認できます。直近の予定を把握するのに適しています。
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                  <h4 className="font-bold text-indigo-700 flex items-center gap-2 mb-2">
                    <Grid3X3 size={18} /> 予定表（表形式）
                  </h4>
                  <p className="text-sm text-slate-700 mb-2">
                    Excelのように一括で「予定」と「実績」を入力・閲覧できる強力な機能です。
                  </p>
                  <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1">
                    <li><strong>上段（薄い色）:</strong> 予定球数を入力（例: "50-60"）</li>
                    <li><strong>下段（濃い色）:</strong> 実績球数を入力（例: "55"）</li>
                    <li>実績を入力すると、自動的に合計計算は実績値が優先されます。</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Pitcher Detail */}
          <section>
            <h3 className="text-2xl font-bold text-slate-900 mb-4 border-b border-slate-200 pb-2">
              3. 選手詳細画面
            </h3>
            <p className="text-slate-600 mb-4">
              トップ画面で投手を選択すると表示されます。以下の4つのタブがあります。
            </p>
            
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600 shrink-0">
                  <ClipboardList size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">記録入力</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    試合やブルペンでの投球数を記録します。メモを残すことも可能です。
                    ここで入力したデータはすべての画面に反映されます。
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600 shrink-0">
                  <FileText size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">レポート</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    過去のすべての記録を月別に閲覧できます。総投球数や平均球数などの統計データも確認できます。
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600 shrink-0">
                  <Calendar size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">登板予定</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    個別の詳細なスケジュール管理を行います。予定球数を「50〜60球」のように範囲で指定して登録できます。
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="bg-purple-100 p-2 rounded-lg text-purple-600 shrink-0">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">分析・コーチング (AI)</h4>
                  <div className="text-sm text-slate-600 mt-1 space-y-2">
                    <p>
                      <strong>ACWR (怪我リスク指標):</strong> 直近の負荷(Acute)と長期間の負荷(Chronic)のバランスを分析し、故障リスクを可視化します。
                    </p>
                    <p>
                      <strong>負荷予測シミュレーター (What-if):</strong> 
                      「もし土曜日に80球投げたら？」といった仮定の数値を入力することで、ACWRやリスク判定がどう変化するかをリアルタイムで検証できます。実際の予定を変更せずにテスト可能です。
                    </p>
                    <p>
                      さらに、Gemini AIがデータに基づいた具体的なコンディション管理アドバイスを提供します。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Tips */}
          <section className="bg-yellow-50 p-6 rounded-xl border border-yellow-100">
             <h3 className="font-bold text-yellow-800 mb-2">💡 ヒント: 効果的な運用方法</h3>
             <ul className="list-disc pl-5 text-sm text-yellow-800/80 space-y-2">
               <li>
                 <strong>試合前:</strong> 「予定表(表形式)」または選手詳細の「登板予定」で、翌週の球数目安を入力しておきます。
               </li>
               <li>
                 <strong>試合後:</strong> スマホやタブレットで「記録入力」を行うか、「予定表(表形式)」の下段に実績をサッと入力します。
               </li>
               <li>
                 <strong>週1回のチェック:</strong> 「分析・コーチング」タブを開き、AIのアドバイスを参考に次週のスケジュールを調整しましょう。
               </li>
             </ul>
          </section>

        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-900 transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemHelpPanel;