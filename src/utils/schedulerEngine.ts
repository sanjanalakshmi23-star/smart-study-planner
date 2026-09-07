import { Topic, DaySchedule, StudyPlan, AdjustmentLogEntry } from '../types';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function formatYYYYMMDD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseYYYYMMDD(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function getDaysDifference(startStr: string, endStr: string): number {
  const start = parseYYYYMMDD(startStr);
  const end = parseYYYYMMDD(endStr);
  const diffTime = end.getTime() - start.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export function parseSyllabusFallback(rawText: string, defaultDuration = 1.5): Topic[] {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const topics: Topic[] = [];
  let currentModule = 'General Foundations';
  let counter = 1;

  for (const line of lines) {
    if (line.toLowerCase().startsWith('module') || line.toLowerCase().startsWith('chapter') || line.toLowerCase().startsWith('unit') || line.endsWith(':')) {
      currentModule = line.replace(/[:#-]/g, '').trim();
      continue;
    }

    const cleanTitle = line.replace(/^[-*•0-9.)\s]+/, '').trim();
    if (!cleanTitle || cleanTitle.length < 3) continue;

    const lower = cleanTitle.toLowerCase();
    let difficulty: 1 | 2 | 3 | 4 | 5 = 3;
    let technique = 'Active Recall & Practice';

    if (lower.includes('foundations') || lower.includes('intro') || lower.includes('basic')) {
      difficulty = 1;
      technique = 'Concept Mapping & Flashcards';
    } else if (lower.includes('theorem') || lower.includes('proof') || lower.includes('dynamic programming') || lower.includes('synthesis') || lower.includes('rotation') || lower.includes('dijkstra')) {
      difficulty = 5;
      technique = 'Feynman Method & Derivation Drills';
    } else if (lower.includes('exam') || lower.includes('mock') || lower.includes('review')) {
      difficulty = 4;
      technique = 'Timed Full Practice Run';
    } else if (lower.includes('advanced') || lower.includes('mechanism') || lower.includes('reaction') || lower.includes('complex')) {
      difficulty = 4;
      technique = 'Deep Problem Sets';
    }

    const terms = cleanTitle
      .split(/[,:;()&/]/)
      .map(t => t.trim())
      .filter(t => t.length > 3)
      .slice(0, 4);

    topics.push({
      id: `topic-${counter++}-${Date.now()}`,
      title: cleanTitle,
      moduleName: currentModule,
      estimatedHours: difficulty >= 4 ? defaultDuration + 0.5 : defaultDuration,
      difficulty,
      recommendedTechnique: technique,
      keyTerms: terms.length ? terms : [cleanTitle],
      status: 'not_started'
    });
  }

  return topics;
}

export function buildStudySchedule(params: {
  courseName: string;
  targetGoal?: string;
  startDate: string;
  examDate: string;
  dailyHoursConfig: Record<string, number>;
  defaultDailyHours: number;
  syllabusRaw: string;
  topics: Topic[];
}): StudyPlan {
  const {
    courseName,
    targetGoal = 'Mastery & Top Exam Score',
    startDate,
    examDate,
    dailyHoursConfig,
    defaultDailyHours,
    syllabusRaw,
    topics
  } = params;

  const totalDaysCount = Math.max(1, getDaysDifference(startDate, examDate) + 1);
  const days: DaySchedule[] = [];
  const start = parseYYYYMMDD(startDate);

  // Initialize all days
  for (let i = 0; i < totalDaysCount; i++) {
    const d = addDays(start, i);
    const dateStr = formatYYYYMMDD(d);
    const dayOfWeek = DAYS_OF_WEEK[d.getDay()];
    const isExamDay = i === totalDaysCount - 1;
    const isBufferDay = i >= totalDaysCount - 3 && !isExamDay && totalDaysCount >= 5;
    const availableHours = isExamDay
      ? 0
      : (dailyHoursConfig[dayOfWeek] ?? defaultDailyHours);

    days.push({
      date: dateStr,
      dayOfWeek,
      availableHours,
      allocatedHours: 0,
      topics: [],
      isRestDay: availableHours === 0,
      isExamDay,
      isBufferDay,
      dayStatus: i === 0 ? 'current' : 'upcoming',
      dailyFocusMotto: isExamDay
        ? 'Final Exam Day! Confidence & Victory 🚀'
        : isBufferDay
        ? 'Buffer & Comprehensive Exam Simulation 🎯'
        : 'Deep Work & Spaced Repetition Session ⚡'
    });
  }

  // Work queue of topics
  const topicsQueue = [...topics];
  const reviewsToSchedule: { topic: Topic; targetDayIndex: number }[] = [];

  // Distribute topics into study days (excluding exam day and buffer days if possible)
  let dayIdx = 0;
  const studyDaysLimit = Math.max(1, totalDaysCount - (totalDaysCount >= 5 ? 2 : 1));

  while (topicsQueue.length > 0 && dayIdx < studyDaysLimit) {
    const currentDay = days[dayIdx];
    if (currentDay.isRestDay || currentDay.availableHours <= 0) {
      dayIdx++;
      continue;
    }

    // Check if there are scheduled spaced-repetition reviews for this day
    const pendingReviews = reviewsToSchedule.filter(r => r.targetDayIndex === dayIdx);
    for (const rev of pendingReviews) {
      if (currentDay.allocatedHours + rev.topic.estimatedHours <= currentDay.availableHours + 0.5) {
        currentDay.topics.push(rev.topic);
        currentDay.allocatedHours = Number((currentDay.allocatedHours + rev.topic.estimatedHours).toFixed(1));
        // Remove from pending
        const idx = reviewsToSchedule.indexOf(rev);
        if (idx !== -1) reviewsToSchedule.splice(idx, 1);
      }
    }

    // Fill with regular topics
    while (topicsQueue.length > 0) {
      const nextTopic = topicsQueue[0];
      const wouldFit = currentDay.allocatedHours + nextTopic.estimatedHours <= currentDay.availableHours + 0.25;

      if (wouldFit || currentDay.topics.length === 0) {
        topicsQueue.shift();
        currentDay.topics.push(nextTopic);
        currentDay.allocatedHours = Number((currentDay.allocatedHours + nextTopic.estimatedHours).toFixed(1));

        // If topic is difficult (difficulty >= 4), queue an active recall check 2 to 4 days later
        if (nextTopic.difficulty >= 4 && dayIdx + 3 < studyDaysLimit) {
          const reviewTopic: Topic = {
            id: `rev-${nextTopic.id}-${Date.now()}`,
            title: `[Active Recall] ${nextTopic.title}`,
            moduleName: nextTopic.moduleName,
            estimatedHours: 0.5,
            difficulty: nextTopic.difficulty,
            recommendedTechnique: 'Flash Recall & Blind Retrieval',
            keyTerms: nextTopic.keyTerms,
            status: 'not_started',
            isReviewSession: true,
            originalTopicId: nextTopic.id
          };
          reviewsToSchedule.push({
            topic: reviewTopic,
            targetDayIndex: Math.min(studyDaysLimit - 1, dayIdx + 3)
          });
        }
      } else {
        break; // Day is full, move to next day
      }
    }

    dayIdx++;
  }

  // If there are leftover topics, distribute them across buffer days or evenly
  if (topicsQueue.length > 0) {
    for (let i = 0; i < totalDaysCount - 1 && topicsQueue.length > 0; i++) {
      const day = days[i];
      if (day.isRestDay) continue;
      const topic = topicsQueue.shift()!;
      day.topics.push(topic);
      day.allocatedHours = Number((day.allocatedHours + topic.estimatedHours).toFixed(1));
    }
  }

  // Also place any leftover reviews in buffer days
  for (const rev of reviewsToSchedule) {
    const target = days[Math.min(totalDaysCount - 2, Math.max(0, rev.targetDayIndex))];
    if (target && !target.isExamDay) {
      target.topics.push(rev.topic);
      target.allocatedHours = Number((target.allocatedHours + rev.topic.estimatedHours).toFixed(1));
    }
  }

  const totalTopicsCount = topics.length;
  const totalHoursNeeded = Number(topics.reduce((acc, t) => acc + t.estimatedHours, 0).toFixed(1));

  return {
    id: `plan-${Date.now()}`,
    courseName,
    targetGradeOrGoal: targetGoal,
    examDate,
    startDate,
    dailyHoursConfig,
    defaultDailyHours,
    syllabusRaw,
    totalTopicsCount,
    totalHoursNeeded,
    days,
    createdAt: new Date().toISOString(),
    adjustmentHistory: [
      {
        id: `adj-init-${Date.now()}`,
        timestamp: new Date().toISOString(),
        trigger: 'Initial AI Study Schedule Generated',
        summary: `Structured ${totalTopicsCount} topics across ${totalDaysCount} days, reserving the pre-exam window for synthesis buffers.`,
        topicsMovedCount: 0,
        aiCoachAdvice: 'Start with 25-minute Pomodoro sprints. Your high-cognitive load topics are spaced out to prevent burnout.'
      }
    ],
    reminderPreferences: {
      channel: 'both',
      phoneNumber: '',
      email: '',
      morningTime: '08:00',
      eveningTime: '20:30',
      includeMotivation: true,
      enabled: true
    }
  };
}

export function autoAdjustScheduleLocally(
  currentPlan: StudyPlan,
  updates: {
    topicId: string;
    newStatus: Topic['status'];
    timeSpent?: number;
    confidence?: 1 | 2 | 3 | 4 | 5;
    notes?: string;
  }[]
): StudyPlan {
  const updatedPlan: StudyPlan = JSON.parse(JSON.stringify(currentPlan));
  const todayStr = formatYYYYMMDD(new Date());

  // Update topic statuses
  const updateMap = new Map(updates.map(u => [u.topicId, u]));
  const delayedOrStrugglingTopics: Topic[] = [];

  for (const day of updatedPlan.days) {
    for (let i = 0; i < day.topics.length; i++) {
      const t = day.topics[i];
      if (updateMap.has(t.id)) {
        const update = updateMap.get(t.id)!;
        t.status = update.newStatus;
        if (update.confidence !== undefined) t.confidenceLevel = update.confidence;
        if (update.timeSpent !== undefined) t.selfReportedTimeSpent = update.timeSpent;
        if (update.notes) t.notes = update.notes;
        if (update.newStatus === 'completed') {
          t.completedAt = new Date().toISOString();
        }

        // If struggling, generate an extra reinforcement topic
        if (update.newStatus === 'struggling') {
          delayedOrStrugglingTopics.push({
            id: `reinforce-${t.id}-${Date.now()}`,
            title: `[Reinforce / Deep Dive] ${t.title}`,
            moduleName: t.moduleName,
            estimatedHours: 0.75,
            difficulty: Math.min(5, (t.difficulty + 1)) as any,
            recommendedTechnique: 'Worked Examples & Formula Derivation',
            keyTerms: t.keyTerms,
            status: 'not_started'
          });
        }
      }
    }
  }

  // Find missed topics: topics scheduled before today that are still not_started or skipped
  const todayDate = parseYYYYMMDD(todayStr);
  const uncompletedPastTopics: Topic[] = [];

  for (const day of updatedPlan.days) {
    const d = parseYYYYMMDD(day.date);
    if (d.getTime() < todayDate.getTime()) {
      // Past day
      const stillPending = day.topics.filter(
        t => t.status === 'not_started' || t.status === 'skipped' || t.status === 'in_progress'
      );
      if (stillPending.length > 0) {
        uncompletedPastTopics.push(...stillPending);
        // Remove from past day so they don't linger as unaddressed ghosts
        day.topics = day.topics.filter(
          t => t.status === 'completed' || t.status === 'struggling'
        );
        day.allocatedHours = Number(
          day.topics.reduce((sum, t) => sum + t.estimatedHours, 0).toFixed(1)
        );
        day.dayStatus = 'completed';
      }
    }
  }

  const topicsToRedistribute = [...uncompletedPastTopics, ...delayedOrStrugglingTopics];
  let redistributedCount = 0;

  if (topicsToRedistribute.length > 0) {
    // Find future available study days (today or after, not exam day)
    const futureDays = updatedPlan.days.filter(d => {
      const dDate = parseYYYYMMDD(d.date);
      return dDate.getTime() >= todayDate.getTime() && !d.isExamDay;
    });

    for (const topic of topicsToRedistribute) {
      // Find the day with the most remaining capacity
      futureDays.sort((a, b) => {
        const remA = a.availableHours - a.allocatedHours;
        const remB = b.availableHours - b.allocatedHours;
        return remB - remA;
      });

      const bestDay = futureDays[0];
      if (bestDay) {
        bestDay.topics.unshift(topic); // Place high priority
        bestDay.allocatedHours = Number((bestDay.allocatedHours + topic.estimatedHours).toFixed(1));
        redistributedCount++;
      }
    }
  }

  // Recalculate allocated hours and day statuses
  for (const day of updatedPlan.days) {
    day.allocatedHours = Number(
      day.topics.reduce((acc, t) => acc + t.estimatedHours, 0).toFixed(1)
    );
    const dDate = parseYYYYMMDD(day.date);
    if (dDate.getTime() < todayDate.getTime()) {
      day.dayStatus = 'completed';
    } else if (day.date === todayStr) {
      day.dayStatus = 'current';
    } else {
      day.dayStatus = day.allocatedHours > day.availableHours ? 'needs_adjustment' : 'upcoming';
    }
  }

  const logEntry: AdjustmentLogEntry = {
    id: `adj-${Date.now()}`,
    timestamp: new Date().toISOString(),
    trigger: `${updates.length} topic updates recorded (${topicsToRedistribute.length} redistributed)`,
    summary: `Re-balanced ${redistributedCount} topics across future study blocks. Preserved exam buffer integrity without cramming.`,
    topicsMovedCount: redistributedCount,
    aiCoachAdvice: redistributedCount > 0
      ? "You encountered some friction, but that's normal in high-yield learning! We shifted your delayed topics into your higher-capacity slots. Keep your momentum going."
      : "Great progress! Your pace is right on target with the revision curve."
  };

  updatedPlan.lastAdjustedAt = new Date().toISOString();
  updatedPlan.adjustmentHistory.unshift(logEntry);

  return updatedPlan;
}

export function calculatePlanAnalytics(plan: StudyPlan) {
  const allTopics: Topic[] = [];
  plan.days.forEach(d => allTopics.push(...d.topics));

  const total = allTopics.length;
  const completed = allTopics.filter(t => t.status === 'completed').length;
  const struggling = allTopics.filter(t => t.status === 'struggling').length;
  const inProgress = allTopics.filter(t => t.status === 'in_progress').length;
  const notStarted = allTopics.filter(t => t.status === 'not_started').length;

  const totalHoursPlanned = plan.days.reduce((acc, d) => acc + d.allocatedHours, 0);
  const totalAvailableCapacity = plan.days.reduce((acc, d) => acc + d.availableHours, 0);

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Burnout index based on ratio of allocated to available, and average difficulty
  const loadRatio = totalAvailableCapacity > 0 ? (totalHoursPlanned / totalAvailableCapacity) : 1;
  const avgDifficulty = total > 0
    ? (allTopics.reduce((acc, t) => acc + t.difficulty, 0) / total)
    : 3;
  const burnoutRiskScore = Math.min(100, Math.max(10, Math.round(loadRatio * 45 + (avgDifficulty / 5) * 45)));

  // Exam countdown
  const todayStr = formatYYYYMMDD(new Date());
  const daysUntilExam = Math.max(0, getDaysDifference(todayStr, plan.examDate));

  return {
    totalTopics: total,
    completedTopics: completed,
    strugglingTopics: struggling,
    inProgressTopics: inProgress,
    notStartedTopics: notStarted,
    completionRate,
    totalHoursPlanned: Number(totalHoursPlanned.toFixed(1)),
    totalAvailableCapacity: Number(totalAvailableCapacity.toFixed(1)),
    burnoutRiskScore,
    daysUntilExam,
    readinessScore: Math.min(100, Math.round(completionRate * 0.7 + (100 - burnoutRiskScore) * 0.3))
  };
}
