'use client';

import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Wheat, Flame, Droplet, Container } from 'lucide-react';
import { useAccessibility } from '@/context/AccessibilityContext';

export type StockStatusType = 'AVAILABLE' | 'LOW' | 'OUT_OF_STOCK';

export function StockStatusBadge({ status }: { status: StockStatusType }) {
  const { t } = useAccessibility();

  switch (status) {
    case 'AVAILABLE':
      return (
        <span className="badge-available whitespace-nowrap inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-black bg-emerald-100 text-emerald-800 border-2 border-emerald-500 shadow-2xs w-full text-center">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>{t.available}</span>
        </span>
      );
    case 'LOW':
      return (
        <span className="badge-low whitespace-nowrap inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-black bg-amber-100 text-amber-900 border-2 border-amber-500 shadow-2xs w-full text-center">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>{t.lowStock}</span>
        </span>
      );
    case 'OUT_OF_STOCK':
      return (
        <span className="badge-out whitespace-nowrap inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-black bg-rose-100 text-rose-800 border-2 border-rose-500 shadow-2xs w-full text-center">
          <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          <span>{t.outOfStock}</span>
        </span>
      );
    default:
      return null;
  }
}

export function StockItemIcon({ itemKey, size = 'normal' }: { itemKey: string; size?: 'normal' | 'large' }) {
  const iconSize = size === 'large' ? 'w-7 h-7' : 'w-4 h-4';

  switch (itemKey) {
    case 'rice':
      return (
        <div className="p-1.5 bg-amber-100 text-amber-800 rounded-xl flex items-center justify-center font-bold shrink-0">
          <span className={size === 'large' ? 'text-2xl' : 'text-base'} role="img" aria-label="Rice">🌾</span>
        </div>
      );
    case 'wheat':
      return (
        <div className="p-1.5 bg-yellow-100 text-yellow-800 rounded-xl flex items-center justify-center font-bold shrink-0">
          <Wheat className={iconSize} />
        </div>
      );
    case 'sugar':
      return (
        <div className="p-1.5 bg-blue-100 text-blue-800 rounded-xl flex items-center justify-center font-bold shrink-0">
          <span className={size === 'large' ? 'text-2xl' : 'text-base'} role="img" aria-label="Sugar">🧂</span>
        </div>
      );
    case 'kerosene':
      return (
        <div className="p-1.5 bg-orange-100 text-orange-800 rounded-xl flex items-center justify-center font-bold shrink-0">
          <Flame className={iconSize} />
        </div>
      );
    case 'oil':
      return (
        <div className="p-1.5 bg-lime-100 text-lime-800 rounded-xl flex items-center justify-center font-bold shrink-0">
          <Droplet className={iconSize} />
        </div>
      );
    default:
      return (
        <div className="p-1.5 bg-slate-100 text-slate-800 rounded-xl flex items-center justify-center shrink-0">
          <Container className={iconSize} />
        </div>
      );
  }
}
