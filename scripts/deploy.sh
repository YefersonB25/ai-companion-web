#!/usr/bin/env bash
# deploy.sh — Despliega la última versión del frontend web desde GitHub
# Uso: bash scripts/deploy.sh
set -euo pipefail

APP_DIR="/var/www/ai-companion-web"
cd "$APP_DIR"

PREV=$(git rev-parse HEAD)
echo ""
echo "▶ [deploy:web] Commit actual: $(git log -1 --pretty='%C(yellow)%h%Creset %s')"
echo "  Bajando cambios desde GitHub..."

git fetch origin main
INCOMING=$(git log HEAD..origin/main --oneline | wc -l | tr -d ' ')
if [ "$INCOMING" = "0" ]; then
  echo "  Sin cambios nuevos. Ya estás en la versión más reciente."
  exit 0
fi

echo "  $INCOMING commit(s) nuevos:"
git log HEAD..origin/main --oneline | sed 's/^/    /'

git pull origin main

echo ""
echo "▶ Instalando dependencias Node..."
npm ci --quiet

echo "▶ Compilando Next.js..."
npm run build

echo "▶ Reiniciando servidor web..."
supervisorctl restart ai-companion-web

NEW=$(git rev-parse HEAD)
echo ""
echo "✔ Deploy completado → $(git log -1 --pretty='%C(yellow)%h%Creset %s')"
echo "  Para revertir: bash scripts/rollback.sh $PREV"
echo ""
