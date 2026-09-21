import React, { useState, useEffect, useMemo, useRef } from 'react';
import { LaunchableApp, HabitCategory, HabitItem, DailyVibeLog, VibeSettings, AppTheme, PhoneActivityStats } from '../types';
import { triggerVibration, soundManager } from '../utils/sound';
import { speechService } from '../services/speechService';
import { pedometerService, INITIAL_EMPTY_ACTIVITY } from '../services/pedometerService';
import { PhoneActivityCard } from './PhoneActivityCard';
import {
  Sparkles,
  Flame,
  CheckCircle2,
  Circle,
  Mic,
  MicOff,
  Plus,
  Trash2,
  Edit3,
  Calendar as CalendarIcon,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Gamepad2,
  BookOpen,
  Brain,
  Sliders,
  X,
  Save,
  Check,
} from 'lucide-react';

interface VibeViewProps {
  theme?: AppTheme;
  onOpenApp?: (app: LaunchableApp) => void;
  onSendCommand?: (cmd: string) => void;
  isTorchOn?: boolean;
  onToggleTorch?: () => void;
  isMusicPlaying?: boolean;
  onToggleMusic?: () => void;
}

const STORAGE_KEY_CATEGORIES = 'vibe_habit_categories_v2';
const STORAGE_KEY_LOGS = 'vibe_daily_logs_v2';
const STORAGE_KEY_SETTINGS = 'vibe_settings_v2';

const DEFAULT_CATEGORIES: HabitCategory[] = [
  {
    id: 'cat-morning',
    name: 'Утро',
    subtitle: 'Запустить день без перегруза',
    icon: '🌅',
    items: [
      { id: 'm-water', title: 'Вода', subtitle: 'старт дня', completed: false, level: 'min' },
      { id: 'm-breath', title: 'Дыхание', subtitle: 'box breathing 4-4-4-4', completed: false, level: 'min' },
      { id: 'm-phys', title: 'Физическая активация', subtitle: '10–20 отжиманий + движение', completed: false, level: 'min' },
      { id: 'm-breakfast', title: 'Завтрак + музыка', subtitle: 'без спешки', completed: false, level: 'norm' },
      { id: 'm-walk', title: 'Прогулка', subtitle: '10–20 минут', completed: false, level: 'norm' },
    ],
  },
  {
    id: 'cat-growth',
    name: 'Развитие',
    subtitle: 'Направление пока не фиксируем',
    icon: '🧠',
    items: [
      { id: 'g-dev', title: 'Развитие', subtitle: 'AI / видео / озвучка / другое — выбираешь сам', completed: false, level: 'norm' },
      { id: 'g-book', title: 'Книга', subtitle: '10 минут', completed: false, level: 'min' },
      { id: 'g-abs', title: 'Скручивания', subtitle: '10–20 повторений', completed: false, level: 'norm' },
      { id: 'g-diary', title: 'Дневник', subtitle: 'что сделал / не сделал / почему / понял / завтра', completed: false, level: 'norm' },
    ],
  },
];

const DEFAULT_REST_TAGS = ['Xbox', 'Стрим', 'Клипы / Shorts', 'Бар / встреча', 'Прогулка', 'Фильм'];

const DEFAULT_ACTIVITY: PhoneActivityStats = INITIAL_EMPTY_ACTIVITY;

function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const MONTH_NAMES_RU = [
  'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
  'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'
];

const WEEKDAY_NAMES_RU = [
  'воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'
];

