

import { Villa, VillaPostPayload } from '../types';
import { VILLA_EDIT_API_URL } from '../constants';

const CACHE_KEY = 'villaDataCache';
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour


const parseUSDString = (priceStr: string | number | undefined | null): number | null => {
  if (typeof priceStr === 'number') {
    return priceStr;
  }
  if (typeof priceStr !== 'string' || !priceStr) {
    return null;
  }

  let cleanedStr = priceStr.replace(/US\$|\$|Rp/gi, '').trim();
  cleanedStr = cleanedStr.replace(/,/g, ''); 

  if (cleanedStr.includes('.')) {
    const parts = cleanedStr.split('.');
    if (parts.length === 2 && parts[1].length === 3) { 
      cleanedStr = parts.join('');
    } else if (parts.length > 2) { 
       cleanedStr = parts.join('');
    }
  }
  
  const num = parseFloat(cleanedStr);
  return isNaN(num) ? null : num;
};

const monthNames: { [key: string]: number } = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
  jan: 0, feb: 1, mar: 2, apr: 3, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
};

const parseDateListed = (dateStr?: string): Date | undefined => {
  if (!dateStr || typeof dateStr !== 'string' || dateStr.trim() === '') return undefined;

  const textualDateMatch = dateStr.trim().match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (textualDateMatch) {
    const day = parseInt(textualDateMatch[1], 10);
    const monthName = textualDateMatch[2].toLowerCase();
    const year = parseInt(textualDateMatch[3], 10);
    const month = monthNames[monthName];

    if (!isNaN(day) && month !== undefined && !isNaN(year)) {
      try {
        const d = new Date(year, month, day);
        if (d.getFullYear() === year && d.getMonth() === month && d.getDate() === day) {
          return d;
        }
      } catch (e) { /* Fall through */ }
    }
  }

  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const d1 = parseInt(parts[0], 10);
      const d2 = parseInt(parts[1], 10);
      let yearPart = parseInt(parts[2], 10);

      if (isNaN(d1) || isNaN(d2) || isNaN(yearPart)) {
        // Malformed parts
      } else {
        if (yearPart < 100) { 
          yearPart += 2000;
        }

        let day, month, year = yearPart;
        
        if (d1 > 12 && d2 <= 12) { 
            day = d1;
            month = d2 - 1;
        } else if (d2 > 12 && d1 <= 12) { 
            day = d2;
            month = d1 - 1;
        } else if (d1 <= 12 && d2 <= 12) { 
            day = d1;
            month = d2 - 1;
        }

        if (day !== undefined && month !== undefined) {
           try {
            const d = new Date(year, month, day);
            if (d.getFullYear() === year && d.getMonth() === month && d.getDate() === day) {
              return d;
            }
          } catch (e) { /* Fall through */ }
        }
      }
    }
  }
  try {
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) return parsed;
  } catch(e) { /* ignore */ }

  console.warn(`Could not parse date string: "${dateStr}"`);
  return undefined;
};


