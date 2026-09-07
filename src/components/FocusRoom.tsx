import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Flame, CheckCircle2, AlertCircle, Sparkles, BookOpen, Coffee, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { StudyPlan, Topic } from '../types';
import { playSuccessChime, playTimerChime } from '../utils/soundEffects';

interface FocusRoomProps {
  plan: StudyPlan;
  activeTopic: Topic | null;
  onSelectTopic: (topic: Topic) => void;
  onCompleteTopic: (topicId: string, status: Topic['status'], timeSpentMinutes: number, confidence: 1 | 2 | 3 | 4 | 5) => void;
  onOpenCoach: (topic: Topic) => void;
}

export const FocusRoom: React.FC<FocusRoomProps> = ({
  plan,
  activeTopic,
  onSelectTopic,
  onCompleteTopic,
  onOpenCoach
}) => {
  // Find all pending topics for today or overall
  const allPendingTopics: Topic[] = [];
  plan.days.forEach(d => {
    d.topics.forEach(t => {
      if (t.status !== 'completed') {
        allPendingTopics.push(t);
      }
    });
  });

  const selectedTopic = activeTopic || allPendingTopics[0] || null;

  // Pomodoro timer state
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [notes, setNotes] = useState('');
  const [showSelfReport, setShowSelfReport] = useState(false);

  const timerRef = useRef<any>(null);

  // Set timer when duration changes
  const handleSetDuration = (mins: number) => {
    setDurationMinutes(mins);
    setTimeLeft(mins * 60);
    setIsRunning(false);
    setIsBreak(false);
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            playTimerChime();
            if (!isBreak) {
              setShowSelfReport(true);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, isBreak]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(durationMinutes * 60);
  };

  const handleSelfReportSubmit = (status: Topic['status'], confidence: 1 | 2 | 3 | 4 | 5) => {
    if (!selectedTopic) return;

    if (status === 'completed') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      playSuccessChime();
    }

    onCompleteTopic(selectedTopic.id, status, durationMinutes, confidence);
    setShowSelfReport(false);
    resetTimer();
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const totalSecs = durationMinutes * 60;
  const progressPercent = Math.round(((totalSecs - timeLeft) / totalSecs) * 100);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-white border-2 border-slate-200 rounded-[2rem] p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider text-indigo-600">
              Deep Work Chamber
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Focus Mode & Active Sprint
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Targeted single-tasking with zero distractions. Timed sprints with instant self-assessment.
          </p>
        </div>

        {/* Topic Selector dropdown */}
        <div className="w-full md:w-auto">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Active Study Topic:
          </label>
          <select
            value={selectedTopic?.id || ''}
            onChange={e => {
              const t = allPendingTopics.find(item => item.id === e.target.value);
              if (t) onSelectTopic(t);
            }}
            className="w-full md:w-80 bg-slate-50 border-2 border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 font-bold truncate shadow-xs"
          >
            {allPendingTopics.map(t => (
              <option key={t.id} value={t.id}>
                [{t.moduleName.slice(0, 10)}] {t.title} ({t.estimatedHours}h)
              </option>
            ))}
            {allPendingTopics.length === 0 && (
              <option value="">All topics mastered! 🚀</option>
            )}
          </select>
        </div>
      </div>

      {/* Main Focus Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Timer & Controls */}
        <div className="lg:col-span-2 bg-white border-2 border-slate-200 rounded-[2rem] p-8 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
          {/* Sprints preset buttons */}
          <div className="flex items-center gap-2 mb-6 z-10 flex-wrap justify-center">
            <button
              onClick={() => handleSetDuration(25)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                durationMinutes === 25 && !isBreak
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              25m Sprint
            </button>
            <button
              onClick={() => handleSetDuration(50)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                durationMinutes === 50 && !isBreak
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              50m Deep Block
            </button>
            <button
              onClick={() => {
                setIsBreak(true);
                handleSetDuration(5);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition ${
                isBreak
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" />
              5m Break
            </button>
          </div>

          {/* Big Circular Clock Display */}
          <div className="relative w-64 h-64 flex items-center justify-center my-4 z-10">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background Circle */}
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-slate-100"
                strokeWidth="5"
                fill="none"
              />
              {/* Progress Circle */}
              <circle
                cx="50"
                cy="50"
                r="44"
                className={`transition-all duration-300 ${
                  isBreak ? 'stroke-emerald-500' : 'stroke-indigo-600'
                }`}
                strokeWidth="5.5"
                strokeDasharray="276.46"
                strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-5xl sm:text-6xl font-black tracking-tighter text-slate-900 font-mono">
                {formattedTime}
              </span>
              <span className="text-xs uppercase tracking-widest text-slate-500 mt-2 font-black flex items-center gap-1">
                {isBreak ? (
                  <>
                    <Coffee className="w-3.5 h-3.5 text-emerald-600" />
                    Rest & Reset
                  </>
                ) : (
                  <>
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    Cognitive Sprint
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Timer Action Controls */}
          <div className="flex items-center gap-3 mt-4 z-10">
            <button
              onClick={toggleTimer}
              className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm text-white shadow-xl transition transform active:scale-95 ${
                isRunning
                  ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>Start Focus Sprint</span>
                </>
              )}
            </button>

            <button
              onClick={resetTimer}
              className="p-3.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-2xl text-slate-600 hover:text-slate-900 transition"
              title="Reset timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          {/* Quick manual finish trigger */}
          {selectedTopic && !showSelfReport && (
            <button
              onClick={() => setShowSelfReport(true)}
              className="mt-6 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition underline underline-offset-4"
            >
              Done early? Report session progress now
            </button>
          )}

          {/* Self-Report Dialog Prompt */}
          {showSelfReport && selectedTopic && (
            <div className="mt-6 p-5 rounded-2xl bg-indigo-50/90 border-2 border-indigo-200/80 w-full max-w-md text-left animate-fadeIn z-20 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-wider text-indigo-800">
                  Sprint Self-Assessment
                </span>
                <span className="text-xs text-slate-600">
                  Topic: <strong>{selectedTopic.title.slice(0, 24)}...</strong>
                </span>
              </div>
              <p className="text-xs text-slate-700 mb-3 font-medium">
                How did this session feel? Your feedback informs our adaptive rescheduling algorithm:
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => handleSelfReportSubmit('completed', 5)}
                  className="p-3 rounded-xl bg-white hover:bg-emerald-50 border-2 border-emerald-200 text-emerald-800 text-xs font-bold text-left transition flex items-center gap-2 shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Crushed it (Mastered)</span>
                </button>
                <button
                  onClick={() => handleSelfReportSubmit('struggling', 2)}
                  className="p-3 rounded-xl bg-white hover:bg-amber-50 border-2 border-amber-200 text-amber-900 text-xs font-bold text-left transition flex items-center gap-2 shadow-xs"
                >
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Struggled (+Practice needed)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Active Topic Dossier & AI Coach */}
        <div className="space-y-4">
          {selectedTopic ? (
            <div className="bg-white border-2 border-slate-200 rounded-[2rem] p-6 shadow-sm space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-indigo-100 text-indigo-700 border border-indigo-200 uppercase">
                    {selectedTopic.moduleName}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    Diff {selectedTopic.difficulty}/5
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  {selectedTopic.title}
                </h3>
              </div>

              {/* Recommended Technique */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="text-slate-500 block mb-0.5 font-medium">Target Method:</span>
                <span className="text-indigo-700 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  {selectedTopic.recommendedTechnique}
                </span>
              </div>

              {/* Key Terms */}
              {selectedTopic.keyTerms && selectedTopic.keyTerms.length > 0 && (
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                    Memory Anchors:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTopic.keyTerms.map((term, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-100 border border-slate-200 text-slate-700"
                      >
                        {term}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick AI Coach button */}
              <button
                onClick={() => onOpenCoach(selectedTopic)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold text-xs transition"
              >
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Open 60-Sec Feynman Intuition</span>
              </button>

              {/* Session Scratchpad */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Session Scratchpad:
                </label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Jot down active recall test answers, formula proofs, or questions..."
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 font-mono"
                />
              </div>
            </div>
          ) : (
            <div className="bg-white border-2 border-slate-200 rounded-[2rem] p-8 text-center text-slate-500 text-xs font-medium">
              All topics completed! Return to the schedule or generate a new study plan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
