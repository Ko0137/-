import React, { useState } from 'react';
import { Calculator, X, Delete } from 'lucide-react';
import { triggerVibration } from '../utils/sound';

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendResult?: (result: string) => void;
}

export const CalculatorModal: React.FC<CalculatorModalProps> = ({
  isOpen,
  onClose,
  onSendResult,
}) => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    triggerVibration(15);
    setDisplay(prev => (prev === '0' ? digit : prev + digit));
  };

  const handleOp = (op: string) => {
    triggerVibration(20);
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const handleClear = () => {
    triggerVibration(25);
    setDisplay('0');
    setEquation('');
  };

  const handleBackspace = () => {
    triggerVibration(15);
    setDisplay(prev => (prev.length > 1 ? prev.slice(0, -1) : '0'));
  };

  const handleCalculate = () => {
    triggerVibration(30);
    try {
      const full = equation + display;
      // Sanitize equation
      const sanitized = full.replace(/×/g, '*').replace(/÷/g, '/');
      // eslint-disable-next-line no-eval
      const result = Function(`'use strict'; return (${sanitized})`)();
      const strResult = String(Number(result.toFixed(6)));
      setDisplay(strResult);
      setEquation('');
      if (onSendResult) {
        onSendResult(`Результат вычислений: ${full} = ${strResult}`);
      }
    } catch {
      setDisplay('Ошибка');
    }
  };

  return (
    <div
      id="modal_calculator_backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xs bg-[#1E1E1E] rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-3 bg-[#1B4D3E] flex items-center justify-between text-white">
          <div className="flex items-center gap-2 text-sm font-bold">
            <Calculator className="w-4 h-4 text-[#00E676]" />
            <span>Калькулятор L.I.R.A.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 text-white/80"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Display */}
        <div className="p-4 bg-[#141414] text-right">
          <div className="text-xs text-white/40 font-mono h-4">{equation}</div>
          <div className="text-3xl font-mono font-bold text-white truncate">{display}</div>
        </div>

        {/* Buttons Grid */}
        <div className="p-3 grid grid-cols-4 gap-2 bg-[#1E1E1E]">
          <button onClick={handleClear} className="p-3 bg-red-950/60 text-red-300 font-bold rounded-lg text-sm">C</button>
          <button onClick={handleBackspace} className="p-3 bg-[#2A2A2A] text-white flex items-center justify-center rounded-lg text-sm"><Delete className="w-4 h-4" /></button>
          <button onClick={() => handleOp('%')} className="p-3 bg-[#2A2A2A] text-[#00E676] font-bold rounded-lg text-sm">%</button>
          <button onClick={() => handleOp('÷')} className="p-3 bg-[#1B4D3E] text-[#00E676] font-bold rounded-lg text-base">÷</button>

          <button onClick={() => handleDigit('7')} className="p-3 bg-[#262626] text-white font-medium rounded-lg text-base">7</button>
          <button onClick={() => handleDigit('8')} className="p-3 bg-[#262626] text-white font-medium rounded-lg text-base">8</button>
          <button onClick={() => handleDigit('9')} className="p-3 bg-[#262626] text-white font-medium rounded-lg text-base">9</button>
          <button onClick={() => handleOp('×')} className="p-3 bg-[#1B4D3E] text-[#00E676] font-bold rounded-lg text-base">×</button>

          <button onClick={() => handleDigit('4')} className="p-3 bg-[#262626] text-white font-medium rounded-lg text-base">4</button>
          <button onClick={() => handleDigit('5')} className="p-3 bg-[#262626] text-white font-medium rounded-lg text-base">5</button>
          <button onClick={() => handleDigit('6')} className="p-3 bg-[#262626] text-white font-medium rounded-lg text-base">6</button>
          <button onClick={() => handleOp('-')} className="p-3 bg-[#1B4D3E] text-[#00E676] font-bold rounded-lg text-base">-</button>

          <button onClick={() => handleDigit('1')} className="p-3 bg-[#262626] text-white font-medium rounded-lg text-base">1</button>
          <button onClick={() => handleDigit('2')} className="p-3 bg-[#262626] text-white font-medium rounded-lg text-base">2</button>
          <button onClick={() => handleDigit('3')} className="p-3 bg-[#262626] text-white font-medium rounded-lg text-base">3</button>
          <button onClick={() => handleOp('+')} className="p-3 bg-[#1B4D3E] text-[#00E676] font-bold rounded-lg text-base">+</button>

          <button onClick={() => handleDigit('0')} className="p-3 col-span-2 bg-[#262626] text-white font-medium rounded-lg text-base">0</button>
          <button onClick={() => handleDigit('.')} className="p-3 bg-[#262626] text-white font-medium rounded-lg text-base">.</button>
          <button onClick={handleCalculate} className="p-3 bg-[#00E676] text-black font-bold rounded-lg text-base">=</button>
        </div>
      </div>
    </div>
  );
};
