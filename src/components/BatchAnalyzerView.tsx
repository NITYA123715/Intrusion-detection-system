import React, { useState, useMemo } from 'react';
import { 
  Database, 
  Upload, 
  Download, 
  Search, 
  Filter, 
  FileText, 
  CheckCircle2, 
  AlertOctagon, 
  ChevronLeft, 
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { NetworkFlow, ModelPrediction, ModelHyperparameters } from '../types/ids';
import { predictFlow } from '../services/idsMlEngine';
import { INITIAL_DATASET } from '../data/dataset';

interface BatchAnalyzerViewProps {
  hyperparameters: ModelHyperparameters;
  onSelectFlowForInspection: (flow: NetworkFlow) => void;
}

export const BatchAnalyzerView: React.FC<BatchAnalyzerViewProps> = ({
  hyperparameters,
  onSelectFlowForInspection,
}) => {
  const [flows, setFlows] = useState<NetworkFlow[]>(INITIAL_DATASET);
  const [datasetName, setDatasetName] = useState<string>("safenet_sample_500.csv (Default Benchmark)");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 15;

  // Process all flows through the enhanced ML pipeline
  const evaluatedResults = useMemo(() => {
    return flows.map(flow => ({
      flow,
      prediction: predictFlow(flow, hyperparameters)
    }));
  }, [flows, hyperparameters]);

  // Filtered dataset
  const filteredResults = useMemo(() => {
    return evaluatedResults.filter(({ flow, prediction }) => {
      // Category filter
      if (categoryFilter === 'attacks' && prediction.label !== 'attack') return false;
      if (categoryFilter === 'normal' && prediction.label !== 'normal') return false;
      if (['dos', 'portscan', 'bruteforce', 'sql_injection', 'malware'].includes(categoryFilter)) {
        if (prediction.attackType !== categoryFilter) return false;
      }

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        flow.src_ip.toLowerCase().includes(q) ||
        flow.dst_ip.toLowerCase().includes(q) ||
        String(flow.src_port).includes(q) ||
        String(flow.dst_port).includes(q) ||
        flow.protocol.toLowerCase().includes(q) ||
        prediction.attackType.toLowerCase().includes(q)
      );
    });
  }, [evaluatedResults, categoryFilter, searchQuery]);

  // Statistics
  const totalFlows = flows.length;
  const attackCount = evaluatedResults.filter(r => r.prediction.label === 'attack').length;
  const normalCount = totalFlows - attackCount;
  const attackPercentage = totalFlows > 0 ? (attackCount / totalFlows) * 100 : 0;

  // Attack type distribution
  const attackTypeBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    evaluatedResults.forEach(({ prediction }) => {
      if (prediction.label === 'attack') {
        counts[prediction.attackType] = (counts[prediction.attackType] || 0) + 1;
      }
    });
    return counts;
  }, [evaluatedResults]);

  // Pagination
  const totalPages = Math.ceil(filteredResults.length / pageSize) || 1;
  const paginatedResults = filteredResults.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.trim().split('\n');
      if (lines.length < 2) return;

      const parsedFlows: NetworkFlow[] = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(s => s.trim());
        if (parts.length >= 15) {
          parsedFlows.push({
            id: `upload-${i}`,
            src_ip: parts[0] || '192.168.1.1',
            dst_ip: parts[1] || '10.0.0.1',
            src_port: parseInt(parts[2], 10) || 0,
            dst_port: parseInt(parts[3], 10) || 0,
            protocol: parts[4] || 'TCP',
            duration_sec: parseFloat(parts[5]) || 0,
            packet_count: parseInt(parts[6], 10) || 0,
            total_bytes: parseInt(parts[7], 10) || 0,
            src_bytes: parseInt(parts[8], 10) || 0,
            dst_bytes: parseInt(parts[9], 10) || 0,
            avg_pkt_size: parseFloat(parts[10]) || 0,
            packets_per_sec: parseFloat(parts[11]) || 0,
            flags_count: parseInt(parts[12], 10) || 0,
            ttl: parseInt(parts[13], 10) || 64,
            payload_entropy: parseFloat(parts[14]) || 0,
            label: parts[15] === 'attack' ? 'attack' : 'normal',
            attack_type: parts[16] || (parts[15] === 'attack' ? 'anomaly' : 'normal'),
          });
        }
      }

      if (parsedFlows.length > 0) {
        setFlows(parsedFlows);
        setDatasetName(`${file.name} (${parsedFlows.length} flows)`);
        setCurrentPage(1);
      }
    };
    reader.readAsText(file);
  };

  // Export Enriched CSV
  const handleExportEnrichedCsv = () => {
    const headers = [
      'src_ip', 'dst_ip', 'src_port', 'dst_port', 'protocol',
      'duration_sec', 'packet_count', 'total_bytes', 'src_bytes', 'dst_bytes',
      'avg_pkt_size', 'packets_per_sec', 'flags_count', 'ttl', 'payload_entropy',
      'actual_label', 'predicted_label', 'attack_type', 'confidence_pct', 'anomaly_score', 'iptables_mitigation'
    ];

    const rows = evaluatedResults.map(({ flow, prediction }) => [
      flow.src_ip,
      flow.dst_ip,
      flow.src_port,
      flow.dst_port,
      flow.protocol,
      flow.duration_sec,
      flow.packet_count,
      flow.total_bytes,
      flow.src_bytes,
      flow.dst_bytes,
      flow.avg_pkt_size,
      flow.packets_per_sec,
      flow.flags_count,
      flow.ttl,
      flow.payload_entropy,
      flow.label || 'unknown',
      prediction.label,
      prediction.attackType,
      prediction.confidence,
      prediction.anomalyScore,
      `"${prediction.mitigation.iptablesRule.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `safenet_ids_analyzed_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & File Operations */}
      <div className="bg-[#070e22]/95 border border-[#172a54] rounded-lg p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[#0a183d]/60 border border-blue-700/80 text-cyan-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">
                Batch Flow Processor & CSV Dataset Engine
              </h2>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 font-mono">
                <span>Active File: <strong className="text-cyan-300 font-normal">{datasetName}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 cursor-pointer border border-slate-700 transition-colors">
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>Upload CSV</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              onClick={() => {
                setFlows(INITIAL_DATASET);
                setDatasetName("safenet_sample_500.csv (Default Benchmark)");
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 border border-slate-700 transition-colors"
            >
              Reset to SafeNet 500
            </button>

            <button
              onClick={handleExportEnrichedCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-xs font-mono font-semibold text-white transition-colors shadow-sm shadow-blue-950"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Analyzed CSV</span>
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-[#172a54]">
          <div className="bg-[#030712] p-2.5 rounded border border-[#172a54]/80 font-mono">
            <span className="text-[11px] text-slate-400 block">TOTAL FLOWS</span>
            <span className="text-lg font-bold text-white">{totalFlows.toLocaleString()}</span>
          </div>

          <div className="bg-[#030712] p-2.5 rounded border border-[#172a54]/80 font-mono">
            <span className="text-[11px] text-slate-400 block">ATTACKS IDENTIFIED</span>
            <span className="text-lg font-bold text-rose-400">
              {attackCount} <span className="text-xs text-slate-400 font-normal">({attackPercentage.toFixed(1)}%)</span>
            </span>
          </div>

          <div className="bg-[#030712] p-2.5 rounded border border-[#172a54]/80 font-mono">
            <span className="text-[11px] text-slate-400 block">NORMAL TRAFFIC</span>
            <span className="text-lg font-bold text-emerald-400">
              {normalCount} <span className="text-xs text-slate-400 font-normal">({(100 - attackPercentage).toFixed(1)}%)</span>
            </span>
          </div>

          <div className="bg-[#030712] p-2.5 rounded border border-[#172a54]/80 font-mono">
            <span className="text-[11px] text-slate-400 block">THREAT FAMILIES</span>
            <div className="flex gap-1.5 text-xs mt-1">
              <span className="text-rose-300">DoS: {attackTypeBreakdown['dos'] || 0}</span>
              <span className="text-slate-600">·</span>
              <span className="text-amber-300">Scan: {attackTypeBreakdown['portscan'] || 0}</span>
              <span className="text-slate-600">·</span>
              <span className="text-purple-300">SQLi: {attackTypeBreakdown['sql_injection'] || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#070e22]/95 border border-[#172a54] rounded-lg p-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by IP, port (e.g. 443, 3306), protocol, or threat type..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[#030712] border border-[#172a54] rounded px-2.5 py-1 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Filter Category Segmented Control */}
        <div className="flex items-center gap-1 bg-[#030712] p-1 rounded-md border border-[#172a54] overflow-x-auto scrollbar-none">
          {[
            { id: 'all', label: 'All' },
            { id: 'attacks', label: 'Attacks' },
            { id: 'dos', label: 'DoS' },
            { id: 'portscan', label: 'PortScan' },
            { id: 'sql_injection', label: 'SQLi' },
            { id: 'bruteforce', label: 'Brute' },
            { id: 'malware', label: 'Malware' },
            { id: 'normal', label: 'Normal' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setCategoryFilter(cat.id);
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 text-xs font-mono rounded transition-colors whitespace-nowrap ${
                categoryFilter === cat.id
                  ? 'bg-slate-800 text-cyan-300 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Paginated Data Grid */}
      <div className="bg-[#070e22]/95 border border-[#172a54] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="text-[11px] text-slate-400 uppercase bg-[#030712]/95 border-b border-[#172a54]">
              <tr>
                <th className="py-2.5 px-3">Flow ID</th>
                <th className="py-2.5 px-3">Source Socket</th>
                <th className="py-2.5 px-3">Target Socket</th>
                <th className="py-2.5 px-3">Proto</th>
                <th className="py-2.5 px-3 text-right">Packets</th>
                <th className="py-2.5 px-3 text-right">Bytes</th>
                <th className="py-2.5 px-3 text-right">PPS</th>
                <th className="py-2.5 px-3 text-right">Entropy</th>
                <th className="py-2.5 px-3">Ground Truth</th>
                <th className="py-2.5 px-3">Ensemble Prediction</th>
                <th className="py-2.5 px-3 text-right">Confidence</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedResults.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-slate-500 font-mono text-xs">
                    No flows match your search or filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedResults.map(({ flow, prediction }) => {
                  const isAttack = prediction.label === 'attack';
                  const isMatch = (flow.label === prediction.label);

                  return (
                    <tr 
                      key={flow.id} 
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isAttack ? 'bg-rose-950/10' : ''
                      }`}
                    >
                      <td className="py-2 px-3 text-slate-400">
                        {flow.id}
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-300">
                        {flow.src_ip}:{flow.src_port}
                      </td>
                      <td className="py-2 px-3 text-slate-300">
                        {flow.dst_ip}:{flow.dst_port}
                      </td>
                      <td className="py-2 px-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                          {flow.protocol}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right text-slate-300">
                        {flow.packet_count.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-300">
                        {(flow.total_bytes / 1024).toFixed(1)} KB
                      </td>
                      <td className="py-2 px-3 text-right text-slate-300">
                        {flow.packets_per_sec.toFixed(1)}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <span className={flow.payload_entropy > 4.5 ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                          {flow.payload_entropy.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <span className={`text-[11px] ${
                          flow.label === 'attack' ? 'text-rose-400 font-semibold' : 'text-slate-400'
                        }`}>
                          {flow.label ? `${flow.label.toUpperCase()}${flow.attack_type ? ` (${flow.attack_type})` : ''}` : 'N/A'}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        {isAttack ? (
                          <span className="text-rose-400 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            {prediction.attackType.toUpperCase()}
                          </span>
                        ) : (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            NORMAL
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right font-semibold">
                        <span className={isAttack ? 'text-rose-400' : 'text-emerald-400'}>
                          {prediction.confidence.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          onClick={() => onSelectFlowForInspection(flow)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 text-[11px] transition-colors"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#172a54] bg-[#030712]/80 font-mono text-xs">
          <span className="text-slate-400">
            Showing {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredResults.length)} of {filteredResults.length} filtered flows
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-slate-300 px-2">
              Page {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
