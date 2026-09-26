import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { EnterpriseState } from './dashboardTypes';
import {
  TrendingUp,
  ArrowRight,
  Sparkles,
  Volume2,
  RefreshCw,
  Clock,
  Layers,
  Flame,
  Truck,
  DollarSign,
  BarChart3,
  CheckCircle2,
  Info,
  Sliders,
  Scale,
  Zap,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface MarketTrendsModuleProps {
  enterprise: EnterpriseState;
  onProceedNext: () => void;
  onSpeak: (text: string) => void;
}

interface CommodityArbitrageData {
  id: string;
  name: string;
  category: string;
  unit: string;
  farmgateRate: number;
  localHaatRate: number;
  apmcMandiRate: number;
  terminalRetailRate: number;
  spreadPercentage: number;
  bestArbitrageRoute: string;
  netMarginPerUnit: number;
  historicalDays: Array<{
    date: Date;
    farmgate: number;
    apmc: number;
    retail: number;
    volumeTonnes: number;
  }>;
  mandis: Array<{
    name: string;
    distanceKm: number;
    modalPrice: number;
    arrivalsTonnes: number;
    freightCostPerUnit: number;
    netRealization: number;
    trend: 'up' | 'down' | 'stable';
    tier: string;
  }>;
}

const COMMODITIES_DATABASE: Record<string, CommodityArbitrageData> = {
  tea: {
    id: 'tea',
    name: 'Green Tea Leaf & CTC Blend',
    category: 'Plantation & Beverage',
    unit: '₹ / kg',
    farmgateRate: 34,
    localHaatRate: 42,
    apmcMandiRate: 68,
    terminalRetailRate: 280,
    spreadPercentage: 62.5,
    bestArbitrageRoute: 'Banarhat Farmgate ➔ Siliguri Tea Auction Depot',
    netMarginPerUnit: 18.4,
    historicalDays: generateHistoricalData(34, 68, 280, 180),
    mandis: [
      {
        name: 'Dhupguri Regulated APMC Market Yard',
        distanceKm: 14.2,
        modalPrice: 62,
        arrivalsTonnes: 185,
        freightCostPerUnit: 2.2,
        netRealization: 59.8,
        trend: 'up',
        tier: 'Tier 1 (e-NAM Live)',
      },
      {
        name: 'Siliguri Tea Auction Committee (STAC)',
        distanceKm: 62.0,
        modalPrice: 78,
        arrivalsTonnes: 4200,
        freightCostPerUnit: 6.5,
        netRealization: 71.5,
        trend: 'up',
        tier: 'Tier 1 (e-NAM Live)',
      },
      {
        name: 'Banarhat STG Aggregation Shed',
        distanceKm: 11.5,
        modalPrice: 48,
        arrivalsTonnes: 68,
        freightCostPerUnit: 1.8,
        netRealization: 46.2,
        trend: 'stable',
        tier: 'Tier 3 (Weekly Haat)',
      },
      {
        name: 'Gairkata Weekly Friday Haat (NH517)',
        distanceKm: 2.4,
        modalPrice: 44,
        arrivalsTonnes: 22,
        freightCostPerUnit: 0.5,
        netRealization: 43.5,
        trend: 'down',
        tier: 'Tier 4 (VLE Crowdsource)',
      },
    ],
  },
  paddy: {
    id: 'paddy',
    name: 'Paddy / Basmati & Coarse Grain',
    category: 'Cereals & Grains',
    unit: '₹ / quintal',
    farmgateRate: 2180,
    localHaatRate: 2320,
    apmcMandiRate: 2650,
    terminalRetailRate: 3800,
    spreadPercentage: 21.5,
    bestArbitrageRoute: 'Block Farmgate ➔ Central District Regulated APMC',
    netMarginPerUnit: 390,
    historicalDays: generateHistoricalData(2180, 2650, 3800, 1200),
    mandis: [
      {
        name: 'District Central APMC Grain Yard',
        distanceKm: 18.0,
        modalPrice: 2680,
        arrivalsTonnes: 850,
        freightCostPerUnit: 85,
        netRealization: 2595,
        trend: 'up',
        tier: 'Tier 1 (e-NAM Live)',
      },
      {
        name: 'Regional FCI Procurement Depot',
        distanceKm: 26.5,
        modalPrice: 2300,
        arrivalsTonnes: 1450,
        freightCostPerUnit: 110,
        netRealization: 2190,
        trend: 'stable',
        tier: 'Tier 1 (MSP Mandate)',
      },
      {
        name: 'Sub-Division Agro Haat',
        distanceKm: 6.5,
        modalPrice: 2420,
        arrivalsTonnes: 120,
        freightCostPerUnit: 35,
        netRealization: 2385,
        trend: 'down',
        tier: 'Tier 2 (Historical APMC)',
      },
    ],
  },
  dairy: {
    id: 'dairy',
    name: 'Cow Milk (Fat 4.2% / SNF 8.5%)',
    category: 'Dairy & Animal Husbandry',
    unit: '₹ / liter',
    farmgateRate: 36,
    localHaatRate: 42,
    apmcMandiRate: 52,
    terminalRetailRate: 66,
    spreadPercentage: 44.4,
    bestArbitrageRoute: 'Village SHG BMC ➔ City Processing Cooperative Dairy',
    netMarginPerUnit: 12.8,
    historicalDays: generateHistoricalData(36, 52, 66, 85),
    mandis: [
      {
        name: 'Cooperative Dairy Chilling Center',
        distanceKm: 8.5,
        modalPrice: 53,
        arrivalsTonnes: 65,
        freightCostPerUnit: 1.5,
        netRealization: 51.5,
        trend: 'up',
        tier: 'Tier 1 (e-NAM Live)',
      },
      {
        name: 'Urban Bulk Milk Distribution Hub',
        distanceKm: 34.0,
        modalPrice: 58,
        arrivalsTonnes: 210,
        freightCostPerUnit: 3.8,
        netRealization: 54.2,
        trend: 'up',
        tier: 'Tier 1 (e-NAM Live)',
      },
      {
        name: 'Local Sweetmakers & Khoya Guild',
        distanceKm: 3.2,
        modalPrice: 47,
        arrivalsTonnes: 14,
        freightCostPerUnit: 0.6,
        netRealization: 46.4,
        trend: 'stable',
        tier: 'Tier 3 (Local Trade)',
      },
    ],
  },
  spices: {
    id: 'spices',
    name: 'Turmeric & Ginger Rhizomes',
    category: 'Spices & Horticulture',
    unit: '₹ / kg',
    farmgateRate: 72,
    localHaatRate: 88,
    apmcMandiRate: 135,
    terminalRetailRate: 240,
    spreadPercentage: 53.4,
    bestArbitrageRoute: 'Organic Cluster ➔ State Spices Export Board Yard',
    netMarginPerUnit: 48.0,
    historicalDays: generateHistoricalData(72, 135, 240, 45),
    mandis: [
      {
        name: 'State Spices Board Auction Yard',
        distanceKm: 42.0,
        modalPrice: 142,
        arrivalsTonnes: 120,
        freightCostPerUnit: 7.2,
        netRealization: 134.8,
        trend: 'up',
        tier: 'Tier 1 (e-NAM Live)',
      },
      {
        name: 'Central District Regulated Mandi',
        distanceKm: 16.5,
        modalPrice: 128,
        arrivalsTonnes: 45,
        freightCostPerUnit: 3.0,
        netRealization: 125.0,
        trend: 'up',
        tier: 'Tier 2 (Historical APMC)',
      },
      {
        name: 'Block Primary Producers Market',
        distanceKm: 5.0,
        modalPrice: 98,
        arrivalsTonnes: 18,
        freightCostPerUnit: 1.2,
        netRealization: 96.8,
        trend: 'stable',
        tier: 'Tier 3 (Weekly Haat)',
      },
    ],
  },
};

function generateHistoricalData(baseFarm: number, baseApmc: number, baseRetail: number, baseVol: number) {
  const result = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 3600 * 1000);
    const noise = Math.sin(i / 3) * 0.08 + (Math.random() - 0.5) * 0.04;
    const farmgate = Math.round(baseFarm * (1 + noise * 0.6));
    const apmc = Math.round(baseApmc * (1 + noise * 1.2));
    const retail = Math.round(baseRetail * (1 + noise * 0.4));
    const volNoise = Math.cos(i / 4) * 0.25 + (Math.random() - 0.5) * 0.15;
    const volumeTonnes = Math.round(baseVol * (1 + volNoise));

    result.push({
      date: d,
      farmgate,
      apmc,
      retail,
      volumeTonnes,
    });
  }
  return result;
}

