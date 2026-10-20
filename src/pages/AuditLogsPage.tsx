import React from 'react';
import {
  ShieldAlert,
  UserCheck,
  Lock,
  EyeOff,
  Database,
  FileCheck,
  CheckCircle2,
  Clock,
  Shield,
  AlertCircle,
} from 'lucide-react';
import { AuditLog, UserRole } from '../types';

interface AuditLogsPageProps {
  auditLogs: AuditLog[];
  activeRole: UserRole;
}

export const AuditLogsPage: React.FC<AuditLogsPageProps> = ({
  auditLogs,
  activeRole,
}) => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* Page Title */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-950/80 border border-blue-800 text-blue-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold font-mono text-white">
                SECURITY COMPLIANCE & FORENSIC AUDIT TRAIL
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                IMMUTABLE LOGS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Accountability logs recording every reviewer decision, status change, and camera parameter edit.
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-slate-300 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-emerald-400" />
          <span>CURRENT ACTIVE ROLE: </span>
          <strong className="text-white uppercase">{activeRole}</strong>
        </div>
      </div>

      {/* Security & Privacy Principles Grid (Section 13) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-white font-mono text-xs font-bold">
            <EyeOff className="w-4 h-4 text-emerald-400" />
            <span>ETHICAL AI & PRIVACY</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Facial recognition and biometric identity inference are strictly prohibited. The system detects only object classes (persons, vehicles, parcels) to prevent discriminatory bias.
          </p>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-white font-mono text-xs font-bold">
            <Lock className="w-4 h-4 text-blue-400" />
            <span>CREDENTIAL SANITIZATION</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            All RTSP camera feed URLs and stream passwords are automatically masked before reaching frontend components to protect perimeter network infrastructure.
          </p>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-white font-mono text-xs font-bold">
            <FileCheck className="w-4 h-4 text-purple-400" />
            <span>HUMAN-IN-THE-LOOP</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            AI detections are flagged exclusively as preliminary "potential incidents". The platform assists human decision-making and never automatically penalizes individuals.
          </p>
        </div>
      </div>

      {/* Audit Log Chronological Feed */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
          <h2 className="text-xs font-mono font-bold text-white uppercase">
            AUDIT TRAIL RECORDS ({auditLogs.length} ENTRIES)
          </h2>
          <span className="text-[10px] font-mono text-slate-400">
            AUTO-RECORDED ON EVERY MUTATION
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase">
                <th className="py-2.5 px-4">Audit ID</th>
                <th className="py-2.5 px-4">Operator / User</th>
                <th className="py-2.5 px-4">Action</th>
                <th className="py-2.5 px-4">Associated Entity</th>
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">Action Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-300">{log.id}</td>
                  <td className="py-3 px-4 text-white">
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-blue-300">
                      {log.username}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                        log.action.includes('CONFIRM')
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : log.action.includes('DISMISS')
                          ? 'bg-slate-800 text-slate-400 border-slate-700'
                          : 'bg-blue-950 text-blue-400 border-blue-800'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {log.incident_id || 'System / Camera'}
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-[11px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-sans text-xs">
                    {log.details}
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
