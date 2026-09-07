export interface Topic {
  id: string;
  title: string;
  moduleName: string;
  estimatedHours: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  recommendedTechnique: string;
  keyTerms: string[];
  status: 'not_started' | 'in_progress' | 'completed' | 'struggling' | 'skipped';
  notes?: string;
  completedAt?: string;
  selfReportedTimeSpent?: number; // in minutes
  confidenceLevel?: 1 | 2 | 3 | 4 | 5;
  isReviewSession?: boolean;
  originalTopicId?: string;
}

export interface DaySchedule {
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // Monday, Tuesday, etc.
  availableHours: number;
  allocatedHours: number;
  topics: Topic[];
  isRestDay: boolean;
  isExamDay: boolean;
  isBufferDay: boolean;
  dayStatus: 'upcoming' | 'current' | 'completed' | 'overdue' | 'needs_adjustment';
  dailyFocusMotto?: string;
}

export interface ReminderPreferences {
  channel: 'both' | 'whatsapp' | 'email';
  phoneNumber: string;
  email: string;
  morningTime: string;
  eveningTime: string;
  includeMotivation: boolean;
  enabled: boolean;
}

export interface AdjustmentLogEntry {
  id: string;
  timestamp: string;
  trigger: string;
  summary: string;
  topicsMovedCount: number;
  aiCoachAdvice: string;
}

export interface StudyPlan {
  id: string;
  courseName: string;
  targetGradeOrGoal: string;
  examDate: string; // YYYY-MM-DD
  startDate: string; // YYYY-MM-DD
  dailyHoursConfig: Record<string, number>; // e.g. { "Mon": 2, "Tue": 2.5, ... }
  defaultDailyHours: number;
  syllabusRaw: string;
  totalTopicsCount: number;
  totalHoursNeeded: number;
  days: DaySchedule[];
  createdAt: string;
  lastAdjustedAt?: string;
  adjustmentHistory: AdjustmentLogEntry[];
  reminderPreferences: ReminderPreferences;
}

export interface PreloadedSyllabus {
  id: string;
  name: string;
  category: string;
  estimatedDays: number;
  suggestedDailyHours: number;
  rawText: string;
}
