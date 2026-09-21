import React, { useState, useEffect } from 'react';
import { triggerVibration } from '../utils/sound';
import {
  MessageSquare,
  Sparkles,
  Compass,
  Wallet,
  Sliders,
  Settings,
  X,
  Volume2,
  Mic,
  Coins,
  Flame,
  CheckCircle2,
  Calendar,
  Layers,
  Cpu,
} from 'lucide-react';
import { AppTheme, NavTab } from '../types';

interface HelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: NavTab;
  theme?: AppTheme;
}

type HelpCategory = 'chat' | 'vibe' | 'finance' | 'remote' | 'settings';

export const HelpDialog: React.FC<HelpDialogProps> = ({
  isOpen,
  onClose,
  initialTab = 'chat',
  theme = 'dark',
}) => {
  const [activeCategory, setActiveCategory] = useState<HelpCategory>('chat');

  useEffect(() => {
    if (isOpen) {
      if (initialTab === 'chat') setActiveCategory('chat');
      else if (initialTab === 'vibe') setActiveCategory('vibe');
      else if (initialTab === 'finance') setActiveCategory('finance');
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const isIOS = theme === 'ios';
  const isLight = theme === 'light';

  return (
    <div
      id="dialog_help_backdrop"
      className="fixed inset-0 z-60 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="dialog_help_container"
        className={`w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-5 border shadow-2xl max-h-[88vh] flex flex-col transition-all ${
          isIOS
            ? 'bg-[#1C1C1E]/95 backdrop-blur-2xl border-white/20 text-white'
            : isLight
            ? 'bg-[#F9FAF8] border-[#CBD4C8] text-[#1E2520]'
            : 'bg-[#18181A] border-white/15 text-white'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#00E676]/15 flex items-center justify-center text-[#00E676]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Справка и Инструкция L.I.R.A.</h2>
              <p className="text-[11px] opacity-60">Руководство по всем возможностям ассистента</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              triggerVibration('tap');
              onClose();
            }}
            className="p-1 rounded-md text-white/50 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Navigation Tabs (Tab-Specific Navigation) */}
        <div
          className={`p-1 rounded-xl flex items-center gap-1 mb-3 overflow-x-auto no-scrollbar text-xs font-semibold ${
            isIOS
              ? 'bg-white/5 border border-white/10'
              : isLight
              ? 'bg-[#E8ECE5] border border-[#CBD4C8]'
              : 'bg-black/40 border border-white/5'
          }`}
        >
          <button
            type="button"
            onClick={() => {
              triggerVibration('selection');
              setActiveCategory('chat');
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
              activeCategory === 'chat'
                ? 'bg-[#00E676] text-black font-bold shadow-xs'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Чат & Голос</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerVibration('selection');
              setActiveCategory('vibe');
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
              activeCategory === 'vibe'
                ? 'bg-[#00E676] text-black font-bold shadow-xs'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>ВАЙБ</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerVibration('selection');
              setActiveCategory('finance');
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
              activeCategory === 'finance'
                ? 'bg-[#00E676] text-black font-bold shadow-xs'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Финансы</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerVibration('selection');
              setActiveCategory('remote');
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
              activeCategory === 'remote'
                ? 'bg-[#00E676] text-black font-bold shadow-xs'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Пульт & Железо</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerVibration('selection');
              setActiveCategory('settings');
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
              activeCategory === 'settings'
                ? 'bg-[#00E676] text-black font-bold shadow-xs'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Система & Значки</span>
          </button>
        </div>

        {/* Dynamic Help Content per Selected Tab */}
        <div className="flex-1 overflow-y-auto pr-1 text-sm space-y-3 max-h-[50vh] no-scrollbar">
          {/* 1. CHAT & VOICE GUIDE */}
          {activeCategory === 'chat' && (
            <div className="space-y-3">
              <div
                className={`p-3 rounded-2xl border ${
                  isLight ? 'bg-white border-[#CBD4C8]' : 'bg-[#242426] border-white/5'
                }`}
              >
                <h3 className="font-bold text-[#00E676] text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Mic className="w-4 h-4" />
                  <span>Голосовой ввод и распознавание</span>
                </h3>
                <p className="text-xs opacity-80 leading-relaxed mb-2">
                  Нажмите на микрофон внизу экрана или используйте <b>Vosk STT</b> для полностью автономного распознавания русской речи без интернета.
                </p>
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="p-1.5 rounded-lg bg-black/20 border border-white/5">
                    «Открой Яндекс Музыку» или «Включи музыку»
                  </div>
                  <div className="p-1.5 rounded-lg bg-black/20 border border-white/5">
                    «Фонарик» / «Включи свет» / «Яркость»
                  </div>
                  <div className="p-1.5 rounded-lg bg-black/20 border border-white/5">
                    «Посчитай 12500 * 1.2» / «Сколько будет (50+20)*3»
                  </div>
                  <div className="p-1.5 rounded-lg bg-black/20 border border-white/5">
                    «Будильник на 7:30 на работу»
                  </div>
                  <div className="p-1.5 rounded-lg bg-black/20 border border-white/5">
                    «Заметка Купить фильтр для воды»
                  </div>
                </div>
              </div>

              <div
                className={`p-3 rounded-2xl border ${
                  isLight ? 'bg-white border-[#CBD4C8]' : 'bg-[#242426] border-white/5'
                }`}
              >
                <h3 className="font-bold text-[#00E676] text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4" />
                  <span>Пользовательские макросы</span>
                </h3>
                <p className="text-xs opacity-80 leading-relaxed">
                  В <b>Настройках → Команды и Макросы</b> вы можете создавать цепочки действий. Например, на фразу <i>«Доброе утро»</i> ассистент скажет приветствие, включит музыку, зачитает заметки и включит свет.
                </p>
              </div>
            </div>
          )}

          {/* 2. VIBE GUIDE */}
          {activeCategory === 'vibe' && (
            <div className="space-y-3">
              <div
                className={`p-3 rounded-2xl border ${
                  isLight ? 'bg-white border-[#CBD4C8]' : 'bg-[#242426] border-white/5'
                }`}
              >
                <h3 className="font-bold text-amber-400 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Flame className="w-4 h-4" />
                  <span>Система уровней: Min / Norm / Max</span>
                </h3>
                <p className="text-xs opacity-80 leading-relaxed mb-2">
                  Вайб адаптируется под ваш реальный уровень энергии, исключая выгорание:
                </p>
                <ul className="text-xs space-y-1.5 opacity-90 pl-1">
                  <li>
                    <b className="text-emerald-400">🟢 MIN</b> — Базовый прожиточный минимум дня (вода, дыхание, зарядка). Выполняется даже при усталости.
                  </li>
                  <li>
                    <b className="text-blue-400">🔵 NORM</b> — Стандартный продуктивный день в хорошем темпе.
                  </li>
                  <li>
                    <b className="text-purple-400">🟣 MAX</b> — Пиковый драйв и максимальные результаты.
                  </li>
                </ul>
              </div>

              <div
                className={`p-3 rounded-2xl border ${
                  isLight ? 'bg-white border-[#CBD4C8]' : 'bg-[#242426] border-white/5'
                }`}
              >
                <h3 className="font-bold text-amber-400 text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>Рабочий график 2/2</span>
                </h3>
                <p className="text-xs opacity-80 leading-relaxed">
                  Включите режим «График 2/2» в настройках Вайба. Приложение автоматически подстроит утренние и вечерние чек-листы под рабочие и выходные дни.
                </p>
              </div>
            </div>
          )}

          {/* 3. FINANCE GUIDE */}
          {activeCategory === 'finance' && (
            <div className="space-y-3">
              <div
                className={`p-3 rounded-2xl border ${
                  isLight ? 'bg-white border-[#CBD4C8]' : 'bg-[#242426] border-white/5'
                }`}
              >
                <h3 className="font-bold text-[#00E676] text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Coins className="w-4 h-4" />
                  <span>Голосовой учет расходов и доходов</span>
                </h3>
                <p className="text-xs opacity-80 leading-relaxed mb-2">
                  Вы можете мгновенно фиксировать траты голосом из любого экрана или виджета:
                </p>
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="p-1.5 rounded-lg bg-black/20 border border-white/5">
                    «Расход 450 кофе»
                  </div>
                  <div className="p-1.5 rounded-lg bg-black/20 border border-white/5">
                    «Трата 1200 продукты»
                  </div>
                  <div className="p-1.5 rounded-lg bg-black/20 border border-white/5">
                    «Доход 45000 зарплата»
                  </div>
                </div>
              </div>

              <div
                className={`p-3 rounded-2xl border ${
                  isLight ? 'bg-white border-[#CBD4C8]' : 'bg-[#242426] border-white/5'
                }`}
              >
                <h3 className="font-bold text-[#00E676] text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Wallet className="w-4 h-4" />
                  <span>Мультивалютный баланс</span>
                </h3>
                <p className="text-xs opacity-80 leading-relaxed">
                  Поддерживаются рубли (RUB), доллары (USD), евро (EUR), тенге (KZT), гривны (UAH), USDT и BTC с мгновенной автоматической конвертацией.
                </p>
              </div>
            </div>
          )}

          {/* 4. REMOTE & HARDWARE GUIDE */}
          {activeCategory === 'remote' && (
            <div className="space-y-3">
              <div
                className={`p-3 rounded-2xl border ${
                  isLight ? 'bg-white border-[#CBD4C8]' : 'bg-[#242426] border-white/5'
                }`}
              >
                <h3 className="font-bold text-sky-400 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4" />
                  <span>Быстрый пульт управления</span>
                </h3>
                <p className="text-xs opacity-80 leading-relaxed mb-2">
                  Кнопка «Пульт» открывает всплывающее меню в стиле Windows / iOS с быстрым доступом ко всем системным функциям:
                </p>
                <ul className="text-xs space-y-1 opacity-90 pl-1">
                  <li>• Регулировка громкости и отключение звука.</li>
                  <li>• Фонарик и настройка стробоскопа (SOS / Lux).</li>
                  <li>• Плеер Яндекс Музыки (переключение треков).</li>
                  <li>• Быстрые переключатели Wi-Fi, Bluetooth, Режима тишины.</li>
                </ul>
              </div>
            </div>
          )}

          {/* 5. SETTINGS & APP ICONS GUIDE */}
          {activeCategory === 'settings' && (
            <div className="space-y-3">
              <div
                className={`p-3 rounded-2xl border ${
                  isLight ? 'bg-white border-[#CBD4C8]' : 'bg-[#242426] border-white/5'
                }`}
              >
                <h3 className="font-bold text-[#00E676] text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  <span>Выбор значка приложения</span>
                </h3>
                <p className="text-xs opacity-80 leading-relaxed">
                  В <b>Настройках</b> доступна галерея уникальных дизайнерских значков L.I.R.A. Выбранный значок автоматически применяется к вкладке браузера, PWA-ярлыку и рабочему столу устройства!
                </p>
              </div>

              <div
                className={`p-3 rounded-2xl border ${
                  isLight ? 'bg-white border-[#CBD4C8]' : 'bg-[#242426] border-white/5'
                }`}
              >
                <h3 className="font-bold text-[#00E676] text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Settings className="w-4 h-4" />
                  <span>Энергосбережение и память</span>
                </h3>
                <p className="text-xs opacity-80 leading-relaxed">
                  L.I.R.A. оптимизирована для минимального расхода батареи: аудио-генераторы выключаются мгновенно после звука, а обработка данных происходит без фоновой утечки ресурсов.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Button */}
        <button
          type="button"
          onClick={() => {
            triggerVibration('tap');
            onClose();
          }}
          className="mt-4 w-full py-3 bg-[#00E676] hover:bg-[#00c864] active:bg-[#00ab55] text-black font-bold rounded-xl transition-colors cursor-pointer"
        >
          Понятно
        </button>
      </div>
    </div>
  );
};
