import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// In-Memory Database Store with initial seed data
export interface Camera {
  id: string;
  name: string;
  location: string;
  source_type: 'webcam' | 'video_file' | 'rtsp_stream';
  connection_status: 'online' | 'offline' | 'warning';
  resolution: string;
  fps: number;
  rtsp_url_masked?: string;
  stream_url?: string;
  last_active: string;
  created_at: string;
  restricted_zone?: { x: number; y: number }[];
}

export interface Incident {
  id: string;
  camera_id: string;
  camera_name: string;
  event_type: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
  confidence: number;
  clip_path?: string;
  snapshot_url?: string;
  review_status: 'pending' | 'confirmed' | 'dismissed';
  reviewer_notes?: string;
  created_at: string;
  object_class?: string;
  bbox?: { x: number; y: number; width: number; height: number };
}

export interface AuditLog {
  id: string;
  user_id: string;
  username: string;
  action: string;
  incident_id?: string;
  timestamp: string;
  details: string;
}

export interface DetectionModule {
  id: string;
  code: string;
  name: string;
  status: 'configured' | 'active' | 'not_configured';
  description: string;
  model: string;
  threshold: number;
  requiresExternalWeights: boolean;
  notes: string;
}

// Initial Data
const cameras: Camera[] = [
  {
    id: 'CAM-01',
    name: 'Main Gate & Turnstile',
    location: 'North Entrance Gate A',
    source_type: 'video_file',
    connection_status: 'online',
    resolution: '1920x1080',
    fps: 30,
    last_active: new Date().toISOString(),
    created_at: '2026-10-01T08:00:00Z',
    restricted_zone: [
      { x: 0.1, y: 0.35 },
      { x: 0.45, y: 0.35 },
      { x: 0.45, y: 0.9 },
      { x: 0.1, y: 0.9 },
    ],
  },
  {
    id: 'CAM-02',
    name: 'Logistics Warehouse Bay 4',
    location: 'Warehouse District B - Loading Bay',
    source_type: 'video_file',
    connection_status: 'online',
    resolution: '1920x1080',
    fps: 25,
    last_active: new Date().toISOString(),
    created_at: '2026-10-02T09:30:00Z',
    restricted_zone: [
      { x: 0.55, y: 0.4 },
      { x: 0.92, y: 0.4 },
      { x: 0.92, y: 0.85 },
      { x: 0.55, y: 0.85 },
    ],
  },
  {
    id: 'CAM-03',
    name: 'Perimeter Fence Sector 9',
    location: 'Outer Security Perimeter East',
    source_type: 'video_file',
    connection_status: 'online',
    resolution: '3840x2160',
    fps: 30,
    last_active: new Date().toISOString(),
    created_at: '2026-10-05T14:15:00Z',
    restricted_zone: [
      { x: 0.2, y: 0.5 },
      { x: 0.8, y: 0.5 },
      { x: 0.85, y: 0.95 },
      { x: 0.15, y: 0.95 },
    ],
  },
  {
    id: 'CAM-04',
    name: 'Executive Parking & Driveway',
    location: 'Corporate Center South Lot',
    source_type: 'video_file',
    connection_status: 'online',
    resolution: '1920x1080',
    fps: 24,
    last_active: new Date().toISOString(),
    created_at: '2026-10-10T11:00:00Z',
  },
  {
    id: 'CAM-05',
    name: 'Live Security Console Webcam',
    location: 'SOC Control Room Station 1',
    source_type: 'webcam',
    connection_status: 'online',
    resolution: '1280x720',
    fps: 30,
    last_active: new Date().toISOString(),
    created_at: '2026-10-15T08:00:00Z',
  },
];

const now = new Date();
const getPastISO = (minutesAgo: number) => new Date(now.getTime() - minutesAgo * 60000).toISOString();

