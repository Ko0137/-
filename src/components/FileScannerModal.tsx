import React, { useState, useMemo, useRef } from 'react';
import { AppTheme, IndexedFileItem, FileCategory } from '../types';
import { fileScannerService, formatFileSize, formatDateString } from '../services/fileScannerService';
import { triggerVibration, soundManager } from '../utils/sound';
import {
  FolderSearch,
  Search,
  FileText,
  Image as ImageIcon,
  Download,
  Music,
  Code,
  File,
  X,
  Upload,
  Calendar,
  HardDrive,
  Star,
  Copy,
  Eye,
  Trash2,
  Check,
  Filter,
  ArrowUpDown,
  RefreshCw,
  FolderOpen,
  Sparkles,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';

export interface FileScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: AppTheme;
  initialQuery?: string;
  initialCategory?: FileCategory;
  onSelectFile?: (file: IndexedFileItem) => void;
}

export const FileScannerModal: React.FC<FileScannerModalProps> = ({
  isOpen,
  onClose,
  theme = 'dark',
  initialQuery = '',
  initialCategory = 'all',
  onSelectFile,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<FileCategory>(initialCategory);
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month' | 'year'>('all');
  const [sizeRange, setSizeRange] = useState<'all' | 'small' | 'medium' | 'large'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filesList, setFilesList] = useState<IndexedFileItem[]>(() => fileScannerService.getAllFiles());
  const [previewFile, setPreviewFile] = useState<IndexedFileItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isScanningActive, setIsScanningActive] = useState<boolean>(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync initial query
  React.useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
    }
  }, [initialQuery]);

  React.useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  const stats = useMemo(() => {
    return fileScannerService.getStorageStats();
  }, [filesList]);

  // Filtered files
  const filteredFiles = useMemo(() => {
    return fileScannerService.searchFiles({
      query: searchQuery,
      category: selectedCategory,
      dateRange,
      sizeRange,
      sortBy,
      sortDirection,
    });
  }, [searchQuery, selectedCategory, dateRange, sizeRange, sortBy, sortDirection, filesList]);

  if (!isOpen) return null;

  const isIOS = theme === 'ios';
  const isLight = theme === 'light';
  const isCyber = theme === 'cyber';

  const handleDeviceFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    triggerVibration('selection');
    setIsScanningActive(true);
    setScanMessage(`Сканирование ${files.length} файлов...`);

    try {
      const added = await fileScannerService.scanDeviceFiles(files);
      setFilesList(fileScannerService.getAllFiles());
      soundManager.playCommandSuccess();
      setScanMessage(`Успешно проиндексировано +${added.length} файлов в локальную память!`);
      setTimeout(() => setScanMessage(null), 4000);
    } catch {
      setScanMessage('Ошибка при чтении файлов');
    } finally {
      setIsScanningActive(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleNativeScan = async () => {
    triggerVibration('selection');
    setIsScanningActive(true);
    setScanMessage('Сканирование памяти Android устройства...');
    try {
      const count = await fileScannerService.scanDeviceStorageNative();
      setFilesList(fileScannerService.getAllFiles());
      soundManager.playCommandSuccess();
      setScanMessage(`Найдено и проиндексировано +${count} файлов устройства!`);
      setTimeout(() => setScanMessage(null), 4000);
    } catch {
      setScanMessage('Не удалось прочитать хранилище файла');
    } finally {
      setIsScanningActive(false);
    }
  };

  const handleToggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerVibration('tap');
    fileScannerService.toggleStar(id);
    setFilesList(fileScannerService.getAllFiles());
  };

  const handleDeleteFile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerVibration('tap');
    fileScannerService.deleteFile(id);
    setFilesList(fileScannerService.getAllFiles());
    if (previewFile?.id === id) {
      setPreviewFile(null);
    }
  };

  const handleCopySnippet = (item: IndexedFileItem, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerVibration('selection');
    const textToCopy = `Файл: ${item.name}\nПуть: ${item.directory}\nРазмер: ${formatFileSize(item.sizeBytes)}\nДата: ${formatDateString(item.updatedAt)}\n\nСодержимое:\n${item.contentSnippet}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadStub = (item: IndexedFileItem, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerVibration('tap');
    // Create text file blob download
    const blob = new Blob([item.contentSnippet], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = item.name.endsWith('.txt') ? item.name : `${item.name}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getCategoryIcon = (category: FileCategory) => {
    switch (category) {
      case 'document':
        return <FileText className="w-4 h-4 text-blue-400" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 text-amber-400" />;
      case 'download':
        return <Download className="w-4 h-4 text-indigo-400" />;
      case 'audio':
        return <Music className="w-4 h-4 text-purple-400" />;
      case 'code':
        return <Code className="w-4 h-4 text-emerald-400" />;
      default:
        return <File className="w-4 h-4 text-neutral-400" />;
    }
  };

  // Helper to highlight matching keywords in text
  const renderHighlightedText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-amber-400/40 text-amber-200 px-0.5 rounded-xs font-semibold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div
      id="file_scanner_modal_overlay"
      className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="file_scanner_modal_window"
        onClick={e => e.stopPropagation()}
        className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl border transition-all overflow-hidden animate-in zoom-in-95 duration-150 ${
          isIOS
            ? 'bg-[#1C1C1E]/95 backdrop-blur-2xl border-white/20 text-white shadow-black/80'
            : isCyber
            ? 'bg-[#0A0A14]/95 backdrop-blur-xl border-[#00F0FF]/40 text-white shadow-2xl shadow-[#00F0FF]/20'
            : isLight
            ? 'bg-[#F9FAF8] border-[#CBD4C8] text-[#1E2520] shadow-xl'
            : 'bg-[#141417] border-white/15 text-white shadow-2xl'
        }`}
      >
        {/* Header */}
        <div
          className={`px-4 py-3 flex items-center justify-between border-b shrink-0 ${
            isIOS
              ? 'border-white/10 bg-white/5'
              : isCyber
              ? 'border-[#00F0FF]/20 bg-[#00F0FF]/5'
              : isLight
              ? 'border-[#D0D7CD] bg-[#E8ECE5]'
              : 'border-white/10 bg-white/5'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <FolderSearch className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight">Локальный сканер файлов</h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#00E676]/20 text-[#00E676] font-semibold border border-[#00E676]/30 flex items-center gap-1">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  100% Offline
                </span>
              </div>
              <p className="text-[11px] opacity-60">
                Поиск по содержимому, дате и типу без отправки в облако
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              triggerVibration('tap');
              onClose();
            }}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white/60 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Storage Bar & Scan Action Bar */}
        <div
          className={`px-4 py-2.5 border-b text-xs space-y-2 shrink-0 ${
            isLight ? 'bg-black/5 border-[#D0D7CD]' : 'bg-black/20 border-white/5'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="w-3.5 h-3.5 text-[#00E676]" />
              <span className="font-semibold">Проиндексировано файлов: {stats.totalFiles}</span>
              <span className="opacity-50 font-mono">({stats.formattedTotal})</span>
            </div>

            <div className="flex items-center gap-1.5">
              <input
                type="file"
                ref={fileInputRef}
                multiple
                className="hidden"
                onChange={handleDeviceFileUpload}
              />

              <button
                type="button"
                onClick={handleNativeScan}
                disabled={isScanningActive}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
              >
                <FolderSearch className="w-3 h-3" />
                <span>📱 Просканировать Android</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isScanningActive}
                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Upload className="w-3 h-3" />
                <span>+ Файлы</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerVibration('tap');
                  fileScannerService.resetToDefaults();
                  setFilesList(fileScannerService.getAllFiles());
                  soundManager.playClick();
                }}
                title="Сбросить к исходным файлам"
                className="p-1 rounded-lg hover:bg-white/10 opacity-60 hover:opacity-100 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Segmented storage progress bar */}
          <div className="w-full h-1.5 bg-neutral-700/40 rounded-full overflow-hidden flex">
            <div
              className="bg-blue-500 h-full"
              style={{
                width: `${Math.max(5, (stats.categoryStats.document.bytes / (stats.totalBytes || 1)) * 100)}%`,
              }}
              title={`Документы: ${formatFileSize(stats.categoryStats.document.bytes)}`}
            />
            <div
              className="bg-amber-400 h-full"
              style={{
                width: `${Math.max(5, (stats.categoryStats.image.bytes / (stats.totalBytes || 1)) * 100)}%`,
              }}
              title={`Фото: ${formatFileSize(stats.categoryStats.image.bytes)}`}
            />
            <div
              className="bg-indigo-500 h-full"
              style={{
                width: `${Math.max(5, (stats.categoryStats.download.bytes / (stats.totalBytes || 1)) * 100)}%`,
              }}
              title={`Загрузки: ${formatFileSize(stats.categoryStats.download.bytes)}`}
            />
            <div
              className="bg-purple-500 h-full"
              style={{
                width: `${Math.max(5, (stats.categoryStats.audio.bytes / (stats.totalBytes || 1)) * 100)}%`,
              }}
              title={`Аудио: ${formatFileSize(stats.categoryStats.audio.bytes)}`}
            />
            <div
              className="bg-emerald-500 h-full"
              style={{
                width: `${Math.max(5, (stats.categoryStats.code.bytes / (stats.totalBytes || 1)) * 100)}%`,
              }}
              title={`Код: ${formatFileSize(stats.categoryStats.code.bytes)}`}
            />
          </div>

          {scanMessage && (
            <div className="text-[11px] text-[#00E676] font-medium animate-in fade-in flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5" />
              <span>{scanMessage}</span>
            </div>
          )}
        </div>

        {/* Search Bar & Filters Section */}
        <div className="p-3 border-b border-white/10 space-y-2.5 shrink-0">
          {/* Main search input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Поиск по имени, папке или содержимому (паспорт, чек, договор, 3 квартал...)"
              className={`w-full pl-9 pr-8 py-2 rounded-xl text-xs border outline-none transition-all ${
                isLight
                  ? 'bg-white border-[#CBD4C8] focus:border-blue-500 text-[#1E2520]'
                  : 'bg-black/30 border-white/10 focus:border-[#00E676] text-white'
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-white/10 opacity-60 hover:opacity-100"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Chips Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {(
              [
                { id: 'all', label: 'Все файлы', icon: FolderOpen },
                { id: 'document', label: 'Документы', icon: FileText },
                { id: 'image', label: 'Фото & Чеки', icon: ImageIcon },
                { id: 'download', label: 'Загрузки', icon: Download },
                { id: 'audio', label: 'Аудио', icon: Music },
                { id: 'code', label: 'Код & Конфиг', icon: Code },
              ] as const
            ).map(cat => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    triggerVibration('selection');
                    setSelectedCategory(cat.id);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1.5 border transition-all cursor-pointer ${
                    isSelected
                      ? isCyber
                        ? 'bg-[#00F0FF]/20 border-[#00F0FF] text-[#00F0FF]'
                        : 'bg-blue-600 text-white border-blue-500 shadow-xs'
                      : isLight
                      ? 'bg-white border-[#CBD4C8] text-neutral-600 hover:bg-black/5'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sub-Filters: Date, Size & Sort */}
          <div className="flex items-center justify-between text-[11px] gap-2 pt-0.5">
            {/* Date selector */}
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 opacity-50" />
              <select
                value={dateRange}
                onChange={e => setDateRange(e.target.value as any)}
                className={`bg-transparent border rounded-md px-1.5 py-0.5 text-[11px] outline-none cursor-pointer ${
                  isLight ? 'border-[#CBD4C8]' : 'border-white/10'
                }`}
              >
                <option value="all" className="text-black">Любая дата</option>
                <option value="today" className="text-black">За сегодня</option>
                <option value="week" className="text-black">За 7 дней</option>
                <option value="month" className="text-black">За 30 дней</option>
                <option value="year" className="text-black">За этот год</option>
              </select>
            </div>

            {/* Size selector */}
            <div className="flex items-center gap-1">
              <Filter className="w-3 h-3 opacity-50" />
              <select
                value={sizeRange}
                onChange={e => setSizeRange(e.target.value as any)}
                className={`bg-transparent border rounded-md px-1.5 py-0.5 text-[11px] outline-none cursor-pointer ${
                  isLight ? 'border-[#CBD4C8]' : 'border-white/10'
                }`}
              >
                <option value="all" className="text-black">Любой размер</option>
                <option value="small" className="text-black">&lt; 1 МБ (Мелкие)</option>
                <option value="medium" className="text-black">1 – 50 МБ (Средние)</option>
                <option value="large" className="text-black">&gt; 50 МБ (Крупные)</option>
              </select>
            </div>

            {/* Sort selector */}
            <div className="flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3 opacity-50" />
              <button
                type="button"
                onClick={() => {
                  triggerVibration('tap');
                  setSortBy(prev => (prev === 'date' ? 'size' : prev === 'size' ? 'name' : 'date'));
                }}
                className={`border rounded-md px-2 py-0.5 text-[11px] font-medium cursor-pointer ${
                  isLight ? 'border-[#CBD4C8] hover:bg-black/5' : 'border-white/10 hover:bg-white/10'
                }`}
              >
                {sortBy === 'date' ? '📅 По дате' : sortBy === 'size' ? '📊 По размеру' : '🔤 По имени'}
              </button>
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
          {filteredFiles.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center bg-[var(--accent-color,#00E676)]/10 text-[var(--accent-color,#00E676)] border border-[var(--accent-color,#00E676)]/20">
                <FolderSearch className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">Локальный индекс пуст</p>
                <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                  Выберите файлы или папку на телефоне (Загрузки, Документы, Фото) для быстрого поиска ассистентом.
                </p>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 rounded-xl bg-[var(--accent-color,#00E676)] text-black font-semibold text-xs inline-flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-lg shadow-[var(--accent-color,#00E676)]/20"
              >
                <Upload className="w-4 h-4" />
                <span>Выбрать файлы / папку телефона</span>
              </button>
            </div>
          ) : (
            filteredFiles.map(file => {
              const isSelectedForPreview = previewFile?.id === file.id;
              return (
                <div
                  key={file.id}
                  onClick={() => {
                    triggerVibration('tap');
                    setPreviewFile(file);
                    if (onSelectFile) onSelectFile(file);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer group ${
                    isSelectedForPreview
                      ? 'border-blue-500 bg-blue-500/10 shadow-sm'
                      : isIOS
                      ? 'bg-white/5 border-white/10 hover:bg-white/10'
                      : isCyber
                      ? 'bg-[#00F0FF]/5 border-[#00F0FF]/20 hover:bg-[#00F0FF]/10'
                      : isLight
                      ? 'bg-white border-[#CBD4C8] hover:border-blue-400 shadow-2xs'
                      : 'bg-black/30 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <div className="p-2 rounded-lg bg-white/5 border border-white/10 shrink-0 mt-0.5">
                        {getCategoryIcon(file.category)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold truncate">
                            {renderHighlightedText(file.name, searchQuery)}
                          </h4>
                          {file.isUserScanned && (
                            <span className="text-[9px] px-1 rounded-sm bg-emerald-500/20 text-emerald-300 font-mono">
                              Устройство
                            </span>
                          )}
                        </div>

                        <div className="text-[10px] opacity-60 font-mono truncate mt-0.5">
                          📁 {file.directory} • {formatFileSize(file.sizeBytes)} •{' '}
                          {formatDateString(file.updatedAt)}
                        </div>

                        {/* Content Snippet Highlight */}
                        {file.contentSnippet && (
                          <div
                            className={`mt-1.5 text-[11px] leading-relaxed p-1.5 rounded-md line-clamp-2 ${
                              isLight ? 'bg-black/5 text-[#2C352E]' : 'bg-black/40 text-neutral-300'
                            }`}
                          >
                            <span className="font-semibold text-blue-400 text-[10px] mr-1">
                              [Содержимое]:
                            </span>
                            {renderHighlightedText(file.contentSnippet, searchQuery)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick action buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={e => handleToggleStar(file.id, e)}
                        title={file.isStarred ? 'Убрать из избранного' : 'В избранное'}
                        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${
                            file.isStarred ? 'fill-amber-400 text-amber-400' : 'opacity-40 hover:opacity-100'
                          }`}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={e => handleCopySnippet(file, e)}
                        title="Скопировать информацию"
                        className="p-1.5 rounded-lg hover:bg-white/10 opacity-60 hover:opacity-100 transition-colors cursor-pointer"
                      >
                        {copiedId === file.id ? (
                          <Check className="w-3.5 h-3.5 text-[#00E676]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={e => handleDownloadStub(file, e)}
                        title="Скачать / Экспорт"
                        className="p-1.5 rounded-lg hover:bg-white/10 opacity-60 hover:opacity-100 transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={e => handleDeleteFile(file.id, e)}
                        title="Удалить из индекса"
                        className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 opacity-60 hover:opacity-100 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* File Detail Drawer / Preview Footer */}
        {previewFile && (
          <div
            className={`p-3.5 border-t border-white/10 shrink-0 animate-in slide-in-from-bottom-2 ${
              isLight ? 'bg-[#ECEFE9]' : 'bg-black/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold truncate max-w-xs">{previewFile.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewFile(null)}
                className="text-[11px] opacity-60 hover:opacity-100 cursor-pointer"
              >
                Закрыть предпросмотр
              </button>
            </div>

            {previewFile.previewDataUrl && (
              <div className="mb-2 max-h-32 rounded-lg overflow-hidden border border-white/10 flex justify-center bg-black/40">
                <img
                  src={previewFile.previewDataUrl}
                  alt={previewFile.name}
                  className="max-h-32 object-contain"
                />
              </div>
            )}

            <div
              className={`p-2.5 rounded-xl border text-xs font-mono max-h-24 overflow-y-auto whitespace-pre-wrap ${
                isLight ? 'bg-white border-[#CBD4C8] text-[#1E2520]' : 'bg-black/60 border-white/10 text-white/90'
              }`}
            >
              {previewFile.contentSnippet || 'Содержимое недоступно для быстрого чтения.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
