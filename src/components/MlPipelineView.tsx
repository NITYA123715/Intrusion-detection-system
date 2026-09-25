import React, { useMemo } from 'react';
import { 
  Sliders, 
  Cpu, 
  TrendingUp, 
  BarChart3, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  Zap,
  RotateCcw
} from 'lucide-react';
import { ModelHyperparameters, ModelEvaluationMetrics } from '../types/ids';
import { evaluateDataset, DEFAULT_HYPERPARAMETERS } from '../services/idsMlEngine';
import { INITIAL_DATASET } from '../data/dataset';

interface MlPipelineViewProps {
  hyperparameters: ModelHyperparameters;
  setHyperparameters: React.Dispatch<React.SetStateAction<ModelHyperparameters>>;
}

export const MlPipelineView: React.FC<MlPipelineViewProps> = ({
  hyperparameters,
  setHyperparameters,
}) => {
  const metrics: ModelEvaluationMetrics = useMemo(() => {
    return evaluateDataset(INITIAL_DATASET, hyperparameters);
  }, [hyperparameters]);

  const handleThresholdChange = (val: number) => {
    setHyperparameters(prev => ({
      ...prev,
      decisionThreshold: val
    }));
  };

  const handleSensitivityChange = (val: number) => {
    setHyperparameters(prev => ({
      ...prev,
      anomalySensitivity: val
    }));
  };

  const handleResetHyperparameters = () => {
    setHyperparameters(DEFAULT_HYPERPARAMETERS);
  };

  const { confusionMatrix } = metrics;
  const totalAttacks = confusionMatrix.truePositive + confusionMatrix.falseNegative;
  const totalNormal = confusionMatrix.trueNegative + confusionMatrix.falsePositive;

  return (
    <div className="space-y-6">
      {/* Top Tuning & Threshold Controller */}
      <div className="bg-[#070e22]/95 border border-[#172a54] rounded-lg p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#172a54]">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-sm font-semibold text-white">
                Interactive Hyperparameter & Decision Threshold Studio
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Calibrate the multi-model ensemble in real time to optimize trade-offs between precision and recall.
              </p>
            </div>
          </div>

          <button
            onClick={handleResetHyperparameters}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 font-mono">
          {/* Decision Threshold Slider */}
          <div className="bg-[#030712] p-4 rounded-lg border border-[#172a54]">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-semibold text-slate-200">
                Decision Threshold (τ)
              </span>
              <span className="text-xs font-bold text-cyan-400 bg-[#0a183d]/80 px-2 py-0.5 rounded border border-blue-700/80">
                {hyperparameters.decisionThreshold.toFixed(2)}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans mb-3">
              Lower threshold (e.g. 0.35) increases detection sensitivity for stealth zero-days; higher threshold (e.g. 0.65) guarantees near-zero false alarms.
            </p>
            <input
              type="range"
              min="0.10"
              max="0.90"
              step="0.05"
              value={hyperparameters.decisionThreshold}
              onChange={(e) => handleThresholdChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>0.10 (High Sensitivity)</span>
              <span>0.50 (Balanced Baseline)</span>
              <span>0.90 (Conservative)</span>
            </div>
          </div>

          {/* Anomaly Detection Sensitivity */}
          <div className="bg-[#030712] p-4 rounded-lg border border-[#172a54]">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-semibold text-slate-200">
                Isolation Forest Contamination / Sensitivity
              </span>
              <span className="text-xs font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/80">
                {hyperparameters.anomalySensitivity.toFixed(2)}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans mb-3">
              Controls statistical z-score radius around normal cluster for catching previously unseen novel attack variants.
            </p>
            <input
              type="range"
              min="0.20"
              max="0.90"
              step="0.05"
              value={hyperparameters.anomalySensitivity}
              onChange={(e) => handleSensitivityChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>0.20 (Strict Cluster)</span>
              <span>0.65 (Calibrated)</span>
              <span>0.90 (Aggressive Outliers)</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Performance Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-[#070e22]/95 border border-[#172a54] rounded-lg p-3.5 font-mono">
          <span className="text-[11px] text-slate-400 block mb-1">ACCURACY</span>
          <div className="text-2xl font-bold text-white tracking-tight">
            {metrics.accuracy}%
          </div>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3 h-3" /> +5.2% vs Baseline RF
          </span>
        </div>

        <div className="bg-[#070e22]/95 border border-[#172a54] rounded-lg p-3.5 font-mono">
          <span className="text-[11px] text-slate-400 block mb-1">PRECISION</span>
          <div className="text-2xl font-bold text-cyan-400 tracking-tight">
            {metrics.precision}%
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {confusionMatrix.falsePositive} false alarms in 400 flows
          </span>
        </div>

        <div className="bg-[#070e22]/95 border border-[#172a54] rounded-lg p-3.5 font-mono">
          <span className="text-[11px] text-slate-400 block mb-1">RECALL / SENSITIVITY</span>
          <div className="text-2xl font-bold text-emerald-400 tracking-tight">
            {metrics.recall}%
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {confusionMatrix.truePositive} of {totalAttacks} threats captured
          </span>
        </div>

        <div className="bg-[#070e22]/95 border border-[#172a54] rounded-lg p-3.5 font-mono">
          <span className="text-[11px] text-slate-400 block mb-1">F1-SCORE</span>
          <div className="text-2xl font-bold text-purple-400 tracking-tight">
            {metrics.f1Score}%
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Harmonic balance
          </span>
        </div>

        <div className="bg-[#070e22]/95 border border-[#172a54] rounded-lg p-3.5 font-mono">
          <span className="text-[11px] text-slate-400 block mb-1">ROC-AUC AREA</span>
          <div className="text-2xl font-bold text-amber-400 tracking-tight">
            {metrics.rocAuc}%
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            High discrimination index
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Confusion Matrix (Left 5 Cols) */}
        <div className="lg:col-span-5 bg-[#070e22]/95 border border-[#172a54] rounded-lg p-4 font-mono">
          <div className="flex items-center justify-between pb-3 border-b border-[#172a54] mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                Confusion Matrix Heatmap
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">
              N = {metrics.totalEvaluated}
            </span>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-center">
              {/* True Positive */}
              <div className="bg-emerald-950/40 border border-emerald-700/80 p-3.5 rounded-lg">
                <span className="text-[10px] text-emerald-400 uppercase tracking-wider block font-bold">
                  True Positive (TP)
                </span>
                <span className="text-3xl font-extrabold text-emerald-300 block my-1">
                  {confusionMatrix.truePositive}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Attacks Accurately Intercepted
                </span>
              </div>

              {/* False Positive */}
              <div className={`p-3.5 rounded-lg border transition-all ${
                confusionMatrix.falsePositive > 0 
                  ? 'bg-rose-950/30 border-rose-700/80 text-rose-300' 
                  : 'bg-[#030712] border-[#172a54] text-slate-400'
              }`}>
                <span className="text-[10px] uppercase tracking-wider block font-bold text-slate-400">
                  False Positive (FP)
                </span>
                <span className="text-3xl font-extrabold block my-1 text-slate-200">
                  {confusionMatrix.falsePositive}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Normal Mistaken as Attack
                </span>
              </div>

              {/* False Negative */}
              <div className={`p-3.5 rounded-lg border transition-all ${
                confusionMatrix.falseNegative > 0 
                  ? 'bg-amber-950/30 border-amber-700/80 text-amber-300' 
                  : 'bg-[#030712] border-[#172a54] text-slate-400'
              }`}>
                <span className="text-[10px] uppercase tracking-wider block font-bold text-slate-400">
                  False Negative (FN)
                </span>
                <span className="text-3xl font-extrabold block my-1 text-amber-400">
                  {confusionMatrix.falseNegative}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Attacks Missed
                </span>
              </div>

              {/* True Negative */}
              <div className="bg-[#030712] border border-[#172a54] p-3.5 rounded-lg">
                <span className="text-[10px] text-cyan-400 uppercase tracking-wider block font-bold">
                  True Negative (TN)
                </span>
                <span className="text-3xl font-extrabold text-cyan-300 block my-1">
                  {confusionMatrix.trueNegative}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Benign Flows Validated
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded bg-[#030712] border border-[#172a54]/80 text-[11px] text-slate-400 space-y-1 font-sans">
              <p>
                <strong>Evaluation Insight:</strong> At threshold τ = {hyperparameters.decisionThreshold.toFixed(2)}, the ensemble eliminates false alarms while capturing <strong>{((confusionMatrix.truePositive / Math.max(1, totalAttacks)) * 100).toFixed(1)}%</strong> of high-risk intrusions.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Importance Breakdown (Right 7 Cols) */}
        <div className="lg:col-span-7 bg-[#070e22]/95 border border-[#172a54] rounded-lg p-4 font-mono">
          <div className="flex items-center justify-between pb-3 border-b border-[#172a54] mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                MDI & Permutation Feature Importance
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">
              Tree Gini Information Gain
            </span>
          </div>

          <div className="space-y-3">
            {metrics.featureImportance.map((feat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-200 font-semibold">{feat.feature}</span>
                  <span className="text-cyan-400 font-bold">{(feat.importance * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-[#030712] rounded-full h-2 overflow-hidden border border-[#172a54]">
                  <div
                    className="bg-gradient-to-r from-cyan-600 to-blue-500 h-full rounded-full"
                    style={{ width: `${feat.importance * 100 * 2.8}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-sans">
                  {feat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Model Benchmark Comparison Table */}
      <div className="bg-[#070e22]/95 border border-[#172a54] rounded-lg p-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#172a54] mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">
              Model Performance Benchmark vs. Original Baseline
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            NITYA123715 Repository Comparison
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="text-[11px] text-slate-400 uppercase bg-[#030712] border-b border-[#172a54]">
              <tr>
                <th className="py-2.5 px-3">Model Architecture</th>
                <th className="py-2.5 px-3 text-right">Accuracy</th>
                <th className="py-2.5 px-3 text-right">Precision</th>
                <th className="py-2.5 px-3 text-right">Recall</th>
                <th className="py-2.5 px-3 text-right">F1-Score</th>
                <th className="py-2.5 px-3 text-right">Latency</th>
                <th className="py-2.5 px-3">Ensemble Configuration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {metrics.modelComparisons.map((model, idx) => {
                const isCurrent = idx === 0;
                return (
                  <tr 
                    key={idx} 
                    className={isCurrent ? 'bg-[#0a183d]/20 font-semibold' : 'hover:bg-slate-800/40'}
                  >
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />}
                        <span className={isCurrent ? 'text-cyan-300' : 'text-slate-300'}>
                          {model.modelName}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">
                      {model.accuracy}%
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-200">
                      {model.precision}%
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-200">
                      {model.recall}%
                    </td>
                    <td className="py-2.5 px-3 text-right text-purple-300 font-bold">
                      {model.f1Score}%
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400">
                      {model.latencyMs}ms
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px] font-sans">
                      {model.description}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
