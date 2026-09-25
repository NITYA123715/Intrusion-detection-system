import { UserProfile, SecurityPersona, SECURITY_PERSONAS } from '../types/auth';

const STORAGE_KEY = 'safenet_ids_auth_user';

export function getStoredUser(): UserProfile | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as UserProfile;
    }
  } catch (e) {
    console.error('Failed reading user session', e);
  }
  // Default to Nitya Tiwari for immediate seamless access if needed
  return null;
}

export function saveUserSession(user: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Failed saving user session', e);
  }
}

export function clearUserSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed clearing session', e);
  }
}

export function authenticateWithPersona(personaKey: string): UserProfile {
  const persona = SECURITY_PERSONAS.find(p => p.key === personaKey) || SECURITY_PERSONAS[0];
  const user: UserProfile = {
    id: `usr-${Date.now()}-${persona.key}`,
    name: persona.name,
    email: persona.email,
    role: persona.role,
    roleTitle: persona.roleTitle,
    badgeNumber: persona.badgeNumber,
    clearanceLevel: persona.clearanceLevel,
    department: persona.department,
    avatarInitials: persona.avatarInitials,
    sessionToken: `token-sec-${Math.random().toString(36).substring(2)}-${Date.now()}`,
    loginTime: new Date().toISOString(),
  };
  saveUserSession(user);
  return user;
}

export function authenticateWithCredentials(email: string, name?: string): UserProfile {
  // If email matches Nitya Tiwari
  const isNitya = email.toLowerCase().includes('nitya') || email.toLowerCase().includes('nityatiwari');
  
  const initials = name 
    ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : (isNitya ? 'NT' : 'SA');

  const user: UserProfile = {
    id: `usr-${Date.now()}`,
    name: name || (isNitya ? 'Nitya Tiwari' : email.split('@')[0]),
    email,
    role: isNitya ? 'lead_analyst' : 'soc_operator',
    roleTitle: isNitya ? 'Principal SOC Architect & Lead Engineer' : 'SOC Defense Operator',
    badgeNumber: isNitya ? 'SOC-L3-ALPHA-01' : `SOC-OP-${Math.floor(1000 + Math.random() * 9000)}`,
    clearanceLevel: isNitya ? 'Level 3 - Top Secret' : 'Level 1 - Operator',
    department: 'Cybersecurity Threat Defense Operations',
    avatarInitials: initials,
    sessionToken: `token-sec-${Math.random().toString(36).substring(2)}-${Date.now()}`,
    loginTime: new Date().toISOString(),
  };

  saveUserSession(user);
  return user;
}
