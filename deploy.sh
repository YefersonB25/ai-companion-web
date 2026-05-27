#!/usr/bin/env bash
set -e

DEPLOY_DIR="/var/www/ai-companion-web"

echo "==> Pulling latest code..."
git -C "$DEPLOY_DIR" pull origin main

echo "==> Installing Node dependencies..."
npm install --prefix "$DEPLOY_DIR"

echo "==> Building..."
npm run build --prefix "$DEPLOY_DIR"

echo "==> Restarting web server..."
supervisorctl restart ai-companion-web

echo "==> Done. Web deployed."
