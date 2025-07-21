import { Vendor } from '../types';
import { VENDOR_API_URL } from '../constants';

const CACHE_KEY = 'vendorDataCache';
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

const mapApiDataToVendor = (item: any): Vendor => {
  return {
    Name: item.Name,
    'Date added': item['Date added'],
    Service: item.Service,
    Identity: item.Identity,
    Company: item.Company,
    Website: item.Website,
    'Phone number': item['Phone number'],
    Email: item.Email,
    'Related villa': item['Related villa'],
    'Related land': item['Related land'],
  };
};

export const fetchVendors = async (forceRefresh: boolean = false): Promise<Vendor[]> => {
  if (!forceRefresh) {
    try {
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const { timestamp, vendors: cachedVendors } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_DURATION_MS && Array.isArray(cachedVendors)) {
          console.log(`Loading vendors from cache. Cached at: ${new Date(timestamp).toLocaleString()}`);
          return cachedVendors;
        } else {
          localStorage.removeItem(CACHE_KEY); 
        }
      }
    } catch (e) {
      console.error('Error reading vendor data from cache:', e);
      localStorage.removeItem(CACHE_KEY);
    }
  } else {
      localStorage.removeItem(CACHE_KEY);
      console.log('Vendor cache cleared due to force refresh.');
  }

  try {
    console.log('Fetching vendors from API...');
    const response = await fetch(VENDOR_API_URL);
    if (!response.ok) {
      let errorBody = 'No additional error information from server.';
      try { errorBody = await response.text(); } catch (textError) { /* ignore */ }
      console.error(`Vendor API request failed with status ${response.status} ${response.statusText}. Server response: ${errorBody.substring(0, 200)}`);
      throw new Error(`Vendor API request failed: ${response.status} ${response.statusText}.`);
    }

    let rawData;
    try { rawData = await response.json(); } catch (jsonError) {
      console.error('Failed to parse Vendor API response as JSON:', jsonError);
      throw new Error('Vendor API returned non-JSON response.');
    }
    
    let vendorsArray: any[] = [];
    if (Array.isArray(rawData)) vendorsArray = rawData;
    else if (rawData && Array.isArray(rawData.data)) vendorsArray = rawData.data;
    else if (typeof rawData === 'object' && rawData !== null) {
        for (const key in rawData) if (Array.isArray(rawData[key])) { vendorsArray = rawData[key]; break; }
    }

    const vendors = vendorsArray.map(mapApiDataToVendor).filter(vendor => vendor.Name);
    
    if (vendors.length === 0 && vendorsArray.length > 0) {
        console.warn("Mapping API data resulted in zero valid vendors. Check mapping logic. First raw item:", vendorsArray[0]);
    }

    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), vendors }));
      console.log('Vendors cached successfully.');
    } catch (e) {
      console.error('Error saving vendors to cache:', e);
    }
    
    return vendors;

  } catch (error) {
    console.error('Error in fetchVendors:', error); 
    if (error instanceof Error) throw error;
    else throw new Error(String(error));
  }
};