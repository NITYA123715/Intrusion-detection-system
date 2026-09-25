import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Trash2, 
  ShieldAlert, 
  ShieldCheck, 
  Flame, 
  Radio, 
  Filter, 
  Zap, 
  Server, 
  ArrowRight,
  ExternalLink,
  Lock
} from 'lucide-react';
import { NetworkFlow, ModelPrediction, SecurityAlert } from '../types/ids';

interface LiveMonitorViewProps {
  flows: { flow: NetworkFlow; prediction: ModelPrediction }[];
  isStreaming: boolean;
  setIsStreaming: (streaming: boolean) => void;
  streamSpeedMs: number;
  setStreamSpeedMs: (speed: number) => void;
  onInjectAttack: (type: string) => void;
  onInjectBenign: () => void;
  onClearStream: () => void;
  onSelectFlowForInspection: (flow: NetworkFlow) => void;
  onQuickMitigate: (alert: SecurityAlert) => void;
}

export const LiveMonitorView: React.FC<LiveMonitorViewProps> = ({
  flows,
  isStreaming,
  setIsStreaming,
  streamSpeedMs,
  setStreamSpeedMs,
  onInjectAttack,
  onInjectBenign,
  onClearStream,
  onSelectFlowForInspection,
  onQuickMitigate,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'attacks' | 'normal'>('all');
  const [selectedFlowDetail, setSelectedFlowDetail] = useState<{ flow: NetworkFlow; prediction: ModelPrediction } | null>(null);

  const totalPackets = flows.reduce((acc, curr) => acc + curr.flow.packet_count, 0);
  const totalBytes = flows.reduce((acc, curr) => acc + curr.flow.total_bytes, 0);
  const attackFlows = flows.filter(f => f.prediction.label === 'attack');
  const attackRate = flows.length > 0 ? (attackFlows.length / flows.length) * 100 : 0;

  const filteredFlows = flows.filter(f => {
    if (filterMode === 'attacks') return f.prediction.label === 'attack';
    if (filterMode === 'normal') return f.prediction.label === 'normal';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Telemetry KPI Bar - Deep Navy Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#070e22]/90 border border-[#172a54] rounded-lg p-3.5 flex flex-col justify-between shadow-lg shadow-black/40">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>PACKET INGESTION</span>
            <Radio className={`w-3.5 h-3.5 ${isStreaming ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white tracking-tight">
              {flows.length.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-mono">flows</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 font-mono">
            {(totalBytes / 1024 / 1024).toFixed(2)} MB volume
          </div>
        </div>

        <div className="bg-[#070e22]/90 border border-[#172a54] rounded-lg p-3.5 flex flex-col justify-between shadow-lg shadow-black/40">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>THREAT DETECTIONS</span>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-rose-400 tracking-tight">
              {attackFlows.length}
            </span>
            <span className="text-xs text-rose-300/80 font-mono">
              ({attackRate.toFixed(1)}%)
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 font-mono">
            0 false positives on baseline
          </div>
        </div>

        <div className="bg-[#070e22]/90 border border-[#172a54] rounded-lg p-3.5 flex flex-col justify-between shadow-lg shadow-black/40">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>MODEL LATENCY</span>
            <Zap className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-cyan-400 tracking-tight">
              1.2<span className="text-sm font-normal text-slate-400">ms</span>
            </span>
            <span className="text-xs text-emerald-400 font-mono">Real-time</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 font-mono">
            Hybrid Ensemble evaluation
          </div>
        </div>

        <div className="bg-[#070e22]/90 border border-[#172a54] rounded-lg p-3.5 flex flex-col justify-between shadow-lg shadow-black/40">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>ENGINE STATUS</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg font-bold font-mono text-emerald-400 tracking-tight">
              ACTIVE DEFENSE
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 font-mono">
            Auto-Mitigation Synthesizer on
          </div>
        </div>
      </div>

      {/* Network Topology & Live Flow Canvas */}
      <div className="bg-[#070e22]/90 border border-[#172a54] rounded-lg p-4 shadow-xl shadow-black/50">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#172a54]">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-white">
              Target Infrastructure & Real-Time Flow Map
            </h2>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              (Deep Navy SOC Topology)
            </span>
          </div>

          {/* Quick injection triggers */}
          <div className="flex items-center flex-wrap gap-1.5">
            <span className="text-xs text-slate-400 font-mono mr-1">Inject Threat:</span>
            <button
              onClick={() => onInjectAttack('dos')}
              className="px-2.5 py-1 text-xs font-mono rounded bg-rose-950/80 text-rose-300 hover:bg-rose-900 border border-rose-800/80 transition-colors flex items-center gap-1"
            >
              <Flame className="w-3 h-3 text-rose-400" /> DoS Flood
            </button>
            <button
              onClick={() => onInjectAttack('portscan')}
              className="px-2.5 py-1 text-xs font-mono rounded bg-amber-950/80 text-amber-300 hover:bg-amber-900 border border-amber-800/80 transition-colors"
            >
              Port Scan
            </button>
            <button
              onClick={() => onInjectAttack('sql_injection')}
              className="px-2.5 py-1 text-xs font-mono rounded bg-purple-950/80 text-purple-300 hover:bg-purple-900 border border-purple-800/80 transition-colors"
            >
              SQLi Exploit
            </button>
            <button
              onClick={() => onInjectAttack('bruteforce')}
              className="px-2.5 py-1 text-xs font-mono rounded bg-orange-950/80 text-orange-300 hover:bg-orange-900 border border-orange-800/80 transition-colors"
            >
              SSH Brute
            </button>
            <button
              onClick={onInjectBenign}
              className="px-2.5 py-1 text-xs font-mono rounded bg-blue-950/80 text-cyan-300 hover:bg-blue-900 border border-blue-700/80 transition-colors"
            >
              Normal Flow
            </button>
          </div>
        </div>

        {/* Visual Topology Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-4">
          {[
            { name: 'Nginx Web Proxy', ip: '10.0.0.12', port: '80 / 443', service: 'HTTP/S' },
            { name: 'Core MySQL DB', ip: '10.0.0.25', port: '3306', service: 'Database' },
            { name: 'Bastion Gateway', ip: '10.0.0.20', port: '22', service: 'SSH' },
            { name: 'Internal DNS Core', ip: '10.0.0.5', port: '53', service: 'DNS' },
            { name: 'App Microservice', ip: '10.0.0.15', port: '8080', service: 'API' },
          ].map((server, i) => {
            const serverAttacks = flows.filter(
              f => f.flow.dst_ip === server.ip && f.prediction.label === 'attack'
            ).length;
            const hasActiveThreat = serverAttacks > 0;

            return (
              <div 
                key={i} 
                className={`p-3 rounded-lg border transition-all ${
                  hasActiveThreat 
                    ? 'bg-rose-950/30 border-rose-700/80 shadow-md shadow-rose-950' 
                    : 'bg-[#030712] border-[#172a54] hover:border-blue-700/70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">{server.name}</span>
                  <span className={`w-2 h-2 rounded-full ${hasActiveThreat ? 'bg-rose-500 animate-ping' : 'bg-cyan-400'}`} />
                </div>
                <div className="mt-1 font-mono text-[11px] text-slate-400">
                  {server.ip}:{server.port}
                </div>
                <div className="mt-2 pt-2 border-t border-[#172a54]/80 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400">{server.service}</span>
                  {hasActiveThreat ? (
                    <span className="text-rose-400 font-semibold">{serverAttacks} threats</span>
                  ) : (
                    <span className="text-emerald-400">Secure</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stream Feed & Flow Logs */}
      <div className="bg-[#070e22]/90 border border-[#172a54] rounded-lg p-4 shadow-xl shadow-black/50">
        {/* Controls bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#172a54]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium font-mono transition-colors ${
                isStreaming
                  ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40'
                  : 'bg-blue-600/30 text-cyan-300 hover:bg-blue-600/40 border border-blue-500/50'
              }`}
            >
              {isStreaming ? (
                <>
                  <Pause className="w-3.5 h-3.5" /> Pause Stream
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" /> Resume Stream
                </>
              )}
            </button>

            {/* Stream Speed Selector */}
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
              <span>Interval:</span>
              <select
                value={streamSpeedMs}
                onChange={(e) => setStreamSpeedMs(Number(e.target.value))}
                className="bg-[#030712] border border-[#172a54] rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value={2000}>2.0s (Slow)</option>
                <option value={1000}>1.0s (Normal)</option>
                <option value={500}>0.5s (Fast)</option>
                <option value={200}>0.2s (Rapid)</option>
              </select>
            </div>

            <button
              onClick={onClearStream}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-mono text-slate-400 hover:text-slate-200 hover:bg-[#030712] transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
          </div>

          {/* Filter tabs (Segmented control) */}
          <div className="flex items-center gap-1 bg-[#020612] p-1 rounded-md border border-[#172a54]">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                filterMode === 'all'
                  ? 'bg-[#0a183d] text-cyan-300 border border-blue-700/80 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({flows.length})
            </button>
            <button
              onClick={() => setFilterMode('attacks')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                filterMode === 'attacks'
                  ? 'bg-rose-950 text-rose-300 border border-rose-800 shadow-sm'
                  : 'text-slate-400 hover:text-rose-300'
              }`}
            >
              Attacks Only ({attackFlows.length})
            </button>
            <button
              onClick={() => setFilterMode('normal')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                filterMode === 'normal'
                  ? 'bg-blue-950 text-cyan-300 border border-blue-800 shadow-sm'
                  : 'text-slate-400 hover:text-cyan-300'
              }`}
            >
              Normal ({flows.length - attackFlows.length})
            </button>
          </div>
        </div>

        {/* Live Packet Table */}
        <div className="mt-3 overflow-x-auto">
          {filteredFlows.length === 0 ? (
            <div className="py-12 text-center text-slate-500 font-mono text-xs">
              No network packets captured matching current filter. Press "Resume Stream" or click "Inject Threat" above.
            </div>
          ) : (
            <table className="w-full text-left text-xs font-mono">
              <thead className="text-[11px] text-slate-400 uppercase bg-[#030712] border-b border-[#172a54]">
                <tr>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Protocol</th>
                  <th className="py-2.5 px-3">Source Endpoint</th>
                  <th className="py-2.5 px-3">Destination Endpoint</th>
                  <th className="py-2.5 px-3 text-right">Packets / Bytes</th>
                  <th className="py-2.5 px-3 text-right">Entropy</th>
                  <th className="py-2.5 px-3">ML Verdict</th>
                  <th className="py-2.5 px-3 text-right">Confidence</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#172a54]/50">
                {filteredFlows.slice(0, 30).map(({ flow, prediction }) => {
                  const isAttack = prediction.label === 'attack';

                  return (
                    <tr 
                      key={flow.id} 
                      className={`hover:bg-[#0a183d]/60 transition-colors ${
                        isAttack ? 'bg-rose-950/20' : ''
                      }`}
                    >
                      <td className="py-2 px-3 text-slate-400">
                        {flow.timestamp || 'now'}
                      </td>
                      <td className="py-2 px-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#030712] text-cyan-300 border border-[#172a54]">
                          {flow.protocol}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-200">
                        {flow.src_ip}:{flow.src_port}
                      </td>
                      <td className="py-2 px-3 text-slate-400">
                        {flow.dst_ip}:{flow.dst_port}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-300">
                        {flow.packet_count.toLocaleString()} pkts / {(flow.total_bytes / 1024).toFixed(1)} KB
                      </td>
                      <td className="py-2 px-3 text-right">
                        <span className={flow.payload_entropy > 4.5 ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                          {flow.payload_entropy.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        {isAttack ? (
                          <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                            <span>ATTACK: {prediction.attackType.toUpperCase()}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>NORMAL</span>
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right font-semibold">
                        <span className={isAttack ? 'text-rose-400' : 'text-emerald-400'}>
                          {prediction.confidence.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedFlowDetail({ flow, prediction })}
                            className="px-2 py-1 rounded bg-[#0a183d] hover:bg-[#102766] border border-blue-800/60 text-cyan-300 text-[11px] transition-colors"
                            title="Inspect ML breakdown"
                          >
                            Inspect
                          </button>
                          {isAttack && (
                            <button
                              onClick={() => {
                                onQuickMitigate({
                                  id: `alert-${Date.now()}`,
                                  flow,
                                  prediction,
                                  status: 'mitigated',
                                  createdAt: new Date().toISOString(),
                                  mitigatedAt: new Date().toISOString(),
                                  mitigationApplied: prediction.mitigation.iptablesRule,
                                });
                              }}
                              className="px-2 py-1 rounded bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-[11px] font-semibold transition-colors"
                              title="Generate & Apply Firewall Block"
                            >
                              Mitigate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal for Flow Detail & ML Breakdown */}
      {selectedFlowDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#070e22] border border-[#172a54] rounded-xl max-w-2xl w-full p-5 max-h-[90vh] overflow-y-auto shadow-2xl shadow-blue-950/60">
            <div className="flex items-center justify-between pb-3 border-b border-[#172a54]">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white font-mono">
                  Deep Flow Inspection & ML Diagnostics
                </h3>
              </div>
              <button
                onClick={() => setSelectedFlowDetail(null)}
                className="text-slate-400 hover:text-white font-mono text-sm px-2 py-1 rounded hover:bg-slate-800"
              >
                ✕ Close
              </button>
            </div>

            <div className="mt-4 space-y-4 font-mono text-xs">
              {/* Verdict Summary */}
              <div className={`p-3.5 rounded-lg border ${
                selectedFlowDetail.prediction.label === 'attack'
                  ? 'bg-rose-950/30 border-rose-800/80 text-rose-300'
                  : 'bg-emerald-950/30 border-emerald-800/80 text-emerald-300'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">
                    {selectedFlowDetail.prediction.label === 'attack'
                      ? `🚨 THREAT CONFIRMED: ${selectedFlowDetail.prediction.attackType.toUpperCase()}`
                      : '✓ BENIGN FLOW (Legitimate Traffic)'}
                  </span>
                  <span className="text-sm font-extrabold">
                    {selectedFlowDetail.prediction.confidence}% Confidence
                  </span>
                </div>
                <div className="mt-2 text-slate-400 text-[11px]">
                  Flow: {selectedFlowDetail.flow.src_ip}:{selectedFlowDetail.flow.src_port} → {selectedFlowDetail.flow.dst_ip}:{selectedFlowDetail.flow.dst_port} ({selectedFlowDetail.flow.protocol})
                </div>
              </div>

              {/* Ensemble Model Breakdown */}
              <div className="bg-[#030712] p-3.5 rounded-lg border border-[#172a54]">
                <span className="text-slate-400 font-bold block mb-2 uppercase text-[11px]">
                  Ensemble Sub-Model Votes
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded bg-[#070e22] border border-[#172a54]">
                    <span className="text-slate-400">Random Forest:</span>
                    <span className="ml-1 text-cyan-300 font-semibold">
                      {selectedFlowDetail.prediction.ensembleVotes.randomForest.pred.toUpperCase()} ({selectedFlowDetail.prediction.ensembleVotes.randomForest.score})
                    </span>
                  </div>
                  <div className="p-2 rounded bg-[#070e22] border border-[#172a54]">
                    <span className="text-slate-400">Gradient Boosting:</span>
                    <span className="ml-1 text-cyan-300 font-semibold">
                      {selectedFlowDetail.prediction.ensembleVotes.gradientBoosting.pred.toUpperCase()} ({selectedFlowDetail.prediction.ensembleVotes.gradientBoosting.score})
                    </span>
                  </div>
                  <div className="p-2 rounded bg-[#070e22] border border-[#172a54]">
                    <span className="text-slate-400">Isolation Anomaly Score:</span>
                    <span className="ml-1 text-amber-300 font-semibold">
                      {selectedFlowDetail.prediction.ensembleVotes.isolationForest.anomalyScore}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-[#070e22] border border-[#172a54]">
                    <span className="text-slate-400">Heuristic Engine:</span>
                    <span className="ml-1 text-purple-300 font-semibold">
                      {selectedFlowDetail.prediction.ensembleVotes.heuristicRules.matched ? 'MATCHED RULE' : 'No Signature Match'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Explainable AI feature factors */}
              <div className="bg-[#030712] p-3.5 rounded-lg border border-[#172a54]">
                <span className="text-slate-400 font-bold block mb-2 uppercase text-[11px]">
                  Top Contributing Risk Factors (XAI)
                </span>
                <div className="space-y-2">
                  {selectedFlowDetail.prediction.featureContributions.map((fc, i) => (
                    <div key={i} className="flex items-start justify-between gap-3 text-[11px] pb-1.5 border-b border-[#172a54]/50 last:border-0">
                      <div>
                        <span className="font-semibold text-slate-200">{fc.label}: </span>
                        <span className="text-cyan-400">{fc.value} </span>
                        <span className="text-slate-500">(Normal: {fc.normalBaseline})</span>
                        <p className="text-[11px] text-slate-400 mt-0.5">{fc.explanation}</p>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap ${
                        fc.isAbnormal ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-[#070e22] text-slate-400 border border-[#172a54]'
                      }`}>
                        {fc.isAbnormal ? 'Abnormal Deviation' : 'Nominal'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mitigation Rule */}
              {selectedFlowDetail.prediction.label === 'attack' && (
                <div className="bg-[#030712] p-3.5 rounded-lg border border-[#172a54]">
                  <span className="text-slate-400 font-bold block mb-2 uppercase text-[11px]">
                    Synthesized Firewall Mitigation
                  </span>
                  <div className="p-2 rounded bg-black/80 border border-[#172a54] text-emerald-400 font-mono text-[11px] select-all">
                    {selectedFlowDetail.prediction.mitigation.iptablesRule}
                  </div>
                  <div className="mt-1.5 p-2 rounded bg-black/80 border border-[#172a54] text-cyan-300 font-mono text-[11px] select-all">
                    {selectedFlowDetail.prediction.mitigation.ufwRule}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-[#172a54] flex justify-end gap-2">
              <button
                onClick={() => {
                  onSelectFlowForInspection(selectedFlowDetail.flow);
                  setSelectedFlowDetail(null);
                }}
                className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs flex items-center gap-1.5 shadow-sm"
              >
                Open in Flow Inspector <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
