import { useState, useEffect, useCallback } from 'react';
import { X, Copy, Pencil, Check, Calendar, FolderOpen } from 'lucide-react';
import { t, getDrawerLabel } from '../i18n';
import { useStashStore } from '../store/useStashStore';
import { toast } from '../store/useToastStore';
import { DRAWER_META, type StashItem } from '../types';

interface ItemDetailModalProps {
  item: StashItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ItemDetailModal({ item, isOpen, onClose }: ItemDetailModalProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const updateItem = useStashStore((state) => state.updateItem);
  const i18n = t();

  useEffect(() => {
    if (item) {
      setEditedTitle(item.title || '');
    }
  }, [item]);

  useEffect(() => {
    if (!isOpen) {
      setIsEditingTitle(false);
      return;
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isEditingTitle) {
          setIsEditingTitle(false);
          setEditedTitle(item?.title || '');
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, isEditingTitle, item?.title]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  const handleCopyContent = useCallback(async () => {
    if (!item) return;

    try {
      await navigator.clipboard.writeText(item.content);
      toast.success(i18n.toast.copied);
    } catch {
      toast.error(i18n.toast.error);
    }
  }, [item, i18n.toast.copied, i18n.toast.error]);

  const handleSaveTitle = useCallback(async () => {
    if (!item) return;

    await updateItem(item.id, { title: editedTitle.trim() || undefined });
    setIsEditingTitle(false);
    toast.success(i18n.toast.saved);
  }, [item, editedTitle, updateItem, i18n.toast.saved]);

  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSaveTitle();
      }
    },
    [handleSaveTitle]
  );

  const formatDate = useCallback((timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  if (!isOpen || !item) return null;

  const drawerMeta = DRAWER_META.find((d) => d.type === item.drawer);
  const drawerIcon = drawerMeta?.icon || '📦';

  return (
    <div
      data-testid="item-detail-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="item-detail-title"
        data-testid="item-detail-content"
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-xl">{drawerIcon}</span>
            <span className="text-sm font-medium text-gray-500">
              {getDrawerLabel(item.drawer)}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label={i18n.itemDetail.close}
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Title Section */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              {i18n.itemDetail.title}
            </label>
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onKeyDown={handleTitleKeyDown}
                  autoFocus
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder={i18n.itemDetail.editTitle}
                />
                <button
                  onClick={handleSaveTitle}
                  className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                >
                  <Check className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p
                  id="item-detail-title"
                  className="flex-1 text-lg font-semibold text-gray-900"
                >
                  {item.title || (
                    <span className="text-gray-400 italic">
                      {i18n.itemDetail.editTitle}
                    </span>
                  )}
                </p>
                <button
                  onClick={() => setIsEditingTitle(true)}
                  aria-label={i18n.itemDetail.editTitle}
                  className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-gray-500">
                {i18n.itemDetail.content}
              </label>
              <button
                onClick={handleCopyContent}
                className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                {i18n.itemDetail.copyContent}
              </button>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-gray-700 whitespace-pre-wrap break-words text-sm leading-relaxed">
                {item.content}
              </p>
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <div>
                <span className="text-xs block">{i18n.itemDetail.createdAt}</span>
                <span className="font-medium text-gray-700">
                  {formatDate(item.createdAt)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FolderOpen className="w-4 h-4" />
              <div>
                <span className="text-xs block">{i18n.itemDetail.drawer}</span>
                <span className="font-medium text-gray-700">
                  {getDrawerLabel(item.drawer)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-3 min-h-[48px] bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
          >
            {i18n.itemDetail.close}
          </button>
        </div>
      </div>
    </div>
  );
}
