import {
  GeocodedAddress,
  SpatialPoi,
  CensusEconomicProfile,
  MandiPriceReport,
} from '../server/spatialDataService';
import { DistrictGeoEconomicData } from '../components/dashboard/dashboardTypes';

export async function fetchDistrictGeoEconomic(
  district: string,
  state: string,
  lat?: number,
  lng?: number,
  businessType?: string
): Promise<DistrictGeoEconomicData> {
  const queryParams = new URLSearchParams({
    district: district || 'Jalpaiguri',
    state: state || 'West Bengal',
    businessType: businessType || 'Enterprise',
  });
  if (lat) queryParams.set('lat', lat.toString());
  if (lng) queryParams.set('lng', lng.toString());

  const res = await fetch(`/api/location/district-geo-economic?${queryParams.toString()}`);
  if (!res.ok) {
    throw new Error('District geo-economic data fetch failed');
  }
  return res.json();
}


export async function fetchReverseGeocode(lat: number, lng: number): Promise<GeocodedAddress> {
  const res = await fetch(`/api/location/reverse-geocode?lat=${lat}&lng=${lng}`);
  if (!res.ok) {
    throw new Error('Reverse geocode failed');
  }
  return res.json();
}

export async function fetchOverpassSpatialScan(
  lat: number,
  lng: number,
  radiusKm: 5 | 10 | 15,
  businessType: string
): Promise<{
  pois: SpatialPoi[];
  counts: { competitors: number; mandis: number; suppliers: number; farms: number; densityIndex: number };
  source: string;
}> {
  const res = await fetch('/api/location/scan-pois', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lat, lng, radiusKm, businessType }),
  });
  if (!res.ok) {
    throw new Error('POI scan failed');
  }
  return res.json();
}

export async function fetchCensusEconomicData(
  district: string,
  state: string
): Promise<CensusEconomicProfile> {
  const res = await fetch(
    `/api/data/census-economic?district=${encodeURIComponent(district)}&state=${encodeURIComponent(state)}`
  );
  if (!res.ok) {
    throw new Error('Census & economic data fetch failed');
  }
  return res.json();
}

export async function fetchMandisPricing(
  lat: number,
  lng: number,
  district: string,
  state: string,
  businessType: string
): Promise<MandiPriceReport[]> {
  const res = await fetch(
    `/api/data/mandis-pricing?lat=${lat}&lng=${lng}&district=${encodeURIComponent(
      district
    )}&state=${encodeURIComponent(state)}&businessType=${encodeURIComponent(businessType)}`
  );
  if (!res.ok) {
    throw new Error('Mandi pricing fetch failed');
  }
  const json = await res.json();
  return json.mandis || [];
}
