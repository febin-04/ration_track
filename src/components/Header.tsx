'use client';

import React from 'react';
import Link from 'next/link';
import { useAccessibility } from '@/context/AccessibilityContext';
import { Store, Eye, ZoomIn, Globe, UserCheck, ShieldAlert, LogOut } from 'lucide-react';
import { Language } from '@/lib/i18n';

export default function Header({ currentDealerId }: { currentDealerId?: string | null }) {
  const { lang, setLang, highContrast, setHighContrast, largeText, setLargeText, t } = useAccessibility();

  return (
    <header className="bg-emerald-800 text-white shadow-md border-b-4 border-amber-500">
      {/* Government Banner */}
      <div className="bg-emerald-950 px-4 py-1.5 text-xs sm:text-sm text-emerald-200 flex justify-between items-center flex-wrap gap-2">
        <div className="flex items-center gap-2 font-medium">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{t.publicWelfareBanner} • SC-09 Track 3</span>
        </div>
        <div className="text-emerald-300 text-xs hidden sm:block">
          Official Fair Price Shop Inventory Transparency Portal
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Logo */}
        <Link href="/" className="flex items-center gap-3 group focus:outline-none">
          <div className="bg-amber-400 text-emerald-950 p-2.5 rounded-xl font-black text-2xl shadow-inner flex items-center justify-center shrink-0">
            <Store className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:text-amber-300 transition-colors">
              {t.appName}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 font-normal">
              {t.tagline}
            </p>
          </div>
        </Link>

        {/* Accessibility & Language Controls */}
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-2.5 w-full md:w-auto">
          {/* Language Selector */}
          <div className="flex items-center bg-emerald-900 rounded-lg p-1 border border-emerald-700">
            <Globe className="w-4 h-4 ml-2 mr-1 text-emerald-300 shrink-0" />
            <button
              onClick={() => setLang('en')}
              className={`px-2.5 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-all min-h-[44px] ${
                lang === 'en' ? 'bg-amber-400 text-emerald-950 shadow' : 'text-white hover:bg-emerald-800'
              }`}
              aria-label="English Language"
            >
              English
            </button>
            <button
              onClick={() => setLang('hi')}
              className={`px-2.5 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-all min-h-[44px] ${
                lang === 'hi' ? 'bg-amber-400 text-emerald-950 shadow' : 'text-white hover:bg-emerald-800'
              }`}
              aria-label="Hindi Language"
            >
              हिंदी
            </button>
            <button
              onClick={() => setLang('ml')}
              className={`px-2.5 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-all min-h-[44px] ${
                lang === 'ml' ? 'bg-amber-400 text-emerald-950 shadow' : 'text-white hover:bg-emerald-800'
              }`}
              aria-label="Malayalam Language"
            >
              മലയാളം
            </button>
          </div>

          {/* High Contrast Toggle */}
          <button
            onClick={() => setHighContrast(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border font-semibold text-xs sm:text-sm transition-all min-h-[44px] ${
              highContrast
                ? 'bg-yellow-400 text-black border-white font-bold ring-2 ring-yellow-300'
                : 'bg-emerald-900 text-white border-emerald-700 hover:bg-emerald-700'
            }`}
            title={t.highContrast}
            aria-pressed={highContrast}
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">{t.highContrast}</span>
          </button>

          {/* Large Text Toggle */}
          <button
            onClick={() => setLargeText(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border font-semibold text-xs sm:text-sm transition-all min-h-[44px] ${
              largeText
                ? 'bg-amber-400 text-emerald-950 border-amber-300 ring-2 ring-amber-200'
                : 'bg-emerald-900 text-white border-emerald-700 hover:bg-emerald-700'
            }`}
            title={t.largeText}
            aria-pressed={largeText}
          >
            <ZoomIn className="w-4 h-4" />
            <span className="hidden sm:inline">{t.largeText}</span>
          </button>

          {/* Dealer Login or Dashboard Link */}
          {currentDealerId ? (
            <Link
              href="/dealer/dashboard"
              className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold px-3.5 py-2 rounded-lg transition-all min-h-[44px] text-xs sm:text-sm"
            >
              <UserCheck className="w-4 h-4" />
              <span>{t.dealerDashboard}</span>
            </Link>
          ) : (
            <Link
              href="/dealer/login"
              className="flex items-center gap-1.5 bg-emerald-950 hover:bg-emerald-900 text-amber-300 border border-amber-400/50 font-semibold px-3.5 py-2 rounded-lg transition-all min-h-[44px] text-xs sm:text-sm"
            >
              <UserCheck className="w-4 h-4" />
              <span>{t.dealerLogin}</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
