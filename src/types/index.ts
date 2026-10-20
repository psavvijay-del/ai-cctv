export type CameraSourceType = 'webcam' | 'video_file' | 'rtsp_stream';
export type ConnectionStatus = 'online' | 'offline' | 'warning';
export type SeverityLevel = 'critical' | 'warning' | 'info';
export type ReviewStatus = 'pending' | 'confirmed' | 'dismissed';
export type UserRole = 'admin' | 'senior_operator' | 'security_officer';

export interface PolygonPoint {
  x: number; // 0 to 1 normalized coordinate
  y: number; // 0 to 1 normalized coordinate
}

export interface Camera {
  id: string;
  name: string;
  location: string;
  source_type: CameraSourceType;
  connection_status: ConnectionStatus;
  resolution: string;
  fps: number;
  rtsp_url_masked?: string;
  stream_url?: string;
  last_active: string;
  created_at: string;
  restricted_zone?: PolygonPoint[];
}

export interface DetectedObject {
  id: number;
  class_name: string;
  confidence: number;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  centroid: {
    x: number;
    y: number;
  };
  is_in_restricted_zone?: boolean;
}

export interface Incident {
  id: string;
  camera_id: string;
  camera_name: string;
  event_type: string;
  severity: SeverityLevel;
  timestamp: string;
  confidence: number;
  clip_path?: string;
  snapshot_url?: string;
  review_status: ReviewStatus;
  reviewer_notes?: string;
  created_at: string;
  object_class?: string;
  bbox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
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

export interface SystemHealth {
  status: string;
  system: string;
  version: string;
  timestamp: string;
  backend_mode: string;
  python_backend: {
    expected_url: string;
    connected: boolean;
    instruction: string;
  };
  active_cameras: number;
  total_cameras: number;
  total_incidents: number;
  pending_reviews: number;
}
