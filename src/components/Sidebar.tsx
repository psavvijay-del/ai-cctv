import React from 'react';
import {
  LayoutDashboard,
  Video,
  Camera,
  AlertTriangle,
  Cpu,
  BarChart3,
  ShieldAlert,
  Terminal,
  Activity,
  Radio,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'monitoring'
  | 'cameras'
  | 'incidents'
  | 'modules'
  | 'analytics'
  | 'audit-logs'
  | 'backend-guide';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onlineCameraCount: number;
  totalCameraCount: number;
  criticalAlertCount: number;
  mobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onlineCameraCount,
  totalCameraCount,
  criticalAlertCount,
  mobileMenuOpen,
  onCloseMobileMenu,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string; badgeColor?: string }[] = [
    {
      id: 'dashboard',
      label: 'SOC Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'monitoring',
      label: 'Live Video Feed',
      icon: <Video className="w-4 h-4" />,
      badge: 'LIVE',
      badgeColor: 'bg-emerald-950 text-emerald-400 border-emerald-800',
    },
    {
      id: 'cameras',
      label: 'Camera Management',
      icon: <Camera className="w-4 h-4" />,
      badge: `${onlineCameraCount}/${totalCameraCount}`,
      badgeColor: 'bg-blue-950 text-blue-400 border-blue-800',
    },
    {
      id: 'incidents',
      label: 'Incidents & Alerts',
      icon: <AlertTriangle className="w-4 h-4" />,
      badge: criticalAlertCount > 0 ? `${criticalAlertCount} CRIT` : undefined,
      badgeColor: 'bg-red-950 text-red-400 border-red-800 animate-pulse',
    },
    {
      id: 'modules',
      label: 'AI Detection Modules',
      icon: <Cpu className="w-4 h-4" />,
      badge: 'A-J',
      badgeColor: 'bg-indigo-950 text-indigo-400 border-indigo-800',
    },
    {
      id: 'analytics',
      label: 'Analytics & Reports',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'audit-logs',
      label: 'Audit & Compliance',
      icon: <ShieldAlert className="w-4 h-4" />,
    },
    {
      id: 'backend-guide',
      label: 'Python / YOLOv8 Setup',
      icon: <Terminal className="w-4 h-4" />,
      badge: 'DEV',
      badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
    },
  ];

  const handleSelect = (tab: NavTab) => {
    onSelectTab(tab);
    onCloseMobileMenu();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 md:hidden"
          onClick={onCloseMobileMenu}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 md:top-[57px] left-0 h-screen md:h-[calc(100vh-57px)] w-64 bg-[#0d131f] border-r border-slate-800/80 flex flex-col justify-between z-50 transition-transform duration-200 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Navigation Links */}
        <div className="p-3 space-y-1">
          <div className="px-3 py-2 text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>OPERATIONS NAV</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <Radio className="w-3 h-3 animate-pulse" />
              ACTIVE
            </span>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? 'bg-blue-900/40 text-blue-300 border border-blue-500/30 shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={active ? 'text-blue-400' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                        item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer / Telemetry status */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          <div className="rounded-lg bg-slate-900/90 border border-slate-800 p-2.5 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5 font-mono text-[11px]">
                <Activity className="w-3.5 h-3.5 text-blue-400" />
                SURVEILLANCE SOC
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1 rounded border border-emerald-800/40">
                v2.5-STABLE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-800/60 text-[11px] font-mono text-slate-400">
              <div>
                <span className="block text-[10px] text-slate-400">FEEDS ONLINE</span>
                <span className="text-white font-semibold">
                  {onlineCameraCount} / {totalCameraCount}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400">ENGINE</span>
                <span className="text-blue-300 font-semibold">YOLO+CANVAS</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
