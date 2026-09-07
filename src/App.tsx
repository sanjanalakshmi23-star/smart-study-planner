import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { AnalyticsBar } from './components/AnalyticsBar';
import { ScheduleView } from './components/ScheduleView';
import { FocusRoom } from './components/FocusRoom';
import { ReminderCenter } from './components/ReminderCenter';
import { AutoAdjustView } from './components/AutoAdjustView';
import { FoundersSection } from './components/FoundersSection';
import { SyllabusModal } from './components/SyllabusModal';
import { TopicCoachModal } from './components/TopicCoachModal';
import { StudyPlan, Topic } from './types';
import { SAMPLE_CURRICULA } from './utils/sampleCurricula';
import { buildStudySchedule, parseSyllabusFallback, formatYYYYMMDD, addDays, autoAdjustScheduleLocally } from './utils/schedulerEngine';
import { downloadICSFile } from './utils/calendarExport';
import { playSuccessChime } from './utils/soundEffects';

const STORAGE_KEY = 'studypulse_active_plan_v1';

export default function App() {
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [activeTab, setActiveTab] = useState<'schedule' | 'focus' | 'reminders' | 'adjust' | 'founders'>('schedule');
  const [isSyllabusModalOpen, setIsSyllabusModalOpen] = useState(false);
  const [coachingTopic, setCoachingTopic] = useState<Topic | null>(null);
  const [focusTopic, setFocusTopic] = useState<Topic | null>(null);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [notificationBanner, setNotificationBanner] = useState<string | null>(null);

  // Initialize plan from localStorage or create default CS curriculum
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setPlan(parsed);
        return;
      }
    } catch (e) {
      console.error('Failed reading localStorage plan:', e);
    }

    // Default to CS Algorithms 14-day mastery
    const defaultCurriculum = SAMPLE_CURRICULA[0];
    const today = formatYYYYMMDD(new Date());
    const examDate = formatYYYYMMDD(addDays(new Date(), defaultCurriculum.estimatedDays));
    const parsedTopics = parseSyllabusFallback(defaultCurriculum.rawText, defaultCurriculum.suggestedDailyHours);

    const initialPlan = buildStudySchedule({
      courseName: defaultCurriculum.name,
      targetGoal: 'Mastery & Score 90%+ (Grade A)',
      startDate: today,
      examDate,
      dailyHoursConfig: {
        Monday: 2.5,
        Tuesday: 2.5,
        Wednesday: 2.5,
        Thursday: 2.5,
        Friday: 2.0,
        Saturday: 4.0,
        Sunday: 3.5
      },
      defaultDailyHours: defaultCurriculum.suggestedDailyHours,
      syllabusRaw: defaultCurriculum.rawText,
      topics: parsedTopics
    });

    setPlan(initialPlan);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialPlan));
  }, []);

  // Sync to localStorage on plan changes
  const updatePlanAndPersist = (updatedPlan: StudyPlan) => {
    setPlan(updatedPlan);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPlan));
    } catch (e) {
      console.error('Failed to persist plan:', e);
    }
  };

  // Update topic status
  const handleUpdateTopicStatus = (
    topicId: string,
    status: Topic['status'],
    confidence?: 1 | 2 | 3 | 4 | 5
  ) => {
    if (!plan) return;

    if (status === 'completed') {
      playSuccessChime();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    }

    const updated = autoAdjustScheduleLocally(plan, [
      {
        topicId,
        newStatus: status,
        confidence: confidence || (status === 'completed' ? 5 : status === 'struggling' ? 2 : 3),
        timeSpent: 60
      }
    ]);

    updatePlanAndPersist(updated);

    if (status === 'struggling') {
      showToast('Topic marked as struggling. Adaptive engine scheduled reinforcement practice!');
    } else if (status === 'completed') {
      showToast('Topic completed! Spaced repetition curve updated.');
    }
  };

  const showToast = (message: string) => {
    setNotificationBanner(message);
    setTimeout(() => {
      setNotificationBanner(null);
    }, 4000);
  };

  // Run AI / Local auto-adjustment
  const handleTriggerAutoAdjust = async () => {
    if (!plan) return;
    setIsAdjusting(true);

    const allTopics: Topic[] = [];
    plan.days.forEach(d => allTopics.push(...d.topics));
    const strugglingTopics = allTopics.filter(t => t.status === 'struggling').map(t => t.title);
    const uncompleted = allTopics.filter(t => t.status === 'not_started' || t.status === 'skipped').map(t => t.title);
    const completedCount = allTopics.filter(t => t.status === 'completed').length;

    try {
      const res = await fetch('/api/ai/auto-adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseName: plan.courseName,
          daysLeft: Math.max(1, plan.days.length),
          uncompletedTopics: uncompleted.slice(0, 5),
          strugglingTopics: strugglingTopics.slice(0, 5),
          completedCount,
          totalCount: allTopics.length
        })
      });
      const data = await res.json();

      const localUpdated = autoAdjustScheduleLocally(plan, []);
      if (data.coachAdvice) {
        localUpdated.adjustmentHistory[0].aiCoachAdvice = data.coachAdvice;
      }
      updatePlanAndPersist(localUpdated);
      showToast(data.coachAdvice || 'Schedule re-balanced without cramming.');
    } catch (e) {
      const localUpdated = autoAdjustScheduleLocally(plan, []);
      updatePlanAndPersist(localUpdated);
      showToast('Local adaptive rescheduling complete. High-load topics distributed.');
    } finally {
      setIsAdjusting(false);
    }
  };

  const handleExportCalendar = () => {
    if (!plan) return;
    downloadICSFile(plan);
    showToast('Schedule downloaded as .ICS calendar file! Open to add to Google/Apple Calendar.');
  };

  const handleStartFocusSession = (topic: Topic) => {
    setFocusTopic(topic);
    setActiveTab('focus');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white pb-16">
      {/* Toast Notification Banner */}
      {notificationBanner && (
        <div className="fixed top-20 right-4 z-50 max-w-md bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md text-xs font-bold flex items-center justify-between gap-3 animate-fadeIn border border-slate-800">
          <span>{notificationBanner}</span>
          <button
            onClick={() => setNotificationBanner(null)}
            className="text-slate-400 hover:text-white font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main App Navigation Header */}
      <Header
        plan={plan}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenNewPlan={() => setIsSyllabusModalOpen(true)}
        onTriggerAutoAdjust={handleTriggerAutoAdjust}
        onExportCalendar={handleExportCalendar}
        isAdjusting={isAdjusting}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {plan ? (
          <>
            {/* Top HUD Analytics Bar */}
            <AnalyticsBar plan={plan} />

            {/* Tab Views */}
            {activeTab === 'schedule' && (
              <ScheduleView
                plan={plan}
                onUpdateTopicStatus={handleUpdateTopicStatus}
                onOpenCoach={topic => setCoachingTopic(topic)}
                onStartFocusSession={handleStartFocusSession}
              />
            )}

            {activeTab === 'focus' && (
              <FocusRoom
                plan={plan}
                activeTopic={focusTopic}
                onSelectTopic={t => setFocusTopic(t)}
                onCompleteTopic={(topicId, status, timeSpent, conf) => {
                  handleUpdateTopicStatus(topicId, status, conf);
                }}
                onOpenCoach={topic => setCoachingTopic(topic)}
              />
            )}

            {activeTab === 'reminders' && (
              <ReminderCenter
                plan={plan}
                onUpdatePreferences={newPrefs => {
                  const updated: StudyPlan = { ...plan, reminderPreferences: newPrefs };
                  updatePlanAndPersist(updated);
                  showToast('Reminder preferences updated!');
                }}
              />
            )}

            {activeTab === 'adjust' && (
              <AutoAdjustView
                plan={plan}
                onApplyAdjustment={updated => {
                  updatePlanAndPersist(updated);
                  showToast('Adaptive schedule applied!');
                }}
                onRunAiAdjust={handleTriggerAutoAdjust}
                isAdjusting={isAdjusting}
              />
            )}

            {activeTab === 'founders' && (
              <FoundersSection plan={plan} />
            )}
          </>
        ) : (
          <div className="py-24 text-center">
            <div className="w-12 h-12 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-sm text-slate-500 font-bold">Loading your StudyPulse curriculum...</p>
          </div>
        )}
      </main>

      {/* Syllabus Modal for New Plan Creation */}
      <SyllabusModal
        isOpen={isSyllabusModalOpen}
        onClose={() => setIsSyllabusModalOpen(false)}
        onPlanCreated={newPlan => {
          updatePlanAndPersist(newPlan);
          setActiveTab('schedule');
          showToast(`Plan created for ${newPlan.courseName}!`);
        }}
      />

      {/* AI Study Coach Feynman Popover */}
      <TopicCoachModal
        topic={coachingTopic}
        onClose={() => setCoachingTopic(null)}
        onStartFocusSession={handleStartFocusSession}
      />
    </div>
  );
}
