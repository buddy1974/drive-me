#!/bin/bash

set -e

echo "=== Drive Me Setup ==="

# 1. Install dependencies
echo "[1/3] Installing dependencies..."
yarn install

# 2. Generate Prisma client
echo "[2/3] Generating Prisma client..."
cd apps/api && npx prisma generate && cd ../..

# 3. Run migrations
echo "[3/3] Running database migrations..."
cd apps/api && npx prisma migrate dev --name init && cd ../..

echo ""
echo "=== Setup complete ==="
echo ""
echo "Start local services:"
echo "  docker-compose -f infrastructure/docker-compose.yml up -d"
echo ""
echo "Start development:"
echo "  yarn dev"
