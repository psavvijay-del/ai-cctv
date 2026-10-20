import React, { useState, useEffect } from 'react';
import {
  Shield,
  Bell,
  Volume2,
  VolumeX,
  Server,
  UserCheck,
  CheckCircle2,
  AlertOctagon,
  Clock,
  Menu,
  ExternalLink,
} from 'lucide-react';
import { UserRole } from '../types';
import { alertSound } from '../utils/soundAlert';

interface NavbarProps {
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  pendingIncidentsCount: number;
  criticalIncidentsCount: number;
  onNavigateToIncidents: () => void;
  onNavigateToGuide: () => void;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeRole,
  onRoleChange,
  pendingIncidentsCount,
  criticalIncidentsCount,
  onNavigateToIncidents,
  onNavigateToGuide,
  mobileMenuOpen,
  onToggleMobileMenu,
}) => {
  const [time, setTime] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        }) +
          ' ' +
          now.toLocaleTimeString('en-US', { hour12: false }) +
          ' UTC'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    alertSound.setEnabled(next);
    if (next) {
      alertSound.playWarningAlert();
    }
  };

  return (
    <header className="bg-[#0b0f17] border-b border-slate-800 text-slate-100 sticky top-0 z-40 px-4 py-2.5 shadow-md">
      <div className="flex items-center justify-between gap-2 max-w-7xl mx-auto">
        {/* Left: Brand & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-blue-950 border border-blue-500/30 text-blue-400">
              <Shield className="w-5 h-5 text-blue-400" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-wider text-sm sm:text-base text-white font-mono">
                  SENTINEL-SOC
                </span>
                <span className="hidden sm:inline-block text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  AI CCTV
                </span>
                <span className="hidden lg:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-700/40">
                  DEMO DATA
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-slate-400 font-sans truncate max-w-xs">
                Real-Time Anomaly Detection & Incident Monitoring
              </p>
            </div>
          </div>
        </div>

        {/* Center: System Status & Time */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>{time}</span>
          </div>

          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>SOC ONLINE</span>
          </div>
        </div>

        {/* Right: Controls, Alerts, Role */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sound Alarm Toggle */}
          <button
            onClick={toggleSound}
            className={`p-2 rounded-md border text-xs flex items-center gap-1.5 transition-colors ${
              soundEnabled
                ? 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
                : 'bg-red-950/30 border-red-800/50 text-red-400 hover:bg-red-900/40'
            }`}
            title={soundEnabled ? 'Alert chimes enabled' : 'Alert chimes muted'}
            aria-label={soundEnabled ? 'Mute alert sounds' : 'Unmute alert sounds'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
            <span className="hidden sm:inline font-mono text-[11px]">
              {soundEnabled ? 'AUDIO ON' : 'MUTED'}
            </span>
          </button>

          {/* Incident Alerts Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              aria-label="View security incident alerts"
            >
              <Bell className="w-4 h-4" />
              {pendingIncidentsCount > 0 && (
                <span
                  className={`absolute -top-1 -right-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full border ${
                    criticalIncidentsCount > 0
                      ? 'bg-red-600 text-white border-red-400 animate-pulse'
                      : 'bg-amber-500 text-slate-950 border-amber-300'
                  }`}
                >
                  {pendingIncidentsCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-50 p-3">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                  <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                    Unreviewed Potential Incidents
                  </span>
                  <span className="text-[11px] font-mono text-red-400 bg-red-950/60 px-1.5 py-0.5 rounded border border-red-800/40">
                    {pendingIncidentsCount} Pending
                  </span>
                </div>
                <div className="text-xs text-slate-300 space-y-2 max-h-56 overflow-y-auto">
                  {criticalIncidentsCount > 0 && (
                    <div className="p-2 rounded bg-red-950/50 border border-red-800/40 text-red-200">
                      <div className="flex items-center gap-1.5 font-semibold text-[11px]">
                        <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
                        <span>CRITICAL: Restricted Intrusion</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        CAM-03 East Perimeter barrier crossing detected.
                      </p>
                    </div>
                  )}
                  <p className="text-[11px] text-slate-400 italic">
                    AI detections are preliminary potential incidents and require human review.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800 flex justify-between">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      onNavigateToIncidents();
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                  >
                    Open Incident Manager →
                  </button>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Python Backend Connect Indicator */}
          <button
            onClick={onNavigateToGuide}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-mono transition-colors"
            title="Configure Standalone Python OpenCV / YOLOv8 Backend"
          >
            <Server className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[11px]">YOLOv8 BACKEND</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </button>

          {/* User Role Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-md px-2 py-1">
            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={activeRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer font-mono"
              aria-label="Active Security Role"
            >
              <option value="admin" className="bg-slate-900 text-slate-200">
                ADMIN
              </option>
              <option value="senior_operator" className="bg-slate-900 text-slate-200">
                OPERATOR
              </option>
              <option value="security_officer" className="bg-slate-900 text-slate-200">
                OFFICER
              </option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