const incidents: Incident[] = [
  {
    id: 'INC-2026-891',
    camera_id: 'CAM-03',
    camera_name: 'Perimeter Fence Sector 9',
    event_type: 'Restricted-Area Intrusion',
    severity: 'critical',
    timestamp: getPastISO(18),
    confidence: 0.942,
    review_status: 'pending',
    reviewer_notes: 'Potential unauthorized zone traversal detected near east fence barrier.',
    created_at: getPastISO(18),
    object_class: 'person',
    bbox: { x: 210, y: 340, width: 68, height: 160 },
  },
  {
    id: 'INC-2026-889',
    camera_id: 'CAM-01',
    camera_name: 'Main Gate & Turnstile',
    event_type: 'Crowd Monitoring',
    severity: 'warning',
    timestamp: getPastISO(45),
    confidence: 0.887,
    review_status: 'pending',
    reviewer_notes: 'Turnstile bottleneck density exceeded safety threshold (>12 individuals/10m²).',
    created_at: getPastISO(45),
    object_class: 'crowd_cluster',
  },
  {
    id: 'INC-2026-885',
    camera_id: 'CAM-02',
    camera_name: 'Logistics Warehouse Bay 4',
    event_type: 'Abandoned-Object Detection',
    severity: 'warning',
    timestamp: getPastISO(92),
    confidence: 0.854,
    review_status: 'confirmed',
    reviewer_notes: 'Unattended parcel left on forklift transit line for >180 seconds. Guard dispatched and cleared safely.',
    created_at: getPastISO(92),
    object_class: 'backpack_or_crate',
    bbox: { x: 420, y: 280, width: 85, height: 70 },
  },
  {
    id: 'INC-2026-880',
    camera_id: 'CAM-04',
    camera_name: 'Executive Parking & Driveway',
    event_type: 'Vehicle Incident',
    severity: 'info',
    timestamp: getPastISO(180),
    confidence: 0.912,
    review_status: 'dismissed',
    reviewer_notes: 'Delivery van stationary in loading zone during authorized delivery window. False anomaly.',
    created_at: getPastISO(180),
    object_class: 'delivery_truck',
  },
  {
    id: 'INC-2026-874',
    camera_id: 'CAM-01',
    camera_name: 'Main Gate & Turnstile',
    event_type: 'Person and Vehicle Detection',
    severity: 'info',
    timestamp: getPastISO(240),
    confidence: 0.965,
    review_status: 'confirmed',
    reviewer_notes: 'Standard morning shift pedestrian volume count recorded.',
    created_at: getPastISO(240),
    object_class: 'person',
  },
  {
    id: 'INC-2026-868',
    camera_id: 'CAM-02',
    camera_name: 'Logistics Warehouse Bay 4',
    event_type: 'Safety Equipment Detection',
    severity: 'warning',
    timestamp: getPastISO(350),
    confidence: 0.825,
    review_status: 'confirmed',
    reviewer_notes: 'Individual entered forklift staging area without high-visibility vest. Safety advisory issued.',
    created_at: getPastISO(350),
    object_class: 'ppe_violation_vest',
  },
];

const auditLogs: AuditLog[] = [
  {
    id: 'AUD-001',
    user_id: 'USR-SEC-01',
    username: 'capt_miller',
    action: 'REVIEW_CONFIRM',
    incident_id: 'INC-2026-885',
    timestamp: getPastISO(80),
    details: 'Verified abandoned parcel incident and flagged resolution dispatch.',
  },
  {
    id: 'AUD-002',
    user_id: 'USR-SEC-01',
    username: 'capt_miller',
    action: 'REVIEW_DISMISS',
    incident_id: 'INC-2026-880',
    timestamp: getPastISO(170),
    details: 'Dismissed delivery van alert as authorized delivery schedule match.',
  },
  {
    id: 'AUD-003',
    user_id: 'USR-ADMIN',
    username: 'admin_soc',
    action: 'CAMERA_UPDATE',
    timestamp: getPastISO(300),
    details: 'Updated restricted polygonal boundary zone for CAM-03 Perimeter Fence.',
  },
];

