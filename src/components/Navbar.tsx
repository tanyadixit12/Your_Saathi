import React from 'react';
import { useApp } from '../context/AppContext';
import { AppView, FontSizePreference } from '../types';
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
  Volume2,
  VolumeX,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    preferences,
    updatePreferences,
    setIsVoiceAssistantOpen,
    isSpeaking,
    stopSpeaking,
  } = useApp();

  const navItems: { id: AppView; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'My Day', icon: <Home className="w-6 h-6" aria-hidden="true" /> },
    { id: 'medicines', label: 'Medicines', icon: <Pill className="w-6 h-6" aria-hidden="true" /> },
    { id: 'appointments', label: 'Schedule', icon: <Calendar className="w-6 h-6" aria-hidden="true" /> },
    { id: 'understand', label: 'Understand', icon: <FileQuestion className="w-6 h-6" aria-hidden="true" /> },
    { id: 'safety', label: 'Stay Safe', icon: <ShieldCheck className="w-6 h-6" aria-hidden="true" /> },
    { id: 'contacts', label: 'Contacts', icon: <Phone className="w-6 h-6" aria-hidden="true" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-6 h-6" aria-hidden="true" /> },
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
      {/* Top Banner / Accessibility Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 border-b border-amber-200/60 dark:border-stone-800">
        <button
          onClick={() => setCurrentView('landing')}
          className="flex items-center gap-2 group text-left focus-visible:ring-2 rounded-lg py-1 px-2 -ml-2"
          aria-label="Go to Saathi Home page"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-xl shadow-sm">
            S
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight block leading-tight text-amber-950 dark:text-amber-100">
              Saathi
            </span>
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 block">
              Simple Daily Companion
            </span>
          </div>
        </button>

        {/* Global Quick Accessibility Controls */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-4">
          {/* Audio Speaking Indicator & Stop Button */}
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 text-sm font-bold animate-pulse"
              aria-label="Stop reading aloud"
            >
              <VolumeX className="w-4 h-4" />
              <span>Stop Speaking</span>
            </button>
          )}

          {/* Text Size Switcher */}
          <div className="flex items-center bg-amber-100 dark:bg-stone-800 rounded-lg p-1 border border-amber-300 dark:border-stone-700" role="group" aria-label="Text Size Controls">
            <span className="text-xs font-bold px-1.5 text-stone-700 dark:text-stone-300 hidden md:inline">
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
                  className={`px-2.5 py-1 text-sm font-black rounded-md transition-colors min-h-[36px] ${
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-bold min-h-[40px] transition-colors ${
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
                <span>High Contrast: ON</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-stone-600 dark:text-stone-300" />
                <span>Contrast</span>
              </>
            )}
          </button>

          {/* Global Talk to Saathi Button */}
          <button
            onClick={() => setIsVoiceAssistantOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm sm:text-base shadow-md transition-transform active:scale-95 border-2 border-emerald-700 min-h-[44px]"
            aria-label="Open voice assistant: Talk to Saathi"
          >
            <Mic className="w-5 h-5 animate-pulse" aria-hidden="true" />
            <span>Talk to Saathi</span>
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
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-base transition-colors min-h-[48px] ${
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
          className="text-stone-600 dark:text-stone-400 font-semibold hover:underline text-sm px-2 py-1"
        >
          Product Info
        </button>
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-amber-50 dark:bg-stone-950 border-t-2 border-amber-300 dark:border-stone-800 px-2 py-2 flex items-center justify-around shadow-lg">
        {navItems.slice(0, 5).map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-bold min-h-[48px] min-w-[54px] ${
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
          onClick={() => setCurrentView('contacts')}
          className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-bold min-h-[48px] min-w-[54px] ${
            currentView === 'contacts'
              ? 'text-amber-800 dark:text-amber-300 font-black'
              : 'text-stone-600 dark:text-stone-400'
          }`}
          aria-label="Contacts"
        >
          <Phone className="w-6 h-6" />
          <span className="mt-1">Call</span>
        </button>
      </div>
    </header>
  );
};
