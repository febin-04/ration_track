'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useAccessibility } from '@/context/AccessibilityContext';
import { UserCheck, KeyRound, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';

export default function DealerLoginPage() {
  const { t } = useAccessibility();
  const router = useRouter();

  const [fpsCode, setFpsCode] = useState('FPS-1001');
  const [pin, setPin] = useState('pin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/dealer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fpsCode: fpsCode.trim(), pin: pin.trim() }),
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem('ration_dealer_shop', JSON.stringify(data.shop));
        router.push('/dealer/dashboard');
      } else {
        setError(data.message || t.loginError);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (code: string) => {
    setFpsCode(code);
    setPin('pin123');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="max-w-md mx-auto px-4 py-12 w-full flex-1 flex flex-col justify-center gap-6">
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-md flex flex-col gap-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-amber-400 text-emerald-950 rounded-2xl mx-auto flex items-center justify-center font-black shadow-inner">
              <UserCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-slate-900">{t.dealerLogin}</h1>
            <p className="text-xs sm:text-sm text-slate-600">
              {t.dealerPortalSub}
            </p>
          </div>

          {/* Demo Credentials Quick Fill Banner */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-black text-amber-900">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>{t.demoCredentialsHeader}</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {['FPS-1001', 'FPS-1002', 'FPS-1003', 'FPS-1004'].map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => handleQuickFill(code)}
                  className="px-2.5 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-950 font-extrabold rounded-lg border border-amber-400 min-h-[36px]"
                >
                  {code} / pin123
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-rose-50 text-rose-800 p-3.5 rounded-xl border border-rose-300 text-xs sm:text-sm font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                {t.fpsCode}
              </label>
              <input
                type="text"
                value={fpsCode}
                onChange={(e) => setFpsCode(e.target.value)}
                placeholder="e.g. FPS-1001"
                required
                className="w-full p-3.5 rounded-xl border-2 border-slate-300 font-bold text-slate-900 text-sm focus:border-emerald-600 min-h-[48px]"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                {t.securityPinLabel}
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder={t.pinPlaceholder}
                  required
                  className="w-full p-3.5 pr-10 rounded-xl border-2 border-slate-300 font-bold text-slate-900 text-sm focus:border-emerald-600 min-h-[48px]"
                />
                <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[50px] px-6 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 text-base shadow-sm mt-2"
            >
              <span>{loading ? '...' : t.accessDealerPortal}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
