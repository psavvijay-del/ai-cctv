import React, { useState } from 'react';
import {
  Cpu,
  Shield,
  Sliders,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Layers,
  Flame,
  UserCheck,
  Package,
  Car,
  Users,
} from 'lucide-react';
import { DetectionModule } from '../types';

interface ModulesPageProps {
  modules: DetectionModule[];
  onUpdateModule: (id: string, updates: Partial<DetectionModule>) => Promise<void>;
}

export const ModulesPage: React.FC<ModulesPageProps> = ({
  modules,
  onUpdateModule,
}) => {
  const [selectedModule, setSelectedModule] = useState<DetectionModule | null>(
    modules[0] || null
  );
  const [thresholds, setThresholds] = useState<Record<string, number>>(
    modules.reduce((acc, m) => ({ ...acc, [m.id]: m.threshold }), {})
  );

  const handleSliderChange = (id: string, val: number) => {
    setThresholds((prev) => ({ ...prev, [id]: val }));
  };

  const handleSaveThreshold = async (id: string) => {
    const val = thresholds[id];
    await onUpdateModule(id, { threshold: val });
  };

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return {
        label: 'ACTIVE / OPERATIONAL',
        color: 'bg-emerald-950 text-emerald-400 border-emerald-800',
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      };
    }
    if (status === 'configured') {
      return {
        label: 'CONFIGURED / RULES READY',
        color: 'bg-blue-950 text-blue-400 border-blue-800',
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      };
    }
    return {
      label: 'NOT CONFIGURED',
      color: 'bg-red-950/80 text-red-400 border-red-800',
      icon: <XCircle className="w-3.5 h-3.5" />,
    };
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* Page Title */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-950/80 border border-indigo-800 text-indigo-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold font-mono text-white">
                AI COMPUTER VISION DETECTION MODULES (MODULES A – J)
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                10 MODULE ARCHITECTURE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Independent anomaly detection algorithms, neural network models, and parameter thresholds.
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
          <span>OPERATIONAL: </span>
          <strong className="text-emerald-400">
            {modules.filter((m) => m.status === 'active' || m.status === 'configured').length}
          </strong>{' '}
          / {modules.length}
        </div>
      </div>

      {/* Mandatory Architecture Notice */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3 text-xs text-slate-300">
        <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h2 className="font-semibold text-white">
            Independent Modular AI Architecture & Explicit Transparency
          </h2>
          <p className="text-slate-400 leading-relaxed">
            In accordance with engineering standards, each module maintains an explicit operational status.
            Modules requiring specialized models (such as temporal video action recognition for altercations or dedicated thermal fire weights) are marked as{' '}
            <strong className="text-red-400">NOT CONFIGURED</strong> rather than falsified.
          </p>
        </div>
      </div>

      {/* Modules Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.map((mod) => {
          const badge = getStatusBadge(mod.status);
          const currentThresh = thresholds[mod.id] ?? mod.threshold;

          return (
            <div
              key={mod.id}
              className={`bg-[#0f172a] border rounded-xl p-4 flex flex-col justify-between space-y-3.5 transition-all shadow-xs ${
                mod.status === 'not_configured'
                  ? 'border-slate-800/80 bg-[#0c101d]'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-xs text-blue-400">
                    {mod.code}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border uppercase flex items-center gap-1.5 ${badge.color}`}
                  >
                    {badge.icon}
                    {badge.label}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-white mt-2">
                  {mod.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {mod.description}
                </p>

                {/* Model and requirements */}
                <div className="mt-3 p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>UNDERLYING MODEL:</span>
                    <span className="text-slate-200">{mod.model}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>WEIGHTS REQUIRED:</span>
                    <span
                      className={
                        mod.requiresExternalWeights
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }
                    >
                      {mod.requiresExternalWeights
                        ? 'External Weights Needed'
                        : 'Preloaded / Built-in'}
                    </span>
                  </div>
                </div>

                {/* Technical notes */}
                <p className="text-[11px] text-slate-400 italic mt-2">
                  {mod.notes}
                </p>
              </div>

              {/* Threshold Slider for Configurable Modules */}
              {mod.status !== 'not_configured' ? (
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-400">
                      DETECTION SENSITIVITY THRESHOLD:
                    </span>
                    <span className="text-emerald-400 font-bold">
                      {(currentThresh * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0.2"
                      max="0.95"
                      step="0.05"
                      value={currentThresh}
                      onChange={(e) =>
                        handleSliderChange(mod.id, parseFloat(e.target.value))
                      }
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                    <button
                      onClick={() => handleSaveThreshold(mod.id)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 whitespace-nowrap"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-red-400/90 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    To activate: Deploy required weights to Python backend.
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
