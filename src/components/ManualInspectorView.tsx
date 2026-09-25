import React, { useState } from 'react';
import { 
  Terminal, 
  Play, 
  RotateCcw, 
  ShieldAlert, 
  ShieldCheck, 
  Copy, 
  Check, 
  Sparkles,
  Info,
  SlidersHorizontal,
  Flame,
  Search,
  Key,
  Database,
  Bug
} from 'lucide-react';
import { NetworkFlow, ModelPrediction, ModelHyperparameters } from '../types/ids';
import { predictFlow, DEFAULT_HYPERPARAMETERS } from '../services/idsMlEngine';

interface ManualInspectorViewProps {
  initialFlow?: NetworkFlow | null;
  hyperparameters: ModelHyperparameters;
}

const PRESETS: { name: string; icon: React.ReactNode; desc: string; values: Record<string, string> }[] = [
  {
    name: "Benign HTTPS Session",
    icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />,
    desc: "Standard TLS 1.3 web browsing session",
    values: {
      src_ip: "192.168.1.105",
      dst_ip: "10.0.0.10",
      src_port: "35650",
      dst_port: "443",
      protocol: "TCP",
      duration_sec: "0.443",
      packet_count: "12",
      total_bytes: "6115",
      src_bytes: "1720",
      dst_bytes: "4095",
      avg_pkt_size: "470.0",
      packets_per_sec: "37.2",
      flags_count: "3",
      ttl: "255",
      payload_entropy: "2.27"
    }
  },
  {
    name: "Volumetric SYN DoS",
    icon: <Flame className="w-3.5 h-3.5 text-rose-400" />,
    desc: "Exhaustion attack with high packet rate & bytes",
    values: {
      src_ip: "185.220.101.5",
      dst_ip: "10.0.0.12",
      src_port: "4482",
      dst_port: "80",
      protocol: "TCP",
      duration_sec: "11.80",
      packet_count: "4699",
      total_bytes: "751840",
      src_bytes: "655747",
      dst_bytes: "96093",
      avg_pkt_size: "160.0",
      packets_per_sec: "398.19",
      flags_count: "52",
      ttl: "128",
      payload_entropy: "3.248"
    }
  },
  {
    name: "Nmap Stealth Port Scan",
    icon: <Search className="w-3.5 h-3.5 text-amber-400" />,
    desc: "Rapid port probe with small packet sizes & high entropy",
    values: {
      src_ip: "194.26.29.112",
      dst_ip: "10.0.0.12",
      src_port: "46976",
      dst_port: "53",
      protocol: "UDP",
      duration_sec: "1.77",
      packet_count: "274",
      total_bytes: "48498",
      src_bytes: "19634",
      dst_bytes: "28864",
      avg_pkt_size: "177.0",
      packets_per_sec: "154.63",
      flags_count: "9",
      ttl: "64",
      payload_entropy: "7.813"
    }
  },
  {
    name: "SQL Injection Probe",
    icon: <Database className="w-3.5 h-3.5 text-purple-400" />,
    desc: "Database evasion with elevated entropy payload",
    values: {
      src_ip: "103.251.167.20",
      dst_ip: "10.0.0.25",
      src_port: "8015",
      dst_port: "3306",
      protocol: "TCP",
      duration_sec: "1.89",
      packet_count: "36",
      total_bytes: "6696",
      src_bytes: "3508",
      dst_bytes: "3188",
      avg_pkt_size: "186.0",
      packets_per_sec: "18.97",
      flags_count: "5",
      ttl: "255",
      payload_entropy: "6.319"
    }
  },
  {
    name: "SSH Brute Force Spray",
    icon: <Key className="w-3.5 h-3.5 text-orange-400" />,
    desc: "Long duration credential stuffing attack",
    values: {
      src_ip: "45.154.255.89",
      dst_ip: "10.0.0.20",
      src_port: "35352",
      dst_port: "22",
      protocol: "TCP",
      duration_sec: "80.67",
      packet_count: "377",
      total_bytes: "160979",
      src_bytes: "85352",
      dst_bytes: "75627",
      avg_pkt_size: "427.0",
      packets_per_sec: "4.67",
      flags_count: "15",
      ttl: "64",
      payload_entropy: "8.000"
    }
  },
  {
    name: "Malware C2 Beaconing",
    icon: <Bug className="w-3.5 h-3.5 text-rose-400" />,
    desc: "Persistent botnet connection with payload asymmetry",
    values: {
      src_ip: "198.51.100.77",
      dst_ip: "10.0.0.15",
      src_port: "17237",
      dst_port: "8080",
      protocol: "TCP",
      duration_sec: "117.40",
      packet_count: "767",
      total_bytes: "276887",
      src_bytes: "18168",
      dst_bytes: "258719",
      avg_pkt_size: "361.0",
      packets_per_sec: "6.53",
      flags_count: "43",
      ttl: "128",
      payload_entropy: "3.447"
    }
  }
];

