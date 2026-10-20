import React, { useState } from 'react';
import {
  Camera as CameraIcon,
  Video,
  Play,
  Square,
  AlertTriangle,
  Clock,
  Shield,
  Layers,
  ChevronRight,
  Sliders,
  CheckCircle,
  Eye,
  Filter,
} from 'lucide-react';
import { Camera, Incident, DetectedObject, PolygonPoint } from '../types';
import { VideoPlayer } from '../components/VideoPlayer';

interface MonitoringPageProps {
  cameras: Camera[];
  selectedCameraId: string;
  onSelectCamera: (id: string) => void;
  incidents: Incident[];
  onIntrusionDetected: (camera: Camera, detection: DetectedObject) => void;
  onInspectIncident: (incident: Incident) => void;
  onUpdateCameraZone: (cameraId: string, newZone: PolygonPoint[]) => void;
}

export const MonitoringPage: React.FC<MonitoringPageProps> = ({
  cameras,
  selectedCameraId,
  onSelectCamera,
  incidents,
  onIntrusionDetected,
  onInspectIncident,
  onUpdateCameraZone,
}) => {
  const [snapshotEvidence, setSnapshotEvidence] = useState<string | null>(null);

  const activeCamera =
    cameras.find((c) => c.id === selectedCameraId) || cameras[0] || {
      id: 'CAM-01',
      name: 'Main Gate',
      location: 'Entrance',
      source_type: 'video_file',
      connection_status: 'online',
      resolution: '1920x1080',
      fps: 30,
      last_active: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

  // Incidents for selected camera
  const cameraIncidents = incidents.filter(
    (i) => i.camera_id === activeCamera.id
  );

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-8">
      {/* Top Header & Camera Switcher Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-950/80 border border-blue-800 text-blue-400">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold font-mono text-white flex items-center gap-2">
              REAL-TIME VIDEO SURVEILLANCE & ANOMALY MONITORING
            </h1>
            <p className="text-xs text-slate-400">
              Live stream analysis, polygonal intrusion detection (Module B), and instant alert dispatch.
            </p>
          </div>
        </div>

        {/* Camera Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {cameras.map((cam) => {
            const isSelected = cam.id === activeCamera.id;
            return (
              <button
                key={cam.id}
                onClick={() => onSelectCamera(cam.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    cam.connection_status === 'online'
                      ? 'bg-emerald-400'
                      : 'bg-red-400'
                  }`}
                />
                <span>{cam.id}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Monitoring Grid: Video Player (70%) + Alert Stream (30%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Video Player Surface */}
        <div className="lg:col-span-8 space-y-3">
          <VideoPlayer
            camera={activeCamera}
            onIntrusionDetected={onIntrusionDetected}
            onSnapshotCaptured={(url) => setSnapshotEvidence(url)}
            onUpdateCameraZone={onUpdateCameraZone}
          />

          {/* Module B & Feature Guidance Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="font-semibold text-white">Module B Active:</span>{' '}
                <span className="text-slate-400">
                  Click "Draw Exclusion Zone" on the video player to customize the virtual perimeter polygon.
                </span>
              </div>
            </div>

            <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
              ALGORITHM: RAY-CASTING PIP
            </span>
          </div>
        </div>

        {/* Right: Camera Telemetry & Incident History for Selected Camera */}
        <div className="lg:col-span-4 space-y-4">
          {/* Active Camera Information Card */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-3.5 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-mono font-bold text-white flex items-center gap-1.5">
                <CameraIcon className="w-4 h-4 text-blue-400" />
                STREAM PARAMETERS
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/40">
                {activeCamera.connection_status.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px]">NAME</span>
                <span className="text-slate-200 font-semibold">{activeCamera.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">LOCATION</span>
                <span className="text-slate-200 truncate block">{activeCamera.location}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">RESOLUTION</span>
                <span className="text-blue-300">{activeCamera.resolution}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">FPS TARGET</span>
                <span className="text-emerald-400 font-bold">{activeCamera.fps} FPS</span>
              </div>
            </div>
          </div>

          {/* Incidents on this Camera */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>INCIDENTS FOR {activeCamera.id}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                {cameraIncidents.length} Records
              </span>
            </div>

            {cameraIncidents.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 font-mono">
                No incidents recorded on this camera.
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {cameraIncidents.map((inc) => (
                  <div
                    key={inc.id}
                    onClick={() => onInspectIncident(inc)}
                    className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 hover:border-blue-500/50 hover:bg-slate-800/60 cursor-pointer transition-all text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-200">
                        {inc.id}
                      </span>
                      <span
                        className={`text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded border uppercase ${
                          inc.severity === 'critical'
                            ? 'bg-red-950 text-red-400 border-red-800'
                            : inc.severity === 'warning'
                            ? 'bg-amber-950 text-amber-400 border-amber-800'
                            : 'bg-blue-950 text-blue-400 border-blue-800'
                        }`}
                      >
                        {inc.severity}
                      </span>
                    </div>

                    <div className="text-white font-medium mt-1 truncate">
                      {inc.event_type}
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800/60 text-[10px] font-mono text-slate-400">
                      <span>{new Date(inc.timestamp).toLocaleTimeString()}</span>
                      <span className="text-emerald-400">
                        CONF: {(inc.confidence * 100).toFixed(1)}%
                      </span>
                      <span
                        className={`uppercase font-semibold ${
                          inc.review_status === 'confirmed'
                            ? 'text-emerald-400'
                            : inc.review_status === 'dismissed'
                            ? 'text-slate-500'
                            : 'text-amber-400'
                        }`}
                      >
                        {inc.review_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
