import React, { useState } from 'react';
import { X, Camera as CameraIcon, Shield, Server, Video, AlertCircle } from 'lucide-react';
import { Camera, CameraSourceType } from '../types';

interface CameraModalProps {
  camera: Camera | null; // null for add mode, camera object for edit mode
  onClose: () => void;
  onSave: (cameraData: Partial<Camera>) => Promise<void>;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  camera,
  onClose,
  onSave,
}) => {
  const isEdit = Boolean(camera);

  const [name, setName] = useState(camera?.name || '');
  const [location, setLocation] = useState(camera?.location || '');
  const [sourceType, setSourceType] = useState<CameraSourceType>(
    camera?.source_type || 'video_file'
  );
  const [resolution, setResolution] = useState(camera?.resolution || '1920x1080');
  const [fps, setFps] = useState<number>(camera?.fps || 30);
  const [rtspUrl, setRtspUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !location.trim()) {
      setErrorMsg('Please specify camera name and installation location.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await onSave({
        name,
        location,
        source_type: sourceType,
        resolution,
        fps,
        ...(rtspUrl ? { rtsp_url_masked: rtspUrl } : {}),
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save camera record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-[#0f172a] border border-slate-700/80 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col my-8">
        {/* Header */}
        <div className="bg-slate-900 border-b border-slate-800 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-950/80 border border-blue-800 text-blue-400">
              <CameraIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-mono font-bold text-white text-base">
                {isEdit ? `EDIT CAMERA: ${camera?.id}` : 'ADD CCTV FEED SOURCE'}
              </h3>
              <p className="text-xs text-slate-400">
                Surveillance Video Feed Configuration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-800 text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-mono font-semibold mb-1">
              CAMERA IDENTIFIER / NAME *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Perimeter Gate North #03"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-sans"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 font-mono font-semibold mb-1">
              LOCATION / SECTOR *
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Building B - East Perimeter Fence"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-sans"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 font-mono font-semibold mb-1">
              FEED SOURCE TYPE
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSourceType('video_file')}
                className={`p-2 rounded-lg border text-center transition-colors ${
                  sourceType === 'video_file'
                    ? 'bg-blue-950 border-blue-500 text-blue-300 font-semibold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                Video / Synthetic
              </button>
              <button
                type="button"
                onClick={() => setSourceType('webcam')}
                className={`p-2 rounded-lg border text-center transition-colors ${
                  sourceType === 'webcam'
                    ? 'bg-blue-950 border-blue-500 text-blue-300 font-semibold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                Local Webcam
              </button>
              <button
                type="button"
                onClick={() => setSourceType('rtsp_stream')}
                className={`p-2 rounded-lg border text-center transition-colors ${
                  sourceType === 'rtsp_stream'
                    ? 'bg-blue-950 border-blue-500 text-blue-300 font-semibold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                RTSP Stream
              </button>
            </div>
          </div>

          {sourceType === 'rtsp_stream' && (
            <div className="space-y-1">
              <label className="block text-slate-300 font-mono font-semibold">
                RTSP STREAM URL (CREDENTIALS MASKED)
              </label>
              <input
                type="text"
                value={rtspUrl}
                onChange={(e) => setRtspUrl(e.target.value)}
                placeholder="rtsp://operator:password@192.168.1.120:554/live/ch0"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono text-xs"
              />
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-400" />
                Stream passwords are automatically sanitized and never exposed in the client UI.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-mono font-semibold mb-1">
                STREAM RESOLUTION
              </label>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
              >
                <option value="1920x1080">1920x1080 (1080p FHD)</option>
                <option value="1280x720">1280x720 (720p HD)</option>
                <option value="3840x2160">3840x2160 (4K UHD)</option>
                <option value="640x480">640x480 (VGA)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-mono font-semibold mb-1">
                PROCESSING FPS
              </label>
              <select
                value={fps}
                onChange={(e) => setFps(parseInt(e.target.value, 10))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
              >
                <option value={30}>30 Frames / Sec</option>
                <option value={25}>25 Frames / Sec</option>
                <option value={20}>20 Frames / Sec</option>
                <option value={15}>15 Frames / Sec</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-md transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : isEdit ? 'Update Camera' : 'Register Camera'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
