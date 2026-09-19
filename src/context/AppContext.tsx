import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
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
  MedicineStatus,
} from '../types';

interface AppContextType {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  user: User | null;
  medicines: Medicine[];
  appointments: Appointment[];
  tasks: Task[];
  trustedContacts: TrustedContact[];
  preferences: UserPreference;
  dailyBriefing: DailyBriefingResult | null;
  loadingBriefing: boolean;
  isVoiceAssistantOpen: boolean;
  setIsVoiceAssistantOpen: (open: boolean) => void;
  isLoadingData: boolean;
  actionMessage: string | null;
  showActionNotice: (msg: string) => void;
  // Actions
  refreshData: () => Promise<void>;
  fetchDailyBriefing: () => Promise<void>;
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
  const [preferences, setPreferences] = useState<UserPreference>({
    id: 'pref_1',
    userId: 'user_demo',
    fontSize: (localStorage.getItem('saathi_font_size') as FontSizePreference) || 'large',
    highContrast: (localStorage.getItem('saathi_contrast') as ContrastPreference) || 'standard',
    reducedMotion: (localStorage.getItem('saathi_motion') as MotionPreference) || 'normal',
  });
  const [dailyBriefing, setDailyBriefing] = useState<DailyBriefingResult | null>(null);
  const [loadingBriefing, setLoadingBriefing] = useState<boolean>(false);
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState<boolean>(false);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

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

    localStorage.setItem('saathi_font_size', preferences.fontSize);
    localStorage.setItem('saathi_contrast', preferences.highContrast);
    localStorage.setItem('saathi_motion', preferences.reducedMotion);
  }, [preferences]);

  // Speech synthesis helper
  const speakText = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.9; // Slightly slower, calm cadence for seniors
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, []);

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
          // Merge with stored local preferences if present
          setPreferences((prev) => ({
            ...prev,
            ...data.preferences,
            fontSize: (localStorage.getItem('saathi_font_size') as FontSizePreference) || data.preferences.fontSize || prev.fontSize,
            highContrast: (localStorage.getItem('saathi_contrast') as ContrastPreference) || data.preferences.highContrast || prev.highContrast,
            reducedMotion: (localStorage.getItem('saathi_motion') as MotionPreference) || data.preferences.reducedMotion || prev.reducedMotion,
          }));
        }
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  const fetchDailyBriefing = useCallback(async () => {
    try {
      setLoadingBriefing(true);
      const res = await fetch('/api/ai/briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Load briefing whenever user enters dashboard
  useEffect(() => {
    if (currentView === 'dashboard') {
      fetchDailyBriefing();
    }
  }, [currentView, fetchDailyBriefing]);

  const markMedicineStatus = async (id: string, status: MedicineStatus) => {
    try {
      const res = await fetch(`/api/medicines/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setMedicines((prev) =>
          prev.map((m) => (m.id === id ? { ...m, status } : m))
        );
        const med = medicines.find((m) => m.id === id);
        showActionNotice(
          status === 'taken'
            ? `Marked ${med?.name || 'medicine'} as taken. Good job!`
            : `Marked ${med?.name || 'medicine'} as skipped.`
        );
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
        showActionNotice(`Added ${newMed.name} to your medicine schedule.`);
        fetchDailyBriefing();
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
        showActionNotice('Medicine removed from schedule.');
        fetchDailyBriefing();
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
        showActionNotice(`Added appointment: ${newApt.title}.`);
        fetchDailyBriefing();
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
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, completed } : a))
        );
        showActionNotice(completed ? 'Appointment completed.' : 'Appointment marked as upcoming.');
        fetchDailyBriefing();
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
        showActionNotice('Appointment removed.');
        fetchDailyBriefing();
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
        showActionNotice(`Added task: ${newTask.title}.`);
        fetchDailyBriefing();
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
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, completed } : t))
        );
        showActionNotice(completed ? 'Task marked as done!' : 'Task restored to your list.');
        fetchDailyBriefing();
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
        showActionNotice('Task removed.');
        fetchDailyBriefing();
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
        showActionNotice('Trusted contact updated.');
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
      showActionNotice('Settings saved.');
    } catch (err) {
      console.error('Error saving preferences:', err);
    }
  };

  const resetToDemo = async () => {
    try {
      const res = await fetch('/api/user/reset', { method: 'POST' });
      if (res.ok) {
        await refreshData();
        await fetchDailyBriefing();
        showActionNotice('Demo data restored for Anita Sharma.');
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
        dailyBriefing,
        loadingBriefing,
        isVoiceAssistantOpen,
        setIsVoiceAssistantOpen,
        isLoadingData,
        actionMessage,
        showActionNotice,
        refreshData,
        fetchDailyBriefing,
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
