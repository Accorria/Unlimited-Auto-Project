#!/bin/bash

# Start development server with port checking
# This script checks for existing Next.js processes and kills them before starting

echo "🔍 Checking for existing Next.js processes..."

# Kill any existing Next.js processes on ports 3000, 3001, 3002
for port in 3000 3001 3002; do
    pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
        echo "⚠️  Found process $pid on port $port - killing it..."
        kill -9 $pid
        sleep 1
    fi
done

echo "✅ Ports cleared"

# Load nvm and use Node.js 22
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 22.12.0

echo "🚀 Starting development server on port 3000..."
npm run dev
