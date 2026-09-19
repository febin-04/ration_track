'use client';

import React, { useState, useEffect } from 'react';
import { Store, Sparkles, Loader2 } from 'lucide-react';
import { useAccessibility } from '@/context/AccessibilityContext';

export default function Preloader() {
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const { lang } = useAccessibility();

  useEffect(() => {
    // Show preloader on initial page mount and hide smoothly after 600ms
    const timer1 = setTimeout(() => {
      setFadeOut(true);
    }, 600);

    const timer2 = setTimeout(() => {
      setLoading(false);
    }, 1100);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  if (!loading) return null;

  const loadingText =
    lang === 'hi'
      ? 'राशन ट्रैकर लोड हो रहा है...'
      : lang === 'ml'
      ? 'റേഷൻ ട്രാക്ക് വിവരങ്ങൾ ലോഡ് ചെയ്യുന്നു...'
      : 'Loading RationTrack Portal...';

  const subtitleText =
    lang === 'hi'
      ? 'सार्वजनिक वितरण प्रणाली (PDS) रीयल-टाइम स्टॉक स्थिति'
      : lang === 'ml'
      ? 'ദേശീയ പൊതുവിതരണ സമ്പ്രദായം (PDS) തത്സമയ സ്റ്റോക്ക് വിവരങ്ങൾ'
      : 'National Public Distribution System (PDS) Real-Time Portal';

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-emerald-950 text-white transition-opacity duration-500 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="relative flex flex-col items-center gap-6 p-6 text-center max-w-md mx-auto">
        {/* Animated Logo Container */}
        <div className="relative">
          {/* Glowing pulsing background ring */}
          <div className="absolute -inset-4 bg-gradient-to-r from-amber-400 to-emerald-400 rounded-3xl blur-lg opacity-40 animate-pulse" />
          
          <div className="relative bg-amber-400 text-emerald-950 p-5 rounded-3xl shadow-2xl flex items-center justify-center">
            <Store className="w-14 h-14 animate-bounce" />
          </div>
        </div>

        {/* Brand Name */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-emerald-900/80 border border-emerald-700/80 text-amber-300 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PDS Welfare Portal</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Ration<span className="text-amber-400">Track</span>
          </h1>

          <p className="text-xs sm:text-sm text-emerald-200/90 font-medium max-w-xs">
            {subtitleText}
          </p>
        </div>

        {/* Loading Spinner & Status Text */}
        <div className="flex items-center gap-3 bg-emerald-900/60 px-5 py-2.5 rounded-full border border-emerald-800 shadow-inner">
          <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
          <span className="text-xs sm:text-sm font-bold text-amber-100">{loadingText}</span>
        </div>

        {/* Bottom Decorative Loading Bar */}
        <div className="w-48 h-1.5 bg-emerald-900 rounded-full overflow-hidden mt-2">
          <div className="h-full bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}
