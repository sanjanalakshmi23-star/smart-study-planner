import React from 'react';
import { Calendar, Flame, Bell, Sparkles, Plus, Download, Brain, RefreshCw } from 'lucide-react';
import { StudyPlan } from '../types';

interface HeaderProps {
  plan: StudyPlan | null;
  activeTab: 'schedule' | 'focus' | 'reminders' | 'adjust' | 'founders';
  onSelectTab: (tab: 'schedule' | 'focus' | 'reminders' | 'adjust' | 'founders') => void;
  onOpenNewPlan: () => void;
  onTriggerAutoAdjust: () => void;
  onExportCalendar: () => void;
  isAdjusting?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  plan,
  activeTab,
  onSelectTab,
  onOpenNewPlan,
  onTriggerAutoAdjust,
  onExportCalendar,
  isAdjusting = false
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-4 py-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 transition-transform hover:scale-105">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-xl tracking-tight text-slate-900">
                  StudyPulse<span className="text-indigo-600">AI</span>
                </h1>
                <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold tracking-wider text-slate-700 uppercase">
                    AI Engine Active
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block font-medium">
                Autonomous syllabus breakdown & spaced cognitive pacing
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200 text-xs">
            <button
              id="tab-schedule"
              onClick={() => onSelectTab('schedule')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all ${
                activeTab === 'schedule'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule</span>
            </button>
            <button
              id="tab-focus"
              onClick={() => onSelectTab('focus')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all ${
                activeTab === 'focus'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Focus Room</span>
            </button>
            <button
              id="tab-reminders"
              onClick={() => onSelectTab('reminders')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all ${
                activeTab === 'reminders'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Bell className="w-4 h-4 text-emerald-600" />
              <span>Reminders</span>
            </button>
            <button
              id="tab-adjust"
              onClick={() => onSelectTab('adjust')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all ${
                activeTab === 'adjust'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <RefreshCw className={`w-4 h-4 text-cyan-600 ${isAdjusting ? 'animate-spin' : ''}`} />
              <span>Adaptive Engine</span>
            </button>
            <button
              id="tab-founders"
              onClick={() => onSelectTab('founders')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all ${
                activeTab === 'founders'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-violet-600" />
              <span>Founders Lab</span>
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {plan && (
              <button
                id="btn-export-ics"
                onClick={onExportCalendar}
                title="Export schedule to Google Calendar / Apple Calendar (.ics)"
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 rounded-xl hover:bg-slate-200 transition"
              >
                <Download className="w-3.5 h-3.5 text-indigo-600" />
                <span>Export .ICS</span>
              </button>
            )}

            {plan && (
              <button
                id="btn-header-auto-adjust"
                onClick={onTriggerAutoAdjust}
                disabled={isAdjusting}
                title="Run adaptive re-balancing algorithm based on latest progress"
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 rounded-xl hover:bg-indigo-100 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${isAdjusting ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Auto-Adjust</span>
              </button>
            )}

            <button
              id="btn-header-new-plan"
              onClick={onOpenNewPlan}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-md shadow-indigo-200"
            >
              <Plus className="w-4 h-4" />
              <span>New Plan</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-slate-200 overflow-x-auto gap-2 text-xs">
          <button
            onClick={() => onSelectTab('schedule')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap ${
              activeTab === 'schedule' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Schedule
          </button>
          <button
            onClick={() => onSelectTab('focus')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap ${
              activeTab === 'focus' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Focus Room
          </button>
          <button
            onClick={() => onSelectTab('reminders')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap ${
              activeTab === 'reminders' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Reminders
          </button>
          <button
            onClick={() => onSelectTab('adjust')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap ${
              activeTab === 'adjust' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Adaptive Engine
          </button>
          <button
            onClick={() => onSelectTab('founders')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap ${
              activeTab === 'founders' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Founders Lab
          </button>
        </div>
      </div>
    </header>
  );
};
