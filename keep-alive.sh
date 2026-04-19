#!/bin/bash

# Configuration
BACKEND_URL="https://cloudops-backend-cloudops-v1.onrender.com"
FRONTEND_URL="https://cloudops-frontend-cloudops-v1.onrender.com"

echo "[$(date)] Pinging services..."

# Ping Backend
echo -n "Pinging Backend: "
curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL"
echo ""

# Ping Frontend
echo -n "Pinging Frontend: "
curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL"
echo ""

echo "[$(date)] Ping completed."
