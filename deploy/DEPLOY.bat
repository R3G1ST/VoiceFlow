@echo off
chcp 65001 >nul
echo ========================================
echo   VoiceFlow - Развёртывание на сервер
echo ========================================
echo.
echo Сервер Ubuntu: 89.169.4.132
echo Логин: root
echo.
echo ИНСТРУКЦИЯ:
echo.
echo 1. Подключитесь к серверу по SSH:
echo    ssh root@89.169.4.132
echo.
echo 2. На сервере выполните:
echo    cd /opt
echo    curl -O https://your-repo.com/VoiceFlow/deploy/ubuntu-setup.sh
echo    chmod +x ubuntu-setup.sh
echo    bash ubuntu-setup.sh
echo.
echo 3. ИЛИ скопируйте файлы проекта:
echo    scp -r C:\Users\R3G1S\VoiceFlow\* root@89.169.4.132:/opt/VoiceFlow/
echo.
pause

echo.
echo ========================================
echo   НАСТРОЙКА КЛИЕНТА (Windows)
echo ========================================
echo.
echo После запуска сервера:
echo.
echo 1. Откройте client\.env
echo.
echo 2. Укажите:
echo    VITE_API_URL=http://89.169.4.132:3000/api
echo    VITE_WS_URL=ws://89.169.4.132:3001
echo.
echo 3. Запустите клиент:
echo    cd C:\Users\R3G1S\VoiceFlow\client
echo    npm install
echo    npm run dev
echo.
echo 4. Откройте браузер:
echo    http://localhost:5173
echo.
pause

echo.
echo ========================================
echo   ПРОВЕРКА
echo ========================================
echo.
echo Проверка сервера (откройте в браузере):
echo   http://89.169.4.132:3000/api/health
echo.
echo Должны увидеть: {"status":"ok"}
echo.
pause
