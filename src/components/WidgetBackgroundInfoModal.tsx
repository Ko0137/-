import React, { useState } from 'react';
import { X, ShieldCheck, Cpu, Smartphone, Lock, Sparkles, Download, ArrowRight, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import { triggerVibration } from '../utils/sound';

interface WidgetBackgroundInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WidgetBackgroundInfoModal: React.FC<WidgetBackgroundInfoModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'widgets' | 'background' | 'offline' | 'updates'>('background');

  if (!isOpen) return null;

  return (
    <div
      id="widget_info_backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={e => {
        if (e.target === e.currentTarget) {
          triggerVibration('tap');
          onClose();
        }
      }}
    >
      <div className="bg-[#1C1C1E] border border-white/15 rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden shadow-2xl text-white">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-black/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#00E676]/15 flex items-center justify-center text-[#00E676]">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Архитектура L.I.R.A. & Android</h3>
              <p className="text-[11px] text-white/50">Фоновый режим, локскрин, оффлайн и обновления</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              triggerVibration('tap');
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer text-white/70 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center border-b border-white/10 bg-white/5 px-2 py-1.5 gap-1 text-xs overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('background')}
            className={`px-3 py-1.5 rounded-xl font-medium shrink-0 cursor-pointer transition-colors ${
              activeTab === 'background'
                ? 'bg-[#00E676] text-black font-bold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            🎙️ Фон и Экран блокировки
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('widgets')}
            className={`px-3 py-1.5 rounded-xl font-medium shrink-0 cursor-pointer transition-colors ${
              activeTab === 'widgets'
                ? 'bg-[#00E676] text-black font-bold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            📱 4 Виджета стола
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('updates')}
            className={`px-3 py-1.5 rounded-xl font-medium shrink-0 cursor-pointer transition-colors ${
              activeTab === 'updates'
                ? 'bg-[#00E676] text-black font-bold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            🔄 Обновление поверх старой
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('offline')}
            className={`px-3 py-1.5 rounded-xl font-medium shrink-0 cursor-pointer transition-colors ${
              activeTab === 'offline'
                ? 'bg-[#00E676] text-black font-bold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            ⚡ Что добавить оффлайн?
          </button>
        </div>

        {/* Tab content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs leading-relaxed text-white/85">
          {/* TAB 1: BACKGROUND & LOCKSCREEN */}
          {activeTab === 'background' && (
            <div className="space-y-3.5">
              <div className="p-3 rounded-2xl bg-[#00E676]/10 border border-[#00E676]/30 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#00E676] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white text-sm">Ответ: Будет ли точно работать?</div>
                  <div className="text-white/80 mt-1">
                    <strong>В нативном Android (APK): ДА, НА 100%!</strong> Но для этого в Android используются конкретные системные механизмы, которые уже заложены в архитектуру приложения:
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-[#007AFF]" /> 1. Доступ с экрана блокировки (Lockscreen)
                  </div>
                  <p className="text-white/70 mt-1">
                    В Android экран блокировки защищает личные данные. Чтобы микрофон работал без разблокировки:
                  </p>
                  <ul className="list-disc list-inside mt-1.5 text-white/70 space-y-1">
                    <li>
                      <strong>Плитка в быстрой шторке (Quick Settings Tile)</strong>: в шторку Android добавляется кнопка «L.I.R.A. Запись». Шторка опускается даже на заблокированном экране!
                    </li>
                    <li>
                      <strong>Ярлык экрана блокировки (Lockscreen Shortcut)</strong>: в настройках телефона (Экран блокировки → Ярлыки) назначается вызов голосового ввода L.I.R.A. в нижнем левом/правом углу.
                    </li>
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-[#00E676]" /> 2. Фоновый режим (Foreground Service)
                  </div>
                  <p className="text-white/70 mt-1">
                    Android экономит батарею и усыпляет приложения в фоне. Чтобы ассистент не выгружался из памяти, работает <code>ForegroundService</code> с постоянным уведомлением в шторке и типом <code>foregroundServiceType="microphone"</code>.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" /> Важное отличие браузера / PWA от нативного APK:
                  </div>
                  <p className="text-white/75 mt-1">
                    В браузере (Chrome / Safari) веб-стандарты блокируют запись микрофона при потухшем экране ради безопасности. В скомпилированном Android APK этого ограничения нет, так как приложение имеет прямые системные права <code>RECORD_AUDIO</code> и <code>WAKE_LOCK</code>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 4 WIDGET VARIANTS */}
          {activeTab === 'widgets' && (
            <div className="space-y-3">
              <p className="text-white/80">
                В приложении реализовано <strong>4 стиля виджетов</strong>, которые можно переключать кнопкой со слоями прямо на виджете:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#007AFF]" /> 1. Voice Orb (1x1)
                  </div>
                  <p className="text-[11px] text-white/60 mt-1">
                    Минималистичная плавающая кнопка-сфера. При нажатии моментально слушает команду с пульсирующей звуковой волной.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00E676]" /> 2. Dashboard (4x2)
                  </div>
                  <p className="text-[11px] text-white/60 mt-1">
                    Командный центр: центральный микрофон, быстрые кнопки фонарика, плеера музыки, камеры и блокнота.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> 3. VIBE Vitality (2x2)
                  </div>
                  <p className="text-[11px] text-white/60 mt-1">
                    Прогресс ритуалов дня (MIND//DAY), фокус дня (Норма/Максимум), статус смены 2/2 и кнопка голосового дневника.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> 4. Finance Wallet
                  </div>
                  <p className="text-[11px] text-white/60 mt-1">
                    Баланс в выбранной валюте (RUB, USD, EUR, USDT), индикатор расходов и голосовое внесение транзакций.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#00E676]/10 border border-[#00E676]/30 text-[11px] text-white/80">
                <strong>На рабочем столе Android:</strong> Виджет разворачивается через <code>AppWidgetProvider</code> (добавление через долгое нажатие на пустом месте экрана телефона → Виджеты → L.I.R.A.).
              </div>
            </div>
          )}

          {/* TAB 3: UPDATING OLD VERSION IN-PLACE */}
          {activeTab === 'updates' && (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/30">
                <div className="font-bold text-white text-sm">Правило Android: Как обновлять поверх без сбоев</div>
                <p className="text-white/80 mt-1">
                  Чтобы новая версия APK установилась как <strong>обновление существующего приложения</strong> (сохранив все ваши заметки, финансы и настройки), соблюдены 4 правила:
                </p>
              </div>

              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#00E676] text-black font-bold flex items-center justify-center shrink-0 text-[11px]">1</div>
                  <div>
                    <div className="font-semibold text-white">Одинаковый Package Name (applicationId)</div>
                    <div className="text-white/70 mt-0.5">
                      Идентификатор приложения должен быть строго неизменным во всех версиях: <code>com.example.myjarvis</code>. Если имя пакета изменится — Android сочтёт это чужим приложением и установит вторую иконку.
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#00E676] text-black font-bold flex items-center justify-center shrink-0 text-[11px]">2</div>
                  <div>
                    <div className="font-semibold text-white">Один и тот же ключ подписи (Keystore)</div>
                    <div className="text-white/70 mt-0.5">
                      КРИТИЧЕСКИ ВАЖНО: При сборке APK используется один файл сертификата (<code>keystore.jks</code>). Если пересобрать APK другим ключом, Android выдаст ошибку: <i>«Ошибка пакета: несовместимая подпись»</i> и откажется обновлять.
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#00E676] text-black font-bold flex items-center justify-center shrink-0 text-[11px]">3</div>
                  <div>
                    <div className="font-semibold text-white">Возрастающий versionCode в build.gradle</div>
                    <div className="text-white/70 mt-0.5">
                      С каждой новой сборкой параметр <code>versionCode</code> в <code>app/build.gradle</code> увеличивается: <code>versionCode 1</code> → <code>versionCode 2</code> → <code>versionCode 3</code>.
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#00E676] text-black font-bold flex items-center justify-center shrink-0 text-[11px]">4</div>
                  <div>
                    <div className="font-semibold text-white">Сохранение пользовательских данных (Data Migration)</div>
                    <div className="text-white/70 mt-0.5">
                      Все таблицы базы данных и SharedPreferences защищены миграцией: при установке новой версии история чата, привычки и финансы остаются в целости.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: OFFLINE FEATURES PROPOSAL */}
          {activeTab === 'offline' && (
            <div className="space-y-3">
              <p className="text-white/80">
                Что ещё может сделать нативное приложение L.I.R.A. <strong>по-настоящему ультимативным без интернета</strong>:
              </p>

              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="font-semibold text-[#00E676] flex items-center gap-1.5">
                    <Cpu className="w-4 h-4" /> 1. Локальная нейросетевая модель Vosk STT (Оффлайн речь)
                  </div>
                  <p className="text-white/70 mt-1">
                    Встраивание легковесной библиотеки <code>vosk-android</code> с русской оффлайн-моделью (~45 МБ). Приложение будет распознавать голос даже в лесу, в самолёте или метро с отключенным интернетом.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="font-semibold text-[#00E676] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> 2. Локальный резервный бэкап (Export/Import JSON)
                  </div>
                  <p className="text-white/70 mt-1">
                    Кнопка в один клик «Экспорт всех данных в файл» (финансы во всех валютах, дневник, кастомные макросы) и «Восстановление из файла» без облачных серверов.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="font-semibold text-[#00E676] flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4" /> 3. Нативное управление "железом" телефона
                  </div>
                  <p className="text-white/70 mt-1">
                    Голосовые команды: «включи Bluetooth», «поставь режим Не беспокоить», «сделай громче на 20%», «точка доступа Wi-Fi» через Android Settings Provider.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="font-semibold text-[#00E676] flex items-center gap-1.5">
                    <Layers className="w-4 h-4" /> 4. Оффлайн-калькулятор и конвертер единиц
                  </div>
                  <p className="text-white/70 mt-1">
                    Голосовой счёт математических выражений («сколько будет 15 процентов от 45000»), перевод валют по сохранённым курсам и расчёт дней до событий.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-black/40 flex justify-end">
          <button
            type="button"
            onClick={() => {
              triggerVibration('selection');
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-[#00E676] text-black font-bold text-xs hover:bg-[#00c864] cursor-pointer"
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
};
