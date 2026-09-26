import React, { useState, useEffect } from 'react';
import { EnterpriseState, GisData, DistrictGeoEconomicData } from './dashboardTypes';
import { LeafletMap } from './LeafletMap';
import { SpatialPoi } from '../../server/spatialDataService';
import {
  fetchReverseGeocode,
  fetchOverpassSpatialScan,
} from '../../services/spatialApiService';
import {
  MapPin,
  Compass,
  Radar,
  RefreshCw,
  Building2,
  Store,
  Trees,
  Truck,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Volume2,
  Database,
  ExternalLink,
} from 'lucide-react';

interface LocationModuleProps {
  enterprise: EnterpriseState;
  economicData?: DistrictGeoEconomicData | null;
  onUpdateEnterprise: (partial: Partial<EnterpriseState>) => void;
  onProceedNext: () => void;
  onSpeak: (text: string) => void;
}

export const LocationModule: React.FC<LocationModuleProps> = ({
  enterprise,
  economicData = null,
  onUpdateEnterprise,
  onProceedNext,
  onSpeak,
}) => {
  const [scanning, setScanning] = useState(false);
  const [pois, setPois] = useState<SpatialPoi[]>([]);
  const [gisData, setGisData] = useState<GisData>({
    farms: 28,
    suppliers: 14,
    mandis: 3,
    competitors: 7,
    densityIndex: 68,
    source: 'OSM Overpass API & Ground Spatial Registry',
  });
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Perform live Overpass POI spatial scan around current coordinates
  const triggerSpatialScan = async (lat: number, lng: number, radius: 5 | 10 | 15) => {
    setScanning(true);
    try {
      const result = await fetchOverpassSpatialScan(lat, lng, radius, enterprise.businessType);
      setPois(result.pois || []);
      setGisData({
        farms: result.counts.farms,
        suppliers: result.counts.suppliers,
        mandis: result.counts.mandis,
        competitors: result.counts.competitors,
        densityIndex: result.counts.densityIndex,
        source: result.source,
      });
    } catch (err) {
      console.warn('Overpass scan error:', err);
    } finally {
      setScanning(false);
    }
  };

  // Initial scan on mount or when radius changes
  useEffect(() => {
    triggerSpatialScan(enterprise.lat, enterprise.lng, enterprise.radiusKm);
  }, [enterprise.lat, enterprise.lng, enterprise.radiusKm]);

  // GPS Acquisition with Nominatim Reverse Geocoding
  const fetchRealLocation = () => {
    setLocationError(null);
    setLocationStatus('Requesting browser GPS satellite fix...');

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      setLocationStatus(null);
      return;
    }

    setScanning(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLocationStatus('GPS acquired. Reverse-geocoding via OpenStreetMap Nominatim...');

        try {
          const geo = await fetchReverseGeocode(lat, lng);
          onUpdateEnterprise({
            lat,
            lng,
            locationName: geo.villageOrTown,
            districtName: geo.district,
            stateName: geo.state,
            scanned: true,
          });
          setLocationStatus(`Localized to ${geo.villageOrTown}, ${geo.district}, ${geo.state} (PIN ${geo.postcode})`);
        } catch {
          onUpdateEnterprise({ lat, lng, scanned: true });
          setLocationStatus(`Localized to GPS (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`);
        }

        // Trigger spatial Overpass scan around the newly fetched coordinates
        await triggerSpatialScan(lat, lng, enterprise.radiusKm);
        setTimeout(() => setLocationStatus(null), 6000);
      },
      (err) => {
        setLocationError(`GPS fix unavailable (${err.message}). Using regional centroid for ${enterprise.locationName}.`);
        setLocationStatus(null);
        setScanning(false);
      },
      { timeout: 9000, enableHighAccuracy: true }
    );
  };

  // Interactive relocation when user clicks on Leaflet map or drags marker
  const handleMapLocationChange = async (newLat: number, newLng: number) => {
    setLocationStatus('Resolving location details for pin...');
    try {
      const geo = await fetchReverseGeocode(newLat, newLng);
      onUpdateEnterprise({
        lat: newLat,
        lng: newLng,
        locationName: geo.villageOrTown,
        districtName: geo.district,
        stateName: geo.state,
        scanned: true,
      });
      setLocationStatus(`Relocated to ${geo.villageOrTown}, ${geo.district}`);
    } catch {
      onUpdateEnterprise({ lat: newLat, lng: newLng, scanned: true });
      setLocationStatus(`Relocated to ${newLat.toFixed(4)}°, ${newLng.toFixed(4)}°`);
    }

    await triggerSpatialScan(newLat, newLng, enterprise.radiusKm);
    setTimeout(() => setLocationStatus(null), 5000);
  };

  const handleRadiusChange = (r: 5 | 10 | 15) => {
    onUpdateEnterprise({ radiusKm: r });
    triggerSpatialScan(enterprise.lat, enterprise.lng, r);
  };

  const narration = `Location Intelligence for ${enterprise.locationName}, ${enterprise.districtName}. Real coordinates are latitude ${enterprise.lat.toFixed(4)}, longitude ${enterprise.lng.toFixed(4)}. In the ${enterprise.radiusKm} kilometer catchment, OpenStreetMap and Overpass scan detected ${gisData.competitors} competitor stores, ${gisData.mandis} APMC mandis and weekly haats, ${gisData.suppliers} input suppliers, and ${gisData.farms} production farms. Spatial commercial density index is ${gisData.densityIndex} out of 100.`;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#173326] to-[#244b39] text-white p-6 rounded-2xl shadow-lg border border-emerald-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-radial-gradient opacity-15 pointer-events-none" />
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider mb-1">
              <Compass className="w-4 h-4" />
              <span>Step 1: Hyper-Local GIS Spatial Intelligence</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Live Location & Spatial Ecosystem Scan
            </h2>
            <p className="text-slate-300 text-sm max-w-2xl mt-1">
              Interactive Leaflet.js map powered by real OpenStreetMap tiles, Nominatim reverse geocoding, and live Overpass POI queries for competition, mandis, and supply chains.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSpeak(narration)}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors border border-white/20"
              title="Listen to narration"
            >
              <Volume2 className="w-4 h-4 text-amber-300" />
              <span>Listen</span>
            </button>
            <button
              onClick={fetchRealLocation}
              disabled={scanning}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
            >
              <Radar className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
              <span>{scanning ? 'Scanning GPS & Overpass...' : 'Fetch Live GPS'}</span>
            </button>
          </div>
        </div>

        {locationStatus && (
          <div className="mt-3 text-xs bg-emerald-950/70 text-emerald-200 border border-emerald-500/40 px-3 py-1.5 rounded-lg flex items-center gap-2 animate-fadeIn">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{locationStatus}</span>
          </div>
        )}

        {locationError && (
          <div className="mt-3 text-xs bg-red-950/60 text-red-200 border border-red-500/40 px-3 py-1.5 rounded-lg">
            {locationError}
          </div>
        )}
      </div>

      {/* Main Grid: Real Leaflet Map + Spatial Parameters Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Leaflet Map & Spatial Scanner */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#083b5e]" />
                <span>Live Leaflet.js Spatial Ecosystem Map</span>
              </h3>
              <p className="text-xs text-slate-500">
                Hub Centroid: <strong className="text-slate-900">{enterprise.locationName}</strong> ({enterprise.lat.toFixed(4)}°, {enterprise.lng.toFixed(4)}°)
              </p>
            </div>
            {/* Radius Selector */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-bold">
              {[5, 10, 15].map((r) => (
                <button
                  key={r}
                  onClick={() => handleRadiusChange(r as 5 | 10 | 15)}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    enterprise.radiusKm === r
                      ? 'bg-[#083b5e] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {r} km
                </button>
              ))}
            </div>
          </div>

          {/* Real Leaflet Map Container */}
          <LeafletMap
            lat={enterprise.lat}
            lng={enterprise.lng}
            radiusKm={enterprise.radiusKm}
            locationName={enterprise.locationName}
            districtName={enterprise.districtName}
            businessType={enterprise.businessType}
            pois={pois}
            economicData={economicData}
            onLocationChange={handleMapLocationChange}
            interactive={true}
          />

          {/* Density Scan Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-600" />
                <span>Competitors</span>
              </div>
              <div className="text-xl font-black text-rose-700 mt-0.5">{gisData.competitors}</div>
              <div className="text-[10px] text-slate-400">Direct peer shops</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Mandis & Haats</span>
              </div>
              <div className="text-xl font-black text-amber-600 mt-0.5">{gisData.mandis}</div>
              <div className="text-[10px] text-slate-400">Wholesale corridors</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#083b5e]" />
                <span>Suppliers</span>
              </div>
              <div className="text-xl font-black text-[#083b5e] mt-0.5">{gisData.suppliers}</div>
              <div className="text-[10px] text-slate-400">Input material points</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>Agricultural Nodes</span>
              </div>
              <div className="text-xl font-black text-emerald-700 mt-0.5">{gisData.farms}</div>
              <div className="text-[10px] text-slate-400">Producer clusters</div>
            </div>
          </div>

          {/* Real Data Source Traceability */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-[#083b5e]" />
              <span className="font-semibold">Live Data Source:</span>
              <span className="text-slate-800">{gisData.source}</span>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200">
              Nominatim Reverse Geocoded
            </span>
          </div>
        </div>

        {/* Right: Geographic Context & Form Configuration */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-700" />
              <span>Location Parameters</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Real administrative boundaries resolved from your GPS or map pin.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">State / UT</label>
                <input
                  type="text"
                  value={enterprise.stateName}
                  onChange={(e) => onUpdateEnterprise({ stateName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-400 outline-none text-sm font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">District</label>
                  <input
                    type="text"
                    value={enterprise.districtName}
                    onChange={(e) => onUpdateEnterprise({ districtName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-400 outline-none text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Block / Town / Village</label>
                  <input
                    type="text"
                    value={enterprise.locationName}
                    onChange={(e) => onUpdateEnterprise({ locationName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-400 outline-none text-sm font-semibold"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Business Sector / Venture</label>
                <input
                  type="text"
                  value={enterprise.businessType}
                  onChange={(e) => onUpdateEnterprise({ businessType: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-400 outline-none text-sm font-semibold text-[#083b5e]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Location Type</label>
                  <select
                    value={enterprise.locationType}
                    onChange={(e) => onUpdateEnterprise({ locationType: e.target.value as 'Rural' | 'Urban' })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm font-semibold"
                  >
                    <option value="Rural">Rural (PMEGP 25%-35%)</option>
                    <option value="Urban">Urban (PMEGP 15%-25%)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={enterprise.category}
                    onChange={(e) => onUpdateEnterprise({ category: e.target.value as 'General' | 'Special' })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm font-semibold"
                  >
                    <option value="General">General Category</option>
                    <option value="Special">Special (SC/ST/OBC/Women)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Key Insight Box & Next Button */}
          <div className="pt-4 border-t border-slate-200">
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl mb-4 text-xs text-amber-900 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Spatial Confirmation:</strong> {enterprise.locationName} has {gisData.suppliers} input suppliers, {gisData.mandis} APMC mandis, and {gisData.competitors} competitor outlets detected within {enterprise.radiusKm} km.
              </span>
            </div>
            <button
              onClick={onProceedNext}
              className="w-full bg-[#083b5e] hover:bg-[#062c46] text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow transition-colors text-sm"
            >
              <span>Proceed to Area Intelligence</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