export const MarketTrendsModule: React.FC<MarketTrendsModuleProps> = ({
  enterprise,
  onProceedNext,
  onSpeak,
}) => {
  const { t } = useLanguage();
  const d3ChartRef = useRef<SVGSVGElement | null>(null);
  const d3ArbitrageFlowRef = useRef<SVGSVGElement | null>(null);

  // Active Selected Commodity
  const [selectedCommodityKey, setSelectedCommodityKey] = useState<string>(() => {
    const type = enterprise.businessType.toLowerCase();
    if (type.includes('tea') || type.includes('leaf')) return 'tea';
    if (type.includes('dairy') || type.includes('milk')) return 'dairy';
    if (type.includes('spice') || type.includes('turmeric') || type.includes('ginger')) return 'spices';
    return 'tea';
  });

  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('30d');
  const [hoveredPoint, setHoveredPoint] = useState<any | null>(null);
  const [simulationVehicle, setSimulationVehicle] = useState<'tata_ace' | 'pickup' | 'tractor'>('tata_ace');
  const [customDistanceKm, setCustomDistanceKm] = useState<number>(35);

  const activeData = useMemo(() => {
    return COMMODITIES_DATABASE[selectedCommodityKey] || COMMODITIES_DATABASE.tea;
  }, [selectedCommodityKey]);

  // Vehicle fuel/freight rates per km
  const vehicleFreightRatePerKm = {
    tata_ace: 18, // ₹18/km (1.5 ton capacity)
    pickup: 25, // ₹25/km (2.5 ton capacity)
    tractor: 32, // ₹32/km (4 ton trolley)
  }[simulationVehicle];

  const vehicleCapacityUnits = {
    tata_ace: 1200,
    pickup: 2200,
    tractor: 3800,
  }[simulationVehicle];

  const computedTripFreightPerUnit = Math.round(
    ((customDistanceKm * 2 * vehicleFreightRatePerKm) / vehicleCapacityUnits) * 10
  ) / 10;

  const computedArbitrageSpread = activeData.apmcMandiRate - activeData.farmgateRate;
  const computedNetGainPerUnit = Math.max(0, computedArbitrageSpread - computedTripFreightPerUnit);
  const computedTotalTripProfit = Math.round(computedNetGainPerUnit * vehicleCapacityUnits);

  // Narration helper
  const narration = `Real-time agricultural arbitrage telemetry for ${activeData.name} in ${enterprise.locationName}, ${enterprise.districtName}. Farmgate buying price is currently ${activeData.farmgateRate} ${activeData.unit}, compared to ${activeData.apmcMandiRate} in the regional APMC yard, and ${activeData.terminalRetailRate} in the terminal market. Transporting via the ${activeData.bestArbitrageRoute} yields a net spread of ${activeData.spreadPercentage} percent after freight.`;

  // =========================================
  // D3.js MAIN TIME-SERIES ARBITRAGE VISUALIZATION
  // =========================================
  useEffect(() => {
    if (!d3ChartRef.current) return;

    const svg = d3.select(d3ChartRef.current);
    svg.selectAll('*').remove();

    const width = 740;
    const height = 300;
    const margin = { top: 24, right: 36, bottom: 36, left: 56 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const dataToRender = timeRange === '7d' ? activeData.historicalDays.slice(-7) : activeData.historicalDays;

    // X Scale (Date)
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(dataToRender, (d) => d.date) as [Date, Date])
      .range([0, innerWidth]);

    // Y Scale (Price)
    const yMax = (d3.max(dataToRender, (d) => d.retail) || 300) * 1.1;
    const yScale = d3.scaleLinear().domain([0, yMax]).range([innerHeight, 0]).nice();

    // Volume Secondary Scale (for background bars)
    const maxVol = d3.max(dataToRender, (d) => d.volumeTonnes) || 100;
    const yVolScale = d3.scaleLinear().domain([0, maxVol]).range([innerHeight, innerHeight * 0.65]);

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(
        d3
          .axisLeft(yScale)
          .ticks(5)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
      )
      .selectAll('line')
      .attr('stroke', 'rgba(25, 25, 112, 0.07)')
      .attr('stroke-dasharray', '3,3');

    // Defs Gradients
    const defs = svg.append('defs');

    // Area Arbitrage Spread Gradient (Between APMC and Farmgate)
    const spreadGradient = defs
      .append('linearGradient')
      .attr('id', 'spreadAreaGrad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    spreadGradient.append('stop').attr('offset', '0%').attr('stop-color', '#FF671F').attr('stop-opacity', 0.35);
    spreadGradient.append('stop').attr('offset', '100%').attr('stop-color', '#046A38').attr('stop-opacity', 0.05);

    // Background Arrival Volume Bars
    const barWidth = Math.max(4, innerWidth / dataToRender.length - 6);
    g.selectAll('.vol-bar')
      .data(dataToRender)
      .enter()
      .append('rect')
      .attr('class', 'vol-bar')
      .attr('x', (d) => xScale(d.date) - barWidth / 2)
      .attr('y', (d) => yVolScale(d.volumeTonnes))
      .attr('width', barWidth)
      .attr('height', (d) => innerHeight - yVolScale(d.volumeTonnes))
      .attr('fill', 'rgba(25, 25, 112, 0.06)')
      .attr('rx', 2);

    // Area Spread Generator (Between Farmgate and APMC)
    const areaSpread = d3
      .area<any>()
      .x((d) => xScale(d.date))
      .y0((d) => yScale(d.farmgate))
      .y1((d) => yScale(d.apmc))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(dataToRender)
      .attr('fill', 'url(#spreadAreaGrad)')
      .attr('d', areaSpread);

    // Line Generators
    const lineRetail = d3
      .line<any>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.retail))
      .curve(d3.curveMonotoneX);

    const lineApmc = d3
      .line<any>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.apmc))
      .curve(d3.curveMonotoneX);

    const lineFarm = d3
      .line<any>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.farmgate))
      .curve(d3.curveMonotoneX);

    // Render Retail Line (Purple/Indigo)
    g.append('path')
      .datum(dataToRender)
      .attr('fill', 'none')
      .attr('stroke', '#6366f1')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4,3')
      .attr('d', lineRetail);

    // Render APMC Mandi Line (Saffron)
    g.append('path')
      .datum(dataToRender)
      .attr('fill', 'none')
      .attr('stroke', '#FF671F')
      .attr('stroke-width', 3)
      .attr('d', lineApmc);

    // Render Farmgate Line (Emerald Green)
    g.append('path')
      .datum(dataToRender)
      .attr('fill', 'none')
      .attr('stroke', '#046A38')
      .attr('stroke-width', 2.5)
      .attr('d', lineFarm);

    // Render Data Circles on Points
    dataToRender.forEach((d) => {
      // APMC Point
      g.append('circle')
        .attr('cx', xScale(d.date))
        .attr('cy', yScale(d.apmc))
        .attr('r', 3.5)
        .attr('fill', '#ffffff')
        .attr('stroke', '#FF671F')
        .attr('stroke-width', 2);

      // Farmgate Point
      g.append('circle')
        .attr('cx', xScale(d.date))
        .attr('cy', yScale(d.farmgate))
        .attr('r', 3)
        .attr('fill', '#ffffff')
        .attr('stroke', '#046A38')
        .attr('stroke-width', 2);
    });

    // X Axis
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(timeRange === '7d' ? 7 : 8)
      .tickFormat((d) => d3.timeFormat('%b %d')(d as Date));

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .attr('fill', '#64748b')
      .attr('font-size', '10px')
      .attr('font-family', 'ui-monospace, monospace');

    // Y Axis
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(5)
      .tickFormat((d) => `₹${d}`);

    g.append('g')
      .call(yAxis)
      .selectAll('text')
      .attr('fill', '#64748b')
      .attr('font-size', '10px')
      .attr('font-family', 'ui-monospace, monospace');

    // Interactive Overlay for crosshairs
    const bisectDate = d3.bisector((d: any) => d.date).left;

    const crosshair = g.append('g').style('display', 'none');

    crosshair
      .append('line')
      .attr('class', 'crosshair-line')
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#191970')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '3,3');

    const focusCircleApmc = crosshair.append('circle').attr('r', 5).attr('fill', '#FF671F').attr('stroke', '#fff').attr('stroke-width', 2);
    const focusCircleFarm = crosshair.append('circle').attr('r', 5).attr('fill', '#046A38').attr('stroke', '#fff').attr('stroke-width', 2);

    svg
      .append('rect')
      .attr('transform', `translate(${margin.left},${margin.top})`)
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .on('mouseover', () => crosshair.style('display', null))
      .on('mouseout', () => {
        crosshair.style('display', 'none');
        setHoveredPoint(null);
      })
      .on('mousemove', function (event) {
        const [xPos] = d3.pointer(event);
        const x0 = xScale.invert(xPos);
        const i = bisectDate(dataToRender, x0, 1);
        const d0 = dataToRender[i - 1];
        const d1 = dataToRender[i];
        if (!d0) return;
        const d = !d1 || x0.getTime() - d0.date.getTime() < d1.date.getTime() - x0.getTime() ? d0 : d1;

        const x = xScale(d.date);
        crosshair.select('.crosshair-line').attr('transform', `translate(${x}, 0)`);
        focusCircleApmc.attr('transform', `translate(${x}, ${yScale(d.apmc)})`);
        focusCircleFarm.attr('transform', `translate(${x}, ${yScale(d.farmgate)})`);

        setHoveredPoint(d);
      });
  }, [activeData, timeRange]);

  // =========================================
  // D3.js ARBITRAGE VALUE-ADD ESCALATION SANKEY / CORRIDOR
  // =========================================
  useEffect(() => {
    if (!d3ArbitrageFlowRef.current) return;

    const svg = d3.select(d3ArbitrageFlowRef.current);
    svg.selectAll('*').remove();

    const width = 740;
    const height = 120;
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const nodes = [
      { id: 'farm', label: '1. Farmgate Base', sub: 'Village Producers', price: activeData.farmgateRate, color: '#046A38', x: 70 },
      { id: 'haat', label: '2. Local Gram Haat', sub: 'Primary Aggregation', price: activeData.localHaatRate, color: '#0284c7', x: 250 },
      { id: 'apmc', label: '3. Regulated APMC', sub: 'Wholesale Mandi', price: activeData.apmcMandiRate, color: '#FF671F', x: 450 },
      { id: 'retail', label: '4. Terminal Retail', sub: 'Consumer Packed', price: activeData.terminalRetailRate, color: '#4338ca', x: 650 },
    ];

    // Flow connecting curves between stages
    for (let i = 0; i < nodes.length - 1; i++) {
      const src = nodes[i];
      const dst = nodes[i + 1];
      const spread = dst.price - src.price;

      // Link path
      const pathData = `M ${src.x + 45} 55 C ${(src.x + dst.x) / 2} 40, ${(src.x + dst.x) / 2} 40, ${dst.x - 45} 55`;

      svg
        .append('path')
        .attr('d', pathData)
        .attr('fill', 'none')
        .attr('stroke', dst.color)
        .attr('stroke-width', 3)
        .attr('stroke-opacity', 0.6)
        .attr('stroke-dasharray', '4,4')
        .attr('class', 'animate-pulse');

      // Spread tag
      svg
        .append('rect')
        .attr('x', (src.x + dst.x) / 2 - 32)
        .attr('y', 28)
        .attr('width', 64)
        .attr('height', 18)
        .attr('rx', 9)
        .attr('fill', '#ffffff')
        .attr('stroke', dst.color)
        .attr('stroke-width', 1.2);

      svg
        .append('text')
        .attr('x', (src.x + dst.x) / 2)
        .attr('y', 41)
        .attr('text-anchor', 'middle')
        .attr('fill', dst.color)
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .attr('font-family', 'ui-monospace, monospace')
        .text(`+₹${spread}`);
    }

    // Node Badges
    nodes.forEach((n) => {
      const g = svg.append('g').attr('transform', `translate(${n.x}, 55)`);

      // Circle Base
      g.append('circle').attr('r', 24).attr('fill', '#ffffff').attr('stroke', n.color).attr('stroke-width', 3).attr('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.08))');

      // Center Price
      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '4px')
        .attr('fill', n.color)
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .attr('font-family', 'ui-monospace, monospace')
        .text(`₹${n.price}`);

      // Label Above
      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('y', -32)
        .attr('fill', '#1e293b')
        .attr('font-size', '11px')
        .attr('font-weight', 'bold')
        .text(n.label);

      // Subtitle Below
      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('y', 36)
        .attr('fill', '#64748b')
        .attr('font-size', '9px')
        .text(n.sub);
    });
  }, [activeData]);

  return (
    <div className="space-y-6">
      {/* Product Hero Header Banner */}
      <div className="bg-gradient-to-r from-[#083b5e] via-[#0d4f7d] to-[#123624] text-white p-6 sm:p-7 rounded-3xl shadow-xl border border-amber-400/40 relative overflow-hidden">
        <div className="max-w-3xl space-y-2.5 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full font-mono flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-[#101010]" />
              D3 Real-Time Arbitrage Engine
            </span>
            <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              e-NAM / Agmarknet Live Telemetry Active
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Agricultural Market Trends & Price Arbitrage Spreads
          </h2>
          <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
            Eliminate intermediary commission leakages. Visualize real-time price variances between farmgate buying rates, local weekly haats, regulated APMC yards, and consumer retail terminal markets across your regional cluster.
          </p>

          {/* Commodity Switcher Pills */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            {Object.entries(COMMODITIES_DATABASE).map(([k, c]) => (
              <button
                key={k}
                type="button"
                onClick={() => setSelectedCommodityKey(k)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                  selectedCommodityKey === k
                    ? 'bg-amber-400 text-slate-950 font-black ring-2 ring-white/50 scale-105'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
                }`}
              >
                <span>{c.name}</span>
                {selectedCommodityKey === k && <Sparkles className="w-3.5 h-3.5 text-slate-950" />}
              </button>
            ))}

            <button
              type="button"
              onClick={() => onSpeak(narration)}
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 border border-white/20 transition-all cursor-pointer ml-auto"
            >
              <Volume2 className="w-4 h-4 text-amber-300" />
              <span>Listen</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 Real-Time Arbitrage Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Farmgate Base */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Farmgate Buying Rate</div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-800 mt-1 font-mono">
            ₹{activeData.farmgateRate} <span className="text-xs font-normal text-slate-500">{activeData.unit}</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Direct Village Gate Floor</span>
          </div>
        </div>

        {/* APMC Mandi Modal */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Regulated APMC Rate</div>
          <div className="text-2xl sm:text-3xl font-black text-[#FF671F] mt-1 font-mono">
            ₹{activeData.apmcMandiRate} <span className="text-xs font-normal text-slate-500">{activeData.unit}</span>
          </div>
          <div className="text-[11px] text-amber-700 font-semibold mt-0.5 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>e-NAM Central Spot Rate</span>
          </div>
        </div>

        {/* Spread Arbitrage Opportunity */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/70 p-5 rounded-2xl border border-amber-300 shadow-xs relative overflow-hidden">
          <div className="text-[11px] font-black text-[#c24b10] uppercase tracking-wider flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-[#FF671F]" />
            <span>Gross Arbitrage Spread</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#101010] mt-1 font-mono">
            +{activeData.spreadPercentage.toFixed(1)}%
          </div>
          <div className="text-[11px] text-[#c24b10] font-bold mt-0.5">
            +₹{computedArbitrageSpread} {activeData.unit} Margin Window
          </div>
        </div>

        {/* Terminal Consumer Retail */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Terminal Retail Realization</div>
          <div className="text-2xl sm:text-3xl font-black text-indigo-900 mt-1 font-mono">
            ₹{activeData.terminalRetailRate} <span className="text-xs font-normal text-slate-500">{activeData.unit}</span>
          </div>
          <div className="text-[11px] text-indigo-700 font-semibold mt-0.5">
            ONDC / Branded Urban Pack
          </div>
        </div>
      </div>

      {/* SECTION 1: D3 PRICE CORRIDOR & ARBITRAGE TIME-SERIES */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#083b5e]" />
              <h3 className="text-base font-bold text-slate-900">
                D3 Real-Time Price Corridor & Spread Area Analysis
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Interactive timeline showing daily APMC Mandi spikes (orange), Farmgate base floor (green), and Terminal Retail ceiling (indigo).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
              <button
                type="button"
                onClick={() => setTimeRange('7d')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  timeRange === '7d' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                7 Days (Spot)
              </button>
              <button
                type="button"
                onClick={() => setTimeRange('30d')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  timeRange === '30d' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                30 Days (Harvest Cycle)
              </button>
            </div>
          </div>
        </div>

        {/* Legend Indicators */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#FF671F]" />
              <span className="font-bold text-slate-700">APMC Mandi Rate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#046A38]" />
              <span className="font-bold text-slate-700">Farmgate Procurement</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#6366f1]" />
              <span className="font-bold text-slate-700">Terminal Retail Packed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-[#FF671F]/20 border border-[#FF671F]/40" />
              <span className="font-medium text-slate-600">Arbitrage Spread Area</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-3 bg-slate-200 rounded-xs" />
              <span className="font-medium text-slate-600">Mandi Arrivals (Tonnes)</span>
            </div>
          </div>

          {hoveredPoint && (
            <div className="bg-slate-900 text-white px-3 py-1 rounded-lg text-xs font-mono flex items-center gap-3 shadow-md animate-in fade-in">
              <span>{d3.timeFormat('%d %b')(hoveredPoint.date)}</span>
              <span className="text-[#FF671F] font-bold">APMC: ₹{hoveredPoint.apmc}</span>
              <span className="text-emerald-400 font-bold">Farm: ₹{hoveredPoint.farmgate}</span>
              <span className="text-indigo-300">Spread: +₹{hoveredPoint.apmc - hoveredPoint.farmgate}</span>
              <span className="text-slate-400">Vol: {hoveredPoint.volumeTonnes}T</span>
            </div>
          )}
        </div>

        {/* D3 Canvas SVG Container */}
        <div className="w-full overflow-x-auto no-scrollbar pt-2">
          <div className="min-w-[680px]">
            <svg ref={d3ChartRef} className="w-full h-auto drop-shadow-xs" />
          </div>
        </div>
      </div>

      {/* SECTION 2: D3 VALUE-ADD CORRIDOR ESCALATION GRAPH */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#083b5e]" />
              <span>D3 Supply-Chain Value-Add Escalation Flow</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Visualizing price accumulation across the 4 stages from farmgate to final consumer packaged shelf.
            </p>
          </div>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-mono">
            Peak Arbitrage: +₹{activeData.terminalRetailRate - activeData.farmgateRate} {activeData.unit}
          </span>
        </div>

        <div className="w-full overflow-x-auto no-scrollbar py-2">
          <div className="min-w-[680px]">
            <svg ref={d3ArbitrageFlowRef} className="w-full h-auto" />
          </div>
        </div>
      </div>

      {/* SECTION 3: REGIONAL MANDI ARBITRAGE MATRIX & FREIGHT SIMULATOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Mandis Comparison Table */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#083b5e]" />
                <span>Nearby APMC Mandi Spot Rates & Yields</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculated net realization after deducing estimated transit freight costs.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {activeData.mandis.map((m, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-[#FF671F]/40 hover:bg-white transition-all shadow-2xs space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <span className="font-bold text-sm text-slate-900">{m.name}</span>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                      <span>{m.distanceKm} km away</span>
                      <span>•</span>
                      <span className="text-slate-600 font-mono">Daily Arrivals: {m.arrivalsTonnes} Tonnes</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-semibold">{m.tier}</span>
                    </div>
                  </div>

                  <div className="text-right flex items-baseline sm:flex-col gap-2 sm:gap-0">
                    <span className="text-lg font-black text-[#083b5e] font-mono">
                      ₹{m.modalPrice} <span className="text-[10px] text-slate-500 font-normal">{activeData.unit}</span>
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 font-mono">
                      Net: ₹{m.netRealization} {activeData.unit}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-200/50 text-slate-600">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3 h-3 text-slate-400" />
                    <span>Freight deduction: ₹{m.freightCostPerUnit} {activeData.unit}</span>
                  </span>
                  <span className="font-bold text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded font-mono">
                    Net Arbitrage vs Farmgate: +₹{(m.netRealization - activeData.farmgateRate).toFixed(1)} {activeData.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Logistics & Arbitrage Simulator */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-[#083b5e] text-white p-6 rounded-3xl shadow-lg border border-amber-400/30 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5" />
                <span>Arbitrage Transport Calculator</span>
              </span>
              <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-slate-300">
                Real-Time Simulation
              </span>
            </div>

            <h4 className="text-lg font-black text-white leading-tight">
              Calculate Your Net Batch Margin
            </h4>

            {/* Vehicle Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300">Select Transport Vehicle:</label>
              <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
                {[
                  { id: 'tata_ace' as const, label: 'Mini Truck', cap: '1.2T' },
                  { id: 'pickup' as const, label: 'Pick-Up', cap: '2.2T' },
                  { id: 'tractor' as const, label: 'Tractor', cap: '3.8T' },
                ].map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSimulationVehicle(v.id)}
                    className={`py-2 px-2 rounded-xl text-center transition-all cursor-pointer ${
                      simulationVehicle === v.id
                        ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                        : 'bg-white/10 hover:bg-white/20 text-slate-200'
                    }`}
                  >
                    <div>{v.label}</div>
                    <div className="text-[9px] font-normal opacity-80">{v.cap} payload</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Distance Slider */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">Target Mandi Distance:</span>
                <span className="text-amber-300 font-mono">{customDistanceKm} km</span>
              </div>
              <input
                type="range"
                min="5"
                max="120"
                step="5"
                value={customDistanceKm}
                onChange={(e) => setCustomDistanceKm(parseInt(e.target.value, 10))}
                className="w-full accent-amber-400 cursor-pointer h-2 bg-white/20 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>5 km (Local)</span>
                <span>60 km (Regional)</span>
                <span>120 km (Inter-State)</span>
              </div>
            </div>

            {/* Simulation Results Box */}
            <div className="p-4 rounded-2xl bg-white/10 border border-white/15 space-y-2 mt-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Gross Price Difference:</span>
                <span className="font-mono text-white font-bold">+₹{computedArbitrageSpread} {activeData.unit}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-300">
                <span>Round-Trip Freight Cost:</span>
                <span className="font-mono text-rose-300">-₹{computedTripFreightPerUnit} {activeData.unit}</span>
              </div>
              <div className="pt-2 border-t border-white/15 flex justify-between items-baseline">
                <span className="text-xs font-bold text-amber-300">Net Arbitrage Realization:</span>
                <span className="text-lg font-black text-emerald-400 font-mono">
                  +₹{computedNetGainPerUnit.toFixed(1)} {activeData.unit}
                </span>
              </div>
              <div className="pt-1 flex justify-between items-baseline">
                <span className="text-xs text-slate-300">Total Net Gain per Trip:</span>
                <span className="text-xl font-black text-amber-400 font-mono">
                  +₹{computedTotalTripProfit.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-white/15 flex items-center justify-between text-[11px] text-slate-300">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Real-time arbitrage signal: HIGH</span>
            </span>
            <button
              type="button"
              onClick={onProceedNext}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <span>Next Stage →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
