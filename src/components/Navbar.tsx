import React from 'react';
import { useApp } from '../context/AppContext';
import { AppView, FontSizePreference, LanguagePreference } from '../types';
import {
  Home,
  Pill,
  Calendar,
  FileQuestion,
  ShieldCheck,
  Phone,
  Settings,
  Mic,
  Sun,
  Moon,
  VolumeX,
  HeartHandshake,
  Globe,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    preferences,
    updatePreferences,
    language,
    setLanguage,
    t,
    setIsVoiceAssistantOpen,
    setIsHelpModalOpen,
    isSpeaking,
    stopSpeaking,
  } = useApp();

  const navItems: { id: AppView; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: t.myDay, icon: <Home className="w-6 h-6" aria-hidden="true" /> },
    { id: 'medicines', label: t.medicines, icon: <Pill className="w-6 h-6" aria-hidden="true" /> },
    { id: 'appointments', label: t.schedule, icon: <Calendar className="w-6 h-6" aria-hidden="true" /> },
    { id: 'understand', label: t.understand, icon: <FileQuestion className="w-6 h-6" aria-hidden="true" /> },
    { id: 'safety', label: t.staySafe, icon: <ShieldCheck className="w-6 h-6" aria-hidden="true" /> },
    { id: 'contacts', label: t.contacts, icon: <Phone className="w-6 h-6" aria-hidden="true" /> },
    { id: 'settings', label: t.settings, icon: <Settings className="w-6 h-6" aria-hidden="true" /> },
  ];

  const handleFontChange = (size: FontSizePreference) => {
    updatePreferences({ fontSize: size });
  };

  const toggleContrast = () => {
    updatePreferences({
      highContrast: preferences.highContrast === 'high-contrast' ? 'standard' : 'high-contrast',
    });
  };

  return (
    <header className="sticky top-0 z-30 bg-amber-50 border-b-2 border-amber-200 text-stone-900 shadow-sm transition-colors dark:bg-stone-950 dark:border-stone-800 dark:text-white">
      {/* Top Banner / Accessibility & Assistance Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 border-b border-amber-200/60 dark:border-stone-800">
        {/* Brand Logo & Tagline */}
        <button
          onClick={() => setCurrentView('landing')}
          className="flex items-center gap-2 group text-left focus-visible:ring-4 ring-amber-500 rounded-lg py-1 px-2 -ml-2"
          aria-label="Go to Aasra Home page"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center font-black text-xl shadow-sm">
            A
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight block leading-tight text-amber-950 dark:text-amber-100">
              {t.appName}
            </span>
            <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block">
              {t.appTagline}
            </span>
          </div>
        </button>

        {/* Global Quick Controls & Assistance Actions */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          {/* Audio Speaking Indicator & Stop Button */}
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 text-sm font-bold animate-pulse focus-visible:ring-4 ring-rose-500"
              aria-label="Stop reading aloud"
            >
              <VolumeX className="w-4 h-4" />
              <span>Stop Speaking</span>
            </button>
          )}

          {/* Multilingual Language Switcher */}
          <div
            className="flex items-center bg-amber-100 dark:bg-stone-800 rounded-xl p-1 border border-amber-300 dark:border-stone-700"
            role="group"
            aria-label="Language selection"
          >
            <Globe className="w-4 h-4 text-stone-600 dark:text-stone-300 mx-1 hidden sm:inline" />
            {(
              [
                { code: 'en', label: 'English' },
                { code: 'hi', label: 'हिंदी' },
                { code: 'hinglish', label: 'Hinglish' },
              ] as { code: LanguagePreference; label: string }[]
            ).map((lang) => {
              const isActive = language === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`px-2.5 py-1 text-xs sm:text-sm font-bold rounded-lg transition-colors min-h-[34px] focus-visible:ring-2 ring-amber-500 ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-sm font-extrabold'
                      : 'text-stone-700 dark:text-stone-300 hover:bg-amber-200 dark:hover:bg-stone-700'
                  }`}
                  aria-pressed={isActive}
                  aria-label={`Select ${lang.label}`}
                >
                  {lang.label}
                </button>
              );
            })}
          </div>

          {/* Text Size Switcher */}
          <div
            className="flex items-center bg-amber-100 dark:bg-stone-800 rounded-xl p-1 border border-amber-300 dark:border-stone-700"
            role="group"
            aria-label="Text Size Controls"
          >
            <span className="text-xs font-bold px-1.5 text-stone-700 dark:text-stone-300 hidden lg:inline">
              Text:
            </span>
            {(['normal', 'large', 'extra-large'] as FontSizePreference[]).map((size) => {
              const label = size === 'normal' ? 'A' : size === 'large' ? 'A+' : 'A++';
              const fullLabel = size === 'normal' ? 'Normal' : size === 'large' ? 'Large' : 'Extra Large';
              const isActive = preferences.fontSize === size;
              return (
                <button
                  key={size}
                  onClick={() => handleFontChange(size)}
                  className={`px-2.5 py-1 text-sm font-black rounded-lg transition-colors min-h-[34px] focus-visible:ring-2 ring-amber-500 ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-stone-700 dark:text-stone-200 hover:bg-amber-200 dark:hover:bg-stone-700'
                  }`}
                  aria-pressed={isActive}
                  aria-label={`Set text size to ${fullLabel}`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* High Contrast Mode Toggle */}
          <button
            onClick={toggleContrast}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-bold min-h-[40px] transition-colors focus-visible:ring-4 ring-amber-500 ${
              preferences.highContrast === 'high-contrast'
                ? 'bg-yellow-400 text-black border-black ring-2 ring-yellow-300 font-extrabold'
                : 'bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-stone-800 dark:text-white hover:bg-stone-100'
            }`}
            aria-pressed={preferences.highContrast === 'high-contrast'}
            aria-label="Toggle High Contrast Mode"
          >
            {preferences.highContrast === 'high-contrast' ? (
              <>
                <Sun className="w-4 h-4 text-black" />
                <span>Contrast: ON</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-stone-600 dark:text-stone-300" />
                <span className="hidden sm:inline">Contrast</span>
              </>
            )}
          </button>

          {/* Senior High-Priority "I NEED HELP" Button */}
          <button
            onClick={() => setIsHelpModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm sm:text-base shadow-md transition-all active:scale-95 border-2 border-rose-700 min-h-[44px] focus-visible:ring-4 ring-rose-400"
            aria-label={t.iNeedHelp}
          >
            <HeartHandshake className="w-5 h-5" />
            <span className="whitespace-nowrap">{t.iNeedHelp}</span>
          </button>

          {/* Global Talk to Aasra Voice Button */}
          <button
            onClick={() => setIsVoiceAssistantOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm sm:text-base shadow-md transition-transform active:scale-95 border-2 border-emerald-700 min-h-[44px] focus-visible:ring-4 ring-emerald-400"
            aria-label={`Open voice assistant: ${t.talkToAasra}`}
          >
            <Mic className="w-5 h-5 animate-pulse" aria-hidden="true" />
            <span className="hidden sm:inline">{t.talkToAasra}</span>
            <span className="sm:hidden">{t.listen}</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Row (Desktop/Tablet) */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 hidden md:flex items-center justify-between overflow-x-auto py-2">
        <ul className="flex items-center gap-2" role="menubar">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <li key={item.id} role="none">
                <button
                  role="menuitem"
                  onClick={() => setCurrentView(item.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-base transition-colors min-h-[48px] focus-visible:ring-4 ring-amber-500 ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-stone-800 dark:text-stone-200 hover:bg-amber-100 dark:hover:bg-stone-800'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <button
          onClick={() => setCurrentView('landing')}
          className="text-stone-600 dark:text-stone-400 font-bold hover:underline text-sm px-2 py-1"
        >
          About Aasra
        </button>
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-amber-50 dark:bg-stone-950 border-t-2 border-amber-300 dark:border-stone-800 px-2 py-2 flex items-center justify-around shadow-lg">
        {navItems.slice(0, 4).map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-bold min-h-[48px] min-w-[54px] focus-visible:ring-2 ring-amber-500 ${
                isActive
                  ? 'text-amber-800 dark:text-amber-300 font-black'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
            >
              {item.icon}
              <span className="mt-1">{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => setIsHelpModalOpen(true)}
          className="flex flex-col items-center justify-center p-2 rounded-xl text-xs font-black text-rose-700 dark:text-rose-400 min-h-[48px] min-w-[54px]"
          aria-label={t.iNeedHelp}
        >
          <HeartHandshake className="w-6 h-6" />
          <span className="mt-1">{t.iNeedHelp}</span>
        </button>
      </div>
    </header>
  );
};
