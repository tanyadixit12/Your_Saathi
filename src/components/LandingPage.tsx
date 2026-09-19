import React from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText,
  Clock,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  HeartHandshake,
  CheckCircle2,
  Volume2,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setCurrentView, resetToDemo } = useApp();

  const handleStartDemo = async () => {
    await resetToDemo();
    setCurrentView('dashboard');
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col justify-between">
      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 md:py-20 text-center flex-1 flex flex-col items-center justify-center">
        {/* Subtle Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-base font-bold mb-6">
          <HeartHandshake className="w-5 h-5 text-amber-700 dark:text-amber-400" />
          <span>Intelligent, Accessible Companion for Seniors</span>
        </div>

        {/* Mandatory Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-stone-950 dark:text-white mb-6 leading-tight max-w-4xl">
          Technology that speaks your language.
        </h1>

        {/* Mandatory Subheading */}
        <p className="text-xl sm:text-2xl md:text-3xl font-medium text-stone-700 dark:text-stone-300 max-w-3xl mb-10 leading-relaxed">
          Aasra helps you understand, remember and stay safe — without making
          technology complicated.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mb-12">
          <button
            onClick={handleStartDemo}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-2xl shadow-xl hover:shadow-2xl transition-all active:scale-95 border-2 border-amber-700 min-h-[64px]"
            aria-label="Try Demo as Anita Sharma"
          >
            <span>Try Demo</span>
            <ArrowRight className="w-7 h-7" />
          </button>

          <a
            href="#how-it-works"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 font-bold text-xl text-stone-900 dark:text-stone-100 transition-colors border-2 border-stone-300 dark:border-stone-700 min-h-[64px]"
          >
            How it works
          </a>
        </div>

        {/* Demo Callout Pill */}
        <div className="bg-amber-100/70 dark:bg-stone-900 border-2 border-amber-300 dark:border-stone-700 rounded-2xl p-4 max-w-lg text-sm sm:text-base font-semibold text-stone-800 dark:text-stone-300 flex items-center gap-3 text-left">
          <CheckCircle2 className="w-6 h-6 text-amber-700 dark:text-amber-400 shrink-0" />
          <span>
            <strong>Ready to explore:</strong> Pre-loaded with demo profile for{' '}
            <strong>Anita Sharma</strong> (medicines, doctor visits, bill reminder & scam checker).
          </span>
        </div>
      </main>

      {/* The 3 Core Pillars Section */}
      <section id="how-it-works" className="bg-white dark:bg-stone-900 border-t-2 border-stone-200 dark:border-stone-800 py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-white mb-3">
              Built for Clarity, Independence & Safety
            </h2>
            <p className="text-lg sm:text-xl font-medium text-stone-600 dark:text-stone-400">
              Every screen answers one simple question: "What do I need to know or do right now?"
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1: UNDERSTAND */}
            <div className="bg-stone-50 dark:bg-stone-800/70 border-2 border-stone-300 dark:border-stone-700 rounded-3xl p-8 flex flex-col justify-between shadow-sm hover:border-amber-500 transition-colors">
              <div>
                <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 flex items-center justify-center mb-6">
                  <FileText className="w-9 h-9" />
                </div>
                <h3 className="text-2xl font-black text-stone-900 dark:text-white mb-3">
                  UNDERSTAND
                </h3>
                <p className="text-lg font-semibold text-stone-700 dark:text-stone-300 leading-relaxed">
                  Turn complicated bills, government letters, bank notices, and insurance documents into clear, plain language with zero jargon.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-stone-200 dark:border-stone-700 text-sm font-bold text-stone-500 dark:text-stone-400">
                Answers: What is this? What do I need to do? When?
              </div>
            </div>

            {/* Pillar 2: REMEMBER */}
            <div className="bg-stone-50 dark:bg-stone-800/70 border-2 border-stone-300 dark:border-stone-700 rounded-3xl p-8 flex flex-col justify-between shadow-sm hover:border-amber-500 transition-colors">
              <div>
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mb-6">
                  <Clock className="w-9 h-9" />
                </div>
                <h3 className="text-2xl font-black text-stone-900 dark:text-white mb-3">
                  REMEMBER
                </h3>
                <p className="text-lg font-semibold text-stone-700 dark:text-stone-300 leading-relaxed">
                  Keep track of medicines, doctor appointments, and important daily tasks with large 1-tap buttons and simple preparation checklists.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-stone-200 dark:border-stone-700 text-sm font-bold text-stone-500 dark:text-stone-400">
                Gentle reminders and preparation guidance.
              </div>
            </div>

            {/* Pillar 3: STAY SAFE */}
            <div className="bg-stone-50 dark:bg-stone-800/70 border-2 border-stone-300 dark:border-stone-700 rounded-3xl p-8 flex flex-col justify-between shadow-sm hover:border-amber-500 transition-colors">
              <div>
                <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 flex items-center justify-center mb-6">
                  <ShieldCheck className="w-9 h-9" />
                </div>
                <h3 className="text-2xl font-black text-stone-900 dark:text-white mb-3">
                  STAY SAFE
                </h3>
                <p className="text-lg font-semibold text-stone-700 dark:text-stone-300 leading-relaxed">
                  Identify warning signs in suspicious SMS, WhatsApp, and email messages before clicking links or sharing private OTP codes.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-stone-200 dark:border-stone-700 text-sm font-bold text-stone-500 dark:text-stone-400">
                Actionable advice without fake certainty.
              </div>
            </div>
          </div>

          {/* Voice Feature Highlight */}
          <div className="mt-12 bg-amber-50 dark:bg-stone-950 border-3 border-amber-400 rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <Volume2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-stone-950 dark:text-white">
                  Voice-First Friendly
                </h3>
                <p className="text-lg font-medium text-stone-700 dark:text-stone-300">
                  Just tap "Talk to Aasra" and ask anything: "What medicines do I have today?"
                </p>
              </div>
            </div>

            <button
              onClick={handleStartDemo}
              className="px-8 py-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xl whitespace-nowrap shadow-md min-h-[56px]"
            >
              Open Anita's Day
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-stone-500 dark:text-stone-400 text-sm border-t border-stone-200 dark:border-stone-800">
        <p className="font-semibold">
          Aasra — Your Simple Daily Companion &bull; Built with Google Gemini API
        </p>
        <p className="text-xs mt-1">
          Designed for accessibility and digital inclusion. Not a medical or emergency dispatch service.
        </p>
      </footer>
    </div>
  );
};
