#!/bin/bash

set -e

echo "=============================="
echo "🚀 EduJour Deploy Starting..."
echo "=============================="

# 1. 拉取最新代码
echo "📥 Pulling latest code..."
cd ~/edujour
git pull origin main

# 2. 构建后端
echo "🔧 Building backend..."
cd backend
mvn clean package -DskipTests

# 3. 重启后端
echo "🚀 Restarting backend..."
pm2 restart edujour-backend

# 4. 构建前端
echo "🎨 Building frontend..."
cd ../frontend
npm install
npm run build

# 5. 部署前端到 nginx
echo "📦 Deploying frontend to nginx..."
sudo cp -r dist/* /var/www/edujour/

# 6. 重载 nginx
echo "🔄 Reloading nginx..."
sudo systemctl reload nginx

echo "=============================="
echo "✅ Deploy Finished Successfully!"
echo "=============================="