const mapApiDataToVilla = (item: any): Villa => {
  const priceUSD = parseUSDString(item['Price USD']);
  const parsedDate = parseDateListed(item['Date listed']);

  // It's important that the keys here match what your API returns.
  // For editing, we'll create a Villa object, then map it to the payload for POST.
  return {
    id: String(item['Reference'] || item.id || Date.now() + Math.random()),
    name: item['Listing name'] || item.name || 'Unnamed Villa',
    contractType: item['Contract'],
    propertyType: item['Property type'],
    availability: item['Availability'],
    deliveryDate: item['Delivery date'],
    driveLink: item['Drive link'],
    dateListed: item['Date listed'],
    parsedDateListed: parsedDate,
    district: item['District'],
    districtArea: item['District area'],
    locationPin: item['Location pin'] || item['Location link'],
    priceIDRRaw: item['Price IDR'],
    priceUSD: priceUSD === null ? undefined : priceUSD, // This is a number
    leaseholdYears: item['Leasehold years'],
    extensionYears: item['Extension years'],
    unitsAvailable: item['Units available'],
    landSizeM2: parseFloat(item['Land size m2']) || undefined,
    buildingSizeM2: parseFloat(item['Building size']) || undefined,
    bedrooms: parseInt(item['Bedrooms'], 10) || 0,
    bathrooms: parseInt(item['Bathrooms'], 10) || 0,
    image_url: item['Thumbnail'] || item['Main image'] || item.image_url,
    listingAgent: item['Listing agent'],
    webListingLink: item['Web listing link'] || item['Web link'],
    vendor: item['Vendor'],
    additionalDetails: item['Additional details'],
    brochureLink: item['Brochure Link'] || item['Brochure'],
    buildingPermit: item['Building Permit'] || item['Building permit'],
    percentROI: item['%ROI'] ? parseFloat(String(item['%ROI']).replace(/%/g, '')) : undefined,
    dollarROI: parseUSDString(item['$ROI']) ?? undefined,
    roiReportLink: item['ROI report'],
    // Core fields for the app
    price: priceUSD ?? 0,
    location: item['District'] || item.location || 'Unknown Location',
    description: item['Additional details'] || item.description || 'No description available.',
  };
};

// This function maps our internal Villa object to the payload expected by the POST webhook.
// It is aligned with the database field list provided by the user.
const mapVillaToPostPayload = (villa: Partial<Villa>): VillaPostPayload => {
  const payload: VillaPostPayload = {
    Reference: villa.id || '',
    'Date listed': villa.dateListed,
    Availability: villa.availability,
    'Property type': villa.propertyType,
    Contract: villa.contractType,
    District: villa.district,
    'District area': villa.districtArea,
    'Land size m2': villa.landSizeM2,
    'Building size': villa.buildingSizeM2,
    Bedrooms: villa.bedrooms,
    Bathrooms: villa.bathrooms,
    'Delivery date': villa.deliveryDate,
    'Price IDR': villa.priceIDRRaw,
    'Price USD': villa.priceUSD !== undefined ? String(villa.priceUSD) : undefined,
    'Leasehold years': villa.leaseholdYears,
    'Extension years': villa.extensionYears,
    'Additional details': villa.additionalDetails || villa.description,
    '%ROI': villa.percentROI,
    '$ROI': villa.dollarROI,
    'Listing agent': villa.listingAgent,
    'Units available': villa.unitsAvailable,
    Vendor: villa.vendor,
    Thumbnail: villa.image_url,
    'Drive link': villa.driveLink,
    'Location link': villa.locationPin,
    'Web link': villa.webListingLink,
    'ROI report': villa.roiReportLink,
  };
  // Remove undefined or null fields from payload to keep it clean
  Object.keys(payload).forEach(key => {
    const K = key as keyof VillaPostPayload;
    if (payload[K] === undefined || payload[K] === null) {
      delete payload[K];
    }
  });
  return payload;
};


