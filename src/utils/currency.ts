import { CurrencyCode, CurrencyInfo } from '../types';

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  RUB: { code: 'RUB', symbol: '₽', name: 'Российский рубль', rateToRub: 1 },
  USD: { code: 'USD', symbol: '$', name: 'Доллар США', rateToRub: 92 },
  EUR: { code: 'EUR', symbol: '€', name: 'Евро', rateToRub: 100 },
  KZT: { code: 'KZT', symbol: '₸', name: 'Казахстанский тенге', rateToRub: 0.2 },
  BYN: { code: 'BYN', symbol: 'Br', name: 'Белорусский рубль', rateToRub: 28 },
  UAH: { code: 'UAH', symbol: '₴', name: 'Украинская гривна', rateToRub: 2.2 },
  USDT: { code: 'USDT', symbol: '₮', name: 'Tether USDT', rateToRub: 92 },
  BTC: { code: 'BTC', symbol: '₿', name: 'Bitcoin', rateToRub: 6200000 },
};

export const CURRENCY_LIST: CurrencyInfo[] = Object.values(CURRENCIES);

export function formatCurrencyAmount(amount: number, currency: CurrencyCode): string {
  const info = CURRENCIES[currency] || CURRENCIES.RUB;
  const formatted = amount.toLocaleString('ru-RU', {
    maximumFractionDigits: currency === 'BTC' ? 6 : 2,
    minimumFractionDigits: currency === 'BTC' ? 4 : 0,
  });
  return `${formatted} ${info.symbol}`;
}

export function convertAmount(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode
): number {
  if (from === to) return amount;
  const rubAmount = amount * (CURRENCIES[from]?.rateToRub || 1);
  const targetRate = CURRENCIES[to]?.rateToRub || 1;
  return rubAmount / targetRate;
}
