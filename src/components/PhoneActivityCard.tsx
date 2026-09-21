import React, { useState, useEffect } from 'react';
import { PhoneActivityStats, AppTheme } from '../types';
import { triggerVibration, soundManager } from '../utils/sound';
import { pedometerService } from '../services/pedometerService';
import {
  Activity,
  Footprints,
  Flame,
  Clock,
  Moon,
  Droplets,
  Smartphone,
  RefreshCw,
  Plus,
  SlidersHorizontal,
  CheckCircle2,
  X,
  Compass,
} from 'lucide-react';

interface PhoneActivityCardProps {
  stats: PhoneActivityStats;
  onUpdateStats: (newStats: PhoneActivityStats) => void;
  theme?: AppTheme;
}

export const PhoneActivityCard: React.FC<PhoneActivityCardProps> = ({
  stats,
  onUpdateStats,
  theme = 'dark',
}) => {
  const isIOS = theme === 'ios';
  const isLight = theme === 'light';

  const [isSyncing, setIsSyncing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editSteps, setEditSteps] = useState(String(stats.steps));
  const [editCalories, setEditCalories] = useState(String(stats.calories));
  const [editActiveMin, setEditActiveMin] = useState(String(stats.activeMinutes));
  const [editSleep, setEditSleep] = useState(stats.sleepDuration);
  const [editScreen, setEditScreen] = useState(stats.screenTime);
  const [selectedSource, setSelectedSource] = useState(stats.source);

  // Sync animation and sensor ping
  const handleSync = () => {
    triggerVibration('micStart');
    setIsSyncing(true);

    // Simulate sensor or health connect synchronization
    setTimeout(() => {
      const now = new Date();
      const timeStr = `Сегодня, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      // Slight realistic step increment if device was moved
      const randomAddSteps = Math.floor(Math.random() * 45) + 15;
      const newSteps = stats.steps + randomAddSteps;
      const newCalories = Math.round(stats.calories + (randomAddSteps * 0.04));
      const newDistance = parseFloat(((newSteps * 0.00075)).toFixed(2));

      onUpdateStats({
        ...stats,
        steps: newSteps,
        calories: newCalories,
        distanceKm: newDistance,
        lastSynced: timeStr,
      });

      setIsSyncing(false);
      triggerVibration('commandSuccess');
      soundManager.playCommandSuccess();
    }, 900);
  };

  const handleAddWater = () => {
    triggerVibration('tap');
    const newWater = stats.waterMl + 250;
    onUpdateStats({
      ...stats,
      waterMl: newWater,
    });
  };

  const handleSaveEdits = (e: React.FormEvent) => {
    e.preventDefault();
    triggerVibration('commandSuccess');
    const st = parseInt(editSteps, 10) || stats.steps;
    const cal = parseInt(editCalories, 10) || stats.calories;
    const act = parseInt(editActiveMin, 10) || stats.activeMinutes;

    onUpdateStats({
      ...stats,
      steps: st,
      calories: cal,
      activeMinutes: act,
      distanceKm: parseFloat((st * 0.00075).toFixed(2)),
      sleepDuration: editSleep || stats.sleepDuration,
      screenTime: editScreen || stats.screenTime,
      source: selectedSource,
      lastSynced: 'Вручную скорректировано',
    });

    setIsEditModalOpen(false);
  };

  const stepsPct = Math.min(100, Math.round((stats.steps / (stats.stepsGoal || 10000)) * 100));
  const calPct = Math.min(100, Math.round((stats.calories / (stats.caloriesGoal || 650)) * 100));
  const waterPct = Math.min(100, Math.round((stats.waterMl / (stats.waterGoalMl || 2500)) * 100));

  const sourceLabels: Record<string, string> = {
    health_connect: 'Health Connect (Android)',
    samsung_health: 'Samsung Health',
    google_fit: 'Google Fit',
    device_sensors: 'Датчик движения смартфона',
  };

  return (
    <div
      className={`p-4 rounded-2xl border transition-all ${
        isIOS
          ? 'bg-[#1C1C1E] border-white/10 text-white shadow-lg'
          : isLight
          ? 'bg-[#F8FAF7] border-[#D8DFD5] text-[#1E2520] shadow-xs'
          : 'bg-[#1E1E1E] border-white/10 text-white shadow-md'
      }`}
    >
      {/* Top Header & Sync */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center ${
              isIOS
                ? 'bg-[#007AFF]/20 text-[#007AFF]'
                : isLight
                ? 'bg-[#1E4D38]/15 text-[#1E4D38]'
                : 'bg-[#00E676]/20 text-[#00E676]'
            }`}
          >
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider">
              Активность телефона
            </h3>
            <span
              className={`text-[10px] block ${
                isLight ? 'text-neutral-500' : 'text-white/50'
              }`}
            >
              {sourceLabels[stats.source] || 'Синхронизировано'} • {stats.lastSynced}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              triggerVibration('tap');
              setIsEditModalOpen(true);
            }}
            title="Настроить показатели"
            className={`p-1.5 rounded-xl cursor-pointer transition-colors ${
              isLight
                ? 'hover:bg-neutral-200 text-neutral-600'
                : 'hover:bg-white/10 text-white/60'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleSync}
            disabled={isSyncing}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
              isIOS
                ? 'bg-[#007AFF] text-white hover:bg-[#0062cc]'
                : isLight
                ? 'bg-[#1E4D38] hover:bg-[#153828] text-white'
                : 'bg-[#00E676] hover:bg-[#00c864] text-black font-bold'
            }`}
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Синхронизация...' : 'Обновить'}</span>
          </button>
        </div>
      </div>

      {/* Main 6 Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {/* Metric 1: Steps */}
        <div
          className={`p-3 rounded-xl border flex flex-col justify-between ${
            isLight
              ? 'bg-[#FFFFFF] border-[#D8DFD5] shadow-2xs'
              : 'bg-[#252528] border-white/5'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span
              className={`text-[11px] font-semibold flex items-center gap-1 ${
                isLight ? 'text-neutral-600' : 'text-neutral-400'
              }`}
            >
              <Footprints className="w-3.5 h-3.5 text-[#00E676]" /> Шаги
            </span>
            <span className="text-[10px] font-mono text-[#00E676] font-bold">
              {stepsPct}%
            </span>
          </div>
          <div className="text-lg font-mono font-black tracking-tight mb-1">
            {stats.steps.toLocaleString('ru-RU')}
          </div>
          <div className="w-full bg-black/10 dark:bg-white/10 h-1.5 rounded-full overflow-hidden mb-1">
            <div
              className="bg-[#00E676] h-full rounded-full transition-all duration-300"
              style={{ width: `${stepsPct}%` }}
            />
          </div>
          <span className={`text-[10px] ${isLight ? 'text-neutral-500' : 'text-white/50'}`}>
            {stats.distanceKm} км из {stats.stepsGoal.toLocaleString('ru-RU')}
          </span>
        </div>

        {/* Metric 2: Calories */}
        <div
          className={`p-3 rounded-xl border flex flex-col justify-between ${
            isLight
              ? 'bg-[#FFFFFF] border-[#D8DFD5] shadow-2xs'
              : 'bg-[#252528] border-white/5'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span
              className={`text-[11px] font-semibold flex items-center gap-1 ${
                isLight ? 'text-neutral-600' : 'text-neutral-400'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" /> Калории
            </span>
            <span className="text-[10px] font-mono text-amber-500 font-bold">
              {calPct}%
            </span>
          </div>
          <div className="text-lg font-mono font-black tracking-tight mb-1 text-amber-500">
            {stats.calories} <span className="text-xs font-normal">ккал</span>
          </div>
          <div className="w-full bg-black/10 dark:bg-white/10 h-1.5 rounded-full overflow-hidden mb-1">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${calPct}%` }}
            />
          </div>
          <span className={`text-[10px] ${isLight ? 'text-neutral-500' : 'text-white/50'}`}>
            Цель: {stats.caloriesGoal} ккал
          </span>
        </div>

        {/* Metric 3: Active Minutes */}
        <div
          className={`p-3 rounded-xl border flex flex-col justify-between ${
            isLight
              ? 'bg-[#FFFFFF] border-[#D8DFD5] shadow-2xs'
              : 'bg-[#252528] border-white/5'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span
              className={`text-[11px] font-semibold flex items-center gap-1 ${
                isLight ? 'text-neutral-600' : 'text-neutral-400'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-sky-400" /> Движение
            </span>
          </div>
          <div className="text-lg font-mono font-black tracking-tight mb-1 text-sky-400">
            {stats.activeMinutes} <span className="text-xs font-normal">мин</span>
          </div>
          <span className={`text-[10px] ${isLight ? 'text-neutral-500' : 'text-white/50'}`}>
            Тренировки и ходьба
          </span>
        </div>

        {/* Metric 4: Sleep */}
        <div
          className={`p-3 rounded-xl border flex flex-col justify-between ${
            isLight
              ? 'bg-[#FFFFFF] border-[#D8DFD5] shadow-2xs'
              : 'bg-[#252528] border-white/5'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span
              className={`text-[11px] font-semibold flex items-center gap-1 ${
                isLight ? 'text-neutral-600' : 'text-neutral-400'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-indigo-400" /> Сон
            </span>
          </div>
          <div className="text-base font-bold tracking-tight mb-1 text-indigo-400">
            {stats.sleepDuration}
          </div>
          <span className={`text-[10px] ${isLight ? 'text-neutral-500' : 'text-white/50'}`}>
            Samsung / Apple Health
          </span>
        </div>

        {/* Metric 5: Water Hydration */}
        <div
          className={`p-3 rounded-xl border flex flex-col justify-between ${
            isLight
              ? 'bg-[#FFFFFF] border-[#D8DFD5] shadow-2xs'
              : 'bg-[#252528] border-white/5'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span
              className={`text-[11px] font-semibold flex items-center gap-1 ${
                isLight ? 'text-neutral-600' : 'text-neutral-400'
              }`}
            >
              <Droplets className="w-3.5 h-3.5 text-cyan-400" /> Вода
            </span>
            <button
              type="button"
              onClick={handleAddWater}
              title="+250 мл"
              className="p-1 rounded-md bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <div className="text-base font-mono font-bold tracking-tight mb-1 text-cyan-400">
            {stats.waterMl} <span className="text-xs font-normal">/ {stats.waterGoalMl} мл</span>
          </div>
          <div className="w-full bg-black/10 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-cyan-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${waterPct}%` }}
            />
          </div>
        </div>

        {/* Metric 6: Screen Time */}
        <div
          className={`p-3 rounded-xl border flex flex-col justify-between ${
            isLight
              ? 'bg-[#FFFFFF] border-[#D8DFD5] shadow-2xs'
              : 'bg-[#252528] border-white/5'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span
              className={`text-[11px] font-semibold flex items-center gap-1 ${
                isLight ? 'text-neutral-600' : 'text-neutral-400'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-purple-400" /> Экран
            </span>
          </div>
          <div className="text-base font-bold tracking-tight mb-1 text-purple-400">
            {stats.screenTime}
          </div>
          <span className={`text-[10px] ${isLight ? 'text-neutral-500' : 'text-white/50'}`}>
            Digital Wellbeing
          </span>
        </div>
      </div>

      {/* MODAL: Edit Activity Stats */}
      {isEditModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm animate-fade-in"
          onClick={e => {
            if (e.target === e.currentTarget) setIsEditModalOpen(false);
          }}
        >
          <div
            className={`w-full max-w-sm rounded-3xl p-5 border shadow-2xl ${
              isLight
                ? 'bg-[#F9FAF8] border-[#D5DAD1] text-[#1F2421]'
                : 'bg-[#1C1C1E] border-white/15 text-white'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <h3 className="text-sm font-bold">Корректировка активности</h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="w-7 h-7 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdits} className="space-y-2.5 text-xs">
              <div>
                <label className="block opacity-70 mb-1">Источник синхронизации:</label>
                <select
                  value={selectedSource}
                  onChange={e => setSelectedSource(e.target.value as any)}
                  className={`w-full px-3 py-2 rounded-xl border font-medium ${
                    isLight
                      ? 'bg-white border-[#D5DAD1] text-black'
                      : 'bg-[#2A2A2A] border-white/10 text-white'
                  }`}
                >
                  <option value="health_connect">Health Connect (Android 14+)</option>
                  <option value="samsung_health">Samsung Health</option>
                  <option value="google_fit">Google Fit</option>
                  <option value="device_sensors">Встроенный акселерометр телефона</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block opacity-70 mb-1">Шаги:</label>
                  <input
                    type="number"
                    value={editSteps}
                    onChange={e => setEditSteps(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border font-mono ${
                      isLight
                        ? 'bg-white border-[#D5DAD1] text-black'
                        : 'bg-[#2A2A2A] border-white/10 text-white'
                    }`}
                  />
                </div>
                <div>
                  <label className="block opacity-70 mb-1">Калории (ккал):</label>
                  <input
                    type="number"
                    value={editCalories}
                    onChange={e => setEditCalories(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border font-mono ${
                      isLight
                        ? 'bg-white border-[#D5DAD1] text-black'
                        : 'bg-[#2A2A2A] border-white/10 text-white'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block opacity-70 mb-1">Время активности (мин):</label>
                  <input
                    type="number"
                    value={editActiveMin}
                    onChange={e => setEditActiveMin(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border font-mono ${
                      isLight
                        ? 'bg-white border-[#D5DAD1] text-black'
                        : 'bg-[#2A2A2A] border-white/10 text-white'
                    }`}
                  />
                </div>
                <div>
                  <label className="block opacity-70 mb-1">Сон:</label>
                  <input
                    type="text"
                    value={editSleep}
                    onChange={e => setEditSleep(e.target.value)}
                    placeholder="7 ч 30 мин"
                    className={`w-full px-3 py-2 rounded-xl border ${
                      isLight
                        ? 'bg-white border-[#D5DAD1] text-black'
                        : 'bg-[#2A2A2A] border-white/10 text-white'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block opacity-70 mb-1">Экранное время:</label>
                <input
                  type="text"
                  value={editScreen}
                  onChange={e => setEditScreen(e.target.value)}
                  placeholder="3 ч 20 мин"
                  className={`w-full px-3 py-2 rounded-xl border ${
                    isLight
                      ? 'bg-white border-[#D5DAD1] text-black'
                      : 'bg-[#2A2A2A] border-white/10 text-white'
                  }`}
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#00E676] hover:bg-[#00c864] text-black font-bold text-xs cursor-pointer transition-all mt-2"
              >
                Сохранить данные
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
