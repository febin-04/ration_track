import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'ration_shop.db');

let db: Database.Database;

try {
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
} catch (err) {
  console.error('Failed to open SQLite database:', err);
  db = new Database(':memory:');
}

export interface Shop {
  id: string;
  fps_code: string;
  name: string;
  name_hi?: string;
  name_ml?: string;
  dealer_name: string;
  phone: string;
  address: string;
  area: string;
  area_hi?: string;
  area_ml?: string;
  pincode: string;
  lat: number;
  lng: number;
  operating_hours: string;
  pin: string;
}

export interface StockItem {
  id: string;
  shop_id: string;
  item_key: 'rice' | 'wheat' | 'sugar' | 'kerosene' | 'oil';
  item_name_en: string;
  item_name_hi: string;
  status: 'AVAILABLE' | 'LOW' | 'OUT_OF_STOCK';
  quantity_note: string;
  expected_restock_date: string | null;
  last_updated: string;
}

export interface Confirmation {
  id: string;
  shop_id: string;
  is_confirmed: number; // 1 = confirmed, 0 = mismatch
  timestamp: string;
}

export interface Feedback {
  id: string;
  shop_id: string;
  category: string;
  message: string;
  rating: number;
  timestamp: string;
}

let isInitialized = false;

// Initialize tables and seed initial data
export function initDB() {
  if (isInitialized) return;

  db.exec(`
    CREATE TABLE IF NOT EXISTS shops (
      id TEXT PRIMARY KEY,
      fps_code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      name_hi TEXT,
      name_ml TEXT,
      dealer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      area TEXT NOT NULL,
      area_hi TEXT,
      area_ml TEXT,
      pincode TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      operating_hours TEXT NOT NULL,
      pin TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS stock_items (
      id TEXT PRIMARY KEY,
      shop_id TEXT NOT NULL,
      item_key TEXT NOT NULL,
      item_name_en TEXT NOT NULL,
      item_name_hi TEXT NOT NULL,
      status TEXT NOT NULL,
      quantity_note TEXT,
      expected_restock_date TEXT,
      last_updated TEXT NOT NULL,
      FOREIGN KEY(shop_id) REFERENCES shops(id)
    );

    CREATE TABLE IF NOT EXISTS confirmations (
      id TEXT PRIMARY KEY,
      shop_id TEXT NOT NULL,
      is_confirmed INTEGER NOT NULL,
      timestamp TEXT NOT NULL,
      FOREIGN KEY(shop_id) REFERENCES shops(id)
    );

    CREATE TABLE IF NOT EXISTS feedback (
      id TEXT PRIMARY KEY,
      shop_id TEXT NOT NULL,
      category TEXT NOT NULL,
      message TEXT NOT NULL,
      rating INTEGER DEFAULT 5,
      timestamp TEXT NOT NULL,
      FOREIGN KEY(shop_id) REFERENCES shops(id)
    );
  `);

  // Check if shops table is seeded
  const shopCount = (db.prepare('SELECT COUNT(*) as count FROM shops').get() as { count: number }).count;
  if (shopCount === 0) {
    seedData();
  }

  isInitialized = true;
}

