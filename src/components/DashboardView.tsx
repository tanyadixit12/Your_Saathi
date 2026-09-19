import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Pill,
  Calendar,
  CheckSquare,
  ShieldCheck,
  FileQuestion,
  Mic,
  Volume2,
  CheckCircle2,
  Clock,
  MapPin,
  PlusCircle,
  RefreshCw,
  PhoneCall,
  Sparkles,
  ArrowRight,
  Bell,
  X,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    user,
    medicines,
    appointments,
    tasks,
    trustedContacts,
    dailyBriefing,
    loadingBriefing,
    fetchDailyBriefing,
    markMedicineStatus,
    toggleAppointment,
    toggleTask,
    setCurrentView,
    setIsVoiceAssistantOpen,
    speakText,
    actionMessage,
    dismissProactiveSuggestion,
    confirmProactiveSuggestion,
    language,
    t,
  } = useApp();

  const locale = language === 'hi' ? 'hi-IN' : 'en-US';
  const todayStr = new Date().toLocaleDateString(locale, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const pendingMedicines = medicines.filter((m) => m.status === 'pending');
  const upcomingMedicine = pendingMedicines[0] || medicines[0];
  const upcomingAppointment = appointments.find((a) => !a.completed) || appointments[0];
  const pendingTasks = tasks.filter((t) => !t.completed);
  const primaryTask = pendingTasks[0] || tasks[0];
  const trustedContact = trustedContacts[0] || { name: 'Rahul Sharma', relationship: 'Son', phone: '+1-555-0199' };

  const suggestion = dailyBriefing?.proactiveSuggestion;
  const showSuggestionBanner = suggestion && !suggestion.dismissed && !suggestion.confirmed;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Toast Notice Banner if any action occurred */}
      {actionMessage && (
        <div
          role="status"
          aria-live="polite"
          className="p-4 rounded-2xl bg-emerald-600 text-white font-extrabold text-lg flex items-center gap-3 shadow-lg animate-fade-in"
        >
          <CheckCircle2 className="w-7 h-7 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* TODAY HEADER */}
      <section className="bg-white dark:bg-stone-900 border-3 border-amber-300 dark:border-stone-700 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-amber-200 dark:border-stone-800 pb-6 mb-6">
          <div>
            <span className="text-base sm:text-lg font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 block mb-1">
              {todayStr}
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-stone-950 dark:text-white">
              {t.goodMorning}, {user?.name?.toUpperCase() || 'ANITA'}
            </h1>
            <p className="text-xl sm:text-2xl font-bold text-stone-700 dark:text-stone-300 mt-1">
              {t.whatMattersToday}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsVoiceAssistantOpen(true)}
              className="flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xl shadow-lg transition-transform active:scale-95 border-2 border-emerald-700 focus-visible:ring-4 ring-emerald-400 min-h-[56px]"
              aria-label={`Talk to ${t.appName} Voice Assistant`}
            >
              <Mic className="w-7 h-7" />
              <span>{t.talkToAasra}</span>
            </button>
          </div>
        </div>

        {/* AI PROACTIVE SUGGESTION BANNER */}
        {showSuggestionBanner && (
          <div className="mb-6 bg-gradient-to-r from-amber-100 to-amber-50 dark:from-amber-950/60 dark:to-stone-800 border-2 border-amber-400 dark:border-amber-600 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">
                      Aasra Proactive Care Suggestion
                    </span>
                  </div>
                  <p className="text-lg sm:text-xl font-black text-stone-900 dark:text-white mt-1">
                    {suggestion.promptText}
                  </p>
                  <p className="text-sm font-semibold text-stone-600 dark:text-stone-300 mt-0.5">
                    {suggestion.detail}
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <button
                      onClick={confirmProactiveSuggestion}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-sm transition-colors focus-visible:ring-2 ring-amber-500"
                    >
                      {suggestion.actionLabel || (suggestion.actionType === 'appointment_reminder'
                        ? 'Set Reminder'
                        : "I'll Do This Now")}
                    </button>
                    <button
                      onClick={dismissProactiveSuggestion}
                      className="px-3 py-2 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-amber-200/50 dark:hover:bg-stone-700 font-bold text-sm"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={dismissProactiveSuggestion}
                className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1"
                aria-label="Dismiss suggestion"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* AI DAILY BRIEFING */}
        <div className="bg-amber-50 dark:bg-stone-800/80 border-2 border-amber-300 dark:border-amber-600/60 rounded-2xl p-6 relative">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-extrabold text-lg">
              <Sparkles className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              <span>{t.appName}'s Daily Briefing</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (dailyBriefing) {
                    speakText(`${dailyBriefing.greeting}. ${dailyBriefing.summary}. ${dailyBriefing.closingMessage}`);
                  }
                }}
                disabled={loadingBriefing}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-base shadow-sm transition-colors focus-visible:ring-2 ring-amber-500 min-h-[44px]"
                aria-label={t.listen}
              >
                <Volume2 className="w-5 h-5" />
                <span>{t.listen}</span>
              </button>

              <button
                onClick={() => fetchDailyBriefing(true)}
                disabled={loadingBriefing}
                className="p-2.5 rounded-xl bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 hover:bg-stone-100 text-stone-700 dark:text-stone-200 min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 ring-amber-500"
                aria-label={t.refresh}
                title={t.refresh}
              >
                <RefreshCw className={`w-5 h-5 ${loadingBriefing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {loadingBriefing ? (
            <p className="text-xl font-bold text-stone-600 dark:text-stone-300 animate-pulse">
              Preparing your morning briefing...
            </p>
          ) : dailyBriefing ? (
            <div className="space-y-3">
              <p className="text-2xl font-bold text-stone-900 dark:text-white leading-relaxed">
                "{dailyBriefing.summary}"
              </p>

              {dailyBriefing.highlights && dailyBriefing.highlights.length > 0 && (
                <ul className="space-y-1.5 pt-2 text-lg font-bold text-stone-800 dark:text-stone-200">
                  {dailyBriefing.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400 mt-1">•</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              )}

              <p className="text-base font-semibold text-stone-600 dark:text-stone-400 pt-1 italic">
                {dailyBriefing.closingMessage}
              </p>
            </div>
          ) : (
            <p className="text-xl font-bold text-stone-800 dark:text-stone-200">
              Good morning! You have {pendingMedicines.length} pending medicines and {appointments.length} appointments today.
            </p>
          )}
        </div>
      </section>

      {/* THE 5 CORE ACTION CARDS GRID */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6" aria-label="What to do today">
        {/* CARD 1: MEDICINES */}
        <article className="bg-white dark:bg-stone-900 border-3 border-stone-300 dark:border-stone-700 hover:border-amber-500 rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
                  <Pill className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-stone-950 dark:text-white">
                    1. {t.medicines}
                  </h2>
                  <span className="text-base font-bold text-stone-600 dark:text-stone-400">
                    {pendingMedicines.length} medicine{pendingMedicines.length === 1 ? '' : 's'} left to take
                  </span>
                </div>
              </div>

              <span
                className={`px-3 py-1.5 rounded-full text-sm font-extrabold ${
                  upcomingMedicine?.status === 'taken'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                {upcomingMedicine?.status === 'taken' ? '✓ Taken' : 'Due Today'}
              </span>
            </div>

            {upcomingMedicine ? (
              <div className="bg-stone-50 dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 rounded-2xl p-4 my-2">
                <div className="text-xl font-black text-stone-900 dark:text-white">
                  {upcomingMedicine.name} ({upcomingMedicine.dosage})
                </div>
                <div className="text-base font-bold text-stone-700 dark:text-stone-300 flex items-center gap-2 mt-1">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <span>{upcomingMedicine.time} — {upcomingMedicine.frequency}</span>
                </div>
                {upcomingMedicine.instructions && (
                  <p className="text-sm font-semibold text-stone-600 dark:text-stone-400 mt-2 bg-white dark:bg-stone-900 p-2 rounded-lg border border-stone-200 dark:border-stone-700">
                    💡 {upcomingMedicine.instructions}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-lg font-bold text-stone-600 py-4">No medicines scheduled for today.</p>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-800 flex flex-wrap gap-3 items-center justify-between">
            {upcomingMedicine && upcomingMedicine.status !== 'taken' && (
              <button
                onClick={() => markMedicineStatus(upcomingMedicine.id, 'taken')}
                className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg shadow-sm transition-transform active:scale-95 focus-visible:ring-4 ring-emerald-400 min-h-[48px]"
              >
                {t.markAsTaken}
              </button>
            )}
            <button
              onClick={() => setCurrentView('medicines')}
              className="text-amber-700 dark:text-amber-400 hover:underline font-extrabold text-base flex items-center gap-1 min-h-[48px] focus-visible:ring-2 ring-amber-500"
            >
              <span>View all medicines ({medicines.length})</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </article>

        {/* CARD 2: APPOINTMENTS */}
        <article className="bg-white dark:bg-stone-900 border-3 border-stone-300 dark:border-stone-700 hover:border-amber-500 rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 flex items-center justify-center">
                  <Calendar className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-stone-950 dark:text-white">
                    2. {t.schedule}
                  </h2>
                  <span className="text-base font-bold text-stone-600 dark:text-stone-400">
                    Next visit scheduled
                  </span>
                </div>
              </div>

              {upcomingAppointment && (
                <span
                  className={`px-3 py-1.5 rounded-full text-sm font-extrabold ${
                    upcomingAppointment.completed
                      ? 'bg-stone-100 text-stone-700'
                      : 'bg-blue-100 text-blue-800 border border-blue-300'
                  }`}
                >
                  {upcomingAppointment.completed ? 'Completed' : 'Upcoming'}
                </span>
              )}
            </div>

            {upcomingAppointment ? (
              <div className="bg-stone-50 dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 rounded-2xl p-4 my-2">
                <div className="text-xl font-black text-stone-900 dark:text-white">
                  {upcomingAppointment.title}
                </div>
                <div className="text-base font-bold text-stone-700 dark:text-stone-300 flex items-center gap-2 mt-1">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span>{upcomingAppointment.dateTime}</span>
                </div>
                <div className="text-base font-bold text-stone-700 dark:text-stone-300 flex items-center gap-2 mt-1">
                  <MapPin className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>{upcomingAppointment.location}</span>
                </div>

                {upcomingAppointment.preparationChecklist && upcomingAppointment.preparationChecklist.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-stone-200 dark:border-stone-700">
                    <span className="text-xs font-black uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-1">
                      Preparation Checklist:
                    </span>
                    <ul className="text-sm font-bold text-stone-800 dark:text-stone-200 space-y-1">
                      {upcomingAppointment.preparationChecklist.slice(0, 2).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-blue-600 font-black">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-lg font-bold text-stone-600 py-4">No appointments scheduled.</p>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-800 flex flex-wrap gap-3 items-center justify-between">
            {upcomingAppointment && (
              <button
                onClick={() => toggleAppointment(upcomingAppointment.id)}
                className="px-5 py-3 rounded-xl bg-stone-200 hover:bg-stone-300 dark:bg-stone-700 dark:hover:bg-stone-600 text-stone-900 dark:text-white font-bold text-base transition-colors focus-visible:ring-2 ring-stone-400 min-h-[48px]"
              >
                {upcomingAppointment.completed ? 'Mark Upcoming' : 'Mark Completed'}
              </button>
            )}
            <button
              onClick={() => setCurrentView('appointments')}
              className="text-amber-700 dark:text-amber-400 hover:underline font-extrabold text-base flex items-center gap-1 min-h-[48px] focus-visible:ring-2 ring-amber-500"
            >
              <span>Manage schedule</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </article>

        {/* CARD 3: THINGS TO DO (TASKS) */}
        <article className="bg-white dark:bg-stone-900 border-3 border-stone-300 dark:border-stone-700 hover:border-amber-500 rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center justify-center">
                  <CheckSquare className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-stone-950 dark:text-white">
                    3. Things to Do
                  </h2>
                  <span className="text-base font-bold text-stone-600 dark:text-stone-400">
                    {pendingTasks.length} pending task{pendingTasks.length === 1 ? '' : 's'}
                  </span>
                </div>
              </div>

              {primaryTask && (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                    primaryTask.priority === 'high'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-stone-100 text-stone-800'
                  }`}
                >
                  {primaryTask.priority} priority
                </span>
              )}
            </div>

            {primaryTask ? (
              <div className="bg-stone-50 dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 rounded-2xl p-4 my-2">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-black text-stone-900 dark:text-white">
                    {primaryTask.title}
                  </span>
                  <button
                    onClick={() => toggleTask(primaryTask.id)}
                    className="p-2 rounded-lg text-emerald-700 hover:bg-emerald-50 border border-emerald-300 font-bold text-sm flex items-center gap-1 focus-visible:ring-2 ring-emerald-500"
                    aria-label={`Mark task ${primaryTask.title} as ${primaryTask.completed ? 'incomplete' : 'complete'}`}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{primaryTask.completed ? 'Done' : 'Mark Done'}</span>
                  </button>
                </div>
                <div className="text-base font-bold text-stone-600 dark:text-stone-400 mt-2">
                  Due: <span className="text-stone-900 dark:text-stone-200">{primaryTask.dueDate}</span>
                </div>
              </div>
            ) : (
              <p className="text-lg font-bold text-stone-600 py-4">All tasks are finished! Great work.</p>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-800 flex justify-end">
            <button
              onClick={() => setCurrentView('appointments')}
              className="text-amber-700 dark:text-amber-400 hover:underline font-extrabold text-base flex items-center gap-1 min-h-[48px] focus-visible:ring-2 ring-amber-500"
            >
              <span>View all tasks ({tasks.length})</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </article>

        {/* CARD 4: STAY SAFE */}
        <article className="bg-white dark:bg-stone-900 border-3 border-stone-300 dark:border-stone-700 hover:border-amber-500 rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-stone-950 dark:text-white">
                    4. {t.staySafe}
                  </h2>
                  <span className="text-base font-bold text-stone-600 dark:text-stone-400">
                    Scam & Message Guard
                  </span>
                </div>
              </div>

              <span className="px-3 py-1.5 rounded-full text-sm font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                Active Guard
              </span>
            </div>

            <div className="bg-stone-50 dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 rounded-2xl p-4 my-2">
              <p className="text-lg font-bold text-stone-800 dark:text-stone-200 leading-relaxed">
                "No suspicious messages detected today. If someone texts or calls asking for an OTP, never share it."
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-800 flex justify-between items-center">
            <button
              onClick={() => setCurrentView('safety')}
              className="px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-base shadow-sm focus-visible:ring-4 ring-rose-400 min-h-[48px]"
            >
              {t.checkAMessage}
            </button>
            <button
              onClick={() => setCurrentView('safety')}
              className="text-amber-700 dark:text-amber-400 hover:underline font-extrabold text-base flex items-center gap-1 min-h-[48px] focus-visible:ring-2 ring-amber-500"
            >
              <span>Safety guidance</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </article>

        {/* CARD 5: UNDERSTAND SOMETHING */}
        <article className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-3xl p-7 sm:p-8 shadow-md flex flex-col justify-between md:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-amber-700/80 px-3.5 py-1.5 rounded-full text-sm font-black mb-3">
                <FileQuestion className="w-5 h-5" />
                <span>5. {t.helpMeUnderstand}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-3 leading-tight">
                Confused by a bill, letter, or bank message?
              </h2>
              <p className="text-xl font-bold text-amber-100 leading-relaxed">
                Aasra turns complex documents and notices into plain-language answers: What is this? What do I need to do? When?
              </p>
            </div>

            <button
              onClick={() => setCurrentView('understand')}
              className="px-8 py-5 rounded-2xl bg-white text-amber-950 hover:bg-amber-100 font-black text-2xl shadow-xl transition-transform active:scale-95 whitespace-nowrap min-h-[64px] focus-visible:ring-4 ring-white"
            >
              {t.helpMeUnderstand}
            </button>
          </div>
        </article>
      </section>

      {/* QUICK ACTIONS ROW & TRUSTED CONTACT */}
      <section className="bg-stone-100 dark:bg-stone-900 border-2 border-stone-300 dark:border-stone-800 rounded-3xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h3 className="text-xl font-black text-stone-900 dark:text-white uppercase tracking-wider">
            Quick Actions
          </h3>
          <div className="flex items-center gap-2 text-base font-bold text-stone-700 dark:text-stone-300">
            <span>Family Contact:</span>
            <a
              href={`tel:${trustedContact.phone}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 text-white rounded-xl font-black hover:bg-emerald-700 transition-colors focus-visible:ring-4 ring-emerald-400 min-h-[44px]"
              aria-label={`Call ${trustedContact.name}`}
            >
              <PhoneCall className="w-5 h-5" />
              <span>Call {trustedContact.name} ({trustedContact.relationship})</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => setCurrentView('medicines')}
            className="p-4 rounded-2xl bg-white dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 hover:border-amber-500 font-bold text-stone-900 dark:text-white text-base flex flex-col items-center justify-center gap-2 min-h-[72px] focus-visible:ring-4 ring-amber-500"
          >
            <PlusCircle className="w-6 h-6 text-emerald-600" />
            <span>Add Medicine</span>
          </button>

          <button
            onClick={() => setCurrentView('appointments')}
            className="p-4 rounded-2xl bg-white dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 hover:border-amber-500 font-bold text-stone-900 dark:text-white text-base flex flex-col items-center justify-center gap-2 min-h-[72px] focus-visible:ring-4 ring-amber-500"
          >
            <Calendar className="w-6 h-6 text-blue-600" />
            <span>Add Appointment</span>
          </button>

          <button
            onClick={() => setCurrentView('understand')}
            className="p-4 rounded-2xl bg-white dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 hover:border-amber-500 font-bold text-stone-900 dark:text-white text-base flex flex-col items-center justify-center gap-2 min-h-[72px] focus-visible:ring-4 ring-amber-500"
          >
            <FileQuestion className="w-6 h-6 text-amber-600" />
            <span>Understand Document</span>
          </button>

          <button
            onClick={() => setCurrentView('safety')}
            className="p-4 rounded-2xl bg-white dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 hover:border-amber-500 font-bold text-stone-900 dark:text-white text-base flex flex-col items-center justify-center gap-2 min-h-[72px] focus-visible:ring-4 ring-amber-500"
          >
            <ShieldCheck className="w-6 h-6 text-rose-600" />
            <span>Check a Message</span>
          </button>
        </div>
      </section>
    </div>
  );
};
