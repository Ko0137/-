import React, { useState, useMemo } from 'react';
import { AppTheme, FileCategory } from '../types';
import { triggerVibration, soundManager } from '../utils/sound';
import {
  FolderSearch,
  FileText,
  FileCheck,
  Download,
  Timer,
  Calculator,
  Flashlight,
  Cpu,
  Sliders,
  Sparkles,
  Music,
  Camera,
  Coins,
  Dice5,
  HelpCircle,
  Clock,
  Battery,
  Calendar,
  X,
  Search,
  ArrowRight,
  ShieldCheck,
  SlidersHorizontal,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';

export interface ActionHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: AppTheme;
  onRunCommand: (command: string) => void;
  onOpenTimer: () => void;
  onOpenOfflineSpeech: () => void;
  onOpenHardwareControl: () => void;
  onOpenSmartCalc: () => void;
  onOpenRemote: () => void;
  onOpenFileScanner: (query?: string, category?: FileCategory) => void;
  onOpenFlashlightModal?: () => void;
}

interface HubItem {
  id: string;
  category: 'files' | 'tools' | 'media' | 'interactive';
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  badge?: string;
  action: () => void;
}

export const ActionHubModal: React.FC<ActionHubModalProps> = ({
  isOpen,
  onClose,
  theme = 'dark',
  onRunCommand,
  onOpenTimer,
  onOpenOfflineSpeech,
  onOpenHardwareControl,
  onOpenSmartCalc,
  onOpenRemote,
  onOpenFileScanner,
  onOpenFlashlightModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'all' | 'files' | 'tools' | 'media' | 'interactive'>('all');

  const isIOS = theme === 'ios';
  const isLight = theme === 'light';
  const isCyber = theme === 'cyber';

  const hubItems: HubItem[] = useMemo(() => {
    return [
      // 📂 Файлы и Документы
      {
        id: 'file-scanner-all',
        category: 'files',
        title: 'Сканер файлов устройства',
        description: 'Локальный поиск документов, чеков и фото без интернета',
        icon: FolderSearch,
        iconColor: 'text-blue-400',
        badge: '100% Offline',
        action: () => {
          onClose();
          onOpenFileScanner();
        },
      },
      {
        id: 'file-find-passport',
        category: 'files',
        title: 'Найти паспорт и документы',
        description: 'Поиск паспорта, договоров, резюме и документов РФ',
        icon: FileText,
        iconColor: 'text-cyan-400',
        action: () => {
          onClose();
          onRunCommand('найди паспорт');
        },
      },
      {
        id: 'file-find-receipts',
        category: 'files',
        title: 'Показать чеки и гарантии',
        description: 'Поиск кассовых чеков DNS, покупок и квитанций',
        icon: FileCheck,
        iconColor: 'text-amber-400',
        action: () => {
          onClose();
          onRunCommand('покажи чеки');
        },
      },
      {
        id: 'file-downloads',
        category: 'files',
        title: 'Загрузки и архивы',
        description: 'Просмотр скачанных книг, установщиков и AI моделей',
        icon: Download,
        iconColor: 'text-indigo-400',
        action: () => {
          onClose();
          onRunCommand('покажи загрузки');
        },
      },

      // 🛠️ Инструменты и Утилиты
      {
        id: 'tool-timer',
        category: 'tools',
        title: 'Таймер и секундомер',
        description: 'Быстрые таймеры для работы, готовки и отдыха',
        icon: Timer,
        iconColor: 'text-amber-400',
        action: () => {
          onClose();
          onOpenTimer();
        },
      },
      {
        id: 'tool-calc',
        category: 'tools',
        title: 'Инженерный калькулятор',
        description: 'Формулы, конвертер валют и единиц измерения',
        icon: Calculator,
        iconColor: 'text-purple-400',
        action: () => {
          onClose();
          onOpenSmartCalc();
        },
      },
      {
        id: 'tool-flashlight',
        category: 'tools',
        title: 'Фонарик и стробоскоп',
        description: 'Управление подсветкой экрана, SOS и частотой вспышек',
        icon: Flashlight,
        iconColor: 'text-amber-300',
        action: () => {
          onClose();
          if (onOpenFlashlightModal) {
            onOpenFlashlightModal();
          } else {
            onRunCommand('включи фонарик');
          }
        },
      },
      {
        id: 'tool-vosk',
        category: 'tools',
        title: 'Vosk Офлайн распознавание',
        description: 'Локальная русскоязычная языковая модель речи',
        icon: Cpu,
        iconColor: 'text-[#00E676]',
        badge: 'Локально',
        action: () => {
          onClose();
          onOpenOfflineSpeech();
        },
      },
      {
        id: 'tool-remote',
        category: 'tools',
        title: 'Пульт управления L.I.R.A.',
        description: 'Контекстный пульт с доступом ко всем функциям ядра',
        icon: Sliders,
        iconColor: 'text-[#00E676]',
        action: () => {
          onClose();
          onOpenRemote();
        },
      },
      {
        id: 'tool-hardware',
        category: 'tools',
        title: 'Датчики и ресурсы устройства',
        description: 'Мониторинг батареи, RAM, памяти и микрофона',
        icon: SlidersHorizontal,
        iconColor: 'text-emerald-400',
        action: () => {
          onClose();
          onOpenHardwareControl();
        },
      },

      // 🎵 Медиа и Мультимедиа
      {
        id: 'media-music',
        category: 'media',
        title: 'Аудиоплеер LIRA Wave',
        description: 'Встроенный расслабляющий синтезатор (Lo-Fi, Synthwave)',
        icon: Music,
        iconColor: 'text-pink-400',
        action: () => {
          onClose();
          onRunCommand('включи музыку');
        },
      },
      {
        id: 'media-notes',
        category: 'media',
        title: 'Мои заметки и задачи',
        description: 'Офлайн блокнот с сохранением в память устройства',
        icon: FileSpreadsheet,
        iconColor: 'text-blue-300',
        action: () => {
          onClose();
          onRunCommand('прочитай заметки');
        },
      },
      {
        id: 'media-camera',
        category: 'media',
        title: 'Камера устройства',
        description: 'Быстрый запуск камеры для фото или сканирования',
        icon: Camera,
        iconColor: 'text-violet-400',
        action: () => {
          onClose();
          onRunCommand('открой камеру');
        },
      },

      // 🎲 Интерактивные команды
      {
        id: 'int-coin',
        category: 'interactive',
        title: 'Орёл или решка',
        description: 'Бросить монетку для случайного выбора',
        icon: Coins,
        iconColor: 'text-amber-400',
        action: () => {
          onClose();
          onRunCommand('орёл или решка');
        },
      },
      {
        id: 'int-dice',
        category: 'interactive',
        title: 'Бросить кубик (d6)',
        description: 'Генератор случайных чисел от 1 до 6',
        icon: Dice5,
        iconColor: 'text-red-400',
        action: () => {
          onClose();
          onRunCommand('брось кубик');
        },
      },
      {
        id: 'int-ball',
        category: 'interactive',
        title: 'Магический шар ответов',
        description: 'Предсказание и ответы на закрытые вопросы',
        icon: Sparkles,
        iconColor: 'text-purple-400',
        action: () => {
          onClose();
          onRunCommand('магический шар');
        },
      },
      {
        id: 'int-alarm',
        category: 'interactive',
        title: 'Будильник на 08:00',
        description: 'Быстрая установка утреннего будильника',
        icon: Clock,
        iconColor: 'text-amber-400',
        action: () => {
          onClose();
          onRunCommand('поставь будильник на 08:00');
        },
      },
      {
        id: 'int-battery',
        category: 'interactive',
        title: 'Уровень заряда батареи',
        description: 'Проверка аккумулятора и статуса питания',
        icon: Battery,
        iconColor: 'text-[#00E676]',
        action: () => {
          onClose();
          onRunCommand('сколько заряда батареи');
        },
      },
      {
        id: 'int-date',
        category: 'interactive',
        title: 'Текущая дата и время',
        description: 'Календарный день, месяц, год и день недели',
        icon: Calendar,
        iconColor: 'text-blue-400',
        action: () => {
          onClose();
          onRunCommand('какое сегодня число');
        },
      },
    ];
  }, [
    onClose,
    onOpenFileScanner,
    onRunCommand,
    onOpenTimer,
    onOpenSmartCalc,
    onOpenFlashlightModal,
    onOpenOfflineSpeech,
    onOpenRemote,
    onOpenHardwareControl,
  ]);

  const filteredItems = useMemo(() => {
    let list = hubItems;
    if (selectedTab !== 'all') {
      list = list.filter(i => i.category === selectedTab);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        i =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          (i.badge && i.badge.toLowerCase().includes(q))
      );
    }
    return list;
  }, [hubItems, selectedTab, searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      id="action_hub_modal_overlay"
      className="fixed inset-0 z-60 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="action_hub_modal_window"
        onClick={e => e.stopPropagation()}
        className={`w-full max-w-lg max-h-[85vh] sm:max-h-[80vh] flex flex-col rounded-t-3xl sm:rounded-2xl shadow-2xl border transition-all overflow-hidden animate-in slide-in-from-bottom-5 duration-200 ${
          isIOS
            ? 'bg-[#1C1C1E]/95 backdrop-blur-2xl border-white/20 text-white shadow-black/90'
            : isCyber
            ? 'bg-[#0A0A14]/95 backdrop-blur-xl border-[#00F0FF]/40 text-white shadow-2xl shadow-[#00F0FF]/20'
            : isLight
            ? 'bg-[#F9FAF8] border-[#CBD4C8] text-[#1E2520] shadow-xl'
            : 'bg-[#16161A] border-white/15 text-white shadow-2xl'
        }`}
      >
        {/* Header */}
        <div
          className={`px-4 py-3.5 flex items-center justify-between border-b shrink-0 ${
            isIOS
              ? 'border-white/10 bg-white/5'
              : isCyber
              ? 'border-[#00F0FF]/20 bg-[#00F0FF]/5'
              : isLight
              ? 'border-[#D0D7CD] bg-[#E8ECE5]'
              : 'border-white/10 bg-white/5'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#00E676]/20 text-[#00E676] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight">Функции и инструменты L.I.R.A.</h3>
              </div>
              <p className="text-[11px] opacity-60">
                Все возможности ассистента в одном удобном меню
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              triggerVibration('tap');
              onClose();
            }}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white/60 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Tabs */}
        <div className="p-3 border-b border-white/10 space-y-2 shrink-0">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Поиск по функциям (сканер, таймер, чеки, калькулятор...)"
              className={`w-full pl-9 pr-8 py-2 rounded-xl text-xs border outline-none transition-all ${
                isLight
                  ? 'bg-white border-[#CBD4C8] focus:border-[#1E4D38] text-[#1E2520]'
                  : 'bg-black/30 border-white/10 focus:border-[#00E676] text-white'
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-white/10 opacity-60 hover:opacity-100"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Categorized Tab Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
            {(
              [
                { id: 'all', label: 'Все' },
                { id: 'files', label: '📂 Файлы' },
                { id: 'tools', label: '🛠️ Утилиты' },
                { id: 'media', label: '🎵 Медиа' },
                { id: 'interactive', label: '🎲 Команды' },
              ] as const
            ).map(tab => {
              const isSelected = selectedTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    triggerVibration('selection');
                    setSelectedTab(tab.id);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer border ${
                    isSelected
                      ? isCyber
                        ? 'bg-[#00F0FF]/20 border-[#00F0FF] text-[#00F0FF]'
                        : isLight
                        ? 'bg-[#1E4D38] text-white border-[#1E4D38] shadow-xs'
                        : 'bg-[#00E676]/20 text-[#00E676] border-[#00E676]/40'
                      : isLight
                      ? 'bg-white border-[#CBD4C8] text-neutral-600 hover:bg-black/5'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* List of Actions */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
          {filteredItems.length === 0 ? (
            <div className="py-10 text-center opacity-60 space-y-1">
              <Search className="w-8 h-8 mx-auto stroke-1" />
              <p className="text-xs font-semibold">Ничего не найдено</p>
              <p className="text-[11px]">Попробуйте другой поисковый запрос</p>
            </div>
          ) : (
            filteredItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    triggerVibration('selection');
                    soundManager.playClick();
                    item.action();
                  }}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer group ${
                    isIOS
                      ? 'bg-white/5 border-white/10 hover:bg-white/10 active:scale-[0.99]'
                      : isCyber
                      ? 'bg-[#00F0FF]/5 border-[#00F0FF]/20 hover:bg-[#00F0FF]/15 active:scale-[0.99]'
                      : isLight
                      ? 'bg-white border-[#CBD4C8] hover:border-[#1E4D38] active:scale-[0.99] shadow-2xs'
                      : 'bg-black/25 border-white/10 hover:border-white/20 active:scale-[0.99]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10 shrink-0">
                      <Icon className={`w-4 h-4 ${item.iconColor}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold truncate">{item.title}</span>
                        {item.badge && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-sm bg-[#00E676]/20 text-[#00E676] font-mono border border-[#00E676]/30">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] opacity-60 truncate mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer Note */}
        <div
          className={`px-4 py-2 border-t text-[11px] opacity-60 flex items-center justify-between shrink-0 ${
            isLight ? 'bg-black/5 border-[#D0D7CD]' : 'bg-black/30 border-white/5'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00E676]" />
            <span>Все модули работают на 100% локально и безопасно</span>
          </div>
          <span>Esc для закрытия</span>
        </div>
      </div>
    </div>
  );
};
