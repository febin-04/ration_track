export type Language = 'en' | 'hi' | 'ml';

export interface Translations {
  appName: string;
  tagline: string;
  publicWelfareBanner: string;
  searchPlaceholder: string;
  useGPS: string;
  gpsActive: string;
  gpsError: string;
  allShops: string;
  nearestShops: string;
  filterByItem: string;
  allStockItems: string;
  rice: string;
  wheat: string;
  sugar: string;
  kerosene: string;
  oil: string;
  available: string;
  lowStock: string;
  outOfStock: string;
  viewDetails: string;
  lastUpdated: string;
  expectedRestock: string;
  dealerLogin: string;
  dealerDashboard: string;
  logout: string;
  highContrast: string;
  largeText: string;
  listenAudio: string;
  stopAudio: string;
  crowdConfirmationTitle: string;
  confirmStockMatches: string;
  reportDiscrepancy: string;
  confirmationsText: string;
  reportIssue: string;
  submitFeedback: string;
  category: string;
  comments: string;
  cancel: string;
  submit: string;
  feedbackSuccess: string;
  fpsCode: string;
  dealerName: string;
  operatingHours: string;
  address: string;
  phone: string;
  distanceKm: string;
  updateStatus: string;
  saveChanges: string;
  pinPlaceholder: string;
  loginError: string;
  recentCitizenFeedback: string;
  noShopsFound: string;
  backToList: string;
  officialInventoryTitle: string;
  officialInventorySubtitle: string;
  discrepancyCardTitle: string;
  discrepancyCardSub: string;
  verifiedByVisitors: string;
  basedOnVisitorConfirmations: string;
  thankYouVote: string;
  recentCitizenComments: string;
  noFeedbackSubmitted: string;
  tableHeaderItem: string;
  tableHeaderAvailability: string;
  tableHeaderQuantity: string;
  stockQuantityNoteLabel: string;
  expectedRestockDateLabel: string;
  accessDealerPortal: string;
  dealerPortalSub: string;
  demoCredentialsHeader: string;
  securityPinLabel: string;
  clearAllFilters: string;
  currentStockStatus: string;
  realtimeBannerBadge: string;
  bannerTitle: string;
  bannerSub: string;
  refreshBtn: string;
  loadingShops: string;
  footerTitle: string;
  footerSub: string;
  freeOpenAccess: string;
  govAuthorizedBadge: string;
}

export const getItemName = (itemKey: string, enName: string, hiName: string, lang: Language): string => {
  if (lang === 'hi') return hiName || enName;
  if (lang === 'ml') {
    switch (itemKey) {
      case 'rice': return 'അരി (പൊതു വിതരണം)';
      case 'wheat': return 'ഗോതമ്പ് / ആട്ട';
      case 'sugar': return 'പഞ്ചസാര';
      case 'kerosene': return 'മണ്ണെണ്ണ';
      case 'oil': return 'വെളിച്ചെണ്ണ / എണ്ണ';
      default: return enName;
    }
  }
  return enName;
};

export const getShopName = (shop: { name: string; name_hi?: string; name_ml?: string }, lang: Language): string => {
  if (lang === 'hi' && shop.name_hi) return shop.name_hi;
  if (lang === 'ml' && shop.name_ml) return shop.name_ml;
  return shop.name;
};

export const getShopArea = (shop: { area: string; area_hi?: string; area_ml?: string }, lang: Language): string => {
  if (lang === 'hi' && shop.area_hi) return shop.area_hi;
  if (lang === 'ml' && shop.area_ml) return shop.area_ml;
  return shop.area;
};

export const getShopAddress = (shop: { address: string; address_hi?: string; address_ml?: string }, lang: Language): string => {
  if (lang === 'hi' && shop.address_hi) return shop.address_hi;
  if (lang === 'ml' && shop.address_ml) return shop.address_ml;
  return shop.address;
};

