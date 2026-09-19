'use client';

import React from 'react';
import Link from 'next/link';
import { Shop, StockItem } from '@/lib/db';
import { useAccessibility } from '@/context/AccessibilityContext';
import { StockStatusBadge, StockItemIcon } from './StockStatusBadge';
import { MapPin, Phone, Clock, ThumbsUp, ChevronRight } from 'lucide-react';
import { formatTimeAgo } from '@/lib/utils';
import { getItemName, getShopName, getShopArea, getShopAddress } from '@/lib/i18n';

interface ShopCardProps {
  shop: Shop & {
    stock: StockItem[];
    confirmationsCount?: { match: number; mismatch: number };
  };
  userDistance?: number | null;
}

export default function ShopCard({ shop, userDistance }: ShopCardProps) {
  const { lang, t } = useAccessibility();

  // Find most recent stock update timestamp among items
  const latestUpdate = shop.stock.reduce((latest, item) => {
    if (!latest || new Date(item.last_updated) > new Date(latest)) {
      return item.last_updated;
    }
    return latest;
  }, '');

  const totalVerifications = (shop.confirmationsCount?.match || 0) + (shop.confirmationsCount?.mismatch || 0);
  const matchPercentage = totalVerifications > 0
    ? Math.round(((shop.confirmationsCount?.match || 0) / totalVerifications) * 100)
    : 100;

  const displayName = getShopName(shop, lang);
  const displayArea = getShopArea(shop, lang);
  const displayAddress = getShopAddress(shop, lang);

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm hover:shadow-md transition-all p-4 sm:p-5 flex flex-col justify-between gap-4">
      {/* Header Info */}
      <div className="flex justify-between items-start gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="bg-emerald-100 text-emerald-900 text-xs font-black px-2.5 py-1 rounded-md border border-emerald-300">
              {shop.fps_code}
            </span>
            {userDistance !== undefined && userDistance !== null && (
              <span className="bg-amber-100 text-amber-900 text-xs font-extrabold px-2.5 py-1 rounded-md border border-amber-300 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-700" />
                {userDistance} {t.distanceKm}
              </span>
            )}
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
            {displayName}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 flex items-center gap-1 mt-1">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{displayAddress}, {displayArea} (PIN: {shop.pincode})</span>
          </p>
        </div>
      </div>

      {/* Details Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm bg-slate-50 p-3 rounded-xl border border-slate-100">
        <div className="flex items-center gap-2 text-slate-700">
          <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{shop.operating_hours}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-700">
          <Phone className="w-4 h-4 text-emerald-700 shrink-0" />
          <a href={`tel:${shop.phone}`} className="font-semibold text-emerald-800 hover:underline">
            {shop.phone}
          </a>
        </div>
      </div>

      {/* Quick Visual Stock Summary (Icons + Badges) */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xs font-extrabold tracking-wider uppercase text-slate-500">
            {t.currentStockStatus}
          </h3>
          {latestUpdate && (
            <span className="text-xs text-slate-500 italic">
              {t.lastUpdated}: {formatTimeAgo(latestUpdate, lang)}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {shop.stock.map((item) => (
            <div
              key={item.id}
              className="bg-slate-50/80 p-2 rounded-xl border border-slate-200 flex flex-col items-center text-center justify-between gap-1 shadow-2xs h-full"
            >
              <StockItemIcon itemKey={item.item_key} />
              <span className="text-xs font-extrabold text-slate-900 line-clamp-1 py-0.5">
                {getItemName(item.item_key, item.item_name_en, item.item_name_hi, lang)}
              </span>
              <StockStatusBadge status={item.status} />
            </div>
          ))}
        </div>
      </div>

      {/* Community Confirmation Bar & View Button */}
      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span className="bg-emerald-50 text-emerald-700 p-1.5 rounded-lg font-bold flex items-center gap-1 border border-emerald-200">
            <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
            {matchPercentage}%
          </span>
          <span>
            ({shop.confirmationsCount?.match || 0} {t.confirmationsText})
          </span>
        </div>

        <Link
          href={`/shop/${shop.id}`}
          className="w-full sm:w-auto min-h-[48px] px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-extrabold rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 text-sm sm:text-base focus:ring-4 focus:ring-emerald-300"
        >
          <span>{t.viewDetails}</span>
          <ChevronRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}