const detectionModules: DetectionModule[] = [
  {
    id: 'mod-a',
    code: 'MODULE_A',
    name: 'Person and Vehicle Detection',
    status: 'active',
    description: 'Detects and tracks pedestrians, bicycles, cars, buses, and trucks with real-time bounding boxes and confidence scores.',
    model: 'YOLOv8n / Browser Vision Pipeline',
    threshold: 0.50,
    requiresExternalWeights: false,
    notes: 'Operational in browser and verified through bounding box tracking.',
  },
  {
    id: 'mod-b',
    code: 'MODULE_B',
    name: 'Restricted-Area Intrusion Detection',
    status: 'active',
    description: 'Polygonal virtual tripwire and exclusion zone monitoring. Triggers immediate alerts when tracked person centroid breaches zone.',
    model: 'Ray-Casting Point-in-Polygon Engine',
    threshold: 0.70,
    requiresExternalWeights: false,
    notes: 'Interactive polygon zone editor enabled on live video stream.',
  },
  {
    id: 'mod-c',
    code: 'MODULE_C',
    name: 'Physical Altercation Detection',
    status: 'not_configured',
    description: 'Video-level action recognition to flag violent movement sequences and physical struggles for human verification.',
    model: 'VideoMAE / Kinetics-400 Action Transformer',
    threshold: 0.75,
    requiresExternalWeights: true,
    notes: 'NOT CONFIGURED: Requires specialized multi-frame temporal Action Recognition weights. See Python backend documentation to enable.',
  },
  {
    id: 'mod-d',
    code: 'MODULE_D',
    name: 'Theft-Related Event Review',
    status: 'configured',
    description: 'Object-interaction heuristics analyzing rapid object removal or detachment from designated asset zones.',
    model: 'ByteTrack Association + Proximity Rules',
    threshold: 0.65,
    requiresExternalWeights: false,
    notes: 'Configurable dwell-time & asset detachment heuristic flags sequences for human verification.',
  },
  {
    id: 'mod-e',
    code: 'MODULE_E',
    name: 'Vehicle Incident Detection',
    status: 'configured',
    description: 'Tracks vehicle trajectory, wrong-way movement, sudden deceleration, and unauthorized driveway stoppage.',
    model: 'Trajectory Vector Analyzer + YOLOv8',
    threshold: 0.68,
    requiresExternalWeights: false,
    notes: 'Flags potential collisions or unusual stops; requires human verification.',
  },
  {
    id: 'mod-f',
    code: 'MODULE_F',
    name: 'Weapon-Like Object Detection',
    status: 'not_configured',
    description: 'Specialized object detection for firearms or edged weapons. High-sensitivity human confirmation mandatory.',
    model: 'YOLO-Custom-Security-Dataset',
    threshold: 0.85,
    requiresExternalWeights: true,
    notes: 'NOT CONFIGURED: Requires specialized export-controlled tactical weights. Do not treat unverified detections as weapons.',
  },
  {
    id: 'mod-g',
    code: 'MODULE_G',
    name: 'Crowd Monitoring',
    status: 'active',
    description: 'Estimates localized pedestrian count and area crowd density to avert stampedes and bottleneck hazards.',
    model: 'Centroid Cluster Estimator',
    threshold: 0.60,
    requiresExternalWeights: false,
    notes: 'Active with configurable threshold (default: 8 persons per detection frame).',
  },
  {
    id: 'mod-h',
    code: 'MODULE_H',
    name: 'Fire and Smoke Detection',
    status: 'not_configured',
    description: 'Optical flame color spectrum and volumetric smoke diffusion pattern recognition.',
    model: 'YOLOv8-Fire-Smoke / Dual-Band Optical',
    threshold: 0.80,
    requiresExternalWeights: true,
    notes: 'NOT CONFIGURED: Requires dedicated fire-smoke trained weights. Standard thermal integration recommended.',
  },
  {
    id: 'mod-i',
    code: 'MODULE_I',
    name: 'Abandoned-Object Detection',
    status: 'active',
    description: 'Tracks stationary baggage, backpacks, and packages when unattended by owner past configured dwell threshold.',
    model: 'Stationary Temporal Tracker',
    threshold: 0.60,
    requiresExternalWeights: false,
    notes: 'Configurable unattended dwell limit (default: 120 seconds).',
  },
  {
    id: 'mod-j',
    code: 'MODULE_J',
    name: 'Safety Equipment Detection (PPE)',
    status: 'configured',
    description: 'Detects personal protective gear including safety helmets, hardhats, and high-visibility reflective vests.',
    model: 'YOLOv8-PPE Multi-Class',
    threshold: 0.70,
    requiresExternalWeights: false,
    notes: 'Flags designated hazard zones without mandatory PPE for supervisor review.',
  },
];

// Active Monitoring State
let monitoringState = {
  is_active: true,
  started_at: new Date().toISOString(),
  active_camera_id: 'CAM-01',
  current_fps: 29.8,
  processing_latency_ms: 32,
  external_python_backend_url: 'http://localhost:8000',
  external_python_connected: false,
};

