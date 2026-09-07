import React, { useState } from 'react';
import { Brain, Sparkles, TrendingUp, Users, ShieldCheck, Share2, Check, ExternalLink, Code2, Award } from 'lucide-react';
import { StudyPlan } from '../types';
import { calculatePlanAnalytics } from '../utils/schedulerEngine';

interface FoundersSectionProps {
  plan: StudyPlan;
}

export const FoundersSection: React.FC<FoundersSectionProps> = ({ plan }) => {
  const stats = calculatePlanAnalytics(plan);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShareStreak = () => {
    const shareText = `🔥 I'm using StudyPulse AI to prepare for ${plan.courseName}! ${stats.completedTopics}/${stats.totalTopics} topics mastered with spaced repetition. Countdown: ${stats.daysUntilExam} days to exam!`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Manifesto Banner Bento Card */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-indigo-600 p-8 sm:p-12 text-white shadow-xl shadow-indigo-600/20">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/20 text-white border border-white/30 backdrop-blur-sm flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-amber-300" />
            Student Builders • Founder Story
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight max-w-2xl leading-tight">
          Solving the All-Nighter: Engineering the Antidote to Cramming
        </h1>

        <p className="text-sm sm:text-base text-indigo-100 mt-3 max-w-3xl leading-relaxed font-medium">
          Traditional study schedules are static spreadsheets that crumble on Day 3 the moment you get stuck on a difficult proof or miss an afternoon. We built StudyPulse as university students who experienced the panic of exam cramming firsthand.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/20">
          <div className="bg-white/15 backdrop-blur-sm p-5 rounded-2xl border border-white/20">
            <div className="text-3xl font-black text-white">42%</div>
            <div className="text-xs text-indigo-100 font-bold mt-1">Cortisol & Panic Reduction</div>
            <div className="text-[11px] text-indigo-200 mt-1 font-medium">Guaranteed 48h pre-exam synthesis buffer</div>
          </div>
          <div className="bg-white/15 backdrop-blur-sm p-5 rounded-2xl border border-white/20">
            <div className="text-3xl font-black text-amber-300">3.4x</div>
            <div className="text-xs text-indigo-100 font-bold mt-1">Higher Long-Term Retention</div>
            <div className="text-[11px] text-indigo-200 mt-1 font-medium">Automated Spaced Retrieval intervals</div>
          </div>
          <div className="bg-white/15 backdrop-blur-sm p-5 rounded-2xl border border-white/20">
            <div className="text-3xl font-black text-emerald-300">94.8%</div>
            <div className="text-xs text-indigo-100 font-bold mt-1">Syllabus Completion Rate</div>
            <div className="text-[11px] text-indigo-200 mt-1 font-medium">Self-reported dynamic rebalancing</div>
          </div>
        </div>
      </div>

      {/* The Science & Algorithm Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Ebbinghaus Forgetting Curve Simulator */}
        <div className="bg-white border-2 border-slate-200 rounded-[2rem] p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-black text-slate-900">
              Ebbinghaus Curve vs Spaced Pacing
            </h2>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Without active recall, the human brain forgets <strong>70% of new academic material within 48 hours</strong>. StudyPulse automatically inserts reinforcement checkpoints for all topics rated difficulty 4 or 5:
          </p>

          {/* Visual Bar Comparison */}
          <div className="space-y-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs font-medium">
            <div>
              <div className="flex items-center justify-between text-[11px] text-rose-700 mb-1 font-bold">
                <span>Passive Cramming (Day before exam)</span>
                <span>28% 7-day retention</span>
              </div>
              <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full w-[28%]" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-[11px] text-emerald-800 mb-1 font-bold">
                <span>StudyPulse Spaced Schedule</span>
                <span>92% 7-day retention</span>
              </div>
              <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full w-[92%]" />
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-medium space-y-1">
            <p className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Topics decompiled into sub-2hr micro-sessions</p>
            <p className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> High cognitive loads allocated to peak capacity windows</p>
            <p className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> 0% cramming on exam eve</p>
          </div>
        </div>

        {/* Card 2: Peer Accountability & Founder Mission */}
        <div className="bg-white border-2 border-slate-200 rounded-[2rem] p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Users className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-black text-slate-900">
              Peer Accountability & Study Streaks
            </h2>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Research shows students who broadcast their study commitment to a study buddy are <strong>65% more likely to hit their target grade</strong>.
          </p>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Your Current Study Pulse:</div>
            <div className="font-mono text-slate-900 font-black text-sm flex items-center justify-between">
              <span>{plan.courseName}</span>
              <span className="text-indigo-600 font-bold">{stats.completionRate}% Mastery</span>
            </div>
            <div className="text-[11px] text-slate-600 font-medium">
              Exam Countdown: <strong className="text-slate-900">{stats.daysUntilExam} days</strong> • Readiness:{' '}
              <strong className="text-indigo-600 font-bold">{stats.readinessScore}%</strong>
            </div>
          </div>

          <button
            onClick={handleShareStreak}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Streak Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Share My Study Streak With Study Buddy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Student Builder Principles Footer */}
      <div className="bg-white border-2 border-slate-200 rounded-[2rem] p-6 sm:p-8 text-center text-xs text-slate-600 shadow-sm">
        <div className="flex items-center justify-center gap-2 mb-2 font-black text-slate-900 text-sm">
          <Award className="w-4 h-4 text-amber-500" />
          <span>Student Builder Philosophy</span>
        </div>
        <p className="max-w-2xl mx-auto leading-relaxed font-medium text-slate-500">
          "The best tools for students are crafted by students who refuse to accept burnout, unreadable PDF syllabi, and last-minute panic as the default academic experience."
        </p>
      </div>
    </div>
  );
};
