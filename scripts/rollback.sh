#!/usr/bin/env bash
# rollback.sh — Revierte el frontend web a un commit anterior
# Uso: bash scripts/rollback.sh [commit-hash|HEAD~1]
set -euo pipefail

APP_DIR="/var/www/ai-companion-web"
cd "$APP_DIR"

TARGET="${1:-HEAD~1}"

echo ""
echo "▶ [rollback:web] Commit actual: $(git log -1 --pretty='%C(yellow)%h%Creset %s')"
echo "  Revirtiendo a: $TARGET"
echo ""

git reset --hard "$TARGET"

echo "▶ Instalando dependencias Node..."
npm ci --quiet

echo "▶ Compilando Next.js..."
npm run build

echo "▶ Reiniciando servidor web..."
supervisorctl restart ai-companion-web

echo ""
echo "✔ Rollback completado → $(git log -1 --pretty='%C(yellow)%h%Creset %s')"
echo ""
