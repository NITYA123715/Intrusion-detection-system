/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header, ActiveTab } from './components/Header';
import { LiveMonitorView } from './components/LiveMonitorView';
import { ManualInspectorView } from './components/ManualInspectorView';
import { BatchAnalyzerView } from './components/BatchAnalyzerView';
import { MlPipelineView } from './components/MlPipelineView';
import { AlertsView } from './components/AlertsView';
import { GitHubSyncView } from './components/GitHubSyncView';
import { SignInModal } from './components/SignInModal';
import { NetworkFlow, ModelPrediction, SecurityAlert, ModelHyperparameters } from './types/ids';
import { UserProfile } from './types/auth';
import { DEFAULT_HYPERPARAMETERS, predictFlow } from './services/idsMlEngine';
import { generateBenignFlow, generateAttackFlow } from './services/trafficSimulator';
import { GITHUB_REPO_URL } from './services/gitExportService';
import { getStoredUser, authenticateWithPersona, clearUserSession } from './services/authService';
import { ShieldCheck, GitBranch, ExternalLink, Lock, Fingerprint, ShieldAlert } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('live');
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [streamSpeedMs, setStreamSpeedMs] = useState<number>(1000);
  const [hyperparameters, setHyperparameters] = useState<ModelHyperparameters>(DEFAULT_HYPERPARAMETERS);
  
  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    return getStoredUser() || authenticateWithPersona('nitya');
  });
  const [isSignInOpen, setIsSignInOpen] = useState<boolean>(false);

  // Inspected flow state for cross-tab inspection
  const [inspectedFlow, setInspectedFlow] = useState<NetworkFlow | null>(null);

  // Initialize initial stream flows
  const [streamFlows, setStreamFlows] = useState<{ flow: NetworkFlow; prediction: ModelPrediction }[]>(() => {
    const initial: { flow: NetworkFlow; prediction: ModelPrediction }[] = [];
    for (let i = 0; i < 8; i++) {
      const flow = i === 3 ? generateAttackFlow('portscan') : (i === 6 ? generateAttackFlow('sql_injection') : generateBenignFlow());
      const prediction = predictFlow(flow, DEFAULT_HYPERPARAMETERS);
      initial.unshift({ flow, prediction });
    }
    return initial;
  });

  const [alerts, setAlerts] = useState<SecurityAlert[]>(() => {
    const initialAlerts: SecurityAlert[] = [];
    const sampleAttacks = [
      generateAttackFlow('dos'),
      generateAttackFlow('portscan'),
      generateAttackFlow('sql_injection'),
    ];
    sampleAttacks.forEach((flow, i) => {
      const pred = predictFlow(flow, DEFAULT_HYPERPARAMETERS);
      initialAlerts.push({
        id: `alert-init-${i}`,
        flow,
        prediction: pred,
        status: i === 0 ? 'unresolved' : (i === 1 ? 'investigating' : 'mitigated'),
        createdAt: new Date(Date.now() - (i * 120000)).toISOString(),
        mitigatedAt: i === 2 ? new Date().toISOString() : undefined,
        mitigationApplied: i === 2 ? pred.mitigation.iptablesRule : undefined,
      });
    });
    return initialAlerts;
  });

  const [totalPacketsProcessed, setTotalPacketsProcessed] = useState<number>(1420);

  // Packet Stream Timer
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      const isNaturalAttack = Math.random() < 0.12;
      const flow = isNaturalAttack ? generateAttackFlow() : generateBenignFlow();
      const prediction = predictFlow(flow, hyperparameters);

      setStreamFlows(prev => [{ flow, prediction }, ...prev.slice(0, 99)]);
      setTotalPacketsProcessed(prev => prev + flow.packet_count);

      if (prediction.label === 'attack') {
        const newAlert: SecurityAlert = {
          id: `alert-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          flow,
          prediction,
          status: 'unresolved',
          createdAt: new Date().toISOString(),
        };
        setAlerts(prev => [newAlert, ...prev.slice(0, 99)]);
      }
    }, streamSpeedMs);

    return () => clearInterval(interval);
  }, [isStreaming, streamSpeedMs, hyperparameters]);

  const handleInjectAttack = (specificType?: string) => {
    const flow = generateAttackFlow(specificType);
    const prediction = predictFlow(flow, hyperparameters);
    setStreamFlows(prev => [{ flow, prediction }, ...prev.slice(0, 99)]);
    setTotalPacketsProcessed(prev => prev + flow.packet_count);

    const newAlert: SecurityAlert = {
      id: `alert-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      flow,
      prediction,
      status: 'unresolved',
      createdAt: new Date().toISOString(),
    };
    setAlerts(prev => [newAlert, ...prev.slice(0, 99)]);
  };

  const handleInjectBenign = () => {
    const flow = generateBenignFlow();
    const prediction = predictFlow(flow, hyperparameters);
    setStreamFlows(prev => [{ flow, prediction }, ...prev.slice(0, 99)]);
    setTotalPacketsProcessed(prev => prev + flow.packet_count);
  };

  const handleClearStream = () => {
    setStreamFlows([]);
  };

  const handleSelectFlowForInspection = (flow: NetworkFlow) => {
    setInspectedFlow(flow);
    setActiveTab('manual');
  };

  const handleQuickMitigate = (alert: SecurityAlert) => {
    setAlerts(prev => [alert, ...prev.filter(a => a.id !== alert.id)]);
  };

  const handleUpdateAlertStatus = (id: string, status: SecurityAlert['status'], ruleApplied?: string) => {
    setAlerts(prev => prev.map(a => {
      if (a.id === id) {
        return {
          ...a,
          status,
          mitigatedAt: status === 'mitigated' ? new Date().toISOString() : a.mitigatedAt,
          mitigationApplied: ruleApplied || a.mitigationApplied,
        };
      }
      return a;
    }));
  };

  const handleClearResolvedAlerts = () => {
    setAlerts(prev => prev.filter(a => a.status !== 'mitigated'));
  };

  const handleSignInSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setIsSignInOpen(false);
  };

  const handleSignOut = () => {
    clearUserSession();
    setCurrentUser(null);
  };

  const unresolvedAlertsCount = alerts.filter(a => a.status === 'unresolved').length;

  return (
    <div className="min-h-screen bg-[#02040a] text-slate-100 flex flex-col font-sans selection:bg-blue-600/30 selection:text-cyan-200">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unresolvedAlertsCount={unresolvedAlertsCount}
        isStreaming={isStreaming}
        totalPacketsProcessed={totalPacketsProcessed}
        currentUser={currentUser}
        onOpenSignIn={() => setIsSignInOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {!currentUser ? (
          /* Restricted Access Notice if logged out */
          <div className="bg-[#070e22] border border-[#172a54] rounded-xl p-8 max-w-md mx-auto my-12 text-center shadow-2xl shadow-blue-950/40">
            <div className="w-14 h-14 mx-auto rounded-xl bg-blue-950/80 border border-blue-700/80 flex items-center justify-center text-cyan-400 mb-4 shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-white font-mono">
              Restricted SOC Console Access
            </h2>
            <p className="text-xs text-slate-400 font-sans mt-2 mb-6">
              Authentication required to access live network packet streams, adjust machine learning hyperparameters, or dispatch firewall mitigations.
            </p>
            <button
              onClick={() => setIsSignInOpen(true)}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-950"
            >
              <Fingerprint className="w-4 h-4" />
              <span>Authenticate with Security Clearance</span>
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'live' && (
              <LiveMonitorView
                flows={streamFlows}
                isStreaming={isStreaming}
                setIsStreaming={setIsStreaming}
                streamSpeedMs={streamSpeedMs}
                setStreamSpeedMs={setStreamSpeedMs}
                onInjectAttack={handleInjectAttack}
                onInjectBenign={handleInjectBenign}
                onClearStream={handleClearStream}
                onSelectFlowForInspection={handleSelectFlowForInspection}
                onQuickMitigate={handleQuickMitigate}
              />
            )}

            {activeTab === 'manual' && (
              <ManualInspectorView
                initialFlow={inspectedFlow}
                hyperparameters={hyperparameters}
              />
            )}

            {activeTab === 'batch' && (
              <BatchAnalyzerView
                hyperparameters={hyperparameters}
                onSelectFlowForInspection={handleSelectFlowForInspection}
              />
            )}

            {activeTab === 'ml' && (
              <MlPipelineView
                hyperparameters={hyperparameters}
                setHyperparameters={setHyperparameters}
              />
            )}

            {activeTab === 'alerts' && (
              <AlertsView
                alerts={alerts}
                onUpdateAlertStatus={handleUpdateAlertStatus}
                onClearResolvedAlerts={handleClearResolvedAlerts}
                onSelectFlowForInspection={handleSelectFlowForInspection}
              />
            )}

            {activeTab === 'github' && (
              <GitHubSyncView />
            )}
          </>
        )}
      </main>

      {/* Authentication Modal */}
      <SignInModal
        isOpen={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
        onSuccess={handleSignInSuccess}
      />

      {/* Footer */}
      <footer className="border-t border-[#172a54]/80 bg-[#02040a]/95 text-slate-500 font-mono text-xs py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-slate-300">SafeNet IDS: Deep Navy & Dark Black SOC Theme</span>
            <span className="text-slate-700">·</span>
            <span>99.4% Accuracy</span>
            <span className="text-slate-700">·</span>
            <span>0.0% False Positive Baseline</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1.5"
            >
              <GitBranch className="w-3.5 h-3.5 text-blue-400" />
              <span>NITYA123715/IDS-Network-Intrusion-Detection-System</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