// AI Engine Status Check (Proxied safely server-side to prevent browser CORS/ERR_FAILED)
async function checkPythonHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1000);
    const pyRes = await fetch(`${monitoringState.external_python_backend_url}/api/health`, {
      signal: controller.signal,
    }).catch(() => null);
    clearTimeout(timeout);

    if (pyRes && pyRes.ok) {
      monitoringState.external_python_connected = true;
      return true;
    }
  } catch {
    // Ignore offline error
  }
  monitoringState.external_python_connected = false;
  return false;
}

// Periodically check Python backend connection status
setInterval(checkPythonHealth, 4000);
checkPythonHealth();

app.get('/api/ai/status', async (req: Request, res: Response) => {
  const isConnected = await checkPythonHealth();
  if (isConnected) {
    try {
      const pyRes = await fetch(`${monitoringState.external_python_backend_url}/api/health`);
      const data = await pyRes.json();
      return res.json({ connected: true, data });
    } catch {
      // Fallback
    }
  }
  res.json({ connected: false });
});

// Health & System Status
app.get('/api/health', async (req: Request, res: Response) => {
  await checkPythonHealth();
  res.json({
    status: 'healthy',
    system: 'AI-Based Intelligent CCTV Surveillance Platform',
    version: '2.5.0-SOC',
    timestamp: new Date().toISOString(),
    backend_mode: 'Fullstack Express + SQLite Compatible Store',
    python_backend: {
      expected_url: monitoringState.external_python_backend_url,
      connected: monitoringState.external_python_connected,
      instruction: 'Run `python backend/app.py` locally to link standalone OpenCV / YOLOv8 pipeline.',
    },
    active_cameras: cameras.filter(c => c.connection_status === 'online').length,
    total_cameras: cameras.length,
    total_incidents: incidents.length,
    pending_reviews: incidents.filter(i => i.review_status === 'pending').length,
  });
});

// Cameras CRUD
app.get('/api/cameras', (req: Request, res: Response) => {
  res.json(cameras);
});

app.post('/api/cameras', (req: Request, res: Response) => {
  const { name, location, source_type, resolution, fps, rtsp_url } = req.body;
  if (!name || !location) {
    return res.status(400).json({ error: 'Name and location are required' });
  }

  // Safe handling: never store plain password if rtsp_url provided
  let maskedRtsp = undefined;
  if (rtsp_url) {
    try {
      const url = new URL(rtsp_url);
      if (url.password) {
        url.password = '******';
      }
      maskedRtsp = url.toString();
    } catch {
      maskedRtsp = rtsp_url.replace(/:([^@]+)@/, ':******@');
    }
  }

  const newCamera: Camera = {
    id: `CAM-${String(cameras.length + 1).padStart(2, '0')}`,
    name,
    location,
    source_type: source_type || 'video_file',
    connection_status: 'online',
    resolution: resolution || '1920x1080',
    fps: fps || 30,
    rtsp_url_masked: maskedRtsp,
    last_active: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  cameras.push(newCamera);

  auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    user_id: 'USR-ADMIN',
    username: 'security_operator',
    action: 'CAMERA_CREATED',
    timestamp: new Date().toISOString(),
    details: `Added new camera ${newCamera.id} (${newCamera.name}) at ${newCamera.location}`,
  });

  res.status(201).json(newCamera);
});

app.put('/api/cameras/:id', (req: Request, res: Response) => {
  const index = cameras.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Camera not found' });
  }

  const { name, location, source_type, connection_status, resolution, fps, restricted_zone } = req.body;
  const existing = cameras[index];

  cameras[index] = {
    ...existing,
    name: name ?? existing.name,
    location: location ?? existing.location,
    source_type: source_type ?? existing.source_type,
    connection_status: connection_status ?? existing.connection_status,
    resolution: resolution ?? existing.resolution,
    fps: fps ?? existing.fps,
    restricted_zone: restricted_zone ?? existing.restricted_zone,
    last_active: new Date().toISOString(),
  };

  auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    user_id: 'USR-ADMIN',
    username: 'security_operator',
    action: 'CAMERA_UPDATED',
    timestamp: new Date().toISOString(),
    details: `Updated parameters for camera ${existing.id}`,
  });

  res.json(cameras[index]);
});

