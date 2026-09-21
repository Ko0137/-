import React, { useState } from 'react';
import {
  SettingsState,
  AppTheme,
  CurrencyCode,
  WidgetStyle,
  CustomMacroCommand,
  MacroAction,
  MacroActionType,
  MicSoundEffect,
} from '../types';
import { triggerVibration, soundManager } from '../utils/sound';
import { APP_ICONS, applyAppIcon, getSavedAppIconId } from '../utils/appIcons';
import {
  Trash2,
  Plus,
  ArrowLeft,
  Smartphone,
  Moon,
  Sun,
  Zap,
  Play,
  Layers,
  HelpCircle,
  Download,
  Upload,
  Coins,
  Music,
  Flashlight,
  Volume2,
  FileText,
  Clock,
  Sparkles,
  Check,
  Sliders,
  Palette,
  Mic,
} from 'lucide-react';
import { CURRENCY_LIST } from '../utils/currency';
import { SYSTEM_APPS } from '../services/commandProcessor';

const DEFAULT_MACROS: CustomMacroCommand[] = [
  {
    id: 'macro_music',
    name: 'Включи музыку',
    trigger: 'включи музыку',
    actions: [
      { id: '1', type: 'say', payload: 'Открываю Яндекс Музыку и включаю трек' },
      { id: '2', type: 'open_app', payload: 'yandex_music' },
      { id: '3', type: 'delay', payload: '400' },
      { id: '4', type: 'music_toggle', payload: '' },
    ],
  },
  {
    id: 'macro_morning',
    name: 'Утренний сценарий',
    trigger: 'утренний сценарий',
    actions: [
      { id: '1', type: 'say', payload: 'Доброе утро! Проверяю прогноз погоды' },
      { id: '2', type: 'open_app', payload: 'weather' },
      { id: '3', type: 'delay', payload: '600' },
      { id: '4', type: 'read_notes', payload: '' },
    ],
  },
  {
    id: 'macro_night',
    name: 'Ночной режим',
    trigger: 'ночной режим',
    actions: [
      { id: '1', type: 'say', payload: 'Активирую ночной режим' },
      { id: '2', type: 'torch_toggle', payload: '' },
      { id: '3', type: 'set_alarm', payload: '07:30' },
    ],
  },
];

