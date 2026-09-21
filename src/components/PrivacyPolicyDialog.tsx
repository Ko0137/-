import React from 'react';
import { triggerVibration } from '../utils/sound';

interface PrivacyPolicyDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyDialog: React.FC<PrivacyPolicyDialogProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="dialog_privacy_backdrop"
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="dialog_privacy_container"
        className="w-full max-w-md bg-[#1e1e1e] text-white rounded-2xl p-6 border border-white/10 shadow-2xl flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">
            Политика конфиденциальности
          </h2>
          <button
            id="tvClose"
            type="button"
            onClick={() => {
              triggerVibration(20);
              onClose();
            }}
            className="w-8 h-8 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto pr-1 py-4 text-sm text-[#DDDDDD] leading-relaxed space-y-3">
          <p>
            Настоящая Политика конфиденциальности описывает, как приложение L.I.R.A. (далее — «Приложение») обрабатывает и защищает информацию пользователей.
          </p>
          <div>
            <h4 className="font-semibold text-[#00E676] mb-0.5">1. Сбор информации</h4>
            <p className="text-white/80">
              Приложение разработано с учетом принципов конфиденциальности. Мы не собираем, не передаем и не храним ваши персональные данные на сторонних серверах.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-[#00E676] mb-0.5">2. Локальные настройки</h4>
            <p className="text-white/80">
              Все параметры интерфейса (темная тема, выбор голоса помощника, тихий режим, заметки и история сообщений) сохраняются исключительно в локальном хранилище вашего устройства (SharedPreferences / localStorage) и не покидают его.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-[#00E676] mb-0.5">3. Голосовые команды</h4>
            <p className="text-white/80">
              Приложение обрабатывает голосовые запросы для выполнения команд на устройстве с использованием встроенного интерфейса распознавания речи.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-[#00E676] mb-0.5">4. Безопасность</h4>
            <p className="text-white/80">
              Мы принимаем все необходимые меры для защиты ваших данных от несанкционированного доступа. Все вычисления производятся локально.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-[#00E676] mb-0.5">5. Изменения политики</h4>
            <p className="text-white/80">
              Мы оставляем за собой право обновлять настоящую Политику конфиденциальности по мере необходимости.
            </p>
          </div>
        </div>

        <button
          id="btnOk"
          type="button"
          onClick={() => {
            triggerVibration(30);
            onClose();
          }}
          className="mt-2 w-full py-3 bg-[#00E676] hover:bg-[#00c864] text-[#121212] font-bold rounded-lg transition-colors cursor-pointer"
        >
          Понятно
        </button>
      </div>
    </div>
  );
};
