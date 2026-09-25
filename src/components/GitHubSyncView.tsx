import React, { useState } from 'react';
import { 
  GitBranch, 
  GitCommit, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  Terminal, 
  CheckCircle2, 
  FileCode, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  BookOpen,
  ArrowRight,
  Key,
  HelpCircle,
  Sparkles,
  Lock
} from 'lucide-react';
import { 
  GITHUB_REPO_URL, 
  GITHUB_USER, 
  ENHANCED_BACKEND_FILES, 
  GIT_PUSH_SCRIPT,
  ExportFile 
} from '../services/gitExportService';

export const GitHubSyncView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<ExportFile>(ENHANCED_BACKEND_FILES[0]);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [userToken, setUserToken] = useState<string>('');
  const [activeStep, setActiveStep] = useState<number>(1);

  const handleCopyText = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleDownloadFile = (file: ExportFile) => {
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAllScript = () => {
    const script = `#!/bin/bash
# SafeNet IDS - Automated Project Setup & GitHub Sync Script for ${GITHUB_USER}
set -e

echo "=========================================="
echo " SafeNet IDS Enhanced Setup for ${GITHUB_USER}"
echo " Repository: ${GITHUB_REPO_URL}"
echo "=========================================="

mkdir -p backend
${ENHANCED_BACKEND_FILES.map(f => `cat << 'EOF' > backend/${f.filename}\n${f.content}\nEOF\necho "[+] Generated backend/${f.filename}"`).join('\n\n')}

echo ""
echo "[*] Staging files for Git..."
git add .
git commit -m "feat: add React SOC web frontend, multi-class ensemble ML pipeline, and FastAPI backend" || true

echo ""
echo "[+] All files successfully generated and committed!"
echo "[*] Run the following command to push to GitHub:"
echo "    git push origin main"
`;

    const blob = new Blob([script], { type: 'text/x-shellscript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = "setup_and_push_ids.sh";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tokenPushCommand = userToken.trim() 
    ? `git push https://${userToken.trim()}@github.com/${GITHUB_USER}/IDS-Network-Intrusion-Detection-System.git main`
    : `git push https://<YOUR_GITHUB_TOKEN>@github.com/${GITHUB_USER}/IDS-Network-Intrusion-Detection-System.git main`;

  return (
    <div className="space-y-6">
      {/* Top Banner & Target Repo Info */}
      <div className="bg-[#070e22]/95 border border-[#172a54] rounded-lg p-5 shadow-xl shadow-black/50">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[#0a183d]/60 border border-blue-700/80 text-cyan-400">
              <GitBranch className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Step-by-Step GitHub Repository Push Center
                </h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/80">
                  Ready to Push
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Target Repository: <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">{GITHUB_REPO_URL}</a>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadAllScript}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-xs font-mono font-semibold text-white transition-colors shadow-sm shadow-blue-950"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Setup Script (.sh)</span>
            </button>

            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#0a183d] hover:bg-[#102766] text-xs font-mono text-cyan-300 border border-blue-700/80 transition-colors"
            >
              <span>View GitHub Repo</span>
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            </a>
          </div>
        </div>
      </div>

      {/* Step-by-Step Push Walkthrough Cards */}
      <div className="bg-[#070e22]/95 border border-[#172a54] rounded-lg p-5 shadow-xl shadow-black/50 space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-[#172a54]">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
            Step-by-Step Push Instructions
          </h3>
        </div>

        {/* STEP 1: Generate Personal Access Token */}
        <div className="bg-[#030712] border border-[#172a54] rounded-lg p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">
                1
              </span>
              <div>
                <h4 className="text-xs font-bold text-white font-mono uppercase">
                  Generate a GitHub Personal Access Token (PAT)
                </h4>
                <p className="text-xs text-slate-300 font-sans mt-1">
                  GitHub requires a Personal Access Token instead of your password for command-line pushes:
                </p>
                <ol className="list-decimal list-inside text-xs text-slate-400 font-sans mt-2 space-y-1">
                  <li>Go to <strong>GitHub.com &gt; Settings &gt; Developer settings &gt; Personal access tokens &gt; Tokens (classic)</strong></li>
                  <li>Click <strong>Generate new token (classic)</strong></li>
                  <li>Set note to <code className="text-cyan-400">SafeNet-IDS-Push</code> and check the <code className="text-cyan-400 font-bold">repo</code> scope checkbox</li>
                  <li>Click <strong>Generate token</strong> and copy the token string (starts with <code className="text-slate-300">ghp_...</code>)</li>
                </ol>
              </div>
            </div>

            <a
              href="https://github.com/settings/tokens/new?scopes=repo&description=SafeNet-IDS-Push"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/50 text-cyan-300 text-xs font-mono flex items-center gap-1.5 whitespace-nowrap transition-colors"
            >
              <span>Create Token on GitHub</span>
              <ExternalLink className="w-3 h-3 text-cyan-400" />
            </a>
          </div>

          {/* Interactive Token Input for Instant Command Generation */}
          <div className="mt-4 pt-3 border-t border-[#172a54]/80">
            <label className="text-[11px] font-mono text-slate-400 block mb-1">
              Paste your token here to automatically generate your exact push command (kept strictly in browser):
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Key className="w-3.5 h-3.5 text-cyan-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={userToken}
                  onChange={(e) => setUserToken(e.target.value)}
                  placeholder="Paste your ghp_xxxxxxxxxxxxxxxxxxxx token here..."
                  className="w-full bg-[#070e22] border border-[#172a54] rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              {userToken && (
                <button
                  onClick={() => setUserToken('')}
                  className="text-xs font-mono text-slate-400 hover:text-white px-2 py-1"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* STEP 2: One-Command Push */}
        <div className="bg-[#030712] border border-[#172a54] rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">
              2
            </span>
            <div className="w-full">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white font-mono uppercase">
                  Run the Push Command in your Terminal
                </h4>
                <button
                  onClick={() => handleCopyText(tokenPushCommand, 'token-cmd')}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-semibold transition-colors"
                >
                  {copiedType === 'token-cmd' ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedType === 'token-cmd' ? 'Copied Command!' : 'Copy Push Command'}</span>
                </button>
              </div>

              <p className="text-xs text-slate-300 font-sans mt-1">
                Open your terminal in this project repository folder and execute:
              </p>

              <div className="mt-2.5 bg-black/90 p-3 rounded-lg border border-[#172a54] font-mono text-xs text-cyan-300 select-all overflow-x-auto">
                <code>{tokenPushCommand}</code>
              </div>
            </div>
          </div>
        </div>

        {/* STEP 3: Alternative Manual Git Commands */}
        <div className="bg-[#030712] border border-[#172a54] rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">
              3
            </span>
            <div className="w-full">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white font-mono uppercase">
                  Standard Multi-Step Git Sequence
                </h4>
                <button
                  onClick={() => handleCopyText(
`# 1. Set Remote URL
git remote set-url origin https://github.com/NITYA123715/IDS-Network-Intrusion-Detection-System.git

# 2. Stage All Changes
git add .

# 3. Create Commit
git commit -m "feat: add React SOC web frontend, multi-class ensemble ML pipeline, and FastAPI backend"

# 4. Push to Main Branch
git push -u origin main`,
                    'multi-git'
                  )}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#0a183d] hover:bg-[#102766] border border-blue-700/80 text-cyan-300 text-xs font-mono transition-colors"
                >
                  {copiedType === 'multi-git' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedType === 'multi-git' ? 'Copied Sequence!' : 'Copy All Lines'}</span>
                </button>
              </div>

              <div className="mt-2.5 bg-black/90 p-3 rounded-lg border border-[#172a54] font-mono text-xs text-slate-300 select-all overflow-x-auto leading-relaxed">
                <pre>{`git remote set-url origin https://github.com/NITYA123715/IDS-Network-Intrusion-Detection-System.git
git add .
git commit -m "feat: add React SOC web frontend, multi-class ensemble ML pipeline, and FastAPI backend"
git push -u origin main`}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* File Inspector Tabs */}
      <div className="bg-[#070e22]/95 border border-[#172a54] rounded-lg p-4 shadow-xl shadow-black/50">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#172a54]">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">
              Inspect Enhanced Files Included in this Commit
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopyText(selectedFile.content, selectedFile.filename)}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#0a183d] hover:bg-[#102766] border border-blue-700/80 text-xs font-mono text-cyan-300 transition-colors"
            >
              {copiedType === selectedFile.filename ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{copiedType === selectedFile.filename ? 'Copied Content' : 'Copy File'}</span>
            </button>

            <button
              onClick={() => handleDownloadFile(selectedFile)}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#0a183d] hover:bg-[#102766] border border-blue-700/80 text-xs font-mono text-slate-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* File Tabs */}
        <div className="flex gap-1 overflow-x-auto py-2 border-b border-[#172a54] font-mono text-xs">
          {ENHANCED_BACKEND_FILES.map((file) => {
            const isSelected = selectedFile.filename === file.filename;
            return (
              <button
                key={file.filename}
                onClick={() => setSelectedFile(file)}
                className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-[#0a183d] text-cyan-300 font-semibold border border-blue-700/80'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#030712]'
                }`}
              >
                {file.filename}
              </button>
            );
          })}
        </div>

        {/* Selected file description */}
        <div className="py-2.5 text-xs text-slate-400 font-sans">
          {selectedFile.description}
        </div>

        {/* File Content Preview */}
        <div className="bg-black/90 rounded-lg p-4 border border-[#172a54] font-mono text-xs max-h-[420px] overflow-y-auto">
          <pre className="text-slate-300 whitespace-pre select-all leading-relaxed">
            {selectedFile.content}
          </pre>
        </div>
      </div>
    </div>
  );
};