const MIC_SOUND_PROFILES: { id: MicSoundEffect; name: string; desc: string; icon: string }[] = [
  { id: 'classic_beep', name: 'Классический L.I.R.A.', desc: 'Фирменный двухтональный сигнал включения и выключения', icon: '🔔' },
  { id: 'soft_click', name: 'Мягкий клик', desc: 'Короткий тактильный щелчок без резкого звука', icon: '🔘' },
  { id: 'tech_chime', name: 'Hi-Tech аккорд', desc: 'Современный гармоничный перелив двух тонов', icon: '✨' },
  { id: 'cyber_chirp', name: 'Кибер-чирп', desc: 'Футуристический восходящий свип в стиле sci-fi', icon: '⚡' },
  { id: 'bubble_pop', name: 'Мягкий пузырёк (Pop)', desc: 'Округлый природный щелчок', icon: '🫧' },
  { id: 'gentle_bell', name: 'Нежный колокольчик', desc: 'Кристальный чистый перезвон высокой частоты', icon: '🎐' },
  { id: 'none', name: 'Без звука', desc: 'Только вибрация, полная тишина при записи', icon: '🔇' },
];

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SettingsState;
  onSaveSettings: (newSettings: SettingsState) => void;
  onClearChatHistory: () => void;
  onOpenPrivacy: () => void;
  onOpenWidgetInfo: () => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onClearChatHistory,
  onOpenPrivacy,
  onOpenWidgetInfo,
}) => {
  const [userName, setUserName] = useState(settings.userName);
  const [theme, setTheme] = useState<AppTheme>(settings.theme || (settings.darkTheme ? 'dark' : 'light'));
  const [voiceEnabled, setVoiceEnabled] = useState(settings.voiceEnabled);
  const [femaleVoice, setFemaleVoice] = useState(settings.femaleVoice);
  const [quietMode, setQuietMode] = useState(settings.quietMode);
  const [widgetEnabled, setWidgetEnabled] = useState(settings.widgetEnabled);
  const [widgetStyle, setWidgetStyle] = useState<WidgetStyle>(settings.widgetStyle || 'orb');
  const [primaryCurrency, setPrimaryCurrency] = useState<CurrencyCode>(settings.primaryCurrency || 'RUB');
  const [micSoundEffect, setMicSoundEffect] = useState<MicSoundEffect>(settings.micSoundEffect || 'classic_beep');
  const [selectedAppIcon, setSelectedAppIcon] = useState<string>(() => settings.appIcon || getSavedAppIconId());

  const [customCommands, setCustomCommands] = useState<Record<string, string>>(settings.customCommands || {});
  const [macroCommands, setMacroCommands] = useState<CustomMacroCommand[]>(() => {
    if (settings.macroCommands && settings.macroCommands.length > 0) {
      return settings.macroCommands;
    }
    return DEFAULT_MACROS;
  });

  // Navigation tab inside settings
  const [activeTab, setActiveTab] = useState<'appearance' | 'audio' | 'macros' | 'backup'>('appearance');

  // Simple command form state
  const [customKey, setCustomKey] = useState('');
  const [customVal, setCustomVal] = useState('');

  // Macro creation form state
  const [macroName, setMacroName] = useState('');
  const [macroTrigger, setMacroTrigger] = useState('');
  const [macroActions, setMacroActions] = useState<MacroAction[]>([]);
  
  // Pending action item form
  const [actionType, setActionType] = useState<MacroActionType>('say');
  const [actionPayload, setActionPayload] = useState('');

  const [notification, setNotification] = useState<string | null>(null);

  if (!isOpen) return null;

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  const handleSelectIcon = (iconId: string) => {
    triggerVibration('commandSuccess');
    setSelectedAppIcon(iconId);
    applyAppIcon(iconId);
    showNotification('Значок приложения успешно обновлен!');
  };

  const handleAddCustomCommand = () => {
    if (!customKey.trim() || !customVal.trim()) return;
    const updated = { ...customCommands, [customKey.trim()]: customVal.trim() };
    setCustomCommands(updated);
    setCustomKey('');
    setCustomVal('');
    triggerVibration('commandSuccess');
    showNotification('Команда сохранена!');
  };

  const handleDeleteCustomCommand = (key: string) => {
    const updated = { ...customCommands };
    delete updated[key];
    setCustomCommands(updated);
    triggerVibration('warningPulse');
  };

  // Add sub-action to new macro
  const handleAddActionToMacro = () => {
    if (actionType === 'say' && !actionPayload.trim()) return;
    if (actionType === 'open_app' && !actionPayload.trim()) return;
    if (actionType === 'set_alarm' && !actionPayload.trim()) return;

    let label = '';
    if (actionType === 'say') label = `Сказать: «${actionPayload}»`;
    else if (actionType === 'open_app') {
      const app = SYSTEM_APPS.find(a => a.id === actionPayload);
      label = `Запустить: ${app?.name || actionPayload}`;
    } else if (actionType === 'music_toggle') label = 'Музыка: Переключить трек / Play';
    else if (actionType === 'torch_toggle') label = 'Фонарик: Включить / Выключить';
    else if (actionType === 'read_notes') label = 'Заметки: Зачитать список вслух';
    else if (actionType === 'set_alarm') label = `Будильник: Установить на ${actionPayload}`;
    else if (actionType === 'delay') label = `Пауза: ${actionPayload || '500'} мс`;

    const newAction: MacroAction = {
      id: Date.now().toString() + Math.random().toString().slice(2, 6),
      type: actionType,
      payload: actionPayload,
      label,
    };

    setMacroActions(prev => [...prev, newAction]);
    setActionPayload('');
    triggerVibration('selection');
  };

  const handleSaveNewMacro = () => {
    if (!macroTrigger.trim() || macroActions.length === 0) {
      showNotification('Укажите фразу-триггер и добавьте хотя бы 1 действие!');
      return;
    }

    triggerVibration('commandSuccess');
    const newMacro: CustomMacroCommand = {
      id: Date.now().toString(),
      name: macroName.trim() || macroTrigger.trim(),
      trigger: macroTrigger.trim(),
      actions: macroActions,
    };
    setMacroCommands(prev => [...prev, newMacro]);
    setMacroName('');
    setMacroTrigger('');
    setMacroActions([]);
    showNotification(`Сценарий «${newMacro.name}» создан!`);
  };

  const handleDeleteMacro = (id: string) => {
    triggerVibration('warningPulse');
    setMacroCommands(prev => prev.filter(m => m.id !== id));
  };

  // Export full backup
  const handleExportBackup = () => {
    try {
      const backupData = {
        version: '1.3.0',
        exportedAt: new Date().toISOString(),
        settings: {
          userName,
          theme,
          appIcon: selectedAppIcon,
          voiceEnabled,
          quietMode,
          widgetStyle,
          primaryCurrency,
          customCommands,
          macroCommands,
        },
        finance: localStorage.getItem('lira_finance_transactions_v2'),
        habits: localStorage.getItem('lira_habits_custom'),
        notes: localStorage.getItem('lira_notes_list'),
        vibeHistory: localStorage.getItem('lira_vibe_history'),
      };
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lira_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      triggerVibration('commandSuccess');
      showNotification('Резервная копия скачана!');
    } catch {
      showNotification('Ошибка экспорта');
    }
  };

  // Import backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const data = JSON.parse(evt.target?.result as string);
        if (data.settings) {
          if (data.settings.userName) setUserName(data.settings.userName);
          if (data.settings.theme) setTheme(data.settings.theme);
          if (data.settings.appIcon) {
            setSelectedAppIcon(data.settings.appIcon);
            applyAppIcon(data.settings.appIcon);
          }
          if (data.settings.customCommands) setCustomCommands(data.settings.customCommands);
          if (data.settings.macroCommands) setMacroCommands(data.settings.macroCommands);
          if (data.settings.primaryCurrency) setPrimaryCurrency(data.settings.primaryCurrency);
        }
        if (data.finance) localStorage.setItem('lira_finance_transactions_v2', data.finance);
        if (data.habits) localStorage.setItem('lira_habits_custom', data.habits);
        if (data.notes) localStorage.setItem('lira_notes_list', data.notes);
        if (data.vibeHistory) localStorage.setItem('lira_vibe_history', data.vibeHistory);

        triggerVibration('commandSuccess');
        showNotification('Данные успешно восстановлены!');
      } catch {
        showNotification('Неверный формат файла бэкапа');
      }
    };
    reader.readAsText(file);
  };

  const handleSave = () => {
    triggerVibration('commandSuccess');
    localStorage.setItem('lira_finance_base_currency', primaryCurrency);
    localStorage.setItem('lira_widget_style', widgetStyle);

    onSaveSettings({
      ...settings,
      userName: userName.trim() || 'Пользователь',
      theme,
      darkTheme: theme === 'dark',
      appIcon: selectedAppIcon,
      voiceEnabled,
      femaleVoice,
      quietMode,
      widgetEnabled,
      widgetStyle,
      primaryCurrency,
      micSoundEffect,
      customCommands,
      macroCommands,
    });
    onClose();
  };

  return (
    <div
      id="dialog_settings_backdrop"
      className="fixed inset-0 z-60 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="dialog_settings_container"
        className="w-full max-w-lg bg-[#18181B] text-white rounded-t-3xl sm:rounded-3xl p-5 border border-white/10 shadow-2xl max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="sm:hidden p-1 text-white/70 hover:text-white cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-[#00E676] font-bold text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00E676]" />
              <span>Настройки L.I.R.A.</span>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenWidgetInfo}
              className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs text-white/90 flex items-center gap-1 cursor-pointer"
              title="О фоновом режиме, виджетах и обновлениях"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#00E676]" />
              <span className="hidden sm:inline">Виджеты & PWA</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-white/50 hover:text-white text-base p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {notification && (
          <div className="mb-3 px-3 py-2 bg-[#1B4D3E] text-white text-xs rounded-xl border border-[#00E676]/40 flex items-center justify-between animate-fade-in">
            <span>{notification}</span>
          </div>
        )}

        {/* Tab switcher */}
        <div className="flex border-b border-white/10 pb-2 mb-3 gap-1 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('appearance')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer shrink-0 transition-colors flex items-center gap-1.5 ${
              activeTab === 'appearance' ? 'bg-[#00E676] text-black font-bold' : 'text-white/60 hover:text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Внешний вид & Значки</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('audio')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer shrink-0 transition-colors flex items-center gap-1.5 ${
              activeTab === 'audio' ? 'bg-[#00E676] text-black font-bold' : 'text-white/60 hover:text-white'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Звуки & Микрофон</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('macros')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer shrink-0 transition-colors flex items-center gap-1.5 ${
              activeTab === 'macros' ? 'bg-[#00E676] text-black font-bold' : 'text-white/60 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Сценарии</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer shrink-0 transition-colors flex items-center gap-1.5 ${
              activeTab === 'backup' ? 'bg-[#00E676] text-black font-bold' : 'text-white/60 hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Бэкап</span>
          </button>
        </div>

        <div className="overflow-y-auto pr-1 space-y-4 text-xs leading-relaxed no-scrollbar flex-1">
          {/* TAB 1: APPEARANCE & APP ICONS */}
          {activeTab === 'appearance' && (
            <>
              {/* User Name */}
              <div>
                <label htmlFor="etUserName" className="block text-[11px] text-white/70 font-medium mb-1">
                  Ваше имя для обращения ассистента
                </label>
                <input
                  id="etUserName"
                  type="text"
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  placeholder="Например: Алекс"
                  className="w-full px-3 py-2 bg-[#262628] border border-white/10 rounded-xl text-white text-xs focus:border-[#00E676] focus:outline-none"
                />
              </div>

              {/* Theme selection */}
              <div>
                <label className="block text-[11px] text-white/70 font-medium mb-1.5">
                  Стиль и цветовая тема интерфейса (6 неоновых и классических тем)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      triggerVibration('selection');
                      setTheme('cyber');
                    }}
                    className={`p-2.5 rounded-xl border text-left flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                      theme === 'cyber' || theme === 'dark'
                        ? 'bg-[#00E676]/20 border-[#00E676] text-white shadow-sm ring-1 ring-[#00E676]'
                        : 'bg-[#262628] border-white/10 text-white/70 hover:bg-[#303034]'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-[#00E676] shadow-sm shadow-[#00E676]/50" />
                    <span className="font-bold text-[11px]">Изумруд</span>
                    <span className="text-[9px] opacity-60">Cyber L.I.R.A.</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      triggerVibration('selection');
                      setTheme('purple');
                    }}
                    className={`p-2.5 rounded-xl border text-left flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                      theme === 'purple'
                        ? 'bg-[#B388FF]/20 border-[#B388FF] text-white shadow-sm ring-1 ring-[#B388FF]'
                        : 'bg-[#262628] border-white/10 text-white/70 hover:bg-[#303034]'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-[#B388FF] shadow-sm shadow-[#B388FF]/50" />
                    <span className="font-bold text-[11px]">Аметист</span>
                    <span className="text-[9px] opacity-60">Неоновый пурпур</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      triggerVibration('selection');
                      setTheme('cobalt');
                    }}
                    className={`p-2.5 rounded-xl border text-left flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                      theme === 'cobalt'
                        ? 'bg-[#00B0FF]/20 border-[#00B0FF] text-white shadow-sm ring-1 ring-[#00B0FF]'
                        : 'bg-[#262628] border-white/10 text-white/70 hover:bg-[#303034]'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-[#00B0FF] shadow-sm shadow-[#00B0FF]/50" />
                    <span className="font-bold text-[11px]">Кобальт</span>
                    <span className="text-[9px] opacity-60">Сапфировый</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      triggerVibration('selection');
                      setTheme('amber');
                    }}
                    className={`p-2.5 rounded-xl border text-left flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                      theme === 'amber'
                        ? 'bg-[#FFD600]/20 border-[#FFD600] text-white shadow-sm ring-1 ring-[#FFD600]'
                        : 'bg-[#262628] border-white/10 text-white/70 hover:bg-[#303034]'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-[#FFD600] shadow-sm shadow-[#FFD600]/50" />
                    <span className="font-bold text-[11px]">Янтарь</span>
                    <span className="text-[9px] opacity-60">Золотой закат</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      triggerVibration('selection');
                      setTheme('crimson');
                    }}
                    className={`p-2.5 rounded-xl border text-left flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                      theme === 'crimson'
                        ? 'bg-[#FF1744]/20 border-[#FF1744] text-white shadow-sm ring-1 ring-[#FF1744]'
                        : 'bg-[#262628] border-white/10 text-white/70 hover:bg-[#303034]'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-[#FF1744] shadow-sm shadow-[#FF1744]/50" />
                    <span className="font-bold text-[11px]">Рубин</span>
                    <span className="text-[9px] opacity-60">Багровый неон</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      triggerVibration('selection');
                      setTheme('monochrome');
                    }}
                    className={`p-2.5 rounded-xl border text-left flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                      theme === 'monochrome'
                        ? 'bg-white/20 border-white text-white shadow-sm ring-1 ring-white'
                        : 'bg-[#262628] border-white/10 text-white/70 hover:bg-[#303034]'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm shadow-white/50" />
                    <span className="font-bold text-[11px]">OLED Титан</span>
                    <span className="text-[9px] opacity-60">Монохром</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      triggerVibration('selection');
                      setTheme('ios');
                    }}
                    className={`p-2.5 rounded-xl border text-left flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                      theme === 'ios'
                        ? 'bg-[#007AFF]/30 border-[#007AFF] text-white shadow-sm ring-1 ring-[#007AFF]'
                        : 'bg-[#262628] border-white/10 text-white/70 hover:bg-[#303034]'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-[#007AFF]" />
                    <span className="font-bold text-[11px]">iOS Glass</span>
                    <span className="text-[9px] opacity-60">Cupertino</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      triggerVibration('selection');
                      setTheme('light');
                    }}
                    className={`p-2.5 rounded-xl border text-left flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                      theme === 'light'
                        ? 'bg-[#2E7D32] border-[#00E676] text-white shadow-sm ring-1 ring-[#00E676]'
                        : 'bg-[#262628] border-white/10 text-white/70 hover:bg-[#303034]'
                    }`}
                  >
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-[11px]">Porcelain</span>
                    <span className="text-[9px] opacity-60">Светлая</span>
                  </button>
                </div>
              </div>

              {/* App Icon Picker (Значки приложения) */}
              <div className="p-3 bg-[#242426] rounded-2xl border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5 text-xs">
                      <Layers className="w-4 h-4 text-[#00E676]" />
                      <span>Значок приложения (Desktop / Favicon / PWA)</span>
                    </div>
                    <div className="text-[11px] text-white/60">
                      Выберите дизайн иконки для рабочего стола и ярлыков
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {APP_ICONS.map(icon => {
                    const isSelected = selectedAppIcon === icon.id;
                    return (
                      <div
                        key={icon.id}
                        onClick={() => handleSelectIcon(icon.id)}
                        className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all flex flex-col items-center justify-between relative ${
                          isSelected
                            ? 'bg-white/10 border-[#00E676] shadow-md shadow-[#00E676]/20 ring-1 ring-[#00E676]'
                            : 'bg-black/40 border-white/5 hover:border-white/20'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#00E676] text-black flex items-center justify-center font-bold">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}

                        <div
                          className="w-12 h-12 rounded-2xl overflow-hidden mb-1.5 shadow-md flex items-center justify-center bg-black/50"
                          dangerouslySetInnerHTML={{ __html: icon.svg }}
                        />

                        <div className="font-bold text-[11px] text-white truncate w-full">{icon.name}</div>
                        <div className="text-[9px] text-white/50 truncate w-full">{icon.subtitle}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Primary Currency selection */}
              <div>
                <label className="block text-[11px] text-white/70 font-medium mb-1 flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-[#00E676]" />
                  <span>Основная валюта капитала и расчётов</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {CURRENCY_LIST.map(curr => (
                    <button
                      key={curr.code}
                      type="button"
                      onClick={() => {
                        setPrimaryCurrency(curr.code);
                        triggerVibration('selection');
                      }}
                      className={`px-2.5 py-1 rounded-lg font-mono font-medium transition-colors cursor-pointer ${
                        primaryCurrency === curr.code
                          ? 'bg-[#00E676] text-black font-bold'
                          : 'bg-[#262628] text-white/70 hover:bg-[#333333]'
                      }`}
                    >
                      {curr.symbol} {curr.code}
                    </button>
                  ))}
                </div>
              </div>

              {/* Floating Desktop Widget Switch and Style Picker */}
              <div className="p-3 bg-[#262628] rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>🎈</span> Плавающий виджет рабочего стола
                    </div>
                    <div className="text-[11px] text-white/60">
                      Быстрый доступ к голосовой записи и виджетам
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={widgetEnabled}
                      onChange={e => setWidgetEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#3A3A3C] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00E676]"></div>
                  </label>
                </div>

                {widgetEnabled && (
                  <div className="pt-2 border-t border-white/10">
                    <div className="text-[11px] text-white/60 mb-2">Выберите стиль виджета:</div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setWidgetStyle('orb');
                          triggerVibration('selection');
                        }}
                        className={`p-2 rounded-xl border text-left cursor-pointer ${
                          widgetStyle === 'orb' ? 'bg-[#00E676]/20 border-[#00E676] text-white' : 'bg-black/30 border-white/5 text-white/70'
                        }`}
                      >
                        <div className="font-bold">🎙️ Voice Orb</div>
                        <div className="text-[10px] text-white/50">Мини-шар 1x1</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setWidgetStyle('dashboard');
                          triggerVibration('selection');
                        }}
                        className={`p-2 rounded-xl border text-left cursor-pointer ${
                          widgetStyle === 'dashboard' ? 'bg-[#00E676]/20 border-[#00E676] text-white' : 'bg-black/30 border-white/5 text-white/70'
                        }`}
                      >
                        <div className="font-bold">🎛️ Dashboard</div>
                        <div className="text-[10px] text-white/50">Командный пульт 4x2</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setWidgetStyle('vibe');
                          triggerVibration('selection');
                        }}
                        className={`p-2 rounded-xl border text-left cursor-pointer ${
                          widgetStyle === 'vibe' ? 'bg-[#00E676]/20 border-[#00E676] text-white' : 'bg-black/30 border-white/5 text-white/70'
                        }`}
                      >
                        <div className="font-bold">🧭 MIND//DAY</div>
                        <div className="text-[10px] text-white/50">Прогресс дня и 2/2</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setWidgetStyle('finance');
                          triggerVibration('selection');
                        }}
                        className={`p-2 rounded-xl border text-left cursor-pointer ${
                          widgetStyle === 'finance' ? 'bg-[#00E676]/20 border-[#00E676] text-white' : 'bg-black/30 border-white/5 text-white/70'
                        }`}
                      >
                        <div className="font-bold">💰 Кошелёк</div>
                        <div className="text-[10px] text-white/50">Баланс в валюте</div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* TAB 2: AUDIO & MIC SETTINGS */}
          {activeTab === 'audio' && (
            <div className="space-y-3">
              {/* Switches: Voice, Quiet Mode */}
              <div className="space-y-2 p-3 bg-[#262628] rounded-2xl border border-white/10">
                <div className="flex items-center justify-between py-1">
                  <div>
                    <div className="font-medium text-white flex items-center gap-1.5">
                      <span>🔊</span> Озвучивать ответы ассистента голосом
                    </div>
                    <div className="text-[11px] text-white/50">Автоматический синтез речи (TTS)</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={voiceEnabled}
                      onChange={e => setVoiceEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#3A3A3C] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00E676]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-1 border-t border-white/5">
                  <div>
                    <div className="font-medium text-white flex items-center gap-1.5">
                      <span>🔕</span> Тихий режим (без звуков)
                    </div>
                    <div className="text-[11px] text-white/50">Отключение сигналов колокольчика и бипов</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={quietMode}
                      onChange={e => setQuietMode(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#3A3A3C] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00E676]"></div>
                  </label>
                </div>
              </div>

              {/* Mic Sound on/off Selection & Live Previews */}
              <div className="p-3 bg-[#262628] rounded-2xl border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5 text-xs">
                      <Mic className="w-4 h-4 text-[#00E676]" />
                      <span>Звук включения / выключения микрофона</span>
                    </div>
                    <div className="text-[11px] text-white/60">
                      Настройте звуковой сигнал при старте и завершении записи речи
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {MIC_SOUND_PROFILES.map(profile => {
                    const isSelected = micSoundEffect === profile.id;
                    return (
                      <div
                        key={profile.id}
                        onClick={() => {
                          triggerVibration('selection');
                          setMicSoundEffect(profile.id);
                          soundManager.previewMicSound(profile.id, 'start');
                        }}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#00E676]/20 border-[#00E676] text-white shadow-sm'
                            : 'bg-black/30 border-white/5 text-white/70 hover:bg-black/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <div className="flex items-center gap-1.5 font-bold text-xs">
                            <span>{profile.icon}</span>
                            <span>{profile.name}</span>
                          </div>
                          {isSelected && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#00E676] text-black font-bold">
                              Выбран
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] opacity-60 leading-tight mb-2">
                          {profile.desc}
                        </p>
                        <div className="flex items-center gap-1.5 pt-1 border-t border-white/5">
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              soundManager.previewMicSound(profile.id, 'start');
                            }}
                            className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[10px] font-medium text-white flex items-center gap-1 cursor-pointer"
                          >
                            <Play className="w-2.5 h-2.5" />
                            Старт
                          </button>
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              soundManager.previewMicSound(profile.id, 'end');
                            }}
                            className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[10px] font-medium text-white flex items-center gap-1 cursor-pointer"
                          >
                            <Play className="w-2.5 h-2.5" />
                            Стоп
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MACROS */}
          {activeTab === 'macros' && (
            <div className="space-y-4">
              <div className="p-3 bg-[#262628] rounded-2xl border border-white/10 space-y-3">
                <div className="font-bold text-[#00E676] flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  <span>Создать новый сценарий (макрос)</span>
                </div>
                
                <div>
                  <label className="block text-[10px] text-white/70 mb-1">Название сценария:</label>
                  <input
                    type="text"
                    value={macroName}
                    onChange={e => setMacroName(e.target.value)}
                    placeholder="Например: Утренний ритуал"
                    className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-xl text-white text-xs focus:border-[#00E676] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-white/70 mb-1">Фраза активации (голос или текст):</label>
                  <input
                    type="text"
                    value={macroTrigger}
                    onChange={e => setMacroTrigger(e.target.value)}
                    placeholder="Например: доброе утро / пора вставать"
                    className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-xl text-white text-xs focus:border-[#00E676] focus:outline-none"
                  />
                </div>

                {/* Sub-action adder */}
                <div className="p-2.5 bg-black/30 rounded-xl border border-white/5 space-y-2">
                  <div className="text-[11px] font-semibold text-white/80">Добавить действие в цепочку:</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setActionType('say')}
                      className={`p-1.5 rounded-lg border text-left text-[11px] ${
                        actionType === 'say' ? 'bg-[#00E676]/20 border-[#00E676] text-white' : 'bg-white/5 border-white/5 text-white/60'
                      }`}
                    >
                      🗣️ Ответ голосом
                    </button>
                    <button
                      type="button"
                      onClick={() => setActionType('open_app')}
                      className={`p-1.5 rounded-lg border text-left text-[11px] ${
                        actionType === 'open_app' ? 'bg-[#00E676]/20 border-[#00E676] text-white' : 'bg-white/5 border-white/5 text-white/60'
                      }`}
                    >
                      📱 Запуск приложения
                    </button>
                    <button
                      type="button"
                      onClick={() => setActionType('music_toggle')}
                      className={`p-1.5 rounded-lg border text-left text-[11px] ${
                        actionType === 'music_toggle' ? 'bg-[#00E676]/20 border-[#00E676] text-white' : 'bg-white/5 border-white/5 text-white/60'
                      }`}
                    >
                      🎵 Музыка Play/Pause
                    </button>
                    <button
                      type="button"
                      onClick={() => setActionType('torch_toggle')}
                      className={`p-1.5 rounded-lg border text-left text-[11px] ${
                        actionType === 'torch_toggle' ? 'bg-[#00E676]/20 border-[#00E676] text-white' : 'bg-white/5 border-white/5 text-white/60'
                      }`}
                    >
                      🔦 Вспышка / Фонарик
                    </button>
                  </div>

                  {actionType === 'say' && (
                    <input
                      type="text"
                      value={actionPayload}
                      onChange={e => setActionPayload(e.target.value)}
                      placeholder="Текст, который произнесет ассистент..."
                      className="w-full px-2.5 py-1.5 bg-black/50 border border-white/10 rounded-lg text-white text-xs focus:border-[#00E676] focus:outline-none"
                    />
                  )}

                  {actionType === 'open_app' && (
                    <select
                      value={actionPayload}
                      onChange={e => setActionPayload(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#2C2C2E] border border-white/10 rounded-lg text-white text-xs"
                    >
                      <option value="">-- Выберите системное приложение --</option>
                      {SYSTEM_APPS.map(app => (
                        <option key={app.id} value={app.id}>
                          {app.icon} {app.name}
                        </option>
                      ))}
                    </select>
                  )}

                  <button
                    type="button"
                    onClick={handleAddActionToMacro}
                    className="w-full py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium text-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#00E676]" />
                    <span>Добавить действие в список</span>
                  </button>
                </div>

                {macroActions.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[10px] text-white/60">Шаги сценария:</div>
                    {macroActions.map((act, i) => (
                      <div key={act.id} className="p-1.5 bg-white/5 rounded-lg flex items-center justify-between text-[11px]">
                        <span>{i + 1}. {act.label}</span>
                        <button
                          type="button"
                          onClick={() => setMacroActions(prev => prev.filter(a => a.id !== act.id))}
                          className="text-red-400 hover:text-red-300 px-1"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSaveNewMacro}
                  className="w-full py-2 bg-[#00E676] hover:bg-[#00c864] text-black font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Сохранить сценарий</span>
                </button>
              </div>

              {/* Existing macros list */}
              <div className="space-y-2">
                <div className="font-bold text-white/80 text-xs">Активные сценарии ({macroCommands.length}):</div>
                {macroCommands.map(macro => (
                  <div key={macro.id} className="p-3 bg-[#262628] rounded-xl border border-white/10 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#00E676]" />
                        <span>{macro.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteMacro(macro.id)}
                        className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                        title="Удалить макрос"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-[11px] text-[#00E676] font-mono">Триггер: «{macro.trigger}»</div>
                    <div className="text-[10px] text-white/50">Действий в цепочке: {macro.actions.length}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: BACKUP & DATA */}
          {activeTab === 'backup' && (
            <div className="space-y-3">
              <div className="p-3 bg-[#262628] rounded-2xl border border-white/10 space-y-2">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-[#00E676]" />
                  <span>Экспорт и Резервная копия</span>
                </div>
                <p className="text-[11px] text-white/60">
                  Сохраните все ваши финансы, привычки, сценарии и настройки в один зашифрованный JSON-файл на устройство.
                </p>
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#00E676]" />
                  <span>Скачать резервную копию</span>
                </button>
              </div>

              <div className="p-3 bg-[#262628] rounded-2xl border border-white/10 space-y-2">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-[#00E676]" />
                  <span>Восстановление из файла</span>
                </div>
                <p className="text-[11px] text-white/60">
                  Загрузите ранее сохраненный бэкап для мгновенного переноса данных.
                </p>
                <label className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 cursor-pointer">
                  <Upload className="w-4 h-4 text-[#00E676]" />
                  <span>Выбрать JSON-файл</span>
                  <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
                </label>
              </div>

              <div className="p-3 bg-[#262628] rounded-2xl border border-white/10 space-y-2">
                <div className="font-bold text-red-400 flex items-center gap-1.5">
                  <Trash2 className="w-4 h-4" />
                  <span>Очистка истории сообщений</span>
                </div>
                <p className="text-[11px] text-white/60">
                  Удалит все локальные реплики чата с ассистентом, освободив память браузера.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClearChatHistory();
                    showNotification('История чата очищена!');
                  }}
                  className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-red-500/30"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Очистить историю чата</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Save button footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3 mt-2">
          <button
            type="button"
            onClick={onOpenPrivacy}
            className="text-[11px] text-white/60 hover:text-white underline cursor-pointer"
          >
            Конфиденциальность
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-[#00E676] hover:bg-[#00c864] text-black font-bold rounded-xl text-xs cursor-pointer shadow-lg shadow-[#00E676]/20"
            >
              Сохранить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
