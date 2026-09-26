import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { translateTextsBatch } from './src/server/translationService';
import {
  reverseGeocodeOsm,
  fetchOverpassPois,
  fetchCensusAndEconomicData,
  fetchMandiPriceAnalysis,
  fetchDistrictGeoEconomicData,
} from './src/server/spatialDataService';
import { generateComprehensiveDpr } from './src/server/dprService';
import { matchNationalSchemes } from './src/server/schemeMatchingService';
import {
  getVentureTransactions,
  recordKhataTransaction,
  parseInvoiceWithAi,
} from './src/server/khataService';
import { runMultiAgentAnalysis } from './src/server/orchestratorService';
import { getTrainingModules, evaluateQuiz } from './src/server/trainingService';
import { getAuditLogs, logAuditAction } from './src/server/adminAuditService';
import {
  KNOWLEDGE_BASE_REGISTRY,
  calculateDeterministicFinancials,
  askSwanirvarSaathi,
} from './src/server/knowledgeBaseService';
import {
  processVoiceIntent,
  chatWithVoiceSaathi,
} from './src/server/voiceIntentService';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '25mb' }));

  // =========================================
  // 1. SYSTEM HEALTH & METRICS
  // =========================================
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      platform: 'SWANIRVAR Sovereign National Backend',
      time: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
    });
  });

  // =========================================
  // 2. SPATIAL & GEOGRAPHIC INTELLIGENCE
  // =========================================
  // Reverse Geocode via OSM Nominatim
  app.get('/api/location/reverse-geocode', async (req, res) => {
    try {
      const lat = parseFloat(req.query.lat as string) || 9.9252;
      const lng = parseFloat(req.query.lng as string) || 78.1198;
      const geocoded = await reverseGeocodeOsm(lat, lng);
      res.json(geocoded);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Geocoding failed' });
    }
  });

  // Overpass API Real POIs & Competition Scan
  app.post('/api/location/scan-pois', async (req, res) => {
    try {
      const { lat, lng, radiusKm, businessType } = req.body;
      const parsedLat = parseFloat(lat) || 9.9252;
      const parsedLng = parseFloat(lng) || 78.1198;
      const parsedRadius = (parseInt(radiusKm, 10) || 10) as 5 | 10 | 15;
      const result = await fetchOverpassPois(parsedLat, parsedLng, parsedRadius, businessType || 'Rural Enterprise');
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Spatial POI scan failed' });
    }
  });

  // Census 2011 & World Bank Per Capita Income API
  app.get('/api/data/census-economic', async (req, res) => {
    try {
      const district = (req.query.district as string) || 'Madurai';
      const state = (req.query.state as string) || 'Tamil Nadu';
      const data = await fetchCensusAndEconomicData(district, state);
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Economic data retrieval failed' });
    }
  });

  // Mandi Near Me & Agmarknet Pricing
  app.get('/api/data/mandis-pricing', async (req, res) => {
    try {
      const lat = parseFloat(req.query.lat as string) || 9.9252;
      const lng = parseFloat(req.query.lng as string) || 78.1198;
      const district = (req.query.district as string) || 'Madurai';
      const state = (req.query.state as string) || 'Tamil Nadu';
      const businessType = (req.query.businessType as string) || 'Rural Enterprise';
      const mandis = await fetchMandiPriceAnalysis(lat, lng, district, state, businessType);
      res.json({ mandis });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Mandi pricing query failed' });
    }
  });

  // Real-time Geo-Specific Economic Intelligence by District
  app.get('/api/location/district-geo-economic', async (req, res) => {
    try {
      const district = (req.query.district as string) || 'Jalpaiguri';
      const state = (req.query.state as string) || 'West Bengal';
      const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
      const lng = req.query.lng ? parseFloat(req.query.lng as string) : undefined;
      const businessType = (req.query.businessType as string) || 'Enterprise';
      const data = await fetchDistrictGeoEconomicData(district, state, lat, lng, businessType);
      res.json(data);
    } catch (err: any) {
      console.error('District geo-economic error:', err);
      res.status(500).json({ error: err?.message || 'Failed to fetch district geo-economic data' });
    }
  });


  // Gemini Dynamic Universal UI Translation Batch
  app.post('/api/translate-batch', async (req, res) => {
    try {
      const { texts, targetLang } = req.body;
      const translations = await translateTextsBatch(texts, targetLang);
      res.json({ translations });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Translation error' });
    }
  });

  // =========================================
  // 3. DETAILED PROJECT REPORT (DPR) & APPRAISAL ENGINE
  // =========================================
  app.post('/api/dpr/generate-bank-report', async (req, res) => {
    try {
      const payload = req.body;
      const dpr = await generateComprehensiveDpr(payload);
      res.json(dpr);
    } catch (err: any) {
      console.error('DPR generation error:', err);
      res.status(500).json({ error: err?.message || 'DPR compilation failed' });
    }
  });

  // Scheme Matching Engine (32 Schemes & Subsidies)
  app.post('/api/schemes/match', async (req, res) => {
    try {
      const profile = req.body;
      const matched = matchNationalSchemes(profile);
      res.json({ schemes: matched });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Scheme matching failed' });
    }
  });

  // =========================================
  // 4. KHATA & SMART LEDGER
  // =========================================
  app.get('/api/khata/transactions', (req, res) => {
    try {
      const ventureId = (req.query.ventureId as string) || 'default_venture';
      const txs = getVentureTransactions(ventureId);
      res.json({ transactions: txs });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to fetch ledger' });
    }
  });

  app.post('/api/khata/transaction', (req, res) => {
    try {
      const { ventureId, partyName, amount, type, notes, commodityOrService, paymentMode, phone } = req.body;
      if (!partyName || !amount || !type) {
        return res.status(400).json({ error: 'partyName, amount and type are required' });
      }
      const record = recordKhataTransaction(ventureId || 'default_venture', {
        partyName,
        amount: parseFloat(amount),
        type,
        notes,
        commodityOrService: commodityOrService || 'General Goods/Services',
        paymentMode: paymentMode || 'Cash',
        phone: phone || '',
      });
      res.json({ success: true, transaction: record });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to save transaction' });
    }
  });

  app.post('/api/khata/parse-bill', async (req, res) => {
    try {
      const { base64Image } = req.body;
      if (!base64Image) {
        return res.status(400).json({ error: 'Image is required' });
      }
      const parsed = await parseInvoiceWithAi(base64Image);
      res.json({ parsed });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to parse invoice' });
    }
  });

  // =========================================
  // 5. 16-STEP MULTI-AGENT ORCHESTRATOR
  // =========================================
  app.post('/api/orchestrator/run-analysis', async (req, res) => {
    try {
      const enterprise = req.body;
      const result = await runMultiAgentAnalysis(enterprise);
      res.json(result);
    } catch (err: any) {
      console.error('Orchestrator error:', err);
      res.status(500).json({ error: err?.message || 'Analysis pipeline failed' });
    }
  });

  // =========================================
  // 6. SAARTHI SIMULATOR & TRAINING
  // =========================================
  app.get('/api/training/modules', (req, res) => {
    try {
      const modules = getTrainingModules();
      res.json({ modules });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to load modules' });
    }
  });

  app.post('/api/training/evaluate', (req, res) => {
    try {
      const { moduleId, answers, citizenName } = req.body;
      const evaluation = evaluateQuiz({
        moduleId: moduleId || 'course-1',
        answers: answers || {},
        citizenName: citizenName || 'Citizen User',
      });
      res.json(evaluation);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Quiz evaluation failed' });
    }
  });

  // =========================================
  // 7. ADMIN TELEMETRY & AUDIT LOGS
  // =========================================
  app.get('/api/admin/audit-logs', (req, res) => {
    try {
      const logs = getAuditLogs();
      res.json({ logs });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to load audit logs' });
    }
  });

  app.post('/api/admin/log-action', (req, res) => {
    try {
      const { actor, role, action, targetVenture, status } = req.body;
      const newLog = logAuditAction({
        actor: actor || 'System User',
        role: role || 'VLE Operator',
        action: action || 'General Administrative Action',
        targetVenture: targetVenture || 'Default Venture',
        status: status || 'VERIFIED',
      });
      res.json({ success: true, log: newLog });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to record audit' });
    }
  });

  // =========================================
  // 8. FILE SEARCH KNOWLEDGE BASE & SAATHI ADVISORY
  // =========================================
  app.get('/api/knowledge-base/files', (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const files = category
        ? KNOWLEDGE_BASE_REGISTRY.filter((f) => f.category === category)
        : KNOWLEDGE_BASE_REGISTRY;
      res.json({
        state: 'West Bengal',
        year: 2025,
        totalFiles: files.length,
        files,
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to retrieve knowledge base files' });
    }
  });

  app.post('/api/financial/deterministic-engine', (req, res) => {
    try {
      const { marginCapital } = req.body;
      const result = calculateDeterministicFinancials(marginCapital);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Calculation error' });
    }
  });

  app.post('/api/saathi/advisory', async (req, res) => {
    try {
      const { userMessage, marginCapital, language, district, state } = req.body;
      if (!userMessage) {
        return res.status(400).json({ error: 'userMessage is required' });
      }
      const advisory = await askSwanirvarSaathi({
        userMessage,
        marginCapital,
        language,
        district,
        state,
      });
      res.json(advisory);
    } catch (err: any) {
      console.error('Saathi advisory error:', err);
      res.status(500).json({ error: err?.message || 'Advisory processing failed' });
    }
  });

  // =========================================
  // 9. VOICE SAATHI INTENT & GEMINI CHAT
  // =========================================
  app.post('/api/voice/intent', async (req, res) => {
    try {
      const { intent, text, lang } = req.body;
      const data = await processVoiceIntent(intent, text, lang);
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Voice intent processing failed' });
    }
  });

  app.post('/api/voice/chat', async (req, res) => {
    try {
      const { userMessage, lang, marginCapital, district } = req.body;
      if (!userMessage) {
        return res.status(400).json({ error: 'userMessage is required' });
      }
      const result = await chatWithVoiceSaathi({
        userMessage,
        lang,
        marginCapital,
        district,
      });
      res.json(result);
    } catch (err: any) {
      console.error('Voice chat error:', err);
      res.status(500).json({ error: err?.message || 'Voice chat failed' });
    }
  });

  // =========================================
  // 9. VITE MIDDLEWARE (DEV) / STATIC (PROD)
  // =========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[SWANIRVAR Sovereign Server] Running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[SWANIRVAR Server Initialization Failed]', err);
});
