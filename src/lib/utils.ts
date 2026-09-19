import { Language } from './i18n';

// Calculate distance in kilometers using the Haversine formula
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Round to 1 decimal place
}

export function formatTimeAgo(isoString: string, lang: Language = 'en'): string {
  if (!isoString) return lang === 'hi' ? 'ज्ञात नहीं' : lang === 'ml' ? 'അറിയില്ല' : 'Unknown';

  const date = new Date(isoString);
  const now = new Date();
  const diffInMins = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMins < 1) {
    return lang === 'hi' ? 'अभी-अभी' : lang === 'ml' ? 'ഇപ്പോൾ' : 'Just now';
  }
  if (diffInMins < 60) {
    return lang === 'hi'
      ? `${diffInMins} मिनट पहले`
      : lang === 'ml'
      ? `${diffInMins} മിനിറ്റ് മുൻപ്`
      : `${diffInMins} mins ago`;
  }

  const diffInHours = Math.floor(diffInMins / 60);
  if (diffInHours < 24) {
    return lang === 'hi'
      ? `${diffInHours} घंटे पहले`
      : lang === 'ml'
      ? `${diffInHours} മണിക്കൂർ മുൻപ്`
      : `${diffInHours} hours ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  return lang === 'hi'
    ? `${diffInDays} दिन पहले`
    : lang === 'ml'
    ? `${diffInDays} ദിവസം മുൻപ്`
    : `${diffInDays} days ago`;
}

export function formatRestockDate(dateStr: string | null, lang: Language = 'en'): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    const locale = lang === 'hi' ? 'hi-IN' : lang === 'ml' ? 'ml-IN' : 'en-IN';
    const formatted = d.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    return lang === 'hi'
      ? `अनुमानित पुनः उपलब्धता: ${formatted}`
      : lang === 'ml'
      ? `പ്രതീക്ഷിക്കുന്ന തിയ്യതി: ${formatted}`
      : `Restock expected: ${formatted}`;
  } catch {
    return dateStr;
  }
}
