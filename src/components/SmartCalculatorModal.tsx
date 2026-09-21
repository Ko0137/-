import React, { useState } from 'react';
import { triggerVibration, soundManager } from '../utils/sound';
import { Calculator, ArrowRightLeft, Percent, Compass, X, Check, Copy } from 'lucide-react';
import { AppTheme, CurrencyCode } from '../types';
import { CURRENCY_LIST, convertAmount, formatCurrencyAmount } from '../utils/currency';

interface SmartCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: AppTheme;
  onSendResult?: (text: string) => void;
}

export const SmartCalculatorModal: React.FC<SmartCalculatorModalProps> = ({
  isOpen,
  onClose,
  theme = 'dark',
  onSendResult,
}) => {
  const [activeTab, setActiveTab] = useState<'calc' | 'currency' | 'units'>('calc');

  // Calculator & Percentages
  const [calcInput, setCalcInput] = useState('');
  const [calcResult, setCalcResult] = useState<string | null>(null);

  // Quick percent helpers
  const [percentBase, setPercentBase] = useState('50000');
  const [percentRate, setPercentRate] = useState('18');
  const percentResult = ((parseFloat(percentBase) || 0) * (parseFloat(percentRate) || 0)) / 100;

  // Currency Converter
  const [currencyAmount, setCurrencyAmount] = useState('1000');
  const [fromCurrency, setFromCurrency] = useState<CurrencyCode>('USD');
  const [toCurrency, setToCurrency] = useState<CurrencyCode>('RUB');

  // Unit Converter
  const [unitType, setUnitType] = useState<'length' | 'weight' | 'data'>('length');
  const [unitVal, setUnitVal] = useState('10');

  if (!isOpen) return null;

  const isLight = theme === 'light';

  const handleEvaluate = () => {
    try {
      // Safe sanitized eval for basic math
      const sanitized = calcInput.replace(/[^0-9+\-*/().]/g, '');
      if (!sanitized) return;
      // eslint-disable-next-line no-eval
      const res = Function(`"use strict"; return (${sanitized})`)();
      setCalcResult(String(res));
      triggerVibration('commandSuccess');
      soundManager.playCommandSuccess();
    } catch {
      setCalcResult('Ошибка');
      triggerVibration('commandError');
    }
  };

  const convertedCurrencyVal = convertAmount(
    parseFloat(currencyAmount) || 0,
    fromCurrency,
    toCurrency
  );

  return (
    <div
      id="smart_calculator_backdrop"
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
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#00E676]/15 flex items-center justify-center text-[#00E676]">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Оффлайн-калькулятор и конвертер</h3>
              <p className="text-[11px] opacity-60">Математика, проценты, валюты и величины</p>
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

        {/* Tab switcher */}
        <div className="flex border-b border-white/10 pb-2 mb-3 gap-1">
          <button
            type="button"
            onClick={() => {
              triggerVibration('selection');
              setActiveTab('calc');
            }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
              activeTab === 'calc'
                ? 'bg-[#00E676] text-black font-bold'
                : 'opacity-60 hover:opacity-100'
            }`}
          >
            Счёт & %
          </button>
          <button
            type="button"
            onClick={() => {
              triggerVibration('selection');
              setActiveTab('currency');
            }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
              activeTab === 'currency'
                ? 'bg-[#00E676] text-black font-bold'
                : 'opacity-60 hover:opacity-100'
            }`}
          >
            Валюты
          </button>
          <button
            type="button"
            onClick={() => {
              triggerVibration('selection');
              setActiveTab('units');
            }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
              activeTab === 'units'
                ? 'bg-[#00E676] text-black font-bold'
                : 'opacity-60 hover:opacity-100'
            }`}
          >
            Величины
          </button>
        </div>

        {/* TAB 1: MATH & PERCENTAGES */}
        {activeTab === 'calc' && (
          <div className="space-y-3.5">
            {/* Expression Box */}
            <div
              className={`p-3.5 rounded-2xl border ${
                isLight ? 'bg-[#FFFFFF] border-[#DCE1D9]' : 'bg-[#242426] border-white/10'
              }`}
            >
              <label className="block text-[11px] font-semibold opacity-70 mb-1">
                Математическое выражение:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={calcInput}
                  onChange={e => setCalcInput(e.target.value)}
                  placeholder="Например: (1500 * 1.2) - 400"
                  className={`flex-1 px-3 py-2 rounded-xl text-sm font-mono border focus:outline-none ${
                    isLight
                      ? 'bg-[#F2F4F0] border-[#D5DAD1] text-black'
                      : 'bg-[#1C1C1E] border-white/15 text-white'
                  }`}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleEvaluate();
                  }}
                />
                <button
                  type="button"
                  onClick={handleEvaluate}
                  className="px-4 py-2 bg-[#00E676] text-black font-bold rounded-xl text-xs cursor-pointer hover:bg-[#00c864]"
                >
                  =
                </button>
              </div>

              {calcResult !== null && (
                <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs opacity-60">Результат:</span>
                  <span className="text-xl font-mono font-bold text-[#00E676]">{calcResult}</span>
                </div>
              )}
            </div>

            {/* Percentage Calculator */}
            <div
              className={`p-3.5 rounded-2xl border ${
                isLight ? 'bg-[#FFFFFF] border-[#DCE1D9]' : 'bg-[#242426] border-white/10'
              }`}
            >
              <div className="text-xs font-bold flex items-center gap-1.5 mb-2.5">
                <Percent className="w-3.5 h-3.5 text-[#00E676]" />
                <span>Быстрый расчёт процентов</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <span className="text-[10px] opacity-60">Сумма:</span>
                  <input
                    type="number"
                    value={percentBase}
                    onChange={e => setPercentBase(e.target.value)}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-mono border ${
                      isLight
                        ? 'bg-[#F2F4F0] border-[#D5DAD1] text-black'
                        : 'bg-[#1C1C1E] border-white/15 text-white'
                    }`}
                  />
                </div>
                <div>
                  <span className="text-[10px] opacity-60">Процент (%):</span>
                  <input
                    type="number"
                    value={percentRate}
                    onChange={e => setPercentRate(e.target.value)}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-mono border ${
                      isLight
                        ? 'bg-[#F2F4F0] border-[#D5DAD1] text-black'
                        : 'bg-[#1C1C1E] border-white/15 text-white'
                    }`}
                  />
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#00E676]/10 border border-[#00E676]/30 flex items-center justify-between text-xs">
                <span>{percentRate}% от суммы:</span>
                <strong className="font-mono text-base text-[#00E676]">
                  {percentResult.toLocaleString('ru-RU')}
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CURRENCY CONVERTER */}
        {activeTab === 'currency' && (
          <div className="space-y-3.5">
            <div
              className={`p-3.5 rounded-2xl border ${
                isLight ? 'bg-[#FFFFFF] border-[#DCE1D9]' : 'bg-[#242426] border-white/10'
              }`}
            >
              <div className="mb-2.5">
                <span className="text-[11px] opacity-60">Сумма для перевода:</span>
                <input
                  type="number"
                  value={currencyAmount}
                  onChange={e => setCurrencyAmount(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-sm font-mono font-bold border ${
                    isLight
                      ? 'bg-[#F2F4F0] border-[#D5DAD1] text-black'
                      : 'bg-[#1C1C1E] border-white/15 text-white'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <span className="text-[10px] opacity-60">Из валюты:</span>
                  <select
                    value={fromCurrency}
                    onChange={e => setFromCurrency(e.target.value as CurrencyCode)}
                    className={`w-full px-2 py-1.5 rounded-lg text-xs font-bold border ${
                      isLight
                        ? 'bg-[#F2F4F0] border-[#D5DAD1] text-black'
                        : 'bg-[#1C1C1E] border-white/15 text-white'
                    }`}
                  >
                    {CURRENCY_LIST.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.code} ({c.symbol})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <span className="text-[10px] opacity-60">В валюту:</span>
                  <select
                    value={toCurrency}
                    onChange={e => setToCurrency(e.target.value as CurrencyCode)}
                    className={`w-full px-2 py-1.5 rounded-lg text-xs font-bold border ${
                      isLight
                        ? 'bg-[#F2F4F0] border-[#D5DAD1] text-black'
                        : 'bg-[#1C1C1E] border-white/15 text-white'
                    }`}
                  >
                    {CURRENCY_LIST.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.code} ({c.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Conversion Output */}
              <div className="p-3 rounded-xl bg-[#00E676]/10 border border-[#00E676]/30 text-center">
                <div className="text-[11px] opacity-70">Результат по оффлайн-курсу:</div>
                <div className="text-xl font-bold font-mono text-[#00E676] mt-0.5">
                  {formatCurrencyAmount(convertedCurrencyVal, toCurrency)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: UNIT CONVERTER */}
        {activeTab === 'units' && (
          <div className="space-y-3.5">
            <div
              className={`p-3.5 rounded-2xl border ${
                isLight ? 'bg-[#FFFFFF] border-[#DCE1D9]' : 'bg-[#242426] border-white/10'
              }`}
            >
              <div className="flex gap-1.5 mb-3">
                <button
                  type="button"
                  onClick={() => setUnitType('length')}
                  className={`flex-1 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    unitType === 'length' ? 'bg-[#00E676] text-black' : 'bg-black/15'
                  }`}
                >
                  Дистанция
                </button>
                <button
                  type="button"
                  onClick={() => setUnitType('weight')}
                  className={`flex-1 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    unitType === 'weight' ? 'bg-[#00E676] text-black' : 'bg-black/15'
                  }`}
                >
                  Вес
                </button>
                <button
                  type="button"
                  onClick={() => setUnitType('data')}
                  className={`flex-1 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    unitType === 'data' ? 'bg-[#00E676] text-black' : 'bg-black/15'
                  }`}
                >
                  Память/МБ
                </button>
              </div>

              <input
                type="number"
                value={unitVal}
                onChange={e => setUnitVal(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl text-sm font-mono border mb-3 ${
                  isLight
                    ? 'bg-[#F2F4F0] border-[#D5DAD1] text-black'
                    : 'bg-[#1C1C1E] border-white/15 text-white'
                }`}
              />

              <div className="space-y-2 text-xs">
                {unitType === 'length' && (
                  <>
                    <div className="flex justify-between p-2 rounded-lg bg-black/10">
                      <span>Километры:</span>
                      <strong>{parseFloat(unitVal) || 0} км</strong>
                    </div>
                    <div className="flex justify-between p-2 rounded-lg bg-black/10">
                      <span>Мили (miles):</span>
                      <strong className="text-[#00E676]">
                        {(((parseFloat(unitVal) || 0) * 0.621371)).toFixed(2)} миль
                      </strong>
                    </div>
                    <div className="flex justify-between p-2 rounded-lg bg-black/10">
                      <span>Метры:</span>
                      <strong>{(parseFloat(unitVal) || 0) * 1000} м</strong>
                    </div>
                  </>
                )}

                {unitType === 'weight' && (
                  <>
                    <div className="flex justify-between p-2 rounded-lg bg-black/10">
                      <span>Килограммы:</span>
                      <strong>{parseFloat(unitVal) || 0} кг</strong>
                    </div>
                    <div className="flex justify-between p-2 rounded-lg bg-black/10">
                      <span>Фунты (lbs):</span>
                      <strong className="text-[#00E676]">
                        {(((parseFloat(unitVal) || 0) * 2.20462)).toFixed(2)} lbs
                      </strong>
                    </div>
                  </>
                )}

                {unitType === 'data' && (
                  <>
                    <div className="flex justify-between p-2 rounded-lg bg-black/10">
                      <span>Гигабайты (ГБ):</span>
                      <strong>{parseFloat(unitVal) || 0} ГБ</strong>
                    </div>
                    <div className="flex justify-between p-2 rounded-lg bg-black/10">
                      <span>Мегабайты (МБ):</span>
                      <strong className="text-[#00E676]">
                        {(parseFloat(unitVal) || 0) * 1024} МБ
                      </strong>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            triggerVibration('selection');
            onClose();
          }}
          className="w-full mt-4 py-2.5 rounded-xl bg-neutral-200 dark:bg-white/10 hover:opacity-90 text-xs font-semibold cursor-pointer"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
};
