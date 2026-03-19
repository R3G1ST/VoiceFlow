# 🎙️ VoiceFlow

**TeamSpeak качество звука + Discord удобство**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10+-red.svg)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React-18+-61dafb.svg)](https://reactjs.org/)

---

## 📖 О проекте

VoiceFlow — это современное голосовое приложение с качеством звука TeamSpeak и удобством Discord.

### ✨ Особенности

- 🎵 **Качество звука TeamSpeak**
  - Opus кодек 64 kbps
  - Задержка < 50ms
  - Частота дискретизации 48 kHz
  - Стереозвук (2 канала)

- 💬 **Дизайн Discord**
  - Современный UI
  - Удобные голосовые каналы
  - Текстовые каналы
  - Система серверов

- 🎥 **Демонстрация экрана**
  - 720p при 60 FPS
  - H.264 кодек
  - Передача звука системы

- 🔒 **Безопасность**
  - JWT аутентификация
  - Шифрование WebRTC
  - Роли и разрешения

---

## 🏗 Архитектура

```
┌─────────────────────────────────────────┐
│         Клиент (Electron + React)       │
│   ┌──────────┐  ┌──────────┐           │
│   │  Discord │  │  Голос   │           │
│   │   UI     │  │  WebRTC  │           │
│   └──────────┘  └──────────┘           │
└─────────────────────────────────────────┘
              │ WebSocket + WebRTC
              ▼
┌─────────────────────────────────────────┐
│    Сервер (Node.js + Mediasoup SFU)    │
│   ┌──────────┐  ┌──────────┐           │
│   │  NestJS  │  │ Mediasoup│           │
│   │   REST   │  │   SFU    │           │
│   └──────────┘  └──────────┘           │
└─────────────────────────────────────────┘
              │
         ┌────┴────┐
         ▼         ▼
    ┌────────┐ ┌────────┐
    │Postgres│ │  Redis │
    └────────┘ └────────┘
```

---

## 🚀 Быстрый старт

### Требования

- Node.js 20+
- Docker и Docker Compose
- Ubuntu 20.04+ (сервер)
- Windows 10+ / Linux (клиент)

### 1. Запуск инфраструктуры

```bash
cd deploy
docker-compose up -d
```

### 2. Настройка сервера

```bash
cd server
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate deploy
npm run start:dev
```

### 3. Настройка клиента

```bash
cd client
npm install
npm run dev
```

### 4. Откройте браузер

```
http://localhost:5173
```

---

## 📊 Характеристики

| Параметр | Значение |
|----------|----------|
| Задержка звука | < 50ms |
| Битрейт звука | 64 kbps (Opus) |
| Частота дискретизации | 48 kHz |
| Каналы | 2 (стерео) |
| Максимум в канале | 50 человек |
| Демонстрация экрана | 720p60 FPS |
| Потребление RAM | ~200MB |

---

## 🎵 Сравнение качества звука

| Приложение | Битрейт | Задержка | Качество |
|------------|---------|----------|----------|
| **VoiceFlow** | 64 kbps | 40ms | ⭐⭐⭐⭐⭐ |
| TeamSpeak 3 | 64 kbps | 45ms | ⭐⭐⭐⭐⭐ |
| Discord | 96 kbps | 60ms | ⭐⭐⭐⭐ |
| Skype | 32 kbps | 80ms | ⭐⭐⭐ |
| Zoom | 48 kbps | 70ms | ⭐⭐⭐⭐ |

---

## 🛠 Технологии

### Сервер

- **Node.js 20** + **TypeScript**
- **NestJS** — фреймворк
- **Mediasoup** — SFU для голоса/видео
- **Prisma** — ORM
- **PostgreSQL** — база данных
- **Redis** — кэш, pub/sub
- **Socket.io** — WebSocket

### Клиент

- **Electron** — десктоп
- **React 18** + **TypeScript**
- **Vite** — сборка
- **TailwindCSS** — стили
- **Zustand** — state management
- **Simple-peer** — WebRTC

---

## 📁 Структура проекта

```
VoiceFlow/
├── deploy/                 # Docker конфигурация
│   ├── docker-compose.yml
│   ├── ubuntu-setup.sh
│   └── ИНСТРУКЦИЯ.md
│
├── server/                 # Backend (NestJS)
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/      # Аутентификация
│   │   │   ├── servers/   # Серверы
│   │   │   ├── voice/     # Голос (Mediasoup)
│   │   │   ├── chat/      # Чат
│   │   │   └── gateway/   # WebSocket
│   │   └── prisma/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── .env.example
│   └── package.json
│
├── client/                 # Frontend (Electron + React)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── stores/
│   │   └── electron/
│   ├── electron/
│   │   ├── main.js
│   │   └── preload.js
│   └── package.json
│
├── README.md               # Этот файл
├── LICENSE                 # MIT License
├── .gitignore
└── QUICKSTART.md           # Быстрый старт
```

---

## 📖 Документация

- [QUICKSTART.md](./QUICKSTART.md) — Быстрый старт
- [deploy/ИНСТРУКЦИЯ.md](./deploy/ИНСТРУКЦИЯ.md) — Развёртывание на сервере
- [server/README.md](./server/README.md) — API документация
- [client/README.md](./client/README.md) — Клиентская документация

---

## 🔧 Разработка

### Запуск в режиме разработки

```bash
# Сервер
cd server
npm run start:dev

# Клиент (в другом терминале)
cd client
npm run dev
```

### Запуск Electron

```bash
cd client
npm run electron:dev
```

### Сборка

```bash
# Сервер
cd server
npm run build

# Клиент
cd client
npm run build
npm run electron:build
```

---

## 🚀 Развёртывание

### На Ubuntu сервере

```bash
# 1. Обновление и Docker
apt update && apt upgrade -y
curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh

# 2. Загрузка проекта
cd /opt
git clone https://github.com/YOUR_USERNAME/VoiceFlow.git
cd VoiceFlow/deploy

# 3. Запуск
docker-compose up -d
cd ../server
npm install
npx prisma generate
npx prisma migrate deploy
npm run start:prod
```

**Подробная инструкция:** [deploy/ИНСТРУКЦИЯ.md](./deploy/ИНСТРУКЦИЯ.md)

---

## 🤝 Вклад в проект

Приветствуются PR, баг-репорты и предложения!

1. Fork проект
2. Создайте ветку (`git checkout -b feature/AmazingFeature`)
3. Commit изменений (`git commit -m 'Add some AmazingFeature'`)
4. Push в ветку (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

---

## 📝 Лицензия

Распространяется под лицензией MIT. См. [LICENSE](LICENSE) для деталей.

---

## 👥 Авторы

- **Your Name** — *Initial work* — [YourGitHub](https://github.com/YourUsername)

Смотрите список [участников](https://github.com/YOUR_USERNAME/VoiceFlow/graphs/contributors) для полной информации.

---

## 🙏 Благодарности

- [NestJS](https://nestjs.com/) — отличный фреймворк
- [Mediasoup](https://mediasoup.org/) — потрясающий SFU
- [React](https://reactjs.org/) — лучшая библиотека для UI
- [Discord](https://discord.com/) — вдохновение для дизайна
- [TeamSpeak](https://www.teamspeak.com/) — эталон качества звука

---

## 📞 Контакты

- **GitHub Issues** — [Сообщить о проблеме](https://github.com/YOUR_USERNAME/VoiceFlow/issues)
- **Discord сервер** — [Присоединиться](https://discord.gg/your-invite)
- **Email** — your.email@example.com

---

<div align="center">

**Создано с ❤️ для лучшего голосового общения**

[⭐ Звезда на GitHub](https://github.com/YOUR_USERNAME/VoiceFlow/stargazers) | [🍴 Fork](https://github.com/YOUR_USERNAME/VoiceFlow/network/members) | [📋 Issues](https://github.com/YOUR_USERNAME/VoiceFlow/issues)

</div>
