'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { Shop, StockItem, Feedback } from '@/lib/db';
import { useAccessibility } from '@/context/AccessibilityContext';
import { StockItemIcon } from '@/components/StockStatusBadge';
import { formatTimeAgo, formatRestockDate } from '@/lib/utils';
import { getItemName, getShopName, getShopArea } from '@/lib/i18n';
import {
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Save,
  LogOut,
  Calendar,
  MessageSquare,
  ThumbsUp,
  Clock,
  Sparkles
} from 'lucide-react';

export default function DealerDashboardPage() {
  const { lang, t } = useAccessibility();
  const router = useRouter();

  const [shop, setShop] = useState<(Shop & { stock: StockItem[]; confirmationsCount: { match: number; mismatch: number }; feedbackList: Feedback[] }) | null>(null);
  const [loading, setLoading] = useState(true);

  // Local draft state for updates
  const [stockDraft, setStockDraft] = useState<Record<string, { status: 'AVAILABLE' | 'LOW' | 'OUT_OF_STOCK'; note: string; restockDate: string }>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const savedDealer = localStorage.getItem('ration_dealer_shop');
    if (!savedDealer) {
      router.push('/dealer/login');
      return;
    }

    try {
      const parsed = JSON.parse(savedDealer);
      fetchDealerShop(parsed.id);
    } catch {
      router.push('/dealer/login');
    }
  }, [router]);

  const fetchDealerShop = async (shopId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/shops/${shopId}`);
      const data = await res.json();
      if (data.success && data.shop) {
        setShop(data.shop);

        // Initialize draft state
        const initialDraft: Record<string, { status: 'AVAILABLE' | 'LOW' | 'OUT_OF_STOCK'; note: string; restockDate: string }> = {};
        data.shop.stock.forEach((item: StockItem) => {
          initialDraft[item.item_key] = {
            status: item.status,
            note: item.quantity_note || '',
            restockDate: item.expected_restock_date || '',
          };
        });
        setStockDraft(initialDraft);
      }
    } catch (err) {
      console.error('Failed to fetch dealer shop:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (itemKey: string, newStatus: 'AVAILABLE' | 'LOW' | 'OUT_OF_STOCK') => {
    setStockDraft((prev) => ({
      ...prev,
      [itemKey]: { ...prev[itemKey], status: newStatus },
    }));
  };

  const handleNoteChange = (itemKey: string, note: string) => {
    setStockDraft((prev) => ({
      ...prev,
      [itemKey]: { ...prev[itemKey], note },
    }));
  };

  const handleRestockDateChange = (itemKey: string, date: string) => {
    setStockDraft((prev) => ({
      ...prev,
      [itemKey]: { ...prev[itemKey], restockDate: date },
    }));
  };

  const handlePublishUpdate = async (itemKey: string) => {
    if (!shop || !stockDraft[itemKey]) return;
    setSavingKey(itemKey);

    const draft = stockDraft[itemKey];

    try {
      const res = await fetch('/api/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId: shop.id,
          itemKey,
          status: draft.status,
          quantityNote: draft.note,
          expectedRestockDate: draft.restockDate || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShop(data.shop);
        setSaveSuccessMsg(`Updated status!`);
        setTimeout(() => setSaveSuccessMsg(null), 3000);
      }
    } catch (err) {
      console.error('Failed to update stock:', err);
    } finally {
      setSavingKey(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ration_dealer_shop');
    router.push('/dealer/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-12 w-full text-center">
          <div className="w-12 h-12 border-4 border-emerald-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-800 font-bold text-lg">{t.loadingShops}</p>
        </main>
      </div>
    );
  }

  if (!shop) return null;

  const displayName = getShopName(shop, lang);
  const displayArea = getShopArea(shop, lang);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header currentDealerId={shop.id} />

      <main className="max-w-6xl mx-auto px-4 py-6 w-full flex-1 flex flex-col gap-6">
        {/* Dealer Welcome & Action Header */}
        <section className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-800 text-amber-400 rounded-2xl flex items-center justify-center font-black text-2xl shadow-inner shrink-0">
              <UserCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-emerald-100 text-emerald-900 text-xs font-black px-2.5 py-0.5 rounded border border-emerald-300">
                  {shop.fps_code}
                </span>
                <span className="text-xs font-bold text-slate-500">{t.dealerName}: {shop.dealer_name}</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900">{displayName}</h1>
              <p className="text-xs sm:text-sm text-slate-600">{shop.address}, {displayArea}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold rounded-xl border border-rose-300 transition-all flex items-center gap-2 min-h-[44px] text-sm shrink-0"
          >
            <LogOut className="w-4 h-4 text-rose-600" />
            <span>{t.logout}</span>
          </button>
        </section>

        {/* Success Alert Banner */}
        {saveSuccessMsg && (
          <div className="bg-emerald-100 text-emerald-900 p-4 rounded-2xl border-2 border-emerald-400 font-black text-sm flex items-center gap-2 shadow-sm animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Inventory Stock Update Panel */}
        <section className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm flex flex-col gap-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-500" />
              <span>{t.updateStatus}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Tap a 3-State button to set status, add quantity note, and tap "{t.saveChanges}".
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {shop.stock.map((item) => {
              const draft = stockDraft[item.item_key] || {
                status: item.status,
                note: item.quantity_note || '',
                restockDate: item.expected_restock_date || '',
              };
              const isSaving = savingKey === item.item_key;

              return (
                <div
                  key={item.id}
                  className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-200 flex flex-col gap-4 shadow-xs"
                >
                  {/* Top Item Info */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-3">
                      <StockItemIcon itemKey={item.item_key} size="large" />
                      <div>
                        <h3 className="text-lg font-black text-slate-900">
                          {getItemName(item.item_key, item.item_name_en, item.item_name_hi, lang)}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{t.lastUpdated}: {formatTimeAgo(item.last_updated, lang)}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 1-Tap 3-State Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* AVAILABLE BUTTON */}
                    <button
                      type="button"
                      onClick={() => handleStatusChange(item.item_key, 'AVAILABLE')}
                      className={`min-h-[50px] p-3 rounded-xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 transition-all border-2 ${
                        draft.status === 'AVAILABLE'
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-4 ring-emerald-200'
                          : 'bg-white text-emerald-900 border-emerald-300 hover:bg-emerald-50'
                      }`}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span>{t.available}</span>
                    </button>

                    {/* LOW STOCK BUTTON */}
                    <button
                      type="button"
                      onClick={() => handleStatusChange(item.item_key, 'LOW')}
                      className={`min-h-[50px] p-3 rounded-xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 transition-all border-2 ${
                        draft.status === 'LOW'
                          ? 'bg-amber-500 text-amber-950 border-amber-600 shadow-md ring-4 ring-amber-200'
                          : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-50'
                      }`}
                    >
                      <AlertTriangle className="w-5 h-5" />
                      <span>{t.lowStock}</span>
                    </button>

                    {/* OUT OF STOCK BUTTON */}
                    <button
                      type="button"
                      onClick={() => handleStatusChange(item.item_key, 'OUT_OF_STOCK')}
                      className={`min-h-[50px] p-3 rounded-xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 transition-all border-2 ${
                        draft.status === 'OUT_OF_STOCK'
                          ? 'bg-rose-600 text-white border-rose-700 shadow-md ring-4 ring-rose-200'
                          : 'bg-white text-rose-900 border-rose-300 hover:bg-rose-50'
                      }`}
                    >
                      <XCircle className="w-5 h-5" />
                      <span>{t.outOfStock}</span>
                    </button>
                  </div>

                  {/* Quantity & Restock Date Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                        {t.stockQuantityNoteLabel}
                      </label>
                      <input
                        type="text"
                        value={draft.note}
                        onChange={(e) => handleNoteChange(item.item_key, e.target.value)}
                        placeholder="e.g. 1,200 kg or 30 Liters"
                        className="w-full p-3 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-900 focus:border-emerald-600 bg-white min-h-[46px]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                        {t.expectedRestockDateLabel}
                      </label>
                      <input
                        type="date"
                        value={draft.restockDate}
                        onChange={(e) => handleRestockDateChange(item.item_key, e.target.value)}
                        className="w-full p-3 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-900 focus:border-emerald-600 bg-white min-h-[46px]"
                      />
                    </div>
                  </div>

                  {/* Publish Button */}
                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => handlePublishUpdate(item.item_key)}
                      disabled={isSaving}
                      className="min-h-[48px] px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-amber-300 border-2 border-amber-400 font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-sm"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSaving ? '...' : t.saveChanges}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Citizen Confirmations & Feedback Monitor */}
        <section className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm flex flex-col gap-4">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-emerald-700" />
            <span>{t.recentCitizenFeedback}</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Confirmation Vote Counter */}
            <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200 flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-700 text-white rounded-2xl flex items-center justify-center font-black shrink-0">
                <ThumbsUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-black text-emerald-950">
                  {shop.confirmationsCount?.match || 0} Positive Confirmations
                </p>
                <p className="text-xs text-emerald-800">
                  {shop.confirmationsCount?.mismatch || 0} discrepancy votes recorded by citizens
                </p>
              </div>
            </div>

            {/* Recent Feedback Feed */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {shop.feedbackList && shop.feedbackList.length > 0 ? (
                shop.feedbackList.map((fb) => (
                  <div key={fb.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between items-center text-slate-500 font-bold">
                      <span className="text-emerald-800">{fb.category}</span>
                      <span>{formatTimeAgo(fb.timestamp, lang)}</span>
                    </div>
                    <p className="text-slate-800 font-medium">"{fb.message}"</p>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 italic p-4 text-center">
                  {t.noFeedbackSubmitted}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
