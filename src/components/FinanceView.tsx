import React, { useState, useEffect } from 'react';
import { triggerVibration } from '../utils/sound';
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  Trash2,
  Filter,
  Coins,
  ChevronDown,
  Calculator,
  Download,
  Users,
  Percent,
} from 'lucide-react';
import { CurrencyCode, ExpenseItem, AppTheme } from '../types';
import { CURRENCY_LIST, CURRENCIES, formatCurrencyAmount, convertAmount } from '../utils/currency';

const STORAGE_FINANCE_KEY = 'lira_finance_transactions_v2';
const STORAGE_BASE_CURRENCY_KEY = 'lira_finance_base_currency';

const DEFAULT_EXPENSES: ExpenseItem[] = [];

const POPULAR_CATEGORIES = [
  '☕ Еда/Кофе',
  '🛒 Продукты',
  '🚕 Такси',
  '💻 Подписки',
  '🏠 Жилье',
  '💰 Зарплата',
  '🎮 Игры',
];

interface FinanceViewProps {
  onSendMessage: (msg: string) => void;
  theme?: AppTheme;
}

export const FinanceView: React.FC<FinanceViewProps> = ({ onSendMessage, theme = 'dark' }) => {
  const isIOS = theme === 'ios';
  const isLight = theme === 'light';

  const [items, setItems] = useState<ExpenseItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_FINANCE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_EXPENSES;
  });

  const [baseCurrency, setBaseCurrency] = useState<CurrencyCode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_BASE_CURRENCY_KEY) as CurrencyCode;
      if (saved && CURRENCIES[saved]) return saved;
    } catch {}
    return 'RUB';
  });

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('RUB');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [filterCurrency, setFilterCurrency] = useState<CurrencyCode | 'ALL'>('ALL');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  // Quick Tools: Converter & Splitter
  const [showQuickTools, setShowQuickTools] = useState(false);
  const [calcSourceAmount, setCalcSourceAmount] = useState('100');
  const [calcSourceCurrency, setCalcSourceCurrency] = useState<CurrencyCode>('USD');
  
  // Split bill state
  const [splitBillTotal, setSplitBillTotal] = useState('');
  const [splitPersons, setSplitPersons] = useState(2);
  const [splitTipPercent, setSplitTipPercent] = useState(10);

  // Save on updates
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_FINANCE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_BASE_CURRENCY_KEY, baseCurrency);
    } catch {}
  }, [baseCurrency]);

  // Total balance converted to base currency
  const totalBalanceInBase = items.reduce((acc, item) => {
    const itemCurr = item.currency || 'RUB';
    const inBase = convertAmount(item.amount, itemCurr, baseCurrency);
    return item.type === 'income' ? acc + inBase : acc - inBase;
  }, 0);

  // Currency breakdown
  const currencyBreakdown = items.reduce((acc, item) => {
    const c = item.currency || 'RUB';
    const delta = item.type === 'income' ? item.amount : -item.amount;
    acc[c] = (acc[c] || 0) + delta;
    return acc;
  }, {} as Record<CurrencyCode, number>);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount.replace(',', '.'));
    if (!title.trim() || isNaN(val) || val <= 0) return;

    triggerVibration('commandSuccess');

    const now = new Date();
    const timeStr = `Сегодня, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newItem: ExpenseItem = {
      id: Date.now().toString(),
      title: title.trim(),
      amount: val,
      currency: selectedCurrency,
      type,
      date: timeStr,
    };

    setItems(prev => [newItem, ...prev]);
    setTitle('');
    setAmount('');
  };

  const handleDeleteItem = (id: string) => {
    triggerVibration('warningPulse');
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleExportData = () => {
    try {
      triggerVibration('commandSuccess');
      const lines = [
        '=== L.I.R.A. Финансовый отчет ===',
        `Сформирован: ${new Date().toLocaleString('ru-RU')}`,
        `Основная валюта: ${baseCurrency} (${CURRENCIES[baseCurrency].name})`,
        `Итоговый баланс: ${formatCurrencyAmount(totalBalanceInBase, baseCurrency)}`,
        '',
        '--- Операции ---',
        ...items.map(it => `[${it.date}] ${it.type === 'income' ? '+ ' : '- '}${it.amount} ${it.currency} | ${it.title}`),
      ];
      const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `LIRA_finance_${new Date().toISOString().slice(0, 10)}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
  };

  const filteredItems = items.filter(item => {
    if (filterCurrency === 'ALL') return true;
    return item.currency === filterCurrency;
  });

  const parsedCalcAmount = parseFloat(calcSourceAmount.replace(',', '.')) || 0;

  const parsedSplitTotal = parseFloat(splitBillTotal.replace(',', '.')) || 0;
  const splitWithTip = parsedSplitTotal * (1 + splitTipPercent / 100);
  const splitPerPerson = splitPersons > 0 ? splitWithTip / splitPersons : 0;

  return (
    <div
      id="financeLayout"
      className={`flex-1 overflow-y-auto p-3.5 space-y-3.5 transition-colors ${
        isIOS
          ? 'bg-[#000000] text-white'
          : isLight
          ? 'bg-[#ECEEE9] text-[#1E2520]'
          : 'bg-[#121212] text-white'
      }`}
    >
      {/* Total Balance Card */}
      <div
        id="cardFinanceBalance"
        className={`p-4 rounded-3xl border shadow-lg relative overflow-hidden transition-all ${
          isIOS
            ? 'bg-[#1C1C1E]/90 backdrop-blur-xl border-white/15 text-white shadow-black/40'
            : isLight
            ? 'bg-[#1E4D38] text-white border-[#163b2a] shadow-xs'
            : 'bg-gradient-to-br from-[#1C2C24] to-[#121E18] text-white border-[#00E676]/30'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div
              className={`p-2 rounded-xl ${
                isLight ? 'bg-white/20 text-white' : 'bg-[#00E676]/20 text-[#00E676]'
              }`}
            >
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-white/70 block">
                Общий баланс портфеля
              </span>
              <span className="text-xs font-semibold text-white/90">
                Базовая валюта: {CURRENCIES[baseCurrency].name}
              </span>
            </div>
          </div>

          {/* Base currency switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowCurrencyDropdown(!showCurrencyDropdown);
                triggerVibration('tap');
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/20 text-white cursor-pointer transition-colors shadow-2xs"
            >
              <span>{CURRENCIES[baseCurrency].symbol} {baseCurrency}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showCurrencyDropdown && (
              <div
                className={`absolute right-0 top-9 w-44 rounded-xl border shadow-xl z-30 py-1 overflow-hidden ${
                  isLight
                    ? 'bg-[#FFFFFF] border-[#CBD4C8] text-[#1E2520]'
                    : 'bg-[#202020] border-white/20 text-white'
                }`}
              >
                {CURRENCY_LIST.map(curr => (
                  <button
                    key={curr.code}
                    type="button"
                    onClick={() => {
                      setBaseCurrency(curr.code);
                      setShowCurrencyDropdown(false);
                      triggerVibration('selection');
                    }}
                    className={`w-full px-3 py-1.5 text-left flex items-center justify-between cursor-pointer transition-colors ${
                      baseCurrency === curr.code
                        ? isLight
                          ? 'text-[#1E4D38] font-bold bg-[#E8EFE9]'
                          : 'text-[#00E676] font-bold bg-white/5'
                        : isLight
                        ? 'text-neutral-700 hover:bg-neutral-100'
                        : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    <span>{curr.name}</span>
                    <span className="font-mono text-xs font-bold">{curr.symbol}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Balance Value */}
        <div className="text-3xl font-bold tracking-tight mb-2">
          {formatCurrencyAmount(totalBalanceInBase, baseCurrency)}
        </div>

        {/* Multi-Currency Balances Preview */}
        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-white/15 text-[11px]">
          {Object.entries(currencyBreakdown).map(([cCode, sum]) => {
            const curr = cCode as CurrencyCode;
            if (Math.abs(sum) < 0.0001) return null;
            return (
              <span
                key={curr}
                className="px-2 py-0.5 rounded-md bg-black/25 text-white/95 font-mono border border-white/15 shadow-xs"
              >
                {formatCurrencyAmount(sum, curr)}
              </span>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[11px] text-white/80 mt-2.5">
          <div className="flex items-center gap-1.5">
            <TrendingUp className={`w-3.5 h-3.5 ${isLight ? 'text-[#6EE7B7]' : 'text-[#00E676]'}`} />
            <span>Все финансовые расчеты ведутся автономно</span>
          </div>

          <button
            type="button"
            onClick={() => {
              triggerVibration('selection');
              setShowQuickTools(!showQuickTools);
            }}
            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/15 hover:bg-white/25 text-white text-[10px] font-bold cursor-pointer"
          >
            <Calculator className="w-3 h-3" />
            <span>{showQuickTools ? 'Скрыть калькулятор' : 'Конвертер и сплит'}</span>
          </button>
        </div>
      </div>

      {/* Collapsible Quick Currency Converter & Split Bill Tools */}
      {showQuickTools && (
        <div
          className={`p-4 rounded-3xl border shadow-md space-y-4 transition-all ${
            isIOS
              ? 'bg-[#1C1C1E] border-white/10'
              : isLight
              ? 'bg-[#FFFFFF] border-[#D0D7CD] shadow-xs'
              : 'bg-[#18181A] border-white/10'
          }`}
        >
          {/* Section 1: Quick Currency Converter */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-[#00E676]" /> Быстрый конвертер валют
              </h5>
              <span className="text-[10px] opacity-60">Офлайн курсы</span>
            </div>

            <div className="flex gap-2 mb-2">
              <input
                type="text"
                inputMode="decimal"
                value={calcSourceAmount}
                onChange={e => setCalcSourceAmount(e.target.value)}
                placeholder="100"
                className={`flex-1 px-3 py-1.5 border rounded-xl text-xs font-mono font-bold focus:outline-none ${
                  isLight ? 'bg-[#F2F5F0] border-[#CBD4C8]' : 'bg-black/30 border-white/10 text-white'
                }`}
              />
              <div className="flex gap-1 overflow-x-auto no-scrollbar">
                {CURRENCY_LIST.map(c => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      setCalcSourceCurrency(c.code);
                      triggerVibration('selection');
                    }}
                    className={`px-2 py-1 rounded-lg text-xs font-mono cursor-pointer ${
                      calcSourceCurrency === c.code
                        ? 'bg-[#00E676] text-black font-bold'
                        : isLight
                        ? 'bg-[#EAEFE8] text-neutral-700'
                        : 'bg-white/10 text-white/70'
                    }`}
                  >
                    {c.symbol}
                  </button>
                ))}
              </div>
            </div>

            {/* Live conversion rates grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {CURRENCY_LIST.filter(c => c.code !== calcSourceCurrency).map(targetCurr => {
                const converted = convertAmount(parsedCalcAmount, calcSourceCurrency, targetCurr.code);
                return (
                  <div
                    key={targetCurr.code}
                    className={`p-2 rounded-xl border text-left ${
                      isLight ? 'bg-[#F9FAF8] border-[#E0E6DD]' : 'bg-black/20 border-white/5'
                    }`}
                  >
                    <div className="text-[10px] opacity-60 font-mono">{targetCurr.name}</div>
                    <div className="font-mono font-bold text-xs">
                      {formatCurrencyAmount(converted, targetCurr.code)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Split Bill & Tip Calculator */}
          <div className="pt-3 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-purple-400" /> Разделить счёт и чаевые
              </h5>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-2">
              <div>
                <label className="text-[10px] opacity-70 block mb-0.5">Сумма счёта</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={splitBillTotal}
                  onChange={e => setSplitBillTotal(e.target.value)}
                  placeholder="3500"
                  className={`w-full px-2.5 py-1.5 border rounded-xl text-xs font-mono font-semibold focus:outline-none ${
                    isLight ? 'bg-[#F2F5F0] border-[#CBD4C8]' : 'bg-black/30 border-white/10 text-white'
                  }`}
                />
              </div>

              <div>
                <label className="text-[10px] opacity-70 block mb-0.5">Человек ({splitPersons})</label>
                <div className="flex items-center gap-1">
                  {[2, 3, 4, 5].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setSplitPersons(num)}
                      className={`flex-1 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                        splitPersons === num
                          ? 'bg-purple-600 text-white'
                          : isLight
                          ? 'bg-[#EAEFE8] text-neutral-700'
                          : 'bg-white/10 text-white'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] opacity-70 block mb-0.5">Чаевые ({splitTipPercent}%)</label>
                <div className="flex items-center gap-1">
                  {[0, 10, 15].map(pct => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setSplitTipPercent(pct)}
                      className={`flex-1 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                        splitTipPercent === pct
                          ? 'bg-amber-500 text-black'
                          : isLight
                          ? 'bg-[#EAEFE8] text-neutral-700'
                          : 'bg-white/10 text-white'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {parsedSplitTotal > 0 && (
              <div
                className={`p-2.5 rounded-xl border flex items-center justify-between ${
                  isLight ? 'bg-purple-50 border-purple-200 text-purple-950' : 'bg-purple-950/30 border-purple-500/30 text-white'
                }`}
              >
                <div>
                  <div className="text-[10px] opacity-75">С каждого с учётом {splitTipPercent}% чаевых:</div>
                  <div className="text-sm font-bold font-mono">
                    {Math.round(splitPerPerson).toLocaleString('ru-RU')} ₽ / чел
                  </div>
                </div>
                <div className="text-right text-[11px] opacity-80">
                  Всего: {Math.round(splitWithTip).toLocaleString('ru-RU')} ₽
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add New Transaction Form */}
      <div
        className={`p-4 rounded-3xl border transition-all ${
          isIOS
            ? 'bg-[#1C1C1E] border-white/10'
            : isLight
            ? 'bg-[#F8FAF7] border-[#D8DFD5] shadow-xs'
            : 'bg-[#1E1E1E] border-white/10'
        }`}
      >
        <div className="flex items-center justify-between mb-2.5">
          <h4
            className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              isLight ? 'text-[#1E2520]' : 'text-white'
            }`}
          >
            <Plus className={`w-4 h-4 ${isLight ? 'text-[#1E4D38]' : 'text-[#00E676]'}`} /> Добавить операцию
          </h4>
          <span className={`text-[11px] ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
            Локальная запись
          </span>
        </div>

        {/* Type toggle: Expense / Income */}
        <div className="flex gap-2 mb-2.5">
          <button
            type="button"
            onClick={() => {
              setType('expense');
              triggerVibration('selection');
            }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              type === 'expense'
                ? isLight
                  ? 'bg-rose-100 text-rose-800 border border-rose-300 font-bold shadow-xs'
                  : 'bg-red-950/70 text-red-300 border border-red-700/60 shadow-xs'
                : isLight
                ? 'bg-[#EAEFE8] text-neutral-600 hover:text-neutral-900 border border-transparent'
                : 'bg-neutral-800/40 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            📉 Расход
          </button>
          <button
            type="button"
            onClick={() => {
              setType('income');
              triggerVibration('selection');
            }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              type === 'income'
                ? isLight
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold shadow-xs'
                  : 'bg-[#1B4D3E] text-[#00E676] border border-[#00E676]/40 shadow-xs'
                : isLight
                ? 'bg-[#EAEFE8] text-neutral-600 hover:text-neutral-900 border border-transparent'
                : 'bg-neutral-800/40 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            📈 Доход
          </button>
        </div>

        {/* Currency selection chips */}
        <div className="mb-2.5">
          <div
            className={`text-[11px] mb-1 flex items-center gap-1 ${
              isLight ? 'text-neutral-600' : 'text-neutral-400'
            }`}
          >
            <Coins className={`w-3 h-3 ${isLight ? 'text-[#1E4D38]' : 'text-[#00E676]'}`} />
            <span>Выберите валюту операции:</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {CURRENCY_LIST.map(curr => {
              const isSelected = selectedCurrency === curr.code;
              return (
                <button
                  key={curr.code}
                  type="button"
                  onClick={() => {
                    setSelectedCurrency(curr.code);
                    triggerVibration('selection');
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-mono font-medium transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-[#00E676] text-black font-bold shadow-sm'
                      : isLight
                      ? 'bg-[#E4E9E1] text-[#2C352E] hover:bg-[#D8E0D4] border border-[#CBD4C8]/50'
                      : 'bg-[#2A2A2A] text-white/70 hover:bg-[#333333]'
                  }`}
                >
                  {curr.symbol} {curr.code}
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleAdd} className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Категория или статья расходов..."
              className={`flex-1 px-3 py-2 border rounded-xl text-xs focus:outline-none transition-colors ${
                isLight
                  ? 'bg-[#FFFFFF] border-[#CBD4C8] text-[#1E2520] placeholder:text-[#889386] focus:border-[#1E4D38]'
                  : 'bg-[#2A2A2A] border-white/10 text-white focus:border-[#00E676]'
              }`}
            />
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="Сумма"
                className={`w-28 pl-3 pr-7 py-2 border rounded-xl text-xs font-mono font-semibold focus:outline-none transition-colors ${
                  isLight
                    ? 'bg-[#FFFFFF] border-[#CBD4C8] text-[#1E2520] placeholder:text-[#889386] focus:border-[#1E4D38]'
                    : 'bg-[#2A2A2A] border-white/10 text-white focus:border-[#00E676]'
                }`}
              />
              <span
                className={`absolute right-2.5 top-2 text-xs font-mono font-bold ${
                  isLight ? 'text-neutral-500' : 'text-neutral-400'
                }`}
              >
                {CURRENCIES[selectedCurrency].symbol}
              </span>
            </div>
          </div>

          {/* Popular category quick chips */}
          <div className="flex flex-wrap gap-1 pt-1">
            {POPULAR_CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setTitle(cat.replace(/^[^\s]+\s/, ''))}
                className={`text-[10px] px-2 py-0.5 rounded-lg cursor-pointer transition-colors ${
                  isLight
                    ? 'bg-[#E4E9E1] hover:bg-[#D8E0D4] text-[#2C352E] border border-[#CBD4C8]/50'
                    : 'bg-neutral-800/40 hover:bg-neutral-700/60 text-neutral-300 border border-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={!title.trim() || !amount}
            className={`w-full py-2.5 font-bold text-xs rounded-xl transition-all cursor-pointer mt-1 ${
              type === 'expense'
                ? 'bg-red-600 hover:bg-red-500 text-white disabled:opacity-40 shadow-xs'
                : 'bg-[#00E676] hover:bg-[#00c864] text-black disabled:opacity-40 shadow-xs'
            }`}
          >
            {type === 'expense' ? 'Записать расход' : 'Записать доход'}
          </button>
        </form>
      </div>

      {/* History & Filtering */}
      <div
        className={`p-4 rounded-3xl border transition-all ${
          isIOS
            ? 'bg-[#1C1C1E] border-white/10'
            : isLight
            ? 'bg-[#F8FAF7] border-[#D8DFD5] shadow-xs'
            : 'bg-[#1E1E1E] border-white/10'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <h4
            className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              isLight ? 'text-[#1E2520]' : 'text-white'
            }`}
          >
            <Filter className={`w-3.5 h-3.5 ${isLight ? 'text-[#1E4D38]' : 'text-[#00E676]'}`} /> История операций
          </h4>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportData}
              title="Экспорт в TXT"
              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-xs text-white/80 hover:text-white cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span className="text-[10px]">Экспорт</span>
            </button>

            {/* Filter by currency */}
            <div className="flex items-center gap-1 text-[11px]">
              <button
                type="button"
                onClick={() => setFilterCurrency('ALL')}
                className={`px-2 py-0.5 rounded-lg cursor-pointer transition-colors ${
                  filterCurrency === 'ALL'
                    ? isLight
                      ? 'bg-[#1E4D38] text-white font-bold'
                      : 'bg-white/20 text-white font-bold'
                    : isLight
                    ? 'text-neutral-600 hover:text-black'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Все
              </button>
              {CURRENCY_LIST.slice(0, 4).map(c => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setFilterCurrency(c.code)}
                  className={`px-1.5 py-0.5 rounded-lg font-mono cursor-pointer transition-colors ${
                    filterCurrency === c.code
                      ? 'bg-[#00E676] text-black font-bold'
                      : isLight
                      ? 'text-neutral-600 hover:text-black'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {c.symbol}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className={`py-6 text-center text-xs ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
            Записей в этой валюте пока нет.
          </div>
        ) : (
          <div className="space-y-2">
            {filteredItems.map(item => {
              const itemCurr = item.currency || 'RUB';
              const sym = CURRENCIES[itemCurr]?.symbol || itemCurr;
              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-2.5 rounded-2xl border transition-colors ${
                    isLight
                      ? 'bg-[#FFFFFF] border-[#D8DFD5] shadow-2xs text-[#1E2520]'
                      : 'bg-[#252525] border-white/5 text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        item.type === 'income'
                          ? isLight
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-[#00E676]/15 text-[#00E676]'
                          : isLight
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-red-500/15 text-red-400'
                      }`}
                    >
                      {item.type === 'income' ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-medium">{item.title}</div>
                      <div
                        className={`text-[10px] flex items-center gap-1.5 ${
                          isLight ? 'text-neutral-500' : 'text-neutral-400'
                        }`}
                      >
                        <span>{item.date}</span>
                        <span
                          className={`px-1 py-0.2 rounded font-mono ${
                            isLight ? 'bg-neutral-200 text-neutral-700' : 'bg-black/20 text-neutral-300'
                          }`}
                        >
                          {itemCurr}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div
                      className={`text-xs font-bold font-mono text-right ${
                        item.type === 'income'
                          ? isLight
                            ? 'text-emerald-700'
                            : 'text-[#00E676]'
                          : isLight
                          ? 'text-rose-700'
                          : 'text-red-400'
                      }`}
                    >
                      {item.type === 'income' ? '+' : '-'}
                      {item.amount.toLocaleString('ru-RU')} {sym}
                    </div>
                    <button
                      type="button"
                      aria-label="Удалить запись"
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-neutral-400 hover:text-red-500 p-1 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
