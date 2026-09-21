import React, { useState } from 'react';
import { Clock, X, Bell, Trash2, Plus } from 'lucide-react';
import { ActiveAlarm } from '../types';
import { triggerVibration } from '../utils/sound';

interface AlarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  alarms: ActiveAlarm[];
  onAddAlarm: (alarm: ActiveAlarm) => void;
  onDeleteAlarm: (id: string) => void;
  onToggleAlarm: (id: string) => void;
}

export const AlarmModal: React.FC<AlarmModalProps> = ({
  isOpen,
  onClose,
  alarms,
  onAddAlarm,
  onDeleteAlarm,
  onToggleAlarm,
}) => {
  const [timeInput, setTimeInput] = useState('07:30');
  const [labelInput, setLabelInput] = useState('L.I.R.A. Будильник');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!timeInput) return;
    const [h, m] = timeInput.split(':').map(Number);
    triggerVibration(30);
    onAddAlarm({
      id: Date.now().toString(),
      time: timeInput,
      hour: h,
      minute: m,
      label: labelInput.trim() || 'L.I.R.A. Будильник',
      isActive: true,
    });
  };

  return (
    <div
      id="modal_alarm_backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-[#1E1E1E] text-white rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-3 bg-[#1B4D3E] flex items-center justify-between text-white">
          <div className="flex items-center gap-2 text-sm font-bold">
            <Clock className="w-4 h-4 text-[#00E676]" />
            <span>Будильники L.I.R.A.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 text-white/80"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add alarm form */}
        <form onSubmit={handleAdd} className="p-3 bg-[#242424] border-b border-white/10 space-y-2">
          <div className="flex gap-2">
            <input
              type="time"
              value={timeInput}
              onChange={e => setTimeInput(e.target.value)}
              className="px-3 py-2 bg-[#1A1A1A] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#00E676] font-mono"
            />
            <input
              type="text"
              value={labelInput}
              onChange={e => setLabelInput(e.target.value)}
              placeholder="Название будильника"
              className="flex-1 px-3 py-2 bg-[#1A1A1A] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#00E676]"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-[#00E676] hover:bg-[#00c864] text-black font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Установить будильник
          </button>
        </form>

        {/* Alarms list */}
        <div className="p-3 flex-1 overflow-y-auto space-y-2">
          {alarms.length === 0 ? (
            <div className="text-center py-8 text-white/40 text-xs">
              Активных будильников нет. Скажите: «Будильник на 7:30»
            </div>
          ) : (
            alarms.map(alarm => (
              <div
                key={alarm.id}
                className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                  alarm.isActive
                    ? 'bg-[#252525] border-[#00E676]/30'
                    : 'bg-[#1c1c1c] border-white/5 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Bell className={`w-5 h-5 ${alarm.isActive ? 'text-[#00E676]' : 'text-white/40'}`} />
                  <div>
                    <div className="text-xl font-bold font-mono text-white tracking-wider">
                      {alarm.time}
                    </div>
                    <div className="text-[11px] text-white/60">{alarm.label}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alarm.isActive}
                      onChange={() => onToggleAlarm(alarm.id)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-[#333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00E676]"></div>
                  </label>
                  <button
                    type="button"
                    onClick={() => onDeleteAlarm(alarm.id)}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