export const VibeView: React.FC<VibeViewProps> = ({
  theme = 'dark',
  onOpenApp,
  onSendCommand,
}) => {
  const isIOS = theme === 'ios';
  const isLight = theme === 'light';

  // Date selection state (defaults to today)
  const todayKey = useMemo(() => formatDateKey(new Date()), []);
  const [selectedDateKey, setSelectedDateKey] = useState<string>(todayKey);

  // Calendar display month
  const [currentCalendarDate, setCurrentCalendarDate] = useState<Date>(new Date());

  // Habit Categories (editable structure)
  const [categories, setCategories] = useState<HabitCategory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CATEGORIES);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_CATEGORIES;
  });

  // Daily Logs map (date -> log)
  const [dailyLogs, setDailyLogs] = useState<Record<string, DailyVibeLog>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOGS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  // Vibe Settings (Work 2/2 Shift, etc.)
  const [settings, setSettings] = useState<VibeSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      workShiftMode: false,
      workShiftStartDate: todayKey,
    };
  });

  // Rest Tags list (customizable)
  const [restTags, setRestTags] = useState<string[]>(DEFAULT_REST_TAGS);
  const [newRestTag, setNewRestTag] = useState('');

  // UI Dialogs
  const [isModesDrawerOpen, setIsModesDrawerOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [targetCategoryId, setTargetCategoryId] = useState<string>('cat-morning');
  const [taskFormTitle, setTaskFormTitle] = useState('');
  const [taskFormSubtitle, setTaskFormSubtitle] = useState('');
  const [taskFormLevel, setTaskFormLevel] = useState<'min' | 'norm' | 'max'>('min');

  // Editing existing task
  const [editingTask, setEditingTask] = useState<{ categoryId: string; task: HabitItem } | null>(null);

  // Voice recording state for journal
  const [isRecordingJournal, setIsRecordingJournal] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState<string>('Готов к записи');

  // Sync categories
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
    } catch {}
  }, [categories]);

  // Sync logs
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(dailyLogs));
    } catch {}
  }, [dailyLogs]);

  // Sync settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  // Current selected day's log
  const currentLog: DailyVibeLog = useMemo(() => {
    return (
      dailyLogs[selectedDateKey] || {
        date: selectedDateKey,
        energy: 'normal',
        level: 'min',
        completedTaskIds: [],
        restTags: [],
        journalText: '',
        analysisText: '',
        activityStats: DEFAULT_ACTIVITY,
      }
    );
  }, [dailyLogs, selectedDateKey]);

  // Helper to update current log
  const updateCurrentLog = (updater: Partial<DailyVibeLog>) => {
    setDailyLogs(prev => {
      const existing = prev[selectedDateKey] || {
        date: selectedDateKey,
        energy: 'normal',
        level: 'min',
        completedTaskIds: [],
        restTags: [],
        journalText: '',
        analysisText: '',
        activityStats: DEFAULT_ACTIVITY,
      };
      return {
        ...prev,
        [selectedDateKey]: { ...existing, ...updater },
      };
    });
  };

  // Toggle individual task completion
  const handleToggleTask = (taskId: string) => {
    triggerVibration('taskCheck');
    soundManager.playClick();
    const currentCompleted = currentLog.completedTaskIds || [];
    const isDone = currentCompleted.includes(taskId);
    const updated = isDone
      ? currentCompleted.filter(id => id !== taskId)
      : [...currentCompleted, taskId];

    updateCurrentLog({ completedTaskIds: updated });
  };

  const isTaskCompleted = (taskId: string) => {
    return (currentLog.completedTaskIds || []).includes(taskId);
  };

  // Toggle rest tag
  const handleToggleRestTag = (tag: string) => {
    triggerVibration('tap');
    const current = currentLog.restTags || [];
    const updated = current.includes(tag)
      ? current.filter(t => t !== tag)
      : [...current, tag];
    updateCurrentLog({ restTags: updated });
  };

  // Shift calculation (2/2 cycle)
  const shiftStatus = useMemo(() => {
    if (!settings.workShiftMode) {
      return {
        tag: 'Обычный день',
        label: 'Режим 2/2 не активирован',
        isWork: false,
      };
    }

    try {
      const [startYear, startMonth, startDay] = settings.workShiftStartDate.split('-').map(Number);
      const [currYear, currMonth, currDay] = selectedDateKey.split('-').map(Number);

      const startDate = new Date(startYear, startMonth - 1, startDay);
      const targetDate = new Date(currYear, currMonth - 1, currDay);

      const diffTime = targetDate.getTime() - startDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      // 4-day cycle: 0, 1 = Work; 2, 3 = Rest
      const cycleIndex = ((diffDays % 4) + 4) % 4;
      if (cycleIndex === 0) {
        return { tag: 'Рабочий день (1/2)', label: 'Первая рабочая смена', isWork: true };
      } else if (cycleIndex === 1) {
        return { tag: 'Рабочий день (2/2)', label: 'Вторая рабочая смена', isWork: true };
      } else if (cycleIndex === 2) {
        return { tag: 'Выходной (1/2)', label: 'Первый день восстановления', isWork: false };
      } else {
        return { tag: 'Выходной (2/2)', label: 'Второй день восстановления', isWork: false };
      }
    } catch {
      return { tag: 'Смена 2/2', label: 'Расчёт смены', isWork: false };
    }
  }, [settings.workShiftMode, settings.workShiftStartDate, selectedDateKey]);

  // Overall calculations
  const allTasks = useMemo(() => {
    return categories.flatMap(cat => cat.items);
  }, [categories]);

  const totalTasksCount = allTasks.length || 1;
  const completedTasksCount = (currentLog.completedTaskIds || []).length;
  const progressPercentage = Math.round((completedTasksCount / totalTasksCount) * 100);

  // General monthly statistics
  const stats = useMemo(() => {
    const dates = Object.keys(dailyLogs);
    let daysWithProgress = 0;
    let sumPercentage = 0;

    dates.forEach(d => {
      const log = dailyLogs[d];
      if (log && log.completedTaskIds && log.completedTaskIds.length > 0) {
        daysWithProgress++;
        const pct = Math.min(100, Math.round((log.completedTaskIds.length / totalTasksCount) * 100));
        sumPercentage += pct;
      }
    });

    const avg = daysWithProgress > 0 ? Math.round(sumPercentage / daysWithProgress) : 0;
    return { daysWithProgress, avgPercentage: avg };
  }, [dailyLogs, totalTasksCount]);

  // Voice recording toggle for daily journal
  const handleToggleJournalRecord = async () => {
    if (isRecordingJournal) {
      speechService.stopListening();
      setIsRecordingJournal(false);
      setRecordingStatus('Запись завершена');
      triggerVibration('micEnd');
    } else {
      triggerVibration('micStart');
      setIsRecordingJournal(true);
      setRecordingStatus('Слушаю вас...');

      const started = await speechService.startListening({
        onStart: () => {
          setIsRecordingJournal(true);
          setRecordingStatus('Слушаю вас...');
        },
        onResult: (text: string) => {
          if (text) {
            const updated = (currentLog.journalText ? currentLog.journalText + ' ' : '') + text;
            updateCurrentLog({ journalText: updated });
            setIsRecordingJournal(false);
            setRecordingStatus('Готово');
            triggerVibration('commandSuccess');
            generateObservation(updated, currentLog);
          }
        },
        onError: (error: string) => {
          setIsRecordingJournal(false);
          setRecordingStatus(error || 'Ошибка записи');
          triggerVibration('commandError');
        },
        onEnd: () => {
          setIsRecordingJournal(false);
        },
      });

      if (!started) {
        setIsRecordingJournal(false);
        setRecordingStatus('Микрофон недоступен');
      }
    }
  };

  // Generate automated local observation
  const generateObservation = (text: string, log: DailyVibeLog) => {
    const tasksDone = log.completedTaskIds?.length || 0;
    const energy = log.energy;
    let insight = '';

    if (tasksDone >= 4 && energy === 'high') {
      insight = 'Отличный ритм: высокая продуктивность без видимого сопротивления. Зафиксируйте, что дало такой прилив сил.';
    } else if (tasksDone <= 2 && energy === 'low') {
      insight = 'Низкая нагрузка соразмерна низкому уровню энергии. День восстановления прошёл гармонично — главное не винить себя.';
    } else if (tasksDone >= 3 && energy === 'low') {
      insight = 'Хорошая дисциплина: несмотря на низкий тонус, ключевые привычки выполнены. Вечером обязательно переключитесь на качественный отдых.';
    } else {
      insight = 'День зафиксирован в стабильном русле. Система маленьких шагов работает на долгосрочную дистанцию.';
    }

    if (text && text.toLowerCase().includes('устал')) {
      insight += ' В дневнике звучит тема усталости — запланируйте сон на 30 минут раньше.';
    }

    updateCurrentLog({ analysisText: insight });
  };

  // Add a new task to category
  const handleSaveNewTask = () => {
    if (!taskFormTitle.trim()) return;
    triggerVibration('commandSuccess');
    soundManager.playCommandSuccess();

    const newItem: HabitItem = {
      id: `task-${Date.now()}`,
      title: taskFormTitle.trim(),
      subtitle: taskFormSubtitle.trim() || 'пользовательский пункт',
      completed: false,
      level: taskFormLevel,
    };

    setCategories(prev =>
      prev.map(cat =>
        cat.id === targetCategoryId ? { ...cat, items: [...cat.items, newItem] } : cat
      )
    );

    setTaskFormTitle('');
    setTaskFormSubtitle('');
    setIsAddTaskModalOpen(false);
  };

  // Edit an existing task
  const handleSaveEditedTask = () => {
    if (!editingTask || !taskFormTitle.trim()) return;
    triggerVibration('commandSuccess');
    soundManager.playCommandSuccess();

    setCategories(prev =>
      prev.map(cat => {
        if (cat.id !== editingTask.categoryId) return cat;
        return {
          ...cat,
          items: cat.items.map(it =>
            it.id === editingTask.task.id
              ? {
                  ...it,
                  title: taskFormTitle.trim(),
                  subtitle: taskFormSubtitle.trim(),
                  level: taskFormLevel,
                }
              : it
          ),
        };
      })
    );

    setEditingTask(null);
    setTaskFormTitle('');
    setTaskFormSubtitle('');
  };

  // Delete task
  const handleDeleteTask = (catId: string, taskId: string) => {
    triggerVibration('tap');
    setCategories(prev =>
      prev.map(cat =>
        cat.id === catId ? { ...cat, items: cat.items.filter(it => it.id !== taskId) } : cat
      )
    );
  };

  // Formatted date string for header
  const formattedSelectedDate = useMemo(() => {
    const parts = selectedDateKey.split('-');
    const dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    const dayOfWeek = WEEKDAY_NAMES_RU[dateObj.getDay()];
    const dayNum = dateObj.getDate();
    const month = MONTH_NAMES_RU[dateObj.getMonth()];
    return `${dayOfWeek}, ${dayNum} ${month}`;
  }, [selectedDateKey]);

  // Calendar matrix calculation
  const calendarDays = useMemo(() => {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const offset = (firstDayIndex + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: Array<{ dayNum: number; dateStr: string; hasProgress: boolean; isToday: boolean }> = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const log = dailyLogs[dateStr];
      const hasProgress = Boolean(log && log.completedTaskIds && log.completedTaskIds.length > 0);
      days.push({
        dayNum: i,
        dateStr,
        hasProgress,
        isToday: dateStr === todayKey,
      });
    }
    return { offset, days, year, month };
  }, [currentCalendarDate, dailyLogs, todayKey]);

  return (
    <div
      id="vibeContainer"
      className={`flex-1 overflow-y-auto p-3.5 space-y-3.5 pb-20 transition-colors ${
        isIOS
          ? 'bg-[#000000] text-white font-sans'
          : isLight
          ? 'bg-[#ECEEE9] text-[#1E2520]'
          : 'bg-[#121212] text-white'
      }`}
    >
      {/* Top Header: VIBE // Вайб & Selected Date & Mode button */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1
            className={`text-2xl font-black tracking-wider flex items-center gap-1.5 ${
              isIOS ? 'font-semibold tracking-tight' : 'font-mono'
            }`}
          >
            <span className={isLight ? 'text-[#1E2520]' : 'text-white'}>VIBE</span>
            <span
              className={
                isIOS
                  ? 'text-[#34C759]'
                  : isLight
                  ? 'text-[#1E4D38]'
                  : 'text-[#00E676]'
              }
            >
              // Вайб
            </span>
          </h1>
          <p
            className={`text-xs capitalize mt-0.5 font-medium ${
              isLight ? 'text-neutral-600' : 'text-white/60'
            }`}
          >
            {formattedSelectedDate}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            triggerVibration('selection');
            setIsModesDrawerOpen(true);
          }}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            isIOS
              ? 'bg-[#1C1C1E] text-[#34C759] border border-white/10 active:scale-95'
              : isLight
              ? 'bg-[#F8FAF7] text-[#1E2520] border border-[#D8DFD5] hover:border-[#1E4D38] shadow-2xs active:scale-95'
              : 'bg-[#1E1E1E] text-white/90 border border-white/10 hover:border-[#00E676]/40 active:scale-95'
          }`}
        >
          <Sliders className={`w-3.5 h-3.5 ${isLight ? 'text-[#1E4D38]' : 'text-[#00E676]'}`} />
          <span>Режим</span>
        </button>
      </div>

      {/* Main Today / Day Card */}
      <div
        className={`p-4 rounded-2xl border transition-all ${
          isIOS
            ? 'bg-[#1C1C1E] border-white/10 shadow-lg'
            : isLight
            ? 'bg-[#F8FAF7] border-[#D8DFD5] text-[#1E2520] shadow-xs'
            : 'bg-[#1A1A1A] border-white/10 shadow-md'
        }`}
      >
        <div className="flex items-center justify-between mb-1.5">
          <h2 className="text-base font-bold">
            {selectedDateKey === todayKey ? 'Сегодня' : formattedSelectedDate}
          </h2>
          <span
            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
              shiftStatus.isWork
                ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
            }`}
          >
            {shiftStatus.tag}
          </span>
        </div>

        <p className={`text-xs mb-3.5 ${isLight ? 'text-neutral-500' : 'text-white/60'}`}>
          {shiftStatus.label}
        </p>

        {/* Big Percentage & Progress Bar */}
        <div className="mb-4">
          <div className="flex items-baseline justify-between mb-1">
            <span
              className={`text-4xl font-black ${
                isIOS ? 'text-[#34C759]' : isLight ? 'text-[#1E4D38]' : 'text-[#00E676]'
              }`}
            >
              {progressPercentage}%
            </span>
            <span className={`text-xs ${isLight ? 'text-neutral-500' : 'text-white/60'}`}>
              выполнение базовых блоков
            </span>
          </div>

          <div
            className={`w-full h-2.5 rounded-full overflow-hidden border ${
              isLight
                ? 'bg-[#E3E8E0] border-[#D0D8CD]'
                : 'bg-black/40 border-white/5'
            }`}
          >
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isIOS ? 'bg-[#34C759]' : isLight ? 'bg-[#1E4D38]' : 'bg-[#00E676]'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Segmented Energy Level Selector */}
        <div className="mb-4">
          <label
            className={`block text-xs font-semibold mb-1.5 ${
              isLight ? 'text-[#1E2520]' : 'text-white/70'
            }`}
          >
            Состояние / энергия
          </label>
          <div
            className={`grid grid-cols-3 gap-1.5 p-1 rounded-xl border ${
              isLight ? 'bg-[#EAEFE8] border-[#D0D8CD]' : 'bg-black/40 border-white/5'
            }`}
          >
            {(['low', 'normal', 'high'] as const).map(lvl => {
              const label = lvl === 'low' ? 'низкая' : lvl === 'normal' ? 'нормальная' : 'высокая';
              const isSelected = currentLog.energy === lvl;
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => {
                    triggerVibration('selection');
                    updateCurrentLog({ energy: lvl });
                  }}
                  className={`py-2 text-xs font-medium rounded-lg transition-all cursor-pointer text-center capitalize ${
                    isSelected
                      ? isIOS
                        ? 'bg-[#34C759] text-black font-bold shadow-sm'
                        : isLight
                        ? 'bg-[#1E4D38] text-white font-bold shadow-xs'
                        : 'bg-[#00E676] text-black font-bold shadow-sm'
                      : isLight
                      ? 'text-neutral-600 hover:text-black hover:bg-black/5'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Day Level Target (Минимум / Норма / Максимум) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div>
              <span className={`text-xs font-bold ${isLight ? 'text-[#1E2520]' : 'text-white'}`}>
                Уровень дня
              </span>
              <p className={`text-[11px] ${isLight ? 'text-neutral-500' : 'text-white/50'}`}>
                Оцени не идеальность, а реальную нагрузку.
              </p>
            </div>
            <span
              className={`text-xs font-mono font-bold ${
                isLight ? 'text-[#1E4D38]' : 'text-[#00E676]'
              }`}
            >
              {completedTasksCount} из {totalTasksCount}
            </span>
          </div>

          <div className="space-y-2 mt-2">
            {[
              { id: 'min', name: 'Минимум', desc: 'База, когда сил мало', icon: '🟢' },
              { id: 'norm', name: 'Норма', desc: 'Обычный продуктивный день', icon: '🟠' },
              { id: 'max', name: 'Максимум', desc: 'Есть энергия — двигаем всё', icon: '🔥' },
            ].map(opt => {
              const isSelected = currentLog.level === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    triggerVibration('selection');
                    updateCurrentLog({ level: opt.id as 'min' | 'norm' | 'max' });
                  }}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? isLight
                        ? 'border-[#1E4D38] bg-[#EAF2EC] ring-1 ring-[#1E4D38]/30 shadow-xs'
                        : 'border-[#00E676] bg-[#00E676]/10 ring-1 ring-[#00E676]/30'
                      : isLight
                      ? 'border-[#DCE2DA] bg-[#FFFFFF] hover:border-[#CBD4C8]'
                      : 'border-white/10 bg-black/20 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{opt.icon}</span>
                    <div>
                      <div className={`text-xs font-bold ${isLight ? 'text-[#1E2520]' : 'text-white'}`}>
                        {opt.name}
                      </div>
                      <div className={`text-[11px] ${isLight ? 'text-neutral-500' : 'text-white/60'}`}>
                        {opt.desc}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <span
                      className={`font-mono text-xs font-bold ${
                        isLight ? 'text-[#1E4D38]' : 'text-[#00E676]'
                      }`}
                    >
                      АКТИВНО
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* PHONE & SYSTEM ACTIVITY TRACKER (Health Connect / Sensors) */}
      <PhoneActivityCard
        stats={currentLog.activityStats || DEFAULT_ACTIVITY}
        onUpdateStats={newStats => updateCurrentLog({ activityStats: newStats })}
        theme={theme}
      />

      {/* Routine Habit Categories (Checkable and fully editable) */}
      <div className="space-y-3.5">
        {categories.map(category => {
          return (
            <div
              key={category.id}
              className={`p-4 rounded-2xl border transition-all ${
                isIOS
                  ? 'bg-[#1C1C1E] border-white/10'
                  : isLight
                  ? 'bg-[#F8FAF7] border-[#D8DFD5] text-[#1E2520] shadow-xs'
                  : 'bg-[#1E1E1E] border-white/10 text-white'
              }`}
            >
              {/* Category Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{category.icon}</span>
                  <div>
                    <h3 className={`font-bold text-sm ${isLight ? 'text-[#1E2520]' : 'text-white'}`}>
                      {category.name}
                    </h3>
                    <p className={`text-[11px] ${isLight ? 'text-neutral-500' : 'text-white/50'}`}>
                      {category.subtitle}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  title="Добавить пункт"
                  onClick={() => {
                    triggerVibration('selection');
                    setTargetCategoryId(category.id);
                    setTaskFormTitle('');
                    setTaskFormSubtitle('');
                    setTaskFormLevel('min');
                    setIsAddTaskModalOpen(true);
                  }}
                  className={`p-1.5 rounded-xl transition-colors ${
                    isLight
                      ? 'text-[#1E4D38] hover:bg-[#1E4D38]/10'
                      : 'text-[#00E676] hover:bg-[#00E676]/10'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Habit Items */}
              <div className="space-y-2 mt-2.5">
                {category.items.map(item => {
                  const completed = isTaskCompleted(item.id);
                  return (
                    <div
                      key={item.id}
                      className={`group p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                        completed
                          ? isLight
                            ? 'bg-[#EAF2EC] border-[#1E4D38]/30 text-[#1E4D38]'
                            : 'bg-[#1B4D3E]/30 border-[#00E676]/30'
                          : isLight
                          ? 'bg-[#FFFFFF] border-[#D8DFD5] hover:border-[#CBD4C8]'
                          : 'bg-black/20 border-white/5 hover:border-white/15'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleTask(item.id)}
                        className="flex-1 flex items-start gap-2.5 text-left cursor-pointer mr-2"
                      >
                        <div className={`mt-0.5 ${isLight ? 'text-[#1E4D38]' : 'text-[#00E676]'}`}>
                          {completed ? (
                            <CheckCircle2
                              className={`w-5 h-5 ${
                                isLight
                                  ? 'fill-[#1E4D38] text-white'
                                  : 'fill-[#00E676] text-black'
                              }`}
                            />
                          ) : (
                            <Circle
                              className={`w-5 h-5 ${
                                isLight ? 'text-neutral-400' : 'text-white/40'
                              }`}
                            />
                          )}
                        </div>
                        <div>
                          <div
                            className={`text-xs font-semibold ${
                              completed
                                ? isLight
                                  ? 'line-through text-neutral-400'
                                  : 'line-through text-white/50'
                                : isLight
                                ? 'text-[#1E2520]'
                                : 'text-white'
                            }`}
                          >
                            {item.title}
                          </div>
                          {item.subtitle && (
                            <div
                              className={`text-[11px] ${
                                isLight ? 'text-neutral-500' : 'text-white/50'
                              }`}
                            >
                              {item.subtitle}
                            </div>
                          )}
                        </div>
                      </button>

                      {/* Edit / Delete actions */}
                      <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          aria-label="Редактировать задачу"
                          onClick={() => {
                            triggerVibration('selection');
                            setEditingTask({ categoryId: category.id, task: item });
                            setTaskFormTitle(item.title);
                            setTaskFormSubtitle(item.subtitle);
                            setTaskFormLevel(item.level);
                          }}
                          className={`p-1 rounded ${
                            isLight
                              ? 'text-neutral-400 hover:text-black hover:bg-black/5'
                              : 'text-white/40 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          aria-label="Удалить задачу"
                          onClick={() => handleDeleteTask(category.id, item.id)}
                          className="p-1 text-red-400/60 hover:text-red-500 hover:bg-red-500/10 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Rest / Recreation block */}
      <div
        className={`p-4 rounded-2xl border transition-all ${
          isIOS
            ? 'bg-[#1C1C1E] border-white/10'
            : isLight
            ? 'bg-[#F8FAF7] border-[#D8DFD5] text-[#1E2520] shadow-xs'
            : 'bg-[#1E1E1E] border-white/10 text-white'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎮</span>
            <div>
              <h3 className={`font-bold text-sm ${isLight ? 'text-[#1E2520]' : 'text-white'}`}>
                Отдых
              </h3>
              <p className={`text-[11px] ${isLight ? 'text-neutral-500' : 'text-white/50'}`}>
                Игра может оставаться отдыхом
              </p>
            </div>
          </div>
        </div>

        {/* Rest tag chips */}
        <div className="flex flex-wrap gap-2 mt-3">
          {restTags.map(tag => {
            const isSelected = (currentLog.restTags || []).includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => handleToggleRestTag(tag)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                  isSelected
                    ? isIOS
                      ? 'bg-[#34C759] text-black border-[#34C759] font-bold'
                      : isLight
                      ? 'bg-[#1E4D38] text-white border-[#1E4D38] font-bold shadow-2xs'
                      : 'bg-[#00E676] text-black border-[#00E676] font-bold'
                    : isLight
                    ? 'bg-[#FFFFFF] text-[#2C352E] border-[#D8DFD5] hover:border-[#CBD4C8]'
                    : 'bg-black/30 text-white/80 border-white/10 hover:border-white/20'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>

        {/* Add new rest chip */}
        <div className="flex items-center gap-2 mt-3">
          <input
            type="text"
            value={newRestTag}
            onChange={e => setNewRestTag(e.target.value)}
            placeholder="Свой вариант отдыха..."
            className={`flex-1 px-3 py-1.5 border rounded-xl text-xs focus:outline-none transition-colors ${
              isLight
                ? 'bg-[#FFFFFF] border-[#D8DFD5] text-black placeholder:text-neutral-400 focus:border-[#1E4D38]'
                : 'bg-black/40 border-white/10 rounded-lg text-white focus:border-[#00E676]'
            }`}
          />
          <button
            type="button"
            disabled={!newRestTag.trim()}
            onClick={() => {
              if (newRestTag.trim() && !restTags.includes(newRestTag.trim())) {
                triggerVibration('selection');
                setRestTags(prev => [...prev, newRestTag.trim()]);
                handleToggleRestTag(newRestTag.trim());
                setNewRestTag('');
              }
            }}
            className={`px-3 py-1.5 disabled:opacity-40 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
              isLight
                ? 'bg-[#1E4D38] hover:bg-[#163b2a] text-white'
                : 'bg-[#1B4D3E] hover:bg-[#236652] text-white'
            }`}
          >
            Добавить
          </button>
        </div>
      </div>

      {/* Voice & Text Day Journal */}
      <div
        className={`p-4 rounded-2xl border transition-all ${
          isIOS
            ? 'bg-[#1C1C1E] border-white/10'
            : isLight
            ? 'bg-[#F8FAF7] border-[#D8DFD5] text-[#1E2520] shadow-xs'
            : 'bg-[#1E1E1E] border-white/10 text-white'
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">🎙</span>
          <h3 className={`font-bold text-sm ${isLight ? 'text-[#1E2520]' : 'text-white'}`}>
            Дневник дня
          </h3>
        </div>
        <p className={`text-xs font-medium mb-1 ${isLight ? 'text-neutral-700' : 'text-white/80'}`}>
          Расскажи голосом, как реально прошёл день
        </p>
        <p className={`text-[11px] leading-relaxed mb-3 ${isLight ? 'text-neutral-500' : 'text-white/50'}`}>
          Не нужно отвечать по пунктам. Просто говори как есть — от 30 секунд до нескольких минут.
        </p>

        {/* Record trigger button */}
        <div className="flex items-center gap-3 mb-3">
          <button
            type="button"
            onClick={handleToggleJournalRecord}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isRecordingJournal
                ? 'bg-[#D32F2F] text-white ring-4 ring-red-500/40 animate-pulse'
                : isIOS
                ? 'bg-[#34C759] text-black shadow-md'
                : isLight
                ? 'bg-[#1E4D38] text-white hover:bg-[#163b2a] shadow-sm'
                : 'bg-[#00E676] text-black hover:bg-[#00c864] shadow-md'
            }`}
          >
            {isRecordingJournal ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <div>
            <div className={`text-xs font-bold ${isLight ? 'text-[#1E2520]' : 'text-white'}`}>
              {isRecordingJournal ? 'Идёт голосовая запись...' : recordingStatus}
            </div>
            <div className={`text-[11px] ${isLight ? 'text-neutral-500' : 'text-white/50'}`}>
              {isRecordingJournal ? 'Говорите вслух' : 'Нажмите микрофон для старта'}
            </div>
          </div>
        </div>

        {/* Editable Story Box */}
        <textarea
          rows={3}
          value={currentLog.journalText}
          onChange={e => updateCurrentLog({ journalText: e.target.value })}
          placeholder="Здесь появится текст твоего рассказа. Можно также вводить или редактировать вручную."
          className={`w-full p-3 border rounded-xl text-xs leading-relaxed resize-none focus:outline-none transition-colors ${
            isLight
              ? 'bg-[#FFFFFF] border-[#D8DFD5] text-black placeholder:text-neutral-400 focus:border-[#1E4D38]'
              : 'bg-black/40 border-white/10 text-white focus:border-[#00E676]'
          }`}
        />

        <div className="flex items-center justify-between mt-2">
          <span className={`text-[10px] ${isLight ? 'text-neutral-400' : 'text-white/40'}`}>
            {currentLog.journalText ? `${currentLog.journalText.length} символов` : 'Нет текста'}
          </span>
          <button
            type="button"
            onClick={() => {
              triggerVibration('commandSuccess');
              soundManager.playCommandSuccess();
              generateObservation(currentLog.journalText, currentLog);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer ${
              isLight
                ? 'bg-[#1E4D38] hover:bg-[#163b2a] text-white shadow-xs'
                : 'bg-[#1B4D3E] hover:bg-[#236652] text-white'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isLight ? 'text-[#6EE7B7]' : 'text-[#00E676]'}`} />
            <span>Сформировать разбор</span>
          </button>
        </div>
      </div>

      {/* AI / Assistant Observation (Черновой разбор) */}
      <div
        className={`p-4 rounded-2xl border transition-all ${
          isIOS
            ? 'bg-[#1C1C1E] border-white/10'
            : isLight
            ? 'bg-[#F8FAF7] border-[#D8DFD5] text-[#1E2520] shadow-xs'
            : 'bg-[#1E1E1E] border-white/10 text-white'
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">🧠</span>
          <h3 className={`font-bold text-sm ${isLight ? 'text-[#1E2520]' : 'text-white'}`}>
            Черновой разбор
          </h3>
        </div>
        <p className={`text-[11px] leading-relaxed mb-2 ${isLight ? 'text-neutral-500' : 'text-white/50'}`}>
          После записи приложение сопоставит дневник с выполненными блоками и покажет простые наблюдения.
        </p>

        <div
          className={`p-3 border rounded-xl text-xs leading-relaxed min-h-[50px] ${
            isLight
              ? 'bg-[#FFFFFF] border-[#D8DFD5] text-[#1E2520]'
              : 'bg-black/30 border-white/5 text-white/90'
          }`}
        >
          {currentLog.analysisText ||
            'Разбор появится автоматически при сохранении дневника или нажатии кнопки «Сформировать разбор».'}
        </div>
      </div>

      {/* Statistics & Calendar Section */}
      <div
        className={`p-4 rounded-2xl border transition-all ${
          isIOS
            ? 'bg-[#1C1C1E] border-white/10'
            : isLight
            ? 'bg-[#F8FAF7] border-[#D8DFD5] text-[#1E2520] shadow-xs'
            : 'bg-[#1E1E1E] border-white/10 text-white'
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">📊</span>
          <h3 className={`font-bold text-sm ${isLight ? 'text-[#1E2520]' : 'text-white'}`}>
            Статистика
          </h3>
        </div>
        <p className={`text-[11px] mb-3 ${isLight ? 'text-neutral-500' : 'text-white/50'}`}>
          Считаем выполнение текущей системы, а не «идеальную жизнь»
        </p>

        {/* 2 Stat Cards */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <div
            className={`p-3 border rounded-xl ${
              isLight
                ? 'bg-[#FFFFFF] border-[#D8DFD5] shadow-2xs'
                : 'bg-black/30 border-white/5'
            }`}
          >
            <div
              className={`text-2xl font-black ${
                isLight ? 'text-[#1E4D38]' : 'text-[#00E676]'
              }`}
            >
              {stats.daysWithProgress}
            </div>
            <div className={`text-[11px] ${isLight ? 'text-neutral-500' : 'text-white/60'}`}>
              дней с прогрессом
            </div>
          </div>
          <div
            className={`p-3 border rounded-xl ${
              isLight
                ? 'bg-[#FFFFFF] border-[#D8DFD5] shadow-2xs'
                : 'bg-black/30 border-white/5'
            }`}
          >
            <div
              className={`text-2xl font-black ${
                isLight ? 'text-[#1E4D38]' : 'text-[#00E676]'
              }`}
            >
              {stats.avgPercentage}%
            </div>
            <div className={`text-[11px] ${isLight ? 'text-neutral-500' : 'text-white/60'}`}>
              среднее выполнение
            </div>
          </div>
        </div>

        {/* Calendar Widget */}
        <div
          className={`p-3 border rounded-xl ${
            isLight
              ? 'bg-[#FFFFFF] border-[#D8DFD5] shadow-2xs'
              : 'bg-black/30 border-white/5'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  triggerVibration('selection');
                  setCurrentCalendarDate(
                    new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() - 1, 1)
                  );
                }}
                className={`p-1 rounded ${
                  isLight
                    ? 'text-neutral-600 hover:text-black hover:bg-black/5'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className={`text-xs font-bold capitalize ${isLight ? 'text-[#1E2520]' : 'text-white'}`}>
                {MONTH_NAMES_RU[calendarDays.month]} {calendarDays.year} г.
              </span>
              <button
                type="button"
                onClick={() => {
                  triggerVibration('selection');
                  setCurrentCalendarDate(
                    new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 1)
                  );
                }}
                className={`p-1 rounded ${
                  isLight
                    ? 'text-neutral-600 hover:text-black hover:bg-black/5'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                triggerVibration('selection');
                setSelectedDateKey(todayKey);
                setCurrentCalendarDate(new Date());
              }}
              className={`text-xs font-semibold hover:underline cursor-pointer ${
                isLight ? 'text-[#1E4D38]' : 'text-[#00E676]'
              }`}
            >
              Сегодня
            </button>
          </div>

          {/* Weekday headers */}
          <div
            className={`grid grid-cols-7 gap-1 text-center text-[10px] font-semibold mb-1 ${
              isLight ? 'text-neutral-400' : 'text-white/40'
            }`}
          >
            <span>ПН</span>
            <span>ВТ</span>
            <span>СР</span>
            <span>ЧТ</span>
            <span>ПТ</span>
            <span>СБ</span>
            <span>ВС</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {Array.from({ length: calendarDays.offset }).map((_, idx) => (
              <div key={`offset-${idx}`} className="h-8" />
            ))}

            {calendarDays.days.map(d => {
              const isSelected = d.dateStr === selectedDateKey;
              return (
                <button
                  key={d.dateStr}
                  type="button"
                  onClick={() => {
                    triggerVibration('selection');
                    setSelectedDateKey(d.dateStr);
                  }}
                  className={`h-8 rounded-lg text-xs font-medium flex flex-col items-center justify-center relative transition-all cursor-pointer ${
                    isSelected
                      ? isIOS
                        ? 'border-2 border-[#34C759] bg-[#34C759]/20 font-bold text-white'
                        : isLight
                        ? 'border-2 border-[#1E4D38] bg-[#EAF2EC] font-bold text-[#1E4D38]'
                        : 'border-2 border-[#00E676] bg-[#00E676]/20 font-bold text-white'
                      : d.isToday
                      ? isLight
                        ? 'border border-[#1E4D38] text-[#1E4D38]'
                        : 'border border-white/40 text-white'
                      : isLight
                      ? 'text-neutral-700 hover:bg-neutral-100'
                      : 'text-white/70 hover:bg-white/5'
                  }`}
                >
                  <span>{d.dayNum}</span>
                  {d.hasProgress && (
                    <span
                      className={`w-1 h-1 rounded-full absolute bottom-1 ${
                        isLight ? 'bg-[#1E4D38]' : 'bg-[#00E676]'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center py-2">
        <p className={`text-[11px] font-mono ${isLight ? 'text-neutral-400' : 'text-white/40'}`}>
          VIBE // ВАЙБ · локальные данные сохраняются на устройстве
        </p>
      </div>

      {/* MODAL: Modes & Settings Drawer */}
      {isModesDrawerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in"
          onClick={() => setIsModesDrawerOpen(false)}
        >
          <div
            className={`w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 border shadow-2xl ${
              isLight
                ? 'bg-[#F9FAF8] border-[#D5DAD1] text-[#1F2421]'
                : 'bg-[#1E1E1E] border-white/10 text-white'
            }`}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Sliders className={`w-4 h-4 ${isLight ? 'text-[#1E4D38]' : 'text-[#00E676]'}`} />
                <span>Режимы расписания</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModesDrawerOpen(false)}
                className="w-7 h-7 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className={`text-xs mb-4 ${isLight ? 'text-neutral-500' : 'text-white/60'}`}>
              Рабочий режим выключен по умолчанию
            </p>

            {/* Toggle 2/2 Shift */}
            <div
              className={`p-3 rounded-2xl border mb-4 flex items-center justify-between ${
                isLight ? 'bg-white border-[#D5DAD1]' : 'bg-black/30 border-white/10'
              }`}
            >
              <div className="mr-3">
                <div className="text-sm font-bold flex items-center gap-1.5">
                  <span>🔴</span> Работа 2/2
                </div>
                <div className={`text-[11px] mt-0.5 leading-snug ${isLight ? 'text-neutral-500' : 'text-white/60'}`}>
                  После включения применяется с текущей даты и не удаляет историю.
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={settings.workShiftMode}
                  onChange={e => {
                    triggerVibration('modeSwitch');
                    setSettings(prev => ({
                      ...prev,
                      workShiftMode: e.target.checked,
                      workShiftStartDate: todayKey,
                    }));
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00E676]"></div>
              </label>
            </div>

            {/* Reset data button */}
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Сбросить все данные трекера и вернуть настройки по умолчанию?')) {
                  triggerVibration('commandError');
                  setCategories(DEFAULT_CATEGORIES);
                  setDailyLogs({});
                  setSettings({ workShiftMode: false, workShiftStartDate: todayKey });
                  setIsModesDrawerOpen(false);
                }
              }}
              className="w-full py-2.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/40 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Сбросить данные
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Add Custom Task */}
      {isAddTaskModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in"
          onClick={() => setIsAddTaskModalOpen(false)}
        >
          <div
            className={`w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-5 border shadow-2xl ${
              isLight
                ? 'bg-[#F9FAF8] border-[#D5DAD1] text-[#1F2421]'
                : 'bg-[#1E1E1E] border-white/10 text-white'
            }`}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <h3 className="font-bold text-sm">Добавить задачу</h3>
              <button
                type="button"
                onClick={() => setIsAddTaskModalOpen(false)}
                className="w-7 h-7 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block opacity-70 mb-1 font-medium">Название задачи</label>
                <input
                  type="text"
                  value={taskFormTitle}
                  onChange={e => setTaskFormTitle(e.target.value)}
                  placeholder="Например: Растяжка"
                  className={`w-full px-3 py-2 border rounded-xl focus:outline-none ${
                    isLight
                      ? 'bg-white border-[#D5DAD1] text-black focus:border-[#1E4D38]'
                      : 'bg-black/40 border-white/10 text-white focus:border-[#00E676]'
                  }`}
                />
              </div>

              <div>
                <label className="block opacity-70 mb-1 font-medium">Описание / пояснение</label>
                <input
                  type="text"
                  value={taskFormSubtitle}
                  onChange={e => setTaskFormSubtitle(e.target.value)}
                  placeholder="Например: 10 минут после сна"
                  className={`w-full px-3 py-2 border rounded-xl focus:outline-none ${
                    isLight
                      ? 'bg-white border-[#D5DAD1] text-black focus:border-[#1E4D38]'
                      : 'bg-black/40 border-white/10 text-white focus:border-[#00E676]'
                  }`}
                />
              </div>

              <div>
                <label className="block opacity-70 mb-1 font-medium">Категория нагрузки</label>
                <select
                  value={taskFormLevel}
                  onChange={e => setTaskFormLevel(e.target.value as 'min' | 'norm' | 'max')}
                  className={`w-full px-3 py-2 border rounded-xl focus:outline-none ${
                    isLight
                      ? 'bg-white border-[#D5DAD1] text-black focus:border-[#1E4D38]'
                      : 'bg-black/40 border-white/10 text-white focus:border-[#00E676]'
                  }`}
                >
                  <option value="min">Минимум (базовый пункт)</option>
                  <option value="norm">Норма (обычный продуктивный)</option>
                  <option value="max">Максимум (повышенная нагрузка)</option>
                </select>
              </div>

              <button
                type="button"
                disabled={!taskFormTitle.trim()}
                onClick={handleSaveNewTask}
                className="w-full py-2.5 mt-2 bg-[#00E676] hover:bg-[#00c864] disabled:opacity-40 text-black font-bold rounded-xl transition-colors cursor-pointer"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Edit Task */}
      {editingTask && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in"
          onClick={() => setEditingTask(null)}
        >
          <div
            className={`w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-5 border shadow-2xl ${
              isLight
                ? 'bg-[#F9FAF8] border-[#D5DAD1] text-[#1F2421]'
                : 'bg-[#1E1E1E] border-white/10 text-white'
            }`}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <h3 className="font-bold text-sm">Редактировать задачу</h3>
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                className="w-7 h-7 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block opacity-70 mb-1 font-medium">Название задачи</label>
                <input
                  type="text"
                  value={taskFormTitle}
                  onChange={e => setTaskFormTitle(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-xl focus:outline-none ${
                    isLight
                      ? 'bg-white border-[#D5DAD1] text-black focus:border-[#1E4D38]'
                      : 'bg-black/40 border-white/10 text-white focus:border-[#00E676]'
                  }`}
                />
              </div>

              <div>
                <label className="block opacity-70 mb-1 font-medium">Описание</label>
                <input
                  type="text"
                  value={taskFormSubtitle}
                  onChange={e => setTaskFormSubtitle(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-xl focus:outline-none ${
                    isLight
                      ? 'bg-white border-[#D5DAD1] text-black focus:border-[#1E4D38]'
                      : 'bg-black/40 border-white/10 text-white focus:border-[#00E676]'
                  }`}
                />
              </div>

              <div>
                <label className="block opacity-70 mb-1 font-medium">Уровень нагрузки</label>
                <select
                  value={taskFormLevel}
                  onChange={e => setTaskFormLevel(e.target.value as 'min' | 'norm' | 'max')}
                  className={`w-full px-3 py-2 border rounded-xl focus:outline-none ${
                    isLight
                      ? 'bg-white border-[#D5DAD1] text-black focus:border-[#1E4D38]'
                      : 'bg-black/40 border-white/10 text-white focus:border-[#00E676]'
                  }`}
                >
                  <option value="min">Минимум</option>
                  <option value="norm">Норма</option>
                  <option value="max">Максимум</option>
                </select>
              </div>

              <button
                type="button"
                disabled={!taskFormTitle.trim()}
                onClick={handleSaveEditedTask}
                className="w-full py-2.5 mt-2 bg-[#00E676] hover:bg-[#00c864] disabled:opacity-40 text-black font-bold rounded-xl transition-colors cursor-pointer"
              >
                Применить изменения
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
