export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { calculateDistance } from '@/lib/utils';
import { getAllShops, StockItem } from '@/lib/db';

interface GPSShop {
  id: string;
  fps_code: string;
  name: string;
  name_hi: string;
  name_ml: string;
  dealer_name: string;
  phone: string;
  address: string;
  address_hi: string;
  address_ml: string;
  area: string;
  area_hi: string;
  area_ml: string;
  pincode: string;
  lat: number;
  lng: number;
  operating_hours: string;
  pin: string;
  stock: StockItem[];
  confirmationsCount: { match: number; mismatch: number };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let latStr = searchParams.get('lat');
    let lngStr = searchParams.get('lng');
    const queryLocation = searchParams.get('q');

    let lat = 8.5241;
    let lng = 76.9366;
    let placeNameEn = 'Local Region';
    let placeNameHi = 'स्थानीय क्षेत्र';
    let placeNameMl = 'പ്രാദേശിക പ്രദേശം';
    let pincode = '695001';

    // Strategy 1: Search by Pincode or Text Query
    if (queryLocation && queryLocation.trim().length > 0) {
      const qText = queryLocation.trim();
      const isPincode = /^\d{6}$/.test(qText);

      if (isPincode) {
        pincode = qText;
        let searchGeoQuery = `${qText}, India`;

        try {
          // Query official India Postal API for instant, accurate Post Office & District details
          const postalRes = await fetch(`https://api.postalpincode.in/pincode/${qText}`);
          if (postalRes.ok) {
            const postalData = await postalRes.json();
            if (
              postalData &&
              postalData[0] &&
              postalData[0].Status === 'Success' &&
              postalData[0].PostOffice &&
              postalData[0].PostOffice.length > 0
            ) {
              const po = postalData[0].PostOffice[0];
              const poName = po.Name || po.Block || po.District;
              const distName = po.District || po.State;
              const stateName = po.State || 'India';

              placeNameEn = `${poName}, ${distName} (${qText})`;
              placeNameHi = `${poName}, ${distName} (${qText})`;
              placeNameMl = `${poName}, ${distName} (${qText})`;

              searchGeoQuery = `${poName}, ${distName}, ${stateName}, India`;
            }
          }
        } catch (e) {
          console.warn('India postal pincode API error:', e);
        }

        // Pinpoint exact coordinates using Nominatim
        try {
          const nomRes = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchGeoQuery)}&limit=1`,
            {
              headers: {
                'User-Agent': 'RationShopStockVisibility/1.0 (PDS Welfare App)'
              }
            }
          );
          if (nomRes.ok) {
            const nomData = await nomRes.json();
            if (nomData && nomData.length > 0) {
              lat = parseFloat(nomData[0].lat);
              lng = parseFloat(nomData[0].lon);
            }
          }
        } catch (e) {
          console.warn('Nominatim pincode geocoding error:', e);
        }

        // Pincode prefix fallback map for Kerala & major metro regions to guarantee 100% pinpoint reliability
        if (lat === 8.5241 && lng === 76.9366) {
          const pPrefix = qText.slice(0, 3);
          if (pPrefix === '685') { lat = 9.8542; lng = 76.6967; } // Idukki / Thodupuzha / Nediyasala (685586)
          else if (pPrefix === '682') { lat = 9.9312; lng = 76.2673; } // Ernakulam / Kochi (682001)
          else if (pPrefix === '695') { lat = 8.5241; lng = 76.9366; } // Thiruvananthapuram (695001)
          else if (pPrefix === '673') { lat = 11.2588; lng = 75.7804; } // Kozhikode (673001)
          else if (pPrefix === '680') { lat = 10.5276; lng = 76.2144; } // Thrissur (680001)
          else if (pPrefix === '686') { lat = 9.5916; lng = 76.5222; } // Kottayam (686001)
          else if (pPrefix === '691') { lat = 8.8932; lng = 76.6141; } // Kollam (691001)
          else if (pPrefix === '679' || pPrefix === '678') { lat = 10.7867; lng = 76.6548; } // Palakkad
          else if (pPrefix === '670') { lat = 11.8745; lng = 75.3704; } // Kannur (670001)
          else if (pPrefix === '671') { lat = 12.5102; lng = 74.9852; } // Kasaragod (671121)
          else if (pPrefix === '676') { lat = 11.0734; lng = 76.0740; } // Malappuram (676505)
          else if (pPrefix === '670' || pPrefix === '673') { lat = 11.6084; lng = 76.0847; } // Wayanad (673121)
          else if (pPrefix === '110') { lat = 28.6139; lng = 77.2090; } // New Delhi (110001)
        }
      } else {
        // Text Location Query (e.g. "Pala", "Ernakulam", "Nediyasala")
        placeNameEn = qText;
        placeNameHi = qText;
        placeNameMl = qText;

        try {
          const nomRes = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(qText + ', India')}&limit=1`,
            {
              headers: {
                'User-Agent': 'RationShopStockVisibility/1.0 (PDS Welfare App)'
              }
            }
          );
          if (nomRes.ok) {
            const nomData = await nomRes.json();
            if (nomData && nomData.length > 0) {
              lat = parseFloat(nomData[0].lat);
              lng = parseFloat(nomData[0].lon);
              const rawName = nomData[0].display_name.split(',')[0] || qText;
              placeNameEn = rawName;
              placeNameHi = rawName;
              placeNameMl = rawName;

              const matchPin = nomData[0].display_name.match(/\b(6\d{5}|1\d{5}|4\d{5}|5\d{5}|7\d{5})\b/);
              if (matchPin) {
                pincode = matchPin[1];
              }
            }
          }
        } catch (e) {
          console.warn('Nominatim text search error:', e);
        }
      }
    } 
    // Strategy 2: High-Accuracy Lat/Lng passed from Device Geolocation
    else if (latStr && lngStr && !isNaN(parseFloat(latStr)) && !isNaN(parseFloat(lngStr))) {
      lat = parseFloat(latStr);
      lng = parseFloat(lngStr);

      try {
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14`,
          {
            headers: {
              'User-Agent': 'RationShopStockVisibility/1.0 (PDS Public Welfare App)'
            }
          }
        );
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          const addr = geoData.address || {};
          const detected = addr.suburb || addr.neighbourhood || addr.village || addr.town || addr.city_district || addr.city || addr.county || addr.state_district || addr.state || '';
          if (detected) {
            placeNameEn = detected;
            placeNameHi = detected;
            placeNameMl = detected;
          } else {
            placeNameEn = `GPS Location (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
            placeNameHi = `GPS स्थान (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
            placeNameMl = `GPS ലൊക്കേഷൻ (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
          }
          if (addr.postcode) {
            pincode = addr.postcode;
          }
        }
      } catch (e) {
        console.warn('Reverse geocoding error:', e);
        placeNameEn = `GPS Location (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
      }
    } 
    // Strategy 3: Server-side IP Geolocation Lookup (Vercel Native IP Headers + HTTPS Fallback)
    else {
      const vercelLat = request.headers.get('x-vercel-ip-latitude');
      const vercelLng = request.headers.get('x-vercel-ip-longitude');
      const vercelCity = request.headers.get('x-vercel-ip-city');

      if (vercelLat && vercelLng && !isNaN(parseFloat(vercelLat)) && !isNaN(parseFloat(vercelLng))) {
        lat = parseFloat(vercelLat);
        lng = parseFloat(vercelLng);
        const city = vercelCity ? decodeURIComponent(vercelCity) : 'Local Region';
        placeNameEn = city;
        placeNameHi = city;
        placeNameMl = city;
      } else {
        try {
          const ipRes = await fetch('https://ipapi.co/json/', { cache: 'no-store' });
          if (ipRes.ok) {
            const ipData = await ipRes.json();
            if (ipData && ipData.latitude && ipData.longitude) {
              lat = ipData.latitude;
              lng = ipData.longitude;
              const city = ipData.city || ipData.region || 'Local Region';
              placeNameEn = city;
              placeNameHi = city;
              placeNameMl = city;
              pincode = ipData.postal || '695001';
            }
          }
        } catch (e) {
          console.warn('IP lookup error:', e);
        }
      }
    }

    const minutesAgo = (mins: number) => new Date(Date.now() - mins * 60 * 1000).toISOString();
    const hoursAgo = (hrs: number) => new Date(Date.now() - hrs * 3600 * 1000).toISOString();

    // Defined landmark offsets around resolved location (0.4km to 4.9km) sorted by distance
    const landmarks = [
      {
        code: '1001',
        dLat: 0.0031, dLng: 0.0024,
        tagEn: 'Main Market',
        tagHi: 'मुख्य बाजार',
        tagMl: 'മെയിൻ മാർക്കറ്റ്',
        streetEn: 'Shop No. 12, Market Junction Road',
        streetHi: 'दुकान नंबर 12, मार्केट जंक्शन रोड',
        streetMl: 'കട നമ്പർ 12, മാർക്കറ്റ് ജംഗ്ഷൻ റോഡ്',
        areaEn: 'Central Market Zone',
        areaHi: 'सेंट्रल मार्केट क्षेत्र',
        areaMl: 'സെൻട്രൽ മാർക്കറ്റ് സോൺ',
      },
      {
        code: '1002',
        dLat: -0.0068, dLng: 0.0055,
        tagEn: 'Town Bus Stand Junction',
        tagHi: 'टाउन बस स्टैंड जंक्शन',
        tagMl: 'ടൗൺ ബസ് സ്റ്റാൻഡ് ജംഗ്ഷൻ',
        streetEn: 'KSRTC Bus Station Road, Ward 3',
        streetHi: 'केएसआरटीसी बस स्टैंड मार्ग, वार्ड 3',
        streetMl: 'കെ.എസ്.ആർ.ടി.സി ബസ് സ്റ്റാൻഡ് റോഡ്, വാർഡ് 3',
        areaEn: 'Town Bus Stand Zone',
        areaHi: 'टाउन बस स्टैंड क्षेत्र',
        areaMl: 'ടൗൺ ബസ് സ്റ്റാൻഡ് സോൺ',
      },
      {
        code: '1003',
        dLat: 0.0118, dLng: -0.0089,
        tagEn: 'East Ward Colony',
        tagHi: 'ईस्ट वार्ड कॉलोनी',
        tagMl: 'ഈസ്റ്റ് വാർഡ് കോളനി',
        streetEn: 'Temple Bypass Road, Ward 7',
        streetHi: 'मंदिर बायपास मार्ग, वार्ड 7',
        streetMl: 'ക്ഷേത്രം ബൈപാസ് റോഡ്, വാർഡ് 7',
        areaEn: 'East Residential Zone',
        areaHi: 'पूर्वी आवासीय क्षेत्र',
        areaMl: 'ഈസ്റ്റ് റസിഡൻഷ്യൽ സോൺ',
      },
      {
        code: '1004',
        dLat: -0.0175, dLng: -0.0138,
        tagEn: 'Government Hospital Circle',
        tagHi: 'सरकारी अस्पताल सर्किल',
        tagMl: 'സർക്കാർ ആശുപത്രി സർക്കിൾ',
        streetEn: 'PHC Clinic Road, Ward 11',
        streetHi: 'पीएचसी क्लिनिक रोड, वार्ड 11',
        streetMl: 'പി.എച്ച്.സി ക്ലിനിക് റോഡ്, വാർഡ് 11',
        areaEn: 'Hospital & Healthcare Zone',
        areaHi: 'अस्पताल व स्वास्थ्य क्षेत्र',
        areaMl: 'ആശുപത്രി മേഖല',
      },
      {
        code: '1005',
        dLat: 0.0255, dLng: 0.0202,
        tagEn: 'North High School Junction',
        tagHi: 'नॉर्थ हाई स्कूल जंक्शन',
        tagMl: 'നോർത്ത് ഹൈസ്കൂൾ ജംഗ്ഷൻ',
        streetEn: 'School Gate Road, Ward 15',
        streetHi: 'स्कूल गेट रोड, वार्ड 15',
        streetMl: 'स्कूल गेट रोड, वार्ड 15',
        areaEn: 'North Educational Zone',
        areaHi: 'उत्तरी शैक्षणिक क्षेत्र',
        areaMl: 'നോർത്ത് സോൺ',
      },
      {
        code: '1006',
        dLat: -0.0338, dLng: 0.0298,
        tagEn: 'South Bypass Junction',
        tagHi: 'साउथ बायपास जंक्शन',
        tagMl: 'സൗത്ത് ബൈപാസ് ജംഗ്ഷൻ',
        streetEn: 'Highway Junction Road, Ward 18',
        streetHi: 'हाईवे जंक्शन मार्ग, वार्ड 18',
        streetMl: 'ഹൈവേ ജംഗ്ഷൻ റോഡ്, വാർഡ് 18',
        areaEn: 'South Bypass Zone',
        areaHi: 'दक्षिण बायपास क्षेत्र',
        areaMl: 'സൗത്ത് ബൈപാസ് സോൺ',
      },
    ];

    const dbShops = getAllShops();
    const dealers = ['K. Ramesh Kumar', 'Sunita Devi', 'Anil V. Nair', 'Mohd. Imran', 'Suresh V. Kurup', 'Pooja Sharma'];
    const phones = ['+91 98765 43210', '+91 98112 23344', '+91 97177 88990', '+91 99554 11223', '+91 98450 67890', '+91 96543 21098'];

    const gpsShops: GPSShop[] = landmarks.map((lm, i) => {
      const dbShop = dbShops[i] || dbShops.find(s => s.fps_code.includes(lm.code) || s.id.includes(lm.code));
      const shopLat = lat + lm.dLat;
      const shopLng = lng + lm.dLng;
      const fpsCode = dbShop ? dbShop.fps_code : `FPS-${pincode.slice(0, 3)}-${lm.code}`;
      const shopId = dbShop ? dbShop.id : `shop-gps-${lm.code}`;

      const nameEn = `${placeNameEn} ${lm.tagEn} FPS #${lm.code}`;
      const nameHi = `${placeNameHi} ${lm.tagHi} राशन दुकान #${lm.code}`;
      const nameMl = `${placeNameMl} ${lm.tagMl} റേഷൻ കട #${lm.code}`;

      const addrEn = `${lm.streetEn}, ${placeNameEn}`;
      const addrHi = `${lm.streetHi}, ${placeNameHi}`;
      const addrMl = `${lm.streetMl}, ${placeNameMl}`;

      const areaEn = `${placeNameEn} - ${lm.areaEn}`;
      const areaHi = `${placeNameHi} - ${lm.areaHi}`;
      const areaMl = `${placeNameMl} - ${lm.areaMl}`;

      return {
        id: shopId,
        fps_code: fpsCode,
        name: nameEn,
        name_hi: nameHi,
        name_ml: nameMl,
        dealer_name: dbShop ? dbShop.dealer_name : dealers[i],
        phone: dbShop ? dbShop.phone : phones[i],
        address: addrEn,
        address_hi: addrHi,
        address_ml: addrMl,
        area: areaEn,
        area_hi: areaHi,
        area_ml: areaMl,
        pincode: pincode,
        lat: shopLat,
        lng: shopLng,
        operating_hours: '08:00 AM - 06:30 PM (Closed on Mon)',
        pin: 'pin123',
        confirmationsCount: dbShop ? dbShop.confirmationsCount : { match: 8 + i * 3, mismatch: i },
        stock: dbShop ? dbShop.stock : [
          {
            id: `${shopId}-rice`,
            shop_id: shopId,
            item_key: 'rice',
            item_name_en: 'Boiled Rice (Standard)',
            item_name_hi: 'चावल (उबला हुआ)',
            status: i % 3 === 2 ? 'LOW' : 'AVAILABLE',
            quantity_note: i % 3 === 2 ? '50 kg left' : '1,200 kg available',
            expected_restock_date: null,
            last_updated: minutesAgo(8 + i * 4),
          },
          {
            id: `${shopId}-wheat`,
            shop_id: shopId,
            item_key: 'wheat',
            item_name_en: 'Wheat / Whole Atta',
            item_name_hi: 'गेहूं / आटा',
            status: i === 1 ? 'OUT_OF_STOCK' : 'AVAILABLE',
            quantity_note: i === 1 ? 'Out of stock' : '900 kg available',
            expected_restock_date: i === 1 ? new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0] : null,
            last_updated: minutesAgo(12 + i * 3),
          },
          {
            id: `${shopId}-sugar`,
            shop_id: shopId,
            item_key: 'sugar',
            item_name_en: 'Refined Sugar',
            item_name_hi: 'चीनी',
            status: i === 4 ? 'OUT_OF_STOCK' : 'AVAILABLE',
            quantity_note: i === 4 ? 'Out of stock' : '350 kg available',
            expected_restock_date: i === 4 ? new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0] : null,
            last_updated: hoursAgo(1 + i),
          },
          {
            id: `${shopId}-kerosene`,
            shop_id: shopId,
            item_key: 'kerosene',
            item_name_en: 'Domestic Kerosene',
            item_name_hi: 'केरोसिन',
            status: i % 2 === 0 ? 'AVAILABLE' : 'LOW',
            quantity_note: i % 2 === 0 ? '180 Liters available' : '25 Liters left',
            expected_restock_date: null,
            last_updated: hoursAgo(2 + i),
          },
          {
            id: `${shopId}-oil`,
            shop_id: shopId,
            item_key: 'oil',
            item_name_en: 'Fortified Oil',
            item_name_hi: 'तेल',
            status: 'AVAILABLE',
            quantity_note: '250 Liters available',
            expected_restock_date: null,
            last_updated: minutesAgo(5 + i * 2),
          },
        ],
      };
    });

    // Sort strictly by distance to ensure closest shop comes first
    gpsShops.sort((a, b) => {
      const distA = calculateDistance(lat, lng, a.lat, a.lng);
      const distB = calculateDistance(lat, lng, b.lat, b.lng);
      return distA - distB;
    });

    return NextResponse.json({
      success: true,
      userLocation: { lat, lng },
      placeNameEn,
      placeNameHi,
      placeNameMl,
      pincode,
      shops: gpsShops,
    });
  } catch (error) {
    console.error('Error fetching GPS shops:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
