export interface IncidentRecord {
  id: string;
  camera_id: string;
  camera_name?: string;
  event_type: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string; // ISO 8601
  confidence: number;
  clip_path?: string;
  snapshot_url?: string;
  review_status: 'pending' | 'confirmed' | 'dismissed';
  reviewer_notes?: string;
  created_at: string;
}

export interface AnalyticsSummary {
  totalIncidents: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  pendingCount: number;
  confirmedCount: number;
  dismissedCount: number;
  averageConfidence: number;
  categoryDistribution: { category: string; count: number }[];
  severityDistribution: { name: string; value: number; color: string }[];
  hourlyTrend: { hour: string; count: number; critical: number; warning: number }[];
  cameraDistribution: { camera: string; count: number }[];
}

export function computeAnalyticsSummary(incidents: IncidentRecord[]): AnalyticsSummary {
  const totalIncidents = incidents.length;
  let criticalCount = 0;
  let warningCount = 0;
  let infoCount = 0;
  let pendingCount = 0;
  let confirmedCount = 0;
  let dismissedCount = 0;
  let confidenceSum = 0;

  const categoryMap: Record<string, number> = {};
  const cameraMap: Record<string, number> = {};
  const hourlyBuckets: Record<number, { count: number; critical: number; warning: number }> = {};

  for (let h = 0; h < 24; h++) {
    hourlyBuckets[h] = { count: 0, critical: 0, warning: 0 };
  }

  for (const inc of incidents) {
    if (inc.severity === 'critical') criticalCount++;
    else if (inc.severity === 'warning') warningCount++;
    else infoCount++;

    if (inc.review_status === 'pending') pendingCount++;
    else if (inc.review_status === 'confirmed') confirmedCount++;
    else if (inc.review_status === 'dismissed') dismissedCount++;

    confidenceSum += inc.confidence || 0;

    // Category
    const cat = inc.event_type || 'Unknown';
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;

    // Camera
    const camName = inc.camera_name || inc.camera_id || 'Camera';
    cameraMap[camName] = (cameraMap[camName] || 0) + 1;

    // Hour
    try {
      const date = new Date(inc.timestamp);
      if (!isNaN(date.getTime())) {
        const hour = date.getHours();
        hourlyBuckets[hour].count++;
        if (inc.severity === 'critical') hourlyBuckets[hour].critical++;
        if (inc.severity === 'warning') hourlyBuckets[hour].warning++;
      }
    } catch {
      // Ignore invalid date
    }
  }

  const categoryDistribution = Object.entries(categoryMap)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  const cameraDistribution = Object.entries(cameraMap)
    .map(([camera, count]) => ({ camera, count }))
    .sort((a, b) => b.count - a.count);

  const hourlyTrend = Object.entries(hourlyBuckets).map(([hourStr, data]) => {
    const h = parseInt(hourStr, 10);
    const label = `${h.toString().padStart(2, '0')}:00`;
    return {
      hour: label,
      count: data.count,
      critical: data.critical,
      warning: data.warning,
    };
  });

  const severityDistribution = [
    { name: 'Critical', value: criticalCount, color: '#ef4444' },
    { name: 'Warning', value: warningCount, color: '#f59e0b' },
    { name: 'Info', value: infoCount, color: '#3b82f6' },
  ].filter(s => s.value > 0);

  const averageConfidence = totalIncidents > 0 ? Number((confidenceSum / totalIncidents).toFixed(3)) : 0;

  return {
    totalIncidents,
    criticalCount,
    warningCount,
    infoCount,
    pendingCount,
    confirmedCount,
    dismissedCount,
    averageConfidence,
    categoryDistribution,
    severityDistribution,
    hourlyTrend,
    cameraDistribution,
  };
}

export function exportIncidentsToCSV(incidents: IncidentRecord[]): string {
  const headers = [
    'Incident ID',
    'Camera ID',
    'Camera Name',
    'Event Type',
    'Severity',
    'Timestamp',
    'Confidence',
    'Review Status',
    'Reviewer Notes',
    'Clip Reference'
  ];

  const escapeCSV = (val: string | number | undefined) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = incidents.map(inc => [
    escapeCSV(inc.id),
    escapeCSV(inc.camera_id),
    escapeCSV(inc.camera_name),
    escapeCSV(inc.event_type),
    escapeCSV(inc.severity),
    escapeCSV(inc.timestamp),
    escapeCSV(inc.confidence),
    escapeCSV(inc.review_status),
    escapeCSV(inc.reviewer_notes || ''),
    escapeCSV(inc.clip_path || ''),
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}
