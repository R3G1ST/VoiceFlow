#!/bin/bash
# VoiceFlow - Автоматическая установка на Ubuntu сервер
# IP: 89.169.4.132
# Запуск: bash setup.sh

set -e

echo "========================================"
echo "  VoiceFlow - Установка на сервер"
echo "  IP: 89.169.4.132"
echo "========================================"
echo ""

# Проверка root
if [ "$EUID" -ne 0 ]; then 
    echo "Пожалуйста, запустите от root (sudo bash setup.sh)"
    exit 1
fi

# Обновление
echo "[1/6] Обновление системы..."
apt update && apt upgrade -y

# Docker
echo "[2/6] Установка Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# Docker Compose
echo "[3/6] Установка Docker Compose..."
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Git и Node.js
echo "[4/6] Установка Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Проект
echo "[5/6] Загрузка проекта..."
mkdir -p /opt/VoiceFlow
cd /opt/VoiceFlow

# Проверка, есть ли уже проект
if [ -f "server/package.json" ]; then
    echo "Проект уже загружен"
else
    # Копируем файлы проекта (через git или scp)
    echo "Скопируйте файлы проекта через SCP или Git"
    echo "Или используйте: git clone <URL> ."
fi

# .env файл
echo "[6/6] Создание конфигурации..."
SERVER_IP=$(curl -s ifconfig.me)
JWT_SECRET=$(openssl rand -base64 32)
POSTGRES_PASSWORD=$(openssl rand -base64 16)
REDIS_PASSWORD=$(openssl rand -base64 16)

cat > server/.env << EOF
NODE_ENV=production
PORT=3000
WS_PORT=3001

# Database
DATABASE_URL=postgresql://voicechat:${POSTGRES_PASSWORD}@localhost:5432/voicechat?schema=public

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=${REDIS_PASSWORD}

# JWT
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d

# Mediasoup
MEDIASOUP_ANNOUNCED_IP=${SERVER_IP}
MEDIASOUP_MIN_PORT=40000
MEDIASOUP_MAX_PORT=40100

# CORS
CORS_ORIGIN=*

# Audio Quality
AUDIO_BITRATE=64000
AUDIO_SAMPLE_RATE=48000
AUDIO_CHANNELS=2
EOF

echo "✓ Создан файл server/.env"
echo ""
echo "ВАЖНО: Сохраните эти пароли!"
echo "PostgreSQL: ${POSTGRES_PASSWORD}"
echo "Redis: ${REDIS_PASSWORD}"
echo "JWT Secret: ${JWT_SECRET}"
echo ""

# Firewall
echo "Настройка firewall..."
if command -v ufw &> /dev/null; then
    ufw --force enable
    ufw allow 22/tcp
    ufw allow 3000/tcp
    ufw allow 3001/tcp
    ufw allow 40000:40100/udp
    ufw allow 80/tcp
    ufw allow 443/tcp
    echo "✓ Firewall настроен"
else
    echo "⚠ UFW не установлен"
fi

echo ""
echo "========================================"
echo "  ✓ Установка завершена!"
echo "========================================"
echo ""
echo "СЛЕДУЮЩИЕ ШАГИ:"
echo ""
echo "1. Запуск инфраструктуры (БД, Redis):"
echo "   cd /opt/VoiceFlow/deploy"
echo "   docker-compose up -d"
echo ""
echo "2. Настройка сервера:"
echo "   cd /opt/VoiceFlow/server"
echo "   npm install"
echo "   npx prisma generate"
echo "   npx prisma migrate deploy"
echo "   npm run start:prod"
echo ""
echo "3. Проверка:"
echo "   curl http://localhost:3000/api/health"
echo ""
echo "Сервер будет доступен:"
echo "  http://${SERVER_IP}:3000"
echo "  API: http://${SERVER_IP}:3000/api/health"
echo ""
echo "Клиент (Windows) подключается к:"
echo "  VITE_API_URL=http://${SERVER_IP}:3000/api"
echo "  VITE_WS_URL=ws://${SERVER_IP}:3001"
echo ""
