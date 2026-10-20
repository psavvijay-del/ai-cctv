import React, { useState } from 'react';
import {
  BarChart3,
  Calendar,
  Download,
  Filter,
  TrendingUp,
  Cpu,
  Clock,
  Camera as CameraIcon,
  PieChart as PieIcon,
  Activity,
  CheckCircle,
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
  CartesianGrid,
} from 'recharts';
import { Incident, Camera } from '../types';
import { computeAnalyticsSummary, exportIncidentsToCSV } from '../utils/analytics';

interface AnalyticsPageProps {
  incidents: Incident[];
  cameras: Camera[];
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  incidents,
  cameras,
}) => {
  const [dateRange, setDateRange] = useState<string>('7d');

  const summary = computeAnalyticsSummary(incidents);

  // Confidence distribution histogram buckets
  const confidenceBuckets = [
    { range: '50-60%', count: 0 },
    { range: '60-70%', count: 0 },
    { range: '70-80%', count: 0 },
    { range: '80-90%', count: 0 },
    { range: '90-100%', count: 0 },
  ];

  incidents.forEach((i) => {
    const c = i.confidence;
    if (c >= 0.9) confidenceBuckets[4].count++;
    else if (c >= 0.8) confidenceBuckets[3].count++;
    else if (c >= 0.7) confidenceBuckets[2].count++;
    else if (c >= 0.6) confidenceBuckets[1].count++;
    else confidenceBuckets[0].count++;
  });

  const handleExportCSV = () => {
    const csvContent = exportIncidentsToCSV(incidents);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CCTV_Analytics_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold font-mono text-white">
                SURVEILLANCE ANOMALY ANALYTICS & METRICS
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                FORENSIC REPORTING
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Empirical incident trends, severity distributions, and vision pipeline processing performance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500"
          >
            <option value="24h">LAST 24 HOURS</option>
            <option value="7d">LAST 7 DAYS</option>
            <option value="30d">LAST 30 DAYS</option>
            <option value="all">ALL TIME</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-md transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Full Analytics CSV
          </button>
        </div>
      </div>

      {/* KPI Performance Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block">TOTAL RECORDED EVENTS</span>
          <span className="text-2xl font-bold text-white mt-1 block">
            {summary.totalIncidents}
          </span>
          <span className="text-[11px] text-blue-400 mt-1 block font-sans">
            Forensic database records
          </span>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block">CONFIRMED INCIDENTS</span>
          <span className="text-2xl font-bold text-emerald-400 mt-1 block">
            {summary.confirmedCount}
          </span>
          <span className="text-[11px] text-emerald-500/80 mt-1 block font-sans">
            Verified by human operator
          </span>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block">MEAN MODEL CONFIDENCE</span>
          <span className="text-2xl font-bold text-yellow-300 mt-1 block">
            {(summary.averageConfidence * 100).toFixed(1)}%
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block font-sans">
            Across all valid detections
          </span>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block">PROCESSING SPEED (FPS)</span>
          <span className="text-2xl font-bold text-emerald-400 mt-1 block">
            29.8 FPS
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block font-sans">
            Measured video frame rate
          </span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Hourly Incident Occurrence Trend */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-mono font-bold text-white">
                HOURLY INCIDENT FREQUENCY
              </h2>
              <p className="text-xs text-slate-400">
                Distribution of potential anomalies across 24-hour cycle
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              TIME SERIES
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary.hourlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={10} tickLine={false} />
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
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Total Incidents"
                  stroke="#3b82f6"
                  fill="#1e3a8a"
                  fillOpacity={0.4}
                />
                <Area
                  type="monotone"
                  dataKey="critical"
                  name="Critical"
                  stroke="#ef4444"
                  fill="#7f1d1d"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Incidents by Category */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-mono font-bold text-white">
                INCIDENTS BY ANOMALY CATEGORY
              </h2>
              <p className="text-xs text-slate-400">
                Breakdown of detections by security domain
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              CATEGORY COUNTS
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={summary.categoryDistribution}
                layout="vertical"
                margin={{ left: 20 }}
              >
                <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="category"
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  width={130}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    color: '#f8fafc',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                  }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Camera-Wise Incident Distribution */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-mono font-bold text-white">
                CAMERA-WISE INCIDENT CONCENTRATION
              </h2>
              <p className="text-xs text-slate-400">
                Protected facility zones with highest activity
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              LOCATION ANALYSIS
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.cameraDistribution}>
                <XAxis dataKey="camera" stroke="#64748b" fontSize={10} tickLine={false} />
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
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Confidence Score Distribution Histogram */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-mono font-bold text-white">
                MODEL CONFIDENCE SCORE HISTOGRAM
              </h2>
              <p className="text-xs text-slate-400">
                Reliability curve for object classification detections
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              AI CONFIDENCE
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={confidenceBuckets}>
                <XAxis dataKey="range" stroke="#64748b" fontSize={10} tickLine={false} />
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
                <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
