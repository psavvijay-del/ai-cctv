import React from 'react';
import {
  Camera as CameraIcon,
  Video,
  AlertTriangle,
  AlertOctagon,
  Clock,
  CheckCircle,
  Activity,
  ShieldCheck,
  TrendingUp,
  Radio,
  Eye,
  Server,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { Camera, Incident } from '../types';

interface DashboardPageProps {
  cameras: Camera[];
  incidents: Incident[];
  onSelectCamera: (cameraId: string) => void;
  onInspectIncident: (incident: Incident) => void;
  onNavigateToMonitoring: () => void;
  onNavigateToIncidents: () => void;
  onNavigateToCameras: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  cameras,
  incidents,
  onSelectCamera,
  onInspectIncident,
  onNavigateToMonitoring,
  onNavigateToIncidents,
  onNavigateToCameras,
}) => {
  const onlineCameras = cameras.filter((c) => c.connection_status === 'online').length;
  const criticalCount = incidents.filter((i) => i.severity === 'critical').length;
  const pendingCount = incidents.filter((i) => i.review_status === 'pending').length;
  const warningCount = incidents.filter((i) => i.severity === 'warning').length;

  // Category counts for chart
  const catMap: Record<string, number> = {};
  incidents.forEach((i) => {
    catMap[i.event_type] = (catMap[i.event_type] || 0) + 1;
  });
  const categoryChartData = Object.entries(catMap).map(([name, count]) => ({
    name: name.replace(' Detection', '').replace(' Monitoring', ''),
    count,
  }));

  // Severity data for donut chart
  const severityData = [
    { name: 'Critical', value: criticalCount, color: '#ef4444' },
    { name: 'Warning', value: warningCount, color: '#f59e0b' },
    { name: 'Info', value: incidents.length - criticalCount - warningCount, color: '#3b82f6' },
  ].filter((s) => s.value > 0);

  // Hourly simulated trend
  const hourlyData = [
    { hour: '04:00', incidents: 0, critical: 0 },
    { hour: '06:00', incidents: 1, critical: 0 },
    { hour: '08:00', incidents: 3, critical: 1 },
    { hour: '10:00', incidents: 5, critical: 2 },
    { hour: '12:00', incidents: 4, critical: 1 },
    { hour: '14:00', incidents: 2, critical: 0 },
    { hour: '16:00', incidents: 6, critical: 2 },
    { hour: '18:00', incidents: incidents.length, critical: criticalCount },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* Page Title & Status Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono text-white tracking-tight">
              SECURITY OPERATIONS CENTER (SOC) OVERVIEW
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
              REAL-TIME MONITORING
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-800/40">
              DEMO DATA
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated anomaly detection, multi-camera feeds, and forensic incident auditing.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onNavigateToMonitoring}
            className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-md transition-colors"
          >
            <Video className="w-4 h-4" />
            Open Live Camera Feeds
          </button>
        </div>
      </div>

      {/* Top 5 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total Cameras */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono">TOTAL CAMERAS</span>
            <CameraIcon className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-white">{cameras.length}</span>
            <span className="text-[11px] text-slate-400">Configured</span>
          </div>
          <button
            onClick={onNavigateToCameras}
            className="text-[11px] text-blue-400 hover:text-blue-300 mt-2 text-left"
          >
            Manage Feeds →
          </button>
        </div>

        {/* Online Feeds */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono">ONLINE FEEDS</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {onlineCameras}
            </span>
            <span className="text-[11px] text-emerald-500/80 font-mono">
              {Math.round((onlineCameras / (cameras.length || 1)) * 100)}% ACTIVE
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-2">Zero feed drops</span>
        </div>

        {/* Total Incidents */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono">INCIDENTS TODAY</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-white">{incidents.length}</span>
            <span className="text-[11px] text-amber-400 font-mono">Auto-logged</span>
          </div>
          <button
            onClick={onNavigateToIncidents}
            className="text-[11px] text-amber-400 hover:text-amber-300 mt-2 text-left"
          >
            View Incident Log →
          </button>
        </div>

        {/* Critical Alerts */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono">CRITICAL ALERTS</span>
            <AlertOctagon className="w-4 h-4 text-red-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-red-400">{criticalCount}</span>
            <span className="text-[11px] text-red-400 font-mono uppercase">Priority 1</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-2">Requires immediate check</span>
        </div>

        {/* Pending Review */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono">PENDING REVIEW</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-yellow-300">{pendingCount}</span>
            <span className="text-[11px] text-slate-400 font-mono">Awaiting verification</span>
          </div>
          <button
            onClick={onNavigateToIncidents}
            className="text-[11px] text-blue-400 hover:text-blue-300 mt-2 text-left"
          >
            Review Potential Events →
          </button>
        </div>
      </div>

      {/* System Health & Video-Processing Status Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-white text-xs sm:text-sm">
                AI COMPUTER VISION ENGINE STATUS
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Browser Canvas Detection Pipeline is active (30 FPS). Standalone Python OpenCV backend available on port 8000.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs text-slate-300">
          <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-400 text-[10px] block">INFERENCE LATENCY</span>
            <span className="text-emerald-400 font-bold">~32 ms</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-400 text-[10px] block">VIDEO ENCODING</span>
            <span className="text-blue-400 font-bold">H.264 / WebM</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Event Distribution Bar Chart */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 col-span-1 lg:col-span-2 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-mono font-bold text-white">
                INCIDENT EVENT DISTRIBUTION
              </h2>
              <p className="text-xs text-slate-400">
                Detected events grouped by security anomaly module
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded">
              MODULE STATS
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    color: '#f8fafc',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution Donut */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-mono font-bold text-white">SEVERITY RATIO</h2>
              <p className="text-xs text-slate-400">Risk classification breakdown</p>
            </div>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    color: '#f8fafc',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-around text-xs font-mono pt-2 border-t border-slate-800">
            {severityData.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-slate-300">{s.name}:</span>
                <span className="font-bold text-white">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Camera Status Grid Overview */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-mono font-bold text-white">
              CCTV CAMERA NETWORK STATUS
            </h2>
            <p className="text-xs text-slate-400">
              Live operational surveillance nodes across protected facilities
            </p>
          </div>
          <button
            onClick={onNavigateToCameras}
            className="text-xs text-blue-400 hover:text-blue-300 font-mono"
          >
            All Cameras ({cameras.length}) →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {cameras.slice(0, 4).map((cam) => (
            <div
              key={cam.id}
              onClick={() => {
                onSelectCamera(cam.id);
                onNavigateToMonitoring();
              }}
              className="group bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-lg p-3 cursor-pointer transition-all hover:bg-slate-800/70"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-semibold text-xs text-slate-200">
                  {cam.id}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/70 px-1.5 py-0.5 rounded border border-emerald-800/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ONLINE
                </span>
              </div>

              <div className="mt-2 text-xs font-medium text-white truncate group-hover:text-blue-300">
                {cam.name}
              </div>
              <div className="text-[11px] text-slate-400 truncate mt-0.5">
                {cam.location}
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>{cam.resolution}</span>
                <span className="text-blue-400 font-bold">{cam.fps} FPS</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Latest Incident Records Table */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-sm font-mono font-bold text-white">
              LATEST POTENTIAL INCIDENTS
            </h2>
            <p className="text-xs text-slate-400">
              Chronological log of algorithmic anomaly detections pending forensic review
            </p>
          </div>

          <button
            onClick={onNavigateToIncidents}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium"
          >
            Open Full Incident Manager ({incidents.length}) →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase">
                <th className="py-2.5 px-3">Incident ID</th>
                <th className="py-2.5 px-3">Camera</th>
                <th className="py-2.5 px-3">Event Category</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Confidence</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Review Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {incidents.slice(0, 5).map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-white">{inc.id}</td>
                  <td className="py-2.5 px-3 text-slate-300">
                    {inc.camera_name || inc.camera_id}
                  </td>
                  <td className="py-2.5 px-3 text-slate-200">{inc.event_type}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded border ${
                        inc.severity === 'critical'
                          ? 'bg-red-950/80 text-red-400 border-red-700'
                          : inc.severity === 'warning'
                          ? 'bg-amber-950/80 text-amber-400 border-amber-700'
                          : 'bg-blue-950/80 text-blue-400 border-blue-700'
                      }`}
                    >
                      {inc.severity}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">
                    {(inc.confidence * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                    {new Date(inc.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase ${
                        inc.review_status === 'confirmed'
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : inc.review_status === 'dismissed'
                          ? 'bg-slate-800 text-slate-400 border-slate-700'
                          : 'bg-amber-950 text-amber-400 border-amber-800'
                      }`}
                    >
                      {inc.review_status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => onInspectIncident(inc)}
                      aria-label={`Inspect evidence for ${inc.id}`}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 text-[11px] font-sans font-medium transition-colors"
                    >
                      Inspect Evidence
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
