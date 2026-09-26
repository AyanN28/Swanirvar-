import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { SpatialPoi } from '../../server/spatialDataService';
import { DistrictGeoEconomicData, GeoEconomicPoint } from './dashboardTypes';
import {
  Layers,
  MapPin,
  Crosshair,
  Maximize2,
  Minimize2,
  Info,
  Store,
  Building2,
  Trees,
  ShoppingBag,
  TrendingUp,
  Landmark,
  IndianRupee,
  Layers2,
  Filter,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';

export interface LeafletMapProps {
  lat: number;
  lng: number;
  radiusKm: 5 | 10 | 15;
  locationName: string;
  districtName: string;
  businessType: string;
  pois?: SpatialPoi[];
  economicData?: DistrictGeoEconomicData | null;
  onLocationChange?: (lat: number, lng: number) => void;
  interactive?: boolean;
  heightClass?: string;
  showEcoHUD?: boolean;
}

type BaseTileLayer = 'osm' | 'positron' | 'satellite';

export const LeafletMap: React.FC<LeafletMapProps> = ({
  lat,
  lng,
  radiusKm,
  locationName,
  districtName,
  businessType,
  pois = [],
  economicData = null,
  onLocationChange,
  interactive = true,
  heightClass,
  showEcoHUD = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Circle refs
  const circle5Ref = useRef<L.Circle | null>(null);
  const circle10Ref = useRef<L.Circle | null>(null);
  const circle15Ref = useRef<L.Circle | null>(null);

  // Economic Layer Groups
  const mandiLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const msmeLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const bankLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const agriLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const poiLayerGroupRef = useRef<L.LayerGroup | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [baseTile, setBaseTile] = useState<BaseTileLayer>('osm');
  const [layerDrawerOpen, setLayerDrawerOpen] = useState(false);

  // Layer Visibility Toggles
  const [layersVisible, setLayersVisible] = useState({
    mandis: true,
    msmeClusters: true,
    banking: true,
    agriBelts: true,
    pois: true,
    catchmentRings: true,
  });

  const [activeFilter, setActiveFilter] = useState<'all' | 'mandi' | 'msme' | 'bank' | 'agri' | 'competitor'>('all');

  // Tile Providers
  const tileUrls: Record<BaseTileLayer, { url: string; attribution: string }> = {
    osm: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap contributors | SWANIRVAR GIS',
    },
    positron: {
      url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; CartoDB Positron | SWANIRVAR GIS',
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Esri World Imagery | SWANIRVAR GIS',
    },
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: radiusKm === 5 ? 13 : radiusKm === 10 ? 12 : 11,
      zoomControl: false,
      attributionControl: false,
    });

    const initialTile = L.tileLayer(tileUrls[baseTile].url, {
      maxZoom: 19,
      attribution: tileUrls[baseTile].attribution,
    }).addTo(map);
    tileLayerRef.current = initialTile;

    L.control.zoom({ position: 'topright' }).addTo(map);

    // Initialize Layer Groups
    mandiLayerGroupRef.current = L.layerGroup().addTo(map);
    msmeLayerGroupRef.current = L.layerGroup().addTo(map);
    bankLayerGroupRef.current = L.layerGroup().addTo(map);
    agriLayerGroupRef.current = L.layerGroup().addTo(map);
    poiLayerGroupRef.current = L.layerGroup().addTo(map);

    if (interactive && onLocationChange) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat: clickLat, lng: clickLng } = e.latlng;
        onLocationChange(clickLat, clickLng);
      });
    }

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Base Tile Switch
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }

    tileLayerRef.current = L.tileLayer(tileUrls[baseTile].url, {
      maxZoom: 19,
      attribution: tileUrls[baseTile].attribution,
    }).addTo(map);
  }, [baseTile]);

  // Update center, circles, and user hub marker when lat/lng/radius changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.setView([lat, lng], radiusKm === 5 ? 13 : radiusKm === 10 ? 12 : 11, {
      animate: true,
    });

    // 1. User Hub Marker
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    const userHtml = `
      <div class="relative flex items-center justify-center cursor-grab active:cursor-grabbing">
        <div class="absolute -inset-2.5 bg-amber-400/40 rounded-full animate-ping"></div>
        <div class="relative w-9 h-9 rounded-full bg-[#083b5e] border-2 border-white shadow-2xl flex items-center justify-center text-amber-300 font-black text-sm">
          ★
        </div>
      </div>
    `;

    const userIcon = L.divIcon({
      html: userHtml,
      className: 'custom-user-marker',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const userMarker = L.marker([lat, lng], {
      icon: userIcon,
      draggable: interactive && Boolean(onLocationChange),
    }).addTo(map);

    const c5Data = economicData?.catchmentEconomics.radius5km;
    const userPopupHtml = `
      <div class="p-2.5 text-xs font-sans space-y-1.5 min-w-[210px]">
        <div class="flex items-center justify-between border-b border-slate-200 pb-1">
          <strong class="text-[#083b5e] font-black text-sm block">${locationName}</strong>
          <span class="bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 text-[9px] rounded font-mono">${districtName}</span>
        </div>
        <div class="text-slate-700 font-semibold text-[11px]">${businessType}</div>
        <div class="text-slate-500 text-[10px]">${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E</div>
        ${
          c5Data
            ? `<div class="bg-emerald-50 border border-emerald-200 rounded p-1 text-[10px] text-emerald-800 space-y-0.5">
                <div><strong>5km Population:</strong> ${c5Data.population.toLocaleString()}</div>
                <div><strong>5km Monthly Spend:</strong> ₹${c5Data.consumptionPoolMonthlyCr} Cr</div>
              </div>`
            : ''
        }
        <div class="text-amber-800 font-bold text-[10px] flex items-center gap-1 pt-0.5">
          <span>● Active Catchment: ${radiusKm} km</span>
        </div>
      </div>
    `;

    userMarker.bindPopup(userPopupHtml);

    if (interactive && onLocationChange) {
      userMarker.on('dragend', (event) => {
        const marker = event.target;
        const position = marker.getLatLng();
        onLocationChange(position.lat, position.lng);
      });
    }

    userMarkerRef.current = userMarker;

    // 2. Concentric Buffer Circles
    if (circle5Ref.current) circle5Ref.current.remove();
    if (circle10Ref.current) circle10Ref.current.remove();
    if (circle15Ref.current) circle15Ref.current.remove();

    if (layersVisible.catchmentRings) {
      // 5km Primary Catchment Ring
      circle5Ref.current = L.circle([lat, lng], {
        radius: 5000,
        color: '#e59a18',
        weight: 2,
        fillColor: '#e59a18',
        fillOpacity: 0.12,
        dashArray: '4, 4',
      }).addTo(map);

      circle5Ref.current.bindTooltip(
        `<strong>5 km Primary Haat Ring</strong><br/>Population: ${economicData?.catchmentEconomics.radius5km.population.toLocaleString() || '14.5k'}`,
        { sticky: true, className: 'leaflet-custom-tooltip' }
      );

      // 10km Wholesale Ring
      if (radiusKm >= 10) {
        circle10Ref.current = L.circle([lat, lng], {
          radius: 10000,
          color: '#1e7c55',
          weight: 1.8,
          fillColor: '#1e7c55',
          fillOpacity: 0.07,
          dashArray: '5, 6',
        }).addTo(map);

        circle10Ref.current.bindTooltip(
          `<strong>10 km Wholesale Corridor</strong><br/>Monthly Pool: ₹${economicData?.catchmentEconomics.radius10km.consumptionPoolMonthlyCr || '4.8'} Cr`,
          { sticky: true, className: 'leaflet-custom-tooltip' }
        );
      }

      // 15km Hinterland Ring
      if (radiusKm === 15) {
        circle15Ref.current = L.circle([lat, lng], {
          radius: 15000,
          color: '#083b5e',
          weight: 1.5,
          fillColor: '#083b5e',
          fillOpacity: 0.04,
          dashArray: '6, 8',
        }).addTo(map);

        circle15Ref.current.bindTooltip(
          `<strong>15 km Agricultural Hinterland</strong><br/>Total Pop: ${economicData?.catchmentEconomics.radius15km.population.toLocaleString() || '98.5k'}`,
          { sticky: true, className: 'leaflet-custom-tooltip' }
        );
      }
    }
  }, [lat, lng, radiusKm, locationName, districtName, businessType, layersVisible.catchmentRings, economicData, interactive]);

  // Update Economic Layers (Mandis, MSMEs, Banks, Agri Belts)
  useEffect(() => {
    const mandiGroup = mandiLayerGroupRef.current;
    const msmeGroup = msmeLayerGroupRef.current;
    const bankGroup = bankLayerGroupRef.current;
    const agriGroup = agriLayerGroupRef.current;

    if (!mandiGroup || !msmeGroup || !bankGroup || !agriGroup) return;

    mandiGroup.clearLayers();
    msmeGroup.clearLayers();
    bankGroup.clearLayers();
    agriGroup.clearLayers();

    if (!economicData) return;

    // 1. APMC Mandis & Real-time Rates Layer
    if (layersVisible.mandis && (activeFilter === 'all' || activeFilter === 'mandi')) {
      economicData.mandiHubs.forEach((mandi) => {
        const mandiHtml = `
          <div class="relative group cursor-pointer transition-transform hover:scale-110">
            <div class="bg-amber-500 text-slate-950 font-black text-[10px] px-1.5 py-0.5 rounded-full border border-white shadow-md flex items-center gap-1 font-mono">
              <span>🏛️</span>
              <span class="truncate max-w-[80px]">${String(mandi.metricValue || 'Mandi').split(' ')[0]}</span>
            </div>
          </div>
        `;

        const icon = L.divIcon({
          html: mandiHtml,
          className: 'custom-mandi-marker',
          iconSize: [85, 24],
          iconAnchor: [42, 12],
        });

        const marker = L.marker([mandi.lat, mandi.lng], { icon });
        marker.bindPopup(`
          <div class="p-2.5 text-xs font-sans space-y-1.5 min-w-[220px]">
            <div class="flex items-center justify-between border-b border-amber-200 pb-1">
              <span class="font-black text-slate-900">${mandi.name}</span>
              <span class="bg-amber-100 text-amber-900 text-[9px] font-bold px-1.5 py-0.5 rounded">${mandi.subType}</span>
            </div>
            <div class="text-[11px] text-slate-700"><strong>Commodity:</strong> ${mandi.details?.commodity || 'Agri Produce'}</div>
            <div class="text-sm font-black text-emerald-800">${mandi.metricValue}</div>
            <div class="grid grid-cols-2 gap-1 text-[10px] text-slate-600 bg-slate-50 p-1.5 rounded">
              <div>Min: ₹${mandi.details?.minPrice}</div>
              <div>Max: ₹${mandi.details?.maxPrice}</div>
              <div>Arrivals: ${mandi.details?.arrivalsTodayTonnes} T</div>
              <div>Spread: ${mandi.details?.arbitrageSpreadPercent}%</div>
            </div>
            <div class="text-[9px] text-slate-500 italic">Source: ${mandi.details?.source || 'Agmarknet'}</div>
          </div>
        `);
        mandiGroup.addLayer(marker);
      });
    }

    // 2. MSME & Udyam Registered Clusters Layer
    if (layersVisible.msmeClusters && (activeFilter === 'all' || activeFilter === 'msme')) {
      economicData.msmeClusters.forEach((msme) => {
        const msmeHtml = `
          <div class="relative group cursor-pointer transition-transform hover:scale-110">
            <div class="bg-purple-700 text-white font-bold text-[10px] px-1.5 py-0.5 rounded-full border border-white shadow-md flex items-center gap-1 font-mono">
              <span>🏭</span>
              <span class="truncate max-w-[80px]">${msme.details?.nicCode || 'MSME'}</span>
            </div>
          </div>
        `;

        const icon = L.divIcon({
          html: msmeHtml,
          className: 'custom-msme-marker',
          iconSize: [85, 24],
          iconAnchor: [42, 12],
        });

        const marker = L.marker([msme.lat, msme.lng], { icon });
        marker.bindPopup(`
          <div class="p-2.5 text-xs font-sans space-y-1.5 min-w-[220px]">
            <div class="flex items-center justify-between border-b border-purple-200 pb-1">
              <span class="font-black text-slate-900">${msme.name}</span>
              <span class="bg-purple-100 text-purple-900 text-[9px] font-bold px-1.5 py-0.5 rounded">${msme.statusBadge}</span>
            </div>
            <div class="text-[11px] text-slate-700">${msme.subType}</div>
            <div class="text-xs font-bold text-purple-900">${msme.metricValue}</div>
            <div class="text-[10px] text-slate-600 bg-slate-50 p-1.5 rounded space-y-0.5">
              <div><strong>NIC Code:</strong> ${msme.details?.nicCode}</div>
              <div><strong>Est. Annual Turnover:</strong> ₹${msme.details?.annualTurnoverEstCr} Cr</div>
              <div><strong>Support Link:</strong> ${msme.details?.clusterSchemeLink}</div>
            </div>
          </div>
        `);
        msmeGroup.addLayer(marker);
      });
    }

    // 3. Banking & Credit Kiosks Layer
    if (layersVisible.banking && (activeFilter === 'all' || activeFilter === 'bank')) {
      economicData.bankingKiosks.forEach((bank) => {
        const bankHtml = `
          <div class="relative group cursor-pointer transition-transform hover:scale-110">
            <div class="bg-blue-700 text-white font-bold text-[10px] px-1.5 py-0.5 rounded-full border border-white shadow-md flex items-center gap-1 font-mono">
              <span>🏦</span>
              <span>CD: ${bank.metricValue}</span>
            </div>
          </div>
        `;

        const icon = L.divIcon({
          html: bankHtml,
          className: 'custom-bank-marker',
          iconSize: [75, 24],
          iconAnchor: [37, 12],
        });

        const marker = L.marker([bank.lat, bank.lng], { icon });
        marker.bindPopup(`
          <div class="p-2.5 text-xs font-sans space-y-1.5 min-w-[220px]">
            <div class="flex items-center justify-between border-b border-blue-200 pb-1">
              <span class="font-black text-slate-900">${bank.name}</span>
              <span class="bg-blue-100 text-blue-900 text-[9px] font-bold px-1.5 py-0.5 rounded">${bank.statusBadge}</span>
            </div>
            <div class="text-[11px] text-slate-700">${bank.subType}</div>
            <div class="text-[10px] text-slate-600 bg-slate-50 p-1.5 rounded space-y-0.5">
              <div><strong>IFSC / Code:</strong> ${bank.details?.ifsc}</div>
              <div><strong>CD Ratio:</strong> ${bank.metricValue}</div>
              <div><strong>Turnaround Time:</strong> ~${bank.details?.avgLoanDisbursalDays} days</div>
              <div><strong>Schemes:</strong> ${bank.details?.schemesSupported}</div>
            </div>
          </div>
        `);
        bankGroup.addLayer(marker);
      });
    }

    // 4. Agricultural & Farmgate Belts Layer
    if (layersVisible.agriBelts && (activeFilter === 'all' || activeFilter === 'agri')) {
      economicData.agriculturalBelts.forEach((agri) => {
        const agriHtml = `
          <div class="relative group cursor-pointer transition-transform hover:scale-110">
            <div class="bg-emerald-700 text-white font-bold text-[10px] px-1.5 py-0.5 rounded-full border border-white shadow-md flex items-center gap-1 font-mono">
              <span>🌾</span>
              <span class="truncate max-w-[70px]">${agri.subType}</span>
            </div>
          </div>
        `;

        const icon = L.divIcon({
          html: agriHtml,
          className: 'custom-agri-marker',
          iconSize: [75, 24],
          iconAnchor: [37, 12],
        });

        const marker = L.marker([agri.lat, agri.lng], { icon });
        marker.bindPopup(`
          <div class="p-2.5 text-xs font-sans space-y-1.5 min-w-[220px]">
            <div class="flex items-center justify-between border-b border-emerald-200 pb-1">
              <span class="font-black text-slate-900">${agri.name}</span>
              <span class="bg-emerald-100 text-emerald-900 text-[9px] font-bold px-1.5 py-0.5 rounded">${agri.statusBadge}</span>
            </div>
            <div class="text-xs font-bold text-emerald-800">${agri.metricValue}</div>
            <div class="text-[10px] text-slate-600 bg-slate-50 p-1.5 rounded space-y-0.5">
              <div><strong>Crop/Produce:</strong> ${agri.details?.crop}</div>
              <div><strong>Procurement Season:</strong> ${agri.details?.season}</div>
              <div><strong>Advantage:</strong> ${agri.details?.inputCostSavings}</div>
            </div>
          </div>
        `);
        agriGroup.addLayer(marker);
      });
    }
  }, [economicData, layersVisible, activeFilter]);

  // Update Standard POIs
  useEffect(() => {
    const poiGroup = poiLayerGroupRef.current;
    if (!poiGroup) return;

    poiGroup.clearLayers();

    if (!layersVisible.pois) return;

    const filteredPois = pois.filter((p) => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'competitor' && p.category === 'competitor') return true;
      return false;
    });

    filteredPois.forEach((poi) => {
      const bgColor = poi.category === 'competitor' ? '#9b3430' : poi.category === 'mandi' ? '#e59a18' : poi.category === 'supplier' ? '#083b5e' : '#1e7c55';
      const label = poi.category === 'competitor' ? 'C' : poi.category === 'mandi' ? 'M' : poi.category === 'supplier' ? 'S' : 'F';

      const poiHtml = `
        <div class="relative group cursor-pointer transition-transform hover:scale-125">
          <div style="background-color: ${bgColor}" class="w-5 h-5 rounded-full border border-white shadow-md flex items-center justify-center text-white text-[10px] font-black">
            ${label}
          </div>
        </div>
      `;

      const poiIcon = L.divIcon({
        html: poiHtml,
        className: 'custom-poi-marker',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const marker = L.marker([poi.lat, poi.lng], { icon: poiIcon });
      marker.bindPopup(`
        <div class="p-2 text-xs font-sans space-y-1">
          <div class="font-bold text-slate-900">${poi.name}</div>
          <div class="text-[11px] text-slate-600 font-medium">${poi.subType}</div>
          <div class="text-[10px] text-slate-500">Distance: <span class="font-bold text-[#083b5e]">${poi.distanceKm} km</span> from hub</div>
          <div class="text-[9px] uppercase tracking-wider font-bold" style="color: ${bgColor}">${poi.category}</div>
        </div>
      `);

      poiGroup.addLayer(marker);
    });
  }, [pois, layersVisible.pois, activeFilter]);

  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView([lat, lng], radiusKm === 5 ? 13 : radiusKm === 10 ? 12 : 11, {
      animate: true,
    });
  };

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-slate-300 shadow-md bg-slate-100 transition-all ${
        isFullscreen ? 'fixed inset-3 z-50 h-[calc(100vh-1.5rem)]' : heightClass || 'h-88 sm:h-[420px]'
      }`}
    >
      {/* Leaflet Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Header Overlay */}
      <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200 shadow-md text-xs flex flex-wrap items-center gap-2 max-w-[calc(100%-120px)]">
        <MapPin className="w-4 h-4 text-[#083b5e] shrink-0" />
        <span className="font-black text-slate-900 truncate">{locationName}, {districtName}</span>
        <span className="text-slate-300 hidden sm:inline">|</span>
        <span className="text-slate-600 font-mono text-[11px] hidden sm:inline">{lat.toFixed(4)}°, {lng.toFixed(4)}°</span>
        <span className="bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full text-[10px] font-mono">
          {radiusKm}km Catchment
        </span>
        {economicData?.isRealTime && (
          <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
            Real-Time Live GIS
          </span>
        )}
      </div>

      {/* Floating Control Toolbar (Top Right) */}
      <div className="absolute top-3 right-12 z-[1000] flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 shadow-md">
        {/* Recenter */}
        <button
          onClick={handleRecenter}
          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 transition-colors cursor-pointer"
          title="Recenter Map on Hub centroid"
        >
          <Crosshair className="w-4 h-4 text-[#083b5e]" />
        </button>

        {/* Layer Manager Drawer Toggle */}
        <button
          onClick={() => setLayerDrawerOpen(!layerDrawerOpen)}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold ${
            layerDrawerOpen ? 'bg-[#083b5e] text-white shadow' : 'hover:bg-slate-100 text-slate-700'
          }`}
          title="Toggle Geo-Economic Map Layers & Basemaps"
        >
          <Layers2 className="w-4 h-4" />
          <span className="hidden sm:inline">Layers</span>
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 transition-colors cursor-pointer"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Interactive Map'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Layer Management Drawer (Collapsible Dropdown) */}
      {layerDrawerOpen && (
        <div className="absolute top-14 right-3 z-[1000] w-72 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200 shadow-2xl space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="font-black text-slate-900 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#083b5e]" />
              <span>Interactive Map Layers</span>
            </div>
            <button
              onClick={() => setLayerDrawerOpen(false)}
              className="text-slate-400 hover:text-slate-700 text-xs font-bold"
            >
              ✕
            </button>
          </div>

          {/* Base Map Switcher */}
          <div>
            <div className="text-[10px] font-black uppercase text-slate-400 mb-1.5">Basemap Style</div>
            <div className="grid grid-cols-3 gap-1">
              {(['osm', 'positron', 'satellite'] as BaseTileLayer[]).map((tile) => (
                <button
                  key={tile}
                  onClick={() => setBaseTile(tile)}
                  className={`px-2 py-1 rounded text-[10px] font-bold capitalize transition-all cursor-pointer ${
                    baseTile === tile ? 'bg-[#083b5e] text-white shadow' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {tile}
                </button>
              ))}
            </div>
          </div>

          {/* Geo-Economic Overlays */}
          <div>
            <div className="text-[10px] font-black uppercase text-slate-400 mb-1.5">Economic Overlays</div>
            <div className="space-y-1.5">
              <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  <span className="font-semibold text-slate-800">APMC Mandis & Arbitrage</span>
                </div>
                <input
                  type="checkbox"
                  checked={layersVisible.mandis}
                  onChange={(e) => setLayersVisible({ ...layersVisible, mandis: e.target.checked })}
                  className="rounded text-[#083b5e]"
                />
              </label>

              <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-700 inline-block" />
                  <span className="font-semibold text-slate-800">Udyam MSME Clusters</span>
                </div>
                <input
                  type="checkbox"
                  checked={layersVisible.msmeClusters}
                  onChange={(e) => setLayersVisible({ ...layersVisible, msmeClusters: e.target.checked })}
                  className="rounded text-[#083b5e]"
                />
              </label>

              <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                  <span className="font-semibold text-slate-800">Banking & CSP Nodes</span>
                </div>
                <input
                  type="checkbox"
                  checked={layersVisible.banking}
                  onChange={(e) => setLayersVisible({ ...layersVisible, banking: e.target.checked })}
                  className="rounded text-[#083b5e]"
                />
              </label>

              <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                  <span className="font-semibold text-slate-800">Agri Belts & Farmgate</span>
                </div>
                <input
                  type="checkbox"
                  checked={layersVisible.agriBelts}
                  onChange={(e) => setLayersVisible({ ...layersVisible, agriBelts: e.target.checked })}
                  className="rounded text-[#083b5e]"
                />
              </label>

              <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                  <span className="font-semibold text-slate-800">5/10/15km Catchment Rings</span>
                </div>
                <input
                  type="checkbox"
                  checked={layersVisible.catchmentRings}
                  onChange={(e) => setLayersVisible({ ...layersVisible, catchmentRings: e.target.checked })}
                  className="rounded text-[#083b5e]"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Quick Category Filter Pills (Bottom Left) */}
      <div className="absolute bottom-3 left-3 z-[1000] flex flex-wrap items-center gap-1 bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 shadow-md text-[11px] font-bold max-w-[calc(100%-24px)]">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
            activeFilter === 'all' ? 'bg-[#083b5e] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Layers
        </button>
        <button
          onClick={() => setActiveFilter('mandi')}
          className={`px-2 py-0.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
            activeFilter === 'mandi' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>🏛️</span>
          <span>Mandis ({economicData?.mandiHubs.length || 0})</span>
        </button>
        <button
          onClick={() => setActiveFilter('msme')}
          className={`px-2 py-0.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
            activeFilter === 'msme' ? 'bg-purple-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>🏭</span>
          <span>MSME ({economicData?.msmeClusters.length || 0})</span>
        </button>
        <button
          onClick={() => setActiveFilter('bank')}
          className={`px-2 py-0.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
            activeFilter === 'bank' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>🏦</span>
          <span>Banks ({economicData?.bankingKiosks.length || 0})</span>
        </button>
        <button
          onClick={() => setActiveFilter('agri')}
          className={`px-2 py-0.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
            activeFilter === 'agri' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>🌾</span>
          <span>Agri ({economicData?.agriculturalBelts.length || 0})</span>
        </button>
      </div>

      {/* Map Interactive Drag Hint (Bottom Right) */}
      <div className="hidden sm:flex absolute bottom-3 right-3 z-[1000] bg-slate-900/80 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-[10px] items-center gap-1.5 shadow">
        <Info className="w-3 h-3 text-amber-300" />
        <span>Click pin to inspect details · Drag to relocate centroid</span>
      </div>
    </div>
  );
};
