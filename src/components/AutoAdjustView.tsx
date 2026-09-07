import React, { useState } from 'react';
import { RefreshCw, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Clock, Layers } from 'lucide-react';
import { StudyPlan, Topic } from '../types';
import { calculatePlanAnalytics, autoAdjustScheduleLocally } from '../utils/schedulerEngine';

interface AutoAdjustViewProps {
  plan: StudyPlan;
  onApplyAdjustment: (updatedPlan: StudyPlan) => void;
  onRunAiAdjust: () => void;
  isAdjusting: boolean;
}

export const AutoAdjustView: React.FC<AutoAdjustViewProps> = ({
  plan,
  onApplyAdjustment,
  onRunAiAdjust,
  isAdjusting
}) => {
  const stats = calculatePlanAnalytics(plan);

  // Quick simulation controls
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [simStatus, setSimStatus] = useState<Topic['status']>('struggling');
  const [simConfidence, setSimConfidence] = useState<1 | 2 | 3 | 4 | 5>(2);

  // All topics
  const allTopics: Topic[] = [];
  plan.days.forEach(d => allTopics.push(...d.topics));

  const handleSimulateAdjustment = () => {
    if (!selectedTopicId) return;

    const updated = autoAdjustScheduleLocally(plan, [
      {
        topicId: selectedTopicId,
        newStatus: simStatus,
        confidence: simConfidence,
        timeSpent: simStatus === 'struggling' ? 90 : 45
      }
    ]);

    onApplyAdjustment(updated);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-white border-2 border-slate-200 rounded-[2rem] p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider text-indigo-600">
              Cognitive Adaptive Engine
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Dynamic Pacing & Auto-Adjustment
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 max-w-xl font-medium">
            Real life happens. When study sessions take longer or you encounter friction, our algorithm dynamically redistributes topics across future capacity without compromising your pre-exam synthesis buffer.
          </p>
        </div>

        <button
          onClick={onRunAiAdjust}
          disabled={isAdjusting}
          className="flex items-center gap-2 px-6 py-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-lg shadow-indigo-200 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isAdjusting ? 'animate-spin' : ''}`} />
          <span>{isAdjusting ? 'Re-balancing Schedule...' : 'Trigger AI Auto-Adjust'}</span>
        </button>
      </div>

      {/* 2-Column: Simulator & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Self-Report & Reschedule Simulator */}
        <div className="lg:col-span-1 bg-white border-2 border-slate-200 rounded-[2rem] p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Self-Report Trigger
            </h3>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            Test how the algorithm reacts when you report unexpected difficulty, delays, or skipped sessions:
          </p>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Select Topic:
            </label>
            <select
              value={selectedTopicId}
              onChange={e => setSelectedTopicId(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 font-bold truncate shadow-xs"
            >
              <option value="">-- Choose a study topic --</option>
              {allTopics.slice(0, 20).map(t => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.status})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Self-Reported Outcome:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setSimStatus('struggling');
                  setSimConfidence(2);
                }}
                className={`p-2.5 rounded-xl text-xs font-bold text-left transition border-2 ${
                  simStatus === 'struggling'
                    ? 'bg-amber-100 border-amber-300 text-amber-900'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Struggled (+Delay)
              </button>
              <button
                onClick={() => {
                  setSimStatus('skipped');
                  setSimConfidence(1);
                }}
                className={`p-2.5 rounded-xl text-xs font-bold text-left transition border-2 ${
                  simStatus === 'skipped'
                    ? 'bg-rose-100 border-rose-300 text-rose-900'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Missed / Skipped
              </button>
              <button
                onClick={() => {
                  setSimStatus('completed');
                  setSimConfidence(5);
                }}
                className={`p-2.5 rounded-xl text-xs font-bold text-left transition border-2 ${
                  simStatus === 'completed'
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Mastered Easily
              </button>
              <button
                onClick={() => {
                  setSimStatus('in_progress');
                  setSimConfidence(3);
                }}
                className={`p-2.5 rounded-xl text-xs font-bold text-left transition border-2 ${
                  simStatus === 'in_progress'
                    ? 'bg-indigo-100 border-indigo-300 text-indigo-900'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                50% In Progress
              </button>
            </div>
          </div>

          <button
            onClick={handleSimulateAdjustment}
            disabled={!selectedTopicId}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition shadow-lg shadow-indigo-200"
          >
            <span>Re-balance & Recalculate</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1 font-medium">
            <span className="font-bold text-slate-900 block">Algorithmic Safeguards:</span>
            <p className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Preserves 48h pre-exam buffer zone</p>
            <p className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Inserts active-recall checkpoints for low-confidence topics</p>
            <p className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Prevents back-to-back cognitive overload days</p>
          </div>
        </div>

        {/* Right 2 Columns: Adjustment Audit Log & AI Advice */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border-2 border-slate-200 rounded-[2rem] p-6 sm:p-7 shadow-sm">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Adaptive Re-balancing Audit Trail
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500">
                {plan.adjustmentHistory.length} adjustments logged
              </span>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {plan.adjustmentHistory.map(entry => (
                <div key={entry.id} className="py-4 space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-bold text-indigo-700">
                      {entry.trigger}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 font-semibold">
                      {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                      {new Date(entry.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {entry.summary}
                  </p>

                  {entry.aiCoachAdvice && (
                    <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 flex items-start gap-2 font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0 mt-0.5" />
                      <span>{entry.aiCoachAdvice}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
