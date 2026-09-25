#!/usr/bin/env bash
# Automated Git Push helper for NITYA123715
set -e

REPO_URL="https://github.com/NITYA123715/IDS-Network-Intrusion-Detection-System.git"

echo "=========================================================="
echo " SafeNet IDS - Automated Git Push to NITYA123715 Repository"
echo "=========================================================="
echo "Target: $REPO_URL"

# Initialize git if not present
if [ ! -d ".git" ]; then
    echo "[*] Initializing local git repository..."
    git init
    git branch -M main
fi

# Configure remote
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO_URL"

echo "[*] Staging all files (React Web Frontend, FastAPI Backend, Enhanced ML Models)..."
git add .

echo "[*] Creating commit..."
git commit -m "feat: add React SOC web frontend, multi-class ensemble ML pipeline, and FastAPI backend" || true

echo ""
echo "[+] Local commit ready! To push to GitHub, run:"
echo "    git push -u origin main"
echo ""
