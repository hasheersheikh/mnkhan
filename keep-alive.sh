#!/bin/bash

# Configuration
BACKEND_URL="https://cloudops-backend-cloudops-v1.onrender.com"
FRONTEND_URL="https://cloudops-frontend-cloudops-v1.onrender.com"
MNKHAN_URL="https://mnkhan.onrender.com/api/services"

echo "[$(date)] Pinging services..."

# Ping CloudOps Backend
echo -n "Pinging CloudOps Backend: "
curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL"
echo ""

# Ping CloudOps Frontend
echo -n "Pinging CloudOps Frontend: "
curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL"
echo ""

# Ping MNKHAN Services
echo -n "Pinging MNKHAN Services: "
curl -s -o /dev/null -w "%{http_code}" "$MNKHAN_URL"
echo ""

echo "[$(date)] Ping completed."
