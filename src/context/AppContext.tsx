import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import {
  User,
  Medicine,
  Appointment,
  Task,
  TrustedContact,
  UserPreference,
  DailyBriefingResult,
  AppView,
  FontSizePreference,
  ContrastPreference,
  MotionPreference,
  LanguagePreference,
  MedicineStatus,
} from '../types';
import { translations, TranslationStrings } from '../utils/i18n';

interface AppContextType {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  user: User | null;
  medicines: Medicine[];
  appointments: Appointment[];
  tasks: Task[];
  trustedContacts: TrustedContact[];
  preferences: UserPreference;
  language: LanguagePreference;
  setLanguage: (lang: LanguagePreference) => void;
  t: TranslationStrings;
  dailyBriefing: DailyBriefingResult | null;
  loadingBriefing: boolean;
  isVoiceAssistantOpen: boolean;
  setIsVoiceAssistantOpen: (open: boolean) => void;
  isHelpModalOpen: boolean;
  setIsHelpModalOpen: (open: boolean) => void;
  isLoadingData: boolean;
  actionMessage: string | null;
  showActionNotice: (msg: string) => void;
  // Actions
  refreshData: () => Promise<void>;
  fetchDailyBriefing: (force?: boolean) => Promise<void>;
  dismissProactiveSuggestion: () => void;
  confirmProactiveSuggestion: () => void;
  markMedicineStatus: (id: string, status: MedicineStatus) => Promise<void>;
  addMedicine: (data: Omit<Medicine, 'id' | 'userId' | 'status' | 'aiExplanation'>) => Promise<void>;
  deleteMedicine: (id: string) => Promise<void>;
  addAppointment: (data: { title: string; dateTime: string; location: string; notes?: string }) => Promise<void>;
  toggleAppointment: (id: string) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  addTask: (data: { title: string; dueDate: string; priority: 'low' | 'medium' | 'high' }) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  updateContact: (data: { name: string; relationship: string; phone: string }) => Promise<void>;
  updatePreferences: (prefs: Partial<UserPreference>) => Promise<void>;
  resetToDemo: () => Promise<void>;
  explainMoreSimply: (text: string) => Promise<{ superSimpleSummary: string; easySteps: string[] }>;
  // Speech synthesis
  speakText: (text: string) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [trustedContacts, setTrustedContacts] = useState<TrustedContact[]>([]);

  // Persistent Language selection
  const [language, setLanguageState] = useState<LanguagePreference>(() => {
    const saved =
      localStorage.getItem('aasra_language') ||
      localStorage.getItem('saathi_language') ||
      'en';
    return (['en', 'hi', 'hinglish'].includes(saved) ? saved : 'en') as LanguagePreference;
  });

  const [preferences, setPreferences] = useState<UserPreference>({
    id: 'pref_1',
    userId: 'user_demo',
    fontSize:
      (localStorage.getItem('aasra_font_size') as FontSizePreference) ||
      (localStorage.getItem('saathi_font_size') as FontSizePreference) ||
      'large',
    highContrast:
      (localStorage.getItem('aasra_contrast') as ContrastPreference) ||
      (localStorage.getItem('saathi_contrast') as ContrastPreference) ||
      'standard',
    reducedMotion:
      (localStorage.getItem('aasra_motion') as MotionPreference) ||
      (localStorage.getItem('saathi_motion') as MotionPreference) ||
      'normal',
    language,
  });

