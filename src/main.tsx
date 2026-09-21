import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Define global types for typescript safety
declare global {
  interface Window {
    __LIRA_LOGS__: Array<{ type: 'log' | 'warn' | 'error' | 'crash'; text: string; time: string; stack?: string }>;
    __LIRA_TOGGLE_CONSOLE__?: () => void;
  }
}

// 1. Log Collector initialization
window.__LIRA_LOGS__ = window.__LIRA_LOGS__ || [];

const addGlobalLog = (type: 'log' | 'warn' | 'error' | 'crash', text: string, stack?: string) => {
  window.__LIRA_LOGS__.push({
    type,
    text,
    time: new Date().toLocaleTimeString(),
    stack
  });
  if (window.__LIRA_LOGS__.length > 300) {
    window.__LIRA_LOGS__.shift();
  }
  // Dispatch custom event to notify Dev Console overlay in real-time
  window.dispatchEvent(new CustomEvent('lira-log-added'));
};

// Intercept standard console output
const originalLog = console.log;
const originalWarn = console.warn;
const originalError = console.error;

console.log = (...args) => {
  originalLog.apply(console, args);
  addGlobalLog('log', args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
};

console.warn = (...args) => {
  originalWarn.apply(console, args);
  addGlobalLog('warn', args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
};

console.error = (...args) => {
  originalError.apply(console, args);
  addGlobalLog('error', args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
};

// Global error handlers
try {
  window.addEventListener('error', (event) => {
    const message = event.message || event.error?.message || 'Unknown Error';
    const stack = event.error?.stack || 'No stack trace available';
    const errData = {
      message,
      stack,
      time: new Date().toISOString(),
      type: 'error'
    };
    localStorage.setItem('lira_last_crash', JSON.stringify(errData));
    addGlobalLog('crash', `[Crash] ${message}`, stack);
  });

  window.addEventListener('unhandledrejection', (event) => {
    const message = event.reason?.message || (typeof event.reason === 'string' ? event.reason : 'Unhandled Promise Rejection');
    const stack = event.reason?.stack || 'No stack trace available';
    const errData = {
      message,
      stack,
      time: new Date().toISOString(),
      type: 'unhandledrejection'
    };
    localStorage.setItem('lira_last_crash', JSON.stringify(errData));
    addGlobalLog('crash', `[Promise Rejection] ${message}`, stack);
  });
} catch (e) {
  console.error('Error registering global error handlers', e);
}

// 2. Real-Time Developer Console Overlay Component
const DeveloperConsoleOverlay: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [logs, setLogs] = React.useState<any[]>([]);
  const [filter, setFilter] = React.useState<'all' | 'log' | 'warn' | 'error' | 'crash'>('all');

  React.useEffect(() => {
    window.__LIRA_TOGGLE_CONSOLE__ = () => {
      setIsOpen(prev => !prev);
    };

    const updateLogs = () => {
      setLogs([...(window.__LIRA_LOGS__ || [])]);
    };

    updateLogs();
    window.addEventListener('lira-log-added', updateLogs);
    return () => {
      window.removeEventListener('lira-log-added', updateLogs);
      delete window.__LIRA_TOGGLE_CONSOLE__;
    };
  }, []);

  if (!isOpen) return null;

  const filteredLogs = logs.filter(l => filter === 'all' || l.type === filter);

  return (
    <div className="fixed inset-x-0 bottom-0 top-1/3 z-9999 bg-[#121214] border-t border-red-500/30 shadow-2xl flex flex-col text-xs text-neutral-300 font-mono animate-in slide-in-from-bottom duration-250">
      <div className="flex items-center justify-between px-3 py-2 bg-[#1c1c1f] border-b border-white/5 select-none shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="font-bold text-white tracking-wider text-[11px]">L.I.R.A. DEVELOPER CONSOLE</span>
          <span className="text-[10px] text-neutral-500">({logs.length} logs)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              if (window.__LIRA_LOGS__) {
                window.__LIRA_LOGS__ = [];
                setLogs([]);
              }
            }}
            className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-[10px] font-bold text-neutral-300 rounded-sm cursor-pointer"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-2.5 py-0.5 bg-red-600/80 hover:bg-red-600 active:scale-95 text-[10px] font-bold text-white rounded-sm cursor-pointer"
          >
            Hide
          </button>
        </div>
      </div>

      <div className="flex border-b border-white/5 bg-[#17171a] px-2 py-1 gap-1 shrink-0 select-none">
        {(['all', 'log', 'warn', 'error', 'crash'] as const).map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={`px-2 py-0.5 text-[10px] font-bold rounded-sm uppercase transition-colors cursor-pointer ${
              filter === tab
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 p-3 overflow-y-auto space-y-2 bg-black/40">
        {filteredLogs.length === 0 ? (
          <div className="text-center text-neutral-600 py-8 text-[11px]">No matching logs captured yet.</div>
        ) : (
          filteredLogs.map((log, index) => {
            let color = 'text-neutral-400';
            let bg = '';
            if (log.type === 'warn') {
              color = 'text-yellow-400';
              bg = 'bg-yellow-500/5 border border-yellow-500/10 p-1.5 rounded-sm';
            } else if (log.type === 'error') {
              color = 'text-orange-400';
              bg = 'bg-orange-500/5 border border-orange-500/10 p-1.5 rounded-sm';
            } else if (log.type === 'crash') {
              color = 'text-red-400';
              bg = 'bg-red-500/10 border border-red-500/20 p-2 rounded-md font-bold';
            }

            return (
              <div key={index} className={`leading-relaxed text-[11px] break-all ${bg}`}>
                <div className="flex items-start gap-1.5">
                  <span className="text-neutral-600 select-none shrink-0 font-light">{log.time}</span>
                  <span className={`font-semibold shrink-0 select-none ${
                    log.type === 'log' ? 'text-blue-400' : color
                  }`}>[{log.type.toUpperCase()}]</span>
                  <span className={color}>{log.text}</span>
                </div>
                {log.stack && (
                  <pre className="mt-1.5 ml-8 pl-2 border-l border-neutral-800 text-[10px] text-neutral-500 select-all whitespace-pre-wrap font-sans leading-normal overflow-x-auto">
                    {log.stack}
                  </pre>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// 3. React Error Boundary Class Component
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    const stackTrace = error.stack || errorInfo.componentStack || undefined;
    const errData = {
      message: error.message || 'React Render Crash',
      stack: stackTrace || 'No stack trace available',
      time: new Date().toISOString(),
      type: 'react-crash'
    };
    localStorage.setItem('lira_last_crash', JSON.stringify(errData));
    addGlobalLog('crash', `[React Crash] ${error.message}`, stackTrace);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-99999 flex flex-col items-center justify-center bg-[#121214] text-white p-6 font-sans select-none">
          <div className="w-full max-w-sm bg-[#1C1212] rounded-2xl p-6 border border-red-500/40 shadow-2xl">
            <h3 className="font-bold text-base text-red-400 mb-2 flex items-center gap-2">
              <span>⚠️</span> Крах интерфейса L.I.R.A.
            </h3>
            <p className="text-xs text-[#CCCCCC] leading-relaxed mb-4">
              Произошла непредвиденная ошибка при отрисовке интерфейса React. Вы можете скопировать отчет или сбросить приложение:
            </p>

            <div className="bg-black/50 rounded-xl p-4 border border-red-500/15 max-h-56 overflow-y-auto mb-4 font-mono text-[10px] text-red-300 leading-normal break-all">
              <div className="font-bold mb-1">[Ошибка]: {this.state.error?.message}</div>
              <div className="text-neutral-400 select-all whitespace-pre-wrap">
                {this.state.error?.stack || this.state.errorInfo?.componentStack}
              </div>
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => {
                  try {
                    navigator.clipboard.writeText(`React Crash:\nMessage: ${this.state.error?.message}\nStack: ${this.state.error?.stack || this.state.errorInfo?.componentStack}`);
                  } catch {}
                }}
                className="flex-1 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl transition-all active:scale-95 cursor-pointer"
              >
                Копировать
              </button>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('lira_last_crash');
                  window.location.reload();
                }}
                className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all active:scale-95 cursor-pointer"
              >
                Перезагрузить
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Render App wrapped with ErrorBoundary and the DeveloperConsoleOverlay
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
      <DeveloperConsoleOverlay />
    </ErrorBoundary>
  </React.StrictMode>
);
