import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { DashboardView } from './components/DashboardView';
import { MedicinesView } from './components/MedicinesView';
import { AppointmentsView } from './components/AppointmentsView';
import { UnderstandView } from './components/UnderstandView';
import { SafetyView } from './components/SafetyView';
import { TrustedContactView } from './components/TrustedContactView';
import { SettingsView } from './components/SettingsView';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';

const AppContent: React.FC = () => {
  const { currentView } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors pb-24 md:pb-12">
      {/* Accessible Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-6 py-3 bg-amber-600 text-white font-extrabold text-lg rounded-xl shadow-2xl ring-4 ring-amber-300"
      >
        Skip to main content
      </a>

      {/* Main Navigation Bar */}
      <Navbar />

      {/* Main View Router */}
      <main id="main-content" className="flex-1 focus:outline-none" tabIndex={-1}>
        {currentView === 'landing' && <LandingPage />}
        {currentView === 'dashboard' && <DashboardView />}
        {currentView === 'medicines' && <MedicinesView />}
        {currentView === 'appointments' && <AppointmentsView />}
        {currentView === 'understand' && <UnderstandView />}
        {currentView === 'safety' && <SafetyView />}
        {currentView === 'contacts' && <TrustedContactView />}
        {currentView === 'settings' && <SettingsView />}
      </main>

      {/* Global Voice Assistant Modal */}
      <VoiceAssistantModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
