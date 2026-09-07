import React, { useState, useEffect } from 'react';
import { MessageSquare, Mail, Bell, Sparkles, Send, Copy, Check, Clock, ShieldCheck, Download, Smartphone } from 'lucide-react';
import { StudyPlan } from '../types';
import { downloadICSFile } from '../utils/calendarExport';
import { calculatePlanAnalytics, formatYYYYMMDD } from '../utils/schedulerEngine';

interface ReminderCenterProps {
  plan: StudyPlan;
  onUpdatePreferences: (prefs: StudyPlan['reminderPreferences']) => void;
}

export const ReminderCenter: React.FC<ReminderCenterProps> = ({
  plan,
  onUpdatePreferences
}) => {
  const stats = calculatePlanAnalytics(plan);
  const todayStr = formatYYYYMMDD(new Date());
  const todaySchedule = plan.days.find(d => d.date === todayStr) || plan.days[0];

  const [prefs, setPrefs] = useState(plan.reminderPreferences);
  const [copied, setCopied] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<string>('default');

  // Custom generated reminder message
  const [waMessage, setWaMessage] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [actionTip, setActionTip] = useState('');

  // Generate initial reminder text on load
  useEffect(() => {
    generateReminderContent();
  }, [plan.id, todaySchedule?.date]);

  const generateReminderContent = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/ai/generate-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseName: plan.courseName,
          dayOfWeek: todaySchedule?.dayOfWeek || 'Today',
          date: todaySchedule?.date || todayStr,
          allocatedHours: todaySchedule?.allocatedHours || plan.defaultDailyHours,
          topics: todaySchedule?.topics || [],
          daysUntilExam: stats.daysUntilExam
        })
      });
      const data = await res.json();

      if (data.whatsappMessage) {
        setWaMessage(data.whatsappMessage);
        setEmailSubject(data.emailSubject || `🎯 StudyPulse: Today's ${plan.courseName} Plan`);
        setActionTip(data.actionTip || 'Start with high-yield derivations before passive review.');
      } else {
        fallbackReminder();
      }
    } catch (e) {
      fallbackReminder();
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const fallbackReminder = () => {
    const topicsList = (todaySchedule?.topics || [])
      .map((t, idx) => `• ${t.title} (~${t.estimatedHours}h - *${t.recommendedTechnique}*)`)
      .join('\n');

    const msg = `📚 *StudyPulse Daily Agenda | ${todaySchedule?.dayOfWeek || 'Today'}*\n\n🎯 *Course:* ${plan.courseName}\n⏳ *Exam Countdown:* ${stats.daysUntilExam} days remaining\n⏱️ *Today's Focus:* ${todaySchedule?.allocatedHours || plan.defaultDailyHours} hrs budgeted\n\n*Tasks for Today:*\n${topicsList || '• Buffer & Mock review session'}\n\n💡 *Action Tip:* 25m Pomodoro sprints prevent late-night cramming panic.\nReport progress on StudyPulse when complete!`;
    setWaMessage(msg);
    setEmailSubject(`🎯 StudyPulse Daily Briefing: ${plan.courseName} (${todaySchedule?.allocatedHours}h)`);
    setActionTip('Begin with the highest-difficulty topic during your peak morning energy window.');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(waMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    const phone = prefs.phoneNumber ? prefs.phoneNumber.replace(/[^0-9]/g, '') : '';
    const encodedText = encodeURIComponent(waMessage);
    const url = phone
      ? `https://wa.me/${phone}?text=${encodedText}`
      : `https://wa.me/?text=${encodedText}`;
    window.open(url, '_blank');
  };

  const handleSendEmail = () => {
    const recipient = prefs.email || '';
    const subject = encodeURIComponent(emailSubject);
    const body = encodeURIComponent(waMessage.replace(/\*/g, ''));
    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
  };

  const handleRequestBrowserNotification = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notifications.');
      return;
    }
    const permission = await Notification.requestPermission();
    setNotificationStatus(permission);

    if (permission === 'granted') {
      new Notification('StudyPulse Reminder Active 🚀', {
        body: `Today's target: ${todaySchedule?.allocatedHours || 2} hours on ${plan.courseName}. Exam in ${stats.daysUntilExam} days!`,
        icon: '/favicon.ico'
      });
    }
  };

  const savePrefs = (newPrefs: typeof prefs) => {
    setPrefs(newPrefs);
    onUpdatePreferences(newPrefs);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      {/* Title Header Card */}
      <div className="bg-white border-2 border-slate-200 rounded-[2rem] p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider text-emerald-600">
              Student Dispatch Center
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Daily WhatsApp & Email Reminders
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Automated morning briefings, daily agenda dispatches, and evening check-ins to build compounding study consistency.
          </p>
        </div>

        <button
          onClick={generateReminderContent}
          disabled={isGeneratingAi}
          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition shadow-xs"
        >
          <Sparkles className={`w-3.5 h-3.5 text-indigo-600 ${isGeneratingAi ? 'animate-spin' : ''}`} />
          <span>{isGeneratingAi ? 'Generating...' : 'Regenerate AI Dispatch'}</span>
        </button>
      </div>

      {/* Main 2-Column Bento Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: WhatsApp Live Phone Preview Bento Card */}
        <div className="bg-white border-2 border-slate-200 rounded-[2rem] p-6 sm:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-slate-900">
                  Live WhatsApp Dispatch Preview
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                {prefs.morningTime} Daily
              </span>
            </div>

            {/* Smartphone Shell Mockup */}
            <div className="my-6 max-w-sm mx-auto w-full bg-slate-900 border-4 border-slate-700 rounded-[2.5rem] p-3.5 shadow-xl relative text-slate-100">
              {/* Phone Top Notch */}
              <div className="w-24 h-3.5 bg-slate-800 rounded-b-xl mx-auto mb-3" />

              {/* Chat Header */}
              <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-800 mb-3 px-1">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white text-xs font-black">
                  SP
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    <span>StudyPulse Bot</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-[10px] text-emerald-400 font-mono">online • Daily Study Assistant</div>
                </div>
              </div>

              {/* WhatsApp Chat Bubble */}
              <div className="bg-emerald-950/90 border border-emerald-500/40 rounded-2xl rounded-tl-none p-3.5 text-xs text-slate-100 shadow-md font-sans leading-relaxed whitespace-pre-wrap">
                {waMessage}
                <div className="text-right text-[10px] text-emerald-300 mt-2 font-mono font-semibold">
                  {prefs.morningTime} ✓✓
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons for WhatsApp */}
          <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
            <button
              onClick={handleSendWhatsApp}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-lg shadow-emerald-200"
            >
              <Send className="w-4 h-4" />
              <span>Send via WhatsApp</span>
            </button>
            <button
              onClick={handleCopy}
              className="p-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 transition"
              title="Copy message to clipboard"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Right Column: Email Preview & Preferences Bento Cards */}
        <div className="space-y-6">
          {/* Email Preview Bento Card */}
          <div className="bg-white border-2 border-slate-200 rounded-[2rem] p-6 sm:p-7 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-black text-slate-900">
                  Daily Morning Email Briefing
                </h3>
              </div>
              <button
                onClick={handleSendEmail}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Open in Mail</span>
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-500 block mb-1 font-medium">Subject Line:</span>
                <span className="text-slate-900 font-bold">{emailSubject}</span>
              </div>

              {actionTip && (
                <div className="bg-indigo-50/80 border border-indigo-200 p-3.5 rounded-xl text-xs text-indigo-900 font-medium leading-relaxed">
                  <span className="font-bold text-indigo-700 mr-1.5">💡 Cognitive Tip:</span>
                  {actionTip}
                </div>
              )}
            </div>
          </div>

          {/* Delivery Configuration & Notification Settings Bento Card */}
          <div className="bg-white border-2 border-slate-200 rounded-[2rem] p-6 sm:p-7 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-black text-slate-900">
                  Alert Schedule & Delivery
                </h3>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={prefs.enabled}
                  onChange={e => savePrefs({ ...prefs, enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              {/* WhatsApp Phone */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  WhatsApp Phone (with country code):
                </label>
                <input
                  type="text"
                  value={prefs.phoneNumber}
                  onChange={e => savePrefs({ ...prefs, phoneNumber: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 font-mono"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Email Address:
                </label>
                <input
                  type="email"
                  value={prefs.email}
                  onChange={e => savePrefs({ ...prefs, email: e.target.value })}
                  placeholder="student@university.edu"
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 font-mono"
                />
              </div>

              {/* Morning Dispatch Time */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  Morning Briefing:
                </label>
                <input
                  type="time"
                  value={prefs.morningTime}
                  onChange={e => savePrefs({ ...prefs, morningTime: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 font-mono font-bold"
                />
              </div>

              {/* Evening Check-in Time */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  Evening Check-in:
                </label>
                <input
                  type="time"
                  value={prefs.eveningTime}
                  onChange={e => savePrefs({ ...prefs, eveningTime: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 font-mono font-bold"
                />
              </div>
            </div>

            {/* Browser Push & Calendar Export */}
            <div className="pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={handleRequestBrowserNotification}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 hover:bg-slate-200 transition"
              >
                <Bell className="w-3.5 h-3.5 text-indigo-600" />
                <span>Test Desktop Push Alert</span>
              </button>

              <button
                onClick={() => downloadICSFile(plan)}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Sync with Google / Apple Calendar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
