import React, { useState, useEffect, useRef } from 'react';
import { AppTheme, SettingsState } from '../types';
import { triggerVibration, soundManager } from '../utils/sound';
import { speechService } from '../services/speechService';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Music,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Calculator,
  FileText,
  Cpu,
  X,
  Sun,
  Timer,
  Mic,
  MicOff,
  Coins,
  Dices,
  HelpCircle,
  Sunrise,
  Target,
  Moon,
  TrendingUp,
  Radio,
  ExternalLink,
  ShieldCheck,
  Power,
  Zap,
  FolderSearch,
} from 'lucide-react';

export interface RemoteContextMenuProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: AppTheme;
  isTorchOn?: boolean;
  onToggleTorch?: () => void;
  isMusicPlaying?: boolean;
  onToggleMusic?: () => void;
  onNextTrack?: () => void;
  onPrevTrack?: () => void;
  onOpenSmartCalc?: () => void;
  onOpenNotes?: () => void;
  onOpenAlarm?: () => void;
  onOpenTimer?: () => void;
  onOpenOfflineSpeech?: () => void;
  onOpenMusicPlayer?: () => void;
  onOpenFlashlightModal?: () => void;
  onOpenFileScanner?: () => void;
  isListening?: boolean;
  onToggleMic?: () => void;
  onRunCommand?: (command: string) => void;
  settings?: SettingsState;
  onUpdateSettings?: (newSettings: Partial<SettingsState>) => void;
}

const MUSIC_PLATFORMS = [
  { id: 'lira_wave', name: 'L.I.R.A. Wave', icon: '⚡', isInternal: true },
  { id: 'yandex', name: 'Яндекс Музыка', icon: '🟡', url: 'https://music.yandex.ru' },
  { id: 'vk', name: 'VK Музыка', icon: '🔵', url: 'https://vk.com/music' },
  { id: 'spotify', name: 'Spotify', icon: '🟢', url: 'https://open.spotify.com' },
  { id: 'yt_music', name: 'YouTube Music', icon: '🔴', url: 'https://music.youtube.com' },
  { id: 'zvuk', name: 'Звук', icon: '🟣', url: 'https://zvuk.com' },
  { id: 'apple', name: 'Apple Music', icon: '🍎', url: 'https://music.apple.com' },
];

