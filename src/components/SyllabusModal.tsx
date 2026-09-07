import React, { useState } from 'react';
import { X, Sparkles, BookOpen, Calendar, Clock, Upload, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { SAMPLE_CURRICULA } from '../utils/sampleCurricula';
import { Topic, StudyPlan } from '../types';
import { buildStudySchedule, parseSyllabusFallback, formatYYYYMMDD, addDays } from '../utils/schedulerEngine';

interface SyllabusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanCreated: (plan: StudyPlan) => void;
}

export const SyllabusModal: React.FC<SyllabusModalProps> = ({
  isOpen,
  onClose,
  onPlanCreated
}) => {
  const todayStr = formatYYYYMMDD(new Date());
  const defaultExam = formatYYYYMMDD(addDays(new Date(), 14));

  const [courseName, setCourseName] = useState('CS 201: Data Structures & Algorithms');
  const [targetGoal, setTargetGoal] = useState('Score 90%+ (Grade A)');
  const [examDate, setExamDate] = useState(defaultExam);
  const [defaultDailyHours, setDefaultDailyHours] = useState(2.5);
  const [syllabusRaw, setSyllabusRaw] = useState(SAMPLE_CURRICULA[0].rawText);
  const [selectedPresetId, setSelectedPresetId] = useState('cs-algo');
  const [isDecompiling, setIsDecompiling] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<Topic[] | null>(null);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Day of week custom hours
  const [customDays, setCustomDays] = useState<Record<string, number>>({
    Monday: 2.5,
    Tuesday: 2.5,
    Wednesday: 2.5,
    Thursday: 2.5,
    Friday: 2.0,
    Saturday: 4.0,
    Sunday: 3.5
  });

  if (!isOpen) return null;

  const handleSelectPreset = (presetId: string) => {
    const p = SAMPLE_CURRICULA.find(c => c.id === presetId);
    if (!p) return;
    setSelectedPresetId(presetId);
    setCourseName(p.name);
    setSyllabusRaw(p.rawText);
    setDefaultDailyHours(p.suggestedDailyHours);
    setExamDate(formatYYYYMMDD(addDays(new Date(), p.estimatedDays)));
    setParsedPreview(null);
    setAiAdvice(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setSyllabusRaw(content);
        setSelectedPresetId('custom');
        setCourseName(file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsText(file);
  };

  const handleDecompile = async () => {
    setIsDecompiling(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/parse-syllabus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syllabusText: syllabusRaw,
          courseName,
          targetExamDate: examDate,
          dailyAvailableHours: defaultDailyHours
        })
      });

      const data = await res.json();

      if (data.success && data.topics && Array.isArray(data.topics) && data.topics.length > 0) {
        const formattedTopics: Topic[] = data.topics.map((t: any, idx: number) => ({
          id: `ai-topic-${idx}-${Date.now()}`,
          title: t.title,
          moduleName: t.moduleName || 'Mastery Module',
          estimatedHours: Number(t.estimatedHours) || 1.5,
          difficulty: (Math.min(5, Math.max(1, Number(t.difficulty) || 3))) as any,
          recommendedTechnique: t.recommendedTechnique || 'Active Recall & Practice',
          keyTerms: t.keyTerms || [t.title],
          status: 'not_started'
        }));
        setParsedPreview(formattedTopics);
        setAiAdvice(data.strategicAdvice || 'Prioritize derivation problem sets on high-hour weekend slots.');
      } else {
        // Local algorithm fallback
        const fallbackTopics = parseSyllabusFallback(syllabusRaw, defaultDailyHours > 2 ? 1.5 : 1.0);
        setParsedPreview(fallbackTopics);
        setAiAdvice('Parsed using local curriculum heuristics. Distributed across spaced cognitive intervals.');
      }
    } catch (err: any) {
      console.warn('AI decompile failed, using local fallback:', err);
      const fallbackTopics = parseSyllabusFallback(syllabusRaw, 1.5);
      setParsedPreview(fallbackTopics);
    } finally {
      setIsDecompiling(false);
    }
  };

  const handleGeneratePlan = () => {
    const topicsToSchedule = parsedPreview || parseSyllabusFallback(syllabusRaw, 1.5);

    if (topicsToSchedule.length === 0) {
      setError('Please provide at least one topic or syllabus module.');
      return;
    }

    const plan = buildStudySchedule({
      courseName,
      targetGoal,
      startDate: todayStr,
      examDate,
      dailyHoursConfig: customDays,
      defaultDailyHours,
      syllabusRaw,
      topics: topicsToSchedule
    });

    onPlanCreated(plan);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-white border-2 border-slate-200 rounded-[2.5rem] w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-8 text-slate-800 my-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
              <span className="text-xs font-black uppercase tracking-wider text-indigo-600">
                Cognitive Study Architect
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Create AI-Assisted Study Schedule
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Input your syllabus, exam countdown, and daily capacity. Our scheduling algorithm auto-distributes topics with spaced repetition.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Selector */}
        <div className="pt-5 pb-3">
          <label className="text-xs font-black uppercase tracking-wider text-slate-700 mb-2 block">
            Quick-Load Student Syllabi (or paste your own):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {SAMPLE_CURRICULA.map(preset => (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset.id)}
                className={`p-3 rounded-2xl border-2 text-left text-xs transition ${
                  selectedPresetId === preset.id
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-900 font-bold shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 font-medium'
                }`}
              >
                <div className="truncate font-bold text-slate-900">{preset.name.split(':')[0]}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{preset.category}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Inputs Form */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Course Name */}
          <div className="sm:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 block">
              Course / Exam Title
            </label>
            <input
              type="text"
              value={courseName}
              onChange={e => setCourseName(e.target.value)}
              placeholder="e.g. CS 201: Data Structures & Algorithms"
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 font-bold shadow-xs"
            />
          </div>

          {/* Target Goal */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 block">
              Target Goal
            </label>
            <select
              value={targetGoal}
              onChange={e => setTargetGoal(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 font-bold shadow-xs"
            >
              <option value="Score 90%+ (Grade A)">Score 90%+ (Grade A)</option>
              <option value="Score 80%+ (Grade B)">Score 80%+ (Grade B)</option>
              <option value="Pass & Master Core Skills">Pass & Master Core Skills</option>
              <option value="Top Percentile (MCAT/GRE/Bar)">Top Percentile (MCAT/GRE/Bar)</option>
            </select>
          </div>

          {/* Exam Date */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              Exam Date
            </label>
            <input
              type="date"
              value={examDate}
              min={todayStr}
              onChange={e => setExamDate(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 font-bold font-mono shadow-xs"
            />
          </div>

          {/* Daily Hours Budget */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              Daily Study Budget
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="12"
                value={defaultDailyHours}
                onChange={e => setDefaultDailyHours(Number(e.target.value))}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 font-bold font-mono shadow-xs"
              />
              <span className="text-xs text-slate-500 font-bold whitespace-nowrap">hrs/day</span>
            </div>
          </div>

          {/* Flexible Weekend/Weekday Hours */}
          <div className="flex flex-col justify-end">
            <span className="text-[11px] text-slate-500 leading-tight font-medium">
              Flexible scheduling active: Mon-Fri ~{defaultDailyHours}h, Weekends ~{customDays.Saturday}h.
            </span>
          </div>
        </div>

        {/* Syllabus Input Area */}
        <div className="pt-4">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Syllabus Content (Paste text, outline, or drop file)</span>
            </label>
            <label className="cursor-pointer text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload .txt/.md</span>
              <input
                type="file"
                accept=".txt,.md,.text"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
          <textarea
            rows={7}
            value={syllabusRaw}
            onChange={e => {
              setSyllabusRaw(e.target.value);
              setSelectedPresetId('custom');
              setParsedPreview(null);
            }}
            placeholder="Paste syllabus modules, chapter outlines, or lecture topics here..."
            className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 font-mono leading-relaxed shadow-xs"
          />
        </div>

        {/* Decompile button */}
        <div className="pt-3 flex items-center justify-between gap-3 flex-wrap">
          <button
            onClick={handleDecompile}
            disabled={isDecompiling || !syllabusRaw.trim()}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-indigo-700 bg-indigo-50 border-2 border-indigo-200 rounded-xl hover:bg-indigo-100 transition disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 text-indigo-600 ${isDecompiling ? 'animate-spin' : ''}`} />
            <span>{isDecompiling ? 'AI Decompiling Syllabus...' : 'AI Syllabus Decompiler & Weights'}</span>
          </button>

          {parsedPreview && (
            <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              <Check className="w-4 h-4 text-emerald-600" />
              Decompiled into {parsedPreview.length} granular study sessions
            </span>
          )}
        </div>

        {/* Strategic Advice Callout */}
        {aiAdvice && (
          <div className="mt-3 p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 font-medium">
            <span className="font-bold text-indigo-800 mr-2">🧠 AI Learning Scientist Tip:</span>
            {aiAdvice}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mt-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleGeneratePlan}
            className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-lg shadow-indigo-200"
          >
            <span>Generate Spaced Study Schedule</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