  const [dailyBriefing, setDailyBriefing] = useState<DailyBriefingResult | null>(null);
  const [loadingBriefing, setLoadingBriefing] = useState<boolean>(false);
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState<boolean>(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const t = useMemo(() => translations[language] || translations.en, [language]);

  const setLanguage = useCallback((newLang: LanguagePreference) => {
    setLanguageState(newLang);
    localStorage.setItem('aasra_language', newLang);
    setPreferences((prev) => ({ ...prev, language: newLang }));
  }, []);

  const showActionNotice = useCallback((msg: string) => {
    setActionMessage(msg);
    setTimeout(() => {
      setActionMessage((prev) => (prev === msg ? null : prev));
    }, 4500);
  }, []);

  // Apply visual accessibility preferences to html root
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('font-size-normal', 'font-size-large', 'font-size-extra-large');
    root.classList.add(`font-size-${preferences.fontSize}`);

    if (preferences.highContrast === 'high-contrast') {
      root.classList.add('theme-high-contrast');
    } else {
      root.classList.remove('theme-high-contrast');
    }

    if (preferences.reducedMotion === 'reduced') {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    localStorage.setItem('aasra_font_size', preferences.fontSize);
    localStorage.setItem('aasra_contrast', preferences.highContrast);
    localStorage.setItem('aasra_motion', preferences.reducedMotion);
  }, [preferences]);

  // Speech synthesis helper
  const speakText = useCallback(
    (text: string) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*_#`]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.88; // Calm cadence for seniors
      utterance.pitch = 1.0;

      // Select voice based on language if available
      const voices = window.speechSynthesis.getVoices();
      if (language === 'hi') {
        const hindiVoice = voices.find((v) => v.lang.startsWith('hi'));
        if (hindiVoice) utterance.voice = hindiVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    },
    [language]
  );

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const refreshData = useCallback(async () => {
    try {
      setIsLoadingData(true);
      const res = await fetch('/api/user/data');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setMedicines(data.medicines || []);
        setAppointments(data.appointments || []);
        setTasks(data.tasks || []);
        setTrustedContacts(data.trustedContacts || []);
        if (data.preferences) {
          setPreferences((prev) => ({
            ...prev,
            ...data.preferences,
            fontSize:
              (localStorage.getItem('aasra_font_size') as FontSizePreference) ||
              data.preferences.fontSize ||
              prev.fontSize,
            highContrast:
              (localStorage.getItem('aasra_contrast') as ContrastPreference) ||
              data.preferences.highContrast ||
              prev.highContrast,
            reducedMotion:
              (localStorage.getItem('aasra_motion') as MotionPreference) ||
              data.preferences.reducedMotion ||
              prev.reducedMotion,
          }));
        }
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  // Fetch daily briefing with caching (Efficiency optimization)
  const fetchDailyBriefing = useCallback(
    async (force: boolean = false) => {
      // Avoid re-fetching if we already have a loaded briefing in the same language unless forced
      if (!force && dailyBriefing && dailyBriefing.language === language) {
        return;
      }
      try {
        setLoadingBriefing(true);
        const res = await fetch('/api/ai/briefing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language }),
        });
        if (res.ok) {
          const briefing = await res.json();
          setDailyBriefing(briefing);
        }
      } catch (err) {
        console.error('Error fetching briefing:', err);
      } finally {
        setLoadingBriefing(false);
      }
    },
    [dailyBriefing, language]
  );

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Load briefing when entering dashboard or switching language
  useEffect(() => {
    if (currentView === 'dashboard') {
      fetchDailyBriefing();
    }
  }, [currentView, language, fetchDailyBriefing]);

  // Proactive suggestion handlers
  const dismissProactiveSuggestion = useCallback(() => {
    setDailyBriefing((prev) =>
      prev && prev.proactiveSuggestion
        ? {
            ...prev,
            proactiveSuggestion: { ...prev.proactiveSuggestion, dismissed: true },
          }
        : prev
    );
  }, []);

  const confirmProactiveSuggestion = useCallback(() => {
    if (!dailyBriefing?.proactiveSuggestion) return;
    const sug = dailyBriefing.proactiveSuggestion;

    if (sug.actionType === 'appointment_reminder') {
      showActionNotice(
        language === 'hi'
          ? 'अनुस्मारक सेट किया गया: आपको अपॉइंटमेंट से 1 घंटे पहले सूचना मिलेगी।'
          : 'Reminder set: You will receive an alert 1 hour before your appointment.'
      );
    } else if (sug.actionType === 'medicine_water') {
      showActionNotice(
        language === 'hi'
          ? 'दवाई लेने का समय दर्ज किया गया। पानी पीना न भूलें!'
          : 'Great job taking your scheduled medicine!'
      );
    }

    setDailyBriefing((prev) =>
      prev && prev.proactiveSuggestion
        ? {
            ...prev,
            proactiveSuggestion: { ...prev.proactiveSuggestion, confirmed: true },
          }
        : prev
    );
  }, [dailyBriefing, language, showActionNotice]);

  const markMedicineStatus = async (id: string, status: MedicineStatus) => {
    try {
      const res = await fetch(`/api/medicines/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setMedicines((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
        const med = medicines.find((m) => m.id === id);
        showActionNotice(
          status === 'taken'
            ? language === 'hi'
              ? `${med?.name || 'दवाई'} ले ली गई। बहुत अच्छा!`
              : `Marked ${med?.name || 'medicine'} as taken. Good job!`
            : language === 'hi'
            ? `${med?.name || 'दवाई'} को छोड़ दिया गया।`
            : `Marked ${med?.name || 'medicine'} as skipped.`
        );
        fetchDailyBriefing(true);
      }
    } catch (err) {
      console.error('Error updating medicine:', err);
      showActionNotice('Could not update medicine. Please try again.');
    }
  };

  const addMedicine = async (data: Omit<Medicine, 'id' | 'userId' | 'status' | 'aiExplanation'>) => {
    try {
      const res = await fetch('/api/medicines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const newMed = await res.json();
        setMedicines((prev) => [...prev, newMed]);
        showActionNotice(
          language === 'hi'
            ? `${newMed.name} को दवाइयों की सूची में जोड़ा गया।`
            : `Added ${newMed.name} to your medicine schedule.`
        );
        fetchDailyBriefing(true);
      }
    } catch (err) {
      console.error('Error adding medicine:', err);
      showActionNotice('Could not save medicine. Please try again.');
    }
  };

  const deleteMedicine = async (id: string) => {
    try {
      const res = await fetch(`/api/medicines/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMedicines((prev) => prev.filter((m) => m.id !== id));
        showActionNotice(language === 'hi' ? 'दवाई हटा दी गई।' : 'Medicine removed from schedule.');
        fetchDailyBriefing(true);
      }
    } catch (err) {
      console.error('Error deleting medicine:', err);
      showActionNotice('Could not delete medicine.');
    }
  };

  const addAppointment = async (data: { title: string; dateTime: string; location: string; notes?: string }) => {
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const newApt = await res.json();
        setAppointments((prev) => [...prev, newApt]);
        showActionNotice(
          language === 'hi'
            ? `अपॉइंटमेंट जोड़ा गया: ${newApt.title}।`
            : `Added appointment: ${newApt.title}.`
        );
        fetchDailyBriefing(true);
      }
    } catch (err) {
      console.error('Error adding appointment:', err);
      showActionNotice('Could not save appointment.');
    }
  };