function seedData() {
  const insertShop = db.prepare(`
    INSERT OR IGNORE INTO shops (id, fps_code, name, name_hi, name_ml, dealer_name, phone, address, area, area_hi, area_ml, pincode, lat, lng, operating_hours, pin)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertStock = db.prepare(`
    INSERT OR IGNORE INTO stock_items (id, shop_id, item_key, item_name_en, item_name_hi, status, quantity_note, expected_restock_date, last_updated)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertConfirmation = db.prepare(`
    INSERT OR IGNORE INTO confirmations (id, shop_id, is_confirmed, timestamp)
    VALUES (?, ?, ?, ?)
  `);

  const insertFeedback = db.prepare(`
    INSERT OR IGNORE INTO feedback (id, shop_id, category, message, rating, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const minutesAgo = (mins: number) => new Date(Date.now() - mins * 60 * 1000).toISOString();
  const hoursAgo = (hrs: number) => new Date(Date.now() - hrs * 3600 * 1000).toISOString();
  const daysAhead = (days: number) => new Date(Date.now() + days * 86400 * 1000).toISOString().split('T')[0];

  const sampleShops = [
    {
      id: 'shop-101',
      fps_code: 'FPS-1001',
      name: 'Janata Ration FPS #1001',
      name_hi: 'जनता राशन दुकान #1001',
      name_ml: 'ജനതാ റേഷൻ കട #1001',
      dealer_name: 'Ramesh Kumar',
      phone: '+91 98765 43210',
      address: 'Shop No. 4, Block B, Main Market, Connaught Area',
      area: 'Central Zone',
      area_hi: 'सेंट्रल ज़ोन',
      area_ml: 'സെൻട്രൽ സോൺ',
      pincode: '110001',
      lat: 28.6289,
      lng: 77.2065,
      operating_hours: '08:00 AM - 06:30 PM (Closed on Mon)',
      pin: 'pin123',
      stock: [
        { key: 'rice', en: 'Boiled Rice (Standard)', hi: 'चावल (उबला हुआ)', status: 'AVAILABLE', note: '1,200 kg available', date: null, updated: minutesAgo(12) },
        { key: 'wheat', en: 'Wheat / Whole Atta', hi: 'गेहूं / आटा', status: 'AVAILABLE', note: '850 kg available', date: null, updated: minutesAgo(12) },
        { key: 'sugar', en: 'Refined Sugar', hi: 'चीनी', status: 'LOW', note: '45 kg remaining', date: daysAhead(2), updated: hoursAgo(2) },
        { key: 'kerosene', en: 'Domestic Kerosene', hi: 'केरोसिन (मिट्टी का तेल)', status: 'OUT_OF_STOCK', note: '0 Liters left', date: daysAhead(4), updated: hoursAgo(5) },
        { key: 'oil', en: 'Fortified Mustard Oil', hi: 'सरसों का तेल', status: 'AVAILABLE', note: '240 Liters available', date: null, updated: minutesAgo(45) },
      ]
    },
    {
      id: 'shop-102',
      fps_code: 'FPS-1002',
      name: 'Seva Fair Price Store #1002',
      name_hi: 'सेवा उचित मूल्य दुकान #1002',
      name_ml: 'സേവാ റേഷൻ കട #1002',
      dealer_name: 'Sunita Devi',
      phone: '+91 98112 23344',
      address: 'Plot 12, Near Government Primary School, Karol Bagh',
      area: 'West Zone',
      area_hi: 'वेस्ट ज़ोन',
      area_ml: 'വെസ്റ്റ് സോൺ',
      pincode: '110005',
      lat: 28.6514,
      lng: 77.1907,
      operating_hours: '08:30 AM - 07:00 PM (Closed on Sun)',
      pin: 'pin123',
      stock: [
        { key: 'rice', en: 'Raw Rice (Grade A)', hi: 'कच्चा चावल', status: 'LOW', note: '60 kg remaining', date: daysAhead(1), updated: minutesAgo(30) },
        { key: 'wheat', en: 'Wheat Grain', hi: 'गेहूं', status: 'AVAILABLE', note: '1,500 kg available', date: null, updated: minutesAgo(5) },
        { key: 'sugar', en: 'White Sugar', hi: 'सफेद चीनी', status: 'AVAILABLE', note: '320 kg available', date: null, updated: hoursAgo(1) },
        { key: 'kerosene', en: 'Domestic Kerosene', hi: 'केरोसिन', status: 'AVAILABLE', note: '150 Liters available', date: null, updated: hoursAgo(3) },
        { key: 'oil', en: 'Refined Sunflower Oil', hi: 'सूरजमुखी का तेल', status: 'OUT_OF_STOCK', note: '0 Packets remaining', date: daysAhead(3), updated: hoursAgo(6) },
      ]
    },
    {
      id: 'shop-103',
      fps_code: 'FPS-1003',
      name: 'PDS Welfare FPS Shop #1003',
      name_hi: 'PDS कल्याण राशन दुकान #1003',
      name_ml: 'പി.ഡി.എസ് വെൽഫെയർ റേഷൻ കട #1003',
      dealer_name: 'Anil Gupta',
      phone: '+91 97177 88990',
      address: 'Gate No. 2, Community Center, Lajpat Nagar',
      area: 'South Zone',
      area_hi: 'साउथ ज़ोन',
      area_ml: 'സൗത്ത് സോൺ',
      pincode: '110024',
      lat: 28.5677,
      lng: 77.2433,
      operating_hours: '09:00 AM - 06:00 PM (Closed on Mon)',
      pin: 'pin123',
      stock: [
        { key: 'rice', en: 'Parboiled Rice', hi: 'उबला चावल', status: 'AVAILABLE', note: '900 kg available', date: null, updated: hoursAgo(1) },
        { key: 'wheat', en: 'Whole Wheat', hi: 'गेहूं', status: 'OUT_OF_STOCK', note: 'Truck expected soon', date: daysAhead(1), updated: minutesAgo(20) },
        { key: 'sugar', en: 'Crystal Sugar', hi: 'चीनी', status: 'AVAILABLE', note: '200 kg available', date: null, updated: hoursAgo(2) },
        { key: 'kerosene', en: 'Kerosene Oil', hi: 'केरोसिन', status: 'OUT_OF_STOCK', note: 'Stock depleted', date: daysAhead(5), updated: hoursAgo(12) },
        { key: 'oil', en: 'Palm Oil', hi: 'पाम तेल', status: 'LOW', note: '15 Liters left', date: daysAhead(2), updated: minutesAgo(40) },
      ]
    },
    {
      id: 'shop-104',
      fps_code: 'FPS-1004',
      name: 'Adarsh Ration Dealer #1004',
      name_hi: 'आदर्श राशन डीलर #1004',
      name_ml: 'ആദർശ് റേഷൻ കട #1004',
      dealer_name: 'Mohd. Imran',
      phone: '+91 99554 11223',
      address: 'Behind Bus Stand, Chandni Chowk Circle',
      area: 'North Zone',
      area_hi: 'नॉर्थ ज़ोन',
      area_ml: 'നോർത്ത് സോൺ',
      pincode: '110006',
      lat: 28.6562,
      lng: 77.2301,
      operating_hours: '08:00 AM - 05:30 PM (Closed on Tue)',
      pin: 'pin123',
      stock: [
        { key: 'rice', en: 'Boiled Rice', hi: 'उबला हुआ चावल', status: 'AVAILABLE', note: '2,100 kg in stock', date: null, updated: minutesAgo(10) },
        { key: 'wheat', en: 'Wheat Grain', hi: 'गेहूं', status: 'AVAILABLE', note: '1,800 kg in stock', date: null, updated: minutesAgo(10) },
        { key: 'sugar', en: 'Refined Sugar', hi: 'चीनी', status: 'AVAILABLE', note: '500 kg in stock', date: null, updated: minutesAgo(10) },
        { key: 'kerosene', en: 'Kerosene Oil', hi: 'केरोसिन', status: 'AVAILABLE', note: '400 Liters available', date: null, updated: minutesAgo(10) },
        { key: 'oil', en: 'Mustard Oil', hi: 'सरसों तेल', status: 'AVAILABLE', note: '350 Liters available', date: null, updated: minutesAgo(10) },
      ]
    },
    {
      id: 'shop-105',
      fps_code: 'FPS-1005',
      name: 'Gramin Sahakari FPS #1005',
      name_hi: 'ग्रामीण सहकारी राशन दुकान #1005',
      name_ml: 'ഗ്രാമീൺ സഹകരണ റേഷൻ കട #1005',
      dealer_name: 'Suresh Verma',
      phone: '+91 98450 67890',
      address: 'Village Chowk, Najafgarh Main Road',
      area: 'Rural Outer Zone',
      area_hi: 'ग्रामीण बाहरी क्षेत्र',
      area_ml: 'ഗ്രാമീണ മേഖല',
      pincode: '110043',
      lat: 28.6090,
      lng: 76.9854,
      operating_hours: '07:30 AM - 05:00 PM (Closed on Mon)',
      pin: 'pin123',
      stock: [
        { key: 'rice', en: 'Coarse Rice', hi: 'मोटा चावल', status: 'OUT_OF_STOCK', note: 'Replenishment in transit', date: daysAhead(2), updated: hoursAgo(8) },
        { key: 'wheat', en: 'Wheat Grain', hi: 'गेहूं', status: 'LOW', note: '75 kg left', date: daysAhead(1), updated: minutesAgo(50) },
        { key: 'sugar', en: 'White Sugar', hi: 'चीनी', status: 'LOW', note: '20 kg remaining', date: daysAhead(3), updated: hoursAgo(4) },
        { key: 'kerosene', en: 'Kerosene Oil', hi: 'केरोसिन', status: 'OUT_OF_STOCK', note: 'Stock expected next week', date: daysAhead(6), updated: hoursAgo(24) },
        { key: 'oil', en: 'Soyabean Oil', hi: 'सोयाबीन का तेल', status: 'AVAILABLE', note: '180 Liters available', date: null, updated: hoursAgo(1) },
      ]
    },
    {
      id: 'shop-106',
      fps_code: 'FPS-1006',
      name: 'Sarvodaya FPS Centre #1006',
      name_hi: 'सर्वोदय राशन केंद्र #1006',
      name_ml: 'സർവോദയ റേഷൻ സെന്റർ #1006',
      dealer_name: 'Pooja Sharma',
      phone: '+91 96543 21098',
      address: 'Shop 18, Sector 4 Market, Rohini',
      area: 'North West Zone',
      area_hi: 'उत्तर-पश्चिम क्षेत्र',
      area_ml: 'നോർത്ത് വെസ്റ്റ് സോൺ',
      pincode: '110085',
      lat: 28.7041,
      lng: 77.1025,
      operating_hours: '08:30 AM - 06:30 PM (Closed on Sun)',
      pin: 'pin123',
      stock: [
        { key: 'rice', en: 'Standard Rice', hi: 'चावल', status: 'AVAILABLE', note: '1,100 kg in stock', date: null, updated: minutesAgo(25) },
        { key: 'wheat', en: 'Wheat Flour / Atta', hi: 'गेहूं का आटा', status: 'AVAILABLE', note: '950 kg in stock', date: null, updated: minutesAgo(25) },
        { key: 'sugar', en: 'Refined Sugar', hi: 'चीनी', status: 'OUT_OF_STOCK', note: 'Out of stock', date: daysAhead(2), updated: hoursAgo(3) },
        { key: 'kerosene', en: 'Blue Kerosene', hi: 'केरोसिन', status: 'LOW', note: '30 Liters remaining', date: daysAhead(1), updated: hoursAgo(1) },
        { key: 'oil', en: 'Fortified Oil', hi: 'तेल', status: 'AVAILABLE', note: '120 Liters in stock', date: null, updated: minutesAgo(40) },
      ]
    }
  ];

  for (const s of sampleShops) {
    insertShop.run(s.id, s.fps_code, s.name, s.name_hi, s.name_ml, s.dealer_name, s.phone, s.address, s.area, s.area_hi, s.area_ml, s.pincode, s.lat, s.lng, s.operating_hours, s.pin);

    for (const item of s.stock) {
      const stockId = `${s.id}-${item.key}`;
      insertStock.run(stockId, s.id, item.key, item.en, item.hi, item.status, item.note, item.date, item.updated);
    }

    // Add sample confirmations
    insertConfirmation.run(`${s.id}-c1`, s.id, 1, minutesAgo(45));
    insertConfirmation.run(`${s.id}-c2`, s.id, 1, minutesAgo(90));
    insertConfirmation.run(`${s.id}-c3`, s.id, 1, hoursAgo(3));

    // Add sample feedback
    insertFeedback.run(
      `${s.id}-f1`,
      s.id,
      'Stock Confirmation',
      'Visited at 11 AM today. Rice was available as indicated. Quick service by dealer.',
      5,
      hoursAgo(4)
    );
  }
}

// Ensure initDB safely called on access
initDB();

// Database Query Helpers
export function getAllShops(): (Shop & { stock: StockItem[]; confirmationsCount: { match: number; mismatch: number } })[] {
  initDB();
  const shops = db.prepare('SELECT * FROM shops').all() as Shop[];
  const getStock = db.prepare('SELECT * FROM stock_items WHERE shop_id = ?');
  const getConfirmations = db.prepare(`
    SELECT 
      SUM(CASE WHEN is_confirmed = 1 THEN 1 ELSE 0 END) as match_count,
      SUM(CASE WHEN is_confirmed = 0 THEN 1 ELSE 0 END) as mismatch_count
    FROM confirmations WHERE shop_id = ?
  `);

  return shops.map(shop => {
    const stock = getStock.all(shop.id) as StockItem[];
    const confRes = getConfirmations.get(shop.id) as { match_count: number | null; mismatch_count: number | null };
    return {
      ...shop,
      stock,
      confirmationsCount: {
        match: confRes?.match_count || 0,
        mismatch: confRes?.mismatch_count || 0
      }
    };
  });
}

export function getShopById(id: string): (Shop & { stock: StockItem[]; confirmationsCount: { match: number; mismatch: number }; feedbackList: Feedback[] }) | null {
  initDB();
  const shop = db.prepare('SELECT * FROM shops WHERE id = ? OR fps_code = ?').get(id, id) as Shop | undefined;
  if (!shop) return null;

  const stock = db.prepare('SELECT * FROM stock_items WHERE shop_id = ?').all(shop.id) as StockItem[];
  const confRes = db.prepare(`
    SELECT 
      SUM(CASE WHEN is_confirmed = 1 THEN 1 ELSE 0 END) as match_count,
      SUM(CASE WHEN is_confirmed = 0 THEN 1 ELSE 0 END) as mismatch_count
    FROM confirmations WHERE shop_id = ?
  `).get(shop.id) as { match_count: number | null; mismatch_count: number | null };

  const feedbackList = db.prepare('SELECT * FROM feedback WHERE shop_id = ? ORDER BY timestamp DESC LIMIT 20').all(shop.id) as Feedback[];

  return {
    ...shop,
    stock,
    confirmationsCount: {
      match: confRes?.match_count || 0,
      mismatch: confRes?.mismatch_count || 0
    },
    feedbackList
  };
}

export function updateStockItem(shopId: string, itemKey: string, status: 'AVAILABLE' | 'LOW' | 'OUT_OF_STOCK', quantityNote?: string, expectedRestockDate?: string | null) {
  initDB();
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    UPDATE stock_items
    SET status = ?,
        quantity_note = COALESCE(?, quantity_note),
        expected_restock_date = ?,
        last_updated = ?
    WHERE shop_id = ? AND item_key = ?
  `);
  stmt.run(status, quantityNote || null, expectedRestockDate || null, now, shopId, itemKey);
}

export function addConfirmation(shopId: string, isConfirmed: boolean) {
  initDB();
  const id = `conf-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  const now = new Date().toISOString();
  db.prepare('INSERT INTO confirmations (id, shop_id, is_confirmed, timestamp) VALUES (?, ?, ?, ?)').run(id, shopId, isConfirmed ? 1 : 0, now);
}

export function addFeedback(shopId: string, category: string, message: string, rating: number = 5) {
  initDB();
  const id = `fb-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  const now = new Date().toISOString();
  db.prepare('INSERT INTO feedback (id, shop_id, category, message, rating, timestamp) VALUES (?, ?, ?, ?, ?, ?)').run(id, shopId, category, message, rating, now);
}

export function authenticateDealer(fpsCode: string, pin: string): Shop | null {
  initDB();
  const shop = db.prepare('SELECT * FROM shops WHERE (fps_code = ? OR id = ?) AND pin = ?').get(fpsCode, fpsCode, pin) as Shop | undefined;
  return shop || null;
}
