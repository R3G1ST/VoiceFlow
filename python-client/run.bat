@echo off
chcp 65001 >nul
echo ========================================
echo   VoiceFlow Python Client
echo ========================================
echo.

REM Проверка Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python не найден!
    echo.
    echo Установите Python 3.8+ с:
    echo https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)

echo ✅ Python найден
echo.

REM Установка зависимостей
echo 📦 Установка зависимостей...
pip install -r requirements.txt >nul 2>&1
if errorlevel 1 (
    echo ❌ Ошибка установки зависимостей!
    pause
    exit /b 1
)

echo ✅ Зависимости установлены
echo.

REM Запуск приложения
echo 🚀 Запуск VoiceFlow...
echo.
python main.py

if errorlevel 1 (
    echo.
    echo ❌ Произошла ошибка при запуске!
    pause
)
