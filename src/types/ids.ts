export type Protocol = 'TCP' | 'UDP' | 'ICMP' | 'OTHER';

export type AttackType = 
  | 'normal'
  | 'dos'
  | 'portscan'
  | 'bruteforce'
  | 'sql_injection'
  | 'malware'
  | 'unknown';

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'safe';

export interface NetworkFlow {
  id: string;
  src_ip: string;
  dst_ip: string;
  src_port: number;
  dst_port: number;
  protocol: string;
  duration_sec: number;
  packet_count: number;
  total_bytes: number;
  src_bytes: number;
  dst_bytes: number;
  avg_pkt_size: number;
  packets_per_sec: number;
  flags_count: number;
  ttl: number;
  payload_entropy: number;
  label?: 'normal' | 'attack';
  attack_type?: string;
  timestamp?: string;
}

export interface FeatureContribution {
  feature: string;
  label: string;
  value: number | string;
  normalBaseline: string;
  impactScore: number; // 0 to 1
  isAbnormal: boolean;
  explanation: string;
}

export interface MitigationRule {
  title: string;
  severity: AlertSeverity;
  description: string;
  iptablesRule: string;
  ufwRule: string;
  suricataRule: string;
  cloudAcl: string;
}

export interface ModelPrediction {
  label: 'normal' | 'attack';
  attackType: AttackType;
  confidence: number; // 0 - 100
  rawScore: number; // 0 - 1
  anomalyScore: number; // 0 - 1
  severity: AlertSeverity;
  decisionThreshold: number;
  ensembleVotes: {
    randomForest: { pred: 'normal' | 'attack'; score: number; weight: number };
    gradientBoosting: { pred: 'normal' | 'attack'; score: number; weight: number };
    isolationForest: { isOutlier: boolean; anomalyScore: number; weight: number };
    heuristicRules: { matched: boolean; ruleName?: string; weight: number };
  };
  featureContributions: FeatureContribution[];
  mitigation: MitigationRule;
  inferenceTimeMs: number;
  timestamp: string;
}

export interface ModelEvaluationMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  totalEvaluated: number;
  confusionMatrix: {
    truePositive: number;
    falsePositive: number;
    trueNegative: number;
    falseNegative: number;
  };
  classBreakdown: Record<string, {
    precision: number;
    recall: number;
    f1: number;
    support: number;
  }>;
  featureImportance: {
    feature: string;
    importance: number;
    description: string;
  }[];
  modelComparisons: {
    modelName: string;
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    latencyMs: number;
    description: string;
  }[];
}

export interface ModelHyperparameters {
  decisionThreshold: number;
  rfTrees: number;
  maxDepth: number;
  anomalySensitivity: number; // 0 to 1
  ensembleWeights: {
    randomForest: number;
    gradientBoosting: number;
    anomalyDetector: number;
    heuristicEngine: number;
  };
}

export interface SecurityAlert {
  id: string;
  flow: NetworkFlow;
  prediction: ModelPrediction;
  status: 'unresolved' | 'investigating' | 'mitigated' | 'dismissed';
  createdAt: string;
  mitigatedAt?: string;
  mitigationApplied?: string;
  analystNotes?: string;
}