  const toggleAppointment = async (id: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}/toggle`, { method: 'PATCH' });
      if (res.ok) {
        const { completed } = await res.json();
        setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, completed } : a)));
        showActionNotice(
          completed
            ? language === 'hi'
              ? 'अपॉइंटमेंट पूरा हुआ।'
              : 'Appointment completed.'
            : language === 'hi'
            ? 'अपॉइंटमेंट को आने वाले में रखा गया।'
            : 'Appointment marked as upcoming.'
        );
        fetchDailyBriefing(true);
      }
    } catch (err) {
      console.error('Error toggling appointment:', err);
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAppointments((prev) => prev.filter((a) => a.id !== id));
        showActionNotice(language === 'hi' ? 'अपॉइंटमेंट हटाया गया।' : 'Appointment removed.');
        fetchDailyBriefing(true);
      }
    } catch (err) {
      console.error('Error deleting appointment:', err);
    }
  };

  const addTask = async (data: { title: string; dueDate: string; priority: 'low' | 'medium' | 'high' }) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const newTask = await res.json();
        setTasks((prev) => [...prev, newTask]);
        showActionNotice(
          language === 'hi' ? `कार्य जोड़ा गया: ${newTask.title}।` : `Added task: ${newTask.title}.`
        );
        fetchDailyBriefing(true);
      }
    } catch (err) {
      console.error('Error adding task:', err);
      showActionNotice('Could not save task.');
    }
  };

  const toggleTask = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}/toggle`, { method: 'PATCH' });
      if (res.ok) {
        const { completed } = await res.json();
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed } : t)));
        showActionNotice(
          completed
            ? language === 'hi'
              ? 'कार्य पूरा हो गया!'
              : 'Task marked as done!'
            : language === 'hi'
            ? 'कार्य सूची में पुनः जोड़ा गया।'
            : 'Task restored to your list.'
        );
        fetchDailyBriefing(true);
      }
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== id));
        showActionNotice(language === 'hi' ? 'कार्य हटाया गया।' : 'Task removed.');
        fetchDailyBriefing(true);
      }
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const updateContact = async (data: { name: string; relationship: string; phone: string }) => {
    try {
      const res = await fetch('/api/contacts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const { contact } = await res.json();
        setTrustedContacts([contact]);
        showActionNotice(
          language === 'hi' ? 'विश्वसनीय संपर्क सहेजा गया।' : 'Trusted contact updated.'
        );
      }
    } catch (err) {
      console.error('Error updating contact:', err);
      showActionNotice('Could not update contact.');
    }
  };

  const updatePreferences = async (newPrefs: Partial<UserPreference>) => {
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);
    try {
      await fetch('/api/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      showActionNotice(language === 'hi' ? 'सेटिंग्स सहेजी गईं।' : 'Settings saved.');
    } catch (err) {
      console.error('Error saving preferences:', err);
    }
  };

  const explainMoreSimply = async (
    text: string
  ): Promise<{ superSimpleSummary: string; easySteps: string[] }> => {
    try {
      const res = await fetch('/api/ai/simplify-more', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.error('Error simplifying more:', err);
    }
    return {
      superSimpleSummary:
        language === 'hi'
          ? 'सरल शब्दों में: यह एक जरूरी पत्र है। किसी भी भुगतान से पहले अपने परिवार से सलाह लें।'
          : 'In simple words: This is an important notice. Check the dates and confirm with your family before paying.',
      easySteps:
        language === 'hi'
          ? ['1. अंतिम तिथि ध्यान से देखें।', '2. कोई अनजान लिंक न खोलें।', '3. संदेह होने पर परिवार से पूछें।']
          : ['1. Check the due date.', '2. Do not click unknown links.', '3. Talk to family if in doubt.'],
    };
  };

  const resetToDemo = async () => {
    try {
      const res = await fetch('/api/user/reset', { method: 'POST' });
      if (res.ok) {
        await refreshData();
        await fetchDailyBriefing(true);
        showActionNotice(
          language === 'hi'
            ? 'अनिता शर्मा का डेमो प्रोफ़ाइल रीसेट किया गया।'
            : 'Demo data restored for Anita Sharma.'
        );
      }
    } catch (err) {
      console.error('Error resetting demo:', err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        user,
        medicines,
        appointments,
        tasks,
        trustedContacts,
        preferences,
        language,
        setLanguage,
        t,
        dailyBriefing,
        loadingBriefing,
        isVoiceAssistantOpen,
        setIsVoiceAssistantOpen,
        isHelpModalOpen,
        setIsHelpModalOpen,
        isLoadingData,
        actionMessage,
        showActionNotice,
        refreshData,
        fetchDailyBriefing,
        dismissProactiveSuggestion,
        confirmProactiveSuggestion,
        markMedicineStatus,
        addMedicine,
        deleteMedicine,
        addAppointment,
        toggleAppointment,
        deleteAppointment,
        addTask,
        toggleTask,
        deleteTask,
        updateContact,
        updatePreferences,
        resetToDemo,
        explainMoreSimply,
        speakText,
        stopSpeaking,
        isSpeaking,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
