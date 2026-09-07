import React from 'react';
import { Calendar, Shield, Trophy, Clock, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { DaySchedule, Topic } from '../types';
import { TopicItem } from './TopicItem';

interface DayCardProps {
  day: DaySchedule;
  dayIndex: number;
  isToday: boolean;
  onUpdateTopicStatus: (topicId: string, status: Topic['status'], confidence?: 1 | 2 | 3 | 4 | 5) => void;
  onOpenCoach: (topic: Topic) => void;
  onStartFocusSession?: (topic: Topic) => void;
}

export const DayCard: React.FC<DayCardProps> = ({
  day,
  dayIndex,
  isToday,
  onUpdateTopicStatus,
  onOpenCoach,
  onStartFocusSession
}) => {
  const isAllDone =
    day.topics.length > 0 && day.topics.every(t => t.status === 'completed');
  const isOverloaded = day.allocatedHours > day.availableHours && !day.isExamDay;

  // Format nice display date e.g. "Sep 12"
  const dateObj = new Date(day.date + 'T00:00:00');
  const monthName = dateObj.toLocaleDateString('en-US', { month: 'short' });
  const dayNum = dateObj.getDate();

  if (day.isExamDay) {
    return (
      <div className="relative overflow-hidden rounded-[2rem] bg-indigo-600 p-8 text-white shadow-xl shadow-indigo-600/20">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Trophy className="w-36 h-36 text-white" />
        </div>
        <div className="flex items-center gap-3 mb-3">
          <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white text-indigo-700 shadow-md">
            D-Day • Final Exam
          </span>
          <span className="text-xs font-mono text-indigo-100 font-bold">
            {day.dayOfWeek}, {monthName} {dayNum}
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Exam Day Execution 🎯
        </h2>
        <p className="text-sm text-indigo-100 mt-2 max-w-xl leading-relaxed font-medium">
          {day.dailyFocusMotto || 'All modules decompiled and reinforced with spaced recall. Wake up well-rested, hydrate, and execute with confidence.'}
        </p>
        <div className="mt-5 flex items-center gap-3 text-xs text-indigo-100 flex-wrap">
          <div className="px-3.5 py-2 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center gap-1.5 font-bold">
            <Trophy className="w-4 h-4 text-amber-300" />
            <span>Target Mastery Achieved</span>
          </div>
          <span className="text-indigo-200 font-medium">Zero new topics allocated • Maximum cognitive clarity</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-[2rem] border-2 transition-all p-5 sm:p-6 shadow-sm ${
        isToday
          ? 'bg-white border-indigo-600 shadow-xl shadow-indigo-100/50 ring-4 ring-indigo-50'
          : day.isBufferDay
          ? 'bg-indigo-50/70 border-indigo-100'
          : 'bg-white border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Day Card Header */}
      <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-13 h-13 rounded-2xl flex flex-col items-center justify-center border font-mono ${
              isToday
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-200'
                : 'bg-slate-100 border-slate-200 text-slate-800'
            }`}
          >
            <span className="text-[10px] uppercase font-bold tracking-tight">
              {monthName}
            </span>
            <span className="text-lg font-black leading-none">
              {dayNum}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-black text-slate-900 text-base">
                {day.dayOfWeek}
              </span>
              {isToday && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-100 text-indigo-700 border border-indigo-200">
                  Today
                </span>
              )}
              {day.isBufferDay && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-cyan-100 text-cyan-800 border border-cyan-200 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Synthesis Buffer
                </span>
              )}
              {isAllDone && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Mastered
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>{day.dailyFocusMotto}</span>
            </p>
          </div>
        </div>

        {/* Hours status bar */}
        <div className="flex items-center gap-3 text-xs w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-mono text-slate-700 font-bold">
              <strong className="text-slate-900">{day.allocatedHours}h</strong> / {day.availableHours}h
            </span>
          </div>

          {isOverloaded && (
            <span className="flex items-center gap-1 text-[11px] text-rose-700 font-bold bg-rose-100 px-2.5 py-1 rounded-xl border border-rose-200">
              <AlertTriangle className="w-3 h-3" /> +{(day.allocatedHours - day.availableHours).toFixed(1)}h overflow
            </span>
          )}

          {day.availableHours === 0 && (
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200">
              Rest Day
            </span>
          )}
        </div>
      </div>

      {/* Topics Content */}
      <div className="pt-4 space-y-3">
        {day.topics.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500 font-medium">
            {day.isBufferDay
              ? '🛡️ Synthesis Buffer Window: Reserved for high-yield practice questions, active recall flashcards, or catching up on complex topics.'
              : 'No topics scheduled for this day. Rest and consolidation.'}
          </div>
        ) : (
          day.topics.map(topic => (
            <TopicItem
              key={topic.id}
              topic={topic}
              onUpdateStatus={onUpdateTopicStatus}
              onOpenCoach={onOpenCoach}
            />
          ))
        )}
      </div>
    </div>
  );
};
