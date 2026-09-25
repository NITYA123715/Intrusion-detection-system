export type UserRole = 'lead_analyst' | 'threat_hunter' | 'secops_admin' | 'soc_operator';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  badgeNumber: string;
  clearanceLevel: string;
  department: string;
  avatarInitials: string;
  sessionToken: string;
  loginTime: string;
}

export interface SecurityPersona {
  key: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  badgeNumber: string;
  clearanceLevel: string;
  department: string;
  avatarInitials: string;
  description: string;
}

export const SECURITY_PERSONAS: SecurityPersona[] = [
  {
    key: 'nitya',
    name: 'Nitya Tiwari',
    email: 'nityatiwari154@gmail.com',
    role: 'lead_analyst',
    roleTitle: 'Principal SOC Architect & Lead Engineer',
    badgeNumber: 'SOC-L3-ALPHA-01',
    clearanceLevel: 'Level 3 - Top Secret / SCI',
    department: 'Cyber Threat Intelligence & ML Defense',
    avatarInitials: 'NT',
    description: 'Repository Owner & Lead IDS Architect. Full administrative permissions to tune ML pipelines and dispatch automated firewall mitigations.'
  },
  {
    key: 'threat_hunter',
    name: 'Marcus Vance',
    email: 'marcus.vance@safenet.sec',
    role: 'threat_hunter',
    roleTitle: 'Senior Threat Hunter',
    badgeNumber: 'SOC-L2-BETA-44',
    clearanceLevel: 'Level 2 - Confidential',
    department: 'Incident Response & Network Forensics',
    avatarInitials: 'MV',
    description: 'Specialized in packet anomaly analysis, zero-day threat isolation, and signature correlation.'
  },
  {
    key: 'secops_admin',
    name: 'Elena Rostova',
    email: 'elena.rostova@safenet.sec',
    role: 'secops_admin',
    roleTitle: 'SecOps Infrastructure Director',
    badgeNumber: 'SOC-ADMIN-88',
    clearanceLevel: 'Level 3 - Enterprise Admin',
    department: 'Infrastructure & Security Operations',
    avatarInitials: 'ER',
    description: 'Manages iptables/UFW network ACLs, SIEM routing rules, and multi-cloud perimeter defenses.'
  }
];
