'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ShopCard from '@/components/ShopCard';
import { Shop, StockItem } from '@/lib/db';
import { useAccessibility } from '@/context/AccessibilityContext';
import { calculateDistance } from '@/lib/utils';
import { Search, MapPin, Filter, Volume2, Sparkles, RefreshCw, CheckCircle2, Navigation, Send, AlertTriangle } from 'lucide-react';
import { StockItemIcon } from '@/components/StockStatusBadge';
import { getShopName, getShopArea } from '@/lib/i18n';

export default function CitizenHomePage() {
  const { lang, t, speakText, isSpeaking, stopTextToSpeech } = useAccessibility();

  const [shops, setShops] = useState<(Shop & { stock: StockItem[]; confirmationsCount: { match: number; mismatch: number } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemFilter, setSelectedItemFilter] = useState<string>('all');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'locating' | 'active' | 'error'>('idle');
  const [detectedCity, setDetectedCity] = useState<string>('');
  const [customLocationInput, setCustomLocationInput] = useState<string>('');
  const [locationNotice, setLocationNotice] = useState<string>('');

  useEffect(() => {
    // Initial fetch using server IP location or default
    fetchGPSShops();

    // Live auto-polling every 5s so dealer stock updates reflect live to customers
    const interval = setInterval(() => {
      fetchGPSShopsSilent();
    }, 5000);

    return () => clearInterval(interval);
  }, [userLocation]);

  const fetchGPSShopsSilent = async () => {
    let url = '/api/gps-shops';
    if (userLocation) {
      url += `?lat=${userLocation.lat}&lng=${userLocation.lng}`;
    } else {
      url += `?autoIp=true`;
    }

    try {
      const res = await fetch(url, { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.shops) {
        setShops(data.shops);
      }
    } catch (err) {
      // silent fail
    }
  };

  const fetchShops = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/shops', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setShops(data.shops);
      }
    } catch (err) {
      console.error('Failed to fetch shops:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleHighAccuracyGPS = () => {
    setLocationStatus('locating');
    setLocationNotice('');

    let hasResponded = false;

    // Fast 2.5s fallback timer in case Windows desktop GPS hangs
    const fallbackTimer = setTimeout(() => {
      if (!hasResponded) {
        hasResponded = true;
        console.warn('Browser GPS took longer than 2.5s, using network location...');
        fetchGPSShops();
      }
    }, 2500);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (hasResponded) return;
          hasResponded = true;
          clearTimeout(fallbackTimer);
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          fetchGPSShops(lat, lng);
        },
        (error) => {
          if (hasResponded) return;
          hasResponded = true;
          clearTimeout(fallbackTimer);
          console.warn('System GPS permission error/fallback:', error.message);
          setLocationNotice(lang === 'hi' ? 'ब्राउज़र लोकेशन एक्सेस बंद है। नीचे अपना शहर या पिनकोड दर्ज करें।' : lang === 'ml' ? 'ബ്രൗസർ ലൊക്കേഷൻ ആക്സസ് തടസ്സപ്പെട്ടു. ദയവായി താഴെ സ്ഥലം ടൈപ്പ് ചെയ്യുക.' : 'Browser GPS location permission blocked. Please type your city or pincode below.');
          fetchGPSShops();
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    } else {
      clearTimeout(fallbackTimer);
      fetchGPSShops();
    }
  };

  const fetchGPSShops = async (lat?: number | null, lng?: number | null) => {
    setLoading(true);
    setLocationStatus('locating');

    let url = '/api/gps-shops';
    if (lat !== undefined && lat !== null && lng !== undefined && lng !== null) {
      url += `?lat=${lat}&lng=${lng}`;
    } else {
      url += `?autoIp=true`;
    }

    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.shops) {
        setShops(data.shops);
        if (data.userLocation) {
          setUserLocation(data.userLocation);
        }
        const cityLabel = data.placeName ? `${data.placeName}${data.placeDistrict ? ', ' + data.placeDistrict : ''}` : 'Your Area';
        setDetectedCity(cityLabel);
        setLocationStatus('active');
      }
    } catch (err) {
      console.error('Failed to fetch GPS shops:', err);
      setLocationStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomLocationSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customLocationInput.trim()) return;

    setLoading(true);
    setLocationStatus('locating');
    setLocationNotice('');

    try {
      const res = await fetch(`/api/gps-shops?q=${encodeURIComponent(customLocationInput.trim())}`);
      const data = await res.json();
      if (data.success && data.shops) {
        setShops(data.shops);
        if (data.userLocation) {
          setUserLocation(data.userLocation);
        }
        setDetectedCity(data.placeName || customLocationInput.trim());
        setLocationStatus('active');
      }
    } catch (err) {
      console.error('Failed to search custom location:', err);
    } finally {
      setLoading(false);
    }
  };

  // Process shop list with calculated distances
  const processedShops = shops.map((shop) => {
    const dist = userLocation
      ? calculateDistance(userLocation.lat, userLocation.lng, shop.lat, shop.lng)
      : null;
    return { shop, dist };
  });

  // Filter & sort by distance
  const filteredAndSortedShops = processedShops
    .filter(({ shop }) => {
      // 1. Text Search Filter
      const query = searchQuery.toLowerCase().trim();
      const sName = getShopName(shop, lang).toLowerCase();
      const sArea = getShopArea(shop, lang).toLowerCase();
      const matchesSearch =
        !query ||
        sName.includes(query) ||
        sArea.includes(query) ||
        shop.name.toLowerCase().includes(query) ||
        shop.fps_code.toLowerCase().includes(query) ||
        shop.area.toLowerCase().includes(query) ||
        shop.pincode.includes(query) ||
        shop.address.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      // 2. Item Availability Filter ("Show me shops near me that have [item] in stock")
      if (selectedItemFilter !== 'all') {
        const targetStock = shop.stock.find((st) => st.item_key === selectedItemFilter);
        if (!targetStock || targetStock.status === 'OUT_OF_STOCK') {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      if (a.dist !== null && b.dist !== null) {
        return a.dist - b.dist; // Sort by nearest distance
      }
      return 0;
    });

  const handleReadSummary = () => {
    if (isSpeaking) {
      stopTextToSpeech();
      return;
    }

    const availableCount = filteredAndSortedShops.length;
    const textToRead =
      lang === 'hi'
        ? `राशन दुकान पोर्टल। आपके क्षेत्र में ${availableCount} राशन दुकानें पाई गईं। स्थान के आधार पर निकटतम दुकानें देखने के लिए जीपीएस बटन दबाएं।`
        : lang === 'ml'
        ? `റേഷൻ കട പോർട്ടൽ. ${availableCount} റേഷൻ കടകൾ ലഭ്യമാണ്. അരി, ഗോതമ്പ്, പഞ്ചസാര, മണ്ണെണ്ണ, എണ്ണ ലഭ്യത ഇവിടെ പരിശോധിക്കാം.`
        : `Ration Shop Portal. ${availableCount} shops found near your search criteria. You can check stock status for rice, wheat, sugar, kerosene, and oil.`;

    speakText(textToRead);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6 w-full flex-1 flex flex-col gap-6">
        {/* Banner Section */}
        <section className="bg-gradient-to-r from-emerald-900 to-emerald-800 text-white p-5 sm:p-7 rounded-3xl shadow-md border-b-4 border-amber-400 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-amber-400 text-emerald-950 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.realtimeBannerBadge}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {t.bannerTitle}
            </h2>
            <p className="text-emerald-100 text-xs sm:text-base">
              {t.bannerSub}
            </p>
          </div>

          <button
            onClick={handleReadSummary}
            className={`min-h-[48px] px-5 py-3 rounded-2xl font-black text-sm sm:text-base transition-all flex items-center justify-center gap-2 shadow-lg ${
              isSpeaking
                ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse'
                : 'bg-amber-400 hover:bg-amber-300 text-emerald-950 border-2 border-amber-300'
            }`}
          >
            <Volume2 className="w-5 h-5" />
            <span>{isSpeaking ? t.stopAudio : t.listenAudio}</span>
          </button>
        </section>

        {/* GPS Search & Location Input Bar */}
        <section className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-slate-200 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Shop Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-slate-300 focus:border-emerald-600 text-slate-900 placeholder:text-slate-400 text-sm sm:text-base min-h-[50px]"
              />
            </div>

            {/* High-Accuracy GPS Button */}
            <button
              onClick={handleHighAccuracyGPS}
              disabled={locationStatus === 'locating'}
              className={`min-h-[50px] px-6 py-3.5 rounded-xl font-extrabold text-sm sm:text-base transition-all flex items-center justify-center gap-2.5 shadow-md border-2 shrink-0 ${
                locationStatus === 'active'
                  ? 'bg-amber-400 text-emerald-950 border-amber-500 ring-2 ring-amber-300'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-800'
              }`}
            >
              <Navigation className={`w-5 h-5 ${locationStatus === 'locating' ? 'animate-spin' : ''}`} />
              <span>
                {locationStatus === 'locating'
                  ? 'Detecting GPS Location...'
                  : locationStatus === 'active'
                  ? t.gpsActive
                  : t.useGPS}
              </span>
            </button>
          </div>

          {/* Manual Area / City / Pincode Search Bar */}
          <form onSubmit={handleCustomLocationSearch} className="flex flex-col sm:flex-row items-center gap-2.5 pt-2 border-t border-slate-100">
            <span className="text-xs font-black text-slate-500 flex items-center gap-1 shrink-0">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span>{lang === 'hi' ? 'स्थान / पिनकोड दर्ज करें:' : lang === 'ml' ? 'സ്ഥലം / പിൻകോഡ് നൽകുക:' : 'Enter City or Pincode:'}</span>
            </span>
            <div className="flex-1 w-full flex items-center gap-2">
              <input
                type="text"
                value={customLocationInput}
                onChange={(e) => setCustomLocationInput(e.target.value)}
                placeholder="e.g. Kollam, Thrissur, Pathanamthitta, 682001..."
                className="flex-1 px-3.5 py-2 rounded-lg border-2 border-slate-300 font-bold text-slate-900 text-xs sm:text-sm focus:border-emerald-600 min-h-[42px]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold rounded-lg text-xs sm:text-sm min-h-[42px] flex items-center gap-1.5 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Locate Area</span>
              </button>
            </div>
          </form>

          {locationNotice && (
            <div className="bg-amber-50 text-amber-900 p-3 rounded-xl border border-amber-300 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{locationNotice}</span>
            </div>
          )}

          {/* GPS Active Notification Banner */}
          {userLocation && (
            <div className="bg-emerald-50 text-emerald-950 p-3.5 rounded-xl border-2 border-emerald-300 text-xs sm:text-sm font-extrabold flex items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-700 shrink-0 animate-bounce" />
                <span>
                  {lang === 'hi'
                    ? `📍 सक्रिय स्थान: ${detectedCity} (Lat: ${userLocation.lat.toFixed(4)}, Lng: ${userLocation.lng.toFixed(4)})`
                    : lang === 'ml'
                    ? `📍 കണ്ടെത്തിയ സ്ഥലം: ${detectedCity} (ലൊക്കേഷൻ: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)})`
                    : `📍 Active Location: Fair Price Shops near ${detectedCity} (${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)})`}
                </span>
              </div>
              <span className="bg-emerald-200 text-emerald-900 px-2.5 py-1 rounded text-xs font-black">
                Proximity Sorted
              </span>
            </div>
          )}
        </section>

        {/* Item Stock Filter Pills ("Show me shops near me that have [item] in stock") */}
        <section className="bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase text-slate-500 tracking-wider">
            <Filter className="w-4 h-4 text-emerald-700" />
            <span>{t.filterByItem}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedItemFilter('all')}
              className={`px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all min-h-[44px] flex items-center gap-2 border-2 ${
                selectedItemFilter === 'all'
                  ? 'bg-emerald-800 text-white border-emerald-900 shadow-inner'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <span>{t.allStockItems}</span>
            </button>

            {[
              { key: 'rice', label: t.rice },
              { key: 'wheat', label: t.wheat },
              { key: 'sugar', label: t.sugar },
              { key: 'kerosene', label: t.kerosene },
              { key: 'oil', label: t.oil },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setSelectedItemFilter(item.key)}
                className={`px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all min-h-[44px] flex items-center gap-2 border-2 ${
                  selectedItemFilter === item.key
                    ? 'bg-amber-400 text-emerald-950 border-amber-500 shadow-md ring-2 ring-amber-300'
                    : 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200'
                }`}
              >
                <StockItemIcon itemKey={item.key} size="normal" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Shop Directory List View */}
        <section className="flex flex-col gap-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <span>{userLocation ? t.nearestShops : t.allShops}</span>
              <span className="bg-emerald-100 text-emerald-900 text-xs font-black px-2.5 py-0.5 rounded-full border border-emerald-300">
                {filteredAndSortedShops.length}
              </span>
            </h2>

            <button
              onClick={fetchShops}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 min-h-[38px]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t.refreshBtn}</span>
            </button>
          </div>

          {loading ? (
            <div className="bg-white p-12 rounded-2xl border-2 border-slate-200 text-center flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-emerald-700 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-600 font-bold">{t.loadingShops}</p>
            </div>
          ) : filteredAndSortedShops.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border-2 border-slate-200 text-center flex flex-col items-center gap-3">
              <span className="text-4xl">🔍</span>
              <p className="text-slate-800 font-bold text-base sm:text-lg">{t.noShopsFound}</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedItemFilter('all');
                }}
                className="mt-2 text-sm font-bold text-emerald-800 hover:underline"
              >
                {t.clearAllFilters}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAndSortedShops.map(({ shop, dist }) => (
                <ShopCard key={shop.id} shop={shop} userDistance={dist} />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 mt-12 py-8 border-t-4 border-amber-400 text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div>
            <p className="font-bold text-white text-base">{t.footerTitle}</p>
            <p className="text-slate-400 mt-0.5">{t.footerSub}</p>
          </div>
          <div className="flex items-center gap-4 font-semibold">
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> {t.freeOpenAccess}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
