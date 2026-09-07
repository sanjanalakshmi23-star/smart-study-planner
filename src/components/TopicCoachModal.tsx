import React, { useState, useEffect } from 'react';
import { X, Brain, Sparkles, HelpCircle, Key, BookOpen, Check, Play } from 'lucide-react';
import { Topic } from '../types';

interface TopicCoachModalProps {
  topic: Topic | null;
  onClose: () => void;
  onStartFocusSession?: (topic: Topic) => void;
}

interface CoachData {
  feynmanSummary: string;
  keyQuestions: string[];
  mnemonic: string;
}

export const TopicCoachModal: React.FC<TopicCoachModalProps> = ({
  topic,
  onClose,
  onStartFocusSession
}) => {
  const [loading, setLoading] = useState(false);
  const [coachData, setCoachData] = useState<CoachData | null>(null);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!topic) return;

    let isMounted = true;
    setLoading(true);
    setRevealedAnswers({});

    fetch('/api/ai/topic-coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topicTitle: topic.title,
        moduleName: topic.moduleName,
        keyTerms: topic.keyTerms,
        difficulty: topic.difficulty
      })
    })
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        setCoachData({
          feynmanSummary: data.feynmanSummary || `In plain terms: ${topic.title} deals with core transformations and algorithmic invariants that are guaranteed to hold.`,
          keyQuestions: data.keyQuestions || [
            `What is the primary objective of ${topic.title}?`,
            `What is the most common mistake students make on this topic?`,
            `How would you explain this concept to a high schooler in 60 seconds?`
          ],
          mnemonic: data.mnemonic || 'F-A-S-T: Foundations, Application, Structure, Test-cases'
        });
      })
      .catch(() => {
        if (!isMounted) return;
        setCoachData({
          feynmanSummary: `Think of ${topic.title} as a fundamental building block in ${topic.moduleName}. Focus on the inputs, step-by-step mechanisms, and boundary conditions.`,
          keyQuestions: [
            `What are the key terms in ${topic.title}?`,
            `Where does this concept break or fail under extreme values?`,
            `Can you write down the core formula/theorem without looking?`
          ],
          mnemonic: 'P-A-C-E: Principles, Application, Core Mechanism, Edge Cases'
        });
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [topic?.id]);

  if (!topic) return null;

  const toggleReveal = (idx: number) => {
    setRevealedAnswers(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn">
      <div className="bg-white border-2 border-slate-200 rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 relative text-slate-800">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                {topic.moduleName}
              </span>
              <span className="text-xs text-slate-500 font-mono font-bold">
                {topic.estimatedHours} hrs • Diff {topic.difficulty}/5
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              {topic.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-sm text-slate-500 font-bold">
              Generating Feynman breakdown & active recall questions...
            </p>
          </div>
        ) : coachData ? (
          <div className="space-y-6 pt-4">
            {/* Feynman Method Breakdown */}
            <div className="bg-indigo-50/70 border-2 border-indigo-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-indigo-900 text-xs font-black uppercase tracking-wider mb-2">
                <Brain className="w-4 h-4 text-indigo-600" />
                <span>60-Second Feynman Intuition</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">
                {coachData.feynmanSummary}
              </p>
            </div>

            {/* Key Terms / Mental Anchors */}
            {topic.keyTerms && topic.keyTerms.length > 0 && (
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-500" />
                  <span>High-Yield Key Terms</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {topic.keyTerms.map((term, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-slate-100 border border-slate-200 text-slate-800 shadow-xs"
                    >
                      {term}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Memory Mnemonic */}
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-emerald-900 text-xs font-black uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Exam Memory Anchor (Mnemonic)</span>
              </div>
              <p className="text-sm font-mono text-emerald-950 font-bold">
                {coachData.mnemonic}
              </p>
            </div>

            {/* 3 Active Recall Self-Test Questions */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                <span>Active Recall Self-Test (Blind Retrieval)</span>
              </div>
              <p className="text-xs text-slate-500 mb-3 font-medium">
                Don't just re-read. Test your memory retrieval strength before marking as complete:
              </p>
              <div className="space-y-2.5">
                {coachData.keyQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-slate-800 font-medium">
                        <strong className="text-indigo-600 mr-2 font-bold">Q{idx + 1}:</strong>
                        {q}
                      </span>
                      <button
                        onClick={() => toggleReveal(idx)}
                        className="text-xs px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold whitespace-nowrap transition shadow-xs"
                      >
                        {revealedAnswers[idx] ? 'Hide Answer Key' : 'Reveal Check'}
                      </button>
                    </div>
                    {revealedAnswers[idx] && (
                      <div className="mt-2.5 pt-2 border-t border-slate-200 text-xs text-emerald-700 font-medium flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>
                          Core criteria: Mention specific mechanism, input-output relationship, and computational complexity!
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="text-xs text-slate-500 font-medium">
                Recommended method: <strong className="text-slate-800">{topic.recommendedTechnique}</strong>
              </div>
              {onStartFocusSession && (
                <button
                  onClick={() => {
                    onClose();
                    onStartFocusSession(topic);
                  }}
                  className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-lg shadow-indigo-200"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start 25m Focus Block</span>
                </button>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
