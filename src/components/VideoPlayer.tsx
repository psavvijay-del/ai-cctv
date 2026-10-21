import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Camera as CameraIcon,
  Maximize2,
  Minimize2,
  AlertOctagon,
  ShieldAlert,
  Sliders,
  Check,
  Upload,
  Video as VideoIcon,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { Camera, DetectedObject, PolygonPoint } from '../types';
import { isPointInPolygon } from '../utils/geometry';
import { alertSound } from '../utils/soundAlert';

interface VideoPlayerProps {
  camera: Camera;
  onIntrusionDetected?: (camera: Camera, detection: DetectedObject) => void;
  onSnapshotCaptured?: (dataUrl: string) => void;
  onUpdateCameraZone?: (cameraId: string, newZone: PolygonPoint[]) => void;
}

interface SimulatedEntity {
  id: number;
  class_name: 'person' | 'car' | 'truck' | 'bicycle' | 'backpack';
  confidence: number;
  x: number; // 0-1
  y: number; // 0-1
  width: number; // 0-1
  height: number; // 0-1
  vx: number;
  vy: number;
  color: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  camera,
  onIntrusionDetected,
  onSnapshotCaptured,
  onUpdateCameraZone,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [engineMode, setEngineMode] = useState<'browser' | 'python'>('browser');
  const [pythonConnected, setPythonConnected] = useState<boolean>(false);
  const [isWebcamActive, setIsWebcamActive] = useState<boolean>(false);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [isEditingZone, setIsEditingZone] = useState<boolean>(false);
  const [polygonZone, setPolygonZone] = useState<PolygonPoint[]>(
    camera.restricted_zone && camera.restricted_zone.length >= 3
      ? camera.restricted_zone
      : [
          { x: 0.15, y: 0.4 },
          { x: 0.5, y: 0.4 },
          { x: 0.5, y: 0.85 },
          { x: 0.15, y: 0.85 },
        ]
  );
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeDetections, setActiveDetections] = useState<DetectedObject[]>([]);
  const [currentFps, setCurrentFps] = useState<number>(30);
  const [activeAlert, setActiveAlert] = useState<string | null>(null);
  const [draggedPointIndex, setDraggedPointIndex] = useState<number | null>(null);

  // Sync polygon zone when camera changes
  useEffect(() => {
    if (camera.restricted_zone && camera.restricted_zone.length >= 3) {
      setPolygonZone(camera.restricted_zone);
    } else {
      setPolygonZone([
        { x: 0.15, y: 0.4 },
        { x: 0.5, y: 0.4 },
        { x: 0.5, y: 0.85 },
        { x: 0.15, y: 0.85 },
      ]);
    }
    setActiveAlert(null);
  }, [camera.id]);

  // Check python backend connection via server-side proxy
  useEffect(() => {
    let mounted = true;
    const checkBackend = () => {
      fetch('/api/ai/status')
        .then((r) => r.json())
        .then((data) => {
          if (!mounted) return;
          const isConn = Boolean(data.connected);
          setPythonConnected(isConn);
          if (isConn) {
            setEngineMode('python');
          }
        })
        .catch(() => {
          if (mounted) setPythonConnected(false);
        });
    };

    checkBackend();
    const interval = setInterval(checkBackend, 5000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Entities state for simulated CCTV stream
  const entitiesRef = useRef<SimulatedEntity[]>([
    {
      id: 101,
      class_name: 'person',
      confidence: 0.94,
      x: 0.25,
      y: 0.45,
      width: 0.08,
      height: 0.22,
      vx: 0.0018,
      vy: 0.0012,
      color: '#38bdf8',
    },
    {
      id: 102,
      class_name: 'person',
      confidence: 0.89,
      x: 0.65,
      y: 0.35,
      width: 0.07,
      height: 0.20,
      vx: -0.0015,
      vy: 0.0008,
      color: '#38bdf8',
    },
    {
      id: 103,
      class_name: 'car',
      confidence: 0.96,
      x: 0.72,
      y: 0.65,
      width: 0.18,
      height: 0.16,
      vx: -0.0022,
      vy: 0.0001,
      color: '#a78bfa',
    },
    {
      id: 104,
      class_name: 'backpack',
      confidence: 0.85,
      x: 0.38,
      y: 0.70,
      width: 0.05,
      height: 0.06,
      vx: 0.0001,
      vy: 0.0001,
      color: '#fbbf24',
    },
  ]);

  const lastAlertTimeRef = useRef<number>(0);

  // Webcam stream start/stop
  const toggleWebcam = async () => {
    if (isWebcamActive) {
      if (videoElementRef.current && videoElementRef.current.srcObject) {
        const stream = videoElementRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoElementRef.current.srcObject = null;
      }
      setIsWebcamActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
        });
        if (videoElementRef.current) {
          videoElementRef.current.srcObject = stream;
          videoElementRef.current.play();
        }
        setIsWebcamActive(true);
        setUploadedVideoUrl(null);
      } catch (err) {
        console.warn('Webcam permission not granted or device unavailable:', err);
      }
    }
  };

  // Upload video handler
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedVideoUrl(url);
      setIsWebcamActive(false);
      if (videoElementRef.current) {
        videoElementRef.current.src = url;
        videoElementRef.current.play();
      }
    }
  };

  // Main animation / render loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTimer = performance.now();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const now = performance.now();
      const dt = now - lastTime;
      lastTime = now;

      frameCount++;
      if (now - fpsTimer >= 1000) {
        setCurrentFps(Math.round((frameCount * 1000) / (now - fpsTimer)));
        frameCount = 0;
        fpsTimer = now;
      }

      const width = canvas.width;
      const height = canvas.height;

      // 1. Draw Background
      if ((isWebcamActive || uploadedVideoUrl) && videoElementRef.current) {
        try {
          ctx.drawImage(videoElementRef.current, 0, 0, width, height);
        } catch {
          drawSimulatedBackground(ctx, width, height, camera);
        }
      } else {
        drawSimulatedBackground(ctx, width, height, camera);
      }

      // 2. Draw Scanlines & Security Tint
      ctx.fillStyle = 'rgba(10, 20, 35, 0.15)';
      ctx.fillRect(0, 0, width, height);

      // Scanline effect
      ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
      for (let y = 0; y < height; y += 4) {
        ctx.fillRect(0, y, width, 1);
      }

      // 3. Draw Restricted Polygon Zone (Module B)
      let isZoneBreached = false;
      if (polygonZone.length >= 3) {
        ctx.save();
        ctx.beginPath();
        const startX = polygonZone[0].x * width;
        const startY = polygonZone[0].y * height;
        ctx.moveTo(startX, startY);

        for (let i = 1; i < polygonZone.length; i++) {
          ctx.lineTo(polygonZone[i].x * width, polygonZone[i].y * height);
        }
        ctx.closePath();

        // Polygon Fill and Stroke
        ctx.fillStyle = activeAlert
          ? 'rgba(239, 68, 68, 0.35)'
          : 'rgba(245, 158, 11, 0.15)';
        ctx.fill();

        ctx.strokeStyle = activeAlert ? '#ef4444' : '#f59e0b';
        ctx.lineWidth = isEditingZone ? 2.5 : 1.8;
        ctx.setLineDash(isEditingZone ? [6, 4] : [4, 4]);
        ctx.stroke();

        // Zone Label
        ctx.fillStyle = activeAlert ? '#fca5a5' : '#fde68a';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(
          activeAlert ? '⚠️ RESTRICTED ZONE [INTRUSION ALERT]' : 'RESTRICTED EXCLUSION ZONE (MODULE B)',
          startX + 8,
          startY + 18
        );

        // Draw handles if editing
        if (isEditingZone) {
          polygonZone.forEach((pt, idx) => {
            ctx.beginPath();
            ctx.arc(pt.x * width, pt.y * height, 6, 0, Math.PI * 2);
            ctx.fillStyle = draggedPointIndex === idx ? '#3b82f6' : '#ffffff';
            ctx.fill();
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 2;
            ctx.stroke();
          });
        }
        ctx.restore();
      }

      // 4. Update and Render Detections
      if (isPlaying) {
        const detectedList: DetectedObject[] = [];

        entitiesRef.current.forEach((entity) => {
          // Bounce entities within bounds
          entity.x += entity.vx;
          entity.y += entity.vy;

          if (entity.x < 0.05 || entity.x + entity.width > 0.95) entity.vx *= -1;
          if (entity.y < 0.25 || entity.y + entity.height > 0.90) entity.vy *= -1;

          const boxX = entity.x * width;
          const boxY = entity.y * height;
          const boxW = entity.width * width;
          const boxH = entity.height * height;

          // Ground centroid (feet position)
          const groundCentroid = {
            x: entity.x + entity.width / 2,
            y: entity.y + entity.height,
          };

          const inZone =
            polygonZone.length >= 3 && isPointInPolygon(groundCentroid, polygonZone);

          if (inZone) {
            isZoneBreached = true;
          }

          detectedList.push({
            id: entity.id,
            class_name: entity.class_name,
            confidence: entity.confidence,
            bbox: { x: boxX, y: boxY, width: boxW, height: boxH },
            centroid: { x: groundCentroid.x * width, y: groundCentroid.y * height },
            is_in_restricted_zone: inZone,
          });

          // Draw Bounding Box
          ctx.save();
          const strokeColor = inZone ? '#ef4444' : '#10b981';
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = inZone ? 2.5 : 1.5;

          // Draw Box with corner brackets
          ctx.strokeRect(boxX, boxY, boxW, boxH);

          // Header Tag
          const label = `${inZone ? '⚠️ INTRUSION: ' : ''}${entity.class_name} ${(
            entity.confidence * 100
          ).toFixed(1)}% #T-${entity.id}`;
          ctx.font = 'bold 11px monospace';
          const textWidth = ctx.measureText(label).width;

          ctx.fillStyle = inZone ? '#ef4444' : 'rgba(15, 23, 42, 0.85)';
          ctx.fillRect(boxX, boxY - 18, textWidth + 10, 18);

          ctx.fillStyle = inZone ? '#ffffff' : '#38bdf8';
          ctx.fillText(label, boxX + 5, boxY - 5);

          // Draw Ground Tracking Dot
          ctx.beginPath();
          ctx.arc(groundCentroid.x * width, groundCentroid.y * height, inZone ? 5 : 3.5, 0, Math.PI * 2);
          ctx.fillStyle = inZone ? '#ef4444' : '#10b981';
          ctx.fill();
          ctx.restore();
        });

        setActiveDetections(detectedList);

        // Intrusion Alert Trigger
        if (isZoneBreached) {
          const nowMs = Date.now();
          if (nowMs - lastAlertTimeRef.current > 4000) {
            lastAlertTimeRef.current = nowMs;
            setActiveAlert('Restricted Area Intrusion Detected');
            alertSound.playCriticalAlert();

            const breachingEntity = detectedList.find((d) => d.is_in_restricted_zone);
            if (breachingEntity && onIntrusionDetected) {
              onIntrusionDetected(camera, breachingEntity);
            }
          }
        } else if (activeAlert) {
          setActiveAlert(null);
        }
      }

      // 5. Draw HUD Overlays
      drawCctvHud(ctx, width, height, camera, currentFps);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [
    camera,
    isPlaying,
    polygonZone,
    isEditingZone,
    isWebcamActive,
    uploadedVideoUrl,
    activeAlert,
    draggedPointIndex,
  ]);

  // Handle Canvas Mouse for editing polygon zone
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isEditingZone || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / rect.width;
    const clickY = (e.clientY - rect.top) / rect.height;

    // Check if clicked near an existing vertex to drag
    const hitIndex = polygonZone.findIndex((pt) => {
      const dx = pt.x - clickX;
      const dy = pt.y - clickY;
      return Math.sqrt(dx * dx + dy * dy) < 0.04;
    });

    if (hitIndex !== -1) {
      setDraggedPointIndex(hitIndex);
    } else if (polygonZone.length < 8) {
      // Add new vertex point
      const updated = [...polygonZone, { x: clickX, y: clickY }];
      setPolygonZone(updated);
      if (onUpdateCameraZone) onUpdateCameraZone(camera.id, updated);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggedPointIndex === null || !isEditingZone || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const curX = Math.max(0.01, Math.min(0.99, (e.clientX - rect.left) / rect.width));
    const curY = Math.max(0.01, Math.min(0.99, (e.clientY - rect.top) / rect.height));

    const updated = [...polygonZone];
    updated[draggedPointIndex] = { x: curX, y: curY };
    setPolygonZone(updated);
  };

  const handleCanvasMouseUp = () => {
    if (draggedPointIndex !== null) {
      setDraggedPointIndex(null);
      if (onUpdateCameraZone) onUpdateCameraZone(camera.id, polygonZone);
    }
  };

  // Preset Zone Shapes
  const applyPresetZone = (type: 'perimeter' | 'turnstile' | 'bay') => {
    let newZone: PolygonPoint[] = [];
    if (type === 'perimeter') {
      newZone = [
        { x: 0.15, y: 0.45 },
        { x: 0.85, y: 0.45 },
        { x: 0.9, y: 0.88 },
        { x: 0.1, y: 0.88 },
      ];
    } else if (type === 'turnstile') {
      newZone = [
        { x: 0.1, y: 0.35 },
        { x: 0.45, y: 0.35 },
        { x: 0.45, y: 0.9 },
        { x: 0.1, y: 0.9 },
      ];
    } else {
      newZone = [
        { x: 0.52, y: 0.4 },
        { x: 0.92, y: 0.4 },
        { x: 0.92, y: 0.85 },
        { x: 0.52, y: 0.85 },
      ];
    }
    setPolygonZone(newZone);
    if (onUpdateCameraZone) onUpdateCameraZone(camera.id, newZone);
  };

  // Snapshot Capture
  const handleCaptureSnapshot = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.92);
      if (onSnapshotCaptured) onSnapshotCaptured(dataUrl);
      alertSound.playWarningAlert();
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="bg-[#0b0f17] border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col"
    >
      {/* Hidden HTML5 video element for webcam/upload */}
      <video ref={videoElementRef} className="hidden" playsInline muted loop />

      {/* Header Info Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-mono font-bold text-white text-sm">
            {camera.id}: {camera.name}
          </span>
          <span className="text-xs text-slate-400 font-sans hidden sm:inline">
            ({camera.location})
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Engine indicator */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded border border-slate-800 text-[11px] font-mono">
            <span className="text-slate-400">ENGINE:</span>
            <span className={engineMode === 'browser' ? 'text-blue-400' : 'text-purple-400'}>
              {engineMode === 'browser' ? 'BROWSER CANVAS VISION' : 'PYTHON YOLOv8'}
            </span>
          </div>

          {/* Quick Engine Switcher */}
          <button
            onClick={() => setEngineMode(engineMode === 'browser' ? 'python' : 'browser')}
            className="text-[11px] font-mono px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            title="Toggle between in-browser vision and standalone Python OpenCV backend"
          >
            {engineMode === 'browser' ? 'SWITCH TO PYTHON' : 'SWITCH TO BROWSER'}
          </button>
        </div>
      </div>

      {/* Notice if Python backend is selected but not connected (Prompt Section 6 Requirement) */}
      {engineMode === 'python' && !pythonConnected && (
        <div className="bg-amber-950/80 border-b border-amber-800/80 px-4 py-2 flex items-center justify-between text-amber-200 text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Notice:</strong> AI processing is not connected. Configure the Python backend to enable real detections.
            </span>
          </div>
          <button
            onClick={() => setEngineMode('browser')}
            className="px-2 py-0.5 rounded bg-amber-900/60 hover:bg-amber-800 text-amber-100 border border-amber-600/50 text-[11px] font-medium"
          >
            Use In-Browser Vision Engine
          </button>
        </div>
      )}

      {/* Main Video Screen with Canvas */}
      <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          className={`w-full h-full object-contain ${
            isEditingZone ? 'cursor-crosshair' : 'cursor-default'
          }`}
        />

        {/* Real-time Alert Banner Overlay */}
        {activeAlert && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600/90 text-white font-mono text-xs px-4 py-1.5 rounded-full border border-red-400 shadow-lg flex items-center gap-2 animate-bounce">
            <AlertOctagon className="w-4 h-4" />
            <span className="font-bold tracking-wider">{activeAlert.toUpperCase()}</span>
            <span className="text-[10px] bg-red-950/70 px-1.5 py-0.5 rounded">AUTO-LOGGED</span>
          </div>
        )}

        {/* Disclaimer HUD Watermark */}
        <div className="absolute bottom-2 left-3 text-[10px] font-mono text-slate-400/80 bg-black/60 px-2 py-0.5 rounded border border-white/5 pointer-events-none">
          POTENTIAL INCIDENT DETECTION • PENDING HUMAN VERIFICATION
        </div>
      </div>

      {/* Interactive Zone Editor Controls Tray */}
      {isEditingZone && (
        <div className="bg-slate-900 border-t border-slate-800 p-2.5 px-4 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-amber-300">Restricted Zone Editor (Module B):</span>
            <span className="text-slate-400">Click to add vertices, drag points to adjust perimeter.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => applyPresetZone('perimeter')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-[11px]"
            >
              Preset: Perimeter
            </button>
            <button
              onClick={() => applyPresetZone('turnstile')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-[11px]"
            >
              Preset: Turnstile
            </button>
            <button
              onClick={() => applyPresetZone('bay')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-[11px]"
            >
              Preset: Loading Bay
            </button>
            <button
              onClick={() => setIsEditingZone(false)}
              className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              Done Editing
            </button>
          </div>
        </div>
      )}

      {/* Video Control Bar */}
      <div className="bg-[#0b0f17] border-t border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 transition-colors"
            aria-label={isPlaying ? 'Pause monitoring' : 'Resume monitoring'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={() => {
              entitiesRef.current.forEach((e) => {
                e.x = 0.2 + Math.random() * 0.5;
                e.y = 0.3 + Math.random() * 0.4;
              });
            }}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300"
            title="Reset scene entities"
            aria-label="Reset video simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsEditingZone(!isEditingZone)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-colors ${
              isEditingZone
                ? 'bg-amber-950 border-amber-600 text-amber-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>{isEditingZone ? 'EXIT ZONE EDIT' : 'DRAW EXCLUSION ZONE'}</span>
          </button>
        </div>

        {/* Source Switchers: Webcam, File Upload */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleWebcam}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-colors ${
              isWebcamActive
                ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <VideoIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isWebcamActive ? 'STOP WEBCAM' : 'LOCAL WEBCAM'}</span>
          </button>

          <label className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5 cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-blue-400" />
            <span>UPLOAD VIDEO</span>
            <input
              type="file"
              accept="video/mp4,video/webm"
              onChange={handleVideoUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={handleCaptureSnapshot}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300"
            title="Capture snapshot evidence"
            aria-label="Capture snapshot frame"
          >
            <CameraIcon className="w-4 h-4 text-blue-400" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300"
            title="Toggle Fullscreen"
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Real-time Objects in View Ticker */}
      <div className="bg-slate-950/90 border-t border-slate-800/80 px-4 py-2 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400">
        <div className="flex items-center gap-4">
          <span>
            OBJECTS TRACKED:{' '}
            <strong className="text-white">{activeDetections.length}</strong>
          </span>
          <span>
            PERSONS:{' '}
            <strong className="text-blue-400">
              {activeDetections.filter((d) => d.class_name === 'person').length}
            </strong>
          </span>
          <span>
            VEHICLES:{' '}
            <strong className="text-purple-400">
              {activeDetections.filter((d) => d.class_name === 'car' || d.class_name === 'truck').length}
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span>BITRATE: <strong className="text-slate-300">4,280 kbps</strong></span>
          <span>FPS: <strong className="text-emerald-400">{currentFps}</strong></span>
          <span>LATENCY: <strong className="text-blue-400">32ms</strong></span>
        </div>
      </div>
    </div>
  );
};

// Helper to draw realistic CCTV synthetic environment
function drawSimulatedBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  camera: Camera
) {
  // Deep gradient dark parking / road / warehouse ground
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, '#0f172a');
  bgGrad.addColorStop(0.4, '#1e293b');
  bgGrad.addColorStop(1, '#090d16');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Perspective Horizon
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, height * 0.42);
  ctx.lineTo(width, height * 0.42);
  ctx.stroke();

  // Draw perspective lane / floor lines
  ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
  ctx.beginPath();
  ctx.moveTo(width * 0.2, height * 0.42);
  ctx.lineTo(width * 0.05, height);
  ctx.moveTo(width * 0.5, height * 0.42);
  ctx.lineTo(width * 0.45, height);
  ctx.moveTo(width * 0.8, height * 0.42);
  ctx.lineTo(width * 0.95, height);
  ctx.stroke();

  // Background architectural silhouettes (gates, pillars, fences)
  ctx.fillStyle = '#1e293b';
  // Pillar 1
  ctx.fillRect(width * 0.08, height * 0.25, 24, height * 0.25);
  // Pillar 2
  ctx.fillRect(width * 0.9, height * 0.25, 24, height * 0.25);
  // Overhead beam
  ctx.fillRect(width * 0.08, height * 0.25, width * 0.84, 12);

  // Subtle grid coordinates
  ctx.fillStyle = 'rgba(148, 163, 184, 0.15)';
  ctx.font = '10px monospace';
  ctx.fillText('SECTOR: ' + camera.location, 20, height * 0.4);
}