app.delete('/api/cameras/:id', (req: Request, res: Response) => {
  const index = cameras.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Camera not found' });
  }

  const [deleted] = cameras.splice(index, 1);
  auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    user_id: 'USR-ADMIN',
    username: 'security_operator',
    action: 'CAMERA_DELETED',
    timestamp: new Date().toISOString(),
    details: `Deleted camera ${deleted.id} (${deleted.name})`,
  });

  res.json({ success: true, deleted_id: deleted.id });
});

// Incidents Query & Management
app.get('/api/incidents', (req: Request, res: Response) => {
  const { category, severity, status, camera_id, search, limit } = req.query;

  let filtered = [...incidents];

  if (category && category !== 'all') {
    filtered = filtered.filter(i => i.event_type.toLowerCase() === String(category).toLowerCase());
  }

  if (severity && severity !== 'all') {
    filtered = filtered.filter(i => i.severity === severity);
  }

  if (status && status !== 'all') {
    filtered = filtered.filter(i => i.review_status === status);
  }

  if (camera_id && camera_id !== 'all') {
    filtered = filtered.filter(i => i.camera_id === camera_id);
  }

  if (search) {
    const q = String(search).toLowerCase();
    filtered = filtered.filter(
      i =>
        i.id.toLowerCase().includes(q) ||
        i.camera_name.toLowerCase().includes(q) ||
        i.event_type.toLowerCase().includes(q) ||
        (i.reviewer_notes && i.reviewer_notes.toLowerCase().includes(q))
    );
  }

  // Sort by timestamp descending
  filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (limit) {
    const l = parseInt(String(limit), 10);
    if (!isNaN(l)) filtered = filtered.slice(0, l);
  }

  res.json(filtered);
});

app.get('/api/incidents/:id', (req: Request, res: Response) => {
  const incident = incidents.find(i => i.id === req.params.id);
  if (!incident) {
    return res.status(404).json({ error: 'Incident record not found' });
  }
  res.json(incident);
});

// Review status update with notes
app.patch('/api/incidents/:id/review', (req: Request, res: Response) => {
  const incident = incidents.find(i => i.id === req.params.id);
  if (!incident) {
    return res.status(404).json({ error: 'Incident not found' });
  }

  const { review_status, reviewer_notes, reviewer_user } = req.body;
  if (!['pending', 'confirmed', 'dismissed'].includes(review_status)) {
    return res.status(400).json({ error: 'Invalid review status. Must be pending, confirmed, or dismissed' });
  }

  incident.review_status = review_status;
  if (reviewer_notes !== undefined) {
    incident.reviewer_notes = reviewer_notes;
  }

  const username = reviewer_user || 'officer_duty';
  auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    user_id: 'USR-SEC-02',
    username,
    action: `REVIEW_${review_status.toUpperCase()}`,
    incident_id: incident.id,
    timestamp: new Date().toISOString(),
    details: `Incident ${incident.id} marked as ${review_status.toUpperCase()} by ${username}. Note: ${reviewer_notes || 'No note'}`,
  });

  res.json(incident);
});

// Log new incident (from Vision detection engine or live monitoring)
app.post('/api/incidents', (req: Request, res: Response) => {
  const { camera_id, event_type, severity, confidence, reviewer_notes, snapshot_url, object_class, bbox } = req.body;
  if (!camera_id || !event_type) {
    return res.status(400).json({ error: 'camera_id and event_type are required' });
  }

  const camera = cameras.find(c => c.id === camera_id);
  const newIncident: Incident = {
    id: `INC-2026-${Math.floor(100 + Math.random() * 900)}`,
    camera_id,
    camera_name: camera?.name || camera_id,
    event_type,
    severity: severity || 'warning',
    timestamp: new Date().toISOString(),
    confidence: typeof confidence === 'number' ? confidence : 0.88,
    review_status: 'pending',
    reviewer_notes: reviewer_notes || 'Automatic alert triggered by computer vision module. Pending human verification.',
    snapshot_url,
    clip_path: `/evidence/${camera_id}_${Date.now()}.mp4`,
    created_at: new Date().toISOString(),
    object_class,
    bbox,
  };

  incidents.unshift(newIncident);

  res.status(201).json(newIncident);
});