export const RemoteContextMenu: React.FC<RemoteContextMenuProps> = ({
  isOpen,
  onClose,
  theme = 'dark',
  isMusicPlaying = false,
  onToggleMusic,
  onNextTrack,
  onPrevTrack,
  onOpenSmartCalc,
  onOpenNotes,
  onOpenTimer,
  onOpenOfflineSpeech,
  onOpenMusicPlayer,
  onOpenFileScanner,
  isListening = false,
  onToggleMic,
  onRunCommand,
  settings,
  onUpdateSettings,
}) => {
  const [selectedMusicService, setSelectedMusicService] = useState<string>('lira_wave');
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isIOS = theme === 'ios';
  const isLight = theme === 'light';
  const isCyber = theme === 'cyber';

  const handleExecuteMacro = (cmdText: string) => {
    triggerVibration('selection');
    onClose();
    if (onRunCommand) {
      onRunCommand(cmdText);
    }
  };

  const handlePanicMute = () => {
    triggerVibration([100, 50, 100]);
    speechService.stopSpeaking();
    if (isListening && onToggleMic) {
      onToggleMic();
    }
    if (isMusicPlaying && onToggleMusic) {
      onToggleMusic();
    }
    soundManager.playClick();
  };

  const handleMusicServiceClick = (item: (typeof MUSIC_PLATFORMS)[0]) => {
    triggerVibration('tap');
    setSelectedMusicService(item.id);
    if (item.isInternal) {
      onClose();
      onOpenMusicPlayer?.();
    } else if (item.url) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      id="remote_context_menu_overlay"
      className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        ref={menuRef}
        id="remote_context_menu_window"
        onClick={e => e.stopPropagation()}
        className={`w-full max-w-sm rounded-2xl shadow-2xl border transition-all transform animate-in zoom-in-95 duration-150 overflow-hidden ${
          isIOS
            ? 'bg-[#1C1C1E]/90 backdrop-blur-2xl border-white/20 text-white shadow-black/80'
            : isCyber
            ? 'bg-[#0A0A14]/95 backdrop-blur-xl border-[#00F0FF]/40 text-white shadow-2xl shadow-[#00F0FF]/20'
            : isLight
            ? 'bg-[#F9FAF8]/95 backdrop-blur-xl border-[#CBD4C8] text-[#1E2520] shadow-xl'
            : 'bg-[#18181B]/95 backdrop-blur-xl border-white/15 text-white shadow-2xl'
        }`}
      >
        {/* Windows / Mac Style Top Header with Title & Assistant Core Badge */}
        <div
          className={`px-3.5 py-2.5 flex items-center justify-between border-b ${
            isIOS
              ? 'border-white/10 bg-white/5'
              : isCyber
              ? 'border-[#00F0FF]/20 bg-[#00F0FF]/5'
              : isLight
              ? 'border-[#D0D7CD] bg-[#E8ECE5]'
              : 'border-white/10 bg-white/5'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#00E676]/20 flex items-center justify-center text-[#00E676]">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold tracking-tight">
                  Пульт супер-сил L.I.R.A.
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] animate-pulse" />
              </div>
              <span className="text-[10px] opacity-60 font-mono block">Эксклюзивные функции ассистента</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePanicMute}
              title="Экстренная тишина (глушит речь и звук)"
              className="px-2 py-1 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Power className="w-3 h-3" />
              <span>Стоп звук</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerVibration('tap');
                onClose();
              }}
              className="p-1 rounded-md hover:bg-white/10 text-white/60 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-3 space-y-3 max-h-[78vh] overflow-y-auto no-scrollbar">
          {/* Section 1: Assistant Automation & Routine Macros (Unique to LIRA) */}
          <div>
            <div className="flex items-center justify-between mb-1.5 px-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                Авто-сценарии ассистента
              </span>
              <span className="text-[9px] text-[#00E676] font-mono">1 клик</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {/* Morning Briefing */}
              <button
                type="button"
                onClick={() => handleExecuteMacro('доброе утро, утренний брифинг')}
                className={`p-2 rounded-xl border text-left flex items-start gap-2 transition-all cursor-pointer ${
                  isLight
                    ? 'bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20 text-[#2C352E]'
                    : 'bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20 text-white'
                }`}
              >
                <div className="p-1.5 rounded-lg bg-amber-400/20 text-amber-400 shrink-0">
                  <Sunrise className="w-3.5 h-3.5" />
                </div>
                <div className="truncate">
                  <div className="text-[11px] font-bold truncate">Утренний брифинг</div>
                  <div className="text-[9px] opacity-60 truncate">Погода, время, статус</div>
                </div>
              </button>

              {/* Focus Sprint 25m */}
              <button
                type="button"
                onClick={() => handleExecuteMacro('включи фокус на 25 минут')}
                className={`p-2 rounded-xl border text-left flex items-start gap-2 transition-all cursor-pointer ${
                  isLight
                    ? 'bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20 text-[#2C352E]'
                    : 'bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20 text-white'
                }`}
              >
                <div className="p-1.5 rounded-lg bg-purple-400/20 text-purple-400 shrink-0">
                  <Target className="w-3.5 h-3.5" />
                </div>
                <div className="truncate">
                  <div className="text-[11px] font-bold truncate">Фокус 25 мин</div>
                  <div className="text-[9px] opacity-60 truncate">Помодоро + эмбиент</div>
                </div>
              </button>

              {/* Sleep / Relax Routine */}
              <button
                type="button"
                onClick={() => handleExecuteMacro('режим сна')}
                className={`p-2 rounded-xl border text-left flex items-start gap-2 transition-all cursor-pointer ${
                  isLight
                    ? 'bg-indigo-500/10 border-indigo-500/20 hover:bg-indigo-500/20 text-[#2C352E]'
                    : 'bg-indigo-500/10 border-indigo-500/20 hover:bg-indigo-500/20 text-white'
                }`}
              >
                <div className="p-1.5 rounded-lg bg-indigo-400/20 text-indigo-400 shrink-0">
                  <Moon className="w-3.5 h-3.5" />
                </div>
                <div className="truncate">
                  <div className="text-[11px] font-bold truncate">Режим сна</div>
                  <div className="text-[9px] opacity-60 truncate">Тишина и детокс</div>
                </div>
              </button>

              {/* Quick Finance Summary */}
              <button
                type="button"
                onClick={() => handleExecuteMacro('баланс и расходы')}
                className={`p-2 rounded-xl border text-left flex items-start gap-2 transition-all cursor-pointer ${
                  isLight
                    ? 'bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20 text-[#2C352E]'
                    : 'bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20 text-white'
                }`}
              >
                <div className="p-1.5 rounded-lg bg-emerald-400/20 text-[#00E676] shrink-0">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <div className="truncate">
                  <div className="text-[11px] font-bold truncate">Сводка финансов</div>
                  <div className="text-[9px] opacity-60 truncate">Баланс за день</div>
                </div>
              </button>
            </div>
          </div>

          {/* Section 2: L.I.R.A. Voice Core & Speech Tuning */}
          <div
            className={`p-2.5 rounded-xl border space-y-2 ${
              isIOS
                ? 'bg-white/5 border-white/10'
                : isCyber
                ? 'bg-[#00F0FF]/5 border-[#00F0FF]/20'
                : isLight
                ? 'bg-white border-[#CBD4C8] shadow-2xs'
                : 'bg-black/30 border-white/5'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-[#00E676]" />
                <span>Голосовое ядро ассистента</span>
              </span>
              <span className="text-[10px] text-[#00E676] font-mono">
                {settings?.femaleVoice ? 'Женский голос' : 'Мужской голос'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {/* Voice Timbre Toggle */}
              <button
                type="button"
                onClick={() => {
                  triggerVibration('selection');
                  onUpdateSettings?.({ femaleVoice: !settings?.femaleVoice });
                }}
                className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                  settings?.femaleVoice
                    ? 'bg-pink-500/20 border-pink-500/40 text-pink-300'
                    : 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                }`}
              >
                <span className="text-[10px] font-bold block">
                  {settings?.femaleVoice ? '👩 Лира' : '👨 Лир'}
                </span>
                <span className="text-[8px] opacity-70">Сменить тембр</span>
              </button>

              {/* Quiet Mode / Speak Aloud Toggle */}
              <button
                type="button"
                onClick={() => {
                  triggerVibration('selection');
                  onUpdateSettings?.({ quietMode: !settings?.quietMode });
                }}
                className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                  settings?.quietMode
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-[#00E676]/20 border-[#00E676]/40 text-[#00E676]'
                }`}
              >
                <span className="text-[10px] font-bold block">
                  {settings?.quietMode ? '🔇 Без звука' : '🔊 Озвучка'}
                </span>
                <span className="text-[8px] opacity-70">
                  {settings?.quietMode ? 'Текст' : 'Вслух'}
                </span>
              </button>

              {/* Instant Mic Toggle */}
              <button
                type="button"
                onClick={() => {
                  triggerVibration('tap');
                  onClose();
                  onToggleMic?.();
                }}
                className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                  isListening
                    ? 'bg-red-500/30 border-red-500 text-red-300 animate-pulse'
                    : 'bg-white/10 border-white/15 text-white/90 hover:bg-white/20'
                }`}
              >
                <span className="text-[10px] font-bold block flex items-center justify-center gap-1">
                  {isListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3 text-[#00E676]" />}
                  <span>{isListening ? 'Стоп' : 'Слушать'}</span>
                </span>
                <span className="text-[8px] opacity-70">Микрофон</span>
              </button>
            </div>
          </div>

          {/* Section 3: Universal Music & Ambient Hub (Any Streaming Service) */}
          <div
            className={`p-2.5 rounded-xl border space-y-2 ${
              isIOS
                ? 'bg-white/5 border-white/10'
                : isCyber
                ? 'bg-[#00F0FF]/5 border-[#00F0FF]/20'
                : isLight
                ? 'bg-white border-[#CBD4C8] shadow-2xs'
                : 'bg-black/30 border-white/5'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-bold">Музыкальный хаб</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    triggerVibration('tap');
                    onPrevTrack?.();
                  }}
                  className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-white/80 cursor-pointer"
                  title="Назад"
                >
                  <SkipBack className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerVibration('selection');
                    onToggleMusic?.();
                  }}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 cursor-pointer ${
                    isMusicPlaying
                      ? 'bg-amber-400 text-black shadow-xs'
                      : 'bg-white/15 text-white hover:bg-white/25'
                  }`}
                >
                  {isMusicPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  <span>{isMusicPlaying ? 'Пауза' : 'Плей'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerVibration('tap');
                    onNextTrack?.();
                  }}
                  className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-white/80 cursor-pointer"
                  title="Вперед"
                >
                  <SkipForward className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Platform Selector Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {MUSIC_PLATFORMS.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleMusicServiceClick(item)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-medium shrink-0 flex items-center gap-1 border transition-all cursor-pointer ${
                    selectedMusicService === item.id
                      ? 'bg-amber-400/20 border-amber-400 text-amber-300 font-bold'
                      : isLight
                      ? 'bg-black/5 border-black/10 text-neutral-600 hover:bg-black/10'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                  {!item.isInternal && <ExternalLink className="w-2.5 h-2.5 opacity-50" />}
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Fast Decision & Math Tools (Only Assistant Can Do Instantly) */}
          <div
            className={`rounded-xl border overflow-hidden divide-y ${
              isIOS
                ? 'bg-white/5 border-white/10 divide-white/10'
                : isCyber
                ? 'bg-[#00F0FF]/5 border-[#00F0FF]/20 divide-[#00F0FF]/15'
                : isLight
                ? 'bg-white border-[#CBD4C8] divide-[#E2E6DF] shadow-2xs'
                : 'bg-black/30 border-white/5 divide-white/5'
            }`}
          >
            {/* Coin Flip */}
            <button
              type="button"
              onClick={() => handleExecuteMacro('подбрось монетку')}
              className="w-full px-3 py-2 flex items-center justify-between hover:bg-white/10 text-left text-xs transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>Орёл или Решка (Монетка)</span>
              </div>
              <span className="text-[10px] text-amber-400 font-mono">Со звоном</span>
            </button>

            {/* Dice Roll */}
            <button
              type="button"
              onClick={() => handleExecuteMacro('брось кубик d20')}
              className="w-full px-3 py-2 flex items-center justify-between hover:bg-white/10 text-left text-xs transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Dices className="w-3.5 h-3.5 text-indigo-400" />
                <span>Бросить кубик (d20 / d6)</span>
              </div>
              <span className="text-[10px] opacity-40 font-mono">1..20</span>
            </button>

            {/* 8-Ball Magic */}
            <button
              type="button"
              onClick={() => handleExecuteMacro('магический шар')}
              className="w-full px-3 py-2 flex items-center justify-between hover:bg-white/10 text-left text-xs transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                <span>Магический шар предсказаний (8-Ball)</span>
              </div>
              <span className="text-[10px] text-purple-400 font-mono">Ответ</span>
            </button>

            {/* Timer Modal */}
            <button
              type="button"
              onClick={() => {
                triggerVibration('tap');
                onClose();
                onOpenTimer?.();
              }}
              className="w-full px-3 py-2 flex items-center justify-between hover:bg-white/10 text-left text-xs transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Timer className="w-3.5 h-3.5 text-amber-400" />
                <span>Таймер фокуса & Секундомер</span>
              </div>
              <span className="text-[10px] opacity-40 font-mono">Pomodoro</span>
            </button>

            {/* Smart Math & Calc */}
            <button
              type="button"
              onClick={() => {
                triggerVibration('tap');
                onClose();
                onOpenSmartCalc?.();
              }}
              className="w-full px-3 py-2 flex items-center justify-between hover:bg-white/10 text-left text-xs transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Calculator className="w-3.5 h-3.5 text-blue-400" />
                <span>Математический решатель L.I.R.A.</span>
              </div>
              <span className="text-[10px] opacity-40 font-mono">2π, sin, %</span>
            </button>

            {/* Notes */}
            <button
              type="button"
              onClick={() => {
                triggerVibration('tap');
                onClose();
                onOpenNotes?.();
              }}
              className="w-full px-3 py-2 flex items-center justify-between hover:bg-white/10 text-left text-xs transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>Заметки и голосовые мысли</span>
              </div>
              <span className="text-[10px] opacity-40 font-mono">Локально</span>
            </button>

            {/* Local File Scanner */}
            <button
              type="button"
              onClick={() => {
                triggerVibration('tap');
                onClose();
                onOpenFileScanner?.();
              }}
              className="w-full px-3 py-2 flex items-center justify-between hover:bg-white/10 text-left text-xs transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <FolderSearch className="w-3.5 h-3.5 text-blue-400" />
                <span>Локальный сканер файлов & Документов</span>
              </div>
              <span className="text-[10px] text-blue-400 font-mono">100% Offline</span>
            </button>

            {/* Offline Vosk Speech Core */}
            <button
              type="button"
              onClick={() => {
                triggerVibration('tap');
                onClose();
                onOpenOfflineSpeech?.();
              }}
              className="w-full px-3 py-2 flex items-center justify-between hover:bg-white/10 text-left text-xs transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-[#00E676]" />
                <span>Офлайн Vosk STT Speech Core</span>
              </div>
              <span className="text-[10px] text-[#00E676] font-bold">100% Offline</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