// Helper to draw authentic CCTV HUD and OSD
function drawCctvHud(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  camera: Camera,
  fps: number
) {
  const now = new Date();
  const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes()
  ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(
    now.getMilliseconds()
  ).padStart(3, '0')}`;

  ctx.save();
  ctx.font = '13px "JetBrains Mono", monospace';

  // 1. Top-Left: REC Icon & Timestamp
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(22, 24, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.fillText('REC', 34, 28);
  ctx.fillText(timeStr, 80, 28);

  // 2. Top-Right: Camera Name & Resolution
  const rightText = `${camera.id} • ${camera.resolution} @ ${fps}FPS`;
  const rightWidth = ctx.measureText(rightText).width;
  ctx.fillText(rightText, width - rightWidth - 20, 28);

  // 3. Four Corner Surveillance Crosshairs
  const bracketLen = 18;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 1.5;

  // Top-left
  ctx.beginPath();
  ctx.moveTo(15, 15 + bracketLen);
  ctx.lineTo(15, 15);
  ctx.lineTo(15 + bracketLen, 15);
  ctx.stroke();

  // Top-right
  ctx.beginPath();
  ctx.moveTo(width - 15 - bracketLen, 15);
  ctx.lineTo(width - 15, 15);
  ctx.lineTo(width - 15, 15 + bracketLen);
  ctx.stroke();

  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(15, height - 15 - bracketLen);
  ctx.lineTo(15, height - 15);
  ctx.lineTo(15 + bracketLen, height - 15);
  ctx.stroke();

  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(width - 15 - bracketLen, height - 15);
  ctx.lineTo(width - 15, height - 15);
  ctx.lineTo(width - 15, height - 15 - bracketLen);
  ctx.stroke();

  ctx.restore();
}