export const fetchVillas = async (apiUrl: string, forceRefresh: boolean = false): Promise<Villa[]> => {
  if (!forceRefresh) {
    try {
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const { timestamp, villas: cachedVillas } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_DURATION_MS && Array.isArray(cachedVillas)) {
          console.log(`Loading villas from cache. Cached at: ${new Date(timestamp).toLocaleString()}`);
          return cachedVillas.map((villa: any) => ({
            ...villa,
            parsedDateListed: villa.dateListed ? parseDateListed(villa.dateListed) : undefined
          }));
        } else {
          localStorage.removeItem(CACHE_KEY); 
        }
      }
    } catch (e) {
      console.error('Error reading from cache:', e);
      localStorage.removeItem(CACHE_KEY);
    }
  } else {
      localStorage.removeItem(CACHE_KEY);
      console.log('Cache cleared due to force refresh.');
  }

  try {
    console.log('Fetching villas from API...');
    const response = await fetch(apiUrl);
    if (!response.ok) {
      let errorBody = 'No additional error information from server.';
      try { errorBody = await response.text(); } catch (textError) { /* ignore */ }
      console.error(`API request failed with status ${response.status} ${response.statusText}. Server response: ${errorBody.substring(0, 200)}`);
      throw new Error(`API request failed: ${response.status} ${response.statusText}.`);
    }

    let rawData;
    try { rawData = await response.json(); } catch (jsonError) {
      console.error('Failed to parse API response as JSON:', jsonError);
      const responseText = await fetch(apiUrl).then(r => r.text()).catch(() => 'Could not read raw text');
      console.error('Raw API response text:', responseText.substring(0, 500));
      throw new Error('API returned non-JSON response.');
    }
    
    let villasArray: any[] = [];
    if (Array.isArray(rawData)) villasArray = rawData;
    else if (rawData && Array.isArray(rawData.records)) villasArray = rawData.records;
    else if (rawData && Array.isArray(rawData.data)) villasArray = rawData.data;
    else if (typeof rawData === 'object' && rawData !== null) {
        for (const key in rawData) if (Array.isArray(rawData[key])) { villasArray = rawData[key]; break; }
    }

    const villas = villasArray.map(mapApiDataToVilla).filter(villa => villa.id && villa.name);
    
    if (villas.length === 0 && villasArray.length > 0) {
        console.warn("Mapping API data resulted in zero valid villas. Check mapping logic. First raw item:", villasArray[0]);
    }

    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), villas }));
      console.log('Villas cached successfully.');
    } catch (e) {
      console.error('Error saving to cache:', e);
    }
    
    return villas;

  } catch (error) {
    console.error('Error in fetchVillas:', error); 
    if (error instanceof Error) throw error;
    else throw new Error(String(error));
  }
};

export const saveVilla = async (villaData: Partial<Villa>): Promise<any> => {
  // Use a sensible name if 'id' is available and 'name' is not.
  if (!villaData.name && villaData.id) {
    villaData.name = `Villa Ref ${villaData.id}`;
  }
  
  const payload = mapVillaToPostPayload(villaData);
  // If 'Reference' is empty for a new villa, backend might generate it or expect it.
  // For editing, 'Reference' (villa.id) MUST be present.
  if (!payload.Reference) {
    // This indicates a new villa. Backend might auto-generate ID or expect an empty one.
    // Or, if Reference is user-settable, it might be new if it doesn't exist.
    console.log("Saving new villa, Reference (ID) is not set or empty in payload.", payload);
  }

  try {
    console.log('Saving villa with payload:', JSON.stringify(payload, null, 2));
    const response = await fetch(VILLA_EDIT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorBody = 'No additional error information from server.';
      try { errorBody = await response.text(); } catch (textError) { /* ignore */ }
      console.error(`Save villa API request failed with status ${response.status} ${response.statusText}. Server response: ${errorBody}`);
      throw new Error(`Failed to save villa: ${response.status} ${response.statusText}. Details: ${errorBody.substring(0,200)}`);
    }
    
    // Clear cache after successful save
    localStorage.removeItem(CACHE_KEY);
    console.log('Villa saved successfully, cache cleared.');

    return await response.json(); // Or response.text() if it doesn't return JSON
  } catch (error) {
    console.error('Error in saveVilla:', error);
    if (error instanceof Error) throw error;
    else throw new Error(String(error));
  }
};

// Helper to format a Date object to "DD MonthName YYYY"
export const formatDateToDDMonthYYYY = (date: Date | undefined | null): string => {
  if (!date) return '';
  const day = date.getDate();
  const month = date.toLocaleString('en-GB', { month: 'long' }); // 'en-GB' for day first, can adjust locale
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

// Helper to parse "DD MonthName YYYY" string to Date object
export const parseDDMonthYYYYtoDate = (dateStr: string): Date | undefined => {
  if (!dateStr) return undefined;
  return parseDateListed(dateStr); // Reuse existing robust parser
};