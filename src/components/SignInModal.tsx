import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  UserCheck, 
  ArrowRight, 
  Fingerprint, 
  AlertCircle, 
  CheckCircle2, 
  BadgeCheck,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { UserProfile, SECURITY_PERSONAS, SecurityPersona } from '../types/auth';
import { authenticateWithPersona, authenticateWithCredentials } from '../services/authService';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export const SignInModal: React.FC<SignInModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [authMode, setAuthMode] = useState<'personas' | 'credentials'>('personas');
  const [email, setEmail] = useState('nityatiwari154@gmail.com');
  const [password, setPassword] = useState('••••••••••••');
  const [fullName, setFullName] = useState('Nitya Tiwari');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<string>('nitya');

  if (!isOpen) return null;

  const handlePersonaLogin = (personaKey: string) => {
    setIsSubmitting(true);
    setTimeout(() => {
      const user = authenticateWithPersona(personaKey);
      setIsSubmitting(false);
      onSuccess(user);
    }, 400);
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    setTimeout(() => {
      const user = authenticateWithCredentials(email, fullName);
      setIsSubmitting(false);
      onSuccess(user);
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#070d1e] border border-[#172a54] rounded-xl shadow-2xl shadow-blue-950/60 overflow-hidden text-slate-100">
        {/* Subtle decorative top navy glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-700 via-cyan-500 to-blue-600" />

        {/* Header */}
        <div className="p-6 pb-4 border-b border-[#172a54]/80 bg-[#050b18]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-950/80 border border-blue-800/80 flex items-center justify-center text-cyan-400 shadow-inner">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold tracking-tight font-mono text-white">
                    SAFENET<span className="text-cyan-400">::</span>SOC
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-cyan-300 border border-blue-800">
                    RESTRICTED ACCESS
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-sans">
                  Intrusion Detection System Security Authentication Gateway
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 text-sm font-mono"
            >
              ✕
            </button>
          </div>

          {/* Segmented Auth Mode Switcher */}
          <div className="mt-4 grid grid-cols-2 gap-1 p-1 bg-[#020612] rounded-lg border border-[#172a54]">
            <button
              onClick={() => setAuthMode('personas')}
              className={`py-1.5 text-xs font-mono font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
                authMode === 'personas'
                  ? 'bg-blue-900/60 text-cyan-300 border border-blue-700/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Fingerprint className="w-3.5 h-3.5 text-cyan-400" />
              <span>Security Personas</span>
            </button>
            <button
              onClick={() => setAuthMode('credentials')}
              className={`py-1.5 text-xs font-mono font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
                authMode === 'credentials'
                  ? 'bg-blue-900/60 text-cyan-300 border border-blue-700/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Key className="w-3.5 h-3.5 text-cyan-400" />
              <span>Email & Passkey</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {authMode === 'personas' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Select Authorized Operator Persona:</span>
                <span className="text-[11px] text-cyan-400">Instant Clearance</span>
              </div>

              <div className="space-y-2.5">
                {SECURITY_PERSONAS.map((persona) => {
                  const isSelected = selectedPersona === persona.key;
                  const isOwner = persona.key === 'nitya';

                  return (
                    <div
                      key={persona.key}
                      onClick={() => {
                        setSelectedPersona(persona.key);
                        handlePersonaLogin(persona.key);
                      }}
                      className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                        isOwner
                          ? 'bg-[#091530] border-blue-600/80 hover:border-blue-400 shadow-md shadow-blue-950/40'
                          : 'bg-[#050b18] border-[#172a54] hover:border-blue-700/60 hover:bg-[#0a1633]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-mono font-bold text-xs ${
                            isOwner ? 'bg-cyan-500 text-slate-950 ring-2 ring-blue-400/50' : 'bg-blue-950 text-blue-300 border border-blue-700'
                          }`}>
                            {persona.avatarInitials}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs text-white">
                                {persona.name}
                              </span>
                              {isOwner && (
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-700">
                                  Repo Owner
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-mono text-cyan-400 block mt-0.5">
                              {persona.roleTitle}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 block">
                              {persona.email} · {persona.badgeNumber}
                            </span>
                          </div>
                        </div>

                        <button
                          disabled={isSubmitting}
                          className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-semibold flex items-center gap-1 transition-colors shrink-0 shadow-sm"
                        >
                          <span>Sign In</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <form onSubmit={handleCredentialsSubmit} className="space-y-3.5 font-mono">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Operator Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#020612] border border-[#172a54] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  placeholder="e.g. Nitya Tiwari"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  SecOps Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#020612] border border-[#172a54] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  placeholder="name@domain.com"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Hardware Token / Passkey PIN
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#020612] border border-[#172a54] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  placeholder="Enter clearance token"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-950"
                >
                  {isSubmitting ? (
                    <span>Authenticating Credentials...</span>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Authenticate & Enter SOC Console</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Security policy note */}
          <div className="p-3 rounded-lg bg-[#020612] border border-[#172a54]/80 text-[11px] text-slate-400 flex items-start gap-2">
            <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
            <p className="font-sans leading-tight">
              All administrative sessions, ML pipeline parameter changes, and firewall mitigations are signed with cryptographic operator certificates and recorded to the SOC audit log.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
