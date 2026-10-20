import React, { useState } from 'react';
import {
  Camera as CameraIcon,
  Plus,
  Play,
  Square,
  Edit2,
  Trash2,
  Video,
  Radio,
  Wifi,
  WifiOff,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { Camera } from '../types';
import { CameraModal } from '../components/CameraModal';

interface CamerasPageProps {
  cameras: Camera[];
  onAddCamera: (camera: Partial<Camera>) => Promise<void>;
  onUpdateCamera: (id: string, updates: Partial<Camera>) => Promise<void>;
  onDeleteCamera: (id: string) => Promise<void>;
  onSelectCameraForMonitoring: (id: string) => void;
}

export const CamerasPage: React.FC<CamerasPageProps> = ({
  cameras,
  onAddCamera,
  onUpdateCamera,
  onDeleteCamera,
  onSelectCameraForMonitoring,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [cameraToEdit, setCameraToEdit] = useState<Camera | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setCameraToEdit(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (cam: Camera) => {
    setCameraToEdit(cam);
    setModalOpen(true);
  };

  const handleSaveModal = async (data: Partial<Camera>) => {
    if (cameraToEdit) {
      await onUpdateCamera(cameraToEdit.id, data);
    } else {
      await onAddCamera(data);
    }
  };

  const handleToggleMonitoring = async (cam: Camera) => {
    const nextStatus = cam.connection_status === 'online' ? 'offline' : 'online';
    await onUpdateCamera(cam.id, { connection_status: nextStatus });
  };

  const handleTestConnection = (id: string) => {
    setTestingId(id);
    setTimeout(() => {
      setTestingId(null);
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* Page Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-950/80 border border-blue-800 text-blue-400">
            <CameraIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold font-mono text-white">
                CCTV CAMERA FEED MANAGEMENT
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                {cameras.length} NODES
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Configure camera streams, RTSP ingestion, resolutions, and virtual restricted zones.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          Register New Camera
        </button>
      </div>

      {/* Camera Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cameras.map((cam) => {
          const isOnline = cam.connection_status === 'online';
          return (
            <div
              key={cam.id}
              className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors shadow-xs"
            >
              <div>
                {/* Header status */}
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-white">
                    {cam.id}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border uppercase flex items-center gap-1 ${
                        isOnline
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : 'bg-red-950 text-red-400 border-red-800'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                        }`}
                      />
                      {cam.connection_status}
                    </span>
                  </div>
                </div>

                {/* Camera Name and Location */}
                <h3 className="text-sm font-semibold text-slate-100 mt-2">
                  {cam.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{cam.location}</p>

                {/* Connection Details */}
                <div className="mt-3 pt-3 border-t border-slate-800 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>SOURCE TYPE:</span>
                    <span className="text-blue-300 font-semibold uppercase">
                      {cam.source_type}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>RESOLUTION:</span>
                    <span className="text-slate-200">{cam.resolution}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>FRAMERATE:</span>
                    <span className="text-emerald-400">{cam.fps} FPS</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>LAST ACTIVE:</span>
                    <span className="text-slate-300 text-[11px]">
                      {new Date(cam.last_active).toLocaleTimeString()}
                    </span>
                  </div>
                  {cam.rtsp_url_masked && (
                    <div className="flex justify-between text-slate-400 truncate">
                      <span>RTSP:</span>
                      <span className="text-slate-300 text-[10px] truncate max-w-[180px]">
                        {cam.rtsp_url_masked}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
                <button
                  onClick={() => onSelectCameraForMonitoring(cam.id)}
                  className="px-2.5 py-1.5 rounded bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-medium flex items-center gap-1"
                >
                  <Video className="w-3.5 h-3.5 text-blue-400" />
                  View Feed
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggleMonitoring(cam)}
                    className={`p-1.5 rounded border ${
                      isOnline
                        ? 'bg-amber-950/60 border-amber-800 text-amber-300 hover:bg-amber-900/40'
                        : 'bg-emerald-950/60 border-emerald-800 text-emerald-300 hover:bg-emerald-900/40'
                    }`}
                    title={isOnline ? 'Stop Camera Stream' : 'Start Camera Stream'}
                    aria-label={isOnline ? 'Stop Camera Stream' : 'Start Camera Stream'}
                  >
                    {isOnline ? (
                      <Square className="w-3.5 h-3.5" />
                    ) : (
                      <Play className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    onClick={() => handleTestConnection(cam.id)}
                    disabled={testingId === cam.id}
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                    title="Ping Connection"
                    aria-label="Ping Connection"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${
                        testingId === cam.id ? 'animate-spin text-blue-400' : ''
                      }`}
                    />
                  </button>

                  <button
                    onClick={() => handleOpenEdit(cam)}
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                    title="Edit Camera"
                    aria-label="Edit Camera"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      if (
                        confirm(
                          `Are you sure you want to remove ${cam.id} (${cam.name})?`
                        )
                      ) {
                        onDeleteCamera(cam.id);
                      }
                    }}
                    className="p-1.5 rounded bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/40"
                    title="Delete Camera"
                    aria-label="Delete Camera"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Camera Add/Edit Modal */}
      {modalOpen && (
        <CameraModal
          camera={cameraToEdit}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveModal}
        />
      )}
    </div>
  );
};
