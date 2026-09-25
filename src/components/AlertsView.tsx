import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Filter, 
  Download, 
  Copy, 
  Check, 
  Trash2,
  ExternalLink,
  Flame,
  Search,
  Key,
  Database,
  Bug
} from 'lucide-react';
import { SecurityAlert, AlertSeverity } from '../types/ids';

interface AlertsViewProps {
  alerts: SecurityAlert[];
  onUpdateAlertStatus: (id: string, status: SecurityAlert['status'], note?: string) => void;
  onClearResolvedAlerts: () => void;
  onSelectFlowForInspection: (flow: any) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  onUpdateAlertStatus,
  onClearResolvedAlerts,
  onSelectFlowForInspection,
}) => {
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const unresolvedCount = alerts.filter(a => a.status === 'unresolved').length;
  const investigatingCount = alerts.filter(a => a.status === 'investigating').length;
  const mitigatedCount = alerts.filter(a => a.status === 'mitigated').length;

  const filteredAlerts = alerts.filter(a => {
    if (severityFilter !== 'all' && a.prediction.severity !== severityFilter) return false;
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    return true;
  });

  const handleCopyRule = (rule: string, id: string) => {
    navigator.clipboard.writeText(rule);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      socOperator: 'SafeNet IDS v2.4 Automated SOC',
      totalIncidents: alerts.length,
      unresolved: unresolvedCount,
      mitigated: mitigatedCount,
      incidents: alerts.map(a => ({
        id: a.id,
        timestamp: a.createdAt,
        status: a.status,
        severity: a.prediction.severity,
        attackType: a.prediction.attackType,
        source: `${a.flow.src_ip}:${a.flow.src_port}`,
        target: `${a.flow.dst_ip}:${a.flow.dst_port}`,
        protocol: a.flow.protocol,
        confidence: `${a.prediction.confidence}%`,
        appliedFirewallRule: a.mitigationApplied || a.prediction.mitigation.iptablesRule,
      }))
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `safenet_soc_incident_report_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getAttackIcon = (type: string) => {
    switch (type) {
      case 'dos': return <Flame className="w-4 h-4 text-rose-400" />;
      case 'portscan': return <Search className="w-4 h-4 text-amber-400" />;
      case 'sql_injection': return <Database className="w-4 h-4 text-purple-400" />;
      case 'bruteforce': return <Key className="w-4 h-4 text-orange-400" />;
      case 'malware': return <Bug className="w-4 h-4 text-rose-500" />;
      default: return <ShieldAlert className="w-4 h-4 text-rose-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top SOC Incident Status Strip */}
      <div className="bg-[#070e22]/95 border border-[#172a54] rounded-lg p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-white">
              SOC Security Incident & Alert Dispatch Desk
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Live intrusion events prioritized by risk level with automated firewall mitigation rules.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportReport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export Incident Report</span>
            </button>

            <button
              onClick={onClearResolvedAlerts}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Mitigated</span>
            </button>
          </div>
        </div>

        {/* Counter cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-[#172a54] font-mono">
          <div className="bg-[#030712] p-3 rounded border border-[#172a54]">
            <span className="text-[11px] text-slate-400 block">TOTAL INCIDENTS</span>
            <span className="text-xl font-bold text-white">{alerts.length}</span>
          </div>

          <div className="bg-[#030712] p-3 rounded border border-rose-900/50">
            <span className="text-[11px] text-rose-400 block font-semibold">UNRESOLVED ALERTS</span>
            <span className="text-xl font-bold text-rose-400">{unresolvedCount}</span>
          </div>

          <div className="bg-[#030712] p-3 rounded border border-amber-900/50">
            <span className="text-[11px] text-amber-400 block font-semibold">INVESTIGATING</span>
            <span className="text-xl font-bold text-amber-400">{investigatingCount}</span>
          </div>

          <div className="bg-[#030712] p-3 rounded border border-emerald-900/50">
            <span className="text-[11px] text-emerald-400 block font-semibold">CONTAINED / MITIGATED</span>
            <span className="text-xl font-bold text-emerald-400">{mitigatedCount}</span>
          </div>
        </div>
      </div>

      {/* Filter Segmented Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#070e22]/95 border border-[#172a54] rounded-lg p-3">
        {/* Severity Filter */}
        <div className="flex items-center gap-1">
          <span className="text-xs font-mono text-slate-400 mr-1.5">Severity:</span>
          {['all', 'critical', 'high', 'medium', 'low'].map(sev => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-2.5 py-1 text-xs font-mono rounded capitalize transition-colors ${
                severityFilter === sev
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1">
          <span className="text-xs font-mono text-slate-400 mr-1.5">Status:</span>
          {['all', 'unresolved', 'investigating', 'mitigated'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 text-xs font-mono rounded capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-slate-800 text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Incident List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-[#070e22]/80 border border-[#172a54] rounded-lg p-12 text-center text-slate-500 font-mono text-xs">
            No incidents currently match the selected filters.
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isMitigated = alert.status === 'mitigated';
            const isInvestigating = alert.status === 'investigating';
            const { flow, prediction } = alert;

            return (
              <div
                key={alert.id}
                className={`bg-[#070e22]/95 border rounded-lg p-4 transition-all ${
                  isMitigated
                    ? 'border-[#172a54] opacity-80'
                    : alert.prediction.severity === 'critical'
                    ? 'border-rose-700/80 shadow-sm shadow-rose-950'
                    : 'border-[#172a54] hover:border-slate-700'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-[#172a54]/80">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded bg-[#030712] border border-[#172a54]">
                      {getAttackIcon(prediction.attackType)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-white uppercase">
                          {prediction.attackType.replace('_', ' ')} INTRUSION
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                          prediction.severity === 'critical'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : prediction.severity === 'high'
                            ? 'bg-orange-950 text-orange-300 border border-orange-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          {prediction.severity}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-0.5">
                        <span>Incident #{alert.id.slice(-6)}</span>
                        <span>·</span>
                        <span>Detected: {new Date(alert.createdAt).toLocaleTimeString()}</span>
                        <span>·</span>
                        <span className="text-cyan-400">{prediction.confidence}% ML Confidence</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center gap-1.5">
                    {isMitigated ? (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mitigated
                      </span>
                    ) : isInvestigating ? (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-semibold bg-amber-950/80 text-amber-300 border border-amber-800">
                        <Clock className="w-3.5 h-3.5" /> Under Investigation
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-semibold bg-rose-950/80 text-rose-300 border border-rose-800 animate-pulse">
                        <AlertTriangle className="w-3.5 h-3.5" /> Action Required
                      </span>
                    )}
                  </div>
                </div>

                {/* Flow Socket Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-3 font-mono text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">ATTACKER SOCKET</span>
                    <span className="text-rose-400 font-bold">{flow.src_ip}:{flow.src_port}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">TARGET ENDPOINT</span>
                    <span className="text-slate-200">{flow.dst_ip}:{flow.dst_port} ({flow.protocol})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">VOLUME / RATE</span>
                    <span className="text-slate-200">
                      {flow.packet_count} pkts · {flow.packets_per_sec.toFixed(0)} PPS
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">SHANNON ENTROPY</span>
                    <span className="text-amber-400 font-bold">{flow.payload_entropy.toFixed(2)}</span>
                  </div>
                </div>

                {/* Auto Mitigation Rule & Actions */}
                <div className="pt-3 border-t border-[#172a54] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex-1 min-w-[280px] bg-[#030712] p-2 rounded border border-[#172a54] flex items-center justify-between font-mono text-xs">
                    <code className="text-emerald-400 text-[11px] truncate mr-2 select-all">
                      {prediction.mitigation.iptablesRule}
                    </code>
                    <button
                      onClick={() => handleCopyRule(prediction.mitigation.iptablesRule, alert.id)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 shrink-0"
                    >
                      {copiedId === alert.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedId === alert.id ? 'Copied' : 'Copy'}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectFlowForInspection(flow)}
                      className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 transition-colors"
                    >
                      Deep Inspect
                    </button>

                    {!isMitigated && (
                      <button
                        onClick={() => onUpdateAlertStatus(alert.id, 'investigating')}
                        className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-amber-300 transition-colors"
                      >
                        Investigate
                      </button>
                    )}

                    {!isMitigated ? (
                      <button
                        onClick={() => onUpdateAlertStatus(alert.id, 'mitigated', prediction.mitigation.iptablesRule)}
                        className="px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-xs font-mono font-semibold text-white transition-colors shadow-sm shadow-rose-950"
                      >
                        Deploy Firewall Block
                      </button>
                    ) : (
                      <button
                        onClick={() => onUpdateAlertStatus(alert.id, 'unresolved')}
                        className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        Reopen Alert
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
