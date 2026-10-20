import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { MonitoringPage } from './pages/MonitoringPage';
import { CamerasPage } from './pages/CamerasPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { ModulesPage } from './pages/ModulesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { BackendGuidePage } from './pages/BackendGuidePage';
import { IncidentModal } from './components/IncidentModal';
import { Camera, Incident, DetectionModule, AuditLog, UserRole, DetectedObject, PolygonPoint } from './types';
import { api } from './services/api';
import { alertSound } from './utils/soundAlert';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [activeRole, setActiveRole] = useState<UserRole>('senior_operator');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Core Data State
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [modules, setModules] = useState<DetectionModule[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('CAM-01');

  // Inspection Modal State
  const [inspectingIncident, setInspectingIncident] = useState<Incident | null>(null);

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      const [cams, incs, mods, logs] = await Promise.all([
        api.getCameras(),
        api.getIncidents(),
        api.getModules(),
        api.getAuditLogs(),
      ]);
      setCameras(cams);
      setIncidents(incs);
      setModules(mods);
      setAuditLogs(logs);
      if (cams.length > 0 && !selectedCameraId) {
        setSelectedCameraId(cams[0].id);
      }
    } catch (err) {
      console.warn('API fetch warning, using fallback store:', err);
    }
  }, [selectedCameraId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Intrusion Alert from VideoPlayer
  const handleIntrusionDetected = async (camera: Camera, detection: DetectedObject) => {
    try {
      const newInc = await api.createIncident({
        camera_id: camera.id,
        camera_name: camera.name,
        event_type: 'Restricted-Area Intrusion',
        severity: 'critical',
        confidence: detection.confidence,
        object_class: detection.class_name,
        reviewer_notes: `Automatic alert triggered by restricted polygon boundary crossing. Centroid (${Math.round(
          detection.centroid.x
        )}, ${Math.round(detection.centroid.y)}) breached exclusion zone.`,
        bbox: detection.bbox,
      });

      setIncidents((prev) => [newInc, ...prev]);

      // Add to local audit logs
      setAuditLogs((prev) => [
        {
          id: `AUD-${Date.now()}`,
          user_id: 'SYSTEM_CV',
          username: 'ai_vision_engine',
          action: 'INTRUSION_DETECTED',
          incident_id: newInc.id,
          timestamp: new Date().toISOString(),
          details: `Anomaly detection triggered on ${camera.id} (${detection.class_name}). Pending verification.`,
        },
        ...prev,
      ]);
    } catch (err) {
      console.error('Error logging intrusion:', err);
    }
  };

  // Review Incident
  const handleReviewIncident = async (
    id: string,
    status: 'pending' | 'confirmed' | 'dismissed',
    notes: string
  ) => {
    try {
      const updated = await api.reviewIncident(id, status, notes, activeRole);
      setIncidents((prev) => prev.map((i) => (i.id === id ? updated : i)));

      setAuditLogs((prev) => [
        {
          id: `AUD-${Date.now()}`,
          user_id: activeRole,
          username: activeRole,
          action: `REVIEW_${status.toUpperCase()}`,
          incident_id: id,
          timestamp: new Date().toISOString(),
          details: `Incident marked as ${status.toUpperCase()} by ${activeRole}. Notes: ${notes || 'None'}`,
        },
        ...prev,
      ]);
    } catch (err) {
      console.error('Error reviewing incident:', err);
    }
  };

  // Camera Management Handlers
  const handleAddCamera = async (cameraData: Partial<Camera>) => {
    const created = await api.createCamera(cameraData);
    setCameras((prev) => [...prev, created]);
    fetchData();
  };

  const handleUpdateCamera = async (id: string, updates: Partial<Camera>) => {
    const updated = await api.updateCamera(id, updates);
    setCameras((prev) => prev.map((c) => (c.id === id ? updated : c)));
  };

  const handleDeleteCamera = async (id: string) => {
    await api.deleteCamera(id);
    setCameras((prev) => prev.filter((c) => c.id !== id));
  };

  const handleUpdateCameraZone = async (cameraId: string, newZone: PolygonPoint[]) => {
    await handleUpdateCamera(cameraId, { restricted_zone: newZone });
  };

  const handleUpdateModule = async (id: string, updates: Partial<DetectionModule>) => {
    const updated = await api.updateModule(id, updates);
    setModules((prev) => prev.map((m) => (m.id === id ? updated : m)));
  };

  const pendingCount = incidents.filter((i) => i.review_status === 'pending').length;
  const criticalCount = incidents.filter((i) => i.severity === 'critical').length;
  const onlineCamerasCount = cameras.filter((c) => c.connection_status === 'online').length;

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top SOC Navbar */}
      <Navbar
        activeRole={activeRole}
        onRoleChange={setActiveRole}
        pendingIncidentsCount={pendingCount}
        criticalIncidentsCount={criticalCount}
        onNavigateToIncidents={() => setCurrentTab('incidents')}
        onNavigateToGuide={() => setCurrentTab('backend-guide')}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onlineCameraCount={onlineCamerasCount}
          totalCameraCount={cameras.length}
          criticalAlertCount={criticalCount}
          mobileMenuOpen={mobileMenuOpen}
          onCloseMobileMenu={() => setMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6 bg-[#070b12]">
          {currentTab === 'dashboard' && (
            <DashboardPage
              cameras={cameras}
              incidents={incidents}
              onSelectCamera={(id) => setSelectedCameraId(id)}
              onInspectIncident={(inc) => setInspectingIncident(inc)}
              onNavigateToMonitoring={() => setCurrentTab('monitoring')}
              onNavigateToIncidents={() => setCurrentTab('incidents')}
              onNavigateToCameras={() => setCurrentTab('cameras')}
            />
          )}

          {currentTab === 'monitoring' && (
            <MonitoringPage
              cameras={cameras}
              selectedCameraId={selectedCameraId}
              onSelectCamera={(id) => setSelectedCameraId(id)}
              incidents={incidents}
              onIntrusionDetected={handleIntrusionDetected}
              onInspectIncident={(inc) => setInspectingIncident(inc)}
              onUpdateCameraZone={handleUpdateCameraZone}
            />
          )}

          {currentTab === 'cameras' && (
            <CamerasPage
              cameras={cameras}
              onAddCamera={handleAddCamera}
              onUpdateCamera={handleUpdateCamera}
              onDeleteCamera={handleDeleteCamera}
              onSelectCameraForMonitoring={(id) => {
                setSelectedCameraId(id);
                setCurrentTab('monitoring');
              }}
            />
          )}

          {currentTab === 'incidents' && (
            <IncidentsPage
              incidents={incidents}
              onInspectIncident={(inc) => setInspectingIncident(inc)}
              onReviewIncident={handleReviewIncident}
            />
          )}

          {currentTab === 'modules' && (
            <ModulesPage
              modules={modules}
              onUpdateModule={handleUpdateModule}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsPage incidents={incidents} cameras={cameras} />
          )}

          {currentTab === 'audit-logs' && (
            <AuditLogsPage auditLogs={auditLogs} activeRole={activeRole} />
          )}

          {currentTab === 'backend-guide' && <BackendGuidePage />}
        </main>
      </div>

      {/* Incident Forensic Review Modal */}
      {inspectingIncident && (
        <IncidentModal
          incident={inspectingIncident}
          onClose={() => setInspectingIncident(null)}
          onSaveReview={handleReviewIncident}
        />
      )}
    </div>
  );
}
