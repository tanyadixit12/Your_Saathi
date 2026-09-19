import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Mic,
  FileText,
  ShieldCheck,
  PhoneCall,
  X,
  HeartHandshake,
  AlertTriangle,
} from 'lucide-react';

export const HelpModal: React.FC = () => {
  const {
    isHelpModalOpen,
    setIsHelpModalOpen,
    setCurrentView,
    setIsVoiceAssistantOpen,
    trustedContacts,
    t,
  } = useApp();

  const primaryContact = trustedContacts[0];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isHelpModalOpen) {
        setIsHelpModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHelpModalOpen, setIsHelpModalOpen]);

  if (!isHelpModalOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-white dark:bg-stone-900 border-4 border-amber-500 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-8 h-8" />
            </div>
            <div>
              <h2 id="help-modal-title" className="text-2xl sm:text-3xl font-black text-stone-950 dark:text-white">
                {t.iNeedHelp}
              </h2>
              <p className="text-base font-bold text-stone-600 dark:text-stone-400">
                What can we do for you right now?
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsHelpModalOpen(false)}
            className="p-2 rounded-xl text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-white focus-visible:ring-4 ring-amber-500"
            aria-label="Close help options"
          >
            <X className="w-7 h-7" />
          </button>
        </div>

        {/* 4 Large Senior-Friendly Assistance Buttons */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          {/* Option 1: Talk to Aasra */}
          <button
            onClick={() => {
              setIsHelpModalOpen(false);
              setIsVoiceAssistantOpen(true);
            }}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xl transition-all shadow-md active:scale-98 min-h-[64px] border-2 border-amber-600 text-left focus-visible:ring-4 ring-amber-400"
          >
            <div className="w-12 h-12 rounded-xl bg-white/30 flex items-center justify-center shrink-0">
              <Mic className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <div>{t.talkToAasra}</div>
              <div className="text-sm font-bold opacity-80">Ask by voice: "What medicines do I have today?"</div>
            </div>
          </button>

          {/* Option 2: Understand Something */}
          <button
            onClick={() => {
              setIsHelpModalOpen(false);
              setCurrentView('understand');
            }}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border-2 border-blue-300 dark:border-blue-800 hover:bg-blue-100 text-stone-900 dark:text-stone-100 font-bold text-lg transition-colors min-h-[64px] text-left focus-visible:ring-4 ring-blue-500"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
              <FileText className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <div className="font-extrabold text-blue-900 dark:text-blue-200">{t.helpMeUnderstand}</div>
              <div className="text-sm font-medium text-stone-600 dark:text-stone-400">
                Simplify a bill, hospital note, or government letter
              </div>
            </div>
          </button>

          {/* Option 3: Check a Suspicious Message */}
          <button
            onClick={() => {
              setIsHelpModalOpen(false);
              setCurrentView('safety');
            }}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-300 dark:border-rose-800 hover:bg-rose-100 text-stone-900 dark:text-stone-100 font-bold text-lg transition-colors min-h-[64px] text-left focus-visible:ring-4 ring-rose-500"
          >
            <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <div className="font-extrabold text-rose-900 dark:text-rose-200">{t.checkAMessage}</div>
              <div className="text-sm font-medium text-stone-600 dark:text-stone-400">
                Check if an SMS, WhatsApp message, or link is safe
              </div>
            </div>
          </button>

          {/* Option 4: Call Trusted Contact */}
          {primaryContact ? (
            <a
              href={`tel:${primaryContact.phone}`}
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 text-stone-900 dark:text-stone-100 font-bold text-lg transition-colors min-h-[64px] text-left focus-visible:ring-4 ring-emerald-500"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                <PhoneCall className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <div className="font-extrabold text-emerald-900 dark:text-emerald-200">
                  Call {primaryContact.name} ({primaryContact.relationship})
                </div>
                <div className="text-sm font-semibold text-stone-600 dark:text-stone-400">
                  Dial {primaryContact.phone}
                </div>
              </div>
            </a>
          ) : (
            <button
              onClick={() => {
                setIsHelpModalOpen(false);
                setCurrentView('contacts');
              }}
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-stone-100 dark:bg-stone-800 font-bold text-lg min-h-[64px]"
            >
              <PhoneCall className="w-6 h-6" />
              <span>Add a Trusted Contact</span>
            </button>
          )}
        </div>

        {/* Emergency notice */}
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl p-3 flex items-start gap-3 text-xs sm:text-sm font-semibold text-amber-900 dark:text-amber-200">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
          <span>{t.emergencyNotice}</span>
        </div>
      </div>
    </div>
  );
};
