import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Camera,
  Calendar,
  AlertOctagon,
  ChevronDown,
} from 'lucide-react';
import { Incident, ReviewStatus, SeverityLevel } from '../types';
import { exportIncidentsToCSV } from '../utils/analytics';

interface IncidentsPageProps {
  incidents: Incident[];
  onInspectIncident: (incident: Incident) => void;
  onReviewIncident: (
    id: string,
    status: ReviewStatus,
    notes: string
  ) => Promise<void>;
}

export const IncidentsPage: React.FC<IncidentsPageProps> = ({
  incidents,
  onInspectIncident,
  onReviewIncident,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    incidents.forEach((i) => set.add(i.event_type));
    return Array.from(set);
  }, [incidents]);

  // Filtered and sorted incidents
  const filteredIncidents = useMemo(() => {
    return incidents
      .filter((inc) => {
        if (filterSeverity !== 'all' && inc.severity !== filterSeverity) {
          return false;
        }
        if (filterStatus !== 'all' && inc.review_status !== filterStatus) {
          return false;
        }
        if (filterCategory !== 'all' && inc.event_type !== filterCategory) {
          return false;
        }
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchId = inc.id.toLowerCase().includes(q);
          const matchCam = (inc.camera_name || inc.camera_id)
            .toLowerCase()
            .includes(q);
          const matchEvent = inc.event_type.toLowerCase().includes(q);
          const matchNotes = (inc.reviewer_notes || '').toLowerCase().includes(q);
          if (!matchId && !matchCam && !matchEvent && !matchNotes) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      });
  }, [incidents, filterSeverity, filterStatus, filterCategory, searchTerm, sortOrder]);

  const handleExportCSV = () => {
    const csvContent = exportIncidentsToCSV(filteredIncidents);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CCTV_Incidents_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* Page Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-950/80 border border-amber-800 text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold font-mono text-white">
                SECURITY INCIDENT & ALERT FORENSIC LOGS
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                {filteredIncidents.length} EVENTS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Review, confirm, or dismiss automated video anomaly detections with forensic notes.
            </p>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono flex items-center gap-1.5 transition-colors"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          Export Incident CSV
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative md:col-span-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search ID, camera, notes..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-sans"
            />
          </div>

          {/* Severity Filter */}
          <div>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500 font-mono"
            >
              <option value="all">ALL SEVERITIES</option>
              <option value="critical">CRITICAL ONLY</option>
              <option value="warning">WARNING ONLY</option>
              <option value="info">INFO ONLY</option>
            </select>
          </div>

          {/* Review Status Filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500 font-mono"
            >
              <option value="all">ALL STATUSES</option>
              <option value="pending">PENDING VERIFICATION</option>
              <option value="confirmed">CONFIRMED INCIDENTS</option>
              <option value="dismissed">DISMISSED (FALSE ALARM)</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500 font-mono"
            >
              <option value="all">ALL DETECTION CATEGORIES</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sort and Active Count */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs font-mono text-slate-400">
          <span>
            SHOWING <strong>{filteredIncidents.length}</strong> OF{' '}
            <strong>{incidents.length}</strong> TOTAL EVENTS
          </span>

          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
          >
            <span>SORT: {sortOrder === 'desc' ? 'NEWEST FIRST' : 'OLDEST FIRST'}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transform transition-transform ${
                sortOrder === 'asc' ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Incidents Data Table */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase">
                <th className="py-3 px-3.5">Incident ID</th>
                <th className="py-3 px-3.5">Camera Source</th>
                <th className="py-3 px-3.5">Event Category</th>
                <th className="py-3 px-3.5">Severity</th>
                <th className="py-3 px-3.5">AI Confidence</th>
                <th className="py-3 px-3.5">Detected At</th>
                <th className="py-3 px-3.5">Review Status</th>
                <th className="py-3 px-3.5">Reviewer Notes</th>
                <th className="py-3 px-3.5 min-w-[140px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 font-sans">
                    No incident records match the current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((inc) => (
                  <tr
                    key={inc.id}
                    className="hover:bg-slate-900/70 transition-colors"
                  >
                    <td className="py-3 px-3.5 font-bold text-white">
                      {inc.id}
                    </td>
                    <td className="py-3 px-3.5 text-slate-300 font-sans">
                      <div className="flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span className="truncate max-w-[130px]">
                          {inc.camera_name || inc.camera_id}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3.5 text-slate-200 font-sans">
                      {inc.event_type}
                    </td>
                    <td className="py-3 px-3.5">
                      <span
                        className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${
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
                    <td className="py-3 px-3.5 text-emerald-400">
                      {(inc.confidence * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-3.5 text-slate-400 text-[11px]">
                      {new Date(inc.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-3.5">
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
                    <td className="py-3 px-3.5 text-slate-400 font-sans truncate max-w-xs text-[11px]">
                      {inc.reviewer_notes || 'Pending human evaluation.'}
                    </td>
                    <td className="py-3 px-3.5 text-right font-sans whitespace-nowrap">
                      <button
                        onClick={() => onInspectIncident(inc)}
                        aria-label={`Examine incident ${inc.id}`}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors"
                      >
                        Examine & Verify
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
