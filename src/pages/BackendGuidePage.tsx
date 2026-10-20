import React, { useState } from 'react';
import {
  Terminal,
  Server,
  Play,
  Copy,
  Check,
  ExternalLink,
  Code2,
  Database,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const BackendGuidePage: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const checkPythonBackend = async () => {
    setIsChecking(true);
    try {
      const res = await fetch('/api/ai/status');
      if (res.ok) {
        const data = await res.json();
        if (data.connected) {
          setHealthStatus({ online: true, data: data.data });
        } else {
          setHealthStatus({
            online: false,
            error: 'Python backend is currently offline. Run `python backend/app.py` locally to connect.',
          });
        }
      } else {
        setHealthStatus({ online: false, error: `HTTP ${res.status}` });
      }
    } catch (err: any) {
      setHealthStatus({
        online: false,
        error: 'Unable to check backend status.',
      });
    } finally {
      setIsChecking(false);
    }
  };

  const setupCommands = `# 1. Navigate to the backend directory
cd backend

# 2. Create and activate a Python virtual environment
python -m venv venv

# On Linux / macOS:
source venv/bin/activate
# On Windows:
venv\\Scripts\\activate

# 3. Install OpenCV, YOLOv8 (Ultralytics), FastAPI dependencies
pip install -r requirements.txt

# 4. Start the FastAPI Computer Vision Backend
uvicorn app:app --host 0.0.0.0 --port 8000 --reload`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-950/80 border border-blue-800 text-blue-400">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold font-mono text-white">
                STANDALONE PYTHON OPENCV / YOLOv8 SETUP GUIDE
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                LOCAL EXECUTION
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Execute full GPU/CPU accelerated computer vision inference with Ultralytics YOLOv8 & ByteTrack.
            </p>
          </div>
        </div>

        <button
          onClick={checkPythonBackend}
          disabled={isChecking}
          className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-md transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
          <span>Ping Python Backend (:8000)</span>
        </button>
      </div>

      {/* Connection Ping Status Banner */}
      {healthStatus && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 text-xs ${
            healthStatus.online
              ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
              : 'bg-amber-950/40 border-amber-800 text-amber-200'
          }`}
        >
          {healthStatus.online ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <h2 className="font-semibold text-white">
              {healthStatus.online
                ? 'Python Computer Vision Backend is Connected and Responding!'
                : 'Python Backend Offline (Normal in Cloud Container)'}
            </h2>
            <p className="text-slate-300">
              {healthStatus.online
                ? `YOLOv8 Model loaded: ${healthStatus.data.yolo_loaded}. Classes: ${healthStatus.data.classes_supported?.join(', ')}`
                : 'The browser vision engine is currently active. To use Python OpenCV & YOLOv8 locally, follow the instructions below.'}
            </p>
          </div>
        </div>
      )}

      {/* VS Code Step-by-Step Instructions */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-mono font-bold text-white">
              VS CODE & TERMINAL RUNTIME INSTRUCTIONS
            </h2>
          </div>
          <button
            onClick={() => copyToClipboard(setupCommands, 'setup')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1 border border-slate-700"
          >
            {copiedSection === 'setup' ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>{copiedSection === 'setup' ? 'Copied!' : 'Copy Script'}</span>
          </button>
        </div>

        <pre className="p-4 rounded-lg bg-black/80 border border-slate-800 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed">
          {setupCommands}
        </pre>
      </div>

      {/* REST API Endpoints Table */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-purple-400" />
          <h2 className="text-sm font-mono font-bold text-white">
            REST API ENDPOINTS MATRIX (SECTION 11)
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase">
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3">Endpoint</th>
                <th className="py-2.5 px-3 font-sans">Description</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">GET</td>
                <td className="py-2.5 px-3 text-slate-200">/api/health</td>
                <td className="py-2.5 px-3 text-slate-300 font-sans">
                  Returns platform health, uptime, active camera metrics
                </td>
                <td className="py-2.5 px-3 text-emerald-400">200 OK</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">GET</td>
                <td className="py-2.5 px-3 text-slate-200">/api/cameras</td>
                <td className="py-2.5 px-3 text-slate-300 font-sans">
                  Retrieves all registered CCTV feeds and parameters
                </td>
                <td className="py-2.5 px-3 text-emerald-400">200 OK</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-blue-400 font-bold">POST</td>
                <td className="py-2.5 px-3 text-slate-200">/api/cameras</td>
                <td className="py-2.5 px-3 text-slate-300 font-sans">
                  Registers new camera source with credentials sanitization
                </td>
                <td className="py-2.5 px-3 text-blue-400">201 Created</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-amber-400 font-bold">PATCH</td>
                <td className="py-2.5 px-3 text-slate-200">/api/incidents/:id/review</td>
                <td className="py-2.5 px-3 text-slate-300 font-sans">
                  Updates forensic review status and appends reviewer notes
                </td>
                <td className="py-2.5 px-3 text-emerald-400">200 OK</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-blue-400 font-bold">POST</td>
                <td className="py-2.5 px-3 text-slate-200">/api/detect_frame</td>
                <td className="py-2.5 px-3 text-slate-300 font-sans">
                  Accepts image frame bytes, runs YOLOv8 and ByteTrack tracking
                </td>
                <td className="py-2.5 px-3 text-emerald-400">200 OK</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
