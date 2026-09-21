import React, { useState, useRef, useEffect } from 'react';
import { triggerVibration } from '../utils/sound';
import { WidgetStyle, AppTheme, CurrencyCode } from '../types';
import {
  Mic,
  Flashlight,
  Music,
  Camera,
  Compass,
  Wallet,
  X,
  Maximize2,
  Minimize2,
  RefreshCw,
  Layers,
  Sparkles,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import { CURRENCIES, formatCurrencyAmount } from '../utils/currency';

interface FloatingWidgetProps {
  isVisible: boolean;
  isListening: boolean;
  onToggleMic: () => void;
  isTorchOn?: boolean;
  onToggleTorch?: () => void;
  isMusicPlaying?: boolean;
  onToggleMusic?: () => void;
  onOpenApp?: (appId: string) => void;
  theme?: AppTheme;
  initialStyle?: WidgetStyle;
  onOpenWidgetInfo?: () => void;
}

export const FloatingWidget: React.FC<FloatingWidgetProps> = ({
  isVisible,
  isListening,
  onToggleMic,
  isTorchOn = false,
  onToggleTorch,
  isMusicPlaying = false,
  onToggleMusic,
  onOpenApp,
  theme = 'dark',
  initialStyle = 'orb',
  onOpenWidgetInfo,
}) => {
  const [style, setStyle] = useState<WidgetStyle>(() => {
    try {
      const saved = localStorage.getItem('lira_widget_style') as WidgetStyle;
      if (saved) return saved;
    } catch {}
    return initialStyle;
  });

  const [position, setPosition] = useState({ x: 20, y: 140 });
  const [isDragging, setIsDragging] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const dragStartRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({
    startX: 0,
    startY: 0,
    posX: 20,
    posY: 140,
  });
  const hasMovedRef = useRef(false);

  // Read mock or live data for widgets
  const [cachedBalance, setCachedBalance] = useState<number>(12450);
  const [cachedCurrency, setCachedCurrency] = useState<CurrencyCode>('RUB');
  const [dayProgress, setDayProgress] = useState<number>(68);

  useEffect(() => {
    try {
      const savedCurr = localStorage.getItem('lira_finance_base_currency') as CurrencyCode;
      if (savedCurr && CURRENCIES[savedCurr]) setCachedCurrency(savedCurr);

      const finData = localStorage.getItem('lira_finance_transactions_v2');
      if (finData) {
        const items = JSON.parse(finData);
        const bal = items.reduce((acc: number, it: any) => {
          return it.type === 'income' ? acc + it.amount : acc - it.amount;
        }, 0);
        setCachedBalance(bal);
      }
    } catch {}
  }, [isVisible]);

  useEffect(() => {
    localStorage.setItem('lira_widget_style', style);
  }, [style]);

  if (!isVisible) return null;

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only drag from container header or background, avoid stopping button clicks
    if ((e.target as HTMLElement).closest('button, input, a')) {
      return;
    }
    setIsDragging(true);
    hasMovedRef.current = false;
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: position.x,
      posY: position.y,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;
    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
      hasMovedRef.current = true;
    }
    const maxW = Math.max(300, window.innerWidth - 80);
    const maxH = Math.max(300, window.innerHeight - 80);
    const newX = Math.max(10, Math.min(maxW, dragStartRef.current.posX + dx));
    const newY = Math.max(50, Math.min(maxH, dragStartRef.current.posY + dy));
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const cycleStyle = () => {
    triggerVibration('selection');
    const order: WidgetStyle[] = ['orb', 'dashboard', 'vibe', 'finance'];
    const nextIdx = (order.indexOf(style) + 1) % order.length;
    setStyle(order[nextIdx]);
  };

  const isIOS = theme === 'ios';

  return (
    <div
      id="floating_desktop_widget"
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        touchAction: 'none',
      }}
      className="z-50 select-none cursor-grab active:cursor-grabbing"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* 1. COMPACT VOICE ORB WIDGET */}
      {style === 'orb' && (
        <div className="relative group">
          {/* Pulsing ring when listening */}
          {isListening && (
            <div className="absolute -inset-2 rounded-full bg-red-500/40 animate-ping pointer-events-none" />
          )}

          <div
            className={`flex items-center gap-2 p-1.5 rounded-full shadow-2xl backdrop-blur-xl border transition-all ${
              isListening
                ? 'bg-red-950/90 border-red-500 text-white shadow-red-500/40 scale-105'
                : isIOS
                ? 'bg-[#1C1C1E]/95 border-white/20 text-white shadow-black/80'
                : 'bg-[#181818]/95 border-[#00E676]/40 text-white shadow-[#00E676]/20'
            }`}
          >
            <button
              type="button"
              onClick={() => {
                triggerVibration('micStart');
                onToggleMic();
              }}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90 cursor-pointer ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse'
                  : isIOS
                  ? 'bg-[#007AFF] text-white hover:bg-[#006ee6]'
                  : 'bg-[#00E676] text-black hover:bg-[#00c864]'
              }`}
              title="Нажмите для голосового ввода"
            >
              <Mic className="w-5 h-5" />
            </button>

            {/* Quick action mini strip */}
            <div className="flex items-center pr-2 gap-1.5 text-xs">
              <button
                type="button"
                onClick={cycleStyle}
                title="Сменить виджет рабочего стола"
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 transition-colors cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
              </button>
              {onOpenWidgetInfo && (
                <button
                  type="button"
                  onClick={onOpenWidgetInfo}
                  title="О фоновом режиме и виджетах"
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 transition-colors cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. DASHBOARD WIDGET (4x2 style) */}
      {style === 'dashboard' && (
        <div
          className={`w-72 p-3 rounded-2xl shadow-2xl backdrop-blur-xl border transition-all ${
            isIOS
              ? 'bg-[#1C1C1E]/95 border-white/20 text-white shadow-black/90'
              : 'bg-[#181818]/95 border-[#00E676]/40 text-white shadow-black/90'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse" />
              <span className="text-xs font-bold font-mono tracking-wider">L.I.R.A. DASHBOARD</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={cycleStyle}
                title="Следующий стиль виджета"
                className="p-1 text-white/50 hover:text-white rounded hover:bg-white/10 cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
              </button>
              {onOpenWidgetInfo && (
                <button
                  type="button"
                  onClick={onOpenWidgetInfo}
                  title="Фоновый режим"
                  className="p-1 text-white/50 hover:text-white rounded hover:bg-white/10 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Body with central big mic & quick toggles */}
          <div className="flex items-center justify-between pt-3 pb-1">
            {/* Left: Torch & Music */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  triggerVibration('tap');
                  onToggleTorch?.();
                }}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  isTorchOn
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/40'
                    : 'bg-white/10 text-white hover:bg-white/15'
                }`}
                title="Фонарик"
              >
                <Flashlight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerVibration('tap');
                  onToggleMusic?.();
                }}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  isMusicPlaying
                    ? 'bg-[#00E676] text-black shadow-lg shadow-[#00E676]/40'
                    : 'bg-white/10 text-white hover:bg-white/15'
                }`}
                title="Музыка"
              >
                <Music className="w-4 h-4" />
              </button>
            </div>

            {/* Center: Main Mic Orb */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => {
                  triggerVibration('micStart');
                  onToggleMic();
                }}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-xl cursor-pointer ${
                  isListening
                    ? 'bg-red-600 text-white ring-4 ring-red-500/40 animate-pulse'
                    : isIOS
                    ? 'bg-[#007AFF] text-white shadow-[#007AFF]/30 hover:scale-105'
                    : 'bg-[#00E676] text-black shadow-[#00E676]/30 hover:scale-105'
                }`}
              >
                <Mic className="w-7 h-7" />
              </button>
              <span className="text-[10px] text-white/60 mt-1 font-medium">
                {isListening ? 'Слушаю...' : 'Команда'}
              </span>
            </div>

            {/* Right: Camera & Organizer */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  triggerVibration('tap');
                  onOpenApp?.('camera');
                }}
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/15 text-white flex items-center justify-center transition-all cursor-pointer"
                title="Камера"
              >
                <Camera className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerVibration('tap');
                  onOpenApp?.('notes');
                }}
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/15 text-white flex items-center justify-center transition-all cursor-pointer"
                title="Заметки"
              >
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. VIBE / MIND//DAY PROGRESS WIDGET (2x2 / 4x2 style) */}
      {style === 'vibe' && (
        <div
          className={`w-64 p-3.5 rounded-2xl shadow-2xl backdrop-blur-xl border transition-all ${
            isIOS
              ? 'bg-[#1C1C1E]/95 border-white/20 text-white'
              : 'bg-[#15231E]/95 border-[#00E676]/35 text-white'
          }`}
        >
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#00E676]" />
              <span className="text-xs font-bold tracking-tight">MIND//DAY ВИТАЛИТИ</span>
            </div>
            <button
              type="button"
              onClick={cycleStyle}
              title="Сменить стиль"
              className="p-1 text-white/50 hover:text-white rounded hover:bg-white/10 cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="py-2.5">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-2xl font-bold text-[#00E676]">{dayProgress}%</span>
              <span className="text-[11px] text-white/70">Фокус: Норма 🟠</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-[#00E676] to-[#00b0ff] rounded-full transition-all duration-500"
                style={{ width: `${dayProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-white/50 mt-1.5 font-mono">
              <span>График: 2/2 (Смена 1)</span>
              <span>База выполнена</span>
            </div>
          </div>

          {/* Quick Voice Logging button */}
          <button
            type="button"
            onClick={() => {
              triggerVibration('micStart');
              onToggleMic();
            }}
            className="w-full py-1.5 rounded-xl bg-[#00E676]/20 hover:bg-[#00E676]/30 border border-[#00E676]/40 text-[#00E676] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Голосовой отчёт дня</span>
          </button>
        </div>
      )}

      {/* 4. FINANCE WIDGET (Wallet & Quick Balance) */}
      {style === 'finance' && (
        <div
          className={`w-64 p-3.5 rounded-2xl shadow-2xl backdrop-blur-xl border transition-all ${
            isIOS
              ? 'bg-[#1C1C1E]/95 border-white/20 text-white'
              : 'bg-[#1B4D3E]/95 border-[#00E676]/40 text-white'
          }`}
        >
          <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
            <div className="flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-[#00E676]" />
              <span className="text-xs font-bold">L.I.R.A. ФИНАНСЫ</span>
            </div>
            <button
              type="button"
              onClick={cycleStyle}
              title="Сменить стиль"
              className="p-1 text-white/50 hover:text-white rounded hover:bg-white/10 cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="py-2">
            <div className="text-[10px] text-white/60 uppercase">Капитал ({cachedCurrency}):</div>
            <div className="text-xl font-bold font-mono tracking-tight text-[#00E676]">
              {formatCurrencyAmount(cachedBalance, cachedCurrency)}
            </div>
          </div>

          {/* Quick voice expense button */}
          <button
            type="button"
            onClick={() => {
              triggerVibration('micStart');
              onToggleMic();
            }}
            className="w-full py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <Mic className="w-3.5 h-3.5 text-[#00E676]" />
            <span>«Запиши расход...»</span>
          </button>
        </div>
      )}
    </div>
  );
};