export const ManualInspectorView: React.FC<ManualInspectorViewProps> = ({
  initialFlow,
  hyperparameters,
}) => {
  const [formValues, setFormValues] = useState<Record<string, string>>(() => {
    if (initialFlow) {
      return {
        src_ip: initialFlow.src_ip || '192.168.1.100',
        dst_ip: initialFlow.dst_ip || '10.0.0.1',
        src_port: String(initialFlow.src_port || 35650),
        dst_port: String(initialFlow.dst_port || 443),
        protocol: initialFlow.protocol || 'TCP',
        duration_sec: String(initialFlow.duration_sec ?? 0.443),
        packet_count: String(initialFlow.packet_count ?? 12),
        total_bytes: String(initialFlow.total_bytes ?? 6115),
        src_bytes: String(initialFlow.src_bytes ?? 1720),
        dst_bytes: String(initialFlow.dst_bytes ?? 4095),
        avg_pkt_size: String(initialFlow.avg_pkt_size ?? 470.0),
        packets_per_sec: String(initialFlow.packets_per_sec ?? 37.2),
        flags_count: String(initialFlow.flags_count ?? 3),
        ttl: String(initialFlow.ttl ?? 255),
        payload_entropy: String(initialFlow.payload_entropy ?? 2.27),
      };
    }
    return PRESETS[0].values;
  });

  const [prediction, setPrediction] = useState<ModelPrediction | null>(() => {
    const flow: NetworkFlow = {
      id: 'manual-init',
      src_ip: PRESETS[0].values.src_ip,
      dst_ip: PRESETS[0].values.dst_ip,
      src_port: Number(PRESETS[0].values.src_port),
      dst_port: Number(PRESETS[0].values.dst_port),
      protocol: PRESETS[0].values.protocol,
      duration_sec: Number(PRESETS[0].values.duration_sec),
      packet_count: Number(PRESETS[0].values.packet_count),
      total_bytes: Number(PRESETS[0].values.total_bytes),
      src_bytes: Number(PRESETS[0].values.src_bytes),
      dst_bytes: Number(PRESETS[0].values.dst_bytes),
      avg_pkt_size: Number(PRESETS[0].values.avg_pkt_size),
      packets_per_sec: Number(PRESETS[0].values.packets_per_sec),
      flags_count: Number(PRESETS[0].values.flags_count),
      ttl: Number(PRESETS[0].values.ttl),
      payload_entropy: Number(PRESETS[0].values.payload_entropy),
    };
    return predictFlow(flow, hyperparameters);
  });

  const [copiedRule, setCopiedRule] = useState<string | null>(null);

  const handleInputChange = (field: string, val: string) => {
    setFormValues(prev => ({ ...prev, [field]: val }));
  };

  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    setFormValues(preset.values);
    const flow: NetworkFlow = {
      id: `preset-${Date.now()}`,
      src_ip: preset.values.src_ip,
      dst_ip: preset.values.dst_ip,
      src_port: Number(preset.values.src_port),
      dst_port: Number(preset.values.dst_port),
      protocol: preset.values.protocol,
      duration_sec: Number(preset.values.duration_sec),
      packet_count: Number(preset.values.packet_count),
      total_bytes: Number(preset.values.total_bytes),
      src_bytes: Number(preset.values.src_bytes),
      dst_bytes: Number(preset.values.dst_bytes),
      avg_pkt_size: Number(preset.values.avg_pkt_size),
      packets_per_sec: Number(preset.values.packets_per_sec),
      flags_count: Number(preset.values.flags_count),
      ttl: Number(preset.values.ttl),
      payload_entropy: Number(preset.values.payload_entropy),
    };
    setPrediction(predictFlow(flow, hyperparameters));
  };

  const handleRunPredict = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const flow: NetworkFlow = {
      id: `manual-${Date.now()}`,
      src_ip: formValues.src_ip || '0.0.0.0',
      dst_ip: formValues.dst_ip || '0.0.0.0',
      src_port: Number(formValues.src_port) || 0,
      dst_port: Number(formValues.dst_port) || 0,
      protocol: formValues.protocol || 'TCP',
      duration_sec: Number(formValues.duration_sec) || 0,
      packet_count: Number(formValues.packet_count) || 0,
      total_bytes: Number(formValues.total_bytes) || 0,
      src_bytes: Number(formValues.src_bytes) || 0,
      dst_bytes: Number(formValues.dst_bytes) || 0,
      avg_pkt_size: Number(formValues.avg_pkt_size) || 0,
      packets_per_sec: Number(formValues.packets_per_sec) || 0,
      flags_count: Number(formValues.flags_count) || 0,
      ttl: Number(formValues.ttl) || 64,
      payload_entropy: Number(formValues.payload_entropy) || 0,
    };
    setPrediction(predictFlow(flow, hyperparameters));
  };

  const handleCopyText = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRule(type);
    setTimeout(() => setCopiedRule(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Preset Scenarios Selector */}
      <div className="bg-[#070e22]/95 border border-[#172a54] rounded-lg p-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#172a54]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold text-slate-200">
              One-Click Threat & Benign Scenario Presets
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Click to load exact parameters from dataset
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 pt-3">
          {PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyPreset(preset)}
              className="p-2.5 rounded-lg bg-[#030712]/90 hover:bg-slate-800/80 border border-[#172a54] hover:border-slate-700 text-left transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center gap-1.5 mb-1">
                {preset.icon}
                <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                  {preset.name}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans line-clamp-1">
                {preset.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Inputs (Left 7 Cols) */}
        <div className="lg:col-span-7 bg-[#070e22]/95 border border-[#172a54] rounded-lg p-5">
          <div className="flex items-center justify-between pb-4 border-b border-[#172a54]">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-white">
                Network Flow Parameters
              </h3>
            </div>
            <button
              onClick={() => handleApplyPreset(PRESETS[0])}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 font-mono"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          <form onSubmit={handleRunPredict} className="mt-4 space-y-4">
            {/* Endpoints */}
            <div>
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
                1. Network Endpoints
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Source IP</label>
                  <input
                    type="text"
                    value={formValues.src_ip}
                    onChange={(e) => handleInputChange('src_ip', e.target.value)}
                    className="w-full bg-[#030712] border border-[#172a54] rounded px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Src Port</label>
                  <input
                    type="number"
                    value={formValues.src_port}
                    onChange={(e) => handleInputChange('src_port', e.target.value)}
                    className="w-full bg-[#030712] border border-[#172a54] rounded px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Dest IP</label>
                  <input
                    type="text"
                    value={formValues.dst_ip}
                    onChange={(e) => handleInputChange('dst_ip', e.target.value)}
                    className="w-full bg-[#030712] border border-[#172a54] rounded px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Dest Port</label>
                  <input
                    type="number"
                    value={formValues.dst_port}
                    onChange={(e) => handleInputChange('dst_port', e.target.value)}
                    className="w-full bg-[#030712] border border-[#172a54] rounded px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Protocol & Duration */}
            <div>
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
                2. Protocol & Timing
              </span>
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Protocol</label>
                  <select
                    value={formValues.protocol}
                    onChange={(e) => handleInputChange('protocol', e.target.value)}
                    className="w-full bg-[#030712] border border-[#172a54] rounded px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="TCP">TCP (0)</option>
                    <option value="UDP">UDP (1)</option>
                    <option value="ICMP">ICMP (2)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Duration (sec)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={formValues.duration_sec}
                    onChange={(e) => handleInputChange('duration_sec', e.target.value)}
                    className="w-full bg-[#030712] border border-[#172a54] rounded px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">TTL (Time to Live)</label>
                  <input
                    type="number"
                    value={formValues.ttl}
                    onChange={(e) => handleInputChange('ttl', e.target.value)}
                    className="w-full bg-[#030712] border border-[#172a54] rounded px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Packet & Byte Metrics */}
            <div>
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
                3. Packet & Byte Volumes
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Packet Count</label>
                  <input
                    type="number"
                    value={formValues.packet_count}
                    onChange={(e) => handleInputChange('packet_count', e.target.value)}
                    className="w-full bg-[#030712] border border-[#172a54] rounded px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Total Bytes</label>
                  <input
                    type="number"
                    value={formValues.total_bytes}
                    onChange={(e) => handleInputChange('total_bytes', e.target.value)}
                    className="w-full bg-[#030712] border border-[#172a54] rounded px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Source Bytes</label>
                  <input
                    type="number"
                    value={formValues.src_bytes}
                    onChange={(e) => handleInputChange('src_bytes', e.target.value)}
                    className="w-full bg-[#030712] border border-[#172a54] rounded px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Dest Bytes</label>
                  <input
                    type="number"
                    value={formValues.dst_bytes}
                    onChange={(e) => handleInputChange('dst_bytes', e.target.value)}
                    className="w-full bg-[#030712] border border-[#172a54] rounded px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Dynamics & Entropy */}
            <div>
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
                4. Flow Dynamics & Entropy
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Avg Pkt Size (B)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formValues.avg_pkt_size}
                    onChange={(e) => handleInputChange('avg_pkt_size', e.target.value)}
                    className="w-full bg-[#030712] border border-[#172a54] rounded px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Packets / Sec</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formValues.packets_per_sec}
                    onChange={(e) => handleInputChange('packets_per_sec', e.target.value)}
                    className="w-full bg-[#030712] border border-[#172a54] rounded px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Flags Count</label>
                  <input
                    type="number"
                    value={formValues.flags_count}
                    onChange={(e) => handleInputChange('flags_count', e.target.value)}
                    className="w-full bg-[#030712] border border-[#172a54] rounded px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Payload Entropy</label>
                  <input
                    type="number"
                    step="0.001"
                    value={formValues.payload_entropy}
                    onChange={(e) => handleInputChange('payload_entropy', e.target.value)}
                    className="w-full bg-[#030712] border border-[#172a54] rounded px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm shadow-blue-950"
              >
                <Play className="w-3.5 h-3.5" /> Execute Machine Learning Prediction
              </button>
            </div>
          </form>
        </div>

        {/* Prediction Results (Right 5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {prediction ? (
            <>
              {/* Verdict Card */}
              <div className={`p-4 rounded-lg border ${
                prediction.label === 'attack'
                  ? 'bg-rose-950/20 border-rose-800/80 shadow-md shadow-rose-950/40'
                  : 'bg-emerald-950/20 border-emerald-800/80 shadow-md shadow-emerald-950/40'
              }`}>
                <div className="flex items-center justify-between pb-3 border-b border-[#172a54]">
                  <div className="flex items-center gap-2">
                    {prediction.label === 'attack' ? (
                      <ShieldAlert className="w-5 h-5 text-rose-400" />
                    ) : (
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    )}
                    <span className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300">
                      Prediction Verdict
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {prediction.inferenceTimeMs}ms
                  </span>
                </div>

                <div className="mt-3">
                  <div className="flex items-baseline justify-between">
                    <span className={`text-xl font-extrabold font-mono ${
                      prediction.label === 'attack' ? 'text-rose-400' : 'text-emerald-400'
                    }`}>
                      {prediction.label === 'attack' 
                        ? `ATTACK: ${prediction.attackType.toUpperCase()}`
                        : 'BENIGN / NORMAL'}
                    </span>
                    <span className="text-lg font-mono font-bold text-white">
                      {prediction.confidence.toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-[#030712] rounded-full h-2 overflow-hidden border border-[#172a54]">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        prediction.label === 'attack' ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${prediction.confidence}%` }}
                    />
                  </div>
                  <div className="mt-2 flex justify-between text-[11px] font-mono text-slate-400">
                    <span>Ensemble Threat Score: {prediction.rawScore}</span>
                    <span>Threshold: {prediction.decisionThreshold}</span>
                  </div>
                </div>
              </div>

              {/* Sub-Model Votes */}
              <div className="bg-[#070e22]/95 border border-[#172a54] rounded-lg p-3.5">
                <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Ensemble Breakdown
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded bg-[#030712] border border-[#172a54]">
                    <span className="text-slate-400 block text-[10px]">RANDOM FOREST</span>
                    <span className="font-semibold text-cyan-300">
                      {prediction.ensembleVotes.randomForest.pred.toUpperCase()}
                    </span>
                    <span className="text-[11px] text-slate-500 ml-1">
                      ({prediction.ensembleVotes.randomForest.score})
                    </span>
                  </div>
                  <div className="p-2 rounded bg-[#030712] border border-[#172a54]">
                    <span className="text-slate-400 block text-[10px]">GRADIENT BOOSTING</span>
                    <span className="font-semibold text-cyan-300">
                      {prediction.ensembleVotes.gradientBoosting.pred.toUpperCase()}
                    </span>
                    <span className="text-[11px] text-slate-500 ml-1">
                      ({prediction.ensembleVotes.gradientBoosting.score})
                    </span>
                  </div>
                  <div className="p-2 rounded bg-[#030712] border border-[#172a54]">
                    <span className="text-slate-400 block text-[10px]">ISOLATION ANOMALY</span>
                    <span className="font-semibold text-amber-300">
                      Score: {prediction.ensembleVotes.isolationForest.anomalyScore}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-[#030712] border border-[#172a54]">
                    <span className="text-slate-400 block text-[10px]">SURICATA HEURISTIC</span>
                    <span className="font-semibold text-purple-300 text-[11px] truncate block">
                      {prediction.ensembleVotes.heuristicRules.matched ? 'MATCHED' : 'CLEAN'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Top Explainability Factors */}
              <div className="bg-[#070e22]/95 border border-[#172a54] rounded-lg p-3.5">
                <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  XAI Feature Contribution
                </span>
                <div className="space-y-2 font-mono text-[11px]">
                  {prediction.featureContributions.slice(0, 4).map((fc, i) => (
                    <div key={i} className="pb-1.5 border-b border-[#172a54]/80 last:border-0">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">{fc.label}</span>
                        <span className={fc.isAbnormal ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                          {fc.value}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-sans leading-tight">
                        {fc.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Automated Mitigation Rules */}
              {prediction.label === 'attack' && (
                <div className="bg-[#070e22]/95 border border-[#172a54] rounded-lg p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      Automated Firewall Rule
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">Ready to Deploy</span>
                  </div>

                  {/* iptables rule */}
                  <div className="relative p-2 rounded bg-black/70 border border-[#172a54]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono text-slate-400">Linux iptables</span>
                      <button
                        onClick={() => handleCopyText(prediction.mitigation.iptablesRule, 'iptables')}
                        className="text-slate-400 hover:text-white flex items-center gap-1 text-[10px] font-mono"
                      >
                        {copiedRule === 'iptables' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        {copiedRule === 'iptables' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <code className="text-[11px] font-mono text-cyan-300 select-all break-all block">
                      {prediction.mitigation.iptablesRule}
                    </code>
                  </div>

                  {/* UFW rule */}
                  <div className="relative p-2 rounded bg-black/70 border border-[#172a54]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono text-slate-400">Ubuntu UFW</span>
                      <button
                        onClick={() => handleCopyText(prediction.mitigation.ufwRule, 'ufw')}
                        className="text-slate-400 hover:text-white flex items-center gap-1 text-[10px] font-mono"
                      >
                        {copiedRule === 'ufw' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        {copiedRule === 'ufw' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <code className="text-[11px] font-mono text-emerald-300 select-all break-all block">
                      {prediction.mitigation.ufwRule}
                    </code>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-[#070e22]/60 border border-[#172a54] rounded-lg p-8 text-center text-slate-500 font-mono text-xs">
              Fill parameters and click "Execute Machine Learning Prediction" to inspect.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
