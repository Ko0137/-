import React, { useState, useEffect } from 'react';
import { AppTheme } from '../types';
import {
  Flashlight,
  Power,
  Sun,
  AlertTriangle,
  Zap,
  Clock,
  X,
  Check,
  Minimize2,
} from 'lucide-react';
import { triggerVibration } from '../utils/sound';

interface FlashlightControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  isTorchOn: boolean;
  onToggleTorch: () => void;
  theme?: AppTheme;
}

export type FlashlightMode = 'torch' | 'screen' | 'strobe' | 'sos';

export const FlashlightControlModal: React.FC<FlashlightControlModalProps> = ({
  isOpen,
  onClose,
  isTorchOn,
  onToggleTorch,
  theme = 'dark',
}) => {
  const [mode, setMode] = useState<FlashlightMode>('torch');
  const [brightness, setBrightness] = useState(100);
  const [screenColor, setScreenColor] = useState<'white' | 'warm' | 'red'>('white');
  const [strobeSpeed, setStrobeSpeed] = useState(4); // Hz
  const [isStrobeActive, setIsStrobeActive] = useState(false);
  const [isFullScreenLight, setIsFullScreenLight] = useState(false);

  const isLight = theme === 'light';
  const isIOS = theme === 'ios';

  // Strobe flashing effect simulation
  useEffect(() => {
    if (!isTorchOn || mode !== 'strobe') {
      setIsStrobeActive(false);
      return;
    }

    const intervalTime = Math.max(50, Math.floor(1000 / (strobeSpeed * 2)));
    const timer = setInterval(() => {
      setIsStrobeActive(prev => !prev);
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isTorchOn, mode, strobeSpeed]);

  if (!isOpen) return null;

  // If user engaged full-screen light mode, show the luminous screen with an instant, high-contrast close button
  if (isFullScreenLight && isTorchOn) {
    const bgClass =
      screenColor === 'white'
        ? 'bg-white text-black'
        : screenColor === 'warm'
        ? 'bg-amber-100 text-amber-950'
        : 'bg-red-600 text-white';

    return (
      <div
        id="fullscreen_flashlight_display"
        className={`fixed inset-0 z-70 flex flex-col items-center justify-between p-6 transition-all duration-200 ${bgClass}`}
        style={{ opacity: brightness / 100 }}
      >
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Flashlight className="w-5 h-5" />
            <span>Фонарик (Экран) • {brightness}%</span>
          </div>
          <button
            type="button"
            onClick={() => {
              triggerVibration('tap');
              setIsFullScreenLight(false);
            }}
            className="px-4 py-2 bg-black/80 text-white rounded-full font-bold text-xs flex items-center gap-1.5 shadow-xl hover:bg-black cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>Свернуть подсветку</span>
          </button>
        </div>

        <div className="text-center space-y-2">
          <div className="text-6xl animate-pulse">🔦</div>
          <div className="font-black text-xl tracking-wider uppercase">Максимальный свет</div>
          <p className="text-xs opacity-80 max-w-xs mx-auto">
            Экран работает как лампа. Нажмите кнопку ниже или вверху для выхода.
          </p>
        </div>

        <div className="w-full max-w-xs flex gap-2">
          <button
            type="button"
            onClick={() => {
              triggerVibration('tap');
              onToggleTorch();
              setIsFullScreenLight(false);
              onClose();
            }}
            className="flex-1 py-3 bg-black/80 hover:bg-black text-white font-bold text-xs rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer"
          >
            <Power className="w-4 h-4 text-red-400" />
            <span>Выключить и закрыть</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      id="dialog_flashlight_backdrop"
      className="fixed inset-0 z-60 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="dialog_flashlight_container"
        className={`w-full max-w-sm rounded-t-3xl sm:rounded-3xl border shadow-2xl flex flex-col overflow-hidden transition-all ${
          isIOS
            ? 'bg-[#1C1C1E] text-white border-white/10'
            : isLight
            ? 'bg-[#F8FAF7] text-[#1E2520] border-[#D8DFD5]'
            : 'bg-[#18181A] text-white border-white/10'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header with Title and Close button */}
        <div
          className={`px-4 py-3 flex items-center justify-between border-b ${
            isLight ? 'border-[#E0E6DD] bg-[#EDF1EA]' : 'border-white/10 bg-white/5'
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                isTorchOn
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30'
                  : 'bg-white/10 text-white/50'
              }`}
            >
              <Flashlight className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs flex items-center gap-1.5">
                <span>Управление фонариком</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isTorchOn
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-white/10 text-white/50'
                  }`}
                >
                  {isTorchOn ? 'СВЕТИТ' : 'ВЫКЛ'}
                </span>
              </div>
              <div className="text-[10px] opacity-60">Аппаратный свет & Экран</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              triggerVibration('tap');
              onClose();
            }}
            title="Закрыть панель фонарика"
            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
              isLight
                ? 'hover:bg-black/10 text-neutral-800'
                : 'hover:bg-white/20 text-white'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Main Central Power Switch */}
          <div className="flex flex-col items-center justify-center py-2">
            <button
              type="button"
              onClick={() => {
                triggerVibration(isTorchOn ? 'tap' : 'commandSuccess');
                onToggleTorch();
              }}
              className={`w-24 h-24 rounded-full flex flex-col items-center justify-center gap-1.5 shadow-2xl transition-all cursor-pointer ${
                isTorchOn
                  ? 'bg-gradient-to-tr from-amber-400 to-yellow-300 text-black scale-105 ring-8 ring-amber-400/20 shadow-amber-400/40'
                  : isLight
                  ? 'bg-[#E2E6DF] hover:bg-[#D5DDD2] text-[#4A554D] ring-4 ring-black/5'
                  : 'bg-[#2A2A2E] hover:bg-[#343438] text-white/70 ring-4 ring-white/5'
              }`}
            >
              <Power className={`w-8 h-8 ${isTorchOn ? 'animate-pulse text-black' : ''}`} />
              <span className="text-[11px] font-black tracking-wider uppercase">
                {isTorchOn ? 'ВЫКЛЮЧИТЬ' : 'ВКЛЮЧИТЬ'}
              </span>
            </button>
          </div>

          {/* Mode Selector Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-black/10 dark:bg-white/5 rounded-xl text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                triggerVibration('selection');
                setMode('torch');
              }}
              className={`py-1.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                mode === 'torch'
                  ? 'bg-amber-500 text-black font-bold shadow-sm'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Flashlight className="w-3.5 h-3.5" />
              <span>Вспышка</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerVibration('selection');
                setMode('screen');
              }}
              className={`py-1.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                mode === 'screen'
                  ? 'bg-amber-500 text-black font-bold shadow-sm'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Экран</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerVibration('selection');
                setMode('strobe');
              }}
              className={`py-1.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                mode === 'strobe'
                  ? 'bg-amber-500 text-black font-bold shadow-sm'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Стробоскоп</span>
            </button>
          </div>

          {/* Mode Options */}
          {mode === 'screen' && (
            <div
              className={`p-3 rounded-2xl border space-y-2.5 ${
                isLight ? 'bg-[#ECEEE9] border-[#D0D7CD]' : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">Яркость экрана:</span>
                <span className="font-mono font-bold text-amber-500">{brightness}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                value={brightness}
                onChange={e => setBrightness(Number(e.target.value))}
                className="w-full h-1.5 bg-neutral-300 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setScreenColor('white')}
                  className={`flex-1 py-1 rounded-lg text-[11px] border cursor-pointer ${
                    screenColor === 'white'
                      ? 'border-amber-500 bg-white text-black font-bold'
                      : 'border-white/10 opacity-60'
                  }`}
                >
                  Холодный
                </button>
                <button
                  type="button"
                  onClick={() => setScreenColor('warm')}
                  className={`flex-1 py-1 rounded-lg text-[11px] border cursor-pointer ${
                    screenColor === 'warm'
                      ? 'border-amber-500 bg-amber-100 text-amber-950 font-bold'
                      : 'border-white/10 opacity-60'
                  }`}
                >
                  Тёплый
                </button>
                <button
                  type="button"
                  onClick={() => setScreenColor('red')}
                  className={`flex-1 py-1 rounded-lg text-[11px] border cursor-pointer ${
                    screenColor === 'red'
                      ? 'border-red-500 bg-red-600 text-white font-bold'
                      : 'border-white/10 opacity-60'
                  }`}
                >
                  Красный
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  triggerVibration('tap');
                  if (!isTorchOn) onToggleTorch();
                  setIsFullScreenLight(true);
                }}
                className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sun className="w-4 h-4" />
                <span>Включить полный экран-лампу</span>
              </button>
            </div>
          )}

          {mode === 'strobe' && (
            <div
              className={`p-3 rounded-2xl border space-y-2.5 ${
                isLight ? 'bg-[#ECEEE9] border-[#D0D7CD]' : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">Частота вспышек:</span>
                <span className="font-mono font-bold text-amber-500">{strobeSpeed} Гц</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={strobeSpeed}
                onChange={e => setStrobeSpeed(Number(e.target.value))}
                className="w-full h-1.5 bg-neutral-300 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <p className="text-[10px] opacity-60">
                Регулирует частоту импульсов светодиода камеры или экрана.
              </p>
            </div>
          )}

          {mode === 'torch' && (
            <div
              className={`p-3 rounded-2xl border text-xs space-y-1.5 ${
                isLight ? 'bg-[#ECEEE9] border-[#D0D7CD]' : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="font-bold flex items-center gap-1.5 text-amber-500">
                <Flashlight className="w-3.5 h-3.5" />
                <span>Основная LED-вспышка</span>
              </div>
              <p className="text-[11px] opacity-70">
                Использует системный фонарик мобильного устройства или эмулятор подсветки.
              </p>
            </div>
          )}

          {/* Footer with Clear Close & Off Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            {isTorchOn ? (
              <button
                type="button"
                onClick={() => {
                  triggerVibration('tap');
                  onToggleTorch();
                  onClose();
                }}
                className="px-3.5 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 font-medium text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Power className="w-3.5 h-3.5" />
                <span>Выключить и выйти</span>
              </button>
            ) : (
              <span className="text-[11px] opacity-50">Фонарик отключен</span>
            )}

            <button
              type="button"
              onClick={() => {
                triggerVibration('tap');
                onClose();
              }}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Закрыть окно</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