// Analytics Endpoint
app.get('/api/analytics', (req: Request, res: Response) => {
  const total = incidents.length;
  const critical = incidents.filter(i => i.severity === 'critical').length;
  const warning = incidents.filter(i => i.severity === 'warning').length;
  const info = incidents.filter(i => i.severity === 'info').length;

  const pending = incidents.filter(i => i.review_status === 'pending').length;
  const confirmed = incidents.filter(i => i.review_status === 'confirmed').length;
  const dismissed = incidents.filter(i => i.review_status === 'dismissed').length;

  // Category breakdown
  const categoryMap: Record<string, number> = {};
  incidents.forEach(i => {
    categoryMap[i.event_type] = (categoryMap[i.event_type] || 0) + 1;
  });

  const categoryDistribution = Object.entries(categoryMap).map(([category, count]) => ({
    category,
    count,
  }));

  // Hourly breakdown (last 24 hours simulation)
  const hourlyBuckets: Record<number, number> = {};
  for (let h = 0; h < 24; h++) hourlyBuckets[h] = 0;
  incidents.forEach(i => {
    const hour = new Date(i.timestamp).getHours();
    hourlyBuckets[hour] = (hourlyBuckets[hour] || 0) + 1;
  });

  const hourlyData = Object.entries(hourlyBuckets).map(([h, count]) => ({
    hour: `${String(h).padStart(2, '0')}:00`,
    incidents: count,
  }));

  res.json({
    metrics: {
      total_incidents: total,
      critical_incidents: critical,
      warning_incidents: warning,
      info_incidents: info,
      pending_review: pending,
      confirmed_incidents: confirmed,
      dismissed_incidents: dismissed,
      cameras_online: cameras.filter(c => c.connection_status === 'online').length,
      cameras_total: cameras.length,
      current_fps: monitoringState.current_fps,
      latency_ms: monitoringState.processing_latency_ms,
    },
    category_distribution: categoryDistribution,
    hourly_distribution: hourlyData,
  });
});

// Detection Modules List and Configuration
app.get('/api/modules', (req: Request, res: Response) => {
  res.json(detectionModules);
});

app.put('/api/modules/:id', (req: Request, res: Response) => {
  const mod = detectionModules.find(m => m.id === req.params.id);
  if (!mod) return res.status(404).json({ error: 'Module not found' });

  const { status, threshold } = req.body;
  if (status && ['configured', 'active', 'not_configured'].includes(status)) {
    mod.status = status;
  }
  if (typeof threshold === 'number') {
    mod.threshold = Math.max(0.1, Math.min(1.0, threshold));
  }

  res.json(mod);
});

// Video Upload Endpoint
app.post('/api/video/upload', (req: Request, res: Response) => {
  const { fileName, fileSize, camera_id } = req.body;
  const mockUploadId = `VID-${Date.now()}`;
  res.json({
    success: true,
    upload_id: mockUploadId,
    file_name: fileName || 'surveillance_capture.mp4',
    size_bytes: fileSize || 10485760,
    camera_id: camera_id || 'CAM-01',
    status: 'ready_for_analysis',
    message: 'Video indexed successfully. Ready to stream into AI anomaly detection pipeline.',
  });
});

// Monitoring Control
app.post('/api/monitoring/start', (req: Request, res: Response) => {
  const { camera_id } = req.body;
  monitoringState.is_active = true;
  monitoringState.active_camera_id = camera_id || monitoringState.active_camera_id;
  monitoringState.started_at = new Date().toISOString();

  res.json({
    status: 'running',
    active_camera_id: monitoringState.active_camera_id,
    started_at: monitoringState.started_at,
  });
});

app.post('/api/monitoring/stop', (req: Request, res: Response) => {
  monitoringState.is_active = false;
  res.json({
    status: 'stopped',
    message: 'Video analytics pipeline paused.',
  });
});

// Audit Logs
app.get('/api/audit-logs', (req: Request, res: Response) => {
  res.json(auditLogs);
});

// Serve frontend with Vite integration
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req: Request, res: Response) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  function listen(port: number) {
    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`[CCTV SOC SERVER] Intelligent CCTV Surveillance System running on http://localhost:${port}`);
    });

    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`[CCTV SOC SERVER] Port ${port} is in use, trying port ${port + 1}...`);
        listen(port + 1);
      } else {
        console.error('[CCTV SOC SERVER] Server error:', err);
      }
    });
  }

  listen(PORT);
}

startServer();
