import { SAMPLE_FLOWS } from './sampleFlows';
import { NetworkFlow } from '../types/ids';

export const INITIAL_DATASET: NetworkFlow[] = SAMPLE_FLOWS;

export const ATTACK_TYPE_DESCRIPTIONS: Record<string, { name: string; description: string; impact: string }> = {
  dos: {
    name: "Denial of Service (DoS/DDoS)",
    description: "Volumetric flooding attack designed to exhaust target server socket queues, bandwidth, or CPU.",
    impact: "Causes service unavailability, high packet drops, and degraded latency."
  },
  portscan: {
    name: "Reconnaissance & Port Scanning",
    description: "Probing target host ports with SYN/FIN/NULL sweeps to discover open network services and vulnerabilities.",
    impact: "Precedes targeted exploitation, identifies vulnerable daemon versions."
  },
  bruteforce: {
    name: "Credential Brute Force",
    description: "Automated dictionary or credential stuffing attack attempting repeated authentication on SSH, RDP, or HTTP services.",
    impact: "Risk of unauthorized access, account takeover, privilege escalation."
  },
  sql_injection: {
    name: "SQL Injection / Web Exploit",
    description: "Malicious SQL syntax injected into web forms or HTTP parameters to query database backends directly.",
    impact: "Data exfiltration, database tampering, potential remote code execution."
  },
  malware: {
    name: "Malware / Command & Control (C2)",
    description: "Command and control beaconing, reverse shell persistence, or automated worm propagation traffic.",
    impact: "Host compromise, lateral movement, botnet enlistment."
  },
  normal: {
    name: "Benign / Normal Traffic",
    description: "Legitimate enterprise network communications conforming to RFC specifications.",
    impact: "No security threat identified."
  }
};

export const COMMON_PORTS: Record<number, string> = {
  21: "FTP",
  22: "SSH",
  23: "Telnet",
  25: "SMTP",
  53: "DNS",
  80: "HTTP",
  123: "NTP",
  443: "HTTPS",
  445: "SMB",
  1433: "MSSQL",
  3306: "MySQL",
  5432: "PostgreSQL",
  6379: "Redis",
  8080: "HTTP-Alt",
  8443: "HTTPS-Alt",
  27017: "MongoDB"
};
