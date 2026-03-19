# 🚀 Быстрый старт

## 1. Запуск инфраструктуры (Docker)

```bash
cd deploy
docker-compose up -d
```

Проверка:
```bash
docker-compose ps
```

Должны быть:
- ✅ postgres
- ✅ redis
- ✅ minio

---

## 2. Настройка сервера

```bash
cd ../server

# Копирование .env
copy .env.example .env  (Windows)
cp .env.example .env    (Linux)

# Установка зависимостей
npm install

# Генерация Prisma
npx prisma generate

# Применение миграций
npx prisma migrate deploy

# Запуск
npm run start:dev
```

Проверка: http://localhost:3000/api/health

---

## 3. Настройка клиента

```bash
cd ../client

# Установка зависимостей
npm install

# Запуск разработки
npm run dev
```

Откройте: http://localhost:5173

---

## 🎯 Готово!

Теперь у вас есть:
- **БД PostgreSQL** - порт 5432
- **Redis** - порт 6379
- **MinIO** - порт 9000 (консоль 9001)
- **Сервер** - порт 3000
- **Клиент** - порт 5173

---

## 📝 Тестирование

1. Откройте http://localhost:5173
2. Зарегистрируйтесь
3. Создайте сервер
4. Зайдите в голосовой канал
5. Проверьте звук!

---

## 🔧 Проблемы

### Docker не запускается
```bash
docker --version
docker-compose --version
```

### Ошибка Prisma
```bash
cd server
npx prisma generate
npx prisma migrate dev
```

### Порт занят
Измените в `server\.env`:
```
PORT=3001
```
