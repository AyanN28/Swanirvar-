import { DprRequest, DprResponse } from '../server/dprService';
import { SchemeMatchRequest, SchemeMatchResponse } from '../server/schemeMatchingService';
import { KhataTransaction, KhataSummary } from '../server/khataService';
import { OrchestrationRequest, OrchestrationResponse } from '../server/orchestratorService';
import { TrainingModule, QuizResult } from '../server/trainingService';
import { AuditRecord } from '../server/adminAuditService';

/**
 * 1. Health check
 */
export async function checkBackendHealth(): Promise<{ status: string; platform: string; time: string; uptimeSeconds: number }> {
  const res = await fetch('/api/health');
  if (!res.ok) throw new Error('Backend health check failed');
  return res.json();
}

/**
 * 2. Generate Comprehensive Bank DPR
 */
export async function fetchGeneratedDpr(req: DprRequest): Promise<DprResponse> {
  const res = await fetch('/api/enterprise/generate-dpr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error('Failed to generate DPR from backend');
  return res.json();
}

/**
 * 3. Match National Schemes & Subsidies
 */
export async function fetchMatchedSchemes(req: SchemeMatchRequest): Promise<SchemeMatchResponse> {
  const res = await fetch('/api/schemes/match', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error('Scheme matching failed');
  return res.json();
}

/**
 * 4. Get Khata Transactions
 */
export async function fetchKhataLedger(ventureId: string = 'default'): Promise<{
  transactions: KhataTransaction[];
  summary: KhataSummary;
}> {
  const res = await fetch(`/api/khata/transactions?ventureId=${encodeURIComponent(ventureId)}`);
  if (!res.ok) throw new Error('Failed to load Khata transactions');
  return res.json();
}

/**
 * 5. Record Khata Transaction
 */
export async function createKhataTransaction(
  ventureId: string,
  entry: Omit<KhataTransaction, 'id' | 'timestamp' | 'referenceNo'>
): Promise<{ success: boolean; transaction: KhataTransaction; summary: KhataSummary }> {
  const res = await fetch('/api/khata/transaction', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ventureId, ...entry }),
  });
  if (!res.ok) throw new Error('Failed to save transaction');
  return res.json();
}

/**
 * 6. AI Invoice/Note Parse
 */
export async function parseInvoiceNoteWithAi(noteText: string): Promise<Partial<KhataTransaction>> {
  const res = await fetch('/api/khata/ai-invoice-parse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ noteText }),
  });
  if (!res.ok) throw new Error('Invoice parse failed');
  return res.json();
}

/**
 * 7. Multi-Agent Feasibility Orchestration
 */
export async function executeMultiAgentAnalysis(req: OrchestrationRequest): Promise<OrchestrationResponse> {
  const res = await fetch('/api/enterprise/orchestrate-analysis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error('Orchestration failed');
  return res.json();
}

/**
 * 8. Training Modules & Quiz
 */
export async function fetchTrainingCourses(): Promise<{ modules: TrainingModule[] }> {
  const res = await fetch('/api/training/modules');
  if (!res.ok) throw new Error('Failed to fetch training modules');
  return res.json();
}

export async function submitTrainingQuiz(
  moduleId: string,
  answers: Record<string, number>,
  citizenName: string
): Promise<QuizResult> {
  const res = await fetch('/api/training/submit-quiz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ moduleId, answers, citizenName }),
  });
  if (!res.ok) throw new Error('Quiz evaluation failed');
  return res.json();
}

/**
 * 9. Admin Audit Logs
 */
export async function fetchAdminAuditLogs(): Promise<{
  records: AuditRecord[];
  stats: {
    totalAudits: number;
    verifiedPercentage: number;
    activeVleCount: number;
    platformUptime: string;
  };
}> {
  const res = await fetch('/api/admin/audit-log');
  if (!res.ok) throw new Error('Failed to fetch audit records');
  return res.json();
}
