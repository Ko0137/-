import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { AppLauncher } from '@capacitor/app-launcher';
import { ChatMessage, SettingsState, LaunchableApp, ActiveAlarm, ActiveTimer, AppTheme, NavTab } from './types';
import { TopBar } from './components/TopBar';
import { BottomNav } from './components/BottomNav';
import { ChatView } from './components/ChatView';
import { VibeView } from './components/VibeView';
import { FinanceView } from './components/FinanceView';
import { HelpDialog } from './components/HelpDialog';
import { SettingsDialog } from './components/SettingsDialog';
import { PrivacyPolicyDialog } from './components/PrivacyPolicyDialog';
import { FloatingWidget } from './components/FloatingWidget';
import { WidgetBackgroundInfoModal } from './components/WidgetBackgroundInfoModal';
import { CameraModal } from './components/CameraModal';
import { CalculatorModal } from './components/CalculatorModal';
import { NotesModal } from './components/NotesModal';
import { AlarmModal } from './components/AlarmModal';
import { TimerModal } from './components/TimerModal';
import { OfflineSpeechModal } from './components/OfflineSpeechModal';
import { HardwareControlModal } from './components/HardwareControlModal';
import { SmartCalculatorModal } from './components/SmartCalculatorModal';
import { MusicPlayerModal, PLAYLIST } from './components/MusicPlayerModal';
import { FlashlightControlModal } from './components/FlashlightControlModal';
import { RemoteContextMenu } from './components/RemoteContextMenu';
import { FileScannerModal } from './components/FileScannerModal';
import { ActionHubModal } from './components/ActionHubModal';
import { DesktopWidgetModal } from './components/DesktopWidgetModal';
import { SYSTEM_APPS, executeCommand } from './services/commandProcessor';
import { speechService } from './services/speechService';
import { wakeWordService } from './services/wakeWordService';
import { soundManager, triggerVibration } from './utils/sound';
import { applyAppIcon, getSavedAppIconId } from './utils/appIcons';
import { applyThemeToDocument } from './utils/themeEngine';
import { Flashlight, Pause, SkipForward } from 'lucide-react';

const STORAGE_KEYS = {
  PREFS: 'LiraPrefs_v3',
  CHAT_HISTORY: 'chat_history_v3',
  NOTES: 'notes_list_v3',
  CUSTOM_COMMANDS: 'custom_commands_map_v3',
  ALARMS: 'lira_alarms_v3',
  TIMER: 'lira_active_timer_v3',
};

const DEFAULT_SETTINGS: SettingsState = {
  userName: 'Пользователь',
  theme: 'dark',
  darkTheme: true,
  voiceEnabled: true,
  quietMode: false,
  femaleVoice: true,
  widgetEnabled: false,
  widgetStyle: 'orb',
  primaryCurrency: 'RUB',
  micSoundEffect: 'classic_beep',
  appIcon: 'emerald_core',
  macroCommands: [],
  privacyAccepted: false,
  customCommands: {},
};

