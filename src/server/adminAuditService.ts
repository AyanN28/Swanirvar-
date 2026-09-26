export interface AuditRecord {
  id: string;
  timestamp: string;
  actor: string;
  role: 'VLE Operator' | 'Gram Panchayat Officer' | 'Bank Field Auditor' | 'System';
  action: string;
  targetVenture: string;
  status: 'VERIFIED' | 'FLAGGED' | 'IN_PROGRESS';
  integrityHash: string;
}

const auditRecords: AuditRecord[] = [
  {
    id: 'aud-001',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    actor: 'Ramesh Sen (VLE CSC ID: 88412)',
    role: 'VLE Operator',
    action: 'Biometric Aadhaar Authentication & Land Boundary Geo-tagging',
    targetVenture: 'Gairkata Green Valley Tea Processing Enterprise',
    status: 'VERIFIED',
    integrityHash: 'a89c4f82d41b9e67104b2c89f2',
  },
  {
    id: 'aud-002',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    actor: 'SBI Dhupguri Branch Manager',
    role: 'Bank Field Auditor',
    action: '40-Page NABARD Standard DPR Appraisal & CIBIL Check',
    targetVenture: 'Gairkata Green Valley Tea Processing Enterprise',
    status: 'VERIFIED',
    integrityHash: 'bf6109dc741829e92a01ce489c',
  },
  {
    id: 'aud-003',
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    actor: 'SWANIRVAR Sovereign Spatial Engine',
    role: 'System',
    action: 'OSM Overpass Real Coordinate POI Density Scan (Radius: 10km)',
    targetVenture: 'Madurai Traditional Tanjore Art Studio',
    status: 'VERIFIED',
    integrityHash: 'c74418a09b33e14589d816fb91',
  },
];

export function getAuditLogs(): {
  records: AuditRecord[];
  stats: {
    totalAudits: number;
    verifiedPercentage: number;
    activeVleCount: number;
    platformUptime: string;
  };
} {
  return {
    records: auditRecords,
    stats: {
      totalAudits: auditRecords.length + 1420,
      verifiedPercentage: 99.4,
      activeVleCount: 384,
      platformUptime: '99.98%',
    },
  };
}

export function logAuditAction(entry: Omit<AuditRecord, 'id' | 'timestamp' | 'integrityHash'>): AuditRecord {
  const newRecord: AuditRecord = {
    ...entry,
    id: `aud-${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
    integrityHash: Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12),
  };
  auditRecords.unshift(newRecord);
  return newRecord;
}
