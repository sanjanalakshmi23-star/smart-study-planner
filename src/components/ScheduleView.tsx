import React, { useState } from 'react';
import { Filter, Calendar, Sparkles, Shield, AlertTriangle } from 'lucide-react';
import { StudyPlan, Topic } from '../types';
import { DayCard } from './DayCard';
import { formatYYYYMMDD } from '../utils/schedulerEngine';

interface ScheduleViewProps {
  plan: StudyPlan;
  onUpdateTopicStatus: (topicId: string, status: Topic['status'], confidence?: 1 | 2 | 3 | 4 | 5) => void;
  onOpenCoach: (topic: Topic) => void;
  onStartFocusSession?: (topic: Topic) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  plan,
  onUpdateTopicStatus,
  onOpenCoach,
  onStartFocusSession
}) => {
  const todayStr = formatYYYYMMDD(new Date());
  const [filter, setFilter] = useState<'all' | 'today' | 'hard' | 'incomplete' | 'buffers'>('all');

  const filteredDays = plan.days.filter(day => {
    if (filter === 'today') {
      return day.date === todayStr;
    }
    if (filter === 'hard') {
      return day.topics.some(t => t.difficulty >= 4);
    }
    if (filter === 'incomplete') {
      return day.topics.some(t => t.status !== 'completed');
    }
    if (filter === 'buffers') {
      return day.isBufferDay || day.isExamDay;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Schedule Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-[2rem] border-2 border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-slate-900">
                Curriculum Timeline & Mastery Path
              </span>
              <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                {plan.days.length} Days
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Filter by today's focus, high-difficulty blocks, or synthetic buffer recovery.
            </p>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              filter === 'all'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            All Days
          </button>
          <button
            onClick={() => setFilter('today')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              filter === 'today'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            Today's Target
          </button>
          <button
            onClick={() => setFilter('incomplete')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              filter === 'incomplete'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            Unfinished Only
          </button>
          <button
            onClick={() => setFilter('hard')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              filter === 'hard'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            Diff 4-5 High Yield
          </button>
          <button
            onClick={() => setFilter('buffers')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              filter === 'buffers'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            Buffer & Exam
          </button>
        </div>
      </div>

      {/* Days List */}
      <div className="space-y-4">
        {filteredDays.length === 0 ? (
          <div className="bg-white border-2 border-slate-200 rounded-[2rem] p-12 text-center text-slate-500 text-sm shadow-sm font-medium">
            No study days match your filter selection. Try selecting "All Days".
          </div>
        ) : (
          filteredDays.map((day, idx) => (
            <DayCard
              key={day.date}
              day={day}
              dayIndex={idx}
              isToday={day.date === todayStr}
              onUpdateTopicStatus={onUpdateTopicStatus}
              onOpenCoach={onOpenCoach}
              onStartFocusSession={onStartFocusSession}
            />
          ))
        )}
      </div>
    </div>
  );
};