export const App: React.FC = () => {
  // Navigation
  const [currentTab, setCurrentTab] = useState<NavTab>('chat');
  const [statusText, setStatusText] = useState<string>('READY');

  // Messages
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');

  // Settings
  const [settings, setSettings] = useState<SettingsState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PREFS);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {}
    return DEFAULT_SETTINGS;
  });

  // Notes
  const [notesList, setNotesList] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTES);
      if (saved) return JSON.parse(saved);
    } catch {}
    return ['Добро пожаловать в L.I.R.A.!'];
  });

  // Alarms
  const [alarms, setAlarms] = useState<ActiveAlarm[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ALARMS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [ringingAlarm, setRingingAlarm] = useState<ActiveAlarm | null>(null);

  // Active Countdown Timer
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TIMER);
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  // System states
  const [isListening, setIsListening] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  // Crash Reporting states
  const [lastCrash, setLastCrash] = useState<{ message: string; stack: string; time: string; type: string } | null>(null);
  const [showCrashReport, setShowCrashReport] = useState(false);

  // Dialogs
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isWidgetInfoOpen, setIsWidgetInfoOpen] = useState(false);
  const [showFirstLaunchPrivacy, setShowFirstLaunchPrivacy] = useState(false);
  const [isRemoteMenuOpen, setIsRemoteMenuOpen] = useState(false);

  // Tool Modals
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isAlarmOpen, setIsAlarmOpen] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isOfflineSpeechOpen, setIsOfflineSpeechOpen] = useState(false);
  const [isHardwareControlOpen, setIsHardwareControlOpen] = useState(false);
  const [isSmartCalcOpen, setIsSmartCalcOpen] = useState(false);
  const [isMusicPlayerOpen, setIsMusicPlayerOpen] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isFlashlightModalOpen, setIsFlashlightModalOpen] = useState(false);
  const [isFileScannerOpen, setIsFileScannerOpen] = useState(false);
  const [fileScannerQuery, setFileScannerQuery] = useState('');
  const [fileScannerCategory, setFileScannerCategory] = useState<any>('all');
  const [isActionHubOpen, setIsActionHubOpen] = useState(false);
  const [isDesktopWidgetOpen, setIsDesktopWidgetOpen] = useState(false);
  const [isWakeWordActive, setIsWakeWordActive] = useState(false);
  const [wakeWordStatus, setWakeWordStatus] = useState('Ожидание фразы «Лира...»');

  const handleOpenFileScanner = useCallback((query?: string, category?: any) => {
    setFileScannerQuery(query || '');
    setFileScannerCategory(category || 'all');
    setIsFileScannerOpen(true);
  }, []);

  // Apply Theme Colors
  useEffect(() => {
    applyThemeToDocument(settings.theme);
  }, [settings.theme]);

  // Apply App Icon
  useEffect(() => {
    const iconId = settings.appIcon || getSavedAppIconId();
    applyAppIcon(iconId);
  }, [settings.appIcon]);

  // Flashlight Hardware Control (Camera LED Torch)
  useEffect(() => {
    let activeTrack: MediaStreamTrack | null = null;
    let activeStream: MediaStream | null = null;

    if (isTorchOn) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: { facingMode: 'environment' } })
          .then(stream => {
            activeStream = stream;
            const track = stream.getVideoTracks()[0];
            if (track) {
              activeTrack = track;
              track.applyConstraints({
                advanced: [{ torch: true } as any]
              }).catch(() => {});
            }
          })
          .catch(() => {});
      }
    }

    return () => {
      if (activeTrack) {
        try {
          activeTrack.applyConstraints({ advanced: [{ torch: false } as any] }).catch(() => {});
          activeTrack.stop();
        } catch {}
      }
      if (activeStream) {
        try {
          activeStream.getTracks().forEach(t => t.stop());
        } catch {}
      }
    };
  }, [isTorchOn]);

  // Track navigation handlers
  const handleNextTrack = useCallback(() => {
    let nextTitle = '';
    setCurrentTrackIndex(prev => {
      const nextIdx = (prev + 1) % PLAYLIST.length;
      nextTitle = PLAYLIST[nextIdx].title;
      return nextIdx;
    });
    return nextTitle;
  }, []);

  const handlePrevTrack = useCallback(() => {
    let prevTitle = '';
    setCurrentTrackIndex(prev => {
      const prevIdx = (prev - 1 + PLAYLIST.length) % PLAYLIST.length;
      prevTitle = PLAYLIST[prevIdx].title;
      return prevIdx;
    });
    return prevTitle;
  }, []);

  // Media Player Ref for background audio synthesis
  const mediaIntervalRef = useRef<number | null>(null);

  // 1. Initial Launch: Load History, check First Launch Privacy
  useEffect(() => {
    // Check for previous crash
    try {
      const savedCrash = localStorage.getItem('lira_last_crash');
      if (savedCrash) {
        const parsed = JSON.parse(savedCrash);
        setLastCrash(parsed);
        setShowCrashReport(true);
      }
    } catch {}

    if (!settings.privacyAccepted) {
      setShowFirstLaunchPrivacy(true);
    }

    try {
      const savedHistory = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
      if (savedHistory) {
        const parsed: ChatMessage[] = JSON.parse(savedHistory);
        if (parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch {}

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const initialMsgs: ChatMessage[] = [
      {
        id: 'msg-init-1',
        message: 'L.I.R.A.: Все системы активны. Нажмите «Пульт» сверху или правой кнопкой мыши для быстрого управления!',
        isUser: false,
        time: timeStr,
      },
      {
        id: 'msg-init-2',
        message: `Инфо: Доступно системных модулей: ${SYSTEM_APPS.length}. Vosk STT, таймер и офлайн-калькулятор готовы. Горячие клавиши: Пробел — микрофон, 1/2/3 — вкладки.`,
        isUser: false,
        time: timeStr,
      },
    ];
    setMessages(initialMsgs);
  }, []);

  // Sync settings with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PREFS, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  // Sync notes with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notesList));
    } catch {}
  }, [notesList]);

  // Sync alarms with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ALARMS, JSON.stringify(alarms));
    } catch {}
  }, [alarms]);

  // Sync timer with localStorage
  useEffect(() => {
    try {
      if (activeTimer) {
        localStorage.setItem(STORAGE_KEYS.TIMER, JSON.stringify(activeTimer));
      } else {
        localStorage.removeItem(STORAGE_KEYS.TIMER);
      }
    } catch {}
  }, [activeTimer]);

  // Save chat history
  const saveChatHistory = useCallback((newList: ChatMessage[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(newList));
    } catch {}
  }, []);

  // Helper to add a message
  const addMessage = useCallback((text: string, isUser: boolean, speak: boolean = false) => {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const newMsg: ChatMessage = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
      message: text,
      isUser,
      time,
    };

    setMessages(prev => {
      const updated = [...prev, newMsg];
      saveChatHistory(updated);
      return updated;
    });

    if (!isUser) {
      triggerVibration('messageArrival');
      if (!settings.quietMode) {
        soundManager.playMessageArrived();
      }
    }

    if (speak && !isUser && settings.voiceEnabled) {
      speechService.speak(text, {
        femaleVoice: settings.femaleVoice,
        quietMode: settings.quietMode,
      });
    }
  }, [saveChatHistory, settings]);

  // Timer interval countdown check
  useEffect(() => {
    if (!activeTimer || !activeTimer.isRunning) return;

    const interval = setInterval(() => {
      setActiveTimer(prev => {
        if (!prev || !prev.isRunning) return prev;
        if (prev.remainingSeconds <= 1) {
          soundManager.playTimerFinish();
          triggerVibration([200, 100, 200, 100, 300]);
          addMessage(`⏱️ Время вышло! Таймер «${prev.label}» (${Math.round(prev.totalSeconds / 60)} мин) завершен.`, false, true);
          return null;
        }
        return {
          ...prev,
          remainingSeconds: prev.remainingSeconds - 1,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer?.isRunning, addMessage]);

  // Alarm timer check
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const currentH = now.getHours();
      const currentM = now.getMinutes();

      alarms.forEach(alarm => {
        if (alarm.isActive && alarm.hour === currentH && alarm.minute === currentM) {
          if (!ringingAlarm || ringingAlarm.id !== alarm.id) {
            setRingingAlarm(alarm);
            soundManager.playAlarm();
            triggerVibration(100);
          }
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [alarms, ringingAlarm]);

  // Ambient media sound effect when playing
  useEffect(() => {
    if (isMusicPlaying) {
      soundManager.playMediaToggle(true);
      mediaIntervalRef.current = window.setInterval(() => {
        soundManager.playMediaToggle(true);
      }, 8000);
    } else {
      if (mediaIntervalRef.current) {
        clearInterval(mediaIntervalRef.current);
        mediaIntervalRef.current = null;
      }
    }
    return () => {
      if (mediaIntervalRef.current) {
        clearInterval(mediaIntervalRef.current);
      }
    };
  }, [isMusicPlaying]);

  // App Launcher Handler
  const handleOpenApp = useCallback((app: LaunchableApp) => {
    triggerVibration('selection');
    if (app.actionType === 'camera') {
      setIsCameraOpen(true);
    } else if (app.actionType === 'calculator') {
      setIsCalcOpen(true);
    } else if (app.actionType === 'notes') {
      setIsNotesOpen(true);
    } else if (app.actionType === 'alarm') {
      setIsAlarmOpen(true);
    } else if (app.actionType === 'media' || app.id === 'yandex_music') {
      setIsMusicPlaying(true);
      setIsMusicPlayerOpen(true);
    } else if (app.id === 'file_scanner') {
      handleOpenFileScanner();
    } else if (app.actionType === 'custom' && app.id === 'settings') {
      setIsSettingsOpen(true);
    } else if (app.url) {
      window.open(app.url, '_blank', 'noopener,noreferrer');
    }
  }, [handleOpenFileScanner]);

  // Process a user command
  const handleProcessCommand = useCallback(async (text: string) => {
    triggerVibration('tap');
    addMessage(text, true, false);

    const context = {
      userName: settings.userName,
      notesList,
      setNotesList,
      customCommands: settings.customCommands,
      macroCommands: settings.macroCommands,
      isTorchOn,
      setIsTorchOn,
      isMusicPlaying,
      setIsMusicPlaying,
      onOpenApp: handleOpenApp,
      onOpenSettings: () => setIsSettingsOpen(true),
      onSetAlarm: (newAlarm: ActiveAlarm) => {
        setAlarms(prev => [...prev.filter(a => a.time !== newAlarm.time), newAlarm]);
        if (Capacitor.isNativePlatform()) {
          try {
            const [hours, minutes] = newAlarm.time.split(':').map(Number);
            const label = encodeURIComponent(newAlarm.label || 'L.I.R.A. Assistant Alarm');
            const intentUri = `intent:#Intent;action=android.intent.action.SET_ALARM;i.android.intent.extra.alarm.HOUR=${hours};i.android.intent.extra.alarm.MINUTES=${minutes};S.android.intent.extra.alarm.MESSAGE=${label};B.android.intent.extra.alarm.SKIP_UI=false;end`;
            AppLauncher.openUrl({ url: intentUri }).catch(() => {});
          } catch (err) {
            console.error('Failed to launch native alarm intent:', err);
          }
        }
      },
      onSetTimer: (seconds: number, label: string) => {
        setActiveTimer({
          id: Date.now().toString(),
          totalSeconds: seconds,
          remainingSeconds: seconds,
          label,
          isRunning: true,
          createdAt: Date.now(),
        });
      },
      onResetTimer: () => {
        setActiveTimer(null);
      },
      onOpenTimer: () => setIsTimerOpen(true),
      onOpenOfflineSpeech: () => setIsOfflineSpeechOpen(true),
      onOpenHardwareControl: () => setIsHardwareControlOpen(true),
      onOpenSmartCalc: () => setIsSmartCalcOpen(true),
      onOpenMusicPlayer: () => setIsMusicPlayerOpen(true),
      onNextTrack: handleNextTrack,
      onPrevTrack: handlePrevTrack,
      onOpenFlashlightModal: () => setIsFlashlightModalOpen(true),
      onOpenFileScanner: handleOpenFileScanner,
    };

    const response = await executeCommand(text, context);
    triggerVibration('commandSuccess');
    if (!settings.quietMode) {
      soundManager.playCommandSuccess();
    }
    addMessage(response, false, true);
  }, [addMessage, settings, notesList, isTorchOn, isMusicPlaying, handleOpenApp, handleNextTrack, handlePrevTrack, handleOpenFileScanner]);

  // Toggle Microphone
  const handleToggleMic = useCallback(async () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      setStatusText(currentTab === 'chat' ? 'READY' : currentTab.toUpperCase());
      if (!settings.quietMode) {
        soundManager.playMicEnd(settings.micSoundEffect);
      }
    } else {
      if (!settings.quietMode) {
        soundManager.playMicStart(settings.micSoundEffect);
      }
      setIsListening(true);
      setStatusText('LISTENING');

      const started = await speechService.startListening({
        onStart: () => {
          setIsListening(true);
          setStatusText('LISTENING');
        },
        onEnd: () => {
          setIsListening(false);
          setStatusText(currentTab === 'chat' ? 'READY' : currentTab.toUpperCase());
          if (!settings.quietMode) {
            soundManager.playMicEnd(settings.micSoundEffect);
          }
        },
        onError: (err) => {
          setIsListening(false);
          setStatusText(currentTab === 'chat' ? 'READY' : currentTab.toUpperCase());
          if (!settings.quietMode) {
            soundManager.playMicEnd(settings.micSoundEffect);
          }
          addMessage(`Микрофон: ${err}. Вы можете использовать клавиатуру для ввода команд.`, false, false);
        },
        onResult: (transcript) => {
          setIsListening(false);
          setStatusText(currentTab === 'chat' ? 'READY' : currentTab.toUpperCase());
          if (!settings.quietMode) {
            soundManager.playMicEnd(settings.micSoundEffect);
          }
          handleProcessCommand(transcript);
        },
      });

      if (!started) {
        setIsListening(false);
        setStatusText(currentTab === 'chat' ? 'READY' : currentTab.toUpperCase());
      }
    }
  }, [isListening, currentTab, addMessage, handleProcessCommand, settings]);

  // Toggle Wake-Word "Лира" Continuous Mode
  const handleToggleWakeWord = useCallback(() => {
    if (isWakeWordActive) {
      wakeWordService.stop();
      setIsWakeWordActive(false);
      setWakeWordStatus('Фоновый режим выключен');
      triggerVibration('tap');
    } else {
      setIsWakeWordActive(true);
      triggerVibration('commandSuccess');
      soundManager.playCommandSuccess();
      wakeWordService.start(
        (cmd) => {
          handleProcessCommand(cmd);
        },
        (active, msg) => {
          if (msg) setWakeWordStatus(msg);
        }
      );
    }
  }, [isWakeWordActive, handleProcessCommand]);

  // Handle URL shortcut params on mount (from Android App shortcuts)
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const action = urlParams.get('action');
      if (action === 'voice') {
        setTimeout(() => handleToggleMic(), 600);
      } else if (action === 'torch') {
        setIsTorchOn(prev => !prev);
      } else if (action === 'files') {
        handleOpenFileScanner();
      } else if (action === 'notes') {
        setIsNotesOpen(true);
      } else if (action === 'timer') {
        setIsTimerOpen(true);
      }
    } catch {}
  }, [handleOpenFileScanner, handleToggleMic]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput = activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'TEXTAREA' || (activeEl as HTMLElement)?.isContentEditable;

      if (e.key === 'Escape') {
        setIsHelpOpen(false);
        setIsSettingsOpen(false);
        setIsPrivacyOpen(false);
        setIsWidgetInfoOpen(false);
        setIsRemoteMenuOpen(false);
        setIsCameraOpen(false);
        setIsCalcOpen(false);
        setIsNotesOpen(false);
        setIsAlarmOpen(false);
        setIsTimerOpen(false);
        setIsOfflineSpeechOpen(false);
        setIsHardwareControlOpen(false);
        setIsSmartCalcOpen(false);
        setIsMusicPlayerOpen(false);
        setIsFlashlightModalOpen(false);
        return;
      }

      if (isInput) return;

      // Space to toggle microphone
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        handleToggleMic();
        return;
      }

      // Quick tab switching 1, 2, 3
      if (e.key === '1') {
        setCurrentTab('chat');
        setStatusText('L.I.R.A.');
        triggerVibration('selection');
      } else if (e.key === '2') {
        setCurrentTab('vibe');
        setStatusText('VIBE');
        triggerVibration('selection');
      } else if (e.key === '3') {
        setCurrentTab('finance');
        setStatusText('FINANCE');
        triggerVibration('selection');
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleToggleMic]);

  // Tab change
  const handleTabChange = (tab: NavTab) => {
    setCurrentTab(tab);
    if (!isListening) {
      if (tab === 'chat') setStatusText('L.I.R.A.');
      else if (tab === 'vibe') setStatusText('VIBE');
      else if (tab === 'finance') setStatusText('FINANCE');
    }
  };

  const handleClearHistory = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
  };

  const effectiveTheme: AppTheme = settings.theme || (settings.darkTheme ? 'dark' : 'light');
  const isIOS = effectiveTheme === 'ios';
  const isLight = effectiveTheme === 'light';
  const isCyber = effectiveTheme === 'cyber';

  return (
    <div
      className={`w-full min-h-screen flex justify-center transition-colors ${
        isIOS
          ? 'bg-[#000000] text-white'
          : isCyber
          ? 'bg-[#06060C] text-white'
          : isLight
          ? 'bg-[#E5E9E3] text-[#121212]'
          : 'bg-[#0C0C0E] text-white'
      }`}
    >
      {/* Torch Screen Glow / Status Indicator */}
      {isTorchOn && (
        <div
          onClick={() => setIsFlashlightModalOpen(true)}
          className="fixed top-3 z-50 bg-amber-400 text-black px-4 py-1.5 rounded-full shadow-2xl flex items-center gap-2 text-xs font-bold cursor-pointer hover:scale-105 transition-transform border border-amber-300 animate-in fade-in"
        >
          <Flashlight className="w-4 h-4 animate-bounce" />
          <span>Фонарик активен • Нажмите для регулировки</span>
        </div>
      )}

      {/* Main Container */}
      <div
        className={`w-full max-w-md min-h-screen flex flex-col shadow-2xl relative overflow-hidden transition-all ${
          isIOS
            ? 'bg-[#000000] sm:my-3 sm:rounded-[44px] sm:border-[6px] sm:border-[#2C2C2E] sm:shadow-2xl'
            : isCyber
            ? 'bg-[#0A0A14] border-x border-[#00F0FF]/25 shadow-2xl shadow-[#00F0FF]/10'
            : isLight
            ? 'bg-[#F2F5F0] border-x border-[#D5DAD1]'
            : 'bg-[#121214] border-x border-white/5'
        }`}
      >
        {/* Dynamic Island Media Widget */}
        {isMusicPlaying && (
          <div
            id="islandMiniPlayer"
            className="w-full bg-neutral-900/90 text-white px-3 py-1.5 flex items-center justify-between text-xs border-b border-amber-500/30 backdrop-blur-md z-30 animate-in slide-in-from-top-2"
          >
            <div
              className="flex items-center gap-2 cursor-pointer flex-1 truncate"
              onClick={() => setIsMusicPlayerOpen(true)}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
              <div className="truncate">
                <span className="text-[10px] text-amber-400 block leading-tight font-mono">
                  {PLAYLIST[currentTrackIndex]?.tag || 'LIRA WAVE'}
                </span>
                <span className="font-semibold text-xs truncate">
                  {PLAYLIST[currentTrackIndex]?.title || 'Музыкальный плеер'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-2">
              <button
                type="button"
                onClick={() => {
                  triggerVibration('tap');
                  setIsMusicPlaying(false);
                }}
                className="p-1 rounded-md hover:bg-white/10 cursor-pointer"
                title="Пауза"
              >
                <Pause className="w-3.5 h-3.5 text-amber-400" />
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerVibration('selection');
                  handleNextTrack();
                }}
                className="p-1 rounded-md hover:bg-white/10 cursor-pointer"
                title="Следующий трек"
              >
                <SkipForward className="w-3.5 h-3.5 text-amber-400" />
              </button>
            </div>
          </div>
        )}

        {/* Top Bar with Integrated Dynamic Island & Remote Trigger */}
        <TopBar
          statusText={statusText}
          isListening={isListening}
          onOpenHelp={() => setIsHelpOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenRemote={() => setIsRemoteMenuOpen(true)}
          onOpenWidgets={() => setIsDesktopWidgetOpen(true)}
          isWakeWordActive={isWakeWordActive}
          theme={effectiveTheme}
        />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {currentTab === 'chat' && (
            <ChatView
              messages={messages}
              inputText={inputText}
              setInputText={setInputText}
              onSendMessage={handleProcessCommand}
              isListening={isListening}
              onToggleMic={handleToggleMic}
              theme={effectiveTheme}
              activeTimer={activeTimer}
              onResetTimer={() => setActiveTimer(null)}
              onOpenTimer={() => setIsTimerOpen(true)}
              onOpenRemote={() => setIsRemoteMenuOpen(true)}
              onOpenActionHub={() => setIsActionHubOpen(true)}
            />
          )}

          {currentTab === 'vibe' && (
            <VibeView
              theme={effectiveTheme}
              onOpenApp={handleOpenApp}
              onSendCommand={handleProcessCommand}
              isTorchOn={isTorchOn}
              onToggleTorch={() => setIsTorchOn(prev => !prev)}
              isMusicPlaying={isMusicPlaying}
              onToggleMusic={() => setIsMusicPlaying(prev => !prev)}
            />
          )}

          {currentTab === 'finance' && (
            <FinanceView onSendMessage={handleProcessCommand} theme={effectiveTheme} />
          )}
        </main>

        {/* Bottom Navigation */}
        <BottomNav
          currentTab={currentTab}
          onTabChange={handleTabChange}
          theme={effectiveTheme}
        />

        {/* Floating Widget (overlay button from Settings) */}
        <FloatingWidget
          isVisible={settings.widgetEnabled}
          isListening={isListening}
          onToggleMic={handleToggleMic}
          isTorchOn={isTorchOn}
          onToggleTorch={() => setIsTorchOn(prev => !prev)}
          isMusicPlaying={isMusicPlaying}
          onToggleMusic={() => setIsMusicPlaying(prev => !prev)}
          onOpenApp={(appId) => {
            const app = SYSTEM_APPS.find(a => a.id === appId);
            if (app) handleOpenApp(app);
          }}
          theme={effectiveTheme}
          initialStyle={settings.widgetStyle || 'orb'}
          onOpenWidgetInfo={() => setIsWidgetInfoOpen(true)}
        />

        {/* First Launch Privacy Consent Modal */}
        {showFirstLaunchPrivacy && (
          <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="w-full max-w-sm bg-[#18181A] text-white rounded-2xl p-5 border border-[#00E676]/30 shadow-2xl">
              <h3 className="font-bold text-base text-[#00E676] mb-2 flex items-center gap-1.5">
                <span>🔒</span> Конфиденциальность L.I.R.A.
              </h3>
              <p className="text-sm text-[#DDDDDD] leading-relaxed mb-5">
                Все голосовые команды, заметки и финансовые данные обрабатываются локально на устройстве без отправки третьим лицам.
              </p>
              <button
                type="button"
                onClick={() => {
                  triggerVibration('selection');
                  setSettings(prev => ({ ...prev, privacyAccepted: true }));
                  setShowFirstLaunchPrivacy(false);
                }}
                className="w-full py-3 bg-[#00E676] hover:bg-[#00c864] text-black font-bold rounded-xl text-sm transition-colors cursor-pointer"
              >
                Принять и продолжить
              </button>
            </div>
          </div>
        )}

        {/* Crash Report Modal */}
        {showCrashReport && lastCrash && (
          <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="w-full max-w-sm bg-[#1C1212] text-white rounded-2xl p-5 border border-red-500/30 shadow-2xl">
              <h3 className="font-bold text-base text-red-400 mb-2 flex items-center gap-1.5">
                <span>⚠️</span> Отчет о сбое L.I.R.A.
              </h3>
              <p className="text-xs text-[#CCCCCC] leading-relaxed mb-4">
                Приложение обнаружило ошибку при предыдущем запуске. Скопируйте этот отчет, чтобы мы могли исправить проблему:
              </p>
              
              <div className="bg-black/50 rounded-xl p-3 border border-red-500/10 max-h-48 overflow-y-auto mb-4 font-mono text-[10px] text-red-300 leading-normal break-all">
                <div className="font-bold mb-1">[Тип]: {lastCrash.type}</div>
                <div className="font-bold mb-1">[Сообщение]: {lastCrash.message}</div>
                <div className="text-neutral-400 select-all whitespace-pre-wrap">{lastCrash.stack}</div>
                <div className="text-[9px] text-neutral-500 mt-2">Время: {new Date(lastCrash.time).toLocaleString()}</div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    try {
                      navigator.clipboard.writeText(`Type: ${lastCrash.type}\nMessage: ${lastCrash.message}\nStack: ${lastCrash.stack}`);
                    } catch {}
                    triggerVibration('selection');
                  }}
                  className="flex-1 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Копировать
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerVibration('selection');
                    localStorage.removeItem('lira_last_crash');
                    setShowCrashReport(false);
                  }}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Очистить и закрыть
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Windows / iOS Style Remote Control Context Flyout */}
        <RemoteContextMenu
          isOpen={isRemoteMenuOpen}
          onClose={() => setIsRemoteMenuOpen(false)}
          theme={effectiveTheme}
          isTorchOn={isTorchOn}
          onToggleTorch={() => setIsTorchOn(prev => !prev)}
          isMusicPlaying={isMusicPlaying}
          onToggleMusic={() => setIsMusicPlaying(prev => !prev)}
          onNextTrack={handleNextTrack}
          onPrevTrack={handlePrevTrack}
          onOpenSmartCalc={() => setIsSmartCalcOpen(true)}
          onOpenNotes={() => setIsNotesOpen(true)}
          onOpenAlarm={() => setIsAlarmOpen(true)}
          onOpenTimer={() => setIsTimerOpen(true)}
          onOpenOfflineSpeech={() => setIsOfflineSpeechOpen(true)}
          onOpenMusicPlayer={() => setIsMusicPlayerOpen(true)}
          onOpenFlashlightModal={() => setIsFlashlightModalOpen(true)}
          onOpenFileScanner={() => handleOpenFileScanner()}
          isListening={isListening}
          onToggleMic={handleToggleMic}
          onRunCommand={handleProcessCommand}
          settings={settings}
          onUpdateSettings={(newVals) => setSettings(prev => ({ ...prev, ...newVals }))}
        />

        {/* Dynamic Tab-Specific Help Dialog */}
        <HelpDialog
          isOpen={isHelpOpen}
          onClose={() => setIsHelpOpen(false)}
          initialTab={currentTab}
          theme={effectiveTheme}
        />

        <SettingsDialog
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          onSaveSettings={setSettings}
          onClearChatHistory={handleClearHistory}
          onOpenPrivacy={() => setIsPrivacyOpen(true)}
          onOpenWidgetInfo={() => setIsWidgetInfoOpen(true)}
        />

        <WidgetBackgroundInfoModal
          isOpen={isWidgetInfoOpen}
          onClose={() => setIsWidgetInfoOpen(false)}
        />

        <PrivacyPolicyDialog
          isOpen={isPrivacyOpen}
          onClose={() => setIsPrivacyOpen(false)}
        />

        <CameraModal
          isOpen={isCameraOpen}
          onClose={() => setIsCameraOpen(false)}
          isTorchOn={isTorchOn}
          onToggleTorch={() => setIsTorchOn(prev => !prev)}
        />

        <CalculatorModal
          isOpen={isCalcOpen}
          onClose={() => setIsCalcOpen(false)}
          onSendResult={(res) => addMessage(res, false, true)}
        />

        <NotesModal
          isOpen={isNotesOpen}
          onClose={() => setIsNotesOpen(false)}
          notes={notesList}
          onAddNote={(txt) => setNotesList(prev => [...prev, txt])}
          onDeleteNote={(idx) => setNotesList(prev => prev.filter((_, i) => i !== idx))}
          onClearNotes={() => setNotesList([])}
        />

        <AlarmModal
          isOpen={isAlarmOpen}
          onClose={() => setIsAlarmOpen(false)}
          alarms={alarms}
          onAddAlarm={(al) => setAlarms(prev => [...prev, al])}
          onDeleteAlarm={(id) => setAlarms(prev => prev.filter(a => a.id !== id))}
          onToggleAlarm={(id) =>
            setAlarms(prev =>
              prev.map(a => (a.id === id ? { ...a, isActive: !a.isActive } : a))
            )
          }
        />

        <TimerModal
          isOpen={isTimerOpen}
          onClose={() => setIsTimerOpen(false)}
          activeTimer={activeTimer}
          onStartTimer={(seconds, label) => {
            setActiveTimer({
              id: Date.now().toString(),
              totalSeconds: seconds,
              remainingSeconds: seconds,
              label,
              isRunning: true,
              createdAt: Date.now(),
            });
          }}
          onPauseResumeTimer={() => {
            setActiveTimer(prev => (prev ? { ...prev, isRunning: !prev.isRunning } : null));
          }}
          onResetTimer={() => setActiveTimer(null)}
          theme={effectiveTheme}
        />

        <OfflineSpeechModal
          isOpen={isOfflineSpeechOpen}
          onClose={() => setIsOfflineSpeechOpen(false)}
          theme={effectiveTheme}
        />

        <HardwareControlModal
          isOpen={isHardwareControlOpen}
          onClose={() => setIsHardwareControlOpen(false)}
          theme={effectiveTheme}
        />

        <SmartCalculatorModal
          isOpen={isSmartCalcOpen}
          onClose={() => setIsSmartCalcOpen(false)}
          theme={effectiveTheme}
        />

        <MusicPlayerModal
          isOpen={isMusicPlayerOpen}
          onClose={() => setIsMusicPlayerOpen(false)}
          isPlaying={isMusicPlaying}
          onTogglePlay={() => setIsMusicPlaying(prev => !prev)}
          currentTrackIndex={currentTrackIndex}
          onSelectTrack={(idx) => {
            setCurrentTrackIndex(idx);
            setIsMusicPlaying(true);
          }}
          onNextTrack={handleNextTrack}
          onPrevTrack={handlePrevTrack}
          theme={effectiveTheme}
        />

        <FlashlightControlModal
          isOpen={isFlashlightModalOpen}
          onClose={() => setIsFlashlightModalOpen(false)}
          isTorchOn={isTorchOn}
          onToggleTorch={() => setIsTorchOn(prev => !prev)}
          theme={effectiveTheme}
        />

        <FileScannerModal
          isOpen={isFileScannerOpen}
          onClose={() => setIsFileScannerOpen(false)}
          initialQuery={fileScannerQuery}
          initialCategory={fileScannerCategory}
          theme={effectiveTheme}
        />

        <ActionHubModal
          isOpen={isActionHubOpen}
          onClose={() => setIsActionHubOpen(false)}
          theme={effectiveTheme}
          onRunCommand={handleProcessCommand}
          onOpenTimer={() => setIsTimerOpen(true)}
          onOpenOfflineSpeech={() => setIsOfflineSpeechOpen(true)}
          onOpenHardwareControl={() => setIsHardwareControlOpen(true)}
          onOpenSmartCalc={() => setIsSmartCalcOpen(true)}
          onOpenRemote={() => setIsRemoteMenuOpen(true)}
          onOpenFileScanner={(query, category) => handleOpenFileScanner(query, category)}
          onOpenFlashlightModal={() => setIsFlashlightModalOpen(true)}
        />

        <DesktopWidgetModal
          isOpen={isDesktopWidgetOpen}
          onClose={() => setIsDesktopWidgetOpen(false)}
          settings={settings}
          onUpdateSettings={setSettings}
          onToggleWakeWord={handleToggleWakeWord}
          isWakeWordActive={isWakeWordActive}
          wakeWordStatus={wakeWordStatus}
        />
      </div>
    </div>
  );
};
export default App;
