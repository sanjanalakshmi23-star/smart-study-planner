import { StudyPlan } from '../types';

/**
 * Generates an iCalendar (.ics) string from a StudyPlan
 */
export function generateICS(plan: StudyPlan): string {
  const events: string[] = [];
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  plan.days.forEach((day, dayIndex) => {
    if (day.topics.length === 0 || day.isRestDay) return;

    const [year, month, d] = day.date.split('-');
    const dateFormatted = `${year}${month}${d}`;

    // Create event for the day's study block
    const summary = day.isExamDay
      ? `EXAM: ${plan.courseName}`
      : day.isBufferDay
      ? `Study Buffer & Synthesis: ${plan.courseName}`
      : `Study Session: ${plan.courseName} (${day.allocatedHours}h)`;

    const topicDescriptions = day.topics
      .map((t, idx) => `${idx + 1}. ${t.title} [${t.estimatedHours}h - ${t.recommendedTechnique}]`)
      .join('\\n');

    const description = `Daily Goal: ${day.dailyFocusMotto || 'Deep Work'}\\n\\nTopics:\\n${topicDescriptions}`;

    // Default morning slot 09:00 - e.g. 2 hours
    const startHour = 9;
    const endHour = Math.min(23, startHour + Math.max(1, Math.round(day.allocatedHours)));
    const startTimeStr = `T${String(startHour).padStart(2, '0')}0000`;
    const endTimeStr = `T${String(endHour).padStart(2, '0')}0000`;

    const event = [
      'BEGIN:VEVENT',
      `UID:studypulse-${plan.id}-${dayIndex}-${Date.now()}@studypulse.ai`,
      `DTSTAMP:${now}`,
      `DTSTART:${dateFormatted}${startTimeStr}`,
      `DTEND:${dateFormatted}${endTimeStr}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      'STATUS:CONFIRMED',
      'TRANSP:OPAQUE',
      'END:VEVENT'
    ].join('\r\n');

    events.push(event);
  });

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//StudyPulse AI//Student Study Scheduler//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${plan.courseName} Study Schedule`,
    'X-WR-TIMEZONE:UTC',
    ...events,
    'END:VCALENDAR'
  ].join('\r\n');

  return icsContent;
}

export function downloadICSFile(plan: StudyPlan) {
  const content = generateICS(plan);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${plan.courseName.replace(/[^a-zA-Z0-9]/g, '_')}_StudyPulse.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
