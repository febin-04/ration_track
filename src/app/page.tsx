'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ShopCard from '@/components/ShopCard';
import { Shop, StockItem } from '@/lib/db';
import { useAccessibility } from '@/context/AccessibilityContext';
import { calculateDistance } from '@/lib/utils';
import { Search, MapPin, Filter, Volume2, Sparkles, RefreshCw, CheckCircle2, X, Building2 } from 'lucide-react';
import { StockItemIcon } from '@/components/StockStatusBadge';
import { getShopName, getShopArea } from '@/lib/i18n';

export default function CitizenHomePage() {
  const { lang, t, speakText, isSpeaking, stopTextToSpeech } = useAccessibility();

  const [shops, setShops] = useState<(Shop & { stock: StockItem[]; confirmationsCount: { match: number; mismatch: number } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemFilter, setSelectedItemFilter] = useState<string>('all');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const userLocationRef = React.useRef<{ lat: number; lng: number } | null>(null);
  const [detectedCity, setDetectedCity] = useState<string>('');

  const updateUserLocation = (loc: { lat: number; lng: number } | null) => {
    userLocationRef.current = loc;
    setUserLocation(loc);
  };

  useEffect(() => {
    // Initial fetch on mount
    fetchGPSShops();

    // Silent background stock poll every 10s
    const interval = setInterval(() => {
      fetchGPSShopsSilent();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Instant Pincode Auto-Search when user types 6 digits (e.g. 682001, 685586, 695001, 680001)
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (/^\d{6}$/.test(trimmed)) {
      executeLocationQuery(trimmed);
    }
  }, [searchQuery]);

  const fetchGPSShopsSilent = async () => {
    const currentLoc = userLocationRef.current;
    let url = '/api/gps-shops';
    if (currentLoc) {
      url += `?lat=${currentLoc.lat}&lng=${currentLoc.lng}`;
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

  const fetchGPSShops = async () => {
    setLoading(true);

    try {
      const res = await fetch('/api/gps-shops?autoIp=true', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.shops) {
        setShops(data.shops);
        if (data.userLocation) {
          updateUserLocation(data.userLocation);
        }
        const cityLabel = data.placeNameEn ? `${data.placeNameEn}` : 'Your Region';
        setDetectedCity(cityLabel);
      }
    } catch (err) {
      console.error('Failed to fetch shops:', err);
    } finally {
      setLoading(false);
    }
  };

  const executeLocationQuery = async (query: string) => {
    setLoading(true);

    try {
      const res = await fetch(`/api/gps-shops?q=${encodeURIComponent(query)}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.shops) {
        setShops(data.shops);
        if (data.userLocation) {
          updateUserLocation(data.userLocation);
        }
        setDetectedCity(data.placeNameEn || query);
      }
    } catch (err) {
      console.error('Failed to search location:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    executeLocationQuery(searchQuery.trim());
  };

  const handlePincodeChipClick = (pincode: string) => {
    setSearchQuery(pincode);
    executeLocationQuery(pincode);
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
      // 1. Text Search Filter (If user typed shop name, area, or ID)
      const query = searchQuery.toLowerCase().trim();
      const sName = getShopName(shop, lang).toLowerCase();
      const sArea = getShopArea(shop, lang).toLowerCase();
      const matchesSearch =
        !query ||
        /^\d{6}$/.test(query) || // If 6-digit pincode, all GPS-resolved shops match
        sName.includes(query) ||
        sArea.includes(query) ||
        shop.name.toLowerCase().includes(query) ||
        shop.fps_code.toLowerCase().includes(query) ||
        shop.area.toLowerCase().includes(query) ||
        shop.pincode.includes(query) ||
        shop.address.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      // 2. Item Availability Filter
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
        ? `राशन दुकान पोर्टल। आपके क्षेत्र में ${availableCount} राशन दुकानें पाई गईं। आप चावल, गेहूं, चीनी, केरोसिन और तेल की स्थिति देख सकते हैं।`
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

        {/* Pincode & Location Search Bar */}
        <section className="bg-white p-5 rounded-3xl border-2 border-slate-200 shadow-sm flex flex-col gap-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            {/* Main Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter 6-digit Pincode (e.g. 682001, 685586, 695001) or Area / Shop name..."
                className="w-full pl-12 pr-10 py-3.5 rounded-2xl border-2 border-slate-300 focus:border-emerald-600 text-slate-900 font-bold placeholder:text-slate-400 text-sm sm:text-base min-h-[52px]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    fetchGPSShops();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="min-h-[52px] px-7 py-3.5 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white font-extrabold rounded-2xl transition-all flex items-center justify-center gap-2.5 shadow-md border-2 border-emerald-900 shrink-0 text-sm sm:text-base"
            >
              <Search className="w-5 h-5 text-amber-400" />
              <span>Search Shops</span>
            </button>
          </form>

          {/* Quick Pincode Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-black text-slate-500 flex items-center gap-1 shrink-0 uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span>Quick Pincode Select:</span>
            </span>
            {[
              { code: '685586', label: '685586 (Idukki)' },
              { code: '682001', label: '682001 (Kochi)' },
              { code: '695001', label: '695001 (Trivandrum)' },
              { code: '680001', label: '680001 (Thrissur)' },
              { code: '691001', label: '691001 (Kollam)' },
              { code: '686001', label: '686001 (Kottayam)' },
              { code: '110001', label: '110001 (Delhi)' },
            ].map((pin) => (
              <button
                key={pin.code}
                type="button"
                onClick={() => handlePincodeChipClick(pin.code)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border-2 flex items-center gap-1 min-h-[38px] ${
                  searchQuery.trim() === pin.code
                    ? 'bg-amber-400 text-emerald-950 border-amber-500 shadow-sm ring-2 ring-amber-300'
                    : 'bg-slate-100 hover:bg-emerald-50 text-slate-800 border-slate-200 hover:border-emerald-300'
                }`}
              >
                <span>📍</span>
                <span>{pin.label}</span>
              </button>
            ))}
          </div>

          {/* Active Area Banner */}
          {detectedCity && (
            <div className="bg-emerald-50 text-emerald-950 p-3.5 rounded-2xl border-2 border-emerald-300 text-xs sm:text-sm font-extrabold flex items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  📍 {lang === 'hi' ? `सक्रिय क्षेत्र / पिनकोड: ${detectedCity}` : lang === 'ml' ? `തിരഞ്ഞെടുത്ത പ്രദേശം / പിൻകോഡ്: ${detectedCity}` : `Showing Ration Shops near Pincode / Area: ${detectedCity}`}
                </span>
              </div>
              <span className="bg-emerald-200 text-emerald-950 px-3 py-1 rounded-lg text-xs font-black shrink-0">
                Pincode Filtered
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
              onClick={fetchGPSShops}
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
                  fetchGPSShops();
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
