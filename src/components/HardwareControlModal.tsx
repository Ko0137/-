import React, { useState, useEffect } from 'react';
import { triggerVibration, soundManager } from '../utils/sound';
import {
  Smartphone,
  Wifi,
  Bluetooth,
  Flashlight,
  Volume2,
  VolumeX,
  Battery,
  BatteryCharging,
  Moon,
  Sun,
  X,
  Vibrate,
  Zap,
} from 'lucide-react';
import { AppTheme } from '../types';

interface HardwareControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: AppTheme;
  isTorchOn?: boolean;
  onToggleTorch?: () => void;
}

export const HardwareControlModal: React.FC<HardwareControlModalProps> = ({
  isOpen,
  onClose,
  theme = 'dark',
  isTorchOn = false,
  onToggleTorch,
}) => {
  const [bluetoothOn, setBluetoothOn] = useState(true);
  const [wifiOn, setWifiOn] = useState(true);
  const [dndMode, setDndMode] = useState(false);
  const [volume, setVolume] = useState(80);
  const [batteryLevel, setBatteryLevel] = useState<number>(85);
  const [isCharging, setIsCharging] = useState<boolean>(false);
  const [batteryStatusAvailable, setBatteryStatusAvailable] = useState(false);

  useEffect(() => {
    try {
      if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
        (navigator as any).getBattery().then((battery: any) => {
          setBatteryStatusAvailable(true);
          setBatteryLevel(Math.round(battery.level * 100));
          setIsCharging(battery.charging);

          battery.addEventListener('levelchange', () => {
            setBatteryLevel(Math.round(battery.level * 100));
          });
          battery.addEventListener('chargingchange', () => {
            setIsCharging(battery.charging);
          });
        });
      }
    } catch {}
  }, []);

  if (!isOpen) return null;

  const isLight = theme === 'light';

  const handleVolumeChange = (newVal: number) => {
    setVolume(newVal);
    triggerVibration('selection');
    soundManager.playClick();
  };

  const handleTestVibration = () => {
    triggerVibration('commandSuccess');
  };

  return (
    <div
      id="hardware_control_backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={e => {
        if (e.target === e.currentTarget) {
          triggerVibration('tap');
          onClose();
        }
      }}
    >
      <div
        className={`w-full max-w-md rounded-3xl p-5 border shadow-2xl transition-all max-h-[90vh] overflow-y-auto ${
          isLight
            ? 'bg-[#F9FAF8] border-[#D5DAD1] text-[#1F2421]'
            : 'bg-[#1C1C1E] border-white/15 text-white'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#00E676]/15 flex items-center justify-center text-[#00E676]">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Системный центр управления</h3>
              <p className="text-[11px] opacity-60">Прямой доступ к датчикам и железу без сети</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              triggerVibration('tap');
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center cursor-pointer hover:opacity-80"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Battery status strip */}
        <div
          className={`p-3.5 rounded-2xl border mb-3.5 flex items-center justify-between ${
            isLight ? 'bg-[#FFFFFF] border-[#DCE1D9]' : 'bg-[#242426] border-white/10'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {isCharging ? (
              <BatteryCharging className="w-5 h-5 text-[#00E676] animate-pulse" />
            ) : (
              <Battery className="w-5 h-5 text-[#00E676]" />
            )}
            <div>
              <div className="text-xs font-bold">
                Аккумулятор устройства: {batteryLevel}%
              </div>
              <div className="text-[10px] opacity-60">
                {isCharging ? 'Идет зарядка питания' : 'Автономная работа от батареи'}
              </div>
            </div>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-[#00E676]/20 text-[#00E676]">
            ОПТИМАЛЬНО
          </span>
        </div>

        {/* Quick Hardware Toggles Grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-3.5">
          {/* Bluetooth */}
          <button
            type="button"
            onClick={() => {
              triggerVibration('selection');
              setBluetoothOn(prev => !prev);
            }}
            className={`p-3 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer ${
              bluetoothOn
                ? 'bg-[#007AFF]/15 border-[#007AFF] text-white'
                : isLight
                ? 'bg-[#FFFFFF] border-[#DCE1D9] text-[#1F2421]/60'
                : 'bg-[#242426] border-white/10 text-white/50'
            }`}
          >
            <Bluetooth className={`w-5 h-5 ${bluetoothOn ? 'text-[#007AFF]' : 'opacity-40'}`} />
            <div className="text-left">
              <div className={`text-xs font-bold ${bluetoothOn && isLight ? 'text-[#007AFF]' : ''}`}>
                Bluetooth
              </div>
              <div className="text-[10px] opacity-60">{bluetoothOn ? 'Включен' : 'Выключен'}</div>
            </div>
          </button>

          {/* Wi-Fi / Hotspot */}
          <button
            type="button"
            onClick={() => {
              triggerVibration('selection');
              setWifiOn(prev => !prev);
            }}
            className={`p-3 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer ${
              wifiOn
                ? 'bg-[#00E676]/15 border-[#00E676] text-white'
                : isLight
                ? 'bg-[#FFFFFF] border-[#DCE1D9] text-[#1F2421]/60'
                : 'bg-[#242426] border-white/10 text-white/50'
            }`}
          >
            <Wifi className={`w-5 h-5 ${wifiOn ? 'text-[#00E676]' : 'opacity-40'}`} />
            <div className="text-left">
              <div className={`text-xs font-bold ${wifiOn && isLight ? 'text-[#00E676]' : ''}`}>
                Wi-Fi / Сеть
              </div>
              <div className="text-[10px] opacity-60">{wifiOn ? 'Подключен' : 'Отключен'}</div>
            </div>
          </button>

          {/* Flashlight */}
          <button
            type="button"
            onClick={() => {
              triggerVibration('tap');
              onToggleTorch?.();
            }}
            className={`p-3 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer ${
              isTorchOn
                ? 'bg-amber-500/20 border-amber-500 text-white'
                : isLight
                ? 'bg-[#FFFFFF] border-[#DCE1D9] text-[#1F2421]/60'
                : 'bg-[#242426] border-white/10 text-white/50'
            }`}
          >
            <Flashlight className={`w-5 h-5 ${isTorchOn ? 'text-amber-400' : 'opacity-40'}`} />
            <div className="text-left">
              <div className={`text-xs font-bold ${isTorchOn && isLight ? 'text-amber-600' : ''}`}>
                Фонарик
              </div>
              <div className="text-[10px] opacity-60">{isTorchOn ? 'Светит' : 'Выключен'}</div>
            </div>
          </button>

          {/* DND (Не беспокоить) */}
          <button
            type="button"
            onClick={() => {
              triggerVibration('selection');
              setDndMode(prev => !prev);
            }}
            className={`p-3 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer ${
              dndMode
                ? 'bg-purple-500/20 border-purple-500 text-white'
                : isLight
                ? 'bg-[#FFFFFF] border-[#DCE1D9] text-[#1F2421]/60'
                : 'bg-[#242426] border-white/10 text-white/50'
            }`}
          >
            <Moon className={`w-5 h-5 ${dndMode ? 'text-purple-400' : 'opacity-40'}`} />
            <div className="text-left">
              <div className={`text-xs font-bold ${dndMode && isLight ? 'text-purple-600' : ''}`}>
                Не беспокоить
              </div>
              <div className="text-[10px] opacity-60">{dndMode ? 'Без звука' : 'Обычный'}</div>
            </div>
          </button>
        </div>

        {/* Volume Slider */}
        <div
          className={`p-3.5 rounded-2xl border mb-3.5 ${
            isLight ? 'bg-[#FFFFFF] border-[#DCE1D9]' : 'bg-[#242426] border-white/10'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="flex items-center gap-1.5">
              {volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-[#00E676]" />}
              Громкость динамика
            </span>
            <span className="font-mono font-bold text-[#00E676]">{volume}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={e => handleVolumeChange(parseInt(e.target.value, 10))}
            className="w-full accent-[#00E676] cursor-pointer"
          />
        </div>

        {/* Vibration Motor Test button */}
        <div
          className={`p-3 rounded-2xl border mb-4 flex items-center justify-between ${
            isLight ? 'bg-[#FFFFFF] border-[#DCE1D9]' : 'bg-[#242426] border-white/10'
          }`}
        >
          <div className="flex items-center gap-2">
            <Vibrate className="w-4 h-4 text-[#00E676]" />
            <div>
              <div className="text-xs font-bold">Тест тактильной отдачи</div>
              <div className="text-[10px] opacity-60">Проверка вибромотора смартфона</div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleTestVibration}
            className="px-3 py-1.5 rounded-xl bg-[#00E676] text-black font-bold text-xs hover:bg-[#00c864] cursor-pointer"
          >
            Вибрация
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            triggerVibration('selection');
            onClose();
          }}
          className="w-full py-2.5 rounded-xl bg-neutral-200 dark:bg-white/10 hover:opacity-90 text-xs font-semibold cursor-pointer"
        >
          Готово
        </button>
      </div>
    </div>
  );
};
