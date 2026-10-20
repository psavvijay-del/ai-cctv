import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Camera,
  MapPin,
  Cpu,
  Shield,
  FileText,
  User,
  Info,
} from 'lucide-react';
import { Incident, ReviewStatus } from '../types';

interface IncidentModalProps {
  incident: Incident | null;
  onClose: () => void;
  onSaveReview: (
    id: string,
    status: ReviewStatus,
    notes: string
  ) => Promise<void>;
}

export const IncidentModal: React.FC<IncidentModalProps> = ({
  incident,
  onClose,
  onSaveReview,
}) => {
  if (!incident) return null;

  const [selectedStatus, setSelectedStatus] = useState<ReviewStatus>(
    incident.review_status
  );
  const [reviewerNotes, setReviewerNotes] = useState<string>(
    incident.reviewer_notes || ''
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSaveReview(incident.id, selectedStatus, reviewerNotes);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSeverityBadge = (sev: string) => {
    if (sev === 'critical') {
      return 'bg-red-950/80 text-red-400 border-red-700';
    }
    if (sev === 'warning') {
      return 'bg-amber-950/80 text-amber-400 border-amber-700';
    }
    return 'bg-blue-950/80 text-blue-400 border-blue-700';
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-[#0f172a] border border-slate-700/80 rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto">
        {/* Modal Header */}
        <div className="bg-slate-900 border-b border-slate-800 px-5 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-950/70 border border-red-800/60 text-red-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-white text-base">
                  {incident.id}
                </span>
                <span
                  className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded border uppercase ${getSeverityBadge(
                    incident.severity
                  )}`}
                >
                  {incident.severity}
                </span>
                <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  {incident.event_type}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Potential Incident Record • Forensic Verification Protocol
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            aria-label="Close incident modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-3.5 text-xs overflow-y-auto flex-1">
          {/* Mandatory Security Operations Disclaimer Banner */}
          <div className="p-2.5 rounded-lg bg-blue-950/40 border border-blue-800/50 text-blue-200 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold text-[11px] uppercase tracking-wide text-blue-300">
                Human Verification Notice
              </p>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                This event is categorized as a <strong>potential incident</strong> based on algorithmic video analysis.
                Never treat AI detections as proof that a crime or infraction has occurred. Verification by an authorized officer is mandatory.
              </p>
            </div>
          </div>

          {/* Visual Evidence / Video Frame Preview */}
          <div className="rounded-lg bg-black border border-slate-800 overflow-hidden relative">
            <div className="h-44 w-full bg-slate-950 flex flex-col items-center justify-center p-3 text-center">
              {incident.snapshot_url ? (
                <img
                  src={incident.snapshot_url}
                  alt={`Evidence frame for ${incident.id}`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="space-y-1.5">
                  <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center mx-auto text-blue-400">
                    <Camera className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-slate-300 block text-xs">
                    SURVEILLANCE EVIDENCE FRAME: {incident.camera_id}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    TIMESTAMP: {new Date(incident.timestamp).toLocaleString()}
                  </span>
                  {incident.bbox && (
                    <span className="text-[10px] text-amber-400 font-mono bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/30 inline-block">
                      TARGET BBOX: X={incident.bbox.x}, Y={incident.bbox.y}, W={incident.bbox.width}, H={incident.bbox.height}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="bg-slate-900/90 px-3 py-1.5 border-t border-slate-800 flex justify-between text-[11px] font-mono text-slate-400">
              <span>STREAM: {incident.clip_path || 'ARCHIVE.mp4'}</span>
              <span>AI CONFIDENCE: <strong className="text-emerald-400">{(incident.confidence * 100).toFixed(1)}%</strong></span>
            </div>
          </div>

          {/* Incident Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block text-[10px] font-mono">CAMERA FEED</span>
              <span className="font-semibold text-slate-100 font-mono flex items-center gap-1.5 mt-0.5">
                <Camera className="w-3.5 h-3.5 text-blue-400" />
                {incident.camera_name || incident.camera_id}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block text-[10px] font-mono">DETECTED TIMESTAMP</span>
              <span className="font-semibold text-slate-100 font-mono flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                {new Date(incident.timestamp).toLocaleTimeString()}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block text-[10px] font-mono">TARGET OBJECT CLASS</span>
              <span className="font-semibold text-slate-100 font-mono flex items-center gap-1.5 mt-0.5">
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                {incident.object_class || 'Entity / Cluster'}
              </span>
            </div>
          </div>

          {/* Reviewer Action Form */}
          <form onSubmit={handleSubmit} className="space-y-3 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-slate-300 font-mono font-semibold mb-1.5">
                OFFICER REVIEW STATUS
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedStatus('pending')}
                  className={`p-2 rounded-lg border flex items-center justify-center gap-1.5 font-mono text-xs transition-colors ${
                    selectedStatus === 'pending'
                      ? 'bg-amber-950/80 border-amber-500 text-amber-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  PENDING
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedStatus('confirmed')}
                  className={`p-2 rounded-lg border flex items-center justify-center gap-1.5 font-mono text-xs transition-colors ${
                    selectedStatus === 'confirmed'
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  CONFIRMED
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedStatus('dismissed')}
                  className={`p-2 rounded-lg border flex items-center justify-center gap-1.5 font-mono text-xs transition-colors ${
                    selectedStatus === 'dismissed'
                      ? 'bg-slate-800 border-slate-500 text-slate-200 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  DISMISSED
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-mono font-semibold mb-1">
                REVIEWER INVESTIGATION NOTES
              </label>
              <textarea
                value={reviewerNotes}
                onChange={(e) => setReviewerNotes(e.target.value)}
                placeholder="Enter incident verification notes, guard response details, or false-positive rationale..."
                rows={3}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-sans"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
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
                {isSubmitting ? 'Saving Review...' : 'Save & Record Audit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
