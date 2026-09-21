import React from 'react';
import { X, Mic, Smartphone, LayoutGrid, Radio, Check, Power } from 'lucide-react';
import { SettingsState, WidgetStyle } from '../types';
import { triggerVibration, soundManager } from '../utils/sound';

interface DesktopWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SettingsState;
  onUpdateSettings: (updater: (prev: SettingsState) => SettingsState) => void;
  onToggleWakeWord: () => void;
  isWakeWordActive: boolean;
  wakeWordStatus: string;
}

export const DesktopWidgetModal: React.FC<DesktopWidgetModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onToggleWakeWord,
  isWakeWordActive,
  wakeWordStatus,
}) => {
  if (!isOpen) return null;

  const widgetStyles: { id: WidgetStyle; name: string; desc: string; icon: string }[] = [
    { id: 'orb', name: 'Неоновый Сонар', desc: 'Компактный пульсирующий реактор с мгновенным микрофоном', icon: '🎙️' },
    { id: 'dashboard', name: 'Мини-Пульт L.I.R.A.', desc: 'Быстрые кнопки: микрофон, фонарик, сканер и таймер', icon: '🎛️' },
    { id: 'vibe', name: 'Статус и Часы', desc: 'Виджет с точным временем, батареей и быстрой заметкой', icon: '⏱️' },
    { id: 'finance', name: 'Калькулятор-Виджет', desc: 'Быстрый доступ к подсчетам и конвертеру валют', icon: '🧮' },
  ];

  const handleToggleFloatingWidget = () => {
    triggerVibration('selection');
    onUpdateSettings(prev => ({ ...prev, widgetEnabled: !prev.widgetEnabled }));
  };

  const handleSelectStyle = (style: WidgetStyle) => {
    triggerVibration('selection');
    soundManager.playClick();
    onUpdateSettings(prev => ({ ...prev, widgetStyle: style }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#141418] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#1A1A22]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[var(--accent-color,#00E676)]/10 text-[var(--accent-color,#00E676)] border border-[var(--accent-color,#00E676)]/20">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Виджеты и Голосовая активация</h3>
              <p className="text-xs text-neutral-400">Настройка рабочего стола и команды «Лира»</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-6">
          {/* 1. Wake Word "Лира" Activation */}
          <div className="p-4 rounded-xl bg-[#1C1C24] border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${isWakeWordActive ? 'bg-[var(--accent-color,#00E676)]/20 text-[var(--accent-color,#00E676)] animate-pulse' : 'bg-white/5 text-neutral-400'}`}>
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white flex items-center gap-2">
                    Активация голосом «Лира»
                    {isWakeWordActive && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[var(--accent-color,#00E676)]/20 text-[var(--accent-color,#00E676)] border border-[var(--accent-color,#00E676)]/30">
                        АКТИВНО
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-400">
                    Слушает команду: <i>«Лира, включи фонарик»</i>, <i>«Лира, сколько времени»</i>
                  </p>
                </div>
              </div>

              <button
                onClick={onToggleWakeWord}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isWakeWordActive
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                    : 'bg-[var(--accent-color,#00E676)] text-black hover:opacity-90 shadow-lg shadow-[var(--accent-color,#00E676)]/20'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                {isWakeWordActive ? 'Отключить' : 'Включить'}
              </button>
            </div>

            {isWakeWordActive && (
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex items-center gap-2 text-xs text-[var(--accent-color,#00E676)]">
                <Radio className="w-4 h-4 animate-spin text-[var(--accent-color,#00E676)]" />
                <span>{wakeWordStatus}</span>
              </div>
            )}
          </div>

          {/* 2. Floating On-Screen Overlay Widget */}
          <div className="p-4 rounded-xl bg-[#1C1C24] border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-white flex items-center gap-2">
                  Плавающий экранный виджет
                </div>
                <p className="text-xs text-neutral-400">
                  Закрепленная кнопка быстрого доступа на экране
                </p>
              </div>
              <button
                onClick={handleToggleFloatingWidget}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  settings.widgetEnabled ? 'bg-[var(--accent-color,#00E676)]' : 'bg-neutral-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.widgetEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {settings.widgetEnabled && (
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="text-xs font-medium text-neutral-300">Стиль виджета:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {widgetStyles.map(st => (
                    <button
                      key={st.id}
                      onClick={() => handleSelectStyle(st.id)}
                      className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                        settings.widgetStyle === st.id
                          ? 'bg-[var(--accent-color,#00E676)]/10 border-[var(--accent-color,#00E676)] text-white'
                          : 'bg-white/5 border-white/5 text-neutral-300 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium flex items-center gap-1.5">
                          <span>{st.icon}</span> {st.name}
                        </span>
                        {settings.widgetStyle === st.id && (
                          <Check className="w-3.5 h-3.5 text-[var(--accent-color,#00E676)]" />
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400">{st.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. Android Home Screen Shortcuts Instruction */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-[#1C1C24] to-[#16161E] border border-white/5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-white">
              <Smartphone className="w-4 h-4 text-[var(--accent-color,#00E676)]" />
              Ярлыки на рабочем столе Pixel 8
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              На рабочем столе вашего телефона зажмите и удерживайте иконку приложения <b>L.I.R.A.</b> — появится меню быстрых действий:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-neutral-200">
                🎙️ Голосовой ввод
              </div>
              <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-neutral-200">
                🔦 Фонарик
              </div>
              <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-neutral-200">
                📂 Сканер файлов
              </div>
              <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-neutral-200">
                ⏱️ Таймер
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#1A1A22] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[var(--accent-color,#00E676)] text-black font-semibold text-xs hover:opacity-90 transition-opacity cursor-pointer"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
};
