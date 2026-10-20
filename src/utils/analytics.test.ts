import test from 'node:test';
import assert from 'node:assert/strict';
import { computeAnalyticsSummary, exportIncidentsToCSV } from './analytics.ts';
import type { IncidentRecord } from './analytics.ts';

test('computeAnalyticsSummary computes accurate counts and distribution', () => {
  const mockIncidents: IncidentRecord[] = [
    {
      id: 'INC-101',
      camera_id: 'CAM-01',
      camera_name: 'Main Gate',
      event_type: 'Restricted-Area Intrusion',
      severity: 'critical',
      timestamp: '2026-10-20T10:15:00Z',
      confidence: 0.92,
      review_status: 'pending',
      created_at: '2026-10-20T10:15:00Z',
    },
    {
      id: 'INC-102',
      camera_id: 'CAM-01',
      camera_name: 'Main Gate',
      event_type: 'Crowd Monitoring',
      severity: 'warning',
      timestamp: '2026-10-20T10:30:00Z',
      confidence: 0.88,
      review_status: 'confirmed',
      created_at: '2026-10-20T10:30:00Z',
    },
    {
      id: 'INC-103',
      camera_id: 'CAM-02',
      camera_name: 'Warehouse North',
      event_type: 'Vehicle Incident',
      severity: 'info',
      timestamp: '2026-10-20T11:00:00Z',
      confidence: 0.75,
      review_status: 'dismissed',
      created_at: '2026-10-20T11:00:00Z',
    },
  ];

  const summary = computeAnalyticsSummary(mockIncidents);
  assert.equal(summary.totalIncidents, 3);
  assert.equal(summary.criticalCount, 1);
  assert.equal(summary.warningCount, 1);
  assert.equal(summary.infoCount, 1);
  assert.equal(summary.pendingCount, 1);
  assert.equal(summary.confirmedCount, 1);
  assert.equal(summary.dismissedCount, 1);
  assert.equal(summary.averageConfidence, 0.85);

  assert.equal(summary.categoryDistribution.length, 3);
  assert.equal(summary.cameraDistribution[0].camera, 'Main Gate');
  assert.equal(summary.cameraDistribution[0].count, 2);
});

test('exportIncidentsToCSV escapes commas and quotation marks', () => {
  const mockIncidents: IncidentRecord[] = [
    {
      id: 'INC-201',
      camera_id: 'CAM-01',
      camera_name: 'Loading Bay, Dock 4',
      event_type: 'Intrusion "Zone A"',
      severity: 'critical',
      timestamp: '2026-10-20T08:00:00Z',
      confidence: 0.95,
      review_status: 'confirmed',
      reviewer_notes: 'Verified guard response.',
      created_at: '2026-10-20T08:00:00Z',
    },
  ];

  const csv = exportIncidentsToCSV(mockIncidents);
  assert.ok(csv.includes('Incident ID,Camera ID,Camera Name'));
  assert.ok(csv.includes('"Loading Bay, Dock 4"'));
  assert.ok(csv.includes('"Intrusion ""Zone A"""'));
  assert.ok(csv.includes('"Verified guard response."'));
});
