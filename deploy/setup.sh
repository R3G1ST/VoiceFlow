#!/bin/bash
# VoiceFlow - Автоматическая установка на сервер
# Сервер: 77.105.133.95

set -e

echo "========================================"
echo "  VoiceFlow - Автоматическая установка"
echo "  Сервер: 77.105.133.95"
echo "========================================"
echo ""

# Проверка root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Запустите от root (sudo bash setup.sh)"
    exit 1
fi

echo "✅ [1/10] Обновление системы..."
apt update && apt upgrade -y

echo "✅ [2/10] Установка Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh

echo "✅ [3/10] Установка Docker Compose..."
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose && chmod +x /usr/local/bin/docker-compose

echo "✅ [4/10] Установка Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt install -y nodejs

echo "✅ [5/10] Установка Git..."
apt install -y git

echo "✅ [6/10] Загрузка проекта..."
mkdir -p /opt/VoiceFlow && cd /opt/VoiceFlow
git clone https://github.com/R3G1ST/VoiceFlow.git . 2>/dev/null || echo "Проект уже загружен"

echo "✅ [7/10] Настройка .env..."
cd /opt/VoiceFlow/server
cat > .env << 'EOF'
NODE_ENV=production
PORT=3000
WS_PORT=3001

DATABASE_URL=postgresql://voicechat:VoiceFlow123@localhost:5432/voicechat?schema=public

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=VoiceFlow456

JWT_SECRET=VoiceFlowSecretKey789ChangeInProduction
JWT_EXPIRES_IN=7d

MEDIASOUP_ANNOUNCED_IP=77.105.133.95
MEDIASOUP_MIN_PORT=40000
MEDIASOUP_MAX_PORT=40100

CORS_ORIGIN=*

AUDIO_BITRATE=64000
AUDIO_SAMPLE_RATE=48000
AUDIO_CHANNELS=2

VIDEO_BITRATE=10000000
VIDEO_MAX_BITRATE=20000000
VIDEO_SCREEN_BITRATE=15000000
EOF

echo "✅ [8/10] Запуск инфраструктуры..."
cd /opt/VoiceFlow/deploy
docker-compose up -d

echo "✅ [9/10] Настройка сервера..."
cd /opt/VoiceFlow/server
npm install
npx prisma generate
npx prisma migrate deploy
npm install -g pm2
pm2 start npm --name "voiceflow-server" -- run start:prod
pm2 save
pm2 startup

echo "✅ [10/10] Настройка Firewall..."
ufw --force enable
ufw allow 22/tcp
ufw allow 3000/tcp
ufw allow 3001/tcp
ufw allow 40000:40100/udp
ufw allow 80/tcp
ufw allow 443/tcp

echo ""
echo "========================================"
echo "  ✅ УСТАНОВКА ЗАВЕРШЕНА!"
echo "========================================"
echo ""
echo "📊 Статус сервера:"
pm2 status
echo ""
echo "🔗 API Health:"
curl http://localhost:3000/api/health
echo ""
echo ""
echo "🌐 Сервер доступен:"
echo "   http://77.105.133.95:3000"
echo ""
echo "📝 Логи:"
echo "   pm2 logs voiceflow-server"
echo ""
echo "🔄 Перезапуск:"
echo "   pm2 restart voiceflow-server"
echo ""
echo "========================================"
