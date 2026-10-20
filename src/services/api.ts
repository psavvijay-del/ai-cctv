import { Camera, Incident, AuditLog, DetectionModule, SystemHealth } from '../types';

export const api = {
  async getHealth(): Promise<SystemHealth> {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error(`Health check failed: HTTP ${res.status}`);
    return res.json();
  },

  async getCameras(): Promise<Camera[]> {
    const res = await fetch('/api/cameras');
    if (!res.ok) throw new Error(`Failed to fetch cameras: HTTP ${res.status}`);
    return res.json();
  },

  async createCamera(camera: Partial<Camera>): Promise<Camera> {
    const res = await fetch('/api/cameras', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(camera),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(err.error || 'Failed to create camera');
    }
    return res.json();
  },

  async updateCamera(id: string, updates: Partial<Camera>): Promise<Camera> {
    const res = await fetch(`/api/cameras/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error(`Failed to update camera: HTTP ${res.status}`);
    return res.json();
  },

  async deleteCamera(id: string): Promise<void> {
    const res = await fetch(`/api/cameras/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Failed to delete camera: HTTP ${res.status}`);
  },

  async getIncidents(params?: {
    category?: string;
    severity?: string;
    status?: string;
    camera_id?: string;
    search?: string;
    limit?: number;
  }): Promise<Incident[]> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.severity) query.append('severity', params.severity);
    if (params?.status) query.append('status', params.status);
    if (params?.camera_id) query.append('camera_id', params.camera_id);
    if (params?.search) query.append('search', params.search);
    if (params?.limit) query.append('limit', String(params.limit));

    const res = await fetch(`/api/incidents?${query.toString()}`);
    if (!res.ok) throw new Error(`Failed to fetch incidents: HTTP ${res.status}`);
    return res.json();
  },

  async getIncidentById(id: string): Promise<Incident> {
    const res = await fetch(`/api/incidents/${id}`);
    if (!res.ok) throw new Error(`Incident not found: HTTP ${res.status}`);
    return res.json();
  },

  async reviewIncident(
    id: string,
    review_status: 'pending' | 'confirmed' | 'dismissed',
    reviewer_notes?: string,
    reviewer_user?: string
  ): Promise<Incident> {
    const res = await fetch(`/api/incidents/${id}/review`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ review_status, reviewer_notes, reviewer_user }),
    });
    if (!res.ok) throw new Error(`Failed to review incident: HTTP ${res.status}`);
    return res.json();
  },

  async createIncident(incident: Partial<Incident>): Promise<Incident> {
    const res = await fetch('/api/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(incident),
    });
    if (!res.ok) throw new Error(`Failed to create incident: HTTP ${res.status}`);
    return res.json();
  },

  async getAnalytics(): Promise<any> {
    const res = await fetch('/api/analytics');
    if (!res.ok) throw new Error(`Failed to fetch analytics: HTTP ${res.status}`);
    return res.json();
  },

  async getModules(): Promise<DetectionModule[]> {
    const res = await fetch('/api/modules');
    if (!res.ok) throw new Error(`Failed to fetch modules: HTTP ${res.status}`);
    return res.json();
  },

  async updateModule(id: string, updates: Partial<DetectionModule>): Promise<DetectionModule> {
    const res = await fetch(`/api/modules/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error(`Failed to update module: HTTP ${res.status}`);
    return res.json();
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch('/api/audit-logs');
    if (!res.ok) throw new Error(`Failed to fetch audit logs: HTTP ${res.status}`);
    return res.json();
  },

  async uploadVideo(fileName: string, fileSize: number, camera_id?: string): Promise<any> {
    const res = await fetch('/api/video/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName, fileSize, camera_id }),
    });
    if (!res.ok) throw new Error(`Upload processing failed: HTTP ${res.status}`);
    return res.json();
  },

  async startMonitoring(camera_id: string): Promise<any> {
    const res = await fetch('/api/monitoring/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ camera_id }),
    });
    if (!res.ok) throw new Error(`Failed to start monitoring: HTTP ${res.status}`);
    return res.json();
  },

  async stopMonitoring(): Promise<any> {
    const res = await fetch('/api/monitoring/stop', {
      method: 'POST',
    });
    if (!res.ok) throw new Error(`Failed to stop monitoring: HTTP ${res.status}`);
    return res.json();
  },
};