export const translations: Record<Language, Translations> = {
  en: {
    appName: 'RationTrack',
    tagline: 'Check Fair Price Shop stock in real-time before visiting',
    publicWelfareBanner: 'National Public Distribution System (PDS) Portal',
    searchPlaceholder: 'Search shop name, FPS ID, area, or pincode...',
    useGPS: 'Find Nearest Shops (GPS)',
    gpsActive: 'Using your current location',
    gpsError: 'Unable to access location. Showing default order.',
    allShops: 'All Ration Shops',
    nearestShops: 'Nearest Ration Shops',
    filterByItem: 'Show shops with available:',
    allStockItems: 'All Items',
    rice: 'Rice',
    wheat: 'Wheat / Atta',
    sugar: 'Sugar',
    kerosene: 'Kerosene',
    oil: 'Cooking Oil',
    available: 'Available',
    lowStock: 'Low Stock',
    outOfStock: 'Out of Stock',
    viewDetails: 'View Stock & Shop Details',
    lastUpdated: 'Updated',
    expectedRestock: 'Restock expected:',
    dealerLogin: 'Dealer Login',
    dealerDashboard: 'Shop Dealer Dashboard',
    logout: 'Logout',
    highContrast: 'High Contrast Mode',
    largeText: 'Large Text Mode',
    listenAudio: 'Listen (Audio)',
    stopAudio: 'Stop Audio',
    crowdConfirmationTitle: 'Did you visit this shop recently?',
    confirmStockMatches: 'Stock Matches 👍',
    reportDiscrepancy: 'Stock Inaccurate 👎',
    confirmationsText: 'citizens verified this shop today',
    reportIssue: 'Report Issue / Complaint',
    submitFeedback: 'Submit Discrepancy or Feedback',
    category: 'Issue Type',
    comments: 'Your Message / Observation',
    cancel: 'Cancel',
    submit: 'Submit Report',
    feedbackSuccess: 'Thank you! Your feedback has been recorded.',
    fpsCode: 'FPS License ID',
    dealerName: 'Dealer',
    operatingHours: 'Hours',
    address: 'Address',
    phone: 'Phone',
    distanceKm: 'km away',
    updateStatus: 'Update Inventory Status',
    saveChanges: 'Publish Stock Update',
    pinPlaceholder: 'Enter Security PIN (e.g. pin123)',
    loginError: 'Invalid FPS Code or PIN. Please try again.',
    recentCitizenFeedback: 'Recent Citizen Reports & Feedback',
    noShopsFound: 'No ration shops match your search criteria.',
    backToList: 'Back to Shop List',
    officialInventoryTitle: 'Official Stock Inventory Status',
    officialInventorySubtitle: 'Real-time 3-State Stock indicators verified by shop dealer',
    discrepancyCardTitle: 'Discrepancy or Feedback?',
    discrepancyCardSub: 'Notice incorrect stock status, shop unexpected closure, or overcharging? File a quick feedback report.',
    verifiedByVisitors: 'Verified',
    basedOnVisitorConfirmations: 'Based on recent visitor confirmations',
    thankYouVote: 'Thank you! Your verification vote has been counted.',
    recentCitizenComments: 'Recent Citizen Comments & Observations',
    noFeedbackSubmitted: 'No citizen complaints or feedback submitted yet.',
    tableHeaderItem: 'Item',
    tableHeaderAvailability: 'Availability',
    tableHeaderQuantity: 'Quantity / Note',
    stockQuantityNoteLabel: 'Stock Quantity Note / Detail',
    expectedRestockDateLabel: 'Expected Restock Date (Optional)',
    accessDealerPortal: 'Access Dealer Portal',
    dealerPortalSub: 'Fair Price Shop (FPS) License Holder Inventory Update Portal',
    demoCredentialsHeader: 'Demo Dealer Credentials for Testing:',
    securityPinLabel: 'Security PIN',
    clearAllFilters: 'Clear all filters',
    currentStockStatus: 'Current Stock Availability',
    realtimeBannerBadge: 'Real-Time Public Stock Visibility',
    bannerTitle: 'Check Local Ration Stock Before You Visit',
    bannerSub: 'Check availability of Rice, Wheat, Sugar, Kerosene & Oil in real-time. Accessible for all citizens.',
    refreshBtn: 'Refresh',
    loadingShops: 'Loading Ration Shops...',
    footerTitle: 'Public Distribution System (PDS) Stock Transparency',
    footerSub: 'Designed for low-literacy, elderly, and low-bandwidth users.',
    freeOpenAccess: '100% Free & Open Access',
    govAuthorizedBadge: 'Government Authorized FPS',
  },
  hi: {
    appName: 'RationTrack (राशन ट्रैकर)',
    tagline: 'दुकान जाने से पहले राशन सामग्री की रीयल-टाइम उपलब्धता जांचें',
    publicWelfareBanner: 'राष्ट्रीय सार्वजनिक वितरण प्रणाली (PDS) पोर्टल',
    searchPlaceholder: 'दुकान का नाम, FPS आईडी, क्षेत्र या पिनकोड खोजें...',
    useGPS: 'निकटतम दुकानें खोजें (GPS)',
    gpsActive: 'आपके वर्तमान स्थान का उपयोग किया जा रहा है',
    gpsError: 'स्थान प्राप्त करने में असमर्थ। डिफ़ॉल्ट क्रम दिखाया जा रहा है।',
    allShops: 'सभी राशन दुकानें',
    nearestShops: 'निकटतम राशन दुकानें',
    filterByItem: 'उपलब्ध सामग्री से दुकानें छांटें:',
    allStockItems: 'सभी सामग्री',
    rice: 'चावल',
    wheat: 'गेहूं / आटा',
    sugar: 'चीनी',
    kerosene: 'केरोसिन (मिट्टी तेल)',
    oil: 'खाद्य तेल',
    available: 'उपलब्ध',
    lowStock: 'कम स्टॉक',
    outOfStock: 'समाप्त',
    viewDetails: 'स्टॉक व दुकान विवरण देखें',
    lastUpdated: 'अंतिम अपडेट',
    expectedRestock: 'पुनः उपलब्धता तिथि:',
    dealerLogin: 'डीलर लॉगिन',
    dealerDashboard: 'राशन डीलर डैशबोर्ड',
    logout: 'लॉगआउट',
    highContrast: 'हाई कॉन्ट्रास्ट मोड',
    largeText: 'बड़ा टेक्स्ट मोड',
    listenAudio: 'बोलकर सुनें (ऑडियो)',
    stopAudio: 'आवाज रोकें',
    crowdConfirmationTitle: 'क्या आपने हाल ही में इस दुकान का दौरा किया?',
    confirmStockMatches: 'स्टॉक सही है 👍',
    reportDiscrepancy: 'जानकारी गलत है 👎',
    confirmationsText: 'नागरिकों ने आज इस दुकान की पुष्टि की',
    reportIssue: 'शिकायत / फीडबैक दें',
    submitFeedback: 'असंगति या शिकायत दर्ज करें',
    category: 'शिकायत का प्रकार',
    comments: 'आपका संदेश / अनुभव',
    cancel: 'रद्द करें',
    submit: 'दर्ज करें',
    feedbackSuccess: 'धन्यवाद! आपकी प्रतिक्रिया दर्ज कर ली गई है।',
    fpsCode: 'FPS लाइसेंस आईडी',
    dealerName: 'डीलर का नाम',
    operatingHours: 'समय',
    address: 'पता',
    phone: 'फोन',
    distanceKm: 'किमी दूर',
    updateStatus: 'स्टॉक स्थिति अपडेट करें',
    saveChanges: 'अपडेट प्रकाशित करें',
    pinPlaceholder: 'सुरक्षा पिन दर्ज करें (जैसे pin123)',
    loginError: 'गलत FPS कोड या पिन। कृपया पुनः प्रयास करें।',
    recentCitizenFeedback: 'नागरिकों की हालिया शिकायतें व फीडबैक',
    noShopsFound: 'आपकी खोज से मेल खाती कोई राशन दुकान नहीं मिली।',
    backToList: 'वापस दुकान सूची पर जाएं',
    officialInventoryTitle: 'आधिकारिक स्टॉक उपलब्धता स्थिति',
    officialInventorySubtitle: 'राशन दुकान डीलर द्वारा सत्यापित रीयल-टाइम स्टॉक स्थिति',
    discrepancyCardTitle: 'असंगति या शिकायत?',
    discrepancyCardSub: 'क्या स्टॉक गलत है या दुकानबंद है? तुरंत शिकायत दर्ज करें।',
    verifiedByVisitors: 'सत्यापित',
    basedOnVisitorConfirmations: 'हालिया नागरिकों की पुष्टि के आधार पर',
    thankYouVote: 'धन्यवाद! आपका वोट दर्ज कर लिया गया है।',
    recentCitizenComments: 'नागरिकों की हालिया टिप्पणियां व अनुभव',
    noFeedbackSubmitted: 'अभी तक कोई शिकायत दर्ज नहीं की गई है।',
    tableHeaderItem: 'सामग्री',
    tableHeaderAvailability: 'उपलब्धता',
    tableHeaderQuantity: 'मात्रा / नोट',
    stockQuantityNoteLabel: 'स्टॉक मात्रा / विवरण नोट',
    expectedRestockDateLabel: 'पुनः उपलब्धता की अनुमानित तिथि (वैकल्पिक)',
    accessDealerPortal: 'डीलर पोर्टल में प्रवेश करें',
    dealerPortalSub: 'उचित मूल्य दुकान (FPS) डीलर स्टॉक अपडेट पोर्टल',
    demoCredentialsHeader: 'परीक्षण के लिए डेमो डीलर क्रेडेंशियल:',
    securityPinLabel: 'सुरक्षा पिन',
    clearAllFilters: 'सभी फ़िल्टर हटाएं',
    currentStockStatus: 'सामग्री उपलब्धता स्थिति',
    realtimeBannerBadge: 'रीयल-टाइम सार्वजनिक स्टॉक स्थिति',
    bannerTitle: 'दुकान जाने से पहले राशन सामग्री की रीयल-टाइम जांच करें',
    bannerSub: 'चावल, गेहूं, चीनी, केरोसिन और तेल की स्थिति देखें। सभी नागरिकों के लिए सुलभ।',
    refreshBtn: 'रीफ्रेश करें',
    loadingShops: 'राशन दुकानें लोड हो रही हैं...',
    footerTitle: 'सार्वजनिक वितरण प्रणाली (PDS) स्टॉक पारदर्शिता पोर्टल',
    footerSub: 'कम साक्षर, बुजुर्ग और मोबाइल उपयोगकर्ताओं के लिए सरल डिज़ाइन।',
    freeOpenAccess: '100% नि:शुल्क एवं खुला पोर्टल',
    govAuthorizedBadge: 'सरकारी अधिकृत राशन दुकान',
  },
  ml: {
    appName: 'RationTrack (റേഷൻ ട്രാക്ക്)',
    tagline: 'കട സന്ദർശിക്കുന്നതിന് മുൻപ് റേഷൻ സാധനങ്ങളുടെ ലഭ്യത തത്സമയം അറിയാം',
    publicWelfareBanner: 'ദേശീയ പൊതുവിതരണ സമ്പ്രദായം (PDS) പോർട്ടൽ',
    searchPlaceholder: 'കടയുടെ പേര്, FPS ഐഡി, സ്ഥലം തിരയുക...',
    useGPS: 'അടുത്തുള്ള കടകൾ കണ്ടെത്തുക (GPS)',
    gpsActive: 'നിലവിലെ ലൊക്കേഷൻ ഉപയോഗിക്കുന്നു',
    gpsError: 'ലൊക്കേഷൻ കണ്ടെത്താനായില്ല.',
    allShops: 'എല്ലാ റേഷൻ കടകളും',
    nearestShops: 'അടുത്തുള്ള റേഷൻ കടകൾ',
    filterByItem: 'ലഭ്യമായ സാധനങ്ങൾ അടിസ്ഥാനമാക്കി:',
    allStockItems: 'എല്ലാ സാധനങ്ങളും',
    rice: 'അരി',
    wheat: 'ഗോതമ്പ് / ആട്ട',
    sugar: 'പഞ്ചസാര',
    kerosene: 'മണ്ണെണ്ണ',
    oil: 'വെളിച്ചെണ്ണ / എണ്ണ',
    available: 'ലഭ്യം',
    lowStock: 'കുറവ്',
    outOfStock: 'തീർന്നു',
    viewDetails: 'സ്റ്റോക്ക് വിവരങ്ങൾ കാണുക',
    lastUpdated: 'അവസാനം പുതുക്കിയത്',
    expectedRestock: 'പ്രതീക്ഷിക്കുന്ന തിയ്യതി:',
    dealerLogin: 'ഡീലർ ലോഗിൻ',
    dealerDashboard: 'ഡീലർ ഡാഷ്‌ബോർഡ്',
    logout: 'ലോഗ് ഔട്ട്',
    highContrast: 'ഹൈ കോൺട്രാസ്റ്റ് മോഡ്',
    largeText: 'വലിയ അക്ഷരങ്ങൾ',
    listenAudio: 'കേൾക്കുക (ശബ്ദം)',
    stopAudio: 'ശബ്ദം നിർത്തുക',
    crowdConfirmationTitle: 'നിങ്ങൾ ഈ കട സന്ദർശിച്ചിരുന്നോ?',
    confirmStockMatches: 'സ്റ്റോക്ക് ശരിയാണ് 👍',
    reportDiscrepancy: 'വ്യത്യാസമുണ്ട് 👎',
    confirmationsText: 'ആളുകൾ ഇന്ന് സ്ഥിരീകരിച്ചു',
    reportIssue: 'പരാതി നൽകുക',
    submitFeedback: 'അഭിപ്രായം രേഖപ്പെടുത്തുക',
    category: 'വിഷയം',
    comments: 'സന്ദേശം',
    cancel: 'റദ്ദാക്കുക',
    submit: 'സമർപ്പിക്കുക',
    feedbackSuccess: 'നന്ദി! നിങ്ങളുടെ അഭിപ്രായം രേഖപ്പെടുത്തി.',
    fpsCode: 'FPS ലൈസൻസ് ഐഡി',
    dealerName: 'ഡീലർ',
    operatingHours: 'സമയം',
    address: 'വിലാസം',
    phone: 'ഫോൺ',
    distanceKm: 'കി.മീ അകലെ',
    updateStatus: 'സ്റ്റോക്ക് പുതുക്കുക',
    saveChanges: 'സേവ് ചെയ്യുക',
    pinPlaceholder: 'PIN നൽകുക (ഉദാ: pin123)',
    loginError: 'തെറ്റായ FPS കോഡ് അല്ലെങ്കിൽ PIN.',
    recentCitizenFeedback: 'ജനങ്ങളുടെ പുതിയ പരാതികളും അഭിപ്രായങ്ങളും',
    noShopsFound: 'കടകൾ ഒന്നും കണ്ടെത്തിയില്ല.',
    backToList: 'തിരികെ ലിസ്റ്റിലേക്ക്',
    officialInventoryTitle: 'ഔദ്യോഗിക റേഷൻ സ്റ്റോക്ക് വിവരങ്ങൾ',
    officialInventorySubtitle: 'റേഷൻ വ്യാപാരി സാക്ഷ്യപ്പെടുത്തിയ തത്സമയ സ്റ്റോക്ക്',
    discrepancyCardTitle: 'വ്യത്യാസങ്ങളും പരാതികളും',
    discrepancyCardSub: 'സ്റ്റോക്ക് തെറ്റാണോ കട അടച്ചിട്ടതാണോ? പരാതി നൽകുക.',
    verifiedByVisitors: 'സ്ഥിരീകരിച്ചു',
    basedOnVisitorConfirmations: 'സന്ദർശകരുടെ സ്ഥിരീകരണം അടിസ്ഥാനമാക്കി',
    thankYouVote: 'നന്ദി! നിങ്ങളുടെ വോട്ട് രേഖപ്പെടുത്തി.',
    recentCitizenComments: 'ജനങ്ങളുടെ പുതിയ അഭിപ്രായങ്ങൾ',
    noFeedbackSubmitted: 'പരാതികൾ ഒന്നും ഇതുവരെ ലഭിച്ചിട്ടില്ല.',
    tableHeaderItem: 'സാധനം',
    tableHeaderAvailability: 'ലഭ്യത',
    tableHeaderQuantity: 'അളവ് / കുറിപ്പ്',
    stockQuantityNoteLabel: 'സാധനത്തിന്റെ അളവ് / വിവരങ്ങൾ',
    expectedRestockDateLabel: 'സാധനം വരുമെന്ന് പ്രതീക്ഷിക്കുന്ന തിയ്യതി (ഐച്ഛികം)',
    accessDealerPortal: 'ഡീലർ പോർട്ടൽ തുറക്കുക',
    dealerPortalSub: 'റേഷൻ വ്യാപാരികൾക്കുള്ള സ്റ്റോക്ക് അപ്ഡേറ്റ് പോർട്ടൽ',
    demoCredentialsHeader: 'പരിശോധിക്കാൻ ഡീലർ ലോഗിൻ വിവരങ്ങൾ:',
    securityPinLabel: 'സെക്യൂരിറ്റി പിൻ',
    clearAllFilters: 'ഫിൽട്ടറുകൾ മാറ്റുക',
    currentStockStatus: 'റേഷൻ ലഭ്യത വിവരങ്ങൾ',
    realtimeBannerBadge: 'തത്സമയ റേഷൻ വിവരങ്ങൾ',
    bannerTitle: 'കട സന്ദർശിക്കുന്നതിന് മുൻപ് റേഷൻ ലഭ്യത അറിയാം',
    bannerSub: 'അരി, ഗോതമ്പ്, പഞ്ചസാര, മണ്ണെണ്ണ, വെളിച്ചെണ്ണ ലഭ്യത തത്സമയം അറിയാം.',
    refreshBtn: 'പുതുക്കുക',
    loadingShops: 'റേഷൻ കടകൾ ലോഡ് ചെയ്യുന്നു...',
    footerTitle: 'പൊതുവിതരണ സമ്പ്രദായം (PDS) സ്റ്റോക്ക് വിവരങ്ങൾ',
    footerSub: 'മുതിർന്നവർക്കും എല്ലാവർക്കും എളുപ്പത്തിൽ ഉപയോഗിക്കാം.',
    freeOpenAccess: '100% സൗജന്യ ജനസേവനം',
    govAuthorizedBadge: 'അംഗീകൃത റേഷൻ കട',
  }
};
