import React from 'react';
import { Clock, ShieldAlert, CheckCircle2, TrendingUp, Calendar, AlertTriangle } from 'lucide-react';
import { StudyPlan } from '../types';
import { calculatePlanAnalytics } from '../utils/schedulerEngine';

interface AnalyticsBarProps {
  plan: StudyPlan;
}

export const AnalyticsBar: React.FC<AnalyticsBarProps> = ({ plan }) => {
  const stats = calculatePlanAnalytics(plan);

  // Burnout status styling
  let burnoutLabel = 'Optimal Load';
  let burnoutBadgeColor = 'text-emerald-700 bg-emerald-100 border-emerald-200';
  let burnoutBarColor = 'bg-emerald-500';

  if (stats.burnoutRiskScore > 75) {
    burnoutLabel = 'High Overload Risk';
    burnoutBadgeColor = 'text-rose-700 bg-rose-100 border-rose-200';
    burnoutBarColor = 'bg-rose-500';
  } else if (stats.burnoutRiskScore > 50) {
    burnoutLabel = 'Moderate Density';
    burnoutBadgeColor = 'text-amber-700 bg-amber-100 border-amber-200';
    burnoutBarColor = 'bg-amber-500';
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
      {/* Bento 1: Course Summary (col-span-12 lg:col-span-8) */}
      <div className="col-span-12 lg:col-span-8 bg-white rounded-[2rem] border-2 border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-100 text-indigo-700 border border-indigo-200">
                Active Curriculum
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                {plan.targetGradeOrGoal}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>Target: <strong className="text-slate-900">{plan.examDate}</strong></span>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {plan.courseName}
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Autonomous syllabus decompilation active. Daily target: <strong className="text-slate-900">{plan.defaultDailyHours} hrs/day</strong> across <strong className="text-slate-900">{stats.totalTopics} modules</strong>.
          </p>
        </div>

        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            <span>Spaced reinforcement buffers preserved</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-500">Readiness Score:</span>
            <span className="font-black text-indigo-600 text-sm">{stats.readinessScore}%</span>
            <div className="w-24 bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/80">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.readinessScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bento 2: Hero Mastery Card (Indigo Bold Card) */}
      <div className="col-span-12 lg:col-span-4 bg-indigo-600 rounded-[2rem] p-6 sm:p-8 text-white flex flex-col justify-between shadow-xl shadow-indigo-600/20">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-widest text-indigo-200">
            Topic Mastery
          </span>
          <span className="bg-white/20 backdrop-blur-sm text-white px-2.5 py-1 rounded-xl text-xs font-bold">
            {stats.completedTopics} / {stats.totalTopics}
          </span>
        </div>

        <div className="my-4">
          <div className="text-4xl sm:text-5xl font-black tracking-tight leading-none">
            {stats.completionRate}%
          </div>
          <p className="text-xs text-indigo-100 mt-2">
            {stats.strugglingTopics > 0
              ? `${stats.strugglingTopics} topic(s) flagged for reinforcement in auto-adjust.`
              : 'All scheduled modules progressing on target.'}
          </p>
        </div>

        <div className="w-full bg-indigo-900/40 h-3 rounded-full overflow-hidden p-0.5 border border-indigo-400/30">
          <div
            className="bg-white h-full rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${stats.completionRate}%` }}
          />
        </div>
      </div>

      {/* Bento 3: Dark Countdown Card (Slate-900) */}
      <div className="col-span-12 sm:col-span-6 lg:col-span-4 bg-slate-900 rounded-[2rem] p-6 sm:p-7 text-white flex flex-col justify-between shadow-md">
        <div className="flex items-center justify-between">
          <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
            <Clock className="w-5 h-5 text-indigo-400" />
          </div>
          <span className="text-xs font-mono uppercase font-bold text-slate-400">
            D-Day Vector
          </span>
        </div>

        <div className="my-3">
          <div className="text-4xl sm:text-5xl font-black tracking-tight text-white flex items-baseline gap-2">
            <span>{stats.daysUntilExam}</span>
            <span className="text-sm font-bold text-slate-400">Days</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Until final exam day on {plan.examDate}.
          </p>
        </div>

        <div className="text-[11px] font-bold text-emerald-400 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60 inline-flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Paced across {plan.days.length} structured sessions</span>
        </div>
      </div>

      {/* Bento 4: Burnout / Cognitive Load Card (White Card) */}
      <div className="col-span-12 sm:col-span-6 lg:col-span-4 bg-white rounded-[2rem] border-2 border-slate-200 p-6 sm:p-7 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-indigo-600" />
          </div>
          <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${burnoutBadgeColor}`}>
            {burnoutLabel}
          </span>
        </div>

        <div className="my-3">
          <div className="text-2xl font-black text-slate-900">
            Cognitive Index: {stats.burnoutRiskScore}/100
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Monitors session density, diff 4-5 frequency, and recovery windows.
          </p>
        </div>

        <div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200 mb-1.5">
            <div
              className={`${burnoutBarColor} h-full rounded-full transition-all duration-500`}
              style={{ width: `${stats.burnoutRiskScore}%` }}
            />
          </div>
          {stats.burnoutRiskScore > 75 && (
            <div className="text-[11px] text-rose-600 font-bold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> High density detected. Click Auto-Adjust.
            </div>
          )}
        </div>
      </div>

      {/* Bento 5: Capacity & Headroom (Indigo-50 Soft Tint Card) */}
      <div className="col-span-12 lg:col-span-4 bg-indigo-50 rounded-[2rem] border-2 border-indigo-100 p-6 sm:p-7 text-indigo-950 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
          </div>
          <span className="text-xs font-bold bg-white text-indigo-800 px-2.5 py-1 rounded-xl shadow-xs border border-indigo-100">
            Study Capacity
          </span>
        </div>

        <div className="my-3">
          <div className="text-2xl font-black text-indigo-950">
            {stats.totalHoursPlanned}h / {stats.totalAvailableCapacity}h
          </div>
          <p className="text-xs text-indigo-700/80 mt-1 font-medium">
            {stats.totalAvailableCapacity - stats.totalHoursPlanned > 0
              ? `${(stats.totalAvailableCapacity - stats.totalHoursPlanned).toFixed(1)}h safe buffer remaining before exam.`
              : 'Zero buffer capacity remaining. All slots utilized.'}
          </p>
        </div>

        <div className="w-full bg-indigo-200/70 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-indigo-600 h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(
                100,
                stats.totalAvailableCapacity > 0
                  ? Math.round((stats.totalHoursPlanned / stats.totalAvailableCapacity) * 100)
                  : 100
              )}%`
            }}
          />
        </div>
      </div>
    </div>
  );
};
