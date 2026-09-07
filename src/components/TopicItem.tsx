import React from 'react';
import { CheckCircle2, Circle, AlertCircle, Clock, Sparkles, Star, RotateCcw } from 'lucide-react';
import { Topic } from '../types';

interface TopicItemProps {
  topic: Topic;
  onUpdateStatus: (topicId: string, status: Topic['status'], confidence?: 1 | 2 | 3 | 4 | 5) => void;
  onOpenCoach: (topic: Topic) => void;
}

export const TopicItem: React.FC<TopicItemProps> = ({
  topic,
  onUpdateStatus,
  onOpenCoach
}) => {
  const isCompleted = topic.status === 'completed';
  const isStruggling = topic.status === 'struggling';
  const isInProgress = topic.status === 'in_progress';

  // Difficulty badge colors
  const difficultyColors = [
    '',
    'text-emerald-700 bg-emerald-100 border-emerald-200',
    'text-teal-700 bg-teal-100 border-teal-200',
    'text-amber-800 bg-amber-100 border-amber-200',
    'text-orange-800 bg-orange-100 border-orange-200',
    'text-rose-800 bg-rose-100 border-rose-200'
  ];

  return (
    <div
      className={`group relative p-4 sm:p-5 rounded-2xl border transition-all duration-200 ${
        isCompleted
          ? 'bg-slate-50/70 border-slate-200 opacity-75'
          : isStruggling
          ? 'bg-amber-50/80 border-amber-200 shadow-xs'
          : isInProgress
          ? 'bg-indigo-50/80 border-indigo-300 shadow-sm'
          : 'bg-slate-50 hover:bg-slate-100/90 border-slate-100 hover:border-indigo-300'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: Checkbox / Status toggle */}
        <div className="pt-0.5">
          <button
            onClick={() => onUpdateStatus(topic.id, isCompleted ? 'not_started' : 'completed', 5)}
            className="text-slate-400 hover:text-emerald-600 transition"
            title={isCompleted ? 'Mark as pending' : 'Mark as completed'}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
            ) : isStruggling ? (
              <AlertCircle className="w-5 h-5 text-amber-600 fill-amber-100" />
            ) : isInProgress ? (
              <RotateCcw className="w-5 h-5 text-indigo-600 animate-spin" />
            ) : (
              <Circle className="w-5 h-5 text-slate-300 hover:text-indigo-600" />
            )}
          </button>
        </div>

        {/* Center: Topic Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[10px] uppercase font-black text-indigo-600 tracking-wider">
              {topic.moduleName}
            </span>
            <span
              className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-md border ${
                difficultyColors[topic.difficulty] || difficultyColors[3]
              }`}
            >
              Diff {topic.difficulty}/5
            </span>
            {topic.isReviewSession && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-100 text-indigo-700 border border-indigo-200">
                Spaced Recall
              </span>
            )}
          </div>

          <h3
            className={`text-sm font-bold leading-snug ${
              isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
            }`}
          >
            {topic.title}
          </h3>

          <div className="flex items-center gap-3 text-xs text-slate-500 mt-2 flex-wrap font-medium">
            <span className="flex items-center gap-1 font-mono text-[11px] text-slate-700 font-bold bg-white px-2 py-0.5 rounded-md border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              {topic.estimatedHours}h
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600 text-[11px]">
              {topic.recommendedTechnique}
            </span>
          </div>

          {/* Key terms chips */}
          {topic.keyTerms && topic.keyTerms.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {topic.keyTerms.slice(0, 3).map((term, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-white border border-slate-200 text-slate-600"
                >
                  {term}
                </span>
              ))}
            </div>
          )}

          {/* Struggling warning feedback */}
          {isStruggling && (
            <div className="mt-2.5 p-2.5 rounded-xl bg-amber-100/90 border border-amber-200 text-xs text-amber-900 flex items-center gap-1.5 font-medium">
              <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span>Flagged for reinforcement. Auto-adjust will rebalance upcoming days.</span>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={() => onOpenCoach(topic)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200 rounded-xl shadow-xs transition"
            title="Open 60s Feynman breakdown & test questions"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">AI Coach</span>
          </button>

          {/* Quick status selector */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onUpdateStatus(topic.id, 'completed', 5)}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition ${
                isCompleted
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
              }`}
              title="Mark Completed"
            >
              Done
            </button>
            <button
              onClick={() => onUpdateStatus(topic.id, 'struggling', 2)}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition ${
                isStruggling
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'text-slate-500 hover:text-amber-700 hover:bg-amber-50'
              }`}
              title="Struggled / Took 2x time"
            >
              Struggled
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
