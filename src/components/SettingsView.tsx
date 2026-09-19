import React from 'react';
import { useApp } from '../context/AppContext';
import { FontSizePreference, ContrastPreference, MotionPreference } from '../types';
import {
  Settings,
  Type,
  Sun,
  Eye,
  Activity,
  User,
  RotateCcw,
  ArrowLeft,
  CheckCircle2,
  Volume2,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    user,
    preferences,
    updatePreferences,
    resetToDemo,
    setCurrentView,
    speakText,
    showActionNotice,
  } = useApp();

  const handleFontChange = (size: FontSizePreference) => {
    updatePreferences({ fontSize: size });
  };

  const handleContrastChange = (contrast: ContrastPreference) => {
    updatePreferences({ highContrast: contrast });
  };

  const handleMotionChange = (motion: MotionPreference) => {
    updatePreferences({ reducedMotion: motion });
  };

  const handleTestVoice = () => {
    speakText("Hello Anita! This is how Saathi sounds when reading out your daily schedule.");
  };

  const handleResetDemo = async () => {
    if (
      window.confirm(
        'Reset all data back to the Anita Sharma demo profile? This will restore initial medicines, appointments, and tasks.'
      )
    ) {
      await resetToDemo();
      showActionNotice('Demo profile restored for Anita Sharma.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-6">
        <div>
          <button
            onClick={() => setCurrentView('dashboard')}
            className="flex items-center gap-2 text-stone-600 dark:text-stone-400 font-bold mb-2 hover:underline"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to My Day</span>
          </button>
          <h1 className="text-3xl sm:text-5xl font-black text-stone-950 dark:text-white flex items-center gap-3">
            <Settings className="w-10 h-10 text-amber-600" />
            <span>Accessibility & Settings</span>
          </h1>
          <p className="text-lg sm:text-xl font-bold text-stone-600 dark:text-stone-400 mt-1">
            Customize text size, contrast, animations, and voice readability.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* 1. TEXT SIZE */}
        <section className="bg-white dark:bg-stone-900 border-3 border-stone-300 dark:border-stone-700 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-stone-800 text-amber-800 dark:text-amber-300 flex items-center justify-center">
              <Type className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-stone-950 dark:text-white">
                Text Size (Typography Scaling)
              </h2>
              <p className="text-base font-bold text-stone-600 dark:text-stone-400">
                Choose the size that is most comfortable for your eyes to read without strain.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {[
              { id: 'normal', label: 'Normal (18px)', desc: 'Standard comfortable size' },
              { id: 'large', label: 'Large (22px)', desc: 'Recommended for seniors' },
              { id: 'extra-large', label: 'Extra Large (26px)', desc: 'Maximum readability' },
            ].map((opt) => {
              const isSelected = preferences.fontSize === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleFontChange(opt.id as FontSizePreference)}
                  className={`p-5 rounded-2xl border-3 text-left transition-all min-h-[80px] ${
                    isSelected
                      ? 'bg-amber-100/70 dark:bg-stone-800 border-amber-600 shadow-md ring-2 ring-amber-500'
                      : 'border-stone-300 dark:border-stone-700 hover:border-amber-400 bg-stone-50 dark:bg-stone-800/50'
                  }`}
                  aria-pressed={isSelected}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-black text-stone-950 dark:text-white">
                      {opt.label}
                    </span>
                    {isSelected && <CheckCircle2 className="w-6 h-6 text-amber-600" />}
                  </div>
                  <p className="text-sm font-bold text-stone-600 dark:text-stone-400 mt-1">
                    {opt.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* 2. HIGH CONTRAST */}
        <section className="bg-white dark:bg-stone-900 border-3 border-stone-300 dark:border-stone-700 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-stone-800 text-blue-800 dark:text-blue-300 flex items-center justify-center">
              <Sun className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-stone-950 dark:text-white">
                Visual Contrast
              </h2>
              <p className="text-base font-bold text-stone-600 dark:text-stone-400">
                High contrast helps if you have reduced vision or cataracts.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {[
              {
                id: 'standard',
                title: 'Standard Warm Canvas',
                desc: 'Soothing warm light neutral palette with crisp dark charcoal typography.',
              },
              {
                id: 'high-contrast',
                title: 'High Contrast Mode',
                desc: 'Pure dark background with vibrant yellow focus rings and maximum black/white contrast (WCAG AAA).',
              },
            ].map((opt) => {
              const isSelected = preferences.highContrast === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleContrastChange(opt.id as ContrastPreference)}
                  className={`p-5 rounded-2xl border-3 text-left transition-all min-h-[80px] ${
                    isSelected
                      ? 'bg-amber-100/70 dark:bg-stone-800 border-amber-600 shadow-md ring-2 ring-amber-500'
                      : 'border-stone-300 dark:border-stone-700 hover:border-amber-400 bg-stone-50 dark:bg-stone-800/50'
                  }`}
                  aria-pressed={isSelected}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-black text-stone-950 dark:text-white">
                      {opt.title}
                    </span>
                    {isSelected && <CheckCircle2 className="w-6 h-6 text-amber-600" />}
                  </div>
                  <p className="text-sm font-bold text-stone-600 dark:text-stone-400 mt-1">
                    {opt.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* 3. REDUCED MOTION */}
        <section className="bg-white dark:bg-stone-900 border-3 border-stone-300 dark:border-stone-700 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-stone-800 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
              <Activity className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-stone-950 dark:text-white">
                Motion & Animations
              </h2>
              <p className="text-base font-bold text-stone-600 dark:text-stone-400">
                Disable animations if movement causes dizziness or vestibular sensitivity.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {[
              {
                id: 'normal',
                title: 'Normal Smooth Transitions',
                desc: 'Subtle entry animations and interactive pulses.',
              },
              {
                id: 'reduced',
                title: 'Reduced Motion (Instant Display)',
                desc: 'Disables all animation effects for a completely calm visual experience.',
              },
            ].map((opt) => {
              const isSelected = preferences.reducedMotion === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleMotionChange(opt.id as MotionPreference)}
                  className={`p-5 rounded-2xl border-3 text-left transition-all min-h-[80px] ${
                    isSelected
                      ? 'bg-amber-100/70 dark:bg-stone-800 border-amber-600 shadow-md ring-2 ring-amber-500'
                      : 'border-stone-300 dark:border-stone-700 hover:border-amber-400 bg-stone-50 dark:bg-stone-800/50'
                  }`}
                  aria-pressed={isSelected}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-black text-stone-950 dark:text-white">
                      {opt.title}
                    </span>
                    {isSelected && <CheckCircle2 className="w-6 h-6 text-amber-600" />}
                  </div>
                  <p className="text-sm font-bold text-stone-600 dark:text-stone-400 mt-1">
                    {opt.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* 4. VOICE ASSISTANT SOUND TEST */}
        <section className="bg-white dark:bg-stone-900 border-3 border-stone-300 dark:border-stone-700 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h2 className="text-2xl font-black text-stone-950 dark:text-white flex items-center gap-2 justify-center sm:justify-start">
              <Volume2 className="w-6 h-6 text-amber-600" />
              <span>Voice Read-Aloud Test</span>
            </h2>
            <p className="text-base font-bold text-stone-600 dark:text-stone-400">
              Check that your browser's audio volume is set to a clear, comfortable level.
            </p>
          </div>

          <button
            onClick={handleTestVoice}
            className="px-6 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-lg shadow-md whitespace-nowrap min-h-[48px]"
          >
            🔊 Test Voice Output
          </button>
        </section>

        {/* 5. DEMO USER PROFILE & RESET */}
        <section className="bg-stone-100 dark:bg-stone-900 border-2 border-stone-300 dark:border-stone-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-stone-300 dark:bg-stone-700 text-stone-800 dark:text-stone-200 flex items-center justify-center">
              <User className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-stone-950 dark:text-white">
                Demo Profile: {user?.name || 'Anita Sharma'}
              </h2>
              <p className="text-base font-bold text-stone-600 dark:text-stone-400">
                Age: {user?.age || 68} &bull; Language: English (Plain Words) &bull; Mode: Independent Companion
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-stone-300 dark:border-stone-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-base font-medium text-stone-600 dark:text-stone-400 max-w-lg">
              Want to start the evaluation fresh? Resetting will restore Anita Sharma's original morning medicine reminders, 4:00 PM clinic appointment, and to-do bill task.
            </p>

            <button
              onClick={handleResetDemo}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-900 dark:text-white font-black text-base border-2 border-stone-400 dark:border-stone-600 min-h-[48px]"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Reset Demo Data</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
