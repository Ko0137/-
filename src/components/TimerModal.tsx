import React, { useState } from 'react';
import { AppTheme, ActiveTimer } from '../types';
import { triggerVibration, soundManager } from '../utils/sound';
import { Timer, Play, Pause, RotateCcw, Plus, Check, Clock, X, Bell } from 'lucide-react';

interface TimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTimer: ActiveTimer | null;
  onStartTimer: (seconds: number, label: string) => void;
  onPauseResumeTimer: () => void;
  onResetTimer: () => void;
  theme?: AppTheme;
}

const PRESET_TIMERS = [
  { label: 'Чай / Кофе', seconds: 60, icon: '☕' },
  { label: 'Яйца всмятку', seconds: 180, icon: '🥚' },
  { label: 'Перерыв', seconds: 300, icon: '🌿' },
  { label: 'Фокус спринт', seconds: 600, icon: '⚡' },
  { label: 'Помидоро 25м', seconds: 1500, icon: '🍅' },
  { label: 'Тренировка 45м', seconds: 2700, icon: '💪' },
];

export const TimerModal: React.FC<TimerModalProps> = ({
  isOpen,
  onClose,
  activeTimer,
  onStartTimer,
  onPauseResumeTimer,
  onResetTimer,
  theme = 'dark',
}) => {
  const isIOS = theme === 'ios';
  const isLight = theme === 'light';
  const isCyber = theme === 'cyber';

  const [customMinutes, setCustomMinutes] = useState('');
  const [customSeconds, setCustomSeconds] = useState('');
  const [customLabel, setCustomLabel] = useState('');

  if (!isOpen) return null;

  const handleStartCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const mins = parseInt(customMinutes || '0', 10);
    const secs = parseInt(customSeconds || '0', 10);
    const total = mins * 60 + secs;
    if (total <= 0) return;

    triggerVibration('commandSuccess');
    onStartTimer(total, customLabel.trim() || `${mins ? mins + ' мин ' : ''}${secs ? secs + ' сек' : ''}`);
    setCustomMinutes('');
    setCustomSeconds('');
    setCustomLabel('');
  };

  const formatTime = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = activeTimer && activeTimer.totalSeconds > 0
    ? Math.max(0, Math.min(100, (activeTimer.remainingSeconds / activeTimer.totalSeconds) * 100))
    : 0;

  return (
    <div
      id="dialog_timer_backdrop"
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="dialog_timer_container"
        className={`w-full max-w-sm rounded-3xl p-5 border shadow-2xl transition-all ${
          isIOS
            ? 'bg-[#1C1C1E]/95 backdrop-blur-2xl border-white/20 text-white shadow-blue-500/10'
            : isCyber
            ? 'bg-[#0E0E1C] border-[#00F0FF]/30 text-white shadow-[#00F0FF]/15'
            : isLight
            ? 'bg-[#FFFFFF] border-[#D0D7CD] text-[#1E2520] shadow-xl'
            : 'bg-[#18181B] border-white/10 text-white'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <Timer className={`w-5 h-5 ${isCyber ? 'text-[#00F0FF]' : isLight ? 'text-[#00A352]' : 'text-[#00E676]'}`} />
            <h3 className="font-bold text-base">Таймер обратного отсчета</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-white/50 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Timer Display */}
        {activeTimer ? (
          <div className="py-4 flex flex-col items-center justify-center space-y-4">
            <div className="relative w-40 h-40 flex items-center justify-center">
              {/* Circular Progress Ring */}
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="8"
                  className={isLight ? 'text-neutral-200' : 'text-white/10'}
                  fill="transparent"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke={isIOS ? '#007AFF' : isCyber ? '#00F0FF' : isLight ? '#00A352' : '#00E676'}
                  strokeWidth="8"
                  strokeDasharray="440"
                  strokeDashoffset={440 - (440 * progressPercent) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-linear"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-mono font-bold tracking-tight">
                  {formatTime(activeTimer.remainingSeconds)}
                </span>
                <span className="text-[11px] opacity-70 truncate max-w-[120px] mt-1">
                  {activeTimer.label}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  triggerVibration('tap');
                  onPauseResumeTimer();
                }}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md ${
                  activeTimer.isRunning
                    ? 'bg-amber-500 hover:bg-amber-400 text-black'
                    : 'bg-[#00E676] hover:bg-[#00c864] text-black'
                }`}
              >
                {activeTimer.isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{activeTimer.isRunning ? 'Пауза' : 'Продолжить'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerVibration('warningPulse');
                  onResetTimer();
                }}
                className="px-4 py-2.5 rounded-xl font-medium text-xs bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Сброс</span>
              </button>
            </div>
          </div>
        ) : (
          /* Presets & Custom Setup */
          <div className="space-y-4">
            <div>
              <div className="text-[11px] font-medium opacity-70 mb-2">Быстрые пресеты:</div>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_TIMERS.map(p => (
                  <button
                    key={p.seconds}
                    type="button"
                    onClick={() => {
                      triggerVibration('commandSuccess');
                      onStartTimer(p.seconds, p.label);
                    }}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-all ${
                      isIOS
                        ? 'bg-white/10 hover:bg-white/15 border-white/10 text-white'
                        : isCyber
                        ? 'bg-[#00F0FF]/10 hover:bg-[#00F0FF]/20 border-[#00F0FF]/30 text-white'
                        : isLight
                        ? 'bg-[#F2F5F0] hover:bg-[#E5EAE2] border-[#D0D7CD] text-[#1E2520]'
                        : 'bg-white/5 hover:bg-white/10 border-white/5 text-white'
                    }`}
                  >
                    <span className="text-lg">{p.icon}</span>
                    <div className="truncate">
                      <div className="font-bold text-xs">{p.label}</div>
                      <div className="text-[10px] opacity-60 font-mono">{formatTime(p.seconds)}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Time Form */}
            <form onSubmit={handleStartCustom} className="p-3 bg-black/20 rounded-2xl border border-white/5 space-y-2.5">
              <div className="text-[11px] font-medium opacity-70">Своё время:</div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    max="180"
                    value={customMinutes}
                    onChange={e => setCustomMinutes(e.target.value)}
                    placeholder="Мин"
                    className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-xl text-white text-xs font-mono focus:border-[#00E676] focus:outline-none"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={customSeconds}
                    onChange={e => setCustomSeconds(e.target.value)}
                    placeholder="Сек"
                    className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-xl text-white text-xs font-mono focus:border-[#00E676] focus:outline-none"
                  />
                </div>
              </div>

              <input
                type="text"
                value={customLabel}
                onChange={e => setCustomLabel(e.target.value)}
                placeholder="Метка (например: Пирог)"
                className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-xl text-white text-xs focus:border-[#00E676] focus:outline-none"
              />

              <button
                type="submit"
                className={`w-full py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                  isIOS
                    ? 'bg-[#007AFF] hover:bg-[#0062D2] text-white'
                    : isCyber
                    ? 'bg-[#00F0FF] hover:bg-[#00d0e0] text-black'
                    : 'bg-[#00E676] hover:bg-[#00c864] text-black'
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                <span>Запустить таймер</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
