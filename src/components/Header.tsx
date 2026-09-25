import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Cpu, 
  Terminal, 
  Database, 
  Sliders, 
  AlertTriangle, 
  GitBranch, 
  ExternalLink,
  User,
  LogOut,
  ChevronDown,
  Lock
} from 'lucide-react';
import { GITHUB_REPO_URL } from '../services/gitExportService';
import { UserProfile } from '../types/auth';

export type ActiveTab = 'live' | 'manual' | 'batch' | 'ml' | 'alerts' | 'github';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  unresolvedAlertsCount: number;
  isStreaming: boolean;
  totalPacketsProcessed: number;
  currentUser: UserProfile | null;
  onOpenSignIn: () => void;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  unresolvedAlertsCount,
  isStreaming,
  totalPacketsProcessed,
  currentUser,
  onOpenSignIn,
  onSignOut,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'live', label: 'Live Monitor', icon: <Activity className="w-4 h-4" /> },
    { id: 'manual', label: 'Flow Inspector', icon: <Terminal className="w-4 h-4" /> },
    { id: 'batch', label: 'Batch CSV Analyzer', icon: <Database className="w-4 h-4" /> },
    { id: 'ml', label: 'ML Pipeline & Tuning', icon: <Sliders className="w-4 h-4" /> },
    { 
      id: 'alerts', 
      label: 'SOC Alerts', 
      icon: <AlertTriangle className="w-4 h-4" />, 
      count: unresolvedAlertsCount 
    },
    { id: 'github', label: 'GitHub & Backend Sync', icon: <GitBranch className="w-4 h-4" /> },
  ];

  return (
    <header className="border-b border-[#172a54] bg-[#02040a]/95 backdrop-blur-md sticky top-0 z-40">
      {/* Top SOC Brand & Telemetry Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#071330] border border-blue-600/50 flex items-center justify-center text-cyan-400 shadow-md shadow-blue-950/60">
            <ShieldCheck className="w-5 h-5 text-cyan-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white font-mono">
                SAFENET<span className="text-cyan-400">::</span>IDS
              </span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#091838] text-cyan-300 border border-blue-800">
                v2.4 Navy Edition
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans hidden sm:block">
              AI-Powered Network Intrusion Detection & Automated Threat Mitigation
            </p>
          </div>
        </div>

        {/* Live Telemetry Status Readout & User Profile */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#070e22] border border-[#172a54]">
            <span className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-cyan-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-slate-300">
              {isStreaming ? 'LIVE INGESTION' : 'STREAM PAUSED'}
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-300 font-semibold">{totalPacketsProcessed.toLocaleString()} pkts</span>
          </div>

          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded bg-[#070e22] border border-[#172a54] text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span>Ensemble Acc:</span>
            <span className="text-emerald-400 font-bold">99.4%</span>
          </div>

          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#08122c] hover:bg-[#0c1c45] border border-blue-900/60 text-slate-200 hover:text-white transition-colors"
          >
            <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono text-xs">NITYA123715/IDS</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>

          {/* Authentication Badge */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#0a183d] hover:bg-[#0e2154] border border-blue-700/60 text-white transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 font-bold text-[10px] flex items-center justify-center">
                  {currentUser.avatarInitials}
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-[11px] font-semibold text-slate-200 leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[9px] text-cyan-300 uppercase tracking-wider">
                    {currentUser.badgeNumber}
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-1 w-64 bg-[#070e22] border border-[#172a54] rounded-lg shadow-xl shadow-black/80 py-2 z-50 animate-in fade-in duration-150">
                  <div className="px-3 py-2 border-b border-[#172a54]">
                    <div className="font-semibold text-xs text-white">{currentUser.name}</div>
                    <div className="text-[10px] text-slate-400 font-sans">{currentUser.email}</div>
                    <div className="mt-1 text-[10px] text-cyan-400">{currentUser.roleTitle}</div>
                    <div className="text-[10px] text-emerald-400 mt-0.5">{currentUser.clearanceLevel}</div>
                  </div>

                  <div className="p-1">
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onOpenSignIn();
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-[#0f214f] rounded flex items-center gap-2"
                    >
                      <User className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Switch Operator Persona</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onSignOut();
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-rose-300 hover:bg-rose-950/40 rounded flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-400" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenSignIn}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-semibold shadow-sm transition-all"
            >
              <Lock className="w-3 h-3" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <nav className="flex space-x-1 overflow-x-auto py-1.5 scrollbar-none" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#0a183d] text-cyan-300 border border-blue-700/80 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#070e22]'
                }`}
              >
                <span className={isActive ? 'text-cyan-400' : 'text-slate-400'}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
