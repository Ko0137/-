export interface ChatMessage {
  id: string;
  message: string;
  isUser: boolean;
  time: string;
}

export type AppTheme = 
  | 'dark' 
  | 'light' 
  | 'ios' 
  | 'cyber' 
  | 'purple' 
  | 'cobalt' 
  | 'amber' 
  | 'crimson' 
  | 'monochrome';

export type NavTab = 'chat' | 'vibe' | 'finance';

export type CurrencyCode = 'RUB' | 'USD' | 'EUR' | 'KZT' | 'BYN' | 'UAH' | 'USDT' | 'BTC';

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateToRub: number; // approximate offline conversion rate
}

export interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  currency: CurrencyCode;
  type: 'income' | 'expense';
  date: string;
}

export type WidgetStyle = 'orb' | 'vibe' | 'dashboard' | 'finance';

export type MacroActionType = 
  | 'say'
  | 'open_app'
  | 'music_toggle'
  | 'torch_toggle'
  | 'read_notes'
  | 'set_alarm'
  | 'add_expense'
  | 'delay';

export interface MacroAction {
  id: string;
  type: MacroActionType;
  payload?: string; // speech text, app id/url, note text, time
  label?: string;
}

export interface CustomMacroCommand {
  id: string;
  trigger: string;
  name: string;
  actions: MacroAction[];
}

export type MicSoundEffect = 
  | 'classic_beep' 
  | 'soft_click' 
  | 'tech_chime' 
  | 'cyber_chirp' 
  | 'bubble_pop' 
  | 'gentle_bell' 
  | 'none';

export interface SettingsState {
  userName: string;
  theme: AppTheme;
  darkTheme: boolean; // keep for backward compatibility
  voiceEnabled: boolean;
  quietMode: boolean;
  femaleVoice: boolean;
  widgetEnabled: boolean;
  widgetStyle: WidgetStyle;
  primaryCurrency: CurrencyCode;
  micSoundEffect?: MicSoundEffect;
  appIcon?: string;
  wakeWordEnabled?: boolean;
  privacyAccepted: boolean;
  customCommands: Record<string, string>;
  macroCommands: CustomMacroCommand[];
}

export interface HabitItem {
  id: string;
  title: string;
  subtitle: string;
  completed: boolean;
  level: 'min' | 'norm' | 'max';
}

export interface HabitCategory {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  items: HabitItem[];
}

export interface PhoneActivityStats {
  steps: number;
  stepsGoal: number;
  calories: number;
  caloriesGoal: number;
  activeMinutes: number;
  distanceKm: number;
  sleepDuration: string;
  waterMl: number;
  waterGoalMl: number;
  screenTime: string;
  lastSynced: string;
  source: 'health_connect' | 'samsung_health' | 'google_fit' | 'device_sensors';
}

export interface DailyVibeLog {
  date: string; // YYYY-MM-DD
  energy: 'low' | 'normal' | 'high';
  level: 'min' | 'norm' | 'max';
  completedTaskIds: string[];
  restTags: string[];
  journalText: string;
  analysisText: string;
  activityStats?: PhoneActivityStats;
}

export interface VibeSettings {
  workShiftMode: boolean; // 2/2 work shift cycle
  workShiftStartDate: string; // YYYY-MM-DD
}

export interface LaunchableApp {
  id: string;
  name: string;
  category: string;
  icon: string;
  keywords: string[];
  actionType: 'camera' | 'browser' | 'notes' | 'calculator' | 'alarm' | 'custom' | 'media';
  url?: string;
}

export interface ActiveAlarm {
  id: string;
  time: string;
  label: string;
  hour: number;
  minute: number;
  isActive: boolean;
}

export interface ActiveTimer {
  id: string;
  label: string;
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  createdAt: number;
}

export interface NoteItem {
  id: string;
  text: string;
  createdAt: string;
}

export type FileCategory = 'all' | 'document' | 'image' | 'download' | 'audio' | 'archive' | 'code' | 'other';

export interface IndexedFileItem {
  id: string;
  name: string;
  extension: string;
  category: FileCategory;
  directory: string;
  sizeBytes: number;
  updatedAt: string; // ISO or YYYY-MM-DD HH:mm
  contentSnippet: string;
  tags: string[];
  previewDataUrl?: string;
  isStarred?: boolean;
  mimeType?: string;
  isUserScanned?: boolean;
}

export interface FileFilterOptions {
  query?: string;
  category?: FileCategory;
  dateRange?: 'all' | 'today' | 'week' | 'month' | 'year';
  sizeRange?: 'all' | 'small' | 'medium' | 'large'; // <1MB, 1-50MB, >50MB
  sortBy?: 'date' | 'name' | 'size';
  sortDirection?: 'asc' | 'desc';
}
