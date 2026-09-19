'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { Shop, StockItem, Feedback } from '@/lib/db';
import { useAccessibility } from '@/context/AccessibilityContext';
import { StockStatusBadge, StockItemIcon } from '@/components/StockStatusBadge';
import { formatTimeAgo, formatRestockDate } from '@/lib/utils';
import { getItemName, getShopName, getShopArea } from '@/lib/i18n';
import {
  ArrowLeft,
  Phone,
  Clock,
  MapPin,
  Volume2,
  ThumbsUp,
  ThumbsDown,
  MessageSquareWarning,
  CheckCircle2,
  Calendar,
  User,
  ShieldCheck,
  X
} from 'lucide-react';

export default function ShopDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { lang, t, speakText, isSpeaking, stopTextToSpeech } = useAccessibility();

  const [shop, setShop] = useState<(Shop & { stock: StockItem[]; confirmationsCount: { match: number; mismatch: number }; feedbackList: Feedback[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [userVoted, setUserVoted] = useState<boolean>(false);
  const [votingLoading, setVotingLoading] = useState<boolean>(false);

  // Modal State for Feedback
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
  const [feedbackCategory, setFeedbackCategory] = useState<string>('Stock Discrepancy');
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [feedbackSuccess, setFeedbackSuccess] = useState<boolean>(false);
  const [submittingFeedback, setSubmittingFeedback] = useState<boolean>(false);

  useEffect(() => {
    fetchShopDetail();

    // Live auto-polling every 5s so dealer stock updates reflect live to customers
    const interval = setInterval(() => {
      fetchShopDetailSilent();
    }, 5000);

    return () => clearInterval(interval);
  }, [id]);

  const fetchShopDetailSilent = async () => {
    try {
      const res = await fetch(`/api/shops/${id}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setShop(data.shop);
      }
    } catch (err) {
      // silent fail
    }
  };

  const fetchShopDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/shops/${id}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setShop(data.shop);
      }
    } catch (err) {
      console.error('Failed to fetch shop details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVoteConfirmation = async (isConfirmed: boolean) => {
    if (!shop || votingLoading) return;
    setVotingLoading(true);

    try {
      const res = await fetch('/api/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopId: shop.id, isConfirmed }),
      });
      const data = await res.json();
      if (data.success) {
        setShop((prev) => prev ? { ...prev, confirmationsCount: data.confirmationsCount } : null);
        setUserVoted(true);
      }
    } catch (err) {
      console.error('Failed to submit vote:', err);
    } finally {
      setVotingLoading(false);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop || !feedbackMessage.trim() || submittingFeedback) return;
    setSubmittingFeedback(true);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId: shop.id,
          category: feedbackCategory,
          message: feedbackMessage.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShop((prev) => prev ? { ...prev, feedbackList: data.feedbackList } : null);
        setFeedbackSuccess(true);
        setFeedbackMessage('');
        setTimeout(() => {
          setFeedbackSuccess(false);
          setShowFeedbackModal(false);
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleReadStockAudio = () => {
    if (isSpeaking) {
      stopTextToSpeech();
      return;
    }

    if (!shop) return;

    const sName = getShopName(shop, lang);
    let text = `${sName}. ${t.officialInventoryTitle}. `;
    shop.stock.forEach((item) => {
      const itemName = getItemName(item.item_key, item.item_name_en, item.item_name_hi, lang);
      const statusText =
        item.status === 'AVAILABLE'
          ? t.available
          : item.status === 'LOW'
          ? t.lowStock
          : t.outOfStock;

      text += `${itemName}: ${statusText}. `;
    });

    speakText(text);
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

  if (!shop) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-12 w-full text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">{t.noShopsFound}</h2>
          <Link href="/" className="px-5 py-3 bg-emerald-700 text-white font-bold rounded-xl">
            {t.backToList}
          </Link>
        </main>
      </div>
    );
  }

  const totalVotes = (shop.confirmationsCount?.match || 0) + (shop.confirmationsCount?.mismatch || 0);
  const matchPercentage = totalVotes > 0
    ? Math.round(((shop.confirmationsCount?.match || 0) / totalVotes) * 100)
    : 100;

  const displayName = getShopName(shop, lang);
  const displayArea = getShopArea(shop, lang);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-6 w-full flex-1 flex flex-col gap-6">
        {/* Back Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 font-bold rounded-xl border border-slate-300 min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.backToList}</span>
          </Link>
        </div>

        {/* Shop Header Card */}
        <section className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm flex flex-col gap-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="bg-emerald-100 text-emerald-900 text-xs font-black px-3 py-1 rounded-md border border-emerald-300">
                  {t.fpsCode}: {shop.fps_code}
                </span>
                <span className="bg-amber-100 text-amber-900 text-xs font-black px-3 py-1 rounded-md border border-amber-300 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  {t.govAuthorizedBadge}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {displayName}
              </h1>
              <p className="text-sm sm:text-base text-slate-600 flex items-center gap-1.5 mt-1">
                <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{shop.address}, {displayArea} - {shop.pincode}</span>
              </p>
            </div>

            {/* Listen Audio Button */}
            <button
              onClick={handleReadStockAudio}
              className={`min-h-[50px] px-6 py-3 rounded-2xl font-black text-sm sm:text-base transition-all flex items-center justify-center gap-2.5 shadow-md shrink-0 ${
                isSpeaking
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-amber-400 hover:bg-amber-300 text-emerald-950 border-2 border-amber-300'
              }`}
            >
              <Volume2 className="w-5 h-5" />
              <span>{isSpeaking ? t.stopAudio : t.listenAudio}</span>
            </button>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs sm:text-sm">
            <div className="flex items-center gap-2.5">
              <User className="w-5 h-5 text-emerald-700 shrink-0" />
              <div>
                <p className="text-slate-500 font-medium">{t.dealerName}</p>
                <p className="font-extrabold text-slate-900">{shop.dealer_name}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-emerald-700 shrink-0" />
              <div>
                <p className="text-slate-500 font-medium">{t.operatingHours}</p>
                <p className="font-extrabold text-slate-900">{shop.operating_hours}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Phone className="w-5 h-5 text-emerald-700 shrink-0" />
              <div>
                <p className="text-slate-500 font-medium">{t.phone}</p>
                <a href={`tel:${shop.phone}`} className="font-extrabold text-emerald-800 hover:underline">
                  {shop.phone}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Real-time 3-State Stock Table */}
        <section className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {t.officialInventoryTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                {t.officialInventorySubtitle}
              </p>
            </div>
          </div>

          {/* Stock Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b-2 border-slate-300 text-xs sm:text-sm font-extrabold text-slate-700 uppercase tracking-wider">
                  <th className="py-3 px-4">{t.tableHeaderItem}</th>
                  <th className="py-3 px-4">{t.tableHeaderAvailability}</th>
                  <th className="py-3 px-4">{t.tableHeaderQuantity}</th>
                  <th className="py-3 px-4">{t.lastUpdated}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs sm:text-base">
                {shop.stock.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    {/* Item Name + Icon */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <StockItemIcon itemKey={item.item_key} size="large" />
                        <div>
                          <p className="font-extrabold text-slate-900">
                            {getItemName(item.item_key, item.item_name_en, item.item_name_hi, lang)}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4">
                      <StockStatusBadge status={item.status} />
                    </td>

                    {/* Quantity Note & Restock Date */}
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-800">{item.quantity_note || '—'}</p>
                      {item.expected_restock_date && item.status !== 'AVAILABLE' && (
                        <p className="text-xs text-amber-800 font-semibold flex items-center gap-1 mt-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-flex">
                          <Calendar className="w-3.5 h-3.5 text-amber-600" />
                          {formatRestockDate(item.expected_restock_date, lang)}
                        </p>
                      )}
                    </td>

                    {/* Timestamp */}
                    <td className="py-4 px-4 text-slate-600 font-semibold text-xs sm:text-sm">
                      {formatTimeAgo(item.last_updated, lang)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Crowd Confirmation & Complaint Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Crowd Verification Widget */}
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-emerald-100 text-emerald-900 p-2 rounded-xl">
                  <ThumbsUp className="w-5 h-5 text-emerald-700" />
                </span>
                <h3 className="text-lg font-extrabold text-slate-900">
                  {t.crowdConfirmationTitle}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600">
                Help fellow citizens by confirming if the listed stock matches what you saw at the shop.
              </p>
            </div>

            {/* Rating Bar */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
              <div className="text-3xl font-black text-emerald-800 mb-1">
                {matchPercentage}% {t.verifiedByVisitors}
              </div>
              <p className="text-xs text-slate-500">
                {t.basedOnVisitorConfirmations} ({shop.confirmationsCount?.match || 0} matched, {shop.confirmationsCount?.mismatch || 0} mismatched)
              </p>
            </div>

            {/* Action Buttons */}
            {userVoted ? (
              <div className="bg-emerald-50 text-emerald-900 p-4 rounded-2xl border border-emerald-300 font-bold text-center flex items-center justify-center gap-2 text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>{t.thankYouVote}</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleVoteConfirmation(true)}
                  disabled={votingLoading}
                  className="min-h-[48px] px-4 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-sm"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>{t.confirmStockMatches}</span>
                </button>
                <button
                  onClick={() => handleVoteConfirmation(false)}
                  disabled={votingLoading}
                  className="min-h-[48px] px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-900 font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <ThumbsDown className="w-4 h-4 text-slate-600" />
                  <span>{t.reportDiscrepancy}</span>
                </button>
              </div>
            )}
          </div>

          {/* Report Issue Card */}
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-amber-100 text-amber-900 p-2 rounded-xl">
                  <MessageSquareWarning className="w-5 h-5 text-amber-700" />
                </span>
                <h3 className="text-lg font-extrabold text-slate-900">
                  {t.discrepancyCardTitle}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600">
                {t.discrepancyCardSub}
              </p>
            </div>

            <button
              onClick={() => setShowFeedbackModal(true)}
              className="w-full min-h-[48px] px-5 py-3 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black rounded-xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base shadow-sm border-2 border-amber-300"
            >
              <MessageSquareWarning className="w-5 h-5" />
              <span>{t.reportIssue}</span>
            </button>
          </div>
        </section>

        {/* Feedback / Complaint List */}
        {shop.feedbackList && shop.feedbackList.length > 0 && (
          <section className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm flex flex-col gap-3">
            <h3 className="text-lg font-extrabold text-slate-900">
              {t.recentCitizenComments}
            </h3>
            <div className="divide-y divide-slate-100">
              {shop.feedbackList.map((fb) => (
                <div key={fb.id} className="py-3 text-xs sm:text-sm space-y-1">
                  <div className="flex justify-between items-center text-slate-500 font-semibold">
                    <span className="bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded text-xs font-bold border border-slate-200">
                      {fb.category}
                    </span>
                    <span>{formatTimeAgo(fb.timestamp, lang)}</span>
                  </div>
                  <p className="text-slate-800 font-medium italic">"{fb.message}"</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border-4 border-amber-400 shadow-2xl flex flex-col gap-4 relative animate-in fade-in zoom-in duration-150">
            <button
              onClick={() => setShowFeedbackModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <MessageSquareWarning className="w-6 h-6 text-amber-600" />
              <span>{t.submitFeedback}</span>
            </h3>

            {feedbackSuccess ? (
              <div className="bg-emerald-100 text-emerald-900 p-6 rounded-2xl font-extrabold text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <p>{t.feedbackSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitFeedback} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                    {t.category}
                  </label>
                  <select
                    value={feedbackCategory}
                    onChange={(e) => setFeedbackCategory(e.target.value)}
                    className="w-full p-3 rounded-xl border-2 border-slate-300 font-bold text-slate-900 text-sm focus:border-emerald-600 min-h-[48px]"
                  >
                    <option value="Stock Discrepancy">Stock Discrepancy (App vs Reality)</option>
                    <option value="Shop Closed">Shop Unexpectedly Closed</option>
                    <option value="Overcharging Issue">Price / Overcharging Complaint</option>
                    <option value="Positive Service">Positive Feedback / Service</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                    {t.comments}
                  </label>
                  <textarea
                    rows={4}
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                    placeholder="Describe what you observed at the ration shop..."
                    required
                    className="w-full p-3 rounded-xl border-2 border-slate-300 font-medium text-slate-900 text-sm focus:border-emerald-600"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowFeedbackModal(false)}
                    className="px-5 py-2.5 bg-slate-200 text-slate-800 font-bold rounded-xl text-sm min-h-[44px]"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={submittingFeedback}
                    className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl text-sm min-h-[44px] shadow-sm"
                  >
                    {submittingFeedback ? 'Submitting...' : t.submit}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
