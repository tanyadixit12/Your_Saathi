export type FontSizePreference = 'normal' | 'large' | 'extra-large';
export type ContrastPreference = 'standard' | 'high-contrast';
export type MotionPreference = 'normal' | 'reduced';

export interface UserPreference {
  id: string;
  userId: string;
  fontSize: FontSizePreference;
  highContrast: ContrastPreference;
  reducedMotion: MotionPreference;
}

export interface User {
  id: string;
  name: string;
  age?: number;
  createdAt: string;
}

export type MedicineStatus = 'pending' | 'taken' | 'skipped';

export interface Medicine {
  id: string;
  userId: string;
  name: string;
  dosage: string;
  time: string; // e.g. "09:00"
  frequency: string; // e.g. "Daily after breakfast"
  instructions?: string;
  status: MedicineStatus;
  aiExplanation?: string;
}

export interface Appointment {
  id: string;
  userId: string;
  title: string;
  dateTime: string; // ISO string or human formatted date-time
  location: string;
  notes?: string;
  completed: boolean;
  preparationChecklist?: string[];
}

export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  userId: string;
  title: string;
  dueDate: string;
  priority: TaskPriority;
  completed: boolean;
}

export interface TrustedContact {
  id: string;
  userId: string;
  name: string;
  relationship: string;
  phone: string;
}

export interface SafetyCheck {
  id: string;
  userId: string;
  inputHash: string;
  result: SafetyAnalysisResult;
  createdAt: string;
}

export interface SafetyAnalysisResult {
  riskLevel: 'safe' | 'suspicious' | 'danger';
  headline: string;
  warningSigns: string[];
  simpleExplanation: string;
  whatToDoNow: string[];
  sensitiveDataWarning?: boolean;
}

export interface DocumentSimplificationResult {
  whatIsThis: string;
  whatNeedToDo: string;
  whenNeedToDoIt: string;
  howMuchCost: string;
  importantThingsToNotice: string[];
  questionsToAsk: string[];
}

export interface DailyBriefingResult {
  greeting: string;
  summary: string;
  highlights: string[];
  closingMessage: string;
}

export type AppView =
  | 'landing'
  | 'dashboard'
  | 'medicines'
  | 'appointments'
  | 'understand'
  | 'safety'
  | 'contacts'
  | 'settings';
